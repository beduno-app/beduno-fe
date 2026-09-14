<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { exportsApi } from '../api/exports.api'
import { useExportDownload } from '../composables/useExportDownload'
import type { ExportLanguage } from '../types/export.types'
import { BaseButton } from '@/shared/components'
import ReportCard from '../components/ReportCard.vue'

const { t, locale } = useI18n()
const propertiesStore = usePropertiesStore()

// Page-level language selector (independent of UI locale)
const exportLang = ref<ExportLanguage>((locale.value.toUpperCase() as ExportLanguage) || 'EN')

const langOptions: Array<{ value: ExportLanguage; label: string }> = [
  { value: 'PL', label: 'Polski' },
  { value: 'EN', label: 'English' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'UA', label: 'Українська' },
  { value: 'RU', label: 'Русский' },
]

// Occupancy export filters
const occupancyPropertyId = ref('')
const occupancyDate = ref(new Date().toISOString().slice(0, 10))
const occupancyExport = useExportDownload()

// Exception report filters
const exceptionPropertyId = ref('')
const exceptionDate = ref(new Date().toISOString().slice(0, 10))
const exceptionExport = useExportDownload()

// Arrivals export filters
const arrivalsPropertyId = ref('')
const arrivalsDate = ref(new Date().toISOString().slice(0, 10))
const arrivalsExport = useExportDownload()

onMounted(() => {
  propertiesStore.fetchProperties()
})
</script>

<template>
  <div class="export-center">
    <div class="page-header">
      <h2>{{ t('nav.exports') }}</h2>
    </div>

    <div class="lang-selector">
      <label class="field-label">{{ t('exports.exportLanguage') }}</label>
      <select
        v-model="exportLang"
        class="field-select"
      >
        <option
          v-for="opt in langOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <span class="lang-note">{{ t('exports.languageNote') }}</span>
    </div>

    <div class="cards">
      <!-- Nightly Occupancy -->
      <ReportCard
        :title="t('exports.nightlyOccupancy.title')"
        :description="t('exports.nightlyOccupancy.description')"
        :error="occupancyExport.error.value"
      >
        <template #filters>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectProperty') }}</label>
            <select
              v-model="occupancyPropertyId"
              class="field-select"
            >
              <option value="">
                {{ t('exports.selectProperty') }}
              </option>
              <option
                v-for="p in propertiesStore.properties"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectDate') }}</label>
            <input
              v-model="occupancyDate"
              type="date"
              class="field-input"
            >
          </div>
        </template>
        <template #actions>
          <BaseButton
            variant="secondary"
            :disabled="!occupancyPropertyId"
            :loading="occupancyExport.isGenerating.value"
            @click="occupancyExport.download(
              () => exportsApi.exportOccupancy({ propertyId: occupancyPropertyId, date: occupancyDate, language: exportLang }),
              `occupancy-${occupancyDate}.csv`
            )"
          >
            {{ t('exports.exportCsv') }}
          </BaseButton>
        </template>
      </ReportCard>

      <!-- Exception Report -->
      <ReportCard
        :title="t('exports.exceptionReport.title')"
        :description="t('exports.exceptionReport.description')"
        :error="exceptionExport.error.value"
      >
        <template #filters>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectProperty') }}</label>
            <select
              v-model="exceptionPropertyId"
              class="field-select"
            >
              <option value="">
                {{ t('exports.selectProperty') }}
              </option>
              <option
                v-for="p in propertiesStore.properties"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectDate') }}</label>
            <input
              v-model="exceptionDate"
              type="date"
              class="field-input"
            >
          </div>
        </template>
        <template #actions>
          <BaseButton
            variant="secondary"
            :disabled="!exceptionPropertyId"
            :loading="exceptionExport.isGenerating.value"
            @click="exceptionExport.download(
              () => exportsApi.exportExceptions({ propertyId: exceptionPropertyId, date: exceptionDate, language: exportLang }),
              `exceptions-${exceptionDate}.csv`
            )"
          >
            {{ t('exports.exportCsv') }}
          </BaseButton>
        </template>
      </ReportCard>

      <!-- Arrivals -->
      <ReportCard
        :title="t('exports.arrivals.title')"
        :description="t('exports.arrivals.description')"
        :error="arrivalsExport.error.value"
      >
        <template #filters>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectProperty') }}</label>
            <select
              v-model="arrivalsPropertyId"
              class="field-select"
            >
              <option value="">
                {{ t('exports.selectProperty') }}
              </option>
              <option
                v-for="p in propertiesStore.properties"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('exports.selectDate') }}</label>
            <input
              v-model="arrivalsDate"
              type="date"
              class="field-input"
            >
          </div>
        </template>
        <template #actions>
          <BaseButton
            variant="secondary"
            :disabled="!arrivalsPropertyId"
            :loading="arrivalsExport.isGenerating.value"
            @click="arrivalsExport.download(
              () => exportsApi.exportArrivals({ propertyId: arrivalsPropertyId, date: arrivalsDate, language: exportLang }),
              `arrivals-${arrivalsDate}.csv`
            )"
          >
            {{ t('exports.exportCsv') }}
          </BaseButton>
        </template>
      </ReportCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.export-center {
  max-width: 960px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.lang-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.875rem 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.lang-note {
  font-size: 0.8125rem;
  color: #9ca3af;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.field-select,
.field-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fff;
  color: #111827;
  min-width: 160px;

  &:focus {
    outline: none;
    border-color: #e66e00;
  }
}
</style>
