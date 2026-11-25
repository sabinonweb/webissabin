// One-clip-at-a-time checker for timing, word and mining checks.
// Clips stream from YouTube at their start/end time, or play from files on the checker's computer. Nothing is uploaded.
// List format: [{"id":"t000","video":"<youtube id>","start":220.9,"end":225.9,"word":"सरकार","score":0.83}]
// or with local files: [{"id":"t000","clip":"t000_x.mp4","word":"..."}]. Also accepts i|web|file|label|gloss|confidence.
(function () {
  const MODE = document.body.dataset.mode;                 // timing | word | mining
  const $ = (id) => document.getElementById(id);
  const P = window.AmpixaPlayer;
  const ANSWERS = {
    timing: [['yes', 'Signing ✓', 'good', '1'], ['no', 'Not signing ✗', 'bad', '2']],
    word: [['yes', 'Yes, this word', 'good', '1'], ['no', 'No, different sign', 'bad', '2'], ['unsure', 'Not sure', 'warn', '3']],
    mining: [['yes', 'Correct', 'good', '1'], ['no', 'Wrong', 'bad', '2'], ['unsure', 'Not sure', 'warn', '3']],
  }[MODE];
  const st = { items: [], files: {}, idx: 0, ans: {}, listName: '', player: null };
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1500); };
  const key = () => 'ampixa_check_' + MODE + '_' + st.listName;
  const save = () => { set(key(), JSON.stringify(st.ans)); set('ampixa_annotator', $('who').value.trim()); };
  $('who').value = get('ampixa_annotator') || '';
  $('who').addEventListener('change', save);

  const norm = (x, i) => ({
    id: String(x.id ?? (x.i != null ? 't' + String(x.i).padStart(3, '0') : i)),
    clip: String(x.clip || x.web || x.file || '').split('/').pop(),
    video: x.video && /^[\w-]{11}$/.test(x.video) ? x.video : null,
    start: x.start != null ? +x.start : null, end: x.end != null ? +x.end : null,
    word: x.word || x.label || x.gloss || '', score: x.score ?? x.confidence ?? null, title: x.title || '',
  });
  function useList(arr, name) {
    st.items = arr.map(norm); st.listName = name;
    try { st.ans = JSON.parse(get(key()) || '{}'); } catch (e) { st.ans = {}; }
    st.idx = Math.max(0, st.items.findIndex((it) => !(it.id in st.ans)));
    const needFiles = st.items.some((it) => !it.video);
    $('folderRow').hidden = !needFiles;
    $('listInfo').textContent = st.items.length + ' clips · ' + (needFiles ? 'pick the clip folder below' : 'clips stream from YouTube');
    ready();
  }

  // Preset lists bundled with the page
  document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    fetch(b.dataset.preset).then((r) => r.json()).then((d) => useList(d, b.dataset.name)).catch(() => toast('Could not load that list'));
  }));
  $('list').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { const d = JSON.parse(t); useList(Array.isArray(d) ? d : (d.items || []), f.name); } catch (err) { toast('That file is not a clip list'); } });
  });
  $('folder').addEventListener('change', (e) => {
    [...e.target.files].forEach((f) => { st.files[f.name] = f; });
    $('folderInfo').textContent = Object.keys(st.files).length + ' video files found'; ready();
  });
  function ready() {
    if (!st.items.length) return;
    if (st.items.some((it) => !it.video) && !Object.keys(st.files).length) return;
    $('setup').hidden = true; $('work').hidden = false; show();
  }
  $('change').addEventListener('click', () => { $('setup').hidden = false; $('work').hidden = true; if (st.player) { st.player.destroy(); st.player = null; } });

  // Answer buttons
  const box = $('answers');
  ANSWERS.forEach(([v, label, cls, k]) => {
    const b = document.createElement('button'); b.className = cls; b.dataset.v = v; b.innerHTML = label + ' <kbd>' + k + '</kbd>';
    b.addEventListener('click', () => answer(v)); box.appendChild(b);
  });

  let rate = 1;
  function show() {
    const it = st.items[st.idx]; if (!it) return;
    if (st.player) { st.player.destroy(); st.player = null; }
    const host = $('stage');
    $('missing').hidden = true;
    let make;
    if (it.video) make = P.youtube(host, it.video, { start: it.start || 0, end: it.end, loop: true, autoplay: true, mute: true });
    else if (st.files[it.clip]) make = P.local(host, st.files[it.clip], { loop: true, autoplay: true, mute: true });
    else { host.innerHTML = ''; $('missing').hidden = false; $('missing').textContent = 'Clip file not found in the folder: ' + it.clip; }
    if (make) make.then((p) => { if (st.items[st.idx] !== it) { p.destroy(); return; } st.player = p; p.rate(rate); });
    $('pos').textContent = (st.idx + 1) + ' / ' + st.items.length;
    $('cid').textContent = it.id + (it.start != null ? ' · ' + it.start.toFixed(1) + '–' + it.end.toFixed(1) + ' s' : '');
    if ($('word')) $('word').textContent = it.word || '—';
    if ($('score')) $('score').textContent = it.score == null ? '' : 'model confidence ' + Number(it.score).toFixed(2);
    const a = st.ans[it.id];
    box.querySelectorAll('button').forEach((b) => b.classList.toggle('sel', !!a && a.v === b.dataset.v));
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
    const decided = yes + no, p = decided ? yes / decided : 0, half = decided ? 1.96 * Math.sqrt(p * (1 - p) / decided) : 0;
    $('prog').textContent = n + ' of ' + st.items.length + ' answered';
    $('summary').textContent = decided ? `${yes} yes · ${no} no · ${n - decided} not sure → ${(100 * p).toFixed(0)}% yes (±${(100 * half).toFixed(0)} points)` : '';
    $('pbar').style.width = (100 * n / Math.max(1, st.items.length)) + '%';
  }
  $('prev').addEventListener('click', () => { if (st.idx > 0) { st.idx--; show(); } });
  $('next').addEventListener('click', () => { if (st.idx < st.items.length - 1) { st.idx++; show(); } });
  $('replay').addEventListener('click', () => { const it = st.items[st.idx]; if (st.player) { st.player.seek(it.start || 0); st.player.play(); } });
  $('slow').addEventListener('click', (e) => { rate = rate === 1 ? 0.5 : 1; st.player && st.player.rate(rate); e.currentTarget.textContent = rate === 1 ? 'Slow 0.5×' : 'Normal 1×'; });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || $('work').hidden) return;
    const hit = ANSWERS.find((a) => a[3] === e.key); if (hit) { answer(hit[0]); return; }
    if (e.key === 'ArrowLeft') $('prev').click(); else if (e.key === 'ArrowRight') $('next').click();
    else if (e.key === 'r') $('replay').click();
  });

  const result = () => ({ mode: MODE, list: st.listName, checker: $('who').value.trim(), exported: new Date().toISOString(),
    answers: st.items.map((it) => ({ id: it.id, video: it.video, clip: it.clip || undefined, start: it.start, end: it.end, word: it.word, ...(st.ans[it.id] || { v: null }) })) });
  $('download').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(result(), null, 1)], { type: 'application/json' }));
    a.download = MODE + '_check_' + ($('who').value.trim() || 'anon') + '.json'; a.click();
  });
  $('copy').addEventListener('click', () => {
    const txt = JSON.stringify(result());
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copied'), () => { $('out').hidden = false; $('out').value = txt; $('out').select(); });
  });
})();
