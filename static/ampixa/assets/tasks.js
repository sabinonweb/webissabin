// Task board for /ampixa/: what needs annotating and checking, with live progress read from the tools' saved work.
(function () {
  const TASKS = [
    { id: 'timing_yt', title: 'Timing check: YouTube teaching spans', data: 'Hari Adhikari lessons', who: 'anyone', size: 100, tool: 'check/timing/',
      progress: () => checkCount('timing', 'review'), def: 'done', result: 'Done: 92 of 99 spans hold signing (93%).',
      steps: ['Get review.json and the web/ clip folder from the team.', 'Open the timing tool, pick both, answer each clip.', 'Download the answers and send them back.'] },
    { id: 'word_yt', title: 'Word check: same YouTube spans', data: 'Hari Adhikari lessons', who: 'signer', size: 100, tool: 'check/word/',
      progress: () => checkCount('word', ''),
      steps: ['Get the word list (.json) and the same clip folder from the team.', 'For each clip: is it the labelled word? Type the real word if not.', 'Download the answers and send them back.'] },
    { id: 'record', title: 'Record words, letters, sentences and phrases', data: 'new recordings', who: 'signer', size: 400, tool: 'record/',
      progress: recordCount,
      steps: ['Sign the consent form first.', 'Open the checklist, enter your signer ID, and tap each take as you record it.', 'Download the recording log and send it with the videos.'] },
    { id: 'annot_news', title: 'Annotate the news interpreter', data: 'NTV news', who: 'signer', size: 30, unit: 'min', tool: 'annotate/news/',
      progress: () => annotMinutes('news'),
      steps: ['Get 1–2 minute NTV segments from the team.', 'Open each video in the news tool and mark every sign with [ and ].', 'Download each video\'s annotations and send them back.'] },
    { id: 'timing_news', title: 'Timing check: news spans', data: 'NTV news', who: 'anyone', size: 100, tool: 'check/timing/',
      progress: () => checkCount('timing', 'news'),
      steps: ['Get the news clip list and clip folder from the team.', 'Answer each clip: signing or not.', 'Download the answers and send them back.'] },
    { id: 'annot_parl', title: 'Annotate the parliament interpreter', data: 'parliament 112 h', who: 'signer', size: 30, unit: 'min', tool: 'annotate/parliament/', def: 'later',
      progress: () => annotMinutes('parliament'),
      steps: ['Start after the news annotation is finished.', 'Same tool and keys as news; mark repeated formal phrases as one sign if signed as one.', 'Download and send back.'] },
    { id: 'timing_tiers', title: 'Timing check per tier (gold / g2 / silver)', data: 'parliament 112 h', who: 'anyone', size: 300, tool: 'check/timing/', def: 'later',
      progress: () => checkCount('timing', 'tier'),
      steps: ['The team sends three lists, one per tier, 100 clips each.', 'Check each list separately so each tier gets its own score.', 'Download each and send back. Tiers under 50% are dropped.'] },
    { id: 'mining', title: 'Confirm mined hits', data: 'news + parliament', who: 'signer', size: 200, tool: 'check/mining/', def: 'later',
      progress: () => checkCount('mining', ''),
      steps: ['Starts after mining round 0.', 'For each hit: is it the word the model says? Is the sign inside the clip?', 'Download and send back. Only confirmed hits become training data.'] },
  ];

  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const keys = () => { try { return Object.keys(localStorage); } catch (e) { return []; } };

  function checkCount(mode, hint) {
    let n = 0;
    keys().filter((k) => k.startsWith('ampixa_check_' + mode + '_') && k.toLowerCase().includes(hint)).forEach((k) => {
      try { n += Object.keys(JSON.parse(get(k) || '{}')).length; } catch (e) {}
    });
    return n;
  }
  function annotMinutes(kind) {
    let s = 0;
    keys().filter((k) => k.startsWith('ampixa_annot_' + kind + '_')).forEach((k) => {
      try { const tk = JSON.parse(get(k)).tokens || []; s += tk.reduce((m, t) => Math.max(m, t.end), 0); } catch (e) {}   // seconds annotated per video
    });
    return Math.round(s / 6) / 10;
  }
  function recordCount() {
    try { const d = JSON.parse(get('ampixa_record_v1') || '{}'); return Object.values(d.done || {}).reduce((a, b) => a + b, 0); } catch (e) { return 0; }
  }

  const LABEL = { todo: 'to do', doing: 'in progress', done: 'done', later: 'later' };
  const PILL = { todo: 'maybe', doing: 'maybe', done: 'ok', later: 'no' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const board = document.getElementById('board');

  function render() {
    const f = document.getElementById('fWho').value;
    board.innerHTML = '';
    TASKS.filter((t) => f === 'all' || t.who === f).forEach((t) => {
      const status = get('ampixa_task_' + t.id) || t.def || 'todo';
      const n = t.progress(), pct = Math.min(100, 100 * n / t.size);
      const el = document.createElement('div'); el.className = 'task card st-' + status;
      el.innerHTML = `<div>
          <h4>${esc(t.title)}</h4>
          <div class="meta"><span>${esc(t.data)}</span><span>${t.who === 'signer' ? 'needs a signer' : 'anyone'}</span><span>${t.size} ${t.unit || 'items'}</span></div>
          ${t.result && status === 'done' ? `<p style="margin:6px 0 0">${esc(t.result)}</p>` : ''}
          <ol>${t.steps.map((s) => '<li>' + esc(s) + '</li>').join('')}</ol>
        </div>
        <div class="side">
          <a class="btn" href="${t.tool}">Open tool →</a>
          <span class="pill ${PILL[status]}">${LABEL[status]}</span>
          <div class="prog" title="saved in this browser"><i style="width:${pct}%"></i></div>
          <span class="num">${n} / ${t.size} ${t.unit || ''} here</span>
          <label>Status<select data-id="${t.id}">${Object.keys(LABEL).map((k) => `<option value="${k}"${k === status ? ' selected' : ''}>${LABEL[k]}</option>`).join('')}</select></label>
        </div>`;
      board.appendChild(el);
    });
  }
  board.addEventListener('change', (e) => { const s = e.target.closest('select[data-id]'); if (s) { set('ampixa_task_' + s.dataset.id, s.value); render(); } });
  document.getElementById('fWho').addEventListener('change', render);
  window.addEventListener('focus', render);
  render();
})();
