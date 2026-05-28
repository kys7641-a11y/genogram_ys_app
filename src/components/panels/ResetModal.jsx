import React from 'react';
import { Trash2 } from 'lucide-react';

export const ResetModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-2xl w-80 text-center space-y-4">
      <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
        <Trash2 size={24} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">전체 초기화</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          모든 데이터가 삭제되며 복구할 수 없습니다.
          <br />
          정말 초기화하시겠습니까?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={onCancel}
          className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-sm transition-all"
        >
          초기화
        </button>
      </div>
    </div>
  </div>
);
