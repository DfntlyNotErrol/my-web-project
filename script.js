(function () {
  const PROFILE_KEY = 'portfolio-profile';
  const PASS_KEY = 'portfolio-passhash';
  const SESSION_KEY = 'portfolio-auth-session';

  const ATTACHMENTS_V1_KEY = 'portfolio-attachments';
  const ATTACHMENTS_V2_KEY = 'portfolio-attachments-v2';

  function $(id) {
    return document.getElementById(id);
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function goto(path) {
    window.location.href = path;
  }

  async function sha256Hex(text) {
    try {
      if (!window.crypto || !crypto.subtle) return null;
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      return null;
    }
  }

  function initSectionReveal() {
    var sections = document.querySelectorAll('.section-reveal');
    if (typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
      sections.forEach(function (el) {
        if (!el.classList.contains('visible')) observer.observe(el);
      });
    } else {
      sections.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

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
      msg.textContent = '';
    }

    reset.addEventListener('click', function () {
      if (!confirm('Reset passcode? You will need to set a new one.')) return;
      localStorage.removeItem(PASS_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      updateMode();
      msg.textContent = 'Passcode reset. Enter a new passcode to set it.';
      passInput.value = '';
      passInput.focus();
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const pass = (passInput.value || '').trim();
      if (!pass) {
        msg.textContent = 'Please enter a passcode.';
        return;
      }

      const digest = await sha256Hex(pass);
      const candidate = digest || pass; // fallback
      const existing = localStorage.getItem(PASS_KEY);

      if (!existing) {
        localStorage.setItem(PASS_KEY, candidate);
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
        return;
      }

      if (existing === candidate) {
        sessionStorage.setItem(SESSION_KEY, '1');
        goto('index.html');
      } else {
        msg.textContent = 'Wrong passcode. Try again.';
        passInput.select();
      }
    });

    updateMode();
    if (isAuthed()) goto('index.html');
  }

  function initProfile() {
    const profileName = $('profile-name');
    const profileTagline = $('profile-tagline');
    const profileBio = $('profile-bio');
    const profileAvatar = $('profile-avatar');
    const profileAvatarEdit = $('profile-avatar-edit');
    const profileView = document.querySelector('.profile-view');
    const profileEdit = $('profile-edit');
    const btnEdit = $('btn-edit-profile');
    const btnCancel = $('btn-cancel-profile');
    const btnSave = $('btn-save-profile');
    const inputName = $('input-name');
    const inputTagline = $('input-tagline');
    const inputBio = $('input-bio');
    const avatarInput = $('avatar-input');

    if (
      !profileName ||
      !profileTagline ||
      !profileBio ||
      !profileAvatar ||
      !profileAvatarEdit ||
      !btnEdit ||
      !btnCancel ||
      !btnSave ||
      !inputName ||
      !inputTagline ||
      !inputBio ||
      !avatarInput ||
      !profileView ||
      !profileEdit
    ) return;

    function loadProfile() {
      try {
        var data = localStorage.getItem(PROFILE_KEY);
        if (data) {
          data = JSON.parse(data);
          if (data.name) profileName.textContent = data.name;
          if (data.tagline) profileTagline.textContent = data.tagline;
          if (data.bio) profileBio.textContent = data.bio;
          if (data.avatar) {
            profileAvatar.src = data.avatar;
            profileAvatar.alt = data.name || 'Profile photo';
          }
        }
      } catch (e) {
        console.warn('Could not load profile', e);
      }
    }

    function saveProfile() {
      var avatarSrc = (profileAvatarEdit && profileAvatarEdit.src && profileAvatarEdit.src.indexOf('data:') === 0)
        ? profileAvatarEdit.src
        : (profileAvatar && profileAvatar.src && profileAvatar.src.indexOf('data:') === 0)
          ? profileAvatar.src
          : '';
      var data = {
        name: (inputName.value || profileName.textContent || '').trim(),
        tagline: (inputTagline.value || profileTagline.textContent || '').trim(),
        bio: (inputBio.value || profileBio.textContent || '').trim(),
        avatar: avatarSrc
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      profileName.textContent = data.name || 'Your Name';
      profileTagline.textContent = data.tagline || 'Short tagline';
      profileBio.textContent = data.bio || 'A few lines about you. Click Edit profile to change this.';

      if (data.avatar) {
        profileAvatar.src = data.avatar;
        profileAvatar.alt = data.name || 'Profile photo';
      } else {
        profileAvatar.removeAttribute('src');
      }

      profileView.classList.remove('hidden');
      profileEdit.classList.add('hidden');
    }

    function openEdit() {
      inputName.value = profileName.textContent;
      inputTagline.value = profileTagline.textContent;
      inputBio.value = profileBio.textContent;
      if (profileAvatar && profileAvatar.src) {
        profileAvatarEdit.src = profileAvatar.src;
      } else {
        profileAvatarEdit.removeAttribute('src');
      }
      profileView.classList.add('hidden');
      profileEdit.classList.remove('hidden');
    }

    function closeEdit() {
      profileView.classList.remove('hidden');
      profileEdit.classList.add('hidden');
    }

    btnEdit.addEventListener('click', openEdit);
    btnCancel.addEventListener('click', closeEdit);
    btnSave.addEventListener('click', saveProfile);

    avatarInput.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        profileAvatarEdit.src = e.target.result;
        profileAvatar.src = e.target.result;
        profileAvatar.alt = inputName.value || 'Profile photo';
      };
      reader.readAsDataURL(file);
      this.value = '';
    });

    loadProfile();
  }

  function formatDate(ts) {
    try {
      return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  }

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
    const fileInput = $('file-input');
    if (!gallery || !fileInput) return;

    const statTotal = $('stat-total');
    const statQuizzes = $('stat-quizzes');
    const statActivities = $('stat-activities');

    var selectedType = 'quiz';
    var typePicker = document.querySelector('.type-picker');
    if (typePicker) {
      typePicker.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest && e.target.closest('button[data-type]');
        if (!btn) return;
        selectedType = btn.getAttribute('data-type') || 'quiz';
        Array.from(typePicker.querySelectorAll('.chip')).forEach(function (chip) {
          chip.classList.toggle('active', chip === btn);
        });
      });
    }

    function loadAttachmentsV2() {
      try {
        var raw = localStorage.getItem(ATTACHMENTS_V2_KEY);
        if (raw) {
          var items = JSON.parse(raw);
          if (Array.isArray(items)) return items;
        }
      } catch (e) {}
      return null;
    }

    function migrateFromV1IfNeeded() {
      try {
        var raw = localStorage.getItem(ATTACHMENTS_V1_KEY);
        if (!raw) return [];
        var urls = JSON.parse(raw);
        if (!Array.isArray(urls)) return [];
        var now = Date.now();
        return urls.map(function (url, idx) {
          return {
            id: 'm' + now + '-' + idx,
            dataUrl: url,
            type: 'quiz',
            createdAt: now
          };
        });
      } catch (e) {
        return [];
      }
    }

    function saveAttachments(items) {
      localStorage.setItem(ATTACHMENTS_V2_KEY, JSON.stringify(items));
    }

    function updateStats(items) {
      if (!statTotal || !statQuizzes || !statActivities) return;
      var quizzes = 0;
      var activities = 0;
      items.forEach(function (it) {
        if (it.type === 'activity') activities++;
        else quizzes++;
      });
      statTotal.textContent = String(items.length);
      statQuizzes.textContent = String(quizzes);
      statActivities.textContent = String(activities);
    }

    function renderGallery(items) {
      gallery.innerHTML = '';

      if (!items.length) {
        var empty = document.createElement('p');
        empty.className = 'gallery-empty';
        empty.textContent = 'No pictures yet. Click "Attach a picture" to add your quizzes and activities.';
        gallery.appendChild(empty);
        updateStats(items);
        return;
      }

      items.forEach(function (it) {
        var fig = document.createElement('figure');
        fig.className = 'gallery-item';

        var img = document.createElement('img');
        img.src = it.dataUrl;
        img.alt = it.type === 'activity' ? 'Attached activity' : 'Attached quiz';

        var cap = document.createElement('figcaption');
        var badge = document.createElement('span');
        badge.className = 'badge ' + (it.type === 'activity' ? 'activity' : 'quiz');
        badge.textContent = it.type === 'activity' ? 'Activity' : 'Quiz';

        var actions = document.createElement('span');
        actions.className = 'gallery-actions';
        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-icon';
        del.title = 'Remove';
        del.setAttribute('aria-label', 'Remove this item');
        del.textContent = '×';
        del.addEventListener('click', function () {
          attachments = attachments.filter(function (x) { return x.id !== it.id; });
          saveAttachments(attachments);
          renderGallery(attachments);
        });
        actions.appendChild(del);

        cap.appendChild(badge);
        cap.appendChild(document.createTextNode(formatDate(it.createdAt)));
        cap.appendChild(actions);

        fig.appendChild(img);
        fig.appendChild(cap);
        gallery.appendChild(fig);
      });

      updateStats(items);
    }

    var attachments = loadAttachmentsV2();
    if (!attachments) {
      attachments = migrateFromV1IfNeeded();
      saveAttachments(attachments);
    }

    renderGallery(attachments);

    function addAttachmentFromDataUrl(dataUrl, type) {
      var it = {
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        dataUrl: dataUrl,
        type: type === 'activity' ? 'activity' : 'quiz',
        createdAt: Date.now()
      };
      attachments.unshift(it);
      saveAttachments(attachments);
      renderGallery(attachments);
    }

    fileInput.addEventListener('change', function () {
      var files = this.files;
      if (!files || !files.length) return;
      Array.from(files).forEach(function (file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          addAttachmentFromDataUrl(e.target.result, selectedType);
        };
        reader.readAsDataURL(file);
      });
      this.value = '';
    });
  }

  // Entry
  initSectionReveal();

  const isLoginPage = !!$('login-form');
  if (isLoginPage) {
    initLoginPage();
    return;
  }

  if (!isAuthed()) {
    goto('login.html');
    return;
  }

  initPortfolio();
})();
