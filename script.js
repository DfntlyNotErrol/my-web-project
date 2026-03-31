(function () {
  // 1. Dynamic Greeting Logic
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

  // 2. STATIC DATA: Gallery Items
  const PORTFOLIO_DATA = [
    {
      id: 'q1',
      src: 'uploads/quiz1.jpg.jpg', // Matches your GitHub filename
      type: 'quiz',
      label: 'Networking Quiz 1',
      date: '2026-03-24'
    }
  ];

  // Keys & Constants
  const PASS_KEY = 'portfolio-passhash';
  const SESSION_KEY = 'portfolio-auth-session';
  const ATTACHMENTS_V2_KEY = 'portfolio-attachments-v2';

  function $(id) { return document.getElementById(id); }
  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function goto(path) { window.location.href = path; }

  // Auth Security
  async function sha256Hex(text) {
    try {
      if (!window.crypto || !crypto.subtle) return null;
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }

  // Animation logic
  function initSectionReveal() {
    var sections = document.querySelectorAll('.section-reveal');
    if (typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
      sections.forEach(function (el) { if (!el.classList.contains('visible')) observer.observe(el); });
    } else {
      sections.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  // Login Logic
  async function initLoginPage() {
    const form = $('login-form');
    if (!form) return;
    const passInput = $('login-passcode');
    const msg = $('login-message');
    
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const pass = (passInput.value || '').trim();
      const digest = await sha256Hex(pass);
      const candidate = digest || pass;
      const existing = localStorage.getItem(PASS_KEY);

      if (!existing) {
        localStorage.setItem(PASS_KEY, candidate);
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
      } else if (existing === candidate) {
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
      } else {
        msg.textContent = 'Wrong passcode.';
      }
    });
    if (isAuthed()) goto('index.html');
  }

  // Gallery Logic
  function initPortfolio() {
    const logoutBtn = $('btn-logout');
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem(SESSION_KEY);
        goto('login.html');
      });
    }

    const gallery = $('gallery');
    const statTotal = $('stat-total');
    const statQuizzes = $('stat-quizzes');
    const statActivities = $('stat-activities');

    if (!gallery) return;

    function renderGallery() {
      gallery.innerHTML = '';
      const dynamicItems = JSON.parse(localStorage.getItem(ATTACHMENTS_V2_KEY) || '[]');
      const allItems = [...PORTFOLIO_DATA, ...dynamicItems];

      if (!allItems.length) {
        gallery.innerHTML = '<p class="gallery-empty">No pictures found.</p>';
        return;
      }

      allItems.forEach(function (it) {
        const fig = document.createElement('figure');
        fig.className = 'gallery-item section-reveal';
        const img = document.createElement('img');
        img.src = it.src || it.dataUrl;
        img.alt = it.label;
        img.loading = "lazy";
        const cap = document.createElement('figcaption');
        cap.innerHTML = `<span class="badge ${it.type}">${it.type.toUpperCase()}</span> ${it.label}`;
        fig.appendChild(img);
        fig.appendChild(cap);
        gallery.appendChild(fig);
      });

      if (statTotal) statTotal.textContent = allItems.length;
      if (statQuizzes) statQuizzes.textContent = allItems.filter(i => i.type === 'quiz').length;
      if (statActivities) statActivities.textContent = allItems.filter(i => i.type === 'activity').length;
      initSectionReveal();
    }
    renderGallery();
  }

  // --- Start the App ---
  initSectionReveal();
  updateGreeting();

  if ($('login-form')) {
    initLoginPage();
  } else {
    if (!isAuthed()) {
      goto('login.html');
    } else {
      initPortfolio();
    }
  }
})();