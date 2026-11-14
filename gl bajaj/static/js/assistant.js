/* KaamNearby help assistant: chat widget logic.
   Messages are inserted with textContent only (no HTML), so model output cannot inject markup. */
(function () {
  var fab = document.getElementById('kaFab');
  if (!fab) return;

  var panel = document.getElementById('kaPanel');
  var closeBtn = document.getElementById('kaClose');
  var form = document.getElementById('kaForm');
  var input = document.getElementById('kaInput');
  var sendBtn = document.getElementById('kaSend');
  var log = document.getElementById('kaLog');
  var chips = document.querySelectorAll('.ka-chips button');
  var meta = document.querySelector('meta[name="csrf-token"]');
  var csrf = meta ? meta.getAttribute('content') : '';

  var speakBtn = document.getElementById('kaSpeak');
  var micBtn = document.getElementById('kaMic');
  var speakOn = false;
  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  var history = [];   // { role: 'user' | 'assistant', content }
  var busy = false;
  var greeted = false;

  function addMsg(role, text) {
    var el = document.createElement('div');
    el.className = 'ka-msg ka-' + role;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function speak(text) {
    if (!speakOn || !canSpeak) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  function setupVoice() {
    if (!canSpeak && speakBtn) { speakBtn.hidden = true; }
    if (speakBtn) {
      speakBtn.addEventListener('click', function () {
        speakOn = !speakOn;
        speakBtn.setAttribute('aria-pressed', speakOn ? 'true' : 'false');
        speakBtn.classList.toggle('is-on', speakOn);
        if (!speakOn && canSpeak) window.speechSynthesis.cancel();
      });
    }
    if (!SpeechRec || !micBtn) return;
    micBtn.hidden = false;
    var rec = new SpeechRec();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    micBtn.addEventListener('click', function () {
      if (busy) return;
      micBtn.classList.add('is-listening');
      try { rec.start(); } catch (err) { micBtn.classList.remove('is-listening'); }
    });
    rec.onresult = function (e) {
      input.value = e.results[0][0].transcript;
      input.focus();
    };
    rec.onend = function () { micBtn.classList.remove('is-listening'); };
    rec.onerror = function () {
      micBtn.classList.remove('is-listening');
      addMsg('bot', 'Awaaz samajh nahi aayi. Dobara bolein ya type karein.');
    };
  }
  setupVoice();

  function openPanel() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      addMsg('bot', 'Namaste! Main KaamNearby ka assistant hoon. Booking, price negotiation ya worker verification ke bare me kuch bhi poochhiye.');
    }
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  function ask(raw) {
    var text = (raw || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = '';
    addMsg('user', text);
    var typing = addMsg('bot', '...');
    typing.classList.add('ka-typing');

    fetch('/api/assistant', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
      body: JSON.stringify({ message: text, history: history.slice(-6) })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        typing.remove();
        if (result.ok && result.data.reply) {
          addMsg('bot', result.data.reply);
          speak(result.data.reply);
          history.push({ role: 'user', content: text });
          history.push({ role: 'assistant', content: result.data.reply });
        } else {
          addMsg('bot', result.data.error || 'Kuch galat ho gaya. Thodi der baad try karein.');
        }
      })
      .catch(function () {
        typing.remove();
        addMsg('bot', 'Network error. Internet check karke dobara try karein.');
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  fab.addEventListener('click', function () {
    if (panel.hidden) { openPanel(); } else { closePanel(); }
  });
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { closePanel(); }
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      ask(chip.getAttribute('data-q'));
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });
})();
