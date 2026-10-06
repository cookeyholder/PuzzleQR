/**
 * js/maze-carver.js
 * 整合 QR 矩陣、外緣護城河出入口，並執行加權 A* 尋路與 ECC 預算安全打通。
 */
(function(global) {
  'use strict';

  // 優先級隊列 (MinHeap)
  class MinHeap {
    constructor() { this.data = []; }
    push(item) { this.data.push(item); this._up(this.data.length - 1); }
    pop() {
      if (this.data.length === 0) return null;
      const top = this.data[0];
      const bottom = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = bottom;
        this._down(0);
      }
      return top;
    }
    _up(i) {
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.data[i].priority < this.data[p].priority) {
          [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
          i = p;
        } else break;
      }
    }
    _down(i) {
      const len = this.data.length;
      while ((i << 1) + 1 < len) {
        let left = (i << 1) + 1;
        let right = left + 1;
        let best = left;
        if (right < len && this.data[right].priority < this.data[left].priority) best = right;
        if (this.data[best].priority < this.data[i].priority) {
          [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
          i = best;
        } else break;
      }
    }
    isEmpty() { return this.data.length === 0; }
  }

  /**
   * 生成可解迷宮與完整幾何資料
   * @param {string} text - 輸入目標網址或文字
   * @param {Object} [options]
   * @returns {Object} 迷宮網格、原始 QR 矩陣、出入口座標與解謎路徑
   */
  function generateMaze(text, options = {}) {
    const minVersion = options.minVersion || 4;
    const margin = options.margin !== undefined ? options.margin : 2;

    // 1. 生成最低 Version 4 且 Level H 的 QR Code
    let qr = null;
    let version = minVersion;
    for (let v = minVersion; v <= 40; v++) {
      try {
        qr = global.qrcode(v, 'H');
        qr.addData(text);
        qr.make();
        version = v;
        break;
      } catch (e) {
        // 容量超出，嘗試更高版本
      }
    }

    if (!qr) {
      throw new Error('輸入內容過長，超出 QR Code 容量上限');
    }

    const N = qr.getModuleCount();
    const G = N + margin * 2;

    // 2. 初始化全域迷宮網格 (0 = 白路通道, 1 = 黑牆)
    const grid = Array.from({ length: G }, () => new Uint8Array(G));

    // 填入外圍護城河城牆 (四周邊界皆為牆)
    for (let i = 0; i < G; i++) {
      grid[0][i] = 1;
      grid[G - 1][i] = 1;
      grid[i][0] = 1;
      grid[i][G - 1] = 1;
    }

    // 填入 QR Code 原始二值矩陣
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        grid[r + margin][c + margin] = qr.isDark(r, c) ? 1 : 0;
      }
    }

    // 3. 標記絕對不可破壞之保護區域 (成本設為無限大)
    const immutable = Array.from({ length: G }, () => new Uint8Array(G));

    function markImmutableRect(r1, c1, r2, c2) {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          immutable[r + margin][c + margin] = 1;
        }
      }
    }

    // QR Code 各版本 Alignment Pattern 座標表
    const PATTERN_POSITION_TABLE = [
      [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
      [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
      [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66],
      [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78],
      [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
      [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]
    ];

    // 三個角落的 7x7 尋標圖案與格式資訊邊界
    markImmutableRect(0, 0, 8, 8);
    markImmutableRect(0, N - 9, 8, N - 1);
    markImmutableRect(N - 9, 0, N - 1, 8);

    // 保護 Alignment Patterns (校正圖案 5x5)
    const alignPos = PATTERN_POSITION_TABLE[version - 1] || [];
    for (let i = 0; i < alignPos.length; i++) {
      for (let j = 0; j < alignPos.length; j++) {
        const ar = alignPos[i];
        const ac = alignPos[j];
        if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= N - 9) || (ar >= N - 9 && ac <= 8)) {
          continue;
        }
        markImmutableRect(ar - 2, ac - 2, ar + 2, ac + 2);
      }
    }

    // 時序線不可被破壞 (不可挖掉黑模組；白模組維持原樣允許通行)
    const timingProtect = Array.from({ length: G }, () => new Uint8Array(G));
    for (let c = 8; c <= N - 9; c++) {
      timingProtect[6 + margin][c + margin] = 1;
    }
    for (let r = 8; r <= N - 9; r++) {
      timingProtect[r + margin][6 + margin] = 1;
    }

    // 4. 開啟護城河起點入口與隨機選定內部終點
    // 起點入口：左上方尋標圖案右側 (col = 9 + margin，位於左上保護區外側)
    const start = { r: 0, c: 9 + margin };
    grid[0][start.c] = 0; // 外牆開口
    grid[1][start.c] = 0; // 護城河引道

    // 終點：改在 QR Code 內部，位置隨機
    // 搜尋內部所有合法的候選座標點 (排除尋標圖案、校正圖案與時序線)
    const goalCandidates = [];
    for (let r = margin + 2; r < G - margin - 2; r++) {
      for (let c = margin + 2; c < G - margin - 2; c++) {
        if (immutable[r][c] === 1) continue;
        if (timingProtect[r][c] === 1) continue;
        // 確保終點與起點距離適中 (至少 QR 寬度的 40%)，讓迷宮有充實的解謎路線
        const distFromStart = Math.abs(r - start.r) + Math.abs(c - start.c);
        if (distFromStart >= N * 0.45) {
          goalCandidates.push({ r, c, isWhite: grid[r][c] === 0 });
        }
      }
    }

    // 優先挑選自然為白色通道的格子，若無則從所有候選點中隨機抽樣
    const whiteCandidates = goalCandidates.filter(pt => pt.isWhite);
    const pool = whiteCandidates.length > 0 ? whiteCandidates : goalCandidates;
    const chosenGoal = pool[Math.floor(Math.random() * pool.length)] || {
      r: Math.floor(G / 2),
      c: Math.floor(G / 2)
    };
    const goal = { r: chosenGoal.r, c: chosenGoal.c };
    grid[goal.r][goal.c] = 0; // 確保終點本身可通行

    // 定義迷宮可通行遊玩區域 (僅允許入口引道與 QR Code 內部)
    function isPlayable(r, c) {
      if (r < 0 || r >= G || c < 0 || c >= G) return false;
      // 起點入口垂直引道
      if (c === start.c && r <= margin) return true;
      // QR Code 核心內部區域
      if (r >= margin && r < G - margin && c >= margin && c < G - margin) return true;
      return false;
    }

    // 5. 加權 A* 尋路演算法 (走現有白格 cost=1，挖黑牆 cost=120，邊界施加梯度懲罰引導走內部)
    const openSet = new MinHeap();
    const dist = Array.from({ length: G }, () => new Float64Array(G).fill(Infinity));
    const cameFrom = new Map();

    dist[start.r][start.c] = 0;
    openSet.push({ r: start.r, c: start.c, priority: 0 });

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!openSet.isEmpty()) {
      const cur = openSet.pop();
      if (cur.r === goal.r && cur.c === goal.c) break;

      const curDist = dist[cur.r][cur.c];

      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (!isPlayable(nr, nc)) continue;
        if (immutable[nr][nc] === 1) continue; // 不可進入或不可破壞區
        if (timingProtect[nr][nc] === 1 && grid[nr][nc] === 1) continue; // 時序線黑牆不可挖

        // 深度評估：計算距離 QR 邊界的模組步數
        let edgeDist = 0;
        if (nr >= margin && nr < G - margin && nc >= margin && nc < G - margin) {
          edgeDist = Math.min(
            nr - margin,
            G - 1 - margin - nr,
            nc - margin,
            G - 1 - margin - nc
          );
        }

        // 靠近邊緣時施加代價懲罰 (強制路徑穿梭於內部深層)
        let edgePenalty = 0;
        if (edgeDist <= 3) {
          edgePenalty = (4 - edgeDist) * 15;
        }

        const isWall = grid[nr][nc] === 1;
        const stepCost = isWall ? (120 + edgePenalty) : (1 + edgePenalty);
        const newDist = curDist + stepCost;

        if (newDist < dist[nr][nc]) {
          dist[nr][nc] = newDist;
          cameFrom.set(`${nr},${nc}`, cur);
          const h = Math.abs(nr - goal.r) + Math.abs(nc - goal.c);
          openSet.push({ r: nr, c: nc, priority: newDist + h });
        }
      }
    }

    // 6. 重建最佳通道路徑
    const solutionPath = [];
    let curr = goal;
    while (curr) {
      solutionPath.push(curr);
      curr = cameFrom.get(`${curr.r},${curr.c}`);
    }
    solutionPath.reverse();

    // 7. 安全打通黑牆 (Carving)
    let flips = 0;
    for (const pt of solutionPath) {
      if (grid[pt.r][pt.c] === 1) {
        grid[pt.r][pt.c] = 0;
        if (pt.r >= margin && pt.r < G - margin && pt.c >= margin && pt.c < G - margin) {
          flips++;
        }
      }
    }

    // 提取內部 QR 矩陣供掃描器比對
    const rawMatrix = [];
    for (let r = 0; r < N; r++) {
      const row = [];
      for (let c = 0; c < N; c++) {
        row.push(grid[r + margin][c + margin]);
      }
      rawMatrix.push(row);
    }

    return {
      grid,
      rawMatrix,
      size: G,
      rawSize: N,
      margin,
      start,
      goal,
      solutionPath,
      flips,
      version,
      payload: text,
      isPlayable
    };
  }

  global.MazeCarver = {
    generateMaze
  };

})(typeof window !== 'undefined' ? window : global);
