/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStage } from '../../context/StageContext';
import {
  ChannelCategory,
  ConnectorType,
  DefaultChannelDrop,
  GearCategory,
  GearDefinition,
  PowerConnectorType,
  StandType,
  StockSymbolId,
} from '../../types/stage';
import {
  COMMON_MICS_AND_DIS,
  CONNECTOR_TYPES,
  POWER_CONNECTOR_OPTIONS,
  STOCK_SYMBOL_OPTIONS,
  StockSymbolGroup,
} from '../../data/gearLibrary';
import { buildGearSVGInner } from '../StagePlot/stageSymbols';
import { Plus, Trash2, Zap, Cable, Box, Check, Layers } from 'lucide-react';

interface CustomObjectModalProps {
  initialDefinition?: GearDefinition | null;
  onClose: () => void;
}

const GEAR_CATEGORY_OPTIONS: Array<{ id: GearCategory; label: string }> = [
  { id: 'drums', label: 'Drums & Percussion' },
  { id: 'amplifiers', label: 'Amps & Backline' },
  { id: 'strings_keys', label: 'Instruments & Keys' },
  { id: 'vocals', label: 'Vocals & Horns' },
  { id: 'monitoring', label: 'Monitors & IEM' },
  { id: 'audio_connectors', label: 'Audio Connectors' },
  { id: 'audio_power', label: 'Patch & Splits' },
  { id: 'power_distro', label: 'Power & Distro' },
  { id: 'stage_risers', label: 'Risers' },
  { id: 'staging_props', label: 'Props & Staging' },
  { id: 'stock_shapes', label: 'Stock Shapes' },
];

const SYMBOL_GROUP_FILTERS: Array<{ id: 'all' | StockSymbolGroup; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'instruments', label: 'Instruments' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'monitoring', label: 'IEM / Phones' },
  { id: 'power', label: 'Power' },
  { id: 'racks', label: 'Racks & Patch' },
  { id: 'staging', label: 'Staging' },
];

