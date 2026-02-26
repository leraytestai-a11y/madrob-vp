import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, CheckCircle, SkipForward, ChevronLeft, HelpCircle, MessageSquare, Droplets, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SkiRecord, MeasurementField } from '../types';
import Summary from './Summary';
import NumericKeypad from './NumericKeypad';
import PDFViewerModal from './PDFViewerModal';

const WAX_OIL_TRIGGER_FIELD = 'base_gap_finition';

interface DataEntryWorkflowProps {
  skiRecord: SkiRecord;
  pairedSkiRecord?: SkiRecord | null;
  fields: MeasurementField[];
  operationName: string;
  onComplete: () => void;
  onBack: () => void;
  onHome: () => void;
}

export default function DataEntryWorkflow({
  skiRecord,
  pairedSkiRecord,
  fields,
  operationName,
  onComplete,
  onBack,
  onHome
}: DataEntryWorkflowProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isFail, setIsFail] = useState(false);
  const [showFailConfirm, setShowFailConfirm] = useState(false);
  const [showWaxOilPrompt, setShowWaxOilPrompt] = useState(false);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);
  const [existingMeasurements, setExistingMeasurements] = useState<Map<string, any>>(new Map());
  const [visibleFields, setVisibleFields] = useState<MeasurementField[]>([]);
  const [instructionPdf, setInstructionPdf] = useState<{ file_url: string; file_name: string } | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const commentSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentField = visibleFields[currentFieldIndex];
  const progress = visibleFields.length > 0 ? ((currentFieldIndex + 1) / visibleFields.length) * 100 : 0;

  useEffect(() => {
    loadExistingMeasurements();
    loadGlobalComment();
  }, [skiRecord.id, skiRecord.serial_number, skiRecord.side]);

  useEffect(() => {
    updateVisibleFields();
  }, [fields, existingMeasurements]);

  useEffect(() => {
    if (currentField) {
      const existing = existingMeasurements.get(currentField.id);
      if (existing) {
        setValue(existing.value || '');
      } else {
        setValue('');
      }
      loadInstructionPdf(currentField.id);
    }
  }, [currentFieldIndex, existingMeasurements, currentField]);

  async function loadInstructionPdf(fieldId: string) {
    try {
      const { data, error } = await supabase
        .from('instruction_pdfs')
        .select('file_url, file_name')
        .eq('field_id', fieldId)
        .maybeSingle();

      if (error) throw error;
      setInstructionPdf(data);
    } catch (error) {
      console.error('Error loading instruction PDF:', error);
      setInstructionPdf(null);
    }
  }

  function isFieldVisible(field: MeasurementField, measurementsMap: Map<string, any>): boolean {
    if (!field.depends_on || !field.depends_on_value) {
      return true;
    }

    const dependentField = fields.find(f => f.id === field.depends_on);
    if (!dependentField) {
      return true;
    }

    const dependentMeasurement = measurementsMap.get(field.depends_on);
    if (!dependentMeasurement) {
      return false;
    }

    const allowedValues = field.depends_on_value.split(',').map(v => v.trim());
    return allowedValues.includes(dependentMeasurement.value);
  }

  function updateVisibleFields() {
    const visible = fields.filter(field => isFieldVisible(field, existingMeasurements));
    setVisibleFields(visible);
  }

  function computeVisibleFields(measurementsMap: Map<string, any>): MeasurementField[] {
    return fields.filter(field => isFieldVisible(field, measurementsMap));
  }

  async function loadExistingMeasurements(): Promise<Map<string, any>> {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('ski_record_id', skiRecord.id);

      if (error) throw error;

      const map = new Map();
      data?.forEach(m => map.set(m.field_id, m));
      setExistingMeasurements(map);
      return map;
    } catch (error) {
      console.error('Error loading measurements:', error);
      return existingMeasurements;
    }
  }

  async function loadGlobalComment() {
    setCommentLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ski-comment`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serial_number: skiRecord.serial_number, side: skiRecord.side }),
      });

      if (response.ok) {
        const data = await response.json();
        setComment(data.comment || '');
      }
    } catch (error) {
      console.error('Error loading global comment:', error);
    } finally {
      setCommentLoading(false);
    }
  }

  function handleCommentChange(text: string) {
    setComment(text);
    if (commentSaveTimer.current) clearTimeout(commentSaveTimer.current);
    commentSaveTimer.current = setTimeout(() => {
      saveComment(text);
    }, 800);
  }

  async function saveComment(text: string) {
    try {
      await Promise.all([
        supabase
          .from('ski_records')
          .update({ comment: text || null })
          .eq('id', skiRecord.id),
        supabase
          .from('ski_global_comments')
          .upsert(
            { serial_number: skiRecord.serial_number, comment: text || '', updated_at: new Date().toISOString() },
            { onConflict: 'serial_number' }
          ),
      ]);
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  }

  function shouldTriggerWaxOil(fieldName: string, nextIndex: number): boolean {
    return fieldName === WAX_OIL_TRIGGER_FIELD && nextIndex < visibleFields.length;
  }

  async function saveMeasurementForRecord(recordId: string, fieldId: string, val: string | null, skipped: boolean) {
    return supabase
      .from('measurements')
      .upsert({
        ski_record_id: recordId,
        field_id: fieldId,
        value: val,
        skipped
      }, {
        onConflict: 'ski_record_id,field_id'
      });
  }

  async function handleValidate() {
    if (!value.trim() && currentField.required) return;

    setLoading(true);
    try {
      const saves = [saveMeasurementForRecord(skiRecord.id, currentField.id, value.trim(), false)];
      if (pairedSkiRecord) {
        saves.push(saveMeasurementForRecord(pairedSkiRecord.id, currentField.id, value.trim(), false));
      }
      const results = await Promise.all(saves);
      const firstError = results.find(r => r.error)?.error;
      if (firstError) throw firstError;

      const updatedMap = await loadExistingMeasurements();
      const updatedVisible = computeVisibleFields(updatedMap);
      const currentFieldInUpdated = updatedVisible.findIndex(f => f.id === currentField.id);
      const nextIndex = currentFieldInUpdated + 1;

      if (nextIndex < updatedVisible.length) {
        if (shouldTriggerWaxOil(currentField.name, nextIndex)) {
          setPendingNextIndex(nextIndex);
          setShowWaxOilPrompt(true);
        } else {
          setCurrentFieldIndex(nextIndex);
        }
      } else {
        await showSummaryPage(false);
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      const saves = [saveMeasurementForRecord(skiRecord.id, currentField.id, null, true)];
      if (pairedSkiRecord) {
        saves.push(saveMeasurementForRecord(pairedSkiRecord.id, currentField.id, null, true));
      }
      const results = await Promise.all(saves);
      const firstError = results.find(r => r.error)?.error;
      if (firstError) throw firstError;

      const updatedMap = await loadExistingMeasurements();
      const updatedVisible = computeVisibleFields(updatedMap);
      const currentFieldInUpdated = updatedVisible.findIndex(f => f.id === currentField.id);
      const nextIndex = currentFieldInUpdated + 1;

      if (nextIndex < updatedVisible.length) {
        if (shouldTriggerWaxOil(currentField.name, nextIndex)) {
          setPendingNextIndex(nextIndex);
          setShowWaxOilPrompt(true);
        } else {
          setCurrentFieldIndex(nextIndex);
        }
      } else {
        await showSummaryPage(false);
      }
    } catch (error) {
      console.error('Error skipping measurement:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkiFail() {
    setLoading(true);
    try {
      if (commentSaveTimer.current) {
        clearTimeout(commentSaveTimer.current);
        await saveComment(comment);
      }

      const allFields = computeVisibleFields(existingMeasurements);
      const unsavedFields = allFields.filter(f => !existingMeasurements.has(f.id));

      if (unsavedFields.length > 0) {
        const skipUpserts = unsavedFields.flatMap(f => {
          const ops = [saveMeasurementForRecord(skiRecord.id, f.id, null, true)];
          if (pairedSkiRecord) {
            ops.push(saveMeasurementForRecord(pairedSkiRecord.id, f.id, null, true));
          }
          return ops;
        });
        await Promise.all(skipUpserts);
      }

      const ids = [skiRecord.id];
      if (pairedSkiRecord) ids.push(pairedSkiRecord.id);
      await supabase
        .from('ski_records')
        .update({ grade: 'C', updated_at: new Date().toISOString() })
        .in('id', ids);

      await loadExistingMeasurements();
      setIsFail(true);
      setShowSummary(true);
    } catch (error) {
      console.error('Error declaring ski fail:', error);
    } finally {
      setLoading(false);
      setShowFailConfirm(false);
    }
  }

  function handleWaxOilConfirm() {
    setShowWaxOilPrompt(false);
    if (pendingNextIndex !== null) {
      setCurrentFieldIndex(pendingNextIndex);
      setPendingNextIndex(null);
    }
  }

  async function showSummaryPage(fail: boolean) {
    if (commentSaveTimer.current) {
      clearTimeout(commentSaveTimer.current);
      await saveComment(comment);
    }
    await loadExistingMeasurements();
    setIsFail(fail);
    setShowSummary(true);
  }

  async function completeRecord() {
    try {
      const now = new Date().toISOString();
      const ids = [skiRecord.id];
      if (pairedSkiRecord) ids.push(pairedSkiRecord.id);

      const updateData: Record<string, any> = { status: 'completed', updated_at: now };
      if (isFail) updateData.grade = 'C';

      const { error } = await supabase
        .from('ski_records')
        .update(updateData)
        .in('id', ids);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error completing record:', error);
    }
  }

  function handlePassFailSelect(selectedValue: string) {
    setValue(selectedValue);
  }

  function handlePrevious() {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  }

  if (showSummary) {
    return (
      <Summary
        skiRecord={{ ...skiRecord, comment }}
        pairedSkiRecord={pairedSkiRecord}
        fields={fields}
        measurements={existingMeasurements}
        operationName={operationName}
        isFail={isFail}
        onComplete={completeRecord}
        onBack={() => { setShowSummary(false); setIsFail(false); }}
        onHome={onHome}
      />
    );
  }

  if (showWaxOilPrompt) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-[#1a2942] border border-amber-500/40 rounded-3xl p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-amber-500/10 rounded-full p-6 border border-amber-500/30">
                <Droplets className="w-16 h-16 text-amber-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Action Required
            </h2>

            <div className="bg-[#0a1628] rounded-2xl px-8 py-6 mb-8 border border-slate-700/50">
              <p className="text-amber-300 text-xl font-semibold mb-2">
                Please wax the skis
              </p>
              <p className="text-slate-400 text-base">
                and oil the talonettes
              </p>
            </div>

            <p className="text-slate-500 text-sm mb-8">
              Confirm once both actions are completed to continue with the final QC measurements.
            </p>

            <button
              onClick={handleWaxOilConfirm}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 rounded-xl transition-colors text-lg flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              Done — Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showFailConfirm) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-[#1a2942] border border-red-500/40 rounded-3xl p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-red-500/10 rounded-full p-6 border border-red-500/30">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Declare as Fail?
            </h2>

            <div className="bg-[#0a1628] rounded-2xl px-8 py-6 mb-8 border border-slate-700/50">
              <p className="text-red-300 text-xl font-semibold mb-2">
                Grade C will be assigned
              </p>
              <p className="text-slate-400 text-base">
                All remaining measurements will be skipped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowFailConfirm(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSkiFail}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Confirm Fail
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentField) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowFailConfirm(true)}
            className="bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-400 hover:text-red-300 font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            <XCircle className="w-4 h-4" />
            Ski Fail
          </button>
          <button
            onClick={onHome}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-[#1a2942] border border-slate-700/50 rounded-xl px-6 py-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {skiRecord.sku && (
                <div>
                  <span className="text-slate-500 text-sm uppercase tracking-wider">SKU</span>
                  <p className="text-white text-2xl font-bold">{skiRecord.sku}</p>
                </div>
              )}
              <div>
                <span className="text-slate-500 text-sm uppercase tracking-wider">Serial</span>
                <p className="text-white text-2xl font-bold">{skiRecord.serial_number}</p>
              </div>
              {pairedSkiRecord ? (
                <div>
                  <span className="text-slate-500 text-sm uppercase tracking-wider">Side</span>
                  <p className="text-2xl font-bold text-emerald-400">PAIR</p>
                </div>
              ) : skiRecord.side ? (
                <div>
                  <span className="text-slate-500 text-sm uppercase tracking-wider">Side</span>
                  <p className={`text-2xl font-bold ${skiRecord.side === 'left' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {skiRecord.side.toUpperCase()}
                  </p>
                </div>
              ) : null}
            </div>
            <span className="text-slate-400 text-lg font-medium">{currentFieldIndex + 1} / {visibleFields.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8 mb-4">
          <div className="flex justify-center items-center gap-4 mb-2">
            <h2 className="text-3xl font-bold text-white text-center">
              {currentField.display_name}
            </h2>
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
          {currentField.unit && (
            <p className="text-slate-400 text-center mb-8">Unit: {currentField.unit}</p>
          )}

          {currentField.field_type === 'numeric' && (
            <div className="mb-8">
              <NumericKeypad
                value={value}
                onValueChange={setValue}
              />
            </div>
          )}

          {currentField.field_type === 'pass_fail' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handlePassFailSelect('pass')}
                className={`py-12 rounded-xl text-2xl font-semibold transition-all ${
                  value === 'pass'
                    ? 'bg-green-600 text-white border-2 border-green-400 scale-105'
                    : 'bg-green-700 text-white border-2 border-green-600 hover:bg-green-600'
                }`}
              >
                PASS
              </button>
              <button
                onClick={() => handlePassFailSelect('fail')}
                className={`py-12 rounded-xl text-2xl font-semibold transition-all ${
                  value === 'fail'
                    ? 'bg-red-600 text-white border-2 border-red-400 scale-105'
                    : 'bg-red-700 text-white border-2 border-red-600 hover:bg-red-600'
                }`}
              >
                FAIL
              </button>
            </div>
          )}

          {currentField.field_type === 'pass_repair' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handlePassFailSelect('pass')}
                className={`py-12 rounded-xl text-2xl font-semibold transition-all ${
                  value === 'pass'
                    ? 'bg-green-600 text-white border-2 border-green-400 scale-105'
                    : 'bg-green-700 text-white border-2 border-green-600 hover:bg-green-600'
                }`}
              >
                PASS
              </button>
              <button
                onClick={() => handlePassFailSelect('repair')}
                className={`py-12 rounded-xl text-2xl font-semibold transition-all ${
                  value === 'repair'
                    ? 'bg-orange-600 text-white border-2 border-orange-400 scale-105'
                    : 'bg-orange-700 text-white border-2 border-orange-600 hover:bg-orange-600'
                }`}
              >
                REPAIR
              </button>
            </div>
          )}

          {currentField.field_type === 'text' && (
            <div className="mb-8">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter text"
                rows={4}
                className="w-full bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-4 text-white text-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                autoFocus
              />
            </div>
          )}

          {currentField.field_type === 'select' && currentField.options && (
            <div className={`grid gap-4 mb-8 ${currentField.options.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {currentField.options.map((option) => {
                const optionLower = option.toLowerCase();
                let colorClasses = '';

                if (optionLower === 'pass') {
                  colorClasses = value === option
                    ? 'bg-green-600 text-white border-2 border-green-400 scale-105'
                    : 'bg-green-700 text-white border-2 border-green-600 hover:bg-green-600';
                } else if (optionLower === 'corrected' || optionLower === 'repair') {
                  colorClasses = value === option
                    ? 'bg-orange-600 text-white border-2 border-orange-400 scale-105'
                    : 'bg-orange-700 text-white border-2 border-orange-600 hover:bg-orange-600';
                } else if (optionLower === 'fail') {
                  colorClasses = value === option
                    ? 'bg-red-600 text-white border-2 border-red-400 scale-105'
                    : 'bg-red-700 text-white border-2 border-red-600 hover:bg-red-600';
                } else {
                  colorClasses = value === option
                    ? 'bg-blue-600 text-white border-2 border-blue-400 scale-105'
                    : 'bg-blue-700 text-white border-2 border-blue-600 hover:bg-blue-600';
                }

                return (
                  <button
                    key={option}
                    onClick={() => setValue(option)}
                    className={`py-12 rounded-xl text-2xl font-semibold transition-all ${colorClasses}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentFieldIndex === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              Skip
            </button>
            <button
              onClick={handleValidate}
              disabled={loading || (currentField.required && !value.trim())}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {currentFieldIndex < visibleFields.length - 1 ? 'Next' : 'Complete'}
            </button>
          </div>
        </div>

        <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Comment</span>
            {commentLoading && (
              <span className="ml-auto text-xs text-slate-500">loading...</span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={commentLoading ? 'Loading comment...' : 'Leave a comment for this record...'}
            rows={3}
            disabled={commentLoading}
            className="w-full bg-[#0a1628] border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-slate-500 transition-colors resize-none placeholder-slate-600 disabled:opacity-50"
          />
        </div>
      </div>

      {showPdfModal && instructionPdf && (
        <PDFViewerModal
          pdfUrl={instructionPdf.file_url}
          title={`Instructions: ${currentField.display_name}`}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
