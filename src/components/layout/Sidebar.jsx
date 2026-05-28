import React from 'react';
import {
  Users, Share2, Square, Link2, Magnet, Wand2, Tag, RotateCcw, LayoutTemplate,
  BrainCircuit,
} from 'lucide-react';
import { CircleIcon } from '../icons/CircleIcon';
import { TriangleIcon } from '../icons/TriangleIcon';
import { useDiagram } from '../../state/DiagramContext';
import { ActionTypes as A } from '../../state/actions';
import { Tooltip } from '../ui/Tooltip';

export const Sidebar = ({
  onAddNode,
  onStartLinking,
  onApplyAutoLayout,
  onOpenReset,
}) => {
  const { state, dispatch } = useDiagram();
  const { mode, ui, interaction } = state;
  const { snapEnabled, showLabels } = ui;

  const setMode = (m) => dispatch({ type: A.SET_MODE, payload: m });
  const toggleUi = (patch) => dispatch({ type: A.SET_UI, payload: patch });

  return (
    <aside className="ml-6 my-4 w-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col items-center py-6 gap-4 z-20 shadow-sm transition-all duration-200">
      <div className="p-2 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white mb-4 shadow-lg shadow-indigo-100 dark:shadow-none hover:rotate-12 transition-transform duration-300">
        <BrainCircuit size={24} />
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        <Tooltip label="가계도 모드" position="right">
          <button
            onClick={() => setMode('genogram')}
            aria-label="가계도 모드"
            className={`w-full py-3.5 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
              mode === 'genogram'
                ? 'bg-slate-100/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users size={20} /> <span className="text-[9px] font-semibold">가계도</span>
          </button>
        </Tooltip>
        <Tooltip label="생태도 모드" position="right">
          <button
            onClick={() => setMode('ecomap')}
            aria-label="생태도 모드"
            className={`w-full py-3.5 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
              mode === 'ecomap'
                ? 'bg-slate-100/80 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Share2 size={20} /> <span className="text-[9px] font-semibold">생태도</span>
          </button>
        </Tooltip>
      </div>

      <div className="w-10 h-px bg-slate-200/60 dark:bg-slate-800/60 my-1" />

      {mode === 'genogram' ? (
        <>
          <Tooltip label="남성 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'male')}
              aria-label="남성 노드 추가"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
            >
              <Square size={20} />
            </button>
          </Tooltip>
          <Tooltip label="여성 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'female')}
              aria-label="여성 노드 추가"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
            >
              <CircleIcon />
            </button>
          </Tooltip>
          <Tooltip label="태아 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'pregnancy')}
              aria-label="태아 노드 추가"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
            >
              <TriangleIcon size={20} />
            </button>
          </Tooltip>
        </>
      ) : (
        <Tooltip label="체계 노드 추가" position="right">
          <button
            onClick={() => onAddNode('env')}
            aria-label="체계 노드 추가"
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
          >
            <LayoutTemplate size={20} />
          </button>
        </Tooltip>
      )}

      <Tooltip label="관계 연결" position="right">
        <button
          onClick={onStartLinking}
          aria-label="관계 연결 시작"
          className={`p-3 border rounded-xl hover:scale-105 active:scale-95 transition-all relative ${
            interaction.state === 'linking'
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 animate-pulse'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
        >
          <Link2 size={20} />
        </button>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip label={snapEnabled ? '그리드 스냅 켜짐' : '그리드 스냅 꺼짐'} position="right">
        <button
          onClick={() => toggleUi({ snapEnabled: !snapEnabled })}
          aria-label="그리드 스냅 토글"
          className={`p-3 rounded-xl hover:scale-105 active:scale-95 transition-all ${
            snapEnabled
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
              : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <Magnet size={20} />
        </button>
      </Tooltip>
      <Tooltip label="자동 정렬" position="right">
        <button
          onClick={onApplyAutoLayout}
          aria-label="자동 레이아웃"
          className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/85 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all border border-indigo-100/50 dark:border-indigo-900/30"
        >
          <Wand2 size={20} />
        </button>
      </Tooltip>
      <Tooltip label={showLabels ? '관계선 라벨 숨기기' : '관계선 라벨 보기'} position="right">
        <button
          onClick={() => toggleUi({ showLabels: !showLabels })}
          aria-label="관계선 라벨 토글"
          className={`p-3 rounded-xl hover:scale-105 active:scale-95 transition-all ${
            showLabels
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
              : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <Tag size={20} />
        </button>
      </Tooltip>
      <Tooltip label="전체 초기화" position="right">
        <button
          onClick={onOpenReset}
          aria-label="전체 초기화"
          className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:scale-105 active:scale-95 transition-all border border-rose-100/30 dark:border-rose-900/20"
        >
          <RotateCcw size={20} />
        </button>
      </Tooltip>
    </aside>
  );
};
