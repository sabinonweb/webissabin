// Recording checklist: tick off takes as you record. Saves in this browser; export to send to the team.
(function () {
  const PILOT = ["दुध", "फूल", "समय", "संविधानदिवस", "सम्मान", "सानो", "सारङ्गी", "सारी", "सरिफा", "सासफेर्नु"];
  const GROUPS = [
    { id: "pilot", title: "Pilot words", why: "Tests whether a real second clip raises the score.", takes: 2, items: PILOT },
    { id: "news_have", title: "News words, second clip", why: "In the dictionary with one clip; frequent in news captions.", takes: 2,
      items: "नेपाल नमस्कार राष्ट्रिय समस्या सरकार विकास समाचार कार्यक्रम योजना स्थानीय सुरक्षा निर्णय मन्त्री छलफल राष्ट्रपति".split(" ") },
    { id: "news_new", title: "News words, new", why: "Frequent in news, missing from the dictionary. Ask how the interpreter signs it.", takes: 2,
      items: "काम जानकारी निर्माण सहयोग सेवा सार्वजनिक आर्थिक जिल्ला अध्यक्ष कार्यालय प्रदेश नागरिक सामाजिक काठमाडौँ पार्टी सडक राजनीतिक जोखिम महिला विश्व".split(" ") },
    { id: "letters", title: "Letters", why: "First real test of the fingerspelling demo. Hold each shape about 2 s.", takes: 3,
      items: "अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह क्ष त्र ज्ञ".split(" ") },
    { id: "names", title: "Spelled names and places", why: "Letters joined into words, at normal speed then slowly.", takes: 2,
      items: "काठमाडौँ पोखरा ललितपुर भक्तपुर चितवन बुटवल धरान विराटनगर जनकपुर नेपालगञ्ज धनगढी इलाम मुस्ताङ गोरखा झापा थापा श्रेष्ठ गुरुङ राम सीता".split(" ") },
    { id: "sentences", title: "Everyday sentences", why: "First clean continuous test set. Write down the signs in the order you signed them.", takes: 1, gloss: true,
      items: ["म भात खान्छु।", "म पानी पिउँछु।", "आमाले दाल पकाउनुभयो।", "बिरालो सुतेको छ।", "आज घाम लागेको छ।", "भाइ खेल्दै छ।", "म बिरामी छु।", "नमस्ते साथी।", "धन्यवाद आमा।", "आज पानी परिरहेको छ।", "मेरो घर सानो छ।", "दिदी विद्यालयमा पढ्नुहुन्छ।", "बुबा बसमा बजार जानुभयो।", "भोलि म डाक्टरकहाँ अस्पताल जान्छु।", "हिजो चिसो थियो, आज तातो छ।", "मलाई भोक लाग्यो, भात खान्छु।", "बहिनीलाई तिर्खा लाग्यो, पानी चाहियो।", "तिमी कहाँ छौ?", "तिमी के खान्छौ?", "म आमालाई माया गर्छु।"] },
    { id: "phrases", title: "News phrases", why: "Repeat hundreds of times in broadcasts: the first anchors for labelling them.", takes: 3,
      items: ["सार्वजनिक सेवा प्रसारण नेपाल", "नेपाल सरकार", "प्रदेश सभा सदस्य", "प्रतिनिधि सभा", "जिल्ला सुरक्षा समिति", "स्थानीय तह", "स्वास्थ्य र शिक्षा", "सामाजिक सुरक्षा", "प्रधानमन्त्री", "नमस्कार … धन्यवाद"] },
    { id: "news_sent", title: "News-style sentences", why: "Signed at news speed, without stopping. Write the sign order.", takes: 1, gloss: true,
      items: ["नमस्कार, सार्वजनिक सेवा प्रसारण नेपाल टेलिभिजनमा स्वागत छ।", "आज नेपाल सरकारले नयाँ स्वास्थ्य नीति घोषणा गर्‍यो।", "प्रधानमन्त्रीले मन्त्रालयका अधिकारीसँग छलफल गर्नुभयो।", "प्रदेश सभा सदस्यहरूले सडक निर्माणको माग गरे।", "स्थानीय तहले विद्यालयमा पानीको व्यवस्था गर्‍यो।", "जिल्ला सुरक्षा समितिको बैठक आज बस्यो।", "सरकारले महिला र बालबालिकाको सुरक्षामा ध्यान दिएको छ।", "प्रतिनिधि सभामा आज बजेटमाथि छलफल भयो।", "भोलि काठमाडौँमा पानी पर्ने सम्भावना छ।", "अस्पतालमा डाक्टर र नर्सको कमी छ।", "नागरिकले सार्वजनिक सेवामा सुधार माग गरे।", "शिक्षा मन्त्रालयले परीक्षाको मिति सार्वजनिक गर्‍यो।", "बैंकले किसानलाई सहयोग गर्ने योजना ल्यायो।", "पार्टीका नेताहरूले देशको विकासबारे कुरा गरे।", "सडक दुर्घटनामा दुई जनाको मृत्यु भयो।", "नगरपालिकाले सफा पानीको काम सुरु गर्‍यो।", "राष्ट्रपतिले आज नयाँ मन्त्रीलाई शपथ गराउनुभयो।", "स्वास्थ्य सेवा सबै जिल्लामा पुर्‍याउने सरकारको योजना छ।", "आर्थिक र सामाजिक विकासका लागि नयाँ कार्यक्रम सुरु भयो।", "हेर्नुभएकोमा धन्यवाद, नमस्कार।"] },
  ];
  const $ = (id) => document.getElementById(id);
  const KEY = 'ampixa_record_v1';
  let st = { signer: '', done: {}, gloss: {} };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} totals(); };
  $('signer').value = st.signer || '';
  $('signer').addEventListener('input', (e) => { st.signer = e.target.value.trim(); save(); });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const host = $('groups');
  GROUPS.forEach((g) => {
    const sec = document.createElement('details'); sec.className = 'grp'; sec.id = g.id;
    sec.innerHTML = `<summary><span>${g.title}</span><span class="mono" data-count="${g.id}"></span></summary>
      <p class="why">${g.why} <b>${g.takes} take${g.takes > 1 ? 's' : ''} each.</b></p><div class="items"></div>`;
    const box = sec.querySelector('.items');
    g.items.forEach((w, i) => {
      const k = g.id + ':' + i;
      const row = document.createElement('div'); row.className = 'item';
      let takes = '';
      for (let t = 1; t <= g.takes; t++) takes += `<button class="take" data-k="${k}" data-t="${t}" aria-label="take ${t}">${t}</button>`;
      row.innerHTML = `<span class="np w">${esc(w)}</span><span class="takes">${takes}</span>` +
        (g.gloss ? `<input class="np gl" data-g="${k}" placeholder="signs in order: म · भात · खानु" value="${esc(st.gloss[k] || '')}">` : '');
      box.appendChild(row);
    });
    host.appendChild(sec);
  });
  host.addEventListener('click', (e) => {
    const b = e.target.closest('.take'); if (!b) return;
    const k = b.dataset.k, t = +b.dataset.t, cur = st.done[k] || 0;
    st.done[k] = cur >= t ? t - 1 : t; paint(); save();
  });
  host.addEventListener('input', (e) => { const g = e.target.dataset.g; if (g) { st.gloss[g] = e.target.value; save(); } });
  function paint() {
    document.querySelectorAll('.take').forEach((b) => b.classList.toggle('on', (st.done[b.dataset.k] || 0) >= +b.dataset.t));
  }
  function totals() {
    let all = 0, have = 0;
    GROUPS.forEach((g) => {
      let a = 0, h = 0;
      g.items.forEach((_, i) => { a += g.takes; h += Math.min(g.takes, st.done[g.id + ':' + i] || 0); });
      all += a; have += h;
      document.querySelector(`[data-count="${g.id}"]`).textContent = h + ' / ' + a + ' takes';
    });
    $('total').textContent = have + ' of ' + all + ' takes recorded';
    $('tbar').style.width = (100 * have / all) + '%';
  }
  paint(); totals();

  const result = () => ({ signer: st.signer, exported: new Date().toISOString(),
    items: GROUPS.flatMap((g) => g.items.map((w, i) => ({ group: g.id, item: w, takes_done: st.done[g.id + ':' + i] || 0, takes_wanted: g.takes, gloss: st.gloss[g.id + ':' + i] || undefined }))) });
  $('download').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(result(), null, 1)], { type: 'application/json' }));
    a.download = 'recording_log_' + (st.signer || 'anon') + '.json'; a.click();
  });
})();
