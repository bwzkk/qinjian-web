<template>
  <div class="discover-page">
    <div class="page-head discover-head">
      <p class="eyebrow">目录</p>
      <h2>先留住，再看清，再靠近</h2>
      <p>记录每一天，看清关系状态，找到下一步的方向。</p>
    </div>

    <section class="main-lines" aria-label="核心主线">
      <router-link to="/checkin" class="discover-entry discover-entry--primary glass-card">
        <PenLine :size="24" style="color: var(--seal); margin-bottom: 8px;" />
        <div style="flex:1;">
          <span>记录</span>
          <strong>写下今天这一句</strong>
        </div>
        <ChevronRight :size="18" style="align-self: flex-end;" />
      </router-link>
      <router-link to="/report" class="discover-entry glass-card">
        <LineChart :size="24" style="color: var(--moss-deep); margin-bottom: 8px;" />
        <div style="flex:1;">
          <span>简报</span>
          <strong>读懂这一期主结论</strong>
        </div>
        <ChevronRight :size="18" style="align-self: flex-end;" />
      </router-link>
      <router-link to="/alignment" class="discover-entry glass-card">
        <Users :size="24" style="color: var(--seal-deep); margin-bottom: 8px;" />
        <div style="flex:1;">
          <span>双视角</span>
          <strong>看双方版本怎么错位</strong>
        </div>
        <ChevronRight :size="18" style="align-self: flex-end;" />
      </router-link>
      <router-link to="/timeline" class="discover-entry glass-card">
        <Clock :size="24" style="color: var(--amber); margin-bottom: 8px;" />
        <div style="flex:1;">
          <span>时间轴</span>
          <strong>回看它怎么变成现在</strong>
        </div>
        <ChevronRight :size="18" style="align-self: flex-end;" />
      </router-link>
      <router-link to="/relationship-spaces" class="discover-entry glass-card">
        <UserRoundCheck :size="24" style="color: var(--seal-deep); margin-bottom: 8px;" />
        <div style="flex:1;">
          <span>关系空间</span>
          <strong>一个人和一个人的独立空间</strong>
        </div>
        <ChevronRight :size="18" style="align-self: flex-end;" />
      </router-link>
    </section>

    <section class="service-shelf" aria-label="服务入口">
      <div class="service-shelf__head">
        <div>
          <p class="eyebrow">服务方案</p>
          <h3>课程、咨询和会员都在这里</h3>
        </div>
        <button class="btn btn-ghost btn-sm" @click="$router.push('/membership')">查看会员</button>
      </div>
      <div class="service-shelf__grid">
        <router-link v-for="item in serviceShelf" :key="item.to" :to="item.to" class="service-entry" :class="item.className">
          <span>{{ item.tag }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
          <small>{{ item.cta }} · {{ item.price }}</small>
        </router-link>
      </div>
    </section>

    <section class="tool-catalog" aria-label="扩展功能">
      <div class="catalog-head">
        <p class="eyebrow">扩展功能</p>
        <h3>更多工具</h3>
      </div>

      <div class="catalog-groups">
        <section v-for="group in groups" :key="group.title" class="catalog-group">
          <div class="catalog-group__head">
            <span>{{ group.index }}</span>
            <div>
              <h4>{{ group.title }}</h4>
              <p>{{ group.desc }}</p>
            </div>
          </div>
          <div class="catalog-links">
            <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="discover-card glass-card">
              <span class="pill">{{ item.tag }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </router-link>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { PenLine, LineChart, Clock, ChevronRight, UserRoundCheck, Users } from 'lucide-vue-next'

const serviceShelf = [
  {
    to: '/courses',
    tag: '课程',
    title: '关系沟通技巧',
    desc: '学会在冲突里先听懂，再开口。',
    cta: '去看看',
    price: '¥19 起',
    className: 'service-entry--course',
  },
  {
    to: '/experts',
    tag: '咨询',
    title: '专业支持',
    desc: '当关系卡住的时候，找专业的人聊一聊。',
    cta: '了解更多',
    price: '20 分钟体验',
    className: 'service-entry--expert',
  },
  {
    to: '/membership',
    tag: '会员',
    title: '解锁更多功能',
    desc: '深度简报、趋势分析和专属建议。',
    cta: '去看看',
    price: '¥29/月',
    className: 'service-entry--member',
  },
]

const groups = [
  {
    index: 'A',
    title: '记录',
    desc: '留住关键节点和日常状态。',
    items: [
      { to: '/milestones', tag: '纪念日', title: '关系纪念日', desc: '记住那些重要的日子和时刻。' },
      { to: '/longdistance', tag: '异地', title: '异地关系', desc: '远程也能保持同步和连接。' },
      { to: '/relationship-spaces', tag: '空间', title: '关系空间', desc: '每段一对一关系独立记录。' },
    ],
  },
  {
    index: 'B',
    title: '评估',
    desc: '看清关系现在的状态和模式。',
    items: [
      { to: '/health-test', tag: '体检', title: '关系体检', desc: '快速看看关系现在哪里需要留意。' },
      { to: '/attachment-test', tag: '依恋', title: '依恋类型', desc: '了解你和对方的依恋模式。' },
      { to: '/alignment', tag: '双视角', title: '双视角分析', desc: '把双方版本放在一起看。' },
    ],
  },
  {
    index: 'C',
    title: '行动',
    desc: '把建议变成今天就能做的事。',
    items: [
      { to: '/community', tag: '技巧', title: '关系技巧', desc: '实用的关系经营方法。' },
      { to: '/challenges', tag: '任务', title: '今日任务', desc: '小步前进，每天靠近一点点。' },
      { to: '/message-simulation', tag: '预演', title: '聊天前预演', desc: '先看这句话会不会把局面推歪。' },
      { to: '/repair-protocol', tag: '修复', title: '修复协议', desc: '先止损，再按步骤对话。' },
    ],
  },
  {
    index: 'D',
    title: '支持',
    desc: '更多服务和长期陪伴。',
    items: [
      { to: '/courses', tag: '课程', title: '成长内容', desc: '沟通和亲密关系课程。' },
      { to: '/experts', tag: '咨询', title: '专业支持', desc: '当关系卡住时，找专业的人聊。' },
      { to: '/membership', tag: '会员', title: '会员方案', desc: '解锁全部功能。' },
    ],
  },
]
</script>

<style scoped>
.discover-page {
  width: min(var(--content-max), calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 28px;
}

.discover-head {
  width: 100%;
}

.main-lines {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 26px;
}

.discover-entry {
  position: relative;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.72);
  color: var(--ink);
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.discover-entry::before {
  content: "";
  position: absolute;
  left: 18px;
  right: 18px;
  top: 48px;
  height: 1px;
  background: var(--border);
}

.discover-entry:hover,
.discover-card:hover {
  transform: translateY(-2px);
  border-color: rgba(189, 75, 53, 0.32);
  background: rgba(255, 253, 250, 0.94);
}

.discover-entry--primary {
  border-color: rgba(189, 75, 53, 0.32);
  background: rgba(243, 216, 208, 0.3);
}

.discover-entry span {
  color: var(--seal);
  font-size: 12px;
  font-weight: 700;
}

.discover-entry strong {
  display: block;
  max-width: 260px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.35;
}

.discover-entry i {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 22px;
  height: 1px;
  background: currentColor;
}

.discover-entry i::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -4px;
  width: 9px;
  height: 9px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(-45deg);
}

.tool-catalog {
  border-top: 1px solid var(--border-strong);
  padding-top: 22px;
}

.service-shelf {
  margin: 0 0 26px;
  padding: 18px;
  border: 1px solid rgba(189, 75, 53, 0.28);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(255, 253, 250, 0.86), rgba(235, 242, 232, 0.36));
}

.service-shelf__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 14px;
}

