const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

requestAnimationFrame(() => document.body.classList.add('is-loaded'));

/* ---------- Header: kleur per sectie ---------- */

const header = document.querySelector('.site-header');
const themed = [...document.querySelectorAll('main [data-theme], .site-footer')];

function updateHeader() {
  const y = window.scrollY;
  const probe = header.offsetHeight / 2;
  const under = themed.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top <= probe && r.bottom > probe;
  });
  header.classList.toggle('on-light', under?.dataset.theme === 'light');
  header.classList.toggle('is-solid', y > 40);
}

/* ---------- Mobiel menu ---------- */

const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
}
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Inkomende elementen ---------- */

const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
});
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

/* ---------- Woord-voor-woord inkleuren tijdens scrollen ---------- */

const wordfills = [...document.querySelectorAll('[data-wordfill]')].map((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  return { el, words: [...el.querySelectorAll('.w')] };
});

function updateWordfills() {
  const vh = window.innerHeight;
  wordfills.forEach(({ el, words }) => {
    const r = el.getBoundingClientRect();
    // begint als de bovenkant op 85% van het scherm staat, klaar rond 40%
    const progress = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.5)));
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
  });
}

/* ---------- Parallax ---------- */

const parallaxImgs = [...document.querySelectorAll('.parallax img')];

function updateParallax() {
  if (reduceMotion) return;
  const vh = window.innerHeight;
  parallaxImgs.forEach((img) => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const offset = (r.top + r.height / 2 - vh / 2) / vh;
    img.style.setProperty('--py', `${(offset * -6).toFixed(2)}%`);
  });
}

/* ---------- Scroll-loop ---------- */

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateHeader();
    updateWordfills();
    updateParallax();
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Pixelvelden: het logo-motief als levend raster ---------- */

// Hoe dichter bij de rechterkant (en bovenkant), hoe meer blokjes — de tekst links blijft vrij.
function pixelDensity(kind, x, y) {
  // op smalle schermen loopt de tekst over de volle breedte: dan alleen blokjes bovenin
  if (window.innerWidth < 700) return y > 0.28 ? 0 : Math.max(0, (x - 0.4) * 1.4) * (1 - y * 3);
  if (kind === 'hero') return y < 0.1 || y > 0.72 ? 0 : Math.max(0, (x - 0.62) * 1.9) * (1 - y * 0.5);
  if (kind === 'cta') return Math.max(0, (x - 0.6) * 1.6) * (0.4 + y * 0.6);
  return Math.max(0, (x - 0.58) * 1.5);
}

function buildPixelField(field) {
  const kind = field.dataset.pixels;
  const host = field.parentElement;
  const width = host.clientWidth;
  const cell = width < 700 ? 28 : Math.round(Math.max(44, Math.min(72, width / 26)));
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(host.clientHeight / cell);
  field.style.setProperty('--cols', cols);
  field.style.setProperty('--cell', `${cell}px`);
  field.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;

  // vaste pseudo-random reeks zodat het patroon niet bij elke resize verspringt
  let seed = kind.length * 7919;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const cells = [];
  const frag = document.createDocumentFragment();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = document.createElement('i');
      const d = pixelDensity(kind, c / cols, r / rows);
      const roll = rand();
      if (roll < d * 0.32) i.className = rand() < 0.35 ? 'd' : 'l';
      else if (d > 0 && roll < d * 0.32 + 0.06) i.className = 'g';
      frag.appendChild(i);
      cells.push(i);
    }
  }
  field.replaceChildren(frag);

  const filled = cells.filter((i) => i.className);
  filled.forEach((i) => {
    const delay = reduceMotion ? 0 : 200 + rand() * 1400;
    setTimeout(() => i.classList.add('on'), delay);
  });

  if (reduceMotion) return;

  // af en toe een blokje laten oplichten of verspringen
  clearInterval(field._timer);
  field._timer = setInterval(() => {
    if (document.hidden) return;
    const i = cells[Math.floor(Math.random() * cells.length)];
    const d = pixelDensity(kind, (cells.indexOf(i) % cols) / cols, Math.floor(cells.indexOf(i) / cols) / rows);
    if (d <= 0.05) return;
    i.classList.add('flash');
    setTimeout(() => i.classList.remove('flash'), 900);
  }, 260);

  // cursor laat blokjes oplichten
  host.onpointermove = (e) => {
    const rect = host.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / cell);
    const r = Math.floor((e.clientY - rect.top) / cell);
    const i = cells[r * cols + c];
    if (!i || i.classList.contains('flash')) return;
    i.classList.add('flash');
    setTimeout(() => i.classList.remove('flash'), 700);
  };
}

const pixelFields = [...document.querySelectorAll('[data-pixels]')];
pixelFields.forEach(buildPixelField);
let resizeTimer;
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth === lastWidth) return; // negeer hoogte-wijzigingen door mobiele adresbalk
  lastWidth = window.innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => pixelFields.forEach(buildPixelField), 250);
});

/* ---------- Zeef van Eratosthenes: priemgetallen lichten op ---------- */

const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

// Logovariant: 1 t/m 81 in vierkante schillen. Schil k loopt van (k-1)²+1 tot k²:
// k² in de hoek, de oneven getallen in de bovenrij, de even getallen in de linkerkolom.
// De priemgetallen vormen samen het logo; DARK_PRIMES zijn de donkerblauwe blokken ervan.
const DARK_PRIMES = [5, 13, 37, 43, 61, 73];
const logoNumber = (r, c, size) => {
  const m = Math.min(r, c);
  const sq = (size - m) ** 2;
  const d = Math.max(r, c) - m;
  if (d === 0) return sq;
  return sq - 2 * d + ((r === m) === (sq % 2 === 0) ? 1 : 0);
};

document.querySelectorAll('[data-sieve]').forEach((sieve) => {
  const logo = sieve.dataset.sieve === 'logo';
  const numbers = [];
  if (logo) {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) numbers.push(logoNumber(r, c, 9));
  } else {
    for (let n = 1; n <= 100; n++) numbers.push(n);
  }
  const primes = [];
  const dark = [];
  numbers.forEach((n) => {
    const s = document.createElement('span');
    s.textContent = n;
    if (isPrime(n)) {
      s.className = 'p';
      primes[n] = s;
      if (logo && DARK_PRIMES.includes(n)) dark.push(s);
    } else s.className = 'x';
    sieve.appendChild(s);
  });
  const ordered = primes.filter(Boolean);
  const step = reduceMotion ? 0 : 70;
  const light = () => {
    ordered.forEach((s, k) => {
      const ice = logo || k % 3 === 2;
      setTimeout(() => s.classList.add('lit', ...(ice ? ['ice'] : [])), k * step);
    });
    if (logo) {
      const start = ordered.length * step + (reduceMotion ? 0 : 500);
      dark.forEach((s, k) => setTimeout(() => s.classList.remove('ice'), start + k * step * 2));
    }
  };
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    light();
    obs.disconnect();
  }, { threshold: 0.35 }).observe(sieve);
});

/* ---------- Projectfilter ---------- */

const filters = document.querySelectorAll('.filter');
filters.forEach((btn) => btn.addEventListener('click', () => {
  filters.forEach((b) => {
    b.classList.toggle('is-active', b === btn);
    b.setAttribute('aria-pressed', b === btn);
  });
  const type = btn.dataset.filter;
  document.querySelectorAll('.pj-row').forEach((row) => {
    row.classList.toggle('is-hidden', type !== 'all' && row.dataset.type !== type);
  });
}));
