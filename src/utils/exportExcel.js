import ExcelJS from 'exceljs'

const DAY_LABELS = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' }
const SESSION_LABELS = { morning: 'Sáng', afternoon: 'Chiều' }

function toARGB(hex) {
  return 'FF' + hex.replace('#', '').toUpperCase()
}

export async function exportTimetableToExcel({ timetable, semester, weekCount }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WebSchool'
  wb.created = new Date()

  const ws = wb.addWorksheet('Thời khoá biểu', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 3 }],
  })

  const { grid, sessions, days, subjects, subjectMap } = timetable
  const PERIODS = 5
  const totalCols = 2 + days.length // Buổi + Tiết + each day

  // --- Title row ---
  ws.mergeCells(1, 1, 1, totalCols)
  const titleCell = ws.getCell(1, 1)
  titleCell.value = `THỜI KHOÁ BIỂU - HỌC KỲ ${semester} (${weekCount} tuần)`
  titleCell.font = { name: 'Arial', size: 14, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 28

  // Row 2 empty spacer
  ws.getRow(2).height = 6

  // --- Header row (row 3) ---
  const headerRow = ws.getRow(3)
  headerRow.values = ['Buổi', 'Tiết', ...days.map(d => DAY_LABELS[d])]
  headerRow.height = 24
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    }
  })

  // --- Body rows ---
  let rowIdx = 4
  for (const sess of sessions) {
    const sessStartRow = rowIdx

    for (let p = 0; p < PERIODS; p++) {
      const row = ws.getRow(rowIdx)
      row.height = 30

      // Session label (only on first period of the session, merged vertically)
      if (p === 0) {
        ws.mergeCells(rowIdx, 1, rowIdx + PERIODS - 1, 1)
        const sessCell = ws.getCell(rowIdx, 1)
        sessCell.value = SESSION_LABELS[sess]
        sessCell.font = { name: 'Arial', size: 11, bold: true }
        sessCell.alignment = { horizontal: 'center', vertical: 'middle' }
        sessCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
      }

      // Period number
      const periodCell = ws.getCell(rowIdx, 2)
      periodCell.value = p + 1
      periodCell.font = { name: 'Arial', size: 10, color: { argb: 'FF64748B' } }
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
      periodCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }

      // Subject cells per day
      days.forEach((day, dIdx) => {
        const col = 3 + dIdx
        const slot = grid[day][sess][p]
        const cell = ws.getCell(rowIdx, col)
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.font = { name: 'Arial', size: 10, bold: true }

        if (slot.isSelfStudy) {
          cell.value = 'Tự học'
          cell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF94A3B8' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
        } else if (slot.subjectId) {
          const subj = subjectMap[slot.subjectId]
          if (subj) {
            cell.value = subj.name
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: toARGB(subj.color.text) } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toARGB(subj.color.bg) } }
          }
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        }
      })

      // Border for session + period columns
      for (const c of [1, 2]) {
        ws.getCell(rowIdx, c).border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        }
      }

      rowIdx++
    }
    void sessStartRow
  }

  // --- Legend section ---
  rowIdx += 1
  const legendTitleCell = ws.getCell(rowIdx, 1)
  legendTitleCell.value = 'Chú thích'
  legendTitleCell.font = { name: 'Arial', size: 12, bold: true }
  ws.mergeCells(rowIdx, 1, rowIdx, totalCols)
  rowIdx++

  // Legend header
  const legendHeaderRow = ws.getRow(rowIdx)
  legendHeaderRow.values = ['Màu', 'Môn học', 'Tiết/tuần', 'Tổng tiết cả kỳ']
  legendHeaderRow.eachCell((cell, col) => {
    if (col <= 4) {
      cell.font = { name: 'Arial', size: 10, bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      }
    }
  })
  rowIdx++

  // Legend items
  for (const subj of subjects) {
    const row = ws.getRow(rowIdx)
    const colorCell = row.getCell(1)
    colorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: toARGB(subj.color.bg) } }
    colorCell.value = ''

    row.getCell(2).value = subj.name
    row.getCell(3).value = `${subj.periodsPerWeek} tiết/tuần`
    row.getCell(4).value = `${subj.totalPeriods} tiết`

    for (let c = 1; c <= 4; c++) {
      const cell = row.getCell(c)
      cell.alignment = { horizontal: c === 2 ? 'left' : 'center', vertical: 'middle' }
      cell.font = cell.font || { name: 'Arial', size: 10 }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      }
    }
    rowIdx++
  }

  // --- Column widths ---
  ws.getColumn(1).width = 10
  ws.getColumn(2).width = 8
  for (let i = 0; i < days.length; i++) {
    ws.getColumn(3 + i).width = 18
  }

  // --- Download ---
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `thoi-khoa-bieu-hk${semester}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
