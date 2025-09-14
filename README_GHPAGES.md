# 部署到 GitHub Pages（快速上手）

## 1) 建立 Repo 並啟用 Pages
- 到 GitHub 新增一個公開或私有（需付費方案）倉庫，例如 `tarot-pages`
- 進入 **Settings → Pages**
- 在 **Build and deployment** 區塊，選擇：
  - **Source**: `Deploy from a branch`
  - **Branch**: `main`，資料夾 `/(root)`
- 儲存。

## 2) 上傳檔案
把這個 zip 解壓後的內容（`index.html`, `.nojekyll`, 可選的 `CNAME`）全部放在 repo 的根目錄。
- 你可以用 GitHub 網站的「Upload files」，或用 Git 指令（見下方）。

## 3) 等待發佈
第一次通常需要 1~2 分鐘。完成後網址會是：
`https://<你的 GitHub 使用者名稱>.github.io/<repo 名稱>/`

> 如果你把這個 repo 命名為 `<你的 GitHub 使用者名稱>.github.io`（user/organization site），網址就會是根網域：
> `https://<你的 GitHub 使用者名稱>.github.io/`

---

## （可選）自訂網域
1. 到你的 DNS 提供商新增記錄：
   - 若要子網域（例：`tarot.example.com`）→ 新增 `CNAME` 指向 `<你的使用者名>.github.io.`
   - 若要 apex 網域（`example.com`）→ 新增 A/AAAA 記錄到 GitHub Pages 指定 IP（可查官方文件）
2. 在 repo 根目錄新增 `CNAME` 檔案，檔案內容只有你的網域，例如：
```
tarot.example.com
```
3. 回到 **Settings → Pages** 連結自訂網域（GitHub 可幫你檢查 DNS）。

---

## Git 指令（選擇性）
```bash
# 初始化並推上 GitHub
git init
git add .
git commit -m "Initial commit for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<你的使用者名>/<repo 名稱>.git
git push -u origin main
```

## 小提醒
- 首頁檔名建議用 `index.html`（已幫你處理）。
- 如果之後有 CSS/JS/圖片檔，路徑請使用相對路徑（例如 `./assets/...`）。
- `.nojekyll` 可以避免資料夾名稱以底線開頭時被 Jekyll 忽略。
- 之後更新只要再 push 新版檔案即可。