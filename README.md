WEBPOS THEME SYSTEM v3.0
========================

📁 FILE YANG DIBUAT:
1. settings-structure.js  → Struktur data Firebase
2. themes.css             → 7 tema baru + dark mode
3. theme-manager.js       → JS controller tema
4. settings-ui.html       → Halaman pengaturan lengkap
5. integration-guide.js   → Panduan integrasi

🎨 7 TEMA BARU:
- 🌊 Ocean Breeze  (Biru laut)
- 🌲 Forest Mint   (Hijau daun)
- 🌅 Sunset Glow   (Oranye warm)
- 👑 Royal Purple   (Ungu elegan)
- 🌹 Rose Gold     (Pink stylish)
- ⚡ Midnight Cyber (Hitam neon)
- 🪨 Clean Slate    (Abu minimalis)

📍 PENYIMPANAN TERSTRUKTUR:
/settings/{uid}/
  ├── theme/         (tema, darkmode, font, radius)
  ├── receipt/       (header, footer, format struk)
  ├── bluetooth/     (printer, auto-connect, paper)
  └── general/       (bahasa, format tanggal, alert)

⚡ SEMUA DIATUR DARI 1 HALAMAN: settings-ui.html
