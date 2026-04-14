import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let _nextId = 1
const _toasts = ref<Toast[]>([])

export function useToast() {
  function add(type: ToastType, message: string, duration = 4000): void {
    const id = _nextId++
    _toasts.value.push({ id, type, message })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number): void {
    const idx = _toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) _toasts.value.splice(idx, 1)
  }

  return {
    toasts: _toasts,
    success: (message: string, duration?: number) => add('success', message, duration),
    error: (message: string, duration?: number) => add('error', message, duration),
    warning: (message: string, duration?: number) => add('warning', message, duration),
    remove,
  }
}
