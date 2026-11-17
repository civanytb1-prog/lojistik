// Türkiye'nin प्रमुख lojistik şehirleri, koordinatları (1000x500 harita düzlemi) ve ticaret profilleri
export const CITIES = [
  {
    id: 'istanbul',
    name: 'İstanbul',
    region: 'Marmara',
    x: 215,
    y: 120,
    population: '16.0M',
    hubLevel: 5,
    hasPort: true,
    hasAirport: true,
    specialties: ['Perakende', 'Elektronik', 'İthalat/İhracat', 'İlaç'],
    baseUnlockCost: 0, // Başlangıç şehri seçilebilir
    depotCost: 180000,
  },
  {
    id: 'tekirdag',
    name: 'Tekirdağ',
    region: 'Marmara',
    x: 135,
    y: 118,
    population: '1.1M',
    hubLevel: 3,
    hasPort: true,
    hasAirport: false,
    specialties: ['Tarım', 'Liman Konteyner', 'Gıda'],
    baseUnlockCost: 35000,
    depotCost: 85000,
  },
  {
    id: 'kocaeli',
    name: 'Kocaeli',
    region: 'Marmara',
    x: 265,
    y: 135,
    population: '2.1M',
    hubLevel: 5,
    hasPort: true,
    hasAirport: false,
    specialties: ['Petrokimya (ADR)', 'Otomotiv', 'Ağır Sanayi', 'Konteyner'],
    baseUnlockCost: 45000,
    depotCost: 140000,
  },
  {
    id: 'bursa',
    name: 'Bursa',
    region: 'Marmara',
    x: 225,
    y: 185,
    population: '3.2M',
    hubLevel: 4,
    hasPort: true,
    hasAirport: false,
    specialties: ['Otomotiv', 'Tekstil', 'Taze Gıda', 'Makine'],
    baseUnlockCost: 45000,
    depotCost: 130000,
  },
  {
    id: 'eskisehir',
    name: 'Eskişehir',
    region: 'İç Anadolu',
    x: 300,
    y: 215,
    population: '0.9M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: false,
    specialties: ['Havacılık Parçası', 'Seramik', 'Gıda', 'Makine'],
    baseUnlockCost: 40000,
    depotCost: 90000,
  },
  {
    id: 'izmir',
    name: 'İzmir',
    region: 'Ege',
    x: 120,
    y: 295,
    population: '4.5M',
    hubLevel: 5,
    hasPort: true,
    hasAirport: true,
    specialties: ['Liman İhracat', 'Petrokimya', 'Gıda', 'Tekstil'],
    baseUnlockCost: 65000,
    depotCost: 155000,
  },
  {
    id: 'manisa',
    name: 'Manisa',
    region: 'Ege',
    x: 150,
    y: 268,
    population: '1.5M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: false,
    specialties: ['Beyaz Eşya', 'Elektronik', 'Kuru Gıda'],
    baseUnlockCost: 40000,
    depotCost: 95000,
  },
  {
    id: 'denizli',
    name: 'Denizli',
    region: 'Ege',
    x: 215,
    y: 335,
    population: '1.1M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: false,
    specialties: ['Tekstil', 'Mermer (Ağır Yük)', 'Kablo'],
    baseUnlockCost: 45000,
    depotCost: 90000,
  },
  {
    id: 'antalya',
    name: 'Antalya',
    region: 'Akdeniz',
    x: 295,
    y: 395,
    population: '2.7M',
    hubLevel: 4,
    hasPort: true,
    hasAirport: true,
    specialties: ['Soğuk Zincir Sebze/Meyve', 'Turizm Tedarik', 'İçecek'],
    baseUnlockCost: 60000,
    depotCost: 135000,
  },
  {
    id: 'ankara',
    name: 'Ankara',
    region: 'İç Anadolu',
    x: 395,
    y: 195,
    population: '5.8M',
    hubLevel: 5,
    hasPort: false,
    hasAirport: true,
    specialties: ['Savunma & Makine', 'Medikal', 'Perakende Dağıtım', 'Mobilya'],
    baseUnlockCost: 60000,
    depotCost: 160000,
  },
  {
    id: 'konya',
    name: 'Konya',
    region: 'İç Anadolu',
    x: 385,
    y: 315,
    population: '2.3M',
    hubLevel: 4,
    hasPort: false,
    hasAirport: false,
    specialties: ['Tarım Makineleri', 'Tahıl & Un', 'Süt Ürünleri', 'Döküm'],
    baseUnlockCost: 50000,
    depotCost: 115000,
  },
  {
    id: 'kayseri',
    name: 'Kayseri',
    region: 'İç Anadolu',
    x: 520,
    y: 265,
    population: '1.4M',
    hubLevel: 4,
    hasPort: false,
    hasAirport: true,
    specialties: ['Mobilya', 'Çelik Kapı', 'Kablo', 'Gıda'],
    baseUnlockCost: 55000,
    depotCost: 110000,
  },
  {
    id: 'mersin',
    name: 'Mersin',
    region: 'Akdeniz',
    x: 475,
    y: 390,
    population: '1.9M',
    hubLevel: 5,
    hasPort: true,
    hasAirport: false,
    specialties: ['Uluslararası Konteyner', 'Narenciye (Soğuk)', 'Bakliyat', 'Akaryakıt'],
    baseUnlockCost: 65000,
    depotCost: 150000,
  },
  {
    id: 'adana',
    name: 'Adana',
    region: 'Akdeniz',
    x: 525,
    y: 375,
    population: '2.3M',
    hubLevel: 4,
    hasPort: false,
    hasAirport: true,
    specialties: ['Kimya', 'Tekstil', 'Tarım Ürünleri', 'Plastik'],
    baseUnlockCost: 55000,
    depotCost: 125000,
  },
  {
    id: 'gaziantep',
    name: 'Gaziantep',
    region: 'Güneydoğu',
    x: 615,
    y: 375,
    population: '2.2M',
    hubLevel: 5,
    hasPort: false,
    hasAirport: true,
    specialties: ['Halı & Tekstil', 'Gıda Sanayi', 'Ambalaj', 'İhracat Yükü'],
    baseUnlockCost: 65000,
    depotCost: 145000,
  },
  {
    id: 'sanliurfa',
    name: 'Şanlıurfa',
    region: 'Güneydoğu',
    x: 685,
    y: 380,
    population: '2.2M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: false,
    specialties: ['Pamuk', 'Tahıl', 'Gübre'],
    baseUnlockCost: 50000,
    depotCost: 95000,
  },
  {
    id: 'diyarbakir',
    name: 'Diyarbakır',
    region: 'Güneydoğu',
    x: 755,
    y: 330,
    population: '1.8M',
    hubLevel: 4,
    hasPort: false,
    hasAirport: true,
    specialties: ['Mermer & Maden', 'Gıda', 'İnşaat Malzemesi'],
    baseUnlockCost: 60000,
    depotCost: 115000,
  },
  {
    id: 'samsun',
    name: 'Samsun',
    region: 'Karadeniz',
    x: 535,
    y: 110,
    population: '1.4M',
    hubLevel: 4,
    hasPort: true,
    hasAirport: true,
    specialties: ['Karadeniz Liman', 'Medikal Aletler', 'Gıda', 'Gübre'],
    baseUnlockCost: 55000,
    depotCost: 120000,
  },
  {
    id: 'sivas',
    name: 'Sivas',
    region: 'İç Anadolu',
    x: 590,
    y: 205,
    population: '0.6M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: false,
    specialties: ['Demiryolu Ekipmanı', 'Maden', 'Tarım'],
    baseUnlockCost: 45000,
    depotCost: 85000,
  },
  {
    id: 'trabzon',
    name: 'Trabzon',
    region: 'Karadeniz',
    x: 705,
    y: 120,
    population: '0.8M',
    hubLevel: 4,
    hasPort: true,
    hasAirport: true,
    specialties: ['Fındık & Çay', 'Balık (Soğuk Zincir)', 'Transit Ticaret'],
    baseUnlockCost: 60000,
    depotCost: 115000,
  },
  {
    id: 'erzurum',
    name: 'Erzurum',
    region: 'Doğu Anadolu',
    x: 775,
    y: 195,
    population: '0.7M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: true,
    specialties: ['Et & Süt (Soğuk Zincir)', 'Yapı Malzemeleri', 'Yakıt'],
    baseUnlockCost: 55000,
    depotCost: 95000,
  },
  {
    id: 'van',
    name: 'Van',
    region: 'Doğu Anadolu',
    x: 885,
    y: 285,
    population: '1.1M',
    hubLevel: 3,
    hasPort: false,
    hasAirport: true,
    specialties: ['Sınır Ticareti', 'Tekstil', 'Akaryakıt', 'Gıda'],
    baseUnlockCost: 65000,
    depotCost: 105000,
  },
];

