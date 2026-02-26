import { X } from 'lucide-react';

interface PDFViewerModalProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewerModal({ pdfUrl, title, onClose }: PDFViewerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
      <div className="bg-[#1a2942] border border-slate-700/50 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-xl border border-slate-700"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
