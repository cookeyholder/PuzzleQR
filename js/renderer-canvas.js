/**
 * js/renderer-canvas.js
 * 底層 Canvas 繪製引擎：將迷宮網格、長短融合牆壁與出入口標記渲染至 HTML5 Canvas。
 */
(function(global) {
  'use strict';

  /**
   * 繪製迷宮底層至指定 Canvas
   * @param {HTMLCanvasElement} canvas
   * @param {Object} mazeData - 由 MazeCarver.generateMaze 產生的資料
   * @param {Object} theme - 主題配置物件
   * @param {number} [targetSize=1024] - 畫布物理解析度大小
   * @returns {Object} 繪圖幾何指標 (cellSize, offset 等)
   */
  function renderMaze(canvas, mazeData, theme, targetSize = 1024) {
    if (!canvas || !mazeData) return null;

    const ctx = canvas.getContext('2d');
    const size = mazeData.size;

    // 設定畫布解析度 (以 targetSize 為基準)
    canvas.width = targetSize;
    canvas.height = targetSize;

    const cellSize = targetSize / size;
    const strokeWidth = cellSize * theme.strokeRatio;

    // 1. 填滿通道背景色
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, targetSize, targetSize);

    // 2. 抽取長短牆體線段
    const wallData = global.WallFusion.extractWallSegments(mazeData.grid);

    ctx.save();
    ctx.strokeStyle = theme.wallColor;
    ctx.fillStyle = theme.wallColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = theme.lineCap || 'round';
    ctx.lineJoin = 'round';

    if (theme.wallGlow && theme.glowBlur > 0) {
      ctx.shadowColor = theme.wallGlow;
      ctx.shadowBlur = theme.glowBlur * (targetSize / 600);
    }

    // 繪製水平長條牆體
    for (const seg of wallData.horizontalSegments) {
      const y = (seg.r + 0.5) * cellSize;
      const x1 = (seg.c1 + 0.5) * cellSize;
      const x2 = (seg.c2 + 0.5) * cellSize;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    // 繪製垂直長條牆體
    for (const seg of wallData.verticalSegments) {
      const x = (seg.c + 0.5) * cellSize;
      const y1 = (seg.r1 + 0.5) * cellSize;
      const y2 = (seg.r2 + 0.5) * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
    }

    // 繪製獨立圓柱點
    for (const dot of wallData.isolatedDots) {
      const x = (dot.c + 0.5) * cellSize;
      const y = (dot.r + 0.5) * cellSize;
      ctx.beginPath();
      ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 3. 繪製起點與終點出入口標記 (圓環地標)
    renderGateMarkers(ctx, mazeData, theme, cellSize);

    return {
      width: targetSize,
      height: targetSize,
      cellSize,
      strokeWidth,
      wallData
    };
  }

  /**
   * 繪製起點與終點地標 (高辨識度醒目視覺)
   */
  function renderGateMarkers(ctx, mazeData, theme, cellSize) {
    const start = mazeData.start;
    const goal = mazeData.goal;
    const r = cellSize * 0.44;
    const strokeW = Math.max(2.5, cellSize * 0.12);

    // ================= 起點標記 (START) =================
    const sx = (start.c + 0.5) * cellSize;
    const sy = (start.r + 0.5) * cellSize;

    ctx.save();
    // 1. 底層光暈與抗干擾白圈
    ctx.shadowColor = theme.startBadge.glow || 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, r + 2, 0, Math.PI * 2);
    ctx.fill();

    // 2. 主體鮮綠圓形
    ctx.fillStyle = theme.startBadge.bg;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = strokeW;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. 內嵌標籤文字「S」
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.floor(cellSize * 0.52)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', sx, sy);
    ctx.restore();

    // ================= 終點標記 (GOAL) =================
    const gx = (goal.c + 0.5) * cellSize;
    const gy = (goal.r + 0.5) * cellSize;

    ctx.save();
    // 1. 底層光暈與抗干擾白圈
    ctx.shadowColor = theme.goalBadge.glow || 'rgba(239, 68, 68, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(gx, gy, r + 2, 0, Math.PI * 2);
    ctx.fill();

    // 2. 主體烈焰紅圓形
    ctx.fillStyle = theme.goalBadge.bg;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = strokeW;
    ctx.beginPath();
    ctx.arc(gx, gy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. 內嵌標籤文字「G」
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.floor(cellSize * 0.52)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', gx, gy);
    ctx.restore();
  }

  global.RendererCanvas = {
    renderMaze
  };

})(typeof window !== 'undefined' ? window : global);
