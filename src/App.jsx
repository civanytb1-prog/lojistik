import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CITIES,
  COMPANY_TIERS,
  CARGO_TYPES,
  VEHICLE_CATALOG,
  COMPANY_UPGRADES,
  REGIONS,
  STARTER_PACKAGES,
  WEATHER_TYPES,
  generateRegionalWeather,
  WAREHOUSE_COMMODITIES,
  generateCommodityPrices,
  INITIAL_RIVAL_COMPANIES,
  generateDriver,
  generateFreightJob,
  generateContractOffer,
  generateUsedVehicles,
  getDistanceKm,
} from './data/gameData';
import TurkeyMap from './components/TurkeyMap';
import DispatchModal from './components/DispatchModal';
import AuthOnboarding from './components/AuthOnboarding';
import AdminPanel from './components/AdminPanel';
import VehicleIcon, {
  getVehicleTypeShortLabel,
  CargoTypeIcon,
  checkJobFleetCompatibility,
} from './components/VehicleIcon';
import {
  DriverPixarAvatar,
  VehiclePixarCardBanner,
} from './components/PixarVisuals';
import {
  Truck,
  Map as MapIcon,
  Package,
  FileSpreadsheet,
  Users,
  Building2,
  Landmark,
  Play,
  Pause,
  FastForward,
  Award,
  Fuel,
  Wrench,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Bot,
  Sparkles,
  RotateCcw,
  Navigation,
  Clock,
  Wallet,
  Star,
  ArrowRight,
  Snowflake,
  Flame,
  Zap,
  UserCheck,
  LogOut,
  Lock,
  Filter,
  Trophy,
  CloudRain,
  Boxes,
  Crown,
} from 'lucide-react';

const ACCOUNTS_STORAGE_KEY = 'anadolu_lojistik_accounts_v2';
const ACTIVE_USER_KEY = 'anadolu_lojistik_active_user_v2';

// Başlangıç plaka kodu haritası
const CITY_PLATES = {
  istanbul: '34',
  tekirdag: '59',
  kocaeli: '41',
  bursa: '16',
  eskisehir: '26',
  izmir: '35',
  manisa: '45',
  denizli: '20',
  antalya: '07',
  ankara: '06',
  konya: '42',
  kayseri: '38',
  mersin: '33',
  adana: '01',
  gaziantep: '27',
  sanliurfa: '63',
  diyarbakir: '21',
  samsun: '55',
  sivas: '58',
  trabzon: '61',
  erzurum: '25',
  van: '65',
};

function makePlate(cityId, num, customLetters) {
  const code = CITY_PLATES[cityId] || '34';
  const letters =
    customLetters || ['AL', 'TY', 'KR', 'LG', 'TR', 'AN', 'EX'][num % 7];
  const digits = String(100 + ((num * 37) % 899));
  return `${code} ${letters} ${digits}`;
}

function createInitialState({
  username = 'oyuncu',
  ceoName = 'Kurucu CEO',
  companyName = 'Anadolu Trans Lojistik A.Ş.',
  plateLetters = 'AL',
  regionId = 'Marmara',
  hqCityId = 'istanbul',
  starterPackageId = 'balanced',
} = {}) {
  const regionObj = REGIONS.find((r) => r.id === regionId) || REGIONS[0];
  const pkgObj =
    STARTER_PACKAGES.find((p) => p.id === starterPackageId) ||
    STARTER_PACKAGES[0];

  // Seçilen bölgenin başlangıç açık şehirleri + genel merkez şehri
  const unlockedSet = new Set([hqCityId, ...regionObj.startingUnlocked]);
  const unlockedCities = Array.from(unlockedSet);

  const isBlackSea = regionObj.perkCode === 'blacksea_drivers';

  // Paketteki araç sayısına göre başlangıç şoförleri oluştur
  const initialDrivers = pkgObj.vehicles.map((_, idx) => {
    const baseDrv = generateDriver(idx + 1, 1);
    return {
      ...baseDrv,
      name:
        idx === 0
          ? 'Mustafa Çelik'
          : idx === 1
          ? 'Serkan Demir'
          : 'Gökhan Kaya',
      skill: isBlackSea ? 4 : idx === 0 ? 3 : 2,
      ecoBonus: isBlackSea ? 16 : idx === 0 ? 10 : 8,
      licenses: {
        src: true,
        cold: idx === 0 || regionObj.perkCode === 'med_coldchain',
        adr: false,
        heavy: false,
      },
    };
  });

  const vehicles = pkgObj.vehicles.map((modelId, idx) => {
    const tpl =
      VEHICLE_CATALOG.find((v) => v.modelId === modelId) || VEHICLE_CATALOG[0];
    const vehId = `veh_init_${idx + 1}`;
    if (initialDrivers[idx]) {
      initialDrivers[idx].assignedVehicleId = vehId;
    }
    return {
      id: vehId,
      ...tpl,
      plate: makePlate(hqCityId, idx + 1, plateLetters),
      condition: 100,
      mileageKm: idx * 1400,
      locationId: hqCityId,
      status: 'idle',
      insured: true,
      assignedDriverId: initialDrivers[idx]?.id || null,
    };
  });

  const jobs = [];
  for (let i = 0; i < 14; i++) {
    jobs.push(generateFreightJob(i + 1, unlockedCities, 1, 1, 8));
  }
  // En az 4 işin doğrudan oyuncunun seçtiği merkez şehirden çıkmasını garanti edelim
  for (let i = 0; i < 4; i++) {
    jobs[i].originId = hqCityId;
    const otherCity =
      unlockedCities.find((c) => c !== hqCityId) || unlockedCities[0];
    jobs[i].destinationId = otherCity;
    jobs[i].distanceKm = getDistanceKm(hqCityId, otherCity);
    jobs[i].weightTons = +(2.0 + i * 1.4).toFixed(1);
    jobs[i].cargoType = i === 3 ? 'express' : 'standard';
  }

  const candidateDrivers = [
    generateDriver(10, 1),
    generateDriver(11, 1),
    generateDriver(12, 2),
    generateDriver(13, 2),
  ];

  const contractOffers = [
    generateContractOffer(1, unlockedCities, 1),
    generateContractOffer(2, unlockedCities, 1),
    generateContractOffer(3, unlockedCities, 2),
  ];

  const startingCash = pkgObj.startingCash + (regionObj.bonusCash || 0);
  const startingFuel = regionObj.bonusFuelLiters || 2500;
  const hqCityName = CITIES.find((c) => c.id === hqCityId)?.name || hqCityId;

  return {
    username,
    ceoName,
    companyName,
    plateLetters,
    regionId: regionObj.id,
    regionPerkCode: regionObj.perkCode,
    regionPerkTitle: regionObj.perkTitle,
    hqCityId,
    cash: startingCash,
    xp: 120,
    reputation: 64,
    day: 1,
    hour: 8,
    minute: 0,
    fuelPrice: 42.5,
    fuelTankLiters: startingFuel,
    unlockedCities,
    depots: {
      [hqCityId]: { level: 1, capacityTons: 150, dailyIncome: 1350 },
    },
    regionalWeather: generateRegionalWeather(),
    warehouseInventory: {
      food_grain: 10,
      auto_parts: 0,
      textile_carpet: 0,
      cold_medical: 0,
      electronics: 0,
    },
    commodityPrices: generateCommodityPrices(),
    rivals: INITIAL_RIVAL_COMPANIES,
    upgrades: [],
    vehicles,
    usedVehicles: generateUsedVehicles(1),
    drivers: initialDrivers,
    candidateDrivers,
    freightJobs: jobs,
    contractOffers,
    activeContracts: [],
    activeTrips: [],
    loans: [],
    ledger: [
      {
        id: 'led_init',
        day: 1,
        title: `${companyName} Kuruluş Sermayesi (${regionObj.name})`,
        amount: startingCash,
        type: 'income',
      },
    ],
    logs: [
      {
        id: 'log_1',
        time: 'Gün 1 • 08:00',
        type: 'success',
        text: `🎉 Sayın ${ceoName}, ${companyName} şirketi ${regionObj.name} - ${hqCityName} merkezinde kuruldu! Bölge Avantajı: ${regionObj.perkTitle}.`,
      },
    ],
    stats: {
      totalDeliveries: 0,
      totalTonsMoved: 0,
      totalKmDriven: 0,
      totalRevenue: 0,
      totalExpenses: 0,
    },
    autoDispatch: false,
    autoMaintain: true,
  };
}

// Varsayılan Kurucu Süper Yönetici (Admin) Hesabı Oluşturucu
function createDefaultAdminAccount() {
  const baseState = createInitialState({
    username: 'admin',
    ceoName: 'Civan (Kurucu Yönetici)',
    companyName: 'Anadolu Lojistik Yönetim Kurulu A.Ş.',
    plateLetters: 'ADM',
    regionId: 'Marmara',
    hqCityId: 'istanbul',
    starterPackageId: 'balanced',
  });

  const adminGameState = {
    ...baseState,
    isAdmin: true,
    cash: 2500000,
    xp: 2200,
    reputation: 98,
    fuelTankLiters: 15000,
  };

  return {
    username: 'admin',
    ceoName: 'Civan (Kurucu Yönetici)',
    password: 'admin123',
    companyName: 'Anadolu Lojistik Yönetim Kurulu A.Ş.',
    regionId: 'Marmara',
    hqCityId: 'istanbul',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    gameState: adminGameState,
  };
}

