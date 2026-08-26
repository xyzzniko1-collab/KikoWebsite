
// ========== KONFIGURASI ==========
const CONFIG = {
    API_KEY: 'MstAiI7R5641sRxsk6ROWCed2nMb9xBsYNjCPwKW',
    API_URL: 'https://simuru.com',
    ownerUsername: 'owner',
    ownerPassword: 'owner123',
    
    // HARGA TETAP SESUAI PERMINTAAN
    hargaData: {
        Instagram: {
            Followers: { '1000': 24000, '2000': 49000, '3000': 67000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 }
        },
        TikTok: {
            Followers: { '1000': 49000, '2000': 80000, '3000': 130000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 }
        }
    },
    nomorData: {
        '+62': { 
            WhatsApp: { '1': 15000, '5': 60000, '10': 110000 }, 
            Telegram: { '1': 12000, '5': 50000, '10': 95000 },
            Google: { '1': 18000, '5': 75000, '10': 140000 }
        },
        '+60': { WhatsApp: { '1': 25000, '5': 110000, '10': 200000 } },
        '+65': { WhatsApp: { '1': 30000, '5': 135000, '10': 250000 } },
        '+1': { WhatsApp: { '1': 45000, '5': 200000, '10': 380000 } }
    }
};

// ========== VARIABEL GLOBAL ==========
let currentUser = null, selectedPlatform = null, currentOrder = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };
let kodeVerifikasiUser = null;

// ========== FUNGSI DASAR ==========
function formatHarga(angka) { return 'Rp ' + parseInt(angka).toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function isAdmin() { 
    const admins = JSON.parse(localStorage.getItem('simuru_admins') || '[]');
    return isOwner() || admins.some(a => a.username === currentUser?.username); 
}
function DB_simpan(k, d) { localStorage.setItem(k, JSON.stringify(d)); }
function DB_ambil(k, def=null) { const d=localStorage.getItem(k); return d?JSON.parse(d):def; }

// ========== SALDO SISTEM — INTI FITUR ==========
function getSaldo(username) {
    const users = DB_ambil('simuru_users', {});
    return users[username]?.saldo || 0;
}
function tambahSaldo(username, jumlah, keterangan='Top Up') {
    const users = DB_ambil('simuru_users', {});
    if (!users[username]) return false;
    users[username].saldo = (users[username].saldo || 0) + parseInt(jumlah);
    DB_simpan('simuru_users', users);
    
    // Simpan riwayat saldo
    const riwayat = DB_ambil('simuru_riwayat_saldo_' + username, []);
    riwayat.unshift({
        waktu: new Date().toLocaleString('id-ID'),
        tipe: 'tambah',
        jumlah: parseInt(jumlah),
        keterangan: keterangan
    });
    DB_simpan('simuru_riwayat_saldo_' + username, riwayat);
    
    updateSaldoDisplay();
    return users[username].saldo;
}
function kurangiSaldo(username, jumlah, keterangan='Pembelian') {
    const users = DB_ambil('simuru_users', {});
    if (!users[username] || (users[username].saldo || 0) < jumlah) return false;
    users[username].saldo = (users[username].saldo || 0) - parseInt(jumlah);
    DB_simpan('simuru_users', users);
    
    // Simpan riwayat saldo
    const riwayat = DB_ambil('simuru_riwayat_saldo_' + username, []);
    riwayat.unshift({
        waktu: new Date().toLocaleString('id-ID'),
        tipe: 'kurangi',
        jumlah: parseInt(jumlah),
        keterangan: keterangan
    });
    DB_simpan('simuru_riwayat_saldo_' + username, riwayat);
    
    updateSaldoDisplay();
    return users[username].saldo;
}
function cekSaldoCukup(username, jumlah) {
    return getSaldo(username) >= jumlah;
}
function updateSaldoDisplay() {
    if (!currentUser) return;
    const saldo = getSaldo(currentUser.username);
    document.getElementById('user-saldo').textContent = formatHarga(saldo);
    const saldoPage = document.getElementById('saldo-page-saldo');
    if (saldoPage) saldoPage.textContent = formatHarga(saldo);
    
    // Update estimasi sisa saldo di form beli
    if (currentNomor.harga > 0) {
        document.getElementById('nomor-sisa-saldo').textContent = formatHarga(saldo - currentNomor.harga);
    }
    if (currentBooster.harga > 0) {
        document.getElementById('booster-sisa-saldo').textContent = formatHarga(saldo - currentBooster.harga);
    }
}

// ========== KODE VERIFIKASI ==========
function buatKodeVerifikasi() {
    kodeVerifikasiUser = Math.floor(100000 + Math.random() * 900000).toString();
    return kodeVerifikasiUser;
}
function kirimKodeKeSimuru() {
    alert('✅ Kode ' + kodeVerifikasiUser + ' terkirim ke Simuru API!');
    tutupKodeVerifikasi();
}
function tutupKodeVerifikasi() {
    document.getElementById('verify-code-box').classList.add('hidden');
    closeAuthModal();
    updateNav();
    updateSaldoDisplay();
    loadPesanan();
}

// ========== LOGIN & REGISTER — SALDO AWAL 0 ==========
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}
function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}
function login() {
    const usn = document.getElementById('login-usn').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    if (!usn || !pw) return alert('Isi username & password!');
    
    const users = DB_ambil('simuru_users', {});
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    } else if (users[usn] && users[usn].password === pw) {
        currentUser = { ...users[usn], role: 'user' };
    } else {
        return alert('Username/password salah!');
    }
    
    DB_simpan('simuru_current_user', currentUser);
    buatKodeVerifikasi();
    document.getElementById('nama-user').textContent = currentUser.username;
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('verify-code-box').classList.remove('hidden');
    document.getElementById('kode-verifikasi').textContent = kodeVerifikasiUser.replace(/(\d{3})(\d{3})/, '$1 $2');
    document.getElementById('nomor-kode-verifikasi').textContent = kodeVerifikasiUser;
    updateSaldoDisplay();
}
function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    if (!usn || !pw) return alert('Lengkapi data!');
    const users = DB_ambil('simuru_users', {});
    if (users[usn]) return alert('Username sudah ada!');
    users[usn] = { 
        username: usn, 
        password: pw, 
        saldo: 0, // SALDO AWAL 0
        tanggalDaftar: new Date().toLocaleString('id-ID')
    };
    DB_simpan('simuru_users', users);
    alert('✅ Daftar berhasil! Saldo awal Rp 0. Silakan Top Up.');
    showLogin();
}
function logout() {
    if (!confirm('Keluar?')) return;
    currentUser = null;
    localStorage.removeItem('simuru_current_user');
    location.reload();
}
function updateNav() {
    document.getElementById('tab-owner').classList.toggle('hidden', !(isOwner() || isAdmin()));
    document.getElementById('tab-admin').classList.toggle('hidden', !isOwner());
}

