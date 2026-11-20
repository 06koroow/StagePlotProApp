/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStage } from '../../context/StageContext';
import { GearCategory, GearDefinition, GearType } from '../../types/stage';
import { buildGearSVGInner } from '../StagePlot/stageSymbols';
import { CustomObjectModal } from './CustomObjectModal';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Layers,
  Music2,
  Mic,
  Speaker,
  Zap,
  Box,
  Pencil,
  Shapes,
  Cable,
  Plug,
} from 'lucide-react';

const CATEGORY_TABS: Array<{ id: GearCategory | 'all' | 'custom'; label: string; icon: React.ElementType }> = [
  { id: 'all', label: 'All Gear', icon: Layers },
  { id: 'custom', label: 'My Custom', icon: Box },
  { id: 'drums', label: 'Drums', icon: Music2 },
  { id: 'amplifiers', label: 'Amps', icon: Speaker },
  { id: 'strings_keys', label: 'Instruments', icon: Music2 },
  { id: 'vocals', label: 'Vocals & Horns', icon: Mic },
  { id: 'monitoring', label: 'Monitors / IEM', icon: Speaker },
  { id: 'audio_connectors', label: 'Connectors', icon: Plug },
  { id: 'audio_power', label: 'Patch & Splits', icon: Cable },
  { id: 'power_distro', label: 'Power & Distro', icon: Zap },
  { id: 'stage_risers', label: 'Risers', icon: Box },
  { id: 'staging_props', label: 'Props', icon: Box },
  { id: 'stock_shapes', label: 'Stock SVGs', icon: Shapes },
];

