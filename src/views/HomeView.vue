<template>
  <div class="page">
    <header class="page-header">
      <div class="header-inner">
        <i class="pi pi-calendar-plus header-icon"></i>
        <div>
          <h1 class="header-title">Tạo Thời Khoá Biểu</h1>
          <p class="header-sub">Tự động sắp xếp thời khoá biểu học kỳ cho học sinh</p>
        </div>
      </div>
    </header>

    <main class="page-main">
      <div class="config-grid">
        <SetupPanel />
        <SubjectsPanel />
      </div>

      <div class="action-bar">
        <Button
          label="Tạo thời khoá biểu"
          icon="pi pi-calendar-plus"
          size="large"
          @click="store.generate()"
        />
        <Button
          v-if="store.timetable || store.generateError"
          label="Đặt lại"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          @click="store.reset()"
        />
      </div>

      <Message v-if="store.generateError" severity="error" :closable="false">
        {{ store.generateError }}
      </Message>

      <TimetableOutput v-if="store.timetable" />
    </main>
  </div>
</template>

<script setup>
import { useScheduleStore } from '../stores/schedule'
import SetupPanel from '../components/SetupPanel.vue'
import SubjectsPanel from '../components/SubjectsPanel.vue'
import TimetableOutput from '../components/TimetableOutput.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

const store = useScheduleStore()
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--p-surface-ground);
}
.page-header {
  background: #fff;
  border-bottom: 1px solid var(--p-surface-border);
  padding: 1.5rem 2rem;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon {
  font-size: 2.25rem;
  color: var(--p-primary-color);
}
.header-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}
.header-sub {
  margin: 0.2rem 0 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}
.page-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.config-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
@media (max-width: 768px) {
  .config-grid { grid-template-columns: 1fr; }
  .page-main { padding: 1rem; }
  .page-header { padding: 1rem; }
}
</style>
