// Gerçek Koordinat Projeksiyonlu (25.6°E - 44.8°E, 35.8°N - 42.1°N -> 1000x500 SVG)
// Detaylı Türkiye Coğrafi Harita Poligonları, Yarımadalar, Körfezler, Göller ve Bölge Sınırları

// 1. TRAKYA (Avrupa Yakası - Edirne, Kırklareli, Tekirdağ, Gelibolu, İstanbul Avrupa)
export const THRACE_PATH =
  'M 86,65 ' + // Edirne / Kapıkule Bulgaristan sınırı
  'L 112,56 L 145,58 L 166,72 ' + // Kırklareli - İğneada Karadeniz kıyısı
  'L 182,92 L 204,104 L 210,112 ' + // Çatalca - İstanbul Boğazı Avrupa girişi
  'L 206,120 L 185,123 L 162,120 L 135,118 ' + // Marmara Ereğlisi - Tekirdağ kıyısı
  'L 114,132 L 96,152 L 76,172 ' + // Şarköy - Gelibolu Yarımadası (Çanakkale Boğazı)
  'L 68,168 L 82,148 L 95,136 ' + // Saros Körfezi iç kıyısı
  'L 72,135 L 62,126 L 74,104 L 82,84 Z'; // Enez - Meriç Nehri Yunanistan sınırı

// 2. ANADOLU (Asya Yakası - Gerçek Yarımadalar, Körfezler, Karadeniz, Ege, Akdeniz ve Doğu Sınırları)
export const ANATOLIA_PATH =
  // İstanbul Anadolu Yakası & Kocaeli Yarımadası
  'M 215,107 L 236,105 L 265,108 ' +
  // Sakarya - Batı Karadeniz (Zonguldak, Bartın, Cide)
  'L 295,112 L 325,92 L 358,74 L 395,60 L 435,52 ' +
  // Sinop İnceburun Yarımadası (Türkiye'nin en kuzey ucu)
  'L 472,44 L 498,40 L 516,54 ' +
  // Samsun Bafra & Çarşamba Deltaları
  'L 532,74 L 548,88 L 568,82 L 585,94 ' +
  // Ordu - Giresun - Trabzon - Rize - Artvin / Sarp Sınır Kapısı
  'L 618,98 L 652,102 L 685,106 L 718,108 L 755,96 L 792,82 L 824,74 ' +
  // Gürcistan & Ermenistan Sınırı (Ardahan, Kars, Iğdır)
  'L 855,82 L 878,105 L 892,135 L 912,168 L 938,184 ' +
  // Nahçıvan & İran Sınırı (Ağrı Doğubayazıt, Van, Hakkari Yüksekova/Şemdinli)
  'L 925,205 L 918,238 L 928,275 L 938,312 L 946,338 L 922,352 ' +
  // Irak Sınırı (Şırnak, Cizre, Habur)
  'L 882,354 L 840,350 L 802,358 ' +
  // Suriye Sınırı (Mardin, Nusaybin, Ceylanpınar, Akçakale, Karkamış, Kilis)
  'L 762,368 L 712,374 L 668,382 L 622,384 L 582,386 ' +
  // Hatay & Amik Ovası & Samandağ
  'L 568,408 L 562,436 L 544,442 L 534,424 ' +
  // İskenderun Körfezi & Çukurova Deltası (Adana Karataş - Mersin)
  'L 546,404 L 538,390 L 518,398 L 496,404 L 472,394 ' +
  // Taşeli Platosu (Silifke, Anamur Burnu - Akdeniz'in en güney ucu, Gazipaşa, Alanya)
  'L 445,412 L 412,428 L 382,424 L 356,404 L 332,392 ' +
  // Antalya Körfezi
  'L 306,386 L 292,392 ' +
  // Teke Yarımadası (Kemer, Finike, Kaş, Kalkan, Fethiye Körfezi)
  'L 286,416 L 265,432 L 236,428 L 214,410 ' +
  // Muğla Kıyıları (Göcek, Marmaris, Datça Yarımadası, Gökova Körfezi, Bodrum Yarımadası)
  'L 192,412 L 162,418 L 142,414 L 166,398 L 146,392 L 128,394 L 126,380 L 148,372 ' +
  // Aydın Didim / Kuşadası Körfezi
  'L 138,352 L 126,332 ' +
  // İzmir & Çeşme / Karaburun Yarımadası & İzmir Körfezi
  'L 96,318 L 82,306 L 88,286 L 104,284 L 116,296 L 124,282 ' +
  // Foça - Çandarlı Körfezi - Ayvalık - Edremit Körfezi
  'L 112,262 L 118,242 L 106,222 L 122,204 ' +
  // Biga Yarımadası (Baba Burnu - Assos - Çanakkale Boğazı Anadolu Kıyısı)
  'L 76,208 L 68,192 L 82,176 L 104,162 ' +
  // Marmara Denizi Güney Kıyısı (Karabiga, Bandırma, Kapıdağ Yarımadası, Mudanya, Gemlik Körfezi)
  'L 132,164 L 145,150 L 160,152 L 154,164 L 185,168 L 218,166 L 228,158 ' +
  // Yalova - İzmit Körfezi - Gebze - Anadolu Kavağı
  'L 214,148 L 245,142 L 264,136 L 235,128 L 215,120 Z';

