import React from 'react';
import { THEME_CONFIG } from '../../constants/theme';

export const CohabitationFrame = ({ nodes }) => {
  const cohab = nodes.filter((n) => n.isCohabiting);
  if (cohab.length === 0) return null;

  const padding = 40;
  const minX = Math.min(...cohab.map((n) => n.x));
  const maxX = Math.max(...cohab.map((n) => n.x));
  const minY = Math.min(...cohab.map((n) => n.y));
  const maxY = Math.max(...cohab.map((n) => n.y));

  return (
    <rect
      x={minX - padding}
      y={minY - padding}
      width={maxX - minX + padding * 2}
      height={maxY - minY + padding * 2}
      rx={20}
      ry={20}
      fill="none"
      stroke={THEME_CONFIG.colors.primary}
      strokeWidth="2"
      strokeDasharray="5,5"
      className="pointer-events-none opacity-40 animate-pulse"
    />
  );
};
