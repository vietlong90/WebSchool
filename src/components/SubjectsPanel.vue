<template>
  <Card>
    <template #title>
      <span><i class="pi pi-book mr-2"></i>Danh sách môn học</span>
    </template>
    <template #content>
      <div class="subjects-list">
        <div v-if="!store.subjects.length" class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>Chưa có môn học nào.<br>Nhấn "Thêm môn" để bắt đầu.</p>
        </div>

        <div class="subject-header" v-if="store.subjects.length">
          <span class="col-name">Tên môn</span>
          <span class="col-periods">Số tiết / kỳ</span>
          <span class="col-double">Đôi tiết</span>
          <span class="col-action"></span>
        </div>

        <div
          v-for="subj in store.subjects"
          :key="subj.id"
          class="subject-row"
        >
          <InputText
            v-model="subj.name"
            placeholder="Tên môn học"
            class="col-name"
          />
          <InputNumber
            v-model="subj.totalPeriods"
            :min="1"
            :max="500"
            placeholder="Số tiết"
            class="col-periods"
          />
          <div class="col-double double-toggle">
            <ToggleSwitch
              v-model="subj.allowDouble"
              :input-id="`double-${subj.id}`"
            />
          </div>
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            class="col-action"
            @click="store.removeSubject(subj.id)"
          />
        </div>
      </div>

      <div class="add-bar">
        <Button
          label="Thêm môn"
          icon="pi pi-plus"
          outlined
          @click="store.addSubject()"
        />
        <span v-if="store.subjects.length" class="total-info">
          {{ store.subjects.length }} môn &middot;
          {{ totalPeriodsPerWeek }} tiết/tuần
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'

const store = useScheduleStore()

const totalPeriodsPerWeek = computed(() =>
  store.subjects
    .filter(s => s.totalPeriods > 0)
    .reduce((sum, s) => sum + Math.ceil(s.totalPeriods / store.weekCount), 0),
)
</script>

<style scoped>
.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
  min-height: 60px;
}
.subject-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.subject-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.col-name { flex: 1; min-width: 0; }
.col-periods { width: 110px; flex-shrink: 0; }
.col-double {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.col-action {
  width: 36px;
  flex-shrink: 0;
}
.double-toggle {
  align-items: center;
}
.empty-state {
  text-align: center;
  color: var(--p-text-muted-color);
  padding: 2rem 0;
}
.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}
.add-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.total-info {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
</style>
