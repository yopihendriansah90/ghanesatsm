# Website Ghanesa Tasikmalaya

Website publik berupa HTML statis. Dashboard promo hanya berjalan di komputer lokal, tanpa database atau dashboard online.

## Persiapan sekali

Pasang Node.js LTS (minimal Node 22) dari https://nodejs.org. Pada komputer ini Node LTS juga dipasang di `%LOCALAPPDATA%\Programs\NodeJS`. Buka ulang terminal/VS Code untuk memuat PATH terbaru. Tidak ada dependensi npm yang perlu diunduh.

## Update promo setiap bulan

1. Klik dua kali **Buka Dashboard.cmd**, atau jalankan `npm run dev` (alias: `npm run dashboard`) lalu buka **http://127.0.0.1:4317/dashboard**. Biarkan terminal server tetap berjalan. Website publik lokal langsung tersedia di **http://127.0.0.1:4317/**.
2. Ubah tanggal mulai–akhir dan data utama dua paket: nama, harga, durasi, satuan, transmisi, serta penanda unggulan. Harga ditulis sebagai angka rupiah tanpa pemisah. Periode mengikuti tanggal, termasuk bila melewati bulan atau tahun.
3. Pilih status pendaftaran, SIM A, dan kuota terbatas. Judul section, pengantar, judul/deskripsi kartu, label, tombol, catatan, FAQ, serta pesan WhatsApp otomatis dibentuk dari data utama. Teks otomatis tidak perlu diisi; ringkasannya tersedia di dashboard dan mengikuti perubahan langsung. Fasilitas tambahan dapat ditambah, diurutkan, dan dihapus; jangan menulis status pendaftaran/SIM A di sana karena sudah dikelola oleh pilihannya.
4. Klik **Simpan & Generate**. Tidak ada preview atau persetujuan tambahan. Tombol **Buka Website Lokal** tersedia untuk pengecekan jika diperlukan.
5. Commit perubahan lalu push ke branch produksi:

```powershell
git add index.html data/promo.json
git commit -m "Update promo bulanan"
git push origin main
```

Website live berubah setelah deployment Cloudflare berhasil. Saat setup pertama, commit juga file dashboard, tools, konfigurasi, dan aset website yang diperlukan; periksa `git status` sebelum commit.

**Aktif/nonaktif:** matikan sakelar Promo aktif, simpan, commit, dan push untuk mengganti kartu promo dengan ajakan konsultasi. Data paket tetap disimpan. Tanggal merupakan informasi periode, bukan penjadwal; promo tidak otomatis hilang saat tanggal berakhir.

Hentikan server dengan Ctrl+C. Dashboard memberikan peringatan ketika ditutup saat ada perubahan yang belum tersimpan.

## Sumber data dan generator

- `data/promo.json`: sumber data dua promo, termasuk status aktif/nonaktif.
- `tools/promo-content.mjs`: aturan teks otomatis bersama untuk dashboard dan generator. Teks turunan tidak disimpan terpisah di JSON, sehingga tidak meninggalkan judul/periode lama. Data format lama masih dapat dibaca; saat disimpan ulang, kolom teks manual diganti oleh data utama dan versi sebelumnya dicadangkan.
- `index.html`: website lokal sekaligus dasar generator. Konten di luar penanda `PROMO:HERO`, `PROMO:SECTION`, dan `PROMO:FAQ` dapat diedit seperti biasa. Isi di dalam blok dihasilkan ulang; jangan menghapus atau menduplikasi penanda.
- `tools/` dan `dashboard/`: server lokal, generator, formulir, dan build.
- `dist/`: hasil publik dari `npm run build`, diabaikan Git.

`npm run generate` memperbarui blok promo pada index lokal. `npm run build` menghasilkan halaman dari data terbaru ke dist tanpa mengubah index lokal. Konten promo dan FAQ sudah tersedia dalam HTML sebelum JavaScript dijalankan.

Input ditampilkan sebagai teks biasa; tidak dapat dipakai untuk memasukkan kode HTML atau URL tombol. Nomor WhatsApp tetap 6282116193939. Tanggal diformat dalam bahasa Indonesia tanpa dipengaruhi zona waktu komputer.

## Cloudflare Pages melalui GitHub

Hubungkan repository GitHub ke proyek Cloudflare Pages dengan pengaturan berikut:

| Pengaturan | Nilai |
|---|---|
| Production branch | `main` (atau branch produksi repo jika berbeda) |
| Framework preset | None |
| Root directory | Akar repository |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 24, juga ditentukan melalui `.node-version` |

Build membaca JSON dan menghasilkan ulang HTML agar deployment konsisten. Cloudflare hanya menerbitkan dist; server lokal tidak dijalankan di hosting. Tidak diperlukan secret, database, atau GitHub token pada dashboard.

Daftar aset publik ditentukan di `PUBLIC_FILES` pada tools/promo.mjs. Saat menambah gambar website, tambahkan ke daftar ini. Dashboard, data sumber, screenshot audit, salinan ulasan, cadangan, dan server tidak disalin ke dist. Jangan mengatur output directory ke akar repo.

## Pengujian dan pemulihan

Jalankan `npm test` untuk pengujian validasi, generator, penyimpanan, pemulihan transaksi, API lokal, dan pemeriksaan build. Jalankan `npm run build` sebelum push untuk memastikan aset lengkap.

Setiap penyimpanan menyimpan pasangan file sebelumnya dalam `.promo-backups/backup-*.json`, diabaikan Git. Bila proses berhenti di tengah penulisan, transaksi yang belum selesai dipulihkan otomatis saat server/build dimulai ulang. Riwayat Git dapat dipakai untuk mengembalikan versi yang sudah di-commit.

Jika gagal menyimpan, error tampil dan input tidak dihapus. Periksa terminal, izin folder, dan ruang disk. Jika port 4317 sudah dipakai, buka server yang masih berjalan atau hentikan proses lama. Website lokal tersedia di `/`, dashboard di `/dashboard`. Tautan lama `/website/` diarahkan ke root. Server hanya melayani aset publik yang terdaftar dan file dashboard tertentu, bukan akses umum ke repository. Setelah memperbarui kode server, hentikan dengan Ctrl+C lalu jalankan ulang `npm run dev`. Tidak ada proses commit, push, atau deployment otomatis dari dashboard.
