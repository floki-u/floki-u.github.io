/* ============================================================================
 * pixelterm 主题 — Mermaid 图表运行时初始化
 * ----------------------------------------------------------------------------
 * 原理：
 *   Hexo + highlight.js 会把 ```mermaid 代码块渲染成
 *     <figure class="highlight plaintext"><table>...<span class="line">...</span>...</figure>
 *   这里做的事：
 *     1. 扫描页面所有 <figure class="highlight ...">，
 *        如果其首行是 Mermaid 语法关键字（flowchart / graph / sequenceDiagram 等），
 *        则认定它是 Mermaid 代码块；
 *     2. 抽出原始文本，替换成 <pre class="mermaid">ORIG_TEXT</pre>；
 *     3. 调用 mermaid.run() 渲染为 SVG；
 *     4. 监听主题切换按钮 / localStorage 变化，重新以对应主题渲染。
 * 依赖：window.mermaid（由 layout.ejs 中的 <script src> 加载）
 * ========================================================================== */
(function () {
  'use strict';

  // Mermaid 所有图表类型关键字（判断一个代码块是不是 mermaid 就看首行）
  var MERMAID_KEYWORDS = [
    'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'stateDiagram-v2', 'erDiagram', 'journey', 'gantt', 'pie', 'requirementDiagram',
    'gitGraph', 'mindmap', 'timeline', 'quadrantChart', 'xychart-beta',
    'sankey-beta', 'block-beta', 'C4Context', 'C4Container', 'C4Component'
  ];

  function isMermaidFirstLine(line) {
    line = (line || '').trim();
    for (var i = 0; i < MERMAID_KEYWORDS.length; i++) {
      var kw = MERMAID_KEYWORDS[i];
      if (line === kw || line.indexOf(kw + ' ') === 0 ||
          line.indexOf(kw + '\t') === 0 || line.indexOf(kw + '\n') === 0) {
        return true;
      }
    }
    return false;
  }

  // 从 Hexo highlight 产出的 <figure> 中抽出原始代码
  function extractCodeFromFigure(fig) {
    // 优先 .code 侧的 span.line（忽略 .gutter 的行号）
    var codeCell = fig.querySelector('td.code') || fig;
    var lines = codeCell.querySelectorAll('span.line');
    if (lines.length > 0) {
      var arr = [];
      for (var i = 0; i < lines.length; i++) {
        arr.push(lines[i].textContent);
      }
      return arr.join('\n');
    }
    // 兜底：如果没有 span.line（别的高亮器），直接取 code 里的文本
    var pre = codeCell.querySelector('pre');
    return pre ? pre.textContent : codeCell.textContent;
  }

  // 把识别到的 Hexo figure 替换成 mermaid 容器
  // 返回替换的个数
  function convertFiguresToMermaidPre(root) {
    var figs = root.querySelectorAll(
      'figure.highlight.mermaid, figure.highlight.plaintext, figure.highlight'
    );
    var converted = 0;
    for (var i = 0; i < figs.length; i++) {
      var fig = figs[i];
      if (fig.dataset.mermaidConverted === '1') continue;

      var code = extractCodeFromFigure(fig);
      if (!code) continue;

      // 首行判断
      var firstLine = code.split('\n').find(function (l) { return l.trim().length > 0; });
      if (!firstLine) continue;

      // 显式带 mermaid class，或首行是 mermaid 关键字
      var isMermaid = fig.classList.contains('mermaid') || isMermaidFirstLine(firstLine);
      if (!isMermaid) continue;

      // 创建 <pre class="mermaid"> 替换 figure
      var pre = document.createElement('pre');
      pre.className = 'mermaid';
      pre.textContent = code;           // textContent 自动做 HTML 转义
      pre.dataset.mermaidSrc = code;    // 留一份原文，便于主题切换时重新渲染
      fig.parentNode.replaceChild(pre, fig);
      converted++;
    }
    return converted;
  }

  // 当前主题（读取 <html data-theme>）
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dark';
  }

  // 初始化 mermaid 配置
  function initMermaid() {
    if (!window.mermaid) return false;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',   // 允许 subgraph 标题里的 HTML emoji
        theme: currentTheme(),
        flowchart: { htmlLabels: true, curve: 'basis' },
        themeVariables: {
          fontFamily: '"JetBrains Mono","LXGW WenKai","PingFang SC",monospace',
          fontSize: '14px'
        }
      });
    } catch (e) { /* noop */ }
    return true;
  }

  // 执行一次渲染
  function runMermaid() {
    if (!window.mermaid || typeof window.mermaid.run !== 'function') return;
    try {
      window.mermaid.run({ querySelector: 'pre.mermaid:not([data-processed="true"])' });
    } catch (e) {
      // 老版本 API 兜底
      if (typeof window.mermaid.init === 'function') {
        try { window.mermaid.init(undefined, document.querySelectorAll('pre.mermaid')); }
        catch (e2) { /* noop */ }
      }
    }
  }

  // 主题切换：重置 processed 标记 + 恢复原文 + 重新渲染
  function rerenderForTheme() {
    if (!window.mermaid) return;
    var pres = document.querySelectorAll('pre.mermaid');
    pres.forEach(function (pre) {
      var src = pre.dataset.mermaidSrc || pre.textContent;
      pre.removeAttribute('data-processed');
      pre.innerHTML = '';
      pre.textContent = src;
    });
    initMermaid();
    runMermaid();
  }

  // 等 mermaid script 加载完再启动
  function whenMermaidReady(cb, retries) {
    retries = retries == null ? 40 : retries;   // 最多等 ~4s
    if (window.mermaid) { cb(); return; }
    if (retries <= 0) return;
    setTimeout(function () { whenMermaidReady(cb, retries - 1); }, 100);
  }

  function boot() {
    // 先扫描 figure，看看当前页面是否有 mermaid 代码块
    var count = convertFiguresToMermaidPre(document);
    // 也支持用户直接写裸的 <pre class="mermaid">
    if (count === 0 && document.querySelector('pre.mermaid') == null) {
      return; // 页面没有 mermaid 图，啥也不做
    }
    whenMermaidReady(function () {
      if (!initMermaid()) return;
      runMermaid();

      // 监听主题切换
      var btn = document.querySelector('[data-theme-toggle]');
      if (btn) btn.addEventListener('click', function () {
        // 主题切换 JS 改 data-theme 是同步的，稍等一帧再渲染
        setTimeout(rerenderForTheme, 50);
      });
      // 兜底：监听 data-theme 属性变化（防止有第三方脚本改它）
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].attributeName === 'data-theme') {
            rerenderForTheme();
            break;
          }
        }
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
