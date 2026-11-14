/* Add Workers page: add/remove worker rows in one form. The server reads workers[N][field]. */
(function () {
  var rowsBox = document.getElementById('workerRows');
  var tpl = document.getElementById('workerRowTemplate');
  var addBtn = document.getElementById('addRowBtn');
  var countText = document.getElementById('rowCount');
  if (!rowsBox || !tpl || !addBtn) return;

  var MAX = parseInt(rowsBox.getAttribute('data-max') || '50', 10);
  var nextIndex = 0;
  rowsBox.querySelectorAll('[data-row] [name]').forEach(function (el) {
    var m = el.name.match(/^workers\[(\d+)\]/);
    if (m) nextIndex = Math.max(nextIndex, parseInt(m[1], 10) + 1);
  });

  function rows() { return rowsBox.querySelectorAll('[data-row]'); }

  function renumber() {
    rows().forEach(function (row, i) {
      var t = row.querySelector('.aw-title');
      if (t) t.textContent = 'Worker ' + (i + 1);
    });
    if (countText) countText.textContent = rows().length + ' worker(s) in this batch (max ' + MAX + ' at a time).';
    addBtn.disabled = rows().length >= MAX;
  }

  addBtn.addEventListener('click', function () {
    if (rows().length >= MAX) return;
    var html = tpl.innerHTML.replace(/__IDX__/g, String(nextIndex));
    nextIndex += 1;
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    var row = wrap.firstElementChild;
    rowsBox.appendChild(row);
    renumber();
    var first = row.querySelector('input');
    if (first) first.focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  rowsBox.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    var row = btn.closest('[data-row]');
    if (rows().length <= 1) {
      row.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
      row.querySelectorAll('select').forEach(function (el) { el.selectedIndex = 0; });
      return;
    }
    row.remove();
    renumber();
  });

  renumber();
})();
