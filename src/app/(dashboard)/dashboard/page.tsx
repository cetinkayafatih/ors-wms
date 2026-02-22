'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorDisplay } from '@/components/shared/error-display';
import { MockDataBadge } from '@/components/shared/mock-data-badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { subHours, format, startOfDay, endOfDay, subMonths } from 'date-fns';
import { MOVEMENT_TYPE_LABELS as MOVEMENT_LABELS } from '@/lib/constants';
import { calculateInventoryTurnover, calculateCarryingCost } from '@/lib/calculations';
import {
  MOCK_KPIS,
  MOCK_CATEGORIES,
  MOCK_MONTHLY,
  MOCK_TREND,
  MOCK_UTILIZATION,
  MOCK_MOVEMENTS,
  MOCK_ALERTS,
  MOCK_INVENTORY_VALUE,
  MOCK_COGS,
  MOCK_CARRYING_COST_RATE,
} from '@/lib/mock-data';

// Types
interface KPIData {
  totalSKUs: number;
  lowStockAlerts: number;
  pendingOrders: number;
  todayReceipts: number;
}

interface CategoryData {
  category: string;
  value: number;
  count: number;
}

interface MonthlyData {
  month: string;
  inbound: number;
  outbound: number;
}

interface TrendData {
  date: string;
  quantity: number;
}

interface UtilizationData {
  zone: string;
  occupied: number;
  total: number;
  percentage: number;
}

interface MovementData {
  id: string;
  type: string;
  item: string;
  quantity: number;
  unit: string;
  date: Date;
}

interface AlertData {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  created_at: string;
}

