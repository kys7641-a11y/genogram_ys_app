import React from 'react';
import {
  Undo, Redo, Sparkles, FolderOpen, Save, Image as ImageIcon,
} from 'lucide-react';
import { useDiagram } from '../../state/DiagramContext';
import { ActionTypes as A } from '../../state/actions';
import { APP_VERSION } from '../../constants/layout';
import { Tooltip } from '../ui/Tooltip';

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
          <Tooltip label="실행 취소 (Ctrl+Z)" position="bottom">
            <button
              onClick={() => dispatch({ type: A.UNDO })}
              disabled={!canUndo}
              aria-label="실행 취소"
              className={`p-1.5 rounded-md transition-colors ${
                !canUndo
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Undo size={18} />
            </button>
          </Tooltip>
          <Tooltip label="다시 실행 (Ctrl+Y)" position="bottom">
            <button
              onClick={() => dispatch({ type: A.REDO })}
              disabled={!canRedo}
              aria-label="다시 실행"
              className={`p-1.5 rounded-md transition-colors ${
                !canRedo
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Redo size={18} />
            </button>
          </Tooltip>
        </div>
        <div className="h-4 w-px bg-slate-300 mx-2" />
        <Tooltip label="AI로 가족 관계 분석" position="bottom">
          <button
            onClick={onRunAIAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-bold"
          >
            <Sparkles size={16} /> AI 분석
          </button>
        </Tooltip>
        <div className="h-4 w-px bg-slate-300 mx-2" />
        <Tooltip label="프로젝트 불러오기" position="bottom">
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로젝트 불러오기"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <FolderOpen size={18} />
          </button>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onLoadProject}
          className="hidden"
          accept=".json"
        />
        <Tooltip label="프로젝트 저장" position="bottom">
          <button
            onClick={onSaveProject}
            aria-label="프로젝트 저장"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Save size={18} />
          </button>
        </Tooltip>
        <Tooltip label="이미지 다운로드" position="bottom">
          <button
            onClick={onDownloadImage}
            aria-label="이미지 다운로드"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ImageIcon size={18} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
