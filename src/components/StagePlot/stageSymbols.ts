/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GearType, StockSymbolId } from '../../types/stage';

export type SymbolTheme = 'dark' | 'print';

interface Palette {
  stroke: string;
  strokeMuted: string;
  strokeAccent: string;
  fill: string;
  fillStrong: string;
  fillCymbal: string;
  strokeCymbal: string;
  fillMonitor: string;
  strokeMonitor: string;
  fillPower: string;
  strokePower: string;
  fillCeeBlue: string;
  strokeCeeBlue: string;
  fillCeeRed: string;
  strokeCeeRed: string;
  text: string;
  textMuted: string;
  bgCard: string;
}

export function getSymbolPalette(theme: SymbolTheme): Palette {
  if (theme === 'dark') {
    return {
      stroke: '#8ecae6',       // Crisp BFD steel-cyan
      strokeMuted: '#475569',  // Fine hardware tripod / frame
      strokeAccent: '#38bdf8', // Bright technical highlight
      fill: 'rgba(110, 178, 204, 0.16)',
      fillStrong: 'rgba(110, 178, 204, 0.30)',
      fillCymbal: 'rgba(148, 210, 225, 0.18)',
      strokeCymbal: '#94d2e1',
      fillMonitor: 'rgba(45, 212, 191, 0.15)',
      strokeMonitor: '#5eead4',
      fillPower: 'rgba(245, 158, 11, 0.15)',
      strokePower: '#fbbf24',
      fillCeeBlue: 'rgba(56, 189, 248, 0.16)',
      strokeCeeBlue: '#38bdf8',
      fillCeeRed: 'rgba(248, 113, 113, 0.16)',
      strokeCeeRed: '#f87171',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      bgCard: '#0f172a',
    };
  }
  return {
    stroke: '#0f172a',       // Precision technical black ink
    strokeMuted: '#64748b',  // Secondary drafting line
    strokeAccent: '#0f172a',
    fill: 'rgba(15, 23, 42, 0.05)',
    fillStrong: 'rgba(15, 23, 42, 0.12)',
    fillCymbal: 'rgba(15, 23, 42, 0.06)',
    strokeCymbal: '#1e293b',
    fillMonitor: 'rgba(15, 23, 42, 0.06)',
    strokeMonitor: '#0f172a',
    fillPower: '#ffffff',
    strokePower: '#0f172a',
    fillCeeBlue: 'rgba(2, 132, 199, 0.08)',
    strokeCeeBlue: '#0369a1',
    fillCeeRed: 'rgba(220, 38, 38, 0.08)',
    strokeCeeRed: '#b91c1c',
    text: '#0f172a',
    textMuted: '#475569',
    bgCard: '#ffffff',
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function drumLugs(cx: number, cy: number, r: number, count: number, color: string): string {
  const lugs: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    const lx = (cx + r * Math.cos(angle)).toFixed(2);
    const ly = (cy + r * Math.sin(angle)).toFixed(2);
    lugs.push(`<circle cx="${lx}" cy="${ly}" r="1.2" fill="${color}" />`);
  }
  return lugs.join('');
}

function cymbalWithTripod(
  cx: number,
  cy: number,
  r: number,
  p: Palette,
  withStand = true
): string {
  const stand = withStand
    ? `
      <line x1="${cx}" y1="${cy + 3}" x2="${cx - r * 0.72}" y2="${cy + r * 0.85}" stroke="${p.strokeMuted}" stroke-width="1" stroke-linecap="round" />
      <line x1="${cx}" y1="${cy + 3}" x2="${cx + r * 0.72}" y2="${cy + r * 0.85}" stroke="${p.strokeMuted}" stroke-width="1" stroke-linecap="round" />
      <line x1="${cx}" y1="${cy + 3}" x2="${cx}" y2="${cy - r * 0.55}" stroke="${p.strokeMuted}" stroke-width="1" stroke-linecap="round" />
    `
    : '';

  return `
    ${stand}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.fillCymbal}" stroke="${p.strokeCymbal}" stroke-width="1.2" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.76).toFixed(1)}" fill="none" stroke="${p.strokeCymbal}" stroke-width="0.6" stroke-dasharray="14 6 4 6" opacity="0.65" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.52).toFixed(1)}" fill="none" stroke="${p.strokeCymbal}" stroke-width="0.6" stroke-dasharray="10 5" opacity="0.6" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.22).toFixed(1)}" fill="${p.fillStrong}" stroke="${p.strokeCymbal}" stroke-width="0.9" />
    <circle cx="${cx}" cy="${cy}" r="1.2" fill="${p.strokeCymbal}" />
  `;
}

function tripodBase(cx: number, cy: number, radius: number, color: string): string {
  const a1 = -Math.PI / 2;
  const a2 = a1 + (2 * Math.PI) / 3;
  const a3 = a1 + (4 * Math.PI) / 3;
  return `
    <line x1="${cx}" y1="${cy}" x2="${(cx + radius * Math.cos(a1)).toFixed(1)}" y2="${(cy + radius * Math.sin(a1)).toFixed(1)}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" />
    <line x1="${cx}" y1="${cy}" x2="${(cx + radius * Math.cos(a2)).toFixed(1)}" y2="${(cy + radius * Math.sin(a2)).toFixed(1)}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" />
    <line x1="${cx}" y1="${cy}" x2="${(cx + radius * Math.cos(a3)).toFixed(1)}" y2="${(cy + radius * Math.sin(a3)).toFixed(1)}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" />
    <circle cx="${cx}" cy="${cy}" r="2.6" fill="${color}" />
  `;
}

function speakerCone(cx: number, cy: number, r: number, p: Palette): string {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.1" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.65).toFixed(1)}" fill="none" stroke="${p.stroke}" stroke-width="0.6" opacity="0.55" />
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.30).toFixed(1)}" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" />
  `;
}

/**
 * Helper to draw a precision circular Twist-Lock / CEE / PowerCON receptacle frame
 */
function roundPowerHousing(
  p: Palette,
  fillColor: string,
  strokeColor: string,
  badge: string,
  innerMarkup: string
): string {
  return `
    <!-- Flanged mounting plate -->
    <rect x="12" y="10" width="76" height="80" rx="10" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.6" />
    <circle cx="20" cy="18" r="2" fill="${strokeColor}" opacity="0.7" />
    <circle cx="80" cy="18" r="2" fill="${strokeColor}" opacity="0.7" />
    <circle cx="20" cy="70" r="2" fill="${strokeColor}" opacity="0.7" />
    <circle cx="80" cy="70" r="2" fill="${strokeColor}" opacity="0.7" />
    <!-- Outer connector barrel -->
    <circle cx="50" cy="43" r="23" fill="${p.bgCard}" fill-opacity="0.45" stroke="${strokeColor}" stroke-width="1.5" />
    <circle cx="50" cy="43" r="18" fill="none" stroke="${strokeColor}" stroke-width="0.8" opacity="0.65" />
    ${innerMarkup}
    <!-- Bottom technical rating plate -->
    <rect x="18" y="72" width="64" height="14" rx="2" fill="${p.bgCard}" fill-opacity="0.9" stroke="${strokeColor}" stroke-width="0.8" />
    <text x="50" y="82" text-anchor="middle" fill="${strokeColor}" font-size="8.5" font-weight="900" font-family="monospace">${badge}</text>
  `;
}

export function buildGearSVGInner(
  type: GearType,
  opts: {
    name?: string;
    wedgeLabel?: string;
    symbolId?: StockSymbolId;
    theme: SymbolTheme;
  }
): string {
  const p = getSymbolPalette(opts.theme);
  const effectiveType = opts.symbolId || type;
  const labelText = escapeXml((opts.wedgeLabel || opts.name || '').trim());

  switch (effectiveType) {
    // ------------------------------------------------------------------
    // 1. ACOUSTIC & ELECTRONIC DRUMS / PERCUSSION
    // ------------------------------------------------------------------
    case 'drum_kit_standard':
      return `
        <rect x="4" y="6" width="92" height="88" rx="4" fill="none" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.6" />
        <rect x="35" y="34" width="28" height="24" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" />
        <line x1="35" y1="38" x2="63" y2="38" stroke="${p.stroke}" stroke-width="0.9" />
        <line x1="35" y1="54" x2="63" y2="54" stroke="${p.stroke}" stroke-width="0.9" />
        <rect x="46" y="58" width="6" height="9" rx="1" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1" />
        <circle cx="49" cy="79" r="7.5" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1.2" />
        <circle cx="49" cy="79" r="3" fill="none" stroke="${p.strokeMuted}" stroke-width="0.8" />
        <circle cx="33" cy="64" r="10.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="33" cy="64" r="8.8" fill="none" stroke="${p.stroke}" stroke-width="0.7" />
        <rect x="26" y="62.2" width="14" height="3.6" fill="none" stroke="${p.stroke}" stroke-width="0.6" opacity="0.7" transform="rotate(-18 33 64)" />
        ${drumLugs(33, 64, 10.5, 8, p.stroke)}
        <circle cx="41" cy="43" r="8.2" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.3" />
        <circle cx="41" cy="43" r="6.7" fill="none" stroke="${p.stroke}" stroke-width="0.6" />
        ${drumLugs(41, 43, 8.2, 6, p.stroke)}
        <circle cx="57" cy="44" r="9.2" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.3" />
        <circle cx="57" cy="44" r="7.6" fill="none" stroke="${p.stroke}" stroke-width="0.6" />
        ${drumLugs(57, 44, 9.2, 6, p.stroke)}
        <circle cx="71" cy="63" r="12" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <circle cx="71" cy="63" r="10" fill="none" stroke="${p.stroke}" stroke-width="0.7" />
        ${drumLugs(71, 63, 12, 8, p.stroke)}
        ${cymbalWithTripod(18, 56, 9.5, p, false)}
        ${cymbalWithTripod(22, 30, 12, p, true)}
        ${cymbalWithTripod(74, 28, 12.5, p, true)}
        ${cymbalWithTripod(81, 48, 14, p, true)}
        <polygon points="47,18 51,18 50,28 48,28" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" />
      `;

    case 'drum_kit_compact':
      return `
        <rect x="8" y="8" width="84" height="84" rx="4" fill="none" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.6" />
        <rect x="38" y="34" width="24" height="22" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" />
        <circle cx="50" cy="78" r="7" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1.2" />
        <circle cx="34" cy="64" r="10" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <rect x="27" y="62.5" width="14" height="3" fill="none" stroke="${p.stroke}" stroke-width="0.6" opacity="0.7" transform="rotate(-15 34 64)" />
        ${drumLugs(34, 64, 10, 8, p.stroke)}
        <circle cx="44" cy="43" r="8.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.3" />
        ${drumLugs(44, 43, 8.5, 6, p.stroke)}
        <circle cx="69" cy="62" r="11.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        ${drumLugs(69, 62, 11.5, 8, p.stroke)}
        ${cymbalWithTripod(19, 55, 9, p, false)}
        ${cymbalWithTripod(26, 29, 11.5, p, true)}
        ${cymbalWithTripod(75, 39, 13.5, p, true)}
      `;

    case 'electronic_drum_kit':
      return `
        <path d="M 16 62 Q 20 30 50 28 Q 80 30 84 62" fill="none" stroke="${p.strokeMuted}" stroke-width="2" stroke-linecap="round" />
        <circle cx="50" cy="46" r="8" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="35" cy="62" r="9.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <circle cx="67" cy="62" r="9.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="40" cy="39" r="7" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="60" cy="39" r="7" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="21" cy="40" r="9.5" fill="${p.fillCymbal}" stroke="${p.strokeCymbal}" stroke-width="1.2" />
        <circle cx="79" cy="40" r="10.5" fill="${p.fillCymbal}" stroke="${p.strokeCymbal}" stroke-width="1.2" />
        <rect x="14" y="56" width="12" height="16" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="50" cy="79" r="6.5" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1.2" />
      `;

    case 'percussion_setup':
    case 'stock_percussion_island':
      return `
        <line x1="16" y1="18" x2="84" y2="18" stroke="${p.stroke}" stroke-width="2" stroke-linecap="round" />
        ${Array.from({ length: 11 })
          .map((_, i) => `<line x1="${21 + i * 5.8}" y1="18" x2="${21 + i * 5.8}" y2="27" stroke="${p.stroke}" stroke-width="0.9" />`)
          .join('')}
        <circle cx="35" cy="43" r="12" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="35" cy="43" r="10" fill="none" stroke="${p.stroke}" stroke-width="0.6" />
        ${drumLugs(35, 43, 12, 6, p.stroke)}
        <circle cx="65" cy="43" r="12.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="65" cy="43" r="10.5" fill="none" stroke="${p.stroke}" stroke-width="0.6" />
        ${drumLugs(65, 43, 12.5, 6, p.stroke)}
        <circle cx="22" cy="71" r="11" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        ${drumLugs(22, 71, 11, 6, p.stroke)}
        <circle cx="50" cy="74" r="11.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        ${drumLugs(50, 74, 11.5, 6, p.stroke)}
        <circle cx="78" cy="71" r="11" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        ${drumLugs(78, 71, 11, 6, p.stroke)}
      `;

    case 'cajon':
      return `
        <rect x="24" y="22" width="52" height="56" rx="4" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="28" y="26" width="44" height="48" rx="2" fill="none" stroke="${p.stroke}" stroke-width="0.8" />
        <circle cx="50" cy="54" r="11" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="50" cy="54" r="3" fill="none" stroke="${p.strokeMuted}" stroke-width="0.8" />
      `;

    // ------------------------------------------------------------------
    // 2. AMPLIFIERS & BACKLINE
    // ------------------------------------------------------------------
    case 'guitar_combo_amp':
    case 'stock_speaker_cab':
      return `
        <rect x="6" y="18" width="88" height="64" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="10" y="22" width="80" height="14" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" />
        ${[20, 29, 38, 47, 56, 65, 78]
          .map((x) => `<circle cx="${x}" cy="29" r="1.8" fill="${p.stroke}" />`)
          .join('')}
        ${speakerCone(33, 57, 16, p)}
        ${speakerCone(67, 57, 16, p)}
      `;

    case 'guitar_half_stack':
      return `
        <rect x="6" y="12" width="88" height="76" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="18" y="17" width="64" height="16" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="24" y1="25" x2="68" y2="25" stroke="${p.stroke}" stroke-width="0.8" stroke-dasharray="3 3" />
        ${speakerCone(32, 48, 12, p)}
        ${speakerCone(68, 48, 12, p)}
        ${speakerCone(32, 72, 12, p)}
        ${speakerCone(68, 72, 12, p)}
      `;

    case 'bass_combo_amp':
    case 'bass_full_rig':
      return `
        <rect x="6" y="14" width="88" height="72" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="10" y="18" width="80" height="14" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        ${speakerCone(32, 58, 17, p)}
        ${speakerCone(68, 58, 17, p)}
        <rect x="42" y="36" width="16" height="8" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
      `;

    case 'pedalboard':
      return `
        <rect x="8" y="22" width="84" height="56" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        ${[15, 31, 47, 63].map((x) => `<rect x="${x}" y="28" width="12" height="18" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" /><circle cx="${x + 6}" cy="41" r="1.5" fill="${p.stroke}" />`).join('')}
        ${[15, 31, 47].map((x) => `<rect x="${x}" y="52" width="12" height="18" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" /><circle cx="${x + 6}" cy="65" r="1.5" fill="${p.stroke}" />`).join('')}
        <rect x="78" y="28" width="9" height="42" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
      `;

    case 'acoustic_guitar_di':
      return `
        <g transform="translate(-6, 0)">
          <!-- Classic 3+3 slotted headstock & tuners -->
          <rect x="46.2" y="7" width="7.6" height="9" rx="1.4" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
          <line x1="44.2" y1="9.5" x2="46.2" y2="9.5" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="44.2" y1="12" x2="46.2" y2="12" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="44.2" y1="14.5" x2="46.2" y2="14.5" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="53.8" y1="9.5" x2="55.8" y2="9.5" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="53.8" y1="12" x2="55.8" y2="12" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="53.8" y1="14.5" x2="55.8" y2="14.5" stroke="${p.stroke}" stroke-width="1.2" />
          <!-- Symmetric dreadnought body -->
          <path d="M 47 44 C 37 44 33 51 35 58 C 37 62 39 63 36 67 C 31 72 31 83 38 87 C 43 90 57 90 62 87 C 69 83 69 72 64 67 C 61 63 63 62 65 58 C 67 51 63 44 53 44 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
          <!-- Neck & fretboard -->
          <polygon points="48,16 52,16 52.8,52 47.2,52" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
          <!-- Soundhole & rosette -->
          <circle cx="50" cy="59" r="6.8" fill="none" stroke="${p.strokeMuted}" stroke-width="0.7" />
          <circle cx="50" cy="59" r="5" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.1" />
          <!-- Bridge -->
          <rect x="43.5" y="74" width="13" height="3.2" rx="1" fill="${p.stroke}" />
        </g>
        <!-- Linked DI box -->
        <rect x="69" y="62" width="21" height="15" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <text x="79.5" y="72.5" text-anchor="middle" fill="${p.text}" font-size="7.5" font-weight="900" font-family="monospace">DI</text>
        <path d="M 62 72 Q 66 72 69 70" fill="none" stroke="${p.strokeAccent}" stroke-width="1" stroke-dasharray="2 1.5" />
      `;

    case 'guitar_stand_rack':
      return `
        <rect x="8" y="24" width="84" height="52" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        ${[22, 40, 58, 76]
          .map((x) => `<ellipse cx="${x}" cy="50" rx="5.5" ry="20" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />`)
          .join('')}
      `;

    // ------------------------------------------------------------------
    // 3. KEYBOARDS, DJ & PLAYBACK
    // ------------------------------------------------------------------
    case 'keyboard_single':
    case 'stock_synth_station':
      return `
        <line x1="20" y1="20" x2="20" y2="82" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <line x1="80" y1="20" x2="80" y2="82" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <rect x="4" y="24" width="92" height="52" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="8" y="28" width="84" height="12" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.8" />
        <rect x="40" y="30" width="20" height="8" rx="1" fill="none" stroke="${p.stroke}" stroke-width="0.8" />
        <rect x="8" y="44" width="6" height="26" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.8" />
        <rect x="17" y="44" width="75" height="28" fill="none" stroke="${p.stroke}" stroke-width="1" />
        ${Array.from({ length: 14 })
          .map((_, i) => `<line x1="${17 + (i + 1) * 5}" y1="44" x2="${17 + (i + 1) * 5}" y2="72" stroke="${p.stroke}" stroke-width="0.6" opacity="0.55" />`)
          .join('')}
        ${[1, 2, 4, 5, 6, 8, 9, 11, 12, 13]
          .map((k) => `<rect x="${17 + k * 5 - 1.5}" y="44" width="3" height="17" fill="${p.stroke}" />`)
          .join('')}
      `;

    case 'keyboard_dual_tier':
      return `
        <rect x="4" y="14" width="92" height="36" rx="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <rect x="8" y="27" width="84" height="20" fill="none" stroke="${p.stroke}" stroke-width="0.8" />
        <rect x="4" y="48" width="92" height="40" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="8" y="61" width="84" height="24" fill="none" stroke="${p.stroke}" stroke-width="1" />
        ${Array.from({ length: 15 })
          .map((_, i) => `<line x1="${8 + (i + 1) * 5.2}" y1="61" x2="${8 + (i + 1) * 5.2}" y2="85" stroke="${p.stroke}" stroke-width="0.6" opacity="0.55" />`)
          .join('')}
        ${[1, 2, 4, 5, 6, 8, 9, 11, 12, 13]
          .map((k) => `<rect x="${8 + k * 5.2 - 1.4}" y="61" width="2.8" height="14" fill="${p.stroke}" />`)
          .join('')}
      `;

    case 'grand_piano':
      return `
        <path
          d="M 14 14 L 84 14 Q 88 14 88 28 L 88 46 Q 82 54 74 62 Q 66 72 60 84 Q 50 90 36 86 Q 16 78 14 48 Z"
          fill="${p.fill}"
          stroke="${p.stroke}"
          stroke-width="1.8"
        />
        <line x1="22" y1="36" x2="72" y2="56" stroke="${p.stroke}" stroke-width="0.8" opacity="0.45" />
        <line x1="20" y1="48" x2="62" y2="74" stroke="${p.stroke}" stroke-width="0.8" opacity="0.45" />
        <line x1="36" y1="34" x2="80" y2="42" stroke="${p.stroke}" stroke-width="0.8" opacity="0.45" />
        <rect x="16" y="16" width="68" height="16" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        ${Array.from({ length: 12 })
          .map((_, i) => `<line x1="${16 + (i + 1) * 5.2}" y1="16" x2="${16 + (i + 1) * 5.2}" y2="32" stroke="${p.stroke}" stroke-width="0.6" opacity="0.6" />`)
          .join('')}
        ${[1, 2, 4, 5, 6, 8, 9, 11]
          .map((k) => `<rect x="${16 + k * 5.2 - 1.3}" y="16" width="2.6" height="9.5" fill="${p.stroke}" />`)
          .join('')}
      `;

    case 'dj_turntables':
    case 'stock_turntable_dj':
      return `
        <rect x="4" y="18" width="92" height="64" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <rect x="8" y="24" width="26" height="52" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="21" cy="46" r="10" fill="none" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="21" cy="46" r="3" fill="${p.stroke}" />
        <rect x="38" y="24" width="24" height="52" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        ${[42, 47, 52, 57].map((x) => `<line x1="${x}" y1="52" x2="${x}" y2="68" stroke="${p.stroke}" stroke-width="1.2" />`).join('')}
        <line x1="43" y1="72" x2="57" y2="72" stroke="${p.stroke}" stroke-width="1.5" />
        <rect x="66" y="24" width="26" height="52" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="79" cy="46" r="10" fill="none" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="79" cy="46" r="3" fill="${p.stroke}" />
      `;

    case 'playback_rack':
    case 'stock_rack_unit':
      return `
        <rect x="12" y="16" width="76" height="68" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <line x1="20" y1="16" x2="20" y2="84" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="2 2" />
        <line x1="80" y1="16" x2="80" y2="84" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="2 2" />
        <rect x="22" y="23" width="56" height="14" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <rect x="22" y="42" width="56" height="14" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <rect x="22" y="61" width="56" height="14" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="28" cy="30" r="2" fill="${p.strokeAccent}" />
        <circle cx="28" cy="49" r="2" fill="${p.strokeAccent}" />
        <circle cx="28" cy="68" r="2" fill="${p.strokeAccent}" />
      `;

    // ------------------------------------------------------------------
    // 4. VOCALS, HORNS & STRINGS
    // ------------------------------------------------------------------
    case 'vocal_straight_stand':
    case 'wireless_handheld':
      return `
        <circle cx="50" cy="54" r="19" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <circle cx="50" cy="54" r="6" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="50" y1="54" x2="50" y2="20" stroke="${p.stroke}" stroke-width="2.4" stroke-linecap="round" />
        <ellipse cx="50" cy="14" rx="5.5" ry="7.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <line x1="45" y1="14" x2="55" y2="14" stroke="${p.stroke}" stroke-width="0.9" />
      `;

    case 'vocal_boom_stand':
    case 'vocal_short_boom':
    case 'stock_mic_stand_generic':
      return `
        ${tripodBase(50, 62, 22, p.strokeMuted)}
        <line x1="50" y1="62" x2="50" y2="18" stroke="${p.stroke}" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="50" cy="62" r="4.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <rect x="47.5" y="72" width="5" height="9" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <ellipse cx="50" cy="12" rx="5" ry="7" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <line x1="45.5" y1="12" x2="54.5" y2="12" stroke="${p.stroke}" stroke-width="0.9" />
      `;

    case 'horn_sax_trumpet':
      return `
        <circle cx="50" cy="54" r="32" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1" stroke-dasharray="3 3" />
        <!-- Crisp conical saxophone silhouette -->
        <path d="M 31 24 L 38 25 C 43 25 46 28 46.5 33 L 48.5 64 C 49 74 58 75 61 66 L 63 54 L 68 48 L 69 48 C 67 60 66 70 62 76 C 55 83 43 79 42 66 L 42 33 C 42 30 39 28 31 27 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.3" stroke-linejoin="round" />
        <ellipse cx="66" cy="48" rx="7.5" ry="3" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.3" transform="rotate(14 66 48)" />
        <circle cx="45" cy="42" r="1.4" fill="${p.strokeAccent}" />
        <circle cx="45.5" cy="49" r="1.4" fill="${p.strokeAccent}" />
        <circle cx="46" cy="56" r="1.4" fill="${p.strokeAccent}" />
        <!-- Overhead horn clip/boom mic marker -->
        <line x1="50" y1="22" x2="50" y2="12" stroke="${p.strokeMuted}" stroke-width="1.4" />
        <ellipse cx="50" cy="11" rx="4.5" ry="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
      `;

    case 'strings_violin_cello':
      return `
        <circle cx="50" cy="52" r="32" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1" stroke-dasharray="3 3" />
        <!-- Classic bowed string silhouette with C-bout corners -->
        <path d="M 48 34 C 41 34 38 40 39 47 C 40 49 42 49 43 49 C 41.5 52 41.5 56 43 58 C 39 59 36 64 37 71 C 38 77 44 79 50 79 C 56 79 62 77 63 71 C 64 64 61 59 57 58 C 58.5 56 58.5 52 57 49 C 58 49 60 49 61 47 C 62 40 59 34 52 34 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <polygon points="48.8,19 51.2,19 52,51 48,51" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="50" cy="16" r="2.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="46" y1="60" x2="54" y2="60" stroke="${p.stroke}" stroke-width="1.3" />
        <polygon points="48.5,64 51.5,64 50.8,76 49.2,76" fill="${p.stroke}" />
      `;

    // ------------------------------------------------------------------
    // 5. MONITORS, WEDGES, SIDE FILLS & IEMs
    // ------------------------------------------------------------------
    case 'monitor_wedge_standard':
    case 'monitor_wedge_low_profile':
    case 'stock_wedge_array':
      return `
        <polygon points="10,16 90,16 82,84 18,84" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.6" />
        <line x1="12" y1="30" x2="88" y2="30" stroke="${p.strokeMonitor}" stroke-width="1" opacity="0.7" />
        <circle cx="38" cy="56" r="15" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" opacity="0.65" />
        <circle cx="38" cy="56" r="5" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="0.9" />
        <rect x="58" y="45" width="18" height="20" rx="2" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" opacity="0.65" />
        <path d="M 24 8 Q 50 1 76 8" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" stroke-dasharray="2.5 2.5" opacity="0.8" />
        ${
          opts.wedgeLabel
            ? `<rect x="16" y="39" width="68" height="22" rx="2" fill="${p.bgCard}" fill-opacity="0.88" stroke="${p.strokeMonitor}" stroke-width="0.8" />
               <text x="50" y="54" text-anchor="middle" fill="${p.text}" font-size="11" font-weight="800" font-family="sans-serif">${escapeXml(
                 opts.wedgeLabel.slice(0, 12)
               )}</text>`
            : ''
        }
      `;

    case 'drum_monitor_sub':
    case 'side_fill_rig':
      return `
        <rect x="10" y="14" width="80" height="72" rx="3" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.6" />
        ${speakerCone(50, 50, 25, { ...p, stroke: p.strokeMonitor, fill: p.fillMonitor })}
        <path d="M 22 6 Q 50 -1 78 6" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" stroke-dasharray="3 3" />
      `;

    case 'iem_pack_station':
    case 'stock_rf_antenna_cart':
      return `
        <rect x="12" y="22" width="76" height="58" rx="3" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.5" />
        <polygon points="24,22 32,8 40,22" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <polygon points="60,22 68,8 76,22" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <rect x="18" y="35" width="64" height="14" rx="1.5" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" />
        <rect x="18" y="54" width="64" height="14" rx="1.5" fill="none" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="50" y="45" text-anchor="middle" fill="${p.text}" font-size="8" font-weight="800" font-family="monospace">RF / IEM</text>
      `;

    // ------------------------------------------------------------------
    // 6. AUDIO PATCH, SNAKES, SPLITS & DI BOXES
    // ------------------------------------------------------------------
    case 'drop_snake_subbox':
    case 'stage_box_digital':
    case 'stock_stage_box_split':
      return `
        <rect x="10" y="20" width="80" height="60" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <rect x="34" y="14" width="32" height="6" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        ${[24, 41, 59, 76]
          .map(
            (x) =>
              `<circle cx="${x}" cy="39" r="4.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />` +
              `<circle cx="${x}" cy="60" r="4.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />`
          )
          .join('')}
      `;

    case 'foh_mon_split_rack':
      return `
        <rect x="8" y="14" width="84" height="72" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="14" y="20" width="72" height="24" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <text x="50" y="35" text-anchor="middle" fill="${p.text}" font-size="9" font-weight="900" font-family="monospace">FOH SPLIT</text>
        <line x1="14" y1="50" x2="86" y2="50" stroke="${p.strokeMuted}" stroke-width="1" stroke-dasharray="3 2" />
        <rect x="14" y="56" width="72" height="24" rx="2" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="50" y="71" text-anchor="middle" fill="${p.text}" font-size="9" font-weight="900" font-family="monospace">MON SPLIT</text>
      `;

    case 'direct_injection_box':
    case 'stock_di_interface':
      return `
        <rect x="14" y="24" width="72" height="52" rx="4" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" />
        <circle cx="28" cy="50" r="4.5" fill="none" stroke="${p.stroke}" stroke-width="1.2" />
        <circle cx="72" cy="50" r="5" fill="none" stroke="${p.stroke}" stroke-width="1.2" />
        <text x="50" y="55" text-anchor="middle" fill="${p.text}" font-size="16" font-weight="900" font-family="monospace">DI</text>
      `;

    // ------------------------------------------------------------------
    // 7. GLOBAL / US / UK / EU POWER CONNECTORS & DISTRO
    // ------------------------------------------------------------------
    case 'ac_power_drop_quad':
    case 'power_edison_quad':
      return `
        <rect x="8" y="10" width="84" height="80" rx="8" fill="${p.fillPower}" stroke="${p.strokePower}" stroke-width="1.8" />
        <!-- Quad duplex NEMA 5-15/20 faces -->
        ${[
          [31, 31],
          [69, 31],
          [31, 57],
          [69, 57],
        ]
          .map(
            ([x, y]) => `
            <circle cx="${x}" cy="${y}" r="10.5" fill="${p.bgCard}" fill-opacity="0.55" stroke="${p.strokePower}" stroke-width="1" />
            <line x1="${x - 3.5}" y1="${y - 4.5}" x2="${x - 3.5}" y2="${y + 0.5}" stroke="${p.strokePower}" stroke-width="1.4" />
            <line x1="${x + 3.5}" y1="${y - 4.5}" x2="${x + 3.5}" y2="${y + 0.5}" stroke="${p.strokePower}" stroke-width="1.4" />
            <circle cx="${x}" cy="${y + 4.5}" r="1.7" fill="${p.strokePower}" />
          `
          )
          .join('')}
        <rect x="16" y="73" width="68" height="12" rx="2" fill="${p.bgCard}" fill-opacity="0.9" stroke="${p.strokePower}" stroke-width="0.8" />
        <text x="50" y="82" text-anchor="middle" fill="${p.strokePower}" font-size="8" font-weight="900" font-family="monospace">EDISON 120V</text>
      `;

    case 'power_l5_20':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        'L5-20 120V',
        `
          <path d="M 41 34 A 12 12 0 0 1 59 34" fill="none" stroke="${p.strokePower}" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 38 44 A 13 13 0 0 0 47 55" fill="none" stroke="${p.strokePower}" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 62 44 A 13 13 0 0 1 53 55" fill="none" stroke="${p.strokePower}" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="50" cy="43" r="3" fill="none" stroke="${p.strokePower}" stroke-width="1" />
        `
      );

    case 'power_l5_30':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        'L5-30 120V',
        `
          <path d="M 40 33 A 13 13 0 0 1 60 33" fill="none" stroke="${p.strokePower}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 36 44 A 14 14 0 0 0 47 56" fill="none" stroke="${p.strokePower}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 64 44 A 14 14 0 0 1 53 56" fill="none" stroke="${p.strokePower}" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="50" cy="43" r="4" fill="${p.fillStrong}" stroke="${p.strokePower}" stroke-width="1" />
        `
      );

    case 'power_l14_30':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        'L14-30 240V',
        `
          <path d="M 42 30 A 13 13 0 0 1 58 30" fill="none" stroke="${p.strokePower}" stroke-width="2.2" />
          <path d="M 42 56 A 13 13 0 0 0 58 56" fill="none" stroke="${p.strokePower}" stroke-width="2.2" />
          <path d="M 37 36 A 13 13 0 0 0 37 50" fill="none" stroke="${p.strokePower}" stroke-width="2.2" />
          <path d="M 63 36 A 13 13 0 0 1 63 50" fill="none" stroke="${p.strokePower}" stroke-width="2.2" />
          <circle cx="50" cy="43" r="3.5" fill="none" stroke="${p.strokePower}" stroke-width="1" />
        `
      );

    case 'power_14_50':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        '14-50 50A',
        `
          <rect x="35" y="39" width="3.5" height="9" fill="${p.strokePower}" />
          <rect x="61.5" y="39" width="3.5" height="9" fill="${p.strokePower}" />
          <rect x="48.2" y="29" width="3.5" height="8" fill="${p.strokePower}" />
          <circle cx="50" cy="54" r="3.2" fill="${p.strokePower}" />
        `
      );

    case 'power_cam_lok':
      return `
        <rect x="8" y="14" width="84" height="72" rx="5" fill="${p.fillPower}" stroke="${p.strokePower}" stroke-width="1.7" />
        <!-- 5 inline Cam-Lok feeder barrels (G, N, L1, L2, L3) -->
        ${[
          { x: 18, code: 'G', col: '#22c55e' },
          { x: 34, code: 'N', col: '#e2e8f0' },
          { x: 50, code: 'L1', col: '#94a3b8' },
          { x: 66, code: 'L2', col: '#f87171' },
          { x: 82, code: 'L3', col: '#60a5fa' },
        ]
          .map(
            ({ x, code, col }) => `
            <circle cx="${x}" cy="41" r="6.5" fill="${p.bgCard}" stroke="${opts.theme === 'dark' ? col : p.strokePower}" stroke-width="1.8" />
            <circle cx="${x}" cy="41" r="2.2" fill="${opts.theme === 'dark' ? col : p.strokePower}" />
            <text x="${x}" y="57" text-anchor="middle" fill="${p.text}" font-size="6.5" font-weight="800" font-family="monospace">${code}</text>
          `
          )
          .join('')}
        <rect x="14" y="66" width="72" height="14" rx="2" fill="${p.bgCard}" fill-opacity="0.9" stroke="${p.strokePower}" stroke-width="0.8" />
        <text x="50" y="76" text-anchor="middle" fill="${p.strokePower}" font-size="8.5" font-weight="900" font-family="monospace">CAM-LOK 3Ø</text>
      `;

    case 'power_uk_13a':
      return `
        <rect x="10" y="10" width="80" height="80" rx="6" fill="${p.fillPower}" stroke="${p.strokePower}" stroke-width="1.8" />
        <rect x="20" y="18" width="60" height="46" rx="4" fill="${p.bgCard}" fill-opacity="0.45" stroke="${p.strokePower}" stroke-width="1.2" />
        <!-- Rectangular UK BS 1363 earth + L + N slots -->
        <rect x="47.5" y="24" width="5" height="9" fill="${p.strokePower}" />
        <rect x="30" y="45" width="9" height="4.5" fill="${p.strokePower}" />
        <rect x="61" y="45" width="9" height="4.5" fill="${p.strokePower}" />
        <!-- Switched rocker indicator -->
        <rect x="66" y="23" width="8" height="10" rx="1" fill="${p.fillStrong}" stroke="${p.strokePower}" stroke-width="0.9" />
        <rect x="18" y="70" width="64" height="14" rx="2" fill="${p.bgCard}" fill-opacity="0.9" stroke="${p.strokePower}" stroke-width="0.8" />
        <text x="50" y="80" text-anchor="middle" fill="${p.strokePower}" font-size="8.5" font-weight="900" font-family="monospace">UK 13A 230V</text>
      `;

    case 'power_schuko':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        'SCHUKO 16A',
        `
          <!-- Dual circular EU pin holes + top/bottom earth clips -->
          <rect x="48" y="25" width="4" height="5" fill="${p.strokePower}" />
          <rect x="48" y="56" width="4" height="5" fill="${p.strokePower}" />
          <circle cx="38" cy="43" r="3.2" fill="${p.strokePower}" />
          <circle cx="62" cy="43" r="3.2" fill="${p.strokePower}" />
        `
      );

    case 'power_cee_16a_blue':
      return roundPowerHousing(
        p,
        p.fillCeeBlue,
        p.strokeCeeBlue,
        'CEE 16A 1Ø',
        `
          <!-- 3-pin 2P+E 6h CEEform Blue -->
          <circle cx="39" cy="36" r="3.2" fill="${p.strokeCeeBlue}" />
          <circle cx="61" cy="36" r="3.2" fill="${p.strokeCeeBlue}" />
          <circle cx="50" cy="54" r="4" fill="${p.strokeCeeBlue}" />
          <rect x="47" y="61" width="6" height="4" fill="${p.strokeCeeBlue}" />
        `
      );

    case 'power_cee_32a_blue':
      return roundPowerHousing(
        p,
        p.fillCeeBlue,
        p.strokeCeeBlue,
        'CEE 32A 1Ø',
        `
          <circle cx="37" cy="35" r="3.8" fill="${p.strokeCeeBlue}" />
          <circle cx="63" cy="35" r="3.8" fill="${p.strokeCeeBlue}" />
          <circle cx="50" cy="54" r="4.6" fill="${p.strokeCeeBlue}" />
          <rect x="46.5" y="61" width="7" height="4" fill="${p.strokeCeeBlue}" />
        `
      );

    case 'power_cee_16a_red':
      return roundPowerHousing(
        p,
        p.fillCeeRed,
        p.strokeCeeRed,
        'CEE 16A 3Ø',
        `
          <!-- 5-pin 3P+N+E 6h CEEform Red -->
          <circle cx="50" cy="30" r="2.7" fill="${p.strokeCeeRed}" />
          <circle cx="62" cy="39" r="2.7" fill="${p.strokeCeeRed}" />
          <circle cx="38" cy="39" r="2.7" fill="${p.strokeCeeRed}" />
          <circle cx="59" cy="53" r="2.7" fill="${p.strokeCeeRed}" />
          <circle cx="41" cy="53" r="3.5" fill="${p.strokeCeeRed}" />
          <rect x="47" y="61" width="6" height="3.5" fill="${p.strokeCeeRed}" />
        `
      );

    case 'power_cee_32a_red':
      return roundPowerHousing(
        p,
        p.fillCeeRed,
        p.strokeCeeRed,
        'CEE 32A 3Ø',
        `
          <circle cx="50" cy="29" r="3.1" fill="${p.strokeCeeRed}" />
          <circle cx="63" cy="39" r="3.1" fill="${p.strokeCeeRed}" />
          <circle cx="37" cy="39" r="3.1" fill="${p.strokeCeeRed}" />
          <circle cx="59" cy="54" r="3.1" fill="${p.strokeCeeRed}" />
          <circle cx="41" cy="54" r="4" fill="${p.strokeCeeRed}" />
          <rect x="46.5" y="61" width="7" height="3.8" fill="${p.strokeCeeRed}" />
        `
      );

    case 'power_cee_63a_red':
      return roundPowerHousing(
        p,
        p.fillCeeRed,
        p.strokeCeeRed,
        'CEE 63A 3Ø',
        `
          <circle cx="50" cy="28" r="3.5" fill="${p.strokeCeeRed}" />
          <circle cx="64" cy="39" r="3.5" fill="${p.strokeCeeRed}" />
          <circle cx="36" cy="39" r="3.5" fill="${p.strokeCeeRed}" />
          <circle cx="60" cy="54" r="3.5" fill="${p.strokeCeeRed}" />
          <circle cx="40" cy="54" r="4.3" fill="${p.strokeCeeRed}" />
          <circle cx="50" cy="43" r="2" fill="none" stroke="${p.strokeCeeRed}" stroke-width="1" />
        `
      );

    case 'power_powercon_20a':
      return roundPowerHousing(
        p,
        p.fillCeeBlue,
        p.strokeCeeBlue,
        'PCON 20A',
        `
          <!-- Neutrik PowerCON keyed D-chassis -->
          <circle cx="50" cy="43" r="11" fill="${p.fillStrong}" stroke="${p.strokeCeeBlue}" stroke-width="1.3" />
          <rect x="48" y="29" width="4" height="5" fill="${p.strokeCeeBlue}" />
          <circle cx="45" cy="43" r="2.2" fill="${p.strokeCeeBlue}" />
          <circle cx="55" cy="43" r="2.2" fill="${p.strokeCeeBlue}" />
          <circle cx="50" cy="49" r="2" fill="${p.strokeCeeBlue}" />
        `
      );

    case 'power_powercon_true1':
      return roundPowerHousing(
        p,
        p.fillPower,
        p.strokePower,
        'TRUE1 20A',
        `
          <!-- Neutrik PowerCON TRUE1 yellow/amber breaking keyway -->
          <rect x="38" y="31" width="24" height="24" rx="5" fill="${p.fillStrong}" stroke="${p.strokePower}" stroke-width="1.3" />
          <rect x="43" y="38" width="3.5" height="9" fill="${p.strokePower}" />
          <rect x="53.5" y="38" width="3.5" height="9" fill="${p.strokePower}" />
          <rect x="48.5" y="45" width="3" height="6" fill="${p.strokePower}" />
        `
      );

    case 'power_distro_rack':
    case 'stock_power_distro_box':
      return `
        <rect x="8" y="12" width="84" height="76" rx="4" fill="${p.fillPower}" stroke="${p.strokePower}" stroke-width="1.8" />
        <!-- Phase indicator LEDs -->
        <circle cx="22" cy="24" r="3" fill="#ef4444" stroke="${p.strokePower}" stroke-width="0.7" />
        <circle cx="34" cy="24" r="3" fill="#f59e0b" stroke="${p.strokePower}" stroke-width="0.7" />
        <circle cx="46" cy="24" r="3" fill="#38bdf8" stroke="${p.strokePower}" stroke-width="0.7" />
        <!-- Digital Voltmeter display -->
        <rect x="56" y="19" width="28" height="10" rx="1.5" fill="${p.bgCard}" stroke="${p.strokePower}" stroke-width="0.9" />
        <!-- Breaker row -->
        ${[18, 30, 42, 54, 66, 78]
          .map((x) => `<rect x="${x - 3}" y="38" width="6" height="16" rx="1" fill="${p.bgCard}" stroke="${p.strokePower}" stroke-width="1" /><line x1="${x - 2}" y1="45" x2="${x + 2}" y2="45" stroke="${p.strokePower}" stroke-width="1.5" />`)
          .join('')}
        <rect x="14" y="64" width="72" height="16" rx="2" fill="${p.bgCard}" fill-opacity="0.9" stroke="${p.strokePower}" stroke-width="0.9" />
        <text x="50" y="75" text-anchor="middle" fill="${p.strokePower}" font-size="9" font-weight="900" font-family="monospace">POWER DISTRO</text>
      `;

    // ------------------------------------------------------------------
    // 8. STOCK CAD SHAPES FOR CUSTOM OBJECT BUILDER
    // ------------------------------------------------------------------
    case 'stock_console_desk':
      return `
        <rect x="6" y="16" width="88" height="68" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <!-- Meter bridge / screens -->
        <rect x="12" y="21" width="34" height="16" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <rect x="54" y="21" width="34" height="16" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <!-- Fader banks -->
        ${[16, 23, 30, 37, 44, 54, 61, 68, 75, 82]
          .map((x) => `<line x1="${x}" y1="45" x2="${x}" y2="75" stroke="${p.stroke}" stroke-width="1" opacity="0.7" /><rect x="${x - 2}" y="${50 + (x % 15)}" width="4" height="4" fill="${p.strokeAccent}" />`)
          .join('')}
      `;

    case 'stock_tech_table':
      return `
        <rect x="6" y="20" width="88" height="60" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <line x1="12" y1="26" x2="88" y2="26" stroke="${p.strokeMuted}" stroke-width="0.8" />
        <rect x="16" y="34" width="30" height="22" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <rect x="54" y="34" width="30" height="32" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
      `;

    case 'stock_performer_zone':
      return `
        <circle cx="50" cy="50" r="38" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" stroke-dasharray="6 4" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="${p.strokeMuted}" stroke-width="0.8" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.5" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.5" />
        <circle cx="50" cy="50" r="5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
      `;

    case 'stock_video_led':
      return `
        <rect x="6" y="24" width="88" height="52" rx="2" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="12" y="30" width="76" height="40" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <line x1="12" y1="30" x2="88" y2="70" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.5" />
        <line x1="88" y1="30" x2="12" y2="70" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.5" />
      `;

    case 'stock_road_case':
      return `
        <rect x="10" y="16" width="80" height="68" rx="3" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <!-- Ball corners & butterfly latches -->
        <path d="M 10 26 L 20 26 L 20 16" fill="none" stroke="${p.stroke}" stroke-width="1.4" />
        <path d="M 80 16 L 80 26 L 90 26" fill="none" stroke="${p.stroke}" stroke-width="1.4" />
        <path d="M 10 74 L 20 74 L 20 84" fill="none" stroke="${p.stroke}" stroke-width="1.4" />
        <path d="M 80 84 L 80 74 L 90 74" fill="none" stroke="${p.stroke}" stroke-width="1.4" />
        <rect x="44" y="14" width="12" height="6" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" />
        <rect x="44" y="80" width="12" height="6" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="0.9" />
        <line x1="16" y1="50" x2="84" y2="50" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="3 3" />
      `;

    case 'stock_utility_crate':
      return `
        <rect x="10" y="14" width="80" height="72" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="16" y="20" width="68" height="60" rx="2" fill="none" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="4 3" />
        <circle cx="50" cy="50" r="10" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="50" y1="36" x2="50" y2="64" stroke="${p.stroke}" stroke-width="1" />
        <line x1="36" y1="50" x2="64" y2="50" stroke="${p.stroke}" stroke-width="1" />
      `;

    // ------------------------------------------------------------------
    // 9. TELEPROMPTER, STOOLS, MUSIC STANDS & RISERS
    // ------------------------------------------------------------------
    case 'teleprompter':
      return `
        <polygon points="10,20 90,20 82,80 18,80" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="21" y="27" width="58" height="44" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <text x="50" y="53" text-anchor="middle" fill="${p.text}" font-size="8.5" font-weight="900" font-family="sans-serif" letter-spacing="0.4">PROMPTER</text>
      `;

    case 'bar_stool':
      return `
        <line x1="50" y1="50" x2="22" y2="22" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <line x1="50" y1="50" x2="78" y2="22" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <line x1="50" y1="50" x2="22" y2="78" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <line x1="50" y1="50" x2="78" y2="78" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <circle cx="50" cy="50" r="24" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.6" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="${p.stroke}" stroke-width="0.7" stroke-dasharray="3 2" />
      `;

    case 'music_stand':
      return `
        ${tripodBase(50, 62, 18, p.strokeMuted)}
        <rect x="18" y="24" width="64" height="30" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <line x1="24" y1="34" x2="76" y2="34" stroke="${p.stroke}" stroke-width="0.8" opacity="0.6" />
        <line x1="24" y1="42" x2="76" y2="42" stroke="${p.stroke}" stroke-width="0.8" opacity="0.6" />
      `;

    case 'drum_riser_8x8':
    case 'riser_generic_8x4':
    case 'riser_generic_6x4':
    case 'stock_riser_platform':
      return `
        <rect x="2" y="2" width="96" height="96" rx="1" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="1.5" />
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="${p.strokeMuted}" stroke-width="0.7" stroke-dasharray="4 3" />
        <path d="M 2 14 L 2 2 L 14 2" fill="none" stroke="${p.stroke}" stroke-width="2" />
        <path d="M 86 2 L 98 2 L 98 14" fill="none" stroke="${p.stroke}" stroke-width="2" />
        <path d="M 2 86 L 2 98 L 14 98" fill="none" stroke="${p.stroke}" stroke-width="2" />
        <path d="M 86 98 L 98 98 L 98 86" fill="none" stroke="${p.stroke}" stroke-width="2" />
        <text x="50" y="92" text-anchor="middle" fill="${p.textMuted}" font-size="7" font-weight="700" font-family="monospace">${labelText.toUpperCase() || 'STAGE RISER'}</text>
      `;

    // ------------------------------------------------------------------
    // 10. GENERIC POWER (LIGHTNING BOLT)
    // ------------------------------------------------------------------
    case 'power_generic_bolt':
    case 'stock_power_bolt':
      return `
        <rect x="14" y="10" width="72" height="72" rx="10" fill="${p.fillPower}" stroke="${p.strokePower}" stroke-width="2" />
        <rect x="20" y="16" width="60" height="60" rx="6" fill="none" stroke="${p.strokePower}" stroke-width="0.9" stroke-dasharray="3 2.5" opacity="0.65" />
        <polygon points="55,19 33,50 48,50 43,73 67,41 51,41" fill="${p.strokePower}" stroke="${p.bgCard}" stroke-width="1.2" stroke-linejoin="round" />
        <text x="50" y="95" text-anchor="middle" fill="${p.strokePower}" font-size="8.5" font-weight="900" font-family="monospace">POWER</text>
      `;

    // ------------------------------------------------------------------
    // 11. HEADPHONES & IN-EAR MONITORS (IEMS)
    // ------------------------------------------------------------------
    case 'headphones_monitoring':
    case 'stock_headphones':
      return `
        <!-- Padded studio headband -->
        <path d="M 20 50 C 20 19 80 19 80 50" fill="none" stroke="${p.strokeMonitor}" stroke-width="4.2" stroke-linecap="round" />
        <path d="M 24 49 C 24 25 76 25 76 49" fill="none" stroke="${p.bgCard}" stroke-width="1.2" opacity="0.85" />
        <!-- Yoke hinges -->
        <rect x="17" y="45" width="6" height="7" rx="1.5" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.1" />
        <rect x="77" y="45" width="6" height="7" rx="1.5" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.1" />
        <!-- Left & right angled closed-back earcups + plush pads -->
        <rect x="13" y="51" width="14" height="28" rx="6" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.7" />
        <rect x="24" y="53" width="6.5" height="24" rx="3" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <rect x="73" y="51" width="14" height="28" rx="6" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.7" />
        <rect x="69.5" y="53" width="6.5" height="24" rx="3" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <!-- Left-entry coiled cord -->
        <path d="M 20 79 C 20 87 28 89 34 89" fill="none" stroke="${p.strokeMuted}" stroke-width="1.5" stroke-linecap="round" />
        <text x="50" y="95" text-anchor="middle" fill="${p.textMuted}" font-size="7.2" font-weight="800" font-family="monospace">PHONES</text>
      `;

    case 'iem_earpieces':
    case 'stock_iem_ears':
      return `
        <!-- Over-ear memory wire loops (clean mirrored arcs) -->
        <path d="M 25 44 C 17 24 38 14 45 31 L 43 40" fill="none" stroke="${p.strokeMonitor}" stroke-width="1.7" stroke-linecap="round" />
        <path d="M 75 44 C 83 24 62 14 55 31 L 57 40" fill="none" stroke="${p.strokeMonitor}" stroke-width="1.7" stroke-linecap="round" />
        <!-- Left custom-molded IEM shell & acoustic nozzle -->
        <path d="M 25 43 C 18 46 18 58 26 62 C 33 66 42 61 43 53 C 44 45 35 39 25 43 Z" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.7" />
        <path d="M 41 47 L 47 44 L 48 48 L 42 52 Z" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.1" />
        <circle cx="29" cy="52" r="4.5" fill="${p.bgCard}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="29" y="54.2" text-anchor="middle" fill="${p.strokeMonitor}" font-size="6" font-weight="900" font-family="monospace">L</text>
        <!-- Right custom-molded IEM shell & acoustic nozzle -->
        <path d="M 75 43 C 82 46 82 58 74 62 C 67 66 58 61 57 53 C 56 45 65 39 75 43 Z" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.7" />
        <path d="M 59 47 L 53 44 L 52 48 L 58 52 Z" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.1" />
        <circle cx="71" cy="52" r="4.5" fill="${p.bgCard}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="71" y="54.2" text-anchor="middle" fill="${p.strokeMonitor}" font-size="6" font-weight="900" font-family="monospace">R</text>
        <!-- Braided Y-split cable & cinch -->
        <path d="M 28 63 C 31 74 42 77 50 78 C 58 77 69 74 72 63" fill="none" stroke="${p.strokeMuted}" stroke-width="1.4" />
        <rect x="47.5" y="75.5" width="5" height="5" rx="1" fill="${p.strokeMonitor}" />
        <line x1="50" y1="80.5" x2="50" y2="87" stroke="${p.strokeMuted}" stroke-width="1.6" />
        <text x="50" y="96" text-anchor="middle" fill="${p.textMuted}" font-size="7.2" font-weight="800" font-family="monospace">IEM EARS</text>
      `;

    case 'iem_bodypack_receiver':
    case 'stock_iem_bodypack':
      return `
        <line x1="34" y1="28" x2="34" y2="8" stroke="${p.strokeMonitor}" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="34" cy="8" r="2.4" fill="${p.strokeMonitor}" />
        <rect x="57" y="17" width="8" height="11" rx="1.5" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <rect x="69" y="21" width="6" height="7" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <rect x="24" y="28" width="52" height="58" rx="6" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="1.8" />
        <rect x="31" y="36" width="38" height="18" rx="2" fill="${p.bgCard}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="50" y="47" text-anchor="middle" fill="${p.strokeMonitor}" font-size="7.5" font-weight="900" font-family="monospace">CH 01</text>
        <circle cx="37" cy="66" r="3" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <circle cx="50" cy="66" r="3" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <circle cx="63" cy="66" r="3" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1" />
        <text x="50" y="81" text-anchor="middle" fill="${p.textMuted}" font-size="6.8" font-weight="800" font-family="monospace">IEM PACK</text>
      `;

    // ------------------------------------------------------------------
    // 12. INSTRUMENTS (GUITARS, STRINGS, BRASS, WOODWINDS, MALLETS)
    // ------------------------------------------------------------------
    case 'electric_guitar':
    case 'stock_electric_guitar':
      return `
        <g transform="rotate(-38 50 50)">
          <!-- Double-cutaway Stratocaster body -->
          <path d="M 47 52 C 45 48 42 44 39 45 C 36 46 34 52 36 58 C 38 62 39 64 36 68 C 31 73 32 82 39 87 C 44 90 56 90 61 87 C 68 82 69 73 64 68 C 61 64 62 62 64 58 C 66 54 64 49 61 49 C 58 49 55 51 53 53 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          <!-- Pickguard contour -->
          <path d="M 46 54 L 40 50 C 39 54 41 62 42 71 L 60 80 C 64 76 64 68 60 63 L 58 55 Z" fill="${p.fillStrong}" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.75" />
          <!-- Tapered neck & frets -->
          <polygon points="48,18 52,18 53,54 47,54" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          <line x1="48" y1="24" x2="52" y2="24" stroke="${p.strokeMuted}" stroke-width="0.6" />
          <line x1="47.8" y1="31" x2="52.2" y2="31" stroke="${p.strokeMuted}" stroke-width="0.6" />
          <line x1="47.6" y1="38" x2="52.4" y2="38" stroke="${p.strokeMuted}" stroke-width="0.6" />
          <line x1="47.3" y1="45" x2="52.7" y2="45" stroke="${p.strokeMuted}" stroke-width="0.6" />
          <!-- 6-in-line headstock & tuning keys -->
          <path d="M 48 18 L 46.5 8 C 46.5 5 52 4.5 53 7.5 C 53.6 9.5 52 12 52 18 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[8, 10, 12, 14, 16]
            .map((ty) => `<circle cx="45.2" cy="${ty}" r="0.9" fill="${p.stroke}" />`)
            .join('')}
          <!-- 3 single-coil pickups (angled bridge pickup) -->
          <rect x="44.5" y="57.5" width="11" height="2.8" rx="1.2" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
          <rect x="44.5" y="63.5" width="11" height="2.8" rx="1.2" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
          <rect x="44.5" y="69.5" width="11" height="2.8" rx="1.2" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" transform="rotate(-7 50 71)" />
          <!-- Tremolo bridge & control knobs -->
          <rect x="44" y="76" width="12" height="3.8" rx="0.8" fill="${p.stroke}" />
          <circle cx="58.5" cy="72" r="1.4" fill="${p.stroke}" />
          <circle cx="60.5" cy="76" r="1.4" fill="${p.stroke}" />
          <circle cx="58" cy="80" r="1.4" fill="${p.stroke}" />
          <!-- Subtle strings -->
          <line x1="49" y1="18" x2="48.5" y2="76" stroke="${p.stroke}" stroke-width="0.45" opacity="0.55" />
          <line x1="51" y1="18" x2="51.5" y2="76" stroke="${p.stroke}" stroke-width="0.45" opacity="0.55" />
        </g>
      `;

    case 'bass_guitar':
    case 'stock_bass_guitar':
      return `
        <g transform="rotate(-38 50 50)">
          <!-- Precision/Jazz Bass offset body with extended upper horn -->
          <path d="M 47.5 55 C 45 48 41 42 38 43 C 35 44 34 52 36 59 C 38 64 38 66 35 70 C 30 75 31 84 38 89 C 44 92 56 92 62 88 C 69 83 69 74 64 69 C 61 65 61 62 63 59 C 65 55 63 50 60 50 C 57 50 54 53 52.5 55 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          <!-- Pickguard -->
          <path d="M 46.5 56 L 39.5 49 C 38 54 40 64 42 73 L 61 81 C 64.5 76 64 68 60 64 L 58 56 Z" fill="${p.fillStrong}" stroke="${p.strokeMuted}" stroke-width="0.7" opacity="0.7" />
          <!-- Longer slender bass neck & frets -->
          <polygon points="48.2,15 51.8,15 52.6,56 47.4,56" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[22, 29, 36, 43, 50]
            .map((fy) => `<line x1="47.8" y1="${fy}" x2="52.2" y2="${fy}" stroke="${p.strokeMuted}" stroke-width="0.6" />`)
            .join('')}
          <!-- Bass headstock with 4 prominent clover tuners -->
          <path d="M 48.2 15 L 46.5 6 C 46.5 3.5 52.8 3.5 53.5 6.8 C 54 9 52 11 51.8 15 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[6, 8.6, 11.2, 13.8]
            .map((ty) => `<line x1="44.2" y1="${ty}" x2="47.2" y2="${ty}" stroke="${p.stroke}" stroke-width="1.1" /><circle cx="43.5" cy="${ty}" r="1.3" fill="${p.stroke}" />`)
            .join('')}
          <!-- Split-coil P-Bass pickup + J-Bass bridge pickup -->
          <rect x="44.2" y="63" width="5.3" height="3.2" rx="0.8" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
          <rect x="50.5" y="65.2" width="5.3" height="3.2" rx="0.8" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
          <rect x="44" y="72.5" width="12" height="3.2" rx="0.8" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
          <!-- Heavy bass bridge & knobs -->
          <rect x="43.5" y="79" width="13" height="4.2" rx="0.8" fill="${p.stroke}" />
          <circle cx="59" cy="75" r="1.4" fill="${p.stroke}" />
          <circle cx="60" cy="79.5" r="1.4" fill="${p.stroke}" />
          <!-- 4 bass strings -->
          <line x1="49" y1="15" x2="48.5" y2="79" stroke="${p.stroke}" stroke-width="0.55" opacity="0.6" />
          <line x1="51" y1="15" x2="51.5" y2="79" stroke="${p.stroke}" stroke-width="0.55" opacity="0.6" />
        </g>
      `;

    case 'acoustic_guitar':
    case 'stock_acoustic_guitar':
      return `
        <g transform="rotate(-35 50 50)">
          <!-- Symmetric dreadnought / auditorium body -->
          <path d="M 47 45 C 37 45 33 52 35 59 C 37 63 39 64 36 68 C 31 73 31 84 38 88 C 43 91 57 91 62 88 C 69 84 69 73 64 68 C 61 64 63 63 65 59 C 67 52 63 45 53 45 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
          <!-- Teardrop pickguard -->
          <path d="M 55.5 60 C 60.5 61 62.5 67 59.5 71 C 57 73 54.5 70 54.8 65 Z" fill="${p.fillStrong}" stroke="${p.strokeMuted}" stroke-width="0.7" />
          <!-- Tapered neck extending to soundhole -->
          <polygon points="48,17 52,17 52.8,53 47.2,53" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[23, 29, 35, 41, 47]
            .map((fy) => `<line x1="47.8" y1="${fy}" x2="52.2" y2="${fy}" stroke="${p.strokeMuted}" stroke-width="0.6" />`)
            .join('')}
          <!-- Classic 3+3 headstock & tuning pegs -->
          <rect x="46.2" y="7.5" width="7.6" height="9.5" rx="1.4" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[9.8, 12.4, 15]
            .map(
              (ty) =>
                `<line x1="44" y1="${ty}" x2="46.2" y2="${ty}" stroke="${p.stroke}" stroke-width="1.2" /><line x1="53.8" y1="${ty}" x2="56" y2="${ty}" stroke="${p.stroke}" stroke-width="1.2" />`
            )
            .join('')}
          <!-- Soundhole & concentric rosette -->
          <circle cx="50" cy="60" r="7.2" fill="none" stroke="${p.strokeMuted}" stroke-width="0.8" />
          <circle cx="50" cy="60" r="5.3" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.2" />
          <!-- Sculpted acoustic bridge -->
          <rect x="43" y="75.5" width="14" height="3.2" rx="1" fill="${p.stroke}" />
          <!-- Subtle strings -->
          <line x1="49" y1="17" x2="48.5" y2="75.5" stroke="${p.stroke}" stroke-width="0.45" opacity="0.55" />
          <line x1="51" y1="17" x2="51.5" y2="75.5" stroke="${p.stroke}" stroke-width="0.45" opacity="0.55" />
        </g>
      `;

    case 'upright_bass':
    case 'stock_upright_bass':
      return `
        <!-- Double bass body: sloped shoulders + crisp C-bout corners + full lower bout -->
        <path d="M 47 30 C 40 32 34 39 34 48 C 34 50 38 51 40 51 C 38 54 38 58 40 61 C 35 62 30 68 31 76 C 32 82 40 85 50 85 C 60 85 68 82 69 76 C 70 68 65 62 60 61 C 62 58 62 54 60 51 C 62 51 66 50 66 48 C 66 39 60 32 53 30 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
        <!-- Pegbox, carved scroll & 4 side tuning gears -->
        <path d="M 48.2 17 L 48.6 9.5 C 48.6 6.5 51.4 6.5 51.4 9.5 L 51.8 17 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <circle cx="50" cy="7.5" r="2.7" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="45" y1="11.5" x2="48.4" y2="11.5" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="45" y1="14.5" x2="48.2" y2="14.5" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="51.6" y1="11.5" x2="55" y2="11.5" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="51.8" y1="14.5" x2="55" y2="14.5" stroke="${p.stroke}" stroke-width="1.2" />
        <!-- Tapered ebony fingerboard -->
        <polygon points="48.2,17 51.8,17 53.2,55 46.8,55" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <!-- S-shaped f-holes -->
        <path d="M 42.5 57 C 40 59 42.5 63 39.8 68" fill="none" stroke="${p.strokeAccent}" stroke-width="1.2" stroke-linecap="round" />
        <path d="M 57.5 57 C 60 59 57.5 63 60.2 68" fill="none" stroke="${p.strokeAccent}" stroke-width="1.2" stroke-linecap="round" />
        <!-- Bridge & tapered tailpiece -->
        <line x1="44" y1="63" x2="56" y2="63" stroke="${p.stroke}" stroke-width="1.8" stroke-linecap="round" />
        <polygon points="47.2,68 52.8,68 51.4,83 48.6,83" fill="${p.stroke}" />
        <!-- Floor endpin & rubber tip -->
        <line x1="50" y1="85" x2="50" y2="95" stroke="${p.strokeMuted}" stroke-width="1.8" />
        <line x1="47.5" y1="95" x2="52.5" y2="95" stroke="${p.stroke}" stroke-width="1.6" stroke-linecap="round" />
      `;

    case 'cello_instrument':
    case 'stock_cello':
      return `
        <!-- Classic baroque cello body (rounded upper bouts + crisp C-bout corners) -->
        <path d="M 41 31 C 32 31 28 38 29 47 C 30 49 33 50 35 50 C 33 53 33 57 35 60 C 30 61 25 67 26 74 C 27 81 34 84 44 84 C 54 84 61 81 62 74 C 63 67 58 61 53 60 C 55 57 55 53 53 50 C 55 50 58 49 59 47 C 60 38 56 31 47 31 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
        <!-- Pegbox, scroll & 4 side pegs -->
        <rect x="42.4" y="10" width="3.2" height="8" rx="0.8" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <circle cx="44" cy="8.5" r="2.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="38.5" y1="12" x2="42.4" y2="12" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="38.5" y1="15" x2="42.4" y2="15" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="45.6" y1="12" x2="49.5" y2="12" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="45.6" y1="15" x2="49.5" y2="15" stroke="${p.stroke}" stroke-width="1.1" />
        <!-- Tapered fingerboard -->
        <polygon points="42.4,18 45.6,18 46.8,54 41.2,54" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <!-- f-holes -->
        <path d="M 37 56 C 35 58 37 62 34.8 67" fill="none" stroke="${p.strokeAccent}" stroke-width="1.1" stroke-linecap="round" />
        <path d="M 51 56 C 53 58 51 62 53.2 67" fill="none" stroke="${p.strokeAccent}" stroke-width="1.1" stroke-linecap="round" />
        <!-- Bridge, tailpiece & endpin -->
        <line x1="38.5" y1="62" x2="49.5" y2="62" stroke="${p.stroke}" stroke-width="1.6" stroke-linecap="round" />
        <polygon points="41.5,67 46.5,67 45.2,81.5 42.8,81.5" fill="${p.stroke}" />
        <line x1="44" y1="84" x2="44" y2="94" stroke="${p.strokeMuted}" stroke-width="1.6" />
        <line x1="42" y1="94" x2="46" y2="94" stroke="${p.stroke}" stroke-width="1.4" stroke-linecap="round" />
        <!-- Proper bow resting cleanly alongside (stick + tip + frog + hair) -->
        <g transform="rotate(6 76 52)">
          <line x1="77.5" y1="16" x2="77.5" y2="85" stroke="${p.stroke}" stroke-width="1.6" stroke-linecap="round" />
          <polygon points="73.5,16 78,16 78,19.5" fill="${p.stroke}" />
          <rect x="73.2" y="76" width="4.4" height="6.5" rx="0.8" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          <line x1="74.5" y1="18.5" x2="74.5" y2="79" stroke="${p.strokeAccent}" stroke-width="0.9" opacity="0.85" />
        </g>
      `;

    case 'violin_viola':
    case 'stock_violin':
      return `
        <g transform="rotate(-24 50 50)">
          <!-- Classic violin body with crisp C-bout corners -->
          <path d="M 41 35 C 33 35 29 41 30 49 C 31 51 34 52 36 52 C 34 55 34 59 36 61 C 31 62 27 67 28 74 C 29 80 35 83 44 83 C 53 83 59 80 60 74 C 61 67 57 62 52 61 C 54 59 54 55 52 52 C 54 52 57 51 58 49 C 59 41 55 35 47 35 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" stroke-linejoin="round" />
          <!-- Pegbox, scroll & 4 pegs -->
          <rect x="42.5" y="13" width="3" height="8" rx="0.8" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          <circle cx="44" cy="11.5" r="2.3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          <line x1="39" y1="15" x2="42.5" y2="15" stroke="${p.stroke}" stroke-width="1" />
          <line x1="39" y1="18" x2="42.5" y2="18" stroke="${p.stroke}" stroke-width="1" />
          <line x1="45.5" y1="15" x2="49" y2="15" stroke="${p.stroke}" stroke-width="1" />
          <line x1="45.5" y1="18" x2="49" y2="18" stroke="${p.stroke}" stroke-width="1" />
          <!-- Fingerboard -->
          <polygon points="42.6,21 45.4,21 46.5,56 41.5,56" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          <!-- f-holes -->
          <path d="M 37.5 58 C 35.8 60 37.5 63 35.8 67" fill="none" stroke="${p.strokeAccent}" stroke-width="1.1" stroke-linecap="round" />
          <path d="M 50.5 58 C 52.2 60 50.5 63 52.2 67" fill="none" stroke="${p.strokeAccent}" stroke-width="1.1" stroke-linecap="round" />
          <!-- Bridge, tailpiece & chinrest -->
          <line x1="39" y1="63" x2="49" y2="63" stroke="${p.stroke}" stroke-width="1.5" stroke-linecap="round" />
          <polygon points="42,67.5 46,67.5 45,80.5 43,80.5" fill="${p.stroke}" />
          <ellipse cx="35.5" cy="77.5" rx="5.2" ry="3.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" transform="rotate(14 35.5 77.5)" />
          <!-- Proper violin bow parallel beside body -->
          <line x1="72" y1="18" x2="72" y2="83" stroke="${p.stroke}" stroke-width="1.5" stroke-linecap="round" />
          <polygon points="68.5,18 72.5,18 72.5,21" fill="${p.stroke}" />
          <rect x="68.2" y="75" width="4" height="5.5" rx="0.7" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          <line x1="69.5" y1="20" x2="69.5" y2="77.5" stroke="${p.strokeAccent}" stroke-width="0.9" opacity="0.85" />
        </g>
      `;

    case 'saxophone':
    case 'stock_saxophone':
      return `
        <!-- Mouthpiece & curved swan-neck -->
        <path d="M 22 15 L 30 14 L 31 18 L 23 18.5 Z" fill="${p.stroke}" />
        <path d="M 30 15.5 C 39 14 45 17 46 25" fill="none" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round" />
        <path d="M 36 14 C 39 11 43 13 44 17" fill="none" stroke="${p.strokeMuted}" stroke-width="0.9" />
        <!-- True conical-bore body + bottom U-bow + flared bell silhouette -->
        <path d="M 43.2 25 L 43.8 68 C 44 82 54 89 64 85 C 72 82 74 73 75 63 C 76 56 79 50 83 45 L 59 42 C 62 49 62 56 61.5 64 C 61 71 58.5 75 55.5 75 C 52.5 75 51.5 71 51.2 65 L 48.6 25 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
        <!-- Bell rim elliptical opening -->
        <ellipse cx="71" cy="43.5" rx="12.2" ry="4.2" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.6" transform="rotate(8 71 43.5)" />
        <ellipse cx="71" cy="43.5" rx="9" ry="2.4" fill="${p.fillStrong}" opacity="0.7" transform="rotate(8 71 43.5)" />
        <!-- Bell-to-body brace & bow guard -->
        <line x1="50.5" y1="60" x2="62" y2="59" stroke="${p.stroke}" stroke-width="1.6" />
        <path d="M 44 74 C 46 84 55 88 64 85" fill="none" stroke="${p.strokeAccent}" stroke-width="1" stroke-dasharray="2.5 2" />
        <!-- Key stack pearls -->
        <circle cx="46.5" cy="33" r="1.9" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.1" />
        <circle cx="46.8" cy="40.5" r="1.9" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.1" />
        <circle cx="47.1" cy="48" r="1.9" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.1" />
        <circle cx="47.4" cy="55.5" r="1.9" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.1" />
        <circle cx="47.8" cy="63" r="1.9" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.1" />
      `;

    case 'trumpet_brass':
    case 'stock_trumpet':
      return `
        <g transform="rotate(-28 50 50)">
          <!-- Mouthpiece -->
          <path d="M 7 44 L 15 46.8 L 15 49.2 L 7 52 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="7" y1="43.5" x2="7" y2="52.5" stroke="${p.stroke}" stroke-width="1.6" stroke-linecap="round" />
          <!-- Tuning slide & lower brass loop -->
          <path d="M 24 49.2 L 24 57 C 24 60 27 61 31 61 L 67 61 C 72 61 74 58.5 74 55 C 74 51.5 72 49.2 67 49.2" fill="none" stroke="${p.stroke}" stroke-width="2.2" stroke-linecap="round" />
          <line x1="29" y1="55.5" x2="65" y2="55.5" stroke="${p.stroke}" stroke-width="1.8" />
          <!-- Main leadpipe & smooth exponentially flared brass bell -->
          <path d="M 15 46.6 L 61 46.6 C 73 46.6 81 42 90 32 L 91 32 L 91 64 L 90 64 C 81 54 73 49.4 61 49.4 L 15 49.4 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" stroke-linejoin="round" />
          <!-- Bell opening ellipse -->
          <ellipse cx="90.5" cy="48" rx="2.2" ry="16" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.4" />
          <!-- 3 Piston valve casings + top finger buttons -->
          ${[39.5, 45.5, 51.5]
            .map(
              (vx) => `
              <rect x="${vx}" y="44" width="3.8" height="19" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
              <line x1="${vx + 1.9}" y1="39.5" x2="${vx + 1.9}" y2="44" stroke="${p.stroke}" stroke-width="1.2" />
              <rect x="${vx - 0.5}" y="38" width="4.8" height="2" rx="0.8" fill="${p.strokeAccent}" />
            `
            )
            .join('')}
          <!-- Finger ring & pinky hook -->
          <circle cx="31.5" cy="43.5" r="2.6" fill="none" stroke="${p.stroke}" stroke-width="1.1" />
          <path d="M 59 46.5 C 59 42.5 64 42.5 64 45.5" fill="none" stroke="${p.stroke}" stroke-width="1.2" stroke-linecap="round" />
        </g>
      `;

    case 'trombone_brass':
    case 'stock_trombone':
      return `
        <g transform="rotate(-28 50 50)">
          <!-- Mouthpiece -->
          <path d="M 14 50.5 L 21 52 L 21 54 L 14 55.5 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
          <!-- Parallel double hand-slide & outer slide bow -->
          <path d="M 21 53 L 86 53 C 91.5 53 91.5 61 86 61 L 28 61" fill="none" stroke="${p.stroke}" stroke-width="2.1" stroke-linecap="round" />
          <line x1="34" y1="53" x2="34" y2="61" stroke="${p.strokeMuted}" stroke-width="1.4" />
          <line x1="46" y1="53" x2="46" y2="61" stroke="${p.strokeMuted}" stroke-width="1.4" />
          <!-- Rear tuning crook & bell stem looping back -->
          <path d="M 28 61 C 24 61 22 57 22 54 L 22 51 C 22 49 18 49 14 49 C 8.5 49 8.5 39 14 39 L 49 39" fill="none" stroke="${p.stroke}" stroke-width="2.1" stroke-linecap="round" />
          <!-- Rear counterweight & bell brace -->
          <circle cx="16.5" cy="44" r="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
          <line x1="36" y1="40" x2="36" y2="53" stroke="${p.strokeMuted}" stroke-width="1.4" />
          <!-- Exponentially flared trombone bell -->
          <path d="M 48 37.8 C 58 37.8 66 34 74 25 L 75 25 L 75 53 L 74 53 C 66 44 58 40.2 48 40.2 Z" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" stroke-linejoin="round" />
          <ellipse cx="74.5" cy="39" rx="2.1" ry="14" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.4" />
        </g>
      `;

    case 'banjo_mandolin':
    case 'stock_banjo':
      return `
        <g transform="rotate(-35 50 50)">
          <!-- Round resonator pot & drumhead -->
          <circle cx="50" cy="69" r="19.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.7" />
          <circle cx="50" cy="69" r="15.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
          ${drumLugs(50, 69, 17.5, 12, p.strokeMuted)}
          <!-- Slender neck & frets + 5th-string geared peg -->
          <polygon points="48.2,16 51.8,16 52.4,54 47.6,54" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          ${[22, 28, 34, 40, 46]
            .map((fy) => `<line x1="48" y1="${fy}" x2="52" y2="${fy}" stroke="${p.strokeMuted}" stroke-width="0.6" />`)
            .join('')}
          <line x1="45" y1="36" x2="48" y2="36" stroke="${p.stroke}" stroke-width="1.2" />
          <circle cx="44.2" cy="36" r="1.2" fill="${p.strokeAccent}" />
          <!-- Paddle headstock & 4 tuning pegs -->
          <path d="M 47.8 16 L 46 7.5 C 48 5.8 52 5.8 54 7.5 L 52.2 16 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
          <circle cx="44.5" cy="9.5" r="1.1" fill="${p.stroke}" />
          <circle cx="45" cy="13.5" r="1.1" fill="${p.stroke}" />
          <circle cx="55.5" cy="9.5" r="1.1" fill="${p.stroke}" />
          <circle cx="55" cy="13.5" r="1.1" fill="${p.stroke}" />
          <!-- Bridge, tailpiece & strings -->
          <rect x="44" y="72.5" width="12" height="2.4" rx="0.6" fill="${p.stroke}" />
          <polygon points="48,82 52,82 51.2,89 48.8,89" fill="${p.stroke}" />
          <line x1="49" y1="16" x2="48.8" y2="82" stroke="${p.stroke}" stroke-width="0.5" opacity="0.65" />
          <line x1="51" y1="16" x2="51.2" y2="82" stroke="${p.stroke}" stroke-width="0.5" opacity="0.65" />
        </g>
      `;

    case 'harp_concert':
    case 'stock_harp':
      return `
        <!-- Parallel harp strings (accurately clipped between harmonic curve & soundboard) -->
        <line x1="34" y1="17" x2="34" y2="83" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="39" y1="19" x2="39" y2="83" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="44" y1="21.5" x2="44" y2="81" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="49" y1="24" x2="49" y2="71" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="54" y1="26" x2="54" y2="61" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="59" y1="27" x2="59" y2="51" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <line x1="64" y1="27.5" x2="64" y2="41" stroke="${p.strokeAccent}" stroke-width="0.85" />
        <!-- Harmonic S-curved neck -->
        <path d="M 29 12 C 42 12 52 24 73 21.5 C 77.5 21 79.5 25 76 28 C 54 31 43 19.5 29 18.5 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" stroke-linejoin="round" />
        <!-- Tapered diagonal resonant soundboard -->
        <polygon points="71,27 76.5,28 53,83 43,83" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
        <line x1="73.5" y1="28" x2="48" y2="83" stroke="${p.strokeMuted}" stroke-width="0.8" />
        <!-- Vertical fluted forepillar & crown -->
        <rect x="24" y="15" width="5.2" height="68" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" />
        <path d="M 21 15 C 21 9 32.2 9 32.2 15 Z" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.4" />
        <!-- Footed pedal pedestal base -->
        <polygon points="20,90 24,83 53,83 57,90" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.5" stroke-linejoin="round" />
      `;

    case 'accordion_keys':
    case 'stock_accordion':
      return `
        <!-- Center pleated bellows -->
        <rect x="33" y="23" width="34" height="54" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        ${[38, 44, 50, 56, 62]
          .map((bx) => `<line x1="${bx}" y1="23" x2="${bx}" y2="77" stroke="${p.stroke}" stroke-width="1.1" />`)
          .join('')}
        <!-- Left treble housing + vertical piano keyboard with black sharps -->
        <rect x="11" y="17" width="22" height="66" rx="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="11" y="21" width="11" height="58" rx="1" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.1" />
        ${[27, 33, 39, 45, 51, 57, 63, 69, 75]
          .map((ky) => `<line x1="11" y1="${ky}" x2="22" y2="${ky}" stroke="${p.stroke}" stroke-width="0.7" />`)
          .join('')}
        ${[25.2, 31.2, 43.2, 49.2, 55.2, 67.2, 73.2]
          .map((by) => `<rect x="11" y="${by}" width="6.5" height="3.4" rx="0.5" fill="${p.stroke}" />`)
          .join('')}
        <!-- Grille vents & register switches -->
        <rect x="25.5" y="27" width="4.5" height="46" rx="1.5" fill="none" stroke="${p.strokeMuted}" stroke-width="0.9" stroke-dasharray="3 2" />
        <!-- Right bass housing + button matrix -->
        <rect x="67" y="20" width="22" height="60" rx="3.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.6" />
        ${[29, 37, 45, 53, 61, 69]
          .map(
            (by) =>
              `<circle cx="72" cy="${by}" r="1.5" fill="${p.stroke}" /><circle cx="77" cy="${by + 2.5}" r="1.5" fill="${p.stroke}" />`
          )
          .join('')}
        <rect x="82.5" y="27" width="3.5" height="46" rx="1.2" fill="${p.fill}" stroke="${p.strokeMuted}" stroke-width="0.9" />
      `;

    case 'marimba_vibes':
    case 'stock_marimba':
      return `
        <!-- Tapered concert marimba / vibraphone frame -->
        <polygon points="6,16 94,27 94,73 6,84" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" stroke-linejoin="round" />
        <!-- Bass & treble wooden end rails -->
        <rect x="6" y="16" width="4" height="68" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <rect x="90" y="27" width="4" height="46" rx="1" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.2" />
        <!-- Front row: natural tone bars (graduated lengths) -->
        ${Array.from({ length: 12 })
          .map((_, i) => {
            const x = 13 + i * 6.2;
            const barH = 27 - i * 0.9;
            const y = 52;
            return `<rect x="${x.toFixed(1)}" y="${y}" width="4.8" height="${barH.toFixed(1)}" rx="0.7" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1" />`;
          })
          .join('')}
        <!-- Rear row: accidental / sharp bars grouped in musical 2-3-2-3 pattern -->
        ${[0, 1, 3, 4, 5, 7, 8, 10]
          .map((idx) => {
            const x = 16.1 + idx * 6.2;
            const topY = 21 + idx * 0.9;
            const barH = 49.5 - topY;
            return `<rect x="${x.toFixed(1)}" y="${topY.toFixed(1)}" width="4.4" height="${barH.toFixed(1)}" rx="0.7" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1" />`;
          })
          .join('')}
        <text x="50" y="95" text-anchor="middle" fill="${p.textMuted}" font-size="7" font-weight="800" font-family="monospace">MARIMBA / VIBES</text>
      `;

    case 'timpani_kettle':
    case 'stock_timpani':
      return `
        <!-- 4 Graduated Orchestral Timpani in non-overlapping player arc -->
        ${[
          { cx: 21, cy: 64, r: 15, px: 34, py: 70 },
          { cx: 36, cy: 31, r: 13.8, px: 43, py: 44 },
          { cx: 65, cy: 31, r: 12.6, px: 59, py: 43 },
          { cx: 80, cy: 61, r: 11.4, px: 69, py: 66 },
        ]
          .map(
            (d) => `
            <circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
            <circle cx="${d.cx}" cy="${d.cy}" r="${(d.r * 0.78).toFixed(1)}" fill="${p.fillStrong}" stroke="${p.strokeMuted}" stroke-width="0.9" />
            ${drumLugs(d.cx, d.cy, d.r, 6, p.stroke)}
            <circle cx="${d.px}" cy="${d.py}" r="1.8" fill="${p.strokeAccent}" />
          `
          )
          .join('')}
        <!-- Timpanist position mark -->
        <circle cx="50" cy="70" r="6" fill="none" stroke="${p.strokeMuted}" stroke-width="1" stroke-dasharray="2.5 2" />
        <text x="50" y="94" text-anchor="middle" fill="${p.textMuted}" font-size="7.2" font-weight="800" font-family="monospace">TIMPANI (4)</text>
      `;

    case 'synth_modular':
    case 'stock_modular_synth':
      return `
        <!-- Eurorack wooden-cheeks skiff chassis -->
        <rect x="6" y="16" width="88" height="62" rx="3.5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="6" y="16" width="5" height="62" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <rect x="89" y="16" width="5" height="62" rx="1.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <!-- Module vertical dividers -->
        <line x1="34" y1="16" x2="34" y2="78" stroke="${p.strokeMuted}" stroke-width="1" />
        <line x1="60" y1="16" x2="60" y2="78" stroke="${p.strokeMuted}" stroke-width="1" />
        <!-- Module 1: mini oscilloscope + 2 knobs -->
        <rect x="14" y="21" width="17" height="11" rx="1.2" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="0.9" />
        <path d="M 15.5 26.5 Q 18 22 20.5 26.5 T 25.5 26.5 T 29.5 26.5" fill="none" stroke="${p.strokeAccent}" stroke-width="1" />
        <circle cx="18.5" cy="40" r="3.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <line x1="18.5" y1="40" x2="20.2" y2="37.8" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="27.5" cy="40" r="3.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <line x1="27.5" y1="40" x2="25.8" y2="37.8" stroke="${p.stroke}" stroke-width="1" />
        <!-- Module 2: 3 ADSR faders -->
        ${[39, 47, 55]
          .map((fx, i) => `<line x1="${fx}" y1="22" x2="${fx}" y2="44" stroke="${p.strokeMuted}" stroke-width="1.2" /><rect x="${fx - 2}" y="${26 + i * 5}" width="4" height="3.2" rx="0.6" fill="${p.stroke}" />`)
          .join('')}
        <!-- Module 3: Filter & LFO knobs -->
        <circle cx="69" cy="28" r="4.2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.1" />
        <line x1="69" y1="28" x2="71.5" y2="25.5" stroke="${p.stroke}" stroke-width="1.1" />
        <circle cx="81" cy="28" r="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <circle cx="81" cy="39" r="3" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1" />
        <!-- Patchbay 3.5mm jack rows across bottom -->
        ${[16, 24, 39, 47, 55, 66, 74, 82]
          .map(
            (jx) =>
              `<circle cx="${jx}" cy="55" r="2.2" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1" /><circle cx="${jx}" cy="66" r="2.2" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1" />`
          )
          .join('')}
        <!-- Draped patch cables -->
        <path d="M 24 55 C 29 74 44 74 47 55" fill="none" stroke="${p.strokeAccent}" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 55 66 C 61 78 72 78 74 55" fill="none" stroke="${p.strokeMonitor}" stroke-width="1.5" stroke-linecap="round" />
        <text x="50" y="93" text-anchor="middle" fill="${p.textMuted}" font-size="7.2" font-weight="800" font-family="monospace">MODULAR</text>
      `;

    // ------------------------------------------------------------------
    // 13. ALL MAJOR AUDIO CABLE CONNECTIONS (SCHEMATIC PINOUT SYMBOLS)
    // ------------------------------------------------------------------
    case 'conn_xlr_3pin':
    case 'stock_conn_xlr':
      return `
        <circle cx="50" cy="44" r="32" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2" />
        <circle cx="50" cy="44" r="24" fill="${p.bgCard}" stroke="${p.strokeMuted}" stroke-width="1.2" />
        <rect x="46" y="16" width="8" height="6" rx="1" fill="${p.stroke}" />
        <circle cx="38" cy="40" r="4.5" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.5" />
        <circle cx="62" cy="40" r="4.5" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.5" />
        <circle cx="50" cy="55" r="4.5" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.5" />
        <text x="38" y="32" text-anchor="middle" fill="${p.textMuted}" font-size="6.5" font-weight="800" font-family="monospace">2</text>
        <text x="62" y="32" text-anchor="middle" fill="${p.textMuted}" font-size="6.5" font-weight="800" font-family="monospace">1</text>
        <text x="50" y="66" text-anchor="middle" fill="${p.textMuted}" font-size="6.5" font-weight="800" font-family="monospace">3</text>
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8.2" font-weight="900" font-family="monospace">XLR 3-PIN</text>
      `;

    case 'conn_xlr_5pin':
    case 'stock_conn_xlr5':
      return `
        <circle cx="50" cy="44" r="32" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2" />
        <circle cx="50" cy="44" r="24" fill="${p.bgCard}" stroke="${p.strokeMuted}" stroke-width="1.2" />
        <rect x="46" y="16" width="8" height="6" rx="1" fill="${p.stroke}" />
        <circle cx="35" cy="39" r="3.4" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <circle cx="65" cy="39" r="3.4" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <circle cx="39" cy="53" r="3.4" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <circle cx="61" cy="53" r="3.4" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <circle cx="50" cy="59" r="3.4" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8.2" font-weight="900" font-family="monospace">XLR 5-PIN</text>
      `;

    case 'conn_jack_trs':
    case 'stock_conn_trs':
      return `
        <rect x="10" y="34" width="24" height="20" rx="2" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.7" />
        <rect x="34" y="39" width="28" height="10" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.4" />
        <rect x="62" y="39" width="3" height="10" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="0.9" />
        <rect x="65" y="39" width="9" height="10" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.4" />
        <rect x="74" y="39" width="3" height="10" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="0.9" />
        <polygon points="77,39 87,39 92,44 87,49 77,49" fill="${p.strokeAccent}" stroke="${p.stroke}" stroke-width="1.2" />
        <line x1="17" y1="34" x2="17" y2="54" stroke="${p.strokeMuted}" stroke-width="1" />
        <line x1="23" y1="34" x2="23" y2="54" stroke="${p.strokeMuted}" stroke-width="1" />
        <text x="50" y="74" text-anchor="middle" fill="${p.textMuted}" font-size="7" font-weight="700" font-family="monospace">SLV · RING · TIP</text>
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8.2" font-weight="900" font-family="monospace">1/4&quot; TRS</text>
      `;

    case 'conn_minijack_35mm':
    case 'stock_conn_minijack':
      return `
        <rect x="14" y="36" width="24" height="16" rx="2.5" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="1.6" />
        <rect x="38" y="40.5" width="22" height="7" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.3" />
        <rect x="60" y="40.5" width="2.5" height="7" fill="${p.bgCard}" />
        <rect x="62.5" y="40.5" width="8" height="7" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.2" />
        <rect x="70.5" y="40.5" width="2.5" height="7" fill="${p.bgCard}" />
        <polygon points="73,40.5 82,40.5 86,44 82,47.5 73,47.5" fill="${p.strokeAccent}" stroke="${p.stroke}" stroke-width="1.1" />
        <text x="50" y="72" text-anchor="middle" fill="${p.textMuted}" font-size="7" font-weight="700" font-family="monospace">AUX / STEREO</text>
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8.2" font-weight="900" font-family="monospace">3.5mm TRS</text>
      `;

    case 'conn_rca_phono':
    case 'stock_conn_rca':
      return `
        <circle cx="31" cy="44" r="19" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.8" />
        <circle cx="31" cy="44" r="12" fill="none" stroke="${p.strokeMuted}" stroke-width="1.2" stroke-dasharray="4 2" />
        <circle cx="31" cy="44" r="5" fill="${p.strokeAccent}" />
        <text x="31" y="74" text-anchor="middle" fill="${p.textMuted}" font-size="7" font-weight="800" font-family="monospace">L (WHT)</text>
        <circle cx="69" cy="44" r="19" fill="${p.fillCeeRed}" stroke="${p.strokeCeeRed}" stroke-width="1.8" />
        <circle cx="69" cy="44" r="12" fill="none" stroke="${p.strokeCeeRed}" stroke-width="1.2" stroke-dasharray="4 2" />
        <circle cx="69" cy="44" r="5" fill="${p.strokeCeeRed}" />
        <text x="69" y="74" text-anchor="middle" fill="${p.strokeCeeRed}" font-size="7" font-weight="800" font-family="monospace">R (RED)</text>
        <text x="50" y="93" text-anchor="middle" fill="${p.text}" font-size="8.2" font-weight="900" font-family="monospace">RCA PHONO</text>
      `;

    case 'conn_speakon_nl4':
    case 'stock_conn_speakon':
      return `
        <circle cx="50" cy="44" r="32" fill="${p.fillCeeBlue}" stroke="${p.strokeCeeBlue}" stroke-width="2" />
        <circle cx="50" cy="44" r="22" fill="${p.bgCard}" stroke="${p.strokeCeeBlue}" stroke-width="1.3" />
        <rect x="46" y="13" width="8" height="9" rx="1" fill="${p.strokeCeeBlue}" />
        <path d="M 38 35 A 12 12 0 0 1 62 35" fill="none" stroke="${p.stroke}" stroke-width="3" stroke-linecap="round" />
        <path d="M 38 53 A 12 12 0 0 0 62 53" fill="none" stroke="${p.stroke}" stroke-width="3" stroke-linecap="round" />
        <circle cx="50" cy="44" r="5" fill="${p.fillStrong}" stroke="${p.strokeCeeBlue}" stroke-width="1.3" />
        <text x="50" y="92" text-anchor="middle" fill="${p.strokeCeeBlue}" font-size="8" font-weight="900" font-family="monospace">SPEAKON NL4</text>
      `;

    case 'conn_ethercon_rj45':
    case 'stock_conn_ethercon':
      return `
        <circle cx="50" cy="44" r="32" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.9" />
        <rect x="30" y="29" width="40" height="30" rx="2.5" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.5" />
        <rect x="42" y="23" width="16" height="7" rx="1" fill="${p.fillStrong}" stroke="${p.strokeAccent}" stroke-width="1.2" />
        ${[35, 39, 43, 47, 51, 55, 59, 63]
          .map((px) => `<line x1="${px}" y1="49" x2="${px}" y2="57" stroke="${p.strokePower}" stroke-width="1.3" />`)
          .join('')}
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="7.8" font-weight="900" font-family="monospace">ETHERCON</text>
      `;

    case 'conn_bnc_rf':
    case 'stock_conn_bnc':
      return `
        <circle cx="50" cy="44" r="28" fill="${p.fillMonitor}" stroke="${p.strokeMonitor}" stroke-width="2" />
        <rect x="16" y="40" width="8" height="8" rx="1.5" fill="${p.strokeMonitor}" />
        <rect x="76" y="40" width="8" height="8" rx="1.5" fill="${p.strokeMonitor}" />
        <circle cx="50" cy="44" r="18" fill="${p.bgCard}" stroke="${p.stroke}" stroke-width="1.4" />
        <circle cx="50" cy="44" r="9" fill="${p.fillStrong}" stroke="${p.strokeMonitor}" stroke-width="1.2" />
        <circle cx="50" cy="44" r="3.5" fill="${p.strokePower}" />
        <text x="50" y="92" text-anchor="middle" fill="${p.strokeMonitor}" font-size="8" font-weight="900" font-family="monospace">BNC RF/CLK</text>
      `;

    case 'conn_optical_fiber':
    case 'stock_conn_fiber':
      return `
        <rect x="14" y="22" width="72" height="44" rx="5" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.8" />
        <circle cx="34" cy="44" r="12" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.6" />
        <circle cx="34" cy="44" r="4.5" fill="${p.strokeAccent}" />
        <circle cx="66" cy="44" r="12" fill="${p.bgCard}" stroke="${p.strokeMonitor}" stroke-width="1.6" />
        <circle cx="66" cy="44" r="4.5" fill="${p.strokeMonitor}" />
        <text x="34" y="63" text-anchor="middle" fill="${p.textMuted}" font-size="6.2" font-weight="800" font-family="monospace">TX</text>
        <text x="66" y="63" text-anchor="middle" fill="${p.textMuted}" font-size="6.2" font-weight="800" font-family="monospace">RX</text>
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="7.8" font-weight="900" font-family="monospace">OPTICALCON</text>
      `;

    case 'conn_midi_5pin':
    case 'stock_conn_midi':
      return `
        <circle cx="50" cy="44" r="31" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.9" />
        <circle cx="50" cy="44" r="23" fill="${p.bgCard}" stroke="${p.strokeMuted}" stroke-width="1.2" />
        <rect x="46" y="62" width="8" height="5" fill="${p.stroke}" />
        <circle cx="33" cy="44" r="3" fill="${p.strokeAccent}" />
        <circle cx="38" cy="33" r="3" fill="${p.strokeAccent}" />
        <circle cx="50" cy="29" r="3" fill="${p.strokeAccent}" />
        <circle cx="62" cy="33" r="3" fill="${p.strokeAccent}" />
        <circle cx="67" cy="44" r="3" fill="${p.strokeAccent}" />
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8" font-weight="900" font-family="monospace">MIDI 5-PIN</text>
      `;

    case 'conn_usb_audio':
    case 'stock_conn_usb':
      return `
        <rect x="18" y="24" width="64" height="40" rx="18" fill="${p.fill}" stroke="${p.stroke}" stroke-width="2" />
        <rect x="26" y="32" width="48" height="24" rx="11" fill="${p.bgCard}" stroke="${p.strokeAccent}" stroke-width="1.3" />
        <rect x="33" y="42" width="34" height="4" rx="1.5" fill="${p.strokeAccent}" />
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="8" font-weight="900" font-family="monospace">USB-C / IO</text>
      `;

    case 'conn_multipin_socapex':
    case 'stock_conn_multipin':
      return `
        <circle cx="50" cy="44" r="32" fill="${p.fillStrong}" stroke="${p.stroke}" stroke-width="2" />
        <circle cx="50" cy="44" r="24" fill="${p.bgCard}" stroke="${p.strokeMuted}" stroke-width="1.1" />
        ${[
          [50, 44], [50, 31], [50, 57], [38, 37], [62, 37], [38, 51], [62, 51],
          [44, 24], [56, 24], [44, 64], [56, 64], [30, 44], [70, 44],
        ]
          .map(([px, py]) => `<circle cx="${px}" cy="${py}" r="2.3" fill="${p.strokeAccent}" />`)
          .join('')}
        <text x="50" y="92" text-anchor="middle" fill="${p.text}" font-size="7.6" font-weight="900" font-family="monospace">MULTIPIN</text>
      `;

    default:
      return `
        <rect x="10" y="14" width="80" height="72" rx="4" fill="${p.fill}" stroke="${p.stroke}" stroke-width="1.5" />
        <rect x="16" y="20" width="68" height="60" rx="2" fill="none" stroke="${p.strokeMuted}" stroke-width="0.8" stroke-dasharray="3 3" />
        <text x="50" y="54" text-anchor="middle" fill="${p.text}" font-size="9" font-weight="800" font-family="sans-serif">${labelText.slice(0, 12) || 'GEAR'}</text>
      `;
  }
}
