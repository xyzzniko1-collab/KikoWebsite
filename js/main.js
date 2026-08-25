
let currentUser = null;
let selectedChatUser = null;
let currentOrderType = null; // 'nomor' atau 'booster'
let currentNomor = { negara: '', layanan: '', jumlah: 0, harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: 0, harga: 0 };

function formatHarga(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function toggleInfo(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    el.classList.toggle('hidden');
    icon.textContent = el.classList.contains('hidden') ? '▼' : '▲';
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}
function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Daftar Akun';
}
function showLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Login Akun';
}

function isOwner() {
    return currentUser?.username === CONFIG.ownerUsername;
}
function isAdmin() {
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    return isOwner() || admins.some(a => a.username === currentUser?.username);
}

function login() {
    const usn = document.getElementById('login-usn').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    if (!usn || !pw) return alert('Isi username & password!');
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    } else if (admins.some(a => a.username === usn && a.password === pw)) {
        currentUser = { username: usn, role: 'admin' };
    } else if (users[usn] && users[usn].password === pw) {
        currentUser = { ...users[usn], role: 'user' };
    } else {
        return alert('Username atau password salah!');
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeAuthModal();
    updateNav();
    loadPesanan();
    if (isOwner() || isAdmin()) loadChatUserList();
}

function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    const bank = document.getElementById('reg-bank').value;
    const countryCode = document.getElementById('reg-country-code').value;
    const no = document.getElementById('reg-no').value.trim();
    
    if (!usn || !pw || !bank || !no) return alert('Semua field wajib diisi!');
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[usn]) return alert('Username sudah terdaftar!');
    
    const fullNumber = countryCode + no;
    users[usn] = { username: usn, password: pw, bank, countryCode, no: fullNumber };
    localStorage.setItem('users', JSON.stringify(users));
    alert(`Daftar berhasil!\nNomor: ${fullNumber}\nSilakan login.`);
    showLogin();
}

function logout() {
    currentUser = null;
    selectedChatUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

function updateNav() {
    const tabOwner = document.getElementById('tab-owner');
    const tabAdmin = document.getElementById('tab-admin');
    if (isOwner() || isAdmin()) tabOwner.classList.remove('hidden');
    else tabOwner.classList.add('hidden');
    if (isOwner()) tabAdmin.classList.remove('hidden');
    else tabAdmin.classList.add('hidden');
}

// NAVIGASI UTAMA
function showPage(page) {
    if (!currentUser) return;
    
    // Sembunyikan semua halaman
    ['page-beranda','page-nomor','page-booster','page-chat','page-owner','page-admin','page-pesanan','payment-form','booster-form'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Reset tab header
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.classList.add('inactive'); });
    
    // Tampilkan halaman yang dipilih
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
    }
    if (page === 'admin' && isOwner()) {
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.add('active');
    }
}

// BUKA RIWAYAT PESANAN DARI NAV BAWAH
function showPagePesanan() {
    if (!currentUser) return;
    document.getElementById('page-pesanan').classList.remove('hidden');
    loadPesanan();
}

// ========== FITUR NOMOR ==========
function resetNomorForm() {
    document.getElementById('nomor-negara').value = '';
    document.getElementById('nomor-layanan').innerHTML = '<option value="">-- Pilih Layanan Dulu --</option>';
    document.getElementById('nomor-jumlah').innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    document.getElementById('nomor-sum-negara').textContent = '-';
    document.getElementById('nomor-sum-layanan').textContent = '-';
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
    currentNomor = { negara: '', layanan: '', jumlah: 0, harga: 0 };
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
    }
}

function lanjutBayarNomor() {
    if (!currentNomor.negara || !currentNomor.layanan || !currentNomor.jumlah || !currentNomor.harga) {
        return alert('Lengkapi semua data nomor!');
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

// ========== FITUR BOOSTER ==========
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

// ========== KIRIM PESANAN (NOMOR & BOOSTER) ==========
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
    
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    list.push(pesanan);
    localStorage.setItem('pesanan', JSON.stringify(list));
    
    alert('Pesanan berhasil dikirim! Menunggu konfirmasi.');
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('bukti-preview').src = '';
    document.getElementById('bukti-preview').style.display = 'none';
    currentOrderType = null;
    loadPesanan();
    showPage('beranda');
}

// ========== LOAD RIWAYAT PESANAN ==========
function loadPesanan() {
    if (!currentUser) return;
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
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
        return `<tr>
            <td>${tipe}</td>
            <td>${detail}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td>${statusText}</td>
        </tr>`;
    }).join('');
}

// ========== OWNER PANEL ==========
function loadOwnerPesanan() {
    if (!isOwner() && !isAdmin()) return;
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const tbody = document.getElementById('owner-pesanan-list');
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px;">Belum ada pesanan masuk.</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(p => {
        const tipe = p.tipe === 'nomor' ? '📱 Nomor' : '🚀 Booster';
        const detail = p.tipe === 'nomor' ? `${p.negara} — ${p.layanan}` : `${p.platform} — ${p.layanan}`;
        const link = p.link ? `<a href="${p.link}" target="_blank" style="color:var(--gold);">Link</a>` : '-';
        return `
        <tr>
            <td>${p.user}</td>
            <td>${tipe}</td>
            <td>${detail}</td>
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

function ubahStatus(id, status) {
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
        list[idx].status = status;
        localStorage.setItem('pesanan', JSON.stringify(list));
        loadOwnerPesanan();
        loadPesanan();
    }
}

// ========== CHAT CS — DIPERBAIKI TAMPILAN ==========
function loadChatUserList() {
    if (!isOwner() && !isAdmin()) return;
    const allKeys = Object.keys(localStorage);
    const chatKeys = allKeys.filter(k => k.startsWith('chat_'));
    const userList = document.getElementById('chat-user-list');
    
    if (chatKeys.length === 0) {
        userList.innerHTML = '<p style="color:var(--muted);">Belum ada yang chat.</p>';
        return;
    }
    
    userList.innerHTML = chatKeys.map(k => {
        const username = k.replace('chat_', '');
        return `<button class="btn" style="width:auto;padding:8px 15px;margin:0;" onclick="pilihUserChat('${username}')">💬 ${username}</button>`;
    }).join('');
}

function pilihUserChat(username) {
    selectedChatUser = username;
    document.getElementById('selected-chat-user').textContent = username;
    const chatData = JSON.parse(localStorage.getItem('chat_' + username) || '[]');
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
    const input = document.getElementById('
