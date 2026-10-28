(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const video = $('#teaser');
  const soundBtn = $('#sound');

  /* навигация: на десктопе всегда раскрыта */
  const side = $('#side');
  const mq = matchMedia('(min-width: 760px)');
  const syncSide = () => { if (mq.matches) side.open = true; };
  syncSide(); mq.addEventListener('change', syncSide);
  side.addEventListener('click', e => { if (e.target.closest('a') && !mq.matches) side.open = false; });

  /* звук */
  const setSound = on => {
    video.muted = !on;
    soundBtn.setAttribute('aria-pressed', on);
    soundBtn.querySelector('b').textContent = on ? 'вкл' : 'выкл';
    if (on) video.play().catch(() => {});
  };
  soundBtn.addEventListener('click', () => setSound(video.muted));
  video.play().catch(() => {});

  /* таймкод кассеты */
  const tc = $('#tc');
  video.addEventListener('timeupdate', () => {
    const t = Math.floor(video.currentTime);
    tc.textContent = `00:${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
  });

  /* вход: «загрузка» как у флеш-интро */
  const gate = $('#gate');
  let seen = false;
  try { seen = sessionStorage.getItem('v01-in') === '1'; } catch (e) {}
  if (seen) {
    gate.classList.add('off');
  } else {
    document.body.classList.add('locked');
    const pct = $('#pct');
    let p = 0;
    const step = () => {
      p = Math.min(100, p + Math.ceil(Math.random() * 9));
      pct.textContent = p;
      if (p < 100) setTimeout(step, p > 80 && p < 90 ? 260 : 45);
      else gate.classList.add('ready');
    };
    reduce ? (pct.textContent = 100, gate.classList.add('ready')) : step();
  }
  const enter = e => {
    e.preventDefault();
    gate.classList.add('off');
    document.body.classList.remove('locked');
    try { sessionStorage.setItem('v01-in', '1'); } catch (err) {}
  };
  $('#enter').addEventListener('click', enter);

  /* обратный отсчёт: 07.11 18:00 МСК, с сотыми — побольше цифр */
  const start = Date.UTC(2026, 10, 7, 15), end = Date.UTC(2026, 10, 8, 1);
  const cd = $('#cd'), vcrTime = $('#vcrTime');
  const count = () => {
    const now = Date.now();
    if (now >= end) cd.textContent = 'объект закрыт';
    else if (now >= start) cd.textContent = 'объект открыт';
    else {
      const ms = start - now; let s = Math.floor(ms / 1000);
      const d = Math.floor(s / 86400); s %= 86400;
      cd.textContent = `${d}д ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}.${pad(Math.floor(ms % 1000 / 10))}`;
    }
    const t = new Date();
    vcrTime.textContent = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
  };
  count(); setInterval(count, reduce ? 1000 : 53);

  /* счётчик посетителей */
  $('#counter').textContent = String(711 + Math.floor((Date.now() - Date.UTC(2026, 9, 27)) / 97000)).padStart(6, '0');

  /* закрашенное — тап открывает */
  $$('.rd').forEach(el => {
    const open = () => {
      if (el.classList.contains('open')) return;
      el.textContent = el.dataset.alt;
      el.classList.add('open');
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  /* кракозябры: текст периодически «сыпется» */
  const noise = '\uFFFD▒░▓ЃЌЉЊЋЏђѓќљњћџ¦§©¬®°±µ¶·';
  const mojis = $$('[data-moji]').map(el => ({ el, base: el.textContent }));
  if (!reduce && mojis.length) setInterval(() => {
    const m = mojis[Math.floor(Math.random() * mojis.length)];
    m.el.textContent = [...m.base].map(c => c !== ' ' && Math.random() < .3 ? noise[Math.floor(Math.random() * noise.length)] : c).join('');
    m.el.classList.add('glitch');
    setTimeout(() => { m.el.textContent = m.base; m.el.classList.remove('glitch'); }, 140 + Math.random() * 200);
  }, 700);

  /* системные окна */
  const modal = $('#sysModal'), sysTitle = $('#sysTitle'), sysText = $('#sysText');
  const toMoji = t => { try { return new TextDecoder('windows-1251').decode(new TextEncoder().encode(t)); } catch (e) { return t; } };
  const say = (title, text) => { sysTitle.textContent = title; sysText.textContent = text; modal.hidden = false; $('#sysOk').focus(); };
  const hideModal = () => { modal.hidden = true; };
  $('#sysOk').addEventListener('click', hideModal);
  modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) hideModal(); });
  const sys = {
    fav: () => say('Избранное', 'Не удалось добавить страницу в избранное. Объект не существует с 08.11.2004.'),
    home: () => say('Microsoft Internet Explorer', 'Стартовая страница не может быть изменена: объект закрыт.'),
    koi: () => say(toMoji('Кодировка'), toMoji('Кодировка не поддерживается. Выберите WIN.')),
    dll: () => say('svet.dll', 'Не удаётся открыть файл. Источник света не найден.'),
    cancel: () => { $('#progLeft').textContent = 'Невозможно отменить: файл используется другим процессом (svet.dll).'; },
    print: () => say('Печать', 'Принтер не найден. Подключите принтер к LPT1 и повторите попытку.'),
    mail: () => say('Outlook Express', 'Не удалось отправить сообщение: сервер SMTP volume01.narod.ru не отвечает.'),
    comment: () => say('Комментарии', 'Комментарии к этой записи отключены владельцем журнала.'),
    cart: () => say('Корзина', 'Корзина недоступна. Покупка только на объекте 07.11 с 18:00 до 04:00.')
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-sys]');
    if (!t) return;
    e.preventDefault();
    sys[t.dataset.sys] && sys[t.dataset.sys]();
  });

  /* навязчивая реклама маркета: появляется, пока человек сидит на сайте */
  const ads = [
    { t: 'jessie_luck.exe — Реклама', img: 'shop-gentle-1', b: 'ХИТ! CD-БРЕЛОК', s: 'Jessie Luck — Gentle<br>в наличии на объекте 07.11', c: 'КУПИТЬ »', h: '#shop' },
    { t: 'ck.exe — Реклама', img: 'shop-ck-3', b: 'NEW!!! ck', s: 'FORTUNA 812 &amp; Clayt Carter<br>CD-брелок на цепочке', c: 'ХОЧУ »', h: '#shop' },
    { t: 'whitetrash.exe — Реклама', img: 'whitetrash', b: 'WHITE TRASH', s: 'сэмплы капсулы<br>только 07.11 в Фабуле', c: 'ПОДРОБНЕЕ »', h: '#posts' },
    { t: 'kobai.exe — Реклама', b: 'МАРКЕТ НА ОБЪЕКТЕ!!!', s: 'kobai · hocus · merch · barber<br>07.11 · 18:00 — 04:00 · fābula HQ', c: 'ЖМИ СЮДА »', h: '#shop' }
  ];
  const adpop = $('#adpop'), adX = $('#adX');
  let adN = 0, dodged = false;
  try { adN = +sessionStorage.getItem('v01-ads') || 0; } catch (e) {}
  const showAd = () => {
    if (adN >= ads.length || !lb.hidden || !modal.hidden || !gate.classList.contains('off')) return;
    const a = ads[adN++];
    try { sessionStorage.setItem('v01-ads', adN); } catch (e) {}
    $('#adTitle').textContent = a.t;
    const body = $('#adBody');
    body.href = a.h;
    body.innerHTML = (a.img ? `<img src="assets/img/t/${a.img}.webp" alt="">` : '') + `<b>${a.b}</b><span>${a.s}</span><i>${a.c}</i>`;
    dodged = false; adX.style.transform = '';
    adpop.hidden = false;
  };
  const hideAd = () => { adpop.hidden = true; };
  adX.addEventListener('click', () => {
    // первый раз крестик «убегает», как на старых баннерах
    if (!dodged && !reduce) { dodged = true; adX.style.transform = `translate(${-40 - Math.random() * 60}px, ${10 + Math.random() * 30}px)`; return; }
    hideAd();
  });
  $('#adBody').addEventListener('click', hideAd);
  [20000, 60000, 110000, 180000].forEach(t => setTimeout(showAd, t));

  /* копирование кассеты: доходит до 99% и встаёт */
  const prog = $('#prog'), progLeft = $('#progLeft');
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    let p = 0, left = 239;
    const step = () => {
      p = Math.min(99, p + 3 + Math.random() * 9);
      left = Math.max(1, Math.round(left * (1 - p / 140)));
      prog.style.width = p + '%';
      if (!progLeft.textContent.startsWith('Невозможно')) progLeft.textContent = `Осталось: ${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
      if (p < 99) setTimeout(step, 380 + Math.random() * 500);
    };
    step();
  }).observe(prog);

  /* фото «проявляются» при скролле */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.ph, .strip figure').forEach(el => io.observe(el));

  /* подпись не должна попадать под затемнение */
  const syncCaps = () => $$('.ph').forEach(f => {
    const c = f.querySelector('figcaption');
    if (c) f.style.setProperty('--cap', c.offsetHeight + 'px');
  });
  syncCaps(); addEventListener('resize', syncCaps);

  /* лайтбокс */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const openLb = (src, cap) => { lbImg.src = src; lbCap.textContent = cap || ''; lb.hidden = false; };
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-img]');
    if (t) { e.preventDefault(); openLb(`assets/img/${t.dataset.img}.webp`, t.textContent.trim()); return; }
    const img = e.target.closest('.ph img, .strip img, .docscan img, .plan img, .prod__img img');
    if (img && !img.closest('.ph--poster a')) {
      const fig = img.closest('figure');
      const cap = fig && (fig.querySelector('figcaption') || fig.querySelector('.ts'));
      openLb(img.currentSrc || img.src, cap ? cap.textContent : img.alt);
    }
  });
  lb.addEventListener('click', closeLb);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* видео играет, только пока видно; липкие билеты — после шапки и не на допуске */
  const sticky = $('#sticky');
  let vcrVisible = true, admVisible = false;
  const syncSticky = () => sticky.classList.toggle('show', !vcrVisible && !admVisible);
  new IntersectionObserver(([e]) => {
    vcrVisible = e.isIntersecting;
    if (vcrVisible) video.play().catch(() => {}); else video.pause();
    syncSticky();
  }, { threshold: 0.1 }).observe($('.vcr'));
  new IntersectionObserver(([e]) => { admVisible = e.isIntersecting; syncSticky(); }, { threshold: 0.1 }).observe($('#access'));

  /* фонарь: один луч на все тёмные фото */
  const visible = new Set();
  let px = innerWidth / 2, py = innerHeight / 2, lx = px, ly = py, lastMove = -1e9, raf = 0;
  const lightIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    if (visible.size && !raf) raf = requestAnimationFrame(loop);
  });
  $$('.ph[data-light]').forEach(el => lightIO.observe(el));

  const move = (x, y) => { px = x; py = y; lastMove = performance.now(); };
  addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
  addEventListener('touchstart', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });

  function loop(t) {
    raf = 0;
    if (!visible.size) return;
    let tx = px, ty = py;
    if (t - lastMove > 1800) {
      // никто не светит — фонарь сам гуляет, как у идущего человека
      const w = innerWidth, h = innerHeight;
      tx = w / 2 + Math.sin(t / 1100) * w * 0.22 + Math.sin(t / 370) * 6;
      ty = h * 0.48 + Math.cos(t / 1500) * h * 0.1 + Math.cos(t / 290) * 5;
    }
    const k = reduce ? 1 : 0.14;
    lx += (tx - lx) * k; ly += (ty - ly) * k;
    const flick = !reduce && Math.random() < 0.012;
    const r = flick ? 40 : Math.max(120, Math.min(210, innerWidth * 0.38));
    visible.forEach(el => {
      const b = el.getBoundingClientRect();
      el.style.setProperty('--x', (lx - b.left) + 'px');
      el.style.setProperty('--y', (ly - b.top) + 'px');
      el.style.setProperty('--r', r + 'px');
    });
    raf = requestAnimationFrame(loop);
  }

  /* ---------- плеер ---------- */
  const audio = $('#ampAudio'), plItems = $$('#ampList li');
  const ampTime = $('#ampTime'), ampTitle = $('#ampTitle'), ampState = $('#ampState'), ampSeek = $('#ampSeek'), ampCover = $('#ampCover');
  const vis = $('#ampVis'), vctx = vis.getContext('2d');
  let cur = -1, actx = null, analyser = null, freq = null, visRaf = 0;
  const fmt = t => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}`;
  const loadTrack = i => {
    cur = (i + plItems.length) % plItems.length;
    const li = plItems[cur];
    audio.src = li.dataset.src;
    ampCover.src = li.dataset.cover;
    ampTitle.textContent = `${cur + 1}. ${li.querySelector('span').textContent} (${li.querySelector('i').textContent}) *** `;
    plItems.forEach((x, k) => x.classList.toggle('on', k === cur));
  };
  const initAnalyser = () => {
    if (actx) return;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser(); analyser.fftSize = 64;
      src.connect(analyser); analyser.connect(actx.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) { actx = null; analyser = null; }
  };
  const drawVis = () => {
    const w = vis.width, h = vis.height;
    vctx.fillStyle = '#000'; vctx.fillRect(0, 0, w, h);
    const bars = 19, bw = 7;
    if (analyser) analyser.getByteFrequencyData(freq);
    for (let i = 0; i < bars; i++) {
      const v = analyser ? freq[i + 1] / 255 : (audio.paused ? 0 : Math.random() * .6);
      const bh = Math.max(1, Math.round(v * h));
      for (let y = 0; y < bh; y += 2) {
        vctx.fillStyle = y > h * .75 ? '#e33' : y > h * .5 ? '#ee3' : '#3d3';
        vctx.fillRect(i * (bw + 1), h - y - 1, bw, 1);
      }
    }
    if (!audio.paused) visRaf = requestAnimationFrame(drawVis); else visRaf = 0;
  };
  const silenceOthers = () => {
    if (!video.muted) setSound(false);
    if (tvVideo && !tvVideo.muted) setTvSound(false);
  };
  const ampPlay = () => {
    if (cur < 0) loadTrack(0);
    initAnalyser();
    if (actx && actx.state === 'suspended') actx.resume();
    silenceOthers();
    audio.play().catch(() => {});
  };
  $('#ampPlay').addEventListener('click', ampPlay);
  $('#ampPause').addEventListener('click', () => audio.pause());
  $('#ampStop').addEventListener('click', () => { audio.pause(); audio.currentTime = 0; ampState.textContent = 'stop'; });
  $('#ampPrev').addEventListener('click', () => { loadTrack(cur - 1); ampPlay(); });
  $('#ampNext').addEventListener('click', () => { loadTrack(cur + 1); ampPlay(); });
  plItems.forEach((li, i) => {
    li.tabIndex = 0;
    const go = () => { loadTrack(i); ampPlay(); };
    li.addEventListener('click', go);
    li.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
  $('#ampVol').addEventListener('input', e => { audio.volume = e.target.value / 100; });
  audio.volume = .8;
  ampSeek.addEventListener('input', () => { if (audio.duration) audio.currentTime = ampSeek.value / 1000 * audio.duration; });
  audio.addEventListener('timeupdate', () => {
    ampTime.textContent = fmt(audio.currentTime);
    if (audio.duration) ampSeek.value = Math.round(audio.currentTime / audio.duration * 1000);
  });
  audio.addEventListener('play', () => { ampState.textContent = 'play'; if (!visRaf) visRaf = requestAnimationFrame(drawVis); });
  audio.addEventListener('pause', () => { if (audio.currentTime) ampState.textContent = 'pause'; });
  audio.addEventListener('ended', () => { loadTrack(cur + 1); ampPlay(); });
  drawVis();

  /* ---------- телевизор: 5 каналов ---------- */
  const channels = [
    { src: 'assets/video/tv-fakov.mp4', poster: 'assets/img/tv/tv-fakov.webp', name: 'Fakov — клип' },
    { src: 'assets/video/tv-fbs.mp4', poster: 'assets/img/tv/tv-fbs.webp', name: 'FBS — клип' },
    { src: 'assets/video/tv-platov.mp4', poster: 'assets/img/tv/tv-platov.webp', name: 'platov — TWO BAGZ (sg080) · анимация d3n' },
    { src: 'assets/video/tv-druma.mp4', poster: 'assets/img/tv/tv-druma.webp', name: 'D R U M A' },
    { src: 'assets/video/whitetrash.mp4', poster: 'assets/img/tv/whitetrash.webp', name: 'White Trash — 07 November', fit: 'contain' }
  ];
  const crt = $('#tv'), tvVideo = $('#tvVideo'), tvSub = $('#tvSub'), tvCh = $('#tvCh'), tvSnd = $('#tvSnd');
  const tvNoise = $('#tvNoise'), nctx = tvNoise.getContext('2d');
  const nimg = nctx.createImageData(tvNoise.width, tvNoise.height);
  let noiseRaf = 0, tvOn = false;
  const drawNoise = () => {
    const d = nimg.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nctx.putImageData(nimg, 0, 0);
    noiseRaf = crt.classList.contains('static') ? requestAnimationFrame(drawNoise) : 0;
  };
  const staticBurst = ms => {
    crt.classList.add('static');
    if (!noiseRaf) noiseRaf = requestAnimationFrame(drawNoise);
    setTimeout(() => crt.classList.remove('static'), reduce ? 0 : ms);
  };
  function setTvSound(on) {
    tvVideo.muted = !on;
    tvSnd.setAttribute('aria-pressed', on);
    if (on) { if (!audio.paused) audio.pause(); if (!video.muted) setSound(false); }
  }
  tvVideo.muted = true;
  const tune = i => {
    const ch = channels[i];
    staticBurst(380);
    tvVideo.src = ch.src; tvVideo.poster = ch.poster; tvVideo.style.objectFit = ch.fit || 'cover';
    tvVideo.loop = true;
    tvVideo.play().catch(() => {});
    tvCh.textContent = `CH ${pad(i + 1)}`;
    tvSub.textContent = ch.name;
    $$('.crt__btn[data-ch]').forEach(b => b.classList.toggle('on', +b.dataset.ch === i));
    crt.classList.add('live'); tvOn = true;
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ch]');
    if (b) tune(+b.dataset.ch);
  });
  tvSnd.addEventListener('click', () => setTvSound(tvVideo.muted));
  $('#tvPwr').addEventListener('click', () => {
    tvVideo.pause(); tvVideo.removeAttribute('src'); tvVideo.load();
    crt.classList.remove('live'); tvOn = false; tvSub.textContent = 'Нажми на канал.';
    $$('.crt__btn[data-ch]').forEach(b => b.classList.remove('on'));
    staticBurst(250);
  });
  new IntersectionObserver(([e]) => {
    if (!tvOn) return;
    if (e.isIntersecting) tvVideo.play().catch(() => {}); else tvVideo.pause();
  }, { threshold: .2 }).observe(crt);

  /* ---------- мини-игра VOLUME01.EXE ---------- */
  const gc = $('#gCanvas'), g = gc.getContext('2d'), gStart = $('#gStart');
  const gV = $('#gVests'), gT = $('#gTime'), gB = $('#gBest');
  const W = gc.width, H = gc.height, keys = {};
  let best = 0, st = null, gRaf = 0, gVisible = false;
  try { best = +localStorage.getItem('v01-best') || 0; } catch (e) {}
  gB.textContent = best;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const newGame = () => {
    const vests = Array.from({ length: 6 }, () => ({ x: rnd(10, W - 14), y: rnd(14, H - 14), got: false }));
    const dancers = Array.from({ length: 3 }, (_, i) => ({ x: [10, W - 14, W / 2][i], y: [H - 14, 12, H - 12][i], ph: rnd(0, 6) }));
    return { p: { x: W / 2, y: H / 2 }, vests, dancers, got: 0, t: 239, last: performance.now(), over: false, win: false };
  };
  const drawWorker = (x, y) => {
    g.fillStyle = '#f2c400'; g.fillRect(x - 3, y - 7, 6, 3);
    g.fillStyle = '#e0b090'; g.fillRect(x - 2, y - 4, 4, 2);
    g.fillStyle = '#ff6a00'; g.fillRect(x - 3, y - 2, 6, 6);
    g.fillStyle = '#fff'; g.fillRect(x - 3, y, 6, 1); g.fillRect(x - 1, y - 2, 1, 6);
    g.fillStyle = '#223'; g.fillRect(x - 3, y + 4, 2, 3); g.fillRect(x + 1, y + 4, 2, 3);
  };
  const drawDancer = (d, t) => {
    const bob = Math.sin(t / 120 + d.ph) * 1.5 | 0, arm = Math.sin(t / 90 + d.ph) > 0 ? -3 : 1;
    g.fillStyle = '#d8d8d8'; g.fillRect(d.x - 3, d.y - 8 + bob, 6, 5);
    g.fillStyle = '#111'; g.fillRect(d.x - 2, d.y - 6 + bob, 1, 1); g.fillRect(d.x + 1, d.y - 6 + bob, 1, 1);
    g.fillStyle = '#2a2a2a'; g.fillRect(d.x - 3, d.y - 3 + bob, 6, 7);
    g.fillRect(d.x - 5, d.y + arm + bob, 2, 3); g.fillRect(d.x + 3, d.y - arm - 2 + bob, 2, 3);
  };
  const drawVest = (v, t) => {
    const glow = Math.sin(t / 200 + v.x) * .3 + .7;
    g.fillStyle = `rgba(255,120,0,${glow})`; g.fillRect(v.x - 3, v.y - 3, 6, 7);
    g.fillStyle = `rgba(255,255,255,${glow})`; g.fillRect(v.x - 3, v.y, 6, 1); g.fillRect(v.x - 2, v.y - 3, 1, 7); g.fillRect(v.x + 1, v.y - 3, 1, 7);
  };
  const render = t => {
    g.fillStyle = '#0d0d0d'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1a1a1a';
    for (let x = 0; x < W; x += 10) g.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 10) g.fillRect(0, y, W, 1);
    g.fillStyle = '#e8e3d6'; g.fillRect(70, 50, 20, 20); g.fillStyle = '#9a958a'; g.fillRect(70, 66, 20, 4);
    st.dancers.forEach(d => drawDancer(d, t));
    drawWorker(st.p.x, st.p.y);
    const grd = g.createRadialGradient(st.p.x, st.p.y, 5, st.p.x, st.p.y, 30);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,.97)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    st.vests.forEach(v => { if (!v.got) drawVest(v, t); });
    g.fillStyle = '#f22';
    st.dancers.forEach(d => { const bob = Math.sin(t / 120 + d.ph) * 1.5 | 0; g.fillRect(d.x - 2, d.y - 6 + bob, 1, 1); g.fillRect(d.x + 1, d.y - 6 + bob, 1, 1); });
  };
  const overlay = (a, b) => {
    g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 40, W, 40);
    g.fillStyle = '#fff200'; g.font = '9px monospace'; g.textAlign = 'center';
    g.fillText(a, W / 2, 56); g.fillStyle = '#ddd'; g.font = '7px monospace'; g.fillText(b, W / 2, 68);
  };
  const gameOver = win => {
    st.over = true; st.win = win;
    const score = st.got;
    if (score > best) { best = score; gB.textContent = best; try { localStorage.setItem('v01-best', best); } catch (e) {} }
    render(performance.now());
    overlay(win ? 'БРИГАДА №7 ПРИНЯТА' : 'СИГНАЛ ПОТЕРЯН', win ? '07.11 · 18:00 · fābula HQ' : `жилетов: ${score}/6`);
    gStart.textContent = '▶ ЕЩЁ РАЗ'; gStart.hidden = false;
  };
  const step = t => {
    gRaf = 0;
    if (!st || st.over || !gVisible) return;
    const dt = Math.min(50, t - st.last); st.last = t;
    const sp = .055 * dt;
    if (keys.up) st.p.y -= sp; if (keys.down) st.p.y += sp;
    if (keys.left) st.p.x -= sp; if (keys.right) st.p.x += sp;
    st.p.x = Math.max(4, Math.min(W - 4, st.p.x)); st.p.y = Math.max(8, Math.min(H - 6, st.p.y));
    st.dancers.forEach((d, i) => {
      const dx = st.p.x - d.x, dy = st.p.y - d.y, dist = Math.hypot(dx, dy) || 1;
      const ds = (.012 + st.got * .003 + i * .002) * dt;
      d.x += dx / dist * ds + Math.sin(t / 300 + d.ph) * .15; d.y += dy / dist * ds + Math.cos(t / 260 + d.ph) * .15;
      if (dist < 5) gameOver(false);
    });
    st.vests.forEach(v => { if (!v.got && Math.abs(v.x - st.p.x) < 6 && Math.abs(v.y - st.p.y) < 7) { v.got = true; st.got++; } });
    st.t -= dt / 1000;
    gV.textContent = `${st.got}/6`;
    gT.textContent = `${pad(Math.max(0, Math.floor(st.t / 60)))}:${pad(Math.max(0, Math.floor(st.t % 60)))}`;
    if (st.over) return;
    if (st.got === 6) return gameOver(true);
    if (st.t <= 0) return gameOver(false);
    render(t);
    gRaf = requestAnimationFrame(step);
  };
  const startGame = () => {
    st = newGame(); gStart.hidden = true;
    st.last = performance.now();
    if (!gRaf) gRaf = requestAnimationFrame(step);
  };
  gStart.addEventListener('click', startGame);
  const dirs = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  addEventListener('keydown', e => { const d = dirs[e.code]; if (d && st && !st.over && gVisible) { keys[d] = true; e.preventDefault(); } });
  addEventListener('keyup', e => { const d = dirs[e.code]; if (d) keys[d] = false; });
  $$('.game__pad button').forEach(b => {
    const d = b.dataset.d;
    b.addEventListener('pointerdown', e => { e.preventDefault(); keys[d] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { keys[d] = false; }));
  });
  new IntersectionObserver(([e]) => {
    gVisible = e.isIntersecting;
    if (gVisible && st && !st.over) { st.last = performance.now(); if (!gRaf) gRaf = requestAnimationFrame(step); }
  }).observe(gc);
  st = newGame(); render(0); overlay('VOLUME01.EXE', 'найди 6 жилетов в темноте'); st = null;
})();
