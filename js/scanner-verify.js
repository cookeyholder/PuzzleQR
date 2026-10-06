/**
 * js/scanner-verify.js
 * 客戶端記憶體即時解碼驗證器，提取畫布像素進行 jsQR 掃描比對，並即時更新 UI 狀態燈。
 */
(function(global) {
  'use strict';

  /**
   * 驗證給定 Canvas 畫布是否能被相機成功解碼
   * @param {HTMLCanvasElement} canvas - 迷宮 QR 畫布
   * @param {string} expectedPayload - 預期目標文字或網址
   * @returns {Object} 包含驗證結果與解碼文字
   */
  function verifyCanvas(canvas, expectedPayload) {
    if (!global.jsQR) {
      console.warn('jsQR 函式庫未載入');
      return { success: false, reason: 'jsQR 未載入' };
    }

    try {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.getImageData(0, 0, width, height);

      // 同時嘗試一般與反相解碼
      const code = global.jsQR(imgData.data, width, height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        const matches = (code.data === expectedPayload);
        return {
          success: matches,
          data: code.data,
          location: code.location
        };
      }

      return {
        success: false,
        reason: '未能成功解碼'
      };
    } catch (err) {
      console.error('解碼驗證發生錯誤:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * 更新介面上的相機相容性狀態燈
   * @param {string} status - 'checking' | 'verified' | 'failed'
   * @param {string} [detail] - 額外顯示文字
   */
  function updateBadge(status, detail) {
    const badge = document.getElementById('decodabilityBadge');
    const textEl = document.getElementById('verifyText');
    if (!badge || !textEl) return;

    badge.classList.remove('status-checking', 'status-verified', 'status-failed');

    if (status === 'idle') {
      textEl.textContent = '等待輸入內容生成迷宮...';
    } else if (status === 'checking') {
      badge.classList.add('status-checking');
      textEl.textContent = '正在驗證相機相容性...';
    } else if (status === 'verified') {
      badge.classList.add('status-verified');
      const preview = detail ? ` (目標：${detail.length > 25 ? detail.substring(0, 22) + '...' : detail})` : '';
      textEl.textContent = `🟢 相機相容性：100% 驗證通過${preview}`;
    } else {
      badge.classList.add('status-failed');
      textEl.textContent = '⚠️ 相機辨識可能受限，請嘗試重新生成或切換主題';
    }
  }

  global.ScannerVerify = {
    verifyCanvas,
    updateBadge
  };

})(typeof window !== 'undefined' ? window : global);
