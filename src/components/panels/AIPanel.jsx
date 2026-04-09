import React, { useState } from 'react';
import { Sparkles, X, Loader2, ChevronDown, AlertCircle, Settings } from 'lucide-react';

const MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: '최신 · 빠름 · 추천' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: '최신 · 최고 성능' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: '안정적 · 무료 티어' },
  { id: 'gemma-3-27b-it', label: 'Gemma 3 27B', desc: '오픈소스 모델' },
  { id: '__custom__', label: '직접 입력', desc: '모델 ID를 직접 입력' },
];

const MODEL_STORAGE = 'genogram_google_model';

const renderResult = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (/^\*\*(.+)\*\*/.test(line)) {
      return <p key={i} className="font-bold text-slate-800 mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <p key={i} className="text-slate-600 text-sm pl-3 before:content-['•'] before:mr-2 before:text-indigo-400">{line.slice(2)}</p>;
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return <p key={i} className="text-slate-700 text-sm leading-relaxed">{line}</p>;
  });
};

export const AIPanel = ({ onClose, onRunAnalysis, isLoading, result, error }) => {
  const [modelId, setModelId] = useState(() => localStorage.getItem(MODEL_STORAGE) || 'gemini-2.5-flash');
  const [customModel, setCustomModel] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const resolvedModelId = modelId === '__custom__' ? customModel.trim() : modelId;

  const handleModelChange = (val) => {
    setModelId(val);
    localStorage.setItem(MODEL_STORAGE, val);
  };

  const handleRun = () => {
    onRunAnalysis({ modelId: resolvedModelId || 'gemini-2.0-flash' });
  };

  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-30 border-l border-slate-200 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center flex-shrink-0">
        <h2 className="font-bold flex items-center gap-2 text-sm">
          <Sparkles size={16} /> AI 분석 리포트
          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded ml-1 uppercase">
            {modelId === '__custom__' ? (customModel || '직접 입력') : selectedModel.label}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="opacity-70 hover:opacity-100 transition-opacity"
            title="모델 설정"
          >
            <Settings size={15} />
          </button>
          <button onClick={onClose} aria-label="닫기" className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Model Settings */}
      {showSettings && (
        <div className="border-b border-slate-200 bg-slate-50 p-4 flex-shrink-0 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">모델 설정</p>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">분석 모델 선택</label>
            <div className="relative">
              <select
                value={modelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label} — {m.desc}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {modelId === '__custom__' && (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="예: gemini-2.5-pro-preview-06-05"
                className="w-full mt-2 text-xs border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-mono"
              />
            )}
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-full text-xs py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            확인
          </button>
        </div>
      )}

      {/* Run Button */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={handleRun}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {isLoading ? (
            <><Loader2 size={15} className="animate-spin" /> 분석 중...</>
          ) : (
            <><Sparkles size={15} /> {result ? '다시 분석' : '분석 실행'}</>
          )}
        </button>
      </div>

      {/* Result */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!result && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
            <Sparkles size={28} />
            <p className="text-xs">분석 실행 버튼을 눌러주세요</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
            <p className="text-xs">가계도를 분석하고 있습니다...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-0.5">
            {renderResult(result)}
          </div>
        )}
      </div>
    </div>
  );
};
