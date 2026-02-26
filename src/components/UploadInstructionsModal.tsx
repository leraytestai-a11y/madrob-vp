import { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MeasurementField, Module, Operation } from '../types';

interface UploadInstructionsModalProps {
  onClose: () => void;
}

type InstructionType = 'field' | 'operation' | 'module';

interface ExistingPdf {
  id: string;
  file_name: string;
  file_url: string;
}

export default function UploadInstructionsModal({ onClose }: UploadInstructionsModalProps) {
  const [instructionType, setInstructionType] = useState<InstructionType>('field');
  const [fields, setFields] = useState<MeasurementField[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingPdf, setExistingPdf] = useState<ExistingPdf | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    loadFields();
    loadOperations();
    loadModules();
  }, []);

  useEffect(() => {
    setSelectedId('');
    setFile(null);
    setMessage('');
    setExistingPdf(null);
  }, [instructionType]);

  useEffect(() => {
    if (selectedId) {
      loadExistingPdf(selectedId);
    } else {
      setExistingPdf(null);
    }
    setFile(null);
    setMessage('');
  }, [selectedId]);

  async function loadExistingPdf(id: string) {
    setLoadingPdf(true);
    try {
      let query = supabase.from('instruction_pdfs').select('id, file_name, file_url');
      if (instructionType === 'field') query = query.eq('field_id', id);
      else if (instructionType === 'operation') query = query.eq('operation_id', id);
      else if (instructionType === 'module') query = query.eq('module_id', id);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      setExistingPdf(data || null);
    } catch (error) {
      console.error('Error loading existing PDF:', error);
      setExistingPdf(null);
    } finally {
      setLoadingPdf(false);
    }
  }

  async function loadFields() {
    try {
      const { data, error } = await supabase
        .from('measurement_fields')
        .select('*, operations(id, display_name)')
        .order('display_name');
      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  }

  async function loadOperations() {
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('display_name');
      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error loading operations:', error);
    }
  }

  async function loadModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('display_name');
      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setMessage('');
      } else {
        setMessage('Please select a PDF file');
        setFile(null);
      }
    }
  }

  async function handleDeleteExisting() {
    if (!existingPdf) return;
    try {
      const { error } = await supabase
        .from('instruction_pdfs')
        .delete()
        .eq('id', existingPdf.id);
      if (error) throw error;
      setExistingPdf(null);
      setMessage('PDF removed successfully');
    } catch (error) {
      console.error('Error deleting PDF:', error);
      setMessage('Error removing PDF. Please try again.');
    }
  }

  async function handleUpload() {
    if (!file || !selectedId) {
      setMessage('Please select an item and a PDF file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileName = `${instructionType}-${selectedId}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('instruction-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('instruction-pdfs')
        .getPublicUrl(fileName);

      const uploadData: any = {
        file_name: file.name,
        file_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
        field_id: null,
        operation_id: null,
        module_id: null
      };

      if (instructionType === 'field') {
        uploadData.field_id = selectedId;
      } else if (instructionType === 'operation') {
        uploadData.operation_id = selectedId;
      } else if (instructionType === 'module') {
        uploadData.module_id = selectedId;
      }

      const { error: dbError } = await supabase
        .from('instruction_pdfs')
        .upsert(uploadData);

      if (dbError) throw dbError;

      setMessage('PDF uploaded successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setMessage('Error uploading PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
      <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Upload Instructions</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg font-semibold mb-3">
              Instruction Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setInstructionType('field')}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  instructionType === 'field'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0a1628] text-slate-400 hover:text-white'
                }`}
              >
                Field
              </button>
              <button
                onClick={() => setInstructionType('operation')}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  instructionType === 'operation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0a1628] text-slate-400 hover:text-white'
                }`}
              >
                Operation
              </button>
              <button
                onClick={() => setInstructionType('module')}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  instructionType === 'module'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0a1628] text-slate-400 hover:text-white'
                }`}
              >
                Module
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-lg font-semibold mb-3">
              {instructionType === 'field' && 'Select Measurement Field'}
              {instructionType === 'operation' && 'Select Operation'}
              {instructionType === 'module' && 'Select Module'}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Choose...</option>
              {instructionType === 'field' && (() => {
                const grouped: Record<string, { operationName: string; fields: MeasurementField[] }> = {};
                for (const field of fields) {
                  const opId = (field as any).operation_id || 'no-operation';
                  const opName = (field as any).operations?.display_name || 'No Operation';
                  if (!grouped[opId]) grouped[opId] = { operationName: opName, fields: [] };
                  grouped[opId].fields.push(field);
                }
                return Object.entries(grouped)
                  .sort(([, a], [, b]) => a.operationName.localeCompare(b.operationName))
                  .map(([opId, group]) => (
                    <optgroup key={opId} label={group.operationName}>
                      {group.fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.display_name}
                        </option>
                      ))}
                    </optgroup>
                  ));
              })()}
              {instructionType === 'operation' && operations.map((operation) => (
                <option key={operation.id} value={operation.id}>
                  {operation.display_name}
                </option>
              ))}
              {instructionType === 'module' && modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.display_name}
                </option>
              ))}
            </select>
          </div>

          {selectedId && (
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Current PDF
              </label>
              {loadingPdf ? (
                <div className="bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-4 text-slate-400">
                  Loading...
                </div>
              ) : existingPdf ? (
                <div className="bg-[#0a1628] border border-green-700/50 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white font-medium truncate">{existingPdf.file_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={existingPdf.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Open PDF"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={handleDeleteExisting}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-4 text-slate-500 italic">
                  No PDF uploaded yet
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-white text-lg font-semibold mb-3">
              {existingPdf ? 'Replace PDF File' : 'Select PDF File'}
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-slate-600 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-blue-500 mb-4" />
                    <p className="text-white text-lg font-semibold mb-2">{file.name}</p>
                    <p className="text-slate-400 text-sm">Click to change file</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-white text-lg font-semibold mb-2">
                      Click to upload PDF
                    </p>
                    <p className="text-slate-400 text-sm">
                      Select a PDF file with instructions
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl text-center font-semibold ${
                message.includes('success') || message.includes('removed')
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !selectedId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : existingPdf ? 'Replace PDF' : 'Upload PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
