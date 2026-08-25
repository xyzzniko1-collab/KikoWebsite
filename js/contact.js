// ============== KONTAK & WHATSAPP ==============
// Semua fungsi kontak, WA, dan info tambahan taruh di sini
// Bisa dipanggil dari index.html kapan saja

const CONTACT = {
    whatsapp: '6281234567890', // Ganti nomor WA owner di sini
    whatsappLink: 'https://wa.me/6281234567890',
    email: 'support@simuru.com',
    jamOperasional: '09.00 - 21.00 WIB',
    pesanWA: 'Halo Kak, saya mau tanya tentang layanan SIMURU 🙏'
};

// Buka WhatsApp dengan pesan otomatis
function bukaWA(pesanKustom = '') {
    const pesan = pesanKustom || CONTACT.pesanWA;
    const link = `${CONTACT.whatsappLink}?text=${encodeURIComponent(pesan)}`;
    window.open(link, '_blank');
}

// Buka WA untuk lapor pesanan
function laporPesanan(orderId) {
    const pesan = `Halo Kak, saya mau lapor pesanan.\n\nOrder ID: ${orderId}\nSilakan dicek ya Kak 🙏`;
    bukaWA(pesan);
}

// Tampilkan info kontak
function tampilkanKontak() {
    alert(
        '📞 Kontak Kami:\n' +
        '📱 WhatsApp: ' + CONTACT.whatsapp + '\n' +
        '📧 Email: ' + CONTACT.email + '\n' +
        '⏰ Jam Operasional: ' + CONTACT.jamOperasional
    );
}

// Cek apakah jam operasional
function isJamOperasional() {
    const jam = new Date().getHours();
    return jam >= 9 && jam < 21;
}

// Export untuk dipakai di file lain
if (typeof module !== 'undefined') {
    module.exports = { CONTACT, bukaWA, laporPesanan, tampilkanKontak, isJamOperasional };
}
