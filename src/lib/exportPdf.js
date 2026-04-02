import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Common PDF setup with Chinese-friendly font
function createPdf(title, subtitle) {
  const doc = new jsPDF()
  // Header
  doc.setFontSize(18)
  doc.setTextColor(14, 116, 144) // cyan-ish
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(subtitle || `Generated: ${new Date().toLocaleString('zh-TW')}`, 14, 28)
  doc.setDrawColor(200)
  doc.line(14, 31, 196, 31)
  return doc
}

// Export attendance records
export function exportAttendancePdf(records, filters = {}) {
  const doc = createPdf('Attendance Report', `Date: ${filters.date || 'All'} | Dept: ${filters.dept || 'All'}`)

  const head = [['#', 'Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status']]
  const body = records.map((r, i) => [
    i + 1,
    r.employee || '-',
    r.date || '-',
    r.clock_in || '-',
    r.clock_out || '-',
    r.hours ? `${r.hours}h` : '-',
    r.status || '-',
  ])

  autoTable(doc, {
    startY: 36,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: [14, 116, 144], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  const normal = records.filter(r => r.status === '正常').length
  const late = records.filter(r => r.status === '遲到').length
  const y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Total: ${records.length} | Normal: ${normal} | Late: ${late}`, 14, y)

  doc.save(`attendance-report-${filters.date || 'all'}.pdf`)
}

// Export salary records
export function exportSalaryPdf(records, month) {
  const doc = createPdf('Salary Report', `Month: ${month}`)

  const head = [['#', 'Employee', 'Base', 'Allowance', 'OT', 'Bonus', 'Deductions', 'Insurance', 'Net']]
  const body = records.map((r, i) => {
    const deductions = (r.absence_deduction || 0) + (r.late_deduction || 0) + (r.other_deduction || 0)
    return [
      i + 1,
      r.employee || '-',
      (r.base_salary || 0).toLocaleString(),
      (r.allowance || 0).toLocaleString(),
      (r.overtime || 0).toLocaleString(),
      (r.bonus || 0).toLocaleString(),
      deductions > 0 ? `-${deductions.toLocaleString()}` : '0',
      (r.insurance || 0).toLocaleString(),
      (r.net_salary || 0).toLocaleString(),
    ]
  })

  autoTable(doc, {
    startY: 36,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 8: { fontStyle: 'bold' } },
  })

  const totalNet = records.reduce((s, r) => s + (r.net_salary || 0), 0)
  const y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Employees: ${records.length} | Total Net: NT$ ${totalNet.toLocaleString()}`, 14, y)

  doc.save(`salary-report-${month}.pdf`)
}
