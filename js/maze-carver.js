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

    // 三個角落的 7x7 尋標圖案與格式資訊邊界
    markImmutableRect(0, 0, 8, 8);
    markImmutableRect(0, N - 9, 8, N - 1);
    markImmutableRect(N - 9, 0, N - 1, 8);

    // 時序線 (Timing Patterns: 第 6 行與第 6 列)
    for (let i = 0; i < N; i++) {
      immutable[6 + margin][i + margin] = 1;
      immutable[i + margin][6 + margin] = 1;
    }

    // 4. 開啟護城河出入口
    // 起點入口：左上方尋標圖案右側的自然留白通道上方 (col = 7 + margin)
    const start = { r: 0, c: 7 + margin };
    grid[0][start.c] = 0; // 外牆開口
    grid[1][start.c] = 0; // 護城河引道

    // 終點出口：右下方邊緣出口
    const goalCol = (N % 2 === 1) ? (N - 2 + margin) : (N - 3 + margin);
    const goal = { r: G - 1, c: goalCol };
    grid[goal.r][goal.c] = 0; // 外牆開口
    grid[goal.r - 1][goal.c] = 0; // 護城河引道

    // 5. 加權 A* 尋路演算法 (走現有白格 cost=1，挖黑牆 cost=100)
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
      const hDist = Math.abs(cur.r - goal.r) + Math.abs(cur.c - goal.c);
      if (cur.priority > curDist + hDist) continue;

      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr < 0 || nr >= G || nc < 0 || nc >= G) continue;
        if (immutable[nr][nc] === 1) continue; // 不可破壞區

        const stepCost = grid[nr][nc] === 0 ? 1 : 100;
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
      payload: text
    };
  }

  global.MazeCarver = {
    generateMaze
  };

})(typeof window !== 'undefined' ? window : global);
