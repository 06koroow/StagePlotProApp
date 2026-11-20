/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import {
  StageProject,
  StageItem,
  ChannelInput,
  ProductionContact,
} from '../types/stage';
import { buildGearSVGInner } from '../components/StagePlot/stageSymbols';
import {
  computeStagePowerSummary,
  findSignalGroup,
  formatLinkedChannelsLabel,
  formatLinkedMonitorsLabel,
  getLinkedChannelsForItem,
  getLinkedMonitorsForItem,
  getPowerShortLabel,
  hasPatchSequenceGaps,
  isPowerGearType,
  resolveStageItemLabel,
} from './stageRouting';
import { DEFAULT_SIGNAL_GROUPS, GEAR_DEFINITIONS } from '../data/gearLibrary';

export interface PdfExportOptions {
  orientation: 'landscape' | 'portrait';
  pageBreakBetweenPlotAndChannels: boolean;
  paperFormat?: 'letter' | 'a4';
  includeStageDimensions?: boolean;
}

function isChannelActive(ch: ChannelInput): boolean {
  return (
    (ch.name || '').trim() !== '' ||
    (ch.micOrDI || '').trim() !== '' ||
    (ch.notes || '').trim() !== ''
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatStand(standType: string): string {
  return standType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCrewStatus(contact: ProductionContact): string {
  const qty = contact.quantity && contact.quantity > 1 ? ` (×${contact.quantity})` : '';
  switch (contact.status) {
    case 'needed_from_venue':
      return `Venue Needed${qty}`;
    case 'tbd':
      return `TBD${qty}`;
    default:
      return `Touring${qty}`;
  }
}

/**
 * Renders the Stage Plot in high-contrast architectural print mode as a self-contained SVG
 * with generous outer padding so labels and bottom badges near stage edges never clip.
 */
async function renderStagePlotToDataURL(
  project: StageProject,
  includeStageDimensions = true
): Promise<{ dataUrl: string; aspectRatio: number }> {
  const { widthFeet, depthFeet } = project.stageDimensions;
  const stageAspect = widthFeet / depthFeet;

  const techZone = project.techZone;
  const hasTechSR = !!techZone?.enabled && techZone.location === 'SR';
  const hasTechSL = !!techZone?.enabled && techZone.location === 'SL';

  // Normalized stage drawing coordinates with generous outer padding so no label or badge clips
  const stageW = 1400;
  const stageH = Math.round(stageW / stageAspect);

  const hasLeftAlignedSideLabel = project.items.some(
    (it) => it.labelAlignV === 'middle' && it.labelAlignH === 'left'
  );
  const hasRightAlignedSideLabel = project.items.some(
    (it) => it.labelAlignV === 'middle' && it.labelAlignH === 'right'
  );

  const marginTop = includeStageDimensions ? 92 : 66;
  const marginBottom = includeStageDimensions ? 94 : 64;
  const techWidth = 114;
  const techGap = 24;
  const marginLeft =
    (includeStageDimensions ? 90 : 70) +
    (hasLeftAlignedSideLabel ? 44 : 0) +
    (hasTechSR ? techWidth + techGap : 0);
  const marginRight =
    (includeStageDimensions ? 98 : 70) +
    (hasRightAlignedSideLabel ? 44 : 0) +
    (hasTechSL ? techWidth + techGap : 0);

  const totalW = marginLeft + stageW + marginRight;
  const totalH = marginTop + stageH + marginBottom;

  const stageX = marginLeft;
  const stageY = marginTop;

  // Build subtle 1ft & 4ft grid lines
  const gridLines: string[] = [];
  for (let ft = 1; ft < widthFeet; ft++) {
    const gx = (stageX + (ft / widthFeet) * stageW).toFixed(1);
    const isMajor = ft % 4 === 0;
    gridLines.push(
      `<line x1="${gx}" y1="${stageY}" x2="${gx}" y2="${stageY + stageH}" stroke="${
        isMajor ? '#cbd5e1' : '#e2e8f0'
      }" stroke-width="${isMajor ? '1.2' : '0.7'}" />`
    );
  }
  for (let ft = 1; ft < depthFeet; ft++) {
    const gy = (stageY + (ft / depthFeet) * stageH).toFixed(1);
    const isMajor = ft % 4 === 0;
    gridLines.push(
      `<line x1="${stageX}" y1="${gy}" x2="${stageX + stageW}" y2="${gy}" stroke="${
        isMajor ? '#cbd5e1' : '#e2e8f0'
      }" stroke-width="${isMajor ? '1.2' : '0.7'}" />`
    );
  }

  // Dynamic foot ticks along bottom apron (only when stage dimensions are included)
  const ticksSvg: string[] = [];
  if (includeStageDimensions) {
    const step = widthFeet >= 36 ? 6 : 4;
    const half = widthFeet / 2;
    for (let ft = -Math.floor(half / step) * step; ft <= half; ft += step) {
      if (Math.abs(ft) >= half - 0.5 && ft !== 0) continue;
      const tx = stageX + ((half + ft) / widthFeet) * stageW;
      const label = ft === 0 ? "0'0\"" : `${ft > 0 ? '+' : ''}${ft}'`;
      const isCenter = ft === 0;
      ticksSvg.push(`
        <line x1="${tx.toFixed(1)}" y1="${stageY + stageH}" x2="${tx.toFixed(1)}" y2="${
        stageY + stageH + 10
      }" stroke="#0f172a" stroke-width="${isCenter ? '1.8' : '1'}" />
        ${
          isCenter
            ? `<rect x="${(tx - 24).toFixed(1)}" y="${
                stageY + stageH + 14
              }" width="48" height="20" rx="2" fill="#0f172a" />
               <text x="${tx.toFixed(1)}" y="${
                stageY + stageH + 28
              }" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="monospace">${escapeXml(
                label
              )}</text>`
            : `<text x="${tx.toFixed(1)}" y="${
                stageY + stageH + 28
              }" text-anchor="middle" fill="#475569" font-size="13" font-weight="600" font-family="monospace">${escapeXml(
                label
              )}</text>`
        }
      `);
    }
  }

  // Tech Zone Box
  let techSvg = '';
  if (hasTechSR && techZone) {
    const tx = stageX - techGap - techWidth;
    const ty = stageY + stageH * 0.12;
    const th = stageH * 0.76;
    techSvg = `
      <rect x="${tx}" y="${ty}" width="${techWidth}" height="${th}" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="8 5" />
      <text x="${tx + techWidth / 2}" y="${
      ty + th / 2
    }" text-anchor="middle" dominant-baseline="central" fill="#0f172a" font-size="14" font-weight="800" font-family="sans-serif" letter-spacing="1.5" transform="rotate(-90 ${
      tx + techWidth / 2
    } ${ty + th / 2})">${escapeXml(techZone.label.toUpperCase())}</text>
    `;
  } else if (hasTechSL && techZone) {
    const tx = stageX + stageW + techGap;
    const ty = stageY + stageH * 0.12;
    const th = stageH * 0.76;
    techSvg = `
      <rect x="${tx}" y="${ty}" width="${techWidth}" height="${th}" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="8 5" />
      <text x="${tx + techWidth / 2}" y="${
      ty + th / 2
    }" text-anchor="middle" dominant-baseline="central" fill="#0f172a" font-size="14" font-weight="800" font-family="sans-serif" letter-spacing="1.5" transform="rotate(90 ${
      tx + techWidth / 2
    } ${ty + th / 2})">${escapeXml(techZone.label.toUpperCase())}</text>
    `;
  }

  const showSignalPaths = project.showSignalPaths !== false;

  // Color-coded signal routing paths SVG
  const routesSvg = showSignalPaths
    ? project.items
        .map((srcItem) => {
          if (!srcItem.routeToItemId) return '';
          const dstItem = project.items.find((it) => it.id === srcItem.routeToItemId);
          if (!dstItem) return '';

          const grp = findSignalGroup(
            project,
            srcItem.signalGroupId || dstItem.signalGroupId,
            srcItem.subSnakeLabel || dstItem.subSnakeLabel
          );
          const color = grp?.color || '#0284c7';
          const sx = stageX + (srcItem.x / 100) * stageW;
          const sy = stageY + (srcItem.y / 100) * stageH;
          const dx = stageX + (dstItem.x / 100) * stageW;
          const dy = stageY + (dstItem.y / 100) * stageH;
          const midX = (sx + dx) / 2;
          const midY = (sy + dy) / 2;

          const dash =
            grp?.splitType === 'dante_network'
              ? '10 6'
              : grp?.splitType === 'rf_iem'
              ? '5 5'
              : '';
          const strokeW = grp?.splitType === 'foh_mon_split' ? '3.4' : '2.4';
          const code = grp?.shortCode || srcItem.subSnakeLabel || '';
          const badgeW = Math.max(38, code.length * 7.5 + 12);

          return `
            <g opacity="0.9">
              <path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${midX.toFixed(1)} ${sy.toFixed(1)} L ${midX.toFixed(1)} ${dy.toFixed(1)} L ${dx.toFixed(1)} ${dy.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${strokeW}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.5" fill="${color}" />
              <circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="6" fill="#ffffff" stroke="${color}" stroke-width="2.2" />
              ${
                code
                  ? `<rect x="${(midX - badgeW / 2).toFixed(1)}" y="${(midY - 9).toFixed(1)}" width="${badgeW.toFixed(1)}" height="18" rx="2" fill="#ffffff" stroke="${color}" stroke-width="1.4" />
                     <text x="${midX.toFixed(1)}" y="${(midY + 4).toFixed(1)}" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="800" font-family="monospace">${escapeXml(code)}</text>`
                  : ''
              }
            </g>
          `;
        })
        .join('\n')
    : '';

  // Sort items: risers first so equipment draws on top
  const sortedItems = [...project.items].sort((a, b) => {
    const aRiser = a.type.includes('riser') || a.symbolId === 'stock_riser_platform' ? 0 : 1;
    const bRiser = b.type.includes('riser') || b.symbolId === 'stock_riser_platform' ? 0 : 1;
    return aRiser - bRiser;
  });

  const itemsSvg = sortedItems
    .map((item: StageItem) => {
      const cx = stageX + (item.x / 100) * stageW;
      const cy = stageY + (item.y / 100) * stageH;
      const iw = (item.width / widthFeet) * stageW;
      const ih = (item.height / depthFeet) * stageH;
      const isRiser = item.type.includes('riser') || item.symbolId === 'stock_riser_platform';

      const linkedChannels = getLinkedChannelsForItem(item, project.channels);
      const linkedMonitors = getLinkedMonitorsForItem(item, project.monitors);
      const isWedge = item.type.includes('wedge');

      const derivedWedgeLabel =
        item.wedgeLabel && item.wedgeLabel.trim()
          ? item.wedgeLabel
          : linkedMonitors.length === 1
          ? `MIX ${linkedMonitors[0].mixNumber}`
          : linkedMonitors.length > 1
          ? `MIX ${linkedMonitors.map((m) => m.mixNumber).join('/')}`
          : item.wedgeLabel;

      const inner = buildGearSVGInner(item.type, {
        name: item.name,
        wedgeLabel: derivedWedgeLabel,
        symbolId: item.symbolId,
        theme: 'print',
      });

      const isPowerItem = isPowerGearType(item.type);
      const isConnectorItem =
        item.type.startsWith('conn_') ||
        (item.symbolId ? item.symbolId.startsWith('stock_conn_') : false);

      const defaultGearLabel =
        project.customGearDefinitions?.[item.type]?.label || GEAR_DEFINITIONS[item.type]?.label;
      const { primary: resolvedPrimary } = resolveStageItemLabel(
        item,
        linkedChannels,
        defaultGearLabel,
        linkedMonitors
      );
      const channelsText = formatLinkedChannelsLabel(linkedChannels);
      const monitorsText = formatLinkedMonitorsLabel(linkedMonitors);

      const suppressRedundantWedgePrimary =
        isWedge &&
        !item.hasCustomLabel &&
        !item.performer &&
        linkedChannels.length === 0 &&
        linkedMonitors.length > 0;
      const primary = suppressRedundantWedgePrimary ? '' : resolvedPrimary;

      const hideOuterLabel =
        linkedChannels.length === 0 &&
        linkedMonitors.length === 0 &&
        !item.hasCustomLabel &&
        ((isPowerItem && !item.performer) ||
          (isConnectorItem && !item.performer) ||
          isWedge ||
          item.type.includes('teleprompter') ||
          isRiser);

      const alignH = item.labelAlignH || 'center';
      const alignV = item.labelAlignV || (isWedge ? 'bottom' : 'top');

      const labelLines: Array<{
        text: string;
        size: number;
        weight: number;
        fill: string;
        font: string;
        lineH: number;
      }> = [];
      if (!hideOuterLabel) {
        if (primary) {
          labelLines.push({
            text: primary,
            size: 14,
            weight: 800,
            fill: '#0f172a',
            font: 'sans-serif',
            lineH: 16,
          });
        }
        if (item.instrument) {
          labelLines.push({
            text: item.instrument,
            size: 11.5,
            weight: 600,
            fill: '#475569',
            font: 'sans-serif',
            lineH: 13.5,
          });
        }
        if (channelsText) {
          labelLines.push({
            text: channelsText,
            size: 10.5,
            weight: 700,
            fill: '#0369a1',
            font: 'monospace',
            lineH: 13,
          });
        }
        if (monitorsText) {
          labelLines.push({
            text: monitorsText,
            size: 10.5,
            weight: 700,
            fill: '#6d28d9',
            font: 'monospace',
            lineH: 13,
          });
        }
      }

      const showLabelBlock = labelLines.length > 0;
      let labelSvg = '';

      if (showLabelBlock) {
        const blockH = labelLines.reduce((sum, l) => sum + l.lineH, 0);
        const maxChars = Math.max(...labelLines.map((l) => l.text.length));
        const estBoxW = Math.max(46, maxChars * 7.8 + 14);

        let anchorX = cx;
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        let topY = cy - ih / 2 - 10 - blockH;

        if (alignV === 'top') {
          if (alignH === 'left') {
            anchorX = cx - iw / 2;
            textAnchor = 'start';
          } else if (alignH === 'right') {
            anchorX = cx + iw / 2;
            textAnchor = 'end';
          } else {
            anchorX = cx;
            textAnchor = 'middle';
          }
          topY = cy - ih / 2 - 10 - blockH;
        } else if (alignV === 'bottom') {
          if (alignH === 'left') {
            anchorX = cx - iw / 2;
            textAnchor = 'start';
          } else if (alignH === 'right') {
            anchorX = cx + iw / 2;
            textAnchor = 'end';
          } else {
            anchorX = cx;
            textAnchor = 'middle';
          }
          topY = cy + ih / 2 + 8;
        } else {
          // middle
          if (alignH === 'left') {
            anchorX = cx - iw / 2 - 10;
            textAnchor = 'end';
          } else if (alignH === 'right') {
            anchorX = cx + iw / 2 + 10;
            textAnchor = 'start';
          } else {
            anchorX = cx;
            textAnchor = 'middle';
          }
          topY = cy - blockH / 2;
        }

        const isOverlayCenter = alignV === 'middle' && alignH === 'center';
        const backdropRect = isOverlayCenter
          ? `<rect x="${(anchorX - estBoxW / 2).toFixed(1)}" y="${(topY - 3).toFixed(
              1
            )}" width="${estBoxW.toFixed(1)}" height="${(blockH + 6).toFixed(
              1
            )}" rx="3" fill="#ffffff" fill-opacity="0.94" stroke="#cbd5e1" stroke-width="1" />`
          : '';

        let curY = topY;
        const linesMarkup = labelLines
          .map((line) => {
            const baselineY = curY + line.size * 0.88;
            curY += line.lineH;
            return `<text x="${anchorX.toFixed(1)}" y="${baselineY.toFixed(
              1
            )}" text-anchor="${textAnchor}" fill="${line.fill}" stroke="#ffffff" stroke-width="3.2" paint-order="stroke" font-size="${
              line.size
            }" font-weight="${line.weight}" font-family="${line.font}">${escapeXml(
              line.text
            )}</text>`;
          })
          .join('\n');

        labelSvg = `<g>${backdropRect}${linesMarkup}</g>`;
      }

      // Unified non-overlapping add-on badges (Power Drop + Color-Coded Split)
      const powerLabel = !isPowerItem ? getPowerShortLabel(item) : '';
      const itemGrp = findSignalGroup(project, item.signalGroupId, item.subSnakeLabel);
      const splitCode = showSignalPaths ? itemGrp?.shortCode || item.subSnakeLabel || '' : '';
      const splitColor = itemGrp?.color || '#0284c7';

      const badgeParts: Array<{ width: number; render: (bx: number, by: number) => string }> = [];
      if (powerLabel) {
        const pText = `⚡ ${powerLabel}`;
        const pw = Math.max(40, pText.length * 6.8 + 12);
        badgeParts.push({
          width: pw,
          render: (bx, by) => `
            <g>
              <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${pw.toFixed(1)}" height="16" rx="2" fill="#fffbeb" stroke="#b45309" stroke-width="1.2" />
              <text x="${(bx + pw / 2).toFixed(1)}" y="${(by + 11.5).toFixed(1)}" text-anchor="middle" fill="#78350f" font-size="9.5" font-weight="800" font-family="monospace">${escapeXml(pText)}</text>
            </g>
          `,
        });
      }
      if (splitCode) {
        const sw = Math.max(38, splitCode.length * 6.8 + 18);
        badgeParts.push({
          width: sw,
          render: (bx, by) => `
            <g>
              <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${sw.toFixed(1)}" height="16" rx="2" fill="#ffffff" stroke="${splitColor}" stroke-width="1.3" />
              <circle cx="${(bx + 7).toFixed(1)}" cy="${(by + 8).toFixed(1)}" r="3" fill="${splitColor}" />
              <text x="${(bx + 13).toFixed(1)}" y="${(by + 11.5).toFixed(1)}" fill="#0f172a" font-size="9.5" font-weight="800" font-family="monospace">${escapeXml(splitCode)}</text>
            </g>
          `,
        });
      }

      let bottomBadgesSvg = '';
      if (badgeParts.length > 0) {
        const gap = 6;
        const totalBadgeW =
          badgeParts.reduce((acc, part) => acc + part.width, 0) +
          gap * (badgeParts.length - 1);
        let curBx = cx - totalBadgeW / 2;
        // Place badges above footprint when label is aligned to bottom so they never overlap
        const badgeY = showLabelBlock && alignV === 'bottom' ? cy - ih / 2 - 22 : cy + ih / 2 + 6;
        bottomBadgesSvg = badgeParts
          .map((part) => {
            const out = part.render(curBx, badgeY);
            curBx += part.width + gap;
            return out;
          })
          .join('\n');
      }

      return `
        <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${item.rotation}) translate(${(
        -iw / 2
      ).toFixed(1)}, ${(-ih / 2).toFixed(1)})">
          <svg x="0" y="0" width="${iw.toFixed(1)}" height="${ih.toFixed(
        1
      )}" viewBox="0 0 100 100" preserveAspectRatio="${isRiser ? 'none' : 'xMidYMid meet'}">
            ${inner}
          </svg>
        </g>
        ${labelSvg}
        ${bottomBadgesSvg}
      `;
    })
    .join('\n');

  const centerX = stageX + stageW / 2;
  const topDimY = stageY - 30;
  const rightDimX = stageX + stageW + 32;

  const dimensionLinesSvg = includeStageDimensions
    ? `
      <!-- Top Width Dimension Line -->
      <line x1="${stageX}" y1="${topDimY}" x2="${stageX + stageW}" y2="${topDimY}" stroke="#0f172a" stroke-width="1.8" />
      <polygon points="${stageX},${topDimY} ${stageX + 10},${topDimY - 5} ${stageX + 10},${topDimY + 5}" fill="#0f172a" />
      <polygon points="${stageX + stageW},${topDimY} ${stageX + stageW - 10},${topDimY - 5} ${
        stageX + stageW - 10
      },${topDimY + 5}" fill="#0f172a" />
      <rect x="${centerX - 44}" y="${topDimY - 12}" width="88" height="24" fill="#ffffff" />
      <text x="${centerX}" y="${topDimY + 5}" text-anchor="middle" fill="#0f172a" font-size="16" font-weight="800" font-family="monospace">${widthFeet}'-0"</text>

      <!-- Right Depth Dimension Line -->
      <line x1="${rightDimX}" y1="${stageY}" x2="${rightDimX}" y2="${stageY + stageH}" stroke="#0f172a" stroke-width="1.8" />
      <polygon points="${rightDimX},${stageY} ${rightDimX - 5},${stageY + 10} ${rightDimX + 5},${stageY + 10}" fill="#0f172a" />
      <polygon points="${rightDimX},${stageY + stageH} ${rightDimX - 5},${stageY + stageH - 10} ${
        rightDimX + 5
      },${stageY + stageH - 10}" fill="#0f172a" />
      <rect x="${rightDimX - 14}" y="${stageY + stageH / 2 - 36}" width="28" height="72" fill="#ffffff" />
      <text x="${rightDimX}" y="${stageY + stageH / 2}" text-anchor="middle" dominant-baseline="central" fill="#0f172a" font-size="16" font-weight="800" font-family="monospace" transform="rotate(90 ${rightDimX} ${
        stageY + stageH / 2
      })">${depthFeet}'-0"</text>
    `
    : '';

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
      <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#ffffff" />
      ${dimensionLinesSvg}

      <!-- Main Stage Deck -->
      <rect x="${stageX}" y="${stageY}" width="${stageW}" height="${stageH}" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      ${gridLines.join('\n')}

      <!-- Centerline -->
      <line x1="${centerX}" y1="${stageY}" x2="${centerX}" y2="${
    stageY + stageH
  }" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="8 6" opacity="0.7" />

      <!-- Orientation Labels -->
      <text x="${centerX}" y="${stageY + 18}" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700" font-family="monospace" letter-spacing="1.5">▲ UPSTAGE (REAR)</text>
      <text x="${centerX}" y="${stageY + stageH - 10}" text-anchor="middle" fill="#64748b" font-size="11" font-weight="700" font-family="monospace" letter-spacing="1.5">▼ DOWNSTAGE / FOH</text>
      <text x="${stageX + 14}" y="${stageY + stageH / 2}" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700" font-family="monospace" letter-spacing="1.5" transform="rotate(-90 ${
    stageX + 14
  } ${stageY + stageH / 2})">STAGE RIGHT</text>
      <text x="${stageX + stageW - 14}" y="${stageY + stageH / 2}" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700" font-family="monospace" letter-spacing="1.5" transform="rotate(90 ${
    stageX + stageW - 14
  } ${stageY + stageH / 2})">STAGE LEFT</text>

      ${ticksSvg.join('\n')}
      ${techSvg}
      ${routesSvg}
      ${itemsSvg}
    </svg>
  `.trim();

  const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to rasterize stage plot SVG'));
      image.src = blobUrl;
    });

    const targetWidth = 2400;
    const targetHeight = Math.round((totalH / totalW) * targetWidth);
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      aspectRatio: totalW / totalH,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// ============================================================================
// ZERO-CLIPPING WRAPPED PDF LAYOUT ENGINE
// ============================================================================

interface PdfCursor {
  doc: jsPDF;
  pageW: number;
  pageH: number;
  margin: number;
  footerReserve: number;
  contentW: number;
  maxY: number;
  y: number;
  orientation: 'landscape' | 'portrait';
  paperFormat: 'letter' | 'a4';
  includeStageDimensions: boolean;
  project: StageProject;
}

function addContinuationPage(ctx: PdfCursor, sectionHint?: string): void {
  ctx.doc.addPage(ctx.paperFormat, ctx.orientation);
  ctx.y = ctx.margin;

  // Compact running top header on continuation pages
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setFontSize(8.5);
  ctx.doc.setTextColor(15, 23, 42);
  const leftHead = [
    (ctx.project.artistName || 'STAGE PLOT').toUpperCase(),
    ctx.project.title || 'TECHNICAL STAGE RIDER',
  ]
    .filter(Boolean)
    .join(' — ');
  ctx.doc.text(leftHead, ctx.margin, ctx.y + 3.5);

  if (sectionHint) {
    ctx.doc.setFont('courier', 'bold');
    ctx.doc.setFontSize(7.5);
    ctx.doc.setTextColor(71, 85, 105);
    ctx.doc.text(sectionHint.toUpperCase(), ctx.pageW - ctx.margin, ctx.y + 3.5, {
      align: 'right',
    });
  }

  ctx.doc.setDrawColor(15, 23, 42);
  ctx.doc.setLineWidth(0.35);
  ctx.doc.line(ctx.margin, ctx.y + 5.2, ctx.pageW - ctx.margin, ctx.y + 5.2);
  ctx.y += 8.2;
}

/**
 * Draws the prominent Show Title / Artist Information Header at the TOP of Page 1.
 * All fields wrap cleanly so long titles or artist names are 100% visible.
 */
function drawTopShowHeader(
  ctx: PdfCursor,
  activeChannelCount: number,
  activeMonitorCount: number
): void {
  const { doc, margin, contentW, project } = ctx;
  const startY = ctx.y;

  const leftW = contentW * 0.62;
  const rightX = margin + contentW;
  const rightW = contentW * 0.35;

  // Left block: Artist Name + Show Title + Venue/Tour
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const artistLines: string[] = doc.splitTextToSize(
    (project.artistName || 'ARTIST / BAND NAME').toUpperCase(),
    leftW
  );
  let ly = startY + 5;
  artistLines.forEach((line) => {
    doc.text(line, margin, ly);
    ly += 5.8;
  });

  if (project.title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const titleLines: string[] = doc.splitTextToSize(project.title, leftW);
    titleLines.forEach((line) => {
      doc.text(line, margin, ly);
      ly += 4.2;
    });
  }

  if (project.venueOrTour) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const venueLines: string[] = doc.splitTextToSize(project.venueOrTour, leftW);
    venueLines.forEach((line) => {
      doc.text(line, margin, ly);
      ly += 3.6;
    });
  }

  // Right block: Date / Rev + Stage Size + Patch Count
  let ry = startY + 4.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const revDate = [project.versionDate || 'Rev 1.0', project.date].filter(Boolean).join('  ·  ');
  const revLines: string[] = doc.splitTextToSize(revDate, rightW);
  revLines.forEach((line) => {
    doc.text(line, rightX, ry, { align: 'right' });
    ry += 4.0;
  });

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  if (ctx.includeStageDimensions) {
    const stageLine = `STAGE: ${project.stageDimensions.widthFeet}'-0" W × ${project.stageDimensions.depthFeet}'-0" D`;
    doc.text(stageLine, rightX, ry, { align: 'right' });
    ry += 3.8;
  }

  const summaryLine = `${activeChannelCount} INPUTS · ${activeMonitorCount} MON MIXES · ${project.contacts.length} CREW`;
  doc.text(summaryLine, rightX, ry, { align: 'right' });
  ry += 3.6;

  const headerBottom = Math.max(ly, ry) + 1.2;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.line(margin, headerBottom, margin + contentW, headerBottom);

  ctx.y = headerBottom + 3.5;
}

