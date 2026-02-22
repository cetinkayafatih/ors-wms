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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Bell, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { SEVERITY_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MOCK_ALERTS = [
  {
    id: '1',
    severity: 'critical',
    title: 'Stok Kritik Seviyede',
    message: 'NS003-BYZ-S stogu 75 adete dustu (minimum: 100)',
    created_at: '2026-02-22T14:30:00',
    is_read: false,
    is_resolved: false,
  },
  {
    id: '2',
    severity: 'warning',
    title: 'Siparis Gecikmesi',
    message: 'PO-2026-002 beklenen teslimat tarihi gecti',
    created_at: '2026-02-22T11:15:00',
    is_read: false,
    is_resolved: false,
  },
  {
    id: '3',
    severity: 'critical',
    title: 'Stok Tukendi',
    message: 'QT010-TRN-S stogu bitti',
    created_at: '2026-02-22T09:45:00',
    is_read: true,
    is_resolved: false,
  },
  {
    id: '4',
    severity: 'warning',
    title: 'Kalite Muayene Hatasi',
    message: 'QI-2026-004 muayenesinde 45 hata tespit edildi',
    created_at: '2026-02-21T16:20:00',
    is_read: true,
    is_resolved: true,
  },
  {
    id: '5',
    severity: 'info',
    title: 'Yeni Siparis',
    message: 'SO-2026-005 siparisi olusturuldu',
    created_at: '2026-02-21T14:00:00',
    is_read: true,
    is_resolved: true,
  },
  {
    id: '6',
    severity: 'warning',
    title: 'Lokasyon Kapasite Asimi',
    message: 'WH01-B-R02-S2-B03 kapasitesinin %100\'une ulasti',
    created_at: '2026-02-21T10:30:00',
    is_read: true,
    is_resolved: false,
  },
  {
    id: '7',
    severity: 'critical',
    title: 'Yeniden Siparis Geregi',
    message: 'SP001-SYH-M icin yeniden siparis noktasina ulasildi',
    created_at: '2026-02-20T15:45:00',
    is_read: true,
    is_resolved: true,
  },
  {
    id: '8',
    severity: 'info',
    title: 'Mal Kabul Tamamlandi',
    message: 'GR-2026-003 mal kabulu tamamlandi',
    created_at: '2026-02-20T12:00:00',
    is_read: true,
    is_resolved: true,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: result, error: err } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (err) throw err;
        if (result && result.length > 0) setAlerts(result);
      } catch {
        setAlerts(MOCK_ALERTS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !item.is_read) ||
        (statusFilter === 'read' && item.is_read) ||
        (statusFilter === 'unresolved' && !item.is_resolved) ||
        (statusFilter === 'resolved' && item.is_resolved);

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    const unread = alerts.filter((a) => !a.is_read).length;
    const critical = alerts.filter((a) => a.severity === 'critical' && !a.is_resolved).length;
    const warning = alerts.filter((a) => a.severity === 'warning' && !a.is_resolved).length;
    const unresolved = alerts.filter((a) => !a.is_resolved).length;

    return { unread, critical, warning, unresolved };
  }, [alerts]);

  const markAsRead = async (alertId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      toast.success('Okundu olarak isaretlendi');
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const markAsResolved = async (alertId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('alerts')
        .update({ is_resolved: true, is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true, is_read: true } : a))
      );
      toast.success('Cozuldu olarak isaretlendi');
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success('Bildirim silindi');
    } catch (err: any) {
      toast.error(err.message || 'Bir hata olustu');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} retry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bildirimler"
        description="Sistem bildirimleri ve uyarilari"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Okunmamis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.unread}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kritik</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uyari</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cozulmemis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.unresolved}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Bildirim ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Oncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Oncelikler</SelectItem>
                  {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
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
                  <SelectItem value="all">Tumu</SelectItem>
                  <SelectItem value="unread">Okunmamis</SelectItem>
                  <SelectItem value="read">Okunmus</SelectItem>
                  <SelectItem value="unresolved">Cozulmemis</SelectItem>
                  <SelectItem value="resolved">Cozulmus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <EmptyState
              icon={<Bell className="size-6" />}
              title="Bildirim bulunamadi"
              description="Aramaniza uygun bildirim yok."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oncelik</TableHead>
                    <TableHead>Baslik</TableHead>
                    <TableHead>Mesaj</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className={!alert.is_read ? 'bg-blue-50/50' : ''}>
                      <TableCell>
                        <StatusBadge
                          status={alert.severity}
                          label={SEVERITY_LABELS[alert.severity as keyof typeof SEVERITY_LABELS]}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {!alert.is_read && <div className="size-2 rounded-full bg-blue-600" />}
                          {alert.title}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                        {alert.message}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(alert.created_at), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {alert.is_resolved ? (
                          <StatusBadge status="completed" label="Cozuldu" />
                        ) : (
                          <StatusBadge status="in_progress" label="Bekliyor" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                              title="Okundu"
                            >
                              <Bell className="size-4" />
                            </Button>
                          )}
                          {!alert.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsResolved(alert.id)}
                              title="Cozuldu"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                            title="Sil"
                          >
                            <X className="size-4" />
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

      <Card>
        <CardHeader>
          <CardTitle>Uyari Kurallari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Stok Kritik Seviye</div>
                  <p className="text-sm text-muted-foreground">
                    Urun stogu minimum seviyenin altina dustugunde bildirim gonder
                  </p>
                </div>
                <StatusBadge status="active" label="Aktif" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Siparis Gecikmesi</div>
                  <p className="text-sm text-muted-foreground">
                    Beklenen teslimat tarihini gecen siparisler icin bildirim gonder
                  </p>
                </div>
                <StatusBadge status="active" label="Aktif" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Kalite Hatasi</div>
                  <p className="text-sm text-muted-foreground">
                    Kalite muayenesinde belirlenen esik degerini asan hata sayisi icin bildirim gonder
                  </p>
                </div>
                <StatusBadge status="active" label="Aktif" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Lokasyon Dolulugu</div>
                  <p className="text-sm text-muted-foreground">
                    Lokasyon kapasitesinin %90\'ina ulastıginda bildirim gonder
                  </p>
                </div>
                <StatusBadge status="active" label="Aktif" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
