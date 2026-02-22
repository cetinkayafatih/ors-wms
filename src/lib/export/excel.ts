import * as XLSX from 'xlsx';

interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
}

function createWorkbook(sheets: ExcelSheet[], filename: string) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }

  XLSX.writeFile(wb, filename);
}

export function exportInventoryExcel(
  inventory: Array<{
    sku: string;
    name: string;
    category: string;
    quantity: number;
    location: string;
    unitCost: number;
    totalValue: number;
    status: string;
  }>
) {
  createWorkbook(
    [{
      name: 'Envanter',
      data: inventory.map((i) => ({
        'SKU': i.sku,
        'Urun Adi': i.name,
        'Kategori': i.category,
        'Miktar': i.quantity,
        'Konum': i.location,
        'Birim Maliyet (TL)': i.unitCost,
        'Toplam Deger (TL)': i.totalValue,
        'Durum': i.status,
      })),
    }],
    'envanter-raporu.xlsx'
  );
}

export function exportMovementHistoryExcel(
  movements: Array<{
    type: string;
    item: string;
    quantity: number;
    unit: string;
    date: string;
    operator: string;
  }>
) {
  createWorkbook(
    [{
      name: 'Hareketler',
      data: movements.map((m) => ({
        'Hareket Tipi': m.type,
        'Kalem': m.item,
        'Miktar': m.quantity,
        'Birim': m.unit,
        'Tarih': m.date,
        'Operator': m.operator,
      })),
    }],
    'hareket-raporu.xlsx'
  );
}

export function exportABCAnalysisExcel(
  results: Array<{
    rank: number;
    class: string;
    item: { name: string; sku?: string; annualUsageValue: number; quantity: number; unitCost: number };
    valuePercentage: number;
    cumulativePercentage: number;
  }>
) {
  createWorkbook(
    [{
      name: 'ABC Analizi',
      data: results.map((r) => ({
        'Sira': r.rank,
        'Sinif': r.class,
        'Urun': r.item.name,
        'SKU': r.item.sku || '',
        'Miktar': r.item.quantity,
        'Birim Maliyet (TL)': r.item.unitCost,
        'Yillik Kullanim Degeri (TL)': r.item.annualUsageValue,
        'Deger %': r.valuePercentage,
        'Kumulatif %': r.cumulativePercentage,
      })),
    }],
    'abc-analiz-raporu.xlsx'
  );
}

export function exportComparisonExcel(
  metrics: Array<{
    metricNameTr: string;
    unit: string;
    category: string;
    beforeMean: number;
    afterMean: number;
    improvementPercent: number;
    beforeValues: number[];
    afterValues: number[];
  }>,
  tTestResults: Array<{
    tValue: number;
    pValue: number;
    isSignificant: boolean;
  }>
) {
  createWorkbook(
    [
      {
        name: 'Ozet',
        data: metrics.map((m, i) => ({
          'Metrik': m.metricNameTr,
          'Birim': m.unit,
          'Kategori': m.category,
          'Oncesi (Ort.)': m.beforeMean,
          'Sonrasi (Ort.)': m.afterMean,
          'Iyilesme %': m.improvementPercent,
          't-Degeri': tTestResults[i]?.tValue || 0,
          'p-Degeri': tTestResults[i]?.pValue || 0,
          'Anlamli': tTestResults[i]?.isSignificant ? 'Evet' : 'Hayir',
        })),
      },
      {
        name: 'Ham Veri',
        data: metrics.flatMap((m) => [
          ...m.beforeValues.map((v, i) => ({
            'Metrik': m.metricNameTr,
            'Donem': 'Oncesi',
            'Ay': i + 1,
            'Deger': v,
            'Birim': m.unit,
          })),
          ...m.afterValues.map((v, i) => ({
            'Metrik': m.metricNameTr,
            'Donem': 'Sonrasi',
            'Ay': i + 1,
            'Deger': v,
            'Birim': m.unit,
          })),
        ]),
      },
    ],
    'once-sonra-karsilastirma.xlsx'
  );
}
