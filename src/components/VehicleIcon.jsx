import React from 'react';

// Araç modeline göre görsel kategori belirleme
export function getVehicleVisualType(modelId = '') {
  if (modelId.includes('van')) return 'van';
  if (modelId.includes('reefer_light')) return 'reefer_truck';
  if (modelId.includes('light_truck')) return 'light_truck';
  if (modelId.includes('heavy_truck')) return 'heavy_truck';
  if (modelId.includes('semi_reefer')) return 'semi_reefer';
  if (modelId.includes('semi_adr')) return 'semi_adr';
  if (modelId.includes('semi_heavy')) return 'semi_lowbed';
  if (modelId.includes('semi_standard')) return 'semi_standard';
  if (modelId.includes('train')) return 'train';
  if (modelId.includes('plane')) return 'plane';
  return 'semi_standard';
}

export function getVehicleTypeShortLabel(modelId = '') {
  const t = getVehicleVisualType(modelId);
  switch (t) {
    case 'van':
      return 'Panelvan';
    case 'light_truck':
      return 'Kamyonet';
    case 'reefer_truck':
      return 'Frigo Kamyonet';
    case 'heavy_truck':
      return 'Kırkayak 18t';
    case 'semi_standard':
      return 'Çekici Tır';
    case 'semi_reefer':
      return 'Frigo Tır';
    case 'semi_adr':
      return 'ADR Tanker';
    case 'semi_lowbed':
      return 'Lowbed Ağır';
    case 'train':
      return 'Yük Treni';
    case 'plane':
      return 'Kargo Uçağı';
    default:
      return 'Ticari Araç';
  }
}

