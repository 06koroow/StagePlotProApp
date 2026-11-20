/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStage } from '../context/StageContext';
import { useAuth } from '../context/AuthContext';
import { exportRiderToPDF, PdfExportOptions } from '../utils/pdfExporter';
import { PdfExportModal } from './RiderExport/PdfExportModal';
import { AuthModal } from './Auth/AuthModal';
import { ProjectsModal } from './Projects/ProjectsModal';
import { saveCloudProject } from '../services/supabaseProjects';
import {
  Undo2,
  Redo2,
  Download,
  FolderOpen,
  Loader2,
  CloudUpload,
  Check,
  User,
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
    replaceProjectSnapshot,
  } = useStage();

  const { user, profile, isConfigured } = useAuth();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [quickSaveState, setQuickSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

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

  const handleQuickCloudSave = async () => {
    if (!user?.id || !isConfigured) {
      setShowAuthModal(true);
      return;
    }

    setQuickSaveState('saving');
    try {
      const saved = await saveCloudProject(user.id, project);
      replaceProjectSnapshot(saved);
      setQuickSaveState('saved');
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => setQuickSaveState('idle'), 2200);
    } catch {
      setQuickSaveState('error');
      setShowProjectModal(true);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => setQuickSaveState('idle'), 2500);
    }
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

          {/* Quick Cloud Save (when signed in) */}
          {user && isConfigured && (
            <button
              type="button"
              onClick={handleQuickCloudSave}
              disabled={quickSaveState === 'saving'}
              className={`px-2.5 py-1.5 rounded border text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                quickSaveState === 'saved'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Save current stage plot to Supabase"
            >
              {quickSaveState === 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              ) : quickSaveState === 'saved' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span className="hidden xl:inline">
                {quickSaveState === 'saving'
                  ? 'Saving...'
                  : quickSaveState === 'saved'
                  ? 'Saved'
                  : 'Save'}
              </span>
            </button>
          )}

          {/* Project Management Drawer */}
          <button
            type="button"
            onClick={() => setShowProjectModal(true)}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5"
            title="Show Projects & Templates"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Projects</span>
          </button>

          {/* Account / Sign In Button */}
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className={`px-2.5 py-1.5 rounded border text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              user
                ? 'bg-slate-800 hover:bg-slate-700 border-sky-500/40 text-sky-200'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={user ? `Signed in as @${profile?.username || 'user'}` : 'Sign in to sync projects'}
          >
            <User className={`w-3.5 h-3.5 ${user ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline max-w-[100px] truncate">
              {user ? `@${profile?.username || 'account'}` : 'Sign In'}
            </span>
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

      {/* Show Projects & Templates Modal */}
      {showProjectModal && (
        <ProjectsModal
          onClose={() => setShowProjectModal(false)}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* Supabase Auth / Account Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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