function drawSectionHeading(ctx: PdfCursor, title: string, subtitle?: string): void {
  if (ctx.y + 12 > ctx.maxY) {
    addContinuationPage(ctx, title);
  }
  const { doc, margin, contentW } = ctx;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), margin, ctx.y + 3.5);

  if (subtitle) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, margin + contentW, ctx.y + 3.5, { align: 'right' });
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, ctx.y + 5, margin + contentW, ctx.y + 5);
  ctx.y += 6.5;
}

interface TableColumnSpec {
  header: string;
  weight: number;
  align?: 'left' | 'center' | 'right';
  font?: 'helvetica' | 'courier';
  bold?: boolean;
}

/**
 * Draws a fully auto-wrapping, auto-paginating table where EVERY word in EVERY cell
 * wraps cleanly to fit within its column width — zero truncation or clipping.
 */
function drawWrappedTable(
  ctx: PdfCursor,
  sectionTitle: string,
  columns: TableColumnSpec[],
  rows: string[][],
  options?: {
    fontSize?: number;
    headerFontSize?: number;
    lineHeight?: number;
    padX?: number;
    padY?: number;
    emptyMessage?: string;
    skipSectionHeading?: boolean;
    subtitle?: string;
  }
): void {
  const fontSize = options?.fontSize ?? 7.2;
  const headerFontSize = options?.headerFontSize ?? 6.8;
  const lineHeight = options?.lineHeight ?? 3.15;
  const padX = options?.padX ?? 1.4;
  const padY = options?.padY ?? 1.25;
  const headerH = 5.4;

  const totalWeight = columns.reduce((acc, c) => acc + c.weight, 0);
  const colWidths = columns.map((c) => (c.weight / totalWeight) * ctx.contentW);

  if (!options?.skipSectionHeading) {
    drawSectionHeading(ctx, sectionTitle, options?.subtitle);
  }

  const drawHeaderBar = () => {
    const { doc, margin, contentW } = ctx;
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, ctx.y, contentW, headerH, 'F');
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.25);
    doc.rect(margin, ctx.y, contentW, headerH, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.setTextColor(15, 23, 42);

    let cx = margin;
    columns.forEach((col, i) => {
      if (i > 0) {
        doc.line(cx, ctx.y, cx, ctx.y + headerH);
      }
      const align = col.align || 'left';
      const tx =
        align === 'center'
          ? cx + colWidths[i] / 2
          : align === 'right'
          ? cx + colWidths[i] - padX
          : cx + padX;
      doc.text(col.header.toUpperCase(), tx, ctx.y + headerH - 1.7, { align });
      cx += colWidths[i];
    });
    ctx.y += headerH;
  };

  // Pass 1: Pre-wrap all cells so every row in this table uses one uniform height
  // tall enough to fit the tallest wrapped cell cleanly with zero clipping.
  const wrappedRows: string[][][] = rows.map((cells) =>
    columns.map((col, colIdx) => {
      const raw = (cells[colIdx] ?? '').toString().trim();
      if (!raw) return [''];
      ctx.doc.setFont(col.font || 'helvetica', col.bold ? 'bold' : 'normal');
      ctx.doc.setFontSize(fontSize);
      const maxW = Math.max(4, colWidths[colIdx] - padX * 2);
      return ctx.doc.splitTextToSize(raw, maxW) as string[];
    })
  );

  const maxLinesInTable = wrappedRows.reduce((maxL, rowCells) => {
    const rowMax = Math.max(1, ...rowCells.map((lines) => lines.length));
    return Math.max(maxL, rowMax);
  }, 1);
  const uniformRowH = Math.max(5.0, maxLinesInTable * lineHeight + padY * 2);

  // Ensure header + at least one uniform row fit on current page
  if (ctx.y + headerH + (rows.length > 0 ? uniformRowH : 6) > ctx.maxY) {
    addContinuationPage(ctx, sectionTitle);
  }
  drawHeaderBar();

  if (rows.length === 0) {
    const msg = options?.emptyMessage || 'None specified.';
    const rowH = 6;
    ctx.doc.setDrawColor(203, 213, 225);
    ctx.doc.setLineWidth(0.2);
    ctx.doc.rect(ctx.margin, ctx.y, ctx.contentW, rowH, 'S');
    ctx.doc.setFont('helvetica', 'italic');
    ctx.doc.setFontSize(fontSize);
    ctx.doc.setTextColor(100, 116, 139);
    ctx.doc.text(msg, ctx.margin + ctx.contentW / 2, ctx.y + 4, { align: 'center' });
    ctx.y += rowH + 3;
    return;
  }

  // Pass 2: Draw every row at the exact same uniformRowH with vertically centered text
  wrappedRows.forEach((wrappedCells, rowIdx) => {
    // Page break before drawing row if it would clip bottom margin
    if (ctx.y + uniformRowH > ctx.maxY) {
      addContinuationPage(ctx, `${sectionTitle} (cont.)`);
      drawHeaderBar();
    }

    // Zebra fill
    if (rowIdx % 2 === 1) {
      ctx.doc.setFillColor(248, 250, 252);
      ctx.doc.rect(ctx.margin, ctx.y, ctx.contentW, uniformRowH, 'F');
    }

    // Outer cell borders & vertical dividers
    ctx.doc.setDrawColor(148, 163, 184);
    ctx.doc.setLineWidth(0.15);
    ctx.doc.rect(ctx.margin, ctx.y, ctx.contentW, uniformRowH, 'S');

    let cx = ctx.margin;
    columns.forEach((col, colIdx) => {
      if (colIdx > 0) {
        ctx.doc.setDrawColor(203, 213, 225);
        ctx.doc.line(cx, ctx.y, cx, ctx.y + uniformRowH);
      }

      const lines = wrappedCells[colIdx];
      const align = col.align || 'left';
      const tx =
        align === 'center'
          ? cx + colWidths[colIdx] / 2
          : align === 'right'
          ? cx + colWidths[colIdx] - padX
          : cx + padX;

      ctx.doc.setFont(col.font || 'helvetica', col.bold ? 'bold' : 'normal');
      ctx.doc.setFontSize(fontSize);
      ctx.doc.setTextColor(15, 23, 42);

      const lineCount = Math.max(1, lines.length);
      const textBlockH = lineCount * lineHeight;
      let ty = ctx.y + (uniformRowH - textBlockH) / 2 + lineHeight * 0.76;
      lines.forEach((line) => {
        if (line) {
          ctx.doc.text(line, tx, ty, { align });
        }
        ty += lineHeight;
      });

      cx += colWidths[colIdx];
    });

    ctx.y += uniformRowH;
  });

  // Crisp bottom border
  ctx.doc.setDrawColor(15, 23, 42);
  ctx.doc.setLineWidth(0.25);
  ctx.doc.line(ctx.margin, ctx.y, ctx.margin + ctx.contentW, ctx.y);
  ctx.y += 4;
}

