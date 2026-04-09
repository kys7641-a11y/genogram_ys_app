import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { diagramReducer, initialState } from './diagramReducer';

const DiagramContext = createContext(null);

export const DiagramProvider = ({ children }) => {
  const [state, dispatch] = useReducer(diagramReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>
  );
};

export const useDiagram = () => {
  const ctx = useContext(DiagramContext);
  if (!ctx) throw new Error('useDiagram must be used within DiagramProvider');
  return ctx;
};
