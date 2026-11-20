/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useStage } from '../../context/StageContext';
import { DEFAULT_SIGNAL_GROUPS, POWER_CONNECTOR_OPTIONS } from '../../data/gearLibrary';
import {
  formatLinkedChannelsLabel,
  formatLinkedMonitorsLabel,
  getLinkedChannelsForItem,
  getLinkedMonitorsForItem,
  isRoutingHubItem,
  resolveStageItemLabel,
} from '../../utils/stageRouting';
import {
  LabelHorizontalAlign,
  LabelVerticalAlign,
  MonitorMix,
  PowerConnectorType,
} from '../../types/stage';
import { SplitEditorModal } from './SplitEditorModal';
import {
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Zap,
  Tag,
  User,
  Sliders,
  Maximize,
  GitBranch,
  Plus,
  Pencil,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  AlignCenterVertical,
  Search,
  X,
  Volume2,
} from 'lucide-react';

export const StageItemControls: React.FC = () => {
  const {
    project,
    selectedItemId,
    setSelectedItemId,
    updateItem,
    removeItem,
    duplicateItem,
    rotateItem,
    setItemRotation,
    bringForward,
    sendBackward,
    toggleLockItem,
    allGearDefinitions,
    syncItemSubSnakeToChannels,
    addChannel,
    toggleChannelLink,
    addMonitorMix,
    toggleMonitorLink,
  } = useStage();

  const [showSplitEditor, setShowSplitEditor] = useState(false);
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [showMonitorPicker, setShowMonitorPicker] = useState(false);
  const [monitorSearch, setMonitorSearch] = useState('');

  const item = selectedItemId
    ? project.items.find((it) => it.id === selectedItemId) || null
    : null;

  const linkedChannels = useMemo(
    () => (item ? getLinkedChannelsForItem(item, project.channels) : []),
    [item, project.channels]
  );

  const linkedMonitors = useMemo(
    () => (item ? getLinkedMonitorsForItem(item, project.monitors) : []),
    [item, project.monitors]
  );

  const filteredChannelsForPicker = useMemo(() => {
    const q = channelSearch.trim().toLowerCase();
    if (!q) return project.channels;
    return project.channels.filter(
      (ch) =>
        String(ch.channelNumber).includes(q) ||
        ch.name.toLowerCase().includes(q) ||
        ch.micOrDI.toLowerCase().includes(q)
    );
  }, [project.channels, channelSearch]);

  const filteredMonitorsForPicker = useMemo(() => {
    const q = monitorSearch.trim().toLowerCase();
    if (!q) return project.monitors;
    return project.monitors.filter(
      (mix) =>
        String(mix.mixNumber).includes(q) ||
        mix.performer.toLowerCase().includes(q) ||
        mix.outputPatch.toLowerCase().includes(q) ||
        mix.location.toLowerCase().includes(q)
    );
  }, [project.monitors, monitorSearch]);

  if (!selectedItemId || !item) return null;

  const defaultGearLabel = allGearDefinitions[item.type]?.label;
  const resolvedLabel = resolveStageItemLabel(
    item,
    linkedChannels,
    defaultGearLabel,
    linkedMonitors
  );
  const channelsSummaryLabel = formatLinkedChannelsLabel(linkedChannels);
  const linkedChannelCount = linkedChannels.length;
  const monitorsSummaryLabel = formatLinkedMonitorsLabel(linkedMonitors);
  const linkedMonitorCount = linkedMonitors.length;

  const showWedgeCallout =
    item.type.includes('wedge') ||
    item.type.includes('monitor') ||
    item.type.includes('side_fill');

  const signalGroups =
    project.signalGroups && project.signalGroups.length > 0
      ? project.signalGroups
      : DEFAULT_SIGNAL_GROUPS;

  const routingTargets = project.items.filter(
    (other) => other.id !== item.id && isRoutingHubItem(other, allGearDefinitions)
  );

  const activePowerConnector =
    item.powerSpec?.connector ||
    (item.powerDropRequired ? 'NEMA 5-15/20 Edison Quad (120V)' : 'None');
  const activeDropsCount = item.powerSpec?.dropsCount || 1;

  const alignH: LabelHorizontalAlign = item.labelAlignH || 'center';
  const alignV: LabelVerticalAlign =
    item.labelAlignV || (item.type.includes('wedge') ? 'bottom' : 'top');

  const inferDefaultMonitorType = (): MonitorMix['type'] => {
    const t = item.type.toLowerCase();
    if (t.includes('iem') || t.includes('headphone')) return 'stereo_iem';
    if (t.includes('drum')) return 'drum_sub';
    return 'floor_wedge';
  };

  const handlePowerToggle = (checked: boolean) => {
    const connector =
      activePowerConnector === 'None'
        ? 'NEMA 5-15/20 Edison Quad (120V)'
        : activePowerConnector;
    const match = POWER_CONNECTOR_OPTIONS.find((p) => p.connector === connector);
    const voltage = match?.defaultVoltage || '120V';
    updateItem(item.id, {
      powerDropRequired: checked,
      powerVoltage:
        voltage.includes('230') || voltage.includes('240') || voltage.includes('400')
          ? '230V'
          : '120V',
      powerSpec: {
        required: checked,
        connector: (checked ? connector : 'None') as PowerConnectorType,
        voltage,
        dropsCount: checked ? activeDropsCount : 0,
      },
    });
  };

  const handlePowerConnectorSelect = (conn: string) => {
    const match = POWER_CONNECTOR_OPTIONS.find((p) => p.connector === conn);
    const voltage = match?.defaultVoltage || '120V';
    const required = conn !== 'None';
    updateItem(item.id, {
      powerDropRequired: required,
      powerVoltage:
        voltage.includes('230') || voltage.includes('240') || voltage.includes('400')
          ? '230V'
          : '120V',
      powerSpec: {
        required,
        connector: conn as PowerConnectorType,
        voltage,
        dropsCount: required ? activeDropsCount : 0,
      },
    });
  };

  const handleSignalGroupSelect = (groupId: string) => {
    const grp = signalGroups.find((g) => g.id === groupId);
    const nextLabel = grp ? grp.shortCode : '';
    updateItem(item.id, {
      signalGroupId: groupId || undefined,
      subSnakeLabel: nextLabel || undefined,
    });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 z-30 w-80 max-h-[calc(100%-2rem)] overflow-y-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-lg shadow-2xl p-3 text-xs text-slate-200 select-auto"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Selected Gear</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedItemId(null)}
          className="text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Close inspector"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        {/* Label / Gear Name input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Label / Gear Name</span>
            </label>
            {resolvedLabel.inherited ? (
              <span
                className={`text-[9px] font-mono px-1.5 py-0 rounded border ${
                  resolvedLabel.inheritedSource === 'monitor'
                    ? 'bg-violet-950/70 border-violet-500/40 text-violet-300'
                    : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {resolvedLabel.inheritedSource === 'monitor'
                  ? 'Inherited from Mix'
                  : 'Inherited from Ch'}
              </span>
            ) : (
              (linkedChannelCount > 0 || linkedMonitorCount > 0) && (
                <button
                  type="button"
                  disabled={item.locked}
                  onClick={() =>
                    updateItem(item.id, {
                      performer: '',
                      name: defaultGearLabel || '',
                      hasCustomLabel: false,
                    })
                  }
                  className="text-[9px] text-sky-400 hover:text-sky-300 underline disabled:opacity-40"
                  title="Inherit label automatically from linked channel or monitor mix"
                >
                  {linkedChannelCount > 0 ? 'Use Ch Label' : 'Use Mix Label'}
                </button>
              )
            )}
          </div>
          <input
            type="text"
            value={resolvedLabel.inherited ? resolvedLabel.primary : item.name}
            disabled={item.locked}
            onChange={(e) =>
              updateItem(item.id, {
                name: e.target.value,
                hasCustomLabel: e.target.value.trim().length > 0,
              })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-50"
            placeholder={
              linkedChannelCount > 0 || linkedMonitorCount > 0
                ? resolvedLabel.primary || 'Inherited from link'
                : 'e.g. Lead Vox Mic'
            }
          />
        </div>

        {/* Performer and Instrument */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Performer</span>
            </label>
            <input
              type="text"
              value={item.performer || ''}
              disabled={item.locked}
              onChange={(e) => updateItem(item.id, { performer: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-50"
              placeholder="e.g. Lead Vox"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              <span>Instrument</span>
            </label>
            <input
              type="text"
              value={item.instrument || ''}
              disabled={item.locked}
              onChange={(e) => updateItem(item.id, { instrument: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-50"
              placeholder="e.g. Guitar / Keys"
            />
          </div>
        </div>

        {/* Label Alignment (Word/Excel-style Top/Middle/Bottom + Left/Center/Right) */}
        <div className="p-2 bg-slate-950/70 rounded border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Label Alignment
            </span>
            <span className="text-[9px] font-mono text-slate-500 capitalize">
              {alignV} · {alignH}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {/* Vertical Alignment: Top / Middle / Bottom */}
            <div className="grid grid-cols-3 gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800">
              {(
                [
                  { id: 'top', label: 'Top', Icon: ArrowUpToLine },
                  { id: 'middle', label: 'Middle', Icon: AlignCenterVertical },
                  { id: 'bottom', label: 'Bottom', Icon: ArrowDownToLine },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={item.locked}
                  onClick={() => updateItem(item.id, { labelAlignV: id })}
                  title={`Align label: ${label}`}
                  className={`py-1 rounded flex items-center justify-center transition-colors disabled:opacity-40 ${
                    alignV === id
                      ? 'bg-sky-500/25 border border-sky-400/70 text-sky-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Horizontal Alignment: Left / Center / Right */}
            <div className="grid grid-cols-3 gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800">
              {(
                [
                  { id: 'left', label: 'Left', Icon: AlignLeft },
                  { id: 'center', label: 'Center', Icon: AlignCenter },
                  { id: 'right', label: 'Right', Icon: AlignRight },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={item.locked}
                  onClick={() => updateItem(item.id, { labelAlignH: id })}
                  title={`Align label: ${label}`}
                  className={`py-1 rounded flex items-center justify-center transition-colors disabled:opacity-40 ${
                    alignH === id
                      ? 'bg-sky-500/25 border border-sky-400/70 text-sky-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Linked Channel List Inputs */}
        <div className="p-2 bg-slate-950/70 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              <span>Linked Channels</span>
            </span>
            <button
              type="button"
              onClick={() => setShowChannelPicker(!showChannelPicker)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-medium"
            >
              {showChannelPicker ? 'Done' : 'Link Channels'}
            </button>
          </div>

          {channelsSummaryLabel ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded px-2 py-0.5">
                {channelsSummaryLabel}
              </div>
              <div className="flex flex-wrap gap-1">
                {linkedChannels.map((ch) => (
                  <span
                    key={ch.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-200"
                  >
                    <span className="font-mono font-bold text-sky-400">#{ch.channelNumber}</span>
                    <span className="max-w-[110px] truncate">{ch.name || 'Unnamed'}</span>
                    <button
                      type="button"
                      onClick={() => toggleChannelLink(item.id, ch.id)}
                      className="text-slate-500 hover:text-red-400"
                      title={`Unlink Channel #${ch.channelNumber}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500">
              No channels linked. Link channels below to display{' '}
              <span className="font-mono text-slate-400">Channel: #</span> and auto-inherit label.
            </div>
          )}

          {showChannelPicker && (
            <div className="border border-slate-800 rounded bg-slate-900/90 p-1.5 space-y-1.5">
              {project.channels.length > 6 && (
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Filter channels..."
                    className="w-full bg-slate-950 border border-slate-700 rounded pl-6 pr-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-0.5">
                {filteredChannelsForPicker.length === 0 ? (
                  <div className="text-[10px] text-slate-500 text-center py-2">
                    No channels available.
                  </div>
                ) : (
                  filteredChannelsForPicker.map((ch) => {
                    const isLinkedHere = linkedChannels.some((lc) => lc.id === ch.id);
                    const otherItem =
                      !isLinkedHere && ch.linkedStageItemId
                        ? project.items.find((it) => it.id === ch.linkedStageItemId)
                        : null;

                    return (
                      <label
                        key={ch.id}
                        className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer text-[10px] transition-colors ${
                          isLinkedHere
                            ? 'bg-sky-500/15 text-slate-100'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isLinkedHere}
                          onChange={() => toggleChannelLink(item.id, ch.id)}
                          className="w-3 h-3 accent-sky-500 rounded cursor-pointer shrink-0"
                        />
                        <span className="font-mono font-bold text-sky-400 w-6 shrink-0">
                          #{ch.channelNumber}
                        </span>
                        <span className="truncate flex-1 font-medium">
                          {ch.name || 'Unnamed'}
                        </span>
                        {otherItem && (
                          <span
                            className="text-[9px] text-amber-400/90 font-mono truncate max-w-[68px]"
                            title={`Currently linked to ${otherItem.performer || otherItem.name} — check to move here`}
                          >
                            ({otherItem.performer || otherItem.name})
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              addChannel({
                name: item.performer ? `${item.performer} (${item.name})` : item.name,
                micOrDI: 'Active DI (Generic)',
                connector: 'XLR',
                standType: 'direct',
                phantom48V: true,
                subSnake: item.subSnakeLabel || '',
                signalGroupId: item.signalGroupId,
                stageLocation: item.performer || '',
                linkedStageItemId: item.id,
              })
            }
            className="w-full py-1 px-2 rounded bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-[10px] text-sky-300 font-medium flex items-center justify-center gap-1"
            title="Create a brand-new channel list input linked to this stage object"
          >
            <Plus className="w-3 h-3" />
            <span>Create New Linked Channel</span>
          </button>
        </div>

        {/* Linked Outputs / Monitor Mixes */}
        <div className="p-2 bg-slate-950/70 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Linked Outputs / Mixes</span>
            </span>
            <button
              type="button"
              onClick={() => setShowMonitorPicker(!showMonitorPicker)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-violet-300 font-medium"
            >
              {showMonitorPicker ? 'Done' : 'Link Outputs'}
            </button>
          </div>

          {monitorsSummaryLabel ? (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold text-violet-300 bg-violet-950/40 border border-violet-500/30 rounded px-2 py-0.5">
                {monitorsSummaryLabel}
              </div>
              <div className="flex flex-wrap gap-1">
                {linkedMonitors.map((mix) => (
                  <span
                    key={mix.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-200"
                  >
                    <span className="font-mono font-bold text-violet-400">
                      Mix {mix.mixNumber}
                    </span>
                    {mix.outputPatch && (
                      <span className="font-mono text-[9px] text-slate-400">
                        ({mix.outputPatch})
                      </span>
                    )}
                    <span className="max-w-[90px] truncate">{mix.performer || 'Unnamed'}</span>
                    <button
                      type="button"
                      onClick={() => toggleMonitorLink(item.id, mix.id)}
                      className="text-slate-500 hover:text-red-400"
                      title={`Unlink Mix ${mix.mixNumber}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500">
              No outputs/mixes linked. Link monitor mixes below to show{' '}
              <span className="font-mono text-slate-400">Output: Mix #</span> on the stage plot.
            </div>
          )}

          {showMonitorPicker && (
            <div className="border border-slate-800 rounded bg-slate-900/90 p-1.5 space-y-1.5">
              {project.monitors.length > 6 && (
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={monitorSearch}
                    onChange={(e) => setMonitorSearch(e.target.value)}
                    placeholder="Filter mixes / aux outs..."
                    className="w-full bg-slate-950 border border-slate-700 rounded pl-6 pr-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}

              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-0.5">
                {filteredMonitorsForPicker.length === 0 ? (
                  <div className="text-[10px] text-slate-500 text-center py-2">
                    No monitor mixes available.
                  </div>
                ) : (
                  filteredMonitorsForPicker.map((mix) => {
                    const isLinkedHere = linkedMonitors.some((lm) => lm.id === mix.id);
                    const otherItems = project.items.filter(
                      (it) =>
                        it.id !== item.id &&
                        (mix.linkedStageItemId === it.id || it.monitorIds?.includes(mix.id))
                    );

                    return (
                      <label
                        key={mix.id}
                        className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer text-[10px] transition-colors ${
                          isLinkedHere
                            ? 'bg-violet-500/15 text-slate-100'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isLinkedHere}
                          onChange={() => toggleMonitorLink(item.id, mix.id)}
                          className="w-3 h-3 accent-violet-500 rounded cursor-pointer shrink-0"
                        />
                        <span className="font-mono font-bold text-violet-400 shrink-0">
                          M{mix.mixNumber}
                        </span>
                        <span className="truncate flex-1 font-medium">
                          {mix.performer || `Mix ${mix.mixNumber}`}
                        </span>
                        {mix.outputPatch && (
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {mix.outputPatch}
                          </span>
                        )}
                        {otherItems.length > 0 && (
                          <span
                            className="text-[9px] text-indigo-300/80 font-mono truncate max-w-[60px]"
                            title={`Also feeding: ${otherItems
                              .map((oi) => oi.performer || oi.name)
                              .join(', ')}`}
                          >
                            +{otherItems.length}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              addMonitorMix({
                performer: item.performer || item.name,
                type: inferDefaultMonitorType(),
                location: item.performer || item.name,
                linkedStageItemId: item.id,
              })
            }
            className="w-full py-1 px-2 rounded bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-[10px] text-violet-300 font-medium flex items-center justify-center gap-1"
            title="Create a new monitor mix / output linked to this stage piece"
          >
            <Plus className="w-3 h-3" />
            <span>Create New Linked Output / Mix</span>
          </button>
        </div>

        {/* Wedge / Monitor Callout */}
        {showWedgeCallout && (
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              <span>Monitor Mix Callout</span>
            </label>
            <input
              type="text"
              value={item.wedgeLabel || ''}
              disabled={item.locked}
              onChange={(e) => updateItem(item.id, { wedgeLabel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-50 font-mono"
              placeholder="e.g. WEDGE MX 1"
            />
          </div>
        )}

        {/* Footprint Width & Depth (ft) */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
            <Maximize className="w-3 h-3 text-slate-400" />
            <span>Footprint Size (ft)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5">
              <span className="text-[10px] text-slate-500 font-mono">W</span>
              <input
                type="number"
                step="0.5"
                min="0.8"
                max="30"
                value={item.width}
                disabled={item.locked}
                onChange={(e) =>
                  updateItem(item.id, {
                    width: Math.max(0.8, Math.min(30, Number(e.target.value) || item.width)),
                  })
                }
                className="w-full bg-transparent text-slate-100 font-mono tabular-nums text-right focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5">
              <span className="text-[10px] text-slate-500 font-mono">D</span>
              <input
                type="number"
                step="0.5"
                min="0.8"
                max="30"
                value={item.height}
                disabled={item.locked}
                onChange={(e) =>
                  updateItem(item.id, {
                    height: Math.max(0.8, Math.min(30, Number(e.target.value) || item.height)),
                  })
                }
                className="w-full bg-transparent text-slate-100 font-mono tabular-nums text-right focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Rotation quick buttons */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              <span>Rotation ({Math.round(item.rotation)}°)</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[0, 90, 180, 270].map((deg) => (
              <button
                type="button"
                key={deg}
                onClick={() => setItemRotation(item.id, deg)}
                disabled={item.locked}
                className={`py-1 text-center font-mono rounded border transition-colors ${
                  Math.round(item.rotation) === deg
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                } disabled:opacity-50`}
              >
                {deg}°
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <button
              type="button"
              onClick={() => rotateItem(item.id, -15)}
              disabled={item.locked}
              className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-center disabled:opacity-50"
            >
              -15°
            </button>
            <button
              type="button"
              onClick={() => rotateItem(item.id, 15)}
              disabled={item.locked}
              className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-center disabled:opacity-50"
            >
              +15°
            </button>
            <button
              type="button"
              onClick={() => rotateItem(item.id, 45)}
              disabled={item.locked}
              className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-center disabled:opacity-50"
            >
              +45°
            </button>
          </div>
        </div>

        {/* Signal Split & Routing Section */}
        <div className="p-2 bg-slate-950/70 rounded border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Signal Split &amp; Routing</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] text-slate-500">Split Bus</label>
                <button
                  type="button"
                  onClick={() => setShowSplitEditor(true)}
                  className="text-[9px] text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                  title="Edit or create signal splits"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>
              <select
                value={item.signalGroupId || ''}
                disabled={item.locked}
                onChange={(e) => handleSignalGroupSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 disabled:opacity-50"
              >
                <option value="">None</option>
                {signalGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    [{g.shortCode}] {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Sub-Snake Tag</label>
              <input
                type="text"
                value={item.subSnakeLabel || ''}
                disabled={item.locked}
                onChange={(e) => updateItem(item.id, { subSnakeLabel: e.target.value })}
                placeholder="e.g. SNK-A"
                className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] font-mono text-slate-200 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block mb-0.5">
              Route Signal Line To
            </label>
            <select
              value={item.routeToItemId || ''}
              disabled={item.locked}
              onChange={(e) =>
                updateItem(item.id, { routeToItemId: e.target.value || undefined })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 disabled:opacity-50"
            >
              <option value="">No routing line</option>
              {routingTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.performer || target.name}
                </option>
              ))}
            </select>
          </div>

          {linkedChannelCount > 0 && (
            <button
              type="button"
              onClick={() =>
                syncItemSubSnakeToChannels(
                  item.id,
                  item.subSnakeLabel || '',
                  item.signalGroupId
                )
              }
              className="w-full py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-emerald-300 font-medium"
              title="Apply split/sub-snake tag to all channels linked to this gear"
            >
              Sync Split Tag to {linkedChannelCount} Linked Ch
            </button>
          )}
        </div>

        {/* Power Specification */}
        <div className="p-2 bg-slate-950/70 rounded border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Dedicated Power Drop</span>
            </label>
            <input
              type="checkbox"
              checked={!!item.powerDropRequired}
              disabled={item.locked}
              onChange={(e) => handlePowerToggle(e.target.checked)}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer disabled:opacity-50"
            />
          </div>

          {item.powerDropRequired && (
            <div className="grid grid-cols-12 gap-1.5">
              <select
                value={activePowerConnector}
                disabled={item.locked}
                onChange={(e) => handlePowerConnectorSelect(e.target.value)}
                className="col-span-9 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-200 disabled:opacity-50"
              >
                {POWER_CONNECTOR_OPTIONS.filter((p) => p.connector !== 'None').map((opt) => (
                  <option key={opt.connector} value={opt.connector}>
                    {opt.connector}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="12"
                value={activeDropsCount}
                disabled={item.locked}
                onChange={(e) =>
                  updateItem(item.id, {
                    powerSpec: {
                      required: true,
                      connector: activePowerConnector as PowerConnectorType,
                      voltage: item.powerSpec?.voltage || '120V',
                      dropsCount: Math.max(1, Number(e.target.value) || 1),
                    },
                  })
                }
                title="Number of drops"
                className="col-span-3 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] font-mono tabular-nums text-right text-amber-300"
              />
            </div>
          )}
        </div>

        {/* Action button toolbar: Duplicate, Lock, Layer, Delete */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => toggleLockItem(item.id)}
            className={`p-1.5 rounded border ${
              item.locked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={item.locked ? 'Unlock item' : 'Lock position'}
          >
            {item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => duplicateItem(item.id)}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            title="Duplicate gear"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => bringForward(item.id)}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            title="Bring forward in stack"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => sendBackward(item.id)}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            title="Send backward in stack"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="p-1.5 rounded bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/60 hover:text-red-200 ml-auto"
            title={
              linkedChannelCount > 0
                ? `Delete from stage & remove ${linkedChannelCount} linked channel${
                    linkedChannelCount === 1 ? '' : 's'
                  }`
                : 'Delete from stage'
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SplitEditorModal
        isOpen={showSplitEditor}
        initialGroupId={item.signalGroupId || signalGroups[0]?.id || 'new'}
        onClose={() => setShowSplitEditor(false)}
      />
    </div>
  );
};