/**
 * Draws a two-column or stacked wrapped notes block with zero truncation.
 * If notes are long, they automatically expand and flow across pages.
 */
function drawWrappedNotesGrid(
  ctx: PdfCursor,
  cards: Array<{ title: string; body: string }>
): void {
  const nonEmptyCards = cards.filter((c) => c.body.trim().length > 0);
  if (nonEmptyCards.length === 0) return;

  const fontSize = 7.4;
  const lineH = 3.4;
  const headerH = 5.2;
  const pad = 2.4;

  // Pair cards side-by-side when in landscape or when 2 cards fit comfortably
  const pairGap = 4;
  const colW = (ctx.contentW - pairGap) / 2;

  for (let i = 0; i < nonEmptyCards.length; i += 2) {
    const leftCard = nonEmptyCards[i];
    const rightCard = nonEmptyCards[i + 1];

    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setFontSize(fontSize);

    const cardWidth = rightCard ? colW : ctx.contentW;
    const leftLines: string[] = ctx.doc.splitTextToSize(leftCard.body, cardWidth - pad * 2);
    const rightLines: string[] = rightCard
      ? (ctx.doc.splitTextToSize(rightCard.body, cardWidth - pad * 2) as string[])
      : [];

    const maxLines = Math.max(leftLines.length, rightLines.length, 1);
    const neededH = headerH + pad * 2 + maxLines * lineH;

    // If the paired card block fits on one page, draw as crisp matching-height boxes
    if (neededH <= ctx.maxY - ctx.margin - 12) {
      if (ctx.y + neededH > ctx.maxY) {
        addContinuationPage(ctx, 'Technical Notes');
      }

      const drawCardBox = (x: number, w: number, title: string, lines: string[], h: number) => {
        ctx.doc.setDrawColor(15, 23, 42);
        ctx.doc.setLineWidth(0.25);
        ctx.doc.rect(x, ctx.y, w, h, 'S');
        ctx.doc.setFillColor(241, 245, 249);
        ctx.doc.rect(x + 0.15, ctx.y + 0.15, w - 0.3, headerH - 0.15, 'F');
        ctx.doc.line(x, ctx.y + headerH, x + w, ctx.y + headerH);

        ctx.doc.setFont('helvetica', 'bold');
        ctx.doc.setFontSize(7.2);
        ctx.doc.setTextColor(15, 23, 42);
        ctx.doc.text(title.toUpperCase(), x + pad, ctx.y + headerH - 1.6);

        ctx.doc.setFont('helvetica', 'normal');
        ctx.doc.setFontSize(fontSize);
        ctx.doc.setTextColor(30, 41, 59);
        let ty = ctx.y + headerH + pad + lineH * 0.75;
        lines.forEach((line) => {
          ctx.doc.text(line, x + pad, ty);
          ty += lineH;
        });
      };

      drawCardBox(ctx.margin, cardWidth, leftCard.title, leftLines, neededH);
      if (rightCard) {
        drawCardBox(ctx.margin + cardWidth + pairGap, cardWidth, rightCard.title, rightLines, neededH);
      }
      ctx.y += neededH + 4;
    } else {
      // Very long notes: flow sequentially full-width across pages so zero lines are ever clipped
      const flowCards = rightCard ? [leftCard, rightCard] : [leftCard];
      flowCards.forEach((card) => {
        drawSectionHeading(ctx, card.title);
        ctx.doc.setFont('helvetica', 'normal');
        ctx.doc.setFontSize(fontSize);
        ctx.doc.setTextColor(30, 41, 59);
        const fullLines: string[] = ctx.doc.splitTextToSize(card.body, ctx.contentW - 2);
        fullLines.forEach((line) => {
          if (ctx.y + lineH > ctx.maxY) {
            addContinuationPage(ctx, `${card.title} (cont.)`);
            ctx.doc.setFont('helvetica', 'normal');
            ctx.doc.setFontSize(fontSize);
            ctx.doc.setTextColor(30, 41, 59);
          }
          ctx.doc.text(line, ctx.margin + 1, ctx.y + lineH * 0.8);
          ctx.y += lineH;
        });
        ctx.y += 4;
      });
    }
  }
}

