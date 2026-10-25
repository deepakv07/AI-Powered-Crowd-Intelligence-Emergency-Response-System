/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { EmergencyScenarioModal } from './components/EmergencyScenarioModal';

// Views
import { CommandCentreView } from './components/CommandCentre/CommandCentreView';
import { GISMapView } from './components/GISMap/GISMapView';
import { CrowdIntelligenceView } from './components/CrowdIntelligence/CrowdIntelligenceView';
import { IncidentsView } from './components/Incidents/IncidentsView';
import { MedicalRescueView } from './components/MedicalRescue/MedicalRescueView';
import { AlertsView } from './components/Alerts/AlertsView';
import { ConnectivityView } from './components/Connectivity/ConnectivityView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { SettingsView } from './components/Settings/SettingsView';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCentreView />;
      case 'map':
        return <GISMapView />;
      case 'intelligence':
        return <CrowdIntelligenceView />;
      case 'incidents':
        return <IncidentsView />;
      case 'medical':
        return <MedicalRescueView />;
      case 'alerts':
        return <AlertsView />;
      case 'connectivity':
        return <ConnectivityView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCentreView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Primary Top Bar */}
      <Header />

      {/* Main Operational Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Dark Navy Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Mobile Hamburger Drawer Toggle */}
        <div className="lg:hidden absolute bottom-4 left-4 z-40">
          <button
            onClick={() => setIsMobileMenuOpen(p => !p)}
            className="bg-slate-900 text-white p-3 rounded-full shadow-xl border border-slate-700 flex items-center justify-center focus:outline-none"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-slate-950/60 backdrop-blur-xs flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-72 max-w-[80vw] h-full bg-slate-900 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* 10-Step Emergency Scenario Modal */}
      <EmergencyScenarioModal />

      {/* Floating Confirmation Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
