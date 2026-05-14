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

  // ─── ROI-RECHNER ─────────────────────────────────────────────
  const ROI_CATALOG = {
    pflanzenkohle: { name: 'Pflanzenkohle',           desc: 'Speichert Wasser & Nährstoffe, bindet dauerhaft CO₂.',       dosierung: 50,  pricePerL: 2.59 },
    terrapreta:    { name: 'Terra Preta Konzentrat',  desc: 'Aktives Bodenleben und dauerhafter Humusaufbau.',             dosierung: 10,  pricePerL: 2.99 },
    hochbeet:      { name: 'Hochbeet aktiv',          desc: 'Schnelle Nährstofffreisetzung für üppiges Wachstum.',         dosierung: 30,  pricePerL: 1.90 },
    gemuese:       { name: 'Gemüsegarten aktiv',      desc: 'Ausgewogene Grundversorgung für gesunde Ernte.',             dosierung: 30,  pricePerL: 1.90 },
    baumring:      { name: 'Baumring aktiv',           desc: 'Gezielter Wasserspeicher im Wurzelbereich.',                 dosierung: 20,  pricePerL: 2.10 },
    duenger:       { name: 'Dünger stark',             desc: 'Sofortwirkung bei Nährstoffmangel und hohem Düngebedarf.',   dosierung: 10,  pricePerL: 2.79 },
    gartenerde:    { name: 'Gartenerde',               desc: 'Hochwertige, torffreie Trägererde für alle Anwendungen.',    dosierung: 80,  pricePerL: 1.65 },
  };

  const ROI_PROB_MAP = {
    'Boden trocknet schnell aus':   { p: 'pflanzenkohle', s: 'terrapreta'  },
    'Schlechte Wasserspeicherung':  { p: 'pflanzenkohle', s: 'gartenerde'  },
    'Humusarmut':                   { p: 'terrapreta',    s: 'pflanzenkohle'},
    'Verdichteter Boden':           { p: 'pflanzenkohle', s: 'gartenerde'  },
    'Schwaches Wachstum':           { p: 'hochbeet',      s: 'duenger'     },
    'Geringe Erträge':              { p: 'gemuese',       s: 'hochbeet'    },
    'Nährstoffmangel':              { p: 'duenger',       s: 'gemuese'     },
    'Schlechte Durchwurzelung':     { p: 'baumring',      s: 'terrapreta'  },
    'Zu hoher Bewässerungsaufwand': { p: 'pflanzenkohle', s: 'terrapreta'  },
    'Hoher Düngerbedarf':           { p: 'terrapreta',    s: 'pflanzenkohle'},
    'Hohe Pflegekosten':            { p: 'terrapreta',    s: 'pflanzenkohle'},
    'Häufige Nachsaaten':           { p: 'gemuese',       s: 'duenger'     },
    'CO₂-Reduktion zu gering':      { p: 'pflanzenkohle', s: 'terrapreta'  },
    'Regenerative Bodenpflege':     { p: 'terrapreta',    s: 'pflanzenkohle'},
    'Torfersatz gesucht':           { p: 'gartenerde',    s: 'terrapreta'  },
  };

  const ROI_SAV = {
    wasser:   { rate: 0.30, cost: 5.00  },
    duenger:  { rate: 0.40, cost: 1.50  },
    nachsaat: { rate: 0.50, cost: 10.00 },
    arbeit:   { rate: 0.25, cost: 50.00 },
  };

  const roiSection = document.getElementById('roi-rechner');
  if (roiSection) {
    let calcData = { volumen: 0, bodenFactor: 0, anwendungFactor: 1, probs: [] };
    let totalInvestment = 0;

    const scrollToRoi = () => {
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      window.scrollTo({ top: roiSection.offsetTop - navH - 16, behavior: 'smooth' });
    };

    const goToStep = (step) => {
      [1, 2, 3].forEach((n) => {
        const panel = document.getElementById(`roi-p${n}`);
        const dot   = document.getElementById(`roi-sd-${n}`);
        if (panel) panel.hidden = (n !== step);
        if (dot) {
          dot.classList.toggle('roi-stepdot--active', n === step);
          dot.classList.toggle('roi-stepdot--done',   n < step);
        }
        if (n < 3) {
          const line = document.getElementById(`roi-sl-${n}`);
          if (line) line.classList.toggle('roi-stepline--done', n < step);
        }
      });
      scrollToRoi();
    };

    // ── Step 1 ──
    const probCBs   = roiSection.querySelectorAll('[name="problem"]');
    const probCount = document.getElementById('roi-prob-count');

    const refreshProbCount = () => {
      const n = [...probCBs].filter((c) => c.checked).length;
      if (probCount) {
        probCount.textContent = `${n} / 3 ausgewählt`;
        probCount.style.color      = n === 3 ? 'var(--forest)' : '';
        probCount.style.background = n === 3 ? 'rgba(27,77,16,.1)' : '';
      }
      probCBs.forEach((cb) => { if (!cb.checked) cb.disabled = (n >= 3); });
    };
    probCBs.forEach((cb) => cb.addEventListener('change', refreshProbCount));

    document.getElementById('roi-next-1')?.addEventListener('click', () => {
      const selected = [...probCBs].filter((c) => c.checked).map((c) => c.value);
      if (!selected.length) {
        if (probCount) { probCount.textContent = 'Bitte mindestens 1 Problem auswählen'; probCount.style.color = '#c0392b'; }
        return;
      }
      calcData.probs = selected;
      goToStep(2);
    });

    // ── Step 2 ──
    const laengeEl = document.getElementById('roi-laenge');
    const breiteEl = document.getElementById('roi-breite');
    const tiefeEl  = document.getElementById('roi-tiefe');
    const areaDisp = document.getElementById('roi-area-disp');
    const volVal   = document.getElementById('roi-vol-val');

    const updateVol = () => {
      const l = parseFloat(laengeEl?.value) || 0;
      const b = parseFloat(breiteEl?.value) || 0;
      const t = parseFloat(tiefeEl?.value)  || 0;
      const area = l * b;
      const vol  = area * (t / 100);
      if (areaDisp) areaDisp.textContent = area > 0 ? `${area.toFixed(1)} m²` : '– m²';
      if (volVal)   volVal.textContent   = vol  > 0 ? vol.toFixed(2) : '–';
      calcData.volumen = vol;
    };

    [laengeEl, breiteEl, tiefeEl].forEach((el) => el?.addEventListener('input', updateVol));

    roiSection.querySelectorAll('.roi-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        roiSection.querySelectorAll('.roi-preset').forEach((b) => b.classList.remove('roi-preset--active'));
        btn.classList.add('roi-preset--active');
        if (tiefeEl) tiefeEl.value = btn.dataset.tiefe;
        updateVol();
      });
    });

    roiSection.querySelectorAll('[name="boden"]').forEach((r) => {
      r.addEventListener('change', () => { calcData.bodenFactor = parseFloat(r.value); });
    });
    roiSection.querySelectorAll('[name="anwendung"]').forEach((r) => {
      r.addEventListener('change', () => { calcData.anwendungFactor = parseFloat(r.value); });
    });

    document.getElementById('roi-back-2')?.addEventListener('click', () => goToStep(1));

    document.getElementById('roi-next-2')?.addEventListener('click', () => {
      if (!calcData.volumen) {
        [laengeEl, breiteEl].forEach((el) => {
          if (el) { el.style.borderColor = '#c0392b'; setTimeout(() => { el.style.borderColor = ''; }, 2000); }
        });
        return;
      }
      computeResults();
      goToStep(3);
    });

    // ── Step 3: compute ──
    const computeResults = () => {
      const { volumen, bodenFactor, anwendungFactor, probs } = calcData;

      // Score products
      const scores = {};
      probs.forEach((prob) => {
        const map = ROI_PROB_MAP[prob];
        if (!map) return;
        scores[map.p] = (scores[map.p] || 0) + 2;
        scores[map.s] = (scores[map.s] || 0) + 1;
      });
      const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
      if (!ranked.length) ranked.push('pflanzenkohle');

      const factor = Math.max(0.1, anwendungFactor * (1 + bodenFactor));
      let totalPrice = 0;

      const recContainer = document.getElementById('roi-rec-cards');
      if (recContainer) {
        const rankLabels = ['Primär', 'Ergänzend', 'Empfohlen'];
        recContainer.innerHTML = ranked.map((key, i) => {
          const prod   = ROI_CATALOG[key];
          const liters = Math.max(1, Math.ceil(volumen * prod.dosierung * factor));
          const price  = liters * prod.pricePerL;
          totalPrice  += price;
          return `<div class="roi-rec-card">
            <div class="roi-rec-rank">${rankLabels[i] || 'Empfohlen'}</div>
            <div class="roi-rec-name">${prod.name}</div>
            <div class="roi-rec-desc">${prod.desc}</div>
            <div class="roi-rec-liters">≈ ${liters} Liter</div>
            <div class="roi-rec-price">ca. ${price.toFixed(2).replace('.', ',')} €</div>
          </div>`;
        }).join('');
      }

      const totalEl = document.getElementById('roi-total');
      if (totalEl) totalEl.textContent = `ca. ${totalPrice.toFixed(2).replace('.', ',')} €`;
      totalInvestment = totalPrice;

      const bereich = document.getElementById('roi-bereich')?.value;
      const metaEl  = document.getElementById('roi-meta-disp');
      if (metaEl) metaEl.textContent = `${volumen.toFixed(2)} m³${bereich ? ' · ' + bereich : ''}`;

      // Reset savings
      Object.keys(ROI_SAV).forEach((key) => {
        const inp = document.getElementById(`sav-${key}`);
        const res = document.getElementById(`sav-${key}-r`);
        if (inp) inp.value = '';
        if (res) res.textContent = '';
      });
      const summaryEl = document.getElementById('roi-summary');
      if (summaryEl) summaryEl.hidden = true;
    };

    // ── Savings live update ──
    const updateSavings = () => {
      let total = 0;
      let hasInput = false;
      Object.entries(ROI_SAV).forEach(([key, cfg]) => {
        const val = parseFloat(document.getElementById(`sav-${key}`)?.value) || 0;
        const res = document.getElementById(`sav-${key}-r`);
        if (val > 0) {
          hasInput = true;
          const saving = val * cfg.cost * cfg.rate;
          total += saving;
          if (res) res.textContent = `− ${saving.toFixed(0)} €/Jahr`;
        } else {
          if (res) res.textContent = '';
        }
      });
      const summaryEl = document.getElementById('roi-summary');
      if (!summaryEl) return;
      if (hasInput) {
        summaryEl.hidden = false;
        const invest = document.getElementById('roi-sum-invest');
        const savings = document.getElementById('roi-sum-savings');
        const amort   = document.getElementById('roi-sum-amort');
        if (invest)  invest.textContent  = `${totalInvestment.toFixed(2).replace('.', ',')} €`;
        if (savings) savings.textContent = `${total.toFixed(0)} €`;
        if (amort)   amort.textContent   = total > 0 ? `${(totalInvestment / total).toFixed(1)} Jahre` : '–';
      } else {
        summaryEl.hidden = true;
      }
    };

    Object.keys(ROI_SAV).forEach((key) => {
      document.getElementById(`sav-${key}`)?.addEventListener('input', updateSavings);
    });

    // ── Back & Reset ──
    document.getElementById('roi-back-3')?.addEventListener('click', () => goToStep(2));

    document.getElementById('roi-reset')?.addEventListener('click', () => {
      probCBs.forEach((cb) => { cb.checked = false; cb.disabled = false; });
      refreshProbCount();
      const berEl = document.getElementById('roi-bereich');
      if (berEl) berEl.value = '';
      if (laengeEl) laengeEl.value = '';
      if (breiteEl) breiteEl.value = '';
      if (tiefeEl)  tiefeEl.value = '20';
      if (areaDisp) areaDisp.textContent = '– m²';
      if (volVal)   volVal.textContent   = '–';
      roiSection.querySelectorAll('[name="boden"], [name="anwendung"]').forEach((r) => { r.checked = false; });
      roiSection.querySelectorAll('.roi-preset').forEach((b) => b.classList.remove('roi-preset--active'));
      roiSection.querySelector('[data-tiefe="20"]')?.classList.add('roi-preset--active');
      calcData = { volumen: 0, bodenFactor: 0, anwendungFactor: 1, probs: [] };
      totalInvestment = 0;
      goToStep(1);
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

  // ─── ZIELGRUPPEN IMAGE LIGHTBOX ───────────────────────────
  const lb = document.createElement('div');
  lb.className = 'zg-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<img class="zg-lightbox-img" alt=""><button class="zg-lightbox-close" aria-label="Schließen">✕</button>';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('.zg-lightbox-img');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.zg-visual img, .kontakt-recipe img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  lb.querySelector('.zg-lightbox-close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

});
