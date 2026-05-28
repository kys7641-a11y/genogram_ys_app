import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { RELATION_CONFIG } from '../../constants/relations';
import { ActionTypes as A } from '../../state/actions';

export const EdgePropertyForm = ({ edge, nodes, mode, dispatch }) => {
  const relations =
    mode === 'genogram'
      ? Object.values(RELATION_CONFIG.GENOGRAM)
      : Object.values(RELATION_CONFIG.ECOMAP);

  const bendOffset = edge.bendOffset || 0;

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
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">관계 유형 선택</label>
        <div className="grid grid-cols-1 gap-2">
          {relations.map((conf) => (
            <button
              key={conf.id}
              onClick={() => applyType(conf)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                edge.type === conf.id
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 ring-1 ring-indigo-500 dark:ring-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                style={{ backgroundColor: conf.color }}
              />
              <div className="text-sm font-bold">{conf.label}</div>
            </button>
          ))}
        </div>
      </div>

      {edge.direction !== 'both' && (
        <div className="pt-1">
          <button
            onClick={swapDirection}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all text-xs border border-slate-200/50 dark:border-slate-750"
          >
            <ArrowRightLeft size={14} /> 연결 방향 반전
          </button>
        </div>
      )}

      {mode === 'ecomap' && (
        <div className="pt-4 border-t border-slate-100/60 dark:border-slate-800/60">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">
            방향성
          </label>
          <div className="flex gap-2">
            {['none', 'single', 'both'].map((dir) => (
              <button
                key={dir}
                onClick={() => setDirection(dir)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  edge.direction === dir
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {dir === 'none' ? '없음' : dir === 'single' ? '단방향' : '양방향'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Curve and Bend Offset Adjustment */}
      <div className="pt-4 border-t border-slate-100/60 dark:border-slate-800/60 space-y-4">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
          선 세부 설정
        </label>
        
        {edge.type !== 'parent-child' && edge.type !== 'siblings' && (
          <button
            onClick={() => {
              dispatch({
                type: A.UPDATE_EDGE,
                payload: { id: edge.id, patch: { isCurve: !edge.isCurve } },
              });
              dispatch({ type: A.COMMIT_HISTORY });
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              edge.isCurve
                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={!!edge.isCurve}
              readOnly
              className="rounded text-indigo-600 dark:text-indigo-500 focus:ring-indigo-550 h-4 w-4 pointer-events-none"
            />
            <span className="text-sm font-medium">부드러운 곡선 적용</span>
          </button>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>꺾임 / 휘어짐 조절</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
              {Math.round(bendOffset)}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="-150"
              max="150"
              value={bendOffset}
              onChange={(e) => {
                dispatch({
                  type: A.UPDATE_EDGE,
                  payload: {
                    id: edge.id,
                    patch: { bendOffset: parseInt(e.target.value, 10) },
                  },
                });
              }}
              onMouseUp={() => dispatch({ type: A.COMMIT_HISTORY })}
              onTouchEnd={() => dispatch({ type: A.COMMIT_HISTORY })}
              className="flex-1 accent-indigo-600 dark:accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => {
                dispatch({
                  type: A.UPDATE_EDGE,
                  payload: { id: edge.id, patch: { bendOffset: 0 } },
                });
                dispatch({ type: A.COMMIT_HISTORY });
              }}
              className="px-2.5 py-1 text-[10px] bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-lg transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
