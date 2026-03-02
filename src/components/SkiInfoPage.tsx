import { useState, useEffect } from 'react';
import { Home, ArrowLeft, Loader2, AlertCircle, Tag, Hash, Cpu, Wifi, CheckCircle, RefreshCw } from 'lucide-react';

const BRAND_SKU_TOKEN_WEBHOOK = 'https://n8n.srv833470.hstgr.cloud/webhook/720b5deb-c1f3-4ad6-9c1c-9388981e4a19';
const DRILLING_WEBHOOK = 'https://n8n.srv833470.hstgr.cloud/webhook/7b974084-7f71-4e6e-9c2a-50ed88d1db6c';
const MADROB_SYNC_URL = 'https://www.madrob-nfc.com/api/sync';
const MADROB_SYNC_TOKEN = 'madrob_sync_2025_secure_token';
const NFC_ENDPOINTS = ['https://127.0.0.1:3001', 'http://127.0.0.1:3001'];
const NFC_BASE_URL = 'https://www.madrob-nfc.com/ski/';

interface SkiInfoPageProps {
  serialNumber: string;
  side: string;
  sku: string | null;
  onDone: () => void;
  onHome: () => void;
}

interface SkiInfoData {
  brand?: string;
  sku?: string;
  serial_number?: string;
  token_id?: string;
  [key: string]: any;
}

interface DrillingData {
  [key: string]: any;
}

