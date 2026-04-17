import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateTimetable } from '../utils/generateTimetable'

export const useScheduleStore = defineStore(
  'schedule',
  () => {
    const semester = ref(1)
    const weekCount = ref(18)
    const hasSaturday = ref(false)
    const sessionType = ref('morning')
    const hasSelfStudy = ref(false)
    const selfStudyDay = ref(null)
    const selfStudyPeriods = ref(1)
    const subjects = ref([])
    const timetable = ref(null)
    const generateError = ref(null)

    const days = computed(() => {
      const base = [2, 3, 4, 5, 6]
      return hasSaturday.value ? [...base, 7] : base
    })

    function addSubject() {
      subjects.value.push({
        id: Date.now(),
        name: '',
        totalPeriods: 35,
        allowDouble: false,
      })
    }

    function removeSubject(id) {
      subjects.value = subjects.value.filter(s => s.id !== id)
    }

    function generate() {
      generateError.value = null
      timetable.value = null
      try {
        timetable.value = generateTimetable({
          weekCount: weekCount.value,
          days: days.value,
          sessionType: sessionType.value,
          hasSelfStudy: hasSelfStudy.value,
          selfStudyDay: selfStudyDay.value,
          selfStudyPeriods: selfStudyPeriods.value,
          subjects: subjects.value,
        })
      } catch (e) {
        generateError.value = e.message
      }
    }

    function reset() {
      timetable.value = null
      generateError.value = null
    }

    return {
      semester, weekCount, hasSaturday, sessionType,
      hasSelfStudy, selfStudyDay, selfStudyPeriods,
      subjects, timetable, generateError, days,
      addSubject, removeSubject, generate, reset,
    }
  },
  {
    persist: {
      pick: ['semester', 'weekCount', 'hasSaturday', 'sessionType',
        'hasSelfStudy', 'selfStudyDay', 'selfStudyPeriods', 'subjects', 'timetable'],
    },
  },
)
