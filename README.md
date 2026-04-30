WebPOS V2 — Blueprint Master
Struktur Firebase Realtime Database
plain
Copy
webpos-v2/
├── users/{uid}/profile      → name, email, role, phone, isActive
├── settings/
│   ├── app/                 → theme, darkMode, storeName, storeAddress, storePhone
│   ├── receipt/             → headerText, footerText, showLogo, logoUrl, printerType, paperWidth
│   ├── bluetooth/           → deviceName, deviceId, autoConnect
│   └── access/{role}/       → kasir, produk, pembelian, riwayat, hutang, laporan, kas, pelanggan, pengaturan, backup
├── products/{id}/           → name, price, cost, stock, unlimited, category, barcode
├── transactions/{id}/       → type, items[], total, cashierId, customerId, timestamp, dateKey, status
├── customers/{id}/          → name, phone, address, totalDebt, totalPaid
├── debts/{id}/              → customerId, originalAmount, remainingAmount, status, payments[]
├── finance/{dateKey}/       → openingBalance, closingBalance, salesTotal, purchasesTotal, topups, withdrawals
├── logs/{dateKey}/{id}/     → action, userId, target, details, timestamp
└── backups/{timestamp}/     → (snapshot JSON)
Setup
Buat project Firebase baru
Aktifkan Realtime Database (mode test dulu)
Aktifkan Authentication (Email/Password)
Ganti placeholder di js/core/firebase-config.js
Upload ke GitHub Pages
Buka index.html
Role
developer → Ungu badge
owner → Emas badge
admin → Biru badge
kasir → Hijau badge
Tema
Ocean (default): Biru toska, fresh
Forest: Hijau sage, natural
Sunset: Orange-ungu, warm
Midnight: Navy-gold, elegant
Aturan Penting
Setting HANYA dari pengaturan.html
Tidak ada hardcode warna / nama toko di page lain
Semua page wajib panggil initApp() di awal
Theme & dark mode di-load dari Firebase /settings/app
