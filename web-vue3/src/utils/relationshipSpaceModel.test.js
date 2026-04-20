import test from 'node:test'
import assert from 'node:assert/strict'

import { buildRelationshipSpaceDetailModel, buildRelationshipSpaceModel } from './relationshipSpaceModel.js'

test('buildRelationshipSpaceModel maps score and trend into stable node positions', () => {
  const model = buildRelationshipSpaceModel({
    me: { nickname: '阿青' },
    currentPairId: 'pair-1',
    pairs: [
      { id: 'pair-1', type: 'couple', status: 'active', custom_partner_nickname: '林夏' },
      { id: 'pair-2', type: 'friend', status: 'active', custom_partner_nickname: '周宁' },
    ],
    metricsByPairId: {
      'pair-1': { score: 82, trend: 'up', summary: '今天更靠近了', nextAction: '约一个 10 分钟电话' },
      'pair-2': { score: 63, trend: 'down', summary: '最近有点疏远', nextAction: '先发一条轻量问候' },
    },
  })

  assert.equal(model.center.label, '阿青')
  assert.equal(model.nodes[0].pairId, 'pair-1')
  assert.ok(model.nodes[0].distance < model.nodes[1].distance)
  assert.equal(model.nodes[0].trend, 'up')
  assert.match(model.nodes[0].sidebar.summary, /靠近/)
  assert.equal(model.selectedPairId, 'pair-1')
  assert.equal(model.selectedSidebar.title, '林夏')
  assert.match(model.selectedSidebar.nextAction, /电话|沟通|解释/)
})

test('buildRelationshipSpaceDetailModel gathers hero, moments, and actions for a selected relationship', () => {
  const detail = buildRelationshipSpaceDetailModel({
    me: { nickname: '阿青' },
    pair: {
      id: 'pair-1',
      type: 'couple',
      status: 'active',
      custom_partner_nickname: '林夏',
    },
    metricsByPairId: {
      'pair-1': {
        score: 78,
        trend: 'up',
        summary: '今天双方都愿意补一句解释。',
        nextAction: '先约一个 10 分钟电话。',
      },
    },
    moments: ['昨天因为回复慢有误会', '今天双方愿意补一句解释'],
  })

  assert.equal(detail.hero.title, '阿青 · 林夏')
  assert.equal(detail.hero.score, 78)
  assert.match(detail.hero.stageLabel, /靠近|稳定|疏远/)
  assert.equal(detail.moments.length, 2)
  assert.match(detail.primaryAction.label, /电话|建议|记录|时间线/)
})
