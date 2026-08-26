
// ========== KONFIGURASI HARGA LENGKAP ==========
const CONFIG = {
    ownerUsername: 'owner',
    ownerPassword: 'owner123',
    
    // HARGA BOOSTER SESUAI PERMINTAAN
    hargaData: {
        Instagram: {
            Followers: { '1000': 24000, '2000': 49000, '3000': 67000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 },
            Views: { '1000': 8000, '5000': 35000, '10000': 65000 },
            Comments: { '100': 15000, '500': 60000, '1000': 110000 }
        },
        TikTok: {
            Followers: { '1000': 49000, '2000': 80000, '3000': 130000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 },
            Views: { '1000': 12000, '5000': 50000, '10000': 95000 },
            Shares: { '100': 8000, '500': 35000, '1000': 65000 },
            Comments: { '100': 12000, '500': 50000, '1000': 90000 }
        },
        Facebook: {
            Followers: { '1000': 35000, '2000': 65000, '5000': 150000 },
            Likes: { '1000': 15000, '2000': 28000, '5000': 65000 },
            Views: { '1000': 10000, '5000': 45000, '10000': 85000 },
            Subscribers: { '1000': 40000, '2000': 75000, '5000': 180000 }
        },
        YouTube: {
            Subscribers: { '100': 25000, '500': 110000, '1000': 200000 },
            Views: { '1000': 8000, '5000': 35000, '10000': 60000 },
            Likes: { '1000': 15000, '5000': 65000, '10000': 120000 },
            Comments: { '100': 20000, '500': 85000, '1000': 150000 }
        },
        Twitter: {
            Followers: { '1000': 30000, '2000': 55000, '5000': 130000 },
            Likes: { '1000': 12000, '2000': 22000, '5000': 50000 },
            Retweets: { '1000': 10000, '5000': 45000, '10000': 80000 },
            Views: { '1000': 9000, '5000': 40000, '10000': 75000 }
        },
        Telegram: {
            Members: { '100': 15000, '500': 65000, '1000': 120000 },
            Views: { '1000': 8000, '5000': 35000, '10000': 60000 },
            PostViews: { '1000': 7000, '5000': 30000, '10000': 55000 }
        },
        Twitch: {
            Followers: { '100': 20000, '500': 85000, '1000': 160000 },
            Views: { '1000': 15000, '5000': 65000, '10000': 120000 },
            LiveViews: { '100': 25000, '500': 110000, '1000': 200000 }
        },
        Spotify: {
            Followers: { '100': 30000, '500': 130000, '1000': 250000 },
            Streams: { '1000': 20000, '5000': 90000, '10000': 170000 },
            MonthlyListeners: { '1000': 25000, '5000': 110000, '10000': 200000 }
        }
    },
    
    // NOMOR — SEMUA LAYANAN LENGKAP
    nomorData: {
        '+62': {
            WhatsApp: { '1': 15000, '5': 60000, '10': 110000, '50': 500000 },
            Telegram: { '1': 12000, '5': 50000, '10': 95000, '50': 430000 },
            Google: { '1': 18000, '5': 75000, '10': 140000, '50': 650000 },
            Facebook: { '1': 16000, '5': 68000, '10': 125000, '50': 580000 },
            Instagram: { '1': 15000, '5': 63000, '10': 115000, '50': 530000 },
            Twitter: { '1': 17000, '5': 70000, '10': 130000, '50': 600000 },
            TikTok: { '1': 20000, '5': 85000, '10': 160000, '50': 750000 },
            Line: { '1': 14000, '5': 58000, '10': 105000, '50': 480000 },
            Signal: { '1': 16000, '5': 68000, '10': 125000, '50': 570000 },
            Viber: { '1': 15000, '5': 62000, '10': 115000, '50': 520000 }
        },
        '+60': {
            WhatsApp: { '1': 25000, '5': 110000, '10': 200000 },
            Telegram: { '1': 22000, '5': 95000, '10': 175000 },
            Google: { '1': 28000, '5': 120000, '10': 220000 },
            Facebook: { '1': 26000, '5': 115000, '10': 210000 }
        },
        '+65': {
            WhatsApp: { '1': 30000, '5': 135000, '10': 250000 },
            Telegram: { '1': 28000, '5': 125000, '10': 230000 },
            Google: { '1': 35000, '5': 155000, '10': 280000 }
        },
        '+1': {
            WhatsApp: { '1': 45000, '5': 200000, '10': 380000 },
            Telegram: { '1': 42000, '5': 185000, '10': 350000 },
            Google: { '1': 50000, '5': 220000, '10': 420000 },
            Facebook: { '1': 48000, '5': 210000, '10': 400000 },
            Instagram: { '1': 47000, '5': 205000, '10': 390000 },
            Twitter: { '1': 46000, '5': 200000, '10': 380000 },
            TikTok: { '1': 55000, '5': 250000, '10': 480000 }
        },
        '+44': {
            WhatsApp: { '1': 40000, '5': 180000, '10': 340000 },
            Telegram: { '1': 38000, '5': 170000, '10': 320000 },
            Google: { '1': 45000, '5': 200000, '10': 380000 }
        },
        '+86': {
            WhatsApp: { '1': 35000, '5': 155000, '10': 290000 },
            Telegram: { '1': 32000, '5': 140000, '10': 260000 },
            WeChat: { '1': 30000, '5': 130000, '10': 240000 }
        },
        '+81': {
            WhatsApp: { '1': 42000, '5': 190000, '10': 360000 },
            Telegram: { '1': 40000, '5': 180000, '10': 340000 },
            Line: { '1': 38000, '5': 170000, '10': 320000 }
        }
    }
};

