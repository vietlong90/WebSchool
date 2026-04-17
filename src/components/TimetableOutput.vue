<template>
  <Card>
    <template #title>
      <div class="tt-header">
        <span><i class="pi pi-calendar mr-2"></i>Thời Khoá Biểu — Tuần học</span>
        <div class="tt-actions">
          <span class="semester-tag">Học kỳ {{ store.semester }} · {{ store.weekCount }} tuần</span>
          <Button
            :label="exporting ? 'Đang xuất...' : 'Tải Excel'"
            icon="pi pi-file-excel"
            size="small"
            severity="success"
            :loading="exporting"
            @click="handleExport"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="table-wrapper">
        <table class="timetable">
          <thead>
            <tr>
              <th class="th-session">Buổi</th>
              <th class="th-period">Tiết</th>
              <th v-for="day in tt.days" :key="day">{{ DAY_LABELS[day] }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="sess in tt.sessions" :key="sess">
              <tr v-for="pIdx in 5" :key="`${sess}-${pIdx}`">
                <!-- Session label cell — only on first period -->
                <td v-if="pIdx === 1" :rowspan="5" class="td-session">
                  {{ SESSION_LABELS[sess] }}
                </td>
                <td class="td-period">{{ pIdx }}</td>
                <!-- Subject cells -->
                <td
                  v-for="day in tt.days"
                  :key="day"
                  class="td-subject"
                  :class="{
                    'is-self-study': getSlot(day, sess, pIdx - 1).isSelfStudy,
                    'is-empty': !getSlot(day, sess, pIdx - 1).subjectId && !getSlot(day, sess, pIdx - 1).isSelfStudy,
                  }"
                  :style="getCellStyle(day, sess, pIdx - 1)"
                >
                  <span class="cell-name">{{ getCellText(day, sess, pIdx - 1) }}</span>
                  <span v-if="isDoubleStart(day, sess, pIdx - 1)" class="double-badge">×2</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div v-for="subj in tt.subjects" :key="subj.id" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: subj.color.bg, borderColor: subj.color.text + '44' }"></span>
          <span class="legend-name">{{ subj.name }}</span>
          <span class="legend-meta">{{ subj.periodsPerWeek }} tiết/tuần</span>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import Card from 'primevue/card'
import Button from 'primevue/button'

const store = useScheduleStore()
const tt = computed(() => store.timetable)
const exporting = ref(false)

async function handleExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    const { exportTimetableToExcel } = await import('../utils/exportExcel')
    await exportTimetableToExcel({
      timetable: store.timetable,
      semester: store.semester,
      weekCount: store.weekCount,
    })
  } catch (e) {
    console.error('Xuất Excel thất bại:', e)
    alert('Xuất file Excel thất bại: ' + e.message)
  } finally {
    exporting.value = false
  }
}

const DAY_LABELS = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' }
const SESSION_LABELS = { morning: 'Sáng', afternoon: 'Chiều' }

function getSlot(day, sess, pIdx) {
  return tt.value.grid[day][sess][pIdx]
}

function getCellStyle(day, sess, pIdx) {
  const slot = getSlot(day, sess, pIdx)
  if (slot.isSelfStudy || !slot.subjectId) return {}
  const subj = tt.value.subjectMap[slot.subjectId]
  return subj ? { backgroundColor: subj.color.bg, color: subj.color.text } : {}
}

function getCellText(day, sess, pIdx) {
  const slot = getSlot(day, sess, pIdx)
  if (slot.isSelfStudy) return 'Tự học'
  if (!slot.subjectId) return ''
  return tt.value.subjectMap[slot.subjectId]?.name ?? ''
}

function isDoubleStart(day, sess, pIdx) {
  if (pIdx >= 4) return false
  const slots = tt.value.grid[day][sess]
  const curr = slots[pIdx]
  const next = slots[pIdx + 1]
  if (!curr.subjectId || curr.subjectId !== next?.subjectId) return false
  const prev = pIdx > 0 ? slots[pIdx - 1] : null
  return !prev || prev.subjectId !== curr.subjectId
}
</script>

<style scoped>
.tt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tt-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.semester-tag {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
  background: var(--p-surface-100);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.table-wrapper {
  overflow-x: auto;
}
.timetable {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
  font-size: 0.85rem;
}
.timetable thead tr th {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  padding: 0.55rem 0.75rem;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}
.timetable td {
  border: 1px solid var(--p-surface-border);
  text-align: center;
  vertical-align: middle;
  padding: 0;
}
.th-session { width: 52px; }
.th-period  { width: 44px; }
.td-session {
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--p-surface-50);
  letter-spacing: 0.05em;
}
.td-period {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50);
  width: 36px;
}
.td-subject {
  height: 42px;
  min-width: 80px;
  position: relative;
  transition: filter 0.15s;
  cursor: default;
}
.td-subject:hover { filter: brightness(0.94); }
.td-subject.is-self-study {
  background: #f1f5f9;
  color: #94a3b8;
  font-style: italic;
  font-size: 0.75rem;
}
.td-subject.is-empty {
  background: #fff;
}
.cell-name {
  display: block;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0 0.25rem;
  line-height: 1.3;
}
.double-badge {
  position: absolute;
  top: 3px;
  right: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 3px;
  padding: 1px 3px;
  line-height: 1;
}
/* Legend */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}
.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1.5px solid;
  flex-shrink: 0;
}
.legend-name { font-weight: 600; }
.legend-meta { color: var(--p-text-muted-color); }
</style>
