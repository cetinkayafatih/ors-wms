'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Cell,
} from 'recharts';
import { Calculator, TrendingUp, BarChart3, Dice5 } from 'lucide-react';
import { ExportButtons } from '@/components/shared/export-buttons';
import { exportABCAnalysisPDF } from '@/lib/export/pdf';
import { exportABCAnalysisExcel } from '@/lib/export/excel';
import {
  calculateEOQ,
  calculateABCClassification,
  getABCSummary,
  exponentialSmoothing,
  calculateSafetyStock,
  SERVICE_LEVELS,
} from '@/lib/calculations';
import { monteCarloSafetyStock, holtSmoothing } from '@/lib/calculations-forecast';
import { MOCK_DEMAND_HISTORY, MOCK_PRODUCT_NAMES, MOCK_ABC_ITEMS, MOCK_EOQ_DEFAULTS } from '@/lib/mock-data';

export default function ForecastingPage() {
  const [selectedProduct, setSelectedProduct] = useState('SP001-SYH-M');
  const [alpha, setAlpha] = useState(0.3);
  const [beta, setBeta] = useState(0.1);

  // ABC Classification
  const abcResults = useMemo(() => calculateABCClassification(MOCK_ABC_ITEMS), []);
  const abcSummary = useMemo(() => getABCSummary(abcResults), [abcResults]);

  // Pareto chart data
  const paretoData = useMemo(() => {
    return abcResults.map((r) => ({
      name: r.item.sku,
      value: r.item.annualUsageValue,
      cumulative: r.cumulativePercentage,
      class: r.class,
    }));
  }, [abcResults]);

  // Demand forecasting
  const demandData = MOCK_DEMAND_HISTORY[selectedProduct] || [];
  const actuals = demandData.map((d) => d.actual);

  // Simple Exponential Smoothing
  const sesResult = useMemo(() => exponentialSmoothing(actuals, alpha), [actuals, alpha]);

  // Holt's Double Smoothing
  const holtResult = useMemo(() => holtSmoothing(actuals, alpha, beta, 3), [actuals, alpha, beta]);

  // Forecast chart data
  const forecastChartData = useMemo(() => {
    return demandData.map((d, i) => ({
      month: d.month.split(' ')[0],
      actual: d.actual,
      ses: sesResult.forecast[i],
      holt: holtResult.forecast[i],
    }));
  }, [demandData, sesResult, holtResult]);

  // Add forecast periods
  const forecastWithPredictions = useMemo(() => {
    const data = [...forecastChartData];
    const months = ['Mar', 'Nis', 'May'];
    holtResult.nextPeriods.forEach((val, i) => {
      data.push({
        month: months[i] + ' (T)',
        actual: 0,
        ses: 0,
        holt: val,
      });
    });
    return data;
  }, [forecastChartData, holtResult]);

  // Monte Carlo
  const [mcAvgDemand, setMcAvgDemand] = useState('165');
  const [mcDemandStd, setMcDemandStd] = useState('30');
  const [mcLeadTime, setMcLeadTime] = useState('7');
  const [mcLeadTimeStd, setMcLeadTimeStd] = useState('2');

  const mcResult = useMemo(() => {
    return monteCarloSafetyStock(
      parseFloat(mcAvgDemand) || 165,
      parseFloat(mcDemandStd) || 30,
      parseFloat(mcLeadTime) || 7,
      parseFloat(mcLeadTimeStd) || 2,
      10000
    );
  }, [mcAvgDemand, mcDemandStd, mcLeadTime, mcLeadTimeStd]);

  // EOQ for selected preset
  const [selectedPreset, setSelectedPreset] = useState(0);
  const preset = MOCK_EOQ_DEFAULTS[selectedPreset];
  const eoqResult = useMemo(() =>
    calculateEOQ(preset.annualDemand, preset.orderingCost, preset.holdingCost),
  [preset]);

  // EOQ cost curve
  const eoqCostData = useMemo(() => {
    const D = preset.annualDemand;
    const S = preset.orderingCost;
    const H = preset.holdingCost;
    const optQ = Math.sqrt((2 * D * S) / H);
    const points: { Q: number; orderCost: number; holdingCost: number; totalCost: number }[] = [];
    for (let q = Math.max(100, optQ * 0.2); q <= optQ * 3; q += optQ * 0.05) {
      points.push({
        Q: Math.round(q),
        orderCost: Math.round((D / q) * S),
        holdingCost: Math.round((q / 2) * H),
        totalCost: Math.round((D / q) * S + (q / 2) * H),
      });
    }
    return points;
  }, [preset]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="EOQ / ABC / Talep Tahmini"
          description="Envanter optimizasyonu ve talep tahmin modulleri"
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

      <Tabs defaultValue="eoq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eoq">EOQ Analizi</TabsTrigger>
          <TabsTrigger value="abc">ABC Pareto</TabsTrigger>
          <TabsTrigger value="forecast">Talep Tahmini</TabsTrigger>
          <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
        </TabsList>

        {/* EOQ Tab */}
        <TabsContent value="eoq" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {MOCK_EOQ_DEFAULTS.map((p, i) => (
              <Button
                key={p.productName}
                variant={selectedPreset === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPreset(i)}
              >
                {p.productName}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">EOQ</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{eoqResult.eoq.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">Optimal siparis miktari</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Siparis/Yil</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eoqResult.ordersPerYear}</div>
                <p className="text-xs text-muted-foreground">{eoqResult.daysBetweenOrders} gun aralik</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Toplam Maliyet</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eoqResult.totalCost.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">TL/yil</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Parametreler</CardTitle></CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div>D: {preset.annualDemand.toLocaleString('tr-TR')}/yil</div>
                  <div>S: {preset.orderingCost} TL/siparis</div>
                  <div>H: {preset.holdingCost} TL/birim/yil</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>EOQ Maliyet Egrisi - {preset.productName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={eoqCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Q" label={{ value: 'Siparis Miktari (Q)', position: 'bottom', offset: -5 }} />
                  <YAxis label={{ value: 'Maliyet (TL)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('tr-TR')} TL`} />
                  <Legend />
                  <Line type="monotone" dataKey="orderCost" name="Siparis Maliyeti" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="holdingCost" name="Tasima Maliyeti" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalCost" name="Toplam Maliyet" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABC Pareto Tab */}
        <TabsContent value="abc" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            {(['A', 'B', 'C'] as const).map((cls) => (
              <Card key={cls} className={cls === 'A' ? 'border-red-200' : cls === 'B' ? 'border-yellow-200' : 'border-green-200'}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${cls === 'A' ? 'text-red-600' : cls === 'B' ? 'text-yellow-600' : 'text-green-600'}`}>
                      Kategori {cls}
                    </span>
                    <div className="text-right text-sm">
                      <div>{abcSummary[cls].count} kalem ({abcSummary[cls].skuPercentage}%)</div>
                      <div className="font-medium">Deger: %{abcSummary[cls].valuePercentage}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pareto Grafigi (ABC)</CardTitle>
              <CardDescription>Yillik kullanim degeri + kumulatif yuzde</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={paretoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" label={{ value: 'Deger (TL)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Kumulatif %', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" name="Yillik Deger">
                    {paretoData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.class === 'A' ? '#ef4444' : entry.class === 'B' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Kumulatif %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <Label className="text-sm">Urun</Label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ml-2"
              >
                {Object.entries(MOCK_PRODUCT_NAMES).map(([sku, name]) => (
                  <option key={sku} value={sku}>{name} ({sku})</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">Alpha (SES)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.05"
                max="0.95"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value) || 0.3)}
                className="w-20 ml-2"
              />
            </div>
            <div>
              <Label className="text-sm">Beta (Trend)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.05"
                max="0.95"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value) || 0.1)}
                className="w-20 ml-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">SES Sonraki Ay</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sesResult.nextPeriod.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">MAE: {sesResult.mae} | MAPE: %{sesResult.mape}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Holt +1 Ay</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{holtResult.nextPeriods[0]?.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">MAE: {holtResult.mae} | MAPE: %{holtResult.mape}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Holt +2 Ay</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{holtResult.nextPeriods[1]?.toLocaleString('tr-TR')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Holt +3 Ay</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{holtResult.nextPeriods[2]?.toLocaleString('tr-TR')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Talep Tahmini - {MOCK_PRODUCT_NAMES[selectedProduct]}</CardTitle>
              <CardDescription>Gercek vs SES vs Holt ustel duzeltme</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecastWithPredictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Gercek" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="ses" name="SES Tahmin" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="holt" name="Holt Tahmin" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monte Carlo Tab */}
        <TabsContent value="montecarlo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <div>
              <Label>Ort. Gunluk Talep</Label>
              <Input type="number" value={mcAvgDemand} onChange={(e) => setMcAvgDemand(e.target.value)} />
            </div>
            <div>
              <Label>Talep Std. Sapma</Label>
              <Input type="number" value={mcDemandStd} onChange={(e) => setMcDemandStd(e.target.value)} />
            </div>
            <div>
              <Label>Ort. Tedarik Suresi (gun)</Label>
              <Input type="number" value={mcLeadTime} onChange={(e) => setMcLeadTime(e.target.value)} />
            </div>
            <div>
              <Label>Tedarik S. Std. Sapma</Label>
              <Input type="number" value={mcLeadTimeStd} onChange={(e) => setMcLeadTimeStd(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Ortalama Talep</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mcResult.mean.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">Tedarik suresi boyunca</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Guvenlik Stogu (%95)</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{mcResult.safetyStock95.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">P95: {mcResult.percentile95.toLocaleString('tr-TR')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Guvenlik Stogu (%99)</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mcResult.safetyStock99.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">P99: {mcResult.percentile99.toLocaleString('tr-TR')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Simulasyon</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mcResult.iterations.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-muted-foreground">iterasyon | Std: {mcResult.stdDev}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monte Carlo Simulasyon Histogrami</CardTitle>
              <CardDescription>
                {mcResult.iterations.toLocaleString('tr-TR')} iterasyon sonucu tedarik suresi talebi dagilimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mcResult.histogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" label={{ value: 'Tedarik Suresi Talebi', position: 'bottom', offset: -5 }} />
                  <YAxis label={{ value: 'Frekans', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Frekans" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
