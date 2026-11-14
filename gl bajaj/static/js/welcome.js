/* First-visit login guide: opens once per browser tab session, closes with button, Escape, or backdrop click. */
(function () {
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

  document.getElementById('kaWelcomeSkip').addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
  var primary = modal.querySelector('.ka-welcome-primary');
  if (primary) primary.focus();
})();
