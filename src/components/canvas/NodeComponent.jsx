import React from 'react';
import { THEME_CONFIG, CURRENT_YEAR } from '../../constants/theme';
import { getNodeDimensions } from '../../utils/geometry';

export const NodeComponent = React.memo(
  ({ node, isSelected, onPointerDown, onContextMenu }) => {
    const isMale = node.gender === 'male';
    const isFemale = node.gender === 'female';
    const isPregnancy = node.gender === 'pregnancy';
    const isFamily = node.type === 'family';

    const strokeColor = isSelected
      ? THEME_CONFIG.colors.selection
      : node.isIndex
      ? THEME_CONFIG.colors.indexNode
      : '#1e293b';
    const strokeWidth = isSelected ? 3 : node.isIndex ? 3 : 2;
    const fillColor = THEME_CONFIG.colors.nodeFill;
    const fontSize = node.fontSize || THEME_CONFIG.sizes.defaultFont;
    const nameYOffset = isFamily ? 35 + (fontSize - 10) : 4;
    const { rx } = getNodeDimensions(node);

    return (
      <g
        transform={`translate(${node.x},${node.y})`}
        onPointerDown={(e) => onPointerDown(e, node.id)}
        onContextMenu={(e) => onContextMenu(e, node.id)}
        className="cursor-move hover:opacity-90 transition-opacity"
      >
        {isSelected && (
          <circle
            r={isFamily ? 32 : rx + 12}
            fill="none"
            stroke={THEME_CONFIG.colors.primary}
            strokeWidth="2"
            strokeDasharray="4,4"
            className="animate-spin-slow opacity-50"
          />
        )}

        {isFamily ? (
          isMale ? (
            <rect
              x={-20}
              y={-20}
              width={40}
              height={40}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          ) : isFemale ? (
            <circle
              r={20}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          ) : isPregnancy ? (
            <polygon
              points="0,-24 20,16 -20,16"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          ) : (
            <rect
              x={-15}
              y={-15}
              width={30}
              height={30}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray="4,2"
            />
          )
        ) : (
          <ellipse
            rx={getNodeDimensions(node).rx}
            ry={getNodeDimensions(node).ry}
            fill={fillColor}
            stroke="#059669"
            strokeWidth={strokeWidth}
            strokeDasharray="4,4"
          />
        )}

        {node.isIndex &&
          (isMale ? (
            <rect
              x={-26}
              y={-26}
              width={52}
              height={52}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
          ) : (
            <circle r={26} fill="none" stroke={strokeColor} strokeWidth="1.5" />
          ))}

        {node.isDeceased && (
          <g stroke={strokeColor} strokeWidth="2.5">
            <line x1={-18} y1={-18} x2={18} y2={18} />
            <line x1={18} y1={-18} x2={-18} y2={18} />
          </g>
        )}

        <text
          y={nameYOffset}
          textAnchor="middle"
          style={{ fontSize: `${fontSize}px` }}
          className={`font-bold select-none pointer-events-none ${
            node.isIndex ? 'fill-blue-600' : 'fill-slate-800'
          }`}
        >
          {node.name}
        </text>

        {isFamily && node.birthYear != null && (
          <text
            y={nameYOffset + fontSize * 0.9}
            textAnchor="middle"
            style={{ fontSize: `${Math.max(10, fontSize * 0.8)}px` }}
            className="fill-slate-500 select-none pointer-events-none"
          >
            {CURRENT_YEAR - node.birthYear}세
          </text>
        )}
      </g>
    );
  }
);
