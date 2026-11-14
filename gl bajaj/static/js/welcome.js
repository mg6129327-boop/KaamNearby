/* First-visit login guide: opens once per browser tab session, closes with button, Escape, or backdrop click. */
(function () {
  window.fillWelcomeLogin = function (email, pass) {
    var e = document.getElementById('welcomeEmail') || document.getElementById('email');
    var p = document.getElementById('welcomePassword') || document.getElementById('password');
    if (e && p) {
      e.value = email;
      p.value = pass;
      e.focus();
    }
  };

  var modal = document.getElementById('kaWelcome');
  if (!modal) return;
  var KEY = 'kn_welcome_seen';

  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: still show */ }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Ensure icons inside welcome modal are initialized
  if (typeof lucide !== 'undefined') {
    setTimeout(function () {
      lucide.createIcons();
    }, 50);
  }

  var skipBtn = document.getElementById('kaWelcomeSkip');
  if (skipBtn) skipBtn.addEventListener('click', close);

  var closeBtn = document.getElementById('kaWelcomeClose');
  if (closeBtn) closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();
