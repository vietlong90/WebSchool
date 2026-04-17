const SUBJECT_COLORS = [
  { bg: '#bfdbfe', text: '#1e40af' },
  { bg: '#fed7aa', text: '#9a3412' },
  { bg: '#bbf7d0', text: '#166534' },
  { bg: '#fde68a', text: '#92400e' },
  { bg: '#e9d5ff', text: '#6b21a8' },
  { bg: '#fbcfe8', text: '#9d174d' },
  { bg: '#99f6e4', text: '#134e4a' },
  { bg: '#fecaca', text: '#991b1b' },
  { bg: '#c7d2fe', text: '#3730a3' },
  { bg: '#d9f99d', text: '#365314' },
  { bg: '#cffafe', text: '#155e75' },
  { bg: '#fef9c3', text: '#713f12' },
]

export function generateTimetable({
  weekCount,
  days,
  sessionType,
  hasSelfStudy,
  selfStudyDay,
  selfStudyPeriods,
  subjects,
}) {
  const PERIODS = 5
  const sessions = sessionType === 'full' ? ['morning', 'afternoon'] : [sessionType]

  // Build slot grid
  const grid = {}
  for (const day of days) {
    grid[day] = {}
    for (const sess of sessions) {
      grid[day][sess] = Array.from({ length: PERIODS }, () => ({
        subjectId: null,
        isSelfStudy: false,
      }))
    }
    if (hasSelfStudy && selfStudyDay === day) {
      const lastSess = sessions[sessions.length - 1]
      for (let p = PERIODS - selfStudyPeriods; p < PERIODS; p++) {
        grid[day][lastSess][p].isSelfStudy = true
      }
    }
  }

  // Count available (non-self-study) slots
  let totalAvailable = 0
  for (const day of days) {
    for (const sess of sessions) {
      totalAvailable += grid[day][sess].filter(s => !s.isSelfStudy).length
    }
  }

  // Validate subjects
  const validSubjects = subjects.filter(s => s.name?.trim() && s.totalPeriods > 0)
  if (!validSubjects.length) {
    throw new Error('Chưa có môn học hợp lệ. Hãy thêm ít nhất một môn.')
  }

  const processed = validSubjects.map((s, i) => ({
    ...s,
    periodsPerWeek: Math.ceil(s.totalPeriods / weekCount),
    remaining: Math.ceil(s.totalPeriods / weekCount),
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }))
  processed.sort((a, b) => b.periodsPerWeek - a.periodsPerWeek)

  const totalRequired = processed.reduce((sum, s) => sum + s.periodsPerWeek, 0)
  if (totalRequired > totalAvailable) {
    throw new Error(
      `Không đủ tiết trống: cần ${totalRequired} tiết/tuần nhưng chỉ có ${totalAvailable} tiết/tuần. Hãy giảm số môn hoặc mở thêm buổi học.`,
    )
  }

  const subjectMap = Object.fromEntries(processed.map(s => [s.id, s]))

  // Track: which days each subject is already placed on
  const subjectPlacedDays = Object.fromEntries(processed.map(s => [s.id, new Set()]))

  // Track: total periods placed per day (for even distribution)
  const dayLoad = Object.fromEntries(days.map(d => [d, 0]))

  // --- Helpers ---

  // First free single slot on a day
  function findFreeSlot(day) {
    for (const sess of sessions) {
      const slots = grid[day][sess]
      for (let p = 0; p < PERIODS; p++) {
        if (!slots[p].isSelfStudy && !slots[p].subjectId) return { sess, p }
      }
    }
    return null
  }

  // First pair of consecutive free slots on a day (for double period)
  function findConsecutiveFreeSlots(day) {
    for (const sess of sessions) {
      const slots = grid[day][sess]
      for (let p = 0; p <= PERIODS - 2; p++) {
        if (
          !slots[p].isSelfStudy && !slots[p].subjectId &&
          !slots[p + 1].isSelfStudy && !slots[p + 1].subjectId
        ) return { sess, p }
      }
    }
    return null
  }

  // Whether a candidate day is adjacent (consecutive) to any already-placed day for this subject
  function isAdjacentToPlaced(subjectId, candidateDay) {
    const placed = subjectPlacedDays[subjectId]
    const idx = days.indexOf(candidateDay)
    const prev = idx > 0 ? days[idx - 1] : null
    const next = idx < days.length - 1 ? days[idx + 1] : null
    return (prev !== null && placed.has(prev)) || (next !== null && placed.has(next))
  }

  // Place a subject on a specific slot
  function place(subjectId, day, sess, p) {
    grid[day][sess][p].subjectId = subjectId
    dayLoad[day]++
    subjectPlacedDays[subjectId].add(day)
  }

  // Choose the best day to place a period for this subject:
  // 1. Not already used by this subject
  // 2. Prefer non-adjacent to existing placements (no consecutive days rule)
  // 3. Among candidates, pick the least-loaded day (even distribution)
  function chooseBestDay(subjectId, needConsecutiveSlots = false) {
    const placed = subjectPlacedDays[subjectId]

    const available = days.filter(day => {
      if (placed.has(day)) return false
      return needConsecutiveSlots ? !!findConsecutiveFreeSlots(day) : !!findFreeSlot(day)
    })

    if (!available.length) return null

    // Prefer days not adjacent to already-placed days
    const nonAdjacent = available.filter(d => !isAdjacentToPlaced(subjectId, d))
    const candidates = nonAdjacent.length > 0 ? nonAdjacent : available

    // Pick least-loaded day for even distribution
    return candidates.reduce((best, d) => (dayLoad[d] < dayLoad[best] ? d : best))
  }

  // --- Phase 1: Place double periods (one per allowDouble subject) ---
  for (const subj of processed) {
    if (!subj.allowDouble || subj.remaining < 2) continue

    const day = chooseBestDay(subj.id, true)
    if (day === null) continue

    const slot = findConsecutiveFreeSlots(day)
    if (!slot) continue

    grid[day][slot.sess][slot.p].subjectId = subj.id
    grid[day][slot.sess][slot.p + 1].subjectId = subj.id
    dayLoad[day] += 2
    subjectPlacedDays[subj.id].add(day)
    subj.remaining -= 2
  }

  // --- Phase 2: Place single periods (even distribution + no consecutive days) ---
  for (const subj of processed) {
    while (subj.remaining > 0) {
      const day = chooseBestDay(subj.id, false)
      if (day === null) break

      const slot = findFreeSlot(day)
      if (!slot) break

      place(subj.id, day, slot.sess, slot.p)
      subj.remaining--
    }

    // Fallback: if still remaining, relax all constraints and fill any free slot
    if (subj.remaining > 0) {
      outer: for (const day of days) {
        for (const sess of sessions) {
          for (let p = 0; p < PERIODS; p++) {
            if (subj.remaining <= 0) break outer
            const slot = grid[day][sess][p]
            if (!slot.isSelfStudy && !slot.subjectId) {
              slot.subjectId = subj.id
              dayLoad[day]++
              subj.remaining--
            }
          }
        }
      }
    }
  }

  return { grid, sessions, days, subjects: processed, subjectMap }
}