// 3. KIBRIS ADASI (Güney Akdeniz Referans Silüeti)
export const CYPRUS_PATH =
  'M 412,472 L 438,464 L 468,462 L 495,450 L 476,468 L 458,484 L 422,488 L 406,478 Z';

// 4. BÜYÜK GÖLLER (Van Gölü, Tuz Gölü, Beyşehir, Eğirdir, İznik)
export const LAKES = [
  {
    id: 'van_golu',
    name: 'Van Gölü',
    path: 'M 838,278 L 858,262 L 882,256 L 886,272 L 870,290 L 842,292 Z',
  },
  {
    id: 'tuz_golu',
    name: 'Tuz Gölü',
    path: 'M 412,242 L 428,238 L 436,266 L 422,282 L 410,268 Z',
  },
  {
    id: 'beysehir',
    name: 'Beyşehir',
    path: 'M 326,322 L 338,318 L 342,336 L 330,340 Z',
  },
  {
    id: 'egirdir',
    name: 'Eğirdir',
    path: 'M 294,310 L 302,306 L 304,324 L 294,326 Z',
  },
  {
    id: 'iznik',
    name: 'İznik',
    path: 'M 232,152 L 250,150 L 252,158 L 232,158 Z',
  },
];

// 5. 7 COĞRAFİ BÖLGE İÇ SINIR ÇİZGİLERİ (Harita Üzerinde Bölge Ayrımı)
export const REGION_BORDERS = [
  // Marmara - Ege & İç Anadolu sınırı
  'M 106,222 Q 180,220 250,200 Q 280,175 295,112',
  // Ege - İç Anadolu & Akdeniz sınırı
  'M 250,200 Q 265,275 260,345 L 214,410',
  // Akdeniz - İç Anadolu & Güneydoğu sınırı
  'M 260,345 Q 360,355 460,345 Q 535,330 585,335 L 582,386',
  // Karadeniz - İç Anadolu & Doğu Anadolu sınırı
  'M 295,112 Q 430,145 565,155 Q 690,155 855,82',
  // İç Anadolu - Doğu Anadolu sınırı
  'M 565,155 Q 615,245 535,330',
  // Doğu Anadolu - Güneydoğu Anadolu sınırı
  'M 585,335 Q 710,315 840,350',
];

// 6. ANA OTOYOL KORİDOR ETİKETLERİ (O-4, O-5, O-21, D-100, D-400)
export const HIGHWAY_SHIELDS = [
  { code: 'O-4', x: 315, y: 152, color: '#10b981' }, // İstanbul - Ankara Otoyolu
  { code: 'O-5', x: 175, y: 230, color: '#10b981' }, // İstanbul - Bursa - İzmir Otoyolu
  { code: 'O-21', x: 435, y: 285, color: '#10b981' }, // Ankara - Niğde - Tarsus Otoyolu
  { code: 'O-52', x: 575, y: 376, color: '#10b981' }, // Adana - Gaziantep - Şanlıurfa Otoyolu
  { code: 'D-100', x: 645, y: 165, color: '#38bdf8' }, // Kuzey Hattı
  { code: 'D-300', x: 310, y: 275, color: '#38bdf8' }, // İzmir - Konya - Kayseri - Van Hattı
  { code: 'D-400', x: 390, y: 392, color: '#38bdf8' }, // Akdeniz Sahil & Güney Hattı
];
