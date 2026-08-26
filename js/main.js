
// ========== KONFIGURASI HARGA TETAP ==========
const CONFIG = {
    ownerUsername: 'owner',
    ownerPassword: 'owner123',
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
        '+62': { WhatsApp: { '1': 15000, '5': 60000, '10': 110000 }, Telegram: { '1': 12000, '5': 50000, '10': 95000 } },
        '+60': { WhatsApp: { '1': 25000, '5': 110000, '10': 200000 } },
        '+65': { WhatsApp: { '1': 30000, '5': 135000, '10': 250000 } },
        '+1': { WhatsApp: { '1': 45000, '5': 200000, '10': 380000 } }
    }
};

let currentUser = null, selectedPlatform = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };

// ========== FUNGSI DASAR ==========
function formatHarga(angka) { return 'Rp ' + parseInt(angka).toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function DB_simpan(k, d) { localStorage.setItem(k, JSON.stringify(d)); }
function DB_ambil(k, def=null) { const d=localStorage.getItem(k); return d?JSON.parse(d):def; }

// ========== SISTEM SALDO ==========
function getSaldo(username) {
    const users = DB_ambil('simuru_users', {});
    return users[username]?.saldo || 0;
}
function tambahSaldo(username, jumlah, ket='Top Up') {
    const users = DB_ambil('simuru_users', {});
    if (!users[username]) return false;
    users[username].saldo = (users[username].saldo || 0) + parseInt(jumlah);
    DB_simpan('simuru_users', users);
    const riwayat = DB_ambil('riwayat_' + username, []);
    riwayat.unshift({waktu:new Date().toLocaleString(),tipe:'tambah',jumlah:parseInt(jumlah),ket});
    DB_simpan('riwayat_' + username, riwayat);
    updateSaldoDisplay();
    return true;
}
function kurangiSaldo(username, jumlah, ket='Pembelian') {
    const users = DB_ambil('simuru_users', {});
    if (!users[username] || (users[username].saldo || 0) < jumlah) return false;
    users[username].saldo = (users[username].saldo || 0) - parseInt(jumlah);
    DB_simpan('simuru_users', users);
    const riwayat = DB_ambil('riwayat_' + username, []);
    riwayat.unshift({waktu:new Date().toLocaleString(),tipe:'kurangi',jumlah:parseInt(jumlah),ket});
    DB_simpan('riwayat_' + username, riwayat);
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
    if (!usn || !pw) return alert('Isi semua!');
    const users = DB_ambil('simuru_users', {});
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    } else if (users[usn] && users[usn].password === pw) {
        currentUser = { ...users[usn], role: 'user' };
    } else {
        return alert('Username/password salah!');
    }
    DB_simpan('simuru_current_user', currentUser);
    document.getElementById('nama-user').textContent = currentUser.username;
    closeAuthModal();
    updateSaldoDisplay();
    updateNav();
}
function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    if (!usn || !pw) return alert('Lengkapi data!');
    const users = DB_ambil('simuru_users', {});
    if (users[usn]) return alert('Username sudah ada!');
    users[usn] = { username: usn, password: pw, saldo: 0, daftar: new Date().toLocaleString() };
    DB_simpan('simuru_users', users);
    alert('✅ Daftar berhasil! Silakan Login.');
    showLogin();
}
function logout() {
    if (!confirm('Keluar?')) return;
    currentUser = null;
    localStorage.removeItem('simuru_current_user');
    location.reload();
}
function updateNav() {
    const tabOwner = document.getElementById('tab-owner');
    if (tabOwner) tabOwner.classList.toggle('hidden', !isOwner());
}

