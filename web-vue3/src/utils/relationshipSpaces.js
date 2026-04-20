import { pairStatusLabel, relationshipTypeLabel } from './displayText.js'

function normalizeDisplayName(value, fallback) {
  const text = String(value || '').trim()
  return text || fallback
}

function getPartnerDisplayName(pair) {
  return normalizeDisplayName(
    pair?.custom_partner_nickname || pair?.partner_nickname || pair?.partner_email || pair?.partner_phone,
    pair?.status === 'active' ? '对方' : '等待加入',
  )
}

function buildMoments(pair) {
  if (pair?.status === 'active') {
    return [
      '切换到这段关系后，首页、记录和简报都会跟着切换。',
      '每一段关系会分开保存，不会跟别的关系混在一起。',
      '之后想再建立新关系，还是回到关系管理操作就好。',
    ]
  }

  return [
    '这段关系已经建好了，现在只差对方输入邀请码。',
    '在对方加入之前，你可以先继续单人整理今天发生的事。',
    '对方加入后，这里才会变成真正的双人关系空间。',
  ]
}

export function buildRelationshipSpaces({ pairs = [], me = null } = {}) {
  const myName = normalizeDisplayName(me?.nickname, '我')

  return pairs.map((pair) => {
    const partnerName = getPartnerDisplayName(pair)
    const active = pair?.status === 'active'

    return {
      id: pair.id,
      pair_id: pair.id,
      type: relationshipTypeLabel(pair?.type),
      title: partnerName,
      tree_stage: pairStatusLabel(pair?.status),
      people: active ? [myName, partnerName] : [myName, '等待加入'],
      status: active ? '这段关系正在记录中' : '这段关系还在等待加入',
      prompt: active
        ? '这段关系会单独记录，不会和别的关系混在一起。'
        : '邀请码发给对方后，等对方加入，就会切换成真正的双人记录。',
      signal: active ? '已建立' : '待加入',
      moments: buildMoments(pair),
    }
  })
}

export { getPartnerDisplayName }
