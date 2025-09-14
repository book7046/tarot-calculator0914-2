# 使用 `theme.css` 共享桌機/手機色票與玻璃層

## 如何使用
1. 在 HTML 的 `<head>` 內加入：
   ```html
   <link rel="stylesheet" href="theme.css">
   ```
   （本包的 `index_theme.html` 已幫你加好）

2. **之後要改色**：只改 `theme.css` 的 `:root` 變數即可，桌機與手機會一起更新。

## 結構
- `theme.css`：色票（:root 變數）、玻璃層、文字色與行動版一致化修正（iOS/Android）。
- `index_theme.html`：把原先內嵌的主題/行動修正移除，改為引用 `theme.css`。

## 注意
- 若有額外頁面，確保它們也引入 `theme.css`。
- 若你使用 Tailwind/其他框架，`theme.css` 請放在它們**之後**加載，確保覆蓋生效。