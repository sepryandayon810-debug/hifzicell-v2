📚 WebPOS Documentation
Dokumentasi lengkap untuk sistem WebPOS v3.2.
📁 File
Table
File	Deskripsi
./blueprint.md	Struktur database lengkap — semua node Firebase, flow data, contoh real case
./firebase-rules.json	Security Rules — siap copy-paste ke Firebase Console
🚀 Cara Upload ke GitHub
bash
Copy
# 1. Buat folder docs di repo
mkdir docs

# 2. Copy file
mv webpos-blueprint.md docs/blueprint.md
mv firebase-rules.json docs/firebase-rules.json

# 3. Commit & push
git add docs/
git commit -m "docs: add WebPOS database blueprint v3.2"
git push origin main
🔐 Cara Pasang Security Rules
Buka Firebase Console
Pilih project WebPOS → Realtime Database → Rules
Copy isi ./firebase-rules.json
Paste ke editor Rules
Klik Publish
📝 Catatan Keamanan
Jangan upload firebase-config.js yang berisi API key
Jangan upload serviceAccountKey.json
Jangan upload bot token Telegram dalam bentuk plain text
Semua credentials simpan di .env atau Firebase Environment Variables
WebPOS v3.2 — Full Dynamic Permissions
