
// ========== API INTEGRASI OTOMATIS ==========
const API = {
    getHeaders: function() {
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + CONFIG.API.API_KEY,
            'X-API-Key': CONFIG.API.API_KEY
        };
    },

    fetchOpenAPI: async function() {
        try {
            const response = await fetch(CONFIG.API.OPENAPI_URL, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('API Error: ' + response.status);
            const data = await response.json();
            DB.simpan(CONFIG.DB_KEYS.API_CACHE, {
                data: data,
                timestamp: new Date().toISOString()
            });
            console.log('✅ API Data berhasil dimuat!');
            return data;
        } catch (error) {
            console.error('❌ API Gagal dimuat:', error);
            return null;
        }
    },

    buatPesanan: async function(pesananData) {
        try {
            const response = await fetch(CONFIG.API.BASE_URL + '/api/order/create?apikey=' + CONFIG.API.API_KEY, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(pesananData)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Pesanan ke API gagal:', error);
            return { success: false, message: 'Tersimpan lokal saja' };
        }
    },

    cekStatusAPI: async function() {
        const statusEl = document.getElementById('api-status');
        if (!statusEl) return;
        try {
            const res = await fetch(CONFIG.API.BASE_URL + '/api/pricelist?apikey=' + CONFIG.API.API_KEY, {
                method: 'GET',
                headers: { 'X-API-Key': CONFIG.API.API_KEY }
            });
            if (res.ok) {
                statusEl.innerHTML = '✅ Server Online — Terhubung ke Simuru';
                statusEl.style.color = '#2ecc71';
            } else {
                throw new Error('Error');
            }
        } catch {
            statusEl.innerHTML = '⚠️ Mode Offline — Tersimpan Lokal';
            statusEl.style.color = '#f39c12';
        }
    }
};

let currentUser = null;
let selectedChatUser = null;
let currentOrderType = null;
let currentNomor = { negara: '', layanan: '', jumlah: 0, harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: 0, harga: 0 };
let kodeVerifikasiSaatIni = null;

function formatHarga(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function buatKodeVerifikasi() {
    const kode = Math.floor(100000 + Math.random() * 900000).toString();
    kodeVerifikasiSaatIni = kode;
    return kode;
}

function kirimKodeKeOwner(nomor, layanan, negara, kode) {
    if (!currentUser) return;
    const chatKey = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chatData = DB.ambil(chatKey, []);
    const pesanKeOwner = `🔑 KODE VERIFIKASI PEMBELIAN NOMOR\n━━━━━━━━━━━━━━━━━━━━\n👤 User: ${currentUser.username}\n🌍 Negara: ${negara}\n📱 Layanan: ${layanan}\n📞 Nomor: ${nomor}\n🔢 Kode: ${kode}\n━━━━━━━━━━━━━━━━━━━━\nSilakan konfirmasi kode ini.`;
    chatData.push({
        pengirim: currentUser.username,
        pesan: pesanKeOwner,
        waktu: new Date().toLocaleString('id-ID'),
        tipe: 'verifikasi_nomor'
    });
    DB.simpan(chatKey, chatData);
    const verifyList = DB.ambil(CONFIG.DB_KEYS.VERIFY_CODES, []);
    verifyList.push({
        user: currentUser.username,
        nomor, layanan, negara, kode,
        status: 'menunggu',
        waktu: new Date().toLocaleString('id-ID')
    });
    DB.simpan(CONFIG.DB_KEYS.VERIFY_CODES, verifyList);
    return true;
}

function cekLoginOtomatis() {
    const savedUser = DB.ambil(CONFIG.DB_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = savedUser;
        updateNav();
        loadPesanan();
        return true;
    }
    return false;
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Daftar Akun Baru';
}

function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Login Akun';
}

function login() {
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
    closeAuthModal();
    updateNav();
    loadPesanan();
    if (isOwner() || isAdmin()) loadChatUserList();
    alert('✅ Login berhasil!');
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
    alert(`✅ Daftar berhasil!\n📞 Nomor: ${fullNumber}\nSilakan login.`);
    showLogin();
}

function logout() {
    if (!confirm('Yakin ingin keluar?')) return;
    currentUser = null;
    selectedChatUser = null;
    kodeVerifikasiSaatIni = null;
    DB.hapus(CONFIG.DB_KEYS.CURRENT_USER);
    location.reload();
}

function isOwner() {
    return currentUser?.username === CONFIG.ownerUsername;
}
function isAdmin() {
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    return isOwner() || admins.some(a => a.username === currentUser?.username);
}

function updateNav() {
    const tabOwner = document.getElementById('tab-owner');
    const tabAdmin = document.getElementById('tab-admin');
    if (isOwner() || isAdmin()) tabOwner?.classList.remove('hidden');
    else tabOwner?.classList.add('hidden');
    if (isOwner()) tabAdmin?.classList.remove('hidden');
    else tabAdmin?.classList.add('hidden');
}

function showPage(page) {
    if (!currentUser) return;
    ['page-beranda','page-nomor','page-booster','page-chat','page-owner','page-admin','page-pesanan','payment-form','booster-form'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.classList.add('inactive'); });
    if (page === 'beranda') {
        document.getElementById('page-beranda').classList.remove('hidden');
        document.getElementById('tab-beranda').classList.add('active');
    }
    if (page === 'nomor') {
        document.getElementById('page-nomor').classList.remove('hidden');
        document.getElementById('tab-nomor').classList.add('active');
        resetNomorForm();
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
        loadChatUserList();
        loadOwnerPesanan();
        loadDaftarVerifikasi();
    }
    if (
