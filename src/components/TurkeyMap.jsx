import React from 'react';
import { CITIES, HIGHWAY_LINKS, WEATHER_TYPES } from '../data/gameData';
import VehicleIcon, {
  MapSvgVehicleShape,
  getVehicleTypeShortLabel,
} from './VehicleIcon';
import {
  Navigation,
  RotateCcw,
  ArrowRight,
  Clock,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

export default function TurkeyMap({
  unlockedCities,
  depots,
  vehicles,
  activeTrips,
  freightJobs,
  regionalWeather = {},
  selectedCityId,
  onSelectCity,
  onSelectTrip,
  selectedTripId,
  onPlanNextLoadForCity,
}) {
  const cityMap = React.useMemo(() => {
    const m = {};
    CITIES.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, []);

  // Her şehirdeki bekleyen işler, park halindeki araçlar ve o şehre gelmekte olan araçlar
  const cityStats = React.useMemo(() => {
    const stats = {};
    CITIES.forEach((c) => {
      stats[c.id] = {
        jobsOut: 0,
        idleVehicles: [],
        incomingTrips: [],
      };
    });
    freightJobs.forEach((j) => {
      if (stats[j.originId]) stats[j.originId].jobsOut += 1;
    });
    vehicles.forEach((v) => {
      if (v.status === 'idle' && stats[v.locationId]) {
        stats[v.locationId].idleVehicles.push(v);
      }
    });
    activeTrips.forEach((t) => {
      if (stats[t.destinationId]) {
        stats[t.destinationId].incomingTrips.push(t);
      }
    });
    return stats;
  }, [freightJobs, vehicles, activeTrips]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Üst Harita Bilgi Çubuğu */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            CANLI FİLO & İL KONUM HARİTASI
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            {activeTrips.length} Yolda • {vehicles.filter((v) => v.status === 'idle').length} İlde Bekliyor
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 pointer-events-auto shadow-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />
            İldeki Hazır Araç
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_#38bdf8]" />
            Seferdeki Araç
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Takograf Molasında
          </span>
          {selectedCityId && (
            <button
              onClick={() => onSelectCity(null)}
              className="ml-1 text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Tüm Türkiye
            </button>
          )}
        </div>
      </div>

      {/* SVG Harita Alanı */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.7"
                strokeOpacity="0.55"
              />
            </pattern>
            <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#mapGlow)" />
          <rect width="1000" height="500" fill="url(#gridPattern)" />

          <text x="480" y="42" fill="#1e3a5f" fontSize="13" fontWeight="700" letterSpacing="6" textAnchor="middle">
            KARADENİZ
          </text>
          <text x="45" y="240" fill="#1e3a5f" fontSize="11" fontWeight="700" letterSpacing="4" textAnchor="middle" transform="rotate(-90 45 240)">
            EGE DENİZİ
          </text>
          <text x="350" y="472" fill="#1e3a5f" fontSize="13" fontWeight="700" letterSpacing="6" textAnchor="middle">
            AKDENİZ
          </text>

          {/* Türkiye Stilize Kara Silüeti */}
          <path
            d="M 95,95 L 175,85 L 220,105 L 285,108 L 365,88 L 460,72 L 545,92 L 645,98 L 755,85 L 845,95 L 915,145 L 935,235 L 925,325 L 860,355 L 785,375 L 705,405 L 610,405 L 540,400 L 495,425 L 430,415 L 350,410 L 285,425 L 220,405 L 155,375 L 95,335 L 85,255 L 105,185 L 165,155 L 105,135 Z"
            fill="url(#landGrad)"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <ellipse cx="195" cy="145" rx="38" ry="14" fill="#091326" stroke="#1e293b" strokeWidth="1" />
          <ellipse cx="855" cy="278" rx="22" ry="13" fill="#0c1e36" stroke="#1e3a5f" strokeWidth="1" />
          <ellipse cx="425" cy="255" rx="14" ry="22" fill="#0c1e36" stroke="#1e3a5f" strokeWidth="1" />

          {/* Karayolu Bağlantıları */}
          {HIGHWAY_LINKS.map(([fromId, toId], idx) => {
            const c1 = cityMap[fromId];
            const c2 = cityMap[toId];
            if (!c1 || !c2) return null;
            const bothUnlocked =
              unlockedCities.includes(fromId) && unlockedCities.includes(toId);
            return (
              <line
                key={idx}
                x1={c1.x}
                y1={c1.y}
                x2={c2.x}
                y2={c2.y}
                stroke={bothUnlocked ? '#475569' : '#1e293b'}
                strokeWidth={bothUnlocked ? '2.2' : '1.3'}
                strokeDasharray={bothUnlocked ? 'none' : '4 4'}
              />
            );
          })}

          {/* Aktif Seferlerin Rota Çizgileri ve Varsa Planlanmış Sonraki (Dönüş) Rota Çizgisi */}
          {activeTrips.map((trip) => {
            const origin = cityMap[trip.originId];
            const dest = cityMap[trip.destinationId];
            if (!origin || !dest) return null;
            const isSelected = selectedTripId === trip.id;
            const queuedDest = trip.queuedNextTrip
              ? cityMap[trip.queuedNextTrip.destinationId]
              : null;

            return (
              <g key={`route_${trip.id}`}>
                <line
                  x1={origin.x}
                  y1={origin.y}
                  x2={dest.x}
                  y2={dest.y}
                  stroke={isSelected ? '#f59e0b' : '#38bdf8'}
                  strokeWidth={isSelected ? '3.5' : '2.2'}
                  strokeDasharray="6 4"
                  strokeOpacity="0.85"
                />
                {/* Planlanmış Dönüş / Sonraki Rota Çizgisi (Yeşil Noktalı) */}
                {queuedDest && (
                  <line
                    x1={dest.x}
                    y1={dest.y}
                    x2={queuedDest.x}
                    y2={queuedDest.y}
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.9"
                  />
                )}
              </g>
            );
          })}

          {/* Şehir Noktaları ve Şehirlerde Bekleyen Araç İkonları */}
          {CITIES.map((city) => {
            const isUnlocked = unlockedCities.includes(city.id);
            const hasDepot = Boolean(depots[city.id]);
            const isSelected = selectedCityId === city.id;
            const stat = cityStats[city.id] || {
              jobsOut: 0,
              idleVehicles: [],
              incomingTrips: [],
            };
            const firstIdle = stat.idleVehicles[0];
            const wKey = regionalWeather[city.region] || 'sunny';
            const wObj = WEATHER_TYPES[wKey] || WEATHER_TYPES.sunny;

            return (
              <g
                key={city.id}
                transform={`translate(${city.x}, ${city.y})`}
                onClick={() => onSelectCity(city.id === selectedCityId ? null : city.id)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle
                    r="22"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}

                {isUnlocked && (
                  <circle
                    r={hasDepot ? '14' : '11'}
                    fill={hasDepot ? '#10b981' : '#38bdf8'}
                    fillOpacity="0.18"
                  />
                )}

                <circle
                  r={hasDepot ? '7' : isUnlocked ? '5.5' : '4'}
                  fill={
                    isSelected
                      ? '#f59e0b'
                      : hasDepot
                      ? '#10b981'
                      : isUnlocked
                      ? '#38bdf8'
                      : '#475569'
                  }
                  stroke="#020617"
                  strokeWidth="2"
                />

                {/* Şehir İsmi + Hava Durumu Emojisi */}
                <text
                  y={hasDepot ? 18 : 15}
                  textAnchor="middle"
                  fill={isSelected ? '#fbbf24' : isUnlocked ? '#f1f5f9' : '#64748b'}
                  fontSize={isSelected ? '11.5' : '10'}
                  fontWeight={isUnlocked || isSelected ? '700' : '500'}
                >
                  {city.name} {wKey !== 'sunny' ? wObj.emoji : ''}
                </text>

                {/* İLDE BEKLEYEN ARAÇLARIN HARİTA ÜZERİNDEKİ ARAÇ TÜRÜ İKONU VE SAYISI */}
                {stat.idleVehicles.length > 0 && (
                  <g transform="translate(0, -21)">
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="17"
                      rx="5"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <g transform="translate(-7, -2) scale(0.75)">
                      <MapSvgVehicleShape
                        modelId={firstIdle.modelId}
                        color="#34d399"
                      />
                    </g>
                    <text
                      x="13"
                      y="1.5"
                      textAnchor="middle"
                      fill="#ecfdf5"
                      fontSize="9.5"
                      fontWeight="800"
                    >
                      {stat.idleVehicles.length}
                    </text>
                  </g>
                )}

                {/* Bekleyen Yük Sayısı Rozeti */}
                {isUnlocked && stat.jobsOut > 0 && (
                  <g transform="translate(18, -5)">
                    <rect
                      x="0"
                      y="-7"
                      width="22"
                      height="13"
                      rx="3.5"
                      fill="#0f172a"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x="11"
                      y="2.5"
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="8"
                      fontWeight="700"
                    >
                      {stat.jobsOut}Y
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Yoldaki Canlı Araçlar (Araç Türü Silüet İkonu + Plaka + Takograf Mola Durumu) */}
          {activeTrips.map((trip) => {
            const origin = cityMap[trip.originId];
            const dest = cityMap[trip.destinationId];
            if (!origin || !dest) return null;

            const ratio = Math.min(
              1,
              Math.max(0, trip.distanceCoveredKm / trip.totalDistanceKm)
            );
            const curX = origin.x + (dest.x - origin.x) * ratio;
            const curY = origin.y + (dest.y - origin.y) * ratio;
            const isSelected = selectedTripId === trip.id;
            const isResting = trip.restingHoursLeft > 0;

            return (
              <g
                key={`veh_${trip.id}`}
                transform={`translate(${curX}, ${curY})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrip(trip.id === selectedTripId ? null : trip.id);
                }}
                className="cursor-pointer"
              >
                <circle
                  r="16"
                  fill={isResting ? '#f59e0b' : isSelected ? '#f59e0b' : '#0ea5e9'}
                  fillOpacity="0.22"
                  className="animate-pulse-ring"
                />

                {/* Araç Kapsülü */}
                <rect
                  x="-22"
                  y="-12"
                  width="44"
                  height="21"
                  rx="6"
                  fill={
                    isResting
                      ? '#451a03'
                      : isSelected
                      ? '#f59e0b'
                      : '#0f172a'
                  }
                  stroke={
                    isResting
                      ? '#fbbf24'
                      : isSelected
                      ? '#fef08a'
                      : '#38bdf8'
                  }
                  strokeWidth="1.8"
                />

                {/* Araç Türüne Özel Silüet İkonu */}
                <g transform="translate(0, -2) scale(0.95)">
                  <MapSvgVehicleShape
                    modelId={trip.vehicleModelId}
                    color={
                      isResting
                        ? '#fbbf24'
                        : isSelected
                        ? '#020617'
                        : '#38bdf8'
                    }
                  />
                </g>

                {/* Üst Plaka ve Durum Etiketi */}
                <rect
                  x="-26"
                  y="-25"
                  width="52"
                  height="11"
                  rx="3"
                  fill="#020617"
                  fillOpacity="0.9"
                />
                <text
                  x="0"
                  y="-17"
                  textAnchor="middle"
                  fill={isResting ? '#fbbf24' : '#f8fafc'}
                  fontSize="7.8"
                  fontWeight="800"
                >
                  {isResting ? `⏸️ MOLA (${trip.restingHoursLeft}s)` : trip.vehiclePlate}
                </text>

                {/* Alt İlerleme & Dönüş Yükü İşareti */}
                <text
                  x="0"
                  y="18"
                  textAnchor="middle"
                  fill={trip.queuedNextTrip ? '#34d399' : '#bae6fd'}
                  fontSize="8"
                  fontWeight="800"
                >
                  %{Math.round(ratio * 100)}
                  {trip.queuedNextTrip ? ' • 🔄DönüşHazır' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Alt Seçili İl Araç Envanteri & Gelen Araçlar Çubuğu */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 text-xs">
        {selectedCityId ? (
          (() => {
            const c = cityMap[selectedCityId];
            const stat = cityStats[c.id] || {
              jobsOut: 0,
              idleVehicles: [],
              incomingTrips: [],
            };
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      📍 {c.name} İlindeki Filo Durumu
                    </span>
                    <span className="text-slate-400">
                      Bekleyen Yük: <strong className="text-amber-300">{stat.jobsOut}</strong>
                    </span>
                  </div>

                  {onPlanNextLoadForCity && (
                    <button
                      onClick={() => onPlanNextLoadForCity(c.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      {c.name} Çıkışlı Yükleri Gör ({stat.jobsOut}) →
                    </button>
                  )}
                </div>

                {/* İldeki Hazır Araçlar ve Bu İle Gelen Araçlar */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {stat.idleVehicles.length === 0 && stat.incomingTrips.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">
                      Şu an {c.name} ilinde bekleyen veya buraya gelmekte olan aracınız yok.
                    </span>
                  ) : (
                    <>
                      {stat.idleVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200"
                        >
                          <VehicleIcon modelId={v.modelId} className="w-5 h-4 text-emerald-400" />
                          <span className="font-mono font-bold text-[11px]">{v.plate}</span>
                          <span className="text-[10px] text-emerald-300/80">
                            ({getVehicleTypeShortLabel(v.modelId)} • {v.capacityTons}t • Hazır)
                          </span>
                        </div>
                      ))}

                      {stat.incomingTrips.map((t) => {
                        const remKm = Math.max(0, t.totalDistanceKm - t.distanceCoveredKm);
                        const eta = Math.ceil(remKm / t.speedKmh) + (t.restingHoursLeft || 0);
                        return (
                          <div
                            key={t.id}
                            onClick={() => onSelectTrip(t.id)}
                            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-200 cursor-pointer hover:bg-sky-500/25"
                          >
                            <VehicleIcon
                              modelId={t.vehicleModelId}
                              className="w-5 h-4 text-sky-400"
                            />
                            <span className="font-mono font-bold text-[11px]">
                              {t.vehiclePlate}
                            </span>
                            <span className="text-[10px] text-sky-300">
                              ({c.name}’ya geliyor • ~{eta} sa kaldı
                              {t.queuedNextTrip ? ' • 🔄Dönüş Bağlandı' : ' • Dönüş Yükü Seç'})
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
            <span>
              Haritadaki <strong className="text-emerald-400">yeşil araç ikonları</strong> o ilde bekleyen araçlarınızı, <strong className="text-sky-400">mavi ikonlar</strong> yoldaki araçlarınızı gösterir. Bir ile veya araca tıklayarak dönüş/sonraki yükünü planlayabilirsiniz.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
