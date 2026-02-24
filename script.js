(function () {
  const PROFILE_KEY = 'portfolio-profile';
  const STORAGE_KEY = 'portfolio-attachments';
  const fileInput = document.getElementById('file-input');
  const gallery = document.getElementById('gallery');

  // —— Profile (editable) ——
  const profileName = document.getElementById('profile-name');
  const profileTagline = document.getElementById('profile-tagline');
  const profileBio = document.getElementById('profile-bio');
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  const profileAvatarEdit = document.getElementById('profile-avatar-edit');
  const avatarPlaceholderEdit = document.getElementById('avatar-placeholder-edit');
  const profileView = document.querySelector('.profile-view');
  const profileEdit = document.getElementById('profile-edit');
  const btnEdit = document.getElementById('btn-edit-profile');
  const btnCancel = document.getElementById('btn-cancel-profile');
  const btnSave = document.getElementById('btn-save-profile');
  const inputName = document.getElementById('input-name');
  const inputTagline = document.getElementById('input-tagline');
  const inputBio = document.getElementById('input-bio');
  const avatarInput = document.getElementById('avatar-input');

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
    var avatarSrc = (profileAvatarEdit.src && profileAvatarEdit.src.indexOf('data:') === 0)
      ? profileAvatarEdit.src
      : (profileAvatar.src && profileAvatar.src.indexOf('data:') === 0)
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
    if (profileAvatar.src) {
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

  // —— Section reveal (minimal scroll animation) ——
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

  // —— Gallery / attachments ——

  function loadSavedImages() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const urls = JSON.parse(saved);
        urls.forEach(function (url) {
          addImageToGallery(url, false);
        });
      }
    } catch (e) {
      console.warn('Could not load saved images', e);
    }
  }

  function saveImages() {
    const imgs = gallery.querySelectorAll('.gallery-item img');
    const urls = Array.from(imgs).map(function (img) {
      return img.src;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }

  function addImageToGallery(dataUrl, save) {
    const item = document.createElement('figure');
    item.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'Attached activity or quiz';
    const cap = document.createElement('figcaption');
    cap.textContent = 'Attached picture';
    item.appendChild(img);
    item.appendChild(cap);
    gallery.appendChild(item);

    var empty = gallery.querySelector('.gallery-empty');
    if (empty) {
      empty.remove();
    }

    if (save !== false) {
      saveImages();
    }
  }

  function handleFiles(files) {
    if (!files || !files.length) return;
    var count = 0;
    Array.from(files).forEach(function (file) {
      if (!file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        addImageToGallery(e.target.result);
      };
      reader.readAsDataURL(file);
      count++;
    });
  }

  fileInput.addEventListener('change', function () {
    handleFiles(this.files);
    this.value = '';
  });

  loadSavedImages();

  if (gallery.children.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'gallery-empty';
    empty.textContent = 'No pictures yet. Click "Attach a picture" to add your quizzes and activities.';
    gallery.appendChild(empty);
  }
})();
