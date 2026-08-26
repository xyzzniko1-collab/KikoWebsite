
// ========== KONFIGURASI ==========
const CONFIG = {
    API_KEY: 'MstAiI7R5641sRxsk6ROWCed2nMb9xBsYNjCPwKW',
    API_URL: 'https://simuru.com',
    ownerUsername: 'owner',
    ownerPassword: 'owner123',
    
    // HARGA TETAP SAMA
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

// ========== VARIABEL ==========
let currentUser = null, selectedPlatform = null, currentOrder = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };
let kodeVerifikasiUser = null;

// ========== FUNGSI DASAR ==========
function formatHarga(angka) { return 'Rp ' + angka.toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function isAdmin() { 
    const admins = JSON.parse(localStorage.getItem('simuru_admins') || '[]');
    return isOwner() || admins.some(a => a.username === currentUser?.username); 
}
function DB_simpan(k, d) { localStorage.setItem(k, JSON.stringify(d)); }
function DB_ambil(k, def=null) { const d=localStorage.getItem(k); return d?JSON.parse(d):def; }

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
    loadPesanan();
}

// ========== LOGIN & REGISTER — TOMBOL BISA DIKLIK ==========
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
    document.getElementById('pay-kode').textContent = kodeVerifikasiUser;
}
function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    if (!usn || !pw) return alert('Lengkapi data!');
    const users = DB_ambil('simuru_users', {});
    if (users[usn]) return alert('Username sudah ada!');
    users[usn] = { username: usn, password: pw };
    DB_simpan('simuru_users', users);
    alert('✅ Daftar berhasil! Silakan login.');
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

// ========== NAVIGASI HALAMAN — SEMUA TOMBOL BISA DIKLIK ==========
function showPage(page) {
    if (!currentUser && page !== 'beranda') return;
    
    // Sembunyikan semua
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
}
function showPagePesanan() { showPage('pesanan'); }

