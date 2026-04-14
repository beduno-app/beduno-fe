<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import jsQR from 'jsqr'
import { BaseButton } from '@/shared/components'

const emit = defineEmits<{
  scanned: [qrCode: string]
  cancel: []
}>()

const { t } = useI18n()

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const error = ref('')
const isScanning = ref(false)
let stream: MediaStream | null = null
let animationId: number | null = null

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      isScanning.value = true
      scanLoop()
    }
  } catch {
    error.value = t('arrivals.cameraError')
  }
}

function scanLoop() {
  if (!videoRef.value || !canvasRef.value || !isScanning.value) return

  const video = videoRef.value
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    animationId = requestAnimationFrame(scanLoop)
    return
  }

  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  })

  if (code) {
    emit('scanned', code.data)
    stopCamera()
    return
  }

  animationId = requestAnimationFrame(scanLoop)
}

function stopCamera() {
  isScanning.value = false
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
}

onMounted(startCamera)
onUnmounted(stopCamera)
</script>

<template>
  <div class="qr-checkin">
    <h3 class="qr-title">
      {{ t('arrivals.scanQr') }}
    </h3>

    <div
      v-if="error"
      class="qr-error"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="video-container"
    >
      <video
        ref="videoRef"
        class="camera-feed"
        playsinline
        muted
      />
      <canvas
        ref="canvasRef"
        class="hidden-canvas"
      />
      <div class="scan-overlay">
        <div class="scan-frame" />
      </div>
    </div>

    <div class="qr-actions">
      <BaseButton
        variant="secondary"
        size="sm"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qr-checkin {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.qr-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.qr-error {
  padding: 1.5rem;
  text-align: center;
  color: #dc2626;
  background: #fee2e2;
  border-radius: 0.375rem;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #000;
}

.camera-feed {
  width: 100%;
  display: block;
}

.hidden-canvas {
  display: none;
}

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-frame {
  width: 200px;
  height: 200px;
  border: 2px solid #e66e00;
  border-radius: 0.5rem;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
}

.qr-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
