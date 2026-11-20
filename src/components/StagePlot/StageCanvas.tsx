/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useStage } from '../../context/StageContext';
import { StageItemRenderer } from './StageItemRenderer';
import { StageItemControls } from './StageItemControls';
import { SplitEditorModal } from './SplitEditorModal';
import { GearType, SignalSplitType } from '../../types/stage';
import { DEFAULT_SIGNAL_GROUPS, SIGNAL_GROUP_COLORS } from '../../data/gearLibrary';
import {
  findSignalGroup,
  getLinkedChannelsForItem,
  getLinkedMonitorsForItem,
} from '../../utils/stageRouting';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  RotateCw,
  Ruler,
  Layers,
  GitBranch,
  Plus,
  Pencil,
} from 'lucide-react';

export const StageCanvas: React.FC = () => {
  const {
    project,
    selectedItemId,
    setSelectedItemId,
    gridSnapFeet,
    setGridSnapFeet,
    zoomLevel,
    setZoomLevel,
    updateItem,
    removeItem,
    rotateItem,
    addItem,
    updateProject,
    addSignalGroup,
    allGearDefinitions,
    commitHistory,
  } = useStage();

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [showRulers, setShowRulers] = useState(true);
  const [activeSignalFilter, setActiveSignalFilter] = useState<string | null>(null);
  const [showAddSplitForm, setShowAddSplitForm] = useState(false);
  const [newSplitName, setNewSplitName] = useState('');
  const [newSplitCode, setNewSplitCode] = useState('');
  const [newSplitType, setNewSplitType] = useState<SignalSplitType>('subsnake');
  const [newSplitColor, setNewSplitColor] = useState<string>(SIGNAL_GROUP_COLORS[0]);
  const [editingSplitTarget, setEditingSplitTarget] = useState<string | 'new' | null>(null);

  const showSignalPaths = project.showSignalPaths !== false;
  const signalGroups = project.signalGroups && project.signalGroups.length > 0
    ? project.signalGroups
    : DEFAULT_SIGNAL_GROUPS;

  const { widthFeet, depthFeet } = project.stageDimensions;
  const stageAspectRatio = widthFeet / depthFeet;

  // Dynamic symmetrical ruler ticks every 4ft outward from center 0'0"
  const horizontalTicks = useMemo(() => {
    const half = widthFeet / 2;
    const ticks: Array<{ offsetFt: number; pct: number; label: string }> = [];
    const step = widthFeet >= 36 ? 6 : 4;
    for (let ft = -Math.floor(half / step) * step; ft <= half; ft += step) {
      if (Math.abs(ft) >= half - 0.5 && ft !== 0) continue;
      const pct = ((half + ft) / widthFeet) * 100;
      const label = ft === 0 ? "0'0\"" : `${ft > 0 ? '+' : ''}${ft}'`;
      ticks.push({ offsetFt: ft, pct, label });
    }
    return ticks;
  }, [widthFeet]);

  const dragStartRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    initialItemX: number;
    initialItemY: number;
  } | null>(null);

  // Keyboard navigation for selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeItem(selectedItemId);
      } else if (e.key === 'r' || e.key === 'R') {
        rotateItem(selectedItemId, e.shiftKey ? -15 : 15);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const item = project.items.find((it) => it.id === selectedItemId);
        if (item && !item.locked) updateItem(selectedItemId, { y: Math.max(0, item.y - (e.shiftKey ? 1 : 3)) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const item = project.items.find((it) => it.id === selectedItemId);
        if (item && !item.locked) updateItem(selectedItemId, { y: Math.min(100, item.y + (e.shiftKey ? 1 : 3)) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const item = project.items.find((it) => it.id === selectedItemId);
        if (item && !item.locked) updateItem(selectedItemId, { x: Math.max(0, item.x - (e.shiftKey ? 1 : 3)) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const item = project.items.find((it) => it.id === selectedItemId);
        if (item && !item.locked) updateItem(selectedItemId, { x: Math.min(100, item.x + (e.shiftKey ? 1 : 3)) });
      } else if (e.key === 'Escape') {
        setSelectedItemId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, project.items, removeItem, rotateItem, updateItem, setSelectedItemId]);

  // Pointer drag handler for moving stage gear
  const handleItemPointerDown = (e: React.PointerEvent, itemId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedItemId(itemId);

    const item = project.items.find((it) => it.id === itemId);
    if (!item || item.locked) return;

    dragStartRef.current = {
      itemId,
      startX: e.clientX,
      startY: e.clientY,
      initialItemX: item.x,
      initialItemY: item.y,
    };

    let didMove = false;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!dragStartRef.current || !stageContainerRef.current) return;
      const dx = moveEvt.clientX - dragStartRef.current.startX;
      const dy = moveEvt.clientY - dragStartRef.current.startY;
      if (!didMove && Math.hypot(dx, dy) < 2) return;
      didMove = true;

      const rect = stageContainerRef.current.getBoundingClientRect();
      const deltaXPercent = (dx / rect.width) * 100;
      const deltaYPercent = (dy / rect.height) * 100;

      let newX = dragStartRef.current.initialItemX + deltaXPercent;
      let newY = dragStartRef.current.initialItemY + deltaYPercent;

      if (gridSnapFeet > 0) {
        const snapXPercent = (gridSnapFeet / widthFeet) * 100;
        const snapYPercent = (gridSnapFeet / depthFeet) * 100;
        newX = Math.round(newX / snapXPercent) * snapXPercent;
        newY = Math.round(newY / snapYPercent) * snapYPercent;
      }

      newX = Math.max(3, Math.min(97, newX));
      newY = Math.max(3, Math.min(97, newY));

      updateItem(dragStartRef.current.itemId, { x: newX, y: newY }, false);
    };

    const handlePointerUp = () => {
      if (didMove) {
        commitHistory();
      }
      dragStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Rotation handle
  const handleRotateHandleDown = (e: React.PointerEvent, itemId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const item = project.items.find((it) => it.id === itemId);
    if (!item || item.locked) return;

    let didRotate = false;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!stageContainerRef.current) return;
      didRotate = true;
      const rect = stageContainerRef.current.getBoundingClientRect();
      const itemCenterX = rect.left + (item.x / 100) * rect.width;
      const itemCenterY = rect.top + (item.y / 100) * rect.height;

      const dx = moveEvt.clientX - itemCenterX;
      const dy = moveEvt.clientY - itemCenterY;

      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;

      const snapDeg = moveEvt.shiftKey ? 45 : 5;
      deg = Math.round(deg / snapDeg) * snapDeg;

      updateItem(itemId, { rotation: deg % 360 }, false);
    };

    const handlePointerUp = () => {
      if (didRotate) {
        commitHistory();
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Drop gear from palette
  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const gearType = e.dataTransfer.getData('application/stagecraft-gear') as GearType;
    if (!gearType || !stageContainerRef.current) return;

    const rect = stageContainerRef.current.getBoundingClientRect();
    let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    if (gridSnapFeet > 0) {
      const snapX = (gridSnapFeet / widthFeet) * 100;
      const snapY = (gridSnapFeet / depthFeet) * 100;
      xPercent = Math.round(xPercent / snapX) * snapX;
      yPercent = Math.round(yPercent / snapY) * snapY;
    }

    xPercent = Math.max(5, Math.min(95, xPercent));
    yPercent = Math.max(5, Math.min(95, yPercent));

    addItem(gearType, { x: xPercent, y: yPercent });
  };

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const selectedItem = selectedItemId
    ? project.items.find((it) => it.id === selectedItemId)
    : null;

  const selectedCoordsLabel = useMemo(() => {
    if (!selectedItem) return null;
    const xFromCenterFt = ((selectedItem.x - 50) / 100) * widthFeet;
    const yFromFrontFt = ((100 - selectedItem.y) / 100) * depthFeet;
    const side =
      Math.abs(xFromCenterFt) < 0.25
        ? 'CENTER'
        : xFromCenterFt < 0
        ? `${Math.abs(xFromCenterFt).toFixed(1)}' SR`
        : `${xFromCenterFt.toFixed(1)}' SL`;
    return `${side} · ${yFromFrontFt.toFixed(1)}' from DS · ${Math.round(selectedItem.rotation)}°`;
  }, [selectedItem, widthFeet, depthFeet]);

  const techZone = project.techZone;

  return (
    <div className="relative flex-1 h-full flex flex-col bg-[#0a0d14] overflow-hidden select-none">
      {/* Stage Top Bar Toolbar */}
      <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 whitespace-nowrap">
            <span>Stage CAD Plot</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-sky-300 tabular-nums">
              {widthFeet}&apos;-0&quot; W × {depthFeet}&apos;-0&quot; D
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Grid Snap Control */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Grid className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Snap:</span>
            <select
              value={gridSnapFeet}
              onChange={(e) => setGridSnapFeet(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 focus:outline-none"
            >
              <option value="0">Off (Free)</option>
              <option value="0.5">0.5 ft</option>
              <option value="1">1 ft Grid</option>
              <option value="2">2 ft Grid</option>
            </select>
          </div>

          {/* Dimension Lines Toggle */}
          <button
            type="button"
            onClick={() => setShowRulers(!showRulers)}
            className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              showRulers
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ruler className="w-3 h-3" />
            <span>Dimensions</span>
          </button>

          {/* Signal Paths & Splits Toggle */}
          <button
            type="button"
            onClick={() => {
              updateProject({ showSignalPaths: !showSignalPaths });
              if (showSignalPaths) setActiveSignalFilter(null);
            }}
            className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              showSignalPaths
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle color-coded signal splits & routing paths"
          >
            <GitBranch className="w-3 h-3" />
            <span>Signal Paths</span>
          </button>

          {/* Off-Stage Tech Zone Toggle */}
          <div className="flex items-center gap-1 whitespace-nowrap">
            <button
              type="button"
              onClick={() =>
                updateProject({
                  techZone: {
                    enabled: !techZone?.enabled,
                    label:
                      techZone?.label ||
                      `MONITOR / TECH WORLD (${techZone?.location || 'SR'})`,
                    location: techZone?.location || 'SR',
                  },
                })
              }
              className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 transition-colors ${
                techZone?.enabled
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-medium'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle off-stage Monitor / Tech World bay"
            >
              <Layers className="w-3 h-3" />
              <span>Tech Zone</span>
            </button>
            {techZone?.enabled && (
              <select
                value={techZone.location}
                onChange={(e) => {
                  const loc = e.target.value === 'SL' ? 'SL' : 'SR';
                  updateProject({
                    techZone: {
                      ...techZone,
                      location: loc,
                      label: `MONITOR / TECH WORLD (${loc})`,
                    },
                  });
                }}
                className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-amber-300 font-mono focus:outline-none"
                title="Tech Zone side"
              >
                <option value="SR">SR (Left)</option>
                <option value="SL">SL (Right)</option>
              </select>
            )}
          </div>
        </div>

        {/* Zoom & Fit Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-800/80 rounded border border-slate-700/60 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.15))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300 tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.15))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1.0)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 ml-0.5"
              title="Reset Zoom to 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Color-Coded Signal & Split Legend Bar */}
      {showSignalPaths && (
        <div className="px-4 py-1.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1">
              Splits:
            </span>
            {signalGroups.map((group) => {
              const itemCount = project.items.filter(
                (it) => it.signalGroupId === group.id || it.subSnakeLabel === group.shortCode
              ).length;
              const isFiltered = activeSignalFilter === group.id;
              return (
                <div
                  key={group.id}
                  className={`rounded border flex items-center transition-all whitespace-nowrap overflow-hidden ${
                    isFiltered
                      ? 'bg-slate-800 text-white shadow-xs'
                      : activeSignalFilter
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                  style={{
                    borderColor: isFiltered ? group.color : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSignalFilter(isFiltered ? null : group.id)}
                    onDoubleClick={() => setEditingSplitTarget(group.id)}
                    className="px-2 py-0.5 flex items-center gap-1.5 text-left"
                    title={`${group.name} (${group.splitType.replace('_', ' ')}) — Click to isolate, double-click to edit`}
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-mono font-bold text-[10px]" style={{ color: group.color }}>
                      {group.shortCode}
                    </span>
                    <span className="text-slate-300">{group.name}</span>
                    {itemCount > 0 && (
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        ({itemCount})
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSplitTarget(group.id);
                    }}
                    className="px-1.5 py-0.5 border-l border-slate-800/90 text-slate-500 hover:text-sky-300 hover:bg-slate-800/80 transition-colors"
                    title={`Edit ${group.name} (${group.shortCode})`}
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}

            {activeSignalFilter && (
              <button
                type="button"
                onClick={() => setActiveSignalFilter(null)}
                className="px-1.5 py-0.5 text-[10px] text-sky-400 hover:text-sky-300 underline"
              >
                Show All
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {showAddSplitForm ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded p-0.5">
                <input
                  type="text"
                  value={newSplitCode}
                  onChange={(e) => setNewSplitCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={8}
                  className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  value={newSplitName}
                  onChange={(e) => setNewSplitName(e.target.value)}
                  placeholder="Split / Snake Name"
                  className="w-32 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-100 focus:outline-none"
                />
                <select
                  value={newSplitType}
                  onChange={(e) => setNewSplitType(e.target.value as SignalSplitType)}
                  className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-300"
                >
                  <option value="subsnake">Sub-Snake</option>
                  <option value="foh_mon_split">FOH/MON Split</option>
                  <option value="dante_network">Dante Net</option>
                  <option value="rf_iem">RF / IEM</option>
                  <option value="playback">Playback</option>
                  <option value="power_bus">Power Bus</option>
                </select>
                <div className="flex items-center gap-0.5 px-1">
                  {SIGNAL_GROUP_COLORS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setNewSplitColor(col)}
                      className={`w-3 h-3 rounded-xs ${
                        newSplitColor === col ? 'ring-1 ring-white scale-110' : 'opacity-60'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newSplitName.trim() && !newSplitCode.trim()) return;
                    addSignalGroup({
                      name: newSplitName.trim() || newSplitCode.trim(),
                      shortCode: (newSplitCode.trim() || 'SNK').slice(0, 8),
                      color: newSplitColor,
                      splitType: newSplitType,
                    });
                    setNewSplitName('');
                    setNewSplitCode('');
                    setShowAddSplitForm(false);
                  }}
                  className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSplitForm(false)}
                  className="px-1 text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditingSplitTarget(activeSignalFilter || signalGroups[0]?.id || 'new')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 whitespace-nowrap"
                  title="Edit, recolor, rename, or delete existing signal splits"
                >
                  <Pencil className="w-2.5 h-2.5 text-sky-400" />
                  <span>Edit Splits</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSplitForm(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Split</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Canvas Workspace Viewport */}
      <div
        className="flex-1 relative overflow-auto p-10 flex items-center justify-center bg-[#0a0d14]"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedItemId(null);
          }
        }}
      >
        <div
          className="relative flex items-center"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItemId(null);
            }
          }}
        >
          {/* Off-Stage Tech Zone (Stage Right = Left) */}
          {techZone?.enabled && techZone.location === 'SR' && (
            <div
              className="mr-3 border border-dashed border-amber-400/50 bg-[#11151d]/90 text-amber-200/90 p-2 text-center flex flex-col items-center justify-center shadow-lg rounded-xs"
              style={{
                width: `${Math.min(96, 74 * zoomLevel)}px`,
                height: `${Math.min(340, 240 * zoomLevel)}px`,
              }}
            >
              <div className="[writing-mode:vertical-lr] rotate-180 text-[9px] font-mono font-bold uppercase tracking-widest">
                {techZone.label}
              </div>
            </div>
          )}

          {/* Main Dark CAD Stage Deck (BFD-inspired precision grid) */}
          <div
            ref={stageContainerRef}
            onDrop={handleStageDrop}
            onDragOver={handleStageDragOver}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedItemId(null);
              }
            }}
            className="relative bg-[#11151d] border-2 border-slate-600/80 shadow-[0_20px_70px_rgba(0,0,0,0.75)] transition-transform duration-75 select-none"
            style={{
              width: `${Math.min(1050, 820 * zoomLevel)}px`,
              height: `${Math.min(1050, (820 / stageAspectRatio) * zoomLevel)}px`,
              aspectRatio: `${stageAspectRatio}`,
            }}
          >
            {/* Dimension Arrows along Stage Boundary */}
            {showRulers && (
              <>
                {/* Top Width Dimension Arrow */}
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-full flex items-center px-1">
                    <div className="w-2 h-2 border-t-2 border-l-2 border-slate-400 rotate-[-45deg]" />
                    <div className="flex-1 h-px bg-slate-500/80" />
                    <div className="px-2 py-0.5 font-mono text-[10px] font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xs">
                      {widthFeet}&apos;-0&quot;
                    </div>
                    <div className="flex-1 h-px bg-slate-500/80" />
                    <div className="w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-[45deg]" />
                  </div>
                </div>

                {/* Right Depth Dimension Arrow */}
                <div className="absolute -right-8 top-0 bottom-0 flex items-center justify-center pointer-events-none [writing-mode:vertical-lr]">
                  <div className="relative h-full flex items-center py-1">
                    <div className="w-2 h-2 border-t-2 border-l-2 border-slate-400 rotate-[45deg]" />
                    <div className="flex-1 w-px bg-slate-500/80" />
                    <div className="py-1.5 px-0.5 font-mono text-[10px] font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xs rotate-90">
                      {depthFeet}&apos;-0&quot;
                    </div>
                    <div className="flex-1 w-px bg-slate-500/80" />
                    <div className="w-2 h-2 border-b-2 border-l-2 border-slate-400 rotate-[-45deg]" />
                  </div>
                </div>

                {/* Centerline vertical line from Upstage to Downstage */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-sky-400/50 pointer-events-none" />

                {/* Dynamic Foot Ticks along Downstage Apron */}
                {horizontalTicks.map((tick) => (
                  <div
                    key={tick.offsetFt}
                    className="absolute -bottom-5 -translate-x-1/2 pointer-events-none flex flex-col items-center"
                    style={{ left: `${tick.pct}%` }}
                  >
                    <div className="w-px h-1.5 bg-slate-500 mb-0.5" />
                    <span
                      className={`font-mono text-[9px] ${
                        tick.offsetFt === 0
                          ? 'px-1.5 py-0 rounded-xs bg-sky-500/20 border border-sky-500/50 text-sky-300 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {tick.label}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* Minor 1-ft BFD Drafting Grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: `${100 / widthFeet}% ${100 / depthFeet}%`,
              }}
            />

            {/* Major 4-ft BFD Drafting Grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)
                `,
                backgroundSize: `${(4 * 100) / widthFeet}% ${(4 * 100) / depthFeet}%`,
              }}
            />

            {/* Stage Orientation Markers */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-mono font-bold text-slate-500/80 pointer-events-none">
              ▲ UPSTAGE (REAR)
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-mono font-bold text-slate-500/80 pointer-events-none">
              ▼ DOWNSTAGE / FOH
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest font-mono font-bold text-slate-600/80 pointer-events-none [writing-mode:vertical-lr] rotate-180">
              STAGE RIGHT
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest font-mono font-bold text-slate-600/80 pointer-events-none [writing-mode:vertical-lr]">
              STAGE LEFT
            </div>

            {/* Color-Coded Signal Path Conduit Lines Overlay */}
            {showSignalPaths && (
              <>
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 5 }}
                >
                  {project.items.map((srcItem) => {
                    if (!srcItem.routeToItemId) return null;
                    const dstItem = project.items.find((it) => it.id === srcItem.routeToItemId);
                    if (!dstItem) return null;

                    const group = findSignalGroup(
                      project,
                      srcItem.signalGroupId || dstItem.signalGroupId,
                      srcItem.subSnakeLabel || dstItem.subSnakeLabel
                    );
                    const color = group?.color || '#38bdf8';
                    const isMatch =
                      !activeSignalFilter ||
                      srcItem.signalGroupId === activeSignalFilter ||
                      dstItem.signalGroupId === activeSignalFilter;
                    const midX = (srcItem.x + dstItem.x) / 2;
                    const d = `M ${srcItem.x} ${srcItem.y} L ${midX} ${srcItem.y} L ${midX} ${dstItem.y} L ${dstItem.x} ${dstItem.y}`;
                    const dash =
                      group?.splitType === 'dante_network'
                        ? '1.6 1.1'
                        : group?.splitType === 'rf_iem'
                        ? '0.9 0.9'
                        : undefined;
                    const strokeW = group?.splitType === 'foh_mon_split' ? 0.55 : 0.38;

                    return (
                      <g key={`route_${srcItem.id}_${dstItem.id}`} opacity={isMatch ? 0.88 : 0.14}>
                        <path
                          d={d}
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeW}
                          strokeDasharray={dash}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx={srcItem.x} cy={srcItem.y} r="0.65" fill={color} />
                        <circle cx={dstItem.x} cy={dstItem.y} r="0.85" fill="none" stroke={color} strokeWidth="0.35" />
                      </g>
                    );
                  })}
                </svg>

                {/* Upright Midpoint Split Badges (HTML so text never distorts with stage aspect) */}
                {project.items.map((srcItem) => {
                  if (!srcItem.routeToItemId) return null;
                  const dstItem = project.items.find((it) => it.id === srcItem.routeToItemId);
                  if (!dstItem) return null;

                  const group = findSignalGroup(
                    project,
                    srcItem.signalGroupId || dstItem.signalGroupId,
                    srcItem.subSnakeLabel || dstItem.subSnakeLabel
                  );
                  const code = group?.shortCode || srcItem.subSnakeLabel;
                  if (!code) return null;

                  const color = group?.color || '#38bdf8';
                  const isMatch =
                    !activeSignalFilter ||
                    srcItem.signalGroupId === activeSignalFilter ||
                    dstItem.signalGroupId === activeSignalFilter;
                  const midX = (srcItem.x + dstItem.x) / 2;
                  const midY = (srcItem.y + dstItem.y) / 2;

                  return (
                    <div
                      key={`route_lbl_${srcItem.id}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-1 py-0 rounded-xs bg-slate-950/90 text-[8px] font-mono font-bold pointer-events-none whitespace-nowrap transition-opacity ${
                        isMatch ? 'opacity-95' : 'opacity-20'
                      }`}
                      style={{
                        left: `${midX}%`,
                        top: `${midY}%`,
                        border: `1px solid ${color}`,
                        color,
                        zIndex: 6,
                      }}
                    >
                      {code}
                    </div>
                  );
                })}
              </>
            )}

            {/* Stage Items */}
            {project.items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const widthPercent = (item.width / widthFeet) * 100;
              const heightPercent = (item.height / depthFeet) * 100;
              const itemGroup = findSignalGroup(project, item.signalGroupId, item.subSnakeLabel);
              const linkedChannels = getLinkedChannelsForItem(item, project.channels);
              const linkedMonitors = getLinkedMonitorsForItem(item, project.monitors);
              const defaultGearLabel = allGearDefinitions[item.type]?.label;
              const dimmed =
                !!activeSignalFilter &&
                item.signalGroupId !== activeSignalFilter &&
                itemGroup?.id !== activeSignalFilter;
              const rotateHandleOnLeft =
                item.labelAlignV === 'middle' && item.labelAlignH === 'right';

              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute cursor-move ${
                    item.locked ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 20 : item.type.includes('riser') ? 1 : 10,
                  }}
                >
                  <StageItemRenderer
                    item={item}
                    isSelected={isSelected}
                    theme="dark"
                    signalGroup={itemGroup}
                    showSignalBadge={showSignalPaths}
                    dimmed={dimmed}
                    linkedChannels={linkedChannels}
                    linkedMonitors={linkedMonitors}
                    defaultGearLabel={defaultGearLabel}
                  />

                  {/* Interactive Rotation Knob (avoids collision with labels & badges) */}
                  {isSelected && !item.locked && (
                    <div
                      onPointerDown={(e) => handleRotateHandleDown(e, item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute ${
                        rotateHandleOnLeft ? '-left-7' : '-right-7'
                      } top-1/2 -translate-y-1/2 w-5 h-5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg border-2 border-slate-950 z-30`}
                      title="Drag to rotate gear (Shift snaps 45°)"
                    >
                      <RotateCw className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Off-Stage Tech Zone (Stage Left = Right) */}
          {techZone?.enabled && techZone.location === 'SL' && (
            <div
              className="ml-3 border border-dashed border-amber-400/50 bg-[#11151d]/90 text-amber-200/90 p-2 text-center flex flex-col items-center justify-center shadow-lg rounded-xs"
              style={{
                width: `${Math.min(96, 74 * zoomLevel)}px`,
                height: `${Math.min(340, 240 * zoomLevel)}px`,
              }}
            >
              <div className="[writing-mode:vertical-lr] text-[9px] font-mono font-bold uppercase tracking-widest">
                {techZone.label}
              </div>
            </div>
          )}
        </div>

        {/* Selected Item Inspector Panel */}
        <StageItemControls />
      </div>

      {/* Stage Bottom Status Strip */}
      <div className="h-8 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>{project.items.length} Elements on Stage</span>
          <span>·</span>
          <span>{project.channels.length} Console Patch Inputs</span>
          <span>·</span>
          <span>{project.monitors.length} Monitor Aux Sends</span>
          {selectedCoordsLabel && (
            <>
              <span>·</span>
              <span className="font-mono text-sky-300">{selectedCoordsLabel}</span>
            </>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500">
          <span>Shortcuts: [R] Rotate · [Del] Remove · [Arrows] Nudge · [Esc] Deselect</span>
        </div>
      </div>

      <SplitEditorModal
        isOpen={editingSplitTarget !== null}
        initialGroupId={editingSplitTarget}
        onClose={() => setEditingSplitTarget(null)}
        onGroupDeleted={(deletedId) => {
          if (activeSignalFilter === deletedId) {
            setActiveSignalFilter(null);
          }
        }}
      />
    </div>
  );
};
