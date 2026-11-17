import React, { useState } from 'react';
import VehicleIcon, { getVehicleTypeShortLabel } from './VehicleIcon';

// Kadın isimleri listesi (doğru Pixar portre eşleştirmesi için)
const FEMALE_NAMES = ['Ayşe', 'Zeynep', 'Elif', 'Fatma', 'Merve', 'Selin', 'Derya'];

export function getDriverAvatarPath(driver = {}) {
  const base = import.meta.env.BASE_URL || './';
  const name = driver.name || '';
  const firstName = name.split(' ')[0];
  const isFemale = FEMALE_NAMES.includes(firstName);

  const seedStr = `${driver.id || ''}_${name}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000;
  }

  if (isFemale) {
    return hash % 2 === 0
      ? `${base}images/drivers/driver_3.png`
      : `${base}images/drivers/driver_6.png`;
  }

  if (driver.licenses?.adr) return `${base}images/drivers/driver_5.png`;
  if (driver.licenses?.heavy || (driver.skill || 1) >= 4)
    return `${base}images/drivers/driver_4.png`;

  const malePool = [
    `${base}images/drivers/driver_1.png`,
    `${base}images/drivers/driver_2.png`,
    `${base}images/drivers/driver_4.png`,
    `${base}images/drivers/driver_5.png`,
  ];
  return malePool[hash % malePool.length];
}

export function getVehicleImagePath(modelId = 'van_transit') {
  const base = import.meta.env.BASE_URL || './';
  return `${base}images/vehicles/${modelId}.png`;
}

// Pixar Tarzı Şoför Portre Bileşeni
export function DriverPixarAvatar({
  driver,
  size = 'md', // 'sm' | 'md' | 'lg'
  showStatusDot = true,
}) {
  const [imgError, setImgError] = useState(false);
  const src = getDriverAvatarPath(driver);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
  }[size] || 'w-14 h-14 rounded-2xl';

  return (
    <div
      className={`relative shrink-0 ${sizeClasses} p-0.5 bg-gradient-to-br from-amber-400 via-orange-500 to-sky-500 shadow-lg`}
    >
      <div className="w-full h-full rounded-[inherit] overflow-hidden bg-slate-900 flex items-center justify-center">
        {!imgError ? (
          <img
            src={src}
            alt={driver?.name || 'Şoför'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform hover:scale-110 transition duration-300"
          />
        ) : (
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <defs>
              <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#f97316" />
              </radialGradient>
            </defs>
            <rect width="64" height="64" fill="#1e293b" />
            <circle cx="32" cy="26" r="14" fill="url(#faceGrad)" />
            <path d="M18 22C18 14 46 14 46 22Z" fill="#0284c7" />
            <circle cx="27" cy="25" r="2" fill="#0f172a" />
            <circle cx="37" cy="25" r="2" fill="#0f172a" />
            <path
              d="M26 31Q32 35 38 31"
              stroke="#7c2d12"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M12 60C14 44 50 44 52 60Z" fill="#f59e0b" />
          </svg>
        )}
      </div>

      {showStatusDot && driver?.status && (
        <span
          title={driver.status === 'idle' ? 'Garajda Hazır' : 'Seferde'}
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
            driver.status === 'idle' ? 'bg-emerald-400' : 'bg-sky-400'
          }`}
        />
      )}
    </div>
  );
}

