import { useState, useEffect } from 'react';
import { Home, ArrowLeft, Loader2, AlertCircle, Tag, Hash, Cpu } from 'lucide-react';

const BRAND_SKU_TOKEN_WEBHOOK = 'https://n8n.srv833470.hstgr.cloud/webhook/720b5deb-c1f3-4ad6-9c1c-9388981e4a19';
const DRILLING_WEBHOOK = 'https://n8n.srv833470.hstgr.cloud/webhook/7b974084-7f71-4e6e-9c2a-50ed88d1db6c';

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
        const row = Array.isArray(json) ? json[0] : json;
        setSkiInfo(row || {});
      }

      if (drillingRes.ok) {
        const json = await drillingRes.json();
        const row = Array.isArray(json) ? json[0] : json;
        setDrillingInfo(row || {});
      }
    } catch (err) {
      console.error('[SkiInfoPage] Error fetching data:', err);
      setError('Failed to load ski information.');
    } finally {
      setLoading(false);
    }
  }

  const displayBrand = skiInfo?.brand || skiInfo?.Brand || '—';
  const displaySku = skiInfo?.sku || skiInfo?.SKU || sku || '—';
  const displaySerial = skiInfo?.serial_number || skiInfo?.serial || serialNumber;
  const displayTokenId = skiInfo?.token_id || skiInfo?.tokenID || skiInfo?.TokenID || skiInfo?.token || '—';

  const drillingEntries = drillingInfo
    ? Object.entries(drillingInfo).filter(([, v]) => v !== null && v !== undefined && v !== '')
    : [];

  const primaryDrillingValue = drillingEntries.length > 0 ? String(drillingEntries[0][1]) : null;
  const secondaryDrillingEntries = drillingEntries.slice(1);

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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <HeroCard
                label="Brand"
                value={displayBrand}
                accent="text-blue-400"
                borderColor="border-blue-500/30"
              />
              <HeroCard
                label="Drilling"
                value={primaryDrillingValue ?? '—'}
                accent="text-orange-400"
                borderColor="border-orange-500/30"
              />
            </div>

            {secondaryDrillingEntries.length > 0 && (
              <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-5 mb-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Additional Drilling Info</p>
                <div className="space-y-2">
                  {secondaryDrillingEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-[#0a1628] rounded-xl px-4 py-3">
                      <span className="text-slate-400 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-semibold text-sm">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-5 mb-8">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Ski Details</p>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<Hash className="w-4 h-4 text-emerald-400" />} label="SKU" value={displaySku} />
                <InfoCard icon={<Hash className="w-4 h-4 text-slate-400" />} label="Serial" value={displaySerial} />
                <InfoCard icon={<Cpu className="w-4 h-4 text-amber-400" />} label="Token ID" value={displayTokenId} />
                <InfoCard icon={<Tag className="w-4 h-4 text-blue-400" />} label="Side" value={side.toUpperCase()} />
              </div>
            </div>
          </>
        )}

        <button
          onClick={onDone}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function HeroCard({ label, value, accent, borderColor }: { label: string; value: string; accent: string; borderColor: string }) {
  return (
    <div className={`bg-[#1a2942] border ${borderColor} rounded-2xl p-6 flex flex-col items-center justify-center text-center`}>
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{label}</span>
      <span className={`${accent} font-bold text-4xl leading-tight break-all`}>{value}</span>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0a1628] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white font-bold text-base break-all">{value}</p>
    </div>
  );
}
