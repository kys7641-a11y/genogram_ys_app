/**
 * AI analysis service (mock).
 *
 * This is a placeholder that returns a canned report after a short delay.
 * To wire up a real backend, replace the body of `analyzeDiagram` with a
 * fetch() call to a server-side endpoint (e.g. Vercel Serverless Function).
 *
 *  IMPORTANT: never call Claude/OpenAI directly from the browser with a
 *  real API key. Proxy through a server route instead.
 *
 * Expected signature:
 *   async analyzeDiagram({ nodes, edges, mode }) => string
 */
export const analyzeDiagram = async ({ nodes, edges, mode }) => {
  await new Promise((r) => setTimeout(r, 1200));

  const familyCount = nodes.filter((n) => n.type === 'family').length;
  const indexNode = nodes.find((n) => n.isIndex);
  const relationCount = edges.length;

  return `**[AI ${mode === 'genogram' ? '가계도' : '생태도'} 분석 결과 — 데모]**

1. **가족/체계 구성**
   - 총 ${familyCount}명의 가족 구성원이 등록되어 있습니다.
   - 클라이언트(Index): ${indexNode ? indexNode.name : '지정되지 않음'}
   - 관계선: ${relationCount}개

2. **제언**
   - 이 분석은 데모 모드로 실행되고 있습니다.
   - 실제 분석을 연동하려면 src/services/aiAnalysis.js 를 서버리스 함수와 연결하세요.
`;
};
