'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorDisplay } from '@/components/shared/error-display';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, ClipboardList, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const MOCK_COUNT_TASKS = [
  {
    id: '1',
    task_number: 'CNT-2026-001',
    count_type: 'cycle',
    status: 'completed',
    zone_code: 'A',
    planned_date: '2026-02-15',
    completed_date: '2026-02-15',
    assigned_to: 'Mehmet Yilmaz',
    variance_count: 2,
  },
  {
    id: '2',
    task_number: 'CNT-2026-002',
    count_type: 'full',
    status: 'in_progress',
    zone_code: 'B',
    planned_date: '2026-02-20',
    completed_date: null,
    assigned_to: 'Ayse Kaya',
    variance_count: 0,
  },
  {
    id: '3',
    task_number: 'CNT-2026-003',
    count_type: 'spot',
    status: 'planned',
    zone_code: 'A',
    planned_date: '2026-02-25',
    completed_date: null,
    assigned_to: 'Ali Demir',
    variance_count: 0,
  },
];

const MOCK_COUNT_LINES = [
  {
    id: '1',
    task_id: '1',
    sku: 'SP001-SYH-M',
    location_code: 'WH01-A-R01-S3-B02',
    system_quantity: 450,
    counted_quantity: 448,
    variance: -2,
  },
  {
    id: '2',
    task_id: '1',
    sku: 'CR002-LCV-L',
    location_code: 'WH01-A-R02-S1-B01',
    system_quantity: 280,
    counted_quantity: 282,
    variance: 2,
  },
  {
    id: '3',
    task_id: '1',
    sku: 'NS003-BYZ-S',
    location_code: 'WH01-A-R01-S2-B03',
    system_quantity: 75,
    counted_quantity: 75,
    variance: 0,
  },
];

const countTaskSchema = z.object({
  count_type: z.enum(['cycle', 'full', 'spot']),
  zone_code: z.string().min(1, 'Bolge gerekli'),
  planned_date: z.string().min(1, 'Tarih gerekli'),
  assigned_to: z.string().min(1, 'Atanan kisi gerekli'),
});

type CountTaskFormData = z.infer<typeof countTaskSchema>;

export default function StockCountPage() {
  const [tasks, setTasks] = useState(MOCK_COUNT_TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CountTaskFormData>({
    resolver: zodResolver(countTaskSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('stock_count_tasks')
          .select('*')
          .order('task_number', { ascending: false });

        if (err) throw err;
        if (result && result.length > 0) setTasks(result);
      } catch {
        setTasks(MOCK_COUNT_TASKS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.task_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.zone_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assigned_to.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  const onSubmit = async (formData: CountTaskFormData) => {
    try {
      const supabase = createClient();

      const { data: newTask, error: taskError } = await supabase
        .from('stock_count_tasks')
        .insert([
          {
            count_type: formData.count_type,
            status: 'planned',
            zone_code: formData.zone_code,
            planned_date: formData.planned_date,
            assigned_to: formData.assigned_to,
          },
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      setTasks((prev) => [newTask, ...prev]);
      toast.success('Sayim gorevi olusturuldu');
      setDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const getCountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cycle: 'Dongusel Sayim',
      full: 'Tam Sayim',
      spot: 'Anlik Sayim',
    };
    return labels[type] || type;
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Sayimi"
        description="Sayim gorevlerini yonetin ve varyans takibi yapin"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Yeni Sayim Gorevi
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.filter((t) => t.status === 'planned').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Devam Eden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.filter((t) => t.status === 'in_progress').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.filter((t) => t.status === 'completed').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Gorev numarasi veya atanan kisi ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Durumlar</SelectItem>
                <SelectItem value="planned">Planlanan</SelectItem>
                <SelectItem value="in_progress">Devam Eden</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-6" />}
              title="Sayim gorevi bulunamadi"
              description="Henuz sayim gorevi olusturulmamis."
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Ilk Gorevi Olustur
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gorev No</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Bolge</TableHead>
                    <TableHead>Planlanan Tarih</TableHead>
                    <TableHead>Atanan</TableHead>
                    <TableHead className="text-right">Varyans</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.task_number}</TableCell>
                      <TableCell>{getCountTypeLabel(task.count_type)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={task.status}
                          label={
                            task.status === 'planned'
                              ? 'Planlanan'
                              : task.status === 'in_progress'
                              ? 'Devam Eden'
                              : 'Tamamlanan'
                          }
                        />
                      </TableCell>
                      <TableCell>Bolge {task.zone_code}</TableCell>
                      <TableCell>{format(new Date(task.planned_date), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{task.assigned_to}</TableCell>
                      <TableCell className="text-right">
                        {task.variance_count > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-orange-600">
                            <AlertCircle className="size-4" />
                            {task.variance_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setDetailDialogOpen(true);
                          }}
                        >
                          Detay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sayim Gorevi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="count_type">Sayim Tipi</Label>
              <select
                id="count_type"
                {...register('count_type')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="cycle">Dongusel Sayim</option>
                <option value="full">Tam Sayim</option>
                <option value="spot">Anlik Sayim</option>
              </select>
              {errors.count_type && <p className="text-sm text-destructive">{errors.count_type.message}</p>}
            </div>
            <div>
              <Label htmlFor="zone_code">Bolge</Label>
              <Input id="zone_code" {...register('zone_code')} placeholder="A" />
              {errors.zone_code && <p className="text-sm text-destructive">{errors.zone_code.message}</p>}
            </div>
            <div>
              <Label htmlFor="planned_date">Planlanan Tarih</Label>
              <Input id="planned_date" type="date" {...register('planned_date')} />
              {errors.planned_date && <p className="text-sm text-destructive">{errors.planned_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="assigned_to">Atanan Kisi</Label>
              <Input id="assigned_to" {...register('assigned_to')} />
              {errors.assigned_to && <p className="text-sm text-destructive">{errors.assigned_to.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Olustur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sayim Detayi - {selectedTask?.task_number}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tip</Label>
                  <p className="font-medium">{getCountTypeLabel(selectedTask.count_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Durum</Label>
                  <StatusBadge
                    status={selectedTask.status}
                    label={
                      selectedTask.status === 'planned'
                        ? 'Planlanan'
                        : selectedTask.status === 'in_progress'
                        ? 'Devam Eden'
                        : 'Tamamlanan'
                    }
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Bolge</Label>
                  <p className="font-medium">Bolge {selectedTask.zone_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Atanan</Label>
                  <p className="font-medium">{selectedTask.assigned_to}</p>
                </div>
              </div>

              {selectedTask.status === 'completed' && (
                <div>
                  <h3 className="font-semibold mb-3">Sayim Satirlari</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Lokasyon</TableHead>
                          <TableHead className="text-right">Sistem</TableHead>
                          <TableHead className="text-right">Sayilan</TableHead>
                          <TableHead className="text-right">Varyans</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_COUNT_LINES.filter((line) => line.task_id === selectedTask.id).map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="font-medium">{line.sku}</TableCell>
                            <TableCell className="font-mono text-sm">{line.location_code}</TableCell>
                            <TableCell className="text-right">{line.system_quantity}</TableCell>
                            <TableCell className="text-right">{line.counted_quantity}</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  line.variance === 0
                                    ? 'text-green-600'
                                    : line.variance > 0
                                    ? 'text-blue-600'
                                    : 'text-orange-600'
                                }
                              >
                                {line.variance > 0 ? '+' : ''}
                                {line.variance}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
