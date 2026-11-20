/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStage } from '../../context/StageContext';
import { ChannelInput, ChannelCategory, StandType, ConnectorType } from '../../types/stage';
import { COMMON_MICS_AND_DIS, CONNECTOR_TYPES, DEFAULT_SIGNAL_GROUPS } from '../../data/gearLibrary';
import { findSignalGroup } from '../../utils/stageRouting';
import { SplitEditorModal } from '../StagePlot/SplitEditorModal';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Search,
  Filter,
  FileText,
  Sliders,
  Cable,
  GitBranch,
  Pencil,
} from 'lucide-react';

const CATEGORIES: ChannelCategory[] = [
  'drums',
  'bass',
  'guitars',
  'keys',
  'horns',
  'strings',
  'vocals',
  'playback',
  'talkback',
  'audience',
  'other',
];

const STAND_TYPES: Array<{ id: StandType; label: string }> = [
  { id: 'short_boom', label: 'Short Boom' },
  { id: 'tall_boom', label: 'Tall Boom' },
  { id: 'round_base', label: 'Round Base' },
  { id: 'straight_round', label: 'Straight / Round' },
  { id: 'claw', label: 'Claw / Clamp' },
  { id: 'clip', label: 'Clip-On' },
  { id: 'direct', label: 'Direct / DI' },
  { id: 'overhead', label: 'Overhead Boom' },
  { id: 'wireless', label: 'Wireless' },
  { id: 'none', label: 'N/A' },
];

