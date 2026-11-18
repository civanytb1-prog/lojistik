import React, { useState, useRef, useEffect } from 'react';
import { CITIES, HIGHWAY_LINKS, WEATHER_TYPES } from '../data/gameData';
import VehicleIcon, {
  MapSvgVehicleShape,
  getVehicleTypeShortLabel,
} from './VehicleIcon';
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

const BASE_W = 1024;
const BASE_H = 557;

// Tüm Türkiye + 7 Coğrafi Bölge (Kamera Odak Alanı & Bölge Harita Kesiti)
const REGION_FILTERS = [
  {
    id: 'all',
    label: 'Tüm Türkiye',
    vb: { x: 0, y: 0, w: BASE_W, h: BASE_H },
    clipPolygon: null,
  },
  {
    id: 'Marmara',
    label: 'Marmara',
    vb: { x: 0, y: 0, w: 340, h: 215 },
    clipPolygon: '0,0 325,0 325,115 265,175 185,195 0,195',
  },
  {
    id: 'Ege',
    label: 'Ege',
    vb: { x: 15, y: 155, w: 300, h: 245 },
    clipPolygon: '10,165 270,165 280,365 180,395 10,395',
  },
  {
    id: 'İç Anadolu',
    label: 'İç Anadolu',
    vb: { x: 225, y: 95, w: 455, h: 285 },
    clipPolygon: '235,105 660,105 660,295 470,355 245,345',
  },
  {
    id: 'Akdeniz',
    label: 'Akdeniz',
    vb: { x: 195, y: 275, w: 430, h: 205 },
    clipPolygon: '195,295 585,275 595,465 195,465',
  },
  {
    id: 'Karadeniz',
    label: 'Karadeniz',
    vb: { x: 265, y: 5, w: 625, h: 175 },
    clipPolygon: '270,0 885,0 885,155 270,155',
  },
  {
    id: 'Doğu Anadolu',
    label: 'Doğu Anadolu',
    vb: { x: 645, y: 65, w: 379, h: 280 },
    clipPolygon: '655,65 1024,65 1024,335 655,335',
  },
  {
    id: 'Güneydoğu',
    label: 'Güneydoğu',
    vb: { x: 540, y: 245, w: 420, h: 185 },
    clipPolygon: '545,250 955,250 955,425 545,425',
  },
];

