import { useState } from 'react';
import Home from './components/Home';
import ModuleDetail from './components/ModuleDetail';
import OperationDetail from './components/OperationDetail';
import PrintLabels from './components/PrintLabels';
import SkiReader from './components/SkiReader';
import OperatorHeader from './components/OperatorHeader';
import LoginScreen from './components/LoginScreen';
import { OperatorProvider } from './contexts/OperatorContext';
import { Module, Operation } from './types';

type View = 'home' | 'module' | 'operation' | 'print_labels' | 'ski_reader';

function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('app_authenticated') === 'true';
  });
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setCurrentView('module');
  };

  const handleOperationClick = (operation: Operation) => {
    if (operation.name === 'print_labels') {
      setSelectedOperation(operation);
      setCurrentView('print_labels');
    } else {
      setSelectedOperation(operation);
      setCurrentView('operation');
    }
  };

  const handleBack = () => {
    if (currentView === 'operation' || currentView === 'print_labels') {
      setCurrentView('module');
      setSelectedOperation(null);
    } else if (currentView === 'module' || currentView === 'ski_reader') {
      setCurrentView('home');
      setSelectedModule(null);
    }
  };

  const handleHome = () => {
    setCurrentView('home');
    setSelectedModule(null);
    setSelectedOperation(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('app_authenticated');
    setAuthenticated(false);
    setCurrentView('home');
    setSelectedModule(null);
    setSelectedOperation(null);
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <OperatorProvider>
      <OperatorHeader onLogout={handleLogout} />
      <div className="pt-[60px]">
        {currentView === 'home' && (
          <Home onModuleClick={handleModuleClick} onReadClick={() => setCurrentView('ski_reader')} />
        )}
        {currentView === 'module' && selectedModule && (
          <ModuleDetail
            module={selectedModule}
            onBack={handleBack}
            onHome={handleHome}
            onOperationClick={handleOperationClick}
          />
        )}
        {currentView === 'operation' && selectedOperation && (
          <OperationDetail
            operation={selectedOperation}
            onBack={handleBack}
            onHome={handleHome}
          />
        )}
        {currentView === 'print_labels' && (
          <PrintLabels
            onBack={handleBack}
            onHome={handleHome}
          />
        )}
        {currentView === 'ski_reader' && (
          <SkiReader onBack={handleBack} onHome={handleHome} />
        )}
      </div>
    </OperatorProvider>
  );
}

export default App;
