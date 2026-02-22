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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Package, Truck, X, CheckCircle2 } from 'lucide-react';
import { SO_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const MOCK_SOS = [
  {
    id: '1',
    so_number: 'SO-2026-001',
    customer_name: 'ABC Perakende A.S.',
    status: 'confirmed',
    order_date: '2026-02-20',
    required_date: '2026-02-27',
    total_amount: 6750,
    priority: 'normal',
  },
  {
    id: '2',
    so_number: 'SO-2026-002',
    customer_name: 'XYZ Magazalari Ltd.',
    status: 'picking',
    order_date: '2026-02-19',
    required_date: '2026-02-25',
    total_amount: 12800,
    priority: 'high',
  },
  {
    id: '3',
    so_number: 'SO-2026-003',
    customer_name: 'Online Satis Platformu',
    status: 'picked',
    order_date: '2026-02-21',
    required_date: '2026-02-28',
    total_amount: 4500,
    priority: 'urgent',
  },
  {
    id: '4',
    so_number: 'SO-2026-004',
    customer_name: 'Toptan Ticaret A.S.',
    status: 'shipped',
    order_date: '2026-02-15',
    required_date: '2026-02-22',
    total_amount: 28000,
    priority: 'normal',
  },
  {
    id: '5',
    so_number: 'SO-2026-005',
    customer_name: 'Perakende Zinciri',
    status: 'draft',
    order_date: '2026-02-22',
    required_date: '2026-03-01',
    total_amount: 15600,
    priority: 'low',
  },
];

const MOCK_SHIPMENTS = [
  {
    id: '1',
    shipment_number: 'SHP-2026-001',
    so_number: 'SO-2026-004',
    customer_name: 'Toptan Ticaret A.S.',
    shipped_date: '2026-02-22T14:30:00',
    carrier: 'MNG Kargo',
    tracking_number: 'MNG123456789TR',
  },
  {
    id: '2',
    shipment_number: 'SHP-2026-002',
    so_number: 'SO-2026-002',
    customer_name: 'XYZ Magazalari Ltd.',
    shipped_date: '2026-02-21T11:15:00',
    carrier: 'Yurtici Kargo',
    tracking_number: 'YK987654321TR',
  },
];

const soLineSchema = z.object({
  product_sku: z.string().min(1, 'SKU gerekli'),
  product_name: z.string().min(1, 'Urun gerekli'),
  quantity: z.number().min(1, 'Miktar gerekli'),
  unit_price: z.number().min(0, 'Birim fiyat gerekli'),
});

const soSchema = z.object({
  customer_name: z.string().min(1, 'Musteri gerekli'),
  order_date: z.string().min(1, 'Siparis tarihi gerekli'),
  required_date: z.string().min(1, 'Istenen tarih gerekli'),
  priority: z.string().optional().default('normal'),
  lines: z.array(soLineSchema).min(1, 'En az bir kalem gerekli'),
});

type SOFormData = z.infer<typeof soSchema>;
type SOFormInput = z.input<typeof soSchema>;

export default function ShippingPage() {
  const [sos, setSOs] = useState(MOCK_SOS);
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [soDialogOpen, setSODialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sos');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<SOFormInput, unknown, SOFormData>({
    resolver: zodResolver(soSchema),
    defaultValues: {
      priority: 'normal',
      lines: [{ product_sku: '', product_name: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [sosResult, shipmentsResult] = await Promise.all([
          supabase.from('sales_orders').select('*').order('so_number', { ascending: false }),
          supabase.from('shipments').select('*, sales_orders(so_number)').order('shipment_number', { ascending: false }),
        ]);

        if (sosResult.data && sosResult.data.length > 0) setSOs(sosResult.data);
        if (shipmentsResult.data && shipmentsResult.data.length > 0) setShipments(shipmentsResult.data);
      } catch {
        setSOs(MOCK_SOS);
        setShipments(MOCK_SHIPMENTS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSOs = useMemo(() => {
    return sos.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.so_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [sos, searchQuery, statusFilter, priorityFilter]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.shipment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.so_number.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [shipments, searchQuery]);

  const onSubmit = async (formData: SOFormData) => {
    try {
      const supabase = createClient();

      const totalAmount = formData.lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);

      const { data: newSO, error: soError } = await supabase
        .from('sales_orders')
        .insert([
          {
            customer_name: formData.customer_name,
            status: 'draft',
            order_date: formData.order_date,
            required_date: formData.required_date,
            priority: formData.priority,
            total_amount: totalAmount,
          },
        ])
        .select()
        .single();

      if (soError) throw soError;

      const { error: linesError } = await supabase.from('sales_order_lines').insert(
        formData.lines.map((line) => ({
          so_id: newSO.id,
          product_sku: line.product_sku,
          product_name: line.product_name,
          quantity: line.quantity,
          unit_price: line.unit_price,
        }))
      );

      if (linesError) throw linesError;

      setSOs((prev) => [{ ...newSO, total_amount: totalAmount }, ...prev]);
      toast.success('Satis siparisi olusturuldu');
      setSODialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const handleStatusChange = async (soId: string, newStatus: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase.from('sales_orders').update({ status: newStatus }).eq('id', soId);

      if (error) throw error;

      setSOs((prev) => prev.map((so) => (so.id === soId ? { ...so, status: newStatus } : so)));
      toast.success(`Durum guncellendi: ${SO_STATUS_LABELS[newStatus as keyof typeof SO_STATUS_LABELS]}`);
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sevkiyat"
        description="Satis siparisleri ve sevkiyat islemlerini yonetin"
        actions={
          <Button onClick={() => setSODialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Yeni Siparis
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sos">Satis Siparisleri</TabsTrigger>
          <TabsTrigger value="shipments">Sevkiyatlar</TabsTrigger>
        </TabsList>

        <TabsContent value="sos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Siparis numarasi veya musteri ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tum Durumlar</SelectItem>
                      {Object.entries(SO_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Oncelik" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tum Oncelikler</SelectItem>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSOs.length === 0 ? (
                <EmptyState
                  icon={<Package className="size-6" />}
                  title="Siparis bulunamadi"
                  description="Aramaniza uygun satis siparisi yok."
                  action={
                    <Button onClick={() => setSODialogOpen(true)}>
                      <Plus className="mr-2 size-4" />
                      Ilk Siparisi Olustur
                    </Button>
                  }
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siparis No</TableHead>
                        <TableHead>Musteri</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Oncelik</TableHead>
                        <TableHead>Siparis Tarihi</TableHead>
                        <TableHead>Istenen Tarih</TableHead>
                        <TableHead className="text-right">Toplam Tutar</TableHead>
                        <TableHead className="text-right">Islemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSOs.map((so) => (
                        <TableRow key={so.id}>
                          <TableCell className="font-medium">{so.so_number}</TableCell>
                          <TableCell>{so.customer_name}</TableCell>
                          <TableCell>
                            <StatusBadge status={so.status} label={SO_STATUS_LABELS[so.status as keyof typeof SO_STATUS_LABELS]} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={so.priority} label={PRIORITY_LABELS[so.priority as keyof typeof PRIORITY_LABELS]} />
                          </TableCell>
                          <TableCell>{format(new Date(so.order_date), 'dd.MM.yyyy')}</TableCell>
                          <TableCell>{format(new Date(so.required_date), 'dd.MM.yyyy')}</TableCell>
                          <TableCell className="text-right">
                            {so.total_amount.toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            TL
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {so.status === 'confirmed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(so.id, 'picking')}
                                  title="Toplamaya Basla"
                                >
                                  <Package className="size-4" />
                                </Button>
                              )}
                              {so.status === 'picking' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(so.id, 'picked')}
                                  title="Toplama Tamamla"
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                              )}
                              {so.status === 'picked' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(so.id, 'shipped')}
                                  title="Sevk Et"
                                >
                                  <Truck className="size-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sevkiyat numarasi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredShipments.length === 0 ? (
                <EmptyState
                  icon={<Truck className="size-6" />}
                  title="Sevkiyat bulunamadi"
                  description="Henuz sevkiyat kaydi yok."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sevkiyat No</TableHead>
                        <TableHead>Siparis No</TableHead>
                        <TableHead>Musteri</TableHead>
                        <TableHead>Sevk Tarihi</TableHead>
                        <TableHead>Kargo</TableHead>
                        <TableHead>Takip No</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">{shipment.shipment_number}</TableCell>
                          <TableCell>{shipment.so_number}</TableCell>
                          <TableCell>{shipment.customer_name}</TableCell>
                          <TableCell>{format(new Date(shipment.shipped_date), 'dd.MM.yyyy HH:mm')}</TableCell>
                          <TableCell>{shipment.carrier}</TableCell>
                          <TableCell className="font-mono text-sm">{shipment.tracking_number}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={soDialogOpen} onOpenChange={setSODialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Satis Siparisi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Musteri</Label>
                <Input id="customer" {...register('customer_name')} />
                {errors.customer_name && <p className="text-sm text-destructive">{errors.customer_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="priority">Oncelik</Label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="order_date">Siparis Tarihi</Label>
                <Input id="order_date" type="date" {...register('order_date')} />
                {errors.order_date && <p className="text-sm text-destructive">{errors.order_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="required_date">Istenen Tarih</Label>
                <Input id="required_date" type="date" {...register('required_date')} />
                {errors.required_date && <p className="text-sm text-destructive">{errors.required_date.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Siparis Kalemleri</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_sku: '', product_name: '', quantity: 1, unit_price: 0 })}
                >
                  <Plus className="mr-2 size-4" />
                  Kalem Ekle
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`lines.${index}.product_sku`}>SKU</Label>
                        <Input {...register(`lines.${index}.product_sku`)} placeholder="SP001-SYH-M" />
                      </div>
                      <div>
                        <Label htmlFor={`lines.${index}.product_name`}>Urun</Label>
                        <Input {...register(`lines.${index}.product_name`)} placeholder="Spor Corap Siyah M" />
                      </div>
                      <div>
                        <Label htmlFor={`lines.${index}.quantity`}>Miktar</Label>
                        <Input type="number" {...register(`lines.${index}.quantity`, { valueAsNumber: true })} />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`lines.${index}.unit_price`}>Birim Fiyat</Label>
                          <Input type="number" step="0.01" {...register(`lines.${index}.unit_price`, { valueAsNumber: true })} />
                        </div>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="mt-auto" onClick={() => remove(index)}>
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSODialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Olustur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
