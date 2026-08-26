
const CONFIG = {
    // ========== API SIMURU — OTOMATIS TERHUBUNG ==========
    API: {
        BASE_URL: 'https://simuru.com',
        OPENAPI_URL: 'https://simuru.com/openapi.json',
        API_KEY: 'MstAiI7R5641sRxsk6ROWCed2nMb9xBsYNjCPwKW',
        TIMEOUT: 30000
    },

    ownerUsername: 'owner',
    ownerPassword: 'owner123',
    bankName: 'Seabank',
    bankNumber: '901369767087',
    bankOwner: 'S Y',

    // === DATABASE KEYS ===
    DB_KEYS: {
        CURRENT_USER: 'simuru_current_user',
        USERS: 'simuru_users',
        PESANAN: 'simuru_pesanan',
        ADMINS: 'simuru_admins',
        CHAT_PREFIX: 'simuru_chat_',
        VERIFY_CODES: 'simuru_verify_codes',
        KODE_VERIFIKASI_USER: 'simuru_kode_verifikasi_'
    },

    // === HARGA NOMOR — TETAP SAMA TIDAK DIUBAH ===
    nomorData: {
        '+62': {
            WhatsApp: { '1': 15000, '5': 60000, '10': 110000 },
            Telegram: { '1': 12000, '5': 50000, '10': 95000 },
            Google: { '1': 18000, '5': 75000, '10': 140000 },
            Instagram: { '1': 20000, '5': 85000, '10': 160000 }
        },
        '+60': {
            WhatsApp: { '1': 25000, '5': 110000, '10': 200000 },
            Telegram: { '1': 22000, '5': 95000, '10': 175000 },
            Google: { '1': 28000, '5': 120000, '10': 220000 }
        },
        '+65': {
            WhatsApp: { '1': 30000, '5': 135000, '10': 250000 },
            Telegram: { '1': 28000, '5': 125000, '10': 230000 },
            Google: { '1': 35000, '5': 160000, '10': 300000 }
        },
        '+1': {
            WhatsApp: { '1': 45000, '5': 200000, '10': 380000 },
            Telegram: { '1': 42000, '5': 185000, '10': 350000 },
            Google: { '1': 50000, '5': 230000, '10': 440000 }
        },
        '+44': {
            WhatsApp: { '1': 40000, '5': 180000, '10': 350000 },
            Telegram: { '1': 38000, '5': 170000, '10': 330000 }
        },
        '+82': {
            WhatsApp: { '1': 42000, '5': 190000, '10': 360000 }
        }
    },

    // === HARGA BOOSTER — LENGKAP SEMUA PLATFORM, TETAP SAMA ===
    hargaData: {
        Instagram: {
            Followers: { '1000': 24000, '2000': 49000, '3000': 67000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 },
            Views: { '1000': 8000, '10000': 60000 },
            Comments: { '100': 15000, '500': 65000 },
            Saves: { '1000': 12000, '5000': 50000 }
        },
        TikTok: {
            Followers: { '1000': 49000, '2000': 80000, '3000': 130000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 },
            Views: { '10000': 25000, '50000': 110000, '100000': 200000 },
            Shares: { '1000': 15000, '5000': 65000 },
            Comments: { '100': 12000, '500': 50000 }
        },
        Facebook: {
            Followers: { '1000': 15000, '5000': 65000, '10000': 120000 },
            Likes: { '1000': 12000, '5000': 50000 },
            Friends: { '500': 35000, '1000': 60000 },
            Views: { '1000': 10000, '5000': 45000 },
            Shares: { '100': 8000, '500': 35000 }
        },
        YouTube: {
            Subscribers: { '1000': 85000, '2000': 160000, '3000': 380000 },
            Views: { '1000': 15000, '5000': 65000, '10000': 120000 },
            Likes: { '1000': 12000, '5000': 50000 },
            Comments: { '100': 10000, '500': 45000 }
        },
        'Twitter/X': {
            Followers: { '1000': 20000, '5000': 90000 },
            Likes: { '1000': 12000, '5000': 50000 },
            Views: { '1000': 8000, '10000': 60000 },
            Retweets: { '100': 10000, '500': 45000 }
        },
        Telegram: {
            Members: { '100': 15000, '500': 60000, '1000': 110000 },
            Views: { '1000': 10000, '5000': 45000 },
            PostReactions: { '100': 8000, '500': 35000 }
        },
        LinkedIn: {
            Followers: { '500': 35000, '1000': 65000 },
            Connections: { '500': 40000, '1000': 75000 },
            PostLikes: { '100': 10000, '500': 45000 }
        },
        Google: {
            Reviews: { '10': 25000, '50': 110000, '100': 200000 },
            MapsViews: { '1000': 15000, '5000': 65000 },
            SearchRank: { '1000': 20000, '5000': 90000 }
        }
    }
};

// === DATABASE LOKAL ===
const DB = {
    simpan: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    },
    ambil: function(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },
    hapus: function(key) {
        localStorage.removeItem(key);
    }
};