// ========== NAVIGASI HALAMAN ==========
function showPage(page) {
    if (!currentUser && page !== 'beranda') return;
    
    // Sembunyikan semua
    ['page-beranda','page-nomor','page-booster','page-saldo','page-chat','page-owner','page-admin','page-pesanan'].forEach(id=>{
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
    }
    if (page === 'booster') {
        document.getElementById('page-booster').classList.remove('hidden');
        document.getElementById('tab-booster').classList.add('active');
    }
    if (page === 'saldo') {
        document.getElementById('page-saldo').classList.remove('hidden');
        document.getElementById('tab-saldo').classList.add('active');
        loadRiwayatSaldo();
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
        loadOwnerPanel();
    }
    if (page === 'admin' && isOwner()) {
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.add('active');
        loadAdminList();
    }
    if (page === 'pesanan') {
        document.getElementById('page-pesanan').classList.remove('hidden');
        loadPesanan();
    }
    updateSaldoDisplay();
}
function showPagePesanan() { showPage('pesanan'); }

// ========== 💎 TOP UP SALDO — USER ==========
function showTopUpModal() {
    alert('Buka halaman Saldo untuk melakukan Top Up!');
    showPage('saldo');
}
function updateTopUpTotal() {
    const select = document.getElementById('topup-jumlah');
    const custom = document.getElementById('topup-custom');
    const customBox = document.getElementById('topup-custom-box');
    
    if (select.value === 'custom') {
        customBox.classList.remove('hidden');
        const val = parseInt(custom.value) || 0;
        document.getElementById('topup-total').textContent = formatHarga(val);
    } else {
        customBox.classList.add('hidden');
        document.getElementById('topup-total').textContent = formatHarga(select.value);
    }
    document.getElementById('topup-metode-text').textContent = document.getElementById('topup-metode').value;
}
function previewTopUpBukti() {
    const file = document.getElementById('topup-bukti').files[0];
    if (file) {
        const r = new FileReader();
        r.onload = e => { 
            const img = document.getElementById('topup-bukti-preview'); 
            img.src = e.target.result; 
            img.style.display = 'block'; 
        };
        r.readAsDataURL(file);
    }
}
function kirimTopUp() {
    let jumlah = document.getElementById('topup-jumlah').value;
    if (jumlah === 'custom') jumlah = document.getElementById('topup-custom').value;
    jumlah = parseInt(jumlah);
    
    const metode = document.getElementById('topup-metode').value;
    const bukti = document.getElementById('topup-bukti').files[0];
    
    if (!jumlah || jumlah < 10000) return alert('Masukkan jumlah minimal Rp 10.000!');
    if (!bukti) return alert('Upload bukti transfer dulu!');
    
    const topupList = DB_ambil('simuru_topup_requests', []);
    topupList.unshift({
        id: Date.now(),
        user: currentUser.username,
        jumlah: jumlah,
        metode:
