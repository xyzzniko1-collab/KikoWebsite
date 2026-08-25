
let currentUser = null;
let selectedChatUser = null;

// ========== UTILITAS ==========
function formatHarga(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// ========== TOGGLE INFO ==========
function toggleInfo(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    el.classList.toggle('hidden');
    icon.textContent = el.classList.contains('hidden') ? '▼' : '▲';
}

// ========== MODAL ==========
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

// ========== AUTH & ROLE ==========
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
    
    // Owner
    if (usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword) {
        currentUser = { username: usn, role: 'owner' };
    }
    // Admin
    else if (admins.some(a => a.username === usn && a.password === pw)) {
        currentUser = { username: usn, role: 'admin' };
    }
    // User biasa
    else if (users[usn] && users[usn].password === pw) {
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
    const noRek = document.getElementById('reg-no-rek').value.trim();
    
    if (!usn || !pw || !bank || !noRek) return alert('Semua field wajib diisi!');
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[usn]) return alert('Username sudah terdaftar!');
    
    users[usn] = { username: usn, password: pw, bank, noRek };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Daftar berhasil! Silakan login.');
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

// ========== NAVIGASI HALAMAN ==========
function showPage(page) {
    if (!currentUser) return;
    
    // Sembunyikan semua halaman
    document.getElementById('page-pesan').classList.add('hidden');
    document.getElementById('page-pesanan').classList.add('hidden');
    document.getElementById('page-chat').classList.add('hidden');
    document.getElementById('page-owner').classList.add('hidden');
    document.getElementById('page-admin').classList.add('hidden');
    
    // Reset tab
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.classList.add('inactive'); });
    
    // Tampilkan halaman
    if (page === 'pesan') {
        document.getElementById('page-pesan').classList.remove('hidden');
        document.getElementById('tab-pesan').classList.add('active');
    }
    if (page === 'pesanan') {
        document.getElementById('page-pesanan').classList.remove('hidden');
        document.getElementById('tab-pesanan').classList.add('active');
        loadPesanan();
    }
    if (page === 'chat') {
        document.getElementById('page-chat').classList.remove('hidden');
        document.getElementById('tab-chat').classList.add('active');
        loadUserChat();
    }
    if (page === 'owner' && (isOwner() || isAdmin())) {
        document.getElementById('page-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.add('active');
        loadChatUserList();
        loadOwnerPesanan();
    }
    if (page === 'admin' && isOwner()) {
        document.getElementById('page-admin').classList.remove('hidden');
        document.getElementById('tab-admin').classList.add('active');
        loadAdminList();
    }
}

// ========== PILIH PLATFORM ==========
function selectPlatform(platform) {
    document.getElementById('form-platform').value = platform;
    document.getElementById('order-form').classList.remove('hidden');
    document.getElementById('payment-form').classList.add('hidden');
    
    const layananSelect = document.getElementById('form-layanan');
    layananSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    
    for (const layanan in CONFIG.hargaData[platform]) {
        layananSelect.innerHTML += `<option value="${layanan}">${layanan}</option>`;
    }
    
    document.getElementById('sum-platform').textContent = platform;
    document.getElementById('sum-layanan').textContent = '-';
    document.getElementById('sum-jumlah').textContent = '-';
    document.getElementById('sum-harga').textContent = 'Rp 0';
}

document.addEventListener('change', e => {
    if (e.target.id === 'form-layanan') {
        const platform = document.getElementById('form-platform').value;
        const layanan = e.target.value;
        const jumlahSelect = document.getElementById('form-jumlah');
        jumlahSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
        
        if (layanan && CONFIG.hargaData[platform][layanan]) {
            for (const jumlah in CONFIG.hargaData[platform][layanan]) {
                jumlahSelect.innerHTML += `<option value="${jumlah}">${jumlah}</option>`;
            }
        }
        document.getElementById('sum-layanan').textContent = layanan || '-';
        document.getElementById('sum-jumlah').textContent = '-';
        document.getElementById('sum-harga').textContent = 'Rp 0';
    }
    
    if (e.target.id === 'form-jumlah') {
        const platform = document.getElementById('form-platform').value;
        const layanan = document.getElementById('form-layanan').value;
        const jumlah = e.target.value;
        document.getElementById('sum-jumlah').textContent = jumlah || '-';
        
        if (platform && layanan && jumlah) {
            const harga = CONFIG.hargaData[platform][layanan][jumlah];
            document.getElementById('sum-harga').textContent = formatHarga(harga);
        }
    }
});

// ========== PEMBAYARAN ==========
function lanjutBayar() {
    const platform = document.getElementById('form-platform').value;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    const link = document.getElementById('form-link').value.trim();
    
    if (!platform || !layanan || !jumlah || !link) {
        return alert('Lengkapi semua data!');
    }
    
    const harga = CONFIG.hargaData[platform][layanan][jumlah];
    
    document.getElementById('pay-platform').textContent = platform;
    document.getElementById('pay-layanan').textContent = layanan;
    document.getElementById('pay-jumlah').textContent = jumlah;
    document.getElementById('pay-harga').textContent = formatHarga(harga);
    
    document.getElementById('order-form').classList.add('hidden');
    document.getElementById('payment-form').classList.remove('hidden');
}

function kembaliKeForm() {
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('order-form').classList.remove('hidden');
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

function kirimPesanan() {
    const platform = document.getElementById('form-platform').value;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    const link = document.getElementById('form-link').value.trim();
    const buktiTf = document.getElementById('bukti-preview').src;
    
    if (!buktiTf) return alert('Upload bukti transfer dulu!');
    
    const harga = CONFIG.hargaData[platform][layanan][jumlah];
    
    const pesanan = {
        id: Date.now(),
        user: currentUser.username,
        platform, layanan, jumlah, link, harga, buktiTf,
        status: 'pending',
        waktu: new Date().toLocaleString('id-ID')
    };
    
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    list.push(pesanan);
    localStorage.setItem('pesanan', JSON.stringify(list));
    
    alert('Pesanan berhasil dikirim! Menunggu konfirmasi owner.');
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('form-platform').value = '';
    document.getElementById('form-link').value = '';
    document.getElementById('bukti-preview').src = '';
    document.getElementById('bukti-preview').style.display = 'none';
    loadPesanan();
}

// ========== LOAD PESANAN ==========
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
        const statusClass = p.status === 'accept' ? 'status-accept' : p.status === 'decline' ? 'status-decline' : 'status-pending';
        const statusText = p.status === 'accept' ? '✅ Accept' : p.status === 'decline' ? '❌ Decline' : '⏳ Menunggu';
        return `<tr>
            <td>${p.platform}</td>
            <td>${p.layanan}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
        </tr>`;
    }).join('');
}

// ========== OWNER PANEL ==========
function loadOwnerPesanan() {
    if (!isOwner() && !isAdmin()) return;
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const tbody = document.getElementById('owner-pesanan-list');
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:20px;">Belum ada pesanan masuk.</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(p => `
        <tr>
            <td>${p.user}</td>
            <td>${p.platform}</td>
            <td>${p.layanan}</td>
            <td>${p.jumlah}</td>
            <td><a href="${p.link}" target="_blank" style="color:var(--gold);">Link</a></td>
            <td>${p.buktiTf ? `<a href="${p.buktiTf}" target="_blank" style="color:var(--gold);">Lihat</a>` : '-'}</td>
            <td class="status-${p.status}">${p.status}</td>
            <td>
                ${p.status === 'pending' ? `
                    <button class="btn btn-green" style="padding:5px 8px;font-size:.8rem;width:auto;margin:2px;" onclick="ubahStatus(${p.id},'accept')">✓</button>
                    <button class="btn btn-red" style="padding:5px 8px;font-size:.8rem;width:auto;margin:2px;" onclick="ubahStatus(${p.id},'decline')">✗</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
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

// ========== FITUR CHAT — DAFTAR USER YANG CHAT ==========
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
        box.innerHTML = '<div class="chat-bubble system">Belum ada pesanan dari user ini.</div>';
        return;
    }
    
    box.innerHTML = chatData.map(c => {
        if (c.pengirim === username) {
            return `<div class="chat-bubble user">${c.pesan}</div>`;
        } else {
            return `<div class="chat-bubble owner">${c.pesan}</div>`;
        }
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function kirimBalasanOwner() {
    if (!selectedChatUser) return alert('Pilih user dulu!');
    const input = document.getElementById('owner-chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    
    const chatKey = 'chat_' + selectedChatUser;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
    chatData.push({ pengirim: 'owner', pesan, waktu: new Date().toLocaleString('id-ID') });
    localStorage.setItem(chatKey, JSON.stringify(chatData));
    
    const box = document.getElementById('owner-chat-box');
    box.innerHTML += `<div class="chat-bubble owner">${pesan}</div>`;
    box.scrollTop = box.scrollHeight;
    input.value = '';
}

// ========== CHAT UNTUK USER ==========
function loadUserChat() {
    if (!currentUser || isOwner() || isAdmin()) return;
    const chatKey = 'chat_' + currentUser.username;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
    const box = document.getElementById('chat-box');
    
    if (chatData.length === 0) {
        box.innerHTML = '<div class="chat-bubble system">Selamat datang di CS! Silakan tanya apa saja.</div>';
        return;
    }
    
    box.innerHTML = chatData.map(c => {
        if (c.pengirim === currentUser.username) {
            return `<div class="chat-bubble user">${c.pesan}</div>`;
        } else {
            return `<div class="chat-bubble owner">${c.pesan}</div>`;
        }
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function kirimChat() {
    if (!currentUser || isOwner() || isAdmin()) return;
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    
    const chatKey = 'chat_' + currentUser.username;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
    chatData.push({ pengirim: currentUser.username, pesan, waktu: new Date().toLocaleString('id-ID') });
    localStorage.setItem(chatKey, JSON.stringify(chatData));
    
    const box = document.getElementById('chat-box');
    box.innerHTML += `<div class="chat-bubble user">${pesan}</div>`;
    box.scrollTop = box.scrollHeight;
    input.value = '';
}

// ========== TAMBAH ADMIN ==========
function tambahAdmin() {
    if (!isOwner()) return alert('Hanya owner yang bisa menambah admin!');
    const user = document.getElementById('new-admin-user').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    
    if (!user || !pass) return alert('Isi username & password!');
    if (user === CONFIG.ownerUsername) return alert('Tidak bisa pakai username owner!');
    
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.some(a => a.username === user)) return alert('Admin sudah ada!');
    
    admins.push({ username: user, password: pass, tanggal: new Date().toLocaleString('id-ID') });
    localStorage.setItem('admins', JSON.stringify(admins));
    alert('Admin berhasil ditambahkan!');
    document.getElementById('new-admin-user').value = '';
    document.getElementById('new-admin-pass').value = '';
    loadAdminList();
}

function loadAdminList() {
    if (!isOwner()) return;
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const tbody = document.getElementById('admin-list-body');
    
    if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Belum ada admin.</td></tr>';
        return;
    }
    
    tbody.innerHTML = admins.map((a, i) => `
        <tr>
            <td>${a.username}</td>
            <td>${a.tanggal}</td>
            <td><button class="btn btn-red" style="padding:5px 10px;width:auto;" onclick="hapusAdmin('${a.username}')">Hapus</button></td>
        </tr>
    `).join('');
}

function hapusAdmin(username) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;
    let admins = JSON.parse(localStorage.getItem('admins') || '[]');
    admins = admins.filter(a => a.username !== username);
    localStorage.setItem('admins', JSON.stringify(admins));
    loadAdminList();
}

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNav();
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
});
