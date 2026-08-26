
const CONFIG = {
    // ========== API INTEGRASI SIMURU — TIDAK DIUBAH ==========
    API: {
        BASE_URL: 'https://simuru.com',
        OPENAPI_URL: 'https://simuru.com/openapi.json',
        API_KEY: 'MstAiI7R5641sRxsk6ROWCed2nMb9xBsYNjCPwKW',
        TIMEOUT: 30000
    },

    ownerUsername: 'niko',
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
        NOMOR_STOK: 'simuru_nomor_stok',
        SETTINGS: 'simuru_settings',
        API_CACHE: 'simuru_api_cache'
    },

    // === HARGA NOMOR — TETAP SAMA SESUAI PERMINTAAN ===
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
        }
    },

    // === HARGA BOOSTER SOSMED — TETAP SAMA SESUAI PERMINTAAN ===
    hargaData: {
        Instagram: {
            Followers: { '1.000': 24000, '2.000': 49000, '3.000': 67000 },
            Likes: { '1.000': 10000, '2.000': 19000, '3.000': 38000 },
            Views: { '1.000': 8000, '10.000': 60000 },
            Comments: { '100': 15000, '500': 65000 }
        },
        TikTok: {
            Followers: { '1.000': 49000, '2.000': 80000, '3.000': 130000 },
            Likes: { '1.000': 10000, '2.000': 19000, '3.000': 38000 },
            Views: { '10.000': 25000, '50.000': 110000 }
        },
        Facebook: {
            Followers: { '1.000': 15000, '5.000': 65000, '10.000': 120000 },
            Likes: { '1.000': 12000, '5.000': 50000 },
            Friends: { '500': 35000, '1.000': 60000 },
            Views: { '1.000': 10000, '5.000': 45000 }
        },
        YouTube: {
            Subscribers: { '1.000': 85000, '2.000': 160000, '3.000': 380000 },
            Views: { '1.000': 15000, '5.000': 65000, '10.000': 120000 },
            Likes: { '1.000': 12000, '5.000': 50000 }
        },
        'Twitter/X': {
            Followers: { '1.000': 20000, '5.000': 90000 },
            Likes: { '1.000': 12000, '5.000': 50000 },
            Views: { '1.000': 8000, '10.000': 60000 }
        },
        Telegram: {
            Members: { '100': 15000, '500': 60000, '1.000': 110000 },
            Views: { '1.000': 10000, '5.000': 45000 }
        },
        LinkedIn: {
            Followers: { '500': 35000, '1.000': 65000 },
            Connections: { '500': 40000, '1.000': 75000 }
        },
        Google: {
            Reviews: { '10': 25000, '50': 110000, '100': 200000 },
            MapsViews: { '1.000': 15000, '5.000': 65000 }
        }
    }
};

// === FUNGSI DATABASE — SEMUA DATA TERSIMPAN PERMANEN ===
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
    },
    resetSemua: function() {
        localStorage.clear();
        alert('✅ Database di-reset! Halaman akan reload...');
        location.reload();
    }
};
