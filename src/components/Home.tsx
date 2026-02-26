import { useEffect, useState } from 'react';
import { Settings, Box, Layers, Wrench, Zap, CheckCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Module } from '../types';
import UploadInstructionsModal from './UploadInstructionsModal';

interface HomeProps {
  onModuleClick: (module: Module) => void;
  onReadClick: () => void;
}

const iconMap: Record<string, typeof Box> = {
  box: Box,
  layers: Layers,
  wrench: Wrench,
  zap: Zap,
  'check-circle': CheckCircle,
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
};

export default function Home({ onModuleClick, onReadClick }: HomeProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('order');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-16 mt-8">
          MADROB
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = iconMap[module.icon] || Box;
            const colorClass = colorMap[module.color] || 'bg-blue-500';

            return (
              <button
                key={module.id}
                onClick={() => onModuleClick(module)}
                className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`${colorClass} p-4 rounded-2xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white lowercase">
                    {module.display_name}
                  </h2>
                </div>
              </button>
            );
          })}

          <button
            onClick={onReadClick}
            className="bg-[#1a2942] border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-cyan-500 p-4 rounded-2xl">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white lowercase">read</h2>
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 text-slate-500 text-sm mt-12 mx-auto hover:text-slate-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Upload Instructions
        </button>
      </div>

      {showUploadModal && (
        <UploadInstructionsModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
