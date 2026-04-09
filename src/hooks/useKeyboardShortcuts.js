import { useEffect } from 'react';
import { ActionTypes as A } from '../state/actions';

export const useKeyboardShortcuts = (state, dispatch, { onDelete }) => {
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: A.UNDO });
      } else if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: A.REDO });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection.id && !document.querySelector('input:focus')) {
          onDelete();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.selection.id, dispatch, onDelete]);
};
