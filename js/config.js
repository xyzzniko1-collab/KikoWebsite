const CONFIG = {
    nama: "KikoStore",
    profil: "https://files.catbox.moe/x00jjf.jpg",
    banner: "https://files.catbox.moe/ipyp65.jpg",
    tentang: "KikoStore adalah toko online terpercaya yang telah melayani ribuan pelanggan sejak 2020. Kami menyediakan berbagai produk digital untuk kebutuhan sehari-hari dengan kualitas terbaik dan harga terjangkau.\n\nKomitmen kami adalah memberikan pengalaman berbelanja yang menyenangkan dengan pelayanan terbaik, produk original, dan garansi resmi untuk semua produk yang kami jual.",
    alamat: "Jl. Contoh No. 123, Jakarta, Indonesia",
    sosial_media: {
        email: "cihe@zass.cloud",
        youtube: "Kiko",
        tiktok: "xyzz.niko",
        whatsapp: "6282211029198",
        telegram: ""
    },
    payment: {
        dana: "082211029198",
        gopay: "082211029198",
        ovo: "082211029198",
        qris: "https://gopay.co.id/app/scanqr?deeplink_source=request_money"
    },
    telegram_api: {
        bot: "62828278:7678blablabla",
        chatid: "6118311111"
    }
};

// Produk
const productsData = {
    "SAMP": [
        {
            id: 1,
            name: "SAMP GTA R1",
            icon: "fas fa-server",
            description: "GTA RP TERBAIK",
            variants: [
                { name: "GTA RP V1", price: 35000 },
                { name: "GTA RP V2", price: 40000 },
                { name: "GTA RP V3", price: 45000 }
            ]
        },
        {
            id: 2,
            name: "SAMP GTA R5",
            icon: "fas fa-microchip",
            description: "GTA R5 TERBAIK",
            variants: [
                { name: "GTA R5 V1", price: 30000 },
                { name: "GTA R5 V2", price: 40000 }
            ]
        },
        {
            id: 3,
            name: "Basic Hosting",
            icon: "fas fa-hdd",
            description: "Kamu ingin mendapatkan hosting dengan performa lancar tetapi dengan harga yang murah? Kamu ada di tempat yang tepat!!",
            variants: [
                { name: "1 vCPU AMD / 1GB RAM / 5GB SSD", price: 5000 },
                { name: "1 vCPU AMD / 2GB RAM / 10GB SSD", price: 10000 },
                { name: "1,5 vCPU AMD / 3GB RAM / 15GB SSD", price: 15000 },
                { name: "2 vCPU AMD / 4GB RAM / 20GB SSD", price: 20000 }
            ]
        },
        {
            id: 4,
            name: "Dedicated Server",
            icon: "fas fa-database",
            description: "Server dedicated dengan performa tinggi, cocok untuk skala besar.",
            variants: [
                { name: "8 vCPU / 32GB RAM / 500GB SSD", price: 450000 },
                { name: "16 vCPU / 64GB RAM / 1TB SSD", price: 800000 }
            ]
        },
        {
            id: 5,
            name: "Web Hosting",
            icon: "fas fa-globe",
            description: "Hosting website dengan panel cPanel / DirectAdmin, cocok untuk pemula.",
            variants: [
                { name: "Starter (1GB Storage)", price: 15000 },
                { name: "Basic (5GB Storage)", price: 30000 },
                { name: "Pro (10GB Storage)", price: 50000 }
            ]
        }
    ],
    "ROBLOX": [
        {
            id: 6,
            name: "ROBLOX SCRIPT",
            icon: "fas fa-pen-nib",
            description: "Roblox script developer.",
            variants: [
                { name: "VIP SYSTEM", price: 100000 },
                { name: "MUSIC SYSTEM", price: 150000 },
                { name: "AC SYSTEM", price: 100000 },
                { name: "AC+ADMNPANEL", price: 150000 },
                { name: "DANCE SYSTEM", price: 150000 },
                { name: "SETTINGS GRAPHIC SYSTEM", price: 200000 }
            ]
        },
        {
            id: 7,
            name: "JASA MAP",
            icon: "fas fa-image",
            description: "Jasa pembuatan map roblox beserta script script nyaa.",
            variants: [
                { name: "HANGOUT", price: 500000 },
                { name: "MOUNT/GUNUNG", price: 400000 },
                { name: "MAP CLUB", price: 550000 },
                { name: "BUILD", price: 300000 }
            ]
        },
        {
            id: 8,
            name: "JASA SCRIPT",
            icon: "fas fa-scroll",
            description: "Jasa pembuatan script/system harga tergantung low/medium/high.",
            variants: [
                { name: "LOW", price: 50000 },
                { name: "MEDIUM", price: 100000 },
                { name: "HIGH", price: 150000 }
            ]
        },
        {
            id: 9,
            name: "MAP ROBLOX",
            icon: "fas fa-laptop-code",
            description: "Map roblox yang udah jadi/terima beres.",
            variants: [
                { name: "HANGOUT", price: 400000 },
                { name: "MOUNT/GUNUNG", price: 400000 },
                { name: "CLUB", price: 500000 }
            ]
        }
    ],
    "Produk Digital": [
        {
            id: 11,
            name: "E-Book",
            icon: "fas fa-book",
            description: "Koleksi e-book digital dengan berbagai topik menarik, mulai dari bisnis, programming, hingga hobi.",
            variants: [
                { name: "ComingSoon", price: 0 }
            ]
        },
        {
            id: 12,
            name: "Software & Tools",
            icon: "fas fa-cogs",
            description: "Software dan tools digital untuk menunjang pekerjaan maupun kebutuhan kreatif.",
            variants: [
                { name: "ComingSoon", price: 0 }
            ]
        },
        {
            id: 13,
            name: "Lisensi & Key",
            icon: "fas fa-key",
            description: "Produk lisensi resmi dan serial key untuk software pilihan.",
            variants: [
                { name: "ComingSoon", price: 0 }
            ]
        },
        {
            id: 14,
            name: "Template Digital",
            icon: "fas fa-file-alt",
            description: "Template digital untuk desain, presentasi, website, dan media sosial.",
            variants: [
                { name: "ComingSoon", price: 0 }
            ]
        },
        {
            id: 15,
            name: "Akun Premium",
            icon: "fas fa-user-circle",
            description: "Berbagai akun premium dengan harga terjangkau, cocok untuk hiburan dan produktivitas.",
            variants: [
                { name: "ComingSoon", price: 0 }
            ]
        }
    ]
};
