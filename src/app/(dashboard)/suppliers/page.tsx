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
import { Plus, Search, Edit, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MOCK_SUPPLIERS = [
  {
    id: '1',
    code: 'SUP-001',
    name: 'Iplik Tedarik A.S.',
    contact_person: 'Ahmet Yilmaz',
    phone: '+90 212 555 0101',
    email: 'info@ipliktedarik.com',
    city: 'Istanbul',
    lead_time_days: 7,
    quality_rating: 4.8,
    status: 'active',
  },
  {
    id: '2',
    code: 'SUP-002',
    name: 'Elastik Sanayi Ltd.',
    contact_person: 'Mehmet Kaya',
    phone: '+90 232 555 0202',
    email: 'satis@elastiksanayi.com',
    city: 'Izmir',
    lead_time_days: 5,
    quality_rating: 4.5,
    status: 'active',
  },
  {
    id: '3',
    code: 'SUP-003',
    name: 'Boya Kimya A.S.',
    contact_person: 'Ayse Demir',
    phone: '+90 312 555 0303',
    email: 'bilgi@boyakimya.com',
    city: 'Ankara',
    lead_time_days: 10,
    quality_rating: 4.2,
    status: 'active',
  },
  {
    id: '4',
    code: 'SUP-004',
    name: 'Ambalaj Dunyasi',
    contact_person: 'Ali Ozturk',
    phone: '+90 216 555 0404',
    email: 'info@ambalajdunyasi.com',
    city: 'Istanbul',
    lead_time_days: 3,
    quality_rating: 4.9,
    status: 'active',
  },
  {
    id: '5',
    code: 'SUP-005',
    name: 'Etiket Baski Ltd.',
    contact_person: 'Fatma Celik',
    phone: '+90 224 555 0505',
    email: 'satis@etiketbaski.com',
    city: 'Bursa',
    lead_time_days: 4,
    quality_rating: 4.6,
    status: 'inactive',
  },
];

const supplierSchema = z.object({
  code: z.string().min(1, 'Tedarikci kodu gerekli'),
  name: z.string().min(1, 'Isim gerekli'),
  contact_person: z.string().min(1, 'Yetkili gerekli'),
  phone: z.string().min(1, 'Telefon gerekli'),
  email: z.string().email('Gecerli email gerekli'),
  city: z.string().min(1, 'Sehir gerekli'),
  lead_time_days: z.number().min(1, 'Termin suresi gerekli'),
  quality_rating: z.number().min(0).max(5).optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');

        if (err) throw err;
        if (result && result.length > 0) setSuppliers(result);
      } catch {
        setSuppliers(MOCK_SUPPLIERS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const handleOpenDialog = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setValue('code', supplier.code);
      setValue('name', supplier.name);
      setValue('contact_person', supplier.contact_person);
      setValue('phone', supplier.phone);
      setValue('email', supplier.email);
      setValue('city', supplier.city);
      setValue('lead_time_days', supplier.lead_time_days);
      setValue('quality_rating', supplier.quality_rating);
    } else {
      setEditingSupplier(null);
      reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = async (formData: SupplierFormData) => {
    try {
      const supabase = createClient();

      if (editingSupplier) {
        const { error: updateError } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', editingSupplier.id);

        if (updateError) throw updateError;

        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplier.id ? { ...s, ...formData } : s))
        );
        toast.success('Tedarikci guncellendi');
      } else {
        const { data: newSupplier, error: insertError } = await supabase
          .from('suppliers')
          .insert([{ ...formData, status: 'active' }])
          .select()
          .single();

        if (insertError) throw insertError;

        setSuppliers((prev) => [...prev, newSupplier]);
        toast.success('Tedarikci eklendi');
      }

      setDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const toggleSupplierStatus = async (supplierId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const supabase = createClient();

      const { error } = await supabase
        .from('suppliers')
        .update({ status: newStatus })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? { ...s, status: newStatus } : s))
      );
      toast.success(`Tedarikci ${newStatus === 'active' ? 'aktif' : 'pasif'} edildi`);
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tedarikciler"
        description="Tedarikci bilgilerini yonetin"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 size-4" />
            Yeni Tedarikci
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kod, isim veya sehir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="Tedarikci bulunamadi"
              description="Aramaniza uygun tedarikci yok."
              action={
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 size-4" />
                  Ilk Tedarikciiyi Ekle
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Isim</TableHead>
                    <TableHead>Yetkili</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Sehir</TableHead>
                    <TableHead className="text-right">Termin (Gun)</TableHead>
                    <TableHead className="text-right">Kalite</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.code}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.contact_person}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.city}</TableCell>
                      <TableCell className="text-right">{supplier.lead_time_days}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-medium">{supplier.quality_rating.toFixed(1)}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={supplier.status}
                          label={supplier.status === 'active' ? 'Aktif' : 'Pasif'}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(supplier)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSupplierStatus(supplier.id, supplier.status)}
                          >
                            {supplier.status === 'active' ? 'Pasifle' : 'Aktifle'}
                          </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Tedarikci Duzenle' : 'Yeni Tedarikci'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Tedarikci Kodu</Label>
                <Input id="code" {...register('code')} placeholder="SUP-001" />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
              <div>
                <Label htmlFor="name">Isim</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="contact_person">Yetkili</Label>
                <Input id="contact_person" {...register('contact_person')} />
                {errors.contact_person && <p className="text-sm text-destructive">{errors.contact_person.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...register('phone')} placeholder="+90 212 555 0101" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="city">Sehir</Label>
                <Input id="city" {...register('city')} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="lead_time_days">Termin Suresi (Gun)</Label>
                <Input id="lead_time_days" type="number" {...register('lead_time_days', { valueAsNumber: true })} />
                {errors.lead_time_days && <p className="text-sm text-destructive">{errors.lead_time_days.message}</p>}
              </div>
              <div>
                <Label htmlFor="quality_rating">Kalite Puani (0-5)</Label>
                <Input
                  id="quality_rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('quality_rating', { valueAsNumber: true })}
                />
                {errors.quality_rating && <p className="text-sm text-destructive">{errors.quality_rating.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">{editingSupplier ? 'Guncelle' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
