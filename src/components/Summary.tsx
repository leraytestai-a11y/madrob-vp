import { useState } from 'react';
import { ArrowLeft, Home, CheckCircle, AlertCircle, User, Calendar, Clock, Edit2, Save, X, MessageSquare, XCircle } from 'lucide-react';
import { SkiRecord, MeasurementField } from '../types';
import { useOperator } from '../contexts/OperatorContext';

interface SummaryProps {
  skiRecord: SkiRecord;
  pairedSkiRecord?: SkiRecord | null;
  fields: MeasurementField[];
  measurements: Map<string, any>;
  operationName: string;
  isFail?: boolean;
  onComplete: () => void;
  onBack: () => void;
  onHome: () => void;
}

export default function Summary({
  skiRecord,
  pairedSkiRecord,
  fields,
  measurements,
  operationName,
  isFail,
  onComplete,
  onBack,
  onHome
}: SummaryProps) {
  const [loading, setLoading] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Map<string, any>>(new Map(measurements));
  const { selectedOperator } = useOperator();
  const now = new Date();
  const timestamp = now.toISOString();
  const date = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  function getValueColor(field: MeasurementField, measurement: any) {
    if (!measurement || measurement.skipped) {
      return 'bg-slate-700 text-slate-400';
    }

    const value = typeof measurement.value === 'string'
      ? measurement.value.toLowerCase()
      : measurement.value;

    if (field.field_type === 'pass_fail') {
      return value === 'pass'
        ? 'bg-green-600 text-white border-green-500'
        : 'bg-red-600 text-white border-red-500';
    }

    if (field.field_type === 'pass_repair') {
      if (value === 'pass') return 'bg-green-600 text-white border-green-500';
      return 'bg-orange-600 text-white border-orange-500';
    }

    if (field.field_type === 'select') {
      if (value === 'pass') return 'bg-green-600 text-white border-green-500';
      if (value === 'corrected' || value === 'repair') return 'bg-orange-600 text-white border-orange-500';
      if (value === 'fail') return 'bg-red-600 text-white border-red-500';
    }

    return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
  }

  function formatValue(field: MeasurementField, measurement: any) {
    if (!measurement || measurement.skipped) {
      return 'SKIPPED';
    }

    const value = measurement.value;

    if (field.field_type === 'numeric') {
      return `${value} ${field.unit || ''}`.trim();
    }

    return value.toUpperCase();
  }

  function handleEditClick(fieldId: string) {
    setEditingFieldId(fieldId);
  }

  function handleSaveEdit() {
    setEditingFieldId(null);
  }

  function handleCancelEdit(fieldId: string) {
    const newEditedValues = new Map(editedValues);
    newEditedValues.set(fieldId, measurements.get(fieldId));
    setEditedValues(newEditedValues);
    setEditingFieldId(null);
  }

  function handleValueChange(fieldId: string, value: any, skipped: boolean = false) {
    const newEditedValues = new Map(editedValues);
    newEditedValues.set(fieldId, { value, skipped });
    setEditedValues(newEditedValues);
  }

  async function handleValidate() {
    setLoading(true);
    try {
      const flatMeasurements: Record<string, any> = {};
      fields.forEach(field => {
        const measurement = editedValues.get(field.id);
        flatMeasurements[`${field.name}_${operationName}`] = measurement?.skipped ? 'SKIPPED' : (measurement?.value ?? null);
      });

      const isPairOperation = operationName === 'press_in' || operationName === 'press_out';

      const summaryData = {
        ski_record_id: skiRecord.id,
        serial_number: skiRecord.serial_number,
        sku: skiRecord.sku || null,
        ...(isPairOperation ? {} : { side: skiRecord.side }),
        operation_id: skiRecord.operation_id,
        [`operator_${operationName}`]: selectedOperator,
        [`timestamp_${operationName}`]: timestamp,
        [`date_${operationName}`]: date,
        [`time_${operationName}`]: time,
        comment: skiRecord.comment || null,
        created_at: skiRecord.created_at,
        ...(isFail ? { ski_fail: true, qc_grade_final_qc: 'C' } : {}),
        ...flatMeasurements,
      };

      const isPressOperation = operationName === 'press_in' || operationName === 'press_out';
      const endpoint = isPressOperation ? 'send-press-summary' : 'send-measurement-summary';
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`;

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(summaryData)
      });

      onComplete();
    } catch (error) {
      console.error('Error sending summary:', error);
    } finally {
      setLoading(false);
    }
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
            onClick={onHome}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {isFail ? (
              <XCircle className="w-10 h-10 text-red-400" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-400" />
            )}
            <h1 className="text-3xl font-bold text-white">Summary</h1>
          </div>
          <p className="text-slate-400 text-center mb-4">
            Serial: {skiRecord.serial_number}{pairedSkiRecord ? ' - PAIR' : skiRecord.side ? ` - ${skiRecord.side.toUpperCase()}` : ''}
          </p>

          {isFail && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-2xl px-6 py-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-bold text-lg">Ski declared as FAIL</p>
                  <p className="text-red-400/70 text-sm">Grade C assigned — remaining measurements skipped</p>
                </div>
              </div>
              <div className="bg-red-600 text-white font-black text-2xl px-4 py-2 rounded-xl">
                C
              </div>
            </div>
          )}

          <div className="bg-[#1a2942] border border-slate-700/50 rounded-xl p-4 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Operator</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {selectedOperator || 'N/A'}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Date</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {date}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Time</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {time}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="space-y-3">
            {fields.map((field) => {
              const measurement = editedValues.get(field.id);
              const colorClass = getValueColor(field, measurement);
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-3 p-4 bg-[#0a1628] rounded-xl"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{field.display_name}</h3>
                    {field.unit && !measurement?.skipped && (
                      <p className="text-slate-500 text-sm">Unit: {field.unit}</p>
                    )}
                  </div>

                  {!isEditing ? (
                    <>
                      <div className={`px-6 py-3 rounded-lg font-semibold border ${colorClass}`}>
                        {formatValue(field, measurement)}
                      </div>
                      <button
                        onClick={() => handleEditClick(field.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {field.field_type === 'numeric' && (
                          <input
                            type="number"
                            value={measurement?.value || ''}
                            onChange={(e) => handleValueChange(field.id, parseFloat(e.target.value) || 0)}
                            className="w-32 bg-[#1a2942] border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            step="0.01"
                          />
                        )}
                        {field.field_type === 'pass_fail' && (
                          <select
                            value={measurement?.value || 'pass'}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className="bg-[#1a2942] border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="pass">PASS</option>
                            <option value="fail">FAIL</option>
                          </select>
                        )}
                        {field.field_type === 'pass_repair' && (
                          <select
                            value={measurement?.value || 'pass'}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className="bg-[#1a2942] border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="pass">PASS</option>
                            <option value="repair">REPAIR</option>
                          </select>
                        )}
                        {field.field_type === 'select' && field.options && (
                          <select
                            value={measurement?.value || (field.options[0] || '')}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className="bg-[#1a2942] border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          >
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.field_type === 'text' && (
                          <input
                            type="text"
                            value={measurement?.value || ''}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className="w-32 bg-[#1a2942] border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          />
                        )}
                        <label className="flex items-center gap-2 text-slate-400 text-sm">
                          <input
                            type="checkbox"
                            checked={measurement?.skipped || false}
                            onChange={(e) => handleValueChange(field.id, measurement?.value, e.target.checked)}
                            className="rounded"
                          />
                          Skip
                        </label>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-400 hover:text-green-300 transition-colors p-2"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancelEdit(field.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {skiRecord.comment && (
          <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Comment</span>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{skiRecord.comment}</p>
          </div>
        )}

        <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <p className="text-slate-300 text-sm">
              Please review all measurements before validation. Once validated, this summary will be sent to the system.
            </p>
          </div>

          <button
            onClick={handleValidate}
            disabled={loading}
            className={`w-full disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              isFail
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isFail ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {loading ? 'Validating...' : 'Validate & Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
