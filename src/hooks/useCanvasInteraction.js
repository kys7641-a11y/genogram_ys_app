import { useCallback, useState } from 'react';
import { ActionTypes as A } from '../state/actions';
import { snapToGrid } from '../utils/geometry';

/**
 * Encapsulates pan / zoom / drag / link state-machine and returns
 * pointer handlers ready to attach to the canvas container.
 */
export const useCanvasInteraction = (state, dispatch, { svgRef }) => {
  const { nodes, edges, view, interaction, ui, mode } = state;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const clearContextMenu = useCallback(() => {
    if (ui.contextMenu.visible) {
      dispatch({
        type: A.SET_UI,
        payload: {
          contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
        },
      });
    }
  }, [dispatch, ui.contextMenu.visible]);

  const handlePointerDown = useCallback(
    (e, nodeId = null) => {
      if (!nodeId) {
        // click on empty canvas clears node selection (but keeps edge selection)
        if (state.selection.type === 'node') {
          dispatch({
            type: A.SET_SELECTION,
            payload: { type: null, id: null },
          });
        }
      }
      if (e.button === 2 || e.button === 1 || e.altKey) return;
      clearContextMenu();

      if (nodeId) {
        e.stopPropagation();
        if (interaction.state === 'linking') {
          const sourceId = interaction.data.sourceId;
          if (sourceId === nodeId) return;
          const newEdge = {
            id: `e_${Date.now()}`,
            source: sourceId,
            target: nodeId,
            type: mode === 'genogram' ? 'marriage' : 'normal',
            direction: 'none',
          };
          dispatch({ type: A.ADD_EDGE, payload: newEdge });
          dispatch({
            type: A.SET_INTERACTION,
            payload: { state: 'idle', data: null },
          });
          dispatch({
            type: A.SET_SELECTION,
            payload: { type: 'edge', id: newEdge.id },
          });
          return;
        }
        const target = nodes.find((n) => n.id === nodeId);
        if (!target) return;
        dispatch({
          type: A.SET_INTERACTION,
          payload: {
            state: 'dragging',
            data: {
              id: nodeId,
              startX: e.clientX,
              startY: e.clientY,
              initialX: target.x,
              initialY: target.y,
            },
          },
        });
        dispatch({
          type: A.SET_SELECTION,
          payload: { type: 'node', id: nodeId },
        });
      } else {
        dispatch({
          type: A.SET_INTERACTION,
          payload: {
            state: 'panning',
            data: {
              startX: e.clientX,
              startY: e.clientY,
              viewX: view.x,
              viewY: view.y,
            },
          },
        });
      }
    },
    [
      state.selection.type,
      interaction,
      nodes,
      view,
      mode,
      dispatch,
      clearContextMenu,
    ]
  );

  const handlePointerMove = useCallback(
    (e) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - view.x) / view.scale,
          y: (e.clientY - rect.top - view.y) / view.scale,
        });
      }

      if (interaction.state === 'dragging') {
        const dx = (e.clientX - interaction.data.startX) / view.scale;
        const dy = (e.clientY - interaction.data.startY) / view.scale;
        let nx = interaction.data.initialX + dx;
        let ny = interaction.data.initialY + dy;
        if (ui.snapEnabled) {
          nx = snapToGrid(nx);
          ny = snapToGrid(ny);
        }
        dispatch({
          type: A.UPDATE_NODE,
          payload: { id: interaction.data.id, patch: { x: nx, y: ny } },
        });
      } else if (interaction.state === 'panning') {
        dispatch({
          type: A.SET_VIEW,
          payload: {
            ...view,
            x: interaction.data.viewX + (e.clientX - interaction.data.startX),
            y: interaction.data.viewY + (e.clientY - interaction.data.startY),
          },
        });
      }
    },
    [interaction, view, ui.snapEnabled, dispatch, svgRef]
  );

  const handlePointerUp = useCallback(() => {
    if (interaction.state === 'dragging') {
      dispatch({ type: A.COMMIT_HISTORY });
      dispatch({
        type: A.SET_INTERACTION,
        payload: { state: 'idle', data: null },
      });
    } else if (interaction.state === 'panning') {
      dispatch({
        type: A.SET_INTERACTION,
        payload: { state: 'idle', data: null },
      });
    }
  }, [interaction.state, dispatch]);

  const handleWheel = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newScale = e.deltaY < 0 ? view.scale * 1.1 : view.scale / 1.1;
        dispatch({
          type: A.SET_VIEW,
          payload: {
            ...view,
            scale: Math.max(0.2, Math.min(4, newScale)),
          },
        });
      }
    },
    [view, dispatch]
  );

  const handleContextMenu = useCallback(
    (e, nodeId) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({
        type: A.SET_UI,
        payload: {
          contextMenu: { visible: true, x: e.clientX, y: e.clientY, nodeId },
        },
      });
    },
    [dispatch]
  );

  return {
    mousePos,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleContextMenu,
  };
};
