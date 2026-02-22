'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorDisplay } from '@/components/shared/error-display';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import { ExportButtons } from '@/components/shared/export-buttons';
import { exportInspectionReportPDF } from '@/lib/export/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, ClipboardCheck, AlertTriangle, Target, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { calculateDPMO } from '@/lib/calculations';

const MOCK_INSPECTIONS = [
  {
    id: '1',
    inspection_number: 'QI-2026-001',
    reference_type: 'goods_receipt',
    reference_number: 'GR-2026-001',
    item_sku: 'IPL-PMK-30',
    item_name: 'Pamuk Iplik Ne 30',
    result: 'passed',
    defect_count: 0,
    inspection_date: '2026-02-20T15:00:00',
    inspector_name: 'Fatma Ozturk',
  },
  {
    id: '2',
    inspection_number: 'QI-2026-002',
    reference_type: 'production',
    reference_number: 'PROD-2026-045',
    item_sku: 'SP001-SYH-M',
    item_name: 'Spor Corap Siyah M',
    result: 'conditional',
    defect_count: 12,
    inspection_date: '2026-02-21T10:30:00',
    inspector_name: 'Fatma Ozturk',
  },
  {
    id: '3',
    inspection_number: 'QI-2026-003',
    reference_type: 'goods_receipt',
    reference_number: 'GR-2026-002',
    item_sku: 'AMB-PLT-001',
    item_name: 'Polietilen Ambalaj',
    result: 'passed',
    defect_count: 0,
    inspection_date: '2026-02-15T11:00:00',
    inspector_name: 'Fatma Ozturk',
  },
  {
    id: '4',
    inspection_number: 'QI-2026-004',
    reference_type: 'production',
    reference_number: 'PROD-2026-046',
    item_sku: 'CR002-LCV-L',
    item_name: 'Crew Corap Lacivert L',
    result: 'failed',
    defect_count: 45,
    inspection_date: '2026-02-19T14:15:00',
    inspector_name: 'Fatma Ozturk',
  },
  {
    id: '5',
    inspection_number: 'QI-2026-005',
    reference_type: 'production',
    reference_number: 'PROD-2026-047',
    item_sku: 'NS003-BYZ-S',
    item_name: 'No Show Beyaz S',
    result: 'passed',
    defect_count: 3,
    inspection_date: '2026-02-22T09:45:00',
    inspector_name: 'Fatma Ozturk',
  },
];

const DEFECT_TYPES = [
  'Delik / Kopuk',
  'Renk Hatasi',
  'Boyut Hatasi',
  'Lastik Gevsekligi',
  'Dikis Hatasi',
  'Leke',
  'Etiket Hatasi',
  'Ambalaj Hasari',
  'Iplik Kopuklugu',
  'Desenlemede Hata',
];

