/**
 * js/themes.js
 * 定義四大視覺主題的色彩代碼、線條粗細比例、發光特效與玩家軌跡參數。
 */
(function(global) {
  'use strict';

  const THEMES = {
    wood: {
      id: 'wood',
      name: '🪵 溫潤原木 (Wood)',
      bgColor: '#faf3e0',
      wallColor: '#4a2810',
      wallGlow: null,
      glowBlur: 0,
      strokeRatio: 0.84,
      lineCap: 'round',
      playerTrailColor: '#d97706',
      playerTrailGlow: 'rgba(217, 119, 6, 0.4)',
      hintColor: '#b45309',
      startBadge: { bg: '#e8dcbe', border: '#78350f', text: '#451a03' },
      goalBadge: { bg: '#fed7aa', border: '#c2410c', text: '#9a3412' }
    },

    dungeon: {
      id: 'dungeon',
      name: '🏰 地牢冒險 (Dungeon)',
      bgColor: '#f4ecd8',
      wallColor: '#2b2621',
      wallGlow: null,
      glowBlur: 0,
      strokeRatio: 0.82,
      lineCap: 'round',
      playerTrailColor: '#c84b1a',
      playerTrailGlow: 'rgba(200, 75, 26, 0.5)',
      hintColor: '#d97706',
      startBadge: { bg: '#2b3a2c', border: '#40916c', text: '#d8f3dc' },
      goalBadge: { bg: '#4a1515', border: '#e63946', text: '#ffccd5' }
    },

    modern: {
      id: 'modern',
      name: '⚪ 極簡現代 (Modern)',
      bgColor: '#ffffff',
      wallColor: '#111827',
      wallGlow: null,
      glowBlur: 0,
      strokeRatio: 0.80,
      lineCap: 'round',
      playerTrailColor: '#2563eb',
      playerTrailGlow: 'rgba(37, 99, 235, 0.4)',
      hintColor: '#f59e0b',
      startBadge: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
      goalBadge: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
    },

    hedge: {
      id: 'hedge',
      name: '🌿 皇家樹籬 (Hedge)',
      bgColor: '#f3eee5',
      wallColor: '#1b4332',
      wallGlow: null,
      glowBlur: 0,
      strokeRatio: 0.85,
      lineCap: 'round',
      playerTrailColor: '#b45309',
      playerTrailGlow: 'rgba(180, 83, 9, 0.4)',
      hintColor: '#eab308',
      startBadge: { bg: '#d8f3dc', border: '#2d6a4f', text: '#1b4332' },
      goalBadge: { bg: '#ffedd5', border: '#c2410c', text: '#7c2d12' }
    }
  };

  function getTheme(themeId) {
    return THEMES[themeId] || THEMES.modern;
  }

  global.ThemeEngine = {
    THEMES,
    getTheme
  };

})(typeof window !== 'undefined' ? window : global);
