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
    <aside className="mr-6 my-4 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl z-20 flex flex-col animate-slide-in-right transition-all duration-200">
      <div className="p-5 border-b border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          {node ? <User size={18} className="text-indigo-500" /> : <Link2 size={18} className="text-indigo-500" />}{' '}
          {node ? '속성 편집' : '관계 설정'}
        </h2>
        <button onClick={close} aria-label="패널 닫기">
          <X size={16} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin">
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

      <div className="p-5 border-t border-slate-100/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 rounded-b-2xl space-y-2">
        <button
          onClick={close}
          className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <CheckCircle size={16} /> 편집 완료
        </button>
        <button
          onClick={onDelete}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-450 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-350 dark:hover:border-rose-900/50 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> 삭제하기
        </button>
      </div>
    </aside>
  );
};
