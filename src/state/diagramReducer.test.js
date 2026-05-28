import { describe, it, expect } from 'vitest';
import { diagramReducer, initialState } from './diagramReducer';
import { ActionTypes as A } from './actions';

describe('Diagram Reducer', () => {
  it('should return initial state when action type is unknown', () => {
    const result = diagramReducer(initialState, { type: 'UNKNOWN_ACTION' });
    expect(result).toBe(initialState);
  });

  it('should add a node and push to history', () => {
    const newNode = { id: 'n1', type: 'family', x: 100, y: 100, name: 'Test' };
    const action = { type: A.ADD_NODE, payload: newNode };
    
    const state = diagramReducer(initialState, action);

    expect(state.nodes).toHaveLength(1);
    expect(state.nodes[0]).toEqual(newNode);
    expect(state.history.past).toHaveLength(1);
    expect(state.history.past[0].nodes).toHaveLength(0); // initial snapshot was empty
  });

  it('should delete a node and cascade-delete connected edges', () => {
    const startState = {
      ...initialState,
      nodes: [
        { id: 'n1', type: 'family' },
        { id: 'n2', type: 'family' },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'marriage' },
      ],
      selection: { type: 'node', id: 'n1' },
      history: { past: [], future: [] },
    };

    const action = { type: A.DELETE_NODE, payload: 'n1' };
    const state = diagramReducer(startState, action);

    expect(state.nodes).toHaveLength(1);
    expect(state.nodes[0].id).toBe('n2');
    expect(state.edges).toHaveLength(0); // e1 is cascade deleted
    expect(state.selection).toEqual({ type: null, id: null });
    expect(state.history.past).toHaveLength(1);
  });

  it('should update edge properties (e.g. bendOffset, isCurve)', () => {
    const startState = {
      ...initialState,
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'marriage', bendOffset: 0, isCurve: false },
      ],
    };

    const action = {
      type: A.UPDATE_EDGE,
      payload: { id: 'e1', patch: { bendOffset: 45, isCurve: true } },
    };
    const state = diagramReducer(startState, action);

    expect(state.edges[0].bendOffset).toBe(45);
    expect(state.edges[0].isCurve).toBe(true);
  });

  it('should support undo and redo operations', () => {
    // 1. Initial State
    let state = { ...initialState };
    
    // 2. Add Node (History length becomes 1)
    state = diagramReducer(state, {
      type: A.ADD_NODE,
      payload: { id: 'n1', type: 'family' },
    });
    
    // 3. Add Another Node (History length becomes 2)
    state = diagramReducer(state, {
      type: A.ADD_NODE,
      payload: { id: 'n2', type: 'family' },
    });

    expect(state.nodes).toHaveLength(2);
    expect(state.history.past).toHaveLength(2);

    // 4. Undo (Back to 1 node)
    state = diagramReducer(state, { type: A.UNDO });
    expect(state.nodes).toHaveLength(1);
    expect(state.history.past).toHaveLength(1);
    expect(state.history.future).toHaveLength(1);

    // 5. Redo (Back to 2 nodes)
    state = diagramReducer(state, { type: A.REDO });
    expect(state.nodes).toHaveLength(2);
    expect(state.history.past).toHaveLength(2);
    expect(state.history.future).toHaveLength(0);
  });
});
