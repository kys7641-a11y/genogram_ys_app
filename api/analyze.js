import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_NODES = 200;
const MAX_EDGES = 400;

const RELATION_LABELS = {
  marriage: '결혼',
  cohabitation: '동거',
  divorce: '이혼',
  separation: '별거',
  'parent-child': '부모-자녀',
  siblings: '형제',
  conflict: '갈등',
  close: '친밀',
  cutoff: '단절',
  normal: '보통 관계',
  strong: '강한 관계',
  stress: '스트레스',
  weak: '소원함',
};

const buildPrompt = ({ nodes, edges, mode }) => {
  const isGenogram = mode === 'genogram';

  const nodeLines = nodes.map((n) => {
    if (n.type === 'family') {
      const gender = n.gender === 'male' ? '남성' : n.gender === 'female' ? '여성' : n.gender === 'pregnancy' ? '태아' : '미상';
      const age = n.birthYear ? `(${new Date().getFullYear() - n.birthYear}세)` : '';
      const flags = [
        n.isIndex ? '[IP]' : '',
        n.isDeceased ? '[사망]' : '',
        n.isCohabiting ? '[동거중]' : '',
      ].filter(Boolean).join(' ');
      return `  - ${n.name} ${age} ${gender} ${flags}`.trim();
    }
    return `  - [체계/기관] ${n.name}`;
  });

  const edgeLines = edges.map((e) => {
    const src = nodes.find((n) => n.id === e.source)?.name ?? e.source;
    const tgt = nodes.find((n) => n.id === e.target)?.name ?? e.target;
    const rel = RELATION_LABELS[e.type] ?? e.type;
    return `  - ${src} ↔ ${tgt}: ${rel}`;
  });

  if (isGenogram) {
    return `당신은 사회복지사를 위한 가계도(Genogram) 분석 전문가입니다.
아래 가계도 데이터를 분석하여 사회복지 실천에 유용한 인사이트를 한국어로 제공하세요.

## 가계도 데이터

### 구성원 (총 ${nodes.length}명, IP = 클라이언트)
${nodeLines.join('\n')}

### 관계 (총 ${edges.length}개)
${edgeLines.join('\n')}

## 분석 요청

다음 항목을 포함하여 체계적으로 분석해주세요:

1. **가족 구조 요약** — 세대 구성, 가족 규모, 특이사항
2. **주요 관계 패턴** — 친밀/갈등/단절 패턴, 삼각관계 여부
3. **클라이언트(IP) 중심 분석** — IP의 가족 내 위치와 지지 자원
4. **위험 요인** — 갈등, 단절, 사망 등 주목할 요소
5. **보호 요인** — 강점 및 지지 자원
6. **사회복지 개입 제언** — 우선순위 개입 방향 2~3가지

간결하고 전문적인 언어로 작성하되, 실제 사회복지 현장에서 활용 가능한 수준으로 작성하세요.`;
  }

  return `당신은 사회복지사를 위한 생태도(Eco-map) 분석 전문가입니다.
아래 생태도 데이터를 분석하여 사회복지 실천에 유용한 인사이트를 한국어로 제공하세요.

## 생태도 데이터

### 구성원 및 체계 (총 ${nodes.length}개)
${nodeLines.join('\n')}

### 관계 (총 ${edges.length}개)
${edgeLines.join('\n')}

## 분석 요청

다음 항목을 포함하여 체계적으로 분석해주세요:

1. **체계 연결 요약** — 연결된 자원 체계의 종류와 수
2. **강한 자원** — 강한 관계로 연결된 지지 체계
3. **스트레스 요인** — 스트레스/갈등 관계의 체계
4. **취약한 연결** — 소원하거나 단절된 체계
5. **자원 불균형** — 특정 영역(가족/의료/교육/사회 등) 자원 부족 여부
6. **사회복지 개입 제언** — 강화할 자원, 연결할 체계, 우선순위

간결하고 전문적인 언어로 작성하되, 실제 사회복지 현장에서 활용 가능한 수준으로 작성하세요.`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 서버에 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.' });
  }

  const { nodes, edges, mode, modelId } = req.body;

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: '분석할 구성원이 없습니다. 먼저 가계도/생태도를 작성해주세요.' });
  }
  if (!Array.isArray(edges)) {
    return res.status(400).json({ error: 'edges 형식이 올바르지 않습니다.' });
  }
  if (nodes.length > MAX_NODES || edges.length > MAX_EDGES) {
    return res.status(413).json({ error: `데이터가 너무 큽니다. (nodes ≤ ${MAX_NODES}, edges ≤ ${MAX_EDGES})` });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId || 'gemini-2.0-flash' });
    const prompt = buildPrompt({ nodes, edges, mode });
    const result = await model.generateContent(prompt);
    return res.status(200).json({ result: result.response.text() });
  } catch (e) {
    return res.status(500).json({ error: e.message || '분석 중 오류가 발생했습니다.' });
  }
}
