
let currentUser = null, selectedPlatform = null, currentOrder = null;
let currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
let currentBooster = { platform: '', layanan: '', jumlah: '', harga: 0 };

function formatHarga(angka) { return 'Rp ' + angka.toLocaleString('id-ID'); }
function isOwner() { return currentUser?.username === CONFIG.ownerUsername; }
function isAdmin() { const a = DB.ambil(CONFIG.DB_KEYS.ADMINS, []); return isOwner() || a.some(x => x.username === currentUser?.username); }

// === LOGIN & REGISTER ===
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
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
        return alert('Username/password salah!');
    }
    DB.simpan(CONFIG.DB_KEYS.CURRENT_USER, currentUser);
    closeAuthModal();
    updateNav(); loadPesanan();
    alert('✅ Login berhasil!');
}
function register() {
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    if (!usn || !pw) return alert('Lengkapi data!');
    const users = DB.ambil(CONFIG.DB_KEYS.USERS, {});
    if (users[usn]) return alert('Username sudah ada!');
    users[usn] = { username: usn, password: pw, tanggal: new Date().toLocaleString('id-ID') };
    DB.simpan(CONFIG.DB_KEYS.USERS, users);
    alert('✅ Daftar berhasil! Silakan login.');
    showLogin();
}
function logout() {
    if (!confirm('Keluar?')) return;
    currentUser = null;
    DB.hapus(CONFIG.DB_KEYS.CURRENT_USER);
    location.reload();
}
function updateNav() {
    document.getElementById('tab-owner').classList.toggle('hidden', !(isOwner() || isAdmin()));
    document.getElementById('tab-admin').classList.toggle('hidden', !isOwner());
}