// Otoyol bağlantı çizgileri (Görsel harita ağı)
export const HIGHWAY_LINKS = [
  ['tekirdag', 'istanbul'],
  ['istanbul', 'kocaeli'],
  ['istanbul', 'bursa'],
  ['kocaeli', 'bursa'],
  ['kocaeli', 'eskisehir'],
  ['kocaeli', 'ankara'],
  ['kocaeli', 'samsun'],
  ['bursa', 'manisa'],
  ['bursa', 'eskisehir'],
  ['manisa', 'izmir'],
  ['izmir', 'denizli'],
  ['manisa', 'denizli'],
  ['eskisehir', 'ankara'],
  ['eskisehir', 'konya'],
  ['eskisehir', 'denizli'],
  ['denizli', 'antalya'],
  ['antalya', 'konya'],
  ['antalya', 'mersin'],
  ['ankara', 'konya'],
  ['ankara', 'kayseri'],
  ['ankara', 'samsun'],
  ['konya', 'mersin'],
  ['konya', 'adana'],
  ['konya', 'kayseri'],
  ['mersin', 'adana'],
  ['adana', 'kayseri'],
  ['adana', 'gaziantep'],
  ['kayseri', 'sivas'],
  ['kayseri', 'gaziantep'],
  ['samsun', 'sivas'],
  ['samsun', 'trabzon'],
  ['sivas', 'erzurum'],
  ['sivas', 'diyarbakir'],
  ['trabzon', 'erzurum'],
  ['gaziantep', 'sanliurfa'],
  ['sanliurfa', 'diyarbakir'],
  ['diyarbakir', 'erzurum'],
  ['diyarbakir', 'van'],
  ['erzurum', 'van'],
];

