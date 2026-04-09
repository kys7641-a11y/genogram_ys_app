import { ActionTypes as A } from './actions';
import { LAYOUT_CONFIG } from '../constants/layout';

export const initialState = {
  mode: 'genogram',
  nodes: [],
  edges: [],
  history: { past: [], future: [] },
  selection: { type: null, id: null },
  view: { x: 0, y: 0, scale: 1 },
  interaction: { state: 'idle', data: null },
  ui: {
    snapEnabled: true,
    showLabels: true,
    showAiPanel: false,
    isResetModalOpen: false,
    contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
  },
};

const snapshot = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

const pushHistory = (state) => {
  const past = [...state.history.past, snapshot(state)];
  if (past.length > LAYOUT_CONFIG.historyLimit) past.shift();
  return { past, future: [] };
};

export const diagramReducer = (state, action) => {
  switch (action.type) {
    case A.SET_MODE:
      return { ...state, mode: action.payload };

    case A.ADD_NODE:
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        history: pushHistory(state),
      };

    case A.UPDATE_NODE:
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload.patch } : n
        ),
      };

    case A.DELETE_NODE:
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.payload),
        edges: state.edges.filter(
          (e) => e.source !== action.payload && e.target !== action.payload
        ),
        selection: { type: null, id: null },
        history: pushHistory(state),
      };

    case A.ADD_EDGE:
      return {
        ...state,
        edges: [...state.edges, action.payload],
        history: pushHistory(state),
      };

    case A.UPDATE_EDGE:
      return {
        ...state,
        edges: state.edges.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.patch } : e
        ),
      };

    case A.DELETE_EDGE:
      return {
        ...state,
        edges: state.edges.filter((e) => e.id !== action.payload),
        selection: { type: null, id: null },
        history: pushHistory(state),
      };

    case A.REPLACE_NODES:
      return { ...state, nodes: action.payload };

    case A.SET_SELECTION:
      return { ...state, selection: action.payload };

    case A.SET_VIEW:
      return { ...state, view: action.payload };

    case A.SET_INTERACTION:
      return { ...state, interaction: action.payload };

    case A.SET_UI:
      return { ...state, ui: { ...state.ui, ...action.payload } };

    case A.COMMIT_HISTORY:
      return { ...state, history: pushHistory(state) };

    case A.UNDO: {
      const { past, future } = state.history;
      if (past.length === 0) return state;
      const prev = past[past.length - 1];
      return {
        ...state,
        nodes: prev.nodes,
        edges: prev.edges,
        selection: { type: null, id: null },
        history: {
          past: past.slice(0, -1),
          future: [snapshot(state), ...future],
        },
      };
    }

    case A.REDO: {
      const { past, future } = state.history;
      if (future.length === 0) return state;
      const next = future[0];
      return {
        ...state,
        nodes: next.nodes,
        edges: next.edges,
        selection: { type: null, id: null },
        history: {
          past: [...past, snapshot(state)],
          future: future.slice(1),
        },
      };
    }

    case A.LOAD_PROJECT: {
      const { nodes = [], edges = [], mode, showLabels } = action.payload;
      return {
        ...state,
        nodes,
        edges,
        mode: mode || state.mode,
        ui: {
          ...state.ui,
          showLabels: showLabels ?? state.ui.showLabels,
        },
        history: { past: [], future: [] },
        selection: { type: null, id: null },
      };
    }

    case A.RESET:
      return {
        ...initialState,
        mode: state.mode,
        ui: state.ui,
      };

    default:
      return state;
  }
};