/**
 * Draws the Signal Splits & Power Distribution Legend strip below the Stage Plot,
 * wrapping cleanly across multiple lines if needed so nothing is ever cut off.
 */
function drawSignalAndPowerLegend(
  ctx: PdfCursor,
  activeChannels: ChannelInput[]
): void {
  const { project } = ctx;
  const powerSummary = computeStagePowerSummary(project);
  const signalGroups =
    project.signalGroups && project.signalGroups.length > 0
      ? project.signalGroups
      : DEFAULT_SIGNAL_GROUPS;

  const activeGroups = signalGroups.filter(
    (g) =>
      project.items.some(
        (it) => it.signalGroupId === g.id || it.subSnakeLabel === g.shortCode
      ) ||
      activeChannels.some(
        (ch) => ch.signalGroupId === g.id || ch.subSnake === g.shortCode
      )
  );

  if (activeGroups.length === 0 && powerSummary.lines.length === 0) return;

  const linesToDraw: Array<{ label: string; text: string }> = [];
  if (activeGroups.length > 0) {
    linesToDraw.push({
      label: 'SIGNAL SPLITS: ',
      text: activeGroups
        .map((g) => (g.notes ? `[${g.shortCode}] ${g.name} (${g.notes})` : `[${g.shortCode}] ${g.name}`))
        .join('   |   '),
    });
  }
  if (powerSummary.lines.length > 0) {
    linesToDraw.push({
      label: `POWER DROPS (${powerSummary.totalDrops}): `,
      text: powerSummary.lines.map((l) => `${l.totalDrops}× ${l.connector}`).join('   |   '),
    });
  }

  ctx.doc.setFont('courier', 'normal');
  ctx.doc.setFontSize(6.8);
  const wrappedBlocks = linesToDraw.map((item) =>
    ctx.doc.splitTextToSize(`${item.label}${item.text}`, ctx.contentW - 4) as string[]
  );
  const totalLines = wrappedBlocks.reduce((acc, b) => acc + b.length, 0);
  const boxH = totalLines * 3.2 + 3.2;

  if (ctx.y + boxH > ctx.maxY) {
    addContinuationPage(ctx, 'Stage Legend');
  }

  ctx.doc.setFillColor(248, 250, 252);
  ctx.doc.setDrawColor(203, 213, 225);
  ctx.doc.setLineWidth(0.25);
  ctx.doc.rect(ctx.margin, ctx.y, ctx.contentW, boxH, 'FD');

  ctx.doc.setFont('courier', 'bold');
  ctx.doc.setFontSize(6.8);
  ctx.doc.setTextColor(30, 41, 59);
  let ty = ctx.y + 3.8;
  wrappedBlocks.forEach((lines) => {
    lines.forEach((line) => {
      ctx.doc.text(line, ctx.margin + 2, ty);
      ty += 3.2;
    });
  });

  ctx.y += boxH + 4;
}

