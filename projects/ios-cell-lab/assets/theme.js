/* ============================================================
 * iOS List Lab · 主题切换器
 * - 默认跟随系统 prefers-color-scheme
 * - localStorage 持久化用户选择
 * - View Transitions API 圆形丝滑切换动画
 * - 左下角浮动按钮（月亮 / 太阳变形）
 * ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'iosListLab.theme';

  // ---------- 1. 初始化主题（HEAD 阶段就执行避免闪烁） ----------
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }
  applyTheme(getInitialTheme());

  // ---------- 2. DOM ready 后注入按钮 ----------
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    // 注入按钮 HTML
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', '切换主题');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" stroke="currentColor" fill="currentColor" aria-hidden="true">
        <mask id="theme-mask-svg">
          <rect width="100%" height="100%" fill="white"/>
          <circle class="icon-mask" cx="16" cy="9" r="9" fill="black"/>
        </mask>
        <circle cx="12" cy="12" r="8" mask="url(#theme-mask-svg)" stroke="none"/>
        <g class="icon-rays" stroke-width="1.6" stroke-linecap="round" fill="none">
          <line x1="12" y1="1.5" x2="12" y2="3.5"/>
          <line x1="12" y1="20.5" x2="12" y2="22.5"/>
          <line x1="1.5" y1="12" x2="3.5" y2="12"/>
          <line x1="20.5" y1="12" x2="22.5" y2="12"/>
          <line x1="4.4" y1="4.4" x2="5.9" y2="5.9"/>
          <line x1="18.1" y1="18.1" x2="19.6" y2="19.6"/>
          <line x1="4.4" y1="19.6" x2="5.9" y2="18.1"/>
          <line x1="18.1" y1="5.9" x2="19.6" y2="4.4"/>
        </g>
      </svg>
    `;
    document.body.appendChild(btn);

    // ---------- 3. 切换处理 ----------
    function toggle(e) {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);

      const supportsViewTransition = !!document.startViewTransition;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!supportsViewTransition || reduceMotion) {
        applyTheme(next);
        return;
      }

      // ⭐ View Transitions API：从按钮位置圆形扩散
      const x = (e && e.clientX) || btn.getBoundingClientRect().left + 24;
      const y = (e && e.clientY) || btn.getBoundingClientRect().top + 24;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        applyTheme(next);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    }

    btn.addEventListener('click', toggle);

    // ---------- 4. 系统主题变化时跟随（仅当用户没手动设置过） ----------
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  });
})();