export default function App() {
  const [accounts, setAccounts] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) list = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Eğer 'admin' yönetici hesabı listede yoksa otomatik oluştur
    if (!list.some((a) => a.username.toLowerCase() === 'admin')) {
      const adminAcc = createDefaultAdminAccount();
      list = [adminAcc, ...list];
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        // ignore
      }
    } else {
      list = list.map((a) =>
        a.username.toLowerCase() === 'admin'
          ? {
              ...a,
              isAdmin: true,
              gameState: { ...(a.gameState || {}), isAdmin: true },
            }
          : a
      );
    }
    return list;
  });

  const [activeUsername, setActiveUsername] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_USER_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const [game, setGame] = useState(() => {
    try {
      const savedAccounts = JSON.parse(
        localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]'
      );
      const actUser = localStorage.getItem(ACTIVE_USER_KEY);
      if (actUser) {
        const found = savedAccounts.find((a) => a.username === actUser);
        if (found?.gameState) return found.gameState;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  // speed: 0=Duraklat, 1=Gerçekçi (1 Oyun Saati = 1 Gerçek Dk -> 1sn'de 1dk), 5=5x, 15=15x, 60=60x
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('command'); // command | market | contracts | fleet | hr | network | finance
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [dispatchTarget, setDispatchTarget] = useState(null); // { job } veya { contract } veya { backhaulTrip }

  // Filtreler (Yük Borsası)
  const [cargoFilter, setCargoFilter] = useState('all');
  const [onlyCompatibleJobs, setOnlyCompatibleJobs] = useState(false);

  const counterRef = useRef(500);
  const nextId = () => {
    counterRef.current += 1;
    return counterRef.current;
  };

  // Aktif oyuncunun oyun durumunu hesap listesine otomatik kaydet
  useEffect(() => {
    if (!game || !activeUsername) return;
    setAccounts((prev) => {
      const updated = prev.map((acc) =>
        acc.username === activeUsername ? { ...acc, gameState: game } : acc
      );
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore quota error
      }
      return updated;
    });
  }, [game, activeUsername]);

  // Yeni Oyuncu Kaydı ve Şirket Kurulumu
  const handleRegisterAccount = (formData) => {
    const newGameState = createInitialState(formData);
    const newAccount = {
      username: formData.username,
      ceoName: formData.ceoName,
      password: formData.password,
      companyName: formData.companyName,
      regionId: formData.regionId,
      hqCityId: formData.hqCityId,
      createdAt: new Date().toISOString(),
      gameState: newGameState,
    };

    const updatedAccounts = [newAccount, ...accounts];
    setAccounts(updatedAccounts);
    setActiveUsername(newAccount.username);
    setGame(newGameState);
    setSelectedCityId(null);
    setShowAuthModal(false);

    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
      localStorage.setItem(ACTIVE_USER_KEY, newAccount.username);
    } catch (e) {
      // ignore
    }
  };

  // Mevcut Oyuncu Hesabına Giriş
  const handleLoginAccount = (username) => {
    const found = accounts.find((a) => a.username === username);
    if (!found) return;
    setActiveUsername(found.username);
    setGame({
      ...found.gameState,
      isAdmin: Boolean(found.isAdmin || found.gameState?.isAdmin),
    });
    setSelectedCityId(null);
    setShowAuthModal(false);
    try {
      localStorage.setItem(ACTIVE_USER_KEY, found.username);
    } catch (e) {
      // ignore
    }
  };

  // SÜPER YÖNETİCİ (ADMIN) KOMUT İŞLEYİCİSİ (Herhangi Bir Oyuncuya Para, Araç, XP, Hediye Gönderme)
  const handleAdminAction = (targetUsername, actionType, payload) => {
    const applyToGameState = (g) => {
      if (!g) return g;
      const timeStr = `Gün ${g.day} • ${String(g.hour).padStart(2, '0')}:${String(
        g.minute || 0
      ).padStart(2, '0')}`;
      const giftNote = payload.giftMessage || 'Yönetici Desteği';

      switch (actionType) {
        case 'GRANT_CASH': {
          const amt = Number(payload.amount) || 0;
          return {
            ...g,
            cash: (g.cash || 0) + amt,
            ledger: [
              {
                id: `led_adm_${Date.now()}`,
                day: g.day,
                title: `👑 [ADMIN HİBESİ] ${giftNote}`,
                amount: amt,
                type: 'income',
              },
              ...(g.ledger || []).slice(0, 59),
            ],
            logs: [
              {
                id: `log_adm_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `🎁 [YÖNETİCİ HEDİYESİ] ${giftNote}: Kasanıza +₺${amt.toLocaleString(
                  'tr-TR'
                )} nakit para eklendi!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'GRANT_XP': {
          const addXp = Number(payload.xp) || 1000;
          return {
            ...g,
            xp: (g.xp || 0) + addXp,
            logs: [
              {
                id: `log_adm_xp_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `👑 [YÖNETİCİ HEDİYESİ] Şirketinize +${addXp.toLocaleString(
                  'tr-TR'
                )} XP tecrübe puanı tanımlandı!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'MAX_REPUTATION': {
          return {
            ...g,
            reputation: 100,
            loans: [],
            logs: [
              {
                id: `log_adm_rep_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `👑 [YÖNETİCİ HEDİYESİ] Şirket itibarınız %100'e çıkarıldı ve tüm banka kredi borçlarınız kapatıldı!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'GRANT_FUEL': {
          const liters = Number(payload.liters) || 25000;
          return {
            ...g,
            fuelTankLiters: (g.fuelTankLiters || 0) + liters,
            logs: [
              {
                id: `log_adm_fuel_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `⛽ [YÖNETİCİ HEDİYESİ] Şirket yakıt tankınıza +${liters.toLocaleString(
                  'tr-TR'
                )} Litre mazot hediye edildi!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'UNLOCK_ALL_CITIES': {
          const allCityIds = CITIES.map((c) => c.id);
          const allUpgIds = COMPANY_UPGRADES.map((u) => u.id);
          return {
            ...g,
            unlockedCities: allCityIds,
            upgrades: allUpgIds,
            logs: [
              {
                id: `log_adm_cities_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `🗺️ [YÖNETİCİ HEDİYESİ] Türkiye'deki 22 il şubesinin tamamı ve tüm Ar-Ge teknolojileri şirketiniz için açıldı!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'GRANT_ELITE_DRIVER': {
          const eliteDrv = {
            ...generateDriver(Date.now() % 1000, 5),
            name: 'Kaptan Demirhan (5★ Elit)',
            skill: 5,
            ecoBonus: 22,
            fatigue: 0,
            dailyDrivenHours: 0,
            weeklyDrivenHours: 0,
            licenses: { src: true, cold: true, adr: true, heavy: true },
            status: 'idle',
          };
          return {
            ...g,
            drivers: [eliteDrv, ...(g.drivers || [])],
            logs: [
              {
                id: `log_adm_drv_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `👨‍✈️ [YÖNETİCİ HEDİYESİ] Tüm sertifikalara sahip 5★ Efsanevi Kaptan Şoför kadronuza katıldı!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        case 'GRANT_VEHICLE': {
          const model = payload.model || VEHICLE_CATALOG[4];
          const giftedVeh = {
            id: `veh_gift_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            ...model,
            plate: makePlate(
              g.hqCityId || 'istanbul',
              (g.vehicles?.length || 0) + 1,
              g.plateLetters || 'ADM'
            ),
            condition: 100,
            mileageKm: 0,
            locationId: g.hqCityId || 'istanbul',
            status: 'idle',
            insured: true,
            assignedDriverId: null,
          };
          return {
            ...g,
            vehicles: [giftedVeh, ...(g.vehicles || [])],
            logs: [
              {
                id: `log_adm_veh_${Date.now()}`,
                time: timeStr,
                type: 'success',
                text: `🚚 [YÖNETİCİ HEDİYESİ] Filonuza 0 km ${model.name} (${giftedVeh.plate}) hediye edildi!`,
              },
              ...(g.logs || []).slice(0, 49),
            ],
          };
        }

        default:
          return g;
      }
    };

    if (targetUsername === activeUsername) {
      setGame((prev) => applyToGameState(prev));
    } else {
      setAccounts((prev) => {
        const updated = prev.map((acc) =>
          acc.username === targetUsername
            ? { ...acc, gameState: applyToGameState(acc.gameState) }
            : acc
        );
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
        return updated;
      });
    }
  };

  // Hesap Silme
  const handleDeleteAccount = (username) => {
    const updated = accounts.filter((a) => a.username !== username);
    setAccounts(updated);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    if (activeUsername === username) {
      setActiveUsername(null);
      setGame(null);
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  };

  // Mevcut Şirket Seviyesi (COMPANY_TIERS)
  const currentTier = useMemo(() => {
    if (!game) return COMPANY_TIERS[0];
    let tier = COMPANY_TIERS[0];
    for (const t of COMPANY_TIERS) {
      if (game.xp >= t.minXP) tier = t;
    }
    return tier;
  }, [game?.xp]);

  const nextTier = useMemo(() => {
    return COMPANY_TIERS.find((t) => t.level === currentTier.level + 1) || null;
  }, [currentTier]);

  const maxFuelTankCapacity = useMemo(() => {
    if (!game) return 5000;
    let base = 5000;
    if (game.upgrades.includes('fuel_tank_1')) base += 50000;
    base += Object.keys(game.depots).length * 4000;
    return base;
  }, [game?.upgrades, game?.depots]);

  // Dakikalık Gerçek Zamanlı Oyun Simülasyon Döngüsü (1x Hızda: 1 Gerçek Saniye = 1 Oyun Dakikası -> 1 Oyun Saati = 1 Gerçek Dakika)
  useEffect(() => {
    if (!game || showAuthModal || speed === 0) return;

    const timer = setInterval(() => {
      setGame((prev) => (prev ? simulateMinutes(prev, speed, nextId) : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [speed, Boolean(game), showAuthModal]);

  // Filtrelenmiş ve Filo Uygunluğu Kontrol Edilmiş Spot Yükler
  const filteredJobs = useMemo(() => {
    if (!game) return [];
    const list = game.freightJobs
      .filter((j) => {
        if (selectedCityId && j.originId !== selectedCityId && j.destinationId !== selectedCityId) {
          return false;
        }
        if (cargoFilter !== 'all' && j.cargoType !== cargoFilter) {
          return false;
        }
        return true;
      })
      .map((j) => ({
        ...j,
        compat: checkJobFleetCompatibility(
          j,
          game.vehicles,
          game.drivers,
          game.activeTrips
        ),
      }));

    const filteredByCompat = onlyCompatibleJobs
      ? list.filter((j) => j.compat.canCarry)
      : list;

    // Her zaman filoya uygun olanları ve şehirde hazır aracı olanları en üste sırala
    return filteredByCompat.sort(
      (a, b) =>
        Number(b.compat.canCarry) - Number(a.compat.canCarry) ||
        Number(b.compat.readyInSameCity || false) -
          Number(a.compat.readyInSameCity || false) ||
        b.payout - a.payout
    );
  }, [
    game?.freightJobs,
    game?.vehicles,
    game?.drivers,
    game?.activeTrips,
    selectedCityId,
    cargoFilter,
    onlyCompatibleJobs,
  ]);

  // Eğer aktif oyuncu yoksa veya Oyuncu/Şirket Değiştir ekranı açıldıysa AuthOnboarding göster
  if (!game || showAuthModal) {
    return (
      <AuthOnboarding
        accounts={accounts}
        onLoginAccount={handleLoginAccount}
        onRegisterAccount={handleRegisterAccount}
        onDeleteAccount={handleDeleteAccount}
        onCancelIfInGame={game ? () => setShowAuthModal(false) : null}
      />
    );
  }

  // Sevkiyat Başlatma Fonksiyonu
  const handleConfirmDispatch = ({
    vehicleId,
    driverId,
    job,
    contract,
    extraJobIds = [],
    calculation,
  }) => {
    setGame((prev) => {
      const vehicle = prev.vehicles.find((v) => v.id === vehicleId);
      const driver = prev.drivers.find((d) => d.id === driverId);
      if (!vehicle || !driver || !calculation) return prev;

      const isContract = Boolean(contract);
      const originId = isContract ? contract.originId : job.originId;
      const destinationId = isContract ? contract.destinationId : job.destinationId;
      const originCity = CITIES.find((c) => c.id === originId);
      const destCity = CITIES.find((c) => c.id === destinationId);

      const upfrontCost = calculation.pumpFuelCost + calculation.highwayToll;

      const newTrip = {
        id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        vehicleId: vehicle.id,
        vehicleModelId: vehicle.modelId,
        vehiclePlate: vehicle.plate,
        vehicleName: vehicle.name,
        driverId: driver.id,
        driverName: driver.name,
        originId,
        destinationId,
        originName: originCity?.name || originId,
        destinationName: destCity?.name || destinationId,
        cargoTitle: isContract
          ? `${contract.title} (${calculation.totalWeight}t)`
          : extraJobIds.length > 0
          ? `${job.title} + ${extraJobIds.length} Ek Yük (${calculation.totalWeight}t)`
          : `${job.title} (${calculation.totalWeight}t)`,
        cargoType: isContract ? contract.cargoType : job.cargoType,
        weightTons: calculation.totalWeight,
        totalDistanceKm: calculation.totalTripKm,
        distanceCoveredKm: 0,
        speedKmh: vehicle.speedKmh,
        grossRevenue: calculation.grossRevenue,
        upfrontCost,
        isContract,
        contractId: isContract ? contract.id : null,
        startedTotalHours: prev.day * 24 + prev.hour,
        deadlineHours: isContract ? 999 : job.deadlineHours,
        restingHoursLeft: 0,
        queuedNextTrip: null,
      };

      const consumedJobIds = isContract ? [] : [job.id, ...extraJobIds];

      return {
        ...prev,
        cash: prev.cash - upfrontCost,
        fuelTankLiters: Math.max(0, prev.fuelTankLiters - calculation.fromCompanyTank),
        vehicles: prev.vehicles.map((v) =>
          v.id === vehicle.id
            ? { ...v, status: 'enroute', assignedDriverId: driver.id }
            : v
        ),
        drivers: prev.drivers.map((d) =>
          d.id === driver.id
            ? { ...d, status: 'driving', assignedVehicleId: vehicle.id }
            : d
        ),
        freightJobs: prev.freightJobs.filter((j) => !consumedJobIds.includes(j.id)),
        activeTrips: [newTrip, ...prev.activeTrips],
        stats: {
          ...prev.stats,
          totalExpenses: prev.stats.totalExpenses + upfrontCost,
        },
        ledger: [
          {
            id: `led_${Date.now()}`,
            day: prev.day,
            title: `Sefer Çıkış Gideri (${vehicle.plate} • ${originCity?.name}→${destCity?.name})`,
            amount: -upfrontCost,
            type: 'expense',
          },
          ...prev.ledger.slice(0, 59),
        ],
        logs: [
          {
            id: `log_${Date.now()}`,
            time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
            type: 'info',
            text: `🚚 ${vehicle.plate} (${driver.name}), ${originCity?.name} → ${destCity?.name} rotasında ${calculation.totalWeight} ton yükle yola çıktı.`,
          },
          ...prev.logs.slice(0, 49),
        ],
      };
    });

    setDispatchTarget(null);
  };

  // Yoldaki Bir Araç İçin Varış Şehrinden (Örn: Bursa) Geri Dönüş veya Başka İle Devam Yükü Açma
  const openBackhaulPlanner = (trip) => {
    setGame((prev) => {
      const veh = prev.vehicles.find((v) => v.id === trip.vehicleId);
      const maxCap = veh ? veh.capacityTons : 8;
      const supportedTypes = veh?.supportedCargo || ['standard'];

      // Mevcut uygun geri dönüş yükü sayısı
      const existingReturn = prev.freightJobs.filter(
        (j) =>
          j.originId === trip.destinationId &&
          (j.destinationId === trip.originId || j.destinationId === prev.hqCityId) &&
          j.weightTons <= maxCap &&
          supportedTypes.includes(j.cargoType)
      );

      // Mevcut uygun başka illere devam yükü sayısı
      const existingOnward = prev.freightJobs.filter(
        (j) =>
          j.originId === trip.destinationId &&
          j.destinationId !== trip.originId &&
          j.destinationId !== prev.hqCityId &&
          j.weightTons <= maxCap &&
          supportedTypes.includes(j.cargoType)
      );

      const addedJobs = [];

      // En az 2 adet %100 araca uygun GERİ DÖNÜŞ yükü garanti et
      if (existingReturn.length < 2) {
        const returnTargets = Array.from(new Set([trip.originId, prev.hqCityId])).filter(
          (cid) => cid && cid !== trip.destinationId
        );
        returnTargets.forEach((retDestId, idx) => {
          const rJob = generateFreightJob(
            nextId(),
            prev.unlockedCities,
            currentTier.level,
            prev.day,
            prev.hour
          );
          rJob.originId = trip.destinationId;
          rJob.destinationId = retDestId;
          rJob.distanceKm = getDistanceKm(trip.destinationId, retDestId);
          rJob.cargoType = supportedTypes[idx % supportedTypes.length] || 'standard';
          rJob.weightTons = +Math.min(
            maxCap * (0.65 + idx * 0.2),
            Math.max(1.8, maxCap * 0.75)
          ).toFixed(1);
          const mult = CARGO_TYPES[rJob.cargoType]?.rateMultiplier || 1;
          rJob.payout =
            Math.round(
              (1800 + rJob.distanceKm * (25 + rJob.weightTons * 1.9)) * mult / 50
            ) * 50;
          addedJobs.push(rJob);
        });
      }

      // En az 3 adet %100 araca uygun BAŞKA İLLERE DEVAM yükü garanti et
      if (existingOnward.length < 3) {
        const otherCities = prev.unlockedCities.filter(
          (cid) => cid !== trip.destinationId && cid !== trip.originId
        );
        const pool =
          otherCities.length > 0
            ? otherCities
            : CITIES.filter((c) => c.id !== trip.destinationId).map((c) => c.id);

        for (let i = 0; i < 3 - existingOnward.length; i++) {
          const destId = pool[(i * 2) % pool.length];
          const oJob = generateFreightJob(
            nextId(),
            prev.unlockedCities,
            currentTier.level,
            prev.day,
            prev.hour
          );
          oJob.originId = trip.destinationId;
          oJob.destinationId = destId;
          oJob.distanceKm = getDistanceKm(trip.destinationId, destId);
          oJob.cargoType = supportedTypes[i % supportedTypes.length] || 'standard';
          oJob.weightTons = +Math.min(
            maxCap * 0.85,
            Math.max(2.0, +(maxCap * (0.5 + i * 0.15)).toFixed(1))
          ).toFixed(1);
          const mult = CARGO_TYPES[oJob.cargoType]?.rateMultiplier || 1;
          oJob.payout =
            Math.round(
              (1800 + oJob.distanceKm * (25 + oJob.weightTons * 1.9)) * mult / 50
            ) * 50;
          addedJobs.push(oJob);
        }
      }

      return {
        ...prev,
        freightJobs: [...addedJobs, ...prev.freightJobs],
      };
    });

    setDispatchTarget({ backhaulTrip: trip });
  };

  // Yoldaki Araca Varış İli İçin Dönüş / Sonraki Sefer Bağlama
  const handleConfirmQueueNextTrip = ({
    activeTripId,
    job,
    extraJobIds = [],
    calculation,
  }) => {
    if (!job || !calculation) return;

    setGame((prev) => {
      const originCity = CITIES.find((c) => c.id === job.originId);
      const destCity = CITIES.find((c) => c.id === job.destinationId);
      const consumedIds = [job.id, ...extraJobIds];

      return {
        ...prev,
        freightJobs: prev.freightJobs.filter((j) => !consumedIds.includes(j.id)),
        activeTrips: prev.activeTrips.map((t) => {
          if (t.id !== activeTripId) return t;
          return {
            ...t,
            queuedNextTrip: {
              originId: job.originId,
              destinationId: job.destinationId,
              originName: originCity?.name || job.originId,
              destinationName: destCity?.name || job.destinationId,
              cargoTitle:
                extraJobIds.length > 0
                  ? `${job.title} + ${extraJobIds.length} Ek Yük (${calculation.totalWeight}t)`
                  : `${job.title} (${calculation.totalWeight}t)`,
              cargoType: job.cargoType,
              weightTons: calculation.totalWeight,
              totalDistanceKm: calculation.totalTripKm,
              grossRevenue: calculation.grossRevenue,
              upfrontCost: calculation.pumpFuelCost + calculation.highwayToll,
              fromCompanyTank: calculation.fromCompanyTank,
              deadlineHours: job.deadlineHours,
            },
          };
        }),
        logs: [
          {
            id: `log_q_${Date.now()}`,
            time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
            type: 'success',
            text: `🔄 ${originCity?.name} varışı sonrası için ${originCity?.name} → ${destCity?.name} (${calculation.totalWeight}t) dönüş/devam yükü araca rezerve edildi!`,
          },
          ...prev.logs.slice(0, 49),
        ],
      };
    });

    setDispatchTarget(null);
  };

  // Sıfır Araç Satın Alma
  const buyNewVehicle = (model) => {
    if (game.cash < model.price) return;
    if (currentTier.level < model.requiredLevel) return;

    const targetCity = selectedCityId && game.unlockedCities.includes(selectedCityId)
      ? selectedCityId
      : game.hqCityId;

    setGame((prev) => {
      const newVeh = {
        id: `veh_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        ...model,
        plate: makePlate(targetCity, prev.vehicles.length + 1, prev.plateLetters),
        condition: 100,
        mileageKm: 0,
        locationId: targetCity,
        status: 'idle',
        insured: true,
        assignedDriverId: null,
      };
      return {
        ...prev,
        cash: prev.cash - model.price,
        xp: prev.xp + Math.round(model.price / 1200),
        vehicles: [...prev.vehicles, newVeh],
        stats: {
          ...prev.stats,
          totalExpenses: prev.stats.totalExpenses + model.price,
        },
        ledger: [
          {
            id: `led_${Date.now()}`,
            day: prev.day,
            title: `Sıfır Araç Alımı: ${model.name} (${newVeh.plate})`,
            amount: -model.price,
            type: 'expense',
          },
          ...prev.ledger.slice(0, 59),
        ],
        logs: [
          {
            id: `log_${Date.now()}`,
            time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
            type: 'success',
            text: `🎉 Filoya yeni ${model.name} (${newVeh.plate}) katıldı!`,
          },
          ...prev.logs.slice(0, 49),
        ],
      };
    });
  };

  // 2. El Araç Satın Alma
  const buyUsedVehicle = (usedItem) => {
    if (game.cash < usedItem.usedPrice) return;
    const targetCity = game.hqCityId;

    setGame((prev) => {
      const newVeh = {
        id: `veh_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        ...usedItem,
        plate: makePlate(targetCity, prev.vehicles.length + 1, prev.plateLetters),
        locationId: targetCity,
        status: 'idle',
        insured: false,
        assignedDriverId: null,
      };
      return {
        ...prev,
        cash: prev.cash - usedItem.usedPrice,
        xp: prev.xp + Math.round(usedItem.usedPrice / 1500),
        vehicles: [...prev.vehicles, newVeh],
        usedVehicles: prev.usedVehicles.filter((u) => u.usedId !== usedItem.usedId),
        stats: {
          ...prev.stats,
          totalExpenses: prev.stats.totalExpenses + usedItem.usedPrice,
        },
        ledger: [
          {
            id: `led_${Date.now()}`,
            day: prev.day,
            title: `2. El Araç Alımı: ${usedItem.name} (${newVeh.plate})`,
            amount: -usedItem.usedPrice,
            type: 'expense',
          },
          ...prev.ledger.slice(0, 59),
        ],
      };
    });
  };

  // Araç Bakım & Onarım
  const repairVehicle = (vehId) => {
    setGame((prev) => {
      const v = prev.vehicles.find((item) => item.id === vehId);
      if (!v || v.condition >= 100 || v.status !== 'idle') return prev;
      const discount = prev.upgrades.includes('inhouse_workshop') ? 0.65 : 1.0;
      const repairCost = Math.round((100 - v.condition) * (v.price * 0.0022) * discount);
      if (prev.cash < repairCost) return prev;

      return {
        ...prev,
        cash: prev.cash - repairCost,
        vehicles: prev.vehicles.map((item) =>
          item.id === vehId ? { ...item, condition: 100 } : item
        ),
        stats: {
          ...prev.stats,
          totalExpenses: prev.stats.totalExpenses + repairCost,
        },
        ledger: [
          {
            id: `led_${Date.now()}`,
            day: prev.day,
            title: `Bakım & Servis: ${v.plate}`,
            amount: -repairCost,
            type: 'expense',
          },
          ...prev.ledger.slice(0, 59),
        ],
      };
    });
  };

  // Şoför İşe Alma
  const hireDriver = (candidate) => {
    if (game.cash < candidate.hireFee) return;
    setGame((prev) => ({
      ...prev,
      cash: prev.cash - candidate.hireFee,
      xp: prev.xp + 35,
      drivers: [...prev.drivers, { ...candidate, status: 'idle' }],
      candidateDrivers: prev.candidateDrivers.filter((c) => c.id !== candidate.id),
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Personel İşe Alım: ${candidate.name}`,
          amount: -candidate.hireFee,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Şoför Sertifika & Yetenek Eğitimi
  const trainDriver = (driverId, trainingType) => {
    const costs = {
      cold: 8500,
      adr: 14000,
      heavy: 18000,
      skill: 12000,
    };
    const cost = costs[trainingType] || 10000;
    if (game.cash < cost) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      xp: prev.xp + 40,
      drivers: prev.drivers.map((d) => {
        if (d.id !== driverId) return d;
        if (trainingType === 'skill') {
          return {
            ...d,
            skill: Math.min(5, d.skill + 1),
            ecoBonus: Math.min(25, d.ecoBonus + 3),
          };
        }
        return {
          ...d,
          licenses: { ...d.licenses, [trainingType]: true },
        };
      }),
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Şoför Sertifika Eğitimi (${trainingType.toUpperCase()})`,
          amount: -cost,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Şoför Dinlendirme (Günlük Takografı Sıfırlar)
  const restDriverNow = (driverId) => {
    setGame((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) =>
        d.id === driverId && d.status === 'idle'
          ? {
              ...d,
              fatigue: 0,
              dailyDrivenHours: 0,
              continuousDrivenHours: 0,
              restingHoursLeft: 0,
              morale: 100,
            }
          : d
      ),
    }));
  };

  // Yeni Şehir Şubesi Açma
  const unlockCityBranch = (city) => {
    if (game.unlockedCities.includes(city.id)) return;
    if (game.cash < city.baseUnlockCost) return;

    setGame((prev) => {
      const updatedCities = [...prev.unlockedCities, city.id];
      const newJobs = [
        generateFreightJob(nextId(), updatedCities, currentTier.level, prev.day, prev.hour),
        generateFreightJob(nextId(), updatedCities, currentTier.level, prev.day, prev.hour),
      ];
      newJobs[0].originId = city.id;

      return {
        ...prev,
        cash: prev.cash - city.baseUnlockCost,
        xp: prev.xp + 140,
        reputation: Math.min(100, prev.reputation + 2),
        unlockedCities: updatedCities,
        freightJobs: [...newJobs, ...prev.freightJobs],
        ledger: [
          {
            id: `led_${Date.now()}`,
            day: prev.day,
            title: `${city.name} Bölge Şubesi Açılışı`,
            amount: -city.baseUnlockCost,
            type: 'expense',
          },
          ...prev.ledger.slice(0, 59),
        ],
        logs: [
          {
            id: `log_${Date.now()}`,
            time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
            type: 'success',
            text: `🏢 ${city.name} şubesi hizmete açıldı! Artık ${city.name} çıkışlı yük ve ihaleleri alabilirsiniz.`,
          },
          ...prev.logs.slice(0, 49),
        ],
      };
    });
  };

  // Şehirde Antrepo / Lojistik Depo Kurma & Büyütme
  const buildOrUpgradeDepot = (city) => {
    const existing = game.depots[city.id];
    const nextLevel = existing ? existing.level + 1 : 1;
    if (nextLevel > 5) return;
    const cost = Math.round(city.depotCost * Math.pow(1.45, nextLevel - 1));
    if (game.cash < cost) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      xp: prev.xp + 210,
      reputation: Math.min(100, prev.reputation + 3),
      depots: {
        ...prev.depots,
        [city.id]: {
          level: nextLevel,
          capacityTons: nextLevel * 150,
          dailyIncome: Math.round((city.depotCost * 0.018) * nextLevel),
        },
      },
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `${city.name} Lojistik Antrepo Yatırımı (Sv.${nextLevel})`,
          amount: -cost,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Toptan Mazot Satın Alma
  const buyBulkFuel = (liters) => {
    const spaceLeft = maxFuelTankCapacity - game.fuelTankLiters;
    const actualLiters = Math.min(liters, spaceLeft);
    if (actualLiters <= 0) return;
    // Toptan alımda %9 indirim
    const wholesalePrice = game.fuelPrice * 0.91;
    const totalCost = Math.round(actualLiters * wholesalePrice);
    if (game.cash < totalCost) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - totalCost,
      fuelTankLiters: prev.fuelTankLiters + actualLiters,
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Toptan Akaryakıt Alımı (${actualLiters.toLocaleString('tr-TR')} L)`,
          amount: -totalCost,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Kurumsal İhale Kabul Etme
  const acceptContractOffer = (offer) => {
    if (game.reputation < offer.requiredReputation) return;
    setGame((prev) => ({
      ...prev,
      activeContracts: [...prev.activeContracts, offer],
      contractOffers: prev.contractOffers.filter((c) => c.id !== offer.id),
      logs: [
        {
          id: `log_${Date.now()}`,
          time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
          type: 'info',
          text: `📑 ${offer.clientName} ile ${offer.totalTonsRequired} tonluk kurumsal taşıma sözleşmesi imzalandı!`,
        },
        ...prev.logs.slice(0, 49),
      ],
    }));
  };

  // Şirket Yükseltmesi (Ar-Ge) Satın Alma
  const buyUpgrade = (upg) => {
    if (game.upgrades.includes(upg.id)) return;
    if (game.cash < upg.cost) return;
    if (currentTier.level < upg.requiredLevel) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - upg.cost,
      xp: prev.xp + 280,
      upgrades: [...prev.upgrades, upg.id],
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Ar-Ge & Altyapı Yatırımı: ${upg.name}`,
          amount: -upg.cost,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Banka Kredisi Çekme
  const takeBankLoan = (principal, days, dailyInterestRate) => {
    const totalPayback = Math.round(principal * (1 + dailyInterestRate * days));
    const dailyInstallment = Math.round(totalPayback / days);

    setGame((prev) => ({
      ...prev,
      cash: prev.cash + principal,
      loans: [
        ...prev.loans,
        {
          id: `loan_${Date.now()}`,
          principal,
          remainingAmount: totalPayback,
          dailyInstallment,
          daysLeft: days,
        },
      ],
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Banka Ticari Filo Kredisi Kullanımı`,
          amount: principal,
          type: 'income',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Kredi Erken Kapama
  const payoffLoan = (loanId) => {
    const loan = game.loans.find((l) => l.id === loanId);
    if (!loan || game.cash < loan.remainingAmount) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - loan.remainingAmount,
      loans: prev.loans.filter((l) => l.id !== loanId),
      ledger: [
        {
          id: `led_${Date.now()}`,
          day: prev.day,
          title: `Banka Kredisi Erken Kapama`,
          amount: -loan.remainingAmount,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Antrepo Toplam Stok Kapasitesi ve Mevcut Stok Miktarı
  const totalWarehouseCapacity = Object.values(game.depots || {}).reduce(
    (sum, d) => sum + (d.capacityTons || 150),
    0
  );
  const currentWarehouseUsed = Object.values(game.warehouseInventory || {}).reduce(
    (sum, qty) => sum + (qty || 0),
    0
  );

  // Antrepoya Ticari Emtia Alımı (Stoklama)
  const buyWarehouseCommodity = (comm, tons) => {
    const spaceLeft = totalWarehouseCapacity - currentWarehouseUsed;
    const actualTons = Math.min(tons, spaceLeft);
    if (actualTons <= 0) return;
    const unitPrice = (game.commodityPrices && game.commodityPrices[comm.id]) || comm.basePrice;
    const totalCost = Math.round(actualTons * unitPrice);
    if (game.cash < totalCost) return;

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - totalCost,
      warehouseInventory: {
        ...(prev.warehouseInventory || {}),
        [comm.id]: ((prev.warehouseInventory && prev.warehouseInventory[comm.id]) || 0) + actualTons,
      },
      ledger: [
        {
          id: `led_w_buy_${Date.now()}`,
          day: prev.day,
          title: `Antrepo Emtia Alımı: ${actualTons}t ${comm.name}`,
          amount: -totalCost,
          type: 'expense',
        },
        ...prev.ledger.slice(0, 59),
      ],
    }));
  };

  // Antrepodaki Ticari Emtiayı Piyasaya Satma
  const sellWarehouseCommodity = (comm, tons) => {
    const ownedTons = (game.warehouseInventory && game.warehouseInventory[comm.id]) || 0;
    const actualTons = Math.min(tons, ownedTons);
    if (actualTons <= 0) return;
    const unitPrice = (game.commodityPrices && game.commodityPrices[comm.id]) || comm.basePrice;
    const revenue = Math.round(actualTons * unitPrice);

    setGame((prev) => ({
      ...prev,
      cash: prev.cash + revenue,
      xp: prev.xp + Math.round(actualTons * 4),
      warehouseInventory: {
        ...(prev.warehouseInventory || {}),
        [comm.id]: ownedTons - actualTons,
      },
      ledger: [
        {
          id: `led_w_sell_${Date.now()}`,
          day: prev.day,
          title: `Antrepo Emtia Satışı: ${actualTons}t ${comm.name}`,
          amount: revenue,
          type: 'income',
        },
        ...prev.ledger.slice(0, 59),
      ],
      logs: [
        {
          id: `log_wsell_${Date.now()}`,
          time: `Gün ${prev.day} • ${String(prev.hour).padStart(2, '0')}:00`,
          type: 'success',
          text: `📦 Antrepodan ${actualTons} ton ${comm.name} satıldı (+₺${revenue.toLocaleString('tr-TR')}).`,
        },
        ...prev.logs.slice(0, 49),
      ],
    }));
  };

  // Şirket Net Değeri ve Türkiye Ligi Sıralaması
  const leagueStandings = useMemo(() => {
    const fleetValue = game.vehicles.reduce((s, v) => s + Math.round(v.price * (v.condition / 100) * 0.8), 0);
    const depotValue = Object.values(game.depots || {}).reduce((s, d) => s + d.level * 120000, 0);
    const stockValue = WAREHOUSE_COMMODITIES.reduce(
      (s, c) =>
        s +
        ((game.warehouseInventory && game.warehouseInventory[c.id]) || 0) *
          ((game.commodityPrices && game.commodityPrices[c.id]) || c.basePrice),
      0
    );
    const debt = game.loans.reduce((s, l) => s + l.remainingAmount, 0);
    const playerNetWorth = Math.max(10000, game.cash + fleetValue + depotValue + stockValue - debt);

    const hqCityObj = CITIES.find((c) => c.id === game.hqCityId);
    const allCompanies = [
      ...(game.rivals || INITIAL_RIVAL_COMPANIES),
      {
        id: 'player_company',
        isPlayer: true,
        name: game.companyName,
        hq: hqCityObj?.name || 'İstanbul',
        region: game.regionId || 'Marmara',
        fleetCount: game.vehicles.length,
        reputation: game.reputation,
        netWorth: playerNetWorth,
        tonsMoved: Math.round(game.stats.totalTonsMoved),
      },
    ];
    return allCompanies.sort((a, b) => b.netWorth - a.netWorth);
  }, [game]);

  const playerRank = leagueStandings.findIndex((c) => c.isPlayer) + 1;
  const hqWeatherKey =
    (game.regionalWeather && game.regionalWeather[game.regionId || 'Marmara']) || 'sunny';
  const hqWeather = WEATHER_TYPES[hqWeatherKey] || WEATHER_TYPES.sunny;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* ÜST KOMUTA BARI (TOP HUD) */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        {/* Sol: Şirket Kimliği, Bölge ve Seviye */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTier.badgeColor} flex items-center justify-center shadow-lg border border-white/15`}
          >
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                {game.companyName}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sv.{currentTier.level} • {currentTier.title}
              </span>
              {game.regionId && (
                <span
                  title={game.regionPerkTitle || ''}
                  className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30"
                >
                  📍 {game.regionId} Bölgesi
                </span>
              )}
            </div>
            {/* XP İlerleme Çubuğu & CEO Bilgisi */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                  style={{
                    width: nextTier
                      ? `${Math.min(
                          100,
                          Math.round(
                            ((game.xp - currentTier.minXP) /
                              (nextTier.minXP - currentTier.minXP)) *
                              100
                          )
                        )}%`
                      : '100%',
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {game.xp.toLocaleString('tr-TR')}{' '}
                {nextTier ? `/ ${nextTier.minXP.toLocaleString('tr-TR')} XP` : 'MAX XP'}
              </span>
              {game.ceoName && (
                <span className="hidden lg:inline text-[11px] text-slate-400 ml-1">
                  • CEO: <strong className="text-slate-200">{game.ceoName}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Orta: Finansal & Operasyonel Göstergeler */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Kasa */}
          <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Kasa Nakit</div>
              <div
                className={`text-sm font-extrabold font-mono ${
                  game.cash < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                ₺{game.cash.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          {/* İtibar */}
          <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">İtibar</div>
              <div className="text-sm font-bold font-mono text-amber-300">
                %{game.reputation}
              </div>
            </div>
          </div>

          {/* Filo Durumu */}
          <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl hidden md:flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Aktif Filo</div>
              <div className="text-sm font-bold font-mono text-slate-200">
                {game.activeTrips.length} Yolda / {game.vehicles.length} Araç
              </div>
            </div>
          </div>

          {/* Akaryakıt Borsa & Tank */}
          <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl hidden lg:flex items-center gap-2">
            <Fuel className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                Mazot: ₺{game.fuelPrice.toFixed(2)}/L
              </div>
              <div className="text-xs font-mono text-orange-300">
                Depo: {game.fuelTankLiters.toLocaleString('tr-TR')} L
              </div>
            </div>
          </div>

          {/* Bölgesel Hava Durumu Göstergesi */}
          <div
            className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl hidden xl:flex items-center gap-2"
            title="Bölgesel hava durumu araçların sürüş hızını ve yakıt tüketimini etkiler"
          >
            <span className="text-base">{hqWeather.emoji}</span>
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold">
                Hava ({game.regionId || 'Marmara'})
              </div>
              <div className="text-xs font-bold text-slate-200">
                {hqWeather.name} ({Math.round(hqWeather.speedFactor * 100)}% Hız)
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Otomasyon, Zaman Kontrolü & Yeni Oyun */}
        <div className="flex items-center gap-2">
          {/* Otomatik Sevkiyat Butonu */}
          <button
            onClick={() =>
              setGame((prev) => ({ ...prev, autoDispatch: !prev.autoDispatch }))
            }
            title="Boştaki araç ve şoförleri uygun şehirdeki yüklere otomatik atar"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              game.autoDispatch
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden xl:inline">Oto-Operasyon</span>
          </button>

          {/* Tarih & Saat Kutusu (1x Hızda: 1 Oyun Saati = 1 Gerçek Dakika) */}
          <div
            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono text-xs shadow-inner"
            title="1x Gerçekçi Hızda: Oyundaki 1 Saat = Gerçek Zamanda 1 Dakika (1 sn = 1 oyun dk)"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">GÜN {game.day}</span>
            <span className="text-amber-400 font-extrabold">
              {String(game.hour).padStart(2, '0')}:
              {String(game.minute || 0).padStart(2, '0')}
            </span>
          </div>

          {/* Hız Butonları */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setSpeed(0)}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                speed === 0
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Simülasyonu Duraklat"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSpeed(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                speed === 1
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Gerçekçi Hız (1x): Oyundaki 1 Saat = Gerçekte 1 Dakika"
            >
              1x (1s=1dk)
            </button>
            <button
              onClick={() => setSpeed(5)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                speed === 5
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="5x Hızlandırılmış"
            >
              5x
            </button>
            <button
              onClick={() => setSpeed(15)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                speed === 15
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="15x Hızlandırılmış"
            >
              15x
            </button>
            <button
              onClick={() => setSpeed(60)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                speed === 60
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="60x Turbo (Saniyede 1 Oyun Saati)"
            >
              60x
            </button>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Oyuncu Değiştir / Yeni Şirket Kur"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Şirket / Hesap</span>
          </button>
        </div>
      </header>

      {/* ANA GÖVDE: SOL NAVİGASYON + İÇERİK ALANI */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sol Menü */}
        <aside className="w-16 sm:w-56 bg-slate-900/80 border-r border-slate-800/90 flex flex-col justify-between p-2.5 shrink-0">
          <nav className="space-y-1">
            {[
              {
                id: 'command',
                label: 'Operasyon & Harita',
                icon: MapIcon,
                badge: game.activeTrips.length || null,
              },
              {
                id: 'market',
                label: 'Yük Borsası (Spot)',
                icon: Package,
                badge: game.freightJobs.length,
              },
              {
                id: 'contracts',
                label: 'İhaleler & Kontratlar',
                icon: FileSpreadsheet,
                badge: game.activeContracts.length || null,
              },
              {
                id: 'fleet',
                label: 'Filo, Garaj & Galeri',
                icon: Truck,
                badge: game.vehicles.length,
              },
              {
                id: 'hr',
                label: 'Personel & Şoförler',
                icon: Users,
                badge: game.drivers.length,
              },
              {
                id: 'network',
                label: 'Şubeler, Antrepo & Stok',
                icon: Building2,
                badge: `${game.unlockedCities.length}/${CITIES.length}`,
              },
              {
                id: 'league',
                label: 'Türkiye Lojistik Ligi',
                icon: Trophy,
                badge: `#${playerRank}`,
              },
              {
                id: 'finance',
                label: 'Finans, Banka & Ar-Ge',
                icon: Landmark,
                badge: null,
              },
              ...(game.isAdmin || activeUsername?.toLowerCase() === 'admin'
                ? [
                    {
                      id: 'admin',
                      label: 'Yönetici Paneli (GM)',
                      icon: Crown,
                      badge: 'ADMIN',
                    },
                  ]
                : []),
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : ''}`} />
                    <span className="hidden sm:inline truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        active
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sol Alt: Şirket İstatistik Özeti */}
          <div className="hidden sm:block bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 space-y-2 text-[11px]">
            <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Şirket Karnesi</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Teslimat:</span>
              <span className="font-mono text-slate-200">{game.stats.totalDeliveries} Sefer</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taşınan Yük:</span>
              <span className="font-mono text-slate-200">
                {game.stats.totalTonsMoved.toFixed(1)} Ton
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Kat Edilen Yol:</span>
              <span className="font-mono text-slate-200">
                {game.stats.totalKmDriven.toLocaleString('tr-TR')} km
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Oto-Bakım:</span>
              <button
                onClick={() =>
                  setGame((prev) => ({ ...prev, autoMaintain: !prev.autoMaintain }))
                }
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  game.autoMaintain
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {game.autoMaintain ? 'AÇIK' : 'KAPALI'}
              </button>
            </div>
          </div>
        </aside>

        {/* SAĞ ANA İÇERİK ALANI */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SEKME 1: OPERASYON & HARİTA KOMUTA MERKEZİ */}
          {activeTab === 'command' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full min-h-[620px]">
              {/* Sol 8 Sütun: Canlı Türkiye Haritası + Yoldaki Seferler */}
              <div className="xl:col-span-8 flex flex-col gap-4">
                <div className="h-[430px] sm:h-[470px]">
                  <TurkeyMap
                    unlockedCities={game.unlockedCities}
                    depots={game.depots}
                    vehicles={game.vehicles}
                    activeTrips={game.activeTrips}
                    freightJobs={game.freightJobs}
                    regionalWeather={game.regionalWeather || {}}
                    selectedCityId={selectedCityId}
                    onSelectCity={setSelectedCityId}
                    selectedTripId={selectedTripId}
                    onSelectTrip={setSelectedTripId}
                    onPlanNextLoadForCity={(cityId) => {
                      setSelectedCityId(cityId);
                      setActiveTab('market');
                    }}
                  />
                </div>

                {/* Yoldaki Aktif Konvoylar & Canlı Telemetri */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-sky-400" />
                      Canlı Sefer Telemetrisi & Dönüş Planlama ({game.activeTrips.length} Araç Yolda)
                    </h2>
                    <span className="text-xs text-slate-400">
                      İllerde Bekleyen Araçlar:{' '}
                      <strong className="text-emerald-400">
                        {game.vehicles.filter((v) => v.status === 'idle').length}
                      </strong>
                    </span>
                  </div>

                  {game.activeTrips.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400">
                      Şu anda yolda olan aracınız yok. Sağdaki{' '}
                      <strong className="text-amber-300">Hızlı Sevkiyat Listesinden</strong> bir yük seçerek hemen araç gönderebilirsiniz!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {game.activeTrips.map((trip) => {
                        const pct = Math.min(
                          100,
                          Math.round((trip.distanceCoveredKm / trip.totalDistanceKm) * 100)
                        );
                        const remKm = Math.max(0, trip.totalDistanceKm - trip.distanceCoveredKm);
                        const remHours =
                          Math.ceil(remKm / trip.speedKmh) + (trip.restingHoursLeft || 0);
                        const drv = game.drivers.find((d) => d.id === trip.driverId);

                        return (
                          <div
                            key={trip.id}
                            onClick={() => setSelectedTripId(trip.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                              selectedTripId === trip.id
                                ? 'bg-amber-500/10 border-amber-500/50'
                                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <DriverPixarAvatar
                                    driver={drv || { id: trip.driverId, name: trip.driverName }}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-amber-300 font-mono truncate">
                                      {trip.vehiclePlate} • {trip.driverName}
                                    </div>
                                    <div className="text-xs font-semibold text-white truncate">
                                      {trip.originName} → {trip.destinationName}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold shrink-0">
                                  +₺{trip.grossRevenue.toLocaleString('tr-TR')}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 truncate">
                                {trip.cargoTitle}
                              </div>

                              {/* Takograf Sürüş & Mola Durumu */}
                              <div className="flex flex-wrap items-center justify-between text-[10px] mt-1 font-mono text-slate-400">
                                <span>
                                  Takograf: Günlük {drv?.dailyDrivenHours || 0}/9s • Haftalık{' '}
                                  {drv?.weeklyDrivenHours || 0}/56s
                                </span>
                                {trip.restingHoursLeft > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                    ⏸️ Takograf Molası ({trip.restingHoursLeft}s)
                                  </span>
                                )}
                              </div>

                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className="h-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                                <span>
                                  {trip.distanceCoveredKm} / {trip.totalDistanceKm} km (%{pct})
                                </span>
                                <span>Tahmini: ~{remHours} sa</span>
                              </div>
                            </div>

                            {/* Varış İlinden Geri Dönüş / Sonraki Yük Planlama Butonu */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              {trip.queuedNextTrip ? (
                                <div className="flex items-center justify-between w-full text-[11px] text-emerald-300 font-semibold">
                                  <span>
                                    🔄 Sıradaki: {trip.queuedNextTrip.originName} →{' '}
                                    {trip.queuedNextTrip.destinationName} (+₺
                                    {trip.queuedNextTrip.grossRevenue.toLocaleString('tr-TR')})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openBackhaulPlanner(trip);
                                    }}
                                    className="text-[10px] underline text-amber-300 hover:text-amber-200"
                                  >
                                    Değiştir
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBackhaulPlanner(trip);
                                  }}
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  {trip.destinationName}’dan Geri Dönüş / Sonraki Yük Bak
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ 4 Sütun: Hızlı Sevkiyat Kuyruğu + Canlı Operasyon Kayıtları */}
              <div className="xl:col-span-4 flex flex-col gap-4">
                {/* Hızlı Sevkiyat Paneli */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-[430px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-400" />
                        Hızlı Sevkiyat Bekleyen Yükler
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        {selectedCityId
                          ? `${CITIES.find((c) => c.id === selectedCityId)?.name} bağlantılı işler`
                          : 'Tüm açık şubelerinizdeki anlık yükler'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('market')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Tüm Borsa →
                    </button>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                    {filteredJobs.slice(0, 10).map((job) => {
                      const origin = CITIES.find((c) => c.id === job.originId);
                      const dest = CITIES.find((c) => c.id === job.destinationId);
                      const cType = CARGO_TYPES[job.cargoType] || CARGO_TYPES.standard;
                      const compat = job.compat || { canCarry: false, reason: 'Uygun Araç Yok' };

                      return (
                        <div
                          key={job.id}
                          className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                            compat.canCarry
                              ? 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40'
                              : 'bg-slate-950/40 border-slate-800/50 opacity-55'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${cType.color}`}
                            >
                              <CargoTypeIcon cargoType={job.cargoType} className="w-3.5 h-3.5" />
                              {cType.shortName} • {job.weightTons}t
                            </span>
                            <span className="text-sm font-extrabold font-mono text-emerald-400">
                              ₺{job.payout.toLocaleString('tr-TR')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1">
                                {origin?.name}
                                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                {dest?.name}{' '}
                                <span className="text-slate-400 font-mono font-normal">
                                  ({job.distanceKm} km)
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {job.title}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={!compat.canCarry}
                              onClick={() => {
                                if (!compat.canCarry) return;
                                setDispatchTarget({ job });
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 ${
                                !compat.canCarry
                                  ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                                  : compat.readyInSameCity
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/15'
                                  : 'bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300'
                              }`}
                            >
                              {!compat.canCarry ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{compat.reason.split('(')[0]}</span>
                                </>
                              ) : (
                                <>
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>
                                    {compat.readyInSameCity
                                      ? 'Hemen Yükle'
                                      : compat.incomingToCity
                                      ? 'Dönüş Bağla'
                                      : 'İntikal Et'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operasyon Telsiz & Olay Günlüğü */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[200px]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Canlı Operasyon & Telsiz Akışı
                  </h2>
                  <div className="space-y-2 overflow-y-auto max-h-48 pr-1 text-xs">
                    {game.logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800/80 flex items-start gap-2"
                      >
                        <span className="font-mono text-[10px] text-slate-500 shrink-0 mt-0.5">
                          {log.time}
                        </span>
                        <span
                          className={
                            log.type === 'success'
                              ? 'text-emerald-300'
                              : log.type === 'warn'
                              ? 'text-amber-300'
                              : 'text-slate-300'
                          }
                        >
                          {log.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEKME 2: YÜK BORSASI (SPOT PİYASA & PARSİYEL) */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    Ulusal Spot Yük Borsası ({filteredJobs.length} İlan)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Filonuzdaki araçların tonaj veya dorse tipine uygun olmayan yükler kilitlidir ve yanlışlıkla seçilemez.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlyCompatibleJobs((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                      onlyCompatibleJobs
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {onlyCompatibleJobs ? '✓ Sadece Uygun Yükler' : 'Uygun Olmayanları Gizle'}
                  </button>

                  {['all', 'standard', 'express', 'refrigerated', 'adr', 'heavy'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setCargoFilter(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        cargoFilter === type
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 font-bold shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {type !== 'all' && <CargoTypeIcon cargoType={type} className="w-3.5 h-3.5" />}
                      {type === 'all' ? 'Tüm Yükler' : CARGO_TYPES[type]?.shortName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredJobs.map((job) => {
                  const origin = CITIES.find((c) => c.id === job.originId);
                  const dest = CITIES.find((c) => c.id === job.destinationId);
                  const cType = CARGO_TYPES[job.cargoType] || CARGO_TYPES.standard;
                  const perKm = (job.payout / job.distanceKm).toFixed(1);
                  const compat = job.compat || { canCarry: false, reason: 'Uygun Araç Yok' };

                  return (
                    <div
                      key={job.id}
                      className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 transition ${
                        compat.canCarry
                          ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 shadow-lg'
                          : 'bg-slate-900/40 border-slate-800/50 opacity-55'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${cType.color}`}
                          >
                            <CargoTypeIcon cargoType={job.cargoType} className="w-4 h-4" />
                            {cType.name}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            ⏱️ Teslim: {job.deadlineHours} Saat
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                              {origin?.name}
                              <ArrowRight className="w-4 h-4 text-amber-400" />
                              {dest?.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {job.clientName} • <strong className="text-slate-200">{job.title}</strong>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-extrabold font-mono text-emerald-400">
                              ₺{job.payout.toLocaleString('tr-TR')}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              ₺{perKm}/km
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 font-mono text-slate-300">
                          <span>📦 {job.weightTons} Ton</span>
                          <span>🛣️ {job.distanceKm} km</span>
                        </div>
                        <button
                          type="button"
                          disabled={!compat.canCarry}
                          onClick={() => {
                            if (!compat.canCarry) return;
                            setDispatchTarget({ job });
                          }}
                          className={`px-4 py-2 rounded-xl font-extrabold transition flex items-center gap-1.5 ${
                            !compat.canCarry
                              ? 'bg-slate-950 border border-slate-800 text-rose-300/80 cursor-not-allowed'
                              : compat.readyInSameCity
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300'
                          }`}
                        >
                          {!compat.canCarry ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-rose-400" />
                              <span>{compat.reason}</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>
                                {compat.readyInSameCity
                                  ? 'Araç Ata (Hazır)'
                                  : compat.incomingToCity
                                  ? 'Yoldaki Araca Bağla'
                                  : 'İntikal İle Ata'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEKME 3: KURUMSAL İHALELER & SÖZLEŞMELER */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Aktif Sözleşmelerimiz */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-1">
                  Aktif Kurumsal Taşıma Sözleşmelerimiz ({game.activeContracts.length})
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Süresi dolmadan toplam tonajı tamamlayın; her seferde navlun tahsil edin ve bitişte yüksek tamamlama primini kazanın!
                </p>

                {game.activeContracts.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    Henüz imzalanmış aktif bir kurumsal sözleşmeniz bulunmuyor. Aşağıdaki açık ihalelerden şirketinize uygun olanı imzalayın.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {game.activeContracts.map((cnt) => {
                      const pct = Math.min(
                        100,
                        Math.round((cnt.deliveredTons / cnt.totalTonsRequired) * 100)
                      );
                      const cType = CARGO_TYPES[cnt.cargoType] || CARGO_TYPES.standard;
                      return (
                        <div
                          key={cnt.id}
                          className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${cType.color}`}
                            >
                              {cType.name}
                            </span>
                            <span className="text-xs font-mono text-amber-300">
                              Kalan Süre: {cnt.daysRemaining} Gün
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">{cnt.clientName}</div>
                            <div className="text-base font-bold text-white">{cnt.title}</div>
                          </div>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-300">
                              Sevk Edilen: {cnt.deliveredTons.toFixed(1)} / {cnt.totalTonsRequired} Ton (%{pct})
                            </span>
                            <span className="text-emerald-400 font-bold">
                              Prim: +₺{cnt.completionBonus.toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setDispatchTarget({ contract: cnt })}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                            >
                              <Truck className="w-4 h-4" />
                              Bu Kontrata Sefer Gönder
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Açık İhale Teklifleri */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4">
                  Açık Kurumsal Tedarik İhaleleri ({game.contractOffers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {game.contractOffers.map((offer) => {
                    const cType = CARGO_TYPES[offer.cargoType] || CARGO_TYPES.standard;
                    const repEnough = game.reputation >= offer.requiredReputation;
                    return (
                      <div
                        key={offer.id}
                        className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-bold ${cType.color}`}
                            >
                              {cType.shortName}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              Süre: {offer.daysLimit} Gün
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{offer.clientName}</div>
                          <div className="text-sm font-bold text-white">{offer.title}</div>
                          <div className="text-xs text-slate-300 space-y-1 pt-1 font-mono">
                            <div>Toplam Hacim: {offer.totalTonsRequired} Ton</div>
                            <div>Ton Başı Navlun: ₺{offer.rewardPerTon.toLocaleString('tr-TR')}</div>
                            <div className="text-emerald-400 font-bold">
                              Bitirme Primi: +₺{offer.completionBonus.toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={!repEnough}
                          onClick={() => acceptContractOffer(offer)}
                          className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition"
                        >
                          {repEnough
                            ? 'İhaleyi İmzala & Başla'
                            : `Gerekli İtibar: %${offer.requiredReputation}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 4: FİLO, GARAJ & ARAÇ GALERİSİ */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              {/* Mevcut Filomuz */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Mevcut Araç Filomuz ({game.vehicles.length} Araç)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Araçlarınızın kondisyonunu yüksek tutarak yolda arıza riskini önleyin ve kasko sigortalarını yönetin.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {game.vehicles.map((v) => {
                    const locCity = CITIES.find((c) => c.id === v.locationId);
                    const activeTripForVeh = game.activeTrips.find(
                      (t) => t.vehicleId === v.id
                    );
                    const assignedDrv =
                      game.drivers.find(
                        (d) =>
                          d.id ===
                          (activeTripForVeh?.driverId || v.assignedDriverId)
                      ) || null;
                    const discount = game.upgrades.includes('inhouse_workshop')
                      ? 0.65
                      : 1.0;
                    const repairCost = Math.round(
                      (100 - v.condition) * (v.price * 0.0022) * discount
                    );
                    return (
                      <div
                        key={v.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg"
                      >
                        <div>
                          {/* Pixar 3D Araç Görsel Kartı */}
                          <VehiclePixarCardBanner
                            modelId={v.modelId}
                            name={v.name}
                            plate={v.plate}
                            condition={v.condition}
                            badgeText={
                              v.status === 'idle'
                                ? `📍 ${locCity?.name} İlinde`
                                : `🚚 ${activeTripForVeh?.originName || ''} → ${
                                    activeTripForVeh?.destinationName || 'Yolda'
                                  }`
                            }
                            badgeColorClass={
                              v.status === 'idle'
                                ? 'bg-emerald-500/90 text-slate-950'
                                : 'bg-sky-500/90 text-slate-950'
                            }
                            heightClass="h-40"
                          />

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="text-xs text-slate-300 font-mono">
                              📦 {v.capacityTons}t • ⚡ {v.speedKmh} km/s • ⛽{' '}
                              {v.fuelLPer100Km}L/100km
                            </div>
                            {assignedDrv && (
                              <div
                                className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800"
                                title={`Sorumlu Kaptan: ${assignedDrv.name}`}
                              >
                                <DriverPixarAvatar
                                  driver={assignedDrv}
                                  size="sm"
                                  showStatusDot={false}
                                />
                                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[90px]">
                                  {assignedDrv.name.split(' ')[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Kondisyon Barı */}
                          <div className="mt-2.5">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Mekanik Kondisyon:</span>
                              <span
                                className={`font-mono font-bold ${
                                  v.condition > 75
                                    ? 'text-emerald-400'
                                    : v.condition > 45
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                %{v.condition} ({v.mileageKm.toLocaleString('tr-TR')} km)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  v.condition > 75
                                    ? 'bg-emerald-400'
                                    : v.condition > 45
                                    ? 'bg-amber-400'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${v.condition}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          {v.status === 'idle' ? (
                            <button
                              onClick={() => {
                                setSelectedCityId(v.locationId);
                                setActiveTab('market');
                              }}
                              className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold"
                            >
                              📍 {locCity?.name} Yüklerine Bak
                            </button>
                          ) : activeTripForVeh ? (
                            <button
                              onClick={() => openBackhaulPlanner(activeTripForVeh)}
                              className="py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold"
                            >
                              🔄 {activeTripForVeh.destinationName} Dönüş Yükü Bak
                            </button>
                          ) : null}

                          <button
                            disabled={
                              v.condition >= 100 ||
                              v.status !== 'idle' ||
                              game.cash < repairCost
                            }
                            onClick={() => repairVehicle(v.id)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5 text-amber-400" />
                            {v.condition >= 100
                              ? 'Bakımlı'
                              : `Bakım (₺${repairCost.toLocaleString('tr-TR')})`}
                          </button>

                          <button
                            onClick={() =>
                              setGame((prev) => ({
                                ...prev,
                                vehicles: prev.vehicles.map((item) =>
                                  item.id === v.id
                                    ? { ...item, insured: !item.insured }
                                    : item
                                ),
                              }))
                            }
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border ${
                              v.insured
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {v.insured ? '🛡️ Kaskolu' : 'Kaskosuz'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* İkinci El Fırsat Pazarı */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-1">
                  2. El Ticari Araç Pazarı (Günlük Yenilenir)
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Uygun bütçeyle filonuzu hızla büyütmek için ikinci el kamyonet, kamyon ve çekicileri değerlendirin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                  {game.usedVehicles.map((u) => (
                    <div
                      key={u.usedId}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <VehiclePixarCardBanner
                          modelId={u.modelId}
                          name={u.name}
                          condition={u.condition}
                          badgeText="2. EL FIRSAT"
                          badgeColorClass="bg-amber-500 text-slate-950"
                          heightClass="h-32"
                        />
                        <div className="text-xs text-slate-400 mt-2 font-mono">
                          📦 {u.capacityTons} Ton • 🛣️ {u.mileageKm.toLocaleString('tr-TR')} km
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-base font-extrabold font-mono text-emerald-400">
                          ₺{u.usedPrice.toLocaleString('tr-TR')}
                        </span>
                        <button
                          disabled={game.cash < u.usedPrice}
                          onClick={() => buyUsedVehicle(u)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow"
                        >
                          Satın Al
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sıfır Araç & Filo Galerisi */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4">
                  Yetkili Bayi Sıfır Araç & Dorse Kataloğu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {VEHICLE_CATALOG.map((model) => {
                    const locked = currentTier.level < model.requiredLevel;
                    const canAfford = game.cash >= model.price && !locked;
                    return (
                      <div
                        key={model.modelId}
                        className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                          locked
                            ? 'bg-slate-950/40 border-slate-800/50 opacity-65'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 shadow-lg'
                        }`}
                      >
                        <div>
                          <VehiclePixarCardBanner
                            modelId={model.modelId}
                            name={model.name}
                            badgeText={`Sv.${model.requiredLevel} • ${model.category}`}
                            badgeColorClass={
                              locked
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-amber-500 text-slate-950'
                            }
                            heightClass="h-40"
                          />
                          <p className="text-xs text-slate-400 mt-2.5">{model.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {model.supportedCargo.map((cid) => (
                              <span
                                key={cid}
                                className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${CARGO_TYPES[cid]?.color}`}
                              >
                                <CargoTypeIcon cargoType={cid} className="w-3 h-3" />
                                {CARGO_TYPES[cid]?.shortName}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-300">
                            <div>📦 {model.capacityTons}t</div>
                            <div>⚡ {model.speedKmh} km/s</div>
                            <div>⛽ {model.fuelLPer100Km}L</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400">Bayi Satış Fiyatı</div>
                            <div className="text-base font-extrabold font-mono text-emerald-400">
                              ₺{model.price.toLocaleString('tr-TR')}
                            </div>
                          </div>
                          <button
                            disabled={!canAfford}
                            onClick={() => buyNewVehicle(model)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow"
                          >
                            {locked ? `🔒 Sv.${model.requiredLevel} Gerekli` : 'Sıfır Satın Al'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 5: PERSONEL & İK YÖNETİMİ (ŞOFÖRLER & EĞİTİM) */}
          {activeTab === 'hr' && (
            <div className="space-y-6">
              {/* Kadrolu Şoförlerimiz */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-1">
                  Kadrolu Şoförlerimiz ({game.drivers.length} Şoför)
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Şoförlerinize ADR, Frigorifik ve Ağır Nakliye sertifikaları aldırarak yüksek kârlı yüklerin kilidini açın.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {game.drivers.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <DriverPixarAvatar driver={d} size="lg" />
                          <div>
                            <div className="font-extrabold text-white text-sm">{d.name}</div>
                            <div className="text-xs text-amber-400 mt-0.5">
                              {'★'.repeat(d.skill)}{' '}
                              <span className="text-slate-400">
                                • Eco: -%{d.ecoBonus} Yakıt
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Maaş: ₺{d.dailyWage}/gün • {d.tripsCompleted} Sefer
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                            d.status === 'idle'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {d.status === 'idle' ? 'Hazır' : 'Seferde'}
                        </span>
                      </div>

                      {/* Günlük & Haftalık Takograf Sürüş Saatleri */}
                      <div className="space-y-2 pt-1">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Günlük Sürüş (Maks 9s):</span>
                            <span className="font-mono text-slate-200">
                              {d.dailyDrivenHours || 0} / 9 Saat
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                (d.dailyDrivenHours || 0) >= 8 ? 'bg-rose-500' : 'bg-emerald-400'
                              }`}
                              style={{
                                width: `${Math.min(100, ((d.dailyDrivenHours || 0) / 9) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Haftalık Sürüş (Maks 56s):</span>
                            <span className="font-mono text-slate-200">
                              {d.weeklyDrivenHours || 0} / 56 Saat
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                (d.weeklyDrivenHours || 0) >= 48 ? 'bg-amber-400' : 'bg-sky-400'
                              }`}
                              style={{
                                width: `${Math.min(100, ((d.weeklyDrivenHours || 0) / 56) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sertifikalar */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">
                          ✓ SRC-4
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            d.licenses.cold
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {d.licenses.cold ? '✓ Frigorifik' : '✗ Frigorifik'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            d.licenses.adr
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {d.licenses.adr ? '✓ ADR Tanker' : '✗ ADR Tanker'}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            d.licenses.heavy
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {d.licenses.heavy ? '✓ Ağır Tonaj' : '✗ Ağır Tonaj'}
                        </span>
                      </div>

                      {/* Eğitim & Dinlendirme Butonları */}
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                        {!d.licenses.cold && (
                          <button
                            onClick={() => trainDriver(d.id, 'cold')}
                            className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-semibold"
                          >
                            +Frigo Eğitimi (₺8.5K)
                          </button>
                        )}
                        {!d.licenses.adr && (
                          <button
                            onClick={() => trainDriver(d.id, 'adr')}
                            className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold"
                          >
                            +ADR Belgesi (₺14K)
                          </button>
                        )}
                        {!d.licenses.heavy && (
                          <button
                            onClick={() => trainDriver(d.id, 'heavy')}
                            className="px-2 py-1 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-semibold"
                          >
                            +Ağır Yük (₺18K)
                          </button>
                        )}
                        {d.skill < 5 && (
                          <button
                            onClick={() => trainDriver(d.id, 'skill')}
                            className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold"
                          >
                            +Eco Sürüş (₺12K)
                          </button>
                        )}
                        {d.fatigue > 0 && d.status === 'idle' && (
                          <button
                            onClick={() => restDriverNow(d.id)}
                            className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold"
                          >
                            Dinlendir (%0 Yorgunluk)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* İş Başvurusu Yapan Aday Şoförler */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4">
                  İş Başvurusu Yapan Şoför Adayları ({game.candidateDrivers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {game.candidateDrivers.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <DriverPixarAvatar
                            driver={cand}
                            size="md"
                            showStatusDot={false}
                          />
                          <div>
                            <div className="font-extrabold text-white text-sm">
                              {cand.name}
                            </div>
                            <div className="text-xs text-amber-400 mt-0.5">
                              {'★'.repeat(cand.skill)} • -%{cand.ecoBonus} Yakıt
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 font-mono">
                              Maaş: ₺{cand.dailyWage}/gün
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            ✓ SRC-4
                          </span>
                          {cand.licenses.cold && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                              ✓ Frigorifik
                            </span>
                          )}
                          {cand.licenses.adr && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                              ✓ ADR
                            </span>
                          )}
                          {cand.licenses.heavy && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              ✓ Ağır Tonaj
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        disabled={game.cash < cand.hireFee}
                        onClick={() => hireDriver(cand)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow"
                      >
                        İşe Al (₺{cand.hireFee.toLocaleString('tr-TR')})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 6: ŞUBELER, ANTREPO AĞI & ŞİRKET AKARYAKIT DEPOSU */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              {/* Şirket Toptan Akaryakıt Yönetimi */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-orange-400" />
                    Şirket Toptan Akaryakıt Tankı & İkmal Merkezi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Güncel Pompa Fiyatı: <strong className="text-white">₺{game.fuelPrice.toFixed(2)}/L</strong> •
                    Toptan İndirimli Alım Fiyatı:{' '}
                    <strong className="text-emerald-400">
                      ₺{(game.fuelPrice * 0.91).toFixed(2)}/L (-%9 İndirim)
                    </strong>
                  </p>
                  <div className="text-xs font-mono text-orange-300">
                    Doluluk: {game.fuelTankLiters.toLocaleString('tr-TR')} /{' '}
                    {maxFuelTankCapacity.toLocaleString('tr-TR')} Litre
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[2000, 5000, 15000].map((amt) => {
                    const cost = Math.round(amt * game.fuelPrice * 0.91);
                    return (
                      <button
                        key={amt}
                        disabled={
                          game.cash < cost || game.fuelTankLiters >= maxFuelTankCapacity
                        }
                        onClick={() => buyBulkFuel(amt)}
                        className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
                      >
                        +{amt.toLocaleString('tr-TR')} L Al (₺{cost.toLocaleString('tr-TR')})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DETAYLI ANTREPO STOK & TİCARİ EMTİA BORSASI */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-emerald-400" />
                      Antrepo Stok Yönetimi & Ticari Emtia Borsası
                    </h2>
                    <p className="text-xs text-slate-400">
                      Emtia fiyatları düşükken antrepolarınıza mal stoklayın, piyasa fiyatları yükseldiğinde yüksek kârla satın!
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                    Antrepo Doluluğu:{' '}
                    <strong className="text-emerald-400">
                      {currentWarehouseUsed} / {totalWarehouseCapacity} Ton
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {WAREHOUSE_COMMODITIES.map((comm) => {
                    const curPrice =
                      (game.commodityPrices && game.commodityPrices[comm.id]) ||
                      comm.basePrice;
                    const diffPct = Math.round(
                      ((curPrice - comm.basePrice) / comm.basePrice) * 100
                    );
                    const storedTons =
                      (game.warehouseInventory &&
                        game.warehouseInventory[comm.id]) ||
                      0;

                    return (
                      <div
                        key={comm.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{comm.icon}</span>
                              {comm.name}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                                diffPct < -5
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : diffPct > 8
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {diffPct < -5
                                ? `📉 Ucuz (%${diffPct})`
                                : diffPct > 8
                                ? `📈 Yüksek (+%${diffPct})`
                                : `Normal (%${diffPct})`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {comm.description}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-xs font-mono">
                            <span className="text-slate-300">
                              Borsa: <strong className="text-white">₺{curPrice.toLocaleString('tr-TR')}/t</strong>
                            </span>
                            <span className="text-emerald-400 font-bold">
                              Stok: {storedTons} Ton
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            disabled={
                              game.cash < curPrice * 10 ||
                              currentWarehouseUsed + 10 > totalWarehouseCapacity
                            }
                            onClick={() => buyWarehouseCommodity(comm, 10)}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 disabled:opacity-35 text-emerald-300 font-bold text-xs"
                          >
                            +10t Stokla (₺{(curPrice * 10).toLocaleString('tr-TR')})
                          </button>
                          <button
                            disabled={storedTons <= 0}
                            onClick={() => sellWarehouseCommodity(comm, storedTons)}
                            className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-35 text-slate-950 font-extrabold text-xs"
                          >
                            Tümünü Sat (+₺{(storedTons * curPrice).toLocaleString('tr-TR')})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Türkiye Şehir Şubeleri ve Antrepo Yatırımları */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-1">
                  Türkiye Şube Ağı & Bölgesel Antrepolar ({game.unlockedCities.length}/{CITIES.length} Şehir Açık)
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Yeni şehirlerde şube açarak o bölgenin yüklerine erişin; Antrepo kurarak her gün düzenli depolama ve aktarma geliri elde edin.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {CITIES.map((city) => {
                    const isUnlocked = game.unlockedCities.includes(city.id);
                    const depot = game.depots[city.id];
                    const nextDepotLevel = depot ? depot.level + 1 : 1;
                    const depotUpgradeCost = Math.round(
                      city.depotCost * Math.pow(1.45, nextDepotLevel - 1)
                    );

                    return (
                      <div
                        key={city.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          isUnlocked
                            ? 'bg-slate-950 border-slate-800'
                            : 'bg-slate-950/50 border-slate-800/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">
                              {city.name}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                ({city.region})
                              </span>
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                                depot
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isUnlocked
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {depot
                                ? `Antrepo Sv.${depot.level}`
                                : isUnlocked
                                ? 'Şube Açık'
                                : 'Kilitli'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Sektörler: {city.specialties.join(', ')}
                          </div>
                          {depot && (
                            <div className="text-xs font-mono text-emerald-400 mt-2">
                              Günlük Depolama Geliri: +₺{depot.dailyIncome.toLocaleString('tr-TR')}/gün
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          {!isUnlocked ? (
                            <button
                              disabled={game.cash < city.baseUnlockCost}
                              onClick={() => unlockCityBranch(city)}
                              className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
                            >
                              Şube Aç (₺{city.baseUnlockCost.toLocaleString('tr-TR')})
                            </button>
                          ) : nextDepotLevel <= 5 ? (
                            <button
                              disabled={game.cash < depotUpgradeCost}
                              onClick={() => buildOrUpgradeDepot(city)}
                              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
                            >
                              {depot
                                ? `Antrepo Büyüt Sv.${nextDepotLevel} (₺${depotUpgradeCost.toLocaleString('tr-TR')})`
                                : `Lojistik Antrepo Kur (₺${depotUpgradeCost.toLocaleString('tr-TR')})`}
                            </button>
                          ) : (
                            <div className="text-center text-xs font-bold text-amber-400 py-1">
                              ★ Maksimum Mega Lojistik Üssü
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEKME: TÜRKİYE LOJİSTİK LİGİ SIRALAMASI & BÖLGESEL HAVA DURUMU */}
          {activeTab === 'league' && (
            <div className="space-y-6">
              {/* 7 Bölge Canlı Hava Durumu ve Yol Koşulları */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <CloudRain className="w-5 h-5 text-sky-400" />
                  Türkiye 7 Bölge Canlı Meteoroloji & Yol Durumu Raporu
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Bölgelerdeki yağmur, sis ve kar yağışı o bölgede seyahat eden araçlarınızın ortalama hızını ve yakıt tüketimini doğrudan etkiler.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {REGIONS.map((reg) => {
                    const wKey =
                      (game.regionalWeather && game.regionalWeather[reg.id]) ||
                      'sunny';
                    const w = WEATHER_TYPES[wKey] || WEATHER_TYPES.sunny;
                    return (
                      <div
                        key={reg.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2"
                      >
                        <div className="text-xs font-bold text-white">
                          {reg.id}
                        </div>
                        <div className="text-2xl my-0.5">{w.emoji}</div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-200">
                            {w.name}
                          </div>
                          <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                            Hız: %{Math.round(w.speedFactor * 100)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Türkiye Lojistik Şirketleri Sıralaması */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Türkiye Ulusal Lojistik Devleri Sıralaması (Sıranız: #{playerRank})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Net şirket değerinizi (Nakit + Filo + Antrepolar + Emtia Stoğu) artırarak rakiplerinizi geride bırakın ve sektör lideri olun!
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {leagueStandings.map((comp, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={comp.id}
                        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition ${
                          comp.isPlayer
                            ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-slate-950 border-amber-400 shadow-lg'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl font-mono font-extrabold text-sm flex items-center justify-center ${
                              rank === 1
                                ? 'bg-amber-400 text-slate-950'
                                : rank === 2
                                ? 'bg-slate-300 text-slate-950'
                                : rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            #{rank}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-white flex items-center gap-2">
                              {comp.name}
                              {comp.isPlayer && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                                  SİZİN ŞİRKETİNİZ
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              📍 Merkez: {comp.hq} ({comp.region}) • İtibar: %{comp.reputation}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 font-mono text-xs">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Filo Büyüklüğü</div>
                            <div className="text-sky-400 font-bold">{comp.fleetCount} Araç</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-slate-400">Taşınan Yük</div>
                            <div className="text-slate-200 font-bold">
                              {comp.tonsMoved.toLocaleString('tr-TR')} Ton
                            </div>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <div className="text-[10px] text-slate-400">Şirket Net Değeri</div>
                            <div className="text-sm font-extrabold text-emerald-400">
                              ₺{comp.netWorth.toLocaleString('tr-TR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEKME 8: SÜPER YÖNETİCİ (GM / ADMIN) PANELİ */}
          {activeTab === 'admin' &&
            (game.isAdmin || activeUsername?.toLowerCase() === 'admin') && (
              <AdminPanel
                accounts={accounts}
                activeUsername={activeUsername}
                onAdminAction={handleAdminAction}
                onSwitchToAccount={handleLoginAccount}
              />
            )}

          {/* SEKME 7: FİNANS, BANKA KREDİLERİ, AR-GE & SEVİYE YOL HARİTASI */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Şirket Ar-Ge & Teknolojik Yükseltmeler */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-1">
                  Şirket Ar-Ge, Sertifika & Operasyon Yükseltmeleri
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Kalıcı şirket yatırımları ile yakıt ve bakım giderlerini düşürün, kurumsal navlun gelirlerinizi artırın.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {COMPANY_UPGRADES.map((upg) => {
                    const owned = game.upgrades.includes(upg.id);
                    const locked = currentTier.level < upg.requiredLevel;
                    return (
                      <div
                        key={upg.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                          owned
                            ? 'bg-emerald-500/10 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">
                              {upg.effectText}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              Sv.{upg.requiredLevel}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white mt-1">{upg.name}</div>
                          <p className="text-xs text-slate-400 mt-1">{upg.description}</p>
                        </div>

                        <button
                          disabled={owned || locked || game.cash < upg.cost}
                          onClick={() => buyUpgrade(upg)}
                          className={`w-full py-2 rounded-xl font-bold text-xs transition ${
                            owned
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950'
                          }`}
                        >
                          {owned
                            ? '✓ Aktif Yatırım'
                            : locked
                            ? `Şirket Sv.${upg.requiredLevel} Gerekli`
                            : `Yatırım Yap (₺${upg.cost.toLocaleString('tr-TR')})`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Banka Ticari Kredi Paketleri & Mevcut Borçlar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    Anadolu Ticaret Bankası Filo Kredileri
                  </h2>
                  <p className="text-xs text-slate-400">
                    Yeni çekici tır, depo veya şube yatırımlarınızı hızlandırmak için ticari kredi kullanabilirsiniz.
                  </p>
                  <div className="space-y-2.5">
                    {[
                      {
                        title: 'KOBİ Hızlı Nakit Kredisi',
                        principal: 100000,
                        days: 10,
                        rate: 0.012,
                      },
                      {
                        title: 'Bölgesel Filo Büyütme Kredisi',
                        principal: 300000,
                        days: 15,
                        rate: 0.011,
                      },
                      {
                        title: 'Ulusal Lojistik Yatırım Kredisi',
                        principal: 750000,
                        days: 20,
                        rate: 0.01,
                      },
                    ].map((pkg, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{pkg.title}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            Anapara: ₺{pkg.principal.toLocaleString('tr-TR')} • Vade: {pkg.days} Gün
                          </div>
                        </div>
                        <button
                          disabled={game.loans.length >= 3}
                          onClick={() => takeBankLoan(pkg.principal, pkg.days, pkg.rate)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
                        >
                          Kredi Çek (+₺{pkg.principal.toLocaleString('tr-TR')})
                        </button>
                      </div>
                    ))}
                  </div>

                  {game.loans.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300">
                        Aktif Kredilerimiz ({game.loans.length}/3)
                      </div>
                      {game.loans.map((l) => (
                        <div
                          key={l.id}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-rose-400 font-bold">
                              Kalan: ₺{l.remainingAmount.toLocaleString('tr-TR')}
                            </span>
                            <span className="text-slate-400 ml-2">
                              (Günlük: ₺{l.dailyInstallment.toLocaleString('tr-TR')} • {l.daysLeft}g)
                            </span>
                          </div>
                          <button
                            disabled={game.cash < l.remainingAmount}
                            onClick={() => payoffLoan(l.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold"
                          >
                            Erken Kapat
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Muhasebe & Kasa Hareketleri */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col max-h-[420px]">
                  <h2 className="text-base font-bold text-white mb-3">
                    Son Muhasebe & Kasa Hareketleri
                  </h2>
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 text-xs">
                    {game.ledger.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-slate-500 mr-2">
                            Gün {item.day}
                          </span>
                          <span className="text-slate-200">{item.title}</span>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            item.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.amount >= 0 ? '+' : ''}₺{item.amount.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SEVKİYAT ATAMA & DÖNÜŞ YÜKÜ PLANLAMA MODALI */}
      {dispatchTarget && (
        <DispatchModal
          job={dispatchTarget.job}
          contract={dispatchTarget.contract}
          backhaulTrip={dispatchTarget.backhaulTrip}
          hqCityId={game.hqCityId}
          vehicles={game.vehicles}
          drivers={game.drivers}
          activeTrips={game.activeTrips}
          allJobs={game.freightJobs}
          fuelPrice={game.fuelPrice}
          fuelTankLiters={game.fuelTankLiters}
          upgrades={game.upgrades}
          onClose={() => setDispatchTarget(null)}
          onConfirmDispatch={handleConfirmDispatch}
          onConfirmQueueNextTrip={handleConfirmQueueNextTrip}
        />
      )}
    </div>
  );
}

// ============================================================================
// DAKİKALIK & SAATLİK SİMÜLASYON MOTORU
// (1x Hızda: 1 Gerçek Saniye = 1 Oyun Dakikası -> 1 Oyun Saati = 1 Gerçek Dakika)
// ============================================================================
function simulateMinutes(prev, deltaMinutes, nextId) {
  const curMin = prev.minute || 0;
  const targetMin = curMin + deltaMinutes;

  if (targetMin < 60) {
    // Saat sınırını geçmiyorsa sadece dakikayı ve araçların dakikalık yol ilerlemesini güncelle
    const updatedTrips = prev.activeTrips.map((trip) => {
      if (trip.restingHoursLeft && trip.restingHoursLeft > 0) return trip;
      const stepKm = (trip.speedKmh * deltaMinutes) / 60;
      const nextDist = Math.min(
        trip.totalDistanceKm - 0.1,
        +(trip.distanceCoveredKm + stepKm).toFixed(1)
      );
      return {
        ...trip,
        distanceCoveredKm: nextDist,
      };
    });

    return {
      ...prev,
      minute: targetMin,
      activeTrips: updatedTrips,
    };
  }

  // Saat sınırına ulaşıldıysa veya geçildiyse kalan dakikalarla saati tamamla
  const remMinToHour = 60 - curMin;
  const afterHourState = simulateOneHour(
    { ...prev, minute: 0 },
    nextId,
    remMinToHour
  );
  const leftoverMin = targetMin - 60;
  if (leftoverMin > 0 && leftoverMin < 60) {
    return simulateMinutes(afterHourState, leftoverMin, nextId);
  }
  return afterHourState;
}

function simulateOneHour(prev, nextId, minutesPortion = 60) {
  let nextHour = prev.hour + 1;
  let nextDay = prev.day;
  let isNewDay = false;
  if (nextHour >= 24) {
    nextHour = 0;
    nextDay += 1;
    isNewDay = true;
  }

  let cash = prev.cash;
  let xp = prev.xp;
  let reputation = prev.reputation;
  let fuelTankLiters = prev.fuelTankLiters;
  let vehicles = [...prev.vehicles];
  let drivers = [...prev.drivers];
  let activeTrips = [];
  let activeContracts = [...prev.activeContracts];
  let ledger = [...prev.ledger];
  let logs = [...prev.logs];
  let stats = { ...prev.stats };

  const timeLabel = `Gün ${nextDay} • ${String(nextHour).padStart(2, '0')}:00`;
  const nowTotalHours = nextDay * 24 + nextHour;

  // 1. Yoldaki Seferleri ve Takograf Sürüş Saatlerini İlerlet
  for (const trip of prev.activeTrips) {
    // Eğer şoför yolda zorunlu takograf molasındaysa (4.5s mola, 9s günlük veya 56s haftalık dinlenme)
    if (trip.restingHoursLeft && trip.restingHoursLeft > 0) {
      const remRest = trip.restingHoursLeft - 1;
      activeTrips.push({
        ...trip,
        restingHoursLeft: remRest,
      });
      continue;
    }

    const destCityObj = CITIES.find((c) => c.id === trip.destinationId);
    const regionWeatherKey =
      (prev.regionalWeather &&
        destCityObj &&
        prev.regionalWeather[destCityObj.region]) ||
      'sunny';
    const weatherSpeedFactor =
      (WEATHER_TYPES[regionWeatherKey] &&
        WEATHER_TYPES[regionWeatherKey].speedFactor) ||
      1.0;

    const stepKm = (trip.speedKmh * weatherSpeedFactor * minutesPortion) / 60;
    const newDist = +(trip.distanceCoveredKm + stepKm).toFixed(1);

    // YOLDA RASTGELE OLAYLAR & KANTAR / TAKOGRAF DENETİMLERİ (%12 olasılıkla saat başı)
    if (newDist < trip.totalDistanceKm - 5 && Math.random() < 0.12) {
      const evRoll = Math.random();
      const vehObj = vehicles.find((v) => v.id === trip.vehicleId);
      if (evRoll < 0.45) {
        // Karayolları Kantar & Takograf Denetim İstasyonu
        xp += 25;
        reputation = Math.min(100, reputation + 1);
        logs.unshift({
          id: `log_insp_${nextId()}`,
          time: timeLabel,
          type: 'success',
          text: `⚖️ [Kantar & Takograf Denetimi] ${trip.vehiclePlate} (${trip.driverName}), Karayolları denetim istasyonundan kusursuz geçti! (+25 XP, +1 İtibar)`,
        });
      } else if (evRoll < 0.75 && vehObj && vehObj.condition < 80) {
        // Lastik / Mekanik Yol Yardım Olayı
        if (vehObj.insured) {
          logs.unshift({
            id: `log_ins_save_${nextId()}`,
            time: timeLabel,
            type: 'info',
            text: `🛡️ [Kasko Koruması] ${trip.vehiclePlate} yolda lastik/hortum arızası yaşadı; Kasko sigortanız ₺3.200 yol yardım giderini karşıladı (₺0 Gider).`,
          });
        } else {
          const roadRepair = 2800;
          cash -= roadRepair;
          ledger.unshift({
            id: `led_road_${nextId()}`,
            day: nextDay,
            title: `Acil Yol Yardım Gideri (${trip.vehiclePlate} - Kaskosuz)`,
            amount: -roadRepair,
            type: 'expense',
          });
          logs.unshift({
            id: `log_road_${nextId()}`,
            time: timeLabel,
            type: 'warn',
            text: `🛞 [Yol Arızası] Kaskosuz ${trip.vehiclePlate} yolda arıza yaptı! Acil mobil servis için -₺${roadRepair.toLocaleString('tr-TR')} ödendi.`,
          });
        }
      } else if (regionWeatherKey === 'snow' || regionWeatherKey === 'rain') {
        logs.unshift({
          id: `log_wx_${nextId()}`,
          time: timeLabel,
          type: 'info',
          text: `${WEATHER_TYPES[regionWeatherKey].emoji} [Hava Muhalefeti] ${trip.vehiclePlate}, ${destCityObj?.region} bölgesinde ${WEATHER_TYPES[regionWeatherKey].name} nedeniyle güvenli hızda ilerliyor.`,
        });
      }
    }

    if (newDist >= trip.totalDistanceKm - 0.5) {
      // TESLİMAT TAMAMLANDI!
      const elapsedHours = nowTotalHours - trip.startedTotalHours;
      const isLate = elapsedHours > trip.deadlineHours;
      const finalPayout = isLate
        ? Math.round(trip.grossRevenue * 0.78)
        : trip.grossRevenue;

      cash += finalPayout;
      xp += Math.round(trip.totalDistanceKm * 0.35 + trip.weightTons * 6);
      reputation = Math.min(100, Math.max(10, reputation + (isLate ? -1 : 1)));

      stats.totalDeliveries += 1;
      stats.totalTonsMoved += trip.weightTons;
      stats.totalKmDriven += trip.totalDistanceKm;
      stats.totalRevenue += finalPayout;

      // Eğer Kurumsal Kontrat Seferi ise kontrat tonajını güncelle
      if (trip.isContract && trip.contractId) {
        activeContracts = activeContracts
          .map((c) => {
            if (c.id !== trip.contractId) return c;
            const newDelivered = +(c.deliveredTons + trip.weightTons).toFixed(1);
            if (newDelivered >= c.totalTonsRequired) {
              cash += c.completionBonus;
              xp += 350;
              reputation = Math.min(100, reputation + 4);
              ledger.unshift({
                id: `led_cnt_${nextId()}`,
                day: nextDay,
                title: `İhale Tamamlama Primi: ${c.clientName}`,
                amount: c.completionBonus,
                type: 'income',
              });
              logs.unshift({
                id: `log_cnt_${nextId()}`,
                time: timeLabel,
                type: 'success',
                text: `🏆 ${c.clientName} kurumsal ihalesi başarıyla tamamlandı! +₺${c.completionBonus.toLocaleString('tr-TR')} prim kasaya eklendi.`,
              });
              return null;
            }
            return { ...c, deliveredTons: newDelivered };
          })
          .filter(Boolean);
      }

      ledger.unshift({
        id: `led_del_${nextId()}`,
        day: nextDay,
        title: `Navlun Tahsilatı: ${trip.vehiclePlate} (${trip.originName}→${trip.destinationName})`,
        amount: finalPayout,
        type: 'income',
      });

      logs.unshift({
        id: `log_del_${nextId()}`,
        time: timeLabel,
        type: 'success',
        text: `✅ ${trip.vehiclePlate} (${trip.driverName}), ${trip.destinationName} iline ulaştı. +₺${finalPayout.toLocaleString('tr-TR')} tahsil edildi!`,
      });

      // Kondisyon aşınması ve otomatik bakım
      const wear = Math.max(1, Math.round(trip.totalDistanceKm / 140));
      vehicles = vehicles.map((v) => {
        if (v.id !== trip.vehicleId) return v;
        let nextCond = Math.max(20, v.condition - wear);
        if (prev.autoMaintain && nextCond < 82) {
          const discount = prev.upgrades.includes('inhouse_workshop') ? 0.65 : 1.0;
          const repCost = Math.round((100 - nextCond) * (v.price * 0.0022) * discount);
          if (cash >= repCost) {
            cash -= repCost;
            nextCond = 100;
          }
        }
        return {
          ...v,
          status: trip.queuedNextTrip ? 'enroute' : 'idle',
          locationId: trip.destinationId,
          condition: nextCond,
          mileageKm: v.mileageKm + trip.totalDistanceKm,
        };
      });

      // EĞER ARACA BAĞLANMIŞ BİR GERİ DÖNÜŞ / SONRAKİ SEFER (queuedNextTrip) VARSA OTOMATİK BAŞLAT!
      if (trip.queuedNextTrip) {
        const q = trip.queuedNextTrip;
        cash -= q.upfrontCost || 0;
        fuelTankLiters = Math.max(0, fuelTankLiters - (q.fromCompanyTank || 0));

        activeTrips.unshift({
          id: `trip_q_${nextId()}`,
          vehicleId: trip.vehicleId,
          vehicleModelId: trip.vehicleModelId,
          vehiclePlate: trip.vehiclePlate,
          vehicleName: trip.vehicleName,
          driverId: trip.driverId,
          driverName: trip.driverName,
          originId: q.originId,
          destinationId: q.destinationId,
          originName: q.originName,
          destinationName: q.destinationName,
          cargoTitle: q.cargoTitle,
          cargoType: q.cargoType,
          weightTons: q.weightTons,
          totalDistanceKm: q.totalDistanceKm,
          distanceCoveredKm: 0,
          speedKmh: trip.speedKmh,
          grossRevenue: q.grossRevenue,
          upfrontCost: q.upfrontCost || 0,
          isContract: false,
          contractId: null,
          startedTotalHours: nowTotalHours,
          deadlineHours: q.deadlineHours || 24,
          restingHoursLeft: 0,
          queuedNextTrip: null,
        });

        logs.unshift({
          id: `log_qstart_${nextId()}`,
          time: timeLabel,
          type: 'info',
          text: `🔄 ${trip.vehiclePlate} (${trip.driverName}), ${q.originName} varışı sonrası beklemeksizin planlanan ${q.originName} → ${q.destinationName} dönüş/devam yüküyle yola çıktı!`,
        });
      } else {
        // Şoförü boşa çıkar
        drivers = drivers.map((d) =>
          d.id === trip.driverId
            ? {
                ...d,
                status: 'idle',
                dailyDrivenHours: (d.dailyDrivenHours || 0) + 1,
                weeklyDrivenHours: (d.weeklyDrivenHours || 0) + 1,
                continuousDrivenHours: 0,
                fatigue: Math.min(95, (d.fatigue || 0) + 2),
                tripsCompleted: d.tripsCompleted + 1,
              }
            : d
        );
      }
    } else {
      // Araç hala yolda -> Şoförün takograf saatlerini 1 saat artır ve mola gereksinimini kontrol et
      let nextRestHours = 0;
      drivers = drivers.map((d) => {
        if (d.id !== trip.driverId) return d;
        const cont = (d.continuousDrivenHours || 0) + 1;
        const daily = (d.dailyDrivenHours || 0) + 1;
        const weekly = (d.weeklyDrivenHours || 0) + 1;

        if (weekly >= 56) {
          // Haftalık 56 saat sürüş doldu -> Zorunlu haftalık dinlenme
          nextRestHours = 12;
          logs.unshift({
            id: `log_tacho_w_${nextId()}`,
            time: timeLabel,
            type: 'warn',
            text: `⏸️ [Takograf] ${trip.vehiclePlate} şoförü ${d.name} haftalık 56 saat sürüş limitini doldurduğu için dinlenme tesisine çekildi (12s zorunlu dinlenme).`,
          });
          return {
            ...d,
            continuousDrivenHours: 0,
            dailyDrivenHours: 0,
            weeklyDrivenHours: 0,
            fatigue: 0,
          };
        }

        if (daily >= 9) {
          // Günlük 9 saat sürüş doldu -> Zorunlu günlük 9 saat takograf dinlenmesi
          nextRestHours = 9;
          logs.unshift({
            id: `log_tacho_d_${nextId()}`,
            time: timeLabel,
            type: 'info',
            text: `⏸️ [Takograf] ${trip.vehiclePlate} şoförü ${d.name} günlük 9 saat yasal sürüş süresini tamamladı (9s zorunlu günlük dinlenme).`,
          });
          return {
            ...d,
            continuousDrivenHours: 0,
            dailyDrivenHours: 0,
            weeklyDrivenHours: weekly,
            fatigue: Math.max(0, (d.fatigue || 0) - 30),
          };
        }

        if (cont >= 5) {
          // 4.5 saat kesintisiz sürüş sonrası 1 saat takograf molası
          nextRestHours = 1;
          return {
            ...d,
            continuousDrivenHours: 0,
            dailyDrivenHours: daily,
            weeklyDrivenHours: weekly,
            fatigue: Math.min(95, (d.fatigue || 0) + 2),
          };
        }

        return {
          ...d,
          continuousDrivenHours: cont,
          dailyDrivenHours: daily,
          weeklyDrivenHours: weekly,
          fatigue: Math.min(95, (d.fatigue || 0) + 3),
        };
      });

      activeTrips.push({
        ...trip,
        distanceCoveredKm: newDist,
        restingHoursLeft: nextRestHours,
      });
    }
  }

  // 2. Boştaki Şoförlerin Saatlik Dinlenmesi
  drivers = drivers.map((d) =>
    d.status === 'idle' && d.fatigue > 0
      ? { ...d, fatigue: Math.max(0, d.fatigue - 10), continuousDrivenHours: 0 }
      : d
  );

  // 3. Süresi Geçen Spot Yükleri Temizle ve Yeni Yükler Ekle
  let currentTierLevel = 1;
  for (const t of COMPANY_TIERS) {
    if (xp >= t.minXP) currentTierLevel = t.level;
  }

  let freightJobs = prev.freightJobs.filter((j) => j.expiresTotalHours > nowTotalHours);

  if (freightJobs.length < 14 || nextHour % 3 === 0) {
    const addCount = Math.max(2, Math.min(5, 16 - freightJobs.length));
    for (let i = 0; i < addCount; i++) {
      freightJobs.unshift(
        generateFreightJob(
          nextId(),
          prev.unlockedCities,
          currentTierLevel,
          nextDay,
          nextHour
        )
      );
    }
  }

  // 4. OTOMATİK OPERASYON (AUTO-DISPATCH) AÇIKSA UYGUN ARAÇLARI YOLA ÇIKAR
  if (prev.autoDispatch) {
    const idleVehicles = vehicles.filter((v) => v.status === 'idle' && v.condition >= 45);
    for (const veh of idleVehicles) {
      const drv = drivers.find(
        (d) =>
          d.status === 'idle' &&
          (d.dailyDrivenHours || 0) < 9 &&
          (d.weeklyDrivenHours || 0) < 56
      );
      if (!drv) break;

      // Önce aracın bulunduğu şehirdeki uygun bir yükü bul
      const matchingJob = freightJobs.find(
        (j) =>
          j.originId === veh.locationId &&
          j.weightTons <= veh.capacityTons &&
          veh.supportedCargo.includes(j.cargoType) &&
          (j.cargoType !== 'adr' || drv.licenses.adr) &&
          (j.cargoType !== 'refrigerated' || drv.licenses.cold) &&
          (j.cargoType !== 'heavy' || drv.licenses.heavy)
      );

      if (matchingJob) {
        const originCity = CITIES.find((c) => c.id === matchingJob.originId);
        const destCity = CITIES.find((c) => c.id === matchingJob.destinationId);
        const liters = Math.round(
          (matchingJob.distanceKm / 100) * veh.fuelLPer100Km * 0.9
        );
        const fromTank = Math.min(fuelTankLiters, liters);
        fuelTankLiters -= fromTank;
        const pumpCost = Math.round((liters - fromTank) * prev.fuelPrice);
        const toll = Math.round(matchingJob.distanceKm * 2.1);
        const upfront = pumpCost + toll;

        cash -= upfront;
        freightJobs = freightJobs.filter((j) => j.id !== matchingJob.id);

        vehicles = vehicles.map((v) =>
          v.id === veh.id ? { ...v, status: 'enroute' } : v
        );
        drivers = drivers.map((d) =>
          d.id === drv.id ? { ...d, status: 'driving' } : d
        );

        activeTrips.unshift({
          id: `trip_auto_${nextId()}`,
          vehicleId: veh.id,
          vehicleModelId: veh.modelId,
          vehiclePlate: veh.plate,
          vehicleName: veh.name,
          driverId: drv.id,
          driverName: drv.name,
          originId: matchingJob.originId,
          destinationId: matchingJob.destinationId,
          originName: originCity?.name || matchingJob.originId,
          destinationName: destCity?.name || matchingJob.destinationId,
          cargoTitle: `${matchingJob.title} (${matchingJob.weightTons}t)`,
          cargoType: matchingJob.cargoType,
          weightTons: matchingJob.weightTons,
          totalDistanceKm: matchingJob.distanceKm,
          distanceCoveredKm: 0,
          speedKmh: veh.speedKmh,
          grossRevenue: matchingJob.payout,
          upfrontCost: upfront,
          isContract: false,
          contractId: null,
          startedTotalHours: nowTotalHours,
          deadlineHours: matchingJob.deadlineHours,
          restingHoursLeft: 0,
          queuedNextTrip: null,
        });

        logs.unshift({
          id: `log_auto_${nextId()}`,
          time: timeLabel,
          type: 'info',
          text: `🤖 [Oto-Operasyon] ${veh.plate} (${drv.name}), ${originCity?.name} → ${destCity?.name} yüküne otomatik atandı.`,
        });
      }
    }
  }

  // 5. GÜN SONU MUHASEBESİ & TAKOGRAF GÜNLÜK/HAFTALIK SIFIRLAMA (Saat 00:00 olduğunda)
  let fuelPrice = prev.fuelPrice;
  let usedVehicles = prev.usedVehicles;
  let contractOffers = prev.contractOffers;
  let candidateDrivers = prev.candidateDrivers;
  let loans = prev.loans;
  let regionalWeather =
    nextHour % 6 === 0
      ? generateRegionalWeather()
      : prev.regionalWeather || generateRegionalWeather();
  let commodityPrices = prev.commodityPrices || generateCommodityPrices();
  let rivals = prev.rivals || INITIAL_RIVAL_COMPANIES;

  if (isNewDay) {
    commodityPrices = generateCommodityPrices();
    rivals = rivals.map((r) => {
      const growth = Math.round((15000 + Math.random() * 45000) / 500) * 500;
      const addFleet = Math.random() < 0.18 ? 1 : 0;
      return {
        ...r,
        netWorth: r.netWorth + growth,
        fleetCount: r.fleetCount + addFleet,
        tonsMoved: r.tonsMoved + Math.round(12 + Math.random() * 28),
      };
    });
    const isNewWeek = nextDay % 7 === 1;
    drivers = drivers.map((d) => ({
      ...d,
      dailyDrivenHours: d.status === 'idle' ? 0 : d.dailyDrivenHours,
      continuousDrivenHours: d.status === 'idle' ? 0 : d.continuousDrivenHours,
      weeklyDrivenHours: isNewWeek ? 0 : d.weeklyDrivenHours || 0,
    }));
    // Antrepo pasif gelirleri
    const depotIncome = Object.values(prev.depots).reduce(
      (sum, d) => sum + (d.dailyIncome || 0),
      0
    );
    // Şoför maaşları ve araç sabit giderleri
    const driverWages = drivers.reduce((sum, d) => sum + d.dailyWage, 0);
    const vehicleFixed = vehicles.reduce(
      (sum, v) => sum + v.dailyFixedCost + (v.insured ? 140 : 0),
      0
    );

    // Kredi taksitleri
    let loanInstallments = 0;
    loans = loans
      .map((l) => {
        loanInstallments += l.dailyInstallment;
        const rem = l.remainingAmount - l.dailyInstallment;
        const dLeft = l.daysLeft - 1;
        if (dLeft <= 0 || rem <= 0) return null;
        return { ...l, remainingAmount: rem, daysLeft: dLeft };
      })
      .filter(Boolean);

    const netDaily = depotIncome - driverWages - vehicleFixed - loanInstallments;
    cash += netDaily;

    ledger.unshift({
      id: `led_day_${nextId()}`,
      day: nextDay,
      title: `Gün Sonu Bilançosu (Antrepo: +₺${depotIncome.toLocaleString('tr-TR')} | Sabit Gider & Maaş: -₺${(
        driverWages +
        vehicleFixed +
        loanInstallments
      ).toLocaleString('tr-TR')})`,
      amount: netDaily,
      type: netDaily >= 0 ? 'income' : 'expense',
    });

    // Mazot fiyat dalgalanması
    const delta = (Math.random() - 0.48) * 2.4;
    fuelPrice = +Math.min(49.5, Math.max(36.8, prev.fuelPrice + delta)).toFixed(2);

    // İkinci el araçlar, aday şoförler ve ihaleleri yenile
    usedVehicles = generateUsedVehicles(currentTierLevel);
    contractOffers = [
      generateContractOffer(nextId(), prev.unlockedCities, currentTierLevel),
      generateContractOffer(nextId(), prev.unlockedCities, currentTierLevel),
      generateContractOffer(nextId(), prev.unlockedCities, currentTierLevel + 1),
    ];
    if (candidateDrivers.length < 4) {
      candidateDrivers = [
        ...candidateDrivers,
        generateDriver(nextId(), currentTierLevel),
        generateDriver(nextId(), currentTierLevel),
      ].slice(0, 5);
    }

    // Aktif kontratların kalan gününü düşür
    activeContracts = activeContracts
      .map((c) => {
        const remDays = c.daysRemaining - 1;
        if (remDays <= 0) {
          cash -= c.penalty;
          reputation = Math.max(10, reputation - 5);
          logs.unshift({
            id: `log_fail_${nextId()}`,
            time: timeLabel,
            type: 'warn',
            text: `⚠️ ${c.clientName} ihalesi süresi içinde tamamlanamadı! -₺${c.penalty.toLocaleString('tr-TR')} ceza kesildi.`,
          });
          return null;
        }
        return { ...c, daysRemaining: remDays };
      })
      .filter(Boolean);
  }

  return {
    ...prev,
    day: nextDay,
    hour: nextHour,
    cash,
    xp,
    reputation,
    fuelPrice,
    fuelTankLiters,
    regionalWeather,
    commodityPrices,
    rivals,
    vehicles,
    usedVehicles,
    drivers,
    candidateDrivers,
    freightJobs: freightJobs.slice(0, 24),
    contractOffers,
    activeContracts,
    activeTrips,
    loans,
    ledger: ledger.slice(0, 60),
    logs: logs.slice(0, 50),
    stats,
  };
}
