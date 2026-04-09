import React from 'react';
import { Link2, Heart, Square, Trash2 } from 'lucide-react';
import { CircleIcon } from '../icons/CircleIcon';

export const QuickActionToolbar = ({
  node,
  view,
  mode,
  onStartLinking,
  onSmartAdd,
  onDelete,
}) => {
  if (!node) return null;
  return (
    <div
      className="absolute z-50 flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: node.x * view.scale + view.x,
        top:
          node.y * view.scale + view.y - (node.type === 'family' ? 60 : 50),
        transform: 'translate(-50%, -100%)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-800 text-white rounded-full p-1.5 shadow-xl flex items-center gap-1 border border-slate-600">
        <button
          onClick={onStartLinking}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors flex items-center gap-1 text-xs font-bold px-3"
        >
          <Link2 size={14} className="text-indigo-400" /> 관계 연결
        </button>

        {mode === 'genogram' && node.type === 'family' && (
          <>
            <div className="w-px h-4 bg-slate-600 mx-1" />
            <button
              onClick={() => onSmartAdd(node.id, 'spouse')}
              aria-label="배우자 추가"
              className="p-2 hover:bg-slate-700 rounded-full text-rose-300 transition-colors"
            >
              <Heart size={16} />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1" />
            <button
              onClick={() => onSmartAdd(node.id, 'child', 'male')}
              aria-label="아들 추가"
              className="p-2 hover:bg-slate-700 rounded-full text-blue-300 transition-colors"
            >
              <Square size={14} className="fill-current" />
            </button>
            <button
              onClick={() => onSmartAdd(node.id, 'child', 'female')}
              aria-label="딸 추가"
              className="p-2 hover:bg-slate-700 rounded-full text-pink-300 transition-colors"
            >
              <CircleIcon size={14} className="fill-current" />
            </button>
          </>
        )}

        <div className="w-px h-4 bg-slate-600 mx-1" />
        <button
          onClick={onDelete}
          aria-label="삭제"
          className="p-2 hover:bg-slate-700 rounded-full text-rose-500 hover:text-rose-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
    </div>
  );
};