export const GearPalette: React.FC = () => {
  const {
    addItem,
    project,
    updateStageDimensions,
    loadTemplate,
    resetToBlank,
    allGearDefinitions,
    customGearDefinitions,
  } = useStage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | 'all' | 'custom'>('all');
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingCustomDef, setEditingCustomDef] = useState<GearDefinition | null>(null);

  const gearList = Object.values(allGearDefinitions);
  const customCount = Object.keys(customGearDefinitions).length;

  const filteredGear = gearList.filter((gear) => {
    const matchesSearch =
      gear.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gear.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'custom' ? !!gear.isCustom : gear.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, type: GearType) => {
    e.dataTransfer.setData('application/stagecraft-gear', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-80 h-full border-r border-slate-800 bg-slate-900/95 flex flex-col shrink-0 text-slate-200">
      {/* Header & Actions */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
            Audio Gear Library
          </h2>
          <p className="text-[11px] text-slate-500 truncate">
            Drag onto stage or click (+)
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingCustomDef(null);
              setCustomModalOpen(true);
            }}
            className="px-2 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
            title="Create custom object with stock CAD SVG, dimensions, power & audio drops"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Object</span>
          </button>
          <button
            type="button"
            onClick={() => setShowStageSettings(!showStageSettings)}
            className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-colors whitespace-nowrap ${
              showStageSettings
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Stage Dimensions & Templates"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Stage Dimensions & Templates Drawer */}
      {showStageSettings && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-3 text-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Stage Dimensions ({project.stageDimensions.unit})
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Width (ft)</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={project.stageDimensions.widthFeet}
                  onChange={(e) =>
                    updateStageDimensions({
                      ...project.stageDimensions,
                      widthFeet: Math.max(12, Number(e.target.value) || 28),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Depth (ft)</label>
                <input
                  type="number"
                  min="8"
                  max="60"
                  value={project.stageDimensions.depthFeet}
                  onChange={(e) =>
                    updateStageDimensions({
                      ...project.stageDimensions,
                      depthFeet: Math.max(8, Number(e.target.value) || 18),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-center"
                />
              </div>
            </div>
            {/* Quick Dimension Presets */}
            <div className="flex items-center gap-1 mt-2">
              {[
                { w: 24, d: 16, label: "Club 24'×16'" },
                { w: 32, d: 20, label: "Theater 32'×20'" },
                { w: 40, d: 28, label: "Festival 40'×28'" },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() =>
                    updateStageDimensions({
                      ...project.stageDimensions,
                      widthFeet: preset.w,
                      depthFeet: preset.d,
                    })
                  }
                  className="flex-1 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-center"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Load Band Setup Template
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => loadTemplate('band_4piece')}
                className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center justify-between"
              >
                <span>4-Piece Touring Band</span>
                <span className="text-[10px] text-sky-400 font-mono">16 Ch</span>
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('acoustic_ensemble')}
                className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center justify-between"
              >
                <span>5-Piece Acoustic Ensemble</span>
                <span className="text-[10px] text-sky-400 font-mono">16 Ch</span>
              </button>
              <button
                type="button"
                onClick={() => loadTemplate('festival_7piece')}
                className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center justify-between"
              >
                <span>7-Piece Full Production</span>
                <span className="text-[10px] text-sky-400 font-mono">24 Ch</span>
              </button>
              <button
                type="button"
                onClick={() => resetToBlank(28, 18)}
                className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200"
              >
                Clear to Blank Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments, power, SVGs..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded pl-8 pr-6 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="p-2 border-b border-slate-800 flex flex-wrap gap-1 bg-slate-950/40">
        {CATEGORY_TABS.map((cat) => {
          if (cat.id === 'custom' && customCount === 0 && selectedCategory !== 'custom') {
            return null;
          }
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>
                {cat.label}
                {cat.id === 'custom' ? ` (${customCount})` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gear List Items with Live CAD SVG Thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredGear.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 space-y-2">
            <div>
              No audio gear found
              {searchQuery ? ` matching "${searchQuery}"` : ''}.
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCustomDef(null);
                setCustomModalOpen(true);
              }}
              className="px-3 py-1 rounded bg-sky-600/20 border border-sky-500/40 text-sky-300 hover:bg-sky-600/30 font-medium"
            >
              + Create Custom Object
            </button>
          </div>
        ) : (
          filteredGear.map((gear) => (
            <div
              key={gear.type}
              draggable
              onDragStart={(e) => handleDragStart(e, gear.type)}
              onClick={() => addItem(gear.type)}
              className="group p-2 rounded bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between gap-1.5"
              title={gear.description}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded bg-[#11151d] border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: buildGearSVGInner(gear.type, {
                        name: gear.label,
                        symbolId: gear.stockSymbol,
                        theme: 'dark',
                      }),
                    }}
                  />
                </div>

                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{gear.label}</span>
                    {gear.isCustom && (
                      <span className="text-[9px] font-mono px-1 py-0 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 shrink-0">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="font-mono tabular-nums">
                      {gear.defaultWidthFeet}&apos; × {gear.defaultHeightFeet}&apos;
                    </span>
                    {gear.defaultChannels && gear.defaultChannels.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-sky-400 font-medium">
                          +{gear.defaultChannels.length} Ch
                        </span>
                      </>
                    )}
                    {gear.defaultPower?.required && (
                      <>
                        <span>·</span>
                        <span className="text-amber-400 font-mono">PWR</span>
                      </>
                    )}
                    {gear.defaultSubSnake && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono">{gear.defaultSubSnake}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {gear.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCustomDef(gear);
                      setCustomModalOpen(true);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-sky-300 transition-colors"
                    title="Edit custom object"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(gear.type);
                  }}
                  className="p-1 rounded bg-slate-700/60 group-hover:bg-sky-600 text-slate-300 group-hover:text-white transition-colors"
                  title="Add to Stage"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Custom Object Modal */}
      {customModalOpen && (
        <CustomObjectModal
          initialDefinition={editingCustomDef}
          onClose={() => {
            setCustomModalOpen(false);
            setEditingCustomDef(null);
          }}
        />
      )}
    </div>
  );
};
