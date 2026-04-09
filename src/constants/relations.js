import { THEME_CONFIG } from './theme';

export const RELATION_CONFIG = {
  GENOGRAM: {
    MARRIAGE:     { id: 'marriage',     label: '결혼',      color: THEME_CONFIG.colors.secondary, style: 'solid',  logic: 'horizontal' },
    COHABITATION: { id: 'cohabitation', label: '동거',      color: THEME_CONFIG.colors.secondary, style: 'dashed', logic: 'horizontal' },
    DIVORCE:      { id: 'divorce',      label: '이혼',      color: THEME_CONFIG.colors.secondary, style: 'solid',  marker: 'double-slash', logic: 'horizontal' },
    SEPARATION:   { id: 'separation',   label: '별거',      color: THEME_CONFIG.colors.secondary, style: 'solid',  marker: 'single-slash', logic: 'horizontal' },
    PARENT_CHILD: { id: 'parent-child', label: '부모-자녀', color: THEME_CONFIG.colors.secondary, style: 'solid',  logic: 'orthogonal' },
    SIBILING:     { id: 'siblings',     label: '형제',      color: THEME_CONFIG.colors.secondary, style: 'solid',  logic: 'bracket' },
    CONFLICT:     { id: 'conflict',     label: '갈등',      color: THEME_CONFIG.colors.danger,    style: 'zigzag', logic: 'direct' },
    CLOSE:        { id: 'close',        label: '친밀',      color: THEME_CONFIG.colors.success,   style: 'double', logic: 'direct' },
    CUTOFF:       { id: 'cutoff',       label: '단절',      color: '#1e293b',                     style: 'solid',  marker: 'bar', logic: 'direct' },
  },
  ECOMAP: {
    NORMAL: { id: 'normal', label: '보통 관계',   color: '#94a3b8',                  width: 2, logic: 'direct' },
    STRONG: { id: 'strong', label: '강한 관계',   color: '#3b82f6',                  width: 4, logic: 'direct' },
    STRESS: { id: 'stress', label: '스트레스',    color: THEME_CONFIG.colors.danger, width: 2, style: 'zigzag', logic: 'direct' },
    WEAK:   { id: 'weak',   label: '소원함',      color: '#cbd5e1',                  width: 2, style: 'dashed', logic: 'direct' },
  },
};

export const ALL_RELATIONS = [
  ...Object.values(RELATION_CONFIG.GENOGRAM),
  ...Object.values(RELATION_CONFIG.ECOMAP),
];

export const getRelationConfig = (typeId) =>
  ALL_RELATIONS.find((c) => c.id === typeId);
