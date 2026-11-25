// One-clip-at-a-time checker for timing, word and mining checks.
// Load a list file (JSON from the team) and the folder of clips from your own computer. Nothing is uploaded.
// List format: [{"id": "t000", "clip": "t000_x.mp4", "word": "सरकार", "score": 0.83}, ...]
// Accepted field names: id|i, clip|web|file, word|label|gloss, score|confidence.
(function () {
  const MODE = document.body.dataset.mode;                 // timing | word | mining
  const $ = (id) => document.getElementById(id);
  const ANSWERS = {
    timing: [['yes', 'Signing ✓', 'good', '1'], ['no', 'Not signing ✗', 'bad', '2']],
    word: [['yes', 'Yes, this word', 'good', '1'], ['no', 'No, different sign', 'bad', '2'], ['unsure', 'Not sure', 'warn', '3']],
    mining: [['yes', 'Correct', 'good', '1'], ['no', 'Wrong', 'bad', '2'], ['unsure', 'Not sure', 'warn', '3']],
  }[MODE];
  const st = { items: [], files: {}, idx: 0, ans: {}, listName: '' };

  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1500); }
  const key = () => 'ampixa_check_' + MODE + '_' + st.listName;
  const save = () => { try { localStorage.setItem(key(), JSON.stringify(st.ans)); localStorage.setItem('ampixa_annotator', $('who').value); } catch (e) {} };
  try { $('who').value = localStorage.getItem('ampixa_annotator') || ''; } catch (e) {}

  const norm = (x, i) => ({
    id: String(x.id ?? (x.i != null ? 't' + String(x.i).padStart(3, '0') : i)),
    clip: String(x.clip || x.web || x.file || '').split('/').pop(),
    word: x.word || x.label || x.gloss || '',
    score: x.score ?? x.confidence ?? null,
    start: x.start, end: x.end, video: x.video || '',
  });

  $('list').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => {
      try {
        const d = JSON.parse(t); const arr = Array.isArray(d) ? d : (d.items || []);
        st.items = arr.map(norm); st.listName = f.name;
        try { st.ans = JSON.parse(localStorage.getItem(key()) || '{}'); } catch (err) { st.ans = {}; }
        st.idx = Math.max(0, st.items.findIndex((it) => !(it.id in st.ans)));
        $('listInfo').textContent = st.items.length + ' clips in ' + f.name; ready();
      } catch (err) { toast('That file is not a clip list'); }
    });
  });
  $('folder').addEventListener('change', (e) => {
    [...e.target.files].forEach((f) => { st.files[f.name] = f; });
    $('folderInfo').textContent = Object.keys(st.files).length + ' video files found'; ready();
  });
  function ready() { if (st.items.length && Object.keys(st.files).length) { $('setup').hidden = true; $('work').hidden = false; show(); } }

  // Answer buttons
  const box = $('answers');
  ANSWERS.forEach(([v, label, cls, k]) => {
    const b = document.createElement('button'); b.className = cls; b.dataset.v = v; b.innerHTML = label + ' <kbd>' + k + '</kbd>';
    b.addEventListener('click', () => answer(v)); box.appendChild(b);
  });

  let url = null;
  function show() {
    const it = st.items[st.idx]; if (!it) return;
    const f = st.files[it.clip];
    if (url) URL.revokeObjectURL(url);
    const v = $('video');
    if (f) { url = URL.createObjectURL(f); v.src = url; v.play().catch(() => {}); $('missing').hidden = true; }
    else { v.removeAttribute('src'); v.load(); $('missing').hidden = false; $('missing').textContent = 'Clip file not found in the folder: ' + it.clip; }
    $('pos').textContent = (st.idx + 1) + ' / ' + st.items.length;
    $('cid').textContent = it.id;
    if ($('word')) $('word').textContent = it.word || '—';
    if ($('score')) $('score').textContent = it.score == null ? '' : 'model confidence ' + Number(it.score).toFixed(2);
    const a = st.ans[it.id];
    box.querySelectorAll('button').forEach((b) => b.classList.toggle('sel', a && a.v === b.dataset.v));
    if ($('actual')) $('actual').value = (a && a.actual) || '';
    if ($('timeok')) $('timeok').checked = !a || a.timeOk !== false;
    progress();
  }
  function answer(v) {
    const it = st.items[st.idx];
    const rec = { v, who: $('who').value.trim(), at: new Date().toISOString() };
    if ($('actual') && $('actual').value.trim()) rec.actual = $('actual').value.trim();
    if ($('timeok')) rec.timeOk = $('timeok').checked;
    st.ans[it.id] = rec; save();
    if (st.idx < st.items.length - 1) { st.idx++; show(); } else { show(); toast('Last clip done. Download your answers below.'); }
  }
  function progress() {
    const vals = Object.values(st.ans), n = vals.length;
    const yes = vals.filter((a) => a.v === 'yes').length, no = vals.filter((a) => a.v === 'no').length;
    const decided = yes + no, p = decided ? yes / decided : 0;
    const half = decided ? 1.96 * Math.sqrt(p * (1 - p) / decided) : 0;
    $('prog').textContent = n + ' of ' + st.items.length + ' answered';
    $('summary').textContent = decided ? `${yes} yes · ${no} no · ${n - decided} not sure → ${(100 * p).toFixed(0)}% yes (±${(100 * half).toFixed(0)} points)` : '';
    $('pbar').style.width = (100 * n / Math.max(1, st.items.length)) + '%';
  }
  $('prev').addEventListener('click', () => { if (st.idx > 0) { st.idx--; show(); } });
  $('next').addEventListener('click', () => { if (st.idx < st.items.length - 1) { st.idx++; show(); } });
  $('replay').addEventListener('click', () => { const v = $('video'); v.currentTime = 0; v.play(); });
  $('slow').addEventListener('click', (e) => { const v = $('video'); v.playbackRate = v.playbackRate === 1 ? 0.5 : 1; e.currentTarget.textContent = v.playbackRate === 1 ? 'Slow 0.5×' : 'Normal 1×'; });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || $('work').hidden) return;
    const hit = ANSWERS.find((a) => a[3] === e.key); if (hit) { answer(hit[0]); return; }
    if (e.key === 'ArrowLeft') $('prev').click(); else if (e.key === 'ArrowRight') $('next').click();
    else if (e.key === 'r') $('replay').click(); else if (e.key === ' ') { e.preventDefault(); const v = $('video'); v.paused ? v.play() : v.pause(); }
  });

  const result = () => ({ mode: MODE, list: st.listName, checker: $('who').value.trim(), exported: new Date().toISOString(),
    answers: st.items.map((it) => ({ id: it.id, clip: it.clip, word: it.word, ...(st.ans[it.id] || { v: null }) })) });
  $('download').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(result(), null, 1)], { type: 'application/json' }));
    a.download = MODE + '_check_' + ($('who').value.trim() || 'anon') + '.json'; a.click();
  });
  $('copy').addEventListener('click', () => {
    const txt = JSON.stringify(result());
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copied'), () => { $('out').hidden = false; $('out').value = txt; $('out').select(); });
  });
})();
