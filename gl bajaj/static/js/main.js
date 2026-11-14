// KaamNearby Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // 1. Initialize Lucide Icons if available
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Theme Controller (Light Mode <-> Dark Mode) ---
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconMoon = document.getElementById('themeIconMoon');
  const themeIconSun = document.getElementById('themeIconSun');
  const themeLabel = document.getElementById('themeLabel');

  function updateThemeUI(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIconMoon) themeIconMoon.style.display = 'none';
      if (themeIconSun) themeIconSun.style.display = 'inline-block';
      if (themeLabel) themeLabel.textContent = 'Light';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeIconMoon) themeIconMoon.style.display = 'inline-block';
      if (themeIconSun) themeIconSun.style.display = 'none';
      if (themeLabel) themeLabel.textContent = 'Dark';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('kaamnearby_theme', newTheme);
      updateThemeUI(newTheme);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
    });
  }

  // --- Language Controller (English <-> Hindi) ---
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langLabel');

  const globalTranslations = {
    en: {
      nav_home: 'Home',
      nav_services: 'Services',
      nav_about: 'About',
      nav_contact: 'Contact',
      nav_login: 'Login',
      nav_register: 'Register'
    },
    hi: {
      nav_home: 'होम',
      nav_services: 'सेवाएं',
      nav_about: 'हमारे बारे में',
      nav_contact: 'संपर्क',
      nav_login: 'लॉगिन',
      nav_register: 'रजिस्टर'
    }
  };

  let currentLang = localStorage.getItem('kaamnearby_lang') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kaamnearby_lang', lang);
    if (langLabel) {
      langLabel.textContent = lang === 'en' ? 'हिन्दी' : 'English';
    }
    document.documentElement.setAttribute('lang', lang);

    // Translate all standard data-i18n elements on the page
    const dict = globalTranslations[lang] || globalTranslations.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Notify Vue application or components
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: lang } }));
  }

  // Initial apply
  applyLanguage(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', function () {
      const newLang = currentLang === 'en' ? 'hi' : 'en';
      applyLanguage(newLang);
    });
  }

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('show');
    });
  }

  // 3. User Dropdown Menu
  const userDropdownTrigger = document.getElementById('userDropdownTrigger');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  if (userDropdownTrigger && userDropdownMenu) {
    userDropdownTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
      if (!userDropdownMenu.contains(e.target) && e.target !== userDropdownTrigger) {
        userDropdownMenu.classList.remove('show');
      }
    });
  }

  // 4. Flash Alerts Dismissal
  const alertCloses = document.querySelectorAll('.alert-close');
  alertCloses.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const alert = btn.closest('.alert');
      if (alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 250);
      }
    });
  });

  // Auto-dismiss success flash alerts after 5 seconds
  const autoAlerts = document.querySelectorAll('.alert-success, .alert-info');
  autoAlerts.forEach(function (alert) {
    setTimeout(function () {
      if (alert) {
        alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 400);
      }
    }, 5000);
  });

  // 5. Password Show/Hide Toggle
  const togglePassBtns = document.querySelectorAll('.toggle-password');
  togglePassBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = '<i data-lucide="eye-off"></i>';
        } else {
          input.type = 'password';
          btn.innerHTML = '<i data-lucide="eye"></i>';
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  });

  // 6. Generic Confirmation Form Submissions
  const confirmForms = document.querySelectorAll('form[data-confirm]');
  confirmForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      const msg = form.getAttribute('data-confirm') || 'Are you sure you want to proceed?';
      if (!confirm(msg)) {
        e.preventDefault();
      }
    });
  });
});

