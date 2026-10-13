(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const go = (el) => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  /* ---------- nav buttons (no reload) ---------- */
  document.querySelectorAll('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const t = $(a.getAttribute('href'));
    if (t) go(t);
    if (a.getAttribute('href') === '#birthday') startMusic(true);
  }));

  /* ---------- music ---------- */
  const audio = $('#audio'), mBtn = $('#musicBtn');
  let userPaused = false;
  const sync = () => {
    const on = !audio.paused;
    mBtn.setAttribute('aria-pressed', on);
    mBtn.setAttribute('aria-label', (on ? 'Jeda' : 'Putar') + ' musik Kekal - Nadin Amizah');
  };
  function startMusic(auto) {
    if (auto && (userPaused || !audio.paused)) return;
    audio.play().then(sync).catch(sync);
  }
  mBtn.addEventListener('click', () => {
    if (audio.paused) { userPaused = false; audio.play().then(sync).catch(sync); }
    else { userPaused = true; audio.pause(); sync(); }
  });
  ['play', 'pause'].forEach(ev => audio.addEventListener(ev, sync));

  /* ---------- gift ---------- */
  const gift = $('#gift'), hint = $('#giftHint'), box = $('#confetti');
  let busy = false;
  const colors = ['#FF808C', '#EFA1B9', '#FFC83D', '#8FD3F4', '#FFFFFF', '#F6A5C0'];
  function burst() {
    const r = gift.getBoundingClientRect(), p = box.getBoundingClientRect();
    const cx = r.left + r.width / 2 - p.left, cy = r.top + r.height * .35 - p.top;
    for (let i = 0; i < 34; i++) {
      const el = document.createElement('i');
      const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130;
      el.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};` +
        `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 50 + 120 * Math.random()}px;--r:${Math.random() * 720 - 360}deg;--d:${1 + Math.random() * .8}s`;
      box.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }
  gift.addEventListener('click', () => {
    if (busy) return;
    busy = true; gift.setAttribute('aria-disabled', 'true');
    hint.textContent = 'Taraa...';
    if (reduce) {
      gift.classList.add('is-open');
      setTimeout(finish, 500);
      return;
    }
    gift.classList.add('is-shaking');
    setTimeout(() => { gift.classList.remove('is-shaking'); gift.classList.add('is-open'); burst(); }, 600);
    setTimeout(finish, 2000);
  });
  function finish() {
    go($('#stickers'));
    hint.textContent = '';
    setTimeout(() => {
      gift.classList.remove('is-open'); gift.removeAttribute('aria-disabled');
      hint.textContent = 'Ketuk lagi kalau mau buka lagi'; busy = false;
    }, 1500);
  }

  /* ---------- stickers (single data-driven gallery) ---------- */
  const S = [
    ['01-hi', 'melambai'], ['02-kesal', 'kesal dengan tangan bersilang'], ['03-yeay', 'berseru yeay'],
    ['04-ramen', 'makan ramen'], ['05-coklat', 'makan coklat'], ['06-alhamdulillah', 'bersyukur, alhamdulillah'],
    ['07-ngantuk', 'ngantuk'], ['08-cape', 'capek'], ['09-sebel', 'sebal'],
    ['10-kucing', 'memeluk kucing'], ['11-sakit', 'sakit, berselimut'], ['12-taraa', 'taraa'],
    ['13-ketoprak', 'makan ketoprak'], ['14-ne-fighting', 'semangat, Ne Fighting'], ['15-pulang', 'senang pulang kerja'],
    ['16-kuromi', 'bersama Kuromi'], ['17-no-revisi', 'alhamdulillah no revisi'], ['18-laptop', 'bosan di depan laptop']
  ].map(([k, alt]) => ({
    full: `assets/stickers/sofi-sticker-${k}.png`,
    thumb: `assets/stickers/sofi-sticker-${k}-thumb.webp`,
    name: `sofi-sticker-${k}.png`,
    alt: `Sticker Sofi ${alt}`
  }));
  const grid = $('#grid');
  grid.innerHTML = S.map((s, i) => `<li><button class="sticker reveal" type="button" data-i="${i}" aria-label="Lihat ${s.alt}">
    <img src="${s.thumb}" alt="${s.alt}" width="640" height="640" loading="lazy" decoding="async"></button></li>`).join('');
  $('#count').textContent = `${S.length} sticker PNG transparan`;

  const dlg = $('#viewer'), vImg = $('#vImg'), vDl = $('#vDl');
  let cur = 0, opener = null;
  function show(i) {
    cur = (i + S.length) % S.length; const s = S[cur];
    vImg.src = s.full; vImg.alt = s.alt; vDl.href = s.full; vDl.setAttribute('download', s.name);
    vDl.setAttribute('aria-label', 'Download ' + s.name);
  }
  grid.addEventListener('click', e => {
    const b = e.target.closest('.sticker'); if (!b) return;
    document.querySelectorAll('.sticker.is-picked').forEach(x => x.classList.remove('is-picked'));
    b.classList.add('is-picked'); opener = b; show(+b.dataset.i);
    dlg.showModal();
  });
  $('#vClose').onclick = () => dlg.close();
  $('#vPrev').onclick = () => show(cur - 1);
  $('#vNext').onclick = () => show(cur + 1);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('close', () => opener && opener.focus({ preventScroll: true }));


  /* ---------- download semua: ZIP dibuat di browser (tanpa library) ---------- */
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = crcT[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function makeZip(files) {
    const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
    for (const f of files) {
      const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true);
      parts.push(lh.buffer, name, f.data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(ch.buffer, name);
      offset += 30 + name.length + size;
    }
    const csize = central.reduce((a, b) => a + (b.byteLength ?? b.length), 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
  }
  const dlAll = $('#dlAll'), countEl = $('#count');
  dlAll.addEventListener('click', async () => {
    if (dlAll.disabled) return;
    dlAll.disabled = true; dlAll.textContent = 'Menyiapkan ZIP...';
    try {
      const files = await Promise.all(S.map(async s => {
        const r = await fetch(s.full); if (!r.ok) throw new Error(s.full);
        return { name: 'Sofi-Sticker-Pack/' + s.name, data: new Uint8Array(await r.arrayBuffer()) };
      }));
      const url = URL.createObjectURL(makeZip(files));
      const a = document.createElement('a'); a.href = url; a.download = 'Sofi-Sticker-Pack.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      countEl.textContent = `${S.length} sticker sudah masuk ZIP`;
    } catch (err) {
      countEl.textContent = 'ZIP gagal dibuat. Buka situs lewat link online, atau unduh sticker satu per satu.';
    } finally { dlAll.disabled = false; dlAll.textContent = 'Download semua'; }
  });

  /* ---------- section reveal ---------- */
  const targets = document.querySelectorAll('.screen > *, .block > h2, .block > p, .card, .gift, .btn--20');
  targets.forEach(t => t.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(t => io.observe(t));
  } else document.querySelectorAll('.reveal').forEach(t => t.classList.add('in'));
})();
