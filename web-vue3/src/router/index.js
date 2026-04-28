import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

function requireAuth(to, from, next) {
  const token = sessionStorage.getItem('qj_token')
  if (!token) return next('/auth')
  next()
}

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { title: '登录', guest: true },
  },
  {
    path: '/pair',
    name: 'pair',
    component: () => import('@/views/pair/PairPage.vue'),
    meta: { title: '建立关系' },
    beforeEnter: requireAuth,
  },
  {
    path: '/pair-waiting',
    name: 'pair-waiting',
    component: () => import('@/views/pair/PairWaitingPage.vue'),
    meta: { title: '等待加入' },
    beforeEnter: requireAuth,
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { title: '关系档案馆' },
    beforeEnter: requireAuth,
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: () => import('@/views/checkin/CheckinPage.vue'),
    meta: { title: '关系记录' },
    beforeEnter: requireAuth,
  },
  {
    path: '/discover',
    name: 'discover',
    component: () => import('@/views/discover/DiscoverPage.vue'),
    meta: { title: '目录' },
    beforeEnter: requireAuth,
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/views/report/ReportPage.vue'),
    meta: { title: '关系简报' },
    beforeEnter: requireAuth,
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: () => import('@/views/report/TimelinePage.vue'),
    meta: { title: '时间轴' },
    beforeEnter: requireAuth,
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/profile/ProfilePage.vue'),
    meta: { title: '我的' },
    beforeEnter: requireAuth,
  },
  {
    path: '/milestones',
    name: 'milestones',
    component: () => import('@/views/milestones/MilestonesPage.vue'),
    meta: { title: '关系纪念日' },
    beforeEnter: requireAuth,
  },
  {
    path: '/longdistance',
    name: 'longdistance',
    component: () => import('@/views/longdistance/LongDistancePage.vue'),
    meta: { title: '异地关系' },
    beforeEnter: requireAuth,
  },
  {
    path: '/health-test',
    name: 'health-test',
    component: () => import('@/views/health/HealthTestPage.vue'),
    meta: { title: '关系体检' },
    beforeEnter: requireAuth,
  },
  {
    path: '/attachment-test',
    name: 'attachment-test',
    component: () => import('@/views/health/AttachmentPage.vue'),
    meta: { title: '依恋类型' },
    beforeEnter: requireAuth,
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/community/CommunityPage.vue'),
    meta: { title: '关系技巧' },
    beforeEnter: requireAuth,
  },
  {
    path: '/challenges',
    name: 'challenges',
    component: () => import('@/views/challenges/ChallengesPage.vue'),
    meta: { title: '今日任务' },
    beforeEnter: requireAuth,
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/courses/CoursesPage.vue'),
    meta: { title: '课程' },
    beforeEnter: requireAuth,
  },
  {
    path: '/experts',
    name: 'experts',
    component: () => import('@/views/experts/ExpertsPage.vue'),
    meta: { title: '咨询' },
    beforeEnter: requireAuth,
  },
  {
    path: '/membership',
    name: 'membership',
    component: () => import('@/views/membership/MembershipPage.vue'),
    meta: { title: '会员' },
    beforeEnter: requireAuth,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  document.title = '亲健'
  const token = sessionStorage.getItem('qj_token')
  const userStore = useUserStore()
  if (to.meta.guest && token) {
    return next('/')
  }
  if (!to.meta.guest && token && !userStore.me) {
    const ok = await userStore.bootstrap()
    if (!ok) return next('/auth')
  }
  next()
})

export default router