// Chart colors
const CHART_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#8b5cf6', '#06b6d4', '#d97706'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // State for all dashboard data
  const [kpis, setKpis] = useState<KPIData>(MOCK_KPIS);
  const [categories, setCategories] = useState<CategoryData[]>(MOCK_CATEGORIES);
  const [monthly, setMonthly] = useState<MonthlyData[]>(MOCK_MONTHLY);
  const [trend, setTrend] = useState<TrendData[]>(MOCK_TREND);
  const [utilization, setUtilization] = useState<UtilizationData[]>(MOCK_UTILIZATION);
  const [movements, setMovements] = useState<MovementData[]>(MOCK_MOVEMENTS);
  const [alerts, setAlerts] = useState<AlertData[]>(MOCK_ALERTS);

  // Calculated KPIs
  const turnover = calculateInventoryTurnover(MOCK_COGS, MOCK_INVENTORY_VALUE);
  const carrying = calculateCarryingCost(MOCK_INVENTORY_VALUE, MOCK_CARRYING_COST_RATE);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      await Promise.allSettled([
        fetchKPIs(supabase),
        fetchCategoryData(supabase),
        fetchMonthlyData(supabase),
        fetchTrendData(supabase),
        fetchUtilizationData(supabase),
        fetchRecentMovements(supabase),
        fetchActiveAlerts(supabase),
      ]).then((results) => {
        const allFailed = results.every((r) => r.status === 'rejected');
        if (allFailed) {
          setUsingMockData(true);
        } else {
          setUsingMockData(false);
        }
      });
    } catch {
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async (supabase: ReturnType<typeof createClient>) => {
    const { count: skuCount, error: e1 } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (e1) throw e1;

    const { count: lowStockCount, error: e2 } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand, product:products!inner(min_stock_level)', { count: 'exact', head: true })
      .filter('quantity_on_hand', 'lt', 'product.min_stock_level');

    if (e2) throw e2;

    const { count: pendingOrdersCount, error: e3 } = await supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '(shipped,delivered,cancelled)');

    if (e3) throw e3;

    const today = new Date();
    const { count: todayReceiptsCount, error: e4 } = await supabase
      .from('goods_receipts')
      .select('*', { count: 'exact', head: true })
      .gte('received_date', startOfDay(today).toISOString())
      .lte('received_date', endOfDay(today).toISOString());

    if (e4) throw e4;

    setKpis({
      totalSKUs: skuCount || 0,
      lowStockAlerts: lowStockCount || 0,
      pendingOrders: pendingOrdersCount || 0,
      todayReceipts: todayReceiptsCount || 0,
    });
  };

  const fetchCategoryData = async (supabase: ReturnType<typeof createClient>) => {
    const { data, error: queryError } = await supabase
      .from('inventory')
      .select(`
        quantity_on_hand,
        unit_cost,
        product:products!inner(
          model:models!inner(
            category:categories(name)
          )
        )
      `);

    if (queryError) throw queryError;

    const categoryMap = new Map<string, { value: number; count: number }>();

    data?.forEach((item: Record<string, unknown>) => {
      const product = item.product as Record<string, unknown> | null;
      const model = product?.model as Record<string, unknown> | null;
      const category = model?.category as Record<string, unknown> | null;
      const categoryName = (category?.name as string) || 'Diger';
      const value = ((item.quantity_on_hand as number) || 0) * ((item.unit_cost as number) || 0);

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { value: 0, count: 0 });
      }

      const current = categoryMap.get(categoryName)!;
      current.value += value;
      current.count += 1;
    });

    const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([cat, d]) => ({
      category: cat,
      value: Math.round(d.value),
      count: d.count,
    }));

    if (categoryData.length > 0) {
      setCategories(categoryData);
    }
  };

  const fetchMonthlyData = async (supabase: ReturnType<typeof createClient>) => {
    const sixMonthsAgo = subMonths(new Date(), 6);

    const { data, error: queryError } = await supabase
      .from('inventory_movements')
      .select('movement_type, quantity, created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    if (queryError) throw queryError;

    const monthMap = new Map<string, { inbound: number; outbound: number }>();

    data?.forEach((item: Record<string, unknown>) => {
      const dateStr = item.created_at as string;
      const monthKey = format(new Date(dateStr), 'MMM');

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { inbound: 0, outbound: 0 });
      }

      const current = monthMap.get(monthKey)!;
      const inboundTypes = ['receive', 'production_in', 'return_in', 'adjust_in'];
      const outboundTypes = ['ship', 'pick', 'production_out', 'return_out', 'adjust_out'];

      if (inboundTypes.includes(item.movement_type as string)) {
        current.inbound += (item.quantity as number) || 0;
      } else if (outboundTypes.includes(item.movement_type as string)) {
        current.outbound += (item.quantity as number) || 0;
      }
    });

    const monthlyData: MonthlyData[] = Array.from(monthMap.entries()).map(([m, d]) => ({
      month: m,
      inbound: Math.round(d.inbound),
      outbound: Math.round(d.outbound),
    }));

    if (monthlyData.length > 0) {
      setMonthly(monthlyData);
    }
  };

  const fetchTrendData = async (supabase: ReturnType<typeof createClient>) => {
    const { data, error: queryError } = await supabase
      .from('inventory')
      .select('quantity_on_hand, updated_at');

    if (queryError) throw queryError;

    const totalQuantity = data?.reduce((sum: number, item: Record<string, unknown>) =>
      sum + ((item.quantity_on_hand as number) || 0), 0) || 0;

    // Deterministik trend (sinusoidal degisim, Math.random yok)
    const trendData: TrendData[] = Array.from({ length: 30 }, (_, i) => ({
      date: format(new Date(Date.now() - (29 - i) * 86400000), 'dd MMM'),
      quantity: Math.round(totalQuantity * (1 + Math.sin(i * 0.4) * 0.05 + i * 0.002)),
    }));

    if (trendData.length > 0) {
      setTrend(trendData);
    }
  };

  const fetchUtilizationData = async (supabase: ReturnType<typeof createClient>) => {
    const { data, error: queryError } = await supabase
      .from('warehouse_locations')
      .select('zone, is_occupied');

    if (queryError) throw queryError;

    const zoneMap = new Map<string, { occupied: number; total: number }>();

    data?.forEach((item: Record<string, unknown>) => {
      const zoneName = (item.zone as string) || 'Unknown';

      if (!zoneMap.has(zoneName)) {
        zoneMap.set(zoneName, { occupied: 0, total: 0 });
      }

      const current = zoneMap.get(zoneName)!;
      current.total += 1;
      if (item.is_occupied) {
        current.occupied += 1;
      }
    });

    const utilizationData: UtilizationData[] = Array.from(zoneMap.entries()).map(([z, d]) => ({
      zone: z,
      occupied: d.occupied,
      total: d.total,
      percentage: Math.round((d.occupied / d.total) * 100),
    }));

    if (utilizationData.length > 0) {
      setUtilization(utilizationData);
    }
  };

  const fetchRecentMovements = async (supabase: ReturnType<typeof createClient>) => {
    const { data, error: queryError } = await supabase
      .from('inventory_movements')
      .select(`
        id,
        movement_type,
        quantity,
        unit_of_measure,
        created_at,
        product:products(sku),
        material:materials(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (queryError) throw queryError;

    const movementData: MovementData[] = data?.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      type: item.movement_type as string,
      item: ((item.product as Record<string, unknown>)?.sku as string) || ((item.material as Record<string, unknown>)?.name as string) || 'Unknown',
      quantity: (item.quantity as number) || 0,
      unit: (item.unit_of_measure as string) || 'adet',
      date: new Date(item.created_at as string),
    })) || [];

    if (movementData.length > 0) {
      setMovements(movementData);
    }
  };

  const fetchActiveAlerts = async (supabase: ReturnType<typeof createClient>) => {
    const { data, error: queryError } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('severity', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(10);

    if (queryError) throw queryError;

    const alertData: AlertData[] = data?.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      severity: item.severity as 'critical' | 'warning' | 'info',
      title: (item.title as string) || 'Uyari',
      message: (item.message as string) || '',
      created_at: item.created_at as string,
    })) || [];

    if (alertData.length > 0) {
      setAlerts(alertData);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMovementIcon = (type: string) => {
    const inboundTypes = ['receive', 'production_in', 'return_in', 'adjust_in', 'putaway'];
    return inboundTypes.includes(type) ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gosterge Paneli"
          description="Depo yonetim sistemine genel bakis"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !usingMockData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gosterge Paneli"
          description="Depo yonetim sistemine genel bakis"
        />
        <ErrorDisplay message={error} retry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Gosterge Paneli"
          description="Depo yonetim sistemine genel bakis"
        />
        <MockDataBadge show={usingMockData} />
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam SKU</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalSKUs.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Aktif urun sayisi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dusuk Stok Uyarilari</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{kpis.lowStockAlerts.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Minimum seviyenin altinda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Siparisler</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingOrders.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Acik siparis sayisi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugunun Kabulleri</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.todayReceipts.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Mal kabul sayisi</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2 (New: Inventory Turnover + Carrying Cost) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envanter Devir Hizi</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{turnover.turnover}x</div>
            <p className="text-xs text-muted-foreground">Yillik devir | {turnover.daysOnHand} gun elde tutma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elde Tutma Maliyeti</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{(carrying.monthly / 1000).toFixed(0)}K TL</div>
            <p className="text-xs text-muted-foreground">Aylik | Yillik: {(carrying.annual / 1000).toFixed(0)}K TL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Envanter Degeri</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(MOCK_INVENTORY_VALUE / 1000000).toFixed(1)}M TL</div>
            <p className="text-xs text-muted-foreground">Tum depolardaki deger</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elde Tutma Orani</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">%{MOCK_CARRYING_COST_RATE}</div>
            <p className="text-xs text-muted-foreground">Gunluk: {carrying.daily.toLocaleString('tr-TR')} TL</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kategoriye Gore Envanter Degeri</CardTitle>
            <CardDescription>Toplam deger dagilimi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${(entry.value / 1000).toFixed(0)}K`}
                >
                  {categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString('tr-TR')} TL`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aylik Giris - Cikis</CardTitle>
            <CardDescription>Son 6 ay</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString('tr-TR')} />
                <Legend />
                <Bar dataKey="inbound" name="Giris" fill={CHART_COLORS[1]} />
                <Bar dataKey="outbound" name="Cikis" fill={CHART_COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stok Seviye Trendi</CardTitle>
            <CardDescription>Son 30 gun</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toLocaleString('tr-TR')} />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="Toplam Miktar"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depo Bolgesi Kullanimi</CardTitle>
            <CardDescription>Doluluk oranlari</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="zone" type="category" width={120} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Dolu') return `${value} lokasyon`;
                    return `${value} lokasyon`;
                  }}
                />
                <Legend />
                <Bar dataKey="occupied" name="Dolu" fill={CHART_COLORS[0]} />
                <Bar dataKey="total" name="Toplam" fill={CHART_COLORS[5]} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Son Hareketler
            </CardTitle>
            <CardDescription>Son 10 envanter hareketi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henuz hareket kaydi bulunmuyor
                </p>
              ) : (
                movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      {getMovementIcon(movement.type)}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{movement.item}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {MOVEMENT_LABELS[movement.type] || movement.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {movement.quantity.toLocaleString('tr-TR')} {movement.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {format(movement.date, 'dd MMM HH:mm')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Aktif Uyarilar
            </CardTitle>
            <CardDescription>Cozulmemis uyarilar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aktif uyari bulunmuyor
                </p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs">{alert.message}</p>
                      </div>
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'destructive'
                            : alert.severity === 'warning'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {alert.severity === 'critical'
                          ? 'Kritik'
                          : alert.severity === 'warning'
                          ? 'Uyari'
                          : 'Bilgi'}
                      </Badge>
                    </div>
                    <p className="text-xs mt-2 opacity-70">
                      {format(new Date(alert.created_at), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
