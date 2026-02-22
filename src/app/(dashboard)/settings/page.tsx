'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Warehouse, Settings, Barcode, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [warehouseCode, setWarehouseCode] = useState('WH-01');
  const [warehouseName, setWarehouseName] = useState('Ana Depo');
  const [warehouseAddress, setWarehouseAddress] = useState('Istanbul Organize Sanayi Bolgesi');
  const [currency, setCurrency] = useState('TL');
  const [dateFormat, setDateFormat] = useState('dd.MM.yyyy');
  const [barcodePrefix, setBarcodePrefix] = useState('8690');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);

  const handleSaveWarehouse = () => {
    toast.success('Depo ayarlari kaydedildi');
  };

  const handleSaveSystem = () => {
    toast.success('Sistem ayarlari kaydedildi');
  };

  const handleSaveBarcode = () => {
    toast.success('Barkod ayarlari kaydedildi');
  };

  const handleSaveNotifications = () => {
    toast.success('Bildirim ayarlari kaydedildi');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Sistem yapilandirma ve tercihler"
      />

      <Tabs defaultValue="warehouse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warehouse">
            <Warehouse className="mr-2 size-4" />
            Depo
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="mr-2 size-4" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="barcode">
            <Barcode className="mr-2 size-4" />
            Barkod
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 size-4" />
            Bildirimler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Depo Bilgileri</CardTitle>
              <CardDescription>Depo genel bilgileri ve yapılandırma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="warehouse_code">Depo Kodu</Label>
                  <Input
                    id="warehouse_code"
                    value={warehouseCode}
                    onChange={(e) => setWarehouseCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="warehouse_name">Depo Adi</Label>
                  <Input
                    id="warehouse_name"
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="warehouse_address">Adres</Label>
                  <Input
                    id="warehouse_address"
                    value={warehouseAddress}
                    onChange={(e) => setWarehouseAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveWarehouse}>Kaydet</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bolge Yapılandırması</CardTitle>
              <CardDescription>Depo bolgelerinin ayarları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Bolge A - Mamul Depolama</div>
                    <p className="text-sm text-muted-foreground">Ana urun depolama alani</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Bolge B - Hammadde Depolama</div>
                    <p className="text-sm text-muted-foreground">Hammadde ve yan urun alani</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Bolge C - Toplama Alani</div>
                    <p className="text-sm text-muted-foreground">Siparis toplama bolgesi</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Bolge D - Kabul Alani</div>
                    <p className="text-sm text-muted-foreground">Mal kabul bekleme alani</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genel Sistem Ayarlari</CardTitle>
              <CardDescription>Varsayilan sistem tercihleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TL">TL (Turk Lirasi)</SelectItem>
                      <SelectItem value="USD">USD (Dolar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_format">Tarih Formati</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date_format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd.MM.yyyy">DD.MM.YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Dil</Label>
                  <Select defaultValue="tr">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Turkce</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Saat Dilimi</Label>
                  <Select defaultValue="europe_istanbul">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe_istanbul">Europe/Istanbul (UTC+3)</SelectItem>
                      <SelectItem value="utc">UTC (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveSystem}>Kaydet</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Varsayilan Degerler</CardTitle>
              <CardDescription>Yeni kayitlar icin varsayilan ayarlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="default_reorder_point">Varsayilan Yeniden Siparis Noktasi</Label>
                  <Input id="default_reorder_point" type="number" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="default_reorder_quantity">Varsayilan Yeniden Siparis Miktari</Label>
                  <Input id="default_reorder_quantity" type="number" defaultValue="500" />
                </div>
                <div>
                  <Label htmlFor="default_lead_time">Varsayilan Termin Suresi (Gun)</Label>
                  <Input id="default_lead_time" type="number" defaultValue="7" />
                </div>
                <div>
                  <Label htmlFor="default_location">Varsayilan Lokasyon</Label>
                  <Input id="default_location" defaultValue="WH01-A-R01-S1-B01" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barcode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Barkod Yapılandırması</CardTitle>
              <CardDescription>Barkod uretim ve format ayarlari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="barcode_prefix">Barkod Oneki</Label>
                  <Input
                    id="barcode_prefix"
                    value={barcodePrefix}
                    onChange={(e) => setBarcodePrefix(e.target.value)}
                    placeholder="8690"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Turkiye icin 869 oneki kullanilir
                  </p>
                </div>
                <div>
                  <Label htmlFor="barcode_type">Barkod Tipi</Label>
                  <Select defaultValue="ean13">
                    <SelectTrigger id="barcode_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ean13">EAN-13</SelectItem>
                      <SelectItem value="ean8">EAN-8</SelectItem>
                      <SelectItem value="code128">Code 128</SelectItem>
                      <SelectItem value="qr">QR Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted">
                <div className="text-sm font-medium mb-2">Ornek Barkod Formati</div>
                <div className="font-mono text-lg">8690123456001</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Format: [Onek: 869] [Firma Kodu: 0123] [Urun Kodu: 45600] [Kontrol: 1]
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Otomatik Barkod Uretimi</div>
                    <p className="text-sm text-muted-foreground">
                      Yeni urunler icin otomatik barkod olustur
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Barkod Dogrulama</div>
                    <p className="text-sm text-muted-foreground">
                      Barkod girislerinde kontrol basamagini dogrula
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button onClick={handleSaveBarcode}>Kaydet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>Uyari ve bildirim ayarlari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sistem Bildirimleri</div>
                    <p className="text-sm text-muted-foreground">
                      Uygulama ici bildirimler
                    </p>
                  </div>
                  <Switch
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">E-posta Bildirimleri</div>
                    <p className="text-sm text-muted-foreground">
                      Onemli olaylar icin e-posta gonder
                    </p>
                  </div>
                  <Switch
                    checked={enableEmailAlerts}
                    onCheckedChange={setEnableEmailAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Stok Uyarilari</div>
                    <p className="text-sm text-muted-foreground">
                      Dusuk stok ve stok tukenmesi bildirimleri
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Siparis Bildirimleri</div>
                    <p className="text-sm text-muted-foreground">
                      Yeni siparisler ve durum degisiklikleri
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Kalite Uyarilari</div>
                    <p className="text-sm text-muted-foreground">
                      Kalite muayene sonuclari ve hatalar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sistem Bakimi</div>
                    <p className="text-sm text-muted-foreground">
                      Planlanan bakim ve guncellemeler
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="notification_email">Bildirim E-posta Adresi</Label>
                <Input
                  id="notification_email"
                  type="email"
                  placeholder="admin@corapwms.com"
                  defaultValue="admin@corapwms.com"
                  className="mt-2"
                />
              </div>

              <Button onClick={handleSaveNotifications}>Kaydet</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uyari Esikleri</CardTitle>
              <CardDescription>Bildirim tetikleme kosullari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="critical_stock_threshold">Kritik Stok Esigi (%)</Label>
                  <Input id="critical_stock_threshold" type="number" defaultValue="10" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Yeniden siparis noktasinin bu yuzdesi altinda kritik uyari
                  </p>
                </div>
                <div>
                  <Label htmlFor="location_capacity_threshold">Lokasyon Doluluk Esigi (%)</Label>
                  <Input id="location_capacity_threshold" type="number" defaultValue="90" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lokasyon kapasitesinin bu yuzdesi ustunde uyari
                  </p>
                </div>
                <div>
                  <Label htmlFor="order_delay_threshold">Siparis Gecikme Esigi (Gun)</Label>
                  <Input id="order_delay_threshold" type="number" defaultValue="1" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Beklenen tarihten kac gun gecince uyari
                  </p>
                </div>
                <div>
                  <Label htmlFor="quality_defect_threshold">Kalite Hata Esigi (Adet)</Label>
                  <Input id="quality_defect_threshold" type="number" defaultValue="10" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Bu sayinin ustunde hata tespit edilince uyari
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
