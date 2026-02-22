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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Eye, Package } from 'lucide-react';
import { SOCK_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MOCK_PRODUCTS = [
  {
    id: '1',
    sku: 'SP001-SYH-M',
    model: 'Spor',
    color: 'Siyah',
    size: 'M (39-42)',
    sock_type: 'ankle',
    category: 'mamul',
    unit_cost: 8.50,
    unit_price: 15.00,
    stock_level: 450,
    reorder_point: 100,
    reorder_quantity: 500,
    status: 'active',
    barcode: '8690123456001',
  },
  {
    id: '2',
    sku: 'CR002-LCV-L',
    model: 'Crew',
    color: 'Lacivert',
    size: 'L (43-46)',
    sock_type: 'crew',
    category: 'mamul',
    unit_cost: 10.00,
    unit_price: 18.00,
    stock_level: 280,
    reorder_point: 150,
    reorder_quantity: 400,
    status: 'active',
    barcode: '8690123456002',
  },
  {
    id: '3',
    sku: 'NS003-BYZ-S',
    model: 'No Show',
    color: 'Beyaz',
    size: 'S (36-39)',
    sock_type: 'no_show',
    category: 'mamul',
    unit_cost: 7.00,
    unit_price: 12.00,
    stock_level: 75,
    reorder_point: 100,
    reorder_quantity: 500,
    status: 'active',
    barcode: '8690123456003',
  },
  {
    id: '4',
    sku: 'KH004-GRI-M',
    model: 'Diz Alti',
    color: 'Gri',
    size: 'M (39-42)',
    sock_type: 'knee_high',
    category: 'mamul',
    unit_cost: 12.00,
    unit_price: 22.00,
    stock_level: 180,
    reorder_point: 80,
    reorder_quantity: 300,
    status: 'active',
    barcode: '8690123456004',
  },
  {
    id: '5',
    sku: 'QT005-KRM-L',
    model: 'Quarter',
    color: 'Kirmizi',
    size: 'L (43-46)',
    sock_type: 'quarter',
    category: 'mamul',
    unit_cost: 9.00,
    unit_price: 16.00,
    stock_level: 320,
    reorder_point: 120,
    reorder_quantity: 400,
    status: 'active',
    barcode: '8690123456005',
  },
  {
    id: '6',
    sku: 'SP006-MVI-S',
    model: 'Spor',
    color: 'Mavi',
    size: 'S (36-39)',
    sock_type: 'ankle',
    category: 'mamul',
    unit_cost: 8.00,
    unit_price: 14.50,
    stock_level: 520,
    reorder_point: 100,
    reorder_quantity: 500,
    status: 'active',
    barcode: '8690123456006',
  },
  {
    id: '7',
    sku: 'CR007-YSL-M',
    model: 'Crew Premium',
    color: 'Yesil',
    size: 'M (39-42)',
    sock_type: 'crew',
    category: 'mamul',
    unit_cost: 11.00,
    unit_price: 20.00,
    stock_level: 210,
    reorder_point: 100,
    reorder_quantity: 300,
    status: 'active',
    barcode: '8690123456007',
  },
  {
    id: '8',
    sku: 'NS008-PBE-L',
    model: 'No Show Sport',
    color: 'Pembe',
    size: 'L (43-46)',
    sock_type: 'no_show',
    category: 'mamul',
    unit_cost: 7.50,
    unit_price: 13.00,
    stock_level: 150,
    reorder_point: 100,
    reorder_quantity: 400,
    status: 'active',
    barcode: '8690123456008',
  },
  {
    id: '9',
    sku: 'TH009-SYH-M',
    model: 'Uzun',
    color: 'Siyah',
    size: 'M (39-42)',
    sock_type: 'thigh_high',
    category: 'mamul',
    unit_cost: 15.00,
    unit_price: 28.00,
    stock_level: 95,
    reorder_point: 50,
    reorder_quantity: 200,
    status: 'active',
    barcode: '8690123456009',
  },
  {
    id: '10',
    sku: 'QT010-TRN-S',
    model: 'Quarter Elite',
    color: 'Turuncu',
    size: 'S (36-39)',
    sock_type: 'quarter',
    category: 'mamul',
    unit_cost: 9.50,
    unit_price: 17.00,
    stock_level: 0,
    reorder_point: 100,
    reorder_quantity: 350,
    status: 'inactive',
    barcode: '8690123456010',
  },
];

const MOCK_BOM = [
  { raw_material: 'Pamuk Iplik (Ne 30)', quantity: 0.15, unit: 'kg' },
  { raw_material: 'Elastik Lastik', quantity: 0.02, unit: 'kg' },
  { raw_material: 'Etiket - Logo', quantity: 1, unit: 'adet' },
  { raw_material: 'Polietilen Ambalaj', quantity: 1, unit: 'adet' },
];

const productSchema = z.object({
  sku: z.string().min(1, 'SKU gerekli'),
  model: z.string().min(1, 'Model gerekli'),
  color: z.string().min(1, 'Renk gerekli'),
  size: z.string().min(1, 'Beden gerekli'),
  sock_type: z.string().min(1, 'Tip gerekli'),
  category: z.string().min(1),
  unit_cost: z.number().min(0),
  unit_price: z.number().min(0),
  reorder_point: z.number().min(0),
  reorder_quantity: z.number().min(0),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductFormInput = z.input<typeof productSchema>;

export default function ProductsPage() {
  const [data, setData] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: 'mamul',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'mamul')
          .order('sku');

        if (err) throw err;
        if (result && result.length > 0) setData(result);
      } catch {
        setData(MOCK_PRODUCTS);
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
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesModel = modelFilter === 'all' || item.model === modelFilter;

      return matchesSearch && matchesCategory && matchesModel;
    });
  }, [data, searchQuery, categoryFilter, modelFilter]);

  const models = useMemo(() => {
    return Array.from(new Set(data.map((p) => p.model)));
  }, [data]);

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setValue('sku', product.sku);
      setValue('model', product.model);
      setValue('color', product.color);
      setValue('size', product.size);
      setValue('sock_type', product.sock_type);
      setValue('category', product.category);
      setValue('unit_cost', product.unit_cost);
      setValue('unit_price', product.unit_price);
      setValue('reorder_point', product.reorder_point);
      setValue('reorder_quantity', product.reorder_quantity);
      setValue('barcode', product.barcode || '');
    } else {
      setEditingProduct(null);
      reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = async (formData: ProductFormData) => {
    try {
      const supabase = createClient();

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;

        setData((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...formData } : p))
        );
        toast.success('Urun guncellendi');
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([{ ...formData, status: 'active', stock_level: 0 }])
          .select()
          .single();

        if (insertError) throw insertError;

        setData((prev) => [...prev, newProduct]);
        toast.success('Urun eklendi');
      }

      setDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const getStockStatus = (stockLevel: number, reorderPoint: number) => {
    if (stockLevel === 0) return { status: 'out_of_stock', label: 'Stok Yok' };
    if (stockLevel <= reorderPoint) return { status: 'low_stock', label: 'Dusuk Stok' };
    return { status: 'normal', label: 'Normal' };
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Urunler"
        description="Mamul urunleri yonetin"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 size-4" />
            Yeni Urun
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="SKU, model veya renk ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tum Modeller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Modeller</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <EmptyState
              icon={<Package className="size-6" />}
              title="Urun bulunamadi"
              description="Aramaniza uygun urun yok. Filtrelerinizi kontrol edin."
              action={
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 size-4" />
                  Ilk Urunu Ekle
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Renk</TableHead>
                    <TableHead>Beden</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead className="text-right">Maliyet</TableHead>
                    <TableHead className="text-right">Fiyat</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((product) => {
                    const stockStatus = getStockStatus(product.stock_level, product.reorder_point);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.model}</TableCell>
                        <TableCell>{product.color}</TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>{SOCK_TYPE_LABELS[product.sock_type as keyof typeof SOCK_TYPE_LABELS]}</TableCell>
                        <TableCell className="text-right">
                          {product.unit_cost.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          TL
                        </TableCell>
                        <TableCell className="text-right">
                          {product.unit_price.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          TL
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={stockStatus.status} label={product.stock_level.toString()} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={product.status} label={product.status === 'active' ? 'Aktif' : 'Pasif'} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(product)}>
                              <Edit className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Urun Duzenle' : 'Yeni Urun'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register('sku')} />
                {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
              </div>
              <div>
                <Label htmlFor="barcode">Barkod</Label>
                <Input id="barcode" {...register('barcode')} />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" {...register('model')} />
                {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
              </div>
              <div>
                <Label htmlFor="color">Renk</Label>
                <Input id="color" {...register('color')} />
                {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
              </div>
              <div>
                <Label htmlFor="size">Beden</Label>
                <Input id="size" {...register('size')} placeholder="M (39-42)" />
                {errors.size && <p className="text-sm text-destructive">{errors.size.message}</p>}
              </div>
              <div>
                <Label htmlFor="sock_type">Corap Tipi</Label>
                <select id="sock_type" {...register('sock_type')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">Secin</option>
                  {Object.entries(SOCK_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.sock_type && <p className="text-sm text-destructive">{errors.sock_type.message}</p>}
              </div>
              <div>
                <Label htmlFor="unit_cost">Birim Maliyet (TL)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  {...register('unit_cost', { valueAsNumber: true })}
                />
                {errors.unit_cost && <p className="text-sm text-destructive">{errors.unit_cost.message}</p>}
              </div>
              <div>
                <Label htmlFor="unit_price">Birim Fiyat (TL)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  {...register('unit_price', { valueAsNumber: true })}
                />
                {errors.unit_price && <p className="text-sm text-destructive">{errors.unit_price.message}</p>}
              </div>
              <div>
                <Label htmlFor="reorder_point">Yeniden Siparis Noktasi</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  {...register('reorder_point', { valueAsNumber: true })}
                />
                {errors.reorder_point && <p className="text-sm text-destructive">{errors.reorder_point.message}</p>}
              </div>
              <div>
                <Label htmlFor="reorder_quantity">Yeniden Siparis Miktari</Label>
                <Input
                  id="reorder_quantity"
                  type="number"
                  {...register('reorder_quantity', { valueAsNumber: true })}
                />
                {errors.reorder_quantity && <p className="text-sm text-destructive">{errors.reorder_quantity.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">{editingProduct ? 'Guncelle' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Urun Detayi</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">SKU</Label>
                  <p className="font-medium">{selectedProduct.sku}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Barkod</Label>
                  <p className="font-medium">{selectedProduct.barcode || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{selectedProduct.model}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Renk</Label>
                  <p className="font-medium">{selectedProduct.color}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Beden</Label>
                  <p className="font-medium">{selectedProduct.size}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tip</Label>
                  <p className="font-medium">
                    {SOCK_TYPE_LABELS[selectedProduct.sock_type as keyof typeof SOCK_TYPE_LABELS]}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Recete (BOM)</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hammadde</TableHead>
                        <TableHead className="text-right">Miktar</TableHead>
                        <TableHead>Birim</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_BOM.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.raw_material}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
