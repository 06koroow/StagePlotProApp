/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStage } from '../../context/StageContext';
import { SignalGroup, SignalSplitType } from '../../types/stage';
import { DEFAULT_SIGNAL_GROUPS, SIGNAL_GROUP_COLORS } from '../../data/gearLibrary';
import {
  GitBranch,
  Plus,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Palette,
} from 'lucide-react';

interface SplitEditorModalProps {
  isOpen: boolean;
  initialGroupId?: string | 'new' | null;
  onClose: () => void;
  onGroupDeleted?: (deletedId: string) => void;
}

const SPLIT_TYPE_OPTIONS: Array<{
  value: SignalSplitType;
  label: string;
  lineHint: string;
}> = [
  { value: 'subsnake', label: 'Sub-Snake', lineHint: 'Solid conduit line' },
  { value: 'foh_mon_split', label: 'FOH / MON Split', lineHint: 'Bold trunk line' },
  { value: 'dante_network', label: 'Dante / Network Audio', lineHint: 'Dashed Cat6/Fiber line' },
  { value: 'rf_iem', label: 'RF / IEM Bus', lineHint: 'Dotted wireless/antenna line' },
  { value: 'playback', label: 'Playback / Tracks', lineHint: 'Solid line' },
  { value: 'power_bus', label: 'Power Bus', lineHint: 'Solid power routing line' },
];