.service-shelf__head h3 {
  max-width: 520px;
  font-family: var(--font-serif);
  font-size: 22px;
  line-height: 1.35;
}

.service-shelf__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.service-entry {
  min-height: 164px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(44, 48, 39, 0.12);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.74);
  color: var(--ink);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.service-entry:hover {
  transform: translateY(-2px);
  border-color: rgba(189, 75, 53, 0.32);
  background: rgba(255, 253, 250, 0.94);
}

.service-entry span {
  padding: 5px 9px;
  border: 1px solid rgba(189, 75, 53, 0.22);
  border-radius: var(--radius-md);
  color: var(--seal-deep);
  background: var(--seal-soft);
  font-size: 12px;
  font-weight: 800;
}

.service-entry strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.35;
}

.service-entry p {
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.6;
}

.service-entry small {
  color: var(--moss-deep);
  font-weight: 800;
}

.catalog-head {
  margin-bottom: 16px;
}

.catalog-head h3 {
  font-family: var(--font-serif);
  font-size: 22px;
}

.catalog-groups {
  display: grid;
  gap: 14px;
}

.catalog-group {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.56);
}

.catalog-group__head {
  display: flex;
  gap: 12px;
}

.catalog-group__head > span {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(78, 116, 91, 0.28);
  border-radius: var(--radius-lg);
  color: var(--moss-deep);
  background: var(--moss-soft);
  font-weight: 800;
}

.catalog-group__head h4 {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.35;
}

.catalog-group__head p {
  margin-top: 4px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}

.catalog-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.discover-card {
  min-height: 126px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 14px;
  border: 1px solid rgba(44, 48, 39, 0.12);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 250, 0.68);
  color: var(--ink);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.discover-card strong {
  display: block;
  color: var(--ink);
  font-size: 15px;
}

.discover-card p {
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .main-lines,
  .catalog-group,
  .service-shelf__grid {
    grid-template-columns: 1fr;
  }

  .service-shelf__head {
    display: block;
  }
}

@media (max-width: 600px) {
  .discover-page {
    width: min(100% - 24px, var(--content-max));
  }

  .main-lines {
    gap: 8px;
  }

  .discover-entry {
    min-height: 108px;
  }
}
</style>
