// Reference layout kept separate from dashboard copy and validation rules.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls = '') => `<img class="${cls}" src="${name === 'whatsapp' ? 'lowa.png' : `oke-icon-${name}.svg`}" alt="">`;
export function referenceCard(p, data, href) {
  const name = p.name === 'OK Deal' ? 'Oke Deal' : p.name;
  const title = p.duration === 10 && p.unit === 'jam' && p.simIncluded ? '10 Jam Kursus + SIM A' : p.title;
  const registration = p.registrationIncluded ? 'Biaya pendaftaran termasuk' : 'Biaya pendaftaran terpisah';
  const sim = p.simIncluded ? 'Termasuk pembuatan SIM A' : 'Tidak termasuk pembuatan SIM A';
  const benefits = p.simIncluded
    ? [`${p.duration} ${p.unit} latihan`, registration, sim, 'Jadwal latihan fleksibel']
    : [`${p.duration} ${p.unit} latihan`, registration, 'Jadwal latihan fleksibel', sim];
  return `<article data-managed-promo class="plan${p.featured ? ' recommended' : ''}">
${p.featured ? `<div class="recommend-label">${icon('crown')}REKOMENDASI KAMI</div>` : ''}
<div class="ticket-content"><span class="badge">${escape(name.toLocaleUpperCase('id-ID'))}</span>
<div class="plan-heading">${icon('car', 'car-icon')}<div><h3>${escape(title)}</h3><div class="chips">${p.transmissions.map(t => `<span>${t === 'manual' ? 'Manual' : 'Matic'}</span>`).join('')}</div></div></div>
<div class="separator"></div><p class="price">Rp${new Intl.NumberFormat('id-ID').format(p.price)}</p>
<ul>${benefits.map(b => `<li${b === sim && !p.simIncluded ? ' class="excluded" data-icon="close"' : ''}>${escape(b)}</li>`).join('')}</ul>
<a class="cta" href="${escape(href)}">${icon('whatsapp', 'whatsapp-icon')}<span>Tanya ${escape(name)}</span></a>
</div></article>`;
}
export function referenceSection(d, cards) {
  const month = new Intl.DateTimeFormat('id-ID', {month:'long',timeZone:'UTC'}).format(new Date(d.startDate + 'T00:00:00Z'));
  const date = d.startDate.slice(0, 7) === d.endDate.slice(0, 7)
    ? `${Number(d.startDate.slice(-2))} – ${Number(d.endDate.slice(-2))} ${d.period}`
    : `${new Intl.DateTimeFormat('id-ID', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d.startDate))} – ${new Intl.DateTimeFormat('id-ID', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d.endDate))}`;
  return `<section id="program" class="oke-section" aria-label="Promo kursus mengemudi ${escape(d.period)}">
<div class="editable-view"><header class="oke-hero">
<div class="promo">${icon('calendar')}PROMO ${escape(d.period.toLocaleUpperCase('id-ID'))}</div>
<h1>OKE DEAL</h1><h2>${escape(month)} saatnya <span>pegang setir.</span></h2>
<p class="intro">Pilihan kursus manual &amp; matic dengan biaya pendaftaran<br class="desktop-break"> sudah termasuk.</p>
<p class="date">${icon('calendar')}<strong>${escape(date)}</strong></p></header>
<div class="plans">${cards}</div><p class="footnote">Konsultasikan jadwal dan ketersediaan promo dengan admin.</p>
</div></section>`;
}
