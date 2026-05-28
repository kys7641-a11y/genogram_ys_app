import React from 'react';
import {
  Undo, Redo, FolderOpen, Save, Image as ImageIcon, Sun, Moon,
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
  theme,
  onToggleTheme,
}) => {
  const { state, dispatch } = useDiagram();
  const { mode, history } = state;

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <header className="mx-6 mt-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex items-center justify-between px-6 z-10 shadow-sm transition-all duration-200">
      <h1 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
        {mode === 'genogram' ? '가계도 제작기' : '생태도 제작기'}
        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
          Pro v{APP_VERSION}
        </span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl">
          <Tooltip label="실행 취소 (Ctrl+Z)" position="bottom">
            <button
              onClick={() => dispatch({ type: A.UNDO })}
              disabled={!canUndo}
              aria-label="실행 취소"
              className={`p-1.5 rounded-lg transition-colors ${
                !canUndo
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
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
              className={`p-1.5 rounded-lg transition-colors ${
                !canRedo
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
              }`}
            >
              <Redo size={18} />
            </button>
          </Tooltip>
        </div>
        <div className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60 mx-2" />
        <Tooltip label="프로젝트 불러오기" position="bottom">
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로젝트 불러오기"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Save size={18} />
          </button>
        </Tooltip>
        <Tooltip label="이미지 다운로드" position="bottom">
          <button
            onClick={onDownloadImage}
            aria-label="이미지 다운로드"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ImageIcon size={18} />
          </button>
        </Tooltip>
        <div className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60 mx-2" />
        <Tooltip label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'} position="bottom">
          <button
            onClick={onToggleTheme}
            aria-label="테마 전환"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl hover:scale-105 active:scale-95 transition-all"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
