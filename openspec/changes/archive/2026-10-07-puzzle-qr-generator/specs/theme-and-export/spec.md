## Purpose

提供多樣化的迷宮牆體與通道視覺風格主題，並支援自訂檔名的高解析度 PNG 與原生向量 SVG 格式輸出，具備未解與破關雙模式。

## ADDED Requirements

### Requirement: 多樣化視覺主題切換
系統 SHALL 提供至少四款視覺風格主題（Modern 極簡、Wood 原木、Dungeon 地牢、Hedge 樹籬），具備專屬色彩配置與線條外觀，同時確保符合 QR Code 光學辨識對比度標準。

#### Scenario: 切換顯示風格主題
- **WHEN** 使用者自控制列選取特定主題
- **THEN** 畫布即時套用該主題的背景色、牆面材質色與出入口圖標色彩

### Requirement: 未解題版與破關紀念版雙下載模式
系統 SHALL 支援輸出「未解題版（乾淨迷宮，適合列印在紙本上挑戰）」與「破關紀念版（保留玩家繪製之通關軌跡）」兩種模式。

#### Scenario: 匯出空白未解版
- **WHEN** 使用者選取未解題版下載
- **THEN** 產生的檔案僅包含純淨迷宮與出入口標記，不含任何玩家探索軌跡

#### Scenario: 匯出破關紀念版
- **WHEN** 使用者在通關後選取破關紀念版下載
- **THEN** 產生的檔案完整保留玩家繪製之彩色通關軌跡與破關標記

### Requirement: 自訂下載檔名與多格式檔案匯出
系統 SHALL 允許使用者自行輸入自訂檔名，並支援匯出高解析度 PNG 影像與純向量 SVG 格式。

#### Scenario: 下載自訂檔名之 PNG 圖片
- **WHEN** 使用者輸入檔名「event-maze」並點擊下載 PNG
- **THEN** 瀏覽器觸發下載「event-maze.png」，包含清晰的邊界留白與迷宮圖案

#### Scenario: 下載自訂檔名之 SVG 向量圖
- **WHEN** 使用者輸入檔名「event-maze」並點擊下載 SVG
- **THEN** 瀏覽器觸發下載「event-maze.svg」，內部包含乾淨的原生向量 path 元素
