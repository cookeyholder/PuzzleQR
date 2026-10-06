/**
 * js/wall-fusion.js
 * 分析 QR Code 矩陣中的相鄰黑色模組，將其融合成具備長度、端點的水平與垂直連續牆體線段。
 */
(function(global) {
  'use strict';

  /**
   * 提取連續牆體線段與獨立柱點
   * @param {number[][]} matrix - 0/1 二維二值矩陣
   * @returns {Object} 包含水平線段、垂直線段與獨立柱點的資料結構
   */
  function extractWallSegments(matrix) {
    if (!matrix || matrix.length === 0) {
      return { rows: 0, cols: 0, horizontalSegments: [], verticalSegments: [], isolatedDots: [] };
    }

    const rows = matrix.length;
    const cols = matrix[0].length;
    const horizontalSegments = [];
    const verticalSegments = [];
    const isolatedDots = [];

    const inHRun = Array.from({ length: rows }, () => new Uint8Array(cols));
    const inVRun = Array.from({ length: rows }, () => new Uint8Array(cols));

    // 1. 抽取水平長條線段 (長度 >= 2)
    for (let r = 0; r < rows; r++) {
      let start = -1;
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          if (start === -1) start = c;
        } else {
          if (start !== -1) {
            if (c - 1 > start) {
              horizontalSegments.push({ r, c1: start, c2: c - 1, length: c - start });
              for (let k = start; k < c; k++) inHRun[r][k] = 1;
            }
            start = -1;
          }
        }
      }
      if (start !== -1) {
        if (cols - 1 > start) {
          horizontalSegments.push({ r, c1: start, c2: cols - 1, length: cols - start });
          for (let k = start; k < cols; k++) inHRun[r][k] = 1;
        }
      }
    }

    // 2. 抽取垂直長條線段 (長度 >= 2)
    for (let c = 0; c < cols; c++) {
      let start = -1;
      for (let r = 0; r < rows; r++) {
        if (matrix[r][c] === 1) {
          if (start === -1) start = r;
        } else {
          if (start !== -1) {
            if (r - 1 > start) {
              verticalSegments.push({ c, r1: start, r2: r - 1, length: r - start });
              for (let k = start; k < r; k++) inVRun[k][c] = 1;
            }
            start = -1;
          }
        }
      }
      if (start !== -1) {
        if (rows - 1 > start) {
          verticalSegments.push({ c, r1: start, r2: rows - 1, length: rows - start });
          for (let k = start; k < rows; k++) inVRun[k][c] = 1;
        }
      }
    }

    // 3. 獨立模組點 (既無水平相鄰也無垂直相鄰)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1 && !inHRun[r][c] && !inVRun[r][c]) {
          isolatedDots.push({ r, c });
        }
      }
    }

    return {
      rows,
      cols,
      horizontalSegments,
      verticalSegments,
      isolatedDots
    };
  }

  global.WallFusion = {
    extractWallSegments
  };

})(typeof window !== 'undefined' ? window : global);
