'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import { ExportButtons } from '@/components/shared/export-buttons';
import { exportComparisonReportPDF } from '@/lib/export/pdf';
import { exportComparisonExcel } from '@/lib/export/excel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, Calculator } from 'lucide-react';
import { pairedTTest, linearRegression, descriptiveStats } from '@/lib/calculations-statistics';
import { MOCK_COMPARISON_METRICS } from '@/lib/mock-data';
import { METRIC_CATEGORY_LABELS } from '@/lib/constants';

export default function ComparisonPage() {
  // Paired t-test results for each metric
  const tTestResults = useMemo(() => {
    return MOCK_COMPARISON_METRICS.map((m) => ({
      metric: m,
      tTest: pairedTTest(m.beforeValues, m.afterValues),
      beforeStats: descriptiveStats(m.beforeValues),
      afterStats: descriptiveStats(m.afterValues),
    }));
  }, []);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    return MOCK_COMPARISON_METRICS.map((m) => ({
      name: m.metricNameTr,
      before: m.beforeMean,
      after: m.afterMean,
      improvement: Math.abs(m.improvementPercent),
    }));
  }, []);

  // Trend chart data (monthly: 6 before + 6 after)
  const trendData = useMemo(() => {
    const months = ['Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu'];
    // Use first metric (Picking Accuracy) as example
    const metric = MOCK_COMPARISON_METRICS[0];
    return months.map((m, i) => ({
      month: m,
      value: i < 6 ? metric.beforeValues[i] : metric.afterValues[i - 6],
      period: i < 6 ? 'WMS Oncesi' : 'WMS Sonrasi',
    }));
  }, []);

  // Regression: labor productivity vs order fill rate
  const regressionData = useMemo(() => {
    const prodMetric = MOCK_COMPARISON_METRICS.find((m) => m.metricName === 'Labor Productivity')!;
    const fillMetric = MOCK_COMPARISON_METRICS.find((m) => m.metricName === 'Order Fill Rate')!;

    const allX = [...prodMetric.beforeValues, ...prodMetric.afterValues];
    const allY = [...fillMetric.beforeValues, ...fillMetric.afterValues];

    return linearRegression(allX, allY);
  }, []);

  // Overall improvement summary
  const significantCount = tTestResults.filter((r) => r.tTest.isSignificant).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Once / Sonra Analizi"
          description="WMS implementasyonu oncesi ve sonrasi performans karsilastirmasi"
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportPDF={() => {
              const metrics = MOCK_COMPARISON_METRICS.map((m) => ({
                metricNameTr: m.metricNameTr,
                beforeMean: m.beforeMean,
                afterMean: m.afterMean,
                improvementPercent: m.improvementPercent,
                unit: m.unit,
              }));
              const tTests = tTestResults.map((r) => ({
                tValue: r.tTest.tValue,
                pValue: r.tTest.pValue,
                isSignificant: r.tTest.isSignificant,
              }));
              exportComparisonReportPDF(metrics, tTests);
            }}
            onExportExcel={() => {
              const metrics = MOCK_COMPARISON_METRICS.map((m) => ({
                metricNameTr: m.metricNameTr,
                unit: m.unit,
                category: m.category,
                beforeMean: m.beforeMean,
                afterMean: m.afterMean,
                improvementPercent: m.improvementPercent,
                beforeValues: m.beforeValues,
                afterValues: m.afterValues,
              }));
              const tTests = tTestResults.map((r) => ({
                tValue: r.tTest.tValue,
                pValue: r.tTest.pValue,
                isSignificant: r.tTest.isSignificant,
              }));
              exportComparisonExcel(metrics, tTests);
            }}
          />
          <MockDataBadge show={true} />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analiz Edilen Metrik</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_COMPARISON_METRICS.length}</div>
            <p className="text-xs text-muted-foreground">6 ay once + 6 ay sonra</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anlamli Iyilesme</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{significantCount}/{MOCK_COMPARISON_METRICS.length}</div>
            <p className="text-xs text-muted-foreground">p &lt; 0.05 anlamlilk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Iyilesme</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{Math.round(MOCK_COMPARISON_METRICS.reduce((sum, m) => sum + Math.abs(m.improvementPercent), 0) / MOCK_COMPARISON_METRICS.length)}
            </div>
            <p className="text-xs text-muted-foreground">Tum metriklerin ortalamasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regresyon R&sup2;</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{regressionData.rSquared}</div>
            <p className="text-xs text-muted-foreground">{regressionData.equation}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">KPI Karsilastirma</TabsTrigger>
          <TabsTrigger value="significance">Istatistiksel Anlamlilik</TabsTrigger>
          <TabsTrigger value="trend">Trend Grafigi</TabsTrigger>
          <TabsTrigger value="regression">Regresyon</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WMS Oncesi vs WMS Sonrasi KPI Karsilastirmasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_COMPARISON_METRICS.map((m) => {
                  const isImproved = m.isHigherBetter
                    ? m.afterMean > m.beforeMean
                    : m.afterMean < m.beforeMean;
                  const tResult = tTestResults.find((r) => r.metric.id === m.id);

                  return (
                    <Card key={m.id} className={isImproved ? 'border-green-200' : 'border-red-200'}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{m.metricNameTr}</span>
                          {tResult?.tTest.isSignificant && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                              p&lt;0.05
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="rounded bg-gray-50 p-2 text-center">
                            <div className="text-xs text-muted-foreground">Oncesi</div>
                            <div className="text-lg font-bold">{m.beforeMean}{m.unit === '%' || m.unit === 'saat' ? '' : ''} {m.unit}</div>
                          </div>
                          <div className="rounded bg-blue-50 p-2 text-center">
                            <div className="text-xs text-muted-foreground">Sonrasi</div>
                            <div className="text-lg font-bold text-blue-700">{m.afterMean} {m.unit}</div>
                          </div>
                        </div>

                        <div className={`flex items-center justify-center gap-1 text-sm font-medium ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
                          {isImproved ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                          {m.improvementPercent > 0 ? '+' : ''}{m.improvementPercent.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Karsilastirma Grafigi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="before" name="WMS Oncesi" fill="#94a3b8" />
                  <Bar dataKey="after" name="WMS Sonrasi" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Significance Tab */}
        <TabsContent value="significance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eslestirilmis t-Testi Sonuclari</CardTitle>
              <CardDescription>
                H0: WMS oncesi ve sonrasi arasinda anlamli fark yoktur (alpha = 0.05)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metrik</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Oncesi (Ort.)</TableHead>
                      <TableHead className="text-right">Sonrasi (Ort.)</TableHead>
                      <TableHead className="text-right">Fark</TableHead>
                      <TableHead className="text-right">t-Degeri</TableHead>
                      <TableHead className="text-right">p-Degeri</TableHead>
                      <TableHead className="text-center">Anlamli?</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tTestResults.map(({ metric, tTest }) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.metricNameTr}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {METRIC_CATEGORY_LABELS[metric.category] || metric.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{metric.beforeMean} {metric.unit}</TableCell>
                        <TableCell className="text-right font-medium">{metric.afterMean} {metric.unit}</TableCell>
                        <TableCell className="text-right">
                          <span className={tTest.meanDifference > 0 ? 'text-green-600' : 'text-red-600'}>
                            {tTest.meanDifference > 0 ? '+' : ''}{tTest.meanDifference}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">{tTest.tValue}</TableCell>
                        <TableCell className="text-right font-mono">
                          {tTest.pValue < 0.001 ? '<0.001' : tTest.pValue.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tTest.isSignificant ? (
                            <Badge className="bg-green-100 text-green-800">Evet **</Badge>
                          ) : (
                            <Badge variant="outline">Hayir</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <h4 className="font-semibold mb-2">Yorum</h4>
                <ul className="space-y-1 text-sm">
                  <li><strong>{significantCount}/{MOCK_COMPARISON_METRICS.length}</strong> metrikte istatistiksel olarak anlamli iyilestirme saptanmistir (p &lt; 0.05).</li>
                  <li>Eslestirilmis t-testi, ayni birimlerden alinan oncesi-sonrasi olcumleri karsilastirir.</li>
                  <li>Serbestlik derecesi: df = n - 1 = {MOCK_COMPARISON_METRICS[0].beforeValues.length - 1}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Tab */}
        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zaman Icinde Iyilesme Trendi (Toplama Dogrulugu)</CardTitle>
              <CardDescription>WMS oncesi (gri) ve sonrasi (mavi) donemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <ReferenceLine x="Mar" stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'WMS Go-Live', position: 'top' }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Per-metric trend cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_COMPARISON_METRICS.slice(0, 4).map((m) => {
              const months = ['Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu'];
              const data = months.map((mo, i) => ({
                month: mo,
                value: i < 6 ? m.beforeValues[i] : m.afterValues[i - 6],
              }));

              return (
                <Card key={m.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{m.metricNameTr}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={data}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <ReferenceLine x="Mar" stroke="#ef4444" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Regression Tab */}
        <TabsContent value="regression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dogrusal Regresyon: Isgucu Verimliligi vs Siparis Karsilama</CardTitle>
              <CardDescription>
                {regressionData.equation} | R&sup2; = {regressionData.rSquared}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Verimlilik"
                    label={{ value: 'Isgucu Verimliligi (siparis/kisi)', position: 'bottom', offset: -5 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Karsilama"
                    label={{ value: 'Siparis Karsilama (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Veri Noktalari" data={regressionData.points} fill="#3b82f6" />
                  <Scatter name="Regresyon Cizgisi" data={regressionData.regressionLine} fill="#ef4444" line={{ stroke: '#ef4444', strokeWidth: 2 }} shape={(() => <></>) as unknown as undefined} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Regresyon Katsayilari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Egim (b1): <span className="font-mono font-bold">{regressionData.slope}</span></div>
                  <div>Kesisim (b0): <span className="font-mono font-bold">{regressionData.intercept}</span></div>
                  <div>R&sup2;: <span className="font-mono font-bold">{regressionData.rSquared}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Denklem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-center py-4">
                  {regressionData.equation}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Her birim verimlilik artisi, karsilama oranini {regressionData.slope} birim arttirir
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Belirleme Katsayisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center py-2">
                  %{(regressionData.rSquared * 100).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Bagimli degisken varyansinin aciklanan yuzdesi
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
