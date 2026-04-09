import React, { useRef, useCallback, useState } from 'react';
import { DiagramProvider, useDiagram } from './state/DiagramContext';
import { ActionTypes as A } from './state/actions';
import { CURRENT_YEAR, THEME_CONFIG } from './constants/theme';
import { STORAGE_KEY, APP_VERSION } from './constants/layout';
import { snapToGrid } from './utils/geometry';
import { applyAutoLayout } from './utils/autoLayout';
import { downloadSvgAsPng } from './utils/exportImage';
import { analyzeDiagram } from './services/aiAnalysis';
import { usePersistence } from './hooks/usePersistence';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Canvas } from './components/canvas/Canvas';
import { QuickActionToolbar } from './components/canvas/QuickActionToolbar';
import { PropertyPanel } from './components/panels/PropertyPanel';
import { AIPanel } from './components/panels/AIPanel';
import { ContextMenu } from './components/panels/ContextMenu';
import { ResetModal } from './components/panels/ResetModal';

const AppInner = () => {
  const { state, dispatch } = useDiagram();
  const { nodes, edges, mode, view, selection, interaction, ui } = state;

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  usePersistence(state, dispatch);

  // ------- Actions -------
  const addNode = useCallback(
    (type, gender = 'none', x = null, y = null) => {
      const cx =
        x != null
          ? x
          : (-view.x + (svgRef.current?.clientWidth || 800) / 2) / view.scale;
      const cy =
        y != null
          ? y
          : (-view.y + (svgRef.current?.clientHeight || 600) / 2) / view.scale;

      const defaultName =
        type === 'family'
          ? gender === 'male'
            ? '남성'
            : gender === 'female'
            ? '여성'
            : gender === 'pregnancy'
            ? '태아'
            : '체계'
          : '체계';

      const newNode = {
        id: `n_${Date.now()}`,
        type,
        gender,
        x: ui.snapEnabled ? snapToGrid(cx) : cx,
        y: ui.snapEnabled ? snapToGrid(cy) : cy,
        name: defaultName,
        birthYear: type === 'family' ? CURRENT_YEAR - 30 : null,
        fontSize: THEME_CONFIG.sizes.defaultFont,
        isIndex: nodes.length === 0 && type === 'family',
        isDeceased: false,
        isCohabiting: false,
      };

      dispatch({ type: A.ADD_NODE, payload: newNode });
      dispatch({
        type: A.SET_SELECTION,
        payload: { type: 'node', id: newNode.id },
      });
      return newNode;
    },
    [view, ui.snapEnabled, nodes.length, dispatch]
  );

  const smartAddNode = useCallback(
    (sourceId, relationType, specificGender = null) => {
      const sourceNode = nodes.find((n) => n.id === sourceId);
      if (!sourceNode) return;

      let targetX = sourceNode.x;
      let targetY = sourceNode.y;
      let newGender =
        sourceNode.gender === 'male' ? 'female' : 'male';
      let linkType = 'marriage';

      if (relationType === 'spouse') {
        targetX += 150;
      } else if (relationType === 'child') {
        targetY += 150;
        newGender = specificGender || 'male';
        linkType = 'parent-child';
      }

      let attempt = 0;
      while (attempt < 5) {
        if (
          !nodes.some(
            (n) => Math.abs(n.x - targetX) < 60 && Math.abs(n.y - targetY) < 60
          )
        )
          break;
        targetX += 80;
        attempt++;
      }

      const newNode = addNode('family', newGender, targetX, targetY);
      const newEdge = {
        id: `e_${Date.now()}`,
        source: sourceId,
        target: newNode.id,
        type: linkType,
        direction: 'none',
      };
      dispatch({ type: A.ADD_EDGE, payload: newEdge });
      dispatch({
        type: A.SET_UI,
        payload: {
          contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
        },
      });
    },
    [nodes, addNode, dispatch]
  );

  const deleteSelection = useCallback(() => {
    if (selection.id) {
      if (selection.type === 'node') {
        dispatch({ type: A.DELETE_NODE, payload: selection.id });
      } else {
        dispatch({ type: A.DELETE_EDGE, payload: selection.id });
      }
    } else if (ui.contextMenu.nodeId) {
      dispatch({ type: A.DELETE_NODE, payload: ui.contextMenu.nodeId });
    }
    dispatch({
      type: A.SET_UI,
      payload: { contextMenu: { visible: false, x: 0, y: 0, nodeId: null } },
    });
  }, [selection, ui.contextMenu.nodeId, dispatch]);

  useKeyboardShortcuts(state, dispatch, { onDelete: deleteSelection });

  const handleApplyAutoLayout = useCallback(() => {
    const { nodes: next, changed } = applyAutoLayout(nodes, {
      snapEnabled: ui.snapEnabled,
    });
    if (changed) {
      dispatch({ type: A.REPLACE_NODES, payload: next });
      dispatch({ type: A.COMMIT_HISTORY });
    }
  }, [nodes, ui.snapEnabled, dispatch]);

  const startLinking = useCallback(() => {
    if (selection.type === 'node') {
      dispatch({
        type: A.SET_INTERACTION,
        payload: { state: 'linking', data: { sourceId: selection.id } },
      });
    } else {
      alert('연결할 시작 노드를 먼저 선택해주세요.');
    }
  }, [selection, dispatch]);

  const [aiError, setAiError] = useState('');

  const runAIAnalysis = useCallback(async ({ apiKey, modelId } = {}) => {
    setAiLoading(true);
    setAiResult('');
    setAiError('');
    try {
      const report = await analyzeDiagram({ nodes, edges, mode, apiKey, modelId });
      setAiResult(report);
    } catch (e) {
      setAiError(e.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  }, [nodes, edges, mode]);

  const saveProject = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            nodes,
            edges,
            mode,
            showLabels: ui.showLabels,
            version: APP_VERSION,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genogram_v${APP_VERSION}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, mode, ui.showLabels]);

  const handleLoadProject = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          dispatch({ type: A.LOAD_PROJECT, payload: data });
        } catch (err) {
          alert('파일 로드 오류');
        }
      };
      reader.readAsText(file);
      e.target.value = null;
    },
    [dispatch]
  );

  const downloadImage = useCallback(async () => {
    try {
      await downloadSvgAsPng(svgRef.current, `genogram_${Date.now()}.png`);
    } catch (e) {
      alert(`이미지 내보내기 실패: ${e.message}`);
    }
  }, []);

  const confirmReset = useCallback(() => {
    dispatch({ type: A.RESET });
    dispatch({ type: A.SET_UI, payload: { isResetModalOpen: false } });
    localStorage.removeItem(STORAGE_KEY);
  }, [dispatch]);

  // ------- Canvas interaction -------
  const canvasHandlers = useCanvasInteraction(state, dispatch, { svgRef });

  const selectedNode =
    selection.type === 'node'
      ? nodes.find((n) => n.id === selection.id)
      : null;

  return (
    <div
      className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-800"
      onPointerDown={() =>
        ui.contextMenu.visible &&
        dispatch({
          type: A.SET_UI,
          payload: {
            contextMenu: { visible: false, x: 0, y: 0, nodeId: null },
          },
        })
      }
    >
      <Sidebar
        onAddNode={addNode}
        onStartLinking={startLinking}
        onApplyAutoLayout={handleApplyAutoLayout}
        onOpenReset={() =>
          dispatch({ type: A.SET_UI, payload: { isResetModalOpen: true } })
        }
      />

      <main className="flex-1 relative flex flex-col">
        <Header
          fileInputRef={fileInputRef}
          onLoadProject={handleLoadProject}
          onSaveProject={saveProject}
          onDownloadImage={downloadImage}
          onRunAIAnalysis={() => dispatch({ type: A.SET_UI, payload: { showAiPanel: true } })}
        />

        {selectedNode && interaction.state === 'idle' && (
          <QuickActionToolbar
            node={selectedNode}
            view={view}
            mode={mode}
            onStartLinking={startLinking}
            onSmartAdd={smartAddNode}
            onDelete={deleteSelection}
          />
        )}

        <Canvas
          svgRef={svgRef}
          state={state}
          interaction={interaction}
          selection={selection}
          view={view}
          showLabels={ui.showLabels}
          mousePos={canvasHandlers.mousePos}
          onPointerDown={canvasHandlers.handlePointerDown}
          onPointerMove={canvasHandlers.handlePointerMove}
          onPointerUp={canvasHandlers.handlePointerUp}
          onWheel={canvasHandlers.handleWheel}
          onContextMenu={canvasHandlers.handleContextMenu}
          onSelectEdge={(id) =>
            dispatch({ type: A.SET_SELECTION, payload: { type: 'edge', id } })
          }
        />
      </main>

      {ui.isResetModalOpen && (
        <ResetModal
          onCancel={() =>
            dispatch({ type: A.SET_UI, payload: { isResetModalOpen: false } })
          }
          onConfirm={confirmReset}
        />
      )}

      <ContextMenu
        ctx={ui.contextMenu}
        mode={mode}
        onSmartAdd={smartAddNode}
        onDelete={deleteSelection}
      />

      {selection.id && <PropertyPanel onDelete={deleteSelection} />}

      {ui.showAiPanel && (
        <AIPanel
          onClose={() =>
            dispatch({ type: A.SET_UI, payload: { showAiPanel: false } })
          }
          onRunAnalysis={runAIAnalysis}
          isLoading={aiLoading}
          result={aiResult}
          error={aiError}
        />
      )}

      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-slide-in-right { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

const App = () => (
  <DiagramProvider>
    <AppInner />
  </DiagramProvider>
);

export default App;
