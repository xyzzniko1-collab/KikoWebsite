let currentUser = null;
let selectedChatUser = null;

// ============== TOGGLE INFO & KETENTUAN ==============
function toggleInfo(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.textContent = '▲';
    } else {
        el.classList.add('hidden');
        icon.textContent = '▼';
    }
}

// ============== AUTH ==============
function openAuthModal(){ document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal(){ document.getElementById('auth-modal').classList.add('hidden'); }
function showRegister(){
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Daftar Akun';
}
function showLogin(){
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('auth-title').textContent = 'Login Akun';
}

function login(){
    const usn = document.getElementById('login-usn').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    if(!usn || !pw){ alert('Username dan password harus diisi!'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if(usn === CONFIG.ownerUsername && pw === CONFIG.ownerPassword){
        currentUser = {username: usn, isOwner: true};
    } else if(users[usn] && users[usn].password === pw){
        currentUser = users[usn];
    } else {
        alert('Username atau password salah!'); return;
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeAuthModal(); updateNav(); loadPesanan(); loadOwnerData(); loadChat();
}

function register(){
    const usn = document.getElementById('reg-usn').value.trim();
    const pw = document.getElementById('reg-pw').value.trim();
    const bank = document.getElementById('reg-bank').value;
    const noRek = document.getElementById('reg-no-rek').value.trim();
    if(!usn || !pw || !bank || !noRek){ alert('Semua field harus diisi!'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if(users[usn]){ alert('Username sudah terdaftar!'); return; }
    users[usn] = {username: usn, password: pw, bank: bank, noRek: noRek, isOwner: false};
    localStorage.setItem('users', JSON.stringify(users));
    alert('Daftar berhasil! Silakan login.'); showLogin();
}

function logout(){
    currentUser = null; localStorage.removeItem('currentUser'); updateNav(); openAuthModal();
}

function updateNav(){
    const tabOwner = document.getElementById('tab-owner');
    if(currentUser && currentUser.isOwner) tabOwner.classList.remove('hidden');
    else tabOwner.classList.add('hidden');
}

// ============== NAVIGASI HALAMAN ==============
function showPage(page){
    if(!currentUser){ openAuthModal(); return; }
    document.getElementById('page-pesan').classList.add('hidden');
    document.getElementById('page-pesanan').classList.add('hidden');
    document.getElementById('page-chat').classList.add('hidden');
    document.getElementById('page-owner').classList.add('hidden');
    
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.classList.add('inactive'); });

    if(page === 'pesan'){
        document.getElementById('page-pesan').classList.remove('hidden');
        document.getElementById('tab-pesan').classList.add('active');
        document.getElementById('tab-pesan').classList.remove('inactive');
    }
    if(page === 'pesanan'){
        document.getElementById('page-pesanan').classList.remove('hidden');
        document.getElementById('tab-pesanan').classList.add('active');
        document.getElementById('tab-pesanan').classList.remove('inactive');
    }
    if(page === 'chat'){
        document.getElementById('page-chat').classList.remove('hidden');
        document.getElementById('tab-chat').classList.add('active');
        document.getElementById('tab-chat').classList.remove('inactive');
        loadChat();
    }
    if(page === 'owner' && currentUser.isOwner){
        document.getElementById('page-owner').classList.remove('hidden');
        document.getElementById('tab-owner').classList.add('active');
        document.getElementById('tab-owner').classList.remove('inactive');
        loadOwnerChatList();
    }
}

// ============== PILIH PLATFORM & HITUNG HARGA ==============
function selectPlatform(platform){
    if(!currentUser){ openAuthModal(); return; }
    document.getElementById('form-platform').value = platform;
    document.getElementById('order-form').classList.remove('hidden');
    document.getElementById('payment-form').classList.add('hidden');
    const layananSelect = document.getElementById('form-layanan');
    const jumlahSelect = document.getElementById('form-jumlah');
    layananSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>';
    jumlahSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    for(const layanan in CONFIG.hargaData[platform]){
        layananSelect.innerHTML += `<option value="${layanan}">${layanan}</option>`;
    }
    document.getElementById('sum-platform').textContent = platform;
}

function openWA(){
    window.open('https://wa.me/6281234567890', '_blank');
}

document.getElementById('form-layanan')?.addEventListener('change', function(){
    const platform = document.getElementById('form-platform').value;
    const layanan = this.value;
    const jumlahSelect = document.getElementById('form-jumlah');
    jumlahSelect.innerHTML = '<option value="">-- Pilih Jumlah --</option>';
    if(layanan && CONFIG.hargaData[platform][layanan]){
        for(const jumlah in CONFIG.hargaData[platform][layanan]){
            jumlahSelect.innerHTML += `<option value="${jumlah}">${jumlah}</option>`;
        }
    }
    document.getElementById('sum-layanan').textContent = layanan || '-';
    hitungHarga();
});

document.getElementById('form-jumlah')?.addEventListener('change', hitungHarga);

function hitungHarga(){
    const platform = document.getElementById('form-platform').value;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    document.getElementById('sum-jumlah').textContent = jumlah || '-';
    if(platform && layanan && jumlah){
        const harga = CONFIG.hargaData[platform][layanan][jumlah];
        document.getElementById('sum-harga').textContent = formatHarga(harga);
    } else {
        document.getElementById('sum-harga').textContent = formatHarga(0);
    }
}

// ============== PEMBAYARAN ==============
function lanjutBayar(){
    const platform = document.getElementById('form-platform').value;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    const link = document.getElementById('form-link').value.trim();
    if(!platform || !layanan || !jumlah || !link){ alert('Semua field harus diisi!'); return; }
    document.getElementById('pay-platform').textContent = platform;
    document.getElementById('pay-layanan').textContent = layanan;
    document.getElementById('pay-jumlah').textContent = jumlah;
    const harga = CONFIG.hargaData[platform][layanan][jumlah];
    document.getElementById('pay-harga').textContent = formatHarga(harga);
    document.getElementById('payment-form').classList.remove('hidden');
}

function kembaliKeForm(){ document.getElementById('payment-form').classList.add('hidden'); }

function previewBukti(){
    const file = document.getElementById('bukti-tf').files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            document.getElementById('bukti-preview').src = e.target.result;
            document.getElementById('bukti-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function kirimPesanan(){
    const platform = document.getElementById('form-platform').value;
    const layanan = document.getElementById('form-layanan').value;
    const jumlah = document.getElementById('form-jumlah').value;
    const link = document.getElementById('form-link').value.trim();
    const buktiTf = document.getElementById('bukti-preview').src;
    if(!buktiTf){ alert('Upload bukti transfer terlebih dahulu!'); return; }
    const harga = CONFIG.hargaData[platform][layanan][jumlah];
    const pesanan = {
        id: Date.now(),
        user: currentUser.username,
        platform, layanan, jumlah, link, harga,
        buktiTf,
        status: 'pending',
        waktu: new Date().toLocaleString('id-ID')
    };
    const pesananList = JSON.parse(localStorage.getItem('pesanan') || '[]');
    pesananList.push(pesanan);
    localStorage.setItem('pesanan', JSON.stringify(pesananList));
    alert('Pesanan berhasil dikirim! Menunggu konfirmasi owner.');
    document.getElementById('order-form').classList.add('hidden');
    document.getElementById('payment-form').classList.add('hidden');
    loadPesanan();
}

// ============== LOAD PESANAN ==============
function loadPesanan(){
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const tbody = document.getElementById('pesanan-list');
    if(!currentUser) return;
    const userPesanan = list.filter(p => p.user === currentUser.username || currentUser.isOwner);
    if(userPesanan.length === 0){
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">Belum ada pesanan.</td></tr>';
        return;
    }
    tbody.innerHTML = userPesanan.map(p => {
        const statusClass = p.status === 'accept' ? 'accept' : p.status === 'decline' ? 'decline' : 'pending';
        const statusText = p.status === 'accept' ? '✅ Accept' : p.status === 'decline' ? '❌ Decline' : '⏳ Menunggu';
        return `<tr>
            <td>${p.platform}</td>
            <td>${p.layanan}</td>
            <td>${p.jumlah}</td>
            <td>${formatHarga(p.harga)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
        </tr>`;
    }).join('');
}

// ============== CHAT CS PRIVAT ==============
function loadChat(){
    if(!currentUser) return;
    const chatKey = 'chat_' + currentUser.username;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[{"pengirim":"system","pesan":"Selamat datang di CS! Silakan tanya apa saja. Hanya Anda & Owner yang bisa lihat chat ini.","waktu":new Date().toLocaleString('id-ID')}]');
    const box = document.getElementById('chat-box');
    box.innerHTML = chatData.map(c => {
        if(c.pengirim === 'system') return `<div class="chat-bubble system">${c.pesan}</div>`;
        if(c.pengirim === currentUser.username) return `<div class="chat-bubble user">${c.pesan}</div>`;
        return `<div class="chat-bubble owner">${c.pesan}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function kirimChat(){
    const input = document.getElementById('chat-input');
    const pesan = input.value.trim();
    if(!pesan || !currentUser) return;
    const chatKey = 'chat_' + currentUser.username;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
    chatData.push({pengirim: currentUser.username, pesan, waktu: new Date().toLocaleString('id-ID')});
    localStorage.setItem(chatKey, JSON.stringify(chatData));
    input.value = '';
    loadChat();
}

// ============== OWNER PANEL ==============
function loadOwnerData(){
    if(!currentUser || !currentUser.isOwner) return;
    loadOwnerChatList();
    loadOwnerPesanan();
}

function loadOwnerChatList(){
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const select = document.getElementById('chat-user-select');
    select.innerHTML = '<option value="">-- Pilih User --</option>';
    for(const u in users){
        if(u !== CONFIG.ownerUsername) select.innerHTML += `<option value="${u}">${u}</option>`;
    }
}

function loadChatOwner(){
    const username = document.getElementById('chat-user-select').value;
    selectedChatUser = username;
    if(!username){
        document.getElementById('owner-chat-box').innerHTML = '<div class="chat-bubble system">Pilih user untuk melihat percakapan.</div>';
        return;
    }
    const chatKey = 'chat_' + username;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[{"pengirim":"system","pesan":"Belum ada pesanan.","waktu":""}]');
    const box = document.getElementById('owner-chat-box');
    box.innerHTML = chatData.map(c => {
        if(c.pengirim === 'system') return `<div class="chat-bubble system">${c.pesan}</div>`;
        if(c.pengirim === username) return `<div class="chat-bubble user">${c.pesan}</div>`;
        return `<div class="chat-bubble owner">${c.pesan}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
}

function balasChat(){
    if(!selectedChatUser) return;
    const input = document.getElementById('owner-chat-input');
    const pesan = input.value.trim();
    if(!pesan) return;
    const chatKey = 'chat_' + selectedChatUser;
    const chatData = JSON.parse(localStorage.getItem(chatKey) || '[]');
    chatData.push({pengirim: 'owner', pesan, waktu: new Date().toLocaleString('id-ID')});
    localStorage.setItem(chatKey, JSON.stringify(chatData));
    input.value = '';
    loadChatOwner();
}

function loadOwnerPesanan(){
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const tbody = document.getElementById('owner-pesanan-list');
    if(list.length === 0){
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);">Belum ada pesanan masuk.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(p => {
        return `<tr>
            <td>${p.user}</td>
            <td>${p.platform}</td>
            <td>${p.layanan}</td>
            <td>${p.jumlah}</td>
            <td><a href="${p.link}" target="_blank" style="color:var(--gold);">Link</a></td>
            <td>${p.buktiTf ? '<a href="'+p.buktiTf+'" target="_blank" style="color:var(--gold);">Lihat</a>' : '-'}</td>
            <td><span class="status ${p.status}">${p.status}</span></td>
            <td>
                ${p.status === 'pending' ? `
                    <button class="btn btn-green" style="padding:5px 10px;font-size:.8rem;" onclick="ubahStatus(${p.id},'accept')">✓</button>
                    <button class="btn btn-red" style="padding:5px 10px;font-size:.8rem;" onclick="ubahStatus(${p.id},'decline')">✗</button>
                ` : ''}
            </td>
        </tr>`;
    }).join('');
}

function ubahStatus(id, status){
    const list = JSON.parse(localStorage.getItem('pesanan') || '[]');
    const idx = list.findIndex(p => p.id === id);
    if(idx !== -1){
        list[idx].status = status;
        localStorage.setItem('pesanan', JSON.stringify(list));
        loadOwnerPesanan();
        loadPesanan();
    }
}

// ============== INISIALISASI ==============
document.addEventListener('DOMContentLoaded', function(){
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser){
        currentUser = JSON.parse(savedUser);
        updateNav();
        loadPesanan();
    } else {
        openAuthModal();
    }
});
