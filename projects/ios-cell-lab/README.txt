# iOS List Lab

把 iOS 列表写明白的 19 个例子。从最基础的 cell 复用，到照着抖音做一个全屏视频流。每个例子都有视觉演示、能跑的 Objective-C 代码、写错 vs 写对的对比。

纯静态站点。无构建、无依赖、无后端。

---

## 怎么打开

**方式 1：直接双击 `index.html`**

最快。但部分浏览器对 `file://` 协议下的相对路径有限制，可能会出现样式不加载的情况。如果遇到，用方式 2。

**方式 2：起一个本地 HTTP 服务**

```bash
cd ios_cell_previews
python3 -m http.server 8765
```

然后浏览器打开 `http://localhost:8765`。

---

## 目录结构

```
ios_cell_previews/
├── index.html              主页
├── README.md               本文档
│
├── pages/                  3 个分类入口页
│   ├── basics.html         level 01 · 基础（6 个）
│   ├── advanced.html       level 02 · 常用组件（6 个）
│   └── patterns.html       level 03 · 头部 App 拆解（7 个）
│
├── examples/               19 个示例页
│   ├── 01_message_cell.html       聊天列表
│   ├── 02_news_cell.html          新闻卡片
│   ├── 03_moment_cell.html        朋友圈式
│   ├── 04_ad_cell.html            复杂装饰背景
│   ├── 05_hero_card.html          弹簧动画
│   ├── 06_comparison.html         写错 vs 写对 速查
│   │
│   ├── 07_skeleton_cell.html      骨架屏
│   ├── 08_swipe_actions.html      左滑菜单
│   ├── 09_expandable_cell.html    展开折叠
│   ├── 10_parallax_header.html    视差头图
│   ├── 11_waterfall_layout.html   瀑布流
│   ├── 12_pull_refresh.html       下拉刷新
│   │
│   ├── 13_tabbar_patterns.html    TabBar — 微信/抖音/小红书
│   ├── 14_ecommerce_feed.html     电商首页 — 淘宝 vs 小红书
│   ├── 15_douyin_feed.html        抖音式短视频流
│   ├── 16_chat_messages.html      聊天列表 — 微信/iMessage/Telegram
│   ├── 17_story_card.html         Story 卡片
│   ├── 18_apple_settings.html     Apple 风格设置页
│   └── 19_design_overview.html    设计总览（强烈建议看）
│
└── assets/                 共享资源
    ├── theme.css           浅色 / 深色双主题色板
    ├── theme.js            主题切换逻辑（左下角圆按钮）
    ├── shared.css          19 个示例页通用样式
    └── category.css        3 个分类页通用样式
```

---

## 三组内容是什么

### 📘 level 01 · basics（基础）

cell 复用、圆角不离屏、阴影怎么画、什么时候才该用光栅化。这些不会，写什么列表都卡。建议从 01 开始按编号顺序看。

### 📗 level 02 · advanced（常用组件）

骨架屏、左滑菜单、展开折叠、视差头图、瀑布流、下拉刷新。日常业务大概率用得上。没有强先后关系，按手头项目挑。如果都用不上，至少看 07 和 12。

### 📙 level 03 · patterns（头部 App 拆解）

微信、抖音、淘宝、小红书、iMessage、Apple 系统设置 — 拆开看它们的 TabBar、聊天列表、Story、信息流。**重点是它们为什么这么做**，不只是怎么写。看完后必看 19 号设计总览，串成体系。

---

## 每个示例里有什么

每个示例页都按相同的结构组织：

| 模块 | 内容 |
|---|---|
| **视觉演示** | 嵌一个 iPhone 框，配色和真机一致。部分还能点（比如 Story 进度条、瀑布流卡片） |
| **完整代码** | 能直接跑的 Objective-C 实现。粘进 Xcode 就能用。关键的几行用 ⭐ 标出，旁边解释为什么 |
| **写错 vs 写对** | 同一个圆角，写错卡到 30fps，写对稳 60fps。两段代码并排 |
| **设计哲学** | 抖音为什么 TabBar 永远是黑色？小红书的「+」为什么是红色？背后的产品逻辑 |
| **量化数据** | FPS / Hitch Time / 内存峰值的具体数字 |
| **面试话术** | 这个被问到怎么答 |

---

## 推荐阅读顺序

```
新手 / 想系统学：
  01 → 02 → 03 → 04 → 05 → 06     (basics 按顺序)
       ↓
  07 → 12                          (advanced 必看两个)
       ↓
  根据业务挑 08~11                  (advanced 选学)
       ↓
  13 → 14 → 15 → 16 → 17 → 18      (patterns 拆 App)
       ↓
  19                               (设计总览 ★ 必看)


有经验 / 查漏补缺：
  06 (写错 vs 写对) → 19 (设计总览) → 按需查阅
```

---

## 主题切换

左下角有个圆形小按钮（月亮 / 太阳图标），点击切换浅色 / 深色模式：

- **首次访问**：跟随系统 `prefers-color-scheme`
- **手动切换后**：localStorage 持久化，刷新后保持
- **切换动画**：用 View Transitions API 做圆形扩散（Chrome 111+ 和 Safari 18+ 原生支持，其它浏览器降级为普通切换）

---

## 设计参考

- **色板**：FreeBSD / Unix 老手册（米白 + 砖红）+ 终端夜间模式（深咖 + 暖橙）
- **字体**：Inter（正文）+ JetBrains Mono（代码、metadata）
- **结构**：单栏 860px、章节式列表（不用卡片网格）
- **细节**：metadata bar、ASCII 目录树、`§` `//` `›` 工程符号、终端式 cta（`$ cd basics/`）、闪烁光标

整体在「现代 SaaS 落地页」和「老式技术文档」之间找一个折中点。

---

## 浏览器兼容

| 浏览器 | 支持情况 |
|---|---|
| Safari 16+ | ✅ 完整 |
| Safari 18+ | ✅ 完整 + View Transitions 动画 |
| Chrome 111+ | ✅ 完整 + View Transitions 动画 |
| Edge 111+ | ✅ 同 Chrome |
| Firefox | ✅ 完整（无 View Transitions 动画，降级为普通切换） |

最佳浏览体验：宽度 ≥ 768px 的桌面。手机上也能看，但 iPhone 真机演示框在小屏上会被压缩。

---

## 给读者的一些话

这不是一份教程文档。更像把项目里写过的、踩过坑的最佳实践挑出来，配上视觉效果和讲解，摆在桌面上。

里面的代码都是 OC，不是因为 OC 比 Swift 好，而是因为大厂的存量代码里 OC 还是主力。Swift 项目大多数能直接抄思路，少数（比如 ExpandableCell 的 Diffable）页面里也给了 Swift 等价写法。

如果发现内容错误或者你有更好的实现方式，直接告诉作者就行。
