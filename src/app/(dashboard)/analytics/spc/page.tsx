'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Activity, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { ExportButtons } from '@/components/shared/export-buttons';
import { exportSPCReportPDF } from '@/lib/export/pdf';
import { exportSPCDataExcel } from '@/lib/export/excel';
import { calculateXbarRLimits, calculateIMRLimits, calculateCapability, generateNormalCurve } from '@/lib/calculations-spc';
import { calculateDPMO } from '@/lib/calculations';
import {
  MOCK_PICKING_ACCURACY_SUBGROUPS,
  MOCK_INVENTORY_ACCURACY_SUBGROUPS,
  MOCK_ORDER_CYCLE_TIME,
  MOCK_DPMO_DATA,
} from '@/lib/mock-data';

export default function SPCPage() {
  const [selectedMetric, setSelectedMetric] = useState<'picking' | 'inventory'>('picking');

  // X-bar/R calculations
  const subgroups = selectedMetric === 'picking'
    ? MOCK_PICKING_ACCURACY_SUBGROUPS
    : MOCK_INVENTORY_ACCURACY_SUBGROUPS;

  const xbarRResult = useMemo(() => calculateXbarRLimits(subgroups), [subgroups]);

  // I-MR calculations
  const imrResult = useMemo(() => calculateIMRLimits(MOCK_ORDER_CYCLE_TIME), []);

  // DPMO calculation
  const dpmoResult = useMemo(() =>
    calculateDPMO(MOCK_DPMO_DATA.defects, MOCK_DPMO_DATA.opportunities),
  []);

  // Capability calculation (picking accuracy: USL=100, LSL=96)
  const allValues = subgroups.flatMap((sg) => sg.sampleValues);
  const capResult = useMemo(() => calculateCapability(allValues, 100, 96), [allValues]);
  const normalCurve = useMemo(() =>
    generateNormalCurve(capResult.mean, capResult.stdDev, 80),
  [capResult]);

  // Chart data prep
  const xbarData = subgroups.map((sg, i) => ({
    subgroup: sg.subgroupNumber,
    mean: sg.mean,
    range: sg.range,
    isOutOfControl: xbarRResult.outOfControl.includes(i),
  }));

  const imrData = MOCK_ORDER_CYCLE_TIME.map((val, i) => ({
    index: i + 1,
    value: val,
    mr: imrResult.movingRanges[i],
    isOutOfControl: imrResult.outOfControl.includes(i),
  }));

  const getCpkColor = (cpk: number) => {
    if (cpk >= 1.33) return 'text-green-600';
    if (cpk >= 1.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCpkLabel = (cpk: number) => {
    if (cpk >= 1.33) return 'Yeterli';
    if (cpk >= 1.0) return 'Sinirda';
    return 'Yetersiz';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="SPC & Alti Sigma"
          description="Istatistiksel surec kontrol ve kalite analizi"
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportPDF={() => exportSPCReportPDF({
              sigmaLevel: Number(dpmoResult.sigmaLevel.toFixed(1)),
              dpmo: dpmoResult.dpmo,
              accuracy: dpmoResult.accuracy,
              cpk: capResult.cpk,
              cp: capResult.cp,
              xbarUCL: xbarRResult.xbarLimits.UCL,
              xbarCL: xbarRResult.xbarLimits.CL,
              xbarLCL: xbarRResult.xbarLimits.LCL,
            })}
            onExportExcel={() => exportSPCDataExcel(
              subgroups.map((sg, i) => ({
                subgroupNumber: i + 1,
                metricName: selectedMetric === 'picking' ? 'Toplama Dogrulugu' : 'Envanter Dogrulugu',
                sampleValues: sg.sampleValues,
                mean: sg.mean,
                range: sg.range,
              }))
            )}
          />
          <MockDataBadge show={true} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sigma Seviyesi</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{dpmoResult.sigmaLevel}&#963;</div>
            <p className="text-xs text-muted-foreground">{MOCK_DPMO_DATA.period}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DPMO</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dpmoResult.dpmo.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">{MOCK_DPMO_DATA.defects} hata / {MOCK_DPMO_DATA.opportunities.toLocaleString('tr-TR')} firsat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplama Dogrulugu</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">%{dpmoResult.accuracy}</div>
            <p className="text-xs text-muted-foreground">Son donem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surec Yeterliligi (Cpk)</CardTitle>
            {capResult.cpk >= 1 ?
              <CheckCircle className="h-4 w-4 text-green-600" /> :
              <AlertTriangle className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCpkColor(capResult.cpk)}`}>{capResult.cpk}</div>
            <p className="text-xs text-muted-foreground">{getCpkLabel(capResult.cpk)} | Cp: {capResult.cp}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="xbar-r" className="space-y-4">
        <TabsList>
          <TabsTrigger value="xbar-r">X-bar/R Grafigi</TabsTrigger>
          <TabsTrigger value="imr">I-MR Grafigi</TabsTrigger>
          <TabsTrigger value="dpmo">DPMO & Sigma</TabsTrigger>
          <TabsTrigger value="capability">Cp/Cpk</TabsTrigger>
        </TabsList>

        {/* X-bar/R Chart */}
        <TabsContent value="xbar-r" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedMetric('picking')}
              className={`px-3 py-1 rounded-md text-sm ${selectedMetric === 'picking' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100'}`}
            >
              Toplama Dogrulugu
            </button>
            <button
              onClick={() => setSelectedMetric('inventory')}
              className={`px-3 py-1 rounded-md text-sm ${selectedMetric === 'inventory' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100'}`}
            >
              Envanter Dogrulugu
            </button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>X-bar Grafigi (Ortalamalarin Kontrolu)</CardTitle>
              <CardDescription>
                UCL: {xbarRResult.xbarLimits.UCL} | CL: {xbarRResult.xbarLimits.CL} | LCL: {xbarRResult.xbarLimits.LCL}
                {xbarRResult.outOfControl.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {xbarRResult.outOfControl.length} kontrol disi nokta
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={xbarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subgroup" label={{ value: 'Alt Grup', position: 'bottom', offset: -5 }} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <ReferenceLine y={xbarRResult.xbarLimits.UCL} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                  <ReferenceLine y={xbarRResult.xbarLimits.CL} stroke="#3b82f6" label="CL" />
                  <ReferenceLine y={xbarRResult.xbarLimits.LCL} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
                  <Line type="monotone" dataKey="mean" stroke="#1e40af" strokeWidth={2} dot={(props: Record<string, unknown>) => {
                    const { cx, cy, index } = props;
                    const isOOC = xbarRResult.outOfControl.includes(index as number);
                    return (
                      <circle
                        key={`dot-${index}`}
                        cx={cx as number}
                        cy={cy as number}
                        r={isOOC ? 6 : 3}
                        fill={isOOC ? '#ef4444' : '#1e40af'}
                        stroke={isOOC ? '#ef4444' : 'none'}
                        strokeWidth={2}
                      />
                    );
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>R Grafigi (Aralik Kontrolu)</CardTitle>
              <CardDescription>
                UCL: {xbarRResult.rLimits.UCL} | CL: {xbarRResult.rLimits.CL} | LCL: {xbarRResult.rLimits.LCL}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={xbarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subgroup" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip />
                  <ReferenceLine y={xbarRResult.rLimits.UCL} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                  <ReferenceLine y={xbarRResult.rLimits.CL} stroke="#3b82f6" label="CL" />
                  {xbarRResult.rLimits.LCL > 0 && (
                    <ReferenceLine y={xbarRResult.rLimits.LCL} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
                  )}
                  <Line type="monotone" dataKey="range" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* I-MR Chart */}
        <TabsContent value="imr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>I Grafigi (Bireysel Degerler - Siparis Dongu Suresi)</CardTitle>
              <CardDescription>
                UCL: {imrResult.iLimits.UCL} dk | CL: {imrResult.iLimits.CL} dk | LCL: {imrResult.iLimits.LCL} dk
                {imrResult.outOfControl.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {imrResult.outOfControl.length} kontrol disi nokta
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={imrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" label={{ value: 'Gozlem', position: 'bottom', offset: -5 }} />
                  <YAxis label={{ value: 'Dakika', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <ReferenceLine y={imrResult.iLimits.UCL} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                  <ReferenceLine y={imrResult.iLimits.CL} stroke="#3b82f6" label="CL" />
                  <ReferenceLine y={imrResult.iLimits.LCL} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
                  <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} dot={(props: Record<string, unknown>) => {
                    const { cx, cy, index } = props;
                    const isOOC = imrResult.outOfControl.includes(index as number);
                    return (
                      <circle
                        key={`imr-dot-${index}`}
                        cx={cx as number}
                        cy={cy as number}
                        r={isOOC ? 6 : 3}
                        fill={isOOC ? '#ef4444' : '#1e40af'}
                      />
                    );
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MR Grafigi (Hareketli Aralik)</CardTitle>
              <CardDescription>
                UCL: {imrResult.mrLimits.UCL} dk | CL: {imrResult.mrLimits.CL} dk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={imrData.slice(1)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip />
                  <ReferenceLine y={imrResult.mrLimits.UCL} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                  <ReferenceLine y={imrResult.mrLimits.CL} stroke="#3b82f6" label="CL" />
                  <Line type="monotone" dataKey="mr" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DPMO & Sigma */}
        <TabsContent value="dpmo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>DPMO Gostergesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative size-48">
                    <svg viewBox="0 0 200 200" className="size-full -rotate-90">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                      <circle
                        cx="100" cy="100" r="80"
                        fill="none"
                        stroke={dpmoResult.sigmaLevel >= 4 ? '#10b981' : dpmoResult.sigmaLevel >= 3 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="16"
                        strokeDasharray={`${(dpmoResult.accuracy / 100) * 502.65} 502.65`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{dpmoResult.sigmaLevel}&#963;</span>
                      <span className="text-sm text-muted-foreground">{dpmoResult.dpmo} DPMO</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {dpmoResult.accuracy}% dogruluk orani
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sigma Seviyeleri Referans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { level: 6, dpmo: 3.4, pct: '99.99966%' },
                    { level: 5, dpmo: 233, pct: '99.977%' },
                    { level: 4, dpmo: 6210, pct: '99.379%' },
                    { level: 3, dpmo: 66807, pct: '93.32%' },
                    { level: 2, dpmo: 308538, pct: '69.15%' },
                    { level: 1, dpmo: 691462, pct: '30.85%' },
                  ].map((ref) => (
                    <div
                      key={ref.level}
                      className={`flex items-center justify-between p-2 rounded ${
                        dpmoResult.sigmaLevel === ref.level ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{ref.level}&#963;</span>
                        {dpmoResult.sigmaLevel === ref.level && (
                          <Badge>Mevcut</Badge>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{ref.dpmo.toLocaleString('tr-TR')} DPMO</div>
                        <div className="text-muted-foreground">{ref.pct}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cp/Cpk */}
        <TabsContent value="capability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cp (Surec Potansiyeli)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCpkColor(capResult.cp)}`}>{capResult.cp}</div>
                <p className="text-xs text-muted-foreground">Spesifikasyon genisligi / 6&#963;</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cpk (Surec Yeterliligi)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCpkColor(capResult.cpk)}`}>{capResult.cpk}</div>
                <p className="text-xs text-muted-foreground">Merkeze uzaklik dahil</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Surec Parametreleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>Ortalama: {capResult.mean}</div>
                  <div>Std. Sapma: {capResult.stdDev}</div>
                  <div>USL: {capResult.usl} | LSL: {capResult.lsl}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Surec Yeterlilik Grafigi (Cani Egrisi)</CardTitle>
              <CardDescription>
                Normal dagilim + spesifikasyon limitleri ({selectedMetric === 'picking' ? 'Toplama Dogrulugu' : 'Envanter Dogrulugu'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={normalCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" domain={['auto', 'auto']} />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine x={capResult.lsl} stroke="#ef4444" strokeWidth={2} label="LSL" />
                  <ReferenceLine x={capResult.usl} stroke="#ef4444" strokeWidth={2} label="USL" />
                  <ReferenceLine x={capResult.mean} stroke="#3b82f6" strokeDasharray="5 5" label="Ort" />
                  <Area type="monotone" dataKey="y" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-semibold mb-2">Yorum</h4>
            <ul className="space-y-1 text-sm">
              <li>Cp &ge; 1.33 ve Cpk &ge; 1.33: Surec yeterli ve merkezde</li>
              <li>Cp &ge; 1.33 ve Cpk &lt; 1.33: Surec potansiyeli var ama merkezden kaymis</li>
              <li>Cp &lt; 1.0: Surec degiskenligi cok yuksek, iyilestirme gerekli</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
