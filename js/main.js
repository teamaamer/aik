/* ============================================
   AIK AUTO — MAIN JAVASCRIPT
   ============================================ */

// ---- Theme toggle ----
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aik-theme', next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}
initThemeToggle();

// Navbar scroll behavior
const navbar = document.querySelector('.navbar');
const hero = document.querySelector('.hero');

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  } else {
    if (hero) {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    } else {
      navbar.classList.add('scrolled');
    }
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Active nav link
function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') ||
        (currentPath === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}
setActiveNav();

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Language toggle
(function () {
  const LANG_KEY = 'aik-lang';

  function applyLang(lang) {
    const t = AIK_T[lang];
    if (!t) return;

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem(LANG_KEY, lang);

    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      const match = btn.textContent.trim().toLowerCase() === lang;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-pressed', match ? 'true' : 'false');
    });

    // text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    // inner HTML (for strings with <br>, <strong>, <span>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const v = t[el.dataset.i18nHtml];
      if (v !== undefined) el.innerHTML = v;
    });
    // placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const v = t[el.dataset.i18nPh];
      if (v !== undefined) el.placeholder = v;
    });
  }

  // Load saved language on page load
  const saved = localStorage.getItem(LANG_KEY) || 'en';
  applyLang(saved);

  // Button click
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLang(btn.textContent.trim().toLowerCase());
    });
  });
})();

// Filter chips (products page)
const filterChips = document.querySelectorAll('.filter-chip');
filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const originalText = btn.innerHTML;
    const lang = localStorage.getItem('aik-lang') || 'en';
    const sentTxt = (AIK_T[lang] && AIK_T[lang]['ct.sent']) || 'Message Sent!';
    btn.innerHTML = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg> ' + sentTxt;
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });
}

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 88;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Founder story carousel
(function () {
  const frame = document.getElementById('storyCarousel');
  if (!frame) return;

  const slides = Array.from(frame.querySelectorAll('.story-slide'));
  const dotsWrap = frame.closest('.story-carousel').querySelector('.story-dots');
  const total = slides.length;
  let current = 0;
  let timer;

  // Build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'story-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Go to image ${i + 1}`);
    btn.setAttribute('role', 'listitem');
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.story-dot'));

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  frame.querySelector('.story-arrow-prev').addEventListener('click', () => goTo(current - 1));
  frame.querySelector('.story-arrow-next').addEventListener('click', () => goTo(current + 1));

  // Pause on hover
  frame.addEventListener('mouseenter', () => clearInterval(timer));
  frame.addEventListener('mouseleave', resetTimer);

  // Keyboard support
  frame.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  resetTimer();
})();

// Stat counter animation
function animateCounter(el, target, suffix, duration) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.why-stat-num').forEach(el => {
      const raw = el.textContent.trim();
      const suffix = raw.replace(/[0-9]/g, '');
      const target = parseInt(raw, 10);
      el.textContent = '0' + suffix;
      animateCounter(el, target, suffix, 1600);
    });
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsBlock = document.querySelector('.why-stats');
if (statsBlock) statsObserver.observe(statsBlock);

// WhatsApp click tracking (placeholder)
document.querySelectorAll('[data-wa]').forEach(el => {
  el.addEventListener('click', () => {
    const msg = el.dataset.wa || 'Hello, I would like to request a spare part.';
    window.open(`https://wa.me/96500000000?text=${encodeURIComponent(msg)}`, '_blank');
  });
});
