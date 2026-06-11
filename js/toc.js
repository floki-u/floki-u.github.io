/* ============================================================================
 * toc.js — 文章 TOC scrollspy
 * 用 IntersectionObserver 监听标题，给当前可视的标题对应链接加 .active
 * 点击 TOC 链接：smooth scroll
 * 滚轮在 TOC 区域 → 仅滚 TOC 内部，不冒泡到主页面
 * ========================================================================== */
(function () {
  'use strict';
  const tocBox = document.querySelector('[data-toc]');
  if (!tocBox) return;

  const links = tocBox.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  const idMap = new Map();
  links.forEach(a => {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (id) idMap.set(id, a);
  });

  // 平滑滚动
  links.forEach(a => {
    a.addEventListener('click', e => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#' + id);
      }
    });
  });

  // scrollspy
  const heads = [];
  idMap.forEach((a, id) => {
    const el = document.getElementById(id);
    if (el) heads.push(el);
  });
  if (heads.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = idMap.get(en.target.id);
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          a.classList.add('active');
          // 把当前项滚到 TOC 中央
          const box = tocBox.getBoundingClientRect();
          const rect = a.getBoundingClientRect();
          const offset = rect.top - box.top - box.height / 2 + rect.height / 2;
          tocBox.scrollTop += offset;
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    heads.forEach(h => io.observe(h));
  }

  // 滚轮隔离：在 TOC 上滚动 → 只滚 TOC，主页面静止
  // 即使 TOC 内容没溢出，也吃掉 wheel 事件，避免主页面被滚
  tocBox.addEventListener('wheel', e => {
    const dy = e.deltaY;
    const canScrollUp = tocBox.scrollTop > 0;
    const canScrollDown = tocBox.scrollTop + tocBox.clientHeight < tocBox.scrollHeight - 1;
    // 完全拦截事件冒泡到 window（Lenis / 浏览器都拿不到）
    e.stopPropagation();
    if ((dy < 0 && !canScrollUp) || (dy > 0 && !canScrollDown)) {
      // TOC 已滚到顶/底 → 拦截，避免主页面继续滚
      e.preventDefault();
    }
    // 注：如果 TOC 内可滚，让默认行为滚 TOC（不调 preventDefault）
  }, { passive: false });

  // 触屏：同样隔离
  tocBox.addEventListener('touchmove', e => {
    e.stopPropagation();
  }, { passive: true });
})();
