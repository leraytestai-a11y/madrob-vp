import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OperatorContextType {
  selectedOperator: string | null;
  setSelectedOperator: (initials: string | null) => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(() => {
    return localStorage.getItem('selectedOperator');
  });

  useEffect(() => {
    if (selectedOperator) {
      localStorage.setItem('selectedOperator', selectedOperator);
    } else {
      localStorage.removeItem('selectedOperator');
    }
  }, [selectedOperator]);

  return (
    <OperatorContext.Provider value={{ selectedOperator, setSelectedOperator }}>
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  const context = useContext(OperatorContext);
  if (context === undefined) {
    throw new Error('useOperator must be used within an OperatorProvider');
  }
  return context;
}