// 3D Pixar-Shaded SVG Sahne (Lowbed Ağır Nakliye, İntermodal Tren, Kargo Uçağı veya yedek sahne için)
function PixarStylizedScene({ modelId }) {
  if (modelId === 'semi_heavy_45t') {
    return (
      <svg viewBox="0 0 400 180" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="skyHeavy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="cabPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="excavatorYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        <rect width="400" height="180" fill="url(#skyHeavy)" />
        <circle cx="320" cy="45" r="28" fill="#fef08a" fillOpacity="0.35" />
        {/* Dağlar ve Otoyol */}
        <path d="M0 130 L90 85 L180 130 L290 75 L400 130 Z" fill="#31102f" fillOpacity="0.6" />
        <rect y="128" width="400" height="52" fill="#0f172a" />
        <line x1="0" y1="154" x2="400" y2="154" stroke="#f59e0b" strokeWidth="3" strokeDasharray="18 14" />
        {/* Lowbed Platform & Ekskavatör */}
        <path d="M45 128 H235 L252 102 H275 V128 H45 Z" fill="#dc2626" />
        {/* Sarı Dev Ekskavatör */}
        <rect x="85" y="108" width="85" height="16" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <rect x="95" y="76" width="65" height="32" rx="6" fill="url(#excavatorYellow)" />
        <rect x="132" y="81" width="22" height="16" rx="3" fill="#38bdf8" fillOpacity="0.8" />
        <path d="M95 88 L55 58 L35 95" stroke="url(#excavatorYellow)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Volvo FH16 750 Çekici */}
        <path d="M268 58 H328 L352 92 V132 H260 V58 Z" fill="url(#cabPurple)" stroke="#e9d5ff" strokeWidth="1.5" />
        <path d="M312 68 H338 L348 92 H312 Z" fill="#38bdf8" fillOpacity="0.85" />
        <circle cx="305" cy="52" r="5" fill="#fbbf24" />
        {/* 6 Aks Tekerlekler */}
        {[65, 92, 119, 146, 215, 282, 330].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy="134" r="13" fill="#020617" stroke="#94a3b8" strokeWidth="3" />
            <circle cx={cx} cy="134" r="5" fill="#cbd5e1" />
          </g>
        ))}
      </svg>
    );
  }

  if (modelId === 'intermodal_train_65t') {
    return (
      <svg viewBox="0 0 400 180" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="skyTrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect width="400" height="180" fill="url(#skyTrain)" />
        <path d="M0 132 L120 75 L240 132 L350 82 L400 132 Z" fill="#1e293b" />
        <rect y="132" width="400" height="48" fill="#090d16" />
        <line x1="0" y1="142" x2="400" y2="142" stroke="#94a3b8" strokeWidth="3" />
        {/* Konteyner Vagonları */}
        <rect x="20" y="76" width="95" height="48" rx="4" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
        <rect x="122" y="76" width="95" height="48" rx="4" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.5" />
        {/* Modern Lokomotif */}
        <path d="M228 66 H335 L368 102 L368 128 H228 Z" fill="#ef4444" stroke="#fecaca" strokeWidth="1.5" />
        <rect x="228" y="96" width="140" height="10" fill="#f8fafc" />
        <path d="M322 74 H348 L360 94 H322 Z" fill="#38bdf8" />
        {[45, 90, 145, 190, 255, 295, 340].map((cx, i) => (
          <circle key={i} cx={cx} cy="134" r="9" fill="#334155" stroke="#cbd5e1" strokeWidth="2.5" />
        ))}
      </svg>
    );
  }

  if (modelId === 'cargo_plane_40t') {
    return (
      <svg viewBox="0 0 400 180" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="skyPlane" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
        <rect width="400" height="180" fill="url(#skyPlane)" />
        <circle cx="310" cy="50" r="34" fill="#fef08a" fillOpacity="0.55" />
        {/* Bulutlar */}
        <ellipse cx="90" cy="145" rx="75" ry="22" fill="#f8fafc" fillOpacity="0.85" />
        <ellipse cx="280" cy="155" rx="95" ry="25" fill="#fff7ed" fillOpacity="0.85" />
        {/* Boeing 737 Kargo Uçağı Gövdesi */}
        <g transform="translate(15, -5) rotate(-8 200 90)">
          <path d="M55 95 L32 45 H58 L95 92 Z" fill="#f59e0b" />
          <path
            d="M45 90 H295 C325 90 348 102 355 112 C345 122 320 126 290 126 H65 C50 126 45 112 45 90 Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <path d="M60 108 H335" stroke="#f97316" strokeWidth="5" />
          <path d="M312 96 H338 L346 105 H312 Z" fill="#0f172a" />
          <path d="M165 112 L115 152 H152 L215 114 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <ellipse cx="195" cy="132" rx="18" ry="10" fill="#ea580c" stroke="#fed7aa" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900">
      <VehicleIcon modelId={modelId} className="w-24 h-14 text-amber-400 drop-shadow-lg" />
      <span className="text-[11px] font-bold text-slate-300 mt-1">
        {getVehicleTypeShortLabel(modelId)}
      </span>
    </div>
  );
}

// Araç Kartlarında Gözükecek Pixar 3D Araç Görseli Bileşeni
export function VehiclePixarCardBanner({
  modelId,
  name,
  plate,
  condition,
  badgeText,
  badgeColorClass = 'bg-amber-500/90 text-slate-950',
  heightClass = 'h-40',
}) {
  const [imgError, setImgError] = useState(false);
  const src = getVehicleImagePath(modelId);
  const useCustomScene =
    imgError ||
    ['semi_heavy_45t', 'intermodal_train_65t', 'cargo_plane_40t'].includes(modelId);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-800/90 group shadow-inner`}
    >
      {!useCustomScene ? (
        <img
          src={src}
          alt={name || modelId}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <PixarStylizedScene modelId={modelId} />
      )}

      {/* Alt Karartma Gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Sol Üst Plaka veya Tür Etiketi */}
      {plate ? (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/95 text-slate-950 font-mono text-xs font-extrabold border-l-4 border-blue-600 shadow-md">
          <span className="text-[9px] text-blue-700 mr-1 font-sans">TR</span>
          {plate}
        </div>
      ) : (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-amber-300 shadow">
          {getVehicleTypeShortLabel(modelId)}
        </div>
      )}

      {/* Sağ Üst Durum / Fiyat / Kondisyon Rozeti */}
      {badgeText && (
        <div
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold backdrop-blur-md shadow-md ${badgeColorClass}`}
        >
          {badgeText}
        </div>
      )}

      {/* Sol Alt Araç Model Başlığı */}
      {name && (
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <div className="text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
            {name}
          </div>
          {typeof condition === 'number' && (
            <span
              className={`text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-950/80 border ${
                condition > 75
                  ? 'text-emerald-400 border-emerald-500/40'
                  : condition > 45
                  ? 'text-amber-400 border-amber-500/40'
                  : 'text-rose-400 border-rose-500/40'
              }`}
            >
              %{condition}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
