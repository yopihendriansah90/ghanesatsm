# Design System Landing Page Ghanesa

## Tujuan

Landing page statis untuk kursus mengemudi Ghanesa Tasikmalaya dengan visual yang mengikuti screenshot referensi: biru-navy sebagai identitas utama, biru terang sebagai aksen, dan kuning untuk CTA.

## Struktur

1. Header fixed: logo `logoganesa.png`, navigasi, CTA WhatsApp, dan menu mobile.
2. Hero: `herbobackgroudn.png`, headline, dua CTA, dan info bar.
3. Program: kartu manual memakai `manual.png`, kartu matic memakai `matick.png`.
4. Keunggulan: tiga kartu benefit.
5. Alumni: lima foto `alumni1.png` sampai `alumni5.png`.
6. Cara bergabung: empat langkah konsultasi sampai latihan.
7. FAQ: accordion berbasis elemen `details` dan JavaScript.
8. Lokasi: Google Maps embed menggunakan iframe lokasi Ghanesa Tasikmalaya.
9. CTA dan footer: CTA WhatsApp, kontak, dan logo Ghanesa.

## Palet

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| Navy | `#082d6b` | Heading, header CTA, footer |
| Blue | `#1478e8` | Link, ikon, aksen |
| Sky | `#e9f7ff` | Background section |
| Yellow | `#ffd21e` | Tombol CTA |

## Teknologi

- HTML semantic dan anchor navigation.
- Tailwind CSS melalui CDN dengan konfigurasi warna dan font inline.
- CSS tambahan di `style.css` untuk hero, cards, peta dekoratif, breakpoint, dan visual detail.
- JavaScript vanilla di `script.js` untuk menu mobile, FAQ, carousel alumni, dan active navigation.
- Font utama: Plus Jakarta Sans melalui Google Fonts.
- Ikon UI: Google Material Symbols Outlined melalui Google Fonts.

## Responsive

- Desktop: max-width 1200px, grid multi-kolom, navigasi horizontal.
- Tablet: grid dua kolom untuk langkah dan padding lebih kecil.
- Mobile: menu hamburger, layout satu kolom, alumni carousel, langkah vertikal, dan tombol full-width.

## Asset Mapping

- `logoganesa.png`: logo header/footer.
- `herbobackgroudn.png`: background hero.
- `manual.png`: visual kursus manual.
- `matick.png`: visual kursus matic.
- `alumni1.png`–`alumni5.png`: galeri alumni.
- `desain landing page.png`: referensi visual, tidak digunakan sebagai elemen halaman.
- Google Maps iframe: lokasi Kursus Mengemudi Mobil Ghanesa Tasikmalaya.

## CTA WhatsApp dan Animasi

- `lowa.png` digunakan sebagai ikon semua link WhatsApp dan floating CTA.
- Floating CTA berada fixed di kanan bawah; mobile tampil sebagai tombol bulat dan desktop melebar saat hover/focus.
- Entrance animation menggunakan `IntersectionObserver` dan class `reveal`, `reveal-left`, `reveal-right`, `scale-in`, serta `stagger-item`.
- Animasi desktop meliputi hover lift pada card, floating hero, pulse WhatsApp, zoom foto alumni, dan pulse panah langkah.
- Animasi mobile dibuat lebih ringan, touch-friendly, dan tidak menggunakan parallax berat.
- `prefers-reduced-motion` menonaktifkan animasi intensif dan membuat elemen langsung terlihat.

## Mobile-First Breakpoint

- Base: satu kolom, menu hamburger, CTA full-width, dan alumni satu slide.
- `640px`: layout tablet kecil dan grid langkah dua kolom.
- `768px`: hero dua kolom, navigasi desktop, dan langkah horizontal.
- `1024px`: spacing dan komposisi desktop diperluas.
- `1280px`: container dan spacing mendekati desain referensi.

## Penggantian Data

Nomor WhatsApp, alamat, dan link Google Maps saat ini didefinisikan langsung di `index.html`. Untuk perubahan produksi, ubah seluruh URL `wa.me/6282116193939` serta alamat yang tampil di section lokasi dan footer.
