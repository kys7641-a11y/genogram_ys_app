import React from 'react';
import { Heart, Square, Trash2 } from 'lucide-react';
import { CircleIcon } from '../icons/CircleIcon';

export const ContextMenu = ({ ctx, mode, onSmartAdd, onDelete }) => {
  if (!ctx.visible) return null;
  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden min-w-[160px]"
      style={{ left: ctx.x, top: ctx.y }}
    >
      <div className="p-1">
        {mode === 'genogram' && (
          <>
            <button
              onClick={() => onSmartAdd(ctx.nodeId, 'spouse')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
            >
              <Heart size={14} className="text-rose-400" /> 배우자 추가
            </button>
            <button
              onClick={() => onSmartAdd(ctx.nodeId, 'child', 'male')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
            >
              <Square size={14} className="text-blue-500" /> 아들 추가
            </button>
            <button
              onClick={() => onSmartAdd(ctx.nodeId, 'child', 'female')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
            >
              <CircleIcon size={14} className="text-pink-500" /> 딸 추가
            </button>
            <div className="h-px bg-slate-100 my-1" />
          </>
        )}
        <button
          onClick={onDelete}
          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
        >
          <Trash2 size={14} /> 삭제
        </button>
      </div>
    </div>
  );
};
