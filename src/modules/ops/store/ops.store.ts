import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOpsStore = defineStore(
  'ops',
  () => {
    const selectedPropertyId = ref('')

    return { selectedPropertyId }
  },
  { persist: true },
)
