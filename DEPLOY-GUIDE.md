# 部署到 GitHub Pages — 操作指南

已为你生成两个文件夹（位于 `H:\Documents\workbuddy projects\zen-pond-ghpages\`）：

- **`deploy/`** ← 你要推送的内容就在这里（已构建好的静态站点）。把这个文件夹里的**全部文件**推到 GitHub 仓库即可，无需 Node / 构建。
- **`zen-pond-ghpages/` 根目录**（含 app/components/lib/public + next.config.ts 等）← 源码。只有当你要改仓库名或二次修改时才需要它。

## 最快上线
1. 进入 `deploy/` 文件夹，全选里面的内容（含隐藏文件 `.nojekyll`）复制到你的本地仓库根目录。
2. `git add . && git commit -m "deploy" && git push`
3. 仓库 Settings → Pages → Source 选 **Deploy from a branch**，Branch 选你刚推送的分支、目录 **/ (root)** → Save。
4. 约 1–2 分钟后访问 `https://<用户名>.github.io/<仓库名>/`。

## 重要：仓库名
本包预设仓库名为 `zen-pond`。
- 若你仓库名就是这个 → 直接可用。
- 若不同 → 页面能开，但水波/图标会 404。请按 `deploy/README.md` 的“重新构建”步骤，用正确 `BASE_PATH` 重构建后再推送。

## 为什么有 `.nojekyll`
GitHub Pages 默认会忽略以下划线 `_` 开头的文件/目录（如 `_next`），导致 JS 加载失败。
`.nojekyll` 关闭该行为，**推送时务必保留**。
