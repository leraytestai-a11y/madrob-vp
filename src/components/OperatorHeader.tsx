import { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Plus, Check, X, LogOut } from 'lucide-react';
import { useOperator } from '../contexts/OperatorContext';
import { supabase } from '../lib/supabase';

interface Operator {
  id: string;
  initials: string;
  created_at: string;
}

interface OperatorHeaderProps {
  onLogout: () => void;
}

export default function OperatorHeader({ onLogout }: OperatorHeaderProps) {
  const { selectedOperator, setSelectedOperator } = useOperator();
  const [showDropdown, setShowDropdown] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOperatorInitials, setNewOperatorInitials] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowAddForm(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  async function loadOperators() {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('initials');

      if (error) throw error;
      setOperators(data || []);
    } catch (error) {
      console.error('Error loading operators:', error);
    }
  }

  async function addOperator() {
    if (!newOperatorInitials.trim()) return;

    const initials = newOperatorInitials.trim().toUpperCase();

    try {
      const { error } = await supabase
        .from('operators')
        .insert([{ initials }]);

      if (error) throw error;

      await loadOperators();
      setNewOperatorInitials('');
      setShowAddForm(false);
      setSelectedOperator(initials);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding operator:', error);
    }
  }

  async function deleteOperator(id: string, initials: string, event: React.MouseEvent) {
    event.stopPropagation();

    if (!confirm(`Delete operator ${initials}?`)) return;

    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (selectedOperator === initials) {
        setSelectedOperator('');
      }

      await loadOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  }

  function handleOperatorSelect(initials: string) {
    setSelectedOperator(initials);
    setShowDropdown(false);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center gap-3 mx-auto hover:bg-blue-700/30 px-6 py-2 rounded-lg transition-colors"
          >
            <User className="w-6 h-6 text-white" />
            <div className="text-white font-bold text-xl tracking-wider">
              {selectedOperator || 'Select Operator'}
            </div>
            <ChevronDown className={`w-5 h-5 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-96 bg-[#1a2942] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4">
                <p className="text-slate-400 text-sm mb-3">Select Operator</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {operators.map((operator) => (
                    <div key={operator.id} className="relative group">
                      <button
                        onClick={() => handleOperatorSelect(operator.initials)}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                          selectedOperator === operator.initials
                            ? 'bg-blue-600 text-white border-2 border-blue-400'
                            : 'bg-[#0a1628] text-slate-400 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {selectedOperator === operator.initials && (
                          <Check className="w-4 h-4 inline mr-1" />
                        )}
                        {operator.initials}
                      </button>
                      <button
                        onClick={(e) => deleteOperator(operator.id, operator.initials, e)}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete operator"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Operator
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newOperatorInitials}
                      onChange={(e) => setNewOperatorInitials(e.target.value.toUpperCase())}
                      placeholder="Enter initials (e.g., ABC)"
                      maxLength={3}
                      className="w-full bg-[#0a1628] border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addOperator}
                        disabled={!newOperatorInitials.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewOperatorInitials('');
                        }}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="ml-4 flex items-center gap-2 text-white/70 hover:text-white hover:bg-blue-700/40 px-3 py-2 rounded-lg transition-colors text-sm"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </div>
  );
}
