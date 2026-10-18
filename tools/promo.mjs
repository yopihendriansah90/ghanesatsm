import { readFile, writeFile, mkdir, rename, copyFile, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promoCopy, dateLabel } from './promo-content.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC_FILES = ['index.html', 'style.css', 'script.js', 'logoganesa.png', 'logoig.png', 'lowa.png', 'herbobackgroudn.png', 'manual.png', 'matick.png', 'alumni1.png', 'alumni2.png', 'alumni3.png', 'alumni4.png', 'alumni5.png'];
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const rupiah = value => 'Rp' + new Intl.NumberFormat('id-ID').format(value);
const phone = '6282116193939';
const wa = message => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
const dateText = dateLabel;
function text(value, label, required = true, limit = 1500) {
  if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) throw new Error(`${label} wajib berupa teks${required ? ' yang tidak kosong' : ''} (maksimal ${limit} karakter).`);
  return value.trim();
}
function bool(value, label) {
  if (typeof value !== 'boolean') throw new Error(`${label} harus aktif atau nonaktif.`);
  return value;
}
function date(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} tidak valid.`);
  const d = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw new Error(`${label} tidak valid.`);
  return value;
}
export function validate(input) {
  if (!input || typeof input !== 'object') throw new Error('Data promo tidak valid.');
  const data = { active: bool(input.active, 'Status promo'), startDate: date(input.startDate, 'Tanggal mulai'), endDate: date(input.endDate, 'Tanggal akhir'), quotaLimited: bool(input.quotaLimited === undefined ? (typeof input.quotaNote === 'string' && !!input.quotaNote.trim()) : input.quotaLimited, 'Kuota terbatas') };
  if (data.endDate < data.startDate) throw new Error('Tanggal akhir tidak boleh mendahului tanggal mulai.');
  if (!Array.isArray(input.packages) || input.packages.length !== 2) throw new Error('Harus ada tepat dua paket promo.');
  data.packages = input.packages.map((p, index) => {
    if (!p || typeof p !== 'object') throw new Error('Data paket tidak valid.');
    const prefix = `Paket ${index + 1}`;
    if (!Number.isSafeInteger(p.price) || p.price <= 0 || p.price > 1000000000) throw new Error(`${prefix}: harga harus bilangan bulat positif, maksimal Rp1 miliar.`);
    if (!Number.isSafeInteger(p.duration) || p.duration < 1 || p.duration > 1000) throw new Error(`${prefix}: durasi harus 1–1000.`);
    if (!['jam', 'pertemuan'].includes(p.unit)) throw new Error(`${prefix}: satuan tidak valid.`);
    if (!Array.isArray(p.transmissions) || p.transmissions.length < 1 || p.transmissions.length > 2 || new Set(p.transmissions).size !== p.transmissions.length || p.transmissions.some(t => !['manual', 'matic'].includes(t))) throw new Error(`${prefix}: pilih manual atau matic.`);
    if (!Array.isArray(p.features) || p.features.length > 12) throw new Error(`${prefix}: maksimal 12 fasilitas tambahan.`);
    const extraFeatures = p.features.map(f => text(f, 'Fasilitas', true, 200));
    if (extraFeatures.some(f => /pendaftaran|\bsim\b/i.test(f))) throw new Error(`${prefix}: atur pendaftaran dan SIM A melalui pilihannya, bukan fasilitas tambahan, agar teks tidak bertentangan.`);
    return { name: text(p.name, `${prefix}: nama`, true, 100), price: p.price, duration: p.duration, unit: p.unit, transmissions: ['manual', 'matic'].filter(t => p.transmissions.includes(t)), featured: bool(p.featured, 'Unggulan'), registrationIncluded: bool(p.registrationIncluded, 'Pendaftaran'), simIncluded: bool(p.simIncluded, 'SIM A'), features: extraFeatures };
  });
  return data;
}
function features(p) {
  return [...p.features.map(value => [value, true]), [p.registrationIncluded ? 'Sudah termasuk biaya pendaftaran' : 'Tidak termasuk biaya pendaftaran', p.registrationIncluded], [p.simIncluded ? 'Termasuk pembuatan SIM A' : 'Tidak termasuk pembuatan SIM A', p.simIncluded]];
}
function card(p, data) {
  const message = `Halo Ghanesa, saya tertarik promo ${p.name} periode ${data.period}: ${p.duration} ${p.unit}, pilihan ${p.transmissions.join(' atau ')}, ${rupiah(p.price)}. ${p.registrationIncluded ? 'Termasuk' : 'Tidak termasuk'} biaya pendaftaran. ${p.simIncluded ? 'Termasuk' : 'Tidak termasuk'} pembuatan SIM A. Berlaku ${dateText(data.startDate)} – ${dateText(data.endDate)}.`;
  return `<article data-managed-promo class="program-card promo-card${p.featured ? ' featured' : ''}">
    ${p.label ? `<span class="promo-label">${escapeHTML(p.label)}</span>` : ''}
    <div class="program-copy"><span class="program-icon" aria-hidden="true"></span><div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p></div></div>
    <div class="transmission-badges">${p.transmissions.map(t => `<span>${t === 'manual' ? 'Manual' : 'Matic'}</span>`).join('')}</div>
    <div class="price">${rupiah(p.price)}</div><p class="promo-duration">${p.duration} ${p.unit}</p>
    <ul class="check-list">${features(p).map(([label, included]) => `<li data-icon="${included ? 'check_circle' : 'close'}">${escapeHTML(label)}</li>`).join('')}</ul>
    <a href="${escapeHTML(wa(message))}" class="program-button">${escapeHTML(p.buttonText)} <span aria-hidden="true">→</span></a>
    <small class="program-note">${escapeHTML(p.note)}</small>
  </article>`;
}
export function renderBlocks(input) {
  const d = promoCopy(validate(input));
  const period = `${dateText(d.startDate)} – ${dateText(d.endDate)}`;
  const deadline = `Berlaku ${period}${d.quotaNote ? ' · ' + d.quotaNote : ''}.`;
  const heroMessage = d.active ? `Halo Ghanesa, saya ingin konsultasi promo ${d.period}.` : 'Halo Ghanesa, saya ingin konsultasi kursus mengemudi dan pilihan paket yang tersedia.';
  const hero = `<a href="${escapeHTML(wa(heroMessage))}" class="inline-flex items-center justify-center gap-2 rounded-full bg-yellow px-6 py-3.5 text-sm font-extrabold text-navy shadow-lg shadow-yellow/30 transition hover:-translate-y-0.5">${d.active ? 'Konsultasi Promo via WhatsApp' : 'Konsultasi Kursus via WhatsApp'} <span aria-hidden="true">→</span></a>`;
  const section = `<section id="program" class="section-pad bg-white"><div class="section-wrap">
    <div class="section-heading"><p class="eyebrow">${d.active ? 'Promo Spesial ' + escapeHTML(d.period) : 'Informasi Promo'}</p><h2>${d.active ? escapeHTML(d.title) : 'Konsultasikan Pilihan Kursusmu'}</h2><p>${d.active ? escapeHTML(d.intro) : 'Saat ini belum ada promo aktif. Hubungi admin untuk pilihan paket dan informasi terbaru.'}</p>${d.active ? `<p class="promo-deadline">${escapeHTML(deadline)}</p>` : ''}</div>
    ${d.active ? `<div class="mt-9 grid gap-5 lg:grid-cols-2">${d.packages.map(p => card(p, d)).join('\n')}</div><p class="promo-note">${escapeHTML(deadline)}</p>` : `<div class="promo-inactive"><a class="regular-button" href="${wa(heroMessage)}">Konsultasi via WhatsApp</a><a href="#paket-reguler">Lihat Paket Reguler →</a></div>`}
  </div></section>`;
  const faq = (q, a) => `<details class="faq-item"><summary>${q}<span>+</span></summary><p>${a}</p></details>`;
  const faqContent = d.active ? d.packages.map(p => `${escapeHTML(p.name)}: ${p.duration} ${p.unit}; pilihan ${p.transmissions.map(t => t === 'manual' ? 'manual' : 'matic').join(' atau ')}. ${features(p).map(([s]) => escapeHTML(s)).join('; ')}.`).join('<br>') : 'Saat ini belum ada promo aktif. Admin dapat membantu memilih Paket Reguler sesuai kebutuhan belajar.';
  return { HERO: hero, SECTION: section, FAQ: faq(d.active ? 'Apa saja yang termasuk dalam paket promo?' : 'Apakah ada promo yang tersedia?', faqContent) + '\n' + faq(d.active ? `Kapan promo ${escapeHTML(d.period)} berlaku?` : 'Bagaimana mendapatkan informasi promo terbaru?', d.active ? escapeHTML(deadline) : 'Hubungi admin melalui WhatsApp untuk mengetahui penawaran terbaru.') };
}
export function renderPage(source, input) {
  const blocks = renderBlocks(input);
  let result = source;
  for (const [name, html] of Object.entries(blocks)) {
    const start = `<!-- PROMO:${name}:START -->`, end = `<!-- PROMO:${name}:END -->`;
    if (result.split(start).length !== 2 || result.split(end).length !== 2 || result.indexOf(end) < result.indexOf(start)) throw new Error(`Penanda ${name} hilang atau duplikat. File tidak diubah.`);
    const a = result.indexOf(start) + start.length, b = result.indexOf(end);
    result = result.slice(0, a) + '\n' + html + '\n' + result.slice(b);
  }
  return result;
}
export async function loadData(root = ROOT) { return validate(JSON.parse(await readFile(resolve(root, 'data/promo.json'), 'utf8'))); }
export async function generatedPage(root = ROOT, input) { return renderPage(await readFile(resolve(root, 'index.html'), 'utf8'), input ?? await loadData(root)); }

// A durable journal allows rollback after a failed write or interrupted local process.
export async function recover(root = ROOT) {
  const journal = resolve(root, '.promo-backups/pending.json');
  let pending;
  try { pending = JSON.parse(await readFile(journal, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
  if (pending.files?.length !== 2 || pending.files.some(f => !['data/promo.json', 'index.html'].includes(f.name) || typeof f.content !== 'string')) throw new Error('Cadangan transaksi tidak valid. Periksa .promo-backups.');
  for (const file of pending.files) { const dest = resolve(root, file.name); await writeFile(dest + '.tmp-promo', file.content); await rename(dest + '.tmp-promo', dest); }
  await unlink(journal);
}
export async function savePromo(input, root = ROOT) {
  await recover(root);
  const data = validate(input);
  const html = await generatedPage(root, data);
  const names = ['data/promo.json', 'index.html'];
  const old = await Promise.all(names.map(async name => ({ name, content: await readFile(resolve(root, name), 'utf8') })));
  const backupDir = resolve(root, '.promo-backups');
  await mkdir(backupDir, { recursive: true });
  const journal = resolve(backupDir, 'pending.json');
  const snapshot = JSON.stringify({ files: old });
  await writeFile(journal + '.tmp-promo', snapshot);
  await rename(journal + '.tmp-promo', journal);
  await copyFile(journal, resolve(backupDir, `backup-${Date.now()}.json`));
  try {
    const contents = [JSON.stringify(data, null, 2) + '\n', html];
    for (let i = 0; i < names.length; i++) await writeFile(resolve(root, names[i]) + '.tmp-promo', contents[i]);
    for (const name of names) await rename(resolve(root, name) + '.tmp-promo', resolve(root, name));
    await unlink(journal);
  } catch (error) { await recover(root); throw error; }
  return data;
}
