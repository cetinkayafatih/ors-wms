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
import { Plus, Search, Edit, MapPin, Warehouse } from 'lucide-react';
import { ZONE_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MOCK_LOCATIONS = [
  {
    id: '1',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: true,
    capacity: 500,
    current_quantity: 450,
  },
  {
    id: '2',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R01-S2-B03',
    rack: 'R01',
    shelf: 'S2',
    bin: 'B03',
    is_occupied: true,
    capacity: 500,
    current_quantity: 75,
  },
  {
    id: '3',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R01-S3-B02',
    rack: 'R01',
    shelf: 'S3',
    bin: 'B02',
    is_occupied: true,
    capacity: 500,
    current_quantity: 450,
  },
  {
    id: '4',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R02-S1-B01',
    rack: 'R02',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: true,
    capacity: 500,
    current_quantity: 280,
  },
  {
    id: '5',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R02-S2-B02',
    rack: 'R02',
    shelf: 'S2',
    bin: 'B02',
    is_occupied: true,
    capacity: 500,
    current_quantity: 210,
  },
  {
    id: '6',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R02-S3-B02',
    rack: 'R02',
    shelf: 'S3',
    bin: 'B02',
    is_occupied: true,
    capacity: 500,
    current_quantity: 320,
  },
  {
    id: '7',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R03-S1-B03',
    rack: 'R03',
    shelf: 'S1',
    bin: 'B03',
    is_occupied: true,
    capacity: 500,
    current_quantity: 150,
  },
  {
    id: '8',
    warehouse_code: 'WH-01',
    zone_code: 'A',
    zone_type: 'storage',
    location_code: 'WH01-A-R03-S2-B01',
    rack: 'R03',
    shelf: 'S2',
    bin: 'B01',
    is_occupied: true,
    capacity: 500,
    current_quantity: 180,
  },
  {
    id: '9',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: true,
    capacity: 3000,
    current_quantity: 2500,
  },
  {
    id: '10',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R01-S2-B02',
    rack: 'R01',
    shelf: 'S2',
    bin: 'B02',
    is_occupied: true,
    capacity: 3000,
    current_quantity: 1800,
  },
  {
    id: '11',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R02-S1-B01',
    rack: 'R02',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: true,
    capacity: 3000,
    current_quantity: 500,
  },
  {
    id: '12',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R02-S2-B03',
    rack: 'R02',
    shelf: 'S2',
    bin: 'B03',
    is_occupied: true,
    capacity: 5000,
    current_quantity: 5000,
  },
  {
    id: '13',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R03-S1-B01',
    rack: 'R03',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: true,
    capacity: 200,
    current_quantity: 120,
  },
  {
    id: '14',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R03-S1-B02',
    rack: 'R03',
    shelf: 'S1',
    bin: 'B02',
    is_occupied: true,
    capacity: 200,
    current_quantity: 95,
  },
  {
    id: '15',
    warehouse_code: 'WH-01',
    zone_code: 'B',
    zone_type: 'storage',
    location_code: 'WH01-B-R03-S2-B01',
    rack: 'R03',
    shelf: 'S2',
    bin: 'B01',
    is_occupied: true,
    capacity: 10000,
    current_quantity: 8000,
  },
  {
    id: '16',
    warehouse_code: 'WH-01',
    zone_code: 'C',
    zone_type: 'picking',
    location_code: 'WH01-C-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: false,
    capacity: 200,
    current_quantity: 0,
  },
  {
    id: '17',
    warehouse_code: 'WH-01',
    zone_code: 'D',
    zone_type: 'receiving',
    location_code: 'WH01-D-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: false,
    capacity: 1000,
    current_quantity: 0,
  },
  {
    id: '18',
    warehouse_code: 'WH-01',
    zone_code: 'E',
    zone_type: 'shipping',
    location_code: 'WH01-E-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: false,
    capacity: 1000,
    current_quantity: 0,
  },
  {
    id: '19',
    warehouse_code: 'WH-01',
    zone_code: 'F',
    zone_type: 'quarantine',
    location_code: 'WH01-F-R01-S1-B01',
    rack: 'R01',
    shelf: 'S1',
    bin: 'B01',
    is_occupied: false,
    capacity: 500,
    current_quantity: 0,
  },
];

const locationSchema = z.object({
  warehouse_code: z.string().min(1, 'Depo kodu gerekli'),
  zone_code: z.string().min(1, 'Bolge kodu gerekli'),
  zone_type: z.string().min(1, 'Bolge tipi gerekli'),
  rack: z.string().min(1, 'Raf gerekli'),
  shelf: z.string().min(1, 'Raf kodu gerekli'),
  bin: z.string().min(1, 'Goz gerekli'),
  capacity: z.number().min(1, 'Kapasite gerekli'),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function LocationsPage() {
  const [data, setData] = useState(MOCK_LOCATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [occupiedFilter, setOccupiedFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('locations')
          .select('*')
          .order('location_code');

        if (err) throw err;
        if (result && result.length > 0) setData(result);
      } catch {
        setData(MOCK_LOCATIONS);
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
        item.location_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.zone_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = zoneFilter === 'all' || item.zone_code === zoneFilter;
      const matchesOccupied =
        occupiedFilter === 'all' ||
        (occupiedFilter === 'occupied' && item.is_occupied) ||
        (occupiedFilter === 'empty' && !item.is_occupied);

      return matchesSearch && matchesZone && matchesOccupied;
    });
  }, [data, searchQuery, zoneFilter, occupiedFilter]);

  const zones = useMemo(() => {
    return Array.from(new Set(data.map((l) => l.zone_code))).sort();
  }, [data]);

  const zoneStats = useMemo(() => {
    const stats = new Map();
    zones.forEach((zone) => {
      const zoneLocations = data.filter((l) => l.zone_code === zone);
      const totalCapacity = zoneLocations.reduce((sum, l) => sum + l.capacity, 0);
      const totalQuantity = zoneLocations.reduce((sum, l) => sum + l.current_quantity, 0);
      const occupiedCount = zoneLocations.filter((l) => l.is_occupied).length;
      const zoneType = zoneLocations[0]?.zone_type || 'storage';

      stats.set(zone, {
        totalCapacity,
        totalQuantity,
        utilization: totalCapacity > 0 ? (totalQuantity / totalCapacity) * 100 : 0,
        occupiedCount,
        totalCount: zoneLocations.length,
        zoneType,
      });
    });
    return stats;
  }, [data, zones]);

  const handleOpenDialog = (location?: any) => {
    if (location) {
      setEditingLocation(location);
      setValue('warehouse_code', location.warehouse_code);
      setValue('zone_code', location.zone_code);
      setValue('zone_type', location.zone_type);
      setValue('rack', location.rack);
      setValue('shelf', location.shelf);
      setValue('bin', location.bin);
      setValue('capacity', location.capacity);
    } else {
      setEditingLocation(null);
      reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = async (formData: LocationFormData) => {
    try {
      const locationCode = `${formData.warehouse_code}-${formData.zone_code}-${formData.rack}-${formData.shelf}-${formData.bin}`;
      const supabase = createClient();

      if (editingLocation) {
        const { error: updateError } = await supabase
          .from('locations')
          .update({
            ...formData,
            location_code: locationCode,
          })
          .eq('id', editingLocation.id);

        if (updateError) throw updateError;

        setData((prev) =>
          prev.map((l) => (l.id === editingLocation.id ? { ...l, ...formData, location_code: locationCode } : l))
        );
        toast.success('Lokasyon guncellendi');
      } else {
        const { data: newLocation, error: insertError } = await supabase
          .from('locations')
          .insert([
            {
              ...formData,
              location_code: locationCode,
              is_occupied: false,
              current_quantity: 0,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        setData((prev) => [...prev, newLocation]);
        toast.success('Lokasyon eklendi');
      }

      setDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lokasyonlar"
        description="Depo lokasyonlarini yonetin"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 size-4" />
            Yeni Lokasyon
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from(zoneStats.entries()).map(([zone, stats]) => (
          <Card key={zone}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Bolge {zone}</CardTitle>
                <StatusBadge
                  status={stats.zoneType}
                  label={ZONE_TYPE_LABELS[stats.zoneType as keyof typeof ZONE_TYPE_LABELS]}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doluluk Orani</span>
                  <span className="font-medium">{stats.utilization.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dolu Lokasyon</span>
                  <span className="font-medium">
                    {stats.occupiedCount} / {stats.totalCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kapasite</span>
                  <span className="font-medium">
                    {stats.totalQuantity.toLocaleString('tr-TR')} / {stats.totalCapacity.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Lokasyon kodu ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Bolge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Bolgeler</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      Bolge {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={occupiedFilter} onValueChange={setOccupiedFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Durumlar</SelectItem>
                  <SelectItem value="occupied">Dolu</SelectItem>
                  <SelectItem value="empty">Bos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <EmptyState
              icon={<MapPin className="size-6" />}
              title="Lokasyon bulunamadi"
              description="Aramaniza uygun lokasyon yok."
              action={
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 size-4" />
                  Ilk Lokasyonu Ekle
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lokasyon Kodu</TableHead>
                    <TableHead>Bolge</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Raf</TableHead>
                    <TableHead>Raf Kodu</TableHead>
                    <TableHead>Goz</TableHead>
                    <TableHead className="text-right">Doluluk</TableHead>
                    <TableHead className="text-right">Kapasite</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((location) => {
                    const utilizationPct = location.capacity > 0 ? (location.current_quantity / location.capacity) * 100 : 0;
                    return (
                      <TableRow key={location.id}>
                        <TableCell className="font-mono font-medium">{location.location_code}</TableCell>
                        <TableCell>{location.zone_code}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={location.zone_type}
                            label={ZONE_TYPE_LABELS[location.zone_type as keyof typeof ZONE_TYPE_LABELS]}
                          />
                        </TableCell>
                        <TableCell>{location.rack}</TableCell>
                        <TableCell>{location.shelf}</TableCell>
                        <TableCell>{location.bin}</TableCell>
                        <TableCell className="text-right">
                          <span className={utilizationPct > 90 ? 'text-orange-600 font-medium' : ''}>
                            {utilizationPct.toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {location.current_quantity.toLocaleString('tr-TR')} /{' '}
                          {location.capacity.toLocaleString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={location.is_occupied ? 'active' : 'inactive'} label={location.is_occupied ? 'Dolu' : 'Bos'} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(location)}>
                            <Edit className="size-4" />
                          </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Lokasyon Duzenle' : 'Yeni Lokasyon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouse_code">Depo Kodu</Label>
                <Input id="warehouse_code" {...register('warehouse_code')} placeholder="WH-01" />
                {errors.warehouse_code && <p className="text-sm text-destructive">{errors.warehouse_code.message}</p>}
              </div>
              <div>
                <Label htmlFor="zone_code">Bolge Kodu</Label>
                <Input id="zone_code" {...register('zone_code')} placeholder="A" />
                {errors.zone_code && <p className="text-sm text-destructive">{errors.zone_code.message}</p>}
              </div>
              <div className="col-span-2">
                <Label htmlFor="zone_type">Bolge Tipi</Label>
                <select
                  id="zone_type"
                  {...register('zone_type')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Secin</option>
                  {Object.entries(ZONE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.zone_type && <p className="text-sm text-destructive">{errors.zone_type.message}</p>}
              </div>
              <div>
                <Label htmlFor="rack">Raf</Label>
                <Input id="rack" {...register('rack')} placeholder="R01" />
                {errors.rack && <p className="text-sm text-destructive">{errors.rack.message}</p>}
              </div>
              <div>
                <Label htmlFor="shelf">Raf Kodu</Label>
                <Input id="shelf" {...register('shelf')} placeholder="S1" />
                {errors.shelf && <p className="text-sm text-destructive">{errors.shelf.message}</p>}
              </div>
              <div>
                <Label htmlFor="bin">Goz</Label>
                <Input id="bin" {...register('bin')} placeholder="B01" />
                {errors.bin && <p className="text-sm text-destructive">{errors.bin.message}</p>}
              </div>
              <div>
                <Label htmlFor="capacity">Kapasite</Label>
                <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">{editingLocation ? 'Guncelle' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
