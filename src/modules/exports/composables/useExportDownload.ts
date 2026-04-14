import { ref } from 'vue'

export function useExportDownload() {
  const isGenerating = ref(false)
  const error = ref('')

  async function download(fetcher: () => Promise<Blob>, filename: string): Promise<void> {
    isGenerating.value = true
    error.value = ''
    try {
      const blob = await fetcher()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Export failed'
    } finally {
      isGenerating.value = false
    }
  }

  return { isGenerating, error, download }
}
