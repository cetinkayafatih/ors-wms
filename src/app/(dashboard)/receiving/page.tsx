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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Package, Truck, X } from 'lucide-react';
import { PO_STATUS_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const MOCK_POS = [
  {
    id: '1',
    po_number: 'PO-2026-001',
    supplier_name: 'Iplik Tedarik A.S.',
    status: 'approved',
    order_date: '2026-02-15',
    expected_delivery: '2026-02-25',
    total_amount: 45000,
  },
  {
    id: '2',
    po_number: 'PO-2026-002',
    supplier_name: 'Elastik Sanayi Ltd.',
    status: 'submitted',
    order_date: '2026-02-18',
    expected_delivery: '2026-02-28',
    total_amount: 12500,
  },
  {
    id: '3',
    po_number: 'PO-2026-003',
    supplier_name: 'Boya Kimya A.S.',
    status: 'partially_received',
    order_date: '2026-02-10',
    expected_delivery: '2026-02-20',
    total_amount: 8900,
  },
  {
    id: '4',
    po_number: 'PO-2026-004',
    supplier_name: 'Ambalaj Dunyasi',
    status: 'received',
    order_date: '2026-02-05',
    expected_delivery: '2026-02-15',
    total_amount: 5400,
  },
  {
    id: '5',
    po_number: 'PO-2026-005',
    supplier_name: 'Etiket Baskı Ltd.',
    status: 'draft',
    order_date: '2026-02-20',
    expected_delivery: '2026-03-05',
    total_amount: 3200,
  },
];

const MOCK_RECEIPTS = [
  {
    id: '1',
    receipt_number: 'GR-2026-001',
    po_number: 'PO-2026-003',
    supplier_name: 'Boya Kimya A.S.',
    received_date: '2026-02-20T14:30:00',
    total_quantity: 80,
    user_name: 'Mehmet Yilmaz',
  },
  {
    id: '2',
    receipt_number: 'GR-2026-002',
    po_number: 'PO-2026-004',
    supplier_name: 'Ambalaj Dunyasi',
    received_date: '2026-02-15T10:15:00',
    total_quantity: 10000,
    user_name: 'Ali Demir',
  },
  {
    id: '3',
    receipt_number: 'GR-2026-003',
    po_number: 'PO-2026-001',
    supplier_name: 'Iplik Tedarik A.S.',
    received_date: '2026-02-12T16:00:00',
    total_quantity: 500,
    user_name: 'Ayse Kaya',
  },
];

const poLineSchema = z.object({
  raw_material_sku: z.string().min(1, 'SKU gerekli'),
  raw_material_name: z.string().min(1, 'Urun gerekli'),
  quantity: z.number().min(1, 'Miktar gerekli'),
  unit_cost: z.number().min(0, 'Birim maliyet gerekli'),
});

const poSchema = z.object({
  supplier_name: z.string().min(1, 'Tedarikci gerekli'),
  order_date: z.string().min(1, 'Siparis tarihi gerekli'),
  expected_delivery: z.string().min(1, 'Teslim tarihi gerekli'),
  lines: z.array(poLineSchema).min(1, 'En az bir kalem gerekli'),
});

const receiptSchema = z.object({
  po_number: z.string().min(1, 'Siparis numarasi gerekli'),
  received_date: z.string().min(1, 'Teslim tarihi gerekli'),
  location_code: z.string().min(1, 'Lokasyon gerekli'),
});

type POFormData = z.infer<typeof poSchema>;
type ReceiptFormData = z.infer<typeof receiptSchema>;

export default function ReceivingPage() {
  const [pos, setPOs] = useState(MOCK_POS);
  const [receipts, setReceipts] = useState(MOCK_RECEIPTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  const {
    register: registerPO,
    handleSubmit: handleSubmitPO,
    formState: { errors: poErrors },
    reset: resetPO,
    control: controlPO,
  } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      lines: [{ raw_material_sku: '', raw_material_name: '', quantity: 1, unit_cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: controlPO,
    name: 'lines',
  });

  const {
    register: registerReceipt,
    handleSubmit: handleSubmitReceipt,
    formState: { errors: receiptErrors },
    reset: resetReceipt,
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [posResult, receiptsResult] = await Promise.all([
          supabase.from('purchase_orders').select('*, suppliers(name)').order('po_number', { ascending: false }),
          supabase.from('goods_receipts').select('*, purchase_orders(po_number)').order('receipt_number', { ascending: false }),
        ]);

        if (posResult.data && posResult.data.length > 0) setPOs(posResult.data);
        if (receiptsResult.data && receiptsResult.data.length > 0) setReceipts(receiptsResult.data);
      } catch {
        setPOs(MOCK_POS);
        setReceipts(MOCK_RECEIPTS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPOs = useMemo(() => {
    return pos.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pos, searchQuery, statusFilter]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.po_number.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [receipts, searchQuery]);

  const onSubmitPO = async (formData: POFormData) => {
    try {
      const supabase = createClient();

      const totalAmount = formData.lines.reduce((sum, line) => sum + line.quantity * line.unit_cost, 0);

      const { data: newPO, error: poError } = await supabase
        .from('purchase_orders')
        .insert([
          {
            supplier_name: formData.supplier_name,
            status: 'draft',
            order_date: formData.order_date,
            expected_delivery: formData.expected_delivery,
            total_amount: totalAmount,
          },
        ])
        .select()
        .single();

      if (poError) throw poError;

      const { error: linesError } = await supabase.from('purchase_order_lines').insert(
        formData.lines.map((line) => ({
          po_id: newPO.id,
          raw_material_sku: line.raw_material_sku,
          raw_material_name: line.raw_material_name,
          quantity: line.quantity,
          unit_cost: line.unit_cost,
        }))
      );

      if (linesError) throw linesError;

      setPOs((prev) => [{ ...newPO, total_amount: totalAmount }, ...prev]);
      toast.success('Satin alma siparisi olusturuldu');
      setPODialogOpen(false);
      resetPO();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const onSubmitReceipt = async (formData: ReceiptFormData) => {
    try {
      const supabase = createClient();

      const { data: newReceipt, error: receiptError } = await supabase
        .from('goods_receipts')
        .insert([
          {
            po_number: formData.po_number,
            received_date: formData.received_date,
            location_code: formData.location_code,
          },
        ])
        .select()
        .single();

      if (receiptError) throw receiptError;

      setReceipts((prev) => [newReceipt, ...prev]);
      toast.success('Mal kabul tamamlandi');
      setReceiptDialogOpen(false);
      resetReceipt();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mal Kabul"
        description="Satin alma ve mal kabul islemlerini yonetin"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReceiptDialogOpen(true)}>
              <Truck className="mr-2 size-4" />
              Mal Kabul
            </Button>
            <Button onClick={() => setPODialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Yeni Siparis
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pos">Satin Alma Siparisleri</TabsTrigger>
          <TabsTrigger value="receipts">Mal Kabulleri</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Siparis numarasi veya tedarikci ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Durumlar</SelectItem>
                    {Object.entries(PO_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPOs.length === 0 ? (
                <EmptyState
                  icon={<Package className="size-6" />}
                  title="Siparis bulunamadi"
                  description="Aramaniza uygun siparis yok."
                  action={
                    <Button onClick={() => setPODialogOpen(true)}>
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
                        <TableHead>Tedarikci</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Siparis Tarihi</TableHead>
                        <TableHead>Beklenen Teslimat</TableHead>
                        <TableHead className="text-right">Toplam Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.po_number}</TableCell>
                          <TableCell>{po.supplier_name}</TableCell>
                          <TableCell>
                            <StatusBadge status={po.status} label={PO_STATUS_LABELS[po.status as keyof typeof PO_STATUS_LABELS]} />
                          </TableCell>
                          <TableCell>{format(new Date(po.order_date), 'dd.MM.yyyy')}</TableCell>
                          <TableCell>{format(new Date(po.expected_delivery), 'dd.MM.yyyy')}</TableCell>
                          <TableCell className="text-right">
                            {po.total_amount.toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            TL
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

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Kabul numarasi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredReceipts.length === 0 ? (
                <EmptyState
                  icon={<Truck className="size-6" />}
                  title="Mal kabul bulunamadi"
                  description="Henuz mal kabul kaydi yok."
                  action={
                    <Button onClick={() => setReceiptDialogOpen(true)}>
                      <Truck className="mr-2 size-4" />
                      Ilk Mal Kabulunu Yap
                    </Button>
                  }
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kabul No</TableHead>
                        <TableHead>Siparis No</TableHead>
                        <TableHead>Tedarikci</TableHead>
                        <TableHead>Teslim Tarihi</TableHead>
                        <TableHead className="text-right">Toplam Miktar</TableHead>
                        <TableHead>Kullanici</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                          <TableCell>{receipt.po_number}</TableCell>
                          <TableCell>{receipt.supplier_name}</TableCell>
                          <TableCell>{format(new Date(receipt.received_date), 'dd.MM.yyyy HH:mm')}</TableCell>
                          <TableCell className="text-right">{receipt.total_quantity.toLocaleString('tr-TR')}</TableCell>
                          <TableCell>{receipt.user_name}</TableCell>
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

      <Dialog open={poDialogOpen} onOpenChange={setPODialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Satin Alma Siparisi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPO(onSubmitPO)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Tedarikci</Label>
                <Input id="supplier" {...registerPO('supplier_name')} />
                {poErrors.supplier_name && <p className="text-sm text-destructive">{poErrors.supplier_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="order_date">Siparis Tarihi</Label>
                <Input id="order_date" type="date" {...registerPO('order_date')} />
                {poErrors.order_date && <p className="text-sm text-destructive">{poErrors.order_date.message}</p>}
              </div>
              <div className="col-span-2">
                <Label htmlFor="expected_delivery">Beklenen Teslimat</Label>
                <Input id="expected_delivery" type="date" {...registerPO('expected_delivery')} />
                {poErrors.expected_delivery && <p className="text-sm text-destructive">{poErrors.expected_delivery.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Siparis Kalemleri</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ raw_material_sku: '', raw_material_name: '', quantity: 1, unit_cost: 0 })}
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
                        <Label htmlFor={`lines.${index}.raw_material_sku`}>SKU</Label>
                        <Input {...registerPO(`lines.${index}.raw_material_sku`)} placeholder="IPL-PMK-30" />
                      </div>
                      <div>
                        <Label htmlFor={`lines.${index}.raw_material_name`}>Hammadde</Label>
                        <Input {...registerPO(`lines.${index}.raw_material_name`)} placeholder="Pamuk Iplik" />
                      </div>
                      <div>
                        <Label htmlFor={`lines.${index}.quantity`}>Miktar</Label>
                        <Input type="number" {...registerPO(`lines.${index}.quantity`, { valueAsNumber: true })} />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`lines.${index}.unit_cost`}>Birim Fiyat</Label>
                          <Input type="number" step="0.01" {...registerPO(`lines.${index}.unit_cost`, { valueAsNumber: true })} />
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
              <Button type="button" variant="outline" onClick={() => setPODialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Olustur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mal Kabul</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitReceipt(onSubmitReceipt)} className="space-y-4">
            <div>
              <Label htmlFor="po_number">Siparis Numarasi</Label>
              <select
                id="po_number"
                {...registerReceipt('po_number')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Secin</option>
                {pos
                  .filter((po) => po.status !== 'received' && po.status !== 'cancelled')
                  .map((po) => (
                    <option key={po.id} value={po.po_number}>
                      {po.po_number} - {po.supplier_name}
                    </option>
                  ))}
              </select>
              {receiptErrors.po_number && <p className="text-sm text-destructive">{receiptErrors.po_number.message}</p>}
            </div>
            <div>
              <Label htmlFor="received_date">Teslim Tarihi</Label>
              <Input id="received_date" type="datetime-local" {...registerReceipt('received_date')} />
              {receiptErrors.received_date && <p className="text-sm text-destructive">{receiptErrors.received_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="location_code">Lokasyon</Label>
              <Input id="location_code" {...registerReceipt('location_code')} placeholder="WH01-B-R01-S1-B01" />
              {receiptErrors.location_code && <p className="text-sm text-destructive">{receiptErrors.location_code.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReceiptDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Tamamla</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
