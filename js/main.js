document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── SCROLL PROGRESS BAR ──────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / max * 100).toFixed(1) + '%';
  }, { passive: true });

  // ─── SCROLL REVEAL ────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ─── HERO IMAGE PARALLAX ENTRANCE ─────────────────────────
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    setTimeout(() => heroImg.classList.add('loaded'), 100);
  }

  // ─── COUNTER ANIMATION ────────────────────────────────────
  function parseCounter(text) {
    const t = text.trim();
    const m = t.match(/^([\d,.]+)\s*(.*)$/);
    if (!m) return null;
    const raw = parseFloat(m[1].replace(',', '.'));
    if (isNaN(raw)) return null;
    const unit = m[2];
    const useComma = m[1].includes(',');
    const decimals = useComma ? (m[1].split(',')[1] || '').length : 0;
    return { raw, unit, useComma, decimals, original: t };
  }

  function runCounter(el, data) {
    const { raw, unit, useComma, decimals, original } = data;
    const duration = prefersReducedMotion ? 0 : 1100;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // ease-out-expo
      const current = raw * eased;
      let display = decimals > 0
        ? current.toFixed(decimals).replace('.', useComma ? ',' : '.')
        : Math.round(current).toString();
      el.textContent = unit ? `${display} ${unit}` : display;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = original;
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const data = parseCounter(e.target.textContent);
      if (data) runCounter(e.target, data);
      counterObserver.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.hstat-n, .pb-num, .fact-n').forEach((el) => {
    counterObserver.observe(el);
  });

  // ─── MARQUEE SETUP ────────────────────────────────────────
  const partnersRow = document.querySelector('.partners-row');
  if (partnersRow) {
    const spans = [...partnersRow.querySelectorAll('span')];
    if (spans.length) {
      const ticker = document.createElement('div');
      ticker.className = 'partners-ticker';
      const track = document.createElement('div');
      track.className = 'partners-track';

      // Two full copies for seamless infinite scroll
      [0, 1].forEach(() => {
        spans.forEach((s) => {
          const clone = s.cloneNode(true);
          track.appendChild(clone);
        });
      });

      ticker.appendChild(track);
      partnersRow.replaceWith(ticker);
    }
  }

  // ─── NAV BURGER ───────────────────────────────────────────
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

  // ─── NAV SCROLL SHADOW ────────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 2px 20px rgba(0,0,0,.3)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── ZIELGRUPPEN TABS (with slide animation) ───────────────
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
        p.classList.remove('zg-panel--active', 'zg-panel--entering');
        p.hidden = true;
      });

      tab.classList.add('zg-tab--active');
      tab.setAttribute('aria-selected', 'true');
      if (targetPanel) {
        targetPanel.classList.add('zg-panel--active');
        targetPanel.hidden = false;
        // Trigger enter animation on next frame
        requestAnimationFrame(() => {
          targetPanel.classList.add('zg-panel--entering');
        });
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

  // ─── CONTACT FORM (with field shake) ──────────────────────
  const form = document.getElementById('kontakt-form');
  const formSuccess = document.getElementById('form-success');

  if (form && formSuccess) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameField  = form.querySelector('#f-name');
      const emailField = form.querySelector('#f-email');
      let valid = true;

      [nameField, emailField].forEach((field) => {
        field.style.borderColor = '';
        field.classList.remove('field-shake');
      });

      [nameField, emailField].forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e07070';
          valid = false;
          // Trigger shake animation
          void field.offsetWidth; // force reflow to restart animation
          field.classList.add('field-shake');
          field.addEventListener('animationend', () => field.classList.remove('field-shake'), { once: true });
        }
      });

      if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = '#e07070';
        valid = false;
        void emailField.offsetWidth;
        emailField.classList.add('field-shake');
        emailField.addEventListener('animationend', () => emailField.classList.remove('field-shake'), { once: true });
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

  // ─── SMOOTH SCROLL FOR NAV LINKS ──────────────────────────
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
