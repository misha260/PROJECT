(() => {
  const $ = s => document.querySelector(s), pad = n => String(n).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // часы
  const clock = $('#clock');
  setInterval(() => { const d = new Date(); clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }, 1000);
  // таймер до 11.12 18:00 по Москве
  const target = Date.UTC(2026, 11, 11, 15, 0, 0);
  const cdD = $('#cdD'), cdH = $('#cdH'), cdM = $('#cdM'), cdS = $('#cdS');
  const tickCd = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (!s) { var l = $('.cd__l'); if (l) l.textContent = 'восстановление началось'; }
    cdD.textContent = pad(Math.floor(s / 86400)); s %= 86400;
    cdH.textContent = pad(Math.floor(s / 3600)); cdM.textContent = pad(Math.floor(s % 3600 / 60)); cdS.textContent = pad(s % 60);
  };
  tickCd(); setInterval(tickCd, 1000);
  // кракозябры сыпятся
  const junk = '\uFFFD▒░▓ЃЌЉЊЋЏђѓќљњћџ¦§©¬®°±µ¶·';
  document.querySelectorAll('[data-moji]').forEach(el => {
    const base = el.textContent;
    if (!reduce) setInterval(() => {
      el.textContent = [...base].map(c => c !== ' ' && Math.random() < .25 ? junk[Math.random() * junk.length | 0] : c).join('');
      setTimeout(() => { el.textContent = base; }, 160);
    }, 900 + Math.random() * 800);
  });
  // окно ошибки трясётся вместо закрытия
  document.querySelectorAll('[data-shake]').forEach(b => b.addEventListener('click', () => {
    const w = b.closest('.win'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
  }));
  // вспышки «краша»
  const crash = $('#crash');
  if (!reduce) setInterval(() => { if (Math.random() < .35) { crash.classList.add('on'); setTimeout(() => crash.classList.remove('on'), 90 + Math.random() * 120); } }, 1800);
  // ник дёргается
  const nick = $('#nick');
  if (!reduce) setInterval(() => { const b = '@yanbasee'; nick.textContent = [...b].map(c => Math.random() < .35 ? '▒' : c).join(''); setTimeout(() => nick.textContent = b, 250); }, 2000);
  // плеер
  const au = $('#au'), items = [...document.querySelectorAll('#pl li')], t = $('#t'), ttl = $('#ttl'), seek = $('#seek');
  const vis = $('#vis'), vc = vis.getContext('2d');
  let cur = -1, raf = 0;
  const load = i => {
    cur = (i + items.length) % items.length;
    au.src = items[cur].dataset.src;
    ttl.textContent = `${cur + 1}. ${items[cur].querySelector('span').textContent} *** `;
    items.forEach((li, k) => li.classList.toggle('on', k === cur));
  };
  const play = () => { if (cur < 0) load(0); au.play().catch(() => {}); };
  const draw = () => {
    vc.fillStyle = '#000'; vc.fillRect(0, 0, vis.width, vis.height);
    for (let i = 0; i < 19; i++) { const h = au.paused ? 1 : Math.random() * vis.height | 0; for (let y = 0; y < h; y += 2) { vc.fillStyle = y > 26 ? '#e33' : y > 18 ? '#ee3' : '#3d3'; vc.fillRect(i * 8, vis.height - y - 1, 7, 1); } }
    raf = au.paused ? 0 : requestAnimationFrame(draw);
  };
  $('#play').onclick = play;
  $('#pause').onclick = () => au.pause();
  $('#prev').onclick = () => { load(cur - 1); play(); };
  $('#next').onclick = () => { load(cur + 1); play(); };
  items.forEach((li, i) => { li.tabIndex = 0; li.onclick = () => { load(i); play(); }; li.onkeydown = e => { if (e.key === 'Enter') { load(i); play(); } }; });
  au.ontimeupdate = () => { const s = au.currentTime | 0; t.textContent = `${pad(s / 60 | 0)}:${pad(s % 60)}`; if (au.duration) seek.value = au.currentTime / au.duration * 1000 | 0; };
  seek.oninput = () => { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; };
  au.onplay = () => { if (!raf) raf = requestAnimationFrame(draw); };
  au.onended = () => { load(cur + 1); play(); };
  draw();
})();