export const SplitEditorModal: React.FC<SplitEditorModalProps> = ({
  isOpen,
  initialGroupId = null,
  onClose,
  onGroupDeleted,
}) => {
  const { project, addSignalGroup, updateSignalGroup, removeSignalGroup } = useStage();

  const signalGroups: SignalGroup[] = useMemo(
    () =>
      project.signalGroups && project.signalGroups.length > 0
        ? project.signalGroups
        : DEFAULT_SIGNAL_GROUPS,
    [project.signalGroups]
  );

  const [selectedId, setSelectedId] = useState<string | 'new'>('new');
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [splitType, setSplitType] = useState<SignalSplitType>('subsnake');
  const [color, setColor] = useState<string>(SIGNAL_GROUP_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const loadGroupIntoForm = (groupId: string | 'new', groupsList: SignalGroup[]) => {
    setConfirmDeleteId(null);
    setSavedNotice(null);
    if (groupId === 'new') {
      setSelectedId('new');
      setName('');
      setShortCode('');
      setSplitType('subsnake');
      const nextColor = SIGNAL_GROUP_COLORS[groupsList.length % SIGNAL_GROUP_COLORS.length];
      setColor(nextColor);
      setNotes('');
      return;
    }

    const found = groupsList.find((g) => g.id === groupId) || groupsList[0];
    if (found) {
      setSelectedId(found.id);
      setName(found.name);
      setShortCode(found.shortCode);
      setSplitType(found.splitType);
      setColor(found.color);
      setNotes(found.notes || '');
    } else {
      setSelectedId('new');
      setName('');
      setShortCode('');
      setSplitType('subsnake');
      setColor(SIGNAL_GROUP_COLORS[0]);
      setNotes('');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const target =
      initialGroupId === 'new'
        ? 'new'
        : initialGroupId && signalGroups.some((g) => g.id === initialGroupId)
        ? initialGroupId
        : signalGroups[0]?.id || 'new';
    loadGroupIntoForm(target, signalGroups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialGroupId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const usageByGroupId = useMemo(() => {
    const map: Record<string, { items: number; channels: number }> = {};
    signalGroups.forEach((g) => {
      const items = project.items.filter(
        (it) => it.signalGroupId === g.id || (!it.signalGroupId && it.subSnakeLabel === g.shortCode)
      ).length;
      const channels = project.channels.filter(
        (ch) => ch.signalGroupId === g.id || (!ch.signalGroupId && ch.subSnake === g.shortCode)
      ).length;
      map[g.id] = { items, channels };
    });
    return map;
  }, [signalGroups, project.items, project.channels]);

  if (!isOpen) return null;

  const currentGroup =
    selectedId !== 'new' ? signalGroups.find((g) => g.id === selectedId) || null : null;

  const isDirty =
    selectedId === 'new'
      ? name.trim().length > 0 || shortCode.trim().length > 0 || notes.trim().length > 0
      : !!currentGroup &&
        (currentGroup.name !== name ||
          currentGroup.shortCode !== shortCode ||
          currentGroup.splitType !== splitType ||
          currentGroup.color !== color ||
          (currentGroup.notes || '') !== notes);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || shortCode.trim();
    const cleanCode = (shortCode.trim() || cleanName.slice(0, 6) || 'SNK')
      .toUpperCase()
      .slice(0, 8);
    if (!cleanName) return;

    if (selectedId === 'new') {
      const created = addSignalGroup({
        name: cleanName,
        shortCode: cleanCode,
        splitType,
        color,
        notes: notes.trim() || undefined,
      });
      setSelectedId(created.id);
      setName(created.name);
      setShortCode(created.shortCode);
      setNotes(created.notes || '');
      setSavedNotice('Split created');
    } else if (currentGroup) {
      updateSignalGroup(currentGroup.id, {
        name: cleanName,
        shortCode: cleanCode,
        splitType,
        color,
        notes: notes.trim() || undefined,
      });
      setName(cleanName);
      setShortCode(cleanCode);
      setSavedNotice('Changes saved & synced');
    }

    setTimeout(() => {
      setSavedNotice(null);
    }, 2200);
  };

  const handleDelete = (id: string) => {
    const remaining = signalGroups.filter((g) => g.id !== id);
    removeSignalGroup(id);
    onGroupDeleted?.(id);
    setConfirmDeleteId(null);
    if (remaining.length > 0) {
      loadGroupIntoForm(remaining[0].id, remaining);
    } else {
      loadGroupIntoForm('new', []);
    }
  };

  const previewCode = (shortCode.trim() || 'SPLIT').toUpperCase().slice(0, 8);
  const previewDash =
    splitType === 'dante_network'
      ? '6 4'
      : splitType === 'rf_iem'
      ? '2 3'
      : undefined;
  const previewStrokeW = splitType === 'foh_mon_split' ? 3.5 : 2.2;

  const activeUsage = currentGroup
    ? usageByGroupId[currentGroup.id] || { items: 0, channels: 0 }
    : { items: 0, channels: 0 };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Manage &amp; Edit Signal Splits
              </h2>
              <p className="text-[11px] text-slate-400">
                Rename splits, customize short codes, routing line types, and colors across the plot, channels, and PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Split Selector List */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/50 flex flex-col max-h-56 md:max-h-none overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Defined Splits ({signalGroups.length})
              </span>
              <button
                type="button"
                onClick={() => loadGroupIntoForm('new', signalGroups)}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap ${
                  selectedId === 'new'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>New Split</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {signalGroups.map((g) => {
                const isSelected = selectedId === g.id;
                const usage = usageByGroupId[g.id] || { items: 0, channels: 0 };
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => loadGroupIntoForm(g.id, signalGroups)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-sky-500/70 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: g.color }}
                        />
                        <span
                          className="font-mono font-bold text-[11px] shrink-0"
                          style={{ color: g.color }}
                        >
                          {g.shortCode}
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {g.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>
                          {SPLIT_TYPE_OPTIONS.find((opt) => opt.value === g.splitType)?.label ||
                            g.splitType}
                        </span>
                        {(usage.items > 0 || usage.channels > 0) && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400">
                              {usage.items} stage / {usage.channels} ch
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {signalGroups.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No splits yet. Click <strong>New Split</strong> to create one.
                </div>
              )}
            </div>
          </div>

          {/* Right Split Editor Form */}
          <form
            onSubmit={handleSave}
            className="md:col-span-7 p-5 overflow-y-auto space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  {selectedId === 'new' ? 'Create New Signal Split' : 'Edit Split Properties'}
                </h3>
                {savedNotice && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {savedNotice}
                  </span>
                )}
              </div>

              {/* Live Visual Preview */}
              <div className="p-3 rounded-lg bg-[#0d1119] border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-slate-950 text-[11px] font-mono font-bold shrink-0"
                    style={{ border: `1.5px solid ${color}`, color }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {previewCode}
                  </span>
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {name.trim() || 'Untitled Split'}
                  </span>
                </div>
                <svg width="92" height="20" viewBox="0 0 92 20" className="shrink-0">
                  <circle cx="8" cy="10" r="3.5" fill={color} />
                  <line
                    x1="12"
                    y1="10"
                    x2="80"
                    y2="10"
                    stroke={color}
                    strokeWidth={previewStrokeW}
                    strokeDasharray={previewDash}
                    strokeLinecap="round"
                  />
                  <circle cx="84" cy="10" r="4" fill="none" stroke={color} strokeWidth="2" />
                </svg>
              </div>

              {/* Name & Short Code */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Split / Sub-Snake Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Drums Sub-Snake, FOH/MON Split"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    placeholder="SNK-A"
                    maxLength={8}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-100 uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Split / Line Type */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Signal / Path Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SPLIT_TYPE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setSplitType(opt.value)}
                      className={`px-2.5 py-1.5 rounded-md border text-left transition-colors ${
                        splitType === opt.value
                          ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-semibold leading-tight">{opt.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                        {opt.lineHint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches + Custom Color Picker */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Routing Color</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {SIGNAL_GROUP_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setColor(col)}
                      className={`w-6 h-6 rounded-md transition-transform ${
                        color.toLowerCase() === col.toLowerCase()
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                  <label className="ml-1 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <span className="font-mono text-[10px] text-slate-300 uppercase">{color}</span>
                  </label>
                </div>
              </div>

              {/* Optional Routing Notes */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Routing / Patch Notes <span className="text-slate-600">(Optional — shown on Rider &amp; PDF)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 16-ch XLR drop to MON split, transformer isolated FOH tail"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Sync hint when editing */}
              {currentGroup && (activeUsage.items > 0 || activeUsage.channels > 0) && (
                <div className="text-[11px] text-slate-400 bg-slate-950/70 border border-slate-800 rounded-md px-3 py-2">
                  Currently assigned to{' '}
                  <span className="text-slate-200 font-semibold">{activeUsage.items}</span> stage{' '}
                  {activeUsage.items === 1 ? 'item' : 'items'} and{' '}
                  <span className="text-slate-200 font-semibold">{activeUsage.channels}</span>{' '}
                  {activeUsage.channels === 1 ? 'channel' : 'channels'}. Updating the short code or
                  color updates all linked items automatically.
                </div>
              )}
            </div>

            {/* Footer Action Row */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              {currentGroup ? (
                confirmDeleteId === currentGroup.id ? (
                  <div className="flex items-center gap-1.5 bg-red-950/50 border border-red-800/80 rounded-md px-2 py-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-200">Delete this split?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(currentGroup.id)}
                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(currentGroup.id)}
                    className="px-2.5 py-1.5 rounded-md bg-red-950/40 hover:bg-red-900/50 border border-red-900/60 text-red-400 hover:text-red-200 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Split</span>
                  </button>
                )
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium whitespace-nowrap"
                >
                  Done
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() && !shortCode.trim()}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-40 ${
                    isDirty || selectedId === 'new'
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedId === 'new' ? 'Create Split' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
