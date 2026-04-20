<template>
  <section
    class="relationship-constellation"
    :class="{
      'is-empty': !nodes.length,
      'is-single': nodes.length === 1,
      'is-dense': nodes.length > 6,
    }"
    aria-label="关系星图"
  >
    <div class="relationship-constellation__shell">
      <div class="relationship-constellation__field">
        <div class="relationship-constellation__core">
          <span>{{ centerBadge }}</span>
          <small>{{ center.label }}</small>
        </div>

        <template v-for="(node, index) in nodes" :key="node.pairId">
          <div
            class="relationship-constellation__line"
            :class="lineClass(node)"
            :style="lineStyle(node, index)"
            aria-hidden="true"
          >
            <span>{{ node.typeLabel }}</span>
          </div>

          <button
            class="relationship-constellation__node"
            :class="nodeClass(node)"
            :style="nodeStyle(node, index)"
            type="button"
            @click="emit('select', node.pairId)"
          >
            <strong>{{ node.shortLabel || node.label?.slice(0, 1) || '对' }}</strong>
            <small>{{ node.label }}</small>
          </button>
        </template>

        <div v-if="!nodes.length" class="relationship-constellation__empty">
          <p>你的关系会从这里开始发光。</p>
          <span>先创建或加入一段关系，再回来看看彼此的距离。</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const SINGLE_NODE_ANGLE = -Math.PI / 2

const props = defineProps({
  center: { type: Object, required: true },
  nodes: { type: Array, default: () => [] },
  selectedPairId: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const centerBadge = String(props.center?.label || '我').slice(0, 1)

function resolveLayout(node, index) {
  const total = props.nodes.length
  const denseMode = total > 6
  const ringOffset = denseMode ? ((index % 3) - 1) * 20 : 0
  const angleOffset = total > 8
    ? ((index % 2 === 0 ? 1 : -1) * Math.PI) / (total * 6)
    : 0
  const angle = total === 1 ? SINGLE_NODE_ANGLE : Number(node?.angle || 0) + angleOffset
  const radius = Math.max(total === 1 ? 144 : 112, Number(node?.distance || 0) + ringOffset)
  const size = total > 9 ? 60 : total > 6 ? 68 : 74

  return {
    angle,
    radius,
    size,
    labelOffset: Math.max(20, Math.round(size / 2.6)),
  }
}

function nodeStyle(node, index) {
  const { angle, radius, size, labelOffset } = resolveLayout(node, index)
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  return {
    '--angle': `${angle}rad`,
    '--radius': `${radius}px`,
    '--size': `${size}px`,
    '--label-offset': `${labelOffset}px`,
    '--x': `${x}px`,
    '--y': `${y}px`,
  }
}

function lineStyle(node, index) {
  const { angle, radius } = resolveLayout(node, index)
  return {
    '--angle': `${angle}rad`,
    '--radius': `${radius}px`,
  }
}

function nodeClass(node) {
  return {
    'is-selected': node?.pairId === props.selectedPairId,
    'is-strong': node?.visualState?.glow === 'strong',
    'is-focused': node?.visualState?.glow === 'focused',
  }
}

function lineClass(node) {
  return {
    'is-selected': node?.pairId === props.selectedPairId,
    'is-dim': node?.visualState?.line === 'dim',
    'is-warm': node?.visualState?.line === 'warm',
  }
}
</script>

<style scoped>
.relationship-constellation {
  min-height: 560px;
}

.relationship-constellation__shell {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(255, 231, 196, 0.12);
  border-radius: 30px;
  background:
    radial-gradient(circle at 50% 22%, rgba(240, 184, 116, 0.2), transparent 24%),
    radial-gradient(circle at 16% 18%, rgba(223, 141, 107, 0.12), transparent 18%),
    linear-gradient(180deg, var(--relationship-night-900), var(--relationship-night-700) 58%, var(--relationship-night-500));
  box-shadow: var(--shadow-lg);
}

.relationship-constellation__shell::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.58;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.86) 0 1px, transparent 1.4px),
    radial-gradient(circle, rgba(255, 228, 194, 0.44) 0 1px, transparent 1.5px);
  background-size: 122px 122px, 188px 188px;
  background-position: 22px 18px, 86px 62px;
}

.relationship-constellation__field {
  position: relative;
  min-height: 560px;
}

.relationship-constellation__core {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 108px;
  height: 108px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle at 50% 28%, rgba(255, 243, 224, 0.98), rgba(240, 184, 116, 0.94) 68%, rgba(133, 75, 45, 0.96));
  color: #653118;
  box-shadow: 0 18px 34px rgba(4, 12, 20, 0.34);
}