// === NAVIGASI HALAMAN ===
function showPage(page) {
    if (!currentUser && page !== 'beranda') return;
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
        loadOwnerPesanan(); loadChatUserList();
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

// === BOOSTER ===
function selectPlatform(plat) {
    selectedPlatform = plat;
    currentBooster.platform = plat;
    document.getElementById('booster-form').classList.remove('hidden');
    document.getElementById('sum-platform').textContent = plat;
    const layananSelect = document.getElementById('form-layanan');
    layananSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    Object.keys(CONFIG.hargaData[plat]).forEach(lay=>{
        layananSelect.innerHTML += `<option value="${lay}">${lay}</option>`;
    });
}
function updateJumlahBooster() {
    const lay = document.getElementById('form-layanan').value;
    currentBooster.layanan = lay;
    document.getElementById('sum-layanan').textContent = lay;
    const jumSelect = document.getElementById('form-jumlah');
    jumSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (lay && CONFIG.hargaData[selectedPlatform]?.[lay]) {
        Object.entries(CONFIG.hargaData[selectedPlatform][lay]).forEach(([jum, hrg])=>{
            jumSelect.innerHTML += `<option value="${jum}" data-harga="${hrg}">${jum} — ${formatHarga(hrg)}</option>`;
        });
    }
}
function updateHargaBooster() {
    const opt = document.getElementById('form-jumlah').selectedOptions[0];
    if (opt && opt.dataset.harga) {
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

// === NOMOR ===
function resetNomorForm() {
    currentNomor = { negara: '', layanan: '', jumlah: '', harga: 0 };
    document.getElementById('nomor-negara').value = '';
    document.getElementById('nomor-layanan').innerHTML = '<option value="">-- Pilih Layanan Dulu --</option>';
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
        Object.keys(CONFIG.nomorData[neg]).forEach(lay=>{
            laySelect.innerHTML += `<option value="${lay}">${lay}</option>`;
        });
    }
    document.getElementById('nomor-sum-layanan').textContent = '-';
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
}
function updateNomorJumlah() {
    const neg = document.getElementById('nomor-negara').value;
    const lay = document.getElementById('nomor-layanan').value;
    currentNomor.layanan = lay;
    document.getElementById('nomor-sum-layanan').textContent = lay;
    const jumSelect = document.getElementById('nomor-jumlah');
    jumSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if (neg && lay && CONFIG.nomorData[neg]?.[lay]) {
        Object.entries(CONFIG.nomorData[neg][lay]).forEach(([jum, hrg])=>{
            jumSelect.innerHTML += `<option value="${jum}" data-harga="${hrg}">${jum} — ${formatHarga(hrg)}</option>`;
        });
    }
    document.getElementById('nomor-sum-jumlah').textContent = '-';
    document.getElementById('nomor-sum-harga').textContent = 'Rp 0';
}
function updateNomorHarga() {
    const opt = document.getElementById('nomor-jumlah').selectedOptions[0];
    if (opt && opt.dataset.harga) {
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

// === PEMBAYARAN ===
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
    if (currentOrder.type === 'nomor') showPage('nomor');
    else showPage('booster');
}
function previewBukti() {
    const file = document.getElementById('bukti-tf').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.getElementById('bukti-preview');
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}
function kirimPesanan() {
    if (!document.getElementById('bukti-preview').src) return alert('Upload bukti transfer dulu!');
    const pesanan = {
        id: Date.now(),
        user: currentUser.username,
        ...currentOrder,
        bukti: document.getElementById('bukti-preview').src,
        status: 'pending',
        waktu: new Date().toLocaleString('id-ID')
    };
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    list.push(pesanan);
    DB.simpan(CONFIG.DB_KEYS.PESANAN, list);
    alert('✅ Pesanan berhasil dikirim! Menunggu konfirmasi pembayaran.');
    document.getElementById('payment-form').classList.add('hidden');
    document.getElementById('bukti-preview').src = '';
    document.getElementById('bukti-preview').style.display = 'none';
    currentOrder = null;
    showPage('beranda');
}

// === RIWAYAT PESANAN ===
function loadPesanan() {
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []).filter(p=>p.user === currentUser?.username);
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

// === CHAT ===
function kirimChat() {
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if (!pesan) return;
    const key = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chat = DB.ambil(key, []);
    chat.push({ dari: currentUser.username, pesan, waktu: new Date().toLocaleString('id-ID'), isUser: true });
    DB.simpan(key, chat);
    input.value = '';
    loadUserChat();
}
function loadUserChat() {
    const key = CONFIG.DB_KEYS.CHAT_PREFIX + currentUser.username;
    const chat = DB.ambil(key, []);
    const box = document.getElementById('chat-box');
    box.innerHTML = '<div class="chat-bubble system">Selamat datang! Silakan tanya 😊</div>' + chat.map(c=>`
        <div style="margin:8px 0;padding:10px;border-radius:12px;max-width:85%;${c.isUser?'background:var(--gold);color:#000;margin-left:auto;':'background:#333;margin-right:auto;'}">
            <div style="font-size:11px;opacity:.7;margin-bottom:4px;">${c.waktu}</div>
            <div>${c.pesan}</div>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}
function loadChatUserList() {
    const users = DB.ambil(CONFIG.DB_KEYS.USERS, {});
    const list = document.getElementById('chat-user-list');
    list.innerHTML = Object.keys(users).map(u=>`<button class="btn" style="width:auto;margin:5px;padding:8px 12px;" onclick="pilihUserChat('${u}')">${u}</button>`).join('') || '<p style="color:var(--muted);">Belum ada user.</p>';
}
function pilihUserChat(username) {
    selectedPlatform = username;
    document.getElementById('selected-chat-area').classList.remove('hidden');
    document.getElementById('selected-chat-user').textContent = username;
    const key = CONFIG.DB_KEYS.CHAT_PREFIX + username;
    const chat = DB.ambil(key, []);
    const box = document.getElementById('owner-chat-box');
    box.innerHTML = chat.map(c=>`
        <div style="margin:8px 0;padding:10px;border-radius:12px;max-width:85%;${c.isUser?'background:#333;margin-right:auto;':'background:var(--gold);color:#000;margin-left:auto;'}">
            <div style="font-size:11px;opacity:.7;margin-bottom:4px;">${c.waktu}</div>
            <div>${c.pesan}</div>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}
function kirimBalasanOwner() {
    const input = document.getElementById('owner-chat-input');
    const pesan = input.value.trim();
    if (!pesan || !selectedPlatform) return;
    const key = CONFIG.DB_KEYS.CHAT_PREFIX + selectedPlatform;
    const chat = DB.ambil(key, []);
    chat.push({ dari: 'owner', pesan, waktu: new Date().toLocaleString('id-ID'), isUser: false });
    DB.simpan(key, chat);
    input.value = '';
    pilihUserChat(selectedPlatform);
}

// === OWNER & ADMIN ===
function loadOwnerPesanan() {
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    const tbody = document.getElementById('owner-pesanan-list');
    tbody.innerHTML = list.length ? list.map(p=>`
        <tr>
            <td>${p.user}</td>
            <td>${p.type}</td>
            <td>${p.platform || p.layanan}</td>
            <td>${formatHarga(p.harga)}</td>
            <td><select onchange="ubahStatus(${p.id}, this.value)">
                <option value="pending" ${p.status==='pending'?'selected':''}>Pending</option>
                <option value="proses" ${p.status==='proses'?'selected':''}>Diproses</option>
                <option value="selesai" ${p.status==='selesai'?'selected':''}>Selesai</option>
            </select></td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Belum ada pesanan.</td></tr>';
}
function ubahStatus(id, status) {
    const list = DB.ambil(CONFIG.DB_KEYS.PESANAN, []);
    const idx = list.findIndex(p=>p.id === id);
    if (idx > -1) { list[idx].status = status; DB.simpan(CONFIG.DB_KEYS.PESANAN, list); }
    loadOwnerPesanan();
}
function tambahAdmin() {
    const user = document.getElementById('new-admin-user').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    if (!user || !pass) return alert('Lengkapi data!');
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    if (admins.some(a=>a.username === user)) return alert('Admin sudah ada!');
    admins.push({ username: user, password: pass, tanggal: new Date().toLocaleString('id-ID') });
    DB.simpan(CONFIG.DB_KEYS.ADMINS, admins);
    alert('✅ Admin ditambahkan!');
    document.getElementById('new-admin-user').value = '';
    document.getElementById('new-admin-pass').value = '';
    loadAdminList();
}
function loadAdminList() {
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    const tbody = document.getElementById('admin-list-body');
    tbody.innerHTML = admins.length ? admins.map((a,i)=>`
        <tr>
            <td>${a.username}</td>
            <td>${a.tanggal}</td>
            <td><button class="btn" style="padding:5px 10px;margin:0;background:var(--danger);" onclick="hapusAdmin(${i})">Hapus</button></td>
        </tr>
    `).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--muted);">Belum ada admin.</td></tr>';
}
function hapusAdmin(idx) {
    if (!confirm('Hapus admin ini?')) return;
    const admins = DB.ambil(CONFIG.DB_KEYS.ADMINS, []);
    admins.splice(idx, 1);
    DB.simpan(CONFIG.DB_KEYS.ADMINS, admins);
    loadAdminList();
}

// === CEK LOGIN OTOMATIS & STATUS API ===
document.addEventListener('DOMContentLoaded', function() {
    const saved = DB.ambil(CONFIG.DB_KEYS.CURRENT_USER);
    if (saved) {
        currentUser = saved;
        closeAuthModal();
        updateNav();
        loadPesanan();
    }
    // Cek Status API
    fetch(CONFIG.API.BASE_URL + '/api/pricelist?apikey=' + CONFIG.API.API_KEY)
        .then(()=>{
            const s = document.getElementById('api-status');
            if(s) { s.textContent = '✅ Server Online — Terhubung ke Simuru'; s.style.color = '#2ecc71'; }
        })
        .catch(()=>{
            const s = document.getElementById('api-status');
            if(s) { s.textContent = '⚠️ Mode Offline — Tersimpan Lokal'; s.style.color = '#f39c12'; }
        });
});
