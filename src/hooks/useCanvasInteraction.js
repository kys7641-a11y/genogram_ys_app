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

  const handleBendPointerDown = useCallback(
    (e, edgeId) => {
      e.stopPropagation();
      clearContextMenu();
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      dispatch({
        type: A.SET_SELECTION,
        payload: { type: 'edge', id: edgeId },
      });
      dispatch({
        type: A.SET_INTERACTION,
        payload: {
          state: 'dragging-bend',
          data: {
            edgeId,
            startX: e.clientX,
            startY: e.clientY,
            initialOffset: edge.bendOffset || 0,
          },
        },
      });
    },
    [edges, dispatch, clearContextMenu]
  );

  const handlePointerDown = useCallback(
    (e, nodeId = null) => {
      if (!nodeId) {
        // click on empty canvas clears selection
        dispatch({
          type: A.SET_SELECTION,
          payload: { type: null, id: null },
        });
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
      let mX = 0;
      let mY = 0;
      if (rect) {
        mX = (e.clientX - rect.left - view.x) / view.scale;
        mY = (e.clientY - rect.top - view.y) / view.scale;
        setMousePos({ x: mX, y: mY });
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

        // Smart alignment snap to other nodes (within 8px)
        const SNAP_THRESHOLD = 8;
        const otherNodes = nodes.filter((n) => n.id !== interaction.data.id);
        
        let snapX = false;
        let snapY = false;
        for (const n of otherNodes) {
          if (!snapX && Math.abs(nx - n.x) < SNAP_THRESHOLD) {
            nx = n.x;
            snapX = true;
          }
          if (!snapY && Math.abs(ny - n.y) < SNAP_THRESHOLD) {
            ny = n.y;
            snapY = true;
          }
        }

        dispatch({
          type: A.UPDATE_NODE,
          payload: { id: interaction.data.id, patch: { x: nx, y: ny } },
        });
      } else if (interaction.state === 'dragging-bend') {
        const edge = edges.find((ed) => ed.id === interaction.data.edgeId);
        if (!edge) return;
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const dy = (e.clientY - interaction.data.startY) / view.scale;
        let newOffset = interaction.data.initialOffset;

        // Orthogonal lines/bracket lines bend vertically. Direct lines bend perpendicular.
        const isParentChild = edge.type === 'parent-child';
        const isSibling = edge.type === 'siblings';

        if (isParentChild) {
          newOffset = interaction.data.initialOffset + dy;
        } else if (isSibling) {
          newOffset = interaction.data.initialOffset - dy; // upwards is positive
        } else {
          // Perpendicular projection for direct / marriage lines
          const sX = sourceNode.x;
          const sY = sourceNode.y;
          const tX = targetNode.x;
          const tY = targetNode.y;
          const midpointX = (sX + tX) / 2;
          const midpointY = (sY + tY) / 2;

          const dx = tX - sX;
          const ndy = tY - sY;
          const len = Math.sqrt(dx * dx + ndy * ndy) || 1;
          const perpX = -ndy / len;
          const perpY = dx / len;

          const vx = mX - midpointX;
          const vy = mY - midpointY;
          newOffset = vx * perpX + vy * perpY;
        }

        dispatch({
          type: A.UPDATE_EDGE,
          payload: { id: interaction.data.edgeId, patch: { bendOffset: newOffset } },
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
    [interaction, view, ui.snapEnabled, nodes, edges, dispatch, svgRef]
  );

  const handlePointerUp = useCallback(() => {
    if (interaction.state === 'dragging' || interaction.state === 'dragging-bend') {
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
    handleBendPointerDown,
  };
};
