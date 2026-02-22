'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
} from 'recharts';
import { Clock, Zap, GitBranch, Activity } from 'lucide-react';
import { calculateLeadTime, calculateVSMSummary, calculate5STrend, calculateTaktTime } from '@/lib/calculations-lean';
import { KANBAN_COLUMN_LABELS, FIVE_S_LABELS, WASTE_TYPE_LABELS } from '@/lib/constants';
import {
  MOCK_VSM_STEPS,
  MOCK_FIVE_S_AUDITS,
  MOCK_KANBAN_ITEMS,
  MOCK_MUDA_CATEGORIES,
} from '@/lib/mock-data';
import type { KanbanItem, KanbanColumnStatus } from '@/types/analytics';

const KANBAN_COLUMNS: KanbanColumnStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'archived'];
const KANBAN_COLUMN_COLORS: Record<string, string> = {
  backlog: 'bg-gray-100',
  todo: 'bg-blue-50',
  in_progress: 'bg-yellow-50',
  review: 'bg-purple-50',
  testing: 'bg-orange-50',
  done: 'bg-green-50',
  archived: 'bg-gray-50',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function LeanPage() {
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>(MOCK_KANBAN_ITEMS);
  const [selectedArea, setSelectedArea] = useState('Hammadde Deposu');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // VSM calculations
  const vsmSummary = useMemo(() => calculateVSMSummary(MOCK_VSM_STEPS), []);
  const taktTime = useMemo(() => calculateTaktTime(480, 250), []);

  // 5S trend
  const areas = [...new Set(MOCK_FIVE_S_AUDITS.map((a) => a.area))];
  const fiveSData = useMemo(() => calculate5STrend(MOCK_FIVE_S_AUDITS, selectedArea), [selectedArea]);
  const latestAudit = MOCK_FIVE_S_AUDITS
    .filter((a) => a.area === selectedArea)
    .sort((a, b) => b.auditDate.localeCompare(a.auditDate))[0];

  const radarData = latestAudit ? [
    { subject: 'Ayiklama', score: latestAudit.sort, fullMark: 5 },
    { subject: 'Duzenleme', score: latestAudit.setInOrder, fullMark: 5 },
    { subject: 'Temizlik', score: latestAudit.shine, fullMark: 5 },
    { subject: 'Standart', score: latestAudit.standardize, fullMark: 5 },
    { subject: 'Disiplin', score: latestAudit.sustain, fullMark: 5 },
  ] : [];

  // VSM chart data
  const vsmChartData = MOCK_VSM_STEPS.map((s) => ({
    name: s.processName.split(' ')[0],
    cycleTime: s.cycleTimeMinutes,
    waitTime: s.waitTimeMinutes,
    vaPercent: s.valueAddedPercentage,
  }));

  // Kanban drag & drop
  const handleDragStart = (itemId: string) => setDraggedItem(itemId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetColumn: KanbanColumnStatus) => {
    if (!draggedItem) return;
    setKanbanItems((prev) =>
      prev.map((item) =>
        item.id === draggedItem
          ? { ...item, columnStatus: targetColumn, updatedAt: new Date().toISOString() }
          : item
      )
    );
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="VSM & Yalin Uretim"
          description="Deger akis haritasi, 5S, Kanban ve israf analizi"
        />
        <MockDataBadge show={true} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Dongu Suresi</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{vsmSummary.totalLeadTime} dk</div>
            <p className="text-xs text-muted-foreground">{(vsmSummary.totalLeadTime / 60).toFixed(1)} saat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Katma Deger Orani</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">%{vsmSummary.processEfficiency}</div>
            <p className="text-xs text-muted-foreground">{vsmSummary.valueAddedTime} dk katma deger</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleme Suresi</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{vsmSummary.totalWaitTime} dk</div>
            <p className="text-xs text-muted-foreground">{(vsmSummary.totalWaitTime / vsmSummary.totalLeadTime * 100).toFixed(1)}% bekleme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Takt Suresi</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{taktTime.taktTimeMinutes} dk</div>
            <p className="text-xs text-muted-foreground">{taktTime.taktTimeSeconds} sn/birim</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vsm" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vsm">VSM</TabsTrigger>
          <TabsTrigger value="fives">5S Denetim</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="muda">Muda Analizi</TabsTrigger>
        </TabsList>

        {/* VSM Tab */}
        <TabsContent value="vsm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deger Akis Haritasi (VSM)</CardTitle>
              <CardDescription>Mal kabul → Sevkiyat surec adimlari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Surec</TableHead>
                      <TableHead className="text-right">Dongu Suresi (dk)</TableHead>
                      <TableHead className="text-right">Bekleme (dk)</TableHead>
                      <TableHead className="text-right">Katma Deger %</TableHead>
                      <TableHead className="text-right">Operatör</TableHead>
                      <TableHead className="text-right">WIP</TableHead>
                      <TableHead>Not</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_VSM_STEPS.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell>{step.stepNumber}</TableCell>
                        <TableCell className="font-medium">{step.processName}</TableCell>
                        <TableCell className="text-right">{step.cycleTimeMinutes}</TableCell>
                        <TableCell className="text-right text-red-600">{step.waitTimeMinutes}</TableCell>
                        <TableCell className="text-right">
                          <span className={step.valueAddedPercentage >= 70 ? 'text-green-600' : step.valueAddedPercentage > 0 ? 'text-yellow-600' : 'text-red-600'}>
                            {step.valueAddedPercentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{step.operators}</TableCell>
                        <TableCell className="text-right">{step.wip}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{step.notes}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell colSpan={2}>TOPLAM</TableCell>
                      <TableCell className="text-right">{vsmSummary.totalCycleTime} dk</TableCell>
                      <TableCell className="text-right text-red-600">{vsmSummary.totalWaitTime} dk</TableCell>
                      <TableCell className="text-right text-green-600">%{vsmSummary.processEfficiency}</TableCell>
                      <TableCell className="text-right">{vsmSummary.totalOperators}</TableCell>
                      <TableCell className="text-right">{vsmSummary.totalWIP}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vsmChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Dakika', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cycleTime" name="Dongu Suresi" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="waitTime" name="Bekleme Suresi" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5S Tab */}
        <TabsContent value="fives" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1 rounded-md text-sm ${selectedArea === area ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100'}`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>5S Radar Grafigi - {selectedArea}</CardTitle>
                <CardDescription>Son denetim: {latestAudit?.auditDate} | Toplam: {latestAudit?.total}/25</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar name="Puan" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5S Trend</CardTitle>
                <CardDescription>Aylik toplam puan degisimi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fiveSData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 25]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Toplam" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="sort" name="Ayiklama" stroke="#ef4444" strokeWidth={1} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="setInOrder" name="Duzenleme" stroke="#f59e0b" strokeWidth={1} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="shine" name="Temizlik" stroke="#10b981" strokeWidth={1} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Kanban Tab */}
        <TabsContent value="kanban" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kanban Panosu</CardTitle>
              <CardDescription>Kartlari surukleyerek tasiyabilirsiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.filter((col) => col !== 'archived').map((column) => {
                  const items = kanbanItems.filter((i) => i.columnStatus === column);
                  return (
                    <div
                      key={column}
                      className={`min-w-[220px] rounded-lg p-3 ${KANBAN_COLUMN_COLORS[column]}`}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(column)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">{KANBAN_COLUMN_LABELS[column]}</span>
                        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            className="bg-white rounded-md border p-2 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                          >
                            <div className="text-sm font-medium mb-1">{item.title}</div>
                            <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[item.priority]}`}>
                                {item.priority === 'urgent' ? 'Acil' : item.priority === 'high' ? 'Yuksek' : item.priority === 'normal' ? 'Normal' : 'Dusuk'}
                              </Badge>
                              {item.assignee && (
                                <span className="text-xs text-muted-foreground">{item.assignee}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Muda Tab */}
        <TabsContent value="muda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7 Israf (Muda) Analizi</CardTitle>
              <CardDescription>TIM WOODS kategorileri - mevcut durum ve hedefler</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={MOCK_MUDA_CATEGORIES} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="wasteTypeTr" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentScore" name="Mevcut" fill="#ef4444" />
                  <Bar dataKey="targetScore" name="Hedef" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>

              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Israf Tipi</TableHead>
                      <TableHead>Aciklama</TableHead>
                      <TableHead className="text-center">Mevcut</TableHead>
                      <TableHead className="text-center">Hedef</TableHead>
                      <TableHead>Iyilestirme Onerisi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_MUDA_CATEGORIES.map((muda) => (
                      <TableRow key={muda.id}>
                        <TableCell className="font-medium">
                          {muda.wasteTypeTr}
                          <span className="text-xs text-muted-foreground ml-1">({muda.wasteType})</span>
                        </TableCell>
                        <TableCell className="text-sm">{muda.description}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            muda.currentScore >= 7 ? 'bg-red-100 text-red-700' :
                            muda.currentScore >= 5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {muda.currentScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-green-100 text-green-700">
                            {muda.targetScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{muda.improvementSuggestion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
