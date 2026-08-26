
const CONFIG = {
    API: {
        BASE_URL: 'https://simuru.com',
        OPENAPI_URL: 'https://simuru.com/openapi.json',
        API_KEY: 'MstAiI7R5641sRxsk6ROWCed2nMb9xBsYNjCPwKW'
    },
    ownerUsername: 'owner',
    ownerPassword: 'owner123',
    DB_KEYS: {
        CURRENT_USER: 'simuru_current_user',
        USERS: 'simuru_users',
        PESANAN: 'simuru_pesanan',
        ADMINS: 'simuru_admins',
        CHAT_PREFIX: 'simuru_chat_'
    },

    // HARGA TETAP SAMA — TIDAK DIUBAH
    nomorData: {
        '+62': { WhatsApp: { '1': 15000, '5': 60000, '10': 110000 }, Telegram: { '1': 12000, '5': 50000, '10': 95000 }, Google: { '1': 18000, '5': 75000, '10': 140000 } },
        '+60': { WhatsApp: { '1': 25000, '5': 110000, '10': 200000 }, Telegram: { '1': 22000, '5': 95000, '10': 175000 } },
        '+65': { WhatsApp: { '1': 30000, '5': 135000, '10': 250000 } },
        '+1': { WhatsApp: { '1': 45000, '5': 200000, '10': 380000 } }
    },

    // HARGA TETAP SAMA — SESUAI PERMINTAAN AWAL
    hargaData: {
        Instagram: {
            Followers: { '1000': 24000, '2000': 49000, '3000': 67000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 }
        },
        TikTok: {
            Followers: { '1000': 49000, '2000': 80000, '3000': 130000 },
            Likes: { '1000': 10000, '2000': 19000, '3000': 38000 }
        }
    }
};

const DB = {
    simpan: (k, d) => localStorage.setItem(k, JSON.stringify(d)),
    ambil: (k, def=null) => localStorage.getItem(k) ? JSON.parse(localStorage.getItem(k)) : def,
    hapus: k => localStorage.removeItem(k)
};
