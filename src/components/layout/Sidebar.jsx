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
    <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4 z-20 shadow-sm">
      <div className="p-2 bg-indigo-600 rounded-xl text-white mb-4 shadow-lg shadow-indigo-200">
        <BrainCircuit size={24} />
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        <Tooltip label="가계도 모드" position="right">
          <button
            onClick={() => setMode('genogram')}
            aria-label="가계도 모드"
            className={`w-full p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              mode === 'genogram'
                ? 'bg-slate-100 text-indigo-600 font-bold'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Users size={20} /> <span className="text-[10px]">가계도</span>
          </button>
        </Tooltip>
        <Tooltip label="생태도 모드" position="right">
          <button
            onClick={() => setMode('ecomap')}
            aria-label="생태도 모드"
            className={`w-full p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              mode === 'ecomap'
                ? 'bg-slate-100 text-emerald-600 font-bold'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Share2 size={20} /> <span className="text-[10px]">생태도</span>
          </button>
        </Tooltip>
      </div>

      <div className="w-10 h-px bg-slate-200 my-2" />

      {mode === 'genogram' ? (
        <>
          <Tooltip label="남성 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'male')}
              aria-label="남성 노드 추가"
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-400 transition-all"
            >
              <Square size={20} className="text-slate-600" />
            </button>
          </Tooltip>
          <Tooltip label="여성 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'female')}
              aria-label="여성 노드 추가"
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-400 transition-all"
            >
              <CircleIcon />
            </button>
          </Tooltip>
          <Tooltip label="태아 추가" position="right">
            <button
              onClick={() => onAddNode('family', 'pregnancy')}
              aria-label="태아 노드 추가"
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-400 transition-all"
            >
              <TriangleIcon size={20} className="text-slate-600" />
            </button>
          </Tooltip>
        </>
      ) : (
        <Tooltip label="체계 노드 추가" position="right">
          <button
            onClick={() => onAddNode('env')}
            aria-label="체계 노드 추가"
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-400 transition-all"
          >
            <LayoutTemplate size={20} className="text-slate-600" />
          </button>
        </Tooltip>
      )}

      <Tooltip label="관계 연결" position="right">
        <button
          onClick={onStartLinking}
          aria-label="관계 연결 시작"
          className={`p-3 border rounded-xl transition-all relative ${
            interaction.state === 'linking'
              ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
              : 'bg-white border-slate-200 hover:border-indigo-400'
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
          className={`p-3 rounded-xl transition-all ${
            snapEnabled ? 'bg-slate-200 text-slate-800' : 'text-slate-400'
          }`}
        >
          <Magnet size={20} />
        </button>
      </Tooltip>
      <Tooltip label="자동 정렬" position="right">
        <button
          onClick={onApplyAutoLayout}
          aria-label="자동 레이아웃"
          className="p-3 rounded-xl transition-all bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:scale-105 active:scale-95 shadow-sm"
        >
          <Wand2 size={20} />
        </button>
      </Tooltip>
      <Tooltip label={showLabels ? '관계선 라벨 숨기기' : '관계선 라벨 보기'} position="right">
        <button
          onClick={() => toggleUi({ showLabels: !showLabels })}
          aria-label="관계선 라벨 토글"
          className={`p-3 rounded-xl transition-all ${
            showLabels ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Tag size={20} />
        </button>
      </Tooltip>
      <Tooltip label="전체 초기화" position="right">
        <button
          onClick={onOpenReset}
          aria-label="전체 초기화"
          className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </Tooltip>
    </aside>
  );
};
