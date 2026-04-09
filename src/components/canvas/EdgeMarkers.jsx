import React from 'react';
import { ALL_RELATIONS } from '../../constants/relations';

export const EdgeMarkers = () => (
  <defs>
    {ALL_RELATIONS.map((config) => (
      <React.Fragment key={config.id}>
        <marker
          id={`arrow-${config.id}`}
          markerWidth="7"
          markerHeight="7"
          refX="6.5"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,5 L6.5,2.5 z" fill={config.color} />
        </marker>
        <marker
          id={`arrow-start-${config.id}`}
          markerWidth="7"
          markerHeight="7"
          refX="0"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M6.5,0 L6.5,5 L0,2.5 z" fill={config.color} />
        </marker>
      </React.Fragment>
    ))}
  </defs>
);
