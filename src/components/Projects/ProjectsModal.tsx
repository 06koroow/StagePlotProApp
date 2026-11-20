/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStage } from '../../context/StageContext';
import { useAuth } from '../../context/AuthContext';
import {
  CloudProjectSummary,
  fetchUserProjects,
  loadCloudProject,
  saveCloudProject,
  deleteCloudProject,
  isUuid,
} from '../../services/supabaseProjects';
import {
  FolderOpen,
  Cloud,
  Save,
  CopyPlus,
  Trash2,
  Loader2,
  Search,
  RefreshCw,
  LogIn,
  AlertCircle,
  CheckCircle2,
  FileJson,
  LayoutTemplate,
  X,
  Clock,
} from 'lucide-react';

interface ProjectsModalProps {
  onClose: () => void;
  onOpenAuth: () => void;
}

function formatUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ onClose, onOpenAuth }) => {
  const {
    project,
    loadTemplate,
    loadProjectFromCloud,
    replaceProjectSnapshot,
    resetToBlank,
    exportProjectJSON,
    importProjectJSON,
  } = useStage();

  const { user, profile, isConfigured } = useAuth();

  const [activeTab, setActiveTab] = useState<'cloud' | 'templates'>(
    user ? 'cloud' : isConfigured ? 'cloud' : 'templates'
  );
  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [savingMode, setSavingMode] = useState<'save' | 'copy' | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isLinkedToCloudProject = useMemo(() => {
    if (!isUuid(project.id)) return false;
    return projects.some((p) => p.id === project.id);
  }, [project.id, projects]);

  const loadProjectsList = useCallback(async () => {
    if (!user?.id || !isConfigured) return;
    setLoadingList(true);
    setStatusMessage(null);
    try {
      const list = await fetchUserProjects(user.id);
      setProjects(list);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch saved projects.',
      });
    } finally {
      setLoadingList(false);
    }
  }, [user?.id, isConfigured]);

  useEffect(() => {
    if (user?.id && isConfigured) {
      void loadProjectsList();
    } else {
      setProjects([]);
    }
  }, [user?.id, isConfigured, loadProjectsList]);

  const handleSaveCurrent = async (saveAsNew: boolean) => {
    if (!user?.id) return;
    setSavingMode(saveAsNew ? 'copy' : 'save');
    setStatusMessage(null);
    try {
      const overrideTitle =
        saveAsNew && isLinkedToCloudProject
          ? `${project.title || 'Stage Plot'} (Copy)`
          : undefined;

      const saved = await saveCloudProject(user.id, project, {
        saveAsNew,
        overrideTitle,
      });
      replaceProjectSnapshot(saved);
      await loadProjectsList();
      setStatusMessage({
        type: 'success',
        text: saveAsNew
          ? `Saved new cloud copy "${saved.artistName} — ${saved.title}".`
          : `Saved "${saved.artistName} — ${saved.title}" to Supabase.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save project.',
      });
    } finally {
      setSavingMode(null);
    }
  };

  const handleOpenProject = async (projectId: string) => {
    setLoadingProjectId(projectId);
    setStatusMessage(null);
    try {
      const loaded = await loadCloudProject(projectId);
      loadProjectFromCloud(loaded);
      onClose();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load project.',
      });
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjectId(projectId);
    setStatusMessage(null);
    try {
      await deleteCloudProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setConfirmDeleteId(null);
      setStatusMessage({
        type: 'success',
        text: 'Project deleted from cloud database.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete project.',
      });
    } finally {
      setDeletingProjectId(null);
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

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.artistName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.venueOrTour.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <span>Show Projects &amp; Templates</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cloud');
              setStatusMessage(null);
            }}
            className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors -mb-px ${
              activeTab === 'cloud'
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Projects</span>
            {user && (
              <span className="font-mono text-[10px] text-slate-400">({projects.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('templates');
              setStatusMessage(null);
            }}
            className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors -mb-px ${
              activeTab === 'templates'
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Templates &amp; Local JSON</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-md border text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'cloud' ? (
            !isConfigured ? (
              <div className="p-5 rounded-md bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="font-semibold text-slate-100 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <span>Connect Your Supabase Project</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Add <code className="text-sky-400">VITE_SUPABASE_URL</code> and{' '}
                  <code className="text-sky-400">VITE_SUPABASE_ANON_KEY</code> to your environment
                  secrets to save, manage, and sync projects in your Supabase database.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium"
                >
                  Use Templates &amp; Local JSON
                </button>
              </div>
            ) : !user ? (
              <div className="p-6 rounded-md bg-slate-950 border border-slate-800 text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-sky-600/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-100">
                    Sign in to sync your stage plots
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Save stage plots, linked channel lists, monitor mixes, splits, and custom gear
                    to your Supabase account and open them from anywhere.
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In or Create Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Workspace Save Card */}
                <div className="p-3.5 rounded-md bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Active Workspace
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          isLinkedToCloudProject
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isLinkedToCloudProject ? 'Synced Project' : 'Unsaved Local Draft'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                      {project.artistName || 'Untitled Artist'} — {project.title || 'Stage Plot'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {project.items.length} items · {project.channels.length} ch ·{' '}
                      {project.monitors.length} mixes
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveCurrent(false)}
                      disabled={savingMode !== null}
                      className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      {savingMode === 'save' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{isLinkedToCloudProject ? 'Save Changes' : 'Save Project'}</span>
                    </button>

                    {isLinkedToCloudProject && (
                      <button
                        type="button"
                        onClick={() => handleSaveCurrent(true)}
                        disabled={savingMode !== null}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-60 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                        title="Save a duplicate copy as a new project"
                      >
                        {savingMode === 'copy' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CopyPlus className="w-3.5 h-3.5" />
                        )}
                        <span>Save Copy</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search & Refresh Controls */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search @${profile?.username || 'your'} saved projects...`}
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadProjectsList()}
                    disabled={loadingList}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 disabled:opacity-50"
                    title="Refresh project list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Saved Projects List */}
                {loadingList && projects.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                    <span>Loading projects from Supabase...</span>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="py-8 text-center rounded-md border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="font-medium text-slate-300">
                      {projects.length === 0
                        ? 'No cloud projects saved yet'
                        : 'No projects match your search'}
                    </div>
                    <p className="text-slate-500">
                      {projects.length === 0
                        ? 'Click "Save Project" above to store your current stage plot in Supabase.'
                        : 'Try clearing the search filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProjects.map((item) => {
                      const isActive = item.id === project.id;
                      const isOpening = loadingProjectId === item.id;
                      const isDeleting = deletingProjectId === item.id;
                      const awaitingConfirm = confirmDeleteId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-md border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-sky-950/25 border-sky-500/40'
                              : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-100 truncate">
                                {item.artistName}
                              </span>
                              <span className="text-slate-600">/</span>
                              <span className="text-xs text-slate-300 truncate">{item.title}</span>
                              {isActive && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  Open
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                              {item.venueOrTour && (
                                <span className="truncate max-w-[200px]">{item.venueOrTour}</span>
                              )}
                              <span className="font-mono text-slate-300">
                                {item.itemCount} items · {item.channelCount} ch ·{' '}
                                {item.monitorCount} mixes
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                {formatUpdatedAt(item.updatedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {awaitingConfirm ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(item.id)}
                                  disabled={isDeleting}
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1"
                                >
                                  {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>Confirm Delete</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  disabled={isDeleting}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenProject(item.id)}
                                  disabled={isOpening || Boolean(loadingProjectId)}
                                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-sky-600 border border-slate-700 hover:border-sky-500 text-slate-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {isOpening && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>{isActive ? 'Reload' : 'Open'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(item.id)}
                                  disabled={Boolean(deletingProjectId)}
                                  className="p-1.5 rounded bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Templates & Local JSON Tab */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Load Production Template
                </label>
                <div className="space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      loadTemplate('band_4piece');
                      onClose();
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
                      onClose();
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
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">
                        7-Piece Full Production w/ Horns &amp; IEMs
                      </div>
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
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300"
                >
                  Start Blank Show
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
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
                            onClose();
                          } else {
                            setStatusMessage({
                              type: 'error',
                              text: 'Invalid StageCraft JSON file.',
                            });
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
