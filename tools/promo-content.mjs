// Shared, deterministic copy rules for the local dashboard and HTML generator.
// This module contains no server APIs and is served only to the local dashboard.
const dateValue = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value ? d : null;
};
export function dateLabel(value) {
  const d = dateValue(value);
  return d ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d) : 'Pilih tanggal';
}
export function periodLabel(start, end) {
  const a = dateValue(start), b = dateValue(end);
  if (!a || !b) return 'Pilih tanggal promo';
  const monthYear = d => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  if (start.slice(0, 7) === end.slice(0, 7)) return monthYear(a);
  if (a.getUTCFullYear() === b.getUTCFullYear()) {
    const month = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' }).format(a);
    return `${month} – ${monthYear(b)}`;
  }
  return `${monthYear(a)} – ${monthYear(b)}`;
}
export const transmissionLabel = list => ['manual', 'matic'].filter(t => list?.includes(t)).join(' atau ');
export function packageCopy(p) {
  const validDuration = Number.isSafeInteger(p.duration) && p.duration > 0;
  const duration = validDuration ? `${p.duration} ${p.unit === 'pertemuan' ? 'pertemuan' : 'jam'}` : 'durasi yang dipilih';
  const title = validDuration ? `${p.duration} ${p.unit === 'pertemuan' ? 'Pertemuan' : 'Jam'} Kursus Mengemudi${p.simIncluded ? ' + Pembuatan SIM A' : ''}` : 'Isi durasi kursus';
  const transmission = transmissionLabel(p.transmissions) || 'dengan transmisi yang dipilih';
  return {
    title,
    description: `Belajar mengemudi ${transmission} dengan ${duration} latihan. ${p.registrationIncluded ? 'Sudah termasuk biaya pendaftaran.' : 'Biaya pendaftaran terpisah.'} ${p.simIncluded ? 'Termasuk pembuatan SIM A.' : 'Tidak termasuk pembuatan SIM A.'}`,
    label: p.featured ? 'PALING DIREKOMENDASIKAN' : (p.name || 'Nama paket').toLocaleUpperCase('id-ID'),
    buttonText: `Ambil Paket ${p.name || 'Pilihanmu'}`,
    note: 'Konsultasikan jadwal dan ketersediaan promo dengan admin.'
  };
}
export function promoCopy(data) {
  const packages = (data.packages || []).map(p => ({ ...p, ...packageCopy(p) }));
  const transmissions = packages.flatMap(p => p.transmissions || []);
  return {
    ...data,
    period: periodLabel(data.startDate, data.endDate),
    title: 'Pilihan Promo Kursus Mengemudi',
    intro: `Pilih promo kursus ${transmissionLabel(transmissions) || 'mengemudi'} dengan durasi dan biaya sesuai kebutuhanmu.`,
    quotaNote: data.quotaLimited ? 'Kuota promo terbatas' : '',
    packages
  };
}
