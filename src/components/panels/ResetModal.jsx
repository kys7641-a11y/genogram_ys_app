import React from 'react';
import { Trash2 } from 'lucide-react';

export const ResetModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 text-center space-y-4">
      <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
        <Trash2 size={24} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-800">전체 초기화</h3>
        <p className="text-xs text-slate-500 mt-1">
          모든 데이터가 삭제되며 복구할 수 없습니다.
          <br />
          정말 초기화하시겠습니까?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={onCancel}
          className="py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600"
        >
          초기화
        </button>
      </div>
    </div>
  </div>
);
