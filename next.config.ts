import path from "node:path";
import type { NextConfig } from "next";

// GitHub Pages 项目页网址为 https://<user>.github.io/<repo>/，
// 静态导出需要正确的 basePath / assetPrefix。
// 部署前请设置环境变量 BASE_PATH（例如你的仓库名，不要带首尾斜杠）：
//   set BASE_PATH=zen-pond   (Windows)
//   export BASE_PATH=zen-pond (macOS / Linux)
// 留空则按根路径（用户页 / 自定义域名）构建。
const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH.replace(/^\/|\/$/g, "")}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  // 把 basePath 注入为构建期常量，Turbopack 会将其内联进客户端 bundle，
  // 这是静态导出下让组件拿到 basePath 的最可靠方式。
  env: {
    BASE_PATH: basePath,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
