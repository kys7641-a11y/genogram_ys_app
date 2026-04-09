import React from 'react';
import { User, Link2, X, CheckCircle, Trash2 } from 'lucide-react';
import { useDiagram } from '../../state/DiagramContext';
import { ActionTypes as A } from '../../state/actions';
import { NodePropertyForm } from './NodePropertyForm';
import { EdgePropertyForm } from './EdgePropertyForm';

export const PropertyPanel = ({ onDelete }) => {
  const { state, dispatch } = useDiagram();
  const { selection, nodes, edges, mode } = state;

  const node =
    selection.type === 'node' ? nodes.find((n) => n.id === selection.id) : null;
  const edge =
    selection.type === 'edge' ? edges.find((e) => e.id === selection.id) : null;
  if (!node && !edge) return null;

  const close = () =>
    dispatch({ type: A.SET_SELECTION, payload: { type: null, id: null } });

  return (
    <aside className="w-80 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col animate-slide-in-right">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          {node ? <User size={18} /> : <Link2 size={18} />}{' '}
          {node ? '속성 편집' : '관계 설정'}
        </h2>
        <button onClick={close} aria-label="패널 닫기">
          <X size={16} className="text-slate-400 hover:text-slate-600" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {node ? (
          <NodePropertyForm node={node} dispatch={dispatch} />
        ) : (
          <EdgePropertyForm
            edge={edge}
            nodes={nodes}
            mode={mode}
            dispatch={dispatch}
          />
        )}
      </div>

      <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
        <button
          onClick={close}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <CheckCircle size={16} /> 편집 완료
        </button>
        <button
          onClick={onDelete}
          className="w-full py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> 삭제하기
        </button>
      </div>
    </aside>
  );
};
