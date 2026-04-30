import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import PanelManagement from './components/PanelManagement';
import InterventionManagement from './components/InterventionManagement';
import RemoteControl from './components/RemoteControl';
import TechnicianManagement from './components/TechnicianManagement';
import PanelDisplay from './components/PanelDisplay';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Detect simulation display mode (bypass auth for simulation)
  const urlParams = new URLSearchParams(window.location.search);
  const isDisplayMode = urlParams.has('display');

  if (isDisplayMode) {
    return <PanelDisplay />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'map' && <MapView />}
      {currentView === 'panels' && <PanelManagement />}
      {currentView === 'interventions' && <InterventionManagement />}
      {currentView === 'control' && <RemoteControl />}
      {currentView === 'technicians' && <TechnicianManagement />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
