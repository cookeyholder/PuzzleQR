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
      startBadge: { bg: '#15803d', border: '#166534', text: '#ffffff', glow: 'rgba(21, 128, 61, 0.45)' },
      goalBadge: { bg: '#c2410c', border: '#9a3412', text: '#ffffff', glow: 'rgba(194, 65, 12, 0.45)' },
      wrapperBg: '#f3e8d2',
      wrapperBorder: '#d6c09b',
      wrapperShadow: '0 8px 30px rgba(74, 40, 16, 0.12)',
      containerBorder: '#bfa37e'
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
      startBadge: { bg: '#16a34a', border: '#15803d', text: '#ffffff', glow: 'rgba(22, 163, 74, 0.45)' },
      goalBadge: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff', glow: 'rgba(220, 38, 38, 0.45)' },
      wrapperBg: '#e8dcbf',
      wrapperBorder: '#c7b693',
      wrapperShadow: '0 8px 30px rgba(43, 38, 33, 0.14)',
      containerBorder: '#a3916e'
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
      startBadge: { bg: '#10b981', border: '#059669', text: '#ffffff', glow: 'rgba(16, 185, 129, 0.45)' },
      goalBadge: { bg: '#ef4444', border: '#dc2626', text: '#ffffff', glow: 'rgba(239, 68, 68, 0.45)' },
      wrapperBg: '#f8fafc',
      wrapperBorder: '#e2e8f0',
      wrapperShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
      containerBorder: '#cbd5e1'
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
      startBadge: { bg: '#16a34a', border: '#14532d', text: '#ffffff', glow: 'rgba(22, 163, 74, 0.45)' },
      goalBadge: { bg: '#ea580c', border: '#9a3412', text: '#ffffff', glow: 'rgba(234, 88, 12, 0.45)' },
      wrapperBg: '#e5eee1',
      wrapperBorder: '#bdd2b8',
      wrapperShadow: '0 8px 30px rgba(27, 67, 50, 0.12)',
      containerBorder: '#97b892'
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
