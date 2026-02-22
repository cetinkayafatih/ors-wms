# Endüstri Mühendisliği Teknik Rehber
## Çorap Fabrikası WMS Projesi - Tüm Kavramlar ve Formüller

> Bu rehber, projede kullanılan tüm Endüstri Mühendisliği kavramlarını ders niteliğinde açıklar.
> Her konu için: teori, formül, çözümlü örnek ve projede nasıl kullanıldığı anlatılır.

---

# İÇİNDEKİLER

1. [Ekonomik Sipariş Miktarı (EOQ)](#1-ekonomik-sipariş-miktarı-eoq)
2. [Emniyet Stoğu ve Yeniden Sipariş Noktası](#2-emniyet-stoğu-ve-yeniden-sipariş-noktası)
3. [ABC Analizi (Pareto)](#3-abc-analizi-pareto)
4. [Talep Tahmini - Üssel Düzeltme](#4-talep-tahmini---üssel-düzeltme)
5. [Holt Çift Üssel Düzeltme](#5-holt-çift-üssel-düzeltme)
6. [Monte Carlo Simülasyonu](#6-monte-carlo-simülasyonu)
7. [Yalın Üretim ve Değer Akış Haritalama (VSM)](#7-yalın-üretim-ve-değer-akış-haritalama-vsm)
8. [Takt Süresi](#8-takt-süresi)
9. [5S Metodolojisi](#9-5s-metodolojisi)
10. [7 İsraf (Muda)](#10-7-israf-muda)
11. [Eşleştirilmiş t-Testi](#11-eşleştirilmiş-t-testi)
12. [Doğrusal Regresyon](#12-doğrusal-regresyon)
13. [Envanter Devir Hızı ve Elde Tutma Maliyeti](#13-envanter-devir-hızı-ve-elde-tutma-maliyeti)
14. [Normal Dağılım](#14-normal-dağılım)
15. [Betimleyici İstatistikler](#15-betimleyici-istatistikler)

---

# 1. Ekonomik Sipariş Miktarı (EOQ)

## 1.1 EOQ Nedir?

EOQ (Economic Order Quantity), toplam envanter maliyetini **minimize eden** optimal sipariş miktarını belirler.

Envanter yönetiminde iki temel maliyet birbiriyle çelişir:
- **Sipariş Maliyeti:** Her sipariş verdiğinizde sabit maliyet oluşur (kağıt işleri, kargo, muayene). Büyük siparişler → az sipariş → düşük sipariş maliyeti.
- **Elde Tutma Maliyeti:** Stokta tuttuğunuz her birim maliyet oluşturur (depolama, sigorta, bozulma, fırsat maliyeti). Büyük siparişler → çok stok → yüksek elde tutma maliyeti.

EOQ, bu iki maliyetin **dengelendiği noktayı** bulur.

## 1.2 Formüller

### EOQ (Ekonomik Sipariş Miktarı)
```
EOQ = √(2DS / H)
```

- **D:** Yıllık talep (birim/yıl)
- **S:** Sipariş başına sabit maliyet (TL/sipariş)
- **H:** Birim başına yıllık elde tutma maliyeti (TL/birim/yıl)

### Toplam Maliyet
```
TC = (D/Q) × S + (Q/2) × H
```

- **(D/Q) × S:** Yıllık sipariş maliyeti (yılda kaç sipariş × sipariş maliyeti)
- **(Q/2) × H:** Yıllık elde tutma maliyeti (ortalama stok × birim tutma maliyeti)

### Yılda Sipariş Sayısı
```
N = D / EOQ
```

### Siparişler Arası Gün Sayısı
```
T = 365 / N
```

## 1.3 Çözümlü Örnek (Projeden)

**Pamuk İplik Ne 30** için veriler:
- D = 42.500 birim/yıl (yıllık talep)
- S = 500 TL/sipariş (sipariş maliyeti)
- H = 5 TL/birim/yıl (elde tutma maliyeti)

```
EOQ = √(2 × 42.500 × 500 / 5)
EOQ = √(42.500.000 / 5)
EOQ = √8.500.000
EOQ = 2.916 birim

N = 42.500 / 2.916 = 14.6 sipariş/yıl
T = 365 / 14.6 = 25.0 gün

TC = (42.500/2.916) × 500 + (2.916/2) × 5
TC = 14.6 × 500 + 1.458 × 5
TC = 7.290 + 7.290
TC = 14.580 TL/yıl
```

**Dikkat edilecek nokta:** Optimal noktada sipariş maliyeti = elde tutma maliyeti (7.290 = 7.290). Bu, EOQ'nun matematiksel bir özelliğidir. Her zaman böyledir.

**Bir başka ürün - Spor Çorap Siyah M:**
- D = 60.000 çift/yıl
- S = 350 TL/sipariş
- H = 1.75 TL/çift/yıl

```
EOQ = √(2 × 60.000 × 350 / 1.75)
EOQ = √(42.000.000 / 1.75)
EOQ = √24.000.000
EOQ = 4.899 çift ≈ 4.899

N = 60.000 / 4.899 = 12.2 sipariş/yıl
T = 365 / 12.2 = 29.9 gün
```

## 1.4 EOQ'nun Varsayımları ve Sınırlılıkları

EOQ modeli şu varsayımlara dayanır:
1. Talep **sabit ve bilinir** (gerçekte dalgalanır → emniyet stoğu gerekir)
2. Tedarik süresi **sabit** (gerçekte değişir)
3. Miktar indirimi **yoktur** (gerçekte büyük siparişlerde indirim olabilir)
4. Sipariş **anında ve tam gelir** (gerçekte kısmi teslimat olabilir)
5. Stok tükenme maliyeti **dikkate alınmaz**

Bu varsayımlar yüzünden EOQ, bir başlangıç noktasıdır - gerçek dünyada emniyet stoğu, talep tahmini ve simülasyonla desteklenir.

---

# 2. Emniyet Stoğu ve Yeniden Sipariş Noktası

## 2.1 Emniyet Stoğu (Safety Stock) Nedir?

Emniyet stoğu, talep ve tedarik süresi belirsizliğine karşı tutulan **tampon stoktur**. Stok tükenmesini (stockout) önlemek için kullanılır.

## 2.2 Formül

```
SS = Z × √(LT × σ_d² + d̄² × σ_LT²)
```

- **Z:** Hizmet seviyesine karşılık gelen Z-değeri (normal dağılım)
- **LT:** Ortalama tedarik süresi (gün)
- **σ_d:** Günlük talep standart sapması
- **d̄:** Ortalama günlük talep
- **σ_LT:** Tedarik süresi standart sapması (gün)

### Hizmet Seviyesi Z-Değerleri

| Hizmet Seviyesi | Z Değeri | Anlamı |
|----------------|---------|--------|
| %90 | 1.28 | 10 siparişten 9'u stok tükenmeden karşılanır |
| %95 | 1.65 | 20 siparişten 19'u |
| %97.5 | 1.96 | 40 siparişten 39'u |
| %99 | 2.33 | 100 siparişten 99'u |
| %99.5 | 2.58 | 200 siparişten 199'u |
| %99.9 | 3.09 | 1000 siparişten 999'u |

> **Z-değeri nereden gelir?** Normal (Gauss) dağılımının ters kümülatif fonksiyonundan. Örneğin Z = 1.65 demek, normal dağılımda ortalamanın 1.65 standart sapma sağında kalan alan %95'tir.

### Formüldeki İki Terim

```
SS = Z × √(LT × σ_d²  +  d̄² × σ_LT²)
          ─────────────   ──────────────
          Talep riski      Tedarik süresi riski
```

- **İlk terim:** Talepteki dalgalanmaya karşı tampon (talep beklenenden fazla olursa)
- **İkinci terim:** Tedarik süresindeki dalgalanmaya karşı tampon (teslimat gecikirse)

## 2.3 Yeniden Sipariş Noktası (ROP)

ROP, "stok bu seviyeye düştüğünde yeni sipariş ver" noktasıdır.

```
ROP = (d̄ × LT) + SS
```

- **d̄ × LT:** Tedarik süresi boyunca beklenen talep
- **SS:** Emniyet stoğu

## 2.4 Çözümlü Örnek

Spor Çorap Siyah M:
- d̄ = 60.000/365 = 164 çift/gün (ortalama günlük talep)
- σ_d = 30 çift/gün (talep standart sapması)
- LT = 7 gün (ortalama tedarik süresi)
- σ_LT = 2 gün (tedarik süresi standart sapması)
- Hizmet seviyesi: %95 → Z = 1.65

```
SS = 1.65 × √(7 × 30² + 164² × 2²)
SS = 1.65 × √(7 × 900 + 26.896 × 4)
SS = 1.65 × √(6.300 + 107.584)
SS = 1.65 × √113.884
SS = 1.65 × 337.5
SS = 557 çift

ROP = (164 × 7) + 557
ROP = 1.148 + 557
ROP = 1.705 çift
```

**Yorum:** Stok 1.705 çifte düştüğünde yeni sipariş verilmeli. 557 çift emniyet stoğu, talep ve tedarik süresi dalgalanmalarına karşı %95 güvence sağlar.

---

# 3. ABC Analizi (Pareto)

## 3.1 ABC Analizi Nedir?

ABC analizi, envanter kalemlerini **yıllık kullanım değerine** göre sınıflandıran bir Pareto (80/20) analizidir.

Temel fikir: Tüm ürünler eşit önemde değildir. Genellikle:
- **A sınıfı:** Kalemlerin ~%20'si → Toplam değerin ~%80'i
- **B sınıfı:** Kalemlerin ~%30'u → Toplam değerin ~%15'i
- **C sınıfı:** Kalemlerin ~%50'si → Toplam değerin ~%5'i

## 3.2 Hesaplama Adımları

1. Her kalem için **yıllık kullanım değeri** hesapla: `Miktar × Birim Fiyat`
2. Kalemleri yıllık kullanım değerine göre **büyükten küçüğe** sırala
3. **Kümülatif yüzde** hesapla
4. Sınıflandır: 0-%80 → A, %80-%95 → B, %95-%100 → C

## 3.3 Çözümlü Örnek (Projeden)

Çorap fabrikasındaki 20 kalemin ilk 10'u:

| # | Kalem | Yıllık Değer (TL) | % | Küm. % | Sınıf |
|---|-------|-------------------|-----|---------|-------|
| 1 | Pamuk İplik Ne 30 | 850.000 | 21.6 | 21.6 | A |
| 2 | Polyester İplik 150D | 620.000 | 15.8 | 37.4 | A |
| 3 | Elastan İplik 40D | 480.000 | 12.2 | 49.6 | A |
| 4 | Spor Çorap Siyah M | 420.000 | 10.7 | 60.3 | A |
| 5 | Crew Çorap Lacivert L | 350.000 | 8.9 | 69.2 | A |
| 6 | Naylon İplik 70D | 280.000 | 7.1 | 76.3 | A |
| 7 | Termal Çorap Gri XL | 210.000 | 5.3 | 81.7 | B |
| 8 | No Show Beyaz S | 180.000 | 4.6 | 86.2 | B |
| 9 | Boya İndigo Mavi | 150.000 | 3.8 | 90.1 | B |
| 10 | Medikal Çorap Bej S | 130.000 | 3.3 | 93.4 | B |

Toplam 20 kalem, toplam değer: 3.936.000 TL

**Özet:**

| Sınıf | Kalem Sayısı | Kalem % | Değer % | Yönetim Stratejisi |
|-------|-------------|---------|---------|-------------------|
| A | 6 | %30 | %76.3 | Sıkı kontrol, düşük emniyet stoğu, sık sayım |
| B | 4 | %20 | %16.8 | Orta düzey kontrol, periyodik gözden geçirme |
| C | 10 | %50 | %6.9 | Basit kontrol, yüksek emniyet stoğu, seyrek sayım |

**Neden önemli?** Sınırlı kaynakları (zaman, personel, dikkat) en değerli kalemlere yoğunlaştırmak. A sınıfı kalemlere EOQ uygulanır, C sınıfı kalemler basit kurallarla yönetilir.

---

# 4. Talep Tahmini - Üssel Düzeltme

## 4.1 Basit Üssel Düzeltme (SES - Simple Exponential Smoothing)

Üssel düzeltme, geçmiş verilere dayalı olarak gelecek talebi tahmin eden bir yöntemdir. Yakın geçmiş verilere daha fazla ağırlık verir.

### Formül
```
F(t+1) = α × D(t) + (1 - α) × F(t)
```

- **F(t+1):** Sonraki dönem tahmini
- **D(t):** Gerçek talep (mevcut dönem)
- **F(t):** Mevcut tahmin
- **α (alpha):** Düzeltme katsayısı (0 < α < 1)

### α Katsayısının Etkisi

| α Değeri | Özellik |
|---------|---------|
| α → 0 (ör. 0.1) | Tahmin çok yavaş değişir, geçmişe ağırlık verir, daha düz |
| α → 1 (ör. 0.9) | Tahmin çok hızlı değişir, son veriye ağırlık verir, daha dalgalı |
| α = 0.2 | Genel kullanım için iyi bir başlangıç değeri |

### Hata Metrikleri

**MAE (Mean Absolute Error / Ortalama Mutlak Hata):**
```
MAE = (1/n) × Σ|D(t) - F(t)|
```

**MAPE (Mean Absolute Percentage Error / Ortalama Mutlak Yüzde Hata):**
```
MAPE = (1/n) × Σ(|D(t) - F(t)| / D(t)) × 100
```

### Çözümlü Örnek (Projeden)

Spor Çorap Siyah M, son 6 aylık talep: 5.300, 6.000, 4.400, 4.800, ?, ?

α = 0.2 ile tahmin:
```
F(1) = 5.300 (ilk değer = ilk gerçek)

F(2) = 0.2 × 5.300 + 0.8 × 5.300 = 5.300
Gerçek D(2) = 6.000 → Hata = |6.000 - 5.300| = 700

F(3) = 0.2 × 6.000 + 0.8 × 5.300 = 1.200 + 4.240 = 5.440
Gerçek D(3) = 4.400 → Hata = |4.400 - 5.440| = 1.040

F(4) = 0.2 × 4.400 + 0.8 × 5.440 = 880 + 4.352 = 5.232
Gerçek D(4) = 4.800 → Hata = |4.800 - 5.232| = 432

F(5) = 0.2 × 4.800 + 0.8 × 5.232 = 960 + 4.186 = 5.146 ← Sonraki ay tahmini
```

MAE = (700 + 1.040 + 432) / 3 = 724

**Yorum:** SES trend'i yakalayamaz (her zaman biraz geriden gelir). Trend varsa Holt yöntemi kullanılmalıdır.

---

# 5. Holt Çift Üssel Düzeltme

## 5.1 Neden Holt?

Basit üssel düzeltme (SES) **trendsiz** seriler için iyidir. Ama talep artıyorsa veya azalıyorsa, SES her zaman geriden gelir. Holt yöntemi **trend bileşenini** de modelleyerek daha iyi tahmin yapar.

## 5.2 Formüller

İki denklem vardır:

**Seviye (Level):**
```
L(t) = α × Y(t) + (1 - α) × (L(t-1) + T(t-1))
```

**Trend:**
```
T(t) = β × (L(t) - L(t-1)) + (1 - β) × T(t-1)
```

**Tahmin (m dönem sonrası):**
```
F(t+m) = L(t) + m × T(t)
```

- **α (alpha):** Seviye düzeltme katsayısı (0 < α < 1)
- **β (beta):** Trend düzeltme katsayısı (0 < β < 1)
- **L(t):** t anındaki seviye (düzeltilmiş ortalama)
- **T(t):** t anındaki trend (artış/azalış hızı)
- **Y(t):** t anındaki gerçek gözlem
- **m:** Kaç dönem sonrasını tahmin ediyoruz

### Başlangıç Değerleri
```
L(1) = Y(1)
T(1) = Y(2) - Y(1)
```

## 5.3 Çözümlü Örnek (Projeden)

No Show Beyaz S çorabının aylık talebi (artan trend):
```
1.500, 1.800, 2.200, 2.800, 3.200, 2.900
```

α = 0.3, β = 0.1 ile:

```
Başlangıç: L(1) = 1.500, T(1) = 1.800 - 1.500 = 300

t=2: Y(2) = 1.800
  L(2) = 0.3 × 1.800 + 0.7 × (1.500 + 300) = 540 + 1.260 = 1.800
  T(2) = 0.1 × (1.800 - 1.500) + 0.9 × 300 = 30 + 270 = 300
  F(2) = 1.500 + 300 = 1.800

t=3: Y(3) = 2.200
  L(3) = 0.3 × 2.200 + 0.7 × (1.800 + 300) = 660 + 1.470 = 2.130
  T(3) = 0.1 × (2.130 - 1.800) + 0.9 × 300 = 33 + 270 = 303
  F(3) = 1.800 + 300 = 2.100

t=4: Y(4) = 2.800
  L(4) = 0.3 × 2.800 + 0.7 × (2.130 + 303) = 840 + 1.703 = 2.543
  T(4) = 0.1 × (2.543 - 2.130) + 0.9 × 303 = 41.3 + 272.7 = 314
  F(4) = 2.130 + 303 = 2.433

Gelecek 3 ay tahmini (t=6'dan itibaren):
  F(7) = L(6) + 1 × T(6) ≈ seviye + 1 × trend
  F(8) = L(6) + 2 × T(6)
  F(9) = L(6) + 3 × T(6)
```

**Yorum:** Holt, trend'i yakalar. SES bu seriye uygulanırsa hep geriden gelecektir. Ama Holt'un da sınırlılığı vardır: mevsimselliği yakalar mı? Hayır. Mevsimsellik için **Holt-Winters** gerekir (projede yok ama soru gelebilir).

---

# 6. Monte Carlo Simülasyonu

## 6.1 Monte Carlo Nedir?

Monte Carlo simülasyonu, belirsiz değişkenlere sahip sistemleri **rastgele örnekleme** ile analiz eden bir yöntemdir. Binlerce veya on binlerce senaryoyu bilgisayarda simüle ederek olasılık dağılımlarını elde eder.

Adını Monaco'daki ünlü kumarhane bölgesinden alır - çünkü temeli rastgeleliğe (şansa) dayanır.

## 6.2 Projemizde Nasıl Kullanılıyor?

Emniyet stoğu belirleme problemi:

Talep belirsiz (normal dağılım: μ_d ± σ_d) ve tedarik süresi de belirsiz (normal dağılım: μ_LT ± σ_LT). "Tedarik süresi boyunca toplam talep" bu iki belirsizliğin çarpımıdır, ve analitik çözümü zordur. Monte Carlo ile 10.000 senaryo simüle ediyoruz.

## 6.3 Box-Muller Dönüşümü

Monte Carlo'da normal dağılımlı rastgele sayılar gerekir. Bilgisayarlar düzgün dağılımlı (uniform) sayı üretir. Box-Muller yöntemi bunları normal dağılıma dönüştürür.

### Formül
```
U₁, U₂ ~ Uniform(0, 1)    (düzgün dağılımlı iki rastgele sayı)

Z₁ = √(-2 × ln(U₁)) × cos(2π × U₂)
Z₂ = √(-2 × ln(U₁)) × sin(2π × U₂)
```

Z₁ ve Z₂, standart normal dağılıma sahiptir (μ=0, σ=1). İstenen dağılıma dönüşüm:
```
X = μ + Z × σ
```

## 6.4 Simülasyon Adımları

```
Girdiler: μ_d, σ_d, μ_LT, σ_LT, N (iterasyon sayısı = 10.000)

Her iterasyon i = 1, 2, ..., N için:
  1. Box-Muller ile Z₁, Z₂ üret
  2. Talep simüle et:         d_sim = max(0, μ_d + Z₁ × σ_d)
  3. Tedarik süresi simüle et: LT_sim = max(0.5, μ_LT + Z₂ × σ_LT)
  4. Toplam talep:             demand_i = d_sim × LT_sim

Sonuçları sırala ve:
  - Ortalama: μ = Σdemand_i / N
  - %95 yüzdelik: P₉₅ = demand[N × 0.95]
  - %99 yüzdelik: P₉₉ = demand[N × 0.99]

Emniyet stoğu (%95): SS₉₅ = P₉₅ - μ
Emniyet stoğu (%99): SS₉₉ = P₉₉ - μ
```

## 6.5 Çözümlü Örnek (Kavramsal)

Girdi:
- Ortalama günlük talep: 164 çift/gün
- Talep std. sapması: 30 çift/gün
- Ortalama tedarik süresi: 7 gün
- Tedarik süresi std. sapması: 2 gün
- 10.000 iterasyon

Simülasyon sonucu (her çalıştırmada biraz farklı çıkar):
```
Ortalama toplam talep: 1.148
Standart sapma: 367
%95 yüzdelik: 1.752
%99 yüzdelik: 2.003

Emniyet stoğu (%95): 1.752 - 1.148 = 604 çift
Emniyet stoğu (%99): 2.003 - 1.148 = 855 çift
```

**Karşılaştırma:** Analitik formülle SS(%95) = 557 çift bulmuştuk. Monte Carlo 604 çift diyor. Fark, Monte Carlo'nun talep×tedarik süresi çarpımının gerçek dağılımını yakalamasından kaynaklanır (analitik formül doğrusal yaklaşım yapar).

---

# 7. Yalın Üretim ve Değer Akış Haritalama (VSM)

## 7.1 Yalın Üretim Nedir?

Yalın üretim (Lean Manufacturing), Toyota Üretim Sistemi'nden doğan, **israfı ortadan kaldırarak** değer yaratan faaliyetlere odaklanan bir felsefedir.

Temel prensip: Müşterinin gözünden **değer katmayan** her aktivite israftır ve elimine edilmelidir.

## 7.2 VSM (Value Stream Mapping / Değer Akış Haritalama)

VSM, bir ürünün hammaddeden müşteriye ulaşana kadar geçtiği **tüm adımları** görselleştiren bir araçtır.

Her adım için şunlar kaydedilir:
- **Çevrim Süresi (Cycle Time):** O işlemin kendisinin süresi
- **Bekleme Süresi (Wait Time):** Bir sonraki işleme geçmeden önceki bekleme
- **Katma Değer Yüzdesi:** İşlemin ne kadarı gerçekten değer katıyor?
- **Operatör Sayısı**
- **WIP (Work in Process):** Süreçteki yarı mamul sayısı

### Hesaplanan Metrikler

**Toplam Tedarik Süresi:**
```
Lead Time = Σ(Çevrim Süreleri) + Σ(Bekleme Süreleri)
```

**Katma Değerli Süre:**
```
VA Time = Σ(Çevrim Süresi × Katma Değer Yüzdesi)
```

**Katma Değersiz Süre:**
```
NVA Time = Lead Time - VA Time
```

**Süreç Çevrim Verimliliği (PCE):**
```
PCE = (VA Time / Lead Time) × 100
```

## 7.3 Çözümlü Örnek (Projeden)

Çorap fabrikası deposunun 7 adımlı süreci:

| # | Süreç | Çevrim (dk) | Bekleme (dk) | KD % | Operatör | WIP |
|---|-------|------------|-------------|------|----------|-----|
| 1 | Mal Kabul & Boşaltma | 45 | 30 | %60 | 3 | 12 |
| 2 | Kalite Kontrol | 30 | 120 | %80 | 2 | 8 |
| 3 | Yerleşim (Putaway) | 25 | 45 | %70 | 2 | 15 |
| 4 | Depolama | 0 | 2.880 | %0 | 0 | 450 |
| 5 | Sipariş Toplama | 35 | 60 | %75 | 4 | 20 |
| 6 | Paketleme & Etiketleme | 20 | 15 | %85 | 3 | 10 |
| 7 | Sevkiyat Yükleme | 30 | 90 | %55 | 2 | 25 |

```
Toplam Çevrim Süresi = 45 + 30 + 25 + 0 + 35 + 20 + 30 = 185 dakika
Toplam Bekleme Süresi = 30 + 120 + 45 + 2.880 + 60 + 15 + 90 = 3.240 dakika
Toplam Lead Time = 185 + 3.240 = 3.425 dakika (≈ 57 saat ≈ 2.4 gün)

Katma Değerli Süre:
  = 45×0.60 + 30×0.80 + 25×0.70 + 0×0 + 35×0.75 + 20×0.85 + 30×0.55
  = 27 + 24 + 17.5 + 0 + 26.25 + 17 + 16.5
  = 128.25 dakika

PCE = 128.25 / 3.425 × 100 = 3.74%
```

**Yorum:** PCE = %3.74 → Toplam sürenin sadece %3.74'ü değer katıyor! Geri kalanı (%96.26) bekleme, taşıma, kontrol gibi katma değersiz faaliyetler.

**En büyük darboğaz:** Depolama aşaması (2.880 dakika = 2 gün bekleme). Bu, ürünlerin depoda ortalama 2 gün bekletildiğini gösterir. FIFO (First In First Out) uygulaması ve cross-docking ile azaltılabilir.

**Toplam WIP:** 12 + 8 + 15 + 450 + 20 + 10 + 25 = 540 birim

**Darboğaz süreç:** Mal Kabul & Boşaltma (45 dakika en uzun çevrim süresi)

---

# 8. Takt Süresi

## 8.1 Takt Süresi Nedir?

Takt süresi, müşteri talebini karşılamak için her bir ürünü **ne kadar sürede üretmeniz/işlemeniz** gerektiğini gösteren bir yalın üretim metriğidir. Almanca "Takt" kelimesinden gelir (ritim, tempo).

## 8.2 Formül
```
Takt Süresi = Kullanılabilir Üretim Süresi / Müşteri Talebi
```

## 8.3 Çözümlü Örnek

Çorap deposu:
- Günlük çalışma: 8 saat = 480 dakika
- Molalar ve hazırlık: 30 dakika
- Kullanılabilir süre: 450 dakika
- Günlük talep: 200 sipariş

```
Takt Süresi = 450 / 200 = 2.25 dakika/sipariş = 135 saniye/sipariş
```

**Yorum:** Her 2.25 dakikada bir sipariş tamamlanmalı. Eğer toplama işlemi 3 dakika sürüyorsa, takt süresini aşıyorsunuz → ya kapasite artırmalı ya da süreç hızlandırmalı.

### Takt Süresi vs. Çevrim Süresi

| Metrik | Açıklama | Belirleme |
|--------|----------|-----------|
| Takt Süresi | Ne hızda üretmeliyiz? | Müşteri talebi belirler |
| Çevrim Süresi | Ne hızda üretiyoruz? | Süreç kapasitesi belirler |

- **Çevrim Süresi < Takt Süresi:** Kapasite yeterli (talep karşılanır)
- **Çevrim Süresi > Takt Süresi:** Kapasite yetersiz (talep karşılanamaz → darboğaz)
- **Çevrim Süresi ≈ Takt Süresi:** İdeal durum (tam dengeli hat)

---

# 9. 5S Metodolojisi

## 9.1 5S Nedir?

5S, çalışma alanını **düzenli, temiz ve verimli** tutmak için kullanılan bir yalın üretim aracıdır. 5 Japonca kelimeden oluşur:

| Japonca | İngilizce | Türkçe | Açıklama |
|---------|-----------|--------|----------|
| Seiri | Sort | Ayıkla | Gereksiz malzemeleri uzaklaştır |
| Seiton | Set in Order | Düzenle | Her şeyin bir yeri olsun, her şey yerinde olsun |
| Seiso | Shine | Temizle | Çalışma alanını temizle ve temiz tut |
| Seiketsu | Standardize | Standartlaştır | İlk 3S'i standart hale getir |
| Shitsuke | Sustain | Sürdür | Disiplini devam ettir |

## 9.2 Puanlama Sistemi

Her S boyutu 1-5 arasında puanlanır:

| Puan | Anlamı |
|------|--------|
| 1 | Çok kötü - hiç uygulanmıyor |
| 2 | Kötü - az uygulanıyor |
| 3 | Orta - kısmen uygulanıyor |
| 4 | İyi - büyük ölçüde uygulanıyor |
| 5 | Mükemmel - tam uygulanıyor |

Toplam puan: 5 boyut × 5 puan = **maksimum 25 puan**

## 9.3 Projeden Veri

Hammadde Deposu 5S denetim sonuçları (6 ay):

| Tarih | Ayıkla | Düzenle | Temizle | Standart | Sürdür | Toplam |
|-------|--------|---------|---------|----------|--------|--------|
| Eyl 2025 | 3 | 2 | 3 | 2 | 2 | 12/25 |
| Eki 2025 | 3 | 3 | 3 | 3 | 2 | 14/25 |
| Kas 2025 | 4 | 3 | 4 | 3 | 3 | 17/25 |
| Ara 2025 | 4 | 4 | 4 | 3 | 3 | 18/25 |
| Oca 2026 | 4 | 4 | 4 | 4 | 3 | 19/25 |
| Şub 2026 | 5 | 4 | 4 | 4 | 4 | 21/25 |

**Yorum:** 6 ayda 12'den 21'e yükseliş (%75 iyileşme). En geç iyileşen boyut "Sürdür" (Sustain) - disiplinin kalıcı hale gelmesi en uzun süren adımdır, bu beklenen bir durumdur.

---

# 10. 7 İsraf (Muda)

## 10.1 7 İsraf Nedir?

Toyota Üretim Sistemi'nde tanımlanan, değer katmayan 7 temel israf türü:

| # | Japonca | İngilizce | Türkçe | Depo Örneği |
|---|---------|-----------|--------|-------------|
| 1 | Muda | Transport | Taşıma | Gereksiz malzeme taşıma mesafeleri |
| 2 | Muda | Inventory | Fazla Stok | Aşırı güvenlik stoğu, yavaş hareket eden kalemler |
| 3 | Muda | Motion | Gereksiz Hareket | Operatörün yürüme mesafesi, ergonomi sorunları |
| 4 | Muda | Waiting | Bekleme | Rampa bekleme, kalite kontrol kuyruğu |
| 5 | Muda | Overproduction | Fazla Üretim | Tahmin hatalarından kaynaklanan fazla üretim |
| 6 | Muda | Overprocessing | Gereksiz İşlem | Tekrarlanan kontrol ve veri girişi |
| 7 | Muda | Defects | Kusurlar | Kalite hataları, iade ve yeniden işleme |

> **Kolaylık:** İngilizce baş harfleriyle **TIMWOOD** olarak hatırlanır: Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects.

## 10.2 Projeden Muda Analizi

| İsraf Türü | Mevcut (1-10) | Hedef (1-10) | İyileştirme Önerisi |
|------------|:---:|:---:|---|
| Taşıma | 7 | 3 | Depo yerleşim optimizasyonu, zone-bazlı yerleştirme |
| Fazla Stok | 6 | 3 | ABC analizi ile stok politikası, EOQ uygulaması |
| Gereksiz Hareket | 5 | 2 | Toplama rotası optimizasyonu, ergonomik iş istasyonu |
| **Bekleme** | **8** | **3** | **Randevulu teslimat, paralel kalite kontrol hatları** |
| Fazla Üretim | 4 | 2 | Talep tahmini iyileştirme, kanban sistemi |
| Gereksiz İşlem | 3 | 1 | Barkod otomasyonu, WMS sistemi entegrasyonu |
| Kusurlar | 5 | 2 | Kök neden analizi, hata önleme |

**En kritik israf:** Bekleme (8/10). VSM analizi ile uyumlu - depolama adımında 2.880 dakika bekleme tespit edilmişti.

---

# 11. Eşleştirilmiş t-Testi

## 11.1 Nedir ve Ne Zaman Kullanılır?

Eşleştirilmiş t-testi (paired t-test), **aynı grubun** iki farklı koşuldaki (önce-sonra) ölçümlerini karşılaştırır. "İki durum arasındaki fark istatistiksel olarak anlamlı mı?" sorusuna yanıt verir.

Kullanım: WMS sistemini uyguladıktan önce ve sonra aynı metrikleri ölçtük. Fark gerçek mi yoksa şansa mı bağlı?

## 11.2 Hipotezler

```
H₀ (Null hipotez):     μ_d = 0  → Fark yok, değişiklik rastgele
H₁ (Alternatif hipotez): μ_d ≠ 0  → Fark var, değişiklik anlamlı
```

- **μ_d:** Farkların ortalaması (after - before)

## 11.3 Hesaplama Adımları

**Adım 1: Farkları hesapla**
```
dᵢ = after_i - before_i   (her çift için fark)
```

**Adım 2: Farkların ortalaması ve standart sapması**
```
d̄ = Σdᵢ / n
s_d = √[Σ(dᵢ - d̄)² / (n-1)]
```

**Adım 3: Standart hata**
```
SE = s_d / √n
```

**Adım 4: t-değeri**
```
t = d̄ / SE
```

**Adım 5: Serbestlik derecesi**
```
df = n - 1
```

**Adım 6: p-değeri**

t-dağılımı tablosundan veya hesaplamayla p-değeri bulunur. p < α (genellikle 0.05) ise H₀ reddedilir.

## 11.4 Çözümlü Örnek (Projeden)

**Toplama Doğruluğu (%) - 6 aylık önce/sonra karşılaştırma:**

| Ay | Önce | Sonra | Fark (d) |
|----|------|-------|----------|
| 1 | 93.2 | 98.5 | 5.3 |
| 2 | 94.1 | 99.1 | 5.0 |
| 3 | 93.8 | 99.3 | 5.5 |
| 4 | 94.5 | 99.0 | 4.5 |
| 5 | 93.9 | 99.4 | 5.5 |
| 6 | 94.8 | 99.2 | 4.4 |

```
Adım 1: Farklar: 5.3, 5.0, 5.5, 4.5, 5.5, 4.4

Adım 2:
  d̄ = (5.3 + 5.0 + 5.5 + 4.5 + 5.5 + 4.4) / 6 = 30.2 / 6 = 5.033

  Sapma kareleri:
  (5.3-5.033)² = 0.071
  (5.0-5.033)² = 0.001
  (5.5-5.033)² = 0.218
  (4.5-5.033)² = 0.284
  (5.5-5.033)² = 0.218
  (4.4-5.033)² = 0.401

  s_d² = (0.071 + 0.001 + 0.218 + 0.284 + 0.218 + 0.401) / 5 = 1.193 / 5 = 0.2386
  s_d = √0.2386 = 0.489

Adım 3:
  SE = 0.489 / √6 = 0.489 / 2.449 = 0.1996

Adım 4:
  t = 5.033 / 0.1996 = 25.22

Adım 5:
  df = 6 - 1 = 5

Adım 6:
  t = 25.22 ile df = 5 → p < 0.0001
```

**Sonuç:** t = 25.22, p < 0.0001 ≪ 0.05 → **H₀ reddedilir!**

Toplama doğruluğundaki %5.03'lük artış istatistiksel olarak **son derece anlamlıdır** (p < 0.0001). Bu farkın şansa bağlı olma olasılığı on binde birden az.

## 11.5 p-Değeri Ne Demek?

| p-değeri | Yorum |
|---------|-------|
| p > 0.10 | Anlamlı değil, fark rastgele olabilir |
| 0.05 < p ≤ 0.10 | Marjinal, daha fazla veri gerekli |
| 0.01 < p ≤ 0.05 | Anlamlı (*) |
| 0.001 < p ≤ 0.01 | Çok anlamlı (**) |
| p ≤ 0.001 | Son derece anlamlı (***) |

## 11.6 t-Dağılımı Hakkında

t-dağılımı, normal dağılıma benzer ama **kuyrukları daha kalındır** (özellikle küçük örneklemlerde). Serbestlik derecesi (df) arttıkça normal dağılıma yaklaşır.

Projede t-dağılımının p-değeri Hill (1970) yaklaşım yöntemiyle hesaplanır:
- df ≥ 30 → Normal dağılım yaklaşımı (Abramowitz & Stegun CDF)
- df < 30 → İnkomplete Beta fonksiyonu yaklaşımı

---

# 12. Doğrusal Regresyon

## 12.1 Nedir?

Doğrusal regresyon, iki değişken arasındaki **doğrusal ilişkiyi** modelleyen istatistiksel bir yöntemdir.

```
y = mx + b
```

- **m:** Eğim (slope) - x'teki bir birimlik artışın y'deki etkisi
- **b:** Kesim noktası (intercept) - x = 0 olduğundaki y değeri

## 12.2 En Küçük Kareler Yöntemi (Least Squares)

Amaç: Veri noktalarına en iyi uyan doğruyu bulmak. "En iyi" = hataların kareleri toplamını minimum yapan doğru.

### Formüller

```
m = (n×Σxᵢyᵢ - Σxᵢ×Σyᵢ) / (n×Σxᵢ² - (Σxᵢ)²)

b = (Σyᵢ - m×Σxᵢ) / n
```

### R² (Determinasyon Katsayısı)

```
R² = 1 - SS_res / SS_tot

SS_tot = Σ(yᵢ - ȳ)²    (toplam varyasyon)
SS_res = Σ(yᵢ - ŷᵢ)²   (açıklanamayan varyasyon, ŷᵢ = m×xᵢ + b)
```

R² Yorumlama:

| R² Değeri | Yorum |
|-----------|-------|
| 0.0 - 0.3 | Zayıf ilişki |
| 0.3 - 0.7 | Orta düzey ilişki |
| 0.7 - 0.9 | Güçlü ilişki |
| 0.9 - 1.0 | Çok güçlü ilişki |

## 12.3 Projede Kullanım

Önce/sonra analizi sayfasında, zaman serisindeki **trend** görselleştirmesi için kullanılır. Örneğin: "Aylar ilerledikçe iyileşme devam ediyor mu?"

x = ay numarası (1, 2, 3, 4, 5, 6)
y = metrik değeri

Pozitif eğim → iyileşme devam ediyor
R² yüksek → trend güvenilir

---

# 13. Envanter Devir Hızı ve Elde Tutma Maliyeti

## 13.1 Envanter Devir Hızı (Inventory Turnover)

Envanterin bir yıl içinde kaç kez "döndüğünü" (satılıp yenilendiğini) ölçer.

### Formül
```
Devir Hızı = SMM / Ortalama Envanter Değeri
```

- **SMM (COGS):** Satılan Malın Maliyeti (yıllık)

### Elde Tutma Gün Sayısı
```
Elde Tutma Günü = 365 / Devir Hızı
```

### Yorumlama

| Devir Hızı | Yorum |
|-----------|-------|
| < 4 | Düşük - stok çok yavaş hareket ediyor, bağlanan sermaye fazla |
| 4 - 8 | Normal - endüstri ortalaması |
| 8 - 12 | İyi - etkin envanter yönetimi |
| > 12 | Çok yüksek - stok tükenme riski olabilir |

## 13.2 Elde Tutma Maliyeti (Carrying Cost)

Stokta tutulan envanterin yıllık maliyetidir. Genellikle envanter değerinin %20-30'u kadardır.

### Bileşenleri:
- **Sermaye maliyeti:** Stoka bağlanan paranın fırsat maliyeti (%8-15)
- **Depolama maliyeti:** Kira, enerji, ekipman (%2-5)
- **Sigorta:** (%1-3)
- **Bozulma/Eskime:** (%2-5)
- **Vergi:** (%1-2)

### Formül
```
Yıllık Elde Tutma = Envanter Değeri × Elde Tutma Oranı (%)
Aylık = Yıllık / 12
Günlük = Yıllık / 365
```

### Çözümlü Örnek (Projeden)

```
Envanter değeri: 2.500.000 TL
SMM: 15.000.000 TL/yıl
Elde tutma oranı: %25

Devir hızı = 15.000.000 / 2.500.000 = 6.0x
Elde tutma günü = 365 / 6.0 = 61 gün

Yıllık elde tutma maliyeti = 2.500.000 × 0.25 = 625.000 TL
Aylık = 625.000 / 12 = 52.083 TL
Günlük = 625.000 / 365 = 1.712 TL
```

**Yorum:** Envanter 61 günde bir dönüyor (6x devir). Her gün stokta tutulan envanter 1.712 TL maliyet oluşturuyor. Devir hızını 8'e çıkarmak, elde tutma günlerini 46'ya düşürür ve yıllık ~156.000 TL tasarruf sağlar.

---

# 14. Normal Dağılım

## 14.1 Nedir?

Normal dağılım (Gauss dağılımı), doğadaki birçok ölçümün dağılımını tanımlayan çan eğrisi şeklinde bir olasılık dağılımıdır.

Özellikleri:
- Ortalama (μ) etrafında simetriktir
- Ortalamanın ±1σ'sı içinde verilerin **%68.3**'ü bulunur
- Ortalamanın ±2σ'sı içinde verilerin **%95.4**'ü bulunur
- Ortalamanın ±3σ'sı içinde verilerin **%99.7**'si bulunur

## 14.2 Normal Dağılım Olasılık Yoğunluk Fonksiyonu (PDF)

```
f(x) = (1 / (σ√(2π))) × e^(-(x-μ)²/(2σ²))
```

Bu formül, x noktasındaki olasılık yoğunluğunu verir.

## 14.3 Normal CDF (Kümülatif Dağılım Fonksiyonu)

CDF, bir değerin belirli bir eşiğin altında kalma olasılığını verir. Projede Abramowitz & Stegun (1964) yaklaşımı kullanılır:

```
Φ(x) ≈ 1 - (a₁t + a₂t² + a₃t³ + a₄t⁴ + a₅t⁵) × e^(-x²/2) / 2

t = 1 / (1 + 0.3275911 × |x|)

a₁ =  0.254829592
a₂ = -0.284496736
a₃ =  1.421413741
a₄ = -1.453152027
a₅ =  1.061405429
```

Bu yaklaşım, mutlak hata < 1.5 × 10⁻⁷ ile standart normal CDF'yi hesaplar.

## 14.4 Projede Kullanım

1. **Emniyet stoğu:** Z-değeri normal dağılımın ters CDF'sinden gelir
2. **Monte Carlo:** Box-Muller normal dağılımlı rastgele sayı üretir
3. **t-testi:** Büyük örneklemlerde (df ≥ 30) normal yaklaşım kullanılır

---

# 15. Betimleyici İstatistikler

## 15.1 Merkezi Eğilim Ölçüleri

**Ortalama (Mean):**
```
μ = Σxᵢ / n
```

**Medyan (Median):**
Sıralanmış verinin ortasındaki değer.
- n tek → ortadaki değer
- n çift → ortadaki iki değerin ortalaması

> Medyan, aykırı değerlerden (outlier) etkilenmez. Ortalama etkilenir.

## 15.2 Yayılım Ölçüleri

**Varyans (Variance):**
```
s² = Σ(xᵢ - x̄)² / (n-1)
```

> (n-1) ile bölmek **Bessel düzeltmesidir**. Örneklem varyansının yansız tahmincisi olmasını sağlar.

**Standart Sapma (Standard Deviation):**
```
s = √s²
```

**Minimum ve Maksimum:**
```
min = en küçük değer
max = en büyük değer
Aralık (Range) = max - min
```

## 15.3 Projede Kullanım

Betimleyici istatistikler, önce/sonra analizi sayfasında her metrik için hesaplanır:

Toplama Doğruluğu - Önce:
```
Değerler: 93.2, 94.1, 93.8, 94.5, 93.9, 94.8
n = 6
Ortalama = 94.05
Medyan = (93.9 + 94.1) / 2 = 94.0
Varyans = [(93.2-94.05)² + (94.1-94.05)² + ... + (94.8-94.05)²] / 5 = 0.339
Std. Sapma = √0.339 = 0.583
Min = 93.2, Max = 94.8
```

---

# Hızlı Referans - Tüm Formüller

| # | Kavram | Formül |
|---|--------|--------|
| 1 | EOQ | `√(2DS/H)` |
| 2 | Emniyet Stoğu | `Z × √(LT×σ_d² + d̄²×σ_LT²)` |
| 3 | ROP | `d̄ × LT + SS` |
| 4 | SES | `F(t+1) = α×D(t) + (1-α)×F(t)` |
| 5 | Holt Level | `L(t) = α×Y(t) + (1-α)×(L(t-1)+T(t-1))` |
| 6 | Holt Trend | `T(t) = β×(L(t)-L(t-1)) + (1-β)×T(t-1)` |
| 7 | Takt Süresi | `Kullanılabilir Süre / Talep` |
| 8 | PCE | `KD Süre / Toplam Lead Time × 100` |
| 9 | t-değeri | `d̄ / (s_d/√n)` |
| 10 | R² | `1 - SS_res/SS_tot` |
| 11 | Envanter Devir | `SMM / Ort. Envanter Değeri` |
| 12 | Elde Tutma | `Envanter Değeri × Elde Tutma Oranı` |
| 13 | Normal PDF | `(1/(σ√2π)) × e^(-(x-μ)²/(2σ²))` |
| 14 | Box-Muller | `Z = √(-2ln(U₁)) × cos(2πU₂)` |

---

# Soru Gelebilecek Kritik Noktalar

### "Monte Carlo neden analitik formülden farklı sonuç veriyor?"
Analitik emniyet stoğu formülü, talep ve tedarik süresinin bağımsız olduğunu ve çarpımlarının normal dağıldığını varsayar. Gerçekte iki normal dağılımın çarpımı normal dağılmaz. Monte Carlo bu yaklaşımı yapmadan gerçek dağılımı simüle eder.

### "EOQ'da toplam maliyet neden eşittir?"
EOQ noktasında sipariş maliyeti = elde tutma maliyeti olması matematiksel zorunluluktur. TC fonksiyonunun türevini sıfıra eşitleyip çözünce ortaya çıkar. Grafikteki iki maliyet eğrisinin kesişim noktasıdır.

### "%95 hizmet seviyesi ne demek?"
Bir sipariş döngüsünde (tedarik süresi boyunca) stok tükenme olasılığının %5 olması demektir. 20 siparişten 19'unda stok tükenmeden karşılarsınız, 1'inde stok tükenir.

### "5S'te neden Sustain en geç iyileşir?"
İlk 3S (Ayıkla, Düzenle, Temizle) fiziksel aktivitelerdir - hemen yapılabilir. Standardize prosedür oluşturmayı gerektirir. Sustain ise kültür değişimidir - insanların alışkanlıklarını değiştirmek en uzun süren iştir.

### "PCE neden bu kadar düşük (%3.74)?"
Düşük PCE, depo operasyonlarında normaldir. Ürünler büyük zamanını bekleyerek (depolama) geçirir. Üretim hatlarında PCE %5-15 arasındadır. Depolarda genellikle %1-5 arasıdır. İyileştirme hedefi PCE'yi artırmak, yani bekleme sürelerini azaltmaktır.

### "t-testi yerine neden z-testi kullanmadık?"
z-testi, popülasyon standart sapmasının bilindiği veya örneklem büyüklüğünün n > 30 olduğu durumlarda kullanılır. Bizim 6 gözlemimiz var (n = 6), bu yüzden t-testi uygundu. df = 5 ile t-dağılımının kuyrukları normalden daha kalındır - bu, küçük örneklemde daha muhafazakar (güvenli) sonuç verir.

---

> **Son Not:** Bu rehberdeki tüm formüller, projede `src/lib/calculations*.ts` dosyalarında TypeScript ile implemente edilmiştir. Toplam 33 fonksiyon, 913 satır hesaplama kodu. Tüm sayısal örnekler, projede kullanılan gerçek mock data'dan alınmıştır.
