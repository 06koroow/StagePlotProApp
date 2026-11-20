/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStage } from '../context/StageContext';
import { exportRiderToPDF, PdfExportOptions } from '../utils/pdfExporter';
import { PdfExportModal } from './RiderExport/PdfExportModal';
import {
  Undo2,
  Redo2,
  Download,
  FolderOpen,
  Loader2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    undo,
    redo,
    canUndo,
    canRedo,
    project,
    updateProject,
    loadTemplate,
    resetToBlank,
    exportProjectJSON,
    importProjectJSON,
  } = useStage();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleConfirmExportPDF = async (options: PdfExportOptions) => {
    setIsExporting(true);
    try {
      await exportRiderToPDF(project, options);
      setShowPdfExportModal(false);
    } catch {
      setShowPdfExportModal(false);
      setActiveTab('rider');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportProjectJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(project.artistName || 'StagePlot').replace(/\s+/g, '_')}.stagecraft.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="no-print h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-6 shrink-0 select-none">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('plot');
            }}
            className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-2 whitespace-nowrap"
          >
            <span className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center text-white text-xs font-mono font-black">
              SC
            </span>
            <span>StageCraft Pro</span>
          </a>

          {/* Project Artist Quick Label */}
          <button
            type="button"
            onClick={() => setShowEditInfoModal(true)}
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition-colors"
            title="Click to edit project info and artist details"
          >
            <span className="font-semibold text-slate-200 truncate max-w-[140px]">
              {project.artistName || 'Untitled Show'}
            </span>
            <span className="text-[10px] text-sky-400">Edit Info</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('plot')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'plot'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stage Plot
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Channel List</span>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
              ({project.channels.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monitors')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'monitors'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Monitors &amp; Power</span>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
              ({project.monitors.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Crew &amp; Contacts</span>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
              ({project.contacts.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rider')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rider'
                ? 'bg-sky-600/20 text-sky-300 font-semibold border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Technical Rider</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Quick Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/80 rounded border border-slate-700/60 p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Management Drawer */}
          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white"
            title="Projects & Templates"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => setShowPdfExportModal(true)}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export Rider (PDF)'}</span>
          </button>
        </div>
      </header>

      {/* Project & Template Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-sky-400" />
                <span>Show Projects & Templates</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Load Production Template
                </label>
                <div className="space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      loadTemplate('band_4piece');
                      setShowProjectModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-sky-500/40 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sky-300">4-Piece Touring Band</div>
                      <div className="text-[11px] text-slate-400">
                        5-pc drums on riser, Guitar combo, Bass rig, 4 wedges, 16 inputs
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 text-xs font-bold">16 Ch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadTemplate('acoustic_ensemble');
                      setShowProjectModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">5-Piece Acoustic Ensemble</div>
                      <div className="text-[11px] text-slate-400">
                        Percussion, Keys, Acoustic Guitars, Bass, Teleprompter, 5 wedges
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 text-xs">16 Ch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadTemplate('festival_7piece');
                      setShowProjectModal(false);
                    }}
                    className="w-full text-left p-2.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">7-Piece Full Production w/ Horns & IEMs</div>
                      <div className="text-[11px] text-slate-400">
                        Dual keys, Horn section, Playback tracks, Digital stagebox, IEM RF
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 text-xs">24 Ch</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetToBlank(28, 18);
                    setShowProjectModal(false);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300"
                >
                  Start Blank Show
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300"
                  >
                    Export JSON
                  </button>

                  <label className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium cursor-pointer">
                    Import JSON
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          if (content && importProjectJSON(content)) {
                            setShowProjectModal(false);
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Info Modal */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">
                Edit Production & Tour Details
              </h3>
              <button
                type="button"
                onClick={() => setShowEditInfoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Artist / Band Name</label>
                <input
                  type="text"
                  value={project.artistName}
                  onChange={(e) => updateProject({ artistName: e.target.value })}
                  placeholder="e.g. Touring Ensemble"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Rider Document Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject({ title: e.target.value })}
                    placeholder="e.g. Festival Stage Plot"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Version / Revision</label>
                  <input
                    type="text"
                    value={project.versionDate || ''}
                    onChange={(e) => updateProject({ versionDate: e.target.value })}
                    placeholder="e.g. Rev 1.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Show Date</label>
                  <input
                    type="date"
                    value={project.date}
                    onChange={(e) => updateProject({ date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Tour / Venue / City</label>
                  <input
                    type="text"
                    value={project.venueOrTour}
                    onChange={(e) => updateProject({ venueOrTour: e.target.value })}
                    placeholder="e.g. Main Stage / Venue"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">General Production Notes</label>
                <textarea
                  rows={3}
                  value={project.productionNotes}
                  onChange={(e) => updateProject({ productionNotes: e.target.value })}
                  placeholder="e.g. 90-minute headline set. Tour carries FOH console and IEM split package."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditInfoModal(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PDF Export Orientation & Page Break Prompt */}
      {showPdfExportModal && (
        <PdfExportModal
          isExporting={isExporting}
          onConfirm={handleConfirmExportPDF}
          onClose={() => setShowPdfExportModal(false)}
        />
      )}
    </>
  );
};
