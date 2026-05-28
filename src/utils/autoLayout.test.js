import { describe, it, expect } from 'vitest';
import { applyAutoLayout } from './autoLayout';

describe('Auto-Layout Algorithm', () => {
  it('should handle empty nodes array', () => {
    const { nodes, changed } = applyAutoLayout([], []);
    expect(nodes).toEqual([]);
    expect(changed).toBe(false);
  });

  it('should align family nodes to generational Y-levels', () => {
    // 3 nodes: husband (index), wife (spouse), child (parent-child relationship)
    const nodes = [
      { id: 'n1', type: 'family', name: 'Husband', isIndex: true, x: 100, y: 50 },
      { id: 'n2', type: 'family', name: 'Wife', isIndex: false, x: 200, y: 120 },
      { id: 'n3', type: 'family', name: 'Child', isIndex: false, x: 150, y: 300 },
    ];
    const edges = [
      { id: 'e1', type: 'marriage', source: 'n1', target: 'n2' },
      { id: 'e2', type: 'parent-child', source: 'n1', target: 'n3' },
    ];

    const { nodes: result } = applyAutoLayout(nodes, edges, { snapEnabled: false });
    
    const h = result.find(n => n.id === 'n1');
    const w = result.find(n => n.id === 'n2');
    const c = result.find(n => n.id === 'n3');

    // Spouses should be on the exact same row (Y coordinate)
    expect(h.y).toBe(w.y);

    // Child Y should be greater than parents Y (since children go below parents)
    expect(c.y).toBeGreaterThan(h.y);
  });

  it('should center children below the midpoint of their parents', () => {
    const nodes = [
      { id: 'n1', type: 'family', name: 'Father', isIndex: true, x: 100, y: 0 },
      { id: 'n2', type: 'family', name: 'Mother', isIndex: false, x: 300, y: 0 },
      { id: 'n3', type: 'family', name: 'Child', isIndex: false, x: 150, y: 200 },
    ];
    const edges = [
      { id: 'e1', type: 'marriage', source: 'n1', target: 'n2' },
      { id: 'e2', type: 'parent-child', source: 'n1', target: 'n3' },
      { id: 'e3', type: 'parent-child', source: 'n2', target: 'n3' },
    ];

    const { nodes: result } = applyAutoLayout(nodes, edges, { snapEnabled: false });

    const f = result.find(n => n.id === 'n1');
    const m = result.find(n => n.id === 'n2');
    const c = result.find(n => n.id === 'n3');

    const parentsMidX = (f.x + m.x) / 2;
    // Child x should be centered under parents' midpoint
    expect(c.x).toBeCloseTo(parentsMidX);
  });

  it('should place environmental nodes in a surrounding circle for Eco-maps', () => {
    const nodes = [
      { id: 'n1', type: 'family', name: 'Client', isIndex: true, x: 400, y: 300 },
      { id: 'env1', type: 'env', name: 'Hospital', x: 0, y: 0 },
      { id: 'env2', type: 'env', name: 'School', x: 0, y: 0 },
    ];
    // Ecomap connections
    const edges = [
      { id: 'e1', type: 'strong', source: 'n1', target: 'env1' },
      { id: 'e2', type: 'normal', source: 'n1', target: 'env2' },
    ];

    const { nodes: result } = applyAutoLayout(nodes, edges, { snapEnabled: false });

    const clientFinal = result.find(n => n.id === 'n1');
    const e1 = result.find(n => n.id === 'env1');
    const e2 = result.find(n => n.id === 'env2');
    const familyCenter = 400; // Client coordinate is 400

    // Distance to center of family node should be roughly equal (circular placement)
    const dist1 = Math.sqrt(Math.pow(e1.x - familyCenter, 2) + Math.pow(e1.y - clientFinal.y, 2));
    const dist2 = Math.sqrt(Math.pow(e2.x - familyCenter, 2) + Math.pow(e2.y - clientFinal.y, 2));

    expect(dist1).toBeGreaterThan(200);
    expect(dist2).toBeGreaterThan(200);
    expect(Math.abs(dist1 - dist2)).toBeLessThan(50); // radii are roughly the same
  });
});
