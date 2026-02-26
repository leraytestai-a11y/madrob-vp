import { useState } from 'react';
import { ArrowLeft, Home, Search } from 'lucide-react';
import SkiDataDisplay from './SkiDataDisplay';

interface SkiReaderProps {
  onBack: () => void;
  onHome: () => void;
}

const WEBHOOK_URL =
  'https://n8n.srv833470.hstgr.cloud/webhook/720b5deb-c1f3-4ad6-9c1c-9388981e4a19';

export default function SkiReader({ onBack, onHome }: SkiReaderProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [side, setSide] = useState<'L' | 'R' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const canSearch = serialNumber.trim().length > 0 && side !== null;

  async function handleSearch() {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial_number: serialNumber.trim(), side: side === 'L' ? 'left' : 'right' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Read Ski Data</h1>
          <button
            onClick={onHome}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="mb-5">
            <label className="block text-slate-400 text-sm mb-2">Serial Number</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 10000"
              className="w-full bg-[#0f1f35] border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-400 text-sm mb-2">Side</label>
            <div className="flex gap-3">
              {(['L', 'R'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all ${
                    side === s
                      ? 'bg-blue-500 text-white border border-blue-400'
                      : 'bg-[#0f1f35] text-slate-400 border border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!canSearch || loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-4 text-red-300 text-sm mb-6">
            Error: {error}
          </div>
        )}

        {result !== null && (
          <div>
            <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Ski Data
            </h2>
            <SkiDataDisplay data={result} />
          </div>
        )}
      </div>
    </div>
  );
}
