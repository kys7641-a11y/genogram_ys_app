import React, { useMemo } from 'react';
import { GRID_SIZE } from '../../constants/layout';
import { EdgeMarkers } from './EdgeMarkers';
import { EdgeComponent } from './EdgeComponent';
import { NodeComponent } from './NodeComponent';
import { CohabitationFrame } from './CohabitationFrame';
import { LinkingPreview } from './LinkingPreview';

const MARRIAGE_TYPES = new Set([
  'marriage',
  'cohabitation',
  'divorce',
  'separation',
]);

/**
 * Pre-computes per-edge metadata (sibling grouping, spouse midpoint for
 * parent-child) so EdgeComponent can remain pure and memoizable.
 */
const useEdgeMeta = (nodes, edges) =>
  useMemo(() => {
    const nodesById = new Map(nodes.map((n) => [n.id, n]));

    // Group edges by unordered node pair
    const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const groups = new Map();
    edges.forEach((e) => {
      const k = pairKey(e.source, e.target);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    });
    groups.forEach((arr) => arr.sort((a, b) => a.id.localeCompare(b.id)));

    // Marriage-like edges for parent-child midpoint lookup
    const marriageByNode = new Map();
    edges.forEach((e) => {
      if (MARRIAGE_TYPES.has(e.type)) {
        if (!marriageByNode.has(e.source)) marriageByNode.set(e.source, e);
        if (!marriageByNode.has(e.target)) marriageByNode.set(e.target, e);
      }
    });

    const meta = new Map();
    edges.forEach((e) => {
      const group = groups.get(pairKey(e.source, e.target)) || [e];
      const edgeIndex = group.findIndex((x) => x.id === e.id);
      let spouseMid = null;
      if (e.type === 'parent-child') {
        const m = marriageByNode.get(e.source);
        if (m) {
          const spouseId = m.source === e.source ? m.target : m.source;
          const source = nodesById.get(e.source);
          const spouse = nodesById.get(spouseId);
          if (source && spouse) {
            spouseMid = {
              x: (source.x + spouse.x) / 2,
              y: (source.y + spouse.y) / 2,
            };
          }
        }
      }
      meta.set(e.id, {
        edgeIndex,
        totalShared: group.length,
        spouseMid,
      });
    });

    return { nodesById, meta };
  }, [nodes, edges]);

export const Canvas = ({
  svgRef,
  state,
  interaction,
  selection,
  view,
  showLabels,
  mousePos,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onContextMenu,
  onSelectEdge,
}) => {
  const { nodes, edges } = state;
  const { nodesById, meta } = useEdgeMeta(nodes, edges);

  const linkingSource =
    interaction.state === 'linking' && interaction.data?.sourceId
      ? nodesById.get(interaction.data.sourceId)
      : null;

  return (
    <div
      className="flex-1 bg-slate-50 overflow-hidden relative cursor-crosshair touch-none outline-none"
      tabIndex={0}
      onPointerDown={(e) => onPointerDown(e)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE * view.scale}px ${GRID_SIZE * view.scale}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      />

      <svg ref={svgRef} className="w-full h-full block">
        <EdgeMarkers />
        <g transform={`translate(${view.x}, ${view.y}) scale(${view.scale})`}>
          <CohabitationFrame nodes={nodes} />

          {edges.map((edge) => {
            const m = meta.get(edge.id) || { edgeIndex: 0, totalShared: 1, spouseMid: null };
            return (
              <EdgeComponent
                key={edge.id}
                edge={edge}
                sourceNode={nodesById.get(edge.source)}
                targetNode={nodesById.get(edge.target)}
                edgeIndex={m.edgeIndex}
                totalShared={m.totalShared}
                spouseMid={m.spouseMid}
                isSelected={selection.id === edge.id}
                showLabels={showLabels}
                onClick={onSelectEdge}
              />
            );
          })}

          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selection.id === node.id}
              onPointerDown={onPointerDown}
              onContextMenu={onContextMenu}
            />
          ))}

          {linkingSource && (
            <LinkingPreview sourceNode={linkingSource} mousePos={mousePos} />
          )}
        </g>
      </svg>

      <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-mono text-slate-500 border border-slate-200 shadow-sm pointer-events-none">
        Zoom: {Math.round(view.scale * 100)}% | X: {Math.round(view.x)} Y:{' '}
        {Math.round(view.y)}
      </div>
    </div>
  );
};