// İki şehir arası gerçekçi karayolu mesafesi (km) hesaplama
export function getDistanceKm(cityAId, cityBId) {
  if (cityAId === cityBId) return 0;
  const a = CITIES.find((c) => c.id === cityAId);
  const b = CITIES.find((c) => c.id === cityBId);
  if (!a || !b) return 300;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rawDist = Math.sqrt(dx * dx + dy * dy);
  // 1000px genişlik yaklaşık 1650 km Türkiye genişliğine denk gelir + yol kıvrım katsayısı
  return Math.max(85, Math.round(rawDist * 1.95));
}

// Şirket Gelişim Seviyeleri (Başlangıçtan Lojistik İmparatorluğuna)
export const COMPANY_TIERS = [
  {
    level: 1,
    title: 'Mahalle Nakliyatçısı',
    minXP: 0,
    badgeColor: 'from-slate-500 to-slate-700',
    description: 'Tek bir garaj ve hafif ticari araçlarla şehirlerarası ekspres koli ve palet taşımacılığı.',
    perks: ['Panelvan & Kamyonet Filosu', 'Spot Yük Pazarı', '2. El Araç Pazarı'],
  },
  {
    level: 2,
    title: 'Bölgesel Kargo Şirketi',
    minXP: 600,
    badgeColor: 'from-blue-500 to-indigo-700',
    description: 'Ağır kamyonlar, yeni şehir şubeleri ve düzenli kurumsal kontrat ihaleleri açılır.',
    perks: ['Kırkayak Kamyonlar (18 Ton)', 'Kurumsal Sözleşme İhaleleri', 'Soğuk Zincir (Frigo) Yükler'],
  },
  {
    level: 3,
    title: 'Ulusal Filo Operatörü',
    minXP: 1800,
    badgeColor: 'from-emerald-500 to-teal-700',
    description: 'Çekici tırlar, frigorifik dorseler ve şirket içi toptan akaryakıt tankı yatırımı.',
    perks: ['Çekici Tır + Dorse Filosu (26 Ton)', 'Şirket Akaryakıt Deposu', 'Antrepo & Aktarma Merkezleri'],
  },
  {
    level: 4,
    title: 'Entegre Lojistik & ADR Uzmanı',
    minXP: 4000,
    badgeColor: 'from-amber-500 to-orange-700',
    description: 'Tehlikeli madde (ADR) tankerleri, ağır nakliye (Lowbed) ve otomatik bakım atölyeleri.',
    perks: ['ADR Tanker & Lowbed Ağır Nakliye', 'Yüksek Karlı Sanayi İhaleleri', 'Merkez Bakım Atölyesi'],
  },
  {
    level: 5,
    title: 'İntermodal Lojistik Devleri',
    minXP: 8000,
    badgeColor: 'from-purple-500 to-fuchsia-700',
    description: 'Demiryolu konteyner hatları, Ro-Ro liman entegrasyonu ve yapay zeka rota optimizasyonu.',
    perks: ['İntermodal Konteyner Treni (65 Ton)', 'Otomatik Operasyon Yöneticisi', '%15 Kurumsal İtibar Primi'],
  },
  {
    level: 6,
    title: 'Anadolu Lojistik İmparatorluğu',
    minXP: 15000,
    badgeColor: 'from-rose-500 to-amber-500',
    description: 'Kargo uçakları, tüm Türkiye’yi kapsayan mega dağıtım üsleri ve sektör liderliği.',
    perks: ['Kargo Uçağı Filosu (Hava Lojistiği)', 'Ulusal Lojistik Tekeli', 'Maksimum Kar Marjı'],
  },
];

// Yük Tipleri
export const CARGO_TYPES = {
  standard: {
    id: 'standard',
    name: 'Standart Palet / Kuru Yük',
    shortName: 'Standart',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    rateMultiplier: 1.0,
    minLevel: 1,
    icon: 'Package',
  },
  express: {
    id: 'express',
    name: 'Acil Ekspres Kargo',
    shortName: 'Ekspres',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    rateMultiplier: 1.38,
    minLevel: 1,
    icon: 'Zap',
  },
  refrigerated: {
    id: 'refrigerated',
    name: 'Soğuk Zincir (Frigorifik)',
    shortName: 'Soğuk Zincir',
    color: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/40',
    rateMultiplier: 1.55,
    minLevel: 2,
    icon: 'Snowflake',
  },
  adr: {
    id: 'adr',
    name: 'ADR Tehlikeli Madde / Kimya',
    shortName: 'ADR Kimya',
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/40',
    rateMultiplier: 1.85,
    minLevel: 3,
    icon: 'Flame',
  },
  heavy: {
    id: 'heavy',
    name: 'Ağır Tonaj / Proje Yükü',
    shortName: 'Ağır Nakliye',
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/40',
    rateMultiplier: 2.15,
    minLevel: 4,
    icon: 'Construction',
  },
};

