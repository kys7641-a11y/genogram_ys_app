import React from 'react';
import { THEME_CONFIG } from '../../constants/theme';

export const LinkingPreview = ({ sourceNode, mousePos }) => {
  if (!sourceNode) return null;
  return (
    <line
      x1={sourceNode.x}
      y1={sourceNode.y}
      x2={mousePos.x}
      y2={mousePos.y}
      stroke={THEME_CONFIG.colors.primary}
      strokeWidth="2"
      strokeDasharray="4,4"
      className="pointer-events-none opacity-60"
    />
  );
};
