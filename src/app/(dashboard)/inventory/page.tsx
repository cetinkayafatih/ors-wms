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
import { Search, ArrowRightLeft, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { QUALITY_STATUS_LABELS, MOVEMENT_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const MOCK_INVENTORY = [
  {
    id: '1',
    item_type: 'mamul',
    sku: 'SP001-SYH-M',
    product_name: 'Spor Corap Siyah M',
    location_code: 'WH01-A-R01-S3-B02',
    quantity: 450,
    reserved_quantity: 50,
    available_quantity: 400,
    quality_status: 'available',
    lot_number: 'LOT-2026-001',
  },
  {
    id: '2',
    item_type: 'mamul',
    sku: 'CR002-LCV-L',
    product_name: 'Crew Corap Lacivert L',
    location_code: 'WH01-A-R02-S1-B01',
    quantity: 280,
    reserved_quantity: 30,
    available_quantity: 250,
    quality_status: 'available',
    lot_number: 'LOT-2026-002',
  },
  {
    id: '3',
    item_type: 'mamul',
    sku: 'NS003-BYZ-S',
    product_name: 'No Show Beyaz S',
    location_code: 'WH01-A-R01-S2-B03',
    quantity: 75,
    reserved_quantity: 0,
    available_quantity: 75,
    quality_status: 'available',
    lot_number: 'LOT-2026-003',
  },
  {
    id: '4',
    item_type: 'hammadde',
    sku: 'IPL-PMK-30',
    product_name: 'Pamuk Iplik Ne 30',
    location_code: 'WH01-B-R01-S1-B01',
    quantity: 2500,
    reserved_quantity: 200,
    available_quantity: 2300,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-001',
  },
  {
    id: '5',
    item_type: 'hammadde',
    sku: 'IPL-PMK-40',
    product_name: 'Pamuk Iplik Ne 40',
    location_code: 'WH01-B-R01-S2-B02',
    quantity: 1800,
    reserved_quantity: 150,
    available_quantity: 1650,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-002',
  },
  {
    id: '6',
    item_type: 'hammadde',
    sku: 'ELS-STD-100',
    product_name: 'Elastik Lastik Standart',
    location_code: 'WH01-B-R02-S1-B01',
    quantity: 500,
    reserved_quantity: 50,
    available_quantity: 450,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-003',
  },
  {
    id: '7',
    item_type: 'hammadde',
    sku: 'BYA-SYH-001',
    product_name: 'Siyah Tekstil Boyasi',
    location_code: 'WH01-B-R03-S1-B01',
    quantity: 120,
    reserved_quantity: 10,
    available_quantity: 110,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-004',
  },
  {
    id: '8',
    item_type: 'mamul',
    sku: 'KH004-GRI-M',
    product_name: 'Diz Alti Gri M',
    location_code: 'WH01-A-R03-S2-B01',
    quantity: 180,
    reserved_quantity: 20,
    available_quantity: 160,
    quality_status: 'available',
    lot_number: 'LOT-2026-004',
  },
  {
    id: '9',
    item_type: 'mamul',
    sku: 'QT005-KRM-L',
    product_name: 'Quarter Kirmizi L',
    location_code: 'WH01-A-R02-S3-B02',
    quantity: 320,
    reserved_quantity: 40,
    available_quantity: 280,
    quality_status: 'available',
    lot_number: 'LOT-2026-005',
  },
  {
    id: '10',
    item_type: 'hammadde',
    sku: 'ETK-LGO-001',
    product_name: 'Logo Etiket',
    location_code: 'WH01-B-R02-S2-B03',
    quantity: 5000,
    reserved_quantity: 500,
    available_quantity: 4500,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-005',
  },
  {
    id: '11',
    item_type: 'hammadde',
    sku: 'AMB-PLT-001',
    product_name: 'Polietilen Ambalaj',
    location_code: 'WH01-B-R03-S2-B01',
    quantity: 8000,
    reserved_quantity: 600,
    available_quantity: 7400,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-006',
  },
  {
    id: '12',
    item_type: 'mamul',
    sku: 'SP006-MVI-S',
    product_name: 'Spor Mavi S',
    location_code: 'WH01-A-R01-S1-B01',
    quantity: 520,
    reserved_quantity: 60,
    available_quantity: 460,
    quality_status: 'available',
    lot_number: 'LOT-2026-006',
  },
  {
    id: '13',
    item_type: 'mamul',
    sku: 'CR007-YSL-M',
    product_name: 'Crew Premium Yesil M',
    location_code: 'WH01-A-R02-S2-B02',
    quantity: 210,
    reserved_quantity: 25,
    available_quantity: 185,
    quality_status: 'available',
    lot_number: 'LOT-2026-007',
  },
  {
    id: '14',
    item_type: 'hammadde',
    sku: 'BYA-LCV-002',
    product_name: 'Lacivert Tekstil Boyasi',
    location_code: 'WH01-B-R03-S1-B02',
    quantity: 95,
    reserved_quantity: 8,
    available_quantity: 87,
    quality_status: 'available',
    lot_number: 'LOT-RM-2026-007',
  },
  {
    id: '15',
    item_type: 'mamul',
    sku: 'NS008-PBE-L',
    product_name: 'No Show Sport Pembe L',
    location_code: 'WH01-A-R03-S1-B03',
    quantity: 150,
    reserved_quantity: 15,
    available_quantity: 135,
    quality_status: 'available',
    lot_number: 'LOT-2026-008',
  },
];

const MOCK_MOVEMENTS = [
  {
    id: '1',
    movement_type: 'receive',
    sku: 'SP001-SYH-M',
    quantity: 500,
    from_location: null,
    to_location: 'WH01-A-R01-S3-B02',
    created_at: '2026-02-20T10:30:00',
    user_name: 'Mehmet Yilmaz',
  },
  {
    id: '2',
    movement_type: 'pick',
    sku: 'CR002-LCV-L',
    quantity: 50,
    from_location: 'WH01-A-R02-S1-B01',
    to_location: null,
    created_at: '2026-02-21T14:20:00',
    user_name: 'Ayse Kaya',
  },
  {
    id: '3',
    movement_type: 'transfer',
    sku: 'IPL-PMK-30',
    quantity: 200,
    from_location: 'WH01-B-R01-S1-B01',
    to_location: 'WH01-C-R01-S1-B01',
    created_at: '2026-02-21T16:45:00',
    user_name: 'Ali Demir',
  },
  {
    id: '4',
    movement_type: 'adjust_in',
    sku: 'NS003-BYZ-S',
    quantity: 25,
    from_location: null,
    to_location: 'WH01-A-R01-S2-B03',
    created_at: '2026-02-22T09:15:00',
    user_name: 'Fatma Ozturk',
  },
  {
    id: '5',
    movement_type: 'ship',
    sku: 'QT005-KRM-L',
    quantity: 80,
    from_location: 'WH01-A-R02-S3-B02',
    to_location: null,
    created_at: '2026-02-22T11:00:00',
    user_name: 'Mehmet Yilmaz',
  },
];

const adjustmentSchema = z.object({
  sku: z.string().min(1, 'SKU gerekli'),
  location_code: z.string().min(1, 'Lokasyon gerekli'),
  quantity: z.number().min(1, 'Miktar 0\'dan buyuk olmali'),
  movement_type: z.enum(['adjust_in', 'adjust_out']),
  reason: z.string().min(1, 'Neden gerekli'),
});

const transferSchema = z.object({
  sku: z.string().min(1, 'SKU gerekli'),
  from_location: z.string().min(1, 'Kaynak lokasyon gerekli'),
  to_location: z.string().min(1, 'Hedef lokasyon gerekli'),
  quantity: z.number().min(1, 'Miktar 0\'dan buyuk olmali'),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;
type TransferFormData = z.infer<typeof transferSchema>;

export default function InventoryPage() {
  const [data, setData] = useState(MOCK_INVENTORY);
  const [movements, setMovements] = useState(MOCK_MOVEMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('mamul');

  const {
    register: registerAdjust,
    handleSubmit: handleSubmitAdjust,
    formState: { errors: adjustErrors },
    reset: resetAdjust,
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    formState: { errors: transferErrors },
    reset: resetTransfer,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('inventory')
          .select('*')
          .order('sku');

        if (err) throw err;
        if (result && result.length > 0) setData(result);
      } catch {
        setData(MOCK_INVENTORY);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesQuality = qualityFilter === 'all' || item.quality_status === qualityFilter;
      const matchesTab = item.item_type === activeTab;

      return matchesSearch && matchesQuality && matchesTab;
    });
  }, [data, searchQuery, qualityFilter, activeTab]);

  const onSubmitAdjustment = async (formData: AdjustmentFormData) => {
    try {
      const supabase = createClient();

      const { error: moveError } = await supabase.from('stock_movements').insert([
        {
          movement_type: formData.movement_type,
          sku: formData.sku,
          quantity: formData.quantity,
          [formData.movement_type === 'adjust_in' ? 'to_location' : 'from_location']: formData.location_code,
          notes: formData.reason,
        },
      ]);

      if (moveError) throw moveError;

      toast.success('Stok duzeltmesi yapildi');
      setAdjustDialogOpen(false);
      resetAdjust();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const onSubmitTransfer = async (formData: TransferFormData) => {
    try {
      const supabase = createClient();

      const { error: moveError } = await supabase.from('stock_movements').insert([
        {
          movement_type: 'transfer',
          sku: formData.sku,
          quantity: formData.quantity,
          from_location: formData.from_location,
          to_location: formData.to_location,
        },
      ]);

      if (moveError) throw moveError;

      toast.success('Transfer tamamlandi');
      setTransferDialogOpen(false);
      resetTransfer();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Yonetimi"
        description="Mamul ve hammadde stok durumunu goruntuleyin"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTransferDialogOpen(true)}>
              <ArrowRightLeft className="mr-2 size-4" />
              Transfer
            </Button>
            <Button onClick={() => setAdjustDialogOpen(true)}>
              <TrendingUp className="mr-2 size-4" />
              Duzeltme
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mamul">Mamul</TabsTrigger>
          <TabsTrigger value="hammadde">Hammadde</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="SKU, urun veya lokasyon ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={qualityFilter} onValueChange={setQualityFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Kalite Durumu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Durumlar</SelectItem>
                    {Object.entries(QUALITY_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <EmptyState
                  icon={<Package className="size-6" />}
                  title="Stok bulunamadi"
                  description="Aramaniza uygun stok kaydi yok."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Urun Adi</TableHead>
                        <TableHead>Lokasyon</TableHead>
                        <TableHead className="text-right">Miktar</TableHead>
                        <TableHead className="text-right">Rezerve</TableHead>
                        <TableHead className="text-right">Kullanilabilir</TableHead>
                        <TableHead>Kalite</TableHead>
                        <TableHead>Parti No</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell className="font-mono text-sm">{item.location_code}</TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString('tr-TR')}</TableCell>
                          <TableCell className="text-right">{item.reserved_quantity.toLocaleString('tr-TR')}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.available_quantity.toLocaleString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={item.quality_status}
                              label={QUALITY_STATUS_LABELS[item.quality_status as keyof typeof QUALITY_STATUS_LABELS]}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.lot_number}</TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>Son Hareketler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Islem Tipi</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Hedef</TableHead>
                  <TableHead>Kullanici</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <StatusBadge
                        status={movement.movement_type}
                        label={MOVEMENT_TYPE_LABELS[movement.movement_type as keyof typeof MOVEMENT_TYPE_LABELS]}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{movement.sku}</TableCell>
                    <TableCell className="text-right">{movement.quantity.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="font-mono text-sm">{movement.from_location || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{movement.to_location || '-'}</TableCell>
                    <TableCell>{movement.user_name}</TableCell>
                    <TableCell>{format(new Date(movement.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stok Duzeltme</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdjust(onSubmitAdjustment)} className="space-y-4">
            <div>
              <Label htmlFor="adj_sku">SKU</Label>
              <Input id="adj_sku" {...registerAdjust('sku')} />
              {adjustErrors.sku && <p className="text-sm text-destructive">{adjustErrors.sku.message}</p>}
            </div>
            <div>
              <Label htmlFor="adj_location">Lokasyon</Label>
              <Input id="adj_location" {...registerAdjust('location_code')} />
              {adjustErrors.location_code && (
                <p className="text-sm text-destructive">{adjustErrors.location_code.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adj_type">Islem Tipi</Label>
              <select
                id="adj_type"
                {...registerAdjust('movement_type')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="adjust_in">Duzeltme (+)</option>
                <option value="adjust_out">Duzeltme (-)</option>
              </select>
              {adjustErrors.movement_type && (
                <p className="text-sm text-destructive">{adjustErrors.movement_type.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adj_quantity">Miktar</Label>
              <Input
                id="adj_quantity"
                type="number"
                {...registerAdjust('quantity', { valueAsNumber: true })}
              />
              {adjustErrors.quantity && <p className="text-sm text-destructive">{adjustErrors.quantity.message}</p>}
            </div>
            <div>
              <Label htmlFor="adj_reason">Neden</Label>
              <Input id="adj_reason" {...registerAdjust('reason')} placeholder="Sayim farki, hasar vb." />
              {adjustErrors.reason && <p className="text-sm text-destructive">{adjustErrors.reason.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stok Transferi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransfer(onSubmitTransfer)} className="space-y-4">
            <div>
              <Label htmlFor="tr_sku">SKU</Label>
              <Input id="tr_sku" {...registerTransfer('sku')} />
              {transferErrors.sku && <p className="text-sm text-destructive">{transferErrors.sku.message}</p>}
            </div>
            <div>
              <Label htmlFor="tr_from">Kaynak Lokasyon</Label>
              <Input id="tr_from" {...registerTransfer('from_location')} />
              {transferErrors.from_location && (
                <p className="text-sm text-destructive">{transferErrors.from_location.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tr_to">Hedef Lokasyon</Label>
              <Input id="tr_to" {...registerTransfer('to_location')} />
              {transferErrors.to_location && (
                <p className="text-sm text-destructive">{transferErrors.to_location.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tr_quantity">Miktar</Label>
              <Input
                id="tr_quantity"
                type="number"
                {...registerTransfer('quantity', { valueAsNumber: true })}
              />
              {transferErrors.quantity && <p className="text-sm text-destructive">{transferErrors.quantity.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">Transfer Et</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