// Araç Kataloğu (Sıfır Araçlar)
export const VEHICLE_CATALOG = [
  {
    modelId: 'van_transit',
    name: 'Anadolu V-350 Panelvan',
    brand: 'Ford Otosan Serisi',
    category: 'Hafif Ticari',
    capacityTons: 3.5,
    speedKmh: 95,
    fuelLPer100Km: 11,
    price: 55000,
    dailyFixedCost: 180,
    supportedCargo: ['standard', 'express'],
    requiredLevel: 1,
    description: 'Başlangıç için ideal, düşük yakıt tüketimli ve hızlı şehirlerarası ekspres panelvan.',
  },
  {
    modelId: 'light_truck_npr',
    name: 'Anadolu K-80 Kamyonet',
    brand: 'Isuzu NPR Serisi',
    category: 'Kamyonet',
    capacityTons: 8.0,
    speedKmh: 85,
    fuelLPer100Km: 17,
    price: 115000,
    dailyFixedCost: 310,
    supportedCargo: ['standard', 'express'],
    requiredLevel: 1,
    description: 'Orta ölçekli paletli yükler ve parsiyel taşımacılık için dayanıklı kamyonet.',
  },
  {
    modelId: 'reefer_light',
    name: 'FrigoCool K-90 Soğutuculu',
    brand: 'ThermoKing & Isuzu',
    category: 'Soğuk Zincir Kamyonet',
    capacityTons: 9.0,
    speedKmh: 84,
    fuelLPer100Km: 19,
    price: 155000,
    dailyFixedCost: 390,
    supportedCargo: ['standard', 'express', 'refrigerated'],
    requiredLevel: 2,
    description: 'Soğuk zincir gıda, süt ürünleri ve medikal ilaç taşımacılığı için çift rejimli kamyon.',
  },
  {
    modelId: 'heavy_truck_18t',
    name: 'Tuğra 2532 Kırkayak Kamyon',
    brand: 'BMC Profesyonel',
    category: 'Ağır Kamyon',
    capacityTons: 18.0,
    speedKmh: 80,
    fuelLPer100Km: 26,
    price: 245000,
    dailyFixedCost: 580,
    supportedCargo: ['standard', 'express'],
    requiredLevel: 2,
    description: 'Yüksek tonajlı sanayi ve perakende sevkiyatları için güçlü kırkayak kamyon.',
  },
  {
    modelId: 'semi_standard_26t',
    name: 'F-MAX 500 Çekici + Tenteli Dorse',
    brand: 'Ford Trucks & Tirsan',
    category: 'Çekici + Dorse',
    capacityTons: 26.0,
    speedKmh: 82,
    fuelLPer100Km: 31,
    price: 390000,
    dailyFixedCost: 850,
    supportedCargo: ['standard', 'express'],
    requiredLevel: 3,
    description: 'Ulusal uzun yol taşımacılığının bel kemiği. Yüksek tonaj ve düşük birim maliyet.',
  },
  {
    modelId: 'semi_reefer_24t',
    name: 'Actros 1848 + Frigorifik Dorse',
    brand: 'Mercedes-Benz & Krone',
    category: 'Frigorifik Tır',
    capacityTons: 24.0,
    speedKmh: 84,
    fuelLPer100Km: 33,
    price: 465000,
    dailyFixedCost: 980,
    supportedCargo: ['standard', 'express', 'refrigerated'],
    requiredLevel: 3,
    description: 'Antalya, Mersin ve büyükşehirler arası yüksek kârlı yaş meyve-sebze ve donuk gıda tırı.',
  },
  {
    modelId: 'semi_adr_28t',
    name: 'Scania R500 + ADR Kimya Tankeri',
    brand: 'Scania & OKT Trailer',
    category: 'ADR Tanker Tır',
    capacityTons: 28.0,
    speedKmh: 78,
    fuelLPer100Km: 34,
    price: 560000,
    dailyFixedCost: 1180,
    supportedCargo: ['adr'],
    requiredLevel: 3,
    description: 'Rafineri, akaryakıt ve petrokimya tesisleri arasında çok yüksek navlun getiren ADR tanker.',
  },
  {
    modelId: 'semi_heavy_45t',
    name: 'Volvo FH16 750 + 6 Aks Lowbed',
    brand: 'Volvo & Kässbohrer',
    category: 'Ağır Nakliye',
    capacityTons: 45.0,
    speedKmh: 72,
    fuelLPer100Km: 44,
    price: 780000,
    dailyFixedCost: 1550,
    supportedCargo: ['heavy', 'standard'],
    requiredLevel: 4,
    description: 'Rüzgar türbini, trafo, mermer blok ve iş makinelerini taşıyan dev proje nakliye aracı.',
  },
  {
    modelId: 'intermodal_train_65t',
    name: 'Anadolu Ekspres Konteyner Vagon Hattı',
    brand: 'TCDD Taşımacılık & Özel Лоjistik',
    category: 'İntermodal Tren',
    capacityTons: 65.0,
    speedKmh: 90,
    fuelLPer100Km: 24,
    price: 1250000,
    dailyFixedCost: 2200,
    supportedCargo: ['standard', 'refrigerated', 'adr', 'heavy'],
    requiredLevel: 5,
    description: 'Tek seferde 65 ton karma yükü çok düşük yakıt maliyetiyle taşıyan intermodal blok tren.',
  },
  {
    modelId: 'cargo_plane_40t',
    name: 'Anadolu Air Cargo B737-800BCF',
    brand: 'Boeing Freighter',
    category: 'Hava Kargo',
    capacityTons: 40.0,
    speedKmh: 340,
    fuelLPer100Km: 65,
    price: 2400000,
    dailyFixedCost: 4200,
    supportedCargo: ['standard', 'express', 'refrigerated', 'adr'],
    requiredLevel: 6,
    description: 'Türkiye’nin bir ucundan diğerine saatler içinde teslimat yapan hava kargo filosu.',
  },
];

