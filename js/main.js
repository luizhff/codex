'use strict';

// ── Cart ──
let cartCount = 0;
const cartCountEl = document.getElementById('cartCount');
const toast = document.getElementById('toast');
const stickyBuy = document.getElementById('stickyBuy');
const stickyBuyBtn = document.getElementById('stickyBuyBtn');
const WHATSAPP_NUMBER = '5599999999999';
const whatsappMessage = encodeURIComponent(
  'Olá! Tenho interesse no iPhone 13 Pro Max 128GB seminovo de R$ 3.000,00. Pode me enviar mais detalhes?'
);

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('toast--show');
  setTimeout(() => toast.classList.remove('toast--show'), 2800);
}

function addToCart(storage, price) {
  cartCount = 1;
  cartCountEl.textContent = cartCount;
  showToast(`✓ iPhone 13 Pro Max seminovo ${storage} reservado no carrinho!`);
}

// last item added — passed to checkout
let lastStorage = '128GB';
let lastPrice   = 3000;

document.getElementById('buyHeroBtn').addEventListener('click', () => {
  addToCart('128GB', 3000);
  lastStorage = '128GB'; lastPrice = 3000;
  if (window.openCheckout) window.openCheckout('128GB', 3000);
});

document.getElementById('demoBuyBtn')?.addEventListener('click', () => {
  addToCart('128GB', 3000);
  lastStorage = '128GB'; lastPrice = 3000;
  if (window.openCheckout) window.openCheckout('128GB', 3000);
});

document.querySelectorAll('[data-storage]').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = btn.dataset.storage;
    const p = Number(btn.dataset.price);
    addToCart(s, p);
    lastStorage = s; lastPrice = p;
    if (window.openCheckout) window.openCheckout(s, p);
  });
});

document.getElementById('cartBtn').addEventListener('click', () => {
  if (cartCount === 0) { showToast('Seu carrinho está vazio.'); return; }
  if (window.openCheckout) window.openCheckout(lastStorage, lastPrice);
});

if (stickyBuyBtn) {
  stickyBuyBtn.addEventListener('click', () => {
    addToCart('128GB', 3000);
    lastStorage = '128GB'; lastPrice = 3000;
    if (window.openCheckout) window.openCheckout('128GB', 3000);
  });
}

document.querySelectorAll('#pricingWhatsApp, #stickyWhatsApp').forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
});

// ── Color Picker ──
const swatches = document.querySelectorAll('.color-swatch');
const colorLabel = document.getElementById('colorLabel');
const heroPhone = document.getElementById('heroPhone');
window.selectedColor = 'Sierra Blue';
let selectedColor = window.selectedColor;

swatches.forEach(sw => {
  sw.addEventListener('click', () => {
    swatches.forEach(s => s.classList.remove('color-swatch--active'));
    sw.classList.add('color-swatch--active');
    colorLabel.textContent = sw.dataset.color;
    selectedColor = sw.dataset.color;
    window.selectedColor = selectedColor;
    if (heroPhone && sw.dataset.img) {
      heroPhone.style.opacity = '0';
      heroPhone.src = sw.dataset.img;
      heroPhone.onload = () => { heroPhone.style.opacity = '1'; };
    }
    const stickyImg = document.querySelector('.sticky-buy__product img');
    if (stickyImg && sw.dataset.img) stickyImg.src = sw.dataset.img;
  });
});

// ── FAQ Accordion ──
document.querySelectorAll('.faq-item__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('faq-item--open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('faq-item--open'));
    if (!isOpen) item.classList.add('faq-item--open');
  });
});

// ── Mobile menu ──
const mobileMenu        = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const navHamburger      = document.getElementById('navHamburger');
const mobileMenuClose   = document.getElementById('mobileMenuClose');

function openMobileMenu() {
  mobileMenu.classList.add('mobile-menu--open');
  navHamburger.classList.add('nav__hamburger--open');
  navHamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu.classList.remove('mobile-menu--open');
  navHamburger.classList.remove('nav__hamburger--open');
  navHamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navHamburger.addEventListener('click', openMobileMenu);
mobileMenuClose.addEventListener('click', closeMobileMenu);
mobileMenuOverlay.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

document.getElementById('mobileMenuBuy').addEventListener('click', () => {
  closeMobileMenu();
  addToCart('128GB', 3000);
  lastStorage = '128GB'; lastPrice = 3000;
  if (window.openCheckout) window.openCheckout('128GB', 3000);
});

// ── Header scroll shadow ──
// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = document.getElementById('themeToggleIcon');
const savedTheme = localStorage.getItem('istore-theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  themeToggleIcon.textContent = isDark ? '☀' : '☾';
  localStorage.setItem('istore-theme', theme);
}

applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  applyTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
});

// Scroll reveal
const revealTargets = document.querySelectorAll(
  '.colors, .spec-card, .condition-panel, .condition-check, .included-item, .gallery-card, .demo-video__copy, .demo-video__frame, .pricing-card, .faq-item, .reviews__summary, .review-card'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
} else {
  revealTargets.forEach(el => el.classList.add('reveal--visible'));
}

// Gallery lightbox
const galleryCards = [...document.querySelectorAll('.gallery-card')];
const lightbox = document.getElementById('galleryLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let activeGalleryIndex = 0;

function setLightboxImage(index) {
  activeGalleryIndex = (index + galleryCards.length) % galleryCards.length;
  const card = galleryCards[activeGalleryIndex];
  const img = card.querySelector('img');
  const title = card.querySelector('.gallery-card__label')?.textContent || img.alt;
  const desc = card.querySelector('.gallery-card__desc')?.textContent || '';

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = desc ? `${title} - ${desc}` : title;
}

function openLightbox(index) {
  setLightboxImage(index);
  lightbox.classList.add('lightbox--open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('lightbox--open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

galleryCards.forEach((card, index) => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('click', () => openLightbox(index));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => setLightboxImage(activeGalleryIndex - 1));
lightboxNext.addEventListener('click', () => setLightboxImage(activeGalleryIndex + 1));
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--open')) {
    closeMobileMenu();
    return;
  }

  if (!lightbox.classList.contains('lightbox--open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') setLightboxImage(activeGalleryIndex - 1);
  if (e.key === 'ArrowRight') setLightboxImage(activeGalleryIndex + 1);
});

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.1)' : 'none';
  if (stickyBuy) {
    const pricing = document.getElementById('pricing');
    const pricingTop = pricing ? pricing.getBoundingClientRect().top : 0;
    stickyBuy.classList.toggle('sticky-buy--visible', window.scrollY > 520 && pricingTop > 120);
  }
}, { passive: true });