// HTML/Tailwind arayüzlerinde kullanılacak detaylı SVG Araç Türü İkonu
export default function VehicleIcon({ modelId, className = 'w-6 h-6' }) {
  const type = getVehicleVisualType(modelId);

  switch (type) {
    case 'van':
      return (
        <svg viewBox="0 0 32 20" fill="none" className={className}>
          <path
            d="M2 14V6C2 4.9 2.9 4 4 4H19L24 8.5L28 9.5C29.1 9.8 30 10.8 30 12V14H2Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M19 4V9H24" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="14.5" r="2.8" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="24" cy="14.5" r="2.8" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case 'light_truck':
    case 'reefer_truck':
      return (
        <svg viewBox="0 0 34 20" fill="none" className={className}>
          {/* Kasa */}
          <rect
            x="2"
            y="3"
            width="19"
            height="11"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {type === 'reefer_truck' && (
            <path d="M21 4.5H23V7.5H21" stroke="#38bdf8" strokeWidth="1.6" />
          )}
          {/* Kabin */}
          <path
            d="M21 6.5H27L31 10.5V14H21V6.5Z"
            fill="currentColor"
            fillOpacity="0.35"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="8" cy="15" r="2.8" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="26" cy="15" r="2.8" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case 'heavy_truck':
      return (
        <svg viewBox="0 0 38 20" fill="none" className={className}>
          <rect
            x="1.5"
            y="2.5"
            width="23"
            height="11.5"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M24.5 5H31.5L35.5 9.5V14H24.5V5Z"
            fill="currentColor"
            fillOpacity="0.38"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="6.5" cy="15.2" r="2.6" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="13" cy="15.2" r="2.6" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="30.5" cy="15.2" r="2.6" fill="#0f172a" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case 'semi_adr':
      return (
        <svg viewBox="0 0 40 20" fill="none" className={className}>
          {/* Silindirik ADR Tanker Gövdesi */}
          <rect
            x="1.5"
            y="3"
            width="24"
            height="10"
            rx="5"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <line x1="9" y1="3" x2="9" y2="13" stroke="currentColor" strokeWidth="1.2" />
          <line x1="17" y1="3" x2="17" y2="13" stroke="currentColor" strokeWidth="1.2" />
          {/* Çekici Kabin */}
          <path
            d="M27 4.5H33.5L37.5 9V14H25.5V11H27V4.5Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="6" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="23" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="33" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );

    case 'semi_lowbed':
      return (
        <svg viewBox="0 0 40 20" fill="none" className={className}>
          {/* Alçak Lowbed Platform + Ağır Yük Silüeti */}
          <path
            d="M1.5 13H22L25 9H27"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <rect
            x="5"
            y="5"
            width="13"
            height="7.5"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M27 4H34L38 8.5V14H26V4Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="5.5" cy="15.2" r="2.4" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="11" cy="15.2" r="2.4" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="16.5" cy="15.2" r="2.4" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="33.5" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );

    case 'train':
      return (
        <svg viewBox="0 0 40 20" fill="none" className={className}>
          <rect
            x="2"
            y="4"
            width="21"
            height="9.5"
            rx="1"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M25 4H34L38 9V13.5H25V4Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <line x1="1" y1="16.5" x2="39" y2="16.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="7" cy="14.8" r="1.8" fill="currentColor" />
          <circle cx="18" cy="14.8" r="1.8" fill="currentColor" />
          <circle cx="31" cy="14.8" r="1.8" fill="currentColor" />
        </svg>
      );

    case 'plane':
      return (
        <svg viewBox="0 0 36 20" fill="none" className={className}>
          <path
            d="M3 11L8 11L15 3H18.5L15 11H27C30.5 11 33 12 34 13.5C32.5 14.5 30 15 27 15H15L18.5 19H15L8 15H3L1.5 9H4L5 11Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );

    case 'semi_standard':
    case 'semi_reefer':
    default:
      return (
        <svg viewBox="0 0 40 20" fill="none" className={className}>
          {/* Uzun Tenteli / Frigo Dorse */}
          <rect
            x="1.5"
            y="2.5"
            width="24.5"
            height="11"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {type === 'semi_reefer' && (
            <rect x="26" y="3.5" width="2" height="5" fill="#38bdf8" />
          )}
          {/* Çekici Tır Kabini */}
          <path
            d="M28 4.5H34.5L38 9V14H26.5V11H28V4.5Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="6" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="24" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="34" cy="15.2" r="2.5" fill="#0f172a" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
}

// SVG Harita İçinde (<g>) Doğrudan Çizilen Mini Araç Silüeti
export function MapSvgVehicleShape({ modelId, color = '#f8fafc' }) {
  const type = getVehicleVisualType(modelId);

  if (type === 'van') {
    return (
      <g transform="translate(-10, -6)">
        <path
          d="M1 9V3C1 2 2 1.5 3 1.5H12L15.5 4.5L18.5 5.5V9H1Z"
          fill={color}
        />
        <circle cx="5" cy="9.5" r="2" fill="#020617" stroke={color} strokeWidth="1.2" />
        <circle cx="15" cy="9.5" r="2" fill="#020617" stroke={color} strokeWidth="1.2" />
      </g>
    );
  }

  if (type === 'light_truck' || type === 'reefer_truck') {
    return (
      <g transform="translate(-11, -6)">
        <rect x="1" y="1" width="12" height="7.5" rx="1" fill={color} />
        <path d="M13.5 3.5H17.5L20 6V8.5H13.5V3.5Z" fill={color} />
        <circle cx="5" cy="9.5" r="2" fill="#020617" stroke={color} strokeWidth="1.2" />
        <circle cx="16.5" cy="9.5" r="2" fill="#020617" stroke={color} strokeWidth="1.2" />
      </g>
    );
  }

  if (type === 'semi_adr') {
    return (
      <g transform="translate(-13, -6)">
        <rect x="1" y="1.5" width="15" height="6.5" rx="3.2" fill={color} />
        <path d="M17 2.5H21.5L24 5.5V8.5H16.5V2.5Z" fill={color} />
        <circle cx="4.5" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
        <circle cx="9.5" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
        <circle cx="20.5" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
      </g>
    );
  }

  if (type === 'plane') {
    return (
      <g transform="translate(-10, -7)">
        <path
          d="M2 7L6 7L10 1H13L10.5 7H17L19.5 8.5L17 10H10.5L13 15H10L6 10H2L1 5.5L2 7Z"
          fill={color}
        />
      </g>
    );
  }

  // Varsayılan Çekici Tır / Kırkayak Kamyon Silüeti
  return (
    <g transform="translate(-13, -6)">
      <rect x="0.5" y="1" width="15.5" height="7.5" rx="1" fill={color} />
      <path d="M17 2.5H21.5L24 5.5V8.5H16.5V2.5Z" fill={color} />
      <circle cx="4" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
      <circle cx="9" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
      <circle cx="20.5" cy="9.5" r="1.9" fill="#020617" stroke={color} strokeWidth="1.1" />
    </g>
  );
}

// Yük Türüne Özel Görsel İkon Bileşeni
export function CargoTypeIcon({ cargoType = 'standard', className = 'w-4 h-4' }) {
  switch (cargoType) {
    case 'express':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'refrigerated':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case 'adr':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2C12 2 6 8.5 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 11.5 16.5 9 15 7.5C15 10 13.5 11 12 11C10.5 11 11 7 12 2Z"
            fill="currentColor"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'heavy':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 17H20L18 9H6L4 17ZM2 17H22V20H2V17ZM9 5H15V9H9V5Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'standard':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M21 8L12 3L3 8V16L12 21L21 16V8Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M3 8L12 13L21 8M12 13V21" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

// Bir yükün oyuncunun mevcut filosundaki araç ve şoförlerle taşınıp taşınamayacağını kontrol eder
export function checkJobFleetCompatibility(job, vehicles = [], drivers = [], activeTrips = []) {
  if (!job) return { canCarry: false, reason: 'Geçersiz yük' };

  // 1. Filoda bu yükün tonajını ve dorse tipini destekleyen EN AZ 1 araç var mı?
  const matchingOwnedVehicles = vehicles.filter(
    (v) => v.supportedCargo.includes(job.cargoType) && v.capacityTons >= job.weightTons
  );

  if (matchingOwnedVehicles.length === 0) {
    const hasCargoType = vehicles.some((v) => v.supportedCargo.includes(job.cargoType));
    if (!hasCargoType) {
      return {
        canCarry: false,
        reason: `Uygun Dorse Yok (${job.cargoType.toUpperCase()})`,
      };
    }
    return {
      canCarry: false,
      reason: `Kapasite Yetersiz (Min ${job.weightTons}t Araç Gerekli)`,
    };
  }

  // 2. Şu anda boşta olan VEYA o yükün çıkış iline gelmekte olan uygun bir araç var mı?
  const availableVehicles = matchingOwnedVehicles.filter((v) => {
    if (v.status === 'idle') return true;
    return activeTrips.some(
      (t) =>
        t.vehicleId === v.id &&
        t.destinationId === job.originId &&
        !t.queuedNextTrip
    );
  });

  if (availableVehicles.length === 0) {
    return {
      canCarry: false,
      reason: 'Uygun Araçların Tümü Seferde',
    };
  }

  // 3. Eğer tüm uygun araçlar boşta ise, uygun sertifikalı ve takograf süresi dolmamış şoför var mı?
  const hasIdleVehicle = availableVehicles.some((v) => v.status === 'idle');
  if (hasIdleVehicle) {
    const eligibleDriver = drivers.some((d) => {
      if (d.status !== 'idle') return false;
      if ((d.dailyDrivenHours || 0) >= 9 || (d.weeklyDrivenHours || 0) >= 56) return false;
      if (job.cargoType === 'adr' && !d.licenses.adr) return false;
      if (job.cargoType === 'refrigerated' && !d.licenses.cold) return false;
      if (job.cargoType === 'heavy' && !d.licenses.heavy) return false;
      return true;
    });
    if (!eligibleDriver && !availableVehicles.some((v) => v.status === 'enroute')) {
      return {
        canCarry: false,
        reason: 'Uygun Sertifikalı / Dinlenmiş Şoför Yok',
      };
    }
  }

  // Aynı şehirde hazır araç var mı?
  const readyInSameCity = availableVehicles.some(
    (v) => v.status === 'idle' && v.locationId === job.originId
  );
  const incomingToCity = availableVehicles.some((v) => v.status === 'enroute');

  return {
    canCarry: true,
    readyInSameCity,
    incomingToCity,
    reason: readyInSameCity
      ? 'Şehirde Hazır Araç Var'
      : incomingToCity
      ? 'Yoldaki Araca Bağlanabilir'
      : 'İntikal İle Alınabilir',
  };
}

