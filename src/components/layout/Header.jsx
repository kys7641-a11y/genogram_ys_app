import React from 'react';
import {
  Undo, Redo, Sparkles, FolderOpen, Save, Image as ImageIcon,
} from 'lucide-react';
import { useDiagram } from '../../state/DiagramContext';
import { ActionTypes as A } from '../../state/actions';
import { APP_VERSION } from '../../constants/layout';

export const Header = ({
  fileInputRef,
  onLoadProject,
  onSaveProject,
  onDownloadImage,
  onRunAIAnalysis,
}) => {
  const { state, dispatch } = useDiagram();
  const { mode, history } = state;

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
      <h1 className="font-bold text-slate-700 text-lg flex items-center gap-2">
        {mode === 'genogram' ? '가계도 프로젝트' : '생태도 프로젝트'}
        <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">
          Pro v{APP_VERSION}
        </span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => dispatch({ type: A.UNDO })}
            disabled={!canUndo}
            aria-label="실행 취소"
            className={`p-1.5 rounded-md transition-colors ${
              !canUndo
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-white hover:shadow-sm'
            }`}
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => dispatch({ type: A.REDO })}
            disabled={!canRedo}
            aria-label="다시 실행"
            className={`p-1.5 rounded-md transition-colors ${
              !canRedo
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-white hover:shadow-sm'
            }`}
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>
        <div className="h-4 w-px bg-slate-300 mx-2" />
        <button
          onClick={onRunAIAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold"
        >
          <Sparkles size={16} /> AI 분석
          <span className="text-[9px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded ml-1">
            DEMO
          </span>
        </button>
        <div className="h-4 w-px bg-slate-300 mx-2" />
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="프로젝트 불러오기"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          title="프로젝트 불러오기"
        >
          <FolderOpen size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onLoadProject}
          className="hidden"
          accept=".json"
        />
        <button
          onClick={onSaveProject}
          aria-label="프로젝트 저장"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          title="프로젝트 저장"
        >
          <Save size={18} />
        </button>
        <button
          onClick={onDownloadImage}
          aria-label="이미지 다운로드"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          title="이미지 다운로드"
        >
          <ImageIcon size={18} />
        </button>
      </div>
    </header>
  );
};
