# genogram_ys_app

사회복지 실습/현장에서 사용할 수 있는 **가계도(Genogram) · 생태도(Ecomap) 작성기**.
브라우저에서 동작하며 데이터는 로컬에 저장됩니다.

## 주요 기능

- 가계도/생태도 모드 전환
- 가족 노드(남성/여성/태아/사망/클라이언트/동거)
- 관계선: 결혼·동거·이혼·별거·부모-자녀·형제·갈등·친밀·단절
- 생태도 관계선: 보통/강한/스트레스/소원 + 방향성
- 드래그 이동, 팬/줌(Ctrl+휠), 그리드 스냅
- 자동 레이아웃(겹침 해소)
- Undo / Redo (Ctrl+Z / Ctrl+Y)
- 프로젝트 JSON 저장/불러오기
- PNG 이미지 내보내기
- AI 분석 리포트 (데모)

## 기술 스택

- Vite + React 18
- Tailwind CSS
- lucide-react
- 상태 관리: `useReducer` + Context

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속.

## 빌드

```bash
npm run build
npm run preview
```

## Vercel 배포

1. 이 저장소를 GitHub에 push
2. [Vercel](https://vercel.com) 대시보드에서 **New Project → Import Git Repository**
3. 프레임워크 자동 감지(Vite), 추가 설정 없이 **Deploy**

`vercel.json`에 SPA fallback rewrite가 포함되어 있습니다.

## 프로젝트 구조

```
src/
├── constants/   # 테마, 관계 설정, 레이아웃 상수
├── utils/       # 기하 계산, 자동 레이아웃, PNG 내보내기
├── state/       # reducer + Context + actions
├── hooks/       # persistence, keyboard, canvas interaction
├── services/    # AI 분석 (mock)
├── components/
│   ├── icons/
│   ├── layout/  # Sidebar, Header
│   ├── canvas/  # Canvas, Node, Edge, markers, toolbar
│   └── panels/  # PropertyPanel, AIPanel, ContextMenu, ResetModal
├── App.jsx
└── main.jsx
```

## 개인정보

모든 데이터는 브라우저 `localStorage`에 저장되며 서버로 전송되지 않습니다.
민감한 사례 정보를 다룰 때는 공용 컴퓨터 사용에 주의하세요.

## 라이선스

MIT
