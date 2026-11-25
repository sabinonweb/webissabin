// Broadcast sign annotation tool (news / parliament).
// Videos stream from YouTube or play from the annotator's own computer; nothing is uploaded or re-hosted.
// Annotations autosave in this browser and are exported as JSON.
(function () {
  const KIND = document.body.dataset.kind;              // "news" | "parliament"
  const $ = (id) => document.getElementById(id);
  const P = window.AmpixaPlayer;
  const st = { player: null, key: null, name: '', tokens: [], start: null, end: null, rate: 1 };

  // ---------- vocabulary suggestions ----------
  function fillVocab(words) {
    const dl = $('vocab'); const seen = new Set([...dl.options].map((o) => o.value));
    words.forEach((w) => { if (w && !seen.has(w)) { const o = document.createElement('option'); o.value = w; dl.appendChild(o); seen.add(w); } });
  }
  fillVocab(window.AMPIXA_VOCAB || []);

  const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1600); };
  const fmt = (s) => { if (s == null || isNaN(s)) return '–'; const m = Math.floor(s / 60); return m + ':' + (s % 60).toFixed(1).padStart(4, '0'); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const storeKey = () => 'ampixa_annot_' + KIND + '_' + st.key;

  $('annotator').value = get('ampixa_annotator') || '';
  $('annotator').addEventListener('change', () => { set('ampixa_annotator', $('annotator').value.trim()); save(); });

  function save() { if (st.key) set(storeKey(), JSON.stringify({ name: st.name, tokens: st.tokens, annotator: $('annotator').value.trim() })); }
  function restore() {
    try { const d = JSON.parse(get(storeKey()) || 'null'); st.tokens = (d && d.tokens) || []; if (st.tokens.length) toast('Restored ' + st.tokens.length + ' signs for this video'); }
    catch (e) { st.tokens = []; }
  }

  // ---------- choosing a video ----------
  function open(makePlayer, key, name) {
    if (st.player) st.player.destroy();
    st.key = key; st.name = name;
    $('vname').textContent = name;
    $('work').hidden = false;
    restore(); render();
    makePlayer($('stage')).then((p) => {
      st.player = p; p.rate(st.rate);
      p.onTime((t) => { $('now').textContent = fmt(t); drawBar(); });
    });
    $('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
    markDone();
  }
  const openYT = (id, title) => open((host) => P.youtube(host, id), 'yt_' + id, title || id);

  // bundled list (news) — shows how far each video is annotated
  const listBox = $('videos');
  if (listBox && listBox.dataset.src) {
    fetch(listBox.dataset.src).then((r) => r.json()).then((items) => {
      listBox.innerHTML = items.map((v, i) => `<button class="vid" data-id="${v.id}" data-title="${esc(v.title)}">
        <span class="num">${i + 1}</span><span class="np t">${esc(v.title)}</span><span class="num" data-done="${v.id}"></span></button>`).join('');
      markDone();
    }).catch(() => { listBox.innerHTML = '<p class="note">Could not load the video list. Paste a YouTube link instead.</p>'; });
    listBox.addEventListener('click', (e) => { const b = e.target.closest('.vid'); if (b) openYT(b.dataset.id, b.dataset.title); });
  }
  function markDone() {
    document.querySelectorAll('[data-done]').forEach((n) => {
      try { const d = JSON.parse(get('ampixa_annot_' + KIND + '_yt_' + n.dataset.done) || 'null'); const k = d ? d.tokens.filter((t) => t.type !== 'rest').length : 0;
        n.textContent = k ? k + ' signs' : ''; n.closest('.vid').classList.toggle('has', k > 0); } catch (e) {}
    });
  }
  $('ytGo').addEventListener('click', () => { const id = P.ytId($('ytUrl').value); id ? openYT(id, 'YouTube ' + id) : toast('That is not a YouTube link'); });
  $('file').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) open((host) => P.local(host, f), f.name + '_' + f.size, f.name); });
  $('vocabFile').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { const w = t.split(/[\n,\t]+/).map((s) => s.trim()).filter(Boolean); fillVocab(w); toast(w.length + ' words added to suggestions'); });
  });

  // ---------- playback ----------
  function setRate(r) { st.rate = r; st.player && st.player.rate(r); document.querySelectorAll('[data-rate]').forEach((b) => b.classList.toggle('sel', +b.dataset.rate === r)); }
  document.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => setRate(+b.dataset.rate)));
  setRate(1);
  const now = () => (st.player ? st.player.time() : 0);

  // ---------- marking ----------
  function markStart() { if (!st.player) return; st.start = now(); st.end = null; $('mStart').textContent = fmt(st.start); $('mEnd').textContent = '–'; }
  function markEnd() {
    if (!st.player) return;
    if (st.start == null) { toast('Mark the start first ( [ )'); return; }
    st.end = now(); if (st.end < st.start) [st.start, st.end] = [st.end, st.start];
    $('mStart').textContent = fmt(st.start); $('mEnd').textContent = fmt(st.end);
    st.player.pause(); $('gloss').focus();
  }
  function addToken() {
    const type = $('ttype').value, g = $('gloss').value.trim();
    if (st.start == null || st.end == null) { toast('Mark start [ and end ] first'); return; }
    if (!g && type !== 'rest') { toast('Type what was signed'); $('gloss').focus(); return; }
    st.tokens.push({ start: +st.start.toFixed(2), end: +st.end.toFixed(2), gloss: g, type, sure: $('sure').checked, note: $('tnote').value.trim() });
    st.tokens.sort((a, b) => a.start - b.start);
    $('gloss').value = ''; $('tnote').value = ''; $('sure').checked = true; $('ttype').value = 'sign';
    st.start = st.end = null; $('mStart').textContent = '–'; $('mEnd').textContent = '–';
    save(); render(); markDone(); toast('Saved'); document.activeElement.blur();
  }
  $('bStart').addEventListener('click', markStart);
  $('bEnd').addEventListener('click', markEnd);
  $('bAdd').addEventListener('click', addToken);
  $('gloss').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addToken(); } });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { document.activeElement.blur(); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || !st.player) return;
    const p = st.player;
    if (e.key === ' ') { e.preventDefault(); p.paused() ? p.play() : p.pause(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); p.seek(now() - (e.shiftKey ? 0.2 : 2)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); p.seek(now() + (e.shiftKey ? 0.2 : 2)); }
    else if (e.key === '[') markStart();
    else if (e.key === ']') markEnd();
    else if (e.key === '1') setRate(0.5); else if (e.key === '2') setRate(0.75); else if (e.key === '3') setRate(1);
  });

  // ---------- timeline + list ----------
  function drawBar() {
    const bar = $('bar'), d = (st.player && st.player.duration()) || 1;
    bar.querySelectorAll('.tok').forEach((n) => n.remove());
    st.tokens.forEach((t) => {
      const n = document.createElement('div'); n.className = 'tok ' + t.type + (t.sure ? '' : ' unsure');
      n.style.left = (100 * t.start / d) + '%'; n.style.width = Math.max(0.2, 100 * (t.end - t.start) / d) + '%'; n.title = t.gloss;
      bar.appendChild(n);
    });
    $('head').style.left = (100 * now() / d) + '%';
  }
  $('bar').addEventListener('click', (e) => { if (!st.player) return; const r = e.currentTarget.getBoundingClientRect(); st.player.seek((e.clientX - r.left) / r.width * st.player.duration()); });

  const TYPE = { sign: 'sign', fs: 'fingerspelled', point: 'pointing / gesture', rest: 'rest / not signing' };
  function render() {
    $('list').innerHTML = st.tokens.map((t, i) => `<tr><td class="num"><a href="#" data-seek="${i}">${fmt(t.start)}</a></td><td class="num">${(t.end - t.start).toFixed(1)}s</td>
      <td class="np">${esc(t.gloss)}</td><td><span class="pill ${t.sure ? 'ok' : 'maybe'}">${TYPE[t.type]}${t.sure ? '' : ' · unsure'}</span>${t.note ? '<br><small>' + esc(t.note) + '</small>' : ''}</td>
      <td><button data-del="${i}" aria-label="Delete">✕</button></td></tr>`).join('');
    const signs = st.tokens.filter((t) => t.type !== 'rest').length;
    $('count').textContent = signs + ' signs · annotated up to ' + fmt(st.tokens.reduce((m, t) => Math.max(m, t.end), 0));
    drawBar();
  }
  $('list').addEventListener('click', (e) => {
    const s = e.target.closest('[data-seek]'), d = e.target.closest('[data-del]');
    if (s && st.player) { e.preventDefault(); const t = st.tokens[+s.dataset.seek]; st.player.seek(t.start); st.player.play();
      setTimeout(() => st.player.pause(), (t.end - t.start) * 1000 / st.rate + 300); }
    if (d) { st.tokens.splice(+d.dataset.del, 1); save(); render(); markDone(); }
  });

  // ---------- export / import ----------
  const result = () => ({ kind: KIND, video: st.name, source: st.key, annotator: $('annotator').value.trim(), exported: new Date().toISOString(),
    duration: st.player ? st.player.duration() : null, tokens: st.tokens });
  $('bCopy').addEventListener('click', () => {
    const txt = JSON.stringify(result(), null, 1);
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copied'), () => { $('out').value = txt; $('out').hidden = false; $('out').select(); toast('Select all and copy'); });
  });
  $('bDownload').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(result(), null, 1)], { type: 'application/json' }));
    a.download = KIND + '_' + st.key.replace(/[^\w-]/g, '').slice(0, 40) + '_' + ($('annotator').value.trim() || 'anon') + '.json'; a.click();
  });
  $('imp').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { st.tokens = JSON.parse(t).tokens || []; save(); render(); toast('Loaded ' + st.tokens.length + ' signs'); } catch (err) { toast('That file is not an annotation export'); } });
  });
})();