/**
 * Embeds the Stage Plot PNG cleanly, preserving exact aspect ratio and fitting
 * available page space without clipping any text or badges.
 */
function drawStagePlotBlock(
  ctx: PdfCursor,
  plotDataUrl: string,
  plotAspect: number,
  activeChannels: ChannelInput[],
  preferFullPage: boolean
): void {
  const legendReserve = 14;
  const headingH = 6.5;
  const minReadablePlotH = ctx.orientation === 'landscape' ? 68 : 74;

  // If remaining space is too tight for a legible stage plot, move cleanly to a fresh page
  if (ctx.y + headingH + minReadablePlotH > ctx.maxY) {
    addContinuationPage(ctx, 'Stage Plot Diagram');
  }

  drawSectionHeading(
    ctx,
    'Stage Plot Diagram',
    ctx.includeStageDimensions
      ? `${ctx.project.stageDimensions.widthFeet}'-0" W × ${ctx.project.stageDimensions.depthFeet}'-0" D`
      : undefined
  );

  const availW = ctx.contentW;
  const availH = Math.max(minReadablePlotH, ctx.maxY - ctx.y - legendReserve);

  let imgW = availW;
  let imgH = imgW / plotAspect;
  if (imgH > availH) {
    imgH = availH;
    imgW = imgH * plotAspect;
  }

  // On combined portrait/landscape pages, avoid leaving awkward micro-gaps; keep crisp proportional size
  if (!preferFullPage && imgH > availH) {
    imgH = availH;
    imgW = imgH * plotAspect;
  }

  const imgX = ctx.margin + (availW - imgW) / 2;
  ctx.doc.addImage(plotDataUrl, 'PNG', imgX, ctx.y, imgW, imgH);
  ctx.y += imgH + 2.5;

  drawSignalAndPowerLegend(ctx, activeChannels);
}

