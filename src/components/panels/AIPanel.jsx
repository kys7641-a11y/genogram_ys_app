import React from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

export const AIPanel = ({ onClose, isLoading, result }) => (
  <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-30 border-l border-slate-200 flex flex-col animate-slide-in-right">
    <div className="p-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center">
      <h2 className="font-bold flex items-center gap-2">
        <Sparkles size={18} /> AI 분석 리포트
        <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded ml-1">
          DEMO
        </span>
      </h2>
      <button onClick={onClose} aria-label="AI 패널 닫기">
        <X size={18} className="opacity-80 hover:opacity-100" />
      </button>
    </div>
    <div className="flex-1 p-6 overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <span className="text-xs font-medium">데이터 분석 중입니다...</span>
        </div>
      ) : (
        <div className="prose prose-sm prose-indigo">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
            {result}
          </div>
        </div>
      )}
    </div>
  </div>
);