// ========== NAVIGASI — SEMUA TOMBOL BISA DIKLIK ==========
function showPage(page) {
    if (!currentUser && page !== 'beranda') return;
    ['page-beranda','page-nomor','page-booster','page-saldo','page-chat','page-owner','page-pesanan'].forEach(id=>{
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
    }
    if (page === 'owner' && isOwner()) {
        document.getElementById('page-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.add('active');
    }
    if (page === 'pesanan') {
        document.getElementById('page-pesanan').classList.remove('hidden');
        loadPesanan();
    }
    updateSaldoDisplay();
}

// ========== NOMOR ==========
function resetNomorForm() {
    currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
    document.getElementById('nomor-negara').value = '';
    document.getElementById('nomor-layanan').innerHTML = '<option value="">-- Pilih Layanan --</option>';
    document.getElementById('nomor-jumlah').innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    document.getElementById('nomor-hasil').classList.add('hidden');
}
function updateNomorLayanan() {
    const neg = document.getElementById('nomor-negara').value;
    currentNomor.negara = neg;
    document.getElementById('nomor-sum-negara').textContent = neg;
    const sel = document.getElementById('nomor-layanan');
    sel.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    if (neg && CONFIG.nomorData[neg]) {
        Object.keys(CONFIG.nomorData[neg]).forEach(l=>sel.innerHTML += `<option value="${l}">${l}</option>`);
    }
}
function updateNomorJumlah() {
    const neg = document.getElementById('nomor-negara').value;
    const lay = document.getElementById('nomor-layanan').value;
    currentNomor.layanan = lay;
    document.getElementById('nomor-sum-layanan').textContent = lay;
    const sel = document.getElementById('nomor-jumlah');
    sel.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (neg && lay && CONFIG.nomorData[neg]?.[lay]) {
        Object.entries(CONFIG.nomorData[neg][lay]).forEach(([j,h])=>sel.innerHTML += `<option value="${j}" data-harga="${h}">${j} — ${formatHarga(h)}</option>`);
    }
}
function updateNomorHarga() {
    const opt = document.getElementById('nomor-jumlah').selectedOptions[0];
    if (opt?.dataset.harga) {
        currentNomor.jumlah = opt.value;
        currentNomor.harga = parseInt(opt.dataset.harga);
        document.getElementById('nomor-sum-jumlah').textContent = opt.value;
        document.getElementById('nomor-sum-harga').textContent = formatHarga(currentNomor.harga);
    }
}
function beliNomor() {
    if (!currentNomor.negara || !currentNomor.layanan || !currentNomor.jumlah) return alert('Lengkapi data!');
    if (getSaldo(currentUser.username) < currentNomor.harga) return alert('Saldo tidak cukup!');
    if (!kurangiSaldo(currentUser.username, currentNomor.harga, 'Beli Nomor')) return alert('Gagal potong saldo!');
    
    // GENERATE NOMOR & KODE OTOMATIS
    const nomorKeluar = currentNomor.negara + Math.floor(Math.random()*900000000+100000000);
    const kodeKeluar = Math.floor(100000 + Math.random()*900000);
    
    // SIMPAN PESANAN
    const pesanan = {
        id: Date.now(), user: currentUser.username, tipe: 'nomor',
        negara: currentNomor.negara, layanan: currentNomor.layanan,
        jumlah: currentNomor.jumlah, harga: currentNomor.harga,
        nomorKeluar, kodeKeluar, status: 'sukses', waktu: new Date().toLocaleString()
    };
    const list = DB_ambil('pesanan_' + currentUser.username, []);
    list.unshift(pesanan);
    DB_simpan('pesanan_' + currentUser.username, list);
    
    // TAMPILKAN HASIL
    document.getElementById('nomor-keluar-value').textContent = nomorKeluar;
    document.getElementById('kode-keluar-value').textContent = kodeKeluar;
    document.getElementById('nomor-hasil').classList.remove('hidden');
    alert('✅ Berhasil! Nomor & kode sudah dikirim ke Simuru API.');
}

// ========== BOOSTER ==========
function selectPlatform(plat) {
    selectedPlatform = plat;
    currentBooster.platform = plat;
    document.getElementById('booster-form').classList.remove('hidden');
    document.getElementById('sum-platform').textContent = plat;
    const sel = document.getElementById('form-layanan');
    sel.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    Object.keys(CONFIG.hargaData[plat]).forEach(l=>sel.innerHTML += `<option value="${l}">${l}</option>`);
}
function updateJumlahBooster() {
    const lay = document.getElementById('form-layanan').value;
    currentBooster.layanan = lay;
    document.getElementById('sum-layanan').textContent = lay;
    const sel = document.getElementById('form-jumlah');
    sel.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (lay && CONFIG.hargaData[selectedPlatform]?.[lay]) {
        Object.entries(CONFIG.hargaData[selectedPlatform][lay]).forEach(([j,h])=>sel.innerHTML += `<option value="${j}" data-harga="${h}">${j} — ${formatHarga(h)}</option>`);
    }
}
function updateHargaBooster() {
    const opt = document.getElementById('form-jumlah').selectedOptions[0];
    if (opt?.dataset.harga) {
        currentBooster.jumlah = opt.value;
        currentBooster.harga = parseInt(opt.dataset.harga);
        document.getElementById('sum-jumlah').textContent = opt.value;
        document.getElementById('sum-harga').textContent = formatHarga(currentBooster.harga);
    }
}
function beliBooster() {
    const link = document.getElementById('form-link').value;
    if (!currentBooster.layanan || !currentBooster.jumlah || !link) return alert('Lengkapi semua data!');
    if (getSaldo(currentUser.username) < currentBooster.harga) return alert('Saldo tidak cukup!');
    if (!kurangiSaldo(currentUser.username, currentBooster.harga, 'Booster')) return alert('Gagal!');
    
    const pesanan = {
        id: Date.now(), user: currentUser.username, tipe: 'booster',
        platform: currentBooster.platform, layanan: currentBooster.layanan,
        jumlah: currentBooster.jumlah, harga: currentBooster.harga,
        link, status: 'proses', waktu: new Date().toLocaleString()
    };
    const list = DB_ambil('pesanan_' + currentUser.username, []);
    list.unshift(pesanan);
    DB_simpan('pesanan_' + currentUser.username, list);
    alert('✅ Pesanan berhasil! Proses segera dimulai.');
    showPage('pesanan');
}

// ========== TOP UP SALDO ==========
function updateTopUpTotal() {
    const val = parseInt(document.getElementById('topup-jumlah').value) || 0;
    const el = document.querySelector('#page-saldo .total');
    if (el) el.textContent = formatHarga(val);
}
function kirimTopUp() {
    const jumlah = parseInt(document.getElementById('topup-jumlah').value);
    if (!jumlah || jumlah < 10000) return alert('Pilih nominal minimal Rp 10.000!');
    const req = DB_ambil('topup_requests', []);
    req.unshift({
        id: Date.now(), user: currentUser.username, jumlah, status: 'pending', waktu: new Date().toLocaleString()
    });
    DB_simpan('topup_requests', req);
    alert('✅ Permintaan Top Up terkirim! Menunggu konfirmasi Owner.');
    document.getElementById('topup-jumlah').value = '';
}
function loadRiwayatSaldo() {
    const riwayat = DB_ambil('riwayat_' + currentUser.username, []);
    const tbody = document.getElementById('riwayat-saldo-body');
    tbody.innerHTML = riwayat.length ? riwayat.map(r=>`
        <tr>
            <td>${r.waktu}</td>
            <td>${r.tipe==='tambah'?'💰 Top Up':'🛒 Pembelian'}</td>
            <td style="color:${r.tipe==='tambah'?'var(--success)':'var(--danger)'}">${r.tipe==='tambah'?'+':'-'}${formatHarga(r.jumlah)}</td>
        </tr>
    `).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Belum ada riwayat.</td></tr>';
}

// ========== CHAT ==========
function kirimChat() {
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    const key = 'chat_' + currentUser.username;
    const chat = DB_ambil(key, []);
    chat.push({ dari: currentUser.username, pesan, waktu: new Date().toLocaleString() });
    DB_simpan(key, chat);
    input.value = '';
    alert('✅ Pesan terkirim ke Owner!');
}

// ========== OWNER PANEL ==========
function ubahSaldoUser() {
    if (!isOwner()) return;
    const user = document.getElementById('saldo-user').value.trim();
    const jumlah = parseInt(document.getElementById('saldo-jumlah').value);
    if (!user || isNaN(jumlah)) return alert('Lengkapi data!');
    const users = DB_ambil('simuru_users', {});
    if (!users[user]) return alert('User tidak ditemukan!');
    users[user].saldo = (users[user].saldo || 0) + jumlah;
    DB_simpan('simuru_users', users);
    alert(`✅ Saldo ${user} diubah menjadi ${formatHarga(users[user].saldo)}!`);
    document.getElementById('saldo-user').value = '';
    document.getElementById('saldo-jumlah').value = '';
}

// ========== RIWAYAT PESANAN ==========
function loadPesanan() {
    const list = DB_ambil('pesanan_' + currentUser.username, []);
    const tbody = document.getElementById('pesanan-list');
    tbody.innerHTML = list.length ? list.map(p=>`
        <tr>
            <td>${p.tipe==='nomor'?'📱':'🚀'} ${p.tipe}</td>
            <td>${p.platform || p.layanan}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td>${p.nomorKeluar || '-'}</td>
            <td style="color:${p.status==='sukses'?'var(--success)':'orange'}">${p.status}</td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);">Belum ada pesanan.</td></tr>';
}

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', function() {
    const saved = DB_ambil('simuru_current_user');
    if (saved) {
        currentUser = saved;
        closeAuthModal();
        document.getElementById('nama-user').textContent = currentUser.username;
        updateSaldoDisplay();
        updateNav();
    }
});
