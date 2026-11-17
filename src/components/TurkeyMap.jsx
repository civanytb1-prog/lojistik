import React, { useState } from 'react';
import { CITIES, HIGHWAY_LINKS, WEATHER_TYPES } from '../data/gameData';
import {
  THRACE_PATH,
  ANATOLIA_PATH,
  CYPRUS_PATH,
  LAKES,
  REGION_BORDERS,
  HIGHWAY_SHIELDS,
} from '../data/turkeyGeoPaths';
import VehicleIcon, {
  MapSvgVehicleShape,
  getVehicleTypeShortLabel,
} from './VehicleIcon';
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
} from 'lucide-react';

const CAMERA_PRESETS = {
  all: { label: 'Tüm Türkiye', viewBox: '0 0 1000 500' },
  west: { label: 'Marmara & Ege', viewBox: '40 40 460 390' },
  central: { label: 'İç Anadolu & Akdeniz', viewBox: '230 80 480 380' },
  east: { label: 'Karadeniz & Doğu', viewBox: '470 40 500 390' },
};

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
  const [cameraPreset, setCameraPreset] = useState('all');

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

  const currentViewBox =
    CAMERA_PRESETS[cameraPreset]?.viewBox || CAMERA_PRESETS.all.viewBox;

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Üst Harita Bilgi ve Kamera Odak Çubuğu */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold tracking-wide text-slate-100">
            TÜRKİYE KARAYOLLARI & CANLI FİLO HARİTASI
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            {activeTrips.length} Yolda •{' '}
            {vehicles.filter((v) => v.status === 'idle').length} İlde Bekliyor
          </span>
        </div>

        {/* Bölge Yakınlaştırma (Zoom Preset) Butonları */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl text-[11px] text-slate-300 pointer-events-auto shadow-lg">
          {Object.entries(CAMERA_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCameraPreset(key)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                cameraPreset === key
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
          {selectedCityId && (
            <button
              onClick={() => onSelectCity(null)}
              className="ml-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold"
            >
              Filtreyi Kaldır
            </button>
          )}
        </div>
      </div>

      {/* SVG Gerçek Coğrafi Harita Alanı */}
      <div className="relative flex-1 w-full h-full min-h-[320px]">
        <svg
          viewBox={currentViewBox}
          className="w-full h-full object-contain transition-all duration-500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Deniz Derinlik Gradyanı */}
            <radialGradient id="seaDepth" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#0c1e35" />
              <stop offset="60%" stopColor="#071324" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Anadolu Topografik Kara Gradyanı */}
            <linearGradient id="anatoliaLand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#17253b" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Kıyı Sahil Parlama Efekti */}
            <filter id="coastGlow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="5"
                floodColor="#0ea5e9"
                floodOpacity="0.22"
              />
            </filter>

            <pattern
              id="radarGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="0.6"
                strokeOpacity="0.35"
              />
            </pattern>
          </defs>

          {/* Deniz Arka Planı & Koordinat Izgarası */}
          <rect width="1000" height="500" fill="url(#seaDepth)" />
          <rect width="1000" height="500" fill="url(#radarGrid)" />

          {/* Deniz ve Komşu Coğrafya Etiketleri */}
          <text
            x="450"
            y="28"
            fill="#1e40af"
            fillOpacity="0.55"
            fontSize="13"
            fontWeight="800"
            letterSpacing="8"
            textAnchor="middle"
          >
            KARADENİZ (BLACK SEA)
          </text>
          <text
            x="38"
            y="265"
            fill="#1e40af"
            fillOpacity="0.55"
            fontSize="11"
            fontWeight="800"
            letterSpacing="5"
            textAnchor="middle"
            transform="rotate(-90 38 265)"
          >
            EGE DENİZİ
          </text>
          <text
            x="325"
            y="475"
            fill="#1e40af"
            fillOpacity="0.55"
            fontSize="13"
            fontWeight="800"
            letterSpacing="8"
            textAnchor="middle"
          >
            AKDENİZ (MEDITERRANEAN)
          </text>
          <text
            x="175"
            y="145"
            fill="#38bdf8"
            fillOpacity="0.35"
            fontSize="7.5"
            fontWeight="700"
            letterSpacing="1.5"
            textAnchor="middle"
          >
            MARMARA
          </text>

          {/* Kıbrıs Adası */}
          <path
            d={CYPRUS_PATH}
            fill="#162032"
            stroke="#334155"
            strokeWidth="1.2"
          />
          <text
            x="452"
            y="478"
            fill="#475569"
            fontSize="7.5"
            fontWeight="700"
            textAnchor="middle"
          >
            KIBRIS
          </text>

          {/* GERÇEK TÜRKİYE COĞRAFİ KARA ÇİZİMİ: TRAKYA + ANADOLU */}
          <g filter="url(#coastGlow)">
            {/* Trakya (Avrupa Yakası) */}
            <path
              d={THRACE_PATH}
              fill="url(#anatoliaLand)"
              stroke="#38bdf8"
              strokeOpacity="0.55"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Anadolu (Asya Yakası) */}
            <path
              d={ANATOLIA_PATH}
              fill="url(#anatoliaLand)"
              stroke="#38bdf8"
              strokeOpacity="0.55"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>

          {/* 7 Coğrafi Bölge İç Sınır Çizgileri */}
          {REGION_BORDERS.map((dPath, i) => (
            <path
              key={`reg_border_${i}`}
              d={dPath}
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="5 5"
              strokeOpacity="0.7"
            />
          ))}

          {/* Coğrafi Bölge Filigran İsimleri */}
          <g fill="#475569" fillOpacity="0.38" fontSize="11" fontWeight="800" letterSpacing="2">
            <text x="175" y="195" textAnchor="middle">MARMARA</text>
            <text x="175" y="295" textAnchor="middle">EGE</text>
            <text x="415" y="235" textAnchor="middle">İÇ ANADOLU</text>
            <text x="385" y="375" textAnchor="middle">AKDENİZ</text>
            <text x="615" y="135" textAnchor="middle">KARADENİZ</text>
            <text x="785" y="235" textAnchor="middle">DOĞU ANADOLU</text>
            <text x="695" y="355" textAnchor="middle">GÜNEYDOĞU</text>
          </g>

          {/* Büyük Göller (Van Gölü, Tuz Gölü, Beyşehir, Eğirdir, İznik) */}
          {LAKES.map((lake) => (
            <path
              key={lake.id}
              d={lake.path}
              fill="#082f49"
              stroke="#0284c7"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          ))}

          {/* Karayolu ve Otoyol Ağları */}
          {HIGHWAY_LINKS.map(([fromId, toId], idx) => {
            const c1 = cityMap[fromId];
            const c2 = cityMap[toId];
            if (!c1 || !c2) return null;
            const bothUnlocked =
              unlockedCities.includes(fromId) && unlockedCities.includes(toId);
            return (
              <g key={idx}>
                {/* Otoyol dış gölgesi */}
                {bothUnlocked && (
                  <line
                    x1={c1.x}
                    y1={c1.y}
                    x2={c2.x}
                    y2={c2.y}
                    stroke="#0f172a"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                )}
                <line
                  x1={c1.x}
                  y1={c1.y}
                  x2={c2.x}
                  y2={c2.y}
                  stroke={bothUnlocked ? '#64748b' : '#1e293b'}
                  strokeWidth={bothUnlocked ? '2.2' : '1.3'}
                  strokeDasharray={bothUnlocked ? 'none' : '4 4'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Otoyol Tabela Rozetleri (O-4, O-5, O-21, D-100, D-400) */}
          {HIGHWAY_SHIELDS.map((sh, i) => (
            <g key={i} transform={`translate(${sh.x}, ${sh.y})`}>
              <rect
                x="-13"
                y="-6"
                width="26"
                height="11"
                rx="2.5"
                fill="#0f172a"
                stroke={sh.color}
                strokeWidth="1"
                strokeOpacity="0.75"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fill={sh.color}
                fontSize="6.8"
                fontWeight="800"
              >
                {sh.code}
              </text>
            </g>
          ))}

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
                  strokeWidth={isSelected ? '3.5' : '2.4'}
                  strokeDasharray="6 4"
                  strokeOpacity="0.9"
                />
                {queuedDest && (
                  <line
                    x1={dest.x}
                    y1={dest.y}
                    x2={queuedDest.x}
                    y2={queuedDest.y}
                    stroke="#10b981"
                    strokeWidth="2.4"
                    strokeDasharray="3 3"
                    strokeOpacity="0.95"
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
                onClick={() =>
                  onSelectCity(city.id === selectedCityId ? null : city.id)
                }
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle
                    r="22"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.2"
                    strokeDasharray="4 2"
                  />
                )}

                {isUnlocked && (
                  <circle
                    r={hasDepot ? '14' : '11'}
                    fill={hasDepot ? '#10b981' : '#38bdf8'}
                    fillOpacity="0.2"
                  />
                )}

                <circle
                  r={hasDepot ? '7' : isUnlocked ? '5.5' : '4.2'}
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
                  fill={
                    isSelected ? '#fbbf24' : isUnlocked ? '#f8fafc' : '#64748b'
                  }
                  fontSize={isSelected ? '11.5' : '10'}
                  fontWeight={isUnlocked || isSelected ? '800' : '600'}
                  style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.95)' }}
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

          {/* Yoldaki Canlı Araçlar */}
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
                  fill={
                    isResting ? '#f59e0b' : isSelected ? '#f59e0b' : '#0ea5e9'
                  }
                  fillOpacity="0.22"
                  className="animate-pulse-ring"
                />

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
                  {isResting
                    ? `⏸️ MOLA (${trip.restingHoursLeft}s)`
                    : trip.vehiclePlate}
                </text>

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
                      Bekleyen Yük:{' '}
                      <strong className="text-amber-300">{stat.jobsOut}</strong>
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

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {stat.idleVehicles.length === 0 &&
                  stat.incomingTrips.length === 0 ? (
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
                          <VehicleIcon
                            modelId={v.modelId}
                            className="w-5 h-4 text-emerald-400"
                          />
                          <span className="font-mono font-bold text-[11px]">
                            {v.plate}
                          </span>
                          <span className="text-[10px] text-emerald-300/80">
                            ({getVehicleTypeShortLabel(v.modelId)} • {v.capacityTons}t • Hazır)
                          </span>
                        </div>
                      ))}

                      {stat.incomingTrips.map((t) => {
                        const remKm = Math.max(
                          0,
                          t.totalDistanceKm - t.distanceCoveredKm
                        );
                        const eta =
                          Math.ceil(remKm / t.speedKmh) +
                          (t.restingHoursLeft || 0);
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
                              {t.queuedNextTrip
                                ? ' • 🔄Dönüş Bağlandı'
                                : ' • Dönüş Yükü Seç'})
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
              Haritadaki <strong className="text-emerald-400">yeşil araç ikonları</strong> o ilde bekleyen araçlarınızı, <strong className="text-sky-400">mavi ikonlar</strong> yoldaki araçlarınızı gösterir. Üstteki bölge butonlarıyla haritaya yakınlaşabilirsiniz.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