// Şirket Ar-Ge ve Operasyon Yükseltmeleri
export const COMPANY_UPGRADES = [
  {
    id: 'eco_telematics',
    name: 'Filo Telemetri & Eco-Sürüş Sistemi',
    description: 'Tüm filoda yakıt tüketimini %12 azaltır ve GPS üzerinden anlık tüketim takibi sağlar.',
    cost: 75000,
    requiredLevel: 1,
    effectText: '-%12 Yakıt Tüketimi',
  },
  {
    id: 'fuel_tank_1',
    name: 'Merkez Toptan Akaryakıt Tankı (50.000 L)',
    description: 'Mazot fiyatlarının düştüğü günlerde ucuzdan mazot depolayıp filonuzu beslemenizi sağlar.',
    cost: 95000,
    requiredLevel: 2,
    effectText: '50.000 Litre Mazot Depolama',
  },
  {
    id: 'inhouse_workshop',
    name: 'Kendi Bakım & Onarım Atölyemiz',
    description: 'Araç bakım ve onarım maliyetlerini %35 düşürür, sefer sonrası otomatik hızlı bakım imkanı açar.',
    cost: 135000,
    requiredLevel: 2,
    effectText: '-%35 Bakım Maliyeti',
  },
  {
    id: 'cold_chain_iso',
    name: 'ISO 22000 Soğuk Zincir & İlaç Sertifikası',
    description: 'Soğuk zincir ve medikal taşımalarda müşterilerin ödediği navlun bedelini %15 artırır.',
    cost: 160000,
    requiredLevel: 2,
    effectText: '+%15 Frigorifik Navlun Geliri',
  },
  {
    id: 'adr_safety_unit',
    name: 'ADR Tehlikeli Madde Güvenlik Danışmanlığı',
    description: 'ADR ve Ağır Nakliye operasyonlarında denetim cezası riskini %70 düşürür ve navlunu %12 artırır.',
    cost: 220000,
    requiredLevel: 3,
    effectText: '+%12 ADR & Ağır Yük Geliri',
  },
  {
    id: 'ai_dispatcher',
    name: 'Yapay Zeka Rota & Yük Eşleştirme (Auto-Dispatch)',
    description: 'Boşta kalan araç ve şoförleri uygun şehirdeki en kârlı yüklere otomatik atama modunu açar.',
    cost: 290000,
    requiredLevel: 3,
    effectText: 'Otomatik Sevkiyat (Auto-Dispatch) Kilidi',
  },
];

// Rastgele isim havuzu (Şoförler ve Kurumsal Müşteriler için)
const FIRST_NAMES = [
  'Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'İsmail',
  'Osman', 'Yusuf', 'Murat', 'Ömer', 'Ramazan', 'Halil', 'Süleyman', 'Abdullah',
  'Mahmut', 'Salih', 'Kemal', 'पूरा', 'Serkan', 'Burak', 'Emre', 'Gökhan',
  'Sinan', 'Cengiz', 'Turgut', 'Orhan', 'Kadir', 'Levent', 'Ayşe', 'Zeynep', 'Elif',
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk',
  'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara',
  'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Korkmaz', 'Çakır', 'Erdoğan',
];

export const CARGO_COMPANIES = [
  { name: 'Anadolu Perakende Zinciri A.Ş.', type: 'standard', items: ['Market Ürünleri', 'Kuru Gıda Paleti', 'Temizlik Ürünleri'] },
  { name: 'Marmara Otomotiv Yan Sanayi', type: 'standard', items: ['Motor Parçaları', 'Şanzıman Kasaları', 'Jant & Lastik Paleti'] },
  { name: 'Ege Taze Tarım & Gıda', type: 'refrigerated', items: ['Dondurulmuş Gıda', 'Taze Süt Ürünleri', 'İhracat Sebze & Meyve'] },
  { name: 'Akdeniz Narenciye & Soğuk Hava', type: 'refrigerated', items: ['Soğuk Zincir Narenciye', 'Aşı & Medikal İlaç', 'Taze Balık & Deniz Ürünü'] },
  { name: 'HızlıKargo E-Ticaret Lojistik', type: 'express', items: ['E-Ticaret Kolileri', 'Acil Elektronik Sevkiyatı', 'Tekstil Kreasyon Ürünleri'] },
  { name: 'TÜPRAŞ & Petkim Endüstriyel', type: 'adr', items: ['Endüstriyel Çözücü (ADR)', 'Akaryakıt İkmali (ADR)', 'Sıvı Kimyasal Tanker'] },
  { name: 'Kalyon & Limak Altyapı A.Ş.', type: 'heavy', items: ['Rüzgar Türbini Kanadı', '40 Tonluk Ekskavatör', 'Yüksek Gerilim Trafosu'] },
  { name: 'Anadolu Mobilya & Beyaz Eşya', type: 'standard', items: ['Buzdolabı & Çamaşır Makinesi', 'Modüler Mobilya Paketi', 'Endüstriyel Mutfak'] },
];