const inspectionSchema = z.object({
  reference_type: z.string().min(1, 'Referans tipi gerekli'),
  reference_number: z.string().min(1, 'Referans no gerekli'),
  item_sku: z.string().min(1, 'SKU gerekli'),
  item_name: z.string().min(1, 'Urun adi gerekli'),
  result: z.enum(['passed', 'failed', 'conditional']),
  defect_count: z.number().min(0),
  notes: z.string().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

export default function QualityPage() {
  const [inspections, setInspections] = useState(MOCK_INSPECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      result: 'passed',
      defect_count: 0,
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('quality_inspections')
          .select('*')
          .order('inspection_number', { ascending: false });

        if (err) throw err;
        if (result && result.length > 0) {
          setInspections(result);
          setUsingMockData(false);
        } else {
          setUsingMockData(true);
        }
      } catch {
        setInspections(MOCK_INSPECTIONS);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.inspection_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesResult = resultFilter === 'all' || item.result === resultFilter;

      return matchesSearch && matchesResult;
    });
  }, [inspections, searchQuery, resultFilter]);

  const stats = useMemo(() => {
    const total = inspections.length;
    const passed = inspections.filter((i) => i.result === 'passed').length;
    const failed = inspections.filter((i) => i.result === 'failed').length;
    const conditional = inspections.filter((i) => i.result === 'conditional').length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const totalDefects = inspections.reduce((sum, i) => sum + i.defect_count, 0);

    return { total, passed, failed, conditional, passRate, totalDefects };
  }, [inspections]);

  // DPMO calculation using library
  const dpmoResult = useMemo(() => {
    const opportunities = stats.total * 100; // Assume 100 opportunities per inspection
    return calculateDPMO(stats.totalDefects, opportunities);
  }, [stats]);

  const onSubmit = async (formData: InspectionFormData) => {
    try {
      const supabase = createClient();

      const { data: newInspection, error: inspectionError } = await supabase
        .from('quality_inspections')
        .insert([
          {
            reference_type: formData.reference_type,
            reference_number: formData.reference_number,
            item_sku: formData.item_sku,
            item_name: formData.item_name,
            result: formData.result,
            defect_count: formData.defect_count,
            notes: formData.notes,
            inspection_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      setInspections((prev) => [newInspection, ...prev]);
      toast.success('Kalite muayenesi kaydedildi');
      setDialogOpen(false);
      reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata olustu';
      toast.error(message);
    }
  };

  const getResultLabel = (result: string) => {
    const labels: Record<string, string> = {
      passed: 'Gecti',
      failed: 'Kaldi',
      conditional: 'Sartli',
    };
    return labels[result] || result;
  };

  const getReferenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      goods_receipt: 'Mal Kabul',
      production: 'Uretim',
      sales_order: 'Satis Siparisi',
    };
    return labels[type] || type;
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Kalite Kontrol"
          description="Muayene kayitlarini yonetin ve hata takibi yapin"
          actions={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Yeni Muayene
            </Button>
          }
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportPDF={() => exportInspectionReportPDF(
              inspections.map((ins) => ({
                inspection_number: ins.inspection_number,
                reference_type: ins.reference_type,
                item_sku: ins.item_sku,
                item_name: ins.item_name,
                result: ins.result,
                defect_count: ins.defect_count,
                inspection_date: ins.inspection_date,
                inspector_name: ins.inspector_name,
              }))
            )}
          />
          <MockDataBadge show={usingMockData} />
        </div>
      </div>

      {/* KPI Cards with DPMO */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-muted-foreground">Toplam Muayene</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-muted-foreground">Gecti</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-muted-foreground">Kaldi</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-muted-foreground">Gecme Orani</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Target className="size-3" />
              DPMO
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{dpmoResult.dpmo.toLocaleString('tr-TR')}</p>
            <p className="text-xs text-muted-foreground">{dpmoResult.accuracy}% dogruluk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Activity className="size-3" />
              Sigma Seviyesi
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">{dpmoResult.sigmaLevel}&#963;</p>
            <p className="text-xs text-muted-foreground">{stats.totalDefects} toplam hata</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Muayene no, referans veya SKU ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">Tum Sonuclar</option>
              <option value="passed">Gecti</option>
              <option value="failed">Kaldi</option>
              <option value="conditional">Sartli</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInspections.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="size-6" />}
              title="Muayene bulunamadi"
              description="Henuz kalite muayenesi yapilmamis."
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Ilk Muayeneyi Yap
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Muayene No</TableHead>
                    <TableHead>Referans Tipi</TableHead>
                    <TableHead>Referans No</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Urun</TableHead>
                    <TableHead>Sonuc</TableHead>
                    <TableHead className="text-right">Hata Sayisi</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kontrolor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">{inspection.inspection_number}</TableCell>
                      <TableCell>{getReferenceTypeLabel(inspection.reference_type)}</TableCell>
                      <TableCell>{inspection.reference_number}</TableCell>
                      <TableCell className="font-mono text-sm">{inspection.item_sku}</TableCell>
                      <TableCell>{inspection.item_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={inspection.result} label={getResultLabel(inspection.result)} />
                      </TableCell>
                      <TableCell className="text-right">
                        {inspection.defect_count > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-orange-600">
                            <AlertTriangle className="size-4" />
                            {inspection.defect_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(inspection.inspection_date), 'dd.MM.yyyy HH:mm')}</TableCell>
                      <TableCell>{inspection.inspector_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Ortak Hata Tipleri</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {DEFECT_TYPES.map((defect) => (
              <div key={defect} className="rounded-md border px-3 py-2 text-sm">
                {defect}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kalite Muayenesi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reference_type">Referans Tipi</Label>
                <select
                  id="reference_type"
                  {...register('reference_type')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Secin</option>
                  <option value="goods_receipt">Mal Kabul</option>
                  <option value="production">Uretim</option>
                  <option value="sales_order">Satis Siparisi</option>
                </select>
                {errors.reference_type && <p className="text-sm text-destructive">{errors.reference_type.message}</p>}
              </div>
              <div>
                <Label htmlFor="reference_number">Referans No</Label>
                <Input id="reference_number" {...register('reference_number')} placeholder="GR-2026-001" />
                {errors.reference_number && <p className="text-sm text-destructive">{errors.reference_number.message}</p>}
              </div>
              <div>
                <Label htmlFor="item_sku">SKU</Label>
                <Input id="item_sku" {...register('item_sku')} placeholder="SP001-SYH-M" />
                {errors.item_sku && <p className="text-sm text-destructive">{errors.item_sku.message}</p>}
              </div>
              <div>
                <Label htmlFor="item_name">Urun Adi</Label>
                <Input id="item_name" {...register('item_name')} />
                {errors.item_name && <p className="text-sm text-destructive">{errors.item_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="result">Sonuc</Label>
                <select
                  id="result"
                  {...register('result')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="passed">Gecti</option>
                  <option value="conditional">Sartli</option>
                  <option value="failed">Kaldi</option>
                </select>
                {errors.result && <p className="text-sm text-destructive">{errors.result.message}</p>}
              </div>
              <div>
                <Label htmlFor="defect_count">Hata Sayisi</Label>
                <Input id="defect_count" type="number" {...register('defect_count', { valueAsNumber: true })} />
                {errors.defect_count && <p className="text-sm text-destructive">{errors.defect_count.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
