// Broadcast sign annotation tool (news / parliament).
// The video is opened from the annotator's own computer and never uploaded.
// Annotations autosave in this browser and are exported as JSON.
(function () {
  const KIND = document.body.dataset.kind;              // "news" | "parliament"
  const $ = (id) => document.getElementById(id);
  const video = $('video');
  const state = { videoKey: null, videoName: '', tokens: [], start: null };

  const VOCAB = (window.AMPIXA_VOCAB || []).slice();
  function fillVocab(words) {
    const dl = $('vocab');
    const seen = new Set([...dl.options].map((o) => o.value));
    words.forEach((w) => { if (w && !seen.has(w)) { const o = document.createElement('option'); o.value = w; dl.appendChild(o); seen.add(w); } });
  }
  fillVocab(VOCAB);

  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1600); }
  const fmt = (s) => { if (s == null || isNaN(s)) return '–'; const m = Math.floor(s / 60); return m + ':' + (s % 60).toFixed(1).padStart(4, '0'); };
  const storeKey = () => 'ampixa_annot_' + KIND + '_' + state.videoKey;

  function save() {
    if (!state.videoKey) return;
    try { localStorage.setItem(storeKey(), JSON.stringify({ tokens: state.tokens, annotator: $('annotator').value })); } catch (e) { /* storage blocked: export still works */ }
    try { localStorage.setItem('ampixa_annotator', $('annotator').value); } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(storeKey());
      if (raw) { const d = JSON.parse(raw); state.tokens = d.tokens || []; if (d.annotator) $('annotator').value = d.annotator; toast('Restored ' + state.tokens.length + ' signs for this video'); }
      else state.tokens = [];
    } catch (e) { state.tokens = []; }
  }
  try { $('annotator').value = localStorage.getItem('ampixa_annotator') || ''; } catch (e) {}

  $('file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    video.src = URL.createObjectURL(f);
    state.videoName = f.name; state.videoKey = f.name + '_' + f.size;
    $('vname').textContent = f.name;
    $('empty').hidden = true; $('work').hidden = false;
    load(); render();
  });
  $('vocabFile').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { const words = t.split(/[\n,\t]+/).map((s) => s.trim()).filter(Boolean); fillVocab(words); toast(words.length + ' words added to suggestions'); });
  });
  $('annotator').addEventListener('change', save);

  // Playback
  const setRate = (r) => { video.playbackRate = r; document.querySelectorAll('[data-rate]').forEach((b) => b.classList.toggle('sel', +b.dataset.rate === r)); };
  document.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => setRate(+b.dataset.rate)));
  setRate(1);
  video.addEventListener('timeupdate', () => { $('now').textContent = fmt(video.currentTime); drawBar(); });

  // Marking
  function markStart() { state.start = video.currentTime; $('mStart').textContent = fmt(state.start); $('mEnd').textContent = '–'; $('gloss').focus(); }
  function markEnd() {
    if (state.start == null) { toast('Mark the start first ( [ )'); return; }
    let s = state.start, en = video.currentTime; if (en < s) [s, en] = [en, s];
    $('mEnd').textContent = fmt(en); $('mEnd').dataset.v = en; $('mStart').dataset.v = s;
    video.pause(); $('gloss').focus();
  }
  function addToken() {
    const s = parseFloat($('mStart').dataset.v ?? state.start), en = parseFloat($('mEnd').dataset.v);
    const g = $('gloss').value.trim();
    if (isNaN(s) || isNaN(en)) { toast('Mark start [ and end ] first'); return; }
    if (!g && $('ttype').value !== 'rest') { toast('Type what was signed'); $('gloss').focus(); return; }
    state.tokens.push({ start: +s.toFixed(2), end: +en.toFixed(2), gloss: g, type: $('ttype').value, sure: $('sure').checked, note: $('tnote').value.trim() });
    state.tokens.sort((a, b) => a.start - b.start);
    $('gloss').value = ''; $('tnote').value = ''; $('sure').checked = true; $('ttype').value = 'sign';
    state.start = null; delete $('mStart').dataset.v; delete $('mEnd').dataset.v; $('mStart').textContent = '–'; $('mEnd').textContent = '–';
    save(); render(); toast('Saved'); video.focus();
  }
  $('bStart').addEventListener('click', markStart);
  $('bEnd').addEventListener('click', markEnd);
  $('bAdd').addEventListener('click', addToken);
  $('gloss').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addToken(); } });

  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if (e.key === 'Escape') { document.activeElement.blur(); return; }
    if (typing || $('work').hidden) return;
    if (e.key === ' ') { e.preventDefault(); video.paused ? video.play() : video.pause(); }
    else if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 0.2 : 2)); }
    else if (e.key === 'ArrowRight') { video.currentTime += e.shiftKey ? 0.2 : 2; }
    else if (e.key === '[') markStart();
    else if (e.key === ']') markEnd();
    else if (e.key === '1') setRate(0.5); else if (e.key === '2') setRate(0.75); else if (e.key === '3') setRate(1);
  });

  // Timeline + list
  function drawBar() {
    const bar = $('bar'), d = video.duration || 1;
    bar.querySelectorAll('.tok').forEach((n) => n.remove());
    state.tokens.forEach((t) => {
      const n = document.createElement('div'); n.className = 'tok ' + t.type + (t.sure ? '' : ' unsure');
      n.style.left = (100 * t.start / d) + '%'; n.style.width = Math.max(0.3, 100 * (t.end - t.start) / d) + '%';
      n.title = t.gloss; bar.appendChild(n);
    });
    $('head').style.left = (100 * video.currentTime / d) + '%';
  }
  $('bar').addEventListener('click', (e) => { const r = e.currentTarget.getBoundingClientRect(); video.currentTime = (e.clientX - r.left) / r.width * (video.duration || 0); });

  const TYPE = { sign: 'sign', fs: 'fingerspelled', point: 'pointing / gesture', rest: 'rest / not signing' };
  function render() {
    const tb = $('list'); tb.innerHTML = '';
    state.tokens.forEach((t, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="num"><a href="#" data-seek="${i}">${fmt(t.start)}</a></td><td class="num">${(t.end - t.start).toFixed(1)}s</td>
        <td class="np">${esc(t.gloss)}</td><td><span class="pill ${t.sure ? 'ok' : 'maybe'}">${TYPE[t.type]}${t.sure ? '' : ' · unsure'}</span>${t.note ? '<br><small>' + esc(t.note) + '</small>' : ''}</td>
        <td><button data-del="${i}" aria-label="Delete">✕</button></td>`;
      tb.appendChild(tr);
    });
    const signs = state.tokens.filter((t) => t.type !== 'rest').length;
    const covered = state.tokens.reduce((m, t) => Math.max(m, t.end), 0);
    $('count').textContent = signs + ' signs · annotated up to ' + fmt(covered);
    drawBar();
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $('list').addEventListener('click', (e) => {
    const s = e.target.closest('[data-seek]'), d = e.target.closest('[data-del]');
    if (s) { e.preventDefault(); const t = state.tokens[+s.dataset.seek]; video.currentTime = t.start; video.play(); setTimeout(() => video.pause(), (t.end - t.start) * 1000 / video.playbackRate + 200); }
    if (d) { state.tokens.splice(+d.dataset.del, 1); save(); render(); }
  });

  // Export / import
  function result() {
    return { kind: KIND, video: state.videoName, annotator: $('annotator').value.trim(), exported: new Date().toISOString(), duration: video.duration || null, tokens: state.tokens };
  }
  $('bCopy').addEventListener('click', () => {
    const txt = JSON.stringify(result(), null, 1);
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copied'), () => { $('out').value = txt; $('out').hidden = false; $('out').select(); toast('Select all and copy'); });
  });
  $('bDownload').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(result(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = KIND + '_' + state.videoName.replace(/\.[^.]+$/, '') + '_' + ($('annotator').value.trim() || 'anon') + '.json'; a.click();
  });
  $('imp').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { const d = JSON.parse(t); state.tokens = d.tokens || []; save(); render(); toast('Loaded ' + state.tokens.length + ' signs'); } catch (err) { toast('That file is not an annotation export'); } });
  });
})();
