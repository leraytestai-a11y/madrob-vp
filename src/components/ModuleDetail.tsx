import { useEffect, useState } from 'react';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Module, Operation } from '../types';
import PDFViewerModal from './PDFViewerModal';

interface ModuleDetailProps {
  module: Module;
  onBack: () => void;
  onHome: () => void;
  onOperationClick: (operation: Operation) => void;
}

export default function ModuleDetail({ module, onBack, onHome, onOperationClick }: ModuleDetailProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructionPdf, setInstructionPdf] = useState<{ file_url: string; file_name: string } | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    loadOperations();
    loadInstructionPdf();
  }, [module.id]);

  async function loadOperations() {
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('module_id', module.id)
        .order('order');

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadInstructionPdf() {
    try {
      const { data, error } = await supabase
        .from('instruction_pdfs')
        .select('file_url, file_name')
        .eq('module_id', module.id)
        .maybeSingle();

      if (error) throw error;
      setInstructionPdf(data);
    } catch (error) {
      console.error('Error loading instruction PDF:', error);
      setInstructionPdf(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-4xl mx-auto">
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

        <div className="flex justify-center items-center gap-4 mb-4">
          <h1 className="text-5xl font-bold text-white text-center capitalize">
            {module.display_name}
          </h1>
          {instructionPdf && (
            <button
              onClick={() => setShowPdfModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <HelpCircle className="w-5 h-5" />
              How to
            </button>
          )}
        </div>
        <p className="text-slate-400 text-center mb-12">Select an operation</p>

        {loading ? (
          <div className="text-center text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {operations.map((operation) => (
              <button
                key={operation.id}
                onClick={() => onOperationClick(operation)}
                className="w-full bg-[#1a2942] border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all duration-200 hover:scale-[1.01] text-left"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {operation.display_name}
                </h2>
              </button>
            ))}
          </div>
        )}
      </div>

      {showPdfModal && instructionPdf && (
        <PDFViewerModal
          pdfUrl={instructionPdf.file_url}
          title={`Instructions: ${module.display_name}`}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
