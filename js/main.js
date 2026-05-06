document.addEventListener('DOMContentLoaded', () => {

  // SCROLL ANIMATIONS
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // MOBILE MENU
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-label', 'Menü öffnen');
      });
    });
  }

  // RECHNER – slider & manual input sync
  const slider = document.getElementById('rSlider');
  const manual = document.getElementById('rManual');
  const sliderVal = document.getElementById('sliderVal');

  if (slider && manual && sliderVal) {
    slider.addEventListener('input', () => {
      sliderVal.textContent = slider.value + ' m²';
      manual.value = slider.value;
    });

    manual.addEventListener('input', () => {
      const v = Math.min(parseInt(manual.value) || 1, 5000);
      slider.value = v;
      sliderVal.textContent = v + ' m²';
    });
  }

  // RECHNER – calculate button
  const rBtn = document.getElementById('rBtn');
  if (rBtn) rBtn.addEventListener('click', berechnen);

});

// RECHNER – calculation
const TYPEN = {
  hochbeet: { prod: 'Hochbeet aktiv',     lpm: 0.5,  preis: 1.43 },
  gemuese:  { prod: 'Gemüsegarten aktiv', lpm: 0.5,  preis: 1.43 },
  rasen:    { prod: 'Terra preta',        lpm: 0.3,  preis: 2.36 },
  balkon:   { prod: 'Balkon aktiv',       lpm: 0.4,  preis: 1.44 },
  park:     { prod: 'Starkdünger',        lpm: 0.25, preis: 2.28 },
  golf:     { prod: 'Terra preta',        lpm: 0.2,  preis: 2.36 },
  baum:     { prod: 'Baumringe',          lpm: 2.0,  preis: 1.70 },
};

function berechnen() {
  const fl    = parseInt(document.getElementById('rSlider').value) || 100;
  const typ   = document.getElementById('rTyp').value;
  const boden = parseFloat(document.getElementById('rBoden').value);
  const t     = TYPEN[typ];
  const liter = Math.ceil(fl * t.lpm * boden);
  const preis = (liter * t.preis).toFixed(2);

  document.getElementById('resLiter').textContent = liter + ' L';
  document.getElementById('resPreis').textContent = '€ ' + preis;
  document.getElementById('resProd').textContent  = t.prod;

  const r = document.getElementById('rResult');
  r.style.display = 'grid';
  requestAnimationFrame(() => r.classList.add('show'));
}
