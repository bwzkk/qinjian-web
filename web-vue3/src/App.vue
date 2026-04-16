<template>
  <div id="app-shell" :class="{ 'has-tabbar': showChrome }">
    <AppHeader v-if="showChrome" />
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition
          name="page"
          @before-leave="prepareRouteLeave"
          @after-leave="resetRouteLeave"
          @leave-cancelled="resetRouteLeave"
        >
          <component :is="Component" :key="route.fullPath" class="route-view" />
        </transition>
      </router-view>
    </main>
    <TabBar v-if="showChrome" />
    <div ref="toastRef" class="toast" :class="{ show: toast.visible }">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { provide, ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { warmCoreRouteComponents } from '@/router'
import AppHeader from '@/components/AppHeader.vue'
import TabBar from '@/components/TabBar.vue'

const userStore = useUserStore()
const route = useRoute()
const showChrome = computed(() => userStore.isLoggedIn && route.name !== 'auth')

const toast = reactive({ visible: false, message: '' })
let toastTimer = null

function showToast(message, duration = 2400) {
  toast.message = message
  toast.visible = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.visible = false }, duration)
}

provide('showToast', showToast)

function warmLoggedInRoutes() {
  if (userStore.isLoggedIn) {
    warmCoreRouteComponents()
  }
}

function prepareRouteLeave(el) {
  const measuredRect = el.getBoundingClientRect()
  const leaveRect = window.__qjRouteLeaveRect || measuredRect

  el.style.setProperty('--route-leave-top', `${leaveRect.top}px`)
  el.style.setProperty('--route-leave-left', `${leaveRect.left}px`)
  el.style.setProperty('--route-leave-width', `${leaveRect.width}px`)
}

function resetRouteLeave(el) {
  el.style.removeProperty('--route-leave-top')
  el.style.removeProperty('--route-leave-left')
  el.style.removeProperty('--route-leave-width')
}

onMounted(warmLoggedInRoutes)
watch(() => userStore.isLoggedIn, warmLoggedInRoutes, { flush: 'post' })
</script>

<style scoped>
#app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  flex: 1;
  padding-bottom: 0;
  position: relative;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, rgba(255, 250, 245, 0.3), rgba(255, 250, 245, 0.06)),
    radial-gradient(680px circle at 50% -10%, rgba(215, 104, 72, 0.08), transparent 58%);
}
#app-shell.has-tabbar .app-main {
  padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px));
}
.route-view {
  display: block;
}
</style>
