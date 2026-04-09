/**
 * AI 분석 서비스
 * 프론트엔드에서 /api/analyze (Vercel 서버리스 함수)를 호출합니다.
 * API 키는 서버 환경변수(GEMINI_API_KEY)에만 저장됩니다.
 */
export const analyzeDiagram = async ({ nodes, edges, mode, modelId }) => {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, mode, modelId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '분석 중 오류가 발생했습니다.');
  }

  return data.result;
};
