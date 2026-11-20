/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChannelInput,
  GearDefinition,
  MonitorMix,
  PowerConnectorType,
  SignalGroup,
  StageItem,
  StageProject,
} from '../types/stage';

export const POWER_SHORT_CODES: Record<string, string> = {
  'None': '',
  'Generic Power Drop': 'PWR',
  'NEMA 5-15/20 Edison Quad (120V)': 'EDISON',
  'NEMA L5-20 Twist-Lock (120V)': 'L5-20',
  'NEMA L5-30 Twist-Lock (120V)': 'L5-30',
  'NEMA L14-30 (120/240V)': 'L14-30',
  'NEMA 14-50 (240V)': '14-50',
  'Cam-Lok 3-Phase Feeder': 'CAM-LOK',
  'UK 13A BS 1363': 'UK 13A',
  'EU Schuko (16A 230V)': 'SCHUKO',
  'CEE 16A 1-Phase (Blue 230V)': 'CEE 16A 1Ø',
  'CEE 32A 1-Phase (Blue 230V)': 'CEE 32A 1Ø',
  'CEE 16A 3-Phase (Red 400V)': 'CEE 16A 3Ø',
  'CEE 32A 3-Phase (Red 400V)': 'CEE 32A 3Ø',
  'CEE 63A 3-Phase (Red 400V)': 'CEE 63A 3Ø',
  'Neutrik PowerCON 20A': 'PCON 20A',
  'Neutrik PowerCON TRUE1': 'TRUE1',
  'Touring Power Distro Rack': 'DISTRO',
};

export function getPowerShortLabel(item: StageItem): string {
  if (item.powerSpec?.required && item.powerSpec.connector && item.powerSpec.connector !== 'None') {
    const code = POWER_SHORT_CODES[item.powerSpec.connector] || item.powerSpec.connector;
    return item.powerSpec.dropsCount > 1 ? `${item.powerSpec.dropsCount}× ${code}` : code;
  }
  if (item.powerDropRequired) {
    return item.powerVoltage === '230V' ? 'AC 230V' : 'AC';
  }
  return '';
}

export function isPowerGearType(type: string): boolean {
  return (
    type === 'ac_power_drop_quad' ||
    type === 'stock_power_bolt' ||
    type === 'stock_power_distro_box' ||
    type.startsWith('power_')
  );
}

export function isRoutingHubItem(
  item: StageItem,
  allDefs?: Record<string, GearDefinition>
): boolean {
  if (
    item.type === 'drop_snake_subbox' ||
    item.type === 'stage_box_digital' ||
    item.type === 'foh_mon_split_rack' ||
    item.type === 'direct_injection_box' ||
    item.type === 'power_distro_rack' ||
    item.type === 'playback_rack' ||
    item.type === 'iem_pack_station' ||
    item.type === 'stock_stage_box_split' ||
    item.type === 'stock_console_desk' ||
    item.type === 'stock_power_distro_box' ||
    item.type === 'stock_rack_unit' ||
    item.type.startsWith('conn_') ||
    item.type.startsWith('stock_conn_')
  ) {
    return true;
  }
  const def = allDefs?.[item.type];
  if (
    def &&
    (def.category === 'audio_power' ||
      def.category === 'audio_connectors' ||
      def.category === 'power_distro' ||
      def.stockSymbol === 'stock_stage_box_split' ||
      def.stockSymbol === 'stock_console_desk' ||
      def.stockSymbol === 'stock_power_distro_box' ||
      def.stockSymbol === 'stock_rack_unit')
  ) {
    return true;
  }
  return false;
}

export interface PowerSummaryLine {
  connector: string;
  voltage: string;
  totalDrops: number;
  locations: string[];
}

export interface StagePowerSummary {
  lines: PowerSummaryLine[];
  total120V: number;
  total230VPlus: number;
  totalDrops: number;
}

