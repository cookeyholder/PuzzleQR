/**
 * js/app.js
 * 應用程式主控制器：整合 UI 事件、迷宮生成、即時驗證、遊戲流程與檔案匯出管線。
 */
(function() {
  'use strict';

  // DOM 元件
  const payloadInput = document.getElementById('payloadInput');
  const btnGenerate = document.getElementById('btnGenerate');
  const btnHint = document.getElementById('btnHint');
  const btnClearTrail = document.getElementById('btnClearTrail');
  const exportFilenameInput = document.getElementById('exportFilename');
  const btnDownloadPNG = document.getElementById('btnDownloadPNG');
  const btnDownloadSVG = document.getElementById('btnDownloadSVG');

  const mazeCanvas = document.getElementById('mazeCanvas');
  const gameCanvas = document.getElementById('gameCanvas');
  const startBadge = document.getElementById('startBadge');
  const goalBadge = document.getElementById('goalBadge');

  const victoryModal = document.getElementById('victoryModal');
  const payloadTypeLabel = document.getElementById('payloadTypeLabel');
  const payloadDisplay = document.getElementById('payloadDisplay');
  const btnVisitUrl = document.getElementById('btnVisitUrl');
  const btnCopyPayload = document.getElementById('btnCopyPayload');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // 全域狀態
  let currentMaze = null;
  let currentThemeId = 'cyber';
  let gameEngine = null;

  /**
   * 初始化應用程式
   */
  function initApp() {
    // 建立遊戲引擎實例
    gameEngine = new window.GameEngine(gameCanvas, {
      onVictory: handleVictory
    });

    // 綁定 UI 事件
    btnGenerate.addEventListener('click', generateNewMaze);
    btnHint.addEventListener('click', () => gameEngine.showHint());
    btnClearTrail.addEventListener('click', () => gameEngine.clearTrail());

    // 主題單選切換事件
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentThemeId = e.target.value;
        if (currentMaze) {
          const theme = window.ThemeEngine.getTheme(currentThemeId);
          window.RendererCanvas.renderMaze(mazeCanvas, currentMaze, theme);
          gameEngine.setTheme(theme);
          updateGateBadges(currentMaze, theme);
          verifyScanCompatibility(currentMaze.payload);
        }
      });
    });

    // 下載事件
    btnDownloadPNG.addEventListener('click', handleDownloadPNG);
    btnDownloadSVG.addEventListener('click', handleDownloadSVG);

    // Modal 彈窗按鈕
    btnCloseModal.addEventListener('click', () => {
      victoryModal.classList.add('hidden');
    });

    btnCopyPayload.addEventListener('click', () => {
      if (currentMaze && currentMaze.payload) {
        navigator.clipboard.writeText(currentMaze.payload).then(() => {
          const originalText = btnCopyPayload.textContent;
          btnCopyPayload.textContent = '✅ 已複製！';
          setTimeout(() => { btnCopyPayload.textContent = originalText; }, 2000);
        }).catch(err => {
          console.error('複製失敗:', err);
        });
      }
    });

    // 初始生成迷宮
    generateNewMaze();
  }

  /**
   * 根據使用者輸入產生新迷宮
   */
  function generateNewMaze() {
    const rawText = payloadInput.value.trim();
    if (!rawText) {
      alert('請先輸入網址或純文字內容！');
      return;
    }

    window.ScannerVerify.updateBadge('checking');

    try {
      currentMaze = window.MazeCarver.generateMaze(rawText, { minVersion: 4 });
      const theme = window.ThemeEngine.getTheme(currentThemeId);

      // 1. 繪製底層迷宮 QR Code
      window.RendererCanvas.renderMaze(mazeCanvas, currentMaze, theme);

      // 2. 初始化頂層互動遊戲畫布
      gameEngine.init(currentMaze, theme);

      // 3. 更新出入口浮動標籤位置
      updateGateBadges(currentMaze, theme);

      // 4. 執行記憶體解碼檢驗 (異步以確保畫布完成繪製)
      setTimeout(() => {
        verifyScanCompatibility(rawText);
      }, 50);

    } catch (err) {
      console.error('迷宮生成錯誤:', err);
      alert('迷宮生成失敗：' + err.message);
    }
  }

  /**
   * 驗證當前畫布解碼狀態並更新狀態指示儀
   */
  function verifyScanCompatibility(expectedPayload) {
    const res = window.ScannerVerify.verifyCanvas(mazeCanvas, expectedPayload);
    if (res.success) {
      window.ScannerVerify.updateBadge('verified', expectedPayload);
    } else {
      window.ScannerVerify.updateBadge('failed');
    }
  }

  /**
   * 更新起終點徽章位置
   */
  function updateGateBadges(maze, theme) {
    if (!startBadge || !goalBadge || !maze) return;

    const size = maze.size;
    const startPercentX = ((maze.start.c + 0.5) / size) * 100;
    const startPercentY = ((maze.start.r + 0.5) / size) * 100;

    const goalPercentX = ((maze.goal.c + 0.5) / size) * 100;
    const goalPercentY = ((maze.goal.r + 0.5) / size) * 100;

    startBadge.style.left = `${startPercentX}%`;
    startBadge.style.top = `${startPercentY}%`;
    startBadge.style.transform = 'translate(-50%, -130%)';

    goalBadge.style.left = `${goalPercentX}%`;
    goalBadge.style.top = `${goalPercentY}%`;
    goalBadge.style.transform = 'translate(-50%, 40%)';
  }

  /**
   * 通關勝利處理
   */
  function handleVictory(payload) {
    const isUrl = /^https?:\/\//i.test(payload);

    if (isUrl) {
      payloadTypeLabel.textContent = '目標網址';
      btnVisitUrl.style.display = 'inline-flex';
      btnVisitUrl.href = payload;
    } else {
      payloadTypeLabel.textContent = '秘密訊息';
      btnVisitUrl.style.display = 'none';
    }

    payloadDisplay.textContent = payload;
    victoryModal.classList.remove('hidden');
  }

  /**
   * 獲取並過濾使用者自訂檔名
   */
  function getSanitizedFilename() {
    let name = exportFilenameInput.value.trim();
    if (!name) name = 'puzzle-qr-maze';
    // 移除非法檔名字元
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-');
  }

  /**
   * 取得當前選取的下載模式 (unsolved | solved)
   */
  function getExportMode() {
    const checked = document.querySelector('input[name="exportMode"]:checked');
    return checked ? checked.value : 'unsolved';
  }

  /**
   * 下載檔案觸發器
   */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * 處理 PNG 匯出
   */
  function handleDownloadPNG() {
    if (!currentMaze) return;

    const baseName = getSanitizedFilename();
    const mode = getExportMode();
    const finalName = (mode === 'solved') ? `${baseName}-solved.png` : `${baseName}.png`;

    if (mode === 'unsolved') {
      mazeCanvas.toBlob((blob) => {
        if (blob) triggerDownload(blob, finalName);
      }, 'image/png');
    } else {
      // 破關紀念版：合併底層迷宮與玩家探索軌跡
      const offscreen = document.createElement('canvas');
      offscreen.width = mazeCanvas.width;
      offscreen.height = mazeCanvas.height;
      const ctx = offscreen.getContext('2d');

      ctx.drawImage(mazeCanvas, 0, 0);
      ctx.drawImage(gameCanvas, 0, 0);

      offscreen.toBlob((blob) => {
        if (blob) triggerDownload(blob, finalName);
      }, 'image/png');
    }
  }

  /**
   * 處理 SVG 匯出
   */
  function handleDownloadSVG() {
    if (!currentMaze) return;

    const baseName = getSanitizedFilename();
    const mode = getExportMode();
    const theme = window.ThemeEngine.getTheme(currentThemeId);
    const finalName = (mode === 'solved') ? `${baseName}-solved.svg` : `${baseName}.svg`;

    const trail = (mode === 'solved') ? gameEngine.trail : null;
    const svgStr = window.RendererSVG.generateSVG(currentMaze, theme, trail);

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, finalName);
  }

  // 啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
