// FITUR KONTAK & WHATSAPP
const WA_NUMBER = '6281234567890'; // Ganti nomor WA kamu

function openWA(pesan = ''){
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
}

// Bisa dipakai di tombol "Chat WA" di halaman
