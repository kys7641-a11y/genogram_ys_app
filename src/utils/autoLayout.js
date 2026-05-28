import { LAYOUT_CONFIG } from '../constants/layout';
import { snapToGrid } from './geometry';

/**
 * Advanced Social Work Auto-Layout Algorithm
 * - Assigns generational rows (Y levels) using a BFS starting from the Client (Index) node.
 * - Places spouses/partners side-by-side at the same level.
 * - Centers sibling groups below their parent couples.
 * - Positions environmental/system nodes in a circle surrounding the family tree (for Eco-maps).
 * - Runs a horizontal relaxation pass to resolve overlapping branches.
 */
export const applyAutoLayout = (nodes, edges = [], { snapEnabled = true } = {}) => {
  if (nodes.length === 0) return { nodes, changed: false };

  const sim = nodes.map((n) => ({ ...n }));
  let changed = false;

  const { rowHeight: baseRowHeight, minNodeGapX, autoLayoutSteps } = LAYOUT_CONFIG;
  const rowHeight = baseRowHeight * 1.25; // 150px spacing for clean text readability

  // 1. Identify Client / Index node as root
  let root = sim.find((n) => n.isIndex);
  if (!root) {
    // If no client, default to family node with most edges, or the first family node
    const familyNodes = sim.filter((n) => n.type === 'family');
    if (familyNodes.length > 0) {
      const edgeCounts = familyNodes.map((n) => ({
        n,
        count: edges.filter((e) => e.source === n.id || e.target === n.id).length,
      }));
      edgeCounts.sort((a, b) => b.count - a.count);
      root = edgeCounts[0].n;
    } else {
      root = sim[0];
    }
  }

  // 2. Build adjacency list of family relationships
  const adj = {};
  sim.forEach((n) => {
    adj[n.id] = { spouses: [], children: [], parents: [], siblings: [] };
  });

  edges.forEach((e) => {
    const s = e.source;
    const t = e.target;
    if (!adj[s] || !adj[t]) return;

    if (['marriage', 'cohabitation', 'divorce', 'separation'].includes(e.type)) {
      adj[s].spouses.push(t);
      adj[t].spouses.push(s);
    } else if (e.type === 'parent-child') {
      adj[s].children.push(t);
      adj[t].parents.push(s);
    } else if (e.type === 'siblings') {
      adj[s].siblings.push(t);
      adj[t].siblings.push(s);
    }
  });

  // 3. Assign Generation Levels (Y-index) via BFS
  const generations = {};
  const visited = new Set();
  const queue = [];

  if (root && root.type === 'family') {
    queue.push(root.id);
    generations[root.id] = 0;
    visited.add(root.id);
  }

  while (queue.length > 0) {
    const u = queue.shift();
    const gu = generations[u];

    // Spouses & siblings share the same level
    [...adj[u].spouses, ...adj[u].siblings].forEach((v) => {
      if (!visited.has(v)) {
        visited.add(v);
        generations[v] = gu;
        queue.push(v);
      }
    });

    // Children are generation + 1
    adj[u].children.forEach((v) => {
      if (!visited.has(v)) {
        visited.add(v);
        generations[v] = gu + 1;
        queue.push(v);
      }
    });

    // Parents are generation - 1
    adj[u].parents.forEach((v) => {
      if (!visited.has(v)) {
        visited.add(v);
        generations[v] = gu - 1;
        queue.push(v);
      }
    });
  }

  // Handle any disconnected family nodes
  sim.forEach((n) => {
    if (n.type === 'family' && generations[n.id] === undefined) {
      generations[n.id] = 0;
    }
  });

  // 4. Position Family Nodes vertically
  sim.forEach((n) => {
    if (n.type === 'family') {
      const targetY = generations[n.id] * rowHeight;
      if (Math.abs(n.y - targetY) > 2) {
        n.y = targetY;
        changed = true;
      }
    }
  });

  // 5. Initial horizontal placement
  // Place Client at X=400, spouses next to them
  const rootSim = sim.find((n) => n.id === root.id);
  if (rootSim && rootSim.type === 'family') {
    rootSim.x = 400;
  }

  // Group family nodes by generation
  const familySim = sim.filter((n) => n.type === 'family');
  const genGroups = {};
  familySim.forEach((n) => {
    const g = generations[n.id];
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(n);
  });

  // Order nodes inside generations by their current X coordinate to preserve visual layout
  Object.keys(genGroups).forEach((g) => {
    genGroups[g].sort((a, b) => a.x - b.x);
  });

  // Center spouses/parents and arrange children
  // A simple bottom-up and top-down pass to center trees
  const sortedGens = Object.keys(genGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedGens.forEach((g) => {
    const levelNodes = genGroups[g];
    levelNodes.forEach((n) => {
      const spouses = adj[n.id].spouses.map((id) => sim.find((x) => x.id === id)).filter(Boolean);
      const children = adj[n.id].children.map((id) => sim.find((x) => x.id === id)).filter(Boolean);

      // Sibling centering: if nodes are siblings and have parent spouses
      const parents = adj[n.id].parents.map((id) => sim.find((x) => x.id === id)).filter(Boolean);
      if (parents.length > 0) {
        // Find parent midpoint
        let parentMidX = parents[0].x;
        if (parents.length > 1) {
          parentMidX = (parents[0].x + parents[1].x) / 2;
        } else {
          // If only 1 parent, check if they have spouse
          const spouse = adj[parents[0].id].spouses[0];
          const spouseNode = spouse && sim.find((x) => x.id === spouse);
          if (spouseNode) {
            parentMidX = (parents[0].x + spouseNode.x) / 2;
          }
        }

        // Find all siblings in this parent group
        const sibIds = new Set([n.id, ...adj[n.id].siblings]);
        parents.forEach((p) => {
          adj[p.id].children.forEach((cId) => sibIds.add(cId));
        });
        const siblingNodes = Array.from(sibIds)
          .map((id) => sim.find((x) => x.id === id))
          .filter((x) => x && generations[x.id] === g);

        siblingNodes.sort((a, b) => a.x - b.x);
        const k = siblingNodes.length;
        siblingNodes.forEach((sib, index) => {
          const targetX = parentMidX + (index - (k - 1) / 2) * minNodeGapX;
          if (Math.abs(sib.x - targetX) > 2) {
            sib.x = targetX;
            changed = true;
          }
        });
      }

      // If a node has a spouse, place them next to each other
      if (spouses.length > 0) {
        const spouse = spouses[0];
        if (Math.abs(spouse.y - n.y) < 10) {
          const isLeft = n.x < spouse.x;
          const leftNode = isLeft ? n : spouse;
          const rightNode = isLeft ? spouse : n;
          const mid = (leftNode.x + rightNode.x) / 2;
          
          if (Math.abs((rightNode.x - leftNode.x) - minNodeGapX) > 10) {
            leftNode.x = mid - minNodeGapX / 2;
            rightNode.x = mid + minNodeGapX / 2;
            changed = true;
          }
        }
      }
    });
  });

  // 6. Horizontal Relaxation Pass (Resolves overlapping family branches)
  for (let step = 0; step < autoLayoutSteps; step++) {
    let shifted = false;
    for (let i = 0; i < familySim.length; i++) {
      for (let j = i + 1; j < familySim.length; j++) {
        const n1 = familySim[i];
        const n2 = familySim[j];

        // Only resolve overlaps on the same row/generation
        if (Math.abs(n1.y - n2.y) < 10) {
          const dx = n1.x - n2.x;
          const absDx = Math.abs(dx);
          const gapThreshold = minNodeGapX;

          if (absDx < gapThreshold) {
            const push = (gapThreshold - absDx) / 2 + 5;
            if (dx >= 0) {
              n1.x += push;
              n2.x -= push;
            } else {
              n1.x -= push;
              n2.x += push;
            }
            shifted = true;
            changed = true;
          }
        }
      }
    }
    if (!shifted) break;
  }

  // 7. Ecomap Environmental/System Nodes layout
  // Environmental system nodes are placed in a circle surrounding the family tree
  const envNodes = sim.filter((n) => n.type !== 'family');
  if (envNodes.length > 0) {
    // Determine the bounding box/center of the family tree
    let minX = 400, maxX = 400, minY = 0, maxY = 0;
    if (familySim.length > 0) {
      minX = Math.min(...familySim.map((n) => n.x));
      maxX = Math.max(...familySim.map((n) => n.x));
      minY = Math.min(...familySim.map((n) => n.y));
      maxY = Math.max(...familySim.map((n) => n.y));
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Radius proportional to the width/height of the family tree
    const w = maxX - minX;
    const h = maxY - minY;
    const radiusX = Math.max(300, w / 2 + 150);
    const radiusY = Math.max(220, h / 2 + 120);

    envNodes.sort((a, b) => a.id.localeCompare(b.id));
    const count = envNodes.length;

    envNodes.forEach((n, idx) => {
      // Calculate angular positions
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2; // start from top
      const targetX = cx + Math.cos(angle) * radiusX;
      const targetY = cy + Math.sin(angle) * radiusY;

      if (Math.abs(n.x - targetX) > 5 || Math.abs(n.y - targetY) > 5) {
        n.x = targetX;
        n.y = targetY;
        changed = true;
      }
    });
  }

  // 8. Snap to grid if enabled
  let result = sim;
  if (snapEnabled) {
    result = sim.map((n) => ({
      ...n,
      x: snapToGrid(n.x),
      y: snapToGrid(n.y),
    }));
  }

  return { nodes: result, changed };
};
