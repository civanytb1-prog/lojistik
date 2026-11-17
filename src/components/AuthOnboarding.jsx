import React, { useState } from 'react';
import { CITIES, REGIONS, STARTER_PACKAGES, HIGHWAY_LINKS } from '../data/gameData';
import {
  Truck,
  UserPlus,
  LogIn,
  Building2,
  CheckCircle2,
  Compass,
  Trash2,
  ArrowRight,
  Lock,
  User,
  Crown,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function AuthOnboarding({
  accounts,
  onLoginAccount,
  onRegisterAccount,
  onDeleteAccount,
  onCancelIfInGame,
}) {
  // Ana sayfa her zaman "login" (Giriş Ekranı) ile başlar
  const [mode, setMode] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Kayıt Formu State
  const [username, setUsername] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [plateLetters, setPlateLetters] = useState('AL');
  const [selectedRegionId, setSelectedRegionId] = useState('Marmara');
  const [selectedHqId, setSelectedHqId] = useState('istanbul');
  const [selectedPackageId, setSelectedPackageId] = useState('balanced');

  const selectedRegion =
    REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
  const regionCities = CITIES.filter((c) =>
    selectedRegion.cities.includes(c.id)
  );
  const selectedPackage =
    STARTER_PACKAGES.find((p) => p.id === selectedPackageId) ||
    STARTER_PACKAGES[0];

  const handleSelectRegion = (reg) => {
    setSelectedRegionId(reg.id);
    setSelectedHqId(reg.defaultHq);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 2) {
      setErrorMsg('Lütfen en az 2 karakterli bir kullanıcı adı girin.');
      return;
    }
    if (accounts.some((acc) => acc.username.toLowerCase() === cleanUser)) {
      setErrorMsg(
        'Bu kullanıcı adı zaten kayıtlı! Giriş yapabilir veya farklı bir kullanıcı adı seçebilirsiniz.'
      );
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Lütfen hesabınız için bir şifre belirleyin.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('Lütfen kuracağınız lojistik şirketinin unvanını yazın.');
      return;
    }

    onRegisterAccount({
      username: username.trim(),
      ceoName: ceoName.trim() || username.trim(),
      password: password.trim(),
      companyName: companyName.trim(),
      plateLetters: (
        plateLetters.trim().toUpperCase().replace(/[^A-Z]/g, '') || 'AL'
      ).slice(0, 3),
      regionId: selectedRegion.id,
      hqCityId: selectedHqId,
      starterPackageId: selectedPackage.id,
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const found = accounts.find(
      (a) => a.username.toLowerCase() === loginUsername.trim().toLowerCase()
    );
    if (!found) {
      setErrorMsg(
        'Bu kullanıcı adına sahip bir hesap bulunamadı. "Yeni Oyuncu Kaydı" sekmesinden kayıt olabilirsiniz.'
      );
      return;
    }
    if (found.password && found.password !== loginPassword) {
      setErrorMsg('Hatalı şifre girdiniz! Lütfen şifrenizi kontrol edin.');
      return;
    }
    onLoginAccount(found.username);
  };

  const cityMap = React.useMemo(() => {
    const m = {};
    CITIES.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-y-auto flex flex-col">
      {/* Üst Ana Sayfa Navbar */}
      <div className="border-b border-slate-800/80 bg-slate-900/95 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Truck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              ANADOLU LOJİSTİK TYCOON
            </h1>
            <p className="text-xs text-slate-400">
              Online Lojistik Şirketi, Filo ve Tedarik Zinciri Yönetim Simülasyonu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              mode === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Giriş Yap (Login)
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Kayıt Ol & Şirket Kur
          </button>

          {onCancelIfInGame && (
            <button
              type="button"
              onClick={onCancelIfInGame}
              className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Oyuna Dön
            </button>
          )}
        </div>
      </div>

      {/* İçerik Gövdesi */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* SOL 5 SÜTUN: ANA GİRİŞ (LOGIN) FORMU */}
            <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Oyuncu & Yönetici Giriş Ekranı
                </span>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  Hesabınıza Giriş Yapın
                </h2>
                <p className="text-xs text-slate-400">
                  Kullanıcı adınız ve şifrenizle lojistik şirketinizi yönetmeye devam edin.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Örn: admin veya oyuncu_adi"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-sm text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-sm text-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Giriş Yap ve Operasyonu Başlat
                </button>
              </form>

              {/* Süper Yönetici (Admin) Hızlı Doldurma Kutusu */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      <Crown className="w-4 h-4" />
                      Kurucu Yönetici (GM / Admin) Girişi
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Kullanıcı: <strong>admin</strong> • Şifre: <strong>admin123</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('admin');
                      setLoginPassword('admin123');
                      setErrorMsg('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shrink-0 shadow"
                  >
                    Bilgileri Doldur
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Hesabınız yok mu? Yeni Oyuncu Kaydı Oluşturun →
                </button>
              </div>
            </div>

            {/* SAĞ 7 SÜTUN: SUNUCUDAKİ KAYITLI ŞİRKETLER LİSTESİ */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-sky-400" />
                    Kayıtlı Şirketler & Oyuncu Profilleri ({accounts.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bir hesaba tıklayarak kullanıcı adını giriş formuna aktarabilir veya yeni bir şirket kurabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const g = acc.gameState;
                  const hqCity = CITIES.find((c) => c.id === g?.hqCityId);
                  const isSelectedForLogin =
                    loginUsername.toLowerCase() === acc.username.toLowerCase();

                  return (
                    <div
                      key={acc.username}
                      onClick={() => {
                        setLoginUsername(acc.username);
                        setLoginPassword('');
                        setErrorMsg('');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-wrap items-center justify-between gap-4 ${
                        isSelectedForLogin
                          ? 'bg-amber-500/15 border-amber-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-white">
                            {g?.companyName || acc.companyName}
                          </span>
                          {acc.isAdmin && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                              👑 SÜPER YÖNETİCİ (ADMIN)
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold">
                            📍 {g?.regionId || acc.regionId} ({hqCity?.name})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                          <span>
                            👤 Kullanıcı: <strong className="text-amber-300">@{acc.username}</strong> ({acc.ceoName})
                          </span>
                          <span>📅 Gün {g?.day || 1}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono pt-1">
                          <span className="text-emerald-400 font-bold">
                            Kasa: ₺{(g?.cash || 0).toLocaleString('tr-TR')}
                          </span>
                          <span className="text-sky-400">
                            Filo: {g?.vehicles?.length || 0} Araç
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-200">
                          {isSelectedForLogin ? '✓ Seçildi (Şifre Girin)' : 'Seç'}
                        </span>
                        {!acc.isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAccount(acc.username);
                            }}
                            title="Kaydı Sil"
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* YENİ OYUNCU KAYDI & BÖLGE SEÇİMLİ ŞİRKET KURULUŞ EKRANI */
          <form
            onSubmit={handleRegisterSubmit}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Sol 7 Sütun: Adım 1 (Oyuncu & Şirket) + Adım 2 (Bölge & Merkez Seçimi) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Oyuncu Hesabı ve Şirket Kimliği */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    1. Yeni Oyuncu Hesabı & Şirket Kimliği
                  </h2>
                  <span className="text-[11px] text-slate-400">Adım 1 / 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kullanıcı Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Örn: civan"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kurucu / CEO Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      placeholder="Örn: Civan Demir"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Hesap Şifresi *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Lojistik Şirketinizin Resmi Unvanı *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: Boğaziçi Ulusal Lojistik A.Ş."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Filo Plaka Kodu
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={plateLetters}
                      onChange={(e) => setPlateLetters(e.target.value.toUpperCase())}
                      placeholder="AL"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono uppercase text-amber-300 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Başlangıç Bölgesi ve Şehir Seçimi */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-sky-400" />
                      2. Başlangıç Bölgesi Seçimi (7 Coğrafi Bölge)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Seçtiğiniz bölge şirketinize özel bir ticari teşvik bonusu ve açık başlangıç şube ağı kazandırır.
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">Adım 2 / 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REGIONS.map((reg) => {
                    const active = reg.id === selectedRegionId;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => handleSelectRegion(reg)}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between gap-2 ${
                          active
                            ? 'bg-amber-500/15 border-amber-400 shadow-lg'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-white">
                              {reg.name}
                            </span>
                            {active && (
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{reg.subtitle}</div>
                        </div>

                        <div
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${reg.badgeClass}`}
                        >
                          ★ {reg.perkTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Seçilen Bölge İçindeki Genel Merkez (HQ) Şehri Seçimi */}
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                    📍 {selectedRegion.name} İçinde Genel Merkez (Ana Garaj & Antrepo) Şehrinizi Seçin:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {regionCities.map((city) => {
                      const isHq = city.id === selectedHqId;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => setSelectedHqId(city.id)}
                          className={`p-3 rounded-xl border text-left transition ${
                            isHq
                              ? 'bg-emerald-500/20 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{city.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {city.population}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-1">
                            {city.specialties.slice(0, 2).join(', ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ 5 Sütun: Bölge Harita Önizlemesi + Adım 3 (Başlangıç Filo Paketi) + Onay */}
            <div className="lg:col-span-5 space-y-6">
              {/* Canlı Bölge Harita Önizlemesi */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Bölgesel Başlangıç Ağı Önizlemesi
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {selectedRegion.startingUnlocked.length} Şube Açık Başlar
                  </span>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden h-48">
                  <svg viewBox="0 0 1000 500" className="w-full h-full object-contain">
                    <path
                      d="M 95,95 L 175,85 L 220,105 L 285,108 L 365,88 L 460,72 L 545,92 L 645,98 L 755,85 L 845,95 L 915,145 L 935,235 L 925,325 L 860,355 L 785,375 L 705,405 L 610,405 L 540,400 L 495,425 L 430,415 L 350,410 L 285,425 L 220,405 L 155,375 L 95,335 L 85,255 L 105,185 L 165,155 L 105,135 Z"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    {HIGHWAY_LINKS.map(([a, b], i) => {
                      const c1 = cityMap[a];
                      const c2 = cityMap[b];
                      if (!c1 || !c2) return null;
                      const activeLink =
                        selectedRegion.startingUnlocked.includes(a) &&
                        selectedRegion.startingUnlocked.includes(b);
                      return (
                        <line
                          key={i}
                          x1={c1.x}
                          y1={c1.y}
                          x2={c2.x}
                          y2={c2.y}
                          stroke={activeLink ? '#10b981' : '#1e293b'}
                          strokeWidth={activeLink ? '3' : '1.2'}
                        />
                      );
                    })}
                    {CITIES.map((c) => {
                      const isHq = c.id === selectedHqId;
                      const isStart = selectedRegion.startingUnlocked.includes(c.id);
                      return (
                        <g key={c.id} transform={`translate(${c.x}, ${c.y})`}>
                          {isHq && (
                            <circle
                              r="16"
                              fill="#f59e0b"
                              fillOpacity="0.3"
                              className="animate-pulse-ring"
                            />
                          )}
                          <circle
                            r={isHq ? '8' : isStart ? '6' : '3.5'}
                            fill={
                              isHq ? '#f59e0b' : isStart ? '#10b981' : '#334155'
                            }
                          />
                          {(isStart || isHq) && (
                            <text
                              y="-11"
                              textAnchor="middle"
                              fill={isHq ? '#fbbf24' : '#34d399'}
                              fontSize="12"
                              fontWeight="800"
                            >
                              {c.name}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedRegion.description}
                </p>
              </div>

              {/* 3. Başlangıç Filosu Seçimi */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-400" />
                    3. Başlangıç Filosu & Sermaye Paketi
                  </h2>
                  <span className="text-[11px] text-slate-400">Adım 3 / 3</span>
                </div>

                <div className="space-y-2.5">
                  {STARTER_PACKAGES.map((pkg) => {
                    const active = pkg.id === selectedPackageId;
                    const totalCash = pkg.startingCash + selectedRegion.bonusCash;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition ${
                          active
                            ? 'bg-emerald-500/15 border-emerald-400'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">
                            {pkg.name}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-emerald-400">
                            ₺{totalCash.toLocaleString('tr-TR')} Nakit
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-amber-300 mt-0.5">
                          🚚 {pkg.subtitle}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {pkg.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Kaydı Tamamla ve Şirketi Kur!
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
