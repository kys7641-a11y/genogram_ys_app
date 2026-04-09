import React from 'react';
import { getRelationConfig } from '../../constants/relations';
import {
  getBoundaryPoint,
  getManhattanPath,
  getZigzagPath,
  getNodeDimensions,
} from '../../utils/geometry';

/**
 * Presentational edge component. All cross-edge context (sibling index,
 * spouse midpoint for parent-child) is pre-computed by the parent and
 * passed as primitives, so React.memo is effective.
 */
export const EdgeComponent = React.memo(
  ({
    edge,
    sourceNode,
    targetNode,
    edgeIndex,
    totalShared,
    spouseMid, // {x,y} | null, only for parent-child
    isSelected,
    showLabels,
    onClick,
  }) => {
    if (!sourceNode || !targetNode) return null;
    const config = getRelationConfig(edge.type);
    if (!config) return null;

    let rawSX = sourceNode.x;
    let rawSY = sourceNode.y;
    let rawTX = targetNode.x;
    let rawTY = targetNode.y;

    if (config.logic === 'horizontal') {
      const isSourceLeft = sourceNode.x < targetNode.x;
      const leftNode = isSourceLeft ? sourceNode : targetNode;
      const rightNode = isSourceLeft ? targetNode : sourceNode;
      rawSX = leftNode.x + getNodeDimensions(leftNode).rx;
      rawSY = leftNode.y;
      rawTX = rightNode.x - getNodeDimensions(rightNode).rx;
      rawTY = rightNode.y;
    } else if (config.logic === 'orthogonal' && edge.type === 'parent-child') {
      if (spouseMid) {
        rawSX = spouseMid.x;
        rawSY = spouseMid.y;
      } else {
        rawSY += 20;
      }
      rawTY -= 20;
    } else if (config.logic !== 'horizontal' && config.logic !== 'orthogonal') {
      const s = getBoundaryPoint(sourceNode, targetNode.x, targetNode.y, 8);
      const t = getBoundaryPoint(targetNode, sourceNode.x, sourceNode.y, 8);
      rawSX = s.x;
      rawSY = s.y;
      rawTX = t.x;
      rawTY = t.y;
    }

    let sX = rawSX;
    let sY = rawSY;
    let tX = rawTX;
    let tY = rawTY;

    if (totalShared > 1) {
      const offsetMag = (edgeIndex - (totalShared - 1) / 2) * 22;
      if (
        !config.logic ||
        config.logic === 'horizontal' ||
        config.logic === 'direct'
      ) {
        const dx = rawTX - rawSX;
        const dy = rawTY - rawSY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        sX += (-dy / len) * offsetMag;
        sY += (dx / len) * offsetMag;
        tX += (-dy / len) * offsetMag;
        tY += (dx / len) * offsetMag;
      } else if (config.logic === 'orthogonal') {
        sX += offsetMag;
        tX += offsetMag;
      } else if (config.logic === 'bracket') {
        sY += offsetMag;
        tY += offsetMag;
      }
    }

    let pathData;
    let midX;
    let midY;

    if (config.logic === 'horizontal') {
      pathData = `M ${sX} ${sY} L ${tX} ${tY}`;
      midX = (sX + tX) / 2;
      midY = (sY + tY) / 2 - 12;
    } else if (config.logic === 'orthogonal') {
      pathData = getManhattanPath(sX, sY, tX, tY, 'parent-child');
      midX = tX + 16;
      midY = (sY + tY) / 2;
    } else if (config.logic === 'bracket') {
      pathData = getManhattanPath(sX, sY, tX, tY, 'bracket');
      midX = (sX + tX) / 2;
      midY = Math.min(sY, tY) - 62;
    } else {
      pathData =
        config.style === 'zigzag'
          ? getZigzagPath(sX, sY, tX, tY)
          : `M ${sX} ${sY} L ${tX} ${tY}`;
      midX = (sX + tX) / 2;
      midY = (sY + tY) / 2 - 14;
    }

    const strokeColor = isSelected ? '#6366f1' : config.color;
    const midpointX = (sX + tX) / 2;
    const midpointY = (sY + tY) / 2;

    return (
      <g
        onClick={(e) => {
          e.stopPropagation();
          onClick(edge.id);
        }}
        className="cursor-pointer group"
      >
        <path d={pathData} stroke="transparent" strokeWidth="15" fill="none" />
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={isSelected ? 4 : config.width || 2}
          strokeDasharray={config.style === 'dashed' ? '6,4' : 'none'}
          fill="none"
          markerEnd={
            edge.direction === 'single' || edge.direction === 'both'
              ? `url(#arrow-${edge.type})`
              : undefined
          }
          markerStart={
            edge.direction === 'both'
              ? `url(#arrow-start-${edge.type})`
              : undefined
          }
          className="transition-colors duration-200"
        />
        {config.marker === 'double-slash' && (
          <g transform={`translate(${midpointX}, ${midpointY})`}>
            <line x1="-3" y1="-8" x2="-8" y2="8" stroke={strokeColor} strokeWidth="2" />
            <line x1="8" y1="-8" x2="3" y2="8" stroke={strokeColor} strokeWidth="2" />
          </g>
        )}
        {config.marker === 'single-slash' && (
          <g transform={`translate(${midpointX}, ${midpointY})`}>
            <line x1="4" y1="-8" x2="-4" y2="8" stroke={strokeColor} strokeWidth="2" />
          </g>
        )}
        {config.marker === 'bar' && (
          <g transform={`translate(${midpointX}, ${midpointY})`}>
            <line x1="-8" y1="0" x2="8" y2="0" stroke={strokeColor} strokeWidth="4" />
          </g>
        )}
        {showLabels && (
          <g transform={`translate(${midX}, ${midY})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill={config.color}
              stroke="white"
              strokeWidth="4"
              strokeLinejoin="round"
              className="font-bold pointer-events-none select-none opacity-90"
            >
              {config.label}
            </text>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill={config.color}
              className="font-bold pointer-events-none select-none"
            >
              {config.label}
            </text>
          </g>
        )}
      </g>
    );
  }
);