function drawActiveChannelTable(ctx: PdfCursor, activeChannels: ChannelInput[]): void {
  const isLandscape = ctx.orientation === 'landscape';
  const columns: TableColumnSpec[] = isLandscape
    ? [
        { header: '#', weight: 5, align: 'center', font: 'courier', bold: true },
        { header: 'Source', weight: 17, bold: true },
        { header: 'Transducer (Mic / DI)', weight: 21 },
        { header: 'Connector', weight: 12, font: 'courier' },
        { header: 'Stand', weight: 10 },
        { header: '48V', weight: 5, align: 'center', font: 'courier', bold: true },
        { header: 'Split / Snake', weight: 9, font: 'courier', bold: true },
        { header: 'Location', weight: 11, font: 'courier' },
        { header: 'Notes', weight: 15 },
      ]
    : [
        { header: '#', weight: 6, align: 'center', font: 'courier', bold: true },
        { header: 'Source', weight: 18, bold: true },
        { header: 'Transducer (Mic / DI)', weight: 22 },
        { header: 'Connector', weight: 12, font: 'courier' },
        { header: 'Stand', weight: 11 },
        { header: '48V', weight: 6, align: 'center', font: 'courier', bold: true },
        { header: 'Split / Loc', weight: 14, font: 'courier' },
        { header: 'Notes', weight: 14 },
      ];

  const rows = activeChannels.map((ch) => {
    const grp = findSignalGroup(ctx.project, ch.signalGroupId, ch.subSnake);
    const splitTag = grp?.shortCode || ch.subSnake || '';
    if (isLandscape) {
      return [
        String(ch.channelNumber),
        ch.name,
        ch.micOrDI,
        ch.connector || 'XLR',
        formatStand(ch.standType),
        ch.phantom48V ? '48V' : '-',
        splitTag || '-',
        ch.stageLocation || '-',
        ch.notes || '',
      ];
    }
    return [
      String(ch.channelNumber),
      ch.name,
      ch.micOrDI,
      ch.connector || 'XLR',
      formatStand(ch.standType),
      ch.phantom48V ? '48V' : '-',
      [splitTag, ch.stageLocation].filter(Boolean).join(' · ') || '-',
      ch.notes || '',
    ];
  });

  const hasGaps = hasPatchSequenceGaps(activeChannels);
  drawWrappedTable(ctx, 'Input Channel List', columns, rows, {
    fontSize: isLandscape ? 7.1 : 6.9,
    headerFontSize: 6.6,
    lineHeight: 3.1,
    padX: 1.2,
    padY: 1.15,
    emptyMessage: 'No active input channels patched.',
    subtitle: `${activeChannels.length} Active Input${activeChannels.length === 1 ? '' : 's'}${
      hasGaps ? ' (Empty channels omitted)' : ''
    }`,
  });
}

