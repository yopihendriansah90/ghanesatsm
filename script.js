document.documentElement.classList.add('js-enabled');

const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const siteHeader = document.querySelector('#site-header');

const syncHeaderState = () => siteHeader?.classList.toggle('is-scrolled', window.scrollY > 12);
syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('hidden') === false;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
});

document.querySelectorAll('#mobile-nav a').forEach((link) => link.addEventListener('click', () => {
  mobileNav.classList.add('hidden');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll("a[href*='wa.me']").forEach((link) => {
  if (link.classList.contains('whatsapp-float') || link.querySelector('.whatsapp-icon')) return;
  link.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/^[◉◌●]\s*/, '');
  });
  const icon = document.createElement('img');
  icon.className = 'whatsapp-icon';
  icon.src = 'lowa.png';
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  link.prepend(icon);
});

const materialIcon = (name, className = '') => {
  const icon = document.createElement('span');
  icon.className = `material-symbols-outlined ${className}`.trim();
  icon.textContent = name;
  icon.setAttribute('aria-hidden', 'true');
  return icon;
};

const setIcons = (selector, names) => document.querySelectorAll(selector).forEach((element, index) => {
  element.textContent = '';
  element.append(materialIcon(names[index % names.length]));
});
const packageCards = [...document.querySelectorAll('.promo-card')];
const packageFeatures = [
  [
    { text: 'Pilihan manual atau matic', icon: 'check_circle' },
    { text: 'Jadwal latihan fleksibel', icon: 'check_circle' },
    { text: 'Instruktur profesional dan sabar', icon: 'check_circle' },
    { text: 'Konsultasi kebutuhan belajar', icon: 'check_circle' },
    { text: 'Sudah termasuk biaya pendaftaran', icon: 'check_circle' },
    { text: 'Tidak termasuk pembuatan SIM A', icon: 'close' }
  ],
  [
    { text: 'Pilihan manual atau matic', icon: 'check_circle' },
    { text: 'Jadwal latihan fleksibel', icon: 'check_circle' },
    { text: 'Instruktur profesional dan sabar', icon: 'check_circle' },
    { text: 'Konsultasi kebutuhan belajar', icon: 'check_circle' },
    { text: 'Sudah termasuk biaya pendaftaran', icon: 'check_circle' },
    { text: 'Termasuk pembuatan SIM A', icon: 'check_circle' }
  ]
];
packageCards.forEach((card, index) => {
  const title = card.querySelector('h3');
  const list = card.querySelector('.check-list');
  if (index === 1 && title) title.textContent = '10 Jam Kursus Mengemudi + Pembuatan SIM A';
  if (list && packageFeatures[index]) list.innerHTML = packageFeatures[index].map((feature) => `<li data-icon="${feature.icon}">${feature.text}</li>`).join('');
});
setIcons('.info-icon', ['directions_car', 'location_on', 'chat']);
setIcons('.program-icon', ['directions_car', 'directions_car']);
setIcons('.feature-icon', ['directions_car', 'trending_up', 'verified_user']);
setIcons('.contact-icon', ['location_on', 'chat']);
setIcons('.step-card > span', ['chat', 'support_agent', 'event_available', 'directions_car']);
document.querySelectorAll('.check-list li').forEach((item) => {
  const iconName = item.dataset.icon || 'check_circle';
  item.textContent = item.textContent.replace(/^✓\s*/, '');
  item.prepend(materialIcon(iconName));
  item.classList.add('flex', 'items-center', 'gap-2');
});
document.querySelectorAll('.program-button > span').forEach((arrow) => {
  arrow.className = 'material-symbols-outlined';
  arrow.textContent = 'arrow_forward';
});
document.querySelectorAll('.cta-section a').forEach((link) => {
  link.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace('→', '');
  });
  link.append(materialIcon('arrow_forward'));
});
document.querySelectorAll('.whatsapp-float b').forEach((arrow) => {
  arrow.replaceWith(materialIcon('arrow_forward'));
});
document.querySelectorAll('.steps > i').forEach((arrow) => {
  arrow.textContent = '';
  arrow.append(materialIcon('arrow_forward'));
});
const footerAddress = document.querySelector('footer .footer-item:not(.footer-social)');
footerAddress?.prepend(materialIcon('location_on'));

