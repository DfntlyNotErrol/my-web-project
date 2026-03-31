(function () {
  // 1. Dynamic Greeting Logic
  // Updates the hero text based on the user's local time
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

  // 2. STATIC DATA: Add your local images here
  const PORTFOLIO_DATA = [
    {
      id: 'q1',
      src: 'uploads/quiz1.jpg.jpg', // Matches your current GitHub filename
      type: 'quiz',
      label: 'Networking Quiz 1'
    }
    // To add more, copy the block above and paste it here!
  ];

  // Storage Keys
  const PASS_KEY = 'portfolio-passhash';
  const SESSION_KEY = 'portfolio-auth-session';

  // Helper Functions
  function $(id) { return document.getElementById(id); }
  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function goto(path) { window.location.href = path; }

  // Security: Hash the passcode for safer storage
  async function sha256Hex(text) {
    try {
      if (!window.crypto || !crypto.subtle) return null;
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }

  // Animation: Reveal elements as the user scrolls
  function initSectionReveal() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
  }

  // 3. LOGIN PAGE LOGIC
  async function initLoginPage() {
    const form = $('login-form');
    if (!form) return;
    
    const passInput = $('login-passcode');
    const msg = $('login-message');
    const resetBtn = $('login-reset');

    // Handle Login Submit
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const pass = (passInput.value || '').trim();
      const digest = await sha256Hex(pass);
      const candidate = digest || pass; // Fallback to plain text if crypto fails
      const existing = localStorage.getItem(PASS_KEY);

      // If no passcode is set, set it now. If it matches, log in.
      if (!existing || existing === candidate) {
        if (!existing) localStorage.setItem(PASS_KEY, candidate);
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
      } else {
        msg.textContent = 'Wrong passcode. Please try again.';
        msg.style.color = "#ff4d4d";
      }
    });

    // Handle Reset Passcode
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!confirm('Are you sure you want to reset your passcode? You will need to set a new one on your next login.')) return;
        localStorage.removeItem(PASS_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        msg.textContent = 'Passcode reset successfully. Enter a new one to continue.';
        msg.style.color = "var(--accent)";
        passInput.value = '';
        passInput.focus();
      });
    }

    if (isAuthed()) goto('index.html');
  }

  // 4. PORTFOLIO PAGE LOGIC
  function initPortfolio() {
    // Logout Logic
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

    // Render Static Gallery from PORTFOLIO_DATA
    gallery.innerHTML = '';
    PORTFOLIO_DATA.forEach(it => {
      const fig = document.createElement('figure');
      fig.className = 'gallery-item section-reveal';
      fig.innerHTML = `
        <img src="${it.src}" alt="${it.label}" loading="lazy">
        <figcaption>
          <span class="badge ${it.type}">${it.type.toUpperCase()}</span>
          ${it.label}
        </figcaption>
      `;
      gallery.appendChild(fig);
    });

    // Update Dashboard Stats
    if ($('stat-total')) $('stat-total').textContent = PORTFOLIO_DATA.length;
    if ($('stat-quizzes')) $('stat-quizzes').textContent = PORTFOLIO_DATA.filter(i => i.type === 'quiz').length;
    if ($('stat-activities')) $('stat-activities').textContent = PORTFOLIO_DATA.filter(i => i.type === 'activity').length;
    
    initSectionReveal();
  }

  // --- Start Application ---
  document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    
    // Check if we are on the login page or the main page
    if ($('login-form')) {
      initLoginPage();
    } else {
      // Security Check: Redirect if not logged in
      if (isAuthed()) {
        initPortfolio();
      } else {
        goto('login.html');
      }
    }
  });
})();