import { describe, it, expect } from 'vitest';
import {
  snapToGrid,
  getNodeDimensions,
  getBoundaryPoint,
  getCurvePath,
  getManhattanPath,
} from './geometry';

describe('Geometry Utilities', () => {
  describe('snapToGrid', () => {
    it('should snap values to the nearest grid size (20)', () => {
      expect(snapToGrid(0)).toBe(0);
      expect(snapToGrid(8)).toBe(0);
      expect(snapToGrid(12)).toBe(20);
      expect(snapToGrid(35)).toBe(40);
      expect(snapToGrid(-5)).toBe(0);
      expect(snapToGrid(-15)).toBe(-20);
    });
  });

  describe('getNodeDimensions', () => {
    it('should return standard size for family nodes', () => {
      const familyNode = { type: 'family', isIndex: false, name: 'Alice' };
      const dims = getNodeDimensions(familyNode);
      expect(dims.rx).toBe(20);
      expect(dims.ry).toBe(20);
    });

    it('should scale size for index family nodes', () => {
      const indexNode = { type: 'family', isIndex: true, name: 'Bob' };
      const dims = getNodeDimensions(indexNode);
      expect(dims.rx).toBe(26); // 20 * 1.3
      expect(dims.ry).toBe(26);
    });

    it('should calculate size based on text length for ecological nodes', () => {
      const shortEnvNode = { type: 'env', name: 'Work' };
      const dims1 = getNodeDimensions(shortEnvNode);
      expect(dims1.rx).toBe(50); // default min width is 50

      const longEnvNode = { type: 'env', name: 'Very Long Hospital Center' };
      const dims2 = getNodeDimensions(longEnvNode);
      expect(dims2.rx).toBeGreaterThan(50); // scaled up by text length
    });
  });

  describe('getBoundaryPoint', () => {
    it('should return node border point towards target', () => {
      const node = { x: 100, y: 100, type: 'family', isIndex: false };
      // Target is directly to the right (x=200, y=100)
      const pt = getBoundaryPoint(node, 200, 100, 5);
      // rx = 20, gap = 5. So border point x should be 100 + 20 + 5 = 125
      expect(pt.x).toBeCloseTo(125);
      expect(pt.y).toBeCloseTo(100);
    });
  });

  describe('getCurvePath', () => {
    it('should return a quadratic bezier SVG path', () => {
      const path = getCurvePath(100, 100, 200, 100, 40);
      expect(path).toContain('M 100 100');
      expect(path).toContain('Q');
      expect(path).toContain('200 100');
    });

    it('should return straight line representation when bendOffset is 0', () => {
      const path = getCurvePath(100, 100, 200, 100, 0);
      // Midpoint is 150, 100.
      expect(path).toBe('M 100 100 Q 150 100 200 100');
    });
  });

  describe('getManhattanPath', () => {
    it('should return orthgonal parent-child path', () => {
      const path = getManhattanPath(100, 100, 200, 200, 'parent-child', 0);
      // midY is 150
      expect(path).toBe('M 100 100 L 100 150 L 200 150 L 200 200');
    });

    it('should return offset orthgonal parent-child path when bendOffset is set', () => {
      const path = getManhattanPath(100, 100, 200, 200, 'parent-child', 20);
      // midY with offset is 150 + 20 = 170
      expect(path).toBe('M 100 100 L 100 170 L 200 170 L 200 200');
    });

    it('should return bracket path with negative offset (higher up) for siblings', () => {
      const path = getManhattanPath(100, 200, 200, 200, 'bracket', 10);
      // topY = min(200, 200) - 50 - 10 = 140
      expect(path).toBe('M 100 200 L 100 140 L 200 140 L 200 200');
    });
  });
});
