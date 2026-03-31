(function () {
  // 1. Dynamic Greeting
  function updateGreeting() {
    const greetingEl = document.getElementById('hero-greeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let message = "Welcome";

    if (hour < 12) message = "Good Morning";
    else if (hour < 18) message = "Good Afternoon";
    else message = "Good Evening";

    greetingEl.textContent = `${message}, welcome to my portfolio.`;
  }

  // 2. STATIC DATA
  const PORTFOLIO_DATA = [
    {
      id: 'q1',
      src: 'uploads/quiz1.jpg.jpg',
      type: 'quiz',
      label: 'Networking Quiz 1'
    }
  ];

  const PASS_KEY = 'portfolio-passhash';
  const SESSION_KEY = 'portfolio-auth-session';

  function $(id) { return document.getElementById(id); }
  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function goto(path) { window.location.href = path; }

  async function sha256Hex(text) {
    try {
      if (!window.crypto || !crypto.subtle) return null;
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }

  function initSectionReveal() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
  }

  async function initLoginPage() {
    const form = $('login-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const pass = ($('login-passcode').value || '').trim();
      const digest = await sha256Hex(pass);
      const existing = localStorage.getItem(PASS_KEY);
      if (!existing || existing === (digest || pass)) {
        if (!existing) localStorage.setItem(PASS_KEY, digest || pass);
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
      } else {
        $('login-message').textContent = 'Wrong passcode.';
      }
    });
    if (isAuthed()) goto('index.html');
  }

  function initPortfolio() {
    const logoutBtn = $('btn-logout');
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        goto('login.html');
      });
    }

    const gallery = $('gallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    PORTFOLIO_DATA.forEach(it => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item section-reveal';
      fig.innerHTML = `
        <img src="${it.src}" alt="${it.label}">
        <figcaption>
          <span class="badge ${it.type}">${it.type.toUpperCase()}</span>
          ${it.label}
        </figcaption>
      `;
      gallery.appendChild(fig);
    });

    $('stat-total').textContent = PORTFOLIO_DATA.length;
    $('stat-quizzes').textContent = PORTFOLIO_DATA.filter(i => i.type === 'quiz').length;
    $('stat-activities').textContent = PORTFOLIO_DATA.filter(i => i.type === 'activity').length;
    initSectionReveal();
  }

  updateGreeting();
  if ($('login-form')) {
    initLoginPage();
  } else {
    isAuthed() ? initPortfolio() : goto('login.html');
  }
})();