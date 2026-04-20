import { pairStatusLabel, relationshipTypeLabel } from './displayText.js'
import { getPartnerDisplayName } from './relationshipSpaces.js'

const DISTANCE_BY_SCORE = [
  { min: 80, radius: 132 },
  { min: 65, radius: 176 },
  { min: 0, radius: 224 },
]

const TREND_LABELS = {
  up: '最近更靠近了',
  down: '最近有点疏远',
  flat: '最近整体稳定',
}

function normalizeScore(value, pair) {
  const score = Number(value)
  if (Number.isFinite(score)) return Math.max(0, Math.min(100, Math.round(score)))
  return pair?.status === 'active' ? 72 : 42
}

function normalizeTrend(value) {
  const trend = String(value || 'flat').trim().toLowerCase()
  return trend === 'up' || trend === 'down' ? trend : 'flat'
}

function visualStateFrom(score, trend, isSelected) {
  return {
    glow: isSelected ? 'focused' : score >= 80 ? 'strong' : score >= 65 ? 'steady' : 'soft',
    line: isSelected ? 'focused' : trend === 'up' ? 'warm' : trend === 'down' ? 'dim' : 'steady',
    emphasis: isSelected || score >= 80 ? 'primary' : 'secondary',
  }
}

function buildSidebar(pair, metric, label) {
  const score = normalizeScore(metric?.score, pair)
  const trend = normalizeTrend(metric?.trend)
  const summary = String(metric?.summary || '').trim()
    || (trend === 'up'
      ? '这段关系最近有回暖迹象。'
      : trend === 'down'
        ? '这段关系最近需要多一点留意。'
        : '这段关系最近整体比较平稳。')
  const nextAction = String(metric?.nextAction || '').trim()
    || (pair?.status === 'active'
      ? '先做一个低压力的靠近动作。'
      : '先把邀请码发给对方，等关系建立起来。')

  return {
    pairId: pair?.id || '',
    title: label,
    typeLabel: relationshipTypeLabel(pair?.type),
    statusLabel: pairStatusLabel(pair?.status),
    score,
    trend,
    trendLabel: TREND_LABELS[trend] || TREND_LABELS.flat,
    summary,
    recentSummary: summary,
    nextAction,
  }
}

export function buildRelationshipSpaceModel({ me, currentPairId, pairs = [], metricsByPairId = {} } = {}) {
  const center = {
    id: me?.id || 'self',
    label: String(me?.nickname || '').trim() || '我',
  }

  const nodes = pairs.map((pair, index) => {
    const score = normalizeScore(metricsByPairId[pair.id]?.score, pair)
    const trend = normalizeTrend(metricsByPairId[pair.id]?.trend)
    const bucket = DISTANCE_BY_SCORE.find((item) => score >= item.min) || DISTANCE_BY_SCORE[DISTANCE_BY_SCORE.length - 1]
    const distance = bucket.radius + (trend === 'up' ? -8 : trend === 'down' ? 8 : 0)
    const label = getPartnerDisplayName(pair)
    const isSelected = pair.id === currentPairId

    return {
      id: `relationship-node-${pair.id}`,
      pairId: pair.id,
      label,
      shortLabel: String(label || '对').slice(0, 1),
      typeLabel: relationshipTypeLabel(pair?.type),
      score,
      trend,
      distance,
      angle: (Math.PI * 2 * index) / Math.max(pairs.length, 1),
      isSelected,
      visualState: visualStateFrom(score, trend, isSelected),
      sidebar: buildSidebar(pair, metricsByPairId[pair.id], label),
    }
  })

  const selectedNode = nodes.find((node) => node.pairId === currentPairId) || nodes[0] || null

  return {
    center,
    nodes,
    selectedPairId: selectedNode?.pairId || '',
    selectedSidebar: selectedNode?.sidebar || null,
  }
}
