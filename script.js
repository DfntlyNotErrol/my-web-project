(function () {
  // ==========================================
  // 1. STATIC DATA: Add your local images here
  // ==========================================
  const PORTFOLIO_DATA = [
    {
      id: 'q1',
      src: 'uploads/quiz1.jpg', // Path to your file
      type: 'quiz',             // 'quiz' or 'activity'
      label: 'Networking Quiz 1',
      date: '2026-03-24'        // Manual date for static items
    },
    // Copy the block above and paste here to add more images!
  ];

  // Keys & Constants
  const PROFILE_KEY = 'portfolio-profile';
  const PASS_KEY = 'portfolio-passhash';
  const SESSION_KEY = 'portfolio-auth-session';
  const ATTACHMENTS_V2_KEY = 'portfolio-attachments-v2';

  function $(id) { return document.getElementById(id); }
  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function goto(path) { window.location.href = path; }

  // --- Auth & Security ---
  async function sha256Hex(text) {
    try {
      if (!window.crypto || !crypto.subtle) return null;
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }

  // --- Animation ---
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

  // --- Login Page Logic ---
  async function initLoginPage() {
    const form = $('login-form');
    if (!form) return;
    const passInput = $('login-passcode');
    const msg = $('login-message');
    const title = $('login-title');
    const subtitle = $('login-subtitle');
    const submit = $('login-submit');
    const reset = $('login-reset');

    function updateMode() {
      const existing = localStorage.getItem(PASS_KEY);
      const first = !existing;
      title.textContent = first ? 'Set a passcode' : 'Login';
      subtitle.textContent = first ? 'Create a passcode (remember it).' : 'Enter your passcode to continue.';
      submit.textContent = first ? 'Save & continue' : 'Continue';
    }

    reset.addEventListener('click', function () {
      if (!confirm('Reset passcode?')) return;
      localStorage.removeItem(PASS_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      updateMode();
      msg.textContent = 'Passcode reset.';
    });

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
    updateMode();
    if (isAuthed()) goto('index.html');
  }

  // --- Profile Logic ---
  function initProfile() {
    const profileName = $('profile-name');
    const profileTagline = $('profile-tagline');
    const profileBio = $('profile-bio');
    const profileAvatar = $('profile-avatar');
    const btnSave = $('btn-save-profile');
    const inputName = $('input-name');
    const inputTagline = $('input-tagline');
    const inputBio = $('input-bio');

    function loadProfile() {
      try {
        var data = JSON.parse(localStorage.getItem(PROFILE_KEY));
        if (data) {
          if (data.name) profileName.textContent = data.name;
          if (data.tagline) profileTagline.textContent = data.tagline;
          if (data.bio) profileBio.textContent = data.bio;
          if (data.avatar) profileAvatar.src = data.avatar;
        }
      } catch (e) {}
    }

    if (btnSave) {
        btnSave.addEventListener('click', function() {
            const data = {
                name: inputName.value,
                tagline: inputTagline.value,
                bio: inputBio.value,
                avatar: profileAvatar.src
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
            loadProfile();
            $('profile-view').classList.remove('hidden');
            $('profile-edit').classList.add('hidden');
        });
    }
    loadProfile();
  }

  // --- Gallery Logic (Option B) ---
  function initPortfolio() {
    const logoutBtn = $('btn-logout');
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem(SESSION_KEY);
        goto('login.html');
      });
    }

    initProfile();

    const gallery = $('gallery');
    const statTotal = $('stat-total');
    const statQuizzes = $('stat-quizzes');
    const statActivities = $('stat-activities');

    if (!gallery) return;

    function renderGallery() {
      gallery.innerHTML = '';
      
      // Combine Static Data + any dynamic uploads (if you still want both)
      const dynamicItems = JSON.parse(localStorage.getItem(ATTACHMENTS_V2_KEY) || '[]');
      const allItems = [...PORTFOLIO_DATA, ...dynamicItems];

      if (!allItems.length) {
        gallery.innerHTML = '<p class="gallery-empty">No pictures found in uploads folder.</p>';
        return;
      }

      allItems.forEach(function (it) {
        const fig = document.createElement('figure');
        fig.className = 'gallery-item section-reveal';

        const img = document.createElement('img');
        img.src = it.src || it.dataUrl; // Support both static 'src' and dynamic 'dataUrl'
        img.alt = it.label || 'Attached Item';
        img.loading = "lazy";

        const cap = document.createElement('figcaption');
        cap.innerHTML = `
            <span class="badge ${it.type}">${it.type.charAt(0).toUpperCase() + it.type.slice(1)}</span>
            ${it.label || 'New Activity'}
        `;

        fig.appendChild(img);
        fig.appendChild(cap);
        gallery.appendChild(fig);
      });

      // Update Stats
      if (statTotal) statTotal.textContent = allItems.length;
      if (statQuizzes) statQuizzes.textContent = allItems.filter(i => i.type === 'quiz').length;
      if (statActivities) statActivities.textContent = allItems.filter(i => i.type === 'activity').length;
      
      initSectionReveal(); // Re-trigger animations for new items
    }

    renderGallery();
  }

  // Entry Point
  initSectionReveal();
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