.relationship-constellation__core span {
  font-size: 28px;
  font-weight: 900;
}

.relationship-constellation__core small {
  position: absolute;
  bottom: -30px;
  white-space: nowrap;
  color: rgba(255, 238, 216, 0.92);
  font-size: 13px;
  font-weight: 700;
}

.relationship-constellation__line {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: var(--radius);
  height: 2px;
  transform: rotate(var(--angle));
  transform-origin: left center;
  background: linear-gradient(90deg, rgba(240, 184, 116, 0.82), rgba(149, 191, 210, 0.26));
  box-shadow: 0 0 16px rgba(240, 184, 116, 0.16);
}

.relationship-constellation__line span {
  position: absolute;
  left: calc(50% - 20px);
  top: -16px;
  color: rgba(255, 228, 194, 0.78);
  font-size: 11px;
  font-weight: 700;
  transform: rotate(calc(var(--angle) * -1));
  transform-origin: center;
}

.relationship-constellation__line.is-selected {
  height: 3px;
  background: linear-gradient(90deg, rgba(240, 184, 116, 0.96), rgba(149, 191, 210, 0.42));
  box-shadow: 0 0 20px rgba(240, 184, 116, 0.22);
}

.relationship-constellation__line.is-dim {
  opacity: 0.42;
}

.relationship-constellation__line.is-warm::after,
.relationship-constellation__line.is-selected::after {
  content: "";
  position: absolute;
  right: 12%;
  top: -4px;
  width: 34px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 220, 167, 0.84);
  filter: blur(5px);
}

.relationship-constellation__node {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: var(--size, 74px);
  height: var(--size, 74px);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 230, 196, 0.14);
  border-radius: 50%;
  transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y)));
  background:
    radial-gradient(circle at 50% 32%, rgba(255, 243, 224, 0.98), rgba(149, 191, 210, 0.9) 68%, rgba(58, 87, 117, 0.96));
  color: #1e3a5b;
  box-shadow: 0 12px 24px rgba(4, 12, 20, 0.28);
}

.relationship-constellation__node strong {
  font-size: 18px;
  font-weight: 900;
}

.relationship-constellation__node small {
  position: absolute;
  bottom: calc(var(--label-offset, 24px) * -1);
  white-space: nowrap;
  color: rgba(255, 238, 216, 0.84);
  font-size: 12px;
  font-weight: 700;
}

.relationship-constellation__node.is-selected,
.relationship-constellation__node.is-focused {
  box-shadow:
    0 0 0 4px rgba(245, 210, 142, 0.14),
    0 14px 28px rgba(4, 12, 20, 0.32);
}

.relationship-constellation__node.is-strong {
  filter: saturate(1.08);
}

.relationship-constellation__empty {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(340px, calc(100% - 48px));
  padding: 22px;
  border: 1px solid rgba(255, 231, 196, 0.16);
  border-radius: 24px;
  background: rgba(17, 12, 24, 0.72);
  transform: translate(-50%, -50%);
  text-align: center;
}

.relationship-constellation__empty p {
  color: rgba(255, 239, 218, 0.92);
  font-family: var(--font-serif);
  font-size: 22px;
}

.relationship-constellation__empty span {
  display: block;
  margin-top: 8px;
  color: rgba(255, 239, 218, 0.74);
  font-size: 14px;
  line-height: 1.7;
}

.relationship-constellation.is-single .relationship-constellation__line span {
  display: none;
}

.relationship-constellation.is-single .relationship-constellation__node {
  background:
    radial-gradient(circle at 50% 32%, rgba(255, 243, 224, 0.98), rgba(240, 184, 116, 0.88) 68%, rgba(133, 75, 45, 0.96));
  color: #653118;
}

.relationship-constellation.is-dense .relationship-constellation__shell::before {
  opacity: 0.48;
}

@media (max-width: 900px) {
  .relationship-constellation,
  .relationship-constellation__shell,
  .relationship-constellation__field {
    min-height: 500px;
  }

  .relationship-constellation__line span {
    display: none;
  }
}

@media (max-width: 640px) {
  .relationship-constellation,
  .relationship-constellation__shell,
  .relationship-constellation__field {
    min-height: 440px;
  }

  .relationship-constellation__core {
    width: 90px;
    height: 90px;
  }

  .relationship-constellation__node {
    width: min(var(--size, 64px), 64px);
    height: min(var(--size, 64px), 64px);
  }
}
</style>
