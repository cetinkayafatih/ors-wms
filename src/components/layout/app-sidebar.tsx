'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  MapPin,
  TruckIcon,
  ShoppingCart,
  ClipboardCheck,
  ShieldCheck,
  FileBarChart2,
  Users,
  Factory,
  Bell,
  Settings,
  ChevronDown,
  Activity,
  BarChart3,
  GitBranch,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS } from '@/lib/constants';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: 'dashboard',
  },
  {
    title: 'Urunler',
    href: '/products',
    icon: Package,
    module: 'products',
  },
  {
    title: 'Envanter',
    href: '/inventory',
    icon: Boxes,
    module: 'inventory',
  },
  {
    title: 'Konumlar',
    href: '/locations',
    icon: MapPin,
    module: 'locations',
  },
];

const operationNavItems = [
  {
    title: 'Mal Kabul',
    href: '/receiving',
    icon: TruckIcon,
    module: 'receiving',
  },
  {
    title: 'Sevkiyat',
    href: '/shipping',
    icon: ShoppingCart,
    module: 'shipping',
  },
  {
    title: 'Stok Sayimi',
    href: '/stock-count',
    icon: ClipboardCheck,
    module: 'stock_count',
  },
  {
    title: 'Kalite Kontrol',
    href: '/quality',
    icon: ShieldCheck,
    module: 'quality',
  },
];

const analyticsNavItems = [
  {
    title: 'SPC & Alti Sigma',
    href: '/analytics/spc',
    icon: Activity,
    module: 'reports',
  },
  {
    title: 'EOQ/ABC/Tahmin',
    href: '/analytics/forecasting',
    icon: BarChart3,
    module: 'reports',
  },
  {
    title: 'VSM & Yalin',
    href: '/analytics/lean',
    icon: GitBranch,
    module: 'reports',
  },
  {
    title: 'Once/Sonra Analizi',
    href: '/analytics/comparison',
    icon: ArrowLeftRight,
    module: 'reports',
  },
];

const managementNavItems = [
  {
    title: 'Raporlar',
    href: '/reports',
    icon: FileBarChart2,
    module: 'reports',
  },
  {
    title: 'Tedarikciler',
    href: '/suppliers',
    icon: Factory,
    module: 'suppliers',
  },
  {
    title: 'Kullanicilar',
    href: '/users',
    icon: Users,
    module: 'users',
  },
  {
    title: 'Uyarilar',
    href: '/alerts',
    icon: Bell,
    module: 'alerts',
  },
  {
    title: 'Ayarlar',
    href: '/settings',
    icon: Settings,
    module: 'settings',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, can } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const renderNavItems = (
    items: typeof mainNavItems
  ) =>
    items
      .filter((item) => can(item.module, 'view'))
      .map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Corap WMS</span>
            <span className="text-xs text-muted-foreground">
              Depo Yonetim Sistemi
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ana Moduller</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operasyonlar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(operationNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Endustriyel Analitik</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(analyticsNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Yonetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(managementNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    'data-[state=open]:bg-sidebar-accent',
                    'data-[state=open]:text-sidebar-accent-foreground'
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm">{user?.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.role ? ROLE_LABELS[user.role] : ''}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              >
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 size-4" />
                  Ayarlar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Cikis Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