function clampViewBox(vb) {
  const w = Math.max(180, Math.min(BASE_W, vb.w));
  const h = (w / BASE_W) * BASE_H;
  const x = Math.max(-40, Math.min(BASE_W - w + 40, vb.x));
  const y = Math.max(-40, Math.min(BASE_H - h + 40, vb.y));
  return { x, y, w, h };
}

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
  const [activeRegion, setActiveRegion] = useState('all');
  const [vb, setVb] = useState(REGION_FILTERS[0].vb);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const currentRegionObj =
    REGION_FILTERS.find((r) => r.id === activeRegion) || REGION_FILTERS[0];
  const zoomFactor = +(BASE_W / vb.w).toFixed(1);

  const applyRegion = (regionId) => {
    const found = REGION_FILTERS.find((r) => r.id === regionId) || REGION_FILTERS[0];
    setActiveRegion(found.id);
    setVb(found.vb);
  };

  const zoomBy = (factor, centerX, centerY) => {
    setVb((prev) => {
      const cx = centerX !== undefined ? centerX : prev.x + prev.w / 2;
      const cy = centerY !== undefined ? centerY : prev.y + prev.h / 2;
      const nextW = Math.max(180, Math.min(BASE_W, prev.w * factor));
      const nextH = (nextW / BASE_W) * BASE_H;
      const ratioX = (cx - prev.x) / prev.w;
      const ratioY = (cy - prev.y) / prev.h;
      return clampViewBox({
        x: cx - ratioX * nextW,
        y: cy - ratioY * nextH,
        w: nextW,
        h: nextH,
      });
    });
  };

  // Harita üzerindeyken wheel zoom yapıldığında sayfanın kaymasını tamamen engelle (passive: false)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNative = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const factor = e.deltaY < 0 ? 0.82 : 1.22;

      setVb((prev) => {
        const svgX = prev.x + px * prev.w;
        const svgY = prev.y + py * prev.h;
        const nextW = Math.max(180, Math.min(BASE_W, prev.w * factor));
        const nextH = (nextW / BASE_W) * BASE_H;
        const ratioX = (svgX - prev.x) / prev.w;
        const ratioY = (svgY - prev.y) / prev.h;
        return clampViewBox({
          x: svgX - ratioX * nextW,
          y: svgY - ratioY * nextH,
          w: nextW,
          h: nextH,
        });
      });
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startVb: vb,
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dxPx = e.clientX - dragRef.current.startX;
    const dyPx = e.clientY - dragRef.current.startY;
    if (Math.abs(dxPx) > 4 || Math.abs(dyPx) > 4) {
      dragRef.current.moved = true;
    }
    const scaleX = dragRef.current.startVb.w / rect.width;
    const scaleY = dragRef.current.startVb.h / rect.height;
    setVb(
      clampViewBox({
        ...dragRef.current.startVb,
        x: dragRef.current.startVb.x - dxPx * scaleX,
        y: dragRef.current.startVb.y - dyPx * scaleY,
      })
    );
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

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

  const visibleCities = React.useMemo(() => {
    if (activeRegion === 'all') return CITIES;
    return CITIES.filter((c) => c.region === activeRegion);
  }, [activeRegion]);

  const currentViewBox = `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`;

  return (
    <div className="relative w-full h-full bg-slate-950/60 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Üst Harita Bilgi ve 7 Bölge Seçim Çubuğu */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold tracking-wide text-slate-100">
            TÜRKİYE 81 İL & CANLI FİLO HARİTASI
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            {activeTrips.length} Yolda •{' '}
            {vehicles.filter((v) => v.status === 'idle').length} İlde Bekliyor
          </span>
        </div>

        {/* Bölge Filtreleme & Odaklama Butonları */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl text-[11px] text-slate-300 pointer-events-auto shadow-lg">
          {REGION_FILTERS.map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => applyRegion(reg.id)}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                activeRegion === reg.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {reg.label}
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

      {/* Sağ Alt Zoom & Sıfırlama Kontrolleri */}
      <div className="absolute bottom-20 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-2xl">
        <button
          type="button"
          onClick={() => zoomBy(0.78)}
          title="Haritayı Yakınlaştır (+)"
          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-mono font-extrabold text-center text-amber-300 py-0.5">
          {zoomFactor}x
        </div>
        <button
          type="button"
          onClick={() => zoomBy(1.28)}
          title="Haritayı Uzaklaştır (-)"
          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyRegion('all')}
          title="Tüm Türkiye Haritasına Sıfırla"
          className="p-2 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition border-t border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG 81 İl Türkiye Harita Alanı (Deniz ve Arka Plan Yok, Sadece Harita) */}
      <div
        ref={containerRef}
        style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
        className={`relative flex-1 w-full h-full min-h-[340px] overscroll-contain ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          ref={svgRef}
          viewBox={currentViewBox}
          className="w-full h-full object-contain"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {currentRegionObj.clipPolygon && (
              <clipPath id="activeRegionClip">
                <polygon points={currentRegionObj.clipPolygon} />
              </clipPath>
            )}
          </defs>

          {/* GERÇEK 81 İL SINIRLI TÜRKİYE HARİTASI (Sadece Harita, Arka Plan/Deniz Yok) */}
          <image
            href={`${import.meta.env.BASE_URL}images/turkey-81-provinces.png`}
            x="0"
            y="0"
            width={BASE_W}
            height={BASE_H}
            preserveAspectRatio="none"
            clipPath={
              currentRegionObj.clipPolygon ? 'url(#activeRegionClip)' : undefined
            }
            opacity="0.95"
          />

          {/* Karayolu ve Otoyol Ağları */}
          {HIGHWAY_LINKS.map(([fromId, toId], idx) => {
            const c1 = cityMap[fromId];
            const c2 = cityMap[toId];
            if (!c1 || !c2) return null;
            if (
              activeRegion !== 'all' &&
              (c1.region !== activeRegion || c2.region !== activeRegion)
            ) {
              return null;
            }
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
          {visibleCities.map((city) => {
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
              Haritadaki <strong className="text-emerald-400">yeşil araç ikonları</strong> o ilde bekleyen araçlarınızı, <strong className="text-sky-400">mavi ikonlar</strong> yoldaki araçlarınızı gösterir. <strong className="text-amber-300">Mouse tekerleği</strong> veya sağ alttaki <strong className="text-amber-300">+ / -</strong> butonlarıyla yakınlaşıp haritayı sürükleyerek gezebilirsiniz.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
