# 本地測試與離線檢查

## 一鍵啟動（建議）
- macOS / Linux：`./serve_local.sh`
- Windows：雙擊 `serve_local.cmd` 或在終端執行：`serve_local.cmd`

以上腳本會呼叫 Python 內建的簡易伺服器（port 預設 8080），並自動打開瀏覽器。

## 直接用 Python
```bash
python3 serve_local.py
```

## 進入網站
瀏覽器開啟 `http://localhost:8080/`。

## 離線測試步驟
1. 連上站台後，稍等 1～2 秒，讓 Service Worker 完成安裝與快取。
2. 重新整理一次頁面，確保離線資源已被寫入快取。
3. 關閉電腦的網路（或使用 DevTools -> Network -> Offline）。
4. 直接重新載入頁面或造訪 `offline.html`，應可看到離線版頁面。