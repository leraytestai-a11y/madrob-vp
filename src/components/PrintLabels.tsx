import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, Printer, Tag, AlertCircle, CheckCircle, Loader, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOperator } from '../contexts/OperatorContext';
import { printLabels, getLabelPreviewHtml } from '../lib/labelPrint';

interface PrintLabelsProps {
  onBack: () => void;
  onHome: () => void;
}

interface SkuOption {
  sku: string;
  brand: string;
  available: number;
}

type Step = 'brand' | 'sku' | 'confirm';
type PrintState = 'idle' | 'loading' | 'ready' | 'error';

export default function PrintLabels({ onBack, onHome }: PrintLabelsProps) {
  const { selectedOperator } = useOperator();
  const [skuOptions, setSkuOptions] = useState<SkuOption[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [step, setStep] = useState<Step>('brand');
  const [skuLoading, setSkuLoading] = useState(true);
  const [printState, setPrintState] = useState<PrintState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [readySerial, setReadySerial] = useState<string | null>(null);
  const [readySku, setReadySku] = useState<string>('');
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadSkuOptions();
  }, []);

  useEffect(() => {
    if (printState === 'ready' && readySerial && readySku && previewRef.current) {
      const html = getLabelPreviewHtml(readySku, readySerial);
      const doc = previewRef.current.contentDocument || previewRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [printState, readySerial, readySku]);

  async function loadSkuOptions() {
    setSkuLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-sku-availability`;
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load SKU availability');
      const data: SkuOption[] = await res.json();
      setSkuOptions(data);
    } catch (e) {
      console.error(e);
      setSkuOptions([]);
    } finally {
      setSkuLoading(false);
    }
  }

  const brands = Array.from(new Set(skuOptions.map(o => o.brand))).sort();
  const skusForBrand = skuOptions.filter(o => o.brand === selectedBrand);
  const selectedSkuData = skuOptions.find(s => s.sku === selectedSku);

  function handleSelectBrand(brand: string) {
    setSelectedBrand(brand);
    setSelectedSku('');
    setStep('sku');
  }

  function handleSelectSku(sku: string) {
    setSelectedSku(sku);
    setStep('confirm');
  }

  function handleBackToSkus() {
    setSelectedSku('');
    setStep('sku');
  }

  function handleBackToBrands() {
    setSelectedBrand('');
    setSelectedSku('');
    setStep('brand');
  }

  async function handleFetchSerial() {
    if (!selectedSku) return;
    setPrintState('loading');
    setErrorMsg('');
    setReadySerial(null);

    try {
      const { data: job, error: insertErr } = await supabase
        .from('print_label_jobs')
        .insert({
          sku: selectedSku,
          operator_initials: selectedOperator || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertErr || !job) throw new Error('Failed to create print job');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-label-print`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: job.id, sku: selectedSku }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to fetch serial number');
      }

      const result = await res.json();
      const serial = result.serial_number;
      if (!serial) throw new Error('No serial number returned');

      setReadySerial(serial);
      setReadySku(selectedSku);
      setPrintState('ready');
      await loadSkuOptions();
    } catch (e: any) {
      setErrorMsg(e?.message || 'An error occurred');
      setPrintState('error');
    }
  }

  async function handlePrint() {
    if (readySerial && readySku) {
      await printLabels(readySku, readySerial);
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mark-labels-printed`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sku: readySku, serial_number: readySerial }),
        });
      } catch (e) {
        console.error('Failed to mark labels as printed', e);
      }
    }
  }

  function handleReset() {
    setPrintState('idle');
    setReadySerial(null);
    setReadySku('');
    setErrorMsg('');
    setSelectedBrand('');
    setSelectedSku('');
    setStep('brand');
  }

  function handleBack() {
    if (printState === 'ready' || printState === 'error') {
      handleReset();
      return;
    }
    if (step === 'sku') {
      handleBackToBrands();
    } else if (step === 'confirm') {
      handleBackToSkus();
    } else {
      onBack();
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button onClick={onHome} className="text-slate-400 hover:text-white transition-colors p-2">
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-3 mb-4">
          <Printer className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Print Labels</h1>
        </div>

        {!selectedOperator && (
          <div className="bg-[#1a2942] border border-orange-500/50 rounded-2xl p-8 mb-6 mt-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-orange-400" />
            </div>
            <p className="text-white text-center text-lg font-semibold mb-2">No Operator Selected</p>
            <p className="text-slate-400 text-center">Please select an operator from the header before printing.</p>
          </div>
        )}

        {printState === 'ready' && readySerial ? (
          <div className="space-y-6 mt-8">
            <div className="bg-[#1a2942] border border-green-500/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold">Labels ready</p>
                  <p className="text-slate-400 text-sm">SKU: <span className="text-white font-mono">{readySku}</span> — Serial: <span className="text-white font-mono">{readySerial}</span></p>
                </div>
              </div>

              <div className="bg-[#0a1628] rounded-xl overflow-hidden border border-slate-700 mb-1">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Label preview</span>
                  <span className="text-slate-500 text-xs">62mm × 29mm × 2</span>
                </div>
                <div className="flex justify-center py-4 px-4 overflow-x-auto">
                  <iframe
                    ref={previewRef}
                    title="Label preview"
                    style={{
                      width: '248px',
                      height: '232px',
                      border: 'none',
                      background: '#fff',
                      borderRadius: '4px',
                    }}
                    scrolling="no"
                  />
                </div>
              </div>
              <p className="text-slate-500 text-xs text-center">LEFT + RIGHT labels — 2 pages</p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-transparent border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Print Another Pair
            </button>
          </div>
        ) : printState === 'error' ? (
          <div className="bg-[#1a2942] border border-red-500/50 rounded-2xl p-10 text-center mt-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Failed</h2>
            <p className="text-slate-400 mb-8 text-sm">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {skuLoading ? (
              <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-16 flex items-center justify-center gap-3">
                <Loader className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-400">Loading availability...</span>
              </div>
            ) : (
              <>
                {step === 'brand' && (
                  <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Tag className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Select Brand</span>
                      <button
                        onClick={loadSkuOptions}
                        className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {brands.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No brands with available serial numbers found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {brands.map((brand) => {
                          const totalPairs = skuOptions
                            .filter(o => o.brand === brand)
                            .reduce((sum, o) => sum + o.available, 0);
                          const skuCount = skuOptions.filter(o => o.brand === brand).length;
                          return (
                            <button
                              key={brand}
                              onClick={() => handleSelectBrand(brand)}
                              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-slate-700 bg-[#0a1628] hover:border-blue-500 hover:bg-blue-600/5 transition-all group"
                            >
                              <div className="text-left">
                                <p className="text-white font-semibold text-lg">{brand}</p>
                                <p className="text-slate-500 text-sm">{skuCount} SKU{skuCount !== 1 ? 's' : ''}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                                  totalPairs > 10
                                    ? 'bg-green-600/20 text-green-400'
                                    : totalPairs > 0
                                    ? 'bg-orange-600/20 text-orange-400'
                                    : 'bg-red-600/20 text-red-400'
                                }`}>
                                  {totalPairs} pair{totalPairs !== 1 ? 's' : ''}
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {step === 'sku' && (
                  <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{selectedBrand}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Select SKU</span>
                      <button
                        onClick={loadSkuOptions}
                        className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {skusForBrand.map((opt) => (
                        <button
                          key={opt.sku}
                          onClick={() => handleSelectSku(opt.sku)}
                          disabled={opt.available === 0}
                          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-slate-700 bg-[#0a1628] hover:border-blue-500 hover:bg-blue-600/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
                        >
                          <span className="text-white font-semibold text-lg">{opt.sku}</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                              opt.available > 10
                                ? 'bg-green-600/20 text-green-400'
                                : opt.available > 0
                                ? 'bg-orange-600/20 text-orange-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {opt.available} pair{opt.available !== 1 ? 's' : ''}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 'confirm' && selectedSkuData && (
                  <>
                    <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8 mb-6">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{selectedBrand}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{selectedSku}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-[#0a1628] rounded-xl py-6 px-4">
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">SKU</p>
                          <p className="text-white text-xl font-bold">{selectedSku}</p>
                        </div>
                        <div className="bg-[#0a1628] rounded-xl py-6 px-4">
                          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Available Pairs</p>
                          <p className={`text-xl font-bold ${
                            selectedSkuData.available > 10
                              ? 'text-green-400'
                              : selectedSkuData.available > 0
                              ? 'text-orange-400'
                              : 'text-red-400'
                          }`}>
                            {selectedSkuData.available}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs text-center mt-4">
                        Will print LEFT + RIGHT labels for the next available serial number
                      </p>
                    </div>

                    <button
                      onClick={handleFetchSerial}
                      disabled={
                        printState === 'loading' ||
                        !selectedSku ||
                        !selectedOperator ||
                        (selectedSkuData?.available ?? 0) === 0
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-5 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
                    >
                      {printState === 'loading' ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Getting serial number...
                        </>
                      ) : (
                        <>
                          <Tag className="w-5 h-5" />
                          Generate Labels
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