export default function SkiInfoPage({ serialNumber, side, sku, onDone, onHome }: SkiInfoPageProps) {
  const [skiInfo, setSkiInfo] = useState<SkiInfoData | null>(null);
  const [drillingInfo, setDrillingInfo] = useState<DrillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [nfcError, setNfcError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [infoRes, drillingRes] = await Promise.all([
        fetch(BRAND_SKU_TOKEN_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serial_number: serialNumber, side }),
        }),
        fetch(DRILLING_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku }),
        }),
      ]);

      if (infoRes.ok) {
        const json = await infoRes.json();
        console.log('[SkiInfoPage] skiInfo raw:', JSON.stringify(json));
        let row = Array.isArray(json) ? json[0] : json;
        if (row && typeof row === 'object' && !row.brand && !row.Brand && !row.token_id) {
          const nested = Object.values(row).find(v => v && typeof v === 'object' && !Array.isArray(v));
          if (nested) row = nested;
        }
        setSkiInfo(row || {});
      }

      if (drillingRes.ok) {
        const json = await drillingRes.json();
        console.log('[SkiInfoPage] drillingInfo raw:', JSON.stringify(json));
        let row = Array.isArray(json) ? json[0] : json;
        if (row && typeof row === 'object') {
          const nested = Object.values(row).find(v => v && typeof v === 'object' && !Array.isArray(v));
          if (nested && typeof nested === 'object' && 'drilling_info' in nested) row = nested;
        }
        setDrillingInfo(row || {});
      }
    } catch (err) {
      console.error('[SkiInfoPage] Error fetching data:', err);
      setError('Failed to load ski information.');
    } finally {
      setLoading(false);
    }
  }

  const displayBrand = skiInfo?.brand || skiInfo?.Brand || skiInfo?.['Client/Brand'] || drillingInfo?.Brand || drillingInfo?.brand || '—';
  const displaySku = skiInfo?.sku || skiInfo?.SKU || sku || '—';
  const displaySerial = skiInfo?.serial_number || skiInfo?.['Serial number'] || skiInfo?.serial || serialNumber;
  const displayTokenId = skiInfo?.token_id || skiInfo?.['Token ID'] || skiInfo?.tokenID || skiInfo?.TokenID || skiInfo?.token || '—';

  const displayDrilling = drillingInfo
    ? (drillingInfo.drilling_info || drillingInfo['drilling info'] || drillingInfo.drilling || drillingInfo.drill || null)
    : null;

  async function handleEncodeNfc() {
    if (displayTokenId === '—') return;
    setNfcStatus('writing');
    setNfcError(null);

    const urlToWrite = `${NFC_BASE_URL}${displayTokenId}`;
    let lastErr: Error = new Error('Service NFC non disponible. Lance NFC Service sur la tablette.');

    for (const base of NFC_ENDPOINTS) {
      try {
        const res = await fetch(`${base}/write-nfc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToWrite }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          setNfcStatus('success');
          Promise.allSettled([
            fetch(MADROB_SYNC_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MADROB_SYNC_TOKEN}`,
              },
              body: JSON.stringify({
                token_id: displayTokenId,
                brand: displayBrand,
                sku: displaySku,
                serial_number: displaySerial,
                drilling_info: drillingInfo?.drilling_info ?? drillingInfo?.['drilling info'] ?? drillingInfo?.drilling ?? drillingInfo?.drill ?? null,
              }),
            }),
          ]).catch(() => {});
          return;
        }
        lastErr = new Error(data.error || 'Echec ecriture NFC');
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error('Service NFC non disponible. Lance NFC Service sur la tablette.');
      }
    }

    setNfcStatus('error');
    setNfcError(lastErr.message);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onDone} className="text-slate-400 hover:text-white transition-colors p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button onClick={onHome} className="text-slate-400 hover:text-white transition-colors p-2">
            <Home className="w-6 h-6" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <p className="text-slate-400">Loading ski information...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-6 flex items-center gap-4 mb-6">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-6 mb-6">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Ski Details</p>
              <div className="space-y-3">
                <InfoRow icon={<Tag className="w-4 h-4 text-blue-400" />} label="Brand" value={displayBrand} />
                <InfoRow icon={<Hash className="w-4 h-4 text-emerald-400" />} label="SKU" value={displaySku} />
                <InfoRow icon={<Hash className="w-4 h-4 text-slate-400" />} label="Serial Number" value={displaySerial} />
                <InfoRow icon={<Cpu className="w-4 h-4 text-amber-400" />} label="Token ID" value={displayTokenId} />
                <InfoRow label="Drilling Info" value={displayDrilling ? String(displayDrilling) : '—'} accent="text-orange-400" />
              </div>
            </div>

            <button
              onClick={handleEncodeNfc}
              disabled={displayTokenId === '—' || nfcStatus === 'writing' || nfcStatus === 'success'}
              className={`w-full flex items-center justify-center gap-3 font-semibold py-4 rounded-xl transition-colors text-base mb-3
                ${nfcStatus === 'success'
                  ? 'bg-emerald-700 text-emerald-100 cursor-default'
                  : nfcStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : nfcStatus === 'writing'
                  ? 'bg-blue-800 text-blue-200 cursor-not-allowed'
                  : displayTokenId === '—'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {nfcStatus === 'writing' && <Loader2 className="w-5 h-5 animate-spin" />}
              {nfcStatus === 'success' && <CheckCircle className="w-5 h-5" />}
              {nfcStatus === 'error' && <RefreshCw className="w-5 h-5" />}
              {nfcStatus === 'idle' && <Wifi className="w-5 h-5" />}
              {nfcStatus === 'idle' && 'Encoder le tag NFC'}
              {nfcStatus === 'writing' && 'Ecriture en cours...'}
              {nfcStatus === 'success' && 'Tag encode'}
              {nfcStatus === 'error' && 'Reessayer'}
            </button>

            {nfcStatus === 'writing' && (
              <div className="bg-blue-900/30 border border-blue-500/40 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                <p className="text-blue-300 text-sm">Approche le tag du lecteur ACR1552...</p>
              </div>
            )}

            {nfcStatus === 'success' && (
              <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 text-sm font-semibold">Tag encode avec succes</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5 break-all">{NFC_BASE_URL}{displayTokenId}</p>
                </div>
              </div>
            )}

            {nfcStatus === 'error' && nfcError && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{nfcError}</p>
              </div>
            )}
          </>
        )}

        <button
          onClick={onDone}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, accent = 'text-white' }: { icon?: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between bg-[#0a1628] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-slate-400 text-sm capitalize">{label}</span>
      </div>
      <span className={`${accent} font-semibold text-sm text-right break-all max-w-[55%]`}>{value}</span>
    </div>
  );
}
