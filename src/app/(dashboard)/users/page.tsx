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
import { Plus, Search, Edit, UserPlus } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const MOCK_USERS = [
  {
    id: '1',
    full_name: 'Ahmet Yilmaz',
    email: 'ahmet.yilmaz@corapwms.com',
    role: 'admin',
    department: 'Yonetim',
    status: 'active',
    last_login: '2026-02-22T14:30:00',
  },
  {
    id: '2',
    full_name: 'Mehmet Demir',
    email: 'mehmet.demir@corapwms.com',
    role: 'warehouse_manager',
    department: 'Depo',
    status: 'active',
    last_login: '2026-02-22T13:15:00',
  },
  {
    id: '3',
    full_name: 'Ayse Kaya',
    email: 'ayse.kaya@corapwms.com',
    role: 'operator_shipping',
    department: 'Sevkiyat',
    status: 'active',
    last_login: '2026-02-22T11:45:00',
  },
  {
    id: '4',
    full_name: 'Ali Ozturk',
    email: 'ali.ozturk@corapwms.com',
    role: 'operator_receiving',
    department: 'Kabul',
    status: 'active',
    last_login: '2026-02-22T10:20:00',
  },
  {
    id: '5',
    full_name: 'Fatma Celik',
    email: 'fatma.celik@corapwms.com',
    role: 'operator_shipping',
    department: 'Sevkiyat',
    status: 'active',
    last_login: '2026-02-21T16:00:00',
  },
  {
    id: '6',
    full_name: 'Zeynep Sahin',
    email: 'zeynep.sahin@corapwms.com',
    role: 'viewer',
    department: 'Finans',
    status: 'inactive',
    last_login: '2026-02-15T09:30:00',
  },
];

const userSchema = z.object({
  full_name: z.string().min(1, 'Ad soyad gerekli'),
  email: z.string().email('Gecerli email gerekli'),
  role: z.string().min(1, 'Rol gerekli'),
  department: z.string().min(1, 'Departman gerekli'),
  password: z.string().min(6, 'Sifre en az 6 karakter olmali').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('users')
          .select('*')
          .order('full_name');

        if (err) throw err;
        if (result && result.length > 0) setUsers(result);
      } catch {
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || item.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setValue('full_name', user.full_name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('department', user.department);
    } else {
      setEditingUser(null);
      reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = async (formData: UserFormData) => {
    try {
      const supabase = createClient();

      if (editingUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
          })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;

        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
        );
        toast.success('Kullanici guncellendi');
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              full_name: formData.full_name,
              email: formData.email,
              role: formData.role,
              department: formData.department,
              status: 'active',
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        setUsers((prev) => [...prev, newUser]);
        toast.success('Kullanici eklendi');
      }

      setDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const supabase = createClient();

      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      toast.success(`Kullanici ${newStatus === 'active' ? 'aktif' : 'pasif'} edildi`);
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanicilar"
        description="Sistem kullanicilarini yonetin"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 size-4" />
            Yeni Kullanici
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, email veya departman ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Roller</SelectItem>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="size-6" />}
              title="Kullanici bulunamadi"
              description="Aramaniza uygun kullanici yok."
              action={
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 size-4" />
                  Ilk Kullaniciyi Ekle
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departman</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Son Giris</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={user.role}
                          label={ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                        />
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={user.status}
                          label={user.status === 'active' ? 'Aktif' : 'Pasif'}
                        />
                      </TableCell>
                      <TableCell>
                        {user.last_login ? format(new Date(user.last_login), 'dd.MM.yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            {user.status === 'active' ? 'Pasifle' : 'Aktifle'}
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
            <DialogTitle>{editingUser ? 'Kullanici Duzenle' : 'Yeni Kullanici'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                {...register('role')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Secin</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
            <div>
              <Label htmlFor="department">Departman</Label>
              <Input id="department" {...register('department')} />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">Sifre</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Iptal
              </Button>
              <Button type="submit">{editingUser ? 'Guncelle' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
