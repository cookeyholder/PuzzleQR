/**
 * js/game-engine.js
 * 頂層互動遊戲引擎：指針拖曳畫線、走道中心磁吸、死巷倒退擦除、求助提示與通關判定。
 */
(function(global) {
  'use strict';

  class GameEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = options;

      this.mazeData = null;
      this.theme = null;
      this.targetSize = 1024;
      this.cellSize = 0;

      this.trail = [];
      this.isDrawing = false;
      this.isCompleted = false;

      // 提示狀態
      this.hintActive = false;
      this.hintOpacity = 0;
      this.hintAnimId = null;

      this.onVictory = options.onVictory || null;

      this.bindEvents();
    }

    init(mazeData, theme, targetSize = 1024) {
      this.mazeData = mazeData;
      this.theme = theme;
      this.targetSize = targetSize;
      this.canvas.width = targetSize;
      this.canvas.height = targetSize;
      this.cellSize = targetSize / mazeData.size;

      this.trail = [];
      this.isDrawing = false;
      this.isCompleted = false;
      this.hintActive = false;
      if (this.hintAnimId) cancelAnimationFrame(this.hintAnimId);

      this.redraw();
    }

    setTheme(theme) {
      this.theme = theme;
      this.redraw();
    }

    clearTrail() {
      this.trail = [];
      this.isDrawing = false;
      this.isCompleted = false;
      this.redraw();
    }

    showHint() {
      if (!this.mazeData) return;
      this.hintActive = true;
      this.hintOpacity = 1.0;

      const startTime = performance.now();
      const duration = 2800; // 顯示約 2.8 秒後平滑淡出

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        if (elapsed < duration * 0.6) {
          this.hintOpacity = 1.0;
        } else if (elapsed < duration) {
          this.hintOpacity = 1.0 - (elapsed - duration * 0.6) / (duration * 0.4);
        } else {
          this.hintActive = false;
          this.hintOpacity = 0;
          this.redraw();
          return;
        }
        this.redraw();
        this.hintAnimId = requestAnimationFrame(animate);
      };

      if (this.hintAnimId) cancelAnimationFrame(this.hintAnimId);
      this.hintAnimId = requestAnimationFrame(animate);
    }

    bindEvents() {
      const el = this.canvas;

      el.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
      el.addEventListener('pointermove', (e) => this.handlePointerMove(e));
      window.addEventListener('pointerup', () => this.handlePointerUp());
      window.addEventListener('pointercancel', () => this.handlePointerUp());
    }

    getPointerCell(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const c = Math.floor(cx / this.cellSize);
      const r = Math.floor(cy / this.cellSize);

      return { r, c, cx, cy };
    }

    handlePointerDown(e) {
      if (!this.mazeData || this.isCompleted) return;
      this.canvas.setPointerCapture(e.pointerId);

      const pos = this.getPointerCell(e);
      const start = this.mazeData.start;

      if (this.trail.length === 0) {
        // 若在起點周邊 2 格內按住，自起點開始
        const distToStart = Math.hypot(pos.r - start.r, pos.c - start.c);
        if (distToStart <= 2.2) {
          this.trail = [{ r: start.r, c: start.c }];
          this.isDrawing = true;
        }
      } else {
        // 若已有軌跡，檢查是否在軌跡尾端附近，是則繼續繪製
        const tail = this.trail[this.trail.length - 1];
        const distToTail = Math.hypot(pos.r - tail.r, pos.c - tail.c);
        if (distToTail <= 2.0) {
          this.isDrawing = true;
        } else {
          // 若在起點附近重啟
          const distToStart = Math.hypot(pos.r - start.r, pos.c - start.c);
          if (distToStart <= 1.5) {
            this.trail = [{ r: start.r, c: start.c }];
            this.isDrawing = true;
          }
        }
      }

      this.redraw();
    }

    handlePointerMove(e) {
      if (!this.isDrawing || !this.mazeData || this.isCompleted) return;

      const pos = this.getPointerCell(e);
      const G = this.mazeData.size;

      if (pos.r < 0 || pos.r >= G || pos.c < 0 || pos.c >= G) return;

      const tail = this.trail[this.trail.length - 1];
      if (pos.r === tail.r && pos.c === tail.c) return;

      // 1. 倒退擦除檢查 (Auto-Backtracking)
      // 若玩家指針移回倒數第二個節點，自動彈出尾端
      if (this.trail.length >= 2) {
        const prev = this.trail[this.trail.length - 2];
        if (pos.r === prev.r && pos.c === prev.c) {
          this.trail.pop();
          this.redraw();
          return;
        }
      }

      // 2. 前進步進檢查 (只允許四向相鄰移動)
      const dr = pos.r - tail.r;
      const dc = pos.c - tail.c;
      const dist = Math.abs(dr) + Math.abs(dc);

      if (dist === 1) {
        // 檢查目標格是否為可通行通道 (0 = 白路通道 且 在遊玩區域內)
        const canWalk = this.mazeData.grid[pos.r][pos.c] === 0 &&
          (!this.mazeData.isPlayable || this.mazeData.isPlayable(pos.r, pos.c));

        if (canWalk) {
          this.trail.push({ r: pos.r, c: pos.c });

          // 終點達成判定
          if (pos.r === this.mazeData.goal.r && pos.c === this.mazeData.goal.c) {
            this.isCompleted = true;
            this.isDrawing = false;
            this.redraw();
            if (typeof this.onVictory === 'function') {
              this.onVictory(this.mazeData.payload);
            }
            return;
          }

          this.redraw();
        }
      } else if (dist === 2 && Math.abs(dr) === 1 && Math.abs(dc) === 1) {
        // 若快速斜向滑動，嘗試內插相鄰的一步
        const step1 = { r: tail.r + dr, c: tail.c };
        const step2 = { r: tail.r, c: tail.c + dc };

        const canStep1 = this.mazeData.grid[step1.r][step1.c] === 0 &&
          (!this.mazeData.isPlayable || this.mazeData.isPlayable(step1.r, step1.c));
        const canTarget = this.mazeData.grid[pos.r][pos.c] === 0 &&
          (!this.mazeData.isPlayable || this.mazeData.isPlayable(pos.r, pos.c));

        if (canStep1) {
          this.trail.push(step1);
          if (canTarget) {
            this.trail.push({ r: pos.r, c: pos.c });
          }
          this.redraw();
        } else {
          const canStep2 = this.mazeData.grid[step2.r][step2.c] === 0 &&
            (!this.mazeData.isPlayable || this.mazeData.isPlayable(step2.r, step2.c));
          if (canStep2) {
            this.trail.push(step2);
            if (canTarget) {
              this.trail.push({ r: pos.r, c: pos.c });
            }
            this.redraw();
          }
        }
      }
    }

    handlePointerUp() {
      this.isDrawing = false;
    }

    redraw() {
      const ctx = this.ctx;
      const targetSize = this.targetSize;
      const cellSize = this.cellSize;

      ctx.clearRect(0, 0, targetSize, targetSize);

      // 1. 繪製求助提示路線 (微光浮現)
      if (this.hintActive && this.mazeData && this.mazeData.solutionPath && this.hintOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = this.hintOpacity * 0.85;
        ctx.strokeStyle = this.theme.hintColor;
        ctx.lineWidth = cellSize * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = this.theme.hintColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        for (let i = 0; i < this.mazeData.solutionPath.length; i++) {
          const pt = this.mazeData.solutionPath[i];
          const x = (pt.c + 0.5) * cellSize;
          const y = (pt.r + 0.5) * cellSize;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 2. 繪製玩家探索軌跡
      if (this.trail.length > 0) {
        ctx.save();
        ctx.strokeStyle = this.theme.playerTrailColor;
        ctx.lineWidth = cellSize * 0.38;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.theme.playerTrailGlow) {
          ctx.shadowColor = this.theme.playerTrailGlow;
          ctx.shadowBlur = 8;
        }

        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const x = (pt.c + 0.5) * cellSize;
          const y = (pt.r + 0.5) * cellSize;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 在軌跡頂端繪製活動光點 (Explorer Puck)
        const tail = this.trail[this.trail.length - 1];
        const tx = (tail.c + 0.5) * cellSize;
        const ty = (tail.r + 0.5) * cellSize;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tx, ty, cellSize * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  global.GameEngine = GameEngine;

})(typeof window !== 'undefined' ? window : global);
