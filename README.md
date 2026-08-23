# 一池静水 · Zen Pond

Vibe coding产物，一个以「禅意解压」为核心的沉浸式网页应用。全屏 WebGL 水波纹背景，鼠标划过、点击、声音播放都会在水面泛起轻柔涟漪；内置多种冥想与正念模块，帮助你随时放松、专注、回归当下。<br>
✨[部署仓库](https://github.com/Sakugetsu-nya/zen-pond)<br> 
🌊[点击使用](https://sakugetsu-nya.github.io/zen-pond/)
> 设计理念：极简、留白、无打扰。所有界面元素都可以一键隐藏，只留下一片会呼吸的水面。

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 🌊 **水波纹背景** | 全屏水面，波纹自然延展到屏幕边缘 |
| 🖱️ **随交互起涟漪** | 鼠标划过、点击水面、抛石都会漾起涟漪 |
| 🔊 **环境音景** | 溪流 / 雨声 / 海浪 / 鸟鸣 / 风声 / 白噪 / 粉噪 / 颂钵 8 种可选，独立开关与音量 |
| 🪨 **抛石问心** | 写下心事抛入水中，文字渐隐、水面持续泛起涟漪 |
| 🧘 **冥想呼吸** | 4-7-8 与盒式呼吸引导，呼吸环随节奏缩放 |
| ⏱️ **专注禅意计时** | 5 / 15 / 25 分钟可选；切到其他模块后计时**继续后台运行**，左上角显示小浮窗 |
| 📜 **禅语轮播** | 禅意短句自动轮播 |
| 🪵 **赛博木鱼** | 敲击计数，敲敲赛博木鱼吧 |
| ⚙️ **个性化设置** | 水面背景切换、连续静心天数、清除数据 |

### 交互亮点
- **隐藏界面**：点击标题栏右上角的眼睛图标，或按 `H` 键，即可隐藏所有 UI，只留水面。同一位置再次点击 / 按 `H` 恢复。
- **专注后台计时**：开始专注后切换到其他功能，计时不会停止，会在左上角以圆环浮窗显示剩余时间；点击浮窗可随时返回专注模块。
- **移动端适配**：弹窗自动避让左侧导航按钮，小屏也能完整显示。

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
本项目仅供个人学习与非商业用途。背景图、音频均来自互联网公版素材。<br>
水波纹实现参考[feitangyuan/liquid-refraction-lab](https://github.com/feitangyuan/liquid-refraction-lab)