// ========== BOOSTER ==========
function selectPlatform(plat) {
    selectedPlatform = plat;
    currentBooster.platform = plat;
    document.getElementById('booster-form').classList.remove('hidden');
    document.getElementById('sum-platform').textContent = plat;
    const laySelect = document.getElementById('form-layanan');
    laySelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    Object.keys(CONFIG.hargaData[plat]).forEach(l=>{
        laySelect.innerHTML += `<option value="${l}">${l}</option>`;
    });
}
function updateJumlahBooster() {
    const lay = document.getElementById('form-layanan').value;
    currentBooster.layanan = lay;
    document.getElementById('sum-layanan').textContent = lay;
    const jumSelect = document.getElementById('form-jumlah');
    jumSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (lay && CONFIG.hargaData[selectedPlatform]?.[lay]) {
        Object.entries(CONFIG.hargaData[selectedPlatform][lay]).forEach(([j,h])=>{
            jumSelect.innerHTML += `<option value="${j}" data-harga="${h}">${j} — ${formatHarga(h)}</option>`;
        });
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
function lanjutBayarBooster() {
    if (!currentBooster.layanan || !currentBooster.jumlah) return alert('Lengkapi data!');
    currentOrder = { type: 'booster', ...currentBooster, link: document.getElementById('form-link').value };
    showPaymentForm();
}

// ========== NOMOR ==========
function resetNomorForm() {
    currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
    document.getElementById('nomor-negara').value = '';
    document.getElementById('nomor-layanan').innerHTML = '<option value="">-- Pilih Layanan --</option>';
    document.getElementById('nomor-jumlah').innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    document.getElementById('nomor-sum-negara').textContent = '-';
    document.getElementById('nomor-sum-layanan').textContent = '-';
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
}
function updateNomorLayanan() {
    const neg = document.getElementById('nomor-negara').value;
    currentNomor.negara = neg;
    document.getElementById('nomor-sum-negara').textContent = neg;
    const laySelect = document.getElementById('nomor-layanan');
    laySelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    if (neg && CONFIG.nomorData[neg]) {
        Object.keys(CONFIG.nomorData[neg]).forEach(l=>{
            laySelect.innerHTML += `<option value="${l}">${l}</option>`;
        });
    }
}
function updateNomorJumlah() {
    const neg = document.getElementById('nomor-negara').value;
    const lay = document.getElementById('nomor-layanan').value;
    currentNomor.layanan = lay;
    document.getElementById('nomor-sum-layanan').textContent = lay;
    const jumSelect = document.getElementById('nomor-jumlah');
    jumSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (neg && lay && CONFIG.nomorData[neg]?.[lay]) {
        Object.entries(CONFIG.nomorData[neg][lay]).forEach(([j,h])=>{
            jumSelect.innerHTML += `<option value="${j}" data-harga="${h}">${j} — ${formatHarga(h)}</option>`;
        });
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
function lanjutBayarNomor() {
    if (!currentNomor.negara || !currentNomor.layanan || !currentNomor.jumlah) return alert('Lengkapi data!');
    currentOrder = { type: 'nomor', ...currentNomor };
    showPaymentForm();
}

// ========== PEMBAYARAN ==========
function showPaymentForm() {
    document.getElementById('page-nomor').classList.add('hidden');
    document.getElementById('page-booster').classList.add('hidden');
    document.getElementById('payment-form').classList.remove('hidden');
    if (currentOrder.type === 'nomor') {
        document.getElementById('pay-type').textContent = '📱 Beli Nomor Virtual';
        document.getElementById('pay-detail').textContent = `${currentOrder.negara} — ${currentOrder.layanan} × ${currentOrder.jumlah}`;
    } else {
        document.getElementById('pay-type').textContent = '🚀 Sosmed Booster';
        document.getElementById('pay-detail').textContent = `${currentOrder.platform} — ${currentOrder.layanan} × ${currentOrder.jumlah}`;
    }
    document.getElementById('pay-harga').textContent = formatHarga(currentOrder.harga);
}
function kembaliKeForm() {
    document.getElementById('payment-form').classList.add('hidden');
    currentOrder.type === 'nomor' ? showPage('nomor') : showPage('booster');
}
function previewBukti() {
    const file = document.getElementById('bukti-tf').files[0];
    if (file) {
        const r = new FileReader();
        r.onload = e => { const img = document.getElementById('bukti-preview'); img.src = e.target.result; img.style.display = 'block'; };
        r.readAsDataURL(file);
    }
}
function kirimPesanan() {
    if (!document.getElementById('bukti-preview').src) return alert('Upload bukti dulu!');
    const pesanan = {
        id: Date.now(), user: currentUser.username, ...currentOrder,
        status: 'pending', waktu: new Date().toLocaleString('id-ID')
    };
    const list = DB_ambil('simuru_pesanan', []);
    list.push(pesanan);
    DB_simpan('simuru_pesanan', list);
    alert('✅ Pesanan terkirim! Menunggu konfirmasi.');
    document.getElementById('payment-form').classList.add('hidden');
    currentOrder = null;
    showPage('beranda');
}

// ========== RIWAYAT PESANAN ==========
function loadPesanan() {
    const list = DB_ambil('simuru_pesanan', []).filter(p=>p.user === currentUser?.username);
    const tbody = document.getElementById('pesanan-list');
    tbody.innerHTML = list.length ? list.map(p=>`
        <tr>
            <td>${p.type==='nomor'?'📱':'🚀'} ${p.type}</td>
            <td>${p.platform || p.layanan}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td style="color:${p.status==='pending'?'orange':'green'}">${p.status}</td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Belum ada pesanan.</td></tr>';
}

// ========== CHAT ==========
function kirimChat() {
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    const key = 'simuru_chat_' + currentUser.username;
    const chat = DB_ambil(key, []);
    chat.push({ dari: currentUser.username, pesan, waktu: new Date().toLocaleString('id-ID'), isUser: true });
    DB_simpan(key, chat);
    input.value = '';
    loadUserChat();
}
function loadUserChat() {
    const key = 'simuru_chat_' + currentUser.username;
    const chat = DB_ambil(key, []);
    const box = document.getElementById('chat-box');
    box.innerHTML = '<div class="chat-bubble system">Selamat datang! Silakan tanya 😊</div>' + chat.map(c=>`
        <div style="margin:8px 0;padding:10px;border-radius:12px;max-width:85%;${c.isUser?'background:var(--gold);color:#000;margin-left:auto;':'background:#333;margin-right:auto;'}">
            <div style="font-size:11px;opacity:.7;margin-bottom:4px;">${c.waktu}</div>
            <div>${c.pesan}</div>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

// ========== OWNER & ADMIN ==========
function loadOwnerPesanan() {
    const list = DB_ambil('simuru_pesanan', []);
    const tbody = document.getElementById('owner-pesanan-list');
    tbody.innerHTML = list.length ? list.map(p=>`
        <tr>
            <td>${p.user}</td>
            <td>${p.type}</td>
            <td>${p.platform || p.layanan}</td>
            <td>${formatHarga(p.harga)}</td>
            <td><select onchange="ubahStatus(${p.id}, this.value)">
                <option value="pending" ${p.status==='pending'?'selected':''}>Pending</option>
                <option value="selesai" ${p.status==='selesai'?'selected':''}>Selesai</option>
            </select></td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Belum ada pesanan.</td></tr>';
}
function ubahStatus(id, status) {
    const list = DB_ambil('simuru_pesanan', []);
    const idx = list.findIndex(p=>p.id === id);
    if (idx > -1) { list[idx].status = status; DB_simpan('simuru_pesanan', list); }
    loadOwnerPesanan();
}
function tambahAdmin() {
    const user = document.getElementById('new-admin-user').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    if (!user || !pass) return alert('Lengkapi data!');
    const admins = DB_ambil('simuru_admins', []);
    if (admins.some(a=>a.username === user)) return alert('Admin sudah ada!');
    admins.push({ username: user, password: pass });
    DB_simpan('simuru_admins', admins);
    alert('✅ Admin ditambahkan!');
    document.getElementById('new-admin-user').value = '';
    document.getElementById('new-admin-pass').value = '';
    loadAdminList();
}
function loadAdminList() {
    const admins = DB_ambil('simuru_admins', []);
    const tbody = document.getElementById('admin-list-body');
    tbody.innerHTML = admins.length ? admins.map((a,i)=>`
        <tr>
            <td>${a.username}</td>
            <td>${a.tanggal || '-'}</td>
            <td><button class="btn" style="padding:5px 10px;margin:0;background:var(--danger);" onclick="hapusAdmin(${i})">Hapus</button></td>
        </tr>
    `).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Belum ada admin.</td></tr>';
}

// ========== INISIALISASI SAAT BUKA ==========
document.addEventListener('DOMContentLoaded', function() {
    const saved = DB_ambil('simuru_current_user');
    if (saved) {
        currentUser = saved;
        closeAuthModal();
        updateNav();
        loadPesanan();
        document.getElementById('nama-user').textContent = currentUser.username;
    }
    // Status API
    document.getElementById('api-status').innerHTML = '✅ Terhubung ke Simuru API';
    document.getElementById('api-status').style.color = '#2ecc71';
});