const CHANNEL_CATEGORIES: ChannelCategory[] = [
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

const STAND_OPTIONS: Array<{ id: StandType; label: string }> = [
  { id: 'short_boom', label: 'Short Boom' },
  { id: 'tall_boom', label: 'Tall Boom' },
  { id: 'round_base', label: 'Round Base' },
  { id: 'straight_round', label: 'Straight' },
  { id: 'claw', label: 'Claw / Clamp' },
  { id: 'clip', label: 'Clip-On' },
  { id: 'direct', label: 'Direct / DI' },
  { id: 'overhead', label: 'Overhead' },
  { id: 'wireless', label: 'Wireless' },
  { id: 'none', label: 'N/A' },
];

export const CustomObjectModal: React.FC<CustomObjectModalProps> = ({
  initialDefinition,
  onClose,
}) => {
  const {
    project,
    saveCustomGearDefinition,
    deleteCustomGearDefinition,
    addItem,
  } = useStage();

  const isEditing = !!initialDefinition?.isCustom;

  const [label, setLabel] = useState(initialDefinition?.label || '');
  const [category, setCategory] = useState<GearCategory>(
    initialDefinition?.category || 'staging_props'
  );
  const [description, setDescription] = useState(initialDefinition?.description || '');
  const [stockSymbol, setStockSymbol] = useState<StockSymbolId>(
    initialDefinition?.stockSymbol || 'stock_rack_unit'
  );
  const [symbolGroupFilter, setSymbolGroupFilter] = useState<'all' | StockSymbolGroup>('all');
  const [widthFeet, setWidthFeet] = useState<number>(
    initialDefinition?.defaultWidthFeet || 2.5
  );
  const [heightFeet, setHeightFeet] = useState<number>(
    initialDefinition?.defaultHeightFeet || 2.0
  );
  const [dimsTouched, setDimsTouched] = useState(isEditing);

  // Power Spec
  const [powerRequired, setPowerRequired] = useState<boolean>(
    initialDefinition?.defaultPower?.required ?? false
  );
  const [powerConnector, setPowerConnector] = useState<string>(
    initialDefinition?.defaultPower?.connector || 'NEMA 5-15/20 Edison Quad (120V)'
  );
  const [powerVoltage, setPowerVoltage] = useState<string>(
    initialDefinition?.defaultPower?.voltage || '120V'
  );
  const [powerDropsCount, setPowerDropsCount] = useState<number>(
    initialDefinition?.defaultPower?.dropsCount || 1
  );

  // Signal / Sub-snake
  const [signalGroupId, setSignalGroupId] = useState<string>(
    initialDefinition?.defaultSignalGroupId || ''
  );
  const [subSnake, setSubSnake] = useState<string>(
    initialDefinition?.defaultSubSnake || ''
  );

  // Audio Drops (Channels)
  const [channels, setChannels] = useState<DefaultChannelDrop[]>(
    initialDefinition?.defaultChannels ? [...initialDefinition.defaultChannels] : []
  );

  const handleSelectSymbol = (opt: (typeof STOCK_SYMBOL_OPTIONS)[number]) => {
    setStockSymbol(opt.symbolId);
    if (!dimsTouched) {
      setWidthFeet(opt.defaultWidthFeet);
      setHeightFeet(opt.defaultHeightFeet);
    }
    if (!isEditing && !description) {
      setDescription(opt.description);
    }
  };

  const handlePowerConnectorChange = (conn: string) => {
    setPowerConnector(conn);
    const match = POWER_CONNECTOR_OPTIONS.find((p) => p.connector === conn);
    if (match) {
      setPowerVoltage(match.defaultVoltage);
    }
    if (conn === 'None') {
      setPowerRequired(false);
    } else {
      setPowerRequired(true);
    }
  };

  const handleSignalGroupChange = (groupId: string) => {
    setSignalGroupId(groupId);
    const group = (project.signalGroups || []).find((g) => g.id === groupId);
    if (group) {
      setSubSnake(group.shortCode);
    }
  };

  const handleAddDropRow = () => {
    setChannels((prev) => [
      ...prev,
      {
        name: `${label || 'Custom'} ${prev.length + 1}`,
        category: 'other',
        micOrDI: 'Active DI (Generic)',
        connector: 'XLR',
        standType: 'direct',
        phantom48V: true,
        stageLocation: '',
        subSnake: subSnake || '',
      },
    ]);
  };

  const updateDropRow = (index: number, patch: Partial<DefaultChannelDrop>) => {
    setChannels((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row))
    );
  };

  const removeDropRow = (index: number) => {
    setChannels((prev) => prev.filter((_, idx) => idx !== index));
  };

  const buildDefinition = (): GearDefinition => {
    const cleanLabel = label.trim() || 'Custom Audio Object';
    const typeKey =
      isEditing && initialDefinition
        ? initialDefinition.type
        : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    return {
      type: typeKey,
      label: cleanLabel,
      category,
      defaultWidthFeet: Math.max(0.8, Math.min(40, Number(widthFeet) || 2)),
      defaultHeightFeet: Math.max(0.8, Math.min(40, Number(heightFeet) || 2)),
      description: description.trim() || `${cleanLabel} custom stage object`,
      isCustom: true,
      stockSymbol,
      defaultPower: powerRequired
        ? {
            required: true,
            connector: powerConnector as PowerConnectorType,
            voltage: powerVoltage || '120V',
            dropsCount: Math.max(1, Number(powerDropsCount) || 1),
          }
        : {
            required: false,
            connector: 'None',
            voltage: '120V',
            dropsCount: 0,
          },
      defaultSignalGroupId: signalGroupId || undefined,
      defaultSubSnake: subSnake.trim() || undefined,
      defaultChannels: channels.map((c) => ({
        ...c,
        name: c.name.trim() || 'Audio Drop',
        subSnake: c.subSnake || subSnake.trim() || undefined,
      })),
    };
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const def = buildDefinition();
    saveCustomGearDefinition(def);
    onClose();
  };

  const handleSaveAndPlace = () => {
    const def = buildDefinition();
    saveCustomGearDefinition(def);
    addItem(def.type, { x: 50, y: 50 }, { [def.type]: def });
    onClose();
  };

  const handleDelete = () => {
    if (isEditing && initialDefinition) {
      deleteCustomGearDefinition(initialDefinition.type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSaveOnly}
        className="bg-slate-900 border border-slate-700 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {isEditing ? 'Edit Custom Audio Object' : 'Create Custom Audio Library Object'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* 1. Identity & Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Object Name *
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Playback Rack A / Horn Riser"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Library Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GearCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {GEAR_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Width (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.8"
                max="40"
                value={widthFeet}
                onChange={(e) => {
                  setDimsTouched(true);
                  setWidthFeet(Number(e.target.value) || 2);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono tabular-nums focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Depth (ft)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.8"
                max="40"
                value={heightFeet}
                onChange={(e) => {
                  setDimsTouched(true);
                  setHeightFeet(Number(e.target.value) || 2);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono tabular-nums focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="md:col-span-12">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Technical Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes shown in library tooltip (e.g. Dual redundant playback rack w/ Dante primary & secondary)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* 2. Stock CAD SVG Gallery */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Stock CAD Symbol ({STOCK_SYMBOL_OPTIONS.length} Technical Icons)
              </label>
              <span className="text-[11px] text-sky-400 font-mono">
                {STOCK_SYMBOL_OPTIONS.find((s) => s.symbolId === stockSymbol)?.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {SYMBOL_GROUP_FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setSymbolGroupFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors whitespace-nowrap ${
                    symbolGroupFilter === f.id
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded">
              {STOCK_SYMBOL_OPTIONS.filter(
                (opt) => symbolGroupFilter === 'all' || opt.group === symbolGroupFilter
              ).map((opt) => {
                const selected = stockSymbol === opt.symbolId;
                return (
                  <button
                    type="button"
                    key={opt.symbolId}
                    onClick={() => handleSelectSymbol(opt)}
                    className={`p-2 rounded border flex flex-col items-center gap-1.5 transition-all text-center ${
                      selected
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-xs'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                    }`}
                    title={opt.description}
                  >
                    <div className="w-11 h-11 bg-[#11151d] rounded border border-slate-800 p-1 flex items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{
                          __html: buildGearSVGInner(opt.symbolId, {
                            name: label || opt.label,
                            theme: 'dark',
                          }),
                        }}
                      />
                    </div>
                    <span className="text-[10px] leading-tight line-clamp-2 font-medium">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Power & Sub-Snake / Split Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Power Spec */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Power Drop & Connector</span>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={powerRequired}
                    onChange={(e) => setPowerRequired(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Requires Power</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    Power Connector Standard
                  </label>
                  <select
                    value={powerConnector}
                    onChange={(e) => handlePowerConnectorChange(e.target.value)}
                    disabled={!powerRequired}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 disabled:opacity-40"
                  >
                    {POWER_CONNECTOR_OPTIONS.map((p) => (
                      <option key={p.connector} value={p.connector}>
                        {p.connector} ({p.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Voltage</label>
                    <input
                      type="text"
                      value={powerVoltage}
                      onChange={(e) => setPowerVoltage(e.target.value)}
                      disabled={!powerRequired}
                      placeholder="120V / 230V"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Drop Count</label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={powerDropsCount}
                      onChange={(e) => setPowerDropsCount(Number(e.target.value) || 1)}
                      disabled={!powerRequired}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono tabular-nums disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Snake / Split Config */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2.5">
              <div className="font-bold text-sky-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Sub-Snake & Signal Split</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    Default Color-Coded Split Bus
                  </label>
                  <select
                    value={signalGroupId}
                    onChange={(e) => handleSignalGroupChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="">None (Assign Later)</option>
                    {(project.signalGroups || []).map((g) => (
                      <option key={g.id} value={g.id}>
                        [{g.shortCode}] {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    Sub-Snake / Drop Box Tag (synced to channels)
                  </label>
                  <input
                    type="text"
                    value={subSnake}
                    onChange={(e) => setSubSnake(e.target.value)}
                    placeholder="e.g. SNK-A, SPLIT, DANTE"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Audio Drops / Auto-Channels Builder */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Cable className="w-3.5 h-3.5" />
                <span>Audio Drops ({channels.length} Auto-Synced Channels)</span>
              </span>
              <button
                type="button"
                onClick={handleAddDropRow}
                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Audio Drop</span>
              </button>
            </div>

            {channels.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-3 text-center">
                No audio drops configured. Add drops here to auto-create Channel List inputs when placed on stage.
              </p>
            ) : (
              <div className="space-y-1.5">
                {channels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-1.5 items-center bg-slate-900/90 p-1.5 rounded border border-slate-800"
                  >
                    <input
                      type="text"
                      value={ch.name}
                      onChange={(e) => updateDropRow(idx, { name: e.target.value })}
                      placeholder="Source Name"
                      className="col-span-3 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                    <select
                      value={ch.category}
                      onChange={(e) =>
                        updateDropRow(idx, { category: e.target.value as ChannelCategory })
                      }
                      className="col-span-2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-300"
                    >
                      {CHANNEL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="col-span-3">
                      <input
                        type="text"
                        list={`custom-mic-list-${idx}`}
                        value={ch.micOrDI}
                        onChange={(e) => updateDropRow(idx, { micOrDI: e.target.value })}
                        placeholder="Mic / DI"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                      <datalist id={`custom-mic-list-${idx}`}>
                        {COMMON_MICS_AND_DIS.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                    <select
                      value={ch.connector || 'XLR'}
                      onChange={(e) =>
                        updateDropRow(idx, { connector: e.target.value as ConnectorType })
                      }
                      className="col-span-2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-300"
                    >
                      {CONNECTOR_TYPES.map((conn) => (
                        <option key={conn} value={conn}>
                          {conn}
                        </option>
                      ))}
                    </select>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <select
                        value={ch.standType}
                        onChange={(e) =>
                          updateDropRow(idx, { standType: e.target.value as StandType })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded px-1 py-1 text-slate-300 text-[10px]"
                        title="Stand Type"
                      >
                        {STAND_OPTIONS.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => updateDropRow(idx, { phantom48V: !ch.phantom48V })}
                        className={`px-1.5 py-1 rounded font-mono text-[10px] font-bold border shrink-0 ${
                          ch.phantom48V
                            ? 'bg-red-950 border-red-500 text-red-300'
                            : 'bg-slate-950 border-slate-700 text-slate-500'
                        }`}
                        title="Toggle 48V Phantom Power"
                      >
                        48V
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDropRow(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 shrink-0"
                        title="Remove drop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2 shrink-0">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-900 text-red-300 text-xs font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Object</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save to Library</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndPlace}
              className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save &amp; Place on Stage</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
