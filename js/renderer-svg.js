/**
 * js/renderer-svg.js
 * 純向量 SVG 產生器：將迷宮網格、長短融合牆體、出入口與行走軌跡轉換為標準 XML 格式的 SVG 字串。
 */
(function(global) {
  'use strict';

  /**
   * 產生迷宮向量 SVG 字串
   * @param {Object} mazeData - 由 MazeCarver 產生的迷宮資料
   * @param {Object} theme - 主題配置物件
   * @param {Array} [playerTrail=null] - 玩家行走座標陣列 [{r, c}, ...]
   * @param {number} [targetSize=1024] - 畫布視口尺寸
   * @returns {string} XML SVG 字串
   */
  function generateSVG(mazeData, theme, playerTrail = null, targetSize = 1024) {
    if (!mazeData) return '';

    const size = mazeData.size;
    const cellSize = targetSize / size;
    const strokeWidth = (cellSize * theme.strokeRatio).toFixed(2);
    const wallData = global.WallFusion.extractWallSegments(mazeData.grid);

    const parts = [];

    // SVG 根節點
    parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetSize} ${targetSize}" width="${targetSize}" height="${targetSize}">`);

    // 背景矩形
    parts.push(`  <rect width="${targetSize}" height="${targetSize}" fill="${theme.bgColor}" />`);

    // 牆體群組
    parts.push(`  <g id="maze-walls" stroke="${theme.wallColor}" fill="${theme.wallColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`);

    // 水平線段
    for (const seg of wallData.horizontalSegments) {
      const y = ((seg.r + 0.5) * cellSize).toFixed(2);
      const x1 = ((seg.c1 + 0.5) * cellSize).toFixed(2);
      const x2 = ((seg.c2 + 0.5) * cellSize).toFixed(2);
      parts.push(`    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" />`);
    }

    // 垂直線段
    for (const seg of wallData.verticalSegments) {
      const x = ((seg.c + 0.5) * cellSize).toFixed(2);
      const y1 = ((seg.r1 + 0.5) * cellSize).toFixed(2);
      const y2 = ((seg.r2 + 0.5) * cellSize).toFixed(2);
      parts.push(`    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" />`);
    }

    // 獨立圓點
    const dotRadius = (strokeWidth / 2).toFixed(2);
    for (const dot of wallData.isolatedDots) {
      const x = ((dot.c + 0.5) * cellSize).toFixed(2);
      const y = ((dot.r + 0.5) * cellSize).toFixed(2);
      parts.push(`    <circle cx="${x}" cy="${y}" r="${dotRadius}" />`);
    }

    parts.push(`  </g>`);

    // 起點與終點標記
    const start = mazeData.start;
    const goal = mazeData.goal;
    const sx = ((start.c + 0.5) * cellSize).toFixed(2);
    const sy = ((start.r + 0.5) * cellSize).toFixed(2);
    const gx = ((goal.c + 0.5) * cellSize).toFixed(2);
    const gy = ((goal.r + 0.5) * cellSize).toFixed(2);
    const markerRadius = (cellSize * 0.4).toFixed(2);
    const markerBorderWidth = Math.max(2, cellSize * 0.15).toFixed(2);
    const fontSize = Math.floor(cellSize * 0.5);

    parts.push(`  <g id="maze-markers">`);
    // 起點 S
    parts.push(`    <circle cx="${sx}" cy="${sy}" r="${markerRadius}" fill="${theme.startBadge.bg}" stroke="${theme.startBadge.border}" stroke-width="${markerBorderWidth}" />`);
    parts.push(`    <text x="${sx}" y="${sy}" fill="${theme.startBadge.text}" font-size="${fontSize}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">S</text>`);
    // 終點 G
    parts.push(`    <circle cx="${gx}" cy="${gy}" r="${markerRadius}" fill="${theme.goalBadge.bg}" stroke="${theme.goalBadge.border}" stroke-width="${markerBorderWidth}" />`);
    parts.push(`    <text x="${gx}" y="${gy}" fill="${theme.goalBadge.text}" font-size="${fontSize}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">G</text>`);
    parts.push(`  </g>`);

    // 若有玩家通關軌跡 (破關紀念版)
    if (playerTrail && playerTrail.length >= 2) {
      const trailWidth = (cellSize * 0.35).toFixed(2);
      let d = '';
      for (let i = 0; i < playerTrail.length; i++) {
        const pt = playerTrail[i];
        const px = ((pt.c + 0.5) * cellSize).toFixed(2);
        const py = ((pt.r + 0.5) * cellSize).toFixed(2);
        d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
      }
      parts.push(`  <g id="player-trail">`);
      parts.push(`    <path d="${d}" fill="none" stroke="${theme.playerTrailColor}" stroke-width="${trailWidth}" stroke-linecap="round" stroke-linejoin="round" />`);
      parts.push(`  </g>`);
    }

    parts.push(`</svg>`);

    return parts.join('\n');
  }

  global.RendererSVG = {
    generateSVG
  };

})(typeof window !== 'undefined' ? window : global);
