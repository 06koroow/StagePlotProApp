/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StageProvider, useStage } from './context/StageContext';
import { Header } from './components/Header';
import { GearPalette } from './components/GearLibrary/GearPalette';
import { StageCanvas } from './components/StagePlot/StageCanvas';
import { ChannelTable } from './components/ChannelList/ChannelTable';
import { MonitorMixManager } from './components/MonitorsPower/MonitorMixManager';
import { CrewContactsManager } from './components/Contacts/CrewContactsManager';
import { RiderDocument } from './components/RiderExport/RiderDocument';

const MainView: React.FC = () => {
  const { activeTab } = useStage();

  return (
    <main className="flex-1 overflow-hidden flex">
      {activeTab === 'plot' && (
        <div className="flex-1 flex overflow-hidden">
          <GearPalette />
          <StageCanvas />
        </div>
      )}

      {activeTab === 'channels' && <ChannelTable />}

      {activeTab === 'monitors' && <MonitorMixManager />}

      {activeTab === 'contacts' && <CrewContactsManager />}

      {activeTab === 'rider' && <RiderDocument />}
    </main>
  );
};

export default function App() {
  return (
    <StageProvider>
      <div className="app-shell h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
        <Header />
        <MainView />
      </div>
    </StageProvider>
  );
}
