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
   * 繪製起點與終點地標
   */
  function renderGateMarkers(ctx, mazeData, theme, cellSize) {
    const start = mazeData.start;
    const goal = mazeData.goal;

    // 起點標記 (綠色微光圓環)
    const sx = (start.c + 0.5) * cellSize;
    const sy = (start.r + 0.5) * cellSize;
    ctx.save();
    ctx.fillStyle = theme.startBadge.bg;
    ctx.strokeStyle = theme.startBadge.border;
    ctx.lineWidth = Math.max(2, cellSize * 0.15);
    ctx.beginPath();
    ctx.arc(sx, sy, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 標記小箭頭或符號
    ctx.fillStyle = theme.startBadge.text;
    ctx.font = `bold ${Math.floor(cellSize * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', sx, sy);
    ctx.restore();

    // 終點標記 (紅色/橘色旗幟門)
    const gx = (goal.c + 0.5) * cellSize;
    const gy = (goal.r + 0.5) * cellSize;
    ctx.save();
    ctx.fillStyle = theme.goalBadge.bg;
    ctx.strokeStyle = theme.goalBadge.border;
    ctx.lineWidth = Math.max(2, cellSize * 0.15);
    ctx.beginPath();
    ctx.arc(gx, gy, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme.goalBadge.text;
    ctx.font = `bold ${Math.floor(cellSize * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', gx, gy);
    ctx.restore();
  }

  global.RendererCanvas = {
    renderMaze
  };

})(typeof window !== 'undefined' ? window : global);
