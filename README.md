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
Tema (10 Tema)
Table
Tema	Nuansa	Primary	Vibe
Ocean (default)	🌊 Biru toska	#0ea5e9	Fresh, modern, clean
Forest	🌲 Hijau sage	#10b981	Natural, calm, organic
Sunset	🌅 Orange-ungu	#f97316	Warm, energetic, bold
Midnight	🌙 Navy-gold	#6366f1	Elegant, premium, luxury
Cherry	🍒 Merah-pink	#e11d48	Bold, passionate, energetic
Lavender	💜 Ungu muda	#8b5cf6	Soft, dreamy, elegant
Coffee	☕ Coklat-krem	#92400e	Warm, cozy, classic
Mint	🌿 Hijau muda	#14b8a6	Fresh, clean, airy
Coral	🪸 Merah muda	#f43f5e	Vibrant, playful, tropical
Slate	🪨 Abu-abu	#475569	Professional, corporate, minimalist
Aturan Penting
Setting HANYA dari pengaturan.html — tidak ada hardcode di page lain
Tidak ada hardcode warna / nama toko / format struk di page lain
Semua page wajib panggil initApp() di awal
Theme & dark mode di-load dari Firebase /settings/app
Struk format di-load dari Firebase /settings/receipt
Bluetooth config di-load dari Firebase /settings/bluetooth
Secret (API key) disimpan di firebase-config.js — jangan commit ke public repo
