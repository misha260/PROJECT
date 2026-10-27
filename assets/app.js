(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = $('#teaser');
  const soundBtn = $('#sound');

  /* ленты: повторяем текст, чтобы бесконечно ехал */
  $$('[data-tape]').forEach((el, i) => {
    const chunk = (el.dataset.tape + ' ● ').repeat(6);
    const track = document.createElement('div');
    track.className = 'tape__track';
    track.innerHTML = `<span>${chunk}</span><span aria-hidden="true">${chunk}</span>`;
    el.textContent = '';
    el.appendChild(track);
    if (i % 2) el.classList.add('tape--rev');
  });

  /* вход */
  const gate = $('#gate');
  const setSound = on => {
    video.muted = !on;
    soundBtn.setAttribute('aria-pressed', on);
    soundBtn.querySelector('b').textContent = on ? 'ВКЛ' : 'ВЫКЛ';
    if (on) video.play().catch(() => {});
  };
  const enter = withSound => {
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    gate.classList.add('lit');
    if (withSound) setSound(true);
    setTimeout(() => {
      gate.classList.add('off');
      document.body.classList.remove('locked');
      try { sessionStorage.setItem('v01-in', '1'); } catch (e) {}
    }, reduce ? 0 : 1000);
  };
  let seen = false;
  try { seen = sessionStorage.getItem('v01-in') === '1'; } catch (e) {}
  if (seen) gate.classList.add('off');
  else document.body.classList.add('locked');
  $('#enter').addEventListener('click', () => enter(false));
  $('#enterSound').addEventListener('click', () => enter(true));
  gate.addEventListener('pointermove', e => {
    gate.style.setProperty('--x', e.clientX + 'px');
    gate.style.setProperty('--y', e.clientY + 'px');
  });

  /* звук тизера */
  soundBtn.addEventListener('click', () => setSound(video.muted));
  video.play().catch(() => {});

  /* часы REC */
  const clock = $('#clock');
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tick(); setInterval(tick, 1000);

  /* обратный отсчёт: 07.11 18:00 МСК (UTC+3) */
  const start = Date.UTC(2026, 10, 7, 15, 0, 0);
  const end = Date.UTC(2026, 10, 8, 1, 0, 0);
  const cd = $('#cd'), cdLabel = $('#cdLabel');
  const count = () => {
    const now = Date.now();
    if (now >= end) { cdLabel.textContent = 'ОБЪЕКТ ЗАКРЫТ'; cd.textContent = 'ДО VOLUME02'; return; }
    if (now >= start) { cdLabel.textContent = 'ОБЪЕКТ ОТКРЫТ'; cd.textContent = 'СМЕНА ИДЁТ'; return; }
    let s = Math.floor((start - now) / 1000);
    const dd = Math.floor(s / 86400); s %= 86400;
    cd.textContent = `${dd}д ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
  };
  count(); setInterval(count, 1000);

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

  /* появление при скролле */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains('h') ? 'flick' : e.target.classList.contains('refl') ? 'on' : 'in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('[data-reveal], .h, .refl').forEach(el => io.observe(el));

  /* видео играет только пока видно; липкая кнопка — после hero */
  const sticky = $('#sticky');
  const access = $('#access');
  let heroVisible = true, accessVisible = false;
  const syncSticky = () => sticky.classList.toggle('show', !heroVisible && !accessVisible);
  new IntersectionObserver(([e]) => {
    heroVisible = e.isIntersecting;
    if (heroVisible) video.play().catch(() => {}); else video.pause();
    syncSticky();
  }, { threshold: 0.15 }).observe($('#top'));
  new IntersectionObserver(([e]) => { accessVisible = e.isIntersecting; syncSticky(); }, { threshold: 0.2 }).observe($('.pass'));

  /* фонарь: один луч на все улики */
  const evs = $$('.ev__ph');
  const visible = new Set();
  let px = innerWidth / 2, py = innerHeight / 2, lastMove = -1e9, raf = 0;
  let lx = px, ly = py;
  const evIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    if (visible.size && !raf) raf = requestAnimationFrame(loop);
  });
  evs.forEach(el => evIO.observe(el));

  const move = (x, y) => { px = x; py = y; lastMove = performance.now(); };
  addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
  addEventListener('touchstart', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });

  function loop(t) {
    raf = 0;
    if (!visible.size) return;
    let tx = px, ty = py;
    if (t - lastMove > 1800) {
      // никто не светит — фонарь сам гуляет по центру экрана, как у идущего человека
      const w = innerWidth, h = innerHeight;
      tx = w / 2 + Math.sin(t / 1100) * w * 0.22 + Math.sin(t / 370) * 6;
      ty = h * 0.48 + Math.cos(t / 1500) * h * 0.1 + Math.cos(t / 290) * 5;
    }
    const k = reduce ? 1 : 0.14;
    lx += (tx - lx) * k; ly += (ty - ly) * k;
    const flick = !reduce && Math.random() < 0.012;
    visible.forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', (lx - r.left) + 'px');
      el.style.setProperty('--y', (ly - r.top) + 'px');
      el.style.setProperty('--r', (flick ? 40 : Math.max(120, Math.min(200, innerWidth * 0.36))) + 'px');
    });
    raf = requestAnimationFrame(loop);
  }
})();
