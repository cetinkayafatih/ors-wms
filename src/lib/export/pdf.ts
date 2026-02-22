import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFOptions {
  title: string;
  subtitle?: string;
  date?: string;
}

function createPDFBase(options: PDFOptions): jsPDF {
  const doc = new jsPDF();
  const { title, subtitle, date } = options;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(title, 14, 20);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(subtitle, 14, 28);
  }

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(`Olusturma Tarihi: ${date || new Date().toLocaleDateString('tr-TR')}`, 14, subtitle ? 35 : 28);
  doc.text('Corap WMS - Depo Yonetim Sistemi', 14, subtitle ? 40 : 33);

  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(14, subtitle ? 43 : 36, 196, subtitle ? 43 : 36);

  return doc;
}

export function exportABCAnalysisPDF(
  results: Array<{
    rank: number;
    class: string;
    item: { name: string; sku?: string; annualUsageValue: number };
    valuePercentage: number;
    cumulativePercentage: number;
  }>
) {
  const doc = createPDFBase({
    title: 'ABC Analiz Raporu',
    subtitle: `${results.length} kalem Pareto analizi`,
  });

  autoTable(doc, {
    startY: 48,
    head: [['Sira', 'Sinif', 'Urun', 'SKU', 'Yillik Deger (TL)', 'Deger %', 'Kumulatif %']],
    body: results.map((r) => [
      String(r.rank),
      r.class,
      r.item.name,
      r.item.sku || '',
      r.item.annualUsageValue.toLocaleString('tr-TR'),
      `${r.valuePercentage}%`,
      `${r.cumulativePercentage}%`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 64, 175] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const cls = (data.row.raw as unknown[])?.[1];
        if (cls === 'A') data.cell.styles.fillColor = [254, 226, 226]; // red-100
        else if (cls === 'B') data.cell.styles.fillColor = [254, 249, 195]; // yellow-100
        else data.cell.styles.fillColor = [220, 252, 231]; // green-100
      }
    },
  });

  doc.save('abc-analiz-raporu.pdf');
}

export function exportComparisonReportPDF(
  metrics: Array<{
    metricNameTr: string;
    beforeMean: number;
    afterMean: number;
    improvementPercent: number;
    unit: string;
  }>,
  tTestResults: Array<{
    tValue: number;
    pValue: number;
    isSignificant: boolean;
  }>
) {
  const doc = createPDFBase({
    title: 'WMS Once/Sonra Karsilastirma Raporu',
    subtitle: `${metrics.length} metrik analizi`,
  });

  autoTable(doc, {
    startY: 48,
    head: [['Metrik', 'Oncesi', 'Sonrasi', 'Iyilestirme', 't-Degeri', 'p-Degeri', 'Anlamli']],
    body: metrics.map((m, i) => [
      m.metricNameTr,
      `${m.beforeMean} ${m.unit}`,
      `${m.afterMean} ${m.unit}`,
      `${m.improvementPercent > 0 ? '+' : ''}${m.improvementPercent.toFixed(1)}%`,
      tTestResults[i]?.tValue?.toFixed(3) || '-',
      tTestResults[i]?.pValue?.toFixed(4) || '-',
      tTestResults[i]?.isSignificant ? 'Evet' : 'Hayir',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  doc.save('once-sonra-karsilastirma-raporu.pdf');
}
