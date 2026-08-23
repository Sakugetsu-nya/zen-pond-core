# 一池静水 · Zen Pond

一个以「禅意解压」为核心的沉浸式网页应用。全屏 WebGL 水波纹背景，鼠标划过、点击、声音播放都会在水面泛起轻柔涟漪；内置多种冥想与正念模块，帮助你随时放松、专注、回归当下。

> 设计理念：极简、留白、无打扰。所有界面元素都可以一键隐藏，只留下一片会呼吸的水面。

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 🌊 **水波纹背景** | 全屏 Three.js 水面，四边无吸收遮罩，波纹自然延展到屏幕边缘 |
| 🖱️ **随交互起涟漪** | 鼠标划过、点击水面、抛石都会漾起涟漪，强度轻柔克制 |
| 🔊 **环境音景** | 溪流 / 雨声 / 海浪 / 鸟鸣 / 风声 / 白噪 / 粉噪 / 颂钵 8 种可选，独立开关与音量 |
| 🪨 **抛石问心** | 写下心事抛入水中，文字渐隐、水面持续泛起涟漪 |
| 🧘 **冥想呼吸** | 4-7-8 与盒式呼吸引导，呼吸环随节奏缩放 |
| ⏱️ **专注禅意计时** | 5 / 15 / 25 分钟可选；切到其他模块后计时**继续后台运行**，左上角显示小浮窗 |
| 📜 **禅语轮播** | 正念短句自动轮播 |
| 🪵 **赛博木鱼** | 敲击计数，按天持久化 |
| ⚙️ **个性化设置** | 水面背景切换、连续静心天数、清除数据 |

### 交互亮点
- **隐藏界面**：点击标题栏右上角的眼睛图标，或按 `H` 键，即可隐藏所有 UI，只留水面。同一位置再次点击 / 按 `H` 恢复。
- **专注后台计时**：开始专注后切换到其他功能，计时不会停止，会在左上角以圆环浮窗显示剩余时间；点击浮窗可随时返回专注模块。
- **移动端适配**：弹窗自动避让左侧导航按钮，小屏也能完整显示。

---

## 🚀 部署到 GitHub Pages

本项目使用 Next.js 静态导出（`output: "export"`），已生成好可直接推送的静态文件。

### 方式一：直接推送已构建产物（推荐）
`deploy/` 目录即完整静态站点（含 `index.html`、`_next`、资源与 `.nojekyll`）。

1. 把 `deploy/` 内的**全部文件**（含隐藏文件 `.nojekyll`）复制到你的本地仓库根目录。
2. `git add . && git commit -m "deploy" && git push`
3. 仓库 **Settings → Pages → Source** 选 `Deploy from a branch`，Branch 选推送分支、目录 `/ (root)`，保存。
4. 约 1–2 分钟后访问 `https://<用户名>.github.io/<仓库名>/`。

> ⚠️ **务必保留 `.nojekyll`**：GitHub Pages 默认忽略下划线开头的 `_next` 目录，缺少该文件会导致 JS 加载失败、页面白屏。

### 方式二：从源码构建
仓库名预设为 `zen-pond`。若仓库名不同，需重新构建注入正确的 `BASE_PATH`：

```bash
# 设置仓库名（Windows）
set BASE_PATH=zen-pond
# 或 macOS / Linux
export BASE_PATH=zen-pond

# 安装依赖并构建
npm install
npm run build

# 产物位于 out/，按上面「方式一」推送到仓库即可
```

- 留空 `BASE_PATH` 则按根路径构建（适用于 `<用户名>.github.io` 用户页或自定义域名）。
- 本地预览可运行 `python serve.py 3030`，浏览器打开 `http://localhost:3030/`。

---

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 生产构建（静态导出）
npm run build

# 本地预览已构建的静态站点
python serve.py 3030
```

---

## 📁 项目结构

```
zen-pond-ghpages/
├── app/                  # Next.js App Router 入口
├── components/           # React 组件
│   ├── zen-shell.tsx     # 顶层壳：交互涟漪、专注全局状态、隐藏 UI
│   ├── top-bar.tsx       # 侧边导航 + 标题栏（含隐藏/显示按钮）
│   ├── panel.tsx         # 玻璃态弹窗容器（移动端避让左侧按钮）
│   └── modules/          # 各功能模块（呼吸/声音/抛石/专注/禅语/木鱼/设置）
├── lib/
│   ├── audio.ts          # Web Audio 播放引擎（环境音 / 交互音效）
│   └── store.tsx         # 全局设置与连续打卡状态
├── public/               # 静态资源（音频 / 背景图 / 水波着色器 / PWA 文件）
│   ├── audio/            # 8 种环境音 + 木鱼/水花音效
│   ├── images/           # 水面背景图
│   └── vendor/           # 水波模拟库（liquid1.min.js）
├── deploy/               # 已构建静态站点（直接推送此目录）
├── serve.py              # 本地预览服务器（多线程）
├── next.config.ts        # 静态导出与 basePath 配置
└── DEPLOY-GUIDE.md       # 更详细的部署说明
```

---

## 🎨 自定义

| 想调整什么 | 改哪里 |
|-----------|--------|
| 涟漪触发强度（划过 / 点击 / 随声 / 抛石） | `components/zen-shell.tsx` 中 `dropAtClient` / `addDropToApp` / `dropCenter` 调用的数值 |
| 水面材质（金属度 / 粗糙度 / 位移强度） | `components/ui/zen-liquid.tsx` 的 `applyConfig` |
| 水波边缘吸收 | `public/vendor/liquid1.min.js` 中的 `edge` 变量 |
| 默认音量 / 背景图 / 随声起涟漪开关 | `lib/store.tsx` 的 `DEFAULTS` |
| 环境音列表与音量默认值 | `components/modules/sound.tsx` 的 `DEFAULT_VOLS` |

---

## 🧩 技术栈

- **Next.js 16**（App Router · 静态导出）
- **React 19** + **TypeScript**
- **Three.js** 水波模拟（WebGL）
- **Tailwind CSS v4**
- **Web Audio API** 音频引擎
- **PWA**：manifest + Service Worker 离线缓存

---

## 📝 License

本项目仅供个人学习与非商业用途。背景图、音频等素材请确认其授权后使用。