export function generateDriver(idCounter, currentLevel = 1) {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)].replace('पूरा', 'kenan');
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const skill = Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + Math.floor(currentLevel / 2) + 1));
  const ecoBonus = skill * 3 + Math.floor(Math.random() * 5); // %3 - %20 yakıt tasarrufu
  const hasADR = currentLevel >= 2 && Math.random() > 0.45;
  const hasCold = currentLevel >= 2 || Math.random() > 0.4;
  const hasHeavy = currentLevel >= 3 && Math.random() > 0.5;

  const dailyWage = 320 + skill * 95 + (hasADR ? 80 : 0) + (hasHeavy ? 90 : 0);
  const hireFee = dailyWage * 5;

  return {
    id: `drv_${idCounter}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${first} ${last}`,
    skill, // 1..5 yıldız
    xp: 0,
    ecoBonus,
    fatigue: 0, // 0..100 (85 üstü dinlenmeli)
    morale: 90,
    dailyWage,
    hireFee,
    licenses: {
      src: true,
      cold: hasCold,
      adr: hasADR,
      heavy: hasHeavy,
    },
    status: 'idle', // 'idle' | 'driving' | 'resting'
    continuousDrivenHours: 0, // 4.5 saate ulaşınca 1 saat mola
    dailyDrivenHours: 0, // Günlük maks 9 saat
    weeklyDrivenHours: 0, // Haftalık maks 56 saat
    restingHoursLeft: 0,
    assignedVehicleId: null,
    tripsCompleted: Math.floor(Math.random() * 40) + skill * 15,
  };
}

// Spot yük üretici
export function generateFreightJob(idCounter, unlockedCities, companyLevel, currentDay, currentHour) {
  const cityPool = CITIES.filter((c) => unlockedCities.includes(c.id));
  const origin = cityPool[Math.floor(Math.random() * cityPool.length)] || CITIES[0];

  // Hedef şehir: %70 açık şehirlerden biri, %30 tüm Türkiye'den (oyuncuyu yeni şehir açmaya teşvik eder)
  let destPool = CITIES.filter((c) => c.id !== origin.id);
  if (Math.random() < 0.75 && cityPool.length > 1) {
    destPool = cityPool.filter((c) => c.id !== origin.id);
  }
  const destination = destPool[Math.floor(Math.random() * destPool.length)];
  const distanceKm = getDistanceKm(origin.id, destination.id);

  // Şirket seviyesine göre yük tipi seçimi
  const availableTypes = Object.values(CARGO_TYPES).filter((t) => t.minLevel <= companyLevel + 1);
  const chosenType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || CARGO_TYPES.standard;

  const companySamples = CARGO_COMPANIES.filter((c) => c.type === chosenType.id);
  const sample =
    companySamples[Math.floor(Math.random() * companySamples.length)] || CARGO_COMPANIES[0];
  const itemTitle = sample.items[Math.floor(Math.random() * sample.items.length)];

  // Tonaj belirleme
  let weightTons = 2.5;
  if (chosenType.id === 'express') {
    weightTons = +(1.5 + Math.random() * 6).toFixed(1);
  } else if (chosenType.id === 'heavy') {
    weightTons = +(24 + Math.random() * 19).toFixed(1);
  } else if (chosenType.id === 'adr') {
    weightTons = +(16 + Math.random() * 11).toFixed(1);
  } else if (companyLevel === 1) {
    weightTons = +(2.0 + Math.random() * 5.8).toFixed(1);
  } else if (companyLevel === 2) {
    weightTons = +(3.0 + Math.random() * 14.5).toFixed(1);
  } else {
    weightTons = +(4.5 + Math.random() * 21.0).toFixed(1);
  }

  // Navlun hesaplama (Baz ücret + km * tonaj * yük çarpanı)
  const basePerKm = 24 + weightTons * 1.85;
  const rawPayout = (1800 + distanceKm * basePerKm) * chosenType.rateMultiplier * (0.92 + Math.random() * 0.22);
  const payout = Math.round(rawPayout / 50) * 50;

  // Teslim süresi (saat)
  const estDriveHours = Math.ceil(distanceKm / 72);
  const deadlineHours = Math.max(8, Math.round(estDriveHours * (chosenType.id === 'express' ? 1.45 : 2.1) + 4));

  return {
    id: `job_${idCounter}_${Math.random().toString(36).slice(2, 6)}`,
    clientName: sample.name,
    title: itemTitle,
    cargoType: chosenType.id,
    originId: origin.id,
    destinationId: destination.id,
    distanceKm,
    weightTons,
    payout,
    penalty: Math.round(payout * 0.35),
    deadlineHours,
    createdTotalHours: currentDay * 24 + currentHour,
    expiresTotalHours: currentDay * 24 + currentHour + 18,
    urgent: chosenType.id === 'express' || Math.random() < 0.25,
  };
}

