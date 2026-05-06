document.addEventListener('DOMContentLoaded', () => {

  // SCROLL ANIMATIONS
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // NAV SCROLL BEHAVIOUR
  const nav = document.querySelector('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // MOBILE MENU
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-label', 'Menü öffnen');
        document.body.style.overflow = '';
      });
    });
  }

  // RECHNER — calculate
  document.getElementById('rBtn')?.addEventListener('click', berechnen);

});

// RECHNER DATA
const TYPEN = {
  hochbeet: { prod: 'Hochbeet aktiv',      lpm: 0.5,  preis: 1.43 },
  gemuese:  { prod: 'Gemüsegarten aktiv',  lpm: 0.5,  preis: 1.43 },
  rasen:    { prod: 'Terra preta',         lpm: 0.3,  preis: 2.36 },
  balkon:   { prod: 'Balkon aktiv',        lpm: 0.4,  preis: 1.44 },
  park:     { prod: 'Starkdünger',         lpm: 0.25, preis: 2.28 },
  golf:     { prod: 'Terra preta',         lpm: 0.2,  preis: 2.36 },
  baum:     { prod: 'Baumringe',           lpm: 2.0,  preis: 1.70 },
};

function berechnen() {
  const fl    = parseInt(document.getElementById('rManual').value) || 100;
  const typ   = document.getElementById('rTyp').value;
  const boden = parseFloat(document.getElementById('rBoden').value);
  const t     = TYPEN[typ];
  const liter = Math.ceil(fl * t.lpm * boden);
  const preis = (liter * t.preis).toFixed(2).replace('.', ',');

  document.getElementById('resLiter').textContent = liter.toLocaleString('de-DE') + ' L';
  document.getElementById('resPreis').textContent = '€ ' + preis;
  document.getElementById('resProd').textContent  = t.prod;

  const r = document.getElementById('rResult');
  r.style.display = 'grid';
  requestAnimationFrame(() => r.classList.add('show'));
}
