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
    { t: 'kobai.exe — Реклама', b: 'МАРКЕТ НА ОБЪЕКТЕ!!!', s: 'kobai · hocus · merch · barber<br>07.11 · 18:00 — 04:00 · fābula HQ', c: 'ЖМИ СЮДА »' },
    { t: 'hocus.exe — Реклама', b: 'HOCUS НА ОБЪЕКТЕ', s: 'одежда · маркет VOLUME01<br>только 07.11', c: 'СМОТРЕТЬ »' },
    { t: 'barber.exe — Реклама', b: 'БАРБЕР НА ОБЪЕКТЕ', s: 'стрижка прямо на ивенте<br>07.11 · fābula HQ', c: 'ПОДРОБНЕЕ »' }
  ];
  const adpop = $('#adpop'), adX = $('#adX');
  let adN = 0, dodged = false;
  try { adN = +sessionStorage.getItem('v01-ads') || 0; } catch (e) {}
  const showAd = () => {
    if (adN >= ads.length || !lb.hidden || !modal.hidden || !gate.classList.contains('off')) return;
    const a = ads[adN++];
    try { sessionStorage.setItem('v01-ads', adN); } catch (e) {}
    $('#adTitle').textContent = a.t;
    $('#adBody').innerHTML = `<b>${a.b}</b><span>${a.s}</span><i>${a.c}</i>`;
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
  [25000, 75000, 150000].forEach(t => setTimeout(showAd, t));

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
    const img = e.target.closest('.ph img, .strip img, .docscan img');
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
})();
