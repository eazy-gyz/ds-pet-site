# DS桌宠 · 官网

一只住在你手机桌面上的小鲸鱼 —— 官网 + 网页试玩。
页面是深色风格，滚动时**渐入渐出**；首屏有一个**真的在跑的试玩区**（拖拽 / 双击 / 会出声）。

---

## 本地预览

```powershell
python -m http.server 8849 --directory D:\AndroidDev\ds-pet-site
```

然后浏览器打开 `http://127.0.0.1:8849/`（手机连同一个 Wi-Fi 也能看：`http://<电脑IP>:8849/`）

---

## 部署到 GitHub Pages

1. 在 GitHub 建一个**空仓库**，名字比如 `ds-pet-site`（不要勾 README）
2. 本地推上去：

```powershell
cd D:\AndroidDev\ds-pet-site
git remote add origin git@github.com:<你的用户名>/ds-pet-site.git
git push -u origin main
```

> ⚠️ 全站约 **22.6 MB**（试玩区只放 24 个动作：24 个 webm + 24 个 mov）。
> 本站要部署到 VibeDrop 免费版，**上限 25 MB**，加东西前先量体积。
> 第一次 push 会比代码仓库慢一些，断了就再 `git push` 一次（会续传）。

3. 仓库 **Settings → Pages** → Source 选 **Deploy from a branch** →
   Branch 选 **main** / 目录选 **/(root)** → Save
4. 等 1 分钟，访问 `https://<你的用户名>.github.io/ds-pet-site/`

---

## 要改哪里

### 下载链接

全部集中在 **`site.js` 最上面**：

```js
var LINKS = {
  android: '',        // ← 填 vivo 应用商店的应用详情页地址
  apk:     '',        // ← 可选：APK 直链
  ios:     'https://github.com/eazy-gyz/dspet-ios/releases/latest',
  web:     'pet/index.html'
};
```

- `android` 留空时，「安卓下载」按钮会变灰并跳到下载区，那里写着「去应用商店搜 DS桌宠」
- 填上之后按钮自动变成可点的外链

### 文案 / 数字

- 动作数 / 碎碎念 / 语音条数等在 `index.html` 里搜 `139` / `207` / `351` 就能找到
- 玩法表格在 `<section id="play">` 里，加一行 `<div class="tr">…</div>` 即可
- 五大功能板块（桌宠设置 / 玩法简介 / 自定义 / 通知气泡 / 一键分享）依次是
  `#setup` `#howto` `#soul` `#notify` `#share`，截图对应 `img/setup.jpg` 等

### 换新截图时

五大功能图现在是**「藤蔓版海报」**：图片自己带页眉（LOGO + DS桌宠）和页脚（功能名 + 一句话简介），
外圈是藤蔓缠绕边框，尺寸统一 **760×1922**（5 张完全一致）。

- 生成脚本：`_图\做海报v3.py`（本地工具，不入库）→ 同时出「长图版 760×1922」和「商店版 1080×1920」
- 网页里用 `.poster` 容器（**不要用 `.phone`**，否则会变成双框）：无需边框，只给圆角 + 投影
- 单张 340~380 KB，5 张合计约 1.8 MB —— 全站接近 VibeDrop 的 25 MB 上限，加东西前先量体积

### ⚠️ 换图后一定要改版本号（踩过的坑）

VibeDrop（Cloudflare）返回的响应头是：

```
index.html : Cache-Control: public, max-age=60
img/*.jpg  : Cache-Control: public, max-age=3600     ← 图片要缓存 1 小时！
```

所以**用同名文件覆盖图片后，用户浏览器里还是旧图**（这次换个图就被这个坑了一次）。
做法：把 `index.html` 里的 `?v=` 参数换一个值（改用当天日期最省事），
图片 / `site.css` / `site.js` 全都要带：

```
src="img/setup.jpg?v=20261005b"   href="site.css?v=20261005b"   src="site.js?v=20261005b"
```

本地工具：`_图\加版本号.py`（把里面的 V 改成新值再跑一次即可）。

---

## 目录结构

```
ds-pet-site/
├── index.html              官网首页
├── site.css                官网样式（含滚动渐入渐出）
├── site.js                 链接配置 + 滚动动画 + 试玩区开关
├── img/                    图标 + 1.3 五大功能截图（setup / howto / soul / notify / share）
└── pet/                    试玩区（iframe 里跑的那一页）
    ├── index.html
    ├── pet.css             = 安卓版 style.css + 试玩区覆盖
    ├── pet.js              = 网页版播放器（多一个 ?scale= 参数）
    └── assets/
        ├── a002..a105.webm  桌面 / 安卓：VP9-alpha，原生透明
        └── a002..a105.mov   iPhone / iPad：HEVC-alpha，原生透明
```

### 为什么两套视频

| 平台 | 透明视频格式 |
|---|---|
| Chrome / Edge / Firefox / 安卓 | **VP9 + alpha**（`.webm`） |
| iPhone / iPad / Safari | **HEVC + alpha**（`.mov`） |

`pet.js` 会自动按平台选：iOS 用 `.mov`，其他一律 `.webm`。
两套都没有的浏览器（很老的 Safari）也不会很难看 —— 页面底色是深色，
视频的黑底会被 CSS `mix-blend-mode: screen` 挖掉，她照样能显示。

---

## 试玩区的两个小心思

- **默认不接管鼠标/手指**：不然滚轮和上下滑动会被 iframe 抢走，页面滚不动。
  点右上角「开始试玩」她才接管交互，再点一下退出。
- **滚出屏幕就把 iframe 隐藏**：浏览器不渲染它，她也就跟着"暂停"，不白烧 CPU。

---

## 素材来源与声明

- 桌宠形象与动画来自开源项目 [dsh-pet](https://github.com/PC2005-cloud/dsh-pet)（作者 PC2005-cloud），
  素材由该项目作者使用 AI 工具生成，依其许可「**允许开源使用、禁止商用**」在本项目中非商业使用。
- 本站与 App **完全免费、无广告、无内购**，不用于任何商业用途。
- 本作品为**非官方同人作品**，与 DeepSeek（深度求索）官方无隶属或背书关系。
