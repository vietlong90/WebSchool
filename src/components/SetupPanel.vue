<template>
  <Card>
    <template #title>
      <span><i class="pi pi-cog mr-2"></i>Cài đặt học kỳ</span>
    </template>
    <template #content>
      <div class="form-fields">

        <div class="field">
          <label>Học kỳ</label>
          <SelectButton
            v-model="store.semester"
            :options="semesterOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>

        <div class="field">
          <label>Số tuần học</label>
          <InputNumber
            v-model="store.weekCount"
            :min="1"
            :max="52"
            show-buttons
            fluid
          />
        </div>

        <div class="field-row">
          <label>Có học thứ 7</label>
          <ToggleSwitch v-model="store.hasSaturday" />
        </div>

        <div class="field">
          <label>Buổi học</label>
          <SelectButton
            v-model="store.sessionType"
            :options="sessionOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>

        <Divider />

        <div class="field-row">
          <label>Có tiết tự học</label>
          <ToggleSwitch v-model="store.hasSelfStudy" />
        </div>

        <template v-if="store.hasSelfStudy">
          <div class="field">
            <label>Ngày tự học</label>
            <Select
              v-model="store.selfStudyDay"
              :options="dayOptions"
              option-label="label"
              option-value="value"
              placeholder="Chọn ngày..."
              fluid
            />
          </div>

          <div class="field">
            <label>Số tiết tự học cuối buổi</label>
            <SelectButton
              v-model="store.selfStudyPeriods"
              :options="periodOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
            />
          </div>
        </template>

      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import Card from 'primevue/card'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Select from 'primevue/select'
import Divider from 'primevue/divider'

const store = useScheduleStore()

const semesterOptions = [
  { label: 'Học kỳ 1', value: 1 },
  { label: 'Học kỳ 2', value: 2 },
]

const sessionOptions = [
  { label: 'Buổi sáng', value: 'morning' },
  { label: 'Buổi chiều', value: 'afternoon' },
  { label: 'Cả ngày', value: 'full' },
]

const periodOptions = [
  { label: '1 tiết', value: 1 },
  { label: '2 tiết', value: 2 },
]

const DAY_LABELS = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' }
const dayOptions = computed(() =>
  store.days.map(d => ({ label: DAY_LABELS[d], value: d })),
)
</script>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}
.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field-row label {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
