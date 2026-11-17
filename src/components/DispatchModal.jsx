import React, { useState, useMemo, useEffect } from 'react';
import { CITIES, CARGO_TYPES, getDistanceKm } from '../data/gameData';
import VehicleIcon, {
  getVehicleTypeShortLabel,
  CargoTypeIcon,
} from './VehicleIcon';
import {
  DriverPixarAvatar,
  VehiclePixarCardBanner,
} from './PixarVisuals';
import {
  X,
  Truck,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
  RotateCcw,
  Clock,
  ArrowRight,
  Coffee,
  Home,
  Compass,
  Lock,
} from 'lucide-react';

export default function DispatchModal({
  job: initialJob,
  contract,
  backhaulTrip, // Yoldaki bir araç için varış ilinden dönüş/sonraki yük seçme modu
  hqCityId,
  vehicles,
  drivers,
  activeTrips = [],
  allJobs = [],
  fuelPrice,
  fuelTankLiters,
  upgrades = [],
  onClose,
  onConfirmDispatch,
  onConfirmQueueNextTrip,
}) {
  // Dönüş Yükü Planlama Modunda 2 ayrı sekme: 'return' (Tam Geri Dönüş) | 'onward' (Başka İllere Devam)
  const [backhaulTab, setBackhaulTab] = useState('return');

  const backhaulVehicle = useMemo(() => {
    if (!backhaulTrip) return null;
    return vehicles.find((v) => v.id === backhaulTrip.vehicleId) || null;
  }, [backhaulTrip, vehicles]);

  // Varış şehrindeki yükleri "Geri Dönüş" ve "Başka İllere Devam" olarak iki net gruba ayır
  const { returnJobs, onwardJobs } = useMemo(() => {
    if (!backhaulTrip) return { returnJobs: [], onwardJobs: [] };
    const cityJobs = allJobs.filter((j) => j.originId === backhaulTrip.destinationId);

    const ret = [];
    const onw = [];

    cityJobs.forEach((j) => {
      const isCompatible =
        backhaulVehicle &&
        backhaulVehicle.supportedCargo.includes(j.cargoType) &&
        backhaulVehicle.capacityTons >= j.weightTons;

      const enriched = {
        ...j,
        isCompatible,
        incompatibilityReason: !backhaulVehicle
          ? 'Araç bulunamadı'
          : !backhaulVehicle.supportedCargo.includes(j.cargoType)
          ? `Dorse Uygun Değil (${CARGO_TYPES[j.cargoType]?.shortName})`
          : backhaulVehicle.capacityTons < j.weightTons
          ? `Tonaj Aşımı (${j.weightTons}t > ${backhaulVehicle.capacityTons}t)`
          : null,
      };

      if (
        j.destinationId === backhaulTrip.originId ||
        (hqCityId && j.destinationId === hqCityId)
      ) {
        ret.push(enriched);
      } else {
        onw.push(enriched);
      }
    });

    // Uygun olanları üste sırala
    ret.sort((a, b) => Number(b.isCompatible) - Number(a.isCompatible) || b.payout - a.payout);
    onw.sort((a, b) => Number(b.isCompatible) - Number(a.isCompatible) || b.payout - a.payout);

    return { returnJobs: ret, onwardJobs: onw };
  }, [backhaulTrip, allJobs, backhaulVehicle, hqCityId]);

  const [selectedBackhaulJobId, setSelectedBackhaulJobId] = useState(null);

  // İlk açılışta veya sekme değiştiğinde ilk UYGUN yükü seç
  useEffect(() => {
    if (!backhaulTrip) return;
    const activeList = backhaulTab === 'return' ? returnJobs : onwardJobs;
    const firstCompatible = activeList.find((j) => j.isCompatible);
    if (firstCompatible) {
      setSelectedBackhaulJobId(firstCompatible.id);
    } else if (backhaulTab === 'return' && onwardJobs.some((j) => j.isCompatible)) {
      setBackhaulTab('onward');
    } else {
      setSelectedBackhaulJobId(null);
    }
  }, [backhaulTrip, backhaulTab, returnJobs.length, onwardJobs.length]);

  const job = backhaulTrip
    ? allJobs.find((j) => j.id === selectedBackhaulJobId) || null
    : initialJob;

  const isContract = Boolean(contract);
  const targetOriginId = isContract
    ? contract.originId
    : backhaulTrip
    ? backhaulTrip.destinationId
    : job?.originId;
  const targetDestId = isContract ? contract.destinationId : job?.destinationId;
  const cargoType = isContract ? contract.cargoType : job?.cargoType || 'standard';
  const distanceKm = isContract
    ? contract.distanceKm
    : job?.distanceKm ||
      (targetOriginId && targetDestId ? getDistanceKm(targetOriginId, targetDestId) : 0);

  const originCity = CITIES.find((c) => c.id === targetOriginId);
  const destCity = CITIES.find((c) => c.id === targetDestId);
  const cargoMeta = CARGO_TYPES[cargoType] || CARGO_TYPES.standard;

  // Uygun araçları bul (Sadece bu işi gerçekten taşıyabilecek araçlar seçilebilir)
  const eligibleVehicles = useMemo(() => {
    if (backhaulTrip) {
      return backhaulVehicle ? [backhaulVehicle] : [];
    }
    if (!job && !isContract) return [];
    return vehicles.filter((v) => {
      if (!v.supportedCargo.includes(cargoType)) return false;
      if (!isContract && v.capacityTons < job.weightTons) return false;

      if (v.status === 'idle') return true;
      const incomingTrip = activeTrips.find(
        (t) =>
          t.vehicleId === v.id &&
          t.destinationId === targetOriginId &&
          !t.queuedNextTrip
      );
      return Boolean(incomingTrip);
    });
  }, [
    vehicles,
    activeTrips,
    cargoType,
    isContract,
    job,
    targetOriginId,
    backhaulTrip,
    backhaulVehicle,
  ]);

  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    if (backhaulTrip) return backhaulTrip.vehicleId;
    const inSameCity = eligibleVehicles.find(
      (v) => v.status === 'idle' && v.locationId === targetOriginId
    );
    if (inSameCity) return inSameCity.id;
    const incoming = eligibleVehicles.find((v) => v.status === 'enroute');
    if (incoming) return incoming.id;
    return eligibleVehicles[0]?.id || '';
  });

  const selectedVehicle = eligibleVehicles.find((v) => v.id === selectedVehicleId);
  const incomingTripForSelectedVehicle = useMemo(() => {
    if (!selectedVehicle || selectedVehicle.status === 'idle') return null;
    return activeTrips.find((t) => t.vehicleId === selectedVehicle.id) || null;
  }, [selectedVehicle, activeTrips]);

  // Uygun şoförleri bul
  const eligibleDrivers = useMemo(() => {
    if (incomingTripForSelectedVehicle) {
      const d = drivers.find(
        (drv) => drv.id === incomingTripForSelectedVehicle.driverId
      );
      return d ? [d] : [];
    }
    return drivers.filter((d) => {
      if (d.status !== 'idle') return false;
      if ((d.dailyDrivenHours || 0) >= 9 || (d.weeklyDrivenHours || 0) >= 56)
        return false;
      if (d.restingHoursLeft > 0) return false;
      if (cargoType === 'adr' && !d.licenses.adr) return false;
      if (cargoType === 'refrigerated' && !d.licenses.cold) return false;
      if (cargoType === 'heavy' && !d.licenses.heavy) return false;
      return true;
    });
  }, [drivers, cargoType, incomingTripForSelectedVehicle]);

  const [selectedDriverId, setSelectedDriverId] = useState(() => {
    if (incomingTripForSelectedVehicle)
      return incomingTripForSelectedVehicle.driverId;
    if (selectedVehicle?.assignedDriverId) {
      const assigned = eligibleDrivers.find(
        (d) => d.id === selectedVehicle.assignedDriverId
      );
      if (assigned) return assigned.id;
    }
    return eligibleDrivers[0]?.id || '';
  });

  // Grupaj / Parsiyel ek yük seçimi (Sadece aynı rotada olan ve aracın desteklediği yükler)
  const [extraJobIds, setExtraJobIds] = useState([]);

  const compatibleConsolidationJobs = useMemo(() => {
    if (isContract || !selectedVehicle || !job) return [];
    return allJobs.filter(
      (j) =>
        j.id !== job.id &&
        j.originId === job.originId &&
        j.destinationId === job.destinationId &&
        selectedVehicle.supportedCargo.includes(j.cargoType)
    );
  }, [allJobs, isContract, selectedVehicle, job]);

  // Sürüş saati, takograf molası ve maliyet hesaplaması
  const calculation = useMemo(() => {
    if (!selectedVehicle || (!job && !isContract)) return null;
    const driver =
      drivers.find((d) => d.id === selectedDriverId) ||
      drivers.find((d) => d.id === incomingTripForSelectedVehicle?.driverId);
    if (!driver) return null;

    const isQueuedForIncoming = Boolean(incomingTripForSelectedVehicle);

    const repositionKm = isQueuedForIncoming
      ? 0
      : selectedVehicle.locationId === targetOriginId
      ? 0
      : getDistanceKm(selectedVehicle.locationId, targetOriginId);

    const totalTripKm = repositionKm + distanceKm;

    let totalWeight = isContract
      ? Math.min(
          selectedVehicle.capacityTons,
          contract.totalTonsRequired - contract.deliveredTons
        )
      : job.weightTons;

    let grossRevenue = isContract
      ? Math.round(totalWeight * contract.rewardPerTon)
      : job.payout;

    const selectedExtras = compatibleConsolidationJobs.filter((j) =>
      extraJobIds.includes(j.id)
    );
    selectedExtras.forEach((ej) => {
      totalWeight += ej.weightTons;
      grossRevenue += ej.payout;
    });

    if (cargoType === 'refrigerated' && upgrades.includes('cold_chain_iso')) {
      grossRevenue = Math.round(grossRevenue * 1.15);
    }
    if (
      (cargoType === 'adr' || cargoType === 'heavy') &&
      upgrades.includes('adr_safety_unit')
    ) {
      grossRevenue = Math.round(grossRevenue * 1.12);
    }

    const telematicsFactor = upgrades.includes('eco_telematics') ? 0.88 : 1.0;
    const driverEcoFactor = Math.max(0.78, 1 - (driver.ecoBonus || 0) / 100);
    const litersNeeded = Math.round(
      (totalTripKm / 100) *
        selectedVehicle.fuelLPer100Km *
        telematicsFactor *
        driverEcoFactor
    );

    const fromCompanyTank = Math.min(fuelTankLiters, litersNeeded);
    const fromPumpLiters = Math.max(0, litersNeeded - fromCompanyTank);
    const pumpFuelCost = Math.round(fromPumpLiters * fuelPrice);

    const highwayToll = Math.round(totalTripKm * 2.1);
    const pureDriveHours = Math.max(
      1,
      +(totalTripKm / selectedVehicle.speedKmh).toFixed(1)
    );

    // Takograf mola simülasyonu
    const startDailyDriven = driver.dailyDrivenHours || 0;
    const totalDailyNeeded = startDailyDriven + pureDriveHours;
    let mandatoryRestHours = 0;
    if (pureDriveHours >= 4.5) mandatoryRestHours += 1;
    if (totalDailyNeeded > 9) mandatoryRestHours += 9;

    const estTotalHours = +(pureDriveHours + mandatoryRestHours).toFixed(1);
    const netProfit = grossRevenue - pumpFuelCost - highwayToll;

    return {
      isQueuedForIncoming,
      repositionKm,
      totalTripKm,
      totalWeight: +totalWeight.toFixed(1),
      grossRevenue,
      litersNeeded,
      fromCompanyTank,
      pumpFuelCost,
      highwayToll,
      pureDriveHours,
      mandatoryRestHours,
      estHours: estTotalHours,
      netProfit,
      overweight: totalWeight > selectedVehicle.capacityTons,
    };
  }, [
    selectedVehicle,
    selectedDriverId,
    drivers,
    incomingTripForSelectedVehicle,
    targetOriginId,
    distanceKm,
    isContract,
    contract,
    job,
    compatibleConsolidationJobs,
    extraJobIds,
    cargoType,
    upgrades,
    fuelTankLiters,
    fuelPrice,
  ]);

  const toggleExtraJob = (ej) => {
    if (!selectedVehicle || !calculation) return;
    const alreadySelected = extraJobIds.includes(ej.id);
    if (alreadySelected) {
      setExtraJobIds((prev) => prev.filter((item) => item !== ej.id));
    } else {
      // Eğer bu ek yük aracın kalan tonajını aşıyorsa seçilemesin!
      if (calculation.totalWeight + ej.weightTons > selectedVehicle.capacityTons) {
        return;
      }
      setExtraJobIds((prev) => [...prev, ej.id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Başlık */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              {backhaulTrip
                ? `${backhaulTrip.vehiclePlate} (${getVehicleTypeShortLabel(
                    backhaulTrip.vehicleModelId
                  )}) İçin Varış İli Yük Planlama`
                : isContract
                ? 'Kurumsal Kontrat Sevkiyatı'
                : 'Sevkiyat & Takograf Planlama'}
            </span>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
              {originCity?.name || 'Çıkış'} <ArrowRight className="w-4 h-4 text-amber-400" />{' '}
              {destCity?.name || 'Hedef İl Seçin'}
              {distanceKm > 0 && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                  {distanceKm} km
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* EĞER YOLDAKİ ARAÇ İÇİN DÖNÜŞ/DEVAM YÜKÜ SEÇME MODUNDAYSAK: 2 AYRI NET SEKME */}
          {backhaulTrip && (
            <div className="space-y-3">
              {/* Sekme Butonları: Geri Dönüş vs Başka İllere Devam */}
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBackhaulTab('return')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    backhaulTab === 'return'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Geri Dönüş Yükleri ({returnJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBackhaulTab('onward')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                    backhaulTab === 'onward'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Başka İllere Devam ({onwardJobs.length})
                </button>
              </div>

              {/* Seçili Sekmedeki Yük Listesi */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(backhaulTab === 'return' ? returnJobs : onwardJobs).map(
                  (candJob) => {
                    const cDest = CITIES.find((c) => c.id === candJob.destinationId);
                    const cMeta = CARGO_TYPES[candJob.cargoType] || CARGO_TYPES.standard;
                    const active = candJob.id === selectedBackhaulJobId;
                    const disabled = !candJob.isCompatible;

                    return (
                      <button
                        key={candJob.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setSelectedBackhaulJobId(candJob.id);
                          setExtraJobIds([]);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          disabled
                            ? 'bg-slate-950/40 border-slate-800/50 opacity-45 cursor-not-allowed'
                            : active
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-white flex items-center gap-1">
                              {originCity?.name}
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                              {cDest?.name}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${cMeta.color}`}
                            >
                              <CargoTypeIcon
                                cargoType={candJob.cargoType}
                                className="w-3 h-3"
                              />
                              {cMeta.shortName} • {candJob.weightTons}t
                            </span>
                            {disabled && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                {candJob.incompatibilityReason}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {candJob.clientName} •{' '}
                            <strong className="text-slate-200">{candJob.title}</strong> ({candJob.distanceKm} km)
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-extrabold text-emerald-400 text-sm">
                            ₺{candJob.payout.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {disabled ? 'Seçilemez' : active ? '✓ Seçildi' : 'Seç'}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Seçili Yük Özeti */}
          {(job || isContract) && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl border ${cargoMeta.color}`}>
                  <CargoTypeIcon cargoType={cargoType} className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">
                    {isContract ? contract.clientName : job.clientName}
                  </div>
                  <div className="text-base font-bold text-slate-100">
                    {isContract ? contract.title : job.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cargoMeta.color}`}
                    >
                      {cargoMeta.name}
                    </span>
                    <span className="text-xs text-slate-300 font-mono font-bold">
                      📦{' '}
                      {isContract
                        ? `Kalan: ${(
                            contract.totalTonsRequired - contract.deliveredTons
                          ).toFixed(1)} Ton`
                        : `${job.weightTons} Ton`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Navlun Bedeli</div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  ₺
                  {(isContract
                    ? Math.round(
                        Math.min(
                          selectedVehicle?.capacityTons || 10,
                          contract.totalTonsRequired - contract.deliveredTons
                        ) * contract.rewardPerTon
                      )
                    : job.payout
                  ).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          )}

          {/* 1. Araç Seçimi */}
          {!backhaulTrip && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                1. Uygun Filo Aracı Seçin ({eligibleVehicles.length} Uygun Araç)
              </label>
              {eligibleVehicles.length === 0 ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Bu yükü taşıyabilecek boşta veya {originCity?.name} yönüne gelmekte olan uygun aracınız yok.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {eligibleVehicles.map((v) => {
                    const inOrigin =
                      v.status === 'idle' && v.locationId === targetOriginId;
                    const incTrip = activeTrips.find(
                      (t) =>
                        t.vehicleId === v.id &&
                        t.destinationId === targetOriginId
                    );
                    const vCity = CITIES.find((c) => c.id === v.locationId);
                    const isSelected = v.id === selectedVehicleId;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          if (incTrip) {
                            setSelectedDriverId(incTrip.driverId);
                          }
                          setExtraJobIds([]);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <VehiclePixarCardBanner
                          modelId={v.modelId}
                          name={v.name}
                          plate={v.plate}
                          condition={v.condition}
                          heightClass="h-24"
                        />
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                          <span>Kapasite: {v.capacityTons}t</span>
                          <span
                            className={`font-semibold ${
                              inOrigin
                                ? 'text-emerald-400'
                                : incTrip
                                ? 'text-sky-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {inOrigin
                              ? `📍 ${vCity?.name} (Hazır)`
                              : incTrip
                              ? `🔄 ${originCity?.name} Yolunda`
                              : `📍 ${vCity?.name} (İntikal)`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Şoför ve Takograf Sürüş Saatleri Kontrolü */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-400" />
              2. Şoför & Takograf Sürüş Saatleri Kontrolü (Günlük Maks 9s / Haftalık 56s)
            </label>
            {eligibleDrivers.length === 0 ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Takograf sürüş saati uygun ve gerekli sertifikaya sahip boşta şoför bulunmuyor.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {eligibleDrivers.map((d) => {
                  const isSelected = d.id === selectedDriverId;
                  const dailyUsed = +(d.dailyDrivenHours || 0).toFixed(1);
                  const weeklyUsed = +(d.weeklyDrivenHours || 0).toFixed(1);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDriverId(d.id)}
                      className={`text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-400 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <DriverPixarAvatar driver={d} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm truncate">{d.name}</span>
                          <span className="text-xs text-amber-400 shrink-0">
                            {'★'.repeat(d.skill)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 mt-1.5 font-mono">
                          <div className="bg-slate-900/90 px-1.5 py-1 rounded">
                            Gün:{' '}
                            <strong
                              className={
                                dailyUsed >= 7
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }
                            >
                              {dailyUsed}/9s
                            </strong>
                          </div>
                          <div className="bg-slate-900/90 px-1.5 py-1 rounded">
                            Hafta: <strong>{weeklyUsed}/56s</strong>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Parsiyel / Grupaj Ek Yük Birleştirme (Kapasiteyi aşanlar kilitli/seçilemez!) */}
          {!isContract &&
            compatibleConsolidationJobs.length > 0 &&
            selectedVehicle &&
            calculation && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Parsiyel / Grupaj Yük Birleştirme (Aynı Rotadaki Ek Yükler)
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Doluluk: {calculation.totalWeight} / {selectedVehicle.capacityTons} Ton
                  </span>
                </div>
                <div className="space-y-2">
                  {compatibleConsolidationJobs.map((ej) => {
                    const checked = extraJobIds.includes(ej.id);
                    const wouldExceed =
                      !checked &&
                      calculation.totalWeight + ej.weightTons >
                        selectedVehicle.capacityTons;

                    return (
                      <button
                        key={ej.id}
                        type="button"
                        disabled={wouldExceed}
                        onClick={() => toggleExtraJob(ej)}
                        className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          wouldExceed
                            ? 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-50 cursor-not-allowed'
                            : checked
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ej.title}</span>
                          <span className="text-slate-400">({ej.weightTons} Ton)</span>
                          {wouldExceed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                              🔒 Tonaj Sınırını Aşar
                            </span>
                          )}
                        </div>
                        <div className="font-mono font-bold text-emerald-400">
                          +₺{ej.payout.toLocaleString('tr-TR')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* 4. Takograf & Maliyet Hesaplaması */}
          {calculation && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Sefer & Takograf Sürüş Simülasyonu</span>
                {calculation.isQueuedForIncoming && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    🔄 Varışta Otomatik Başlayacak
                  </span>
                )}
              </div>

              {calculation.repositionKm > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>
                    Boş İntikal Mesafesi ({selectedVehicle.locationId} → {originCity?.name}):
                  </span>
                  <span className="font-mono">+{calculation.repositionKm} km</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Net Sürüş Süresi (1 Oyun Saati = 1 Gerçek Dk):</span>
                <span className="font-mono text-slate-200">
                  {calculation.pureDriveHours} Saat ({calculation.pureDriveHours} Dk Gerçek Süre)
                </span>
              </div>

              {calculation.mandatoryRestHours > 0 && (
                <div className="flex justify-between text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/30">
                  <span className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    Takograf Zorunlu Mola / Günlük Dinlenme:
                  </span>
                  <span className="font-mono font-bold">
                    +{calculation.mandatoryRestHours} Saat Mola
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Toplam Tahmini Varış Süresi:</span>
                <span className="font-mono font-bold text-white">
                  {calculation.estHours} Oyun Saati
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Yakıt ({calculation.litersNeeded} L) & Otoyol Gideri:</span>
                <span className="font-mono text-rose-400">
                  -₺{(calculation.pumpFuelCost + calculation.highwayToll).toLocaleString('tr-TR')}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-200">Tahmini Net Sefer Kârı:</span>
                <span className="text-lg font-mono text-emerald-400">
                  +₺{calculation.netProfit.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="px-6 py-4 bg-slate-950/95 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={!calculation || calculation.overweight}
            onClick={() => {
              if (calculation.isQueuedForIncoming && incomingTripForSelectedVehicle) {
                onConfirmQueueNextTrip({
                  activeTripId: incomingTripForSelectedVehicle.id,
                  job,
                  extraJobIds,
                  calculation,
                });
              } else {
                onConfirmDispatch({
                  vehicleId: selectedVehicleId,
                  driverId: selectedDriverId,
                  job,
                  contract,
                  extraJobIds,
                  calculation,
                });
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            {calculation?.isQueuedForIncoming
              ? `🔄 ${originCity?.name} Varışına Dönüş/Devam Yükü Bağla`
              : 'Seferi Başlat & Yola Çıkar'}
          </button>
        </div>
      </div>
    </div>
  );
}
