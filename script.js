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
setIcons('.info-icon', ['directions_car', 'location_on', 'chat']);
setIcons('.program-icon', ['directions_car', 'directions_car']);
setIcons('.feature-card:not(.facility-card) .feature-icon', ['directions_car', 'trending_up', 'verified_user']);
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

const testimonialTrack = document.querySelector('#testimonial-track');
if (testimonialTrack) {
  const cards = [...testimonialTrack.querySelectorAll('.testimonial-card')];
  const section = document.querySelector('#testimoni');
  const play = section.querySelector('[data-testimonial-play]');
  const dotWrap = section.querySelector('.testimonial-dots');
  const previous = section.querySelector('[data-testimonial-prev]');
  const next = section.querySelector('[data-testimonial-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let hovered = false;
  let dragging = false;
  let visible = false;
  let timer;
  let dragX = 0;
  let dragScroll = 0;
  const step = () => cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(testimonialTrack).gap) || 0);
  const maxIndex = () => Math.max(0, Math.round((testimonialTrack.scrollWidth - testimonialTrack.clientWidth) / step()));
  const currentIndex = () => Math.min(maxIndex(), Math.round(testimonialTrack.scrollLeft / step()));
  const move = (index) => testimonialTrack.scrollTo({ left: Math.max(0, Math.min(index, maxIndex())) * step(), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  const updateDots = () => {
    [...dotWrap.children].forEach((dot, index) => dot.setAttribute('aria-current', String(index === currentIndex())));
    previous.disabled = currentIndex() === 0;
    next.disabled = currentIndex() === maxIndex();
  };
  const buildDots = () => {
    dotWrap.replaceChildren();
    for (let index = 0; index <= maxIndex(); index++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Tampilkan testimoni mulai kartu ' + (index + 1));
      dot.setAttribute('aria-controls', 'testimonial-track');
      dot.addEventListener('click', () => { move(index); sync(); });
      dotWrap.append(dot);
    }
    updateDots();
  };
  const sync = () => {
    clearInterval(timer);
    play.textContent = paused ? 'Putar otomatis' : 'Jeda otomatis';
    play.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !hovered && !dragging && !document.hidden && !section.contains(document.activeElement)) {
      timer = setInterval(() => move(currentIndex() >= maxIndex() ? 0 : currentIndex() + 1), 6000);
    }
  };
  section.querySelector('[data-testimonial-prev]').addEventListener('click', () => { move(currentIndex() <= 0 ? maxIndex() : currentIndex() - 1); sync(); });
  section.querySelector('[data-testimonial-next]').addEventListener('click', () => { move(currentIndex() >= maxIndex() ? 0 : currentIndex() + 1); sync(); });
  play.addEventListener('click', () => { paused = !paused; sync(); });
  testimonialTrack.addEventListener('scroll', updateDots, { passive: true });
  testimonialTrack.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(currentIndex() + (event.key === 'ArrowRight' ? 1 : -1));
  });
  testimonialTrack.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true;
    dragX = event.clientX;
    dragScroll = testimonialTrack.scrollLeft;
    testimonialTrack.setPointerCapture(event.pointerId);
    testimonialTrack.classList.add('is-dragging');
    sync();
  });
  testimonialTrack.addEventListener('pointermove', (event) => {
    if (dragging) testimonialTrack.scrollLeft = dragScroll + dragX - event.clientX;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    testimonialTrack.classList.remove('is-dragging');
    move(currentIndex());
    sync();
  };
  testimonialTrack.addEventListener('pointerup', endDrag);
  testimonialTrack.addEventListener('pointercancel', endDrag);
  section.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovered = true; sync(); } });
  section.addEventListener('pointerleave', () => { hovered = false; sync(); });
  testimonialTrack.addEventListener('touchstart', () => { clearInterval(timer); }, { passive: true });
  testimonialTrack.addEventListener('touchend', sync, { passive: true });
  testimonialTrack.addEventListener('touchcancel', sync, { passive: true });
  section.addEventListener('focusin', sync);
  section.addEventListener('focusout', () => setTimeout(sync, 0));
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; sync(); });
  window.addEventListener('resize', () => { move(currentIndex()); buildDots(); sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .2 }).observe(testimonialTrack);
  } else visible = true;
  buildDots();
  sync();
}

const revealTargets = [
  ['.hero .max-w-xl', 'reveal reveal-left'],
  ['.hero .shadow-soft', 'reveal reveal-right'],
  ['.section-heading', 'reveal'],
  ['.oke-section .oke-hero > *', 'reveal reveal-up'],
  ['.oke-section .plan', 'reveal reveal-up'],
  ['.oke-section .footnote', 'reveal'],
  ['.program-card', 'reveal reveal-up stagger-item'],
  ['.regular-card', 'reveal reveal-up stagger-item'],
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