// Kurumsal Uzun Vadeli Sözleşme (İhale) üretici
export function generateContractOffer(idCounter, unlockedCities, companyLevel) {
  const cityPool = CITIES.filter((c) => unlockedCities.includes(c.id));
  const origin = cityPool[Math.floor(Math.random() * cityPool.length)] || CITIES[0];
  const destPool = cityPool.filter((c) => c.id !== origin.id);
  const destination =
    destPool[Math.floor(Math.random() * destPool.length)] ||
    CITIES.find((c) => c.id !== origin.id);

  const distanceKm = getDistanceKm(origin.id, destination.id);
  const cargoPool = ['standard', 'express', 'refrigerated', 'adr'].filter(
    (k) => CARGO_TYPES[k].minLevel <= companyLevel
  );
  const cargoType = cargoPool[Math.floor(Math.random() * cargoPool.length)] || 'standard';
  const totalTonsRequired = Math.round((companyLevel * 22 + 25 + Math.random() * 35) / 5) * 5;
  const daysToComplete = Math.max(5, Math.min(12, Math.round(totalTonsRequired / 12) + 4));

  const ratePerTonKm = 3.2 * CARGO_TYPES[cargoType].rateMultiplier;
  const totalReward = Math.round((totalTonsRequired * distanceKm * ratePerTonKm + 18000) / 500) * 500;
  const completionBonus = Math.round(totalReward * 0.25);

  const client = CARGO_COMPANIES[Math.floor(Math.random() * CARGO_COMPANIES.length)];

  return {
    id: `cnt_${idCounter}_${Math.random().toString(36).slice(2, 6)}`,
    clientName: client.name,
    title: `${origin.name} → ${destination.name} Düzenli Tedarik İhalesi`,
    cargoType,
    originId: origin.id,
    destinationId: destination.id,
    distanceKm,
    totalTonsRequired,
    deliveredTons: 0,
    daysLimit: daysToComplete,
    daysRemaining: daysToComplete,
    rewardPerTon: Math.round(totalReward / totalTonsRequired),
    completionBonus,
    penalty: Math.round(completionBonus * 0.8),
    requiredReputation: Math.max(10, (companyLevel - 1) * 18),
  };
}

