const CONTACT = {
    whatsapp: '6281234567890',
    whatsappLink: 'https://wa.me/6281234567890',
    email: 'support@simuru.com',
    jamOperasional: '09.00 - 21.00 WIB'
};

function bukaWA(pesan = '') {
    const teks = pesan || 'Halo Kak, saya mau tanya tentang layanan SIMURU 🙏';
    window.open(`${CONTACT.whatsappLink}?text=${encodeURIComponent(teks)}`, '_blank');
}
