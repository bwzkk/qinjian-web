import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DEMO_TOKEN } from '@/demo/fixtures'
import { getAuthToken } from '@/utils/auth'

const viewLoaders = {
  auth: () => import('@/views/auth/LoginPage.vue'),
  pair: () => import('@/views/pair/PairPage.vue'),
  pairWaiting: () => import('@/views/pair/PairWaitingPage.vue'),
  home: () => import('@/views/home/HomePage.vue'),
  checkin: () => import('@/views/checkin/CheckinPage.vue'),
  discover: () => import('@/views/discover/DiscoverPage.vue'),
  report: () => import('@/views/report/ReportPage.vue'),
  timeline: () => import('@/views/report/TimelinePage.vue'),
  alignment: () => import('@/views/alignment/AlignmentPage.vue'),
  messageSimulation: () => import('@/views/coach/MessageSimulationPage.vue'),
  repairProtocol: () => import('@/views/coach/RepairProtocolPage.vue'),
  methodology: () => import('@/views/coach/MethodologyPage.vue'),
  relationshipSpaces: () => import('@/views/relationship/RelationshipSpacesPage.vue'),
  profile: () => import('@/views/profile/ProfilePage.vue'),
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

const coreRouteLoaders = [
  viewLoaders.home,
  viewLoaders.checkin,
  viewLoaders.discover,
  viewLoaders.report,
  viewLoaders.profile,
]

let coreRoutesWarmed = false

export function warmCoreRouteComponents() {
  if (coreRoutesWarmed || typeof window === 'undefined') return
  coreRoutesWarmed = true

  const warm = () => {
    coreRouteLoaders.forEach((load) => {
      load().catch(() => {
        coreRoutesWarmed = false
      })
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warm, { timeout: 1200 })
  } else {
    window.setTimeout(warm, 250)
  }
}

function requireAuth(to, from, next) {
  const token = getAuthToken()
  if (!token) return next('/auth')
  next()
}

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: viewLoaders.auth,
    meta: { title: '登录', guest: true },
  },
  {
    path: '/pair',
    name: 'pair',
    component: viewLoaders.pair,
    meta: { title: '建立关系' },
    beforeEnter: requireAuth,
  },
  {
    path: '/pair-waiting',
    name: 'pair-waiting',
    component: viewLoaders.pairWaiting,
    meta: { title: '等待加入' },
    beforeEnter: requireAuth,
  },
  {
    path: '/',
    name: 'home',
    component: viewLoaders.home,
    meta: { title: '关系档案馆' },
    beforeEnter: requireAuth,
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: viewLoaders.checkin,
    meta: { title: '关系记录' },
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
    meta: { title: '关系简报' },
    beforeEnter: requireAuth,
  },
  {
    path: '/alignment',
    name: 'alignment',
    component: viewLoaders.alignment,
    meta: { title: '双视角分析' },
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
    meta: { title: '修复协议' },
    beforeEnter: requireAuth,
  },
  {
    path: '/methodology',
    name: 'methodology',
    component: viewLoaders.methodology,
    meta: { title: '判断说明' },
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
    name: 'relationship-spaces',
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
    meta: { title: '今日任务' },
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
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

export default router
