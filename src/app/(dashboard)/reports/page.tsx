'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Calculator, TrendingUp, Users, Shield } from 'lucide-react';
import { ExportButtons } from '@/components/shared/export-buttons';
import { exportABCAnalysisPDF } from '@/lib/export/pdf';
import { exportABCAnalysisExcel } from '@/lib/export/excel';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  calculateEOQ,
  calculateSafetyStock,
  calculateReorderPoint,
  calculateABCClassification,
  getABCSummary,
  SERVICE_LEVELS,
} from '@/lib/calculations';
import { MOCK_ABC_ITEMS, MOCK_EOQ_DEFAULTS } from '@/lib/mock-data';

export default function ReportsPage() {
  // EOQ state
  const [eoqD, setEoqD] = useState('500000');
  const [eoqS, setEoqS] = useState('500');
  const [eoqH, setEoqH] = useState('12');

  // Safety stock state
  const [ssServiceLevel, setSsServiceLevel] = useState('95%');
  const [ssLeadTime, setSsLeadTime] = useState('7');
  const [ssDemandStd, setSsDemandStd] = useState('50');
  const [ssAvgDemand, setSsAvgDemand] = useState('1370');
  const [ssLeadTimeStd, setSsLeadTimeStd] = useState('2');

  // EOQ calculation using library function
  const eoqResult = useMemo(() => {
    const D = parseFloat(eoqD);
    const S = parseFloat(eoqS);
    const H = parseFloat(eoqH);
    if (D > 0 && S > 0 && H > 0) {
      return calculateEOQ(D, S, H);
    }
    return null;
  }, [eoqD, eoqS, eoqH]);

  // EOQ cost curve data
  const eoqCostCurve = useMemo(() => {
    const D = parseFloat(eoqD);
    const S = parseFloat(eoqS);
    const H = parseFloat(eoqH);
    if (!(D > 0 && S > 0 && H > 0)) return [];

    const optimalQ = Math.sqrt((2 * D * S) / H);
    const points: { Q: number; orderCost: number; holdingCost: number; totalCost: number }[] = [];

    for (let q = Math.max(100, optimalQ * 0.2); q <= optimalQ * 3; q += optimalQ * 0.05) {
      const orderCost = (D / q) * S;
      const holdingCost = (q / 2) * H;
      points.push({
        Q: Math.round(q),
        orderCost: Math.round(orderCost),
        holdingCost: Math.round(holdingCost),
        totalCost: Math.round(orderCost + holdingCost),
      });
    }
    return points;
  }, [eoqD, eoqS, eoqH]);

  // Safety stock calculation
  const ssResult = useMemo(() => {
    const z = SERVICE_LEVELS[ssServiceLevel] || 1.65;
    const lt = parseFloat(ssLeadTime);
    const dStd = parseFloat(ssDemandStd);
    const avg = parseFloat(ssAvgDemand);
    const ltStd = parseFloat(ssLeadTimeStd);

    if (lt > 0 && avg > 0) {
      const ss = calculateSafetyStock(z, lt, dStd, avg, ltStd);
      const rop = calculateReorderPoint(avg, lt, ss);
      return { safetyStock: ss, reorderPoint: rop, leadTime: lt, avgDemand: avg };
    }
    return null;
  }, [ssServiceLevel, ssLeadTime, ssDemandStd, ssAvgDemand, ssLeadTimeStd]);

  // ABC classification using library
  const abcResults = useMemo(() => calculateABCClassification(MOCK_ABC_ITEMS), []);
  const abcSummary = useMemo(() => getABCSummary(abcResults), [abcResults]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Raporlar ve Analizler"
          description="Stok analizleri ve hesaplamalar"
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportPDF={() => {
              const results = abcResults.map((item, i) => ({
                rank: i + 1,
                class: item.class,
                item: { name: item.item.name, sku: item.item.sku, annualUsageValue: item.item.annualUsageValue },
                valuePercentage: Number(item.valuePercentage.toFixed(1)),
                cumulativePercentage: Number(item.cumulativePercentage.toFixed(1)),
              }));
              exportABCAnalysisPDF(results);
            }}
            onExportExcel={() => {
              const results = abcResults.map((item, i) => ({
                rank: i + 1,
                class: item.class,
                item: {
                  name: item.item.name,
                  sku: item.item.sku,
                  annualUsageValue: item.item.annualUsageValue,
                  quantity: item.item.quantity,
                  unitCost: item.item.unitCost,
                },
                valuePercentage: Number(item.valuePercentage.toFixed(1)),
                cumulativePercentage: Number(item.cumulativePercentage.toFixed(1)),
              }));
              exportABCAnalysisExcel(results);
            }}
          />
          <MockDataBadge show={true} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-600" />
              <CardTitle className="text-lg">ABC Analizi</CardTitle>
            </div>
            <CardDescription>Stok siniflandirmasi ve deger analizi</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="size-5 text-green-600" />
              <CardTitle className="text-lg">EOQ Hesaplayici</CardTitle>
            </div>
            <CardDescription>Ekonomik siparis miktari hesaplama</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-orange-600" />
              <CardTitle className="text-lg">Guvenlik Stogu & ROP</CardTitle>
            </div>
            <CardDescription>Guvenlik stogu ve yeniden siparis noktasi</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="abc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="abc">ABC Analizi</TabsTrigger>
          <TabsTrigger value="eoq">EOQ Hesaplama</TabsTrigger>
          <TabsTrigger value="safety">Guvenlik Stogu & ROP</TabsTrigger>
        </TabsList>

        {/* ABC Tab */}
        <TabsContent value="abc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ABC Siniflandirmasi (Pareto Analizi)</CardTitle>
              <CardDescription>
                {MOCK_ABC_ITEMS.length} kalem calculateABCClassification() fonksiyonu ile analiz edildi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {(['A', 'B', 'C'] as const).map((cls) => (
                  <div
                    key={cls}
                    className={`rounded-lg border-2 p-4 ${
                      cls === 'A' ? 'border-red-300 bg-red-50' :
                      cls === 'B' ? 'border-yellow-300 bg-yellow-50' :
                      'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="text-2xl font-bold">Kategori {cls}</div>
                    <div className="text-sm mt-1">
                      {abcSummary[cls].count} kalem ({abcSummary[cls].skuPercentage}%)
                    </div>
                    <div className="text-sm font-medium">
                      Deger: %{abcSummary[cls].valuePercentage}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Sinif</TableHead>
                      <TableHead>Urun</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Yillik Kullanim Degeri</TableHead>
                      <TableHead className="text-right">Deger %</TableHead>
                      <TableHead className="text-right">Kumulatif %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abcResults.map((r) => (
                      <TableRow key={r.item.id}>
                        <TableCell>{r.rank}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            r.class === 'A' ? 'bg-red-100 text-red-700' :
                            r.class === 'B' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {r.class}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{r.item.name}</TableCell>
                        <TableCell className="font-mono text-sm">{r.item.sku}</TableCell>
                        <TableCell className="text-right">{r.item.annualUsageValue.toLocaleString('tr-TR')} TL</TableCell>
                        <TableCell className="text-right">{r.valuePercentage}%</TableCell>
                        <TableCell className="text-right font-medium">{r.cumulativePercentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h4 className="font-semibold mb-2">Yonetim Stratejisi</h4>
                <ul className="space-y-2 text-sm">
                  <li><strong>Kategori A ({abcSummary.A.count} kalem):</strong> Siki kontrol, gunluk sayim, minimum stok seviyesi, tek tedarikci iliskisi</li>
                  <li><strong>Kategori B ({abcSummary.B.count} kalem):</strong> Haftalik inceleme, orta seviye guvenlik stogu, EOQ uygulamasi</li>
                  <li><strong>Kategori C ({abcSummary.C.count} kalem):</strong> Aylik kontrol, buyuk parti siparisleri, minimum izleme</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EOQ Tab */}
        <TabsContent value="eoq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ekonomik Siparis Miktari (EOQ) Hesaplayici</CardTitle>
              <CardDescription>
                calculateEOQ() fonksiyonu ile optimal siparis miktarini hesaplayin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Presets */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Hazir Ornekler</Label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_EOQ_DEFAULTS.map((preset) => (
                    <Button
                      key={preset.productName}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEoqD(String(preset.annualDemand));
                        setEoqS(String(preset.orderingCost));
                        setEoqH(String(preset.holdingCost));
                      }}
                    >
                      {preset.productName}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="eoq_d">Yillik Talep (D)</Label>
                  <Input
                    id="eoq_d"
                    type="number"
                    value={eoqD}
                    onChange={(e) => setEoqD(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Yillik toplam talep miktari</p>
                </div>
                <div>
                  <Label htmlFor="eoq_s">Siparis Maliyeti (S)</Label>
                  <Input
                    id="eoq_s"
                    type="number"
                    value={eoqS}
                    onChange={(e) => setEoqS(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Siparis basina sabit maliyet (TL)</p>
                </div>
                <div>
                  <Label htmlFor="eoq_h">Elde Tutma Maliyeti (H)</Label>
                  <Input
                    id="eoq_h"
                    type="number"
                    value={eoqH}
                    onChange={(e) => setEoqH(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Birim basina yillik elde tutma maliyeti (TL)</p>
                </div>
              </div>

              {eoqResult && (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Optimal Siparis Miktari</div>
                    <div className="text-3xl font-bold text-green-700">
                      {eoqResult.eoq.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted-foreground">adet</div>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Yillik Siparis Sayisi</div>
                    <div className="text-2xl font-bold">{eoqResult.ordersPerYear}</div>
                    <div className="text-xs text-muted-foreground">kez/yil</div>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Siparis Araligi</div>
                    <div className="text-2xl font-bold">{eoqResult.daysBetweenOrders}</div>
                    <div className="text-xs text-muted-foreground">gun</div>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Toplam Maliyet</div>
                    <div className="text-2xl font-bold">{eoqResult.totalCost.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-muted-foreground">TL/yil</div>
                  </div>
                </div>
              )}

              {/* EOQ Cost Curve Chart */}
              {eoqCostCurve.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">EOQ Maliyet Egrisi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={eoqCostCurve}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Q" label={{ value: 'Siparis Miktari (Q)', position: 'bottom', offset: -5 }} />
                        <YAxis label={{ value: 'Maliyet (TL)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString('tr-TR')} TL`} />
                        <Legend />
                        <Line type="monotone" dataKey="orderCost" name="Siparis Maliyeti" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="holdingCost" name="Tasima Maliyeti" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="totalCost" name="Toplam Maliyet" stroke="#10b981" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Stock & ROP Tab */}
        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guvenlik Stogu & Yeniden Siparis Noktasi (ROP)</CardTitle>
              <CardDescription>
                calculateSafetyStock() ve calculateReorderPoint() fonksiyonlari ile hesaplama
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <Label>Hizmet Seviyesi</Label>
                  <select
                    value={ssServiceLevel}
                    onChange={(e) => setSsServiceLevel(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {Object.entries(SERVICE_LEVELS).map(([label, z]) => (
                      <option key={label} value={label}>{label} (Z={z})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Ort. Tedarik Suresi (gun)</Label>
                  <Input type="number" value={ssLeadTime} onChange={(e) => setSsLeadTime(e.target.value)} />
                </div>
                <div>
                  <Label>Talep Std. Sapma</Label>
                  <Input type="number" value={ssDemandStd} onChange={(e) => setSsDemandStd(e.target.value)} />
                </div>
                <div>
                  <Label>Ort. Gunluk Talep</Label>
                  <Input type="number" value={ssAvgDemand} onChange={(e) => setSsAvgDemand(e.target.value)} />
                </div>
                <div>
                  <Label>Tedarik S. Std. Sapma</Label>
                  <Input type="number" value={ssLeadTimeStd} onChange={(e) => setSsLeadTimeStd(e.target.value)} />
                </div>
              </div>

              {ssResult && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Guvenlik Stogu</div>
                    <div className="text-3xl font-bold text-orange-700">
                      {ssResult.safetyStock.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted-foreground">adet</div>
                  </div>
                  <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Yeniden Siparis Noktasi (ROP)</div>
                    <div className="text-3xl font-bold text-blue-700">
                      {ssResult.reorderPoint.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted-foreground">adet</div>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Tedarik Suresi Talebi</div>
                    <div className="text-2xl font-bold">
                      {Math.round(ssResult.avgDemand * ssResult.leadTime).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted-foreground">adet ({ssResult.leadTime} gun x {ssResult.avgDemand}/gun)</div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-semibold mb-2">Formul Aciklamalari</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Guvenlik Stogu:</strong> SS = Z x sqrt(LT x sigma_d^2 + d_avg^2 x sigma_LT^2)</p>
                  <p><strong>ROP:</strong> ROP = (Ort. Gunluk Talep x Tedarik Suresi) + Guvenlik Stogu</p>
                </div>
              </div>

              {/* Service Level Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hizmet Seviyesi Karsilastirmasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hizmet Seviyesi</TableHead>
                          <TableHead>Z Degeri</TableHead>
                          <TableHead className="text-right">Guvenlik Stogu</TableHead>
                          <TableHead className="text-right">ROP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(SERVICE_LEVELS).map(([label, z]) => {
                          const lt = parseFloat(ssLeadTime) || 7;
                          const dStd = parseFloat(ssDemandStd) || 50;
                          const avg = parseFloat(ssAvgDemand) || 1370;
                          const ltStd = parseFloat(ssLeadTimeStd) || 2;
                          const ss = calculateSafetyStock(z, lt, dStd, avg, ltStd);
                          const rop = calculateReorderPoint(avg, lt, ss);
                          return (
                            <TableRow key={label} className={label === ssServiceLevel ? 'bg-blue-50' : ''}>
                              <TableCell className="font-medium">{label}</TableCell>
                              <TableCell>{z}</TableCell>
                              <TableCell className="text-right">{ss.toLocaleString('tr-TR')}</TableCell>
                              <TableCell className="text-right font-medium">{rop.toLocaleString('tr-TR')}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
