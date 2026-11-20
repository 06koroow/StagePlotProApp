/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ChannelInput, MonitorMix, SignalGroup, StageItem } from '../../types/stage';
import { buildGearSVGInner, SymbolTheme } from './stageSymbols';
import {
  formatLinkedChannelsLabel,
  formatLinkedMonitorsLabel,
  getPowerShortLabel,
  isPowerGearType,
  resolveStageItemLabel,
} from '../../utils/stageRouting';

interface StageItemRendererProps {
  item: StageItem;
  isSelected: boolean;
  theme?: SymbolTheme;
  signalGroup?: SignalGroup;
  showSignalBadge?: boolean;
  dimmed?: boolean;
  linkedChannels?: ChannelInput[];
  linkedMonitors?: MonitorMix[];
  defaultGearLabel?: string;
}

export const StageItemRenderer: React.FC<StageItemRendererProps> = ({
  item,
  isSelected,
  theme = 'dark',
  signalGroup,
  showSignalBadge = false,
  dimmed = false,
  linkedChannels = [],
  linkedMonitors = [],
  defaultGearLabel,
}) => {
  const {
    type,
    symbolId,
    name,
    performer,
    instrument,
    rotation,
    wedgeLabel,
    subSnakeLabel,
    locked,
    hasCustomLabel,
    labelAlignH = 'center',
  } = item;

  const isWedge = type.includes('wedge');
  const labelAlignV = item.labelAlignV || (isWedge ? 'bottom' : 'top');

  const derivedWedgeLabel = useMemo(() => {
    if (wedgeLabel && wedgeLabel.trim()) return wedgeLabel;
    if (linkedMonitors.length === 1) return `MIX ${linkedMonitors[0].mixNumber}`;
    if (linkedMonitors.length > 1) {
      return `MIX ${linkedMonitors.map((m) => m.mixNumber).join('/')}`;
    }
    return wedgeLabel;
  }, [wedgeLabel, linkedMonitors]);

  const svgInner = useMemo(
    () =>
      buildGearSVGInner(type, {
        name,
        wedgeLabel: derivedWedgeLabel,
        symbolId,
        theme,
      }),
    [type, symbolId, name, derivedWedgeLabel, theme]
  );

  const isRiser = type.includes('riser') || symbolId === 'stock_riser_platform';
  const isPowerItem = isPowerGearType(type);
  const isConnectorItem =
    type.startsWith('conn_') || (symbolId ? symbolId.startsWith('stock_conn_') : false);

  const { primary: resolvedPrimary } = useMemo(
    () => resolveStageItemLabel(item, linkedChannels, defaultGearLabel, linkedMonitors),
    [item, linkedChannels, defaultGearLabel, linkedMonitors]
  );

  const channelsLabel = useMemo(
    () => formatLinkedChannelsLabel(linkedChannels),
    [linkedChannels]
  );

  const monitorsLabel = useMemo(
    () => formatLinkedMonitorsLabel(linkedMonitors),
    [linkedMonitors]
  );

  // For floor wedges that already display their callout inside the SVG graphic,
  // avoid duplicating the generic wedge name when no custom label/performer/channels are set.
  const suppressRedundantWedgePrimary =
    isWedge && !hasCustomLabel && !performer && linkedChannels.length === 0 && linkedMonitors.length > 0;
  const displayPrimary = suppressRedundantWedgePrimary ? '' : resolvedPrimary;

  // Show outer label whenever linked channels or linked outputs exist or a custom label/performer is set;
  // otherwise keep compact utility items (power/wedges/risers/connectors) clean.
  const hideOuterLabel =
    linkedChannels.length === 0 &&
    linkedMonitors.length === 0 &&
    !hasCustomLabel &&
    ((isPowerItem && !performer) ||
      (isConnectorItem && !performer) ||
      isWedge ||
      type.includes('teleprompter') ||
      isRiser);

  const showLabelBlock =
    !hideOuterLabel && Boolean(displayPrimary || instrument || channelsLabel || monitorsLabel);

  const powerLabel = !isPowerItem ? getPowerShortLabel(item) : '';
  const splitCode = showSignalBadge ? signalGroup?.shortCode || subSnakeLabel || '' : '';
  const splitColor = signalGroup?.color || '#38bdf8';
  const hasAddonBadges = Boolean(powerLabel || splitCode);

  // Word/Excel-style 9-point alignment relative to the stage object
  const getLabelPositionClass = (): string => {
    if (labelAlignV === 'top') {
      if (labelAlignH === 'left') return 'bottom-full mb-1.5 left-0 text-left';
      if (labelAlignH === 'right') return 'bottom-full mb-1.5 right-0 text-right';
      return 'bottom-full mb-1.5 left-1/2 -translate-x-1/2 text-center';
    }
    if (labelAlignV === 'bottom') {
      if (labelAlignH === 'left') return 'top-full mt-1.5 left-0 text-left';
      if (labelAlignH === 'right') return 'top-full mt-1.5 right-0 text-right';
      return 'top-full mt-1.5 left-1/2 -translate-x-1/2 text-center';
    }
    // middle
    if (labelAlignH === 'left') return 'right-full mr-2 top-1/2 -translate-y-1/2 text-right';
    if (labelAlignH === 'right') return 'left-full ml-2 top-1/2 -translate-y-1/2 text-left';
    return 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center';
  };

  const getInnerFlexAlign = (): string => {
    if (labelAlignV === 'middle') {
      if (labelAlignH === 'left') return 'items-end';
      if (labelAlignH === 'right') return 'items-start';
      return 'items-center';
    }
    if (labelAlignH === 'left') return 'items-start';
    if (labelAlignH === 'right') return 'items-end';
    return 'items-center';
  };

  // Place Power & Split badges opposite the label when label is aligned to bottom so they never overlap
  const addonStripPositionClass =
    showLabelBlock && labelAlignV === 'bottom'
      ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
      : 'top-full mt-1.5 left-1/2 -translate-x-1/2';

  const isOverlayCenter = labelAlignV === 'middle' && labelAlignH === 'center';

  return (
    <div
      className={`relative select-none w-full h-full transition-opacity duration-150 ${
        dimmed ? 'opacity-30' : 'opacity-100'
      } ${
        isSelected
          ? 'ring-1 ring-sky-400 ring-offset-2 ring-offset-[#11151d] rounded-xs'
          : ''
      }`}
    >
      {/* Rotated CAD SVG Graphics Only (keeps labels & add-ons upright and collision-free) */}
      <div
        className="w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          preserveAspectRatio={isRiser ? 'none' : 'xMidYMid meet'}
          dangerouslySetInnerHTML={{ __html: svgInner }}
        />
      </div>

      {/* Upright Architectural Label — Positioned per 3×3 alignment (Left/Center/Right × Top/Middle/Bottom) */}
      {showLabelBlock && (
        <div
          className={`absolute whitespace-nowrap pointer-events-none z-20 ${getLabelPositionClass()}`}
        >
          <div
            className={`inline-flex flex-col ${getInnerFlexAlign()} px-1.5 py-0.5 rounded-xs ${
              theme === 'dark'
                ? isOverlayCenter
                  ? 'bg-[#0b0f17]/95 border border-slate-700 shadow-md'
                  : 'bg-[#0b0f17]/88 border border-slate-800/80 shadow-xs'
                : isOverlayCenter
                ? 'bg-white/95 border border-slate-300 shadow-xs'
                : 'bg-white/92'
            }`}
          >
            {displayPrimary && (
              <div
                className={`text-[10px] font-bold tracking-tight leading-tight flex items-center gap-1 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {locked && <span className="text-amber-400 text-[9px]">[LOCK]</span>}
                <span>{displayPrimary}</span>
              </div>
            )}
            {instrument && (
              <div
                className={`text-[8.5px] font-medium leading-tight ${
                  theme === 'dark' ? 'text-sky-300/90' : 'text-slate-600'
                }`}
              >
                {instrument}
              </div>
            )}
            {channelsLabel && (
              <div
                className={`text-[8px] font-mono font-bold leading-tight mt-0.5 ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-sky-800'
                }`}
              >
                {channelsLabel}
              </div>
            )}
            {monitorsLabel && (
              <div
                className={`text-[8px] font-mono font-bold leading-tight mt-0.5 ${
                  theme === 'dark' ? 'text-violet-300' : 'text-violet-800'
                }`}
              >
                {monitorsLabel}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unified Non-Overlapping Add-on Strip (Power Drop + Color-Coded Split) */}
      {hasAddonBadges && (
        <div
          className={`absolute ${addonStripPositionClass} flex items-center justify-center gap-1 pointer-events-none whitespace-nowrap z-20`}
        >
          {powerLabel && (
            <span
              className={`px-1 py-0 rounded-xs text-[8px] font-mono font-bold leading-tight flex items-center gap-0.5 ${
                theme === 'dark'
                  ? 'bg-[#1a1306]/95 border border-amber-400/75 text-amber-300 shadow-xs'
                  : 'bg-amber-50/95 border border-amber-600 text-amber-950'
              }`}
              title={`Power: ${item.powerSpec?.connector || powerLabel}`}
            >
              <span>⚡</span>
              <span>{powerLabel}</span>
            </span>
          )}

          {splitCode && (
            <span
              className={`px-1 py-0 rounded-xs text-[8px] font-mono font-bold leading-tight flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-950/95 text-slate-100 shadow-xs'
                  : 'bg-white/95 text-slate-950'
              }`}
              style={{ border: `1px solid ${splitColor}` }}
              title={signalGroup ? `${signalGroup.name} (${signalGroup.shortCode})` : splitCode}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: splitColor }}
              />
              <span>{splitCode}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
