'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Urun Yonetimi',
  '/inventory': 'Envanter Yonetimi',
  '/locations': 'Konum Yonetimi',
  '/receiving': 'Mal Kabul',
  '/shipping': 'Sevkiyat',
  '/stock-count': 'Stok Sayimi',
  '/reports': 'Raporlar',
  '/users': 'Kullanici Yonetimi',
  '/suppliers': 'Tedarikci Yonetimi',
  '/alerts': 'Uyarilar',
  '/settings': 'Ayarlar',
};

export function Header() {
  const pathname = usePathname();
  const unreadAlertCount = useAppStore((s) => s.unreadAlertCount);

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? 'Dashboard';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">WMS</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium">{pageTitle}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="SKU, barkod veya siparis ara..."
            className="w-64 pl-8"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative" asChild>
          <a href="/alerts">
            <Bell className="size-4" />
            {unreadAlertCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-[10px]"
              >
                {unreadAlertCount > 99 ? '99+' : unreadAlertCount}
              </Badge>
            )}
          </a>
        </Button>
      </div>
    </header>
  );
}
