/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useStage } from '../../context/StageContext';
import { StageItemRenderer } from '../StagePlot/StageItemRenderer';
import { exportRiderToPDF, PdfExportOptions } from '../../utils/pdfExporter';
import { PdfExportModal } from './PdfExportModal';
import { DEFAULT_SIGNAL_GROUPS } from '../../data/gearLibrary';
import {
  computeStagePowerSummary,
  findSignalGroup,
  getLinkedChannelsForItem,
  getLinkedMonitorsForItem,
  hasPatchSequenceGaps,
} from '../../utils/stageRouting';
import { ProductionContact } from '../../types/stage';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileJson,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';

function formatCrewStatusLabel(contact: ProductionContact): string {
  const qty = contact.quantity && contact.quantity > 1 ? ` (×${contact.quantity})` : '';
  if (contact.status === 'needed_from_venue') return `Venue Needed${qty}`;
  if (contact.status === 'tbd') return `TBD${qty}`;
  return `Touring${qty}`;
}

export const RiderDocument: React.FC = () => {
  const { project, exportProjectJSON, setActiveTab, allGearDefinitions } = useStage();
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [pageBreakBetween, setPageBreakBetween] = useState<boolean>(false);
  const [includeStageDimensions, setIncludeStageDimensions] = useState<boolean>(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const showSignalPaths = project.showSignalPaths !== false;
  const signalGroups =
    project.signalGroups && project.signalGroups.length > 0
      ? project.signalGroups
      : DEFAULT_SIGNAL_GROUPS;
  const powerSummary = useMemo(() => computeStagePowerSummary(project), [project]);

  const activeChannels = useMemo(
    () =>
      project.channels.filter(
        (ch) =>
          ch.name.trim() !== '' ||
          ch.micOrDI.trim() !== '' ||
          (ch.notes || '').trim() !== ''
      ),
    [project.channels]
  );

  const activeMonitors = useMemo(
    () =>
      project.monitors.filter(
        (m) => m.performer.trim() !== '' || m.location.trim() !== ''
      ),
    [project.monitors]
  );

  const activeContacts = useMemo(
    () =>
      project.contacts.filter(
        (c) =>
          c.role.trim() !== '' ||
          c.name.trim() !== '' ||
          c.phone.trim() !== '' ||
          c.email.trim() !== ''
      ),
    [project.contacts]
  );

  const activeSignalGroups = useMemo(() => {
    return signalGroups.filter(
      (g) =>
        project.items.some(
          (it) => it.signalGroupId === g.id || it.subSnakeLabel === g.shortCode
        ) ||
        activeChannels.some(
          (ch) => ch.signalGroupId === g.id || ch.subSnake === g.shortCode
        )
    );
  }, [signalGroups, project.items, activeChannels]);

  const { widthFeet, depthFeet } = project.stageDimensions;
  const stageAspectRatio = widthFeet / depthFeet;

  // Dynamic symmetrical foot ruler ticks every 4ft outward from center 0'0"
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

  const handleConfirmPDF = async (options: PdfExportOptions) => {
    setExportError(null);
    setOrientation(options.orientation);
    setPageBreakBetween(options.pageBreakBetweenPlotAndChannels);
    setIncludeStageDimensions(options.includeStageDimensions !== false);
    setIsExportingPdf(true);
    try {
      await exportRiderToPDF(project, options);
      setShowExportModal(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'PDF generation failed.');
      setShowExportModal(false);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Channel',
      'Source / Input',
      'Transducer (Mic/DI)',
      'Connector',
      'Stand',
      '48v',
      'Location',
      'Sub-Snake',
      'Notes',
    ];

    const rows = activeChannels.map((ch) => [
      ch.channelNumber,
      `"${ch.name.replace(/"/g, '""')}"`,
      `"${ch.micOrDI.replace(/"/g, '""')}"`,
      `"${(ch.connector || 'XLR').replace(/"/g, '""')}"`,
      ch.standType,
      ch.phantom48V ? '*' : '',
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
      `${(project.artistName || 'StagePlot').replace(/\s+/g, '_')}_Patch_Sheet.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = exportProjectJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(project.artistName || 'StagePlot').replace(/\s+/g, '_')}_StagePlot.stagecraft.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const techZone = project.techZone;

  const renderStagePlotDiagram = () => (
    <div>
      <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
          Stage Plot Diagram
        </h2>
        {includeStageDimensions && (
          <span className="font-mono text-[10px] font-bold text-slate-600">
            {widthFeet}&apos;-0&quot; W × {depthFeet}&apos;-0&quot; D
          </span>
        )}
      </div>

      <div
        className={`relative flex items-center justify-center my-4 px-4 ${
          includeStageDimensions ? 'pt-6 pb-5' : 'pt-2 pb-2'
        }`}
      >
        {techZone?.enabled && techZone.location === 'SR' && (
          <div className="mr-3 border-2 border-dashed border-slate-400 bg-slate-50 p-2 text-center flex flex-col items-center justify-center h-48 w-16 md:w-20 shrink-0">
            <div className="[writing-mode:vertical-lr] rotate-180 text-[9px] font-black uppercase tracking-wider text-slate-800">
              {techZone.label}
            </div>
          </div>
        )}

        <div
          className="relative bg-white border-2 border-slate-950 w-full max-w-[900px] shadow-xs select-none"
          style={{ aspectRatio: `${stageAspectRatio}` }}
        >
          {includeStageDimensions && (
            <>
              {/* Top Dimension Arrow */}
              <div className="absolute -top-6 left-0 right-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-full flex items-center px-1">
                  <div className="w-1.5 h-1.5 border-t-2 border-l-2 border-slate-900 rotate-[-45deg]" />
                  <div className="flex-1 h-px bg-slate-900" />
                  <div className="px-1.5 font-mono text-[10px] font-black text-slate-950 bg-white">
                    {widthFeet}&apos;-0&quot;
                  </div>
                  <div className="flex-1 h-px bg-slate-900" />
                  <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-slate-900 rotate-[45deg]" />
                </div>
              </div>

              {/* Right Depth Arrow */}
              <div className="absolute -right-7 top-0 bottom-0 flex items-center justify-center pointer-events-none [writing-mode:vertical-lr]">
                <div className="relative h-full flex items-center py-1">
                  <div className="w-1.5 h-1.5 border-t-2 border-l-2 border-slate-900 rotate-[45deg]" />
                  <div className="flex-1 w-px bg-slate-900" />
                  <div className="py-1 font-mono text-[10px] font-black text-slate-950 bg-white rotate-90">
                    {depthFeet}&apos;-0&quot;
                  </div>
                  <div className="flex-1 w-px bg-slate-900" />
                  <div className="w-1.5 h-1.5 border-b-2 border-l-2 border-slate-900 rotate-[-45deg]" />
                </div>
              </div>
            </>
          )}

          {/* Light Drafting Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
              `,
              backgroundSize: `${(4 * 100) / widthFeet}% ${(4 * 100) / depthFeet}%`,
            }}
          />

          {/* Vertical Centerline */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-red-500/80 pointer-events-none" />

          {/* Dynamic Foot Ticks */}
          {includeStageDimensions &&
            horizontalTicks.map((tick) => (
              <div
                key={tick.offsetFt}
                className="absolute -bottom-5 -translate-x-1/2 pointer-events-none flex flex-col items-center"
                style={{ left: `${tick.pct}%` }}
              >
                <div className="w-px h-1.5 bg-slate-900 mb-0.5" />
                <span
                  className={`font-mono text-[8.5px] ${
                    tick.offsetFt === 0
                      ? 'px-1 bg-slate-950 text-white font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {tick.label}
                </span>
              </div>
            ))}

          {/* Orientation Markers */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 pointer-events-none">
            ▲ UPSTAGE
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 pointer-events-none">
            ▼ DOWNSTAGE / FOH
          </div>

          {/* Color-Coded Signal Paths Overlay */}
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
                  const grp = findSignalGroup(
                    project,
                    srcItem.signalGroupId || dstItem.signalGroupId,
                    srcItem.subSnakeLabel || dstItem.subSnakeLabel
                  );
                  const color = grp?.color || '#0284c7';
                  const midX = (srcItem.x + dstItem.x) / 2;
                  const d = `M ${srcItem.x} ${srcItem.y} L ${midX} ${srcItem.y} L ${midX} ${dstItem.y} L ${dstItem.x} ${dstItem.y}`;
                  const dash =
                    grp?.splitType === 'dante_network'
                      ? '1.6 1.1'
                      : grp?.splitType === 'rf_iem'
                      ? '0.9 0.9'
                      : undefined;
                  return (
                    <g key={`print_route_${srcItem.id}_${dstItem.id}`} opacity={0.85}>
                      <path
                        d={d}
                        fill="none"
                        stroke={color}
                        strokeWidth={grp?.splitType === 'foh_mon_split' ? 0.55 : 0.38}
                        strokeDasharray={dash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx={srcItem.x} cy={srcItem.y} r="0.6" fill={color} />
                    </g>
                  );
                })}
              </svg>
              {project.items.map((srcItem) => {
                if (!srcItem.routeToItemId) return null;
                const dstItem = project.items.find((it) => it.id === srcItem.routeToItemId);
                if (!dstItem) return null;
                const grp = findSignalGroup(
                  project,
                  srcItem.signalGroupId || dstItem.signalGroupId,
                  srcItem.subSnakeLabel || dstItem.subSnakeLabel
                );
                const code = grp?.shortCode || srcItem.subSnakeLabel;
                if (!code) return null;
                const color = grp?.color || '#0284c7';
                return (
                  <div
                    key={`print_route_lbl_${srcItem.id}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 px-1 py-0 bg-white text-[7.5px] font-mono font-bold pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${(srcItem.x + dstItem.x) / 2}%`,
                      top: `${(srcItem.y + dstItem.y) / 2}%`,
                      border: `1px solid ${color}`,
                      color: '#0f172a',
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
            const widthPercent = (item.width / widthFeet) * 100;
            const heightPercent = (item.height / depthFeet) * 100;
            const itemGrp = findSignalGroup(project, item.signalGroupId, item.subSnakeLabel);
            const linkedChannels = getLinkedChannelsForItem(item, project.channels);
            const linkedMonitors = getLinkedMonitorsForItem(item, project.monitors);
            const defaultGearLabel = allGearDefinitions[item.type]?.label;

            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: item.type.includes('riser') ? 1 : 10,
                }}
              >
                <StageItemRenderer
                  item={item}
                  isSelected={false}
                  theme="print"
                  signalGroup={itemGrp}
                  showSignalBadge={showSignalPaths}
                  linkedChannels={linkedChannels}
                  linkedMonitors={linkedMonitors}
                  defaultGearLabel={defaultGearLabel}
                />
              </div>
            );
          })}
        </div>

        {techZone?.enabled && techZone.location === 'SL' && (
          <div className="ml-3 border-2 border-dashed border-slate-400 bg-slate-50 p-2 text-center flex flex-col items-center justify-center h-48 w-16 md:w-20 shrink-0">
            <div className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-wider text-slate-800">
              {techZone.label}
            </div>
          </div>
        )}
      </div>

      {/* Signal Splits & Power Legend Strip */}
      {(activeSignalGroups.length > 0 || powerSummary.lines.length > 0) && (
        <div className="mt-3 p-2 border border-slate-300 bg-slate-50 rounded-xs flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-800">
          {activeSignalGroups.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-black uppercase tracking-wider text-slate-950">
                Signal Splits:
              </span>
              {activeSignalGroups.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-slate-300 bg-white rounded-xs font-mono"
                >
                  <span
                    className="w-2 h-2 rounded-xs inline-block"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="font-bold">{g.shortCode}</span>
                  <span className="font-sans text-slate-600">{g.name}</span>
                  {g.notes && (
                    <span className="font-sans text-slate-500">({g.notes})</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {powerSummary.lines.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-black uppercase tracking-wider text-slate-950">
                Power Drops ({powerSummary.totalDrops}):
              </span>
              {powerSummary.lines.map((line) => (
                <span
                  key={`${line.connector}_${line.voltage}`}
                  className="px-1.5 py-0.5 border border-slate-300 bg-white rounded-xs font-mono"
                >
                  <span className="font-bold">{line.totalDrops}×</span> {line.connector}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderChannelListTable = () => (
    <div>
      <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
          Input Channel List
        </h2>
        <span className="font-mono text-[10px] text-slate-600">
          {activeChannels.length} Active Input{activeChannels.length === 1 ? '' : 's'}
          {hasPatchSequenceGaps(activeChannels) ? ' (Empty channels omitted)' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse border border-slate-950">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-950 font-bold text-[9.5px] uppercase">
              <th className="py-1.5 px-1.5 w-8 text-center border-r border-slate-950">#</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Source</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Transducer (Mic / DI)</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Connector</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Stand</th>
              <th className="py-1.5 px-1.5 w-10 text-center border-r border-slate-950">48V</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Split</th>
              <th className="py-1.5 px-2 border-r border-slate-950">Location</th>
              <th className="py-1.5 px-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {activeChannels.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-4 text-center text-slate-400 italic">
                  No active input channels patched.
                </td>
              </tr>
            ) : (
              activeChannels.map((ch, idx) => {
                const grp = findSignalGroup(project, ch.signalGroupId, ch.subSnake);
                return (
                  <tr key={ch.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="py-1 px-1.5 text-center font-bold font-mono border-r border-slate-300 align-top">
                      {ch.channelNumber}
                    </td>
                    <td className="py-1 px-2 font-semibold border-r border-slate-300 break-words align-top">
                      {ch.name}
                    </td>
                    <td className="py-1 px-2 border-r border-slate-300 break-words align-top">
                      {ch.micOrDI}
                    </td>
                    <td className="py-1 px-2 font-mono text-[10px] border-r border-slate-300 break-words align-top">
                      {ch.connector || 'XLR'}
                    </td>
                    <td className="py-1 px-2 border-r border-slate-300 break-words align-top">
                      {ch.standType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold font-mono border-r border-slate-300 align-top">
                      {ch.phantom48V ? '48V' : '-'}
                    </td>
                    <td className="py-1 px-2 font-mono text-[10px] border-r border-slate-300 align-top">
                      {grp || ch.subSnake ? (
                        <span className="inline-flex items-center gap-1">
                          {grp && (
                            <span
                              className="w-2 h-2 rounded-xs inline-block shrink-0"
                              style={{ backgroundColor: grp.color }}
                            />
                          )}
                          <span>{grp?.shortCode || ch.subSnake}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-1 px-2 font-mono text-[10px] border-r border-slate-300 break-words align-top">
                      {ch.stageLocation || '-'}
                    </td>
                    <td className="py-1 px-2 text-slate-700 break-words align-top">
                      {ch.notes || ''}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden rider-root">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="no-print p-3 border-b border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Technical Stage Rider &amp; Export Preview
            </h2>
          </div>

          <span className="text-slate-700">|</span>

          {/* Orientation Preview Switcher */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-0.5">Orientation:</span>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                orientation === 'landscape'
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                orientation === 'portrait'
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Portrait
            </button>
          </div>

          {/* Page Break Preview Switcher */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-0.5">Plot &amp; Channels:</span>
            <button
              type="button"
              onClick={() => setPageBreakBetween(false)}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                !pageBreakBetween
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Combined
            </button>
            <button
              type="button"
              onClick={() => setPageBreakBetween(true)}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                pageBreakBetween
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Page Break Between
            </button>
          </div>

          {/* Stage Dimensions Preview Toggle */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-0.5">Dimensions:</span>
            <button
              type="button"
              onClick={() => setIncludeStageDimensions(!includeStageDimensions)}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors whitespace-nowrap ${
                includeStageDimensions
                  ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle stage width/depth dimensions in preview and export"
            >
              {includeStageDimensions ? 'Shown' : 'Hidden'}
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5"
            title="Export Active Channels CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5"
            title="Download JSON Project Backup"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5"
            title="Open Browser Print Dialog"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            disabled={isExportingPdf}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors whitespace-nowrap"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="no-print px-4 py-2 bg-red-950/80 border-b border-red-800 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>PDF Export Error: {exportError}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-red-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Document Preview Viewport */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-900/60 rider-scroll">
        <div
          className={`w-full bg-white text-slate-950 p-6 md:p-9 rounded-xs shadow-2xl border border-slate-300 font-sans select-text h-fit space-y-6 transition-all ${
            orientation === 'landscape' ? 'max-w-[1200px]' : 'max-w-[820px]'
          }`}
        >
          {/* 1. PROMINENT TOP SHOW TITLE & ARTIST HEADER */}
          <div className="border-b-2 border-slate-950 pb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[65%] space-y-0.5">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-950 font-display break-words">
                {project.artistName || 'ARTIST / BAND NAME'}
              </h1>
              <div className="text-sm font-bold text-slate-800 break-words">
                {project.title || 'Technical Stage Plot & Input Patch'}
              </div>
              {project.venueOrTour && (
                <div className="text-xs text-slate-600 font-medium break-words">
                  {project.venueOrTour}
                </div>
              )}
            </div>

            <div className="text-right space-y-1 shrink-0">
              <div className="text-xs font-bold text-slate-900">
                {[project.versionDate || 'Rev 1.0', project.date].filter(Boolean).join(' · ')}
              </div>
              {includeStageDimensions && (
                <div className="text-[11px] font-mono font-bold text-slate-700">
                  STAGE: {widthFeet}&apos;-0&quot; W × {depthFeet}&apos;-0&quot; D
                </div>
              )}
              <div className="text-[10px] font-mono text-slate-600">
                {activeChannels.length} INPUTS · {activeMonitors.length} MON MIXES ·{' '}
                {activeContacts.length} CREW
              </div>
            </div>
          </div>

          {/* 2. STAGE PLOT & CHANNEL LIST (Ordered & Paginated per Selected Option) */}
          {pageBreakBetween ? (
            <>
              {renderStagePlotDiagram()}
              <div className="no-print flex items-center gap-2 py-1 text-[10px] font-mono uppercase tracking-widest text-sky-600">
                <div className="flex-1 border-t border-dashed border-sky-400" />
                <span>Page Break Between Stage Plot &amp; Channel List</span>
                <div className="flex-1 border-t border-dashed border-sky-400" />
              </div>
              <div className="page-break-before">{renderChannelListTable()}</div>
            </>
          ) : (
            <>
              {renderChannelListTable()}
              {renderStagePlotDiagram()}
            </>
          )}

          {/* 3. MONITOR MIX MATRIX */}
          {activeMonitors.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950">
                  Monitor Mix Matrix
                </h2>
                <span className="font-mono text-[10px] text-slate-600">
                  {activeMonitors.length} Active Mixes
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-950">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-950 font-bold text-[9.5px] uppercase">
                      <th className="py-1.5 px-2 w-12 text-center border-r border-slate-950">Mix</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Performer</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Type</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Location</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Output Patch</th>
                      <th className="py-1.5 px-2">Requested Content / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {activeMonitors.map((m, idx) => (
                      <tr key={m.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1 px-2 text-center font-mono font-bold border-r border-slate-300 align-top">
                          M{m.mixNumber}
                        </td>
                        <td className="py-1 px-2 font-semibold border-r border-slate-300 break-words align-top">
                          {m.performer}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-300 align-top">
                          {m.type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-1 px-2 font-mono text-[10px] border-r border-slate-300 break-words align-top">
                          {m.location}
                        </td>
                        <td className="py-1 px-2 font-mono text-[10px] border-r border-slate-300 break-words align-top">
                          {m.outputPatch || '-'}
                        </td>
                        <td className="py-1 px-2 text-slate-700 break-words align-top">
                          {[m.requestedContent, m.notes].filter(Boolean).join(' — ') || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TECHNICAL, AUDIO, MISC & POWER NOTES (Full Auto-Expanding, Zero Clipping) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-900 rounded-xs overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-900 px-2.5 py-1 font-black text-[10px] uppercase tracking-wider text-slate-950">
                Audio Notes
              </div>
              <div className="p-2.5 whitespace-pre-wrap break-words text-[11px] text-slate-800 leading-relaxed">
                {project.audioNotes || 'No audio notes specified.'}
              </div>
            </div>

            <div className="border border-slate-900 rounded-xs overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-900 px-2.5 py-1 font-black text-[10px] uppercase tracking-wider text-slate-950">
                Misc &amp; Staging Notes
              </div>
              <div className="p-2.5 whitespace-pre-wrap break-words text-[11px] text-slate-800 leading-relaxed">
                {project.miscNotes || 'No staging notes specified.'}
              </div>
            </div>

            <div className="border border-slate-900 rounded-xs overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-900 px-2.5 py-1 font-black text-[10px] uppercase tracking-wider text-slate-950">
                Power, Risers &amp; Backline
              </div>
              <div className="p-2.5 whitespace-pre-wrap break-words text-[11px] text-slate-800 leading-relaxed space-y-1">
                <div>
                  <strong>Power Drops:</strong> 120V 20A: {project.powerRequirements.dedicatedDrops120V} · 230V/EU/UK: {project.powerRequirements.dedicatedDrops230V}
                </div>
                {project.powerRequirements.stageRiserSpecs && (
                  <div>
                    <strong>Risers:</strong> {project.powerRequirements.stageRiserSpecs}
                  </div>
                )}
                {project.powerRequirements.backlineNotes && (
                  <div>
                    <strong>Backline:</strong> {project.powerRequirements.backlineNotes}
                  </div>
                )}
                {project.powerRequirements.notes && (
                  <div>
                    <strong>Notes:</strong> {project.powerRequirements.notes}
                  </div>
                )}
              </div>
            </div>

            {project.productionNotes && (
              <div className="border border-slate-900 rounded-xs overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-900 px-2.5 py-1 font-black text-[10px] uppercase tracking-wider text-slate-950">
                  General Production Notes
                </div>
                <div className="p-2.5 whitespace-pre-wrap break-words text-[11px] text-slate-800 leading-relaxed">
                  {project.productionNotes}
                </div>
              </div>
            )}
          </div>

          {/* 5. PRODUCTION CONTACTS & CREW REQUIREMENTS */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Production Contacts &amp; Crew Requirements</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('contacts')}
                className="no-print text-[10px] font-semibold text-sky-700 hover:underline"
              >
                Edit Crew &amp; Contacts →
              </button>
            </div>

            {activeContacts.length === 0 ? (
              <div className="border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                No crew or production contacts defined yet. Open the <strong>Crew &amp; Contacts</strong> tab to add touring contacts and local crew needed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-950">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-950 font-bold text-[9.5px] uppercase">
                      <th className="py-1.5 px-2 border-r border-slate-950">Crew Role / Position</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Dept</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Status / Qty</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Name</th>
                      <th className="py-1.5 px-2 border-r border-slate-950">Phone &amp; Email</th>
                      <th className="py-1.5 px-2">Notes / Call Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {activeContacts.map((c, idx) => (
                      <tr key={c.id || idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1.5 px-2 font-semibold border-r border-slate-300 break-words align-top">
                          {c.role || 'Crew'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] border-r border-slate-300 align-top">
                          {c.department || 'Audio'}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] font-bold border-r border-slate-300 align-top">
                          <span
                            className={
                              c.status === 'needed_from_venue'
                                ? 'text-amber-800'
                                : 'text-slate-900'
                            }
                          >
                            {formatCrewStatusLabel(c)}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 font-medium border-r border-slate-300 break-words align-top">
                          {c.name || (c.status === 'needed_from_venue' ? 'Provided by Venue' : 'TBD')}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] border-r border-slate-300 break-all align-top">
                          {c.phone && <div>{c.phone}</div>}
                          {c.email && <div>{c.email}</div>}
                          {!c.phone && !c.email && '-'}
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 break-words align-top">
                          {c.notes || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Export Options Modal */}
      {showExportModal && (
        <PdfExportModal
          initialOptions={{
            orientation,
            pageBreakBetweenPlotAndChannels: pageBreakBetween,
            paperFormat: 'letter',
            includeStageDimensions,
          }}
          isExporting={isExportingPdf}
          onConfirm={handleConfirmPDF}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
