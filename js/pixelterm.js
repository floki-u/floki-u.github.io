/* ===========================================================================
 * pixelterm.js — 主题主脚本（1:1 复刻 X-pixelterm 设计稿）
 * 含：主题切换 / 时钟 / Matrix 雨 / 像素云 / Boot 打字机 / 淡入
 * ========================================================================= */

/* ===== Theme switcher (with localStorage + system preference) ===== */
(function () {
  const KEY = 'pt-theme';
  const root = document.documentElement;
  function apply(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (_) { }
    // 切换 hljs 样式
    const dark = document.getElementById('hljs-dark');
    const light = document.getElementById('hljs-light');
    if (dark) dark.disabled = (t !== 'dark');
    if (light) light.disabled = (t !== 'light');
  }
  // 初始：localStorage > system > dark
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) { }
  if (!saved) {
    saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  apply(saved);

  document.addEventListener('click', e => {
    const tg = e.target.closest('[data-theme-toggle]');
    if (tg) apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
})();

/* ===== Live clock in titlebar ===== */
function updateClock() {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(updateClock, 1000); updateClock();

/* ===== Matrix rain (only meaningful in dark) ===== */
(function () {
  const cv = document.getElementById('rain');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const cols = Math.floor(window.innerWidth / 16);
  const drops = new Array(cols).fill(0).map(() => Math.random() * -100);
  const chars = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿｦｧｨｩｪｫｬｭｮｯABCDEFGHIJ#$%&*';
  function tick() {
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#22c55e';
    ctx.font = '14px JetBrains Mono, monospace';
    drops.forEach((y, i) => {
      const c = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(c, i * 16, y * 16);
      drops[i] = (y * 16 > cv.height && Math.random() > .975) ? 0 : y + 1;
    });
  }
  setInterval(tick, 70);
})();

/* ===== Pixel clouds (light mode only via CSS) ===== */
(function () {
  function makeCloud() {
    const c = document.createElement('div');
    c.className = 'cloud';
    c.style.top = (Math.random() * 32 + 6) + '%';
    c.style.transform = `translateX(-120px) scale(${.7 + Math.random() * .8})`;
    c.style.animationDuration = (20 + Math.random() * 22) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 52000);
  }
  for (let i = 0; i < 3; i++) setTimeout(makeCloud, i * 8000);
  setInterval(makeCloud, 14000);
})();

/* ===== Boot sequence typewriter ===== */
function typeLines(lines, container, opt) {
  opt = opt || {};
  const speed = opt.speed || 14;
  const pauseLine = opt.pauseLine || 120;
  return new Promise(async resolve => {
    for (const html of lines) {
      const div = document.createElement('div');
      container.appendChild(div);
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const txt = tmp.textContent;
      for (let i = 1; i <= txt.length; i++) {
        div.textContent = txt.slice(0, i);
        await new Promise(r => setTimeout(r, speed));
      }
      div.innerHTML = html;
      await new Promise(r => setTimeout(r, pauseLine));
    }
    // 末尾追加闪烁光标
    const cur = document.createElement('span');
    cur.className = 'cursor';
    container.appendChild(cur);
    resolve();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const boot = document.querySelector('[data-boot]');
  if (!boot) return;
  let lines;
  try { lines = JSON.parse(boot.dataset.boot || '[]'); } catch (_) { lines = []; }
  if (!lines.length) return;
  boot.innerHTML = '';
  typeLines(lines, boot, { speed: 10, pauseLine: 80 });
});

/* ===== Lenis smooth scroll (if loaded) ===== */
if (window.Lenis) {
  const lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }
}

/* ===== Fade reveal ===== */
window.addEventListener('load', () => {
  const els = document.querySelectorAll('.fade');
  if (window.gsap && window.ScrollTrigger) {
    els.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
    });
  } else {
    els.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)';
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      }, 80 + i * 60);
    });
  }
});
