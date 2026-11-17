import React, { useState, useMemo } from 'react';
import {
  CITIES,
  VEHICLE_CATALOG,
  COMPANY_UPGRADES,
} from '../data/gameData';
import {
  VehiclePixarCardBanner,
} from './PixarVisuals';
import {
  Gift,
  Wallet,
  Truck,
  Users,
  CheckCircle2,
  Crown,
  Search,
  UserPlus,
  Send,
} from 'lucide-react';

export default function AdminPanel({
  accounts,
  activeUsername,
  onAdminAction,
  onSwitchToAccount,
  onCreateDemoPlayer,
}) {
  // Varsayılan olarak admin dışındaki ilk demo oyuncuyu seçelim ki hemen test edilebilsin
  const defaultTarget =
    accounts.find((a) => !a.isAdmin)?.username ||
    activeUsername ||
    accounts[0]?.username ||
    'admin';

  const [selectedUser, setSelectedUser] = useState(defaultTarget);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualUsernameInput, setManualUsernameInput] = useState('');
  const [customCash, setCustomCash] = useState('500000');
  const [giftMessage, setGiftMessage] = useState(
    'Yönetim Kurulu Özel Destek & Teşvik Paketi'
  );
  const [feedbackBanner, setFeedbackBanner] = useState('');

  // Arama kutusuna göre filtrelenmiş oyuncular
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        (a.ceoName || '').toLowerCase().includes(q) ||
        (a.companyName || '').toLowerCase().includes(q) ||
        (a.gameState?.companyName || '').toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  const targetAccount =
    accounts.find(
      (a) => a.username.toLowerCase() === selectedUser.toLowerCase()
    ) || accounts[0];
  const targetGame = targetAccount?.gameState;

  const triggerAction = (actionType, payload, successText, targetOverride) => {
    const finalUser = targetOverride || targetAccount.username;
    onAdminAction(finalUser, actionType, {
      ...payload,
      giftMessage: giftMessage || 'Yönetici Hediyesi',
    });
    setFeedbackBanner(successText);
    setTimeout(() => {
      setFeedbackBanner('');
    }, 3500);
  };

  const handleManualUserSelect = (e) => {
    e.preventDefault();
    const clean = manualUsernameInput.trim().replace(/^@/, '').toLowerCase();
    if (!clean) return;
    const found = accounts.find(
      (a) =>
        a.username.toLowerCase() === clean ||
        (a.ceoName || '').toLowerCase().includes(clean)
    );
    if (found) {
      setSelectedUser(found.username);
      setFeedbackBanner(`Hedef oyuncu seçildi: @${found.username} (${found.ceoName})`);
    } else {
      setFeedbackBanner(`⚠️ "${manualUsernameInput}" adına sahip oyuncu bulunamadı!`);
    }
  };

  if (!targetAccount || !targetGame) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-sm">
        Yönetilecek oyuncu hesabı bulunamadı.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Üst Yönetici Başlığı */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-slate-900 border border-amber-500/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                SÜPER YÖNETİCİ (GM / ADMIN) KONTROL MERKEZİ
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                TAM YETKİ
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Oyuncu adı girerek veya listeden seçerek nakit para, araç, uzman şoför, seviye (XP), mazot ve tesis hediyeleri gönderin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCreateDemoPlayer && (
            <button
              type="button"
              onClick={() => {
                const newUsername = onCreateDemoPlayer();
                if (newUsername) {
                  setSelectedUser(newUsername);
                  setFeedbackBanner(`Yeni demo oyuncu (@${newUsername}) oluşturuldu ve seçildi!`);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              + Yeni Demo Oyuncu Ekle
            </button>
          )}
        </div>
      </div>

      {feedbackBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* HIZLI OYUNCU SEÇİM ÇUBUĞU (Hem Açılır Liste Hem Oyuncu Adı Yazma Kutusu) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Açılır Liste (Select Dropdown) ile Oyuncu Seçimi */}
        <div className="md:col-span-6">
          <label className="block text-xs font-bold text-amber-300 mb-1.5">
            📋 Kayıtlı Oyuncu Listesinden Hızlı Seçim ({accounts.length} Oyuncu):
          </label>
          <select
            value={targetAccount.username}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-sm text-white font-semibold outline-none focus:border-amber-400"
          >
            {accounts.map((acc) => (
              <option key={acc.username} value={acc.username}>
                @{acc.username} — {acc.ceoName} ({acc.gameState?.companyName || acc.companyName}) • ₺
                {(acc.gameState?.cash || 0).toLocaleString('tr-TR')}
              </option>
            ))}
          </select>
        </div>

        {/* Oyuncu Adı / Kullanıcı Adı Yazarak Seçme */}
        <form onSubmit={handleManualUserSelect} className="md:col-span-6 flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-bold text-sky-300 mb-1.5">
              ⌨️ Oyuncu Kullanıcı Adı veya İsim Girerek Bul:
            </label>
            <input
              type="text"
              value={manualUsernameInput}
              onChange={(e) => setManualUsernameInput(e.target.value)}
              placeholder="Örn: emre_kargo, zeynep_ege, burak_ankara..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-sky-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs shrink-0 self-end"
          >
            Oyuncuyu Seç
          </button>
        </form>
      </div>

      {/* 1. OYUNCU LİSTESİ VE HEDİYE GÖNDERİM MERKEZİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sol 5 Sütun: Aranabilir Oyuncu Kartları Listesi */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Tüm Oyuncu Hesapları ({filteredAccounts.length})
            </h3>
          </div>

          {/* Liste İçi Anlık Arama */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Listede oyuncu veya şirket filtrele..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredAccounts.map((acc) => {
              const g = acc.gameState || {};
              const isSelected = acc.username === targetAccount.username;
              return (
                <div
                  key={acc.username}
                  onClick={() => setSelectedUser(acc.username)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold text-amber-300">
                        @{acc.username}
                      </span>
                      <span className="text-xs font-bold text-white">
                        • {g.companyName || acc.companyName}
                      </span>
                      {acc.isAdmin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                          👑 ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      👤 CEO: {acc.ceoName} • 📍 {g.regionId} Bölgesi
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono mt-1.5">
                      <span className="text-emerald-400 font-bold">
                        ₺{(g.cash || 0).toLocaleString('tr-TR')}
                      </span>
                      <span className="text-sky-400">
                        {g.vehicles?.length || 0} Araç
                      </span>
                      <span className="text-amber-300">
                        {(g.xp || 0).toLocaleString('tr-TR')} XP
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {acc.username !== activeUsername && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSwitchToAccount(acc.username);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200"
                      >
                        Hesaba Geç
                      </button>
                    )}
                    <span className="text-[10px] text-amber-400 font-bold">
                      {isSelected ? '✓ Hedef Seçili' : 'Seç'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ 7 Sütun: Seçili Oyuncuya Nakit Para, XP & Hızlı Teşvik Gönderme */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                Seçili Hedef Oyuncu & Şirket
              </span>
              <h3 className="text-base font-extrabold text-white">
                @{targetAccount.username} — {targetGame.companyName} ({targetAccount.ceoName})
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {targetAccount.username !== activeUsername && (
                <button
                  type="button"
                  onClick={() => onSwitchToAccount(targetAccount.username)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-300 text-xs font-extrabold transition"
                  title="Bu oyuncunun hesabına geçiş yaparak oyunu onun gözünden test et"
                >
                  🚀 Hesaba Geç (Test Et)
                </button>
              )}
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Oyuncunun Kasa Bakiyesi</div>
                <div className="text-lg font-extrabold text-emerald-400">
                  ₺{(targetGame.cash || 0).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          {/* Hediye Mesajı */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Oyuncuya Gönderilecek Hediye / Bildirim Mesajı
            </label>
            <input
              type="text"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
          </div>

          {/* Hızlı Para Gönderme Butonları */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              2. @{targetAccount.username} Hesabına Nakit Para Gönder
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[50000, 250000, 1000000, 5000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() =>
                    triggerAction(
                      'GRANT_CASH',
                      { amount: amt },
                      `@${targetAccount.username} hesabına +₺${amt.toLocaleString('tr-TR')} gönderildi!`
                    )
                  }
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono font-extrabold text-xs transition"
                >
                  +₺{amt.toLocaleString('tr-TR')}
                </button>
              ))}
            </div>

            {/* Özel Miktar Girişi */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <input
                type="number"
                value={customCash}
                onChange={(e) => setCustomCash(e.target.value)}
                className="flex-1 min-w-[140px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                placeholder="Özel Tutar (₺)"
              />
              <button
                type="button"
                onClick={() => {
                  const val = Number(customCash) || 0;
                  if (val === 0) return;
                  triggerAction(
                    'GRANT_CASH',
                    { amount: val },
                    `@${targetAccount.username} hesabına ₺${val.toLocaleString('tr-TR')} aktarıldı!`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Seçili Oyuncuya Gönder
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = Number(customCash) || 100000;
                  triggerAction(
                    'GRANT_CASH_ALL',
                    { amount: val },
                    `Tüm kayıtlı oyunculara (${accounts.length} hesap) +₺${val.toLocaleString('tr-TR')} gönderildi!`,
                    'ALL'
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs"
              >
                🌍 Tüm Oyunculara Gönder
              </button>
            </div>
          </div>

          {/* XP, Seviye, İtibar & Altyapı Süper Hediyeleri */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              3. @{targetAccount.username} İçin Seviye (XP), Şoför, Mazot & Altyapı Hediyeleri
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'GRANT_XP',
                    { xp: 2000 },
                    `@${targetAccount.username} hesabına +2.000 XP verildi!`
                  )
                }
                className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                ⭐ +2.000 XP Ver
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'GRANT_XP',
                    { xp: 15000 },
                    `@${targetAccount.username} Maksimum Seviyeye (Sv.6) yükseltildi!`
                  )
                }
                className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                👑 Maksimum Seviye Yap (Sv.6)
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'MAX_REPUTATION',
                    {},
                    `@${targetAccount.username} itibarı %100 yapıldı ve borçları silindi!`
                  )
                }
                className="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold"
              >
                🛡️ %100 İtibar & Borç Sil
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'GRANT_FUEL',
                    { liters: 25000 },
                    `@${targetAccount.username} yakıt tankına +25.000L mazot eklendi!`
                  )
                }
                className="p-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold"
              >
                ⛽ +25.000L Mazot Hediye Et
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'UNLOCK_ALL_CITIES',
                    {},
                    `@${targetAccount.username} için tüm Türkiye (22 İl) şubeleri ve Ar-Ge'ler açıldı!`
                  )
                }
                className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold"
              >
                🗺️ 22 İl Şube + Tüm Ar-Ge Aç
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'GRANT_ELITE_DRIVER',
                    {},
                    `@${targetAccount.username} kadrosuna 5★ Efsanevi Kaptan Şoför eklendi!`
                  )
                }
                className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
              >
                👨‍✈️ 5★ Uzman Şoför Hediye Et
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OYUNCUYA ÜCRETSİZ ARAÇ HEDİYE ETME GALERİSİ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" />
          4. Seçili Oyuncuya (@{targetAccount.username}) Ücretsiz Araç Hediye Et
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Seviye veya kasa şartı olmaksızın istediğiniz aracı tek tıkla @{targetAccount.username} oyuncusunun garajına ücretsiz hediye olarak gönderebilirsiniz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {VEHICLE_CATALOG.map((model) => (
            <div
              key={model.modelId}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5"
            >
              <div>
                <VehiclePixarCardBanner
                  modelId={model.modelId}
                  name={model.name}
                  badgeText={`${model.capacityTons}t`}
                  heightClass="h-28"
                />
                <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
                  {model.category} • {model.speedKmh} km/s
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  triggerAction(
                    'GRANT_VEHICLE',
                    { model },
                    `@${targetAccount.username} filosuna 1 adet ${model.name} hediye edildi!`
                  )
                }
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Gift className="w-3.5 h-3.5" />
                @{targetAccount.username}’a Hediye Et
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