function drawMonitorMixTable(ctx: PdfCursor): void {
  const activeMonitors = ctx.project.monitors.filter(
    (m) => (m.performer || '').trim() !== '' || (m.location || '').trim() !== ''
  );
  if (activeMonitors.length === 0) return;

  const columns: TableColumnSpec[] = [
    { header: 'Mix', weight: 8, align: 'center', font: 'courier', bold: true },
    { header: 'Performer / Role', weight: 22, bold: true },
    { header: 'Monitor Type', weight: 15 },
    { header: 'Stage Location', weight: 15, font: 'courier' },
    { header: 'Output Patch', weight: 13, font: 'courier' },
    { header: 'Requested Mix Blend / Notes', weight: 27 },
  ];

  const rows = activeMonitors.map((m) => [
    `M${m.mixNumber}`,
    m.performer,
    m.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    m.location,
    m.outputPatch || '-',
    [m.requestedContent, m.notes].filter(Boolean).join(' — '),
  ]);

  drawWrappedTable(ctx, 'Monitor Mix Matrix', columns, rows, {
    fontSize: 7.2,
    subtitle: `${activeMonitors.length} Active Mix${activeMonitors.length === 1 ? '' : 'es'}`,
  });
}

function drawCrewContactsTable(ctx: PdfCursor): void {
  const contacts = ctx.project.contacts.filter(
    (c) =>
      (c.role || '').trim() !== '' ||
      (c.name || '').trim() !== '' ||
      (c.phone || '').trim() !== '' ||
      (c.email || '').trim() !== ''
  );

  if (contacts.length === 0) return;

  const totalHeadcount = contacts.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const venueNeeded = contacts
    .filter((c) => c.status === 'needed_from_venue')
    .reduce((sum, c) => sum + (c.quantity || 1), 0);

  const columns: TableColumnSpec[] = [
    { header: 'Crew Role / Position', weight: 22, bold: true },
    { header: 'Dept', weight: 12, font: 'courier' },
    { header: 'Status / Qty', weight: 14, font: 'courier', bold: true },
    { header: 'Contact Name', weight: 16, bold: true },
    { header: 'Phone & Email', weight: 21, font: 'courier' },
    { header: 'Crew Notes / Call Time', weight: 18 },
  ];

  const rows = contacts.map((c) => [
    c.role || 'Crew',
    c.department || 'Audio',
    formatCrewStatus(c),
    c.name || (c.status === 'needed_from_venue' ? 'Provided by Venue' : 'TBD'),
    [c.phone, c.email].filter(Boolean).join('\n') || '-',
    c.notes || '',
  ]);

  const subtitle =
    venueNeeded > 0
      ? `${totalHeadcount} Total Crew · ${venueNeeded} Needed from Venue`
      : `${totalHeadcount} Production Contact${totalHeadcount === 1 ? '' : 's'}`;

  drawWrappedTable(ctx, 'Production Contacts & Crew Requirements', columns, rows, {
    fontSize: 7.1,
    subtitle,
  });
}

