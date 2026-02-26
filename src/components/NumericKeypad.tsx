import { Delete, X } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function NumericKeypad({ value, onValueChange }: NumericKeypadProps) {
  function handleNumberClick(num: string) {
    if (num === '.' && value.includes('.')) return;
    onValueChange(value + num);
  }

  function handleBackspace() {
    onValueChange(value.slice(0, -1));
  }

  function handleClear() {
    onValueChange('');
  }

  function handleNegative() {
    if (value === '' || value === '0') {
      onValueChange('-');
    } else if (value.startsWith('-')) {
      onValueChange(value.substring(1));
    } else {
      onValueChange('-' + value);
    }
  }

  const buttons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['±', '0', '.']
  ];

  return (
    <div className="space-y-3">
      <div className="bg-[#0a1628] border border-slate-700 rounded-xl px-6 py-6 mb-4">
        <div className="text-white text-4xl text-center font-mono min-h-[60px] flex items-center justify-center">
          {value || '0'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {buttons.map((row, rowIndex) => (
          row.map((button, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => {
                if (button === '±') {
                  handleNegative();
                } else {
                  handleNumberClick(button);
                }
              }}
              className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-3xl font-bold py-8 rounded-xl transition-colors"
            >
              {button}
            </button>
          ))
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <button
          onClick={handleBackspace}
          className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold py-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Delete className="w-6 h-6" />
          Delete
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-6 h-6" />
          Clear
        </button>
      </div>
    </div>
  );
}
