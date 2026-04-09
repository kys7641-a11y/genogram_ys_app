import { THEME_CONFIG } from '../constants/theme';
import { GRID_SIZE } from '../constants/layout';

export const snapToGrid = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export const getNodeDimensions = (node) => {
  if (node.type === 'family') {
    const scale = node.isIndex ? 1.3 : 1;
    return {
      rx: THEME_CONFIG.sizes.familyNode.r * scale,
      ry: THEME_CONFIG.sizes.familyNode.r * scale,
    };
  }
  const textLen = node.name ? node.name.length : 0;
  return {
    rx: Math.max(THEME_CONFIG.sizes.envNode.rx, textLen * 12),
    ry: THEME_CONFIG.sizes.envNode.ry,
  };
};

export const getBoundaryPoint = (node, targetX, targetY, gap = 0) => {
  if (!node) return { x: targetX, y: targetY };
  const dx = targetX - node.x;
  const dy = targetY - node.y;
  const angle = Math.atan2(dy, dx);
  const { rx, ry } = getNodeDimensions(node);
  const dist =
    (rx * ry) /
    Math.sqrt(
      Math.pow(ry * Math.cos(angle), 2) + Math.pow(rx * Math.sin(angle), 2)
    );
  return {
    x: node.x + Math.cos(angle) * (dist + gap),
    y: node.y + Math.sin(angle) * (dist + gap),
  };
};

export const getManhattanPath = (x1, y1, x2, y2, type = 'default') => {
  const midY = (y1 + y2) / 2;
  if (type === 'parent-child') {
    return y2 < y1
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }
  if (type === 'bracket') {
    const topY = Math.min(y1, y2) - 50;
    return `M ${x1} ${y1} L ${x1} ${topY} L ${x2} ${topY} L ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
};

export const getZigzagPath = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 20) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const steps = Math.floor(len / 10);
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const offset = i % 2 === 0 ? 6 : -6;
    const px = x1 + dx * t + (-dy / len) * offset;
    const py = y1 + dy * t + (dx / len) * offset;
    d += ` L ${px} ${py}`;
  }
  return `${d} L ${x2} ${y2}`;
};
