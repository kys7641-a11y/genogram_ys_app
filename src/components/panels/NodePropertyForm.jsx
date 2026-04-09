import React from 'react';
import {
  CheckSquare, Skull, Home, MinusCircle, PlusCircle, Type,
} from 'lucide-react';
import { THEME_CONFIG, CURRENT_YEAR } from '../../constants/theme';
import { ActionTypes as A } from '../../state/actions';

export const NodePropertyForm = ({ node, dispatch }) => {
  const update = (patch) =>
    dispatch({ type: A.UPDATE_NODE, payload: { id: node.id, patch } });
  const commit = () => dispatch({ type: A.COMMIT_HISTORY });

  const updateFontSize = (delta) => {
    const current = node.fontSize || THEME_CONFIG.sizes.defaultFont;
    update({ fontSize: Math.max(10, Math.min(40, current + delta)) });
    commit();
  };

  const toggle = (key) => {
    update({ [key]: !node[key] });
    commit();
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500">이름 / 명칭</label>
        <input
          value={node.name}
          onChange={(e) => update({ name: e.target.value })}
          onBlur={commit}
          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
          <span>텍스트 크기</span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            {node.fontSize || THEME_CONFIG.sizes.defaultFont}px
          </span>
        </label>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => updateFontSize(-2)}
            aria-label="텍스트 작게"
            className="p-2 hover:bg-white rounded-md text-slate-500 transition-all shadow-sm"
          >
            <MinusCircle size={16} />
          </button>
          <div className="flex-1 text-center text-xs font-bold text-slate-400">
            <Type size={14} className="inline mx-1" /> Size
          </div>
          <button
            onClick={() => updateFontSize(2)}
            aria-label="텍스트 크게"
            className="p-2 hover:bg-white rounded-md text-indigo-500 transition-all shadow-sm"
          >
            <PlusCircle size={16} />
          </button>
        </div>
      </div>

      {node.type === 'family' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500">출생년도</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={node.birthYear ?? ''}
              onChange={(e) =>
                update({
                  birthYear: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              onBlur={commit}
              className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
            />
            <div className="flex items-center justify-center bg-slate-100 rounded-lg px-3 text-xs text-slate-500 font-bold">
              {node.birthYear != null ? `${CURRENT_YEAR - node.birthYear}세` : '-'}
            </div>
          </div>
        </div>
      )}

      {node.type === 'family' && (
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="text-xs font-bold text-slate-500 block mb-2">
            상태 설정
          </label>
          <button
            onClick={() => toggle('isIndex')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              node.isIndex
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckSquare size={16} />{' '}
            <span className="text-sm font-medium">클라이언트</span>
          </button>
          <button
            onClick={() => toggle('isDeceased')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              node.isDeceased
                ? 'border-slate-600 bg-slate-100 text-slate-800'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Skull size={16} /> <span className="text-sm font-medium">사망</span>
          </button>
          <button
            onClick={() => toggle('isCohabiting')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              node.isCohabiting
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Home size={16} />{' '}
            <span className="text-sm font-medium">동거 가족</span>
          </button>
        </div>
      )}
    </>
  );
};
