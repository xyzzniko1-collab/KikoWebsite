// KONFIGURASI UTAMA
const CONFIG = {
    // AKUN OWNER
    ownerUsername: 'owner',
    ownerPassword: 'owner123',

    // REKENING PEMBAYARAN
    bankName: 'Seabank',
    bankNumber: '901369767087',
    bankOwner: 'S Y',

    // CATATAN PESANAN
    noteAccTime: 'Minimal proses acc adalah 2–5 jam. Jika belum aktif, silakan chat WhatsApp.',

    // HARGA LAYANAN
    hargaData: {
        Instagram: {
            Followers: { '1.000': 24000, '2.000': 49000, '3.000': 67000 },
            Likes: { '1.000': 10000, '2.000': 19000, '3.000': 38000 }
        },
        TikTok: {
            Followers: { '1.000': 49000, '2.000': 80000, '3.000': 130000 },
            Likes: { '1.000': 10000, '2.000': 19000, '3.000': 38000 }
        },
        Facebook: {
            Followers: { '1.000': 25000, '2.000': 48000, '3.000': 70000 },
            'Likes/Reaksi': { '1.000': 12000, '2.000': 22000, '3.000': 40000 }
        },
        YouTube: {
            Subscribers: { '1.000': 85000, '2.000': 160000, '3.000': 230000 },
            Likes: { '1.000': 25000, '2.000': 45000, '3.000': 80000 },
            Views: { '1.000': 15000, '5.000': 65000, '10.000': 120000 }
        },
        'Twitter/X': {
            Followers: { '1.000': 30000, '2.000': 55000, '3.000': 80000 },
            Likes: { '1.000': 12000, '2.000': 23000, '3.000': 42000 }
        },
        Twitch: {
            Views: { '1.000': 35000, '5.000': 150000, '10.000': 280000 }
        },
        Telegram: {
            'Member/Grup': { '1.000': 35000, '2.000': 65000, '3.000': 95000 }
        }
    }
};