const BUILTIN_POWER_MAP: Record<string, { connector: PowerConnectorType; voltage: string }> = {
  power_generic_bolt: { connector: 'Generic Power Drop', voltage: '120/230V' },
  stock_power_bolt: { connector: 'Generic Power Drop', voltage: '120/230V' },
  ac_power_drop_quad: { connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V' },
  power_edison_quad: { connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V' },
  power_l5_20: { connector: 'NEMA L5-20 Twist-Lock (120V)', voltage: '120V' },
  power_l5_30: { connector: 'NEMA L5-30 Twist-Lock (120V)', voltage: '120V' },
  power_l14_30: { connector: 'NEMA L14-30 (120/240V)', voltage: '120/240V' },
  power_14_50: { connector: 'NEMA 14-50 (240V)', voltage: '240V' },
  power_cam_lok: { connector: 'Cam-Lok 3-Phase Feeder', voltage: '208/400V 3Ø' },
  power_uk_13a: { connector: 'UK 13A BS 1363', voltage: '230V' },
  power_schuko: { connector: 'EU Schuko (16A 230V)', voltage: '230V' },
  power_cee_16a_blue: { connector: 'CEE 16A 1-Phase (Blue 230V)', voltage: '230V' },
  power_cee_32a_blue: { connector: 'CEE 32A 1-Phase (Blue 230V)', voltage: '230V' },
  power_cee_16a_red: { connector: 'CEE 16A 3-Phase (Red 400V)', voltage: '400V 3Ø' },
  power_cee_32a_red: { connector: 'CEE 32A 3-Phase (Red 400V)', voltage: '400V 3Ø' },
  power_cee_63a_red: { connector: 'CEE 63A 3-Phase (Red 400V)', voltage: '400V 3Ø' },
  power_powercon_20a: { connector: 'Neutrik PowerCON 20A', voltage: '120/230V' },
  power_powercon_true1: { connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V' },
  power_distro_rack: { connector: 'Touring Power Distro Rack', voltage: '3-Phase Distro' },
};

export function computeStagePowerSummary(project: StageProject): StagePowerSummary {
  const bucket = new Map<string, PowerSummaryLine>();
  let total120V = 0;
  let total230VPlus = 0;
  let totalDrops = 0;

  project.items.forEach((item) => {
    let connector = '';
    let voltage = '';
    let drops = 0;

    if (item.powerSpec?.required && item.powerSpec.connector && item.powerSpec.connector !== 'None') {
      connector = item.powerSpec.connector;
      voltage = item.powerSpec.voltage || '120V';
      drops = Math.max(1, item.powerSpec.dropsCount || 1);
    } else if (BUILTIN_POWER_MAP[item.type]) {
      connector = BUILTIN_POWER_MAP[item.type].connector;
      voltage = BUILTIN_POWER_MAP[item.type].voltage;
      drops = 1;
    } else if (item.powerDropRequired) {
      voltage = item.powerVoltage || '120V';
      connector =
        voltage === '230V'
          ? 'EU Schuko / UK 13A Drop (230V)'
          : 'NEMA 5-15/20 Edison Quad (120V)';
      drops = 1;
    }

    if (!connector || drops <= 0) return;

    totalDrops += drops;
    if (voltage.includes('230') || voltage.includes('240') || voltage.includes('400') || voltage.includes('3Ø')) {
      total230VPlus += drops;
    } else {
      total120V += drops;
    }

    const key = `${connector}__${voltage}`;
    const existing = bucket.get(key);
    const locLabel = item.performer || item.name;
    if (existing) {
      existing.totalDrops += drops;
      if (locLabel && !existing.locations.includes(locLabel)) {
        existing.locations.push(locLabel);
      }
    } else {
      bucket.set(key, {
        connector,
        voltage,
        totalDrops: drops,
        locations: locLabel ? [locLabel] : [],
      });
    }
  });

  return {
    lines: Array.from(bucket.values()),
    total120V,
    total230VPlus,
    totalDrops,
  };
}

export function findSignalGroup(
  project: StageProject,
  groupId?: string,
  subSnakeName?: string
): SignalGroup | undefined {
  const groups = project.signalGroups || [];
  if (groupId) {
    const byId = groups.find((g) => g.id === groupId);
    if (byId) return byId;
  }
  if (subSnakeName) {
    const lower = subSnakeName.trim().toLowerCase();
    return groups.find(
      (g) => g.name.toLowerCase() === lower || g.shortCode.toLowerCase() === lower
    );
  }
  return undefined;
}

/**
 * Returns all Channel List entries linked to a given stage plot item,
 * sorted in ascending channel number order.
 */
export function getLinkedChannelsForItem(
  item: StageItem,
  channels: ChannelInput[]
): ChannelInput[] {
  const explicitIds = new Set(item.channelIds || []);
  return channels
    .filter((ch) => ch.linkedStageItemId === item.id || explicitIds.has(ch.id))
    .sort((a, b) => a.channelNumber - b.channelNumber);
}

/**
 * Formats linked channels for display on the stage plot: e.g. "Channel: 1, 2, 3"
 */
export function formatLinkedChannelsLabel(linkedChannels: ChannelInput[]): string {
  if (linkedChannels.length === 0) return '';
  return `Channel: ${linkedChannels.map((ch) => ch.channelNumber).join(', ')}`;
}

/**
 * Returns true only when active channel numbers have a gap in the sequence
 * (e.g. an empty channel before or between active channels breaks 1, 2, 3...).
 */
export function hasPatchSequenceGaps(activeChannels: ChannelInput[]): boolean {
  if (activeChannels.length === 0) return false;
  const nums = activeChannels
    .map((ch) => ch.channelNumber)
    .sort((a, b) => a - b);
  return nums.some((num, idx) => num !== idx + 1);
}

/**
 * Returns all Monitor Mix / Output entries linked to a given stage plot item,
 * sorted in ascending mix number order.
 */
export function getLinkedMonitorsForItem(
  item: StageItem,
  monitors: MonitorMix[]
): MonitorMix[] {
  const explicitIds = new Set(item.monitorIds || []);
  return monitors
    .filter((mix) => mix.linkedStageItemId === item.id || explicitIds.has(mix.id))
    .sort((a, b) => a.mixNumber - b.mixNumber);
}

/**
 * Formats linked outputs/mixes for display on the stage plot:
 * - Single mix: "Output: Mix 1 (Aux 1)" (or "Output: Mix 1" if no patch)
 * - Multiple mixes: "Outputs: Mix 1, 2, 3"
 */
export function formatLinkedMonitorsLabel(linkedMonitors: MonitorMix[]): string {
  if (linkedMonitors.length === 0) return '';
  if (linkedMonitors.length === 1) {
    const m = linkedMonitors[0];
    const patch = (m.outputPatch || '').trim();
    return patch ? `Output: Mix ${m.mixNumber} (${patch})` : `Output: Mix ${m.mixNumber}`;
  }
  return `Outputs: Mix ${linkedMonitors.map((m) => m.mixNumber).join(', ')}`;
}

/**
 * Resolves the primary display label for a stage plot item:
 * - If a performer or explicit custom label has already been specified, use it.
 * - Otherwise, if one or more channels are linked, inherit the label from the channel list.
 * - Otherwise, if one or more monitor mixes/outputs are linked, inherit from the mix performer.
 * - Falls back to item.name.
 */
export function resolveStageItemLabel(
  item: StageItem,
  linkedChannels: ChannelInput[],
  defaultGearLabel?: string,
  linkedMonitors: MonitorMix[] = []
): { primary: string; inherited: boolean; inheritedSource?: 'channel' | 'monitor' } {
  const performer = (item.performer || '').trim();
  if (performer) {
    return { primary: performer, inherited: false };
  }

  const trimmedName = (item.name || '').trim();
  const isDefaultLibraryName =
    Boolean(defaultGearLabel) &&
    trimmedName.toLowerCase() === (defaultGearLabel || '').trim().toLowerCase();

  // If the user explicitly edited the label (or gave a non-default name), preserve it
  if (item.hasCustomLabel && trimmedName) {
    return { primary: trimmedName, inherited: false };
  }
  if (
    !isDefaultLibraryName &&
    trimmedName &&
    item.hasCustomLabel !== false &&
    linkedChannels.length === 0 &&
    linkedMonitors.length === 0
  ) {
    return { primary: trimmedName, inherited: false };
  }

  // Inherit from linked channel list when no custom label was already specified
  if (linkedChannels.length > 0 && (item.hasCustomLabel === false || isDefaultLibraryName || !trimmedName)) {
    const named = linkedChannels
      .map((ch) => (ch.name || '').trim())
      .filter(Boolean);
    if (named.length === 1) {
      return { primary: named[0], inherited: true, inheritedSource: 'channel' };
    }
    if (named.length === 2) {
      const joined = `${named[0]} / ${named[1]}`;
      return {
        primary: joined.length <= 28 ? joined : `${named[0]} (+1)`,
        inherited: true,
        inheritedSource: 'channel',
      };
    }
    if (named.length > 2) {
      return { primary: `${named[0]} (+${named.length - 1})`, inherited: true, inheritedSource: 'channel' };
    }
  }

  // Inherit from linked monitor mixes when no custom label or channel label was specified
  if (linkedMonitors.length > 0 && (item.hasCustomLabel === false || isDefaultLibraryName || !trimmedName)) {
    const named = linkedMonitors
      .map((m) => (m.performer || '').trim())
      .filter(Boolean);
    if (named.length === 1) {
      return { primary: named[0], inherited: true, inheritedSource: 'monitor' };
    }
    if (named.length === 2) {
      const joined = `${named[0]} / ${named[1]}`;
      return {
        primary: joined.length <= 28 ? joined : `${named[0]} (+1)`,
        inherited: true,
        inheritedSource: 'monitor',
      };
    }
    if (named.length > 2) {
      return { primary: `${named[0]} (+${named.length - 1})`, inherited: true, inheritedSource: 'monitor' };
    }
  }

  return { primary: trimmedName || defaultGearLabel || '', inherited: false };
}