// İkinci El Araç Pazar Yeri üretici
export function generateUsedVehicles(companyLevel) {
  const eligible = VEHICLE_CATALOG.filter((v) => v.requiredLevel <= companyLevel + 1);
  const list = [];
  for (let i = 0; i < 4; i++) {
    const template = eligible[Math.floor(Math.random() * eligible.length)];
    const condition = Math.floor(58 + Math.random() * 32); // %58 - %90 kondisyon
    const mileageKm = Math.floor((100 - condition) * 6800 + Math.random() * 45000);
    const discountFactor = 0.42 + (condition / 100) * 0.38;
    const usedPrice = Math.round((template.price * discountFactor) / 500) * 500;

    list.push({
      usedId: `used_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
      ...template,
      condition,
      mileageKm,
      usedPrice,
    });
  }
  return list;
}

// Türkiye'nin 7 Coğrafi Lojistik Bölgesi (Kayıt & Şirket Kuruluş Seçimi İçin)
export const REGIONS = [
  {
    id: 'Marmara',
    name: 'Marmara Bölgesi',
    subtitle: 'Sanayi, Liman & E-Ticaret Üssü',
    description:
      'Türkiye ticaret hacminin kalbi. Otomotiv, petrokimya, perakende ve uluslararası liman bağlantılarıyla çok yoğun yük trafiği sunar.',
    perkTitle: '+%10 Standart & Ekspres Navlun Geliri',
    perkCode: 'marmara_trade',
    color: 'from-sky-500 to-blue-700',
    borderColor: 'border-sky-500/40',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    cities: ['istanbul', 'kocaeli', 'bursa', 'tekirdag'],
    defaultHq: 'istanbul',
    startingUnlocked: ['istanbul', 'kocaeli', 'bursa', 'tekirdag'],
    bonusCash: 0,
    bonusFuelLiters: 2500,
  },
  {
    id: 'İç Anadolu',
    name: 'İç Anadolu Bölgesi',
    subtitle: 'Ulusal Kavşak & Dağıtım Merkezi',
    description:
      'Türkiye’nin tam merkezinde yer alarak tüm bölgelere en kısa intikal mesafesini sunar. Otoyol ve aktarma maliyetleri düşüktür.',
    perkTitle: '-%25 Otoyol Geçiş Gideri & Merkez Kavşak Avantajı',
    perkCode: 'central_hub',
    color: 'from-amber-500 to-orange-700',
    borderColor: 'border-amber-500/40',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    cities: ['ankara', 'konya', 'kayseri', 'eskisehir', 'sivas'],
    defaultHq: 'ankara',
    startingUnlocked: ['ankara', 'eskisehir', 'konya', 'kayseri'],
    bonusCash: 10000,
    bonusFuelLiters: 3000,
  },
  {
    id: 'Ege',
    name: 'Ege Bölgesi',
    subtitle: 'İhracat Limanı, Tekstil & Tarım Sanayi',
    description:
      'İzmir Limanı üzerinden Avrupa ihracatı, Manisa elektronik/beyaz eşya sanayisi ve Denizli tekstil/mermer yükleriyle dengeli büyüme sağlar.',
    perkTitle: '+%10 İhracat & Sanayi Navlun Bonusu + Başlangıç Antrepo İndirimi',
    perkCode: 'aegean_port',
    color: 'from-cyan-500 to-teal-700',
    borderColor: 'border-cyan-500/40',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    cities: ['izmir', 'manisa', 'denizli'],
    defaultHq: 'izmir',
    startingUnlocked: ['izmir', 'manisa', 'denizli', 'bursa'],
    bonusCash: 10000,
    bonusFuelLiters: 2500,
  },
  {
    id: 'Akdeniz',
    name: 'Akdeniz Bölgesi',
    subtitle: 'Soğuk Zincir & Konteyner Liman Koridoru',
    description:
      'Mersin Uluslararası Limanı, Antalya yaş meyve-sebze soğuk zinciri ve Adana kimya sanayisiyle yüksek kâr marjlı yükler üretir.',
    perkTitle: '+%15 Soğuk Zincir (Frigorifik) Navlun Bonusu',
    perkCode: 'med_coldchain',
    color: 'from-emerald-500 to-green-700',
    borderColor: 'border-emerald-500/40',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    cities: ['mersin', 'antalya', 'adana'],
    defaultHq: 'mersin',
    startingUnlocked: ['mersin', 'adana', 'antalya', 'konya'],
    bonusCash: 12000,
    bonusFuelLiters: 2500,
  },
  {
    id: 'Güneydoğu',
    name: 'Güneydoğu Anadolu Bölgesi',
    subtitle: 'Üretim Üssü & Ortadoğu Transit Yolu',
    description:
      'Gaziantep sanayi havzası, Şanlıurfa ve Diyarbakır tarım/maden sevkiyatlarıyla uzun mesafe yüksek tonajlı taşımacılıkta öne çıkar.',
    perkTitle: '+5.000L Bedava Mazot Stoğu & Toptan Yakıtta Ekstra İndirim',
    perkCode: 'southeast_fuel',
    color: 'from-rose-500 to-red-700',
    borderColor: 'border-rose-500/40',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    cities: ['gaziantep', 'sanliurfa', 'diyarbakir'],
    defaultHq: 'gaziantep',
    startingUnlocked: ['gaziantep', 'sanliurfa', 'diyarbakir', 'adana'],
    bonusCash: 15000,
    bonusFuelLiters: 7500,
  },
  {
    id: 'Karadeniz',
    name: 'Karadeniz Bölgesi',
    subtitle: 'Kuzey Deniz Ticareti & Uzman Kaptanlar',
    description:
      'Samsun ve Trabzon limanlarından iç bölgelere uzanan ticaret koridoru. Zorlu yol koşulları sayesinde şoförleriniz çok daha yetenekli başlar.',
    perkTitle: 'Uzman Şoför Kadrosu (+%15 Yakıt Tasarrufu & Yüksek Beceri)',
    perkCode: 'blacksea_drivers',
    color: 'from-indigo-500 to-violet-700',
    borderColor: 'border-indigo-500/40',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    cities: ['samsun', 'trabzon'],
    defaultHq: 'samsun',
    startingUnlocked: ['samsun', 'trabzon', 'sivas', 'ankara'],
    bonusCash: 18000,
    bonusFuelLiters: 3500,
  },
  {
    id: 'Doğu Anadolu',
    name: 'Doğu Anadolu Bölgesi',
    subtitle: 'Kafkasya & İran Transit Ticaret Kapısı',
    description:
      'Erzurum ve Van üzerinden uluslararası sınır ticareti ve uzun yol ağır taşımacılığı. Devlet bölgesel yatırım teşviği ile yüksek nakit desteği sunar.',
    perkTitle: '+₺35.000 Bölgesel Yatırım Teşvik Hibesi & %20 Ucuz Şube Açılışı',
    perkCode: 'east_grant',
    color: 'from-purple-500 to-fuchsia-700',
    borderColor: 'border-purple-500/40',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    cities: ['erzurum', 'van'],
    defaultHq: 'erzurum',
    startingUnlocked: ['erzurum', 'van', 'diyarbakir', 'sivas'],
    bonusCash: 35000,
    bonusFuelLiters: 4000,
  },
];

// Başlangıç Filo Paketleri (Kayıt Esnasında Seçilebilir)
export const STARTER_PACKAGES = [
  {
    id: 'balanced',
    name: 'Dengeli Lojistik Paketi (Önerilen)',
    subtitle: '1x Panelvan (3.5t) + 1x Kamyonet (8t)',
    description:
      'Hem acil ekspres kolileri hem de orta tonajlı palet yüklerini aynı anda taşıyabilen esnek başlangıç filosu.',
    startingCash: 145000,
    vehicles: ['van_transit', 'light_truck_npr'],
  },
  {
    id: 'express_fleet',
    name: 'Hızlı Kargo & Ekspres Paketi',
    subtitle: '3x Anadolu V-350 Panelvan (3.5t)',
    description:
      'Üç ayrı araç ve üç şoförle aynı anda farklı rotalara hızlı ekspres teslimat yaparak sürümden kazandıran filo.',
    startingCash: 130000,
    vehicles: ['van_transit', 'van_transit', 'van_transit'],
  },
  {
    id: 'heavy_starter',
    name: 'Ağır Nakliyat & Tonaj Paketi',
    subtitle: '1x Tuğra Kırkayak Kamyon (18 Ton)',
    description:
      'Doğrudan yüksek tonajlı sanayi yüklerine odaklanan güçlü 18 tonluk kamyon ile yüksek tek sefer gelirleri.',
    startingCash: 95000,
    vehicles: ['heavy_truck_18t'],
  },
];