export const ChannelTable: React.FC = () => {
  const {
    project,
    addChannel,
    updateChannel,
    removeChannel,
    reorderChannels,
    togglePhantom48V,
    setChannelStageItemLink,
    batchAddChannels,
    updateProject,
  } = useStage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | 'all'>('all');
  const [selectedConnector, setSelectedConnector] = useState<string | 'all'>('all');
  const [selectedSignalGroup, setSelectedSignalGroup] = useState<string | 'all'>('all');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showSplitEditor, setShowSplitEditor] = useState(false);

  const signalGroups =
    project.signalGroups && project.signalGroups.length > 0
      ? project.signalGroups
      : DEFAULT_SIGNAL_GROUPS;

  // Filter channels
  const filteredChannels = project.channels.filter((ch) => {
    const matchesSearch =
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.micOrDI.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.connector && ch.connector.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ch.stageLocation && ch.stageLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ch.subSnake && ch.subSnake.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ch.notes && ch.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || ch.category === selectedCategory;

    const matchesConnector =
      selectedConnector === 'all' || ch.connector === selectedConnector;

    const resolvedGroup = findSignalGroup(project, ch.signalGroupId, ch.subSnake);
    const matchesSignalGroup =
      selectedSignalGroup === 'all' ||
      ch.signalGroupId === selectedSignalGroup ||
      resolvedGroup?.id === selectedSignalGroup;

    return matchesSearch && matchesCategory && matchesConnector && matchesSignalGroup;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Channel',
      'Input Name',
      'Category',
      'Transducer (Mic/DI)',
      'Connector',
      'Stand',
      '+48V',
      'Location',
      'Sub-Snake',
      'Notes',
    ];

    const rows = project.channels.map((ch) => [
      ch.channelNumber,
      `"${ch.name.replace(/"/g, '""')}"`,
      ch.category,
      `"${ch.micOrDI.replace(/"/g, '""')}"`,
      ch.connector || 'XLR',
      ch.standType,
      ch.phantom48V ? 'YES' : 'NO',
      `"${(ch.stageLocation || '').replace(/"/g, '""')}"`,
      `"${(ch.subSnake || '').replace(/"/g, '""')}"`,
      `"${(ch.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${project.artistName.replace(/\s+/g, '_')}_Input_Channel_List.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const importedChannels: Array<Omit<ChannelInput, 'id' | 'channelNumber'>> = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          importedChannels.push({
            name: parts[1] || `Input ${i}`,
            category: (parts[2] as ChannelCategory) || 'other',
            micOrDI: parts[3] || 'Active DI (Generic)',
            connector: (parts[4] as ConnectorType) || 'XLR',
            standType: (parts[5] as StandType) || 'tall_boom',
            phantom48V: parts[6]?.toUpperCase() === 'YES',
            stageLocation: parts[7] || '',
            subSnake: parts[8] || '',
            monitorSends: {},
            notes: parts[9] || '',
          });
        }
      }

      if (importedChannels.length > 0) {
        batchAddChannels(importedChannels);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Master Channel Strip & Input Patch List
            </h2>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              ({project.channels.length} Channels)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Quick Search */}
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter channel, mic, or DI..."
              className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Connector Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Cable className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Connectors</option>
              {CONNECTOR_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ChannelCategory | 'all')}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Snake / Split Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedSignalGroup}
              onChange={(e) => setSelectedSignalGroup(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Splits / Snakes</option>
              {signalGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  [{g.shortCode}] {g.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowSplitEditor(true)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 whitespace-nowrap"
              title="Edit, rename, recolor, or delete signal splits"
            >
              <Pencil className="w-3 h-3 text-sky-400" />
              <span>Edit Splits</span>
            </button>
          </div>

          {/* General Notes Drawer Button */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              showNotesDrawer
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Audio & Misc Notes</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1"
            title="Download CSV for Digital Mixing Console"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => addChannel()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </button>
        </div>
      </div>

      {/* General Notes & Audio Notes Collapsible Panel (As requested by user!) */}
      {showNotesDrawer && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Audio Notes (Stands, Cables, Sub-snakes)</span>
              </span>
              <button
                onClick={() =>
                  updateProject({
                    audioNotes:
                      'AUDIO NOTES:\n• 8 Short Boom Tripod Stands\n• 7 Tall Boom Tripod Stands\n• 2 Straight/Round Stands\n• 20 (15\') XLR\n• 15 (25\') XLR\n• x2 (16 Channel) Subsnakes\n• x1 RF Handheld Microphone',
                  })
                }
                className="text-[10px] text-slate-400 hover:text-indigo-400 underline"
              >
                Insert Preset
              </button>
            </div>
            <textarea
              rows={5}
              value={project.audioNotes || ''}
              onChange={(e) => updateProject({ audioNotes: e.target.value })}
              placeholder="e.g. • 8 Short Boom Tripod Stands&#10;• 20 (15') XLR&#10;• x2 (16 Channel) Subsnakes"
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Misc Notes (Bar Stools, Furniture, Staging)</span>
              </span>
              <button
                onClick={() =>
                  updateProject({
                    miscNotes:
                      'MISC NOTES:\n• 5 Black Bar Stools (No Arms)\n• Dedicated clean AC power on stage deck\n• Guitar Tech World located Stage Right',
                  })
                }
                className="text-[10px] text-slate-400 hover:text-indigo-400 underline"
              >
                Insert Preset
              </button>
            </div>
            <textarea
              rows={5}
              value={project.miscNotes || ''}
              onChange={(e) => updateProject({ miscNotes: e.target.value })}
              placeholder="e.g. • 5 Black Bar Stool (No Arms)&#10;• 120V AC Power drops at each position"
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Main Tabular View */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-200">
          <thead className="bg-slate-900/95 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider backdrop-blur-xs">
            <tr>
              <th className="py-2.5 px-3 w-14 text-center">Ch #</th>
              <th className="py-2.5 px-3 min-w-[170px]">Source / Input</th>
              <th className="py-2.5 px-3 min-w-[210px]">Transducer (Mic / DI)</th>
              <th className="py-2.5 px-3 w-36">Connector</th>
              <th className="py-2.5 px-3 w-32">Stand</th>
              <th className="py-2.5 px-3 w-16 text-center">48v</th>
              <th className="py-2.5 px-3 w-40">Stage Object</th>
              <th className="py-2.5 px-3 min-w-[130px]">Stage Location</th>
              <th className="py-2.5 px-3 w-36">Split / Snake</th>
              <th className="py-2.5 px-3 min-w-[120px]">Notes</th>
              <th className="py-2.5 px-3 w-20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredChannels.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  No input channels found. Click &ldquo;+ Add Channel&rdquo; to patch an input.
                </td>
              </tr>
            ) : (
              filteredChannels.map((channel) => {
                const resolvedGroup = findSignalGroup(
                  project,
                  channel.signalGroupId,
                  channel.subSnake
                );
                return (
                <tr
                  key={channel.id}
                  className="hover:bg-slate-900/70 transition-colors group"
                >
                  {/* Channel Number */}
                  <td className="py-2 px-3 text-center font-mono font-bold tabular-nums text-slate-400 group-hover:text-slate-100">
                    <span className="inline-block w-7 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {channel.channelNumber}
                    </span>
                  </td>

                  {/* Input Name */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={channel.name}
                      onChange={(e) => updateChannel(channel.id, { name: e.target.value })}
                      placeholder="e.g. Kick"
                      className="w-full bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-indigo-500 rounded px-2 py-1 text-slate-100 font-semibold focus:outline-none"
                    />
                  </td>

                  {/* Transducer / Mic / DI (Generic active/passive DI option) */}
                  <td className="py-2 px-3">
                    <div className="relative">
                      <input
                        type="text"
                        list={`mic-list-${channel.id}`}
                        value={channel.micOrDI}
                        onChange={(e) => updateChannel(channel.id, { micOrDI: e.target.value })}
                        placeholder="e.g. Active DI (Generic)"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                      />
                      <datalist id={`mic-list-${channel.id}`}>
                        {COMMON_MICS_AND_DIS.map((mic) => (
                          <option key={mic} value={mic} />
                        ))}
                      </datalist>
                    </div>
                  </td>

                  {/* Connector Option (XLR, 1/4" Jack, Phono, etc) */}
                  <td className="py-2 px-3">
                    <select
                      value={channel.connector || 'XLR'}
                      onChange={(e) =>
                        updateChannel(channel.id, { connector: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      {CONNECTOR_TYPES.map((conn) => (
                        <option key={conn} value={conn}>
                          {conn}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Stand Type */}
                  <td className="py-2 px-3">
                    <select
                      value={channel.standType}
                      onChange={(e) =>
                        updateChannel(channel.id, { standType: e.target.value as StandType })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 text-[11px]"
                    >
                      {STAND_TYPES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* 48V Phantom Power Toggle */}
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => togglePhantom48V(channel.id)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                        channel.phantom48V
                          ? 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                          : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                      title={channel.phantom48V ? '+48V Active' : 'Click to enable 48V'}
                    >
                      {channel.phantom48V ? '• 48V' : '-'}
                    </button>
                  </td>

                  {/* Linked Stage Plot Object */}
                  <td className="py-2 px-3">
                    <select
                      value={channel.linkedStageItemId || ''}
                      onChange={(e) =>
                        setChannelStageItemLink(channel.id, e.target.value || undefined)
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-sky-300 focus:outline-none focus:border-sky-500"
                      title="Link this channel to a stage plot object"
                    >
                      <option value="" className="text-slate-400">
                        Unlinked
                      </option>
                      {project.items.map((it) => (
                        <option key={it.id} value={it.id} className="text-slate-100">
                          {it.performer ? `${it.performer} (${it.name})` : it.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Stage Location (e.g. USL DRUMS, DSCR TYLER, DSC BEAR) */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={channel.stageLocation || ''}
                      onChange={(e) =>
                        updateChannel(channel.id, { stageLocation: e.target.value })
                      }
                      placeholder="e.g. USL (DRUMS)"
                      className="w-full bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-indigo-500 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none uppercase font-mono"
                    />
                  </td>

                  {/* Sub-Snake / Split Assignment */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-xs shrink-0"
                        style={{
                          backgroundColor: resolvedGroup ? resolvedGroup.color : '#334155',
                        }}
                      />
                      <select
                        value={resolvedGroup?.id || ''}
                        onChange={(e) => {
                          const grp = signalGroups.find((g) => g.id === e.target.value);
                          updateChannel(channel.id, {
                            signalGroupId: grp ? grp.id : undefined,
                            subSnake: grp ? grp.shortCode : '',
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Direct / Unassigned</option>
                        {signalGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.shortCode} · {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={channel.notes || ''}
                      onChange={(e) => updateChannel(channel.id, { notes: e.target.value })}
                      placeholder="e.g. Coiled Up"
                      className="w-full bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-indigo-500 rounded px-2 py-1 text-slate-400 text-xs focus:outline-none"
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          const realIdx = project.channels.findIndex((c) => c.id === channel.id);
                          if (realIdx > 0) reorderChannels(realIdx, realIdx - 1);
                        }}
                        disabled={project.channels.findIndex((c) => c.id === channel.id) === 0}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const realIdx = project.channels.findIndex((c) => c.id === channel.id);
                          if (realIdx < project.channels.length - 1) reorderChannels(realIdx, realIdx + 1);
                        }}
                        disabled={project.channels.findIndex((c) => c.id === channel.id) === project.channels.length - 1}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeChannel(channel.id)}
                        className="p-1 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded"
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <SplitEditorModal
        isOpen={showSplitEditor}
        initialGroupId={
          selectedSignalGroup !== 'all'
            ? selectedSignalGroup
            : signalGroups[0]?.id || 'new'
        }
        onClose={() => setShowSplitEditor(false)}
        onGroupDeleted={(deletedId) => {
          if (selectedSignalGroup === deletedId) {
            setSelectedSignalGroup('all');
          }
        }}
      />
    </div>
  );
};
