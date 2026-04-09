import { LAYOUT_CONFIG } from '../constants/layout';
import { snapToGrid } from './geometry';

/**
 * Simple collision-relaxation layout.
 * - Snaps Y to rowHeight grid.
 * - Iteratively pushes overlapping nodes apart horizontally.
 */
export const applyAutoLayout = (nodes, { snapEnabled = true } = {}) => {
  if (nodes.length === 0) return { nodes, changed: false };

  let sim = nodes.map((n) => ({ ...n }));
  let changed = false;

  const { rowHeight, minNodeGapX, minNodeGapY, tightGap, autoLayoutSteps } =
    LAYOUT_CONFIG;

  sim.forEach((n) => {
    const snappedY = Math.round(n.y / rowHeight) * rowHeight;
    if (Math.abs(n.y - snappedY) > 5) {
      n.y = snappedY;
      changed = true;
    }
  });

  for (let step = 0; step < autoLayoutSteps; step++) {
    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        const n1 = sim[i];
        const n2 = sim[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        if (Math.abs(dy) < minNodeGapY && Math.abs(dx) < minNodeGapX) {
          changed = true;
          const push = (minNodeGapX - Math.abs(dx)) / 2 + 5;
          if (dx >= 0) {
            n1.x += push;
            n2.x -= push;
          } else {
            n1.x -= push;
            n2.x += push;
          }
        } else if (Math.abs(dy) < tightGap && Math.abs(dx) < tightGap) {
          changed = true;
          const push = (tightGap - Math.abs(dx)) / 2 + 2;
          n1.x += dx >= 0 ? push : -push;
          n2.x -= dx >= 0 ? push : -push;
        }
      }
    }
  }

  if (snapEnabled) {
    sim = sim.map((n) => ({ ...n, x: snapToGrid(n.x), y: snapToGrid(n.y) }));
  }

  return { nodes: sim, changed };
};
