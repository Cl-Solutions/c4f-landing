document.addEventListener('DOMContentLoaded', () => {

  // ─── SCROLL REVEAL ──────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ─── HERO IMAGE PARALLAX ENTRANCE ───────────────────────────
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    setTimeout(() => heroImg.classList.add('loaded'), 100);
  }

  // ─── NAV BURGER ─────────────────────────────────────────────
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('is-open', isOpen);
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mob-link').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── NAV SCROLL SHADOW ──────────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 2px 20px rgba(0,0,0,.3)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── ZIELGRUPPEN TABS ────────────────────────────────────────
  const tabs = document.querySelectorAll('.zg-tab');
  const panels = document.querySelectorAll('.zg-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);

      tabs.forEach((t) => {
        t.classList.remove('zg-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => {
        p.classList.remove('zg-panel--active');
        p.hidden = true;
      });

      tab.classList.add('zg-tab--active');
      tab.setAttribute('aria-selected', 'true');
      if (targetPanel) {
        targetPanel.classList.add('zg-panel--active');
        targetPanel.hidden = false;
      }
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      const tabList = [...tabs];
      const idx = tabList.indexOf(tab);
      let next = -1;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabList.length;
      if (e.key === 'ArrowLeft')  next = (idx - 1 + tabList.length) % tabList.length;
      if (next >= 0) { tabList[next].focus(); tabList[next].click(); }
    });
  });

  // ─── CONTACT FORM ────────────────────────────────────────────
  const form = document.getElementById('kontakt-form');
  const formSuccess = document.getElementById('form-success');

  if (form && formSuccess) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name  = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      let valid = true;

      [name, email].forEach((field) => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#e07070';
          valid = false;
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#e07070';
        valid = false;
      }

      if (!valid) return;

      const btn = form.querySelector('.form-btn');
      btn.textContent = 'Wird gesendet …';
      btn.disabled = true;

      setTimeout(() => {
        form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach((f) => f.value = '');
        formSuccess.hidden = false;
        btn.hidden = true;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 800);
    });
  }

  // ─── SMOOTH SCROLL FOR NAV LINKS ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
