import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

const THRESHOLD = 72

export function usePullToRefresh(
  scrollEl: Ref<HTMLElement | null>,
  onRefresh: () => Promise<void>,
) {
  const isPulling = ref(false)
  const pullDistance = ref(0)
  const isRefreshing = ref(false)

  let startY = 0
  let tracking = false

  function onTouchStart(e: TouchEvent) {
    const el = scrollEl.value
    if (!el || el.scrollTop > 0) return
    startY = e.touches[0].clientY
    tracking = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!tracking) return
    const dy = e.touches[0].clientY - startY
    if (dy <= 0) {
      tracking = false
      isPulling.value = false
      pullDistance.value = 0
      return
    }
    isPulling.value = true
    pullDistance.value = Math.min(dy * 0.4, THRESHOLD * 1.5)
  }

  function onTouchEnd() {
    if (!isPulling.value) {
      tracking = false
      return
    }
    const triggered = pullDistance.value >= THRESHOLD * 0.65
    isPulling.value = false
    pullDistance.value = 0
    tracking = false

    if (triggered && !isRefreshing.value) {
      isRefreshing.value = true
      onRefresh().finally(() => {
        isRefreshing.value = false
      })
    }
  }

  onMounted(() => {
    const el = scrollEl.value
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = scrollEl.value
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  })

  return { isPulling, pullDistance, isRefreshing }
}