function drawTechnicalNotesSection(ctx: PdfCursor): void {
  const { project } = ctx;
  const powerSummary = computeStagePowerSummary(project);

  const powerDetails = [
    `120V Dedicated 20A Drops: ${project.powerRequirements.dedicatedDrops120V}  |  230V/UK/EU Drops: ${project.powerRequirements.dedicatedDrops230V}`,
    powerSummary.lines.length > 0
      ? `Placed Stage Drops (${powerSummary.totalDrops}): ${powerSummary.lines
          .map((l) => `${l.totalDrops}× ${l.connector}`)
          .join(', ')}`
      : '',
    project.powerRequirements.stageRiserSpecs
      ? `Stage Risers: ${project.powerRequirements.stageRiserSpecs}`
      : '',
    project.powerRequirements.backlineNotes
      ? `Backline: ${project.powerRequirements.backlineNotes}`
      : '',
    project.powerRequirements.notes ? `Power Notes: ${project.powerRequirements.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const cards: Array<{ title: string; body: string }> = [
    { title: 'Audio Notes', body: project.audioNotes || '' },
    { title: 'Misc & Staging Notes', body: project.miscNotes || '' },
    { title: 'Power, Risers & Backline', body: powerDetails },
    { title: 'General Production Notes', body: project.productionNotes || '' },
  ];

  drawWrappedNotesGrid(ctx, cards);
}

function stampPageFooters(ctx: PdfCursor): void {
  const totalPages = ctx.doc.getNumberOfPages();
  const footerLineY = ctx.pageH - ctx.margin - 4.5;
  const footerTextY = ctx.pageH - ctx.margin - 1.2;

  for (let p = 1; p <= totalPages; p++) {
    ctx.doc.setPage(p);
    ctx.doc.setDrawColor(203, 213, 225);
    ctx.doc.setLineWidth(0.25);
    ctx.doc.line(ctx.margin, footerLineY, ctx.pageW - ctx.margin, footerLineY);

    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setFontSize(7);
    ctx.doc.setTextColor(100, 116, 139);
    const leftMeta = [
      projectLabel(ctx.project.artistName),
      ctx.project.title,
      ctx.project.versionDate,
    ]
      .filter(Boolean)
      .join(' · ');
    ctx.doc.text(leftMeta, ctx.margin, footerTextY);
    ctx.doc.text(`Page ${p} of ${totalPages}`, ctx.pageW - ctx.margin, footerTextY, {
      align: 'right',
    });
  }
}

function projectLabel(artistName?: string): string {
  return (artistName || 'StageCraft Technical Rider').trim();
}

export async function exportRiderToPDF(
  project: StageProject,
  optionsOrLegacyMode: PdfExportOptions | 'attached_master' | 'multipage' = {
    orientation: 'landscape',
    pageBreakBetweenPlotAndChannels: false,
    paperFormat: 'letter',
    includeStageDimensions: true,
  }
): Promise<void> {
  const options: PdfExportOptions =
    typeof optionsOrLegacyMode === 'string'
      ? {
          orientation: optionsOrLegacyMode === 'attached_master' ? 'landscape' : 'portrait',
          pageBreakBetweenPlotAndChannels: optionsOrLegacyMode === 'multipage',
          paperFormat: 'letter',
          includeStageDimensions: true,
        }
      : {
          orientation: optionsOrLegacyMode.orientation || 'landscape',
          pageBreakBetweenPlotAndChannels: !!optionsOrLegacyMode.pageBreakBetweenPlotAndChannels,
          paperFormat: optionsOrLegacyMode.paperFormat || 'letter',
          includeStageDimensions: optionsOrLegacyMode.includeStageDimensions !== false,
        };

  const includeStageDimensions = options.includeStageDimensions !== false;
  const { dataUrl: plotDataUrl, aspectRatio: plotAspect } = await renderStagePlotToDataURL(
    project,
    includeStageDimensions
  );
  const safeName = (project.artistName || 'StagePlot').replace(/[^a-z0-9_-]+/gi, '_');

  // Automatically exclude empty channels & empty monitor rows
  const activeChannels = project.channels.filter(isChannelActive);
  const activeMonitors = project.monitors.filter(
    (m) => (m.performer || '').trim() !== '' || (m.location || '').trim() !== ''
  );

  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.paperFormat || 'letter',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;
  const footerReserve = 7;

  const ctx: PdfCursor = {
    doc,
    pageW,
    pageH,
    margin,
    footerReserve,
    contentW: pageW - margin * 2,
    maxY: pageH - margin - footerReserve,
    y: margin,
    orientation: options.orientation,
    paperFormat: options.paperFormat || 'letter',
    includeStageDimensions,
    project,
  };

  // 1. ALWAYS place Show Title & Artist Info cleanly at the TOP of Page 1
  drawTopShowHeader(ctx, activeChannels.length, activeMonitors.length);

  if (options.pageBreakBetweenPlotAndChannels) {
    // SEPARATE PAGES MODE:
    // Page 1: Full-size Stage Plot Diagram + Signal/Power Legend
    drawStagePlotBlock(ctx, plotDataUrl, plotAspect, activeChannels, true);

    // Explicit Page Break before Channel List
    if (activeChannels.length > 0) {
      addContinuationPage(ctx, 'Input Channel List');
      drawActiveChannelTable(ctx, activeChannels);
    }

    // Monitor Mixes, Notes & Crew Contacts (auto-paginating, zero clipping)
    drawMonitorMixTable(ctx);
    drawTechnicalNotesSection(ctx);
    drawCrewContactsTable(ctx);
  } else {
    // COMBINED SHEET MODE (No forced page break between Channel List & Stage Plot):
    // Show Header -> Active Channel List -> Stage Plot on same page (auto-flowing if channels are long)
    if (activeChannels.length > 0) {
      drawActiveChannelTable(ctx, activeChannels);
    }
    drawStagePlotBlock(ctx, plotDataUrl, plotAspect, activeChannels, false);

    // Follow with Monitor Mixes, Notes & Crew Contacts (auto-flowing cleanly so all text is visible)
    drawMonitorMixTable(ctx);
    drawTechnicalNotesSection(ctx);
    drawCrewContactsTable(ctx);
  }

  stampPageFooters(ctx);

  const orientTag = options.orientation === 'landscape' ? 'Horizontal' : 'Portrait';
  doc.save(`${safeName}_Stage_Rider_${orientTag}.pdf`);
}
