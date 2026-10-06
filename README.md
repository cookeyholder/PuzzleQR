# 🧩 PuzzleQR

> **可遊玩、可解謎，且手機 100% 秒掃的迷宮 QR Code 產生器**

[![Pure JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/Canvas-HTML5-e34f26?logo=html5&logoColor=white)](https://developer.mozilla.org/zh-TW/docs/Web/API/Canvas_API)
[![Vector SVG](https://img.shields.io/badge/Vector-SVG-ffb13b?logo=svg&logoColor=black)](https://developer.mozilla.org/zh-TW/docs/Web/SVG)
[![No Build Required](https://img.shields.io/badge/Build-Zero%20Dependencies-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 專案簡介

**PuzzleQR** 是一個創新的網頁端迷宮產生器。它將標準 **QR Code 二值矩陣** 與 **迷宮尋路幾何學** 深度融合：
既是一張充滿挑戰、曲折幽深的真正迷宮，也是一張任何智慧型手機原生相機都能在 **0.1 秒內秒掃識別** 的有效 QR Code！

不論是尋寶遊戲、密室逃脫、展覽互動、婚禮闖關，還是印刷在紙本傳單上的解謎挑戰，PuzzleQR 都能為平凡的二維條碼帶來耳目一新的趣味與驚喜。

---

## ✨ 核心特色

### 1. 🎮 真正好玩的迷宮機制
- **深入內部核心**：透過加權 A* 尋路演算法與邊界懲罰機制，解謎路徑平均長達 60～80 步，深度穿梭於迷宮內部核心迴廊，不再只是沿著最外圈繞路。
- **內部隨機終點**：終點不再固定在死板的邊界，每次重新生成皆隨機降落在迷宮內部不同區域，探索感與尋寶樂趣倍增。
- **流暢拖曳互動**：支援滑鼠指針與行動裝置觸控拖曳，具備走道中心磁吸導引。
- **自動倒退回溯 (Auto-Backtracking)**：遇到死胡同時，只要往回拉動手指即可自動擦除錯誤路徑，操作直覺順暢。
- **無遮擋視覺**：終點標籤會在出現 3 秒後自動平滑淡出，只保留畫布上的專屬地標點，絕不遮蔽關鍵通道視線。
- **微光求助提示**：卡關時隨時點擊「💡 求助提示」，解答路徑以平滑微光浮現 2.8 秒後淡出。

### 2. 📷 手機相機 100% 秒速識別
- **嚴格保護定位圖案**：三方 7×7 尋標圖案 (Finder Patterns)、格式資訊、時序線 (Timing Patterns) 與校正圖案 (Alignment Patterns) 受到不可破壞保護，不容任何幾何形變。
- **ECC Level H 最高安全預算**：採用 QR Code 最高等級錯誤更正標準（Level H，容錯上限約 30%）。實測全路徑打通黑牆僅需 5～12 個模組（變異率 < 1.5%），遠低於容錯極限。
- **多階漸進自適應驗證器**：內建記憶體光學解碼檢驗管線（原尺寸 → 降噪縮放取樣 → 直方圖二值化 → 矩陣保險），杜絕前端誤報。

### 3. 🎨 四大多元風格與外框一體化
- ⚪ **極簡現代 (Modern)**：黑白包浩斯經典圓角膠囊，搭配純白簡潔外框。
- 🪵 **溫潤原木 (Wood)**：仿實木拼圖與胡桃木牆體，搭配溫潤暖木背板外框。
- 🏰 **地牢冒險 (Dungeon)**：仿古羊皮紙走道與石磚深灰城牆，搭配古樸羊皮紙外框。
- 🌿 **皇家樹籬 (Hedge)**：庭園茂密綠灌木與碎石步道，搭配淡雅庭園綠外框。
- **全域色彩聯動**：切換主題時外圍包裝卡片與邊框顏色同步平滑轉場，視覺一體感極佳。

### 4. 🚀 零建置依賴 (Pure Vanilla Stack)
- 純原生 **HTML5 Canvas + SVG + Vanilla JavaScript**。
- 無需 `npm install`、無需 Webpack / Vite / Rollup 打包編譯。
- 任何靜態網頁伺服器（GitHub Pages、Vercel、Netlify 或本機瀏覽器）開箱即用！

### 5. 📥 靈活匯出與列印
- **雙模式下載**：
  - **原始未解版**：乾淨無痕的迷宮底圖，適合列印成紙本謎題或用於海報文宣。
  - **破關紀念版**：完整合成玩家破解時的彩色指針軌跡，適合截圖分享。
- **雙格式支援**：支援高解析度點陣 **PNG (1024×1024)** 與無損向量 **SVG**。

---

## 🏗️ 技術架構

```
PuzzleQR/
├── index.html            # 應用程式單頁入口 (現代淺色 UI、雙層畫布架構)
├── css/
│   └── style.css         # 響應式佈局、動態過渡、徽章浮動動畫
├── js/
│   ├── qrcode-lib.js     # QR Code 生成底層 (Kazuhiko Arase, 支援 UTF-8)
│   ├── jsqr-lib.js       # 純 JavaScript 二維碼記憶體解碼引擎
│   ├── wall-fusion.js    # 長短融合牆體拓撲演算法 (水平/垂直線段與獨立柱)
│   ├── maze-carver.js    # 護城河打通、加權深度 A* 尋路與 ECC 翻轉控制器
│   ├── themes.js         # 四大主題色彩配置與外框外觀管理
│   ├── renderer-canvas.js# 底層迷宮 HTML5 Canvas 高畫質渲染器
│   ├── renderer-svg.js   # 純向量 SVG 產生與 XML 序列化引擎
│   ├── scanner-verify.js # 多階自適應相機相容性驗證器
│   ├── game-engine.js    # 互動指針拖曳、磁吸、自動回溯與求助提示引擎
│   └── app.js            # 主控制器：UI 事件監聽、匯出管線與生命週期整合
└── openspec/             # OpenSpec 規格規劃工件 (繁體中文)
```

---

## 🧠 演算法原理簡介

1. **二值矩陣映射**：將目標內容生成 Level H 的 QR Code 矩陣 ($N \times N$)，外圍加上保護護城河留白區，構成 $G \times G$ 網格。
2. **錨點防護遮罩**：鎖定 3 個 Finder Patterns、格式資訊、Alignment Patterns 及時序線上的黑色模組。
3. **加權 A\* 尋路 (Weighted A\* Search)**：
   - 入口位於左上角尋標圖案右側 ($r=0, c=9+\text{margin}$)。
   - 終點於 QR 內部安全區域隨機選取合法通道格。
   - 封鎖外環 Quiet Zone 高速公路（僅開放垂直引道），並對靠近邊界的格子施加梯度代價懲罰（$(4 - \text{edgeDist}) \times 15$），迫使路線穿梭於縱深核心。
4. **安全黑牆雕刻 (Carving)**：
   - 走過既有白格成本為 1；穿透黑牆成本為 120。
   - 尋路完成後，僅將最佳路徑上極少數必要的黑牆模組翻轉為白路通道（通常僅 5～12 格），變異率 < 1.5%，確保符合 Reed-Solomon 糾錯安全預算。
5. **長短融合牆壁繪製 (Wall Fusion)**：
   - 橫向與縱向相連的黑牆模組被合成為平滑的長條線段（Capsule Lines），獨立模組則以精準圓柱點呈現，賦予迷宮典雅俐落的建築質感。

---

## 🚀 快速開始

### 本地直接執行
由於本專案為純原生前端專案，無需任何建置步驟：

1. 複製本專案：
   ```bash
   git clone https://github.com/cookeyholder/PuzzleQR.git
   cd PuzzleQR
   ```

2. 使用任何靜態網頁伺服器開啟（例如 Python 內建伺服器或 VS Code Live Server）：
   ```bash
   # Python 3
   python3 -m http.server 8000
   ```

3. 開啟瀏覽器訪問 `http://localhost:8000` 即可開始遊玩！

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權開放。歡迎自由使用、修改與二次開發！
