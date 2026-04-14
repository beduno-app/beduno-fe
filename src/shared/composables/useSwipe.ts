import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface SwipeOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe(el: Ref<HTMLElement | null>, options: SwipeOptions = {}) {
  const { threshold = 60, onSwipeLeft, onSwipeRight } = options

  let startX = 0
  let startY = 0

  function onTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }

  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX
    const dy = e.changedTouches[0].clientY - startY

    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) < threshold) return

    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  onMounted(() => {
    el.value?.addEventListener('touchstart', onTouchStart, { passive: true })
    el.value?.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    el.value?.removeEventListener('touchstart', onTouchStart)
    el.value?.removeEventListener('touchend', onTouchEnd)
  })
}
