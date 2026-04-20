import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import { DEMO_TOKEN } from '@/demo/fixtures'
import { getAuthToken } from '@/utils/auth'
import {
  RELATIONSHIP_INVITE_ROUTE,
  RELATIONSHIP_JOIN_ROUTE,
  RELATIONSHIP_LIST_ROUTE,
  RELATIONSHIP_MANAGEMENT_ROUTE,
  RELATIONSHIP_SPACE_DETAIL_ROUTE_PREFIX,
} from '@/utils/relationshipRouting'

const viewLoaders = {
  auth: () => import('@/views/auth/LoginPage.vue'),
  demo: () => import('@/views/demo/DemoEntryPage.vue'),
  pair: () => import('@/views/pair/PairPage.vue'),
  relationshipSpaces: () => import('@/views/relationship/RelationshipSpacesPage.vue'),
  home: () => import('@/views/home/HomePage.vue'),
  checkin: () => import('@/views/checkin/CheckinPage.vue'),
  discover: () => import('@/views/discover/DiscoverPage.vue'),
  report: () => import('@/views/report/ReportPage.vue'),
  timeline: () => import('@/views/report/TimelinePage.vue'),
  alignment: () => import('@/views/alignment/AlignmentPage.vue'),
  messageSimulation: () => import('@/views/coach/MessageSimulationPage.vue'),
  repairProtocol: () => import('@/views/coach/RepairProtocolPage.vue'),
  methodology: () => import('@/views/coach/MethodologyPage.vue'),
  profile: () => import('@/views/profile/ProfilePage.vue'),
  privacySecurity: () => import('@/views/profile/PrivacySecurityPage.vue'),
  milestones: () => import('@/views/milestones/MilestonesPage.vue'),
  longdistance: () => import('@/views/longdistance/LongDistancePage.vue'),
  healthTest: () => import('@/views/health/HealthTestPage.vue'),
  attachmentTest: () => import('@/views/health/AttachmentPage.vue'),
  community: () => import('@/views/community/CommunityPage.vue'),
  challenges: () => import('@/views/challenges/ChallengesPage.vue'),
  courses: () => import('@/views/courses/CoursesPage.vue'),
  experts: () => import('@/views/experts/ExpertsPage.vue'),
  membership: () => import('@/views/membership/MembershipPage.vue'),
}

const routeWarmupGroups = [
  [
    viewLoaders.home,
    viewLoaders.checkin,
    viewLoaders.discover,
    viewLoaders.report,
    viewLoaders.profile,
  ],
  [
    viewLoaders.alignment,
    viewLoaders.messageSimulation,
    viewLoaders.repairProtocol,
    viewLoaders.timeline,
    viewLoaders.methodology,
    viewLoaders.privacySecurity,
  ],
  [
    viewLoaders.milestones,
    viewLoaders.longdistance,
    viewLoaders.healthTest,
    viewLoaders.attachmentTest,
    viewLoaders.community,
    viewLoaders.challenges,
    viewLoaders.courses,
    viewLoaders.experts,
    viewLoaders.membership,
    viewLoaders.pair,
    viewLoaders.relationshipSpaces,
  ],
]

let coreRoutesWarmed = false

function scheduleRouteWarmup(callback, timeout = 1200) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  } else {
    window.setTimeout(callback, 250)
  }
}

export function warmCoreRouteComponents() {
  if (coreRoutesWarmed || typeof window === 'undefined') return
  coreRoutesWarmed = true
  let groupIndex = 0

  const warm = () => {
    const loaders = routeWarmupGroups[groupIndex] || []
    groupIndex += 1
    Promise.allSettled(loaders.map((load) => load())).then((results) => {
      if (results.some((result) => result.status === 'rejected')) {
        coreRoutesWarmed = false
        return
      }
      if (groupIndex < routeWarmupGroups.length) {
        scheduleRouteWarmup(warm, 900)
      }
    })
  }

  scheduleRouteWarmup(warm)
}

function requireAuth(to, from, next) {
  const token = getAuthToken()
  if (!token) return next('/auth')
  next()
}

