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

## 기술 스택

- Vite + React 18
- Tailwind CSS
- lucide-react
- 상태 관리: `useReducer` + Context

## 테스트 실행

수학 기하 연산, 상태 관리 Reducer, 가족 트리 및 생태도 자동 정렬(Auto-Layout) 알고리즘에 대한 단위 테스트를 실행합니다:

```bash
npm run test
```

## 빌드 및 배포

### 1. 일반 웹 호스팅 빌드 (Vercel, GitHub Pages 등)

```bash
npm run build
npm run preview
```
빌드 시 `dist/` 폴더 내에 정적 웹 리소스가 생성됩니다.

### 2. 독립형 단일 파일 (Offline Standalone HTML) 빌드

인터넷 접속이 원활하지 않거나 방화벽이 엄격한 사회복지 기관/가정 방문 상담 환경에서 유용하게 쓸 수 있도록, 모든 JS/CSS/아이콘 리소스를 포함한 **오프라인용 단일 HTML 파일**을 빌드합니다:

```bash
npm run build:single
```
빌드가 완료되면 `dist-single/index.html` 파일이 생성됩니다. 이 파일 하나만 USB 등에 복사해서 들고 다니며 오프라인 브라우저에서 실행(더블클릭)해도 가계도 그리기, 캔버스 드래그, 꺾임 수정 및 로컬 저장 기능이 정상 작동합니다.

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
├── components/
│   ├── icons/
│   ├── layout/  # Sidebar, Header
│   ├── canvas/  # Canvas, Node, Edge, markers, toolbar
│   └── panels/  # PropertyPanel, ContextMenu, ResetModal
├── App.jsx
└── main.jsx
```

## 개인정보

모든 데이터는 브라우저 `localStorage`에 저장되며 서버로 전송되지 않습니다.
민감한 사례 정보를 다룰 때는 공용 컴퓨터 사용에 주의하세요.

## 라이선스

MIT
