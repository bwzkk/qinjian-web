<template>
  <div class="relationship-spaces-page page-shell page-shell--wide page-stack">
    <div class="page-head spaces-head">
      <p class="eyebrow">关系空间</p>
      <h2>每一段一对一关系，都有自己的空间</h2>
      <p>情侣、朋友、搭子分别记录。一个人和一个人对应一个空间，不混在一起。</p>
    </div>

    <section class="spaces-stage" aria-label="关系空间">
      <div class="space-list">
        <button
          v-for="space in spaces"
          :key="space.id"
          :class="{ active: activeSpace.id === space.id }"
          type="button"
          @click="selectSpace(space)"
        >
          <span>{{ space.type }}</span>
          <strong>{{ space.title }}</strong>
          <small>{{ space.tree_stage }}</small>
        </button>
      </div>

      <div class="space-canvas">
        <div class="space-pair">
          <div v-for="person in activeSpace.people" :key="person" class="space-person">
            <span>{{ person.slice(0, 1) }}</span>
            <strong>{{ person }}</strong>
          </div>
          <div class="space-line">
            <i></i>
          </div>
        </div>

        <div class="space-tree-mini" aria-hidden="true">
          <span class="mini-seed"></span>
          <span class="mini-trunk"></span>
          <span class="mini-leaf mini-leaf--a"></span>
          <span class="mini-leaf mini-leaf--b"></span>
          <span class="mini-leaf mini-leaf--c"></span>
        </div>
      </div>

      <aside class="space-brief">
        <span class="pill">{{ activeSpace.type }}</span>
        <h3>{{ activeSpace.status }}</h3>
        <p>{{ activeSpace.prompt }}</p>
        <div class="space-meter">
          <span>关系信号</span>
          <strong>{{ activeSpace.signal }}</strong>
        </div>
        <button class="btn btn-primary btn-sm" type="button" @click="$router.push('/checkin')">进入这个空间记录</button>
      </aside>
    </section>

    <section class="space-moments" aria-label="空间脉络">
      <article v-for="(moment, index) in activeSpace.moments" :key="moment">
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <p>{{ moment }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { demoFixture } from '@/demo/fixtures'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const spaces = demoFixture.relationshipSpaces
const activeSpaceId = ref(userStore.currentPair?.id || demoFixture.currentPairId)

const activeSpace = computed(() =>
  spaces.find((space) => space.pair_id === activeSpaceId.value || space.id === activeSpaceId.value)
  || spaces[0]
)

function selectSpace(space) {
  activeSpaceId.value = space.pair_id
  userStore.switchPair(space.pair_id)
}
</script>

<style scoped>
.spaces-head {
  width: 100%;
  max-width: none;
}

.spaces-stage {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 260px;
  min-height: 400px;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.72);
}

.space-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-right: 1px solid var(--border);
  background: rgba(220, 231, 218, 0.28);
}

.space-list button {
  min-height: 88px;
  padding: 12px;
  border: 1px solid rgba(44, 48, 39, 0.12);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.7);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.space-list button:hover,
.space-list button.active {
  transform: translateY(-1px);
  border-color: rgba(189, 75, 53, 0.34);
  background: rgba(255, 253, 250, 0.96);
}

.space-list span,
.space-meter span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 800;
}

.space-list strong {
  display: block;
  margin: 6px 0;
  font-family: var(--font-serif);
  font-size: 18px;
}

.space-list small {
  color: var(--moss-deep);
  font-size: 12px;
  font-weight: 800;
}

.space-canvas {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 400px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 68%, rgba(220, 231, 218, 0.82), transparent 0 24%, rgba(255, 253, 250, 0) 25%),
    linear-gradient(180deg, rgba(246, 247, 241, 0.94), rgba(255, 253, 250, 0.58));
}

.space-pair {
  position: relative;
  width: min(420px, 82%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 80px;
}

.space-person {
  position: relative;
  z-index: 2;
  width: 108px;
  min-height: 108px;
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(44, 48, 39, 0.14);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.94);
  box-shadow: var(--shadow-sm);
}

.space-person span {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--seal-soft);
  color: var(--seal-deep);
  font-weight: 900;
}

.space-person strong {
  font-size: 14px;
}

.space-line {
  position: absolute;
  left: 112px;
  right: 112px;
  top: 50%;
  height: 2px;
  background: rgba(78, 116, 91, 0.22);
}

.space-line i {
  position: absolute;
  inset: -5px 35%;
  border-radius: var(--radius-sm);
  background: var(--moss);
  animation: spacePulse 2.8s ease-in-out infinite;
}

.space-tree-mini {
  position: absolute;
  left: 50%;
  bottom: 32px;
  width: 100px;
  height: 116px;
  transform: translateX(-50%);
}

.mini-seed,
.mini-trunk,
.mini-leaf {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.mini-seed {
  bottom: 0;
  width: 38px;
  height: 12px;
  border-radius: 50%;
  background: rgba(134, 58, 43, 0.24);
}

.mini-trunk {
  bottom: 7px;
  width: 18px;
  height: 62px;
  border-radius: 8px;
  background: linear-gradient(180deg, #8f5a42, #5b3a2a);
}

.mini-leaf {
  bottom: 56px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(78, 116, 91, 0.9);
  animation: miniLeaf 3s ease-in-out infinite;
}

.mini-leaf--a { margin-left: -28px; }
.mini-leaf--b { margin-left: 28px; animation-delay: 0.2s; }
.mini-leaf--c { bottom: 78px; animation-delay: 0.35s; background: rgba(220, 231, 218, 0.95); }

.space-brief {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  border-left: 1px solid var(--border);
  background: rgba(243, 216, 208, 0.24);
}

.space-brief h3 {
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.35;
}

.space-brief p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.7;
}

.space-meter {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid rgba(78, 116, 91, 0.18);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.7);
}

.space-meter strong {
  color: var(--moss-deep);
  font-family: var(--font-serif);
  font-size: 24px;
}

.space-moments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.space-moments article {
  min-height: 112px;
  padding: 14px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(255, 253, 250, 0.68);
}

.space-moments span {
  color: var(--seal);
  font-weight: 900;
}

.space-moments p {
  margin-top: 12px;
  color: var(--ink);
  font-size: 14px;
  line-height: 1.65;
}

@keyframes spacePulse {
  0%, 100% { transform: scaleX(0.45); opacity: 0.3; }
  50% { transform: scaleX(1); opacity: 0.92; }
}

@keyframes miniLeaf {
  0%, 100% { transform: translateX(-50%) scale(0.96); }
  50% { transform: translateX(-50%) scale(1.04); }
}

@media (max-width: 980px) {
  .spaces-stage {
    grid-template-columns: 1fr;
  }

  .space-list,
  .space-brief {
    border: 0;
  }

  .space-list {
    border-bottom: 1px solid var(--border);
  }

  .space-brief {
    border-top: 1px solid var(--border);
  }
}

@media (max-width: 620px) {
  .relationship-spaces-page {
    width: min(100% - 24px, 1040px);
  }

  .space-canvas {
    min-height: 360px;
  }

  .space-pair {
    gap: 54px;
    width: 92%;
  }

  .space-person {
    width: 92px;
    min-height: 96px;
  }

  .space-line {
    left: 86px;
    right: 86px;
  }
}
</style>