const routes = [
  {
    path: '/login',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'auth',
    component: viewLoaders.auth,
    meta: { title: '登录', guest: true },
  },
  {
    path: '/demo',
    name: 'demo',
    component: viewLoaders.demo,
    meta: { title: '样例演示', guest: true },
  },
  {
    path: RELATIONSHIP_MANAGEMENT_ROUTE,
    name: 'pair',
    component: viewLoaders.pair,
    meta: { title: '关系管理' },
    beforeEnter: requireAuth,
  },
  {
    path: RELATIONSHIP_LIST_ROUTE,
    name: 'pair-list',
    component: viewLoaders.pair,
    meta: { title: '查看关系' },
    beforeEnter: requireAuth,
  },
  {
    path: RELATIONSHIP_INVITE_ROUTE,
    name: 'pair-invite',
    component: viewLoaders.pair,
    meta: { title: '发起邀请' },
    beforeEnter: requireAuth,
  },
  {
    path: RELATIONSHIP_JOIN_ROUTE,
    name: 'pair-join',
    component: viewLoaders.pair,
    meta: { title: '输入邀请码' },
    beforeEnter: requireAuth,
  },
  {
    path: '/pair-waiting',
    redirect: RELATIONSHIP_MANAGEMENT_ROUTE,
  },
  {
    path: '/',
    name: 'home',
    component: viewLoaders.home,
    meta: { title: '首页' },
    beforeEnter: requireAuth,
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: viewLoaders.checkin,
    meta: { title: '记录' },
    beforeEnter: requireAuth,
  },
  {
    path: '/discover',
    name: 'discover',
    component: viewLoaders.discover,
    meta: { title: '目录' },
    beforeEnter: requireAuth,
  },
  {
    path: '/report',
    name: 'report',
    component: viewLoaders.report,
    meta: { title: '简报' },
    beforeEnter: requireAuth,
  },
  {
    path: '/alignment',
    name: 'alignment',
    component: viewLoaders.alignment,
    meta: { title: '双视角' },
    beforeEnter: requireAuth,
  },
  {
    path: '/message-simulation',
    name: 'message-simulation',
    component: viewLoaders.messageSimulation,
    meta: { title: '聊天前预演' },
    beforeEnter: requireAuth,
  },
  {
    path: '/repair-protocol',
    name: 'repair-protocol',
    component: viewLoaders.repairProtocol,
    meta: { title: '缓和建议' },
    beforeEnter: requireAuth,
  },
  {
    path: '/methodology',
    name: 'methodology',
    component: viewLoaders.methodology,
    meta: { title: '建议说明' },
    beforeEnter: requireAuth,
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: viewLoaders.timeline,
    meta: { title: '时间轴' },
    beforeEnter: requireAuth,
  },
  {
    path: '/relationship-spaces',
    redirect: RELATIONSHIP_MANAGEMENT_ROUTE,
  },
  {
    path: `${RELATIONSHIP_SPACE_DETAIL_ROUTE_PREFIX}/:pairId`,
    name: 'relationship-space-detail',
    component: viewLoaders.relationshipSpaces,
    meta: { title: '关系空间' },
    beforeEnter: requireAuth,
  },
  {
    path: '/profile',
    name: 'profile',
    component: viewLoaders.profile,
    meta: { title: '我的' },
    beforeEnter: requireAuth,
  },
  {
    path: '/privacy-security',
    name: 'privacy-security',
    component: viewLoaders.privacySecurity,
    meta: { title: '隐私与安全' },
    beforeEnter: requireAuth,
  },
  {
    path: '/milestones',
    name: 'milestones',
    component: viewLoaders.milestones,
    meta: { title: '关系纪念日' },
    beforeEnter: requireAuth,
  },
  {
    path: '/longdistance',
    name: 'longdistance',
    component: viewLoaders.longdistance,
    meta: { title: '异地关系' },
    beforeEnter: requireAuth,
  },
  {
    path: '/health-test',
    name: 'health-test',
    component: viewLoaders.healthTest,
    meta: { title: '关系体检' },
    beforeEnter: requireAuth,
  },
  {
    path: '/attachment-test',
    name: 'attachment-test',
    component: viewLoaders.attachmentTest,
    meta: { title: '依恋类型' },
    beforeEnter: requireAuth,
  },
  {
    path: '/community',
    name: 'community',
    component: viewLoaders.community,
    meta: { title: '关系技巧' },
    beforeEnter: requireAuth,
  },
  {
    path: '/challenges',
    name: 'challenges',
    component: viewLoaders.challenges,
    meta: { title: '今日练习' },
    beforeEnter: requireAuth,
  },
  {
    path: '/courses',
    name: 'courses',
    component: viewLoaders.courses,
    meta: { title: '课程' },
    beforeEnter: requireAuth,
  },
  {
    path: '/experts',
    name: 'experts',
    component: viewLoaders.experts,
    meta: { title: '咨询' },
    beforeEnter: requireAuth,
  },
  {
    path: '/membership',
    name: 'membership',
    component: viewLoaders.membership,
    meta: { title: '会员' },
    beforeEnter: requireAuth,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/auth',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return {
        el: to.hash,
        top: 88,
      }
    }
    return { top: 0, left: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  if (typeof window !== 'undefined') {
    const routeView = document.querySelector('.route-view')
    if (routeView) {
      const rect = routeView.getBoundingClientRect()
      window.__qjRouteLeaveRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
      }
    } else {
      window.__qjRouteLeaveRect = null
    }
    window.__qjRouteLeaveScrollY = window.scrollY || 0
  }
  document.title = to.meta?.title ? `亲健 · ${to.meta.title}` : '亲健 · 先看见，再靠近'
  const token = getAuthToken()
  const userStore = useUserStore()
  if (to.meta.guest && token && token !== DEMO_TOKEN) {
    return next('/')
  }
  if (!to.meta.guest && token && !userStore.me) {
    const ok = await userStore.bootstrap()
    if (!ok) return next('/auth')
  }
  next()
})

router.afterEach((to, from) => {
  const token = getAuthToken()
  if (!token || token === DEMO_TOKEN || to.meta?.guest) return

  const userStore = useUserStore()
  Promise.resolve().then(() => api.logInteractionEvent({
    pair_id: userStore.currentPair?.id || null,
    source: 'client',
    event_type: 'page.view',
    page: String(to.name || 'unknown'),
    path: to.fullPath,
    target_type: 'route',
    target_id: String(to.name || ''),
    payload: {
      title: to.meta?.title || null,
      from: from?.fullPath || null,
    },
  })).catch(() => null)
})

export default router
