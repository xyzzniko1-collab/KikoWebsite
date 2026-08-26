
// ========== VARIABEL GLOBAL ==========
let currentUser = null;
let selectedPlatform = null;
let currentOrder = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };
let kodeVerifikasiUser = null; // Kode verifikasi per user — muncul saat login

// ========== FUNGSI UTILITAS ==========
function formatHarga(angka) { return 'Rp ' + angka.toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function isAdmin() { const a = DB.ambil(CONFIG.DB_KEYS.ADMINS, []); return isOwner() || a.some(x => x.username === currentUser?.username); }

// === GENERATE KODE VERIFIKASI — OTOMATIS SAAT LOGIN ===
function buatKodeVerifikasi() {
    const kode = Math.floor(100000 + Math.random() * 900000).toString();
    kodeVerifikasiUser = kode;
    // Simpan kode ke database user
    DB.simpan(CONFIG.DB_KEYS.KODE_VERIFIKASI_USER + currentUser.username, {
        kode: kode,
        dibuat: new Date().toLocaleString('id-ID'),
        terkirimKeAPI: false
    });
    return kode;
}

// === KIRIM KODE VERIFIKASI KE SIMURU API ===
async function kirimKodeKeSimuru() {
    if (!kodeVerifikasiUser) return alert('Kode verifikasi tidak ditemukan!');
    
    try {
        const response = await fetch(CONFIG.API.BASE_URL + '/api/verify/code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CONFIG.API.API_KEY
            },
            body: JSON.stringify({
                username: currentUser.username,
                kode: kodeVerifikasiUser,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        
        // Tandai kode sudah terkirim
        const kodeData = DB.ambil(CONFIG.DB_KEYS.KODE_VERIFIKASI_USER + currentUser.username);
        kodeData.terkirimKeAPI = true;
        kodeData.terkirimPada = new Date().toLocaleString('id-ID');
        DB.simpan(CONFIG.DB_KEYS.KODE_VERIFIKASI_USER + currentUser.username, kodeData);

        alert('✅ Kode verifikasi berhasil dikirim ke Simuru API!\nKode: ' + kodeVerifikasiUser);
        tutupKodeVerifikasi();
        
    } catch (error) {
        console.error('❌ Gagal kirim kode ke API:', error);
        alert('⚠️ Kode disimpan lokal, koneksi API bermasalah.\nKode: ' + kodeVerifikasiUser);
        tutupKodeVerifikasi();
    }
}

function tutupKodeVerifikasi() {
    document.getElementById('verify-code-box').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    closeAuthModal();
    updateNav();
    loadPesanan();
}

// ========== LOGIN & REGISTER ==========
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Daftar Akun Baru';
}
function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Login Akun';
}

async function login() {
    const usn = document.getElementById('login-usn').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    if (!usn || !pw) return alert('Isi username & password!');
    
    const users = DB.ambil(CONFIG.DB_KEYS.USERS, {});
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    } else if (admins.some(a => a.username === usn && a.password === pw)) {
        currentUser = { username: usn, role: 'admin' };
    } else if (users[usn] && users[usn].password === pw) {
        currentUser = { ...users[usn], role: 'user' };
    } else {
        return alert('Username atau password salah!');
    }

    DB.simpan(CONFIG.DB_KEYS.CURRENT_USER, currentUser);

    // === SETELAH LOGIN BERHASIL → GENERATE KODE VERIFIKASI OTOMATIS ===
    buatKodeVerifikasi();
    document.getElementById('nama-user').textContent = currentUser.username;
    
    // Tampilkan kode verifikasi ke user
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.remove('hidden');
    document.getElementById('kode-verifikasi').textContent = kodeVerifikasiUser.replace(/(\d{3})(\d{3})/, '$1 $2');
    
    // Update juga di halaman nomor & pembayaran
    document.getElementById('nomor-kode-verifikasi').textContent = kodeVerifikasiUser;
    document.getElementById('pay-kode').textContent = kodeVerifikasiUser;
    
    // Tambahkan ke daftar verifikasi owner
    const verifyList = DB.ambil(CONFIG.DB_KEYS.VERIFY_CODES, []);
    verifyList.unshift({
        user: currentUser.username,
        kode: kodeVerifikasiUser,
        dibuat: new Date().toLocaleString('id-ID'),
        apiStatus: 'menunggu'
    });
    DB.simpan(CONFIG.DB_KEYS.VERIFY_CODES, verifyList);
}

function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    const bank = document.getElementById('reg-bank').value;
    const countryCode = document.getElementById('reg-country-code').value;
    const no = document.getElementById('reg-no').value.trim();
    
    if (!usn || !pw || !bank || !no) return alert('Semua field wajib diisi!');
    
    const users = DB.ambil(CONFIG.DB_KEYS.USERS, {});
    if (users[usn]) return alert('Username sudah terdaftar!');
    
    const fullNumber = countryCode + no;
    users[usn] = { 
        username: usn, password: pw, bank, countryCode, no: fullNumber,
        tanggalDaftar: new Date().toLocaleString('id-ID')
    };
    DB.simpan(CONFIG.DB_KEYS.USERS, users);
    alert(`✅ Daftar berhasil!\n📞 Nomor: ${fullNumber}\nSilakan login untuk mendapatkan kode verifikasi.`);
    showLogin();
}

function logout() {
    if (!confirm('Yakin ingin keluar?')) return;
    currentUser = null;
    kodeVerifikasiUser = null;
    DB.hapus(CONFIG.DB_KEYS.CURRENT_USER);
    location.reload();
}

function updateNav() {
    document.getElementById('tab-owner').classList.toggle('hidden', !(isOwner() || isAdmin()));
    document.getElementById('tab-admin').classList.toggle('hidden', !isOwner());
    if (currentUser) document.getElementById('nama-user').textContent = currentUser.username;
}

// ========== NAVIGASI HALAMAN ==========
function showPage(page) {
    if (!currentUser && page !== 'beranda') return;
    
    // Sembunyikan semua halaman
    ['page-beranda','page-nomor','page-booster','page-chat','page-owner','page-admin','page-pesanan','payment-form'].forEach(id=>{
        const el = document.getElementById(id); if(el) el.classList.add('hidden');
    });
    document.querySelectorAll('.tab').forEach(t=>{t.classList.remove('active');t.classList.add('inactive');});

    if (page === 'beranda') {
        document.getElementById('page-beranda').classList.remove('hidden');
        document.getElementById('tab-beranda').classList.add('active');
    }
    if (page === 'nomor') {
        document.getElementById('page-nomor').classList.remove('hidden');
        document.getElementById('tab-nomor').classList.add('active');
        resetNomorForm();
        // Tampilkan kode verifikasi user saat ini
        if (kodeVerifikasiUser) {
            document.getElementById('nomor-kode-verifikasi').textContent = kodeVerifikasiUser;
        }
    }
    if (page === 'booster') {
        document.getElementById('page-booster').classList.remove('hidden');
        document.getElementById('tab-booster').classList.add('active');
    }
    if (page === 'chat') {
        document.getElementById('page-chat').classList.remove('hidden');
        document.getElementById('tab-chat').classList.add('active');
        loadUserChat();
    }
    if (page === 'owner' && (isOwner() || isAdmin())) {
        document.getElementById('page-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.add('active');
        loadOwnerPesanan();
        loadChatUserList();
        loadDaftarVerifikasi();
    }
    if (page === 'admin' && isOwner()) {
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.add('active');
        loadAdminList();
    }
    if (page === 'pesanan') {
        document.getElementById('page-pesanan').class
