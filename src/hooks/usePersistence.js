import { useEffect, useRef } from 'react';
import { STORAGE_KEY } from '../constants/layout';
import { ActionTypes as A } from '../state/actions';

export const usePersistence = (state, dispatch) => {
  const loaded = useRef(false);

  // Initial load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: A.LOAD_PROJECT, payload: parsed });
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    } finally {
      loaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save
  useEffect(() => {
    if (!loaded.current) return;
    try {
      const payload = {
        nodes: state.nodes,
        edges: state.edges,
        mode: state.mode,
        showLabels: state.ui.showLabels,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state.nodes, state.edges, state.mode, state.ui.showLabels]);
};
