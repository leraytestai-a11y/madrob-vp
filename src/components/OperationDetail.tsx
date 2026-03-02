import { useEffect, useState } from 'react';
import { ArrowLeft, Home, ScanLine, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Operation, MeasurementField, SkiRecord } from '../types';
import DataEntryWorkflow from './DataEntryWorkflow';
import { useOperator } from '../contexts/OperatorContext';
import PDFViewerModal from './PDFViewerModal';
import { checkOperationPrerequisites } from '../lib/prerequisiteCheck';

interface OperationDetailProps {
  operation: Operation;
  onBack: () => void;
  onHome: () => void;
}

export default function OperationDetail({ operation, onBack, onHome }: OperationDetailProps) {
  const { selectedOperator } = useOperator();
  const [step, setStep] = useState<'serial' | 'side' | 'data'>('serial');
  const [serialNumber, setSerialNumber] = useState('');
  const [skiRecord, setSkiRecord] = useState<SkiRecord | null>(null);
  const [pairedSkiRecord, setPairedSkiRecord] = useState<SkiRecord | null>(null);
  const [fields, setFields] = useState<MeasurementField[]>([]);
  const [loading, setLoading] = useState(false);
  const [instructionPdf, setInstructionPdf] = useState<{ file_url: string; file_name: string } | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [prerequisiteWarning, setPrerequisiteWarning] = useState<string | null>(null);
  const [pendingSide, setPendingSide] = useState<'left' | 'right' | null>(null);
  const [isPairPending, setIsPairPending] = useState(false);

  useEffect(() => {
    loadFields();
    loadInstructionPdf();
  }, [operation.id]);

  async function loadFields() {
    try {
      const { data, error } = await supabase
        .from('measurement_fields')
        .select('*')
        .eq('operation_id', operation.id)
        .order('order');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  }

  async function loadInstructionPdf() {
    try {
      const { data, error } = await supabase
        .from('instruction_pdfs')
        .select('file_url, file_name')
        .eq('operation_id', operation.id)
        .maybeSingle();

      if (error) throw error;
      setInstructionPdf(data);
    } catch (error) {
      console.error('Error loading instruction PDF:', error);
      setInstructionPdf(null);
    }
  }

  const isPairOperation = operation.name === 'press_in' || operation.name === 'press_out';

  async function handleSerialSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    if (isPairOperation) {
      setLoading(true);
      try {
        const result = await checkOperationPrerequisites(operation.name, serialNumber.trim(), 'left');
        if (!result.ok && result.missingLabel) {
          setIsPairPending(true);
          setPendingSide(null);
          setPrerequisiteWarning(result.missingLabel);
          return;
        }
      } finally {
        setLoading(false);
      }
      await createPairSkiRecords();
    } else {
      setStep('side');
    }
  }

  async function handleSideSelect(selectedSide: 'left' | 'right') {
    setLoading(true);
    try {
      const result = await checkOperationPrerequisites(operation.name, serialNumber.trim(), selectedSide);
      if (!result.ok && result.missingLabel) {
        setPendingSide(selectedSide);
        setIsPairPending(false);
        setPrerequisiteWarning(result.missingLabel);
        return;
      }
    } finally {
      setLoading(false);
    }

    await createSkiRecord(selectedSide);
  }

  function handleWarningSkip() {
    const side = pendingSide;
    const pair = isPairPending;
    setPrerequisiteWarning(null);
    setPendingSide(null);
    setIsPairPending(false);
    if (pair) {
      createPairSkiRecords();
    } else if (side) {
      createSkiRecord(side);
    } else {
      setStep('side');
    }
  }

  function handleWarningBack() {
    setPrerequisiteWarning(null);
    setPendingSide(null);
    setIsPairPending(false);
  }

  async function createPairSkiRecords() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('ski_records')
        .insert([
          {
            serial_number: serialNumber,
            sku: null,
            side: 'left',
            operation_id: operation.id,
            created_by: user?.id || null,
            operator_initials: selectedOperator,
            status: 'in_progress'
          },
          {
            serial_number: serialNumber,
            sku: null,
            side: 'right',
            operation_id: operation.id,
            created_by: user?.id || null,
            operator_initials: selectedOperator,
            status: 'in_progress'
          }
        ])
        .select();

      if (error) throw error;
      const leftRecord = data?.find(r => r.side === 'left') || data?.[0];
      const rightRecord = data?.find(r => r.side === 'right') || data?.[1];
      setSkiRecord(leftRecord);
      setPairedSkiRecord(rightRecord);
      setStep('data');
    } catch (error) {
      console.error('Error creating pair ski records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createSkiRecord(selectedSide: 'left' | 'right' | null) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('ski_records')
        .insert({
          serial_number: serialNumber,
          sku: null,
          side: selectedSide as string,
          operation_id: operation.id,
          created_by: user?.id || null,
          operator_initials: selectedOperator,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      setSkiRecord(data);
      setStep('data');
    } catch (error) {
      console.error('Error creating ski record:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleComplete() {
    setSerialNumber('');
    setSkiRecord(null);
    setPairedSkiRecord(null);
    setStep('serial');
  }

  if (step === 'data' && skiRecord) {
    return (
      <DataEntryWorkflow
        skiRecord={skiRecord}
        pairedSkiRecord={pairedSkiRecord}
        fields={fields}
        operationName={operation.name}
        onComplete={handleComplete}
        onBack={onBack}
        onHome={onHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onHome}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-4 mb-12">
          <h1 className="text-4xl font-bold text-white text-center">
            {operation.display_name}
          </h1>
          <button
            onClick={() => instructionPdf && setShowPdfModal(true)}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold ${
              instructionPdf
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            How to
          </button>
        </div>

        {prerequisiteWarning && (
          <div className="bg-[#1a2942] border border-amber-500/50 rounded-2xl p-8 mb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-amber-500/10 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-amber-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white text-center mb-3">
              Operation Not Completed
            </h2>
            <p className="text-slate-300 text-center mb-2">
              <span className="font-semibold text-amber-300">{prerequisiteWarning}</span> has not been
              completed for this ski.
            </p>
            <p className="text-slate-400 text-center text-sm mb-8">
              Serial: {serialNumber}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleWarningBack}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleWarningSkip}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                Skip & Continue
              </button>
            </div>
          </div>
        )}

        {!prerequisiteWarning && step === 'serial' && (
          <>
            {!selectedOperator ? (
              <div className="bg-[#1a2942] border border-orange-500/50 rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-orange-500/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-orange-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white text-center mb-4">
                  No Operator Selected
                </h2>
                <p className="text-slate-400 text-center mb-8">
                  Please select an operator from the header above before starting data entry.
                </p>
                <button
                  onClick={onBack}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-500/10 p-4 rounded-full">
                    <ScanLine className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                  Scan Serial Number
                </h2>
                <form onSubmit={handleSerialSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Enter or scan serial number"
                    className="w-full bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-4 text-white text-xl text-center focus:outline-none focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!serialNumber.trim() || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {!prerequisiteWarning && step === 'side' && (
          <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white text-center mb-3">
              Select Side
            </h2>
            <p className="text-slate-400 text-center mb-8">Serial: {serialNumber}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSideSelect('left')}
                disabled={loading}
                className="bg-[#0a1628] border-2 border-slate-700 hover:border-blue-500 rounded-xl py-12 text-white font-semibold text-2xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              >
                LEFT
              </button>
              <button
                onClick={() => handleSideSelect('right')}
                disabled={loading}
                className="bg-[#0a1628] border-2 border-slate-700 hover:border-blue-500 rounded-xl py-12 text-white font-semibold text-2xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              >
                RIGHT
              </button>
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
                <span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                <span className="text-sm">Checking prerequisites...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showPdfModal && instructionPdf && (
        <PDFViewerModal
          pdfUrl={instructionPdf.file_url}
          title={`Instructions: ${operation.display_name}`}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
