/* ============================================================================
 * cat-buddy.js — 猫咪陪伴组件
 * 配置在全局变量 window.PT_CAT_BUDDY（由 _partial/cat-buddy.ejs 注入）
 * - 倾斜跟随鼠标（带死区，鼠标远时挺直）
 * - 点击跳跃 + 弹气泡台词
 * - 鼠标离开窗口 → 显示 ...zZz
 * ========================================================================== */
(function () {
  'use strict';
  const opts = window.PT_CAT_BUDDY || {};
  if (!opts.src) return;

  const SIZE = opts.size || 100;
  const SRC = opts.src;
  const CORNER = opts.corner || 'br';
  const FOLLOW = opts.followMouse !== false;
  const PHRASES = (opts.phrases && opts.phrases.length) ? opts.phrases : ['MEOW'];
  const JUMP_MS = 900;

  const cat = document.createElement('div');
  cat.id = 'cat-buddy';
  cat.innerHTML = '<div class="cb-jumper"><img class="cb-img" src="' + SRC + '" alt="cat" draggable="false"/></div>'
                + '<div class="cb-shadow"></div>'
                + '<div class="cb-bubble">' + PHRASES[0] + '</div>';
  document.body.appendChild(cat);

  // 注入样式
  const css = document.createElement('style');
  const cornerStyles = {
    br: 'bottom:24px; right:24px;',
    bl: 'bottom:24px; left:24px;',
    tr: 'top:80px;    right:24px;',
    tl: 'top:80px;    left:24px;'
  };
  const bubbleSide = (CORNER === 'bl' || CORNER === 'tl');
  css.textContent = `
    #cat-buddy{position:fixed; ${cornerStyles[CORNER] || cornerStyles.br}
      width:${SIZE}px; z-index:9990; cursor:pointer; user-select:none;
      filter:drop-shadow(0 8px 18px rgba(0,0,0,.45));}
    #cat-buddy .cb-jumper{width:100%; will-change:transform;}
    #cat-buddy .cb-img{width:100%; display:block; transform-origin:50% 100%; will-change:transform;}
    #cat-buddy .cb-shadow{position:absolute; left:14%; right:14%; bottom:-6px; height:10px;
      background:radial-gradient(ellipse,rgba(0,0,0,.45),transparent 70%); filter:blur(4px);
      transform-origin:50% 50%; will-change:transform,opacity;}
    #cat-buddy .cb-bubble{position:absolute; ${bubbleSide ? 'left:78%;' : 'right:78%;'} bottom:60%;
      padding:8px 12px; background:var(--surf,#0f1612); color:var(--accent,#22c55e);
      border:2px solid var(--border,#22c55e); border-radius:0;
      font:700 11px/1 "Press Start 2P",monospace; letter-spacing:.04em; text-transform:uppercase;
      box-shadow:3px 3px 0 var(--shadow,#000);
      opacity:0; transform:translateY(8px) scale(.85); transition:all .35s cubic-bezier(.2,.7,.2,1);
      white-space:nowrap; pointer-events:none;}
    #cat-buddy .cb-bubble::after{content:""; position:absolute; ${bubbleSide ? 'left:-6px;' : 'right:-6px;'} bottom:14px;
      width:10px; height:10px; background:var(--surf,#0f1612); transform:rotate(45deg);
      ${bubbleSide ? 'border-left:2px solid var(--border,#22c55e); border-top:2px solid var(--border,#22c55e);'
                   : 'border-right:2px solid var(--border,#22c55e); border-bottom:2px solid var(--border,#22c55e);'}}
    #cat-buddy.show .cb-bubble{opacity:1; transform:translateY(0) scale(1);}
    #cat-buddy.jump .cb-jumper{animation:cb-jump ${JUMP_MS}ms cubic-bezier(.34,1.56,.64,1) 1;}
    @keyframes cb-jump{
      0%   {transform:translateY(0);}
      45%  {transform:translateY(-36px);}
      100% {transform:translateY(0);}}
    @media (max-width:640px){#cat-buddy{width:${Math.round(SIZE * .78)}px; bottom:16px; right:16px;}}
  `;
  document.head.appendChild(css);

  const img = cat.querySelector('.cb-img');
  const shadow = cat.querySelector('.cb-shadow');
  const bubble = cat.querySelector('.cb-bubble');

  // 鼠标跟随状态
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cxv = 0, cyv = 0, scv = 1, rotv = 0;
  let tcx = 0, tcy = 0, tsc = 1, trot = 0;
  let shScale = 1, tshScale = 1;
  let t0 = 0;
  let isJumping = false;

  if (FOLLOW) {
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  }

  function updateTargets() {
    if (!FOLLOW) return;
    const r = cat.getBoundingClientRect();
    const ccx = r.left + r.width / 2;
    const ccy = r.top + r.height * 0.4;
    const dx = mx - ccx, dy = my - ccy;
    const dist = Math.hypot(dx, dy);
    const near = Math.max(0, 1 - dist / 420);
    // 死区：远 → 挺直，近 → 倾斜（smoothstep）
    const FAR = 500, NEAR = 120;
    let k = (FAR - dist) / (FAR - NEAR);
    k = Math.max(0, Math.min(1, k));
    k = k * k * (3 - 2 * k);
    tcx = Math.max(-18, Math.min(18, dx / 16)) * k;
    tcy = Math.max(-28, Math.min(6, -Math.max(0, ccy - my) / 8 + Math.max(0, my - ccy) / 26)) * k;
    trot = Math.max(-22, Math.min(22, -dx / 14)) * k;
    tsc = 1 + near * 0.18;
    tshScale = 1 - near * 0.35;
  }

  function tick(now) {
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    updateTargets();
    cxv += (tcx - cxv) * .18;
    cyv += (tcy - cyv) * .18;
    scv += (tsc - scv) * .18;
    rotv += (trot - rotv) * .18;
    const breath = 1 + Math.sin(t * 1.4) * 0.02;
    img.style.transform = `translate(${cxv.toFixed(2)}px, ${cyv.toFixed(2)}px) rotate(${rotv.toFixed(2)}deg) scale(${(scv * breath).toFixed(3)})`;
    shScale += (tshScale - shScale) * .18;
    shadow.style.transform = `scaleX(${shScale.toFixed(3)})`;
    shadow.style.opacity = (0.6 + (shScale - 1) * 0.6).toFixed(2);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // 喵叫 + 跳跃
  let bubbleTimer;
  function meow() {
    bubble.textContent = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    cat.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => cat.classList.remove('show'), 1700);
  }
  function doJump() {
    if (isJumping) return;
    isJumping = true;
    cat.classList.add('jump');
    setTimeout(() => {
      cat.classList.remove('jump');
      isJumping = false;
    }, JUMP_MS + 30);
  }
  cat.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    if (isJumping) return;
    doJump();
    meow();
  });
  setInterval(() => { if (!isJumping && Math.random() < .15) meow(); }, 7500);

  document.addEventListener('mouseleave', () => {
    if (isJumping) return;
    bubble.textContent = '...zZz';
    cat.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => cat.classList.remove('show'), 2200);
  });
})();
