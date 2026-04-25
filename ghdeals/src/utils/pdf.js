import jsPDF from 'jspdf'

function fmtN(n) {
  if (n == null || isNaN(n)) return '—'
  return '$' + Number(n).toLocaleString('en-US')
}

export function generateDealPDF(deal) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const r = deal.result
  const W = doc.internal.pageSize.getWidth()

  // Header bar
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, W, 64, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('GHH Acuasitions', 40, 38)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('Wholesale Deal Analysis', 40, 54)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(9)
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - 40, 38, { align: 'right' })

  // Address
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(deal.address, 40, 96)

  const propLine = [
    r.beds && `${r.beds} bed`,
    r.baths && `${r.baths} bath`,
    r.sqft && `${Number(r.sqft).toLocaleString()} sqft`,
    r.year_built && `Built ${r.year_built}`,
    r.repair_tier,
  ].filter(Boolean).join('  ·  ')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(propLine, 40, 112)

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(40, 124, W - 40, 124)

  // Key numbers boxes
  const boxes = [
    { label: 'ARV', value: fmtN(r.arv), color: [34, 197, 94] },
    { label: 'Repairs', value: fmtN(r.repairs), color: [239, 68, 68] },
    { label: `MAO (${r.mao_pct || 70}%)`, value: fmtN(r.mao), color: [59, 130, 246] },
    { label: 'Assignment Fee', value: fmtN(r.assignment_fee), color: [167, 139, 250] },
    { label: 'My Offer', value: fmtN(r.my_offer), color: [251, 191, 36] },
    { label: 'End Buyer Offer', value: fmtN(r.end_buyer_offer), color: [56, 189, 248] },
  ]

  const bW = (W - 80 - 20) / 3
  const bH = 58
  boxes.forEach((b, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 40 + col * (bW + 10)
    const y = 136 + row * (bH + 8)

    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, bW, bH, 4, 4, 'F')
    doc.setFillColor(...b.color)
    doc.rect(x, y, bW, 3, 'F')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(b.label.toUpperCase(), x + 10, y + 16)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...b.color)
    doc.text(b.value, x + 10, y + 38)
  })

  let y = 136 + 2 * (bH + 8) + 20

  // Repair breakdown
  if (r.repair_breakdown?.length) {
    doc.setFillColor(254, 242, 242)
    doc.roundedRect(40, y, W - 80, 20, 3, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(239, 68, 68)
    doc.text('REPAIR BREAKDOWN', 50, y + 14)
    y += 28

    r.repair_breakdown.forEach(item => {
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(40, y, W - 80, 36, 3, 3, 'FD')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(item.item, 52, y + 13)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(239, 68, 68)
      doc.text(fmtN(item.cost), W - 52, y + 13, { align: 'right' })

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      const reason = doc.splitTextToSize(item.reason, W - 120)
      doc.text(reason[0], 52, y + 27)

      y += 44
      if (y > 700) { doc.addPage(); y = 40 }
    })
    y += 8
  }

  // Comps
  if (r.comps?.length) {
    if (y > 650) { doc.addPage(); y = 40 }

    doc.setFillColor(239, 246, 255)
    doc.roundedRect(40, y, W - 80, 20, 3, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('COMPARABLE SALES', 50, y + 14)
    y += 28

    r.comps.forEach(comp => {
      if (y > 680) { doc.addPage(); y = 40 }

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(40, y, W - 80, 44, 3, 3, 'FD')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(comp.address, 52, y + 13)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(34, 197, 94)
      doc.text(fmtN(comp.sold_price), W - 52, y + 13, { align: 'right' })

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      const meta = [
        comp.beds && `${comp.beds}bd/${comp.baths}ba`,
        comp.sqft && `${Number(comp.sqft).toLocaleString()} sqft`,
        comp.sold_date,
        comp.distance_miles && `${comp.distance_miles}mi`,
        comp.condition,
      ].filter(Boolean).join('  ·  ')
      doc.text(meta, 52, y + 26)

      if (comp.note) {
        doc.setTextColor(148, 163, 184)
        doc.text(doc.splitTextToSize(comp.note, W - 120)[0], 52, y + 38)
      }

      y += 52
    })
    y += 8
  }

  // Risk flags
  if (r.risk_flags?.length) {
    if (y > 650) { doc.addPage(); y = 40 }

    doc.setFillColor(254, 249, 195)
    doc.roundedRect(40, y, W - 80, 20, 3, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(202, 138, 4)
    doc.text('RISK FLAGS', 50, y + 14)
    y += 28

    const sevColor = { high: [239, 68, 68], medium: [245, 158, 11], low: [34, 197, 94] }

    r.risk_flags.forEach(flag => {
      if (y > 680) { doc.addPage(); y = 40 }

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(40, y, W - 80, 44, 3, 3, 'FD')

      const c = sevColor[flag.severity] || [100, 116, 139]
      doc.setFillColor(...c)
      doc.roundedRect(52, y + 8, 36, 14, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(flag.severity.toUpperCase(), 70, y + 18, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(flag.flag, 96, y + 17)

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      const detail = doc.splitTextToSize(flag.detail, W - 120)
      doc.text(detail[0], 52, y + 34)

      y += 52
    })
  }

  // Footer
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('GHH Acuasitions  ·  Always verify with live comps before submitting offers', 40, doc.internal.pageSize.getHeight() - 20)
    doc.text(`${i} / ${pages}`, W - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' })
  }

  doc.save(`GH-Deals-${deal.address.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
}