const mapCard = document.querySelector('.map-card');
if (mapCard) {
  const map = document.createElement('iframe');
  map.src = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15828.300382654463!2d108.2236201!3d-7.3454643!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f57b9ec973207%3A0x889663fc3a2c2165!2sKursus%20Mengemudi%20Mobil%20Ghanesa%20Tasikmalaya!5e0!3m2!1sid!2sid!4v1791444805034!5m2!1sid!2sid';
  map.title = 'Lokasi Kursus Mengemudi Ghanesa Tasikmalaya';
  map.allowFullscreen = true;
  map.loading = 'lazy';
  map.referrerPolicy = 'strict-origin-when-cross-origin';
  mapCard.replaceChildren(map);
}

document.querySelectorAll('.faq-item').forEach((item) => item.addEventListener('toggle', () => {
  if (item.open) document.querySelectorAll('.faq-item').forEach((other) => {
    if (other !== item) other.removeAttribute('open');
  });
}));

const alumni = [...document.querySelectorAll('.alumni-card')];
const alumniTrack = document.querySelector('#alumni-track');
const dotWrap = document.querySelector('#alumni .alumni-dots');
const previousAlumni = document.querySelector('[data-alumni-prev]');
const nextAlumni = document.querySelector('[data-alumni-next]');
let dots = [];
let activeAlumniIndex = 0;
const hasCarousel = alumni.length > 3;
const lightbox = document.querySelector('#alumni-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('figcaption');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
const lightboxNext = lightbox?.querySelector('.lightbox-next');
let lightboxIndex = 0;
const updateLightbox = (index) => {
  if (!lightboxImage || !alumni.length) return;
  lightboxIndex = (index + alumni.length) % alumni.length;
  const source = alumni[lightboxIndex]?.querySelector('img');
  if (!source) return;
  lightboxImage.src = source.src;
  lightboxImage.alt = source.alt;
  if (lightboxCaption) lightboxCaption.textContent = `Alumni Ghanesa ${lightboxIndex + 1}`;
};
const openLightbox = (index) => {
  if (!lightbox || typeof lightbox.showModal !== 'function') return;
  updateLightbox(index);
  lightbox.showModal();
  lightboxClose?.focus();
};
alumni.forEach((card, index) => card.querySelector('img')?.addEventListener('click', () => openLightbox(index)));
lightboxClose?.addEventListener('click', () => lightbox.close());
lightboxPrev?.addEventListener('click', () => updateLightbox(lightboxIndex - 1));
lightboxNext?.addEventListener('click', () => updateLightbox(lightboxIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') updateLightbox(lightboxIndex - 1);
  if (event.key === 'ArrowRight') updateLightbox(lightboxIndex + 1);
});
let lightboxTouchStartX = 0;
lightbox?.addEventListener('touchstart', (event) => {
  lightboxTouchStartX = event.changedTouches[0].clientX;
}, { passive: true });
lightbox?.addEventListener('touchend', (event) => {
  const deltaX = event.changedTouches[0].clientX - lightboxTouchStartX;
  if (Math.abs(deltaX) < 45) return;
  updateLightbox(lightboxIndex + (deltaX < 0 ? 1 : -1));
}, { passive: true });
if (alumniTrack && !hasCarousel) alumniTrack.classList.add('alumni-static');
const visibleAlumni = () => window.innerWidth >= 768 ? 3 : 1;
const maxAlumniIndex = () => Math.max(0, alumni.length - visibleAlumni());
if (dotWrap && hasCarousel) {
  dotWrap.replaceChildren();
  for (let i = 0; i <= maxAlumniIndex(); i += 1) {
    const dot = document.createElement('button');
    dot.className = `dot${i === 0 ? ' active' : ''}`;
    dot.dataset.slide = i;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dotWrap.appendChild(dot);
  }
  dots = [...dotWrap.querySelectorAll('.dot')];
} else if (dotWrap) dotWrap.remove();
const moveAlumni = (index) => {
  if (!alumniTrack || !alumni.length) return;
  activeAlumniIndex = Math.max(0, Math.min(index, maxAlumniIndex()));
  alumni[activeAlumniIndex]?.classList.add('is-visible');
  const gap = Number.parseFloat(getComputedStyle(alumniTrack).gap) || 0;
  const step = alumni[0].getBoundingClientRect().width + gap;
  alumniTrack.style.transform = '';
  alumni.forEach((card) => { card.style.transform = `translateX(-${activeAlumniIndex * step}px)`; });
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === activeAlumniIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
  if (previousAlumni) previousAlumni.disabled = activeAlumniIndex === 0;
  if (nextAlumni) nextAlumni.disabled = activeAlumniIndex === maxAlumniIndex();
};
dots.forEach((dot, index) => dot.addEventListener('click', () => {
  moveAlumni(index);
}));
previousAlumni?.addEventListener('click', () => moveAlumni(activeAlumniIndex - 1));
nextAlumni?.addEventListener('click', () => moveAlumni(activeAlumniIndex + 1));
let touchStartX = 0;
let touchStartY = 0;
let mouseStartX = 0;
let isMouseDragging = false;
alumniTrack?.addEventListener('touchstart', (event) => {
  if (!hasCarousel || window.innerWidth >= 768) return;
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
alumniTrack?.addEventListener('touchend', (event) => {
  if (!hasCarousel || window.innerWidth >= 768) return;
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  const nextIndex = deltaX < 0 ? activeAlumniIndex + 1 : activeAlumniIndex - 1;
  if (nextIndex >= 0 && nextIndex <= maxAlumniIndex()) moveAlumni(nextIndex);
}, { passive: true });
alumniTrack?.addEventListener('mousedown', (event) => {
  if (!hasCarousel || window.innerWidth < 768) return;
  mouseStartX = event.clientX;
  isMouseDragging = true;
  alumniTrack.classList.add('is-dragging');
});
alumniTrack?.addEventListener('mouseup', (event) => {
  if (!isMouseDragging) return;
  const deltaX = event.clientX - mouseStartX;
  isMouseDragging = false;
  alumniTrack.classList.remove('is-dragging');
  if (Math.abs(deltaX) < 45) return;
  const nextIndex = deltaX < 0 ? activeAlumniIndex + 1 : activeAlumniIndex - 1;
  if (nextIndex >= 0 && nextIndex <= maxAlumniIndex()) moveAlumni(nextIndex);
});
alumniTrack?.addEventListener('mouseleave', () => {
  isMouseDragging = false;
  alumniTrack.classList.remove('is-dragging');
});
window.addEventListener('resize', () => {
  moveAlumni(Math.min(activeAlumniIndex, maxAlumniIndex()));
});
moveAlumni(0);

const revealTargets = [
  ['.hero .max-w-xl', 'reveal reveal-left'],
  ['.hero .shadow-soft', 'reveal reveal-right'],
  ['.section-heading', 'reveal'],
  ['.program-card', 'reveal reveal-up stagger-item'],
  ['.feature-card', 'reveal reveal-up stagger-item'],
  ['.step-card', 'reveal reveal-up stagger-item'],
  ['.faq-item', 'reveal reveal-up stagger-item'],
  ['.map-card', 'reveal reveal-left'],
  ['.contact-row', 'reveal reveal-right'],
  ['.cta-section .section-wrap', 'reveal scale-in']
];
revealTargets.forEach(([selector, classes]) => document.querySelectorAll(selector).forEach((element) => {
  element.classList.add(...classes.split(' '));
}));

const revealItems = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((element) => revealObserver.observe(element));
} else revealItems.forEach((element) => element.classList.add('is-visible'));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-40% 0px -50%' });
  sections.forEach((section) => navObserver.observe(section));
}

const footer = document.querySelector('footer');
const floatingWhatsapp = document.querySelector('.whatsapp-float');
if (footer && floatingWhatsapp && 'IntersectionObserver' in window) {
  const footerObserver = new IntersectionObserver(([entry]) => {
    floatingWhatsapp.classList.toggle('is-footer-visible', entry.isIntersecting);
  }, { threshold: .12 });
  footerObserver.observe(footer);
}

const inlineWhatsappCtas = [...document.querySelectorAll('a[href*="wa.me"]')]
  .filter((link) => !link.classList.contains('whatsapp-float'));
if (floatingWhatsapp && inlineWhatsappCtas.length && 'IntersectionObserver' in window) {
  const visibleCtas = new Set();
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleCtas.add(entry.target);
      else visibleCtas.delete(entry.target);
    });
    floatingWhatsapp.classList.toggle('is-cta-visible', visibleCtas.size > 0);
  }, { threshold: .15 });
  inlineWhatsappCtas.forEach((cta) => ctaObserver.observe(cta));
}
