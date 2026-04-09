import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { RELATION_CONFIG } from '../../constants/relations';
import { ActionTypes as A } from '../../state/actions';

export const EdgePropertyForm = ({ edge, nodes, mode, dispatch }) => {
  const relations =
    mode === 'genogram'
      ? Object.values(RELATION_CONFIG.GENOGRAM)
      : Object.values(RELATION_CONFIG.ECOMAP);

  const applyType = (conf) => {
    let patch = { type: conf.id };
    if (conf.id === 'parent-child') {
      const sn = nodes.find((n) => n.id === edge.source);
      const tn = nodes.find((n) => n.id === edge.target);
      if (sn && tn && sn.y > tn.y) {
        patch = { ...patch, source: edge.target, target: edge.source };
      }
    }
    dispatch({ type: A.UPDATE_EDGE, payload: { id: edge.id, patch } });
    dispatch({ type: A.COMMIT_HISTORY });
  };

  const swapDirection = () => {
    dispatch({
      type: A.UPDATE_EDGE,
      payload: { id: edge.id, patch: { source: edge.target, target: edge.source } },
    });
    dispatch({ type: A.COMMIT_HISTORY });
  };

  const setDirection = (dir) => {
    dispatch({
      type: A.UPDATE_EDGE,
      payload: { id: edge.id, patch: { direction: dir } },
    });
    dispatch({ type: A.COMMIT_HISTORY });
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold text-slate-500">관계 유형 선택</label>
      <div className="grid grid-cols-1 gap-2">
        {relations.map((conf) => (
          <button
            key={conf.id}
            onClick={() => applyType(conf)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              edge.type === conf.id
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: conf.color }}
            />
            <div className="text-sm font-bold text-slate-700">{conf.label}</div>
          </button>
        ))}
      </div>

      {edge.direction !== 'both' && (
        <div className="pt-2">
          <button
            onClick={swapDirection}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs border border-slate-200"
          >
            <ArrowRightLeft size={14} /> 연결 방향 반전
          </button>
        </div>
      )}

      {mode === 'ecomap' && (
        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-500 mb-2 block">
            방향성
          </label>
          <div className="flex gap-2">
            {['none', 'single', 'both'].map((dir) => (
              <button
                key={dir}
                onClick={() => setDirection(dir)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                  edge.direction === dir
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {dir === 'none' ? '없음' : dir === 'single' ? '단방향' : '양방향'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
