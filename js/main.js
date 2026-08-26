
let currentUser = null;
let selectedChatUser = null;
let currentOrderType = null;
let currentNomor = { negara: '', layanan: '', jumlah: 0, harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: 0, harga: 0 };
let kodeVerifikasiSaatIni = null;

// === FORMAT HARGA ===
function formatHarga(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// === GENERATE KODE VERIFIKASI ===
function buatKodeVerifikasi() {
    const kode = Math.floor(100000 + Math.random() * 900000).toString();
    kodeVerifikasiSaatIni = kode;
    return kode;
}

// === KIRIM KODE VERIFIKASI KE OWNER VIA CHAT ===
function kirimKodeKeOwner(nomor, layanan, negara, kode) {
    if (!currentUser) return;
    
    const chatKey = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chatData = DB.ambil(chatKey, []);
    
    const pesanKeOwner = `🔑 KODE VERIFIKASI PEMBELIAN NOMOR\n━━━━━━━━━━━━━━━━━━━━\n👤 User: ${currentUser.username}\n🌍 Negara: ${negara}\n📱 Layanan: ${layanan}\n📞 Nomor: ${nomor}\n🔢 Kode: ${kode}\n━━━━━━━━━━━━━━━━━━━━\nSilakan konfirmasi kode ini untuk mengaktifkan nomor.`;
    
    chatData.push({
        pengirim: currentUser.username,
        pesan: pesanKeOwner,
        waktu: new Date().toLocaleString('id-ID'),
        tipe: 'verifikasi_nomor'
    });
    
    DB.simpan(chatKey, chatData);
    
    // Simpan kode ke database verifikasi
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

// === AUTO LOGIN — TETAP MASUK WALAU KELUAR ===
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

// === FUNGSI LOGIN & REGISTER ===
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
    
    // === SIMPAN SESI — TETAP LOGIN ===
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
        username: usn, 
        password: pw, 
        bank, 
        countryCode, 
        no: fullNumber,
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

// === CEK ROLE ===
function isOwner() {
    return currentUser?.username === CONFIG.ownerUsername;
}
function isAdmin() {
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    return isOwner() || admins.some(a => a.username === currentUser?.username);
}

// === NAVIGASI ===
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
    if (page === 'admin' && isOwner()) {
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.add('active');
    }
}

function showPagePesanan() {
    if (!currentUser) return;
    document.getElementById('page-pesanan').classList.remove('hidden');
    loadPesanan();
}

// === FORM NOMOR ===
function resetNomorForm() {
    document.getElementById('nomor-negara').value = '';
    document.getElementById('nomor-layanan').innerHTML = '<option value="">-- Pilih Layanan Dulu --</option>';
    document.getElementById('nomor-jumlah').innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    document.getElementById('nomor-sum-negara').textContent = '-';
    document.getElementById('nomor-sum-layanan').textContent = '-';
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
    const verifyBox = document.getElementById('verify-box');
    if (verifyBox) verifyBox.classList.add('hidden');
    currentNomor = { negara: '', layanan: '', jumlah: 0, harga: 0 };
    kodeVerifikasiSaatIni = null;
}

function updateNomorLayanan() {
    const negara = document.getElementById('nomor-negara').value;
    currentNomor.negara = negara;
    document.getElementById('nomor-sum-negara').textContent = negara || '-';
    
    const layananSelect = document.getElementById('nomor-layanan');
    layananSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    
    if (negara && CONFIG.nomorData[negara]) {
        for (const layanan in CONFIG.nomorData[negara]) {
            layananSelect.innerHTML += `<option value="${layanan}">${layanan}</option>`;
        }
    }
    document.getElementById('nomor-jumlah').innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    document.getElementById('nomor-sum-layanan').textContent = '-';
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
    const verifyBox = document.getElementById('verify-box');
    if (verifyBox) verifyBox.classList.add('hidden');
}

function updateNomorJumlah() {
    const negara = document.getElementById('nomor-negara').value;
    const layanan = document.getElementById('nomor-layanan').value;
    currentNomor.layanan = layanan;
    document.getElementById('nomor-sum-layanan').textContent = layanan || '-';
    
    const jumlahSelect = document.getElementById('nomor-jumlah');
    jumlahSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    
    if (negara && layanan && CONFIG.nomorData[negara]?.[layanan]) {
        for (const jumlah in CONFIG.nomorData[negara][layanan]) {
            jumlahSelect.innerHTML += `<option value="${jumlah}">${jumlah} Buah</option>`;
        }
    }
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
    const verifyBox = document.getElementById('verify-box');
    if (verifyBox) verifyBox.classList.add('hidden');
}

function updateNomorHarga() {
    const negara = document.getElementById('nomor-negara').value;
    const layanan = document.getElementById('nomor-layanan').value;
    const jumlah = document.getElementById('nomor-jumlah').value;
    currentNomor.jumlah = jumlah;
    document.getElementById('nomor-sum-jumlah').textContent = jumlah ? `${jumlah} Buah` : '-';
    
    if (negara && layanan && jumlah && CONFIG.nomorData[negara]?.[layanan]?.[jumlah]) {
        currentNomor.harga = CONFIG.nomorData[negara][layanan][jumlah];
        document.getElementById('nomor-sum-harga').textContent = formatHarga(currentNomor.harga);
        
        // Tampilkan Kode Verifikasi
        const kode = buatKodeVerifikasi();
        const verifyBox = document.getElementById('verify-box');
        if (verifyBox) {
            verifyBox.classList.remove('hidden');
            document.getElementById('kode-verifikasi').textContent = kode;
        }
    }
}

function kirimKodeKeOwnerSekarang() {
    if (!currentNomor.negara || !currentNomor.layanan || !currentNomor.jumlah) {
        return alert('Lengkapi data dulu!');
    }
    if (!kodeVerifikasiSaatIni) {
        return alert('Kode belum dibuat! Pilih jumlah dulu.');
    }
    
    const nomorDummy = `${currentNomor.negara} ${Math.floor(Math.random() * 900000000 + 100000000)}`;
    kirimKodeKeOwner(nomorDummy, currentNomor.layanan, currentNomor.negara, kodeVerifikasiSaatIni);
    
    alert(`✅ Kode verifikasi ${kodeVerifikasiSaatIni} sudah dikirim ke Owner!\nTunggu konfirmasi dari Owner.`);
}

function lanjutBayarNomor() {
    if (!currentNomor.negara || !currentNomor.layanan || !currentNomor.jumlah || !currentNomor.harga) {
        return alert('Lengkapi semua data nomor!');
    }
    if (!kodeVerifikasiSaatIni) {
        return alert('Kode verifikasi belum dibuat! Pilih jumlah dulu.');
    }
    currentOrderType = 'nomor';
    document.getElementById('pay-type').textContent = 'Tipe: 📱 Nomor Virtual';
    document.getElementById('pay-platform-negara').textContent = 'Negara: ' + currentNomor.negara;
    document.getElementById('pay-layanan').textContent = 'Layanan: ' + currentNomor.layanan;
    document.getElementById('pay-jumlah').textContent = 'Jumlah: ' + currentNomor.jumlah + ' Buah';
    document.getElementById('pay-harga').textContent = formatHarga(currentNomor.harga);
    document.getElementById('page-nomor').classList.add('hidden');
    document.getElementById('payment-form').classList.remove('hidden');
}

// === BOOSTER SOSMED ===
function selectPlatform(platform) {
    currentBooster.platform = platform;
    document.getElementById('form-platform').value = platform;
    document.getElementById('booster-form').classList.remove('hidden');
    document.getElementById('sum-platform').textContent = platform;
    
    const layananSelect = document.getElementById('form-layanan');
    layananSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    
    if (CONFIG.hargaData[platform]) {
        for (const layanan in CONFIG.hargaData[platform]) {
            layananSelect.innerHTML += `<option value="${layanan}">${layanan}</option>`;
        }
    }
    document.getElementById('sum-layanan').textContent = '-';
    document.getElementById('sum-jumlah').textContent = '-';
    document.getElementById('sum-harga').textContent = 'Rp 0';
}

function updateJumlahBooster() {
    const platform = currentBooster.platform;
    const layanan = document.getElementById('form-layanan').value;
    currentBooster.layanan = layanan;
    document.getElementById('sum-layanan').textContent = layanan || '-';
    
    const jumlahSelect = document.getElementById('form-jumlah');
    jumlahSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    
    if (platform && layanan && CONFIG.hargaData[platform]?.[layanan]) {
        for (const jumlah in CONFIG.hargaData[platform][layanan]) {
            jumlahSelect.innerHTML += `<option value="${jumlah}">${jumlah}</option>`;
        }
    }
    document.getElementById('sum-jumlah').textContent = '-';
    document.getElementById('sum-harga').textContent = 'Rp 0';
}

function updateHargaBooster() {
    const platform = currentBooster.platform;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    currentBooster.jumlah = jumlah;
    document.getElementById('sum-jumlah').textContent = jumlah || '-';
    
    if (platform && layanan && jumlah && CONFIG.hargaData[platform]?.[layanan]?.[jumlah]) {
        currentBooster.harga = CONFIG.hargaData[platform][layanan][jumlah];
        document.getElementById('sum-harga').textContent = formatHarga(currentBooster.harga);
    }
}

function lanjutBayarBooster() {
    const link = document.getElementById('form-link').value.trim();
    if (!currentBooster.platform || !currentBooster.layanan || !currentBooster.jumlah || !currentBooster.harga || !link) {
        return alert('Lengkapi semua data booster!');
    }
    currentOrderType = 'booster';
    document.getElementById('pay-type').textContent = 'Tipe: 🚀 Sosmed Booster';
    document.getElementById('pay-platform-negara').textContent = 'Platform: ' + currentBooster.platform;
    document.getElementById('pay-layanan').textContent = 'Layanan: ' + currentBooster.layanan;
    document.getElementById('pay-jumlah').textContent = 'Jumlah: ' + currentBooster.jumlah;
    document.getElementById('pay-harga').textContent = formatHarga(currentBooster.harga);
    document.getElementById('page-booster').classList.add('hidden');
    document.getElementById('payment-form').classList.remove('hidden');
}

function kembaliKeForm() {
    document.getElementById('payment-form').classList.add('hidden');
    if (currentOrderType === 'nomor') {
        document.getElementById('page-nomor').classList.remove('hidden');
    } else if (currentOrderType === 'booster') {
        document.getElementById('page-booster').classList.remove('hidden');
        document.getElementById('booster-form').classList.remove('hidden');
    }
}

function previewBukti() {
    const file = document.getElementById('bukti-tf').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bukti-preview').src = e.target.result;
            document.getElementById('bukti-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// === KIRIM PESANAN — SIMPAN KE DATABASE ===
function kirimPesanan() {
    const buktiTf = document.getElementById('bukti-preview').src;
    if (!buktiTf) return alert('Upload bukti transfer dulu!');
    
    let pesanan;
    if (currentOrderType === 'nomor') {
        pesanan = {
            id: Date.now(),
            user: currentUser.username,
            tipe: 'nomor',
            negara: currentNomor.negara,
            layanan: currentNomor.layanan,
            jumlah: currentNomor.jumlah,
            harga: currentNomor.harga,
            kodeVerifikasi: kodeVerifikasiSaatIni,
            buktiTf,
            status: 'pending',
            waktu: new Date().toLocaleString('id-ID')
        };
    } else if (currentOrderType === 'booster') {
        pesanan = {
            id: Date.now(),
            user: currentUser.username,
            tipe: 'booster',
            platform: currentBooster.platform,
            layanan: currentBooster.layanan,
            jumlah: currentBooster.jumlah,
            link: document.getElementById('form-link').value.trim(),
            harga: currentBooster.harga,
            buktiTf,
            status: 'pending',
            waktu: new Date().toLocaleString('id-ID')
        };
    } else {
        return alert('Tipe pesanan tidak dikenali!');
    }
    
    // === SIMPAN KE DATABASE ===
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    list.push(pesanan);
    DB.simpan(CONFIG.DB_KEYS.PESANAN, list);
    
    alert('✅ Pesanan berhasil dikirim! Menunggu konfirmasi.');
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('bukti-preview').src = '';
    document.getElementById('bukti-preview').style.display = 'none';
    currentOrderType = null;
    kodeVerifikasiSaatIni = null;
    loadPesanan();
    showPage('beranda');
}

// === LOAD RIWAYAT PESANAN ===
function loadPesanan() {
    if (!currentUser) return;
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    const tbody = document.getElementById('pesanan-list');
    
    const userPesanan = list.filter(p => p.user === currentUser.username || isOwner() || isAdmin());
    
    if (userPesanan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">Belum ada pesanan.</td></tr>';
        return;
    }
    
    tbody.innerHTML = userPesanan.map(p => {
        const statusText = p.status === 'accept' ? '✅ Accept' : p.status === 'decline' ? '❌ Decline' : '⏳ Menunggu';
        const tipe = p.tipe === 'nomor' ? '📱 Nomor' : '🚀 Booster';
        const detail = p.tipe === 'nomor' ? `${p.negara} — ${p.layanan}` : `${p.platform} — ${p.layanan}`;
        const kode = p.kodeVerifikasi ? `<br>🔑 Kode: ${p.kodeVerifikasi}` : '';
        return `<tr>
            <td>${tipe}</td>
            <td>${detail}${kode}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td>${statusText}</td>
        </tr>`;
    }).join('');
}

// === OWNER: DAFTAR PESANAN ===
function loadOwnerPesanan() {
    if (!isOwner() && !isAdmin()) return;
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    const tbody = document.getElementById('owner-pesanan-list');
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px;">Belum ada pesanan masuk.</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(p => {
        const tipe = p.tipe === 'nomor' ? '📱 Nomor' : '🚀 Booster';
        const detail = p.tipe === 'nomor' ? `${p.negara} — ${p.layanan}` : `${p.platform} — ${p.layanan}`;
        const link = p.link ? `<a href="${p.link}" target="_blank" style="color:var(--gold);">Link</a>` : '-';
        const kode = p.kodeVerifikasi || '-';
        return `
        <tr>
            <td>${p.user}</td>
            <td>${tipe}</td>
            <td>${detail}</td>
            <td>${kode}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td>${p.status}</td>
            <td>
                ${p.status === 'pending' ? `
                    <button class="btn" style="padding:4px 8px;font-size:.8rem;width:auto;background:#2ecc71;" onclick="ubahStatus(${p.id},'accept')">✓</button>
                    <button class="btn" style="padding:4px 8px;font-size:.8rem;width:auto;background:#e74c3c;" onclick="ubahStatus(${p.id},'decline')">✗</button>
                ` : ''}
            </td>
        </tr>`;
    }).join('');
}

// === OWNER: DAFTAR KODE VERIFIKASI ===
function loadDaftarVerifikasi() {
    if (!isOwner() && !isAdmin()) return;
    const list = DB.ambil(CONFIG.DB_KEYS.VERIFY_CODES, []);
    const tbody = document.getElementById('verify-list-body');
    
    if (!tbody) return;
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">Belum ada kode verifikasi.</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map((v, i) => `
        <tr>
            <td>${v.user}</td>
            <td>${v.negara} — ${v.layanan}</td>
            <td style="font-weight:bold;color:var(--gold);">${v.kode}</td>
            <td>${v.status === 'menunggu' ? '⏳ Menunggu' : v.status === 'terpakai' ? '✅ Terpakai' : '❌ Batal'}</td>
            <td>
                ${v.status === 'menunggu' ? `
                    <button class="btn" style="padding:4px 8px;font-size:.8rem;width:auto;background:#2ecc71;" onclick="konfirmasiKode('${v.kode}')">✓</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function konfirmasiKode(kode) {
    if (!confirm(`Konfirmasi kode ${kode}?`)) return;
    const list = DB.ambil(CONFIG.DB_KEYS.VERIFY_CODES, []);
    const idx = list.findIndex(v => v.kode === kode);
    if (idx !== -1) {
        list[idx].status = 'terpakai';
        list[idx].dikonfirmasiOleh = currentUser.username;
        list[idx].waktuKonfirmasi = new Date().toLocaleString('id-ID');
        DB.simpan(CONFIG.DB_KEYS.VERIFY_CODES, list);
        loadDaftarVerifikasi();
        alert('✅ Kode dikonfirmasi!');
    }
}

function ubahStatus(id, status) {
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
        list[idx].status = status;
        DB.simpan(CONFIG.DB_KEYS.PESANAN, list);
        loadOwnerPesanan();
        loadPesanan();
    }
}

// === CHAT CS — DATABASE CHAT ===
function loadChatUserList() {
    if (!isOwner() && !isAdmin()) return;
    const allKeys = Object.keys(localStorage);
    const chatKeys = allKeys.filter(k => k.startsWith(CONFIG.DB_KEYS.CHAT_PREFIX));
    const userList = document.getElementById('chat-user-list');
    
    if (chatKeys.length === 0) {
        userList.innerHTML = '<p style="color:var(--muted);">Belum ada yang chat.</p>';
        return;
    }
    
    userList.innerHTML = chatKeys.map(k => {
        const username = k.replace(CONFIG.DB_KEYS.CHAT_PREFIX, '');
        return `<button class="btn" style="width:auto;padding:8px 15px;margin:0;" onclick="pilihUserChat('${username}')">💬 ${username}</button>`;
    }).join('');
}

function pilihUserChat(username) {
    selectedChatUser = username;
    document.getElementById('selected-chat-user').textContent = username;
    const chatData = DB.ambil(CONFIG.DB_KEYS.CHAT_PREFIX + username, []);
    const box = document.getElementById('owner-chat-box');
    
    if (chatData.length === 0) {
        box.innerHTML = '<div class="chat-bubble system">Belum ada pesan dari user ini.</div>';
        return;
    }
    
    box.innerHTML = chatData.map(c => {
        if (c.pengirim === username) {
            return `<div style="text-align:right;background:#2a2a2a;color:#fff;border-radius:12px 12px 4px 12px;padding:10px 12px;margin:6px 0;max-width:85%;margin-left:auto;">${c.pesan}</div>`;
        } else {
            return `<div style="text-align:left;background:var(--gold);color:#000;border-radius:12px 12px 12px 4px;padding:10px 12px;margin:6px 0;max-width:85%;">${c.pesan}</div>`;
        }
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function kirimBalasanOwner() {
    if (!selectedChatUser) return alert('Pilih user dulu!');
    const input = document.getElementById('owner-chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    
    const chatKey = CONFIG.DB_KEYS.CHAT_PREFIX + selectedChatUser;
    const chatData = DB.ambil(chatKey, []);
    chatData.push({ 
        pengirim: 'owner', 
        pesan, 
        waktu: new Date().toLocaleString('id-ID') 
    });
    DB.simpan(chatKey, chatData);
    
    const box = document.getElementById('owner-chat-box');
    box.innerHTML += `<div style="text-align:left;background:var(--gold);color:#000;border-radius:12px 12px 12px 4px;padding:10px 12px;margin:6px 0;max-width:85%;">${pesan}</div>`;
    box.scrollTop = box.scrollHeight;
    input.value = '';
}

function loadUserChat() {
    if (!currentUser || isOwner() || isAdmin()) return;
    const chatKey = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chatData = DB.ambil(chatKey, []);
    const box = document.getElementById('chat-box');
    
    if (chatData.length === 0) {
        box.innerHTML = '<div class="chat-bubble system">Selamat datang di CS! Silakan tanya apa saja 😊</div>';
        return;
    }
    
    box.innerHTML = chatData.map(c => {
        if (c.pengirim === currentUser.username) {
            return `<div style="text-align:right;background:#2a2a2a;color:#fff;border-radius:12px 12px 4px 12px;padding:10px 12px;margin:6px 0;max-width:85%;margin-left:auto;">${c.pesan}</div>`;
        } else {
            return `<div style="text-align:left;background:var(--gold);color:#000;border-radius:12px 12px 12px 4px;padding:10px 12px;margin:6px 0;max-width:85%;">${c.pesan}</div>`;
        }
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function kirimChat() {
    if (!currentUser || isOwner() || isAdmin()) return;
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    
    const chatKey = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chatData = DB.ambil(chatKey, []);
    chatData.push({ 
        pengirim: currentUser.username, 
        pesan, 
        waktu: new Date().toLocaleString('id-ID') 
    });
    DB.simpan(chatKey, chatData);
    
    const box = document.getElementById('chat-box');
    box.innerHTML += `<div style="text-align:right;background:#2a2a2a;color:#fff;border-radius:12px 12px 4px 12px;padding:10px 12px;margin:6px 0;max-width:85%;margin-left:auto;">${pesan}</div>`;
    box.scrollTop = box.scrollHeight;
    input.value = '';
}

// === ADMIN PANEL ===
function tambahAdmin() {
    if (!isOwner()) return alert('Hanya owner yang bisa menambah admin!');
    const user = document.getElementById('new-admin-user').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    
    if (!user || !pass) return alert('Isi username & password!');
    if (user === CONFIG.ownerUsername) return alert('Tidak bisa pakai username owner!');
    
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    if (admins.some(a => a.username === user)) return alert('Admin sudah ada!');
    
    admins.push({ 
        username: user, 
        password: pass, 
        tanggal: new Date().toLocaleString('id-ID') 
    });
    DB.simpan(CONFIG.DB_KEYS.ADMINS, admins);
    alert('✅ Admin berhasil ditambahkan!');
    document.getElementById('new-admin-user').value = '';
    document.getElementById('new-admin-pass').value = '';
    loadAdminList();
}

function loadAdminList() {
    if (!isOwner()) return;
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    const tbody = document.getElementById('admin-list-body');
    
    if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Belum ada admin.</td></tr>';
        return;
    }
    
    tbody.innerHTML = admins.map(a => `
        <tr>
            <td>${a.username}</td>
            <td>${a.tanggal}</td>
            <td><button class="btn" style="padding:4px 10px;width:auto;background:#e74c3c;" onclick="hapusAdmin('${a.username}')">Hapus</button></td>
        </tr>
    `).join('');
}

function hapusAdmin(username) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;
    let admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    admins = admins.filter(a => a.username !== username);
    DB.simpan(CONFIG.DB_KEYS.ADMINS, admins);
    loadAdminList();
}

// === TOGGLE INFO ===
function toggleInfo(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el) el.classList.toggle('hidden');
    if (icon) icon.textContent = el?.classList.contains('hidden') ? '▼' : '▲';
}

// === INISIALISASI SAAT HALAMAN DIBUKA ===
document.addEventListener('DOMContentLoaded', function() {
    // Cek Auto Login
    if (cekLoginOtomatis()) {
        // Sudah login — sembunyikan modal login
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('hidden');
        if (isOwner() || isAdmin()) {
            loadChatUserList();
            loadOwnerPesanan();
            loadDaftarVerifikasi();
        }
    } else {
        // Belum login — tampilkan modal
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.remove('hidden');
    }
    
    // Load admin list jika owner
    if (isOwner()) loadAdminList();
});