let currentUser = null, selectedPlatform = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };
let buktiTopUpBase64 = '';

// ========== FUNGSI DASAR ==========
function formatHarga(angka) { return 'Rp ' + parseInt(angka).toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function isAdmin() {
    const admins = JSON.parse(localStorage.getItem('store_admins') || '[]');
    return isOwner() || admins.some(a => a.username === currentUser?.username);
}
function DB_simpan(k, d) { localStorage.setItem(k, JSON.stringify(d)); }
function DB_ambil(k, def=null) { const d=localStorage.getItem(k); return d?JSON.parse(d):def; }

// ========== SISTEM SALDO ==========
function getSaldo(username) {
    const users = DB_ambil('store_users', {});
    return users[username]?.saldo || 0;
}
function tambahSaldo(username, jumlah, ket='Top Up') {
    const users = DB_ambil('store_users', {});
    if (!users[username]) return false;
    users[username].saldo = (users[username].saldo || 0) + parseInt(jumlah);
    DB_simpan('store_users', users);
    const riwayat = DB_ambil('riwayat_saldo_' + username, []);
    riwayat.unshift({waktu:new Date().toLocaleString(),tipe:'tambah',jumlah:parseInt(jumlah),ket});
    DB_simpan('riwayat_saldo_' + username, riwayat);
    updateSaldoDisplay();
    return true;
}
function kurangiSaldo(username, jumlah, ket='Pembelian') {
    const users = DB_ambil('store_users', {});
    if (!users[username] || (users[username].saldo || 0) < jumlah) return false;
    users[username].saldo = (users[username].saldo || 0) - parseInt(jumlah);
    DB_simpan('store_users', users);
    const riwayat = DB_ambil('riwayat_saldo_' + username, []);
    riwayat.unshift({waktu:new Date().toLocaleString(),tipe:'kurangi',jumlah:parseInt(jumlah),ket});
    DB_simpan('riwayat_saldo_' + username, riwayat);
    updateSaldoDisplay();
    return true;
}
function updateSaldoDisplay() {
    if (!currentUser) return;
    const saldo = getSaldo(currentUser.username);
    const el1 = document.getElementById('user-saldo');
    const el2 = document.getElementById('saldo-page-saldo');
    if (el1) el1.textContent = formatHarga(saldo);
    if (el2) el2.textContent = formatHarga(saldo);
    if (currentNomor.harga > 0) {
        const el = document.getElementById('nomor-sisa-saldo');
        if (el) el.textContent = formatHarga(saldo - currentNomor.harga);
    }
}

// ========== LOGIN & REGISTER ==========
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}
function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}
function login() {
    const usn = document.getElementById('login-usn').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    if (!usn || !pw) return alert('Isi username & password!');
    const users = DB_ambil('store_users', {});
    const admins = DB_ambil('store_admins', []);
    
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    } else if (admins.some(a => a.username === usn && a.password === pw)) {
        currentUser = { username: usn, role: 'admin' };
    } else if (users[usn] && users[usn].password === pw) {
        currentUser = { ...users[usn], role: 'user' };
    } else {
        return alert('Username/password salah!');
    }
    DB_simpan('store_current_user', currentUser);
    document.getElementById('nama-user').textContent = currentUser.username;
    closeAuthModal();
    updateSaldoDisplay();
    updateNav();
}
function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    if (!usn || !pw) return alert('Lengkapi data!');
    const users = DB_ambil('store_users', {});
    if (users[usn]) return alert('Username sudah ada!');
    users[usn] = { username: usn, password: pw, saldo: 0, daftar: new Date().toLocaleString() };
    DB_simpan('store_users', users);
    alert('✅ Daftar berhasil! Silakan Login.');
    showLogin();
}
function logout() {
    if (!confirm('Keluar dari akun?')) return;
    currentUser = null;
    localStorage.removeItem('store_current_user');
    location.reload();
}
function updateNav() {
    const tabOwner = document.getElementById('tab-owner');
    const tabAdmin = document.getElementById('tab-admin');
    if (tabOwner) tabOwner.classList.toggle('hidden', !(isOwner() ||
