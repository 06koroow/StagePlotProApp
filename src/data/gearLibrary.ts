/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GearCategory,
  GearDefinition,
  PowerConnectorType,
  SignalGroup,
  StageProject,
  ConnectorType,
  StockSymbolId,
} from '../types/stage';

export const CONNECTOR_TYPES: ConnectorType[] = [
  'XLR',
  '1/4" Jack (TS/TRS)',
  'Phono / RCA',
  'Speakon',
  'EtherCON / Dante',
  'Mini-Jack 3.5mm',
  'Multi-pin',
  'Wireless RF',
  'Direct / Other',
];

export const COMMON_MICS_AND_DIS = [
  // Generic DI Options
  'Active DI (Generic)',
  'Passive DI (Generic)',
  'DI (Supplied/Generic)',
  'Stereo Active DI',
  'Stereo Passive DI',
  'Supplied by Artist',
  'TBD',

  // Radial & Studio DIs
  'Radial J48 Active DI',
  'Radial JDI Passive DI',
  'Radial ProDI',
  'Radial ProD2 (Stereo)',
  'Rupert Neve RNDI Active',
  'BSS AR-133 Active DI',
  'Countryman Type 85',
  'Line Level / Direct Out',

  // Vocal & Instrument Microphones
  'Shure SM58',
  'Shure Beta 58A',
  'Shure SM58 (Switched)',
  'Shure RF SM58 (Wireless)',
  'Shure KSM8',
  'Shure KSM9',
  'Shure SM57',
  'Shure Beta 57A',
  'Shure Beta 52A',
  'Shure Beta 91A',
  'Shure KSM 137',
  'Shure SM81',
  'Shure Beta 98AMP',
  'Shure Axient Digital Wireless',

  // Sennheiser, AKG, Audix, Neumann, EV, Beyer
  'Sennheiser e904',
  'Sennheiser e906',
  'Sennheiser e935',
  'Sennheiser e945',
  'Sennheiser MD 421-II',
  'AKG C414 XLS',
  'AKG C451 B',
  'AKG D112 MkII',
  'Audix D6',
  'Audix i5',
  'Neumann KMS 105',
  'Neumann KM 184',
  'Electro-Voice RE20',
  'Beyerdynamic M 160',
  'Beyerdynamic M88 TG',
];

export interface PowerConnectorOption {
  connector: PowerConnectorType;
  region: 'North America' | 'UK / Europe' | 'Global Pro Audio';
  defaultVoltage: string;
  defaultAmps: number;
  gearType?: string;
}

export const POWER_CONNECTOR_OPTIONS: PowerConnectorOption[] = [
  { connector: 'None', region: 'Global Pro Audio', defaultVoltage: '120V', defaultAmps: 0 },
  { connector: 'Generic Power Drop', region: 'Global Pro Audio', defaultVoltage: '120/230V', defaultAmps: 20, gearType: 'power_generic_bolt' },
  { connector: 'NEMA 5-15/20 Edison Quad (120V)', region: 'North America', defaultVoltage: '120V', defaultAmps: 20, gearType: 'power_edison_quad' },
  { connector: 'NEMA L5-20 Twist-Lock (120V)', region: 'North America', defaultVoltage: '120V', defaultAmps: 20, gearType: 'power_l5_20' },
  { connector: 'NEMA L5-30 Twist-Lock (120V)', region: 'North America', defaultVoltage: '120V', defaultAmps: 30, gearType: 'power_l5_30' },
  { connector: 'NEMA L14-30 (120/240V)', region: 'North America', defaultVoltage: '120/240V', defaultAmps: 30, gearType: 'power_l14_30' },
  { connector: 'NEMA 14-50 (240V)', region: 'North America', defaultVoltage: '240V', defaultAmps: 50, gearType: 'power_14_50' },
  { connector: 'Cam-Lok 3-Phase Feeder', region: 'North America', defaultVoltage: '208V 3Ø', defaultAmps: 400, gearType: 'power_cam_lok' },
  { connector: 'UK 13A BS 1363', region: 'UK / Europe', defaultVoltage: '230V', defaultAmps: 13, gearType: 'power_uk_13a' },
  { connector: 'EU Schuko (16A 230V)', region: 'UK / Europe', defaultVoltage: '230V', defaultAmps: 16, gearType: 'power_schuko' },
  { connector: 'CEE 16A 1-Phase (Blue 230V)', region: 'UK / Europe', defaultVoltage: '230V', defaultAmps: 16, gearType: 'power_cee_16a_blue' },
  { connector: 'CEE 32A 1-Phase (Blue 230V)', region: 'UK / Europe', defaultVoltage: '230V', defaultAmps: 32, gearType: 'power_cee_32a_blue' },
  { connector: 'CEE 16A 3-Phase (Red 400V)', region: 'UK / Europe', defaultVoltage: '400V 3Ø', defaultAmps: 16, gearType: 'power_cee_16a_red' },
  { connector: 'CEE 32A 3-Phase (Red 400V)', region: 'UK / Europe', defaultVoltage: '400V 3Ø', defaultAmps: 32, gearType: 'power_cee_32a_red' },
  { connector: 'CEE 63A 3-Phase (Red 400V)', region: 'UK / Europe', defaultVoltage: '400V 3Ø', defaultAmps: 63, gearType: 'power_cee_63a_red' },
  { connector: 'Neutrik PowerCON 20A', region: 'Global Pro Audio', defaultVoltage: '120/230V', defaultAmps: 20, gearType: 'power_powercon_20a' },
  { connector: 'Neutrik PowerCON TRUE1', region: 'Global Pro Audio', defaultVoltage: '120/230V', defaultAmps: 20, gearType: 'power_powercon_true1' },
  { connector: 'Touring Power Distro Rack', region: 'Global Pro Audio', defaultVoltage: '3-Phase Distro', defaultAmps: 100, gearType: 'power_distro_rack' },
];

export type StockSymbolGroup =
  | 'racks'
  | 'instruments'
  | 'connectors'
  | 'monitoring'
  | 'power'
  | 'staging';

export interface StockSymbolOption {
  symbolId: StockSymbolId;
  label: string;
  group: StockSymbolGroup;
  suggestedCategory: GearCategory;
  defaultWidthFeet: number;
  defaultHeightFeet: number;
  description: string;
}

export const STOCK_SYMBOL_OPTIONS: StockSymbolOption[] = [
  // Racks, Patch & Audio Systems
  { symbolId: 'stock_rack_unit', label: '19" Equipment / Amp Rack', group: 'racks', suggestedCategory: 'audio_power', defaultWidthFeet: 2.2, defaultHeightFeet: 2.0, description: 'Modular 19-inch outboard, amp, or wireless rack.' },
  { symbolId: 'stock_console_desk', label: 'Mixing / Broadcast Desk', group: 'racks', suggestedCategory: 'audio_power', defaultWidthFeet: 4.5, defaultHeightFeet: 2.8, description: 'FOH, monitor, or control console desk footprint.' },
  { symbolId: 'stock_stage_box_split', label: 'Stage Box / Split Patch', group: 'racks', suggestedCategory: 'audio_power', defaultWidthFeet: 2.2, defaultHeightFeet: 1.6, description: 'Generic analog sub-snake, digital I/O, or transformer split.' },
  { symbolId: 'stock_di_interface', label: 'DI / Audio Interface Box', group: 'racks', suggestedCategory: 'audio_power', defaultWidthFeet: 1.4, defaultHeightFeet: 1.1, description: 'Direct injection box, USB interface, or converter.' },
  { symbolId: 'stock_speaker_cab', label: 'Speaker / Amplifier Cab', group: 'racks', suggestedCategory: 'amplifiers', defaultWidthFeet: 2.8, defaultHeightFeet: 1.8, description: 'Generic powered speaker, PA sub, or instrument cabinet.' },

  // Power
  { symbolId: 'stock_power_bolt', label: 'Generic Power (Lightning Bolt)', group: 'power', suggestedCategory: 'power_distro', defaultWidthFeet: 1.5, defaultHeightFeet: 1.5, description: 'Universal lightning bolt stage power drop indicator.' },
  { symbolId: 'stock_power_distro_box', label: 'Power Distro / Tie-In Box', group: 'power', suggestedCategory: 'power_distro', defaultWidthFeet: 2.4, defaultHeightFeet: 1.8, description: 'Custom stage power distro or isolator box.' },

  // Monitoring, Headphones & IEMs
  { symbolId: 'stock_headphones', label: 'Studio / Monitoring Headphones', group: 'monitoring', suggestedCategory: 'monitoring', defaultWidthFeet: 1.6, defaultHeightFeet: 1.6, description: 'Wired headphone amp / personal cue monitoring station.' },
  { symbolId: 'stock_iem_ears', label: 'IEM In-Ear Monitors', group: 'monitoring', suggestedCategory: 'monitoring', defaultWidthFeet: 1.6, defaultHeightFeet: 1.6, description: 'Custom molded in-ear monitor earpieces mark.' },
  { symbolId: 'stock_iem_bodypack', label: 'IEM Bodypack Receiver', group: 'monitoring', suggestedCategory: 'monitoring', defaultWidthFeet: 1.6, defaultHeightFeet: 1.8, description: 'Wireless or wired IEM beltpack receiver position.' },
  { symbolId: 'stock_wedge_array', label: 'Monitor / Array Wedge', group: 'monitoring', suggestedCategory: 'monitoring', defaultWidthFeet: 2.2, defaultHeightFeet: 1.6, description: 'Generic stage monitor or front-fill enclosure.' },
  { symbolId: 'stock_rf_antenna_cart', label: 'RF / Wireless Antenna Cart', group: 'monitoring', suggestedCategory: 'monitoring', defaultWidthFeet: 2.4, defaultHeightFeet: 1.8, description: 'Wireless microphone or IEM antenna combiner cart.' },

  // Instruments
  { symbolId: 'stock_electric_guitar', label: 'Electric Guitar', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.2, defaultHeightFeet: 2.2, description: 'Electric guitar player / rack position.' },
  { symbolId: 'stock_bass_guitar', label: 'Electric Bass Guitar', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.3, defaultHeightFeet: 2.3, description: 'Electric bass guitar player position.' },
  { symbolId: 'stock_acoustic_guitar', label: 'Acoustic Guitar', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.2, defaultHeightFeet: 2.2, description: 'Acoustic guitar / DI position.' },
  { symbolId: 'stock_upright_bass', label: 'Upright / Double Bass', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.5, defaultHeightFeet: 3.0, description: 'Acoustic double bass / contrabass station.' },
  { symbolId: 'stock_cello', label: 'Cello', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.4, defaultHeightFeet: 2.6, description: 'Orchestral / acoustic cello position.' },
  { symbolId: 'stock_violin', label: 'Violin / Viola / Fiddle', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.0, defaultHeightFeet: 2.0, description: 'Violin, viola, or fiddle station.' },
  { symbolId: 'stock_saxophone', label: 'Saxophone', group: 'instruments', suggestedCategory: 'vocals', defaultWidthFeet: 2.0, defaultHeightFeet: 2.2, description: 'Alto, tenor, or baritone saxophone mark.' },
  { symbolId: 'stock_trumpet', label: 'Trumpet / Flugelhorn', group: 'instruments', suggestedCategory: 'vocals', defaultWidthFeet: 2.0, defaultHeightFeet: 2.0, description: 'Trumpet or flugelhorn brass station.' },
  { symbolId: 'stock_trombone', label: 'Trombone', group: 'instruments', suggestedCategory: 'vocals', defaultWidthFeet: 2.4, defaultHeightFeet: 2.2, description: 'Slide trombone brass station.' },
  { symbolId: 'stock_banjo', label: 'Banjo / Mandolin', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.0, defaultHeightFeet: 2.0, description: 'Banjo, mandolin, or bouzouki acoustic mark.' },
  { symbolId: 'stock_harp', label: 'Concert Harp', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 3.2, defaultHeightFeet: 3.5, description: 'Concert pedal or lever harp footprint.' },
  { symbolId: 'stock_accordion', label: 'Accordion', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 2.2, defaultHeightFeet: 2.0, description: 'Accordion / concertina player station.' },
  { symbolId: 'stock_marimba', label: 'Marimba / Vibraphone', group: 'instruments', suggestedCategory: 'drums', defaultWidthFeet: 6.5, defaultHeightFeet: 3.2, description: 'Concert marimba, vibraphone, or xylophone footprint.' },
  { symbolId: 'stock_timpani', label: 'Timpani Set', group: 'instruments', suggestedCategory: 'drums', defaultWidthFeet: 5.5, defaultHeightFeet: 4.5, description: 'Orchestral timpani kettle drum cluster.' },
  { symbolId: 'stock_modular_synth', label: 'Modular Synthesizer', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 3.4, defaultHeightFeet: 2.2, description: 'Eurorack modular synth or analog tabletop rig.' },
  { symbolId: 'stock_synth_station', label: 'Keyboard / Synth Table', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 4.5, defaultHeightFeet: 2.2, description: 'Modular synthesizer, keyboard rig, or controller table.' },
  { symbolId: 'stock_turntable_dj', label: 'DJ / Dual Controller Deck', group: 'instruments', suggestedCategory: 'strings_keys', defaultWidthFeet: 5.0, defaultHeightFeet: 2.4, description: 'Dual-deck DJ, sampler, or live electronic setup.' },
  { symbolId: 'stock_percussion_island', label: 'Percussion / Acoustic Island', group: 'instruments', suggestedCategory: 'drums', defaultWidthFeet: 5.0, defaultHeightFeet: 4.0, description: 'Custom percussion, hand-drum, or mallet station.' },

  // Audio Cable Connectors
  { symbolId: 'stock_conn_xlr', label: 'XLR 3-Pin Connector', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: 'Balanced 3-pin XLR mic/line drop point.' },
  { symbolId: 'stock_conn_xlr5', label: 'XLR 5-Pin (DMX/Stereo)', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: '5-pin XLR stereo audio, comms, or DMX drop.' },
  { symbolId: 'stock_conn_trs', label: '1/4" TS / TRS Jack', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.5, defaultHeightFeet: 1.4, description: '1/4-inch instrument or balanced line TRS drop.' },
  { symbolId: 'stock_conn_minijack', label: '3.5mm Mini-Jack', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: '3.5mm stereo aux / laptop / playback jack.' },
  { symbolId: 'stock_conn_rca', label: 'RCA / Phono Pair', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.5, defaultHeightFeet: 1.4, description: 'Stereo unbalanced RCA / phono L+R connection.' },
  { symbolId: 'stock_conn_speakon', label: 'Speakon NL4 / NL8', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.5, defaultHeightFeet: 1.5, description: 'Neutrik Speakon speaker-level feed drop.' },
  { symbolId: 'stock_conn_ethercon', label: 'EtherCON / RJ45 / Dante', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.5, defaultHeightFeet: 1.5, description: 'Shielded Cat6A EtherCON for Dante, AES50, or control.' },
  { symbolId: 'stock_conn_bnc', label: 'BNC RF / Word Clock', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: '50Ω RF antenna coax or 75Ω digital word clock BNC.' },
  { symbolId: 'stock_conn_fiber', label: 'OpticalCON / Fiber', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.6, defaultHeightFeet: 1.4, description: 'Tactical duplex/quad optical fiber snake drop.' },
  { symbolId: 'stock_conn_midi', label: 'MIDI 5-Pin DIN', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: '5-pin DIN MIDI control / timecode drop.' },
  { symbolId: 'stock_conn_usb', label: 'USB-C / Audio I/O', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.4, defaultHeightFeet: 1.4, description: 'USB audio interface or MIDI controller drop.' },
  { symbolId: 'stock_conn_multipin', label: 'Multipin / LK / W1', group: 'connectors', suggestedCategory: 'audio_connectors', defaultWidthFeet: 1.6, defaultHeightFeet: 1.6, description: 'Multi-channel circular disconnect (LK37/W1/Mass).' },

  // Staging & Utility
  { symbolId: 'stock_mic_stand_generic', label: 'Generic Mic Stand Position', group: 'staging', suggestedCategory: 'vocals', defaultWidthFeet: 1.8, defaultHeightFeet: 1.8, description: 'Boom stand mark for vocals, horns, or room mics.' },
  { symbolId: 'stock_riser_platform', label: 'Custom Riser / Platform', group: 'staging', suggestedCategory: 'stage_risers', defaultWidthFeet: 8.0, defaultHeightFeet: 4.0, description: 'Custom rolling or modular stage deck riser.' },
  { symbolId: 'stock_tech_table', label: 'Tech / Prep Worktable', group: 'staging', suggestedCategory: 'staging_props', defaultWidthFeet: 4.0, defaultHeightFeet: 2.2, description: 'Backline tech bench, laptop station, or repair table.' },
  { symbolId: 'stock_performer_zone', label: 'Performer Mark / Zone', group: 'staging', suggestedCategory: 'vocals', defaultWidthFeet: 3.0, defaultHeightFeet: 3.0, description: 'Dedicated performer standing zone or wireless mark.' },
  { symbolId: 'stock_video_led', label: 'Video / LED / Camera Position', group: 'staging', suggestedCategory: 'staging_props', defaultWidthFeet: 3.5, defaultHeightFeet: 1.6, description: 'Confidence screen, LED totem, or camera operator bay.' },
  { symbolId: 'stock_road_case', label: 'Road / Flight Case', group: 'staging', suggestedCategory: 'staging_props', defaultWidthFeet: 3.0, defaultHeightFeet: 2.0, description: 'Touring trunk, workbox, or backstage gear case.' },
  { symbolId: 'stock_utility_crate', label: 'Generic Custom Equipment', group: 'staging', suggestedCategory: 'staging_props', defaultWidthFeet: 2.5, defaultHeightFeet: 2.5, description: 'General-purpose schematic footprint for custom hardware.' },
];

export const SIGNAL_GROUP_COLORS = [
  '#38bdf8', // Sky Cyan
  '#34d399', // Emerald
  '#a78bfa', // Violet
  '#fb7185', // Rose
  '#fbbf24', // Amber
  '#2dd4bf', // Teal
  '#f97316', // Orange
  '#e879f9', // Fuchsia
];

export const DEFAULT_SIGNAL_GROUPS: SignalGroup[] = [
  { id: 'sg_drums', name: 'Drums Sub-Snake', shortCode: 'SNK-A', color: '#38bdf8', splitType: 'subsnake' },
  { id: 'sg_sr', name: 'Stage Right Snake', shortCode: 'SNK-B', color: '#34d399', splitType: 'subsnake' },
  { id: 'sg_sl', name: 'Stage Left Snake', shortCode: 'SNK-C', color: '#a78bfa', splitType: 'subsnake' },
  { id: 'sg_split', name: 'FOH / MON Split', shortCode: 'SPLIT', color: '#fb7185', splitType: 'foh_mon_split' },
  { id: 'sg_dante', name: 'Dante / Network Audio', shortCode: 'DANTE', color: '#fbbf24', splitType: 'dante_network' },
  { id: 'sg_rf', name: 'RF / IEM Bus', shortCode: 'RF', color: '#2dd4bf', splitType: 'rf_iem' },
];

export const GEAR_DEFINITIONS: Record<string, GearDefinition> = {
  // Drums & Percussion
  drum_kit_standard: {
    type: 'drum_kit_standard',
    label: 'Acoustic Drum Kit (5-Pc)',
    category: 'drums',
    defaultWidthFeet: 6.5,
    defaultHeightFeet: 6.0,
    description: '5-piece drum kit with kick, snare, 3 toms, hi-hat, crashes, ride & throne.',
    defaultPower: { required: false, connector: 'None', voltage: '120V', dropsCount: 0 },
    defaultSubSnake: 'SNK-A',
    defaultSignalGroupId: 'sg_drums',
    defaultChannels: [
      { name: 'Kick In', category: 'drums', micOrDI: 'Shure Beta 91A', standType: 'direct', phantom48V: true, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Kick Out', category: 'drums', micOrDI: 'Shure Beta 52A', standType: 'short_boom', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Snare Top', category: 'drums', micOrDI: 'Shure SM57', standType: 'short_boom', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Snare Bottom', category: 'drums', micOrDI: 'Sennheiser e904', standType: 'claw', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Hi-Hat', category: 'drums', micOrDI: 'Shure KSM 137', standType: 'short_boom', phantom48V: true, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Rack Tom 1', category: 'drums', micOrDI: 'Sennheiser e904', standType: 'claw', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Rack Tom 2', category: 'drums', micOrDI: 'Sennheiser e904', standType: 'claw', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'Floor Tom', category: 'drums', micOrDI: 'Sennheiser e904', standType: 'claw', phantom48V: false, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'OH Left', category: 'drums', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
      { name: 'OH Right', category: 'drums', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR', stageLocation: 'USC (Drums)', subSnake: 'SNK-A' },
    ],
  },
  drum_kit_compact: {
    type: 'drum_kit_compact',
    label: 'Compact / Jazz Drum Kit (4-Pc)',
    category: 'drums',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 5.2,
    description: '4-piece kit with single rack tom, floor tom, hi-hat, crash & ride.',
  },
  electronic_drum_kit: {
    type: 'electronic_drum_kit',
    label: 'Electronic Drum Rig',
    category: 'drums',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 4.8,
    description: 'Electronic mesh trigger pads, cymbals & module.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'E-Drums L', category: 'drums', micOrDI: 'Stereo Active DI', standType: 'direct', phantom48V: true, connector: '1/4" Jack (TS/TRS)' },
      { name: 'E-Drums R', category: 'drums', micOrDI: 'Stereo Active DI', standType: 'direct', phantom48V: true, connector: '1/4" Jack (TS/TRS)' },
    ],
  },
  percussion_setup: {
    type: 'percussion_setup',
    label: 'Percussion Station',
    category: 'drums',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 4.5,
    description: 'Congas, timbales, chimes & auxiliary percussion.',
  },
  cajon: {
    type: 'cajon',
    label: 'Acoustic Cajón',
    category: 'drums',
    defaultWidthFeet: 2.2,
    defaultHeightFeet: 2.2,
    description: 'Acoustic box percussion.',
  },

  // Amps & Backline
  guitar_combo_amp: {
    type: 'guitar_combo_amp',
    label: 'Guitar Combo Amp',
    category: 'amplifiers',
    defaultWidthFeet: 2.8,
    defaultHeightFeet: 1.8,
    description: '1x12" or 2x12" guitar combo amplifier.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Guitar Amp', category: 'guitars', micOrDI: 'Sennheiser e906', standType: 'short_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  guitar_half_stack: {
    type: 'guitar_half_stack',
    label: 'Guitar Half Stack (4x12)',
    category: 'amplifiers',
    defaultWidthFeet: 3.0,
    defaultHeightFeet: 2.2,
    description: 'Guitar amp head & 4x12 cabinet.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Guitar 4x12', category: 'guitars', micOrDI: 'Shure SM57', standType: 'short_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  bass_combo_amp: {
    type: 'bass_combo_amp',
    label: 'Bass Combo Amp',
    category: 'amplifiers',
    defaultWidthFeet: 3.0,
    defaultHeightFeet: 2.0,
    description: 'Bass amplifier combo.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Bass DI', category: 'bass', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: 'XLR' },
    ],
  },
  bass_full_rig: {
    type: 'bass_full_rig',
    label: 'Bass Head & Cab Rig',
    category: 'amplifiers',
    defaultWidthFeet: 3.2,
    defaultHeightFeet: 2.4,
    description: 'Full-size bass amplifier & 4x10 / 8x10 cabinet.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Bass DI', category: 'bass', micOrDI: 'Radial J48 Active DI', standType: 'direct', phantom48V: true, connector: 'XLR' },
      { name: 'Bass Mic', category: 'bass', micOrDI: 'Electro-Voice RE20', standType: 'short_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  pedalboard: {
    type: 'pedalboard',
    label: 'Pedalboard / Amp Modeler',
    category: 'amplifiers',
    defaultWidthFeet: 2.6,
    defaultHeightFeet: 1.5,
    description: 'Floor pedalboard or stereo amp modeler unit.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
  },
  acoustic_guitar_di: {
    type: 'acoustic_guitar_di',
    label: 'Acoustic Instrument Station',
    category: 'strings_keys',
    defaultWidthFeet: 2.5,
    defaultHeightFeet: 2.2,
    description: 'Acoustic guitar/mandolin position with inline DI.',
    defaultChannels: [
      { name: 'Acoustic DI', category: 'guitars', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: '1/4" Jack (TS/TRS)' },
    ],
  },
  guitar_stand_rack: {
    type: 'guitar_stand_rack',
    label: 'Multi-Guitar Stand / Boat',
    category: 'amplifiers',
    defaultWidthFeet: 3.4,
    defaultHeightFeet: 1.8,
    description: '4-slot stage guitar rack.',
  },

  // Keys & Playback
  keyboard_single: {
    type: 'keyboard_single',
    label: 'Keyboard (Single Tier)',
    category: 'strings_keys',
    defaultWidthFeet: 4.8,
    defaultHeightFeet: 2.2,
    description: '88-key stage piano or synthesizer.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Keys L', category: 'keys', micOrDI: 'Stereo Passive DI', standType: 'direct', phantom48V: false, connector: '1/4" Jack (TS/TRS)' },
      { name: 'Keys R', category: 'keys', micOrDI: 'Stereo Passive DI', standType: 'direct', phantom48V: false, connector: '1/4" Jack (TS/TRS)' },
    ],
  },
  keyboard_dual_tier: {
    type: 'keyboard_dual_tier',
    label: 'Dual Tier Keyboard Rig',
    category: 'strings_keys',
    defaultWidthFeet: 5.0,
    defaultHeightFeet: 2.8,
    description: 'Two-tier stage piano and upper synth setup.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
  },
  grand_piano: {
    type: 'grand_piano',
    label: 'Grand Piano',
    category: 'strings_keys',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 6.2,
    description: 'Acoustic grand piano.',
    defaultChannels: [
      { name: 'Piano Low', category: 'keys', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR' },
      { name: 'Piano High', category: 'keys', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR' },
    ],
  },
  dj_turntables: {
    type: 'dj_turntables',
    label: 'DJ / CDJ Console Table',
    category: 'strings_keys',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 2.5,
    description: 'Dual decks/turntables & 4-channel club mixer.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', dropsCount: 1 },
    defaultChannels: [
      { name: 'DJ L', category: 'playback', micOrDI: 'Line Level / Direct Out', standType: 'direct', phantom48V: false, connector: 'XLR' },
      { name: 'DJ R', category: 'playback', micOrDI: 'Line Level / Direct Out', standType: 'direct', phantom48V: false, connector: 'XLR' },
    ],
  },
  playback_rack: {
    type: 'playback_rack',
    label: 'Playback / Tracks Rack',
    category: 'strings_keys',
    defaultWidthFeet: 2.4,
    defaultHeightFeet: 2.0,
    description: 'Redundant backing track interface & audio rack.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V', dropsCount: 1 },
  },

  // Vocals, Horns & Strings
  vocal_straight_stand: {
    type: 'vocal_straight_stand',
    label: 'Vocal Mic (Straight / Round)',
    category: 'vocals',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.8,
    description: 'Round cast-iron base straight mic stand.',
    defaultChannels: [
      { name: 'Lead Vocal', category: 'vocals', micOrDI: 'Shure SM58', standType: 'straight_round', phantom48V: false, connector: 'XLR' },
    ],
  },
  vocal_boom_stand: {
    type: 'vocal_boom_stand',
    label: 'Vocal Mic (Tall Boom)',
    category: 'vocals',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.0,
    description: 'Tripod tall boom stand for singing instrumentalists.',
    defaultChannels: [
      { name: 'Backing Vocal', category: 'vocals', micOrDI: 'Shure SM58', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  vocal_short_boom: {
    type: 'vocal_short_boom',
    label: 'Instrument Mic (Short Boom)',
    category: 'vocals',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: 'Short tripod boom stand for amps, cabs, or seated instruments.',
  },
  wireless_handheld: {
    type: 'wireless_handheld',
    label: 'Wireless Handheld Station',
    category: 'vocals',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.8,
    description: 'UHF RF wireless handheld vocal microphone.',
    defaultChannels: [
      { name: 'RF Vocal', category: 'vocals', micOrDI: 'Shure RF SM58 (Wireless)', standType: 'straight_round', phantom48V: false, connector: 'Wireless RF' },
    ],
  },
  horn_sax_trumpet: {
    type: 'horn_sax_trumpet',
    label: 'Brass / Horn Position',
    category: 'vocals',
    defaultWidthFeet: 2.8,
    defaultHeightFeet: 2.4,
    description: 'Saxophone, trumpet, or trombone stage mark.',
  },
  strings_violin_cello: {
    type: 'strings_violin_cello',
    label: 'Strings Position',
    category: 'vocals',
    defaultWidthFeet: 2.8,
    defaultHeightFeet: 2.4,
    description: 'Violin, viola, or cello stage position.',
  },

  // Monitoring & Foldback
  monitor_wedge_standard: {
    type: 'monitor_wedge_standard',
    label: 'Floor Monitor Wedge',
    category: 'monitoring',
    defaultWidthFeet: 2.2,
    defaultHeightFeet: 1.6,
    description: '12" or 15" coaxial stage floor wedge.',
  },
  monitor_wedge_low_profile: {
    type: 'monitor_wedge_low_profile',
    label: 'Low-Profile Wedge',
    category: 'monitoring',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 1.4,
    description: 'Compact downstage monitor wedge.',
  },
  drum_monitor_sub: {
    type: 'drum_monitor_sub',
    label: 'Drum Fill / Sub Wedge',
    category: 'monitoring',
    defaultWidthFeet: 2.6,
    defaultHeightFeet: 2.2,
    description: 'High-output drum monitor wedge & sub.',
  },
  side_fill_rig: {
    type: 'side_fill_rig',
    label: 'Side Fill Stack',
    category: 'monitoring',
    defaultWidthFeet: 2.8,
    defaultHeightFeet: 2.2,
    description: 'Stage-edge side fill speaker enclosure.',
  },
  iem_pack_station: {
    type: 'iem_pack_station',
    label: 'IEM RF Rack / Antenna',
    category: 'monitoring',
    defaultWidthFeet: 2.4,
    defaultHeightFeet: 1.8,
    description: 'In-ear monitor wireless transmitter & directional paddle.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V', dropsCount: 1 },
    defaultSignalGroupId: 'sg_rf',
  },

  // Audio Patch, Snakes & Splits
  drop_snake_subbox: {
    type: 'drop_snake_subbox',
    label: 'Sub-Snake Drop Box',
    category: 'audio_power',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 1.5,
    description: '8-ch or 16-ch analog stage sub-snake box.',
  },
  stage_box_digital: {
    type: 'stage_box_digital',
    label: 'Digital Stage Box (Dante/AES50)',
    category: 'audio_power',
    defaultWidthFeet: 2.6,
    defaultHeightFeet: 1.8,
    description: '32x16 networked digital I/O stage rack.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V', dropsCount: 1 },
    defaultSignalGroupId: 'sg_dante',
  },
  foh_mon_split_rack: {
    type: 'foh_mon_split_rack',
    label: 'FOH / MON Transformer Split Rack',
    category: 'audio_power',
    defaultWidthFeet: 2.8,
    defaultHeightFeet: 2.2,
    description: '48-ch passive/active isolated FOH & Monitor stage split rack.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V', dropsCount: 1 },
    defaultSignalGroupId: 'sg_split',
  },
  direct_injection_box: {
    type: 'direct_injection_box',
    label: 'DI Box (Active / Passive)',
    category: 'audio_power',
    defaultWidthFeet: 1.3,
    defaultHeightFeet: 1.0,
    description: 'Single or stereo direct injection interface box.',
  },

  // Global / US / UK / EU Power Drops & Distro
  ac_power_drop_quad: {
    type: 'ac_power_drop_quad',
    label: 'Edison Quad Drop (120V)',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.4,
    description: 'Isolated 20A NEMA 5-15/20 Edison Quad box.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 },
  },
  power_edison_quad: {
    type: 'power_edison_quad',
    label: 'NEMA 5-15/20 Edison Quad',
    category: 'power_distro',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.5,
    description: 'Standard North American 120V 20A Quad receptacle drop.',
    defaultPower: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 },
  },
  power_l5_20: {
    type: 'power_l5_20',
    label: 'NEMA L5-20 Twist-Lock (120V)',
    category: 'power_distro',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: '20A 120V locking NEMA L5-20 drop.',
    defaultPower: { required: true, connector: 'NEMA L5-20 Twist-Lock (120V)', voltage: '120V', amps: 20, dropsCount: 1 },
  },
  power_l5_30: {
    type: 'power_l5_30',
    label: 'NEMA L5-30 Twist-Lock (120V)',
    category: 'power_distro',
    defaultWidthFeet: 1.7,
    defaultHeightFeet: 1.7,
    description: '30A 120V locking NEMA L5-30 drop.',
    defaultPower: { required: true, connector: 'NEMA L5-30 Twist-Lock (120V)', voltage: '120V', amps: 30, dropsCount: 1 },
  },
  power_l14_30: {
    type: 'power_l14_30',
    label: 'NEMA L14-30 (120/240V)',
    category: 'power_distro',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.8,
    description: '30A 4-wire 120/240V split-phase twist-lock drop.',
    defaultPower: { required: true, connector: 'NEMA L14-30 (120/240V)', voltage: '120/240V', amps: 30, dropsCount: 1 },
  },
  power_14_50: {
    type: 'power_14_50',
    label: 'NEMA 14-50 (50A 240V)',
    category: 'power_distro',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.8,
    description: '50A 240V range / small distro feeder drop.',
    defaultPower: { required: true, connector: 'NEMA 14-50 (240V)', voltage: '240V', amps: 50, dropsCount: 1 },
  },
  power_cam_lok: {
    type: 'power_cam_lok',
    label: 'Cam-Lok 3-Phase Feeder (400A)',
    category: 'power_distro',
    defaultWidthFeet: 2.6,
    defaultHeightFeet: 1.8,
    description: '5-wire 16-series Cam-Lok 3-phase company switch tie-in.',
    defaultPower: { required: true, connector: 'Cam-Lok 3-Phase Feeder', voltage: '208V 3Ø', amps: 400, dropsCount: 1 },
  },
  power_uk_13a: {
    type: 'power_uk_13a',
    label: 'UK 13A BS 1363 Drop (230V)',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Standard UK 13A 230V switched twin socket drop.',
    defaultPower: { required: true, connector: 'UK 13A BS 1363', voltage: '230V', amps: 13, dropsCount: 1 },
  },
  power_schuko: {
    type: 'power_schuko',
    label: 'EU Schuko Drop (16A 230V)',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Continental European CEE 7/3 Schuko 16A 230V drop.',
    defaultPower: { required: true, connector: 'EU Schuko (16A 230V)', voltage: '230V', amps: 16, dropsCount: 1 },
  },
  power_cee_16a_blue: {
    type: 'power_cee_16a_blue',
    label: 'CEE 16A 1-Phase (Blue 230V)',
    category: 'power_distro',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: 'UK/EU IEC 60309 16A 2P+E 230V Blue Commando drop.',
    defaultPower: { required: true, connector: 'CEE 16A 1-Phase (Blue 230V)', voltage: '230V', amps: 16, dropsCount: 1 },
  },
  power_cee_32a_blue: {
    type: 'power_cee_32a_blue',
    label: 'CEE 32A 1-Phase (Blue 230V)',
    category: 'power_distro',
    defaultWidthFeet: 1.7,
    defaultHeightFeet: 1.7,
    description: 'UK/EU IEC 60309 32A 2P+E 230V Blue Commando drop.',
    defaultPower: { required: true, connector: 'CEE 32A 1-Phase (Blue 230V)', voltage: '230V', amps: 32, dropsCount: 1 },
  },
  power_cee_16a_red: {
    type: 'power_cee_16a_red',
    label: 'CEE 16A 3-Phase (Red 400V)',
    category: 'power_distro',
    defaultWidthFeet: 1.7,
    defaultHeightFeet: 1.7,
    description: 'UK/EU IEC 60309 16A 3P+N+E 400V Red 3-Phase drop.',
    defaultPower: { required: true, connector: 'CEE 16A 3-Phase (Red 400V)', voltage: '400V 3Ø', amps: 16, dropsCount: 1 },
  },
  power_cee_32a_red: {
    type: 'power_cee_32a_red',
    label: 'CEE 32A 3-Phase (Red 400V)',
    category: 'power_distro',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.8,
    description: 'UK/EU IEC 60309 32A 3P+N+E 400V Red 3-Phase drop.',
    defaultPower: { required: true, connector: 'CEE 32A 3-Phase (Red 400V)', voltage: '400V 3Ø', amps: 32, dropsCount: 1 },
  },
  power_cee_63a_red: {
    type: 'power_cee_63a_red',
    label: 'CEE 63A 3-Phase (Red 400V)',
    category: 'power_distro',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.0,
    description: 'UK/EU IEC 60309 63A 3P+N+E 400V Red heavy distro feeder.',
    defaultPower: { required: true, connector: 'CEE 63A 3-Phase (Red 400V)', voltage: '400V 3Ø', amps: 63, dropsCount: 1 },
  },
  power_powercon_20a: {
    type: 'power_powercon_20a',
    label: 'Neutrik PowerCON 20A',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Neutrik NAC3FCA blue PowerCON 20A rack/amp drop.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON 20A', voltage: '120/230V', amps: 20, dropsCount: 1 },
  },
  power_powercon_true1: {
    type: 'power_powercon_true1',
    label: 'Neutrik PowerCON TRUE1',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'IP65 breaking-capacity Neutrik TRUE1 TOP drop.',
    defaultPower: { required: true, connector: 'Neutrik PowerCON TRUE1', voltage: '120/230V', amps: 20, dropsCount: 1 },
  },
  power_distro_rack: {
    type: 'power_distro_rack',
    label: 'Touring Power Distro Rack',
    category: 'power_distro',
    defaultWidthFeet: 2.6,
    defaultHeightFeet: 2.2,
    description: '3-phase touring power distribution rack with Socapex/Edison/CEE outs.',
    defaultPower: { required: true, connector: 'Touring Power Distro Rack', voltage: '3-Phase Distro', amps: 100, dropsCount: 1 },
  },

  // Risers & Staging Props
  drum_riser_8x8: {
    type: 'drum_riser_8x8',
    label: 'Drum Riser (8ft × 8ft)',
    category: 'stage_risers',
    defaultWidthFeet: 8.0,
    defaultHeightFeet: 8.0,
    description: 'Elevated rolling or stationary drum platform.',
  },
  riser_generic_8x4: {
    type: 'riser_generic_8x4',
    label: 'Stage Riser (8ft × 4ft)',
    category: 'stage_risers',
    defaultWidthFeet: 8.0,
    defaultHeightFeet: 4.0,
    description: 'Modular 8x4 stage deck.',
  },
  riser_generic_6x4: {
    type: 'riser_generic_6x4',
    label: 'Stage Riser (6ft × 4ft)',
    category: 'stage_risers',
    defaultWidthFeet: 6.0,
    defaultHeightFeet: 4.0,
    description: 'Compact 6x4 stage deck.',
  },
  teleprompter: {
    type: 'teleprompter',
    label: 'Teleprompter / Confidence Monitor',
    category: 'staging_props',
    defaultWidthFeet: 2.4,
    defaultHeightFeet: 1.6,
    description: 'Downstage angled lyric / cue screen.',
  },
  bar_stool: {
    type: 'bar_stool',
    label: 'Performer Stool (No Arms)',
    category: 'staging_props',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Black stage bar stool.',
  },
  music_stand: {
    type: 'music_stand',
    label: 'Music Stand',
    category: 'staging_props',
    defaultWidthFeet: 1.8,
    defaultHeightFeet: 1.6,
    description: 'Orchestral / sheet music stand.',
  },

  // Generic Power Drop (Lightning Bolt)
  power_generic_bolt: {
    type: 'power_generic_bolt',
    label: 'Generic Power Drop (Bolt)',
    category: 'power_distro',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Universal lightning bolt stage power drop indicator.',
    defaultPower: { required: true, connector: 'Generic Power Drop', voltage: '120/230V', dropsCount: 1 },
  },

  // Headphones & In-Ear Monitors (IEMs)
  headphones_monitoring: {
    type: 'headphones_monitoring',
    label: 'Monitoring Headphones',
    category: 'monitoring',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: 'Studio / personal cue headphones station.',
  },
  iem_earpieces: {
    type: 'iem_earpieces',
    label: 'In-Ear Monitors (IEMs)',
    category: 'monitoring',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: 'Custom molded IEM earpieces position.',
  },
  iem_bodypack_receiver: {
    type: 'iem_bodypack_receiver',
    label: 'IEM Bodypack Receiver',
    category: 'monitoring',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.8,
    description: 'Wireless or wired IEM beltpack receiver.',
  },

  // Instruments (Guitars, Strings, Brass, Woodwinds, Mallets, Synths)
  electric_guitar: {
    type: 'electric_guitar',
    label: 'Electric Guitar',
    category: 'strings_keys',
    defaultWidthFeet: 2.2,
    defaultHeightFeet: 2.2,
    description: 'Electric guitar player / rack position.',
    defaultChannels: [
      { name: 'Electric Gtr', category: 'guitars', micOrDI: 'Shure SM57', standType: 'short_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  bass_guitar: {
    type: 'bass_guitar',
    label: 'Bass Guitar',
    category: 'strings_keys',
    defaultWidthFeet: 2.3,
    defaultHeightFeet: 2.3,
    description: 'Electric bass guitar station.',
    defaultChannels: [
      { name: 'Bass DI', category: 'bass', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: 'XLR' },
    ],
  },
  acoustic_guitar: {
    type: 'acoustic_guitar',
    label: 'Acoustic Guitar',
    category: 'strings_keys',
    defaultWidthFeet: 2.2,
    defaultHeightFeet: 2.2,
    description: 'Acoustic guitar / DI position.',
    defaultChannels: [
      { name: 'Acoustic Gtr', category: 'guitars', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: '1/4" Jack (TS/TRS)' },
    ],
  },
  upright_bass: {
    type: 'upright_bass',
    label: 'Upright / Double Bass',
    category: 'strings_keys',
    defaultWidthFeet: 2.5,
    defaultHeightFeet: 3.0,
    description: 'Acoustic double bass / contrabass station.',
    defaultChannels: [
      { name: 'Upright Bass', category: 'bass', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: 'XLR' },
    ],
  },
  cello_instrument: {
    type: 'cello_instrument',
    label: 'Cello',
    category: 'strings_keys',
    defaultWidthFeet: 2.4,
    defaultHeightFeet: 2.6,
    description: 'Acoustic / amplified cello station.',
    defaultChannels: [
      { name: 'Cello', category: 'strings', micOrDI: 'Neumann KM 184', standType: 'short_boom', phantom48V: true, connector: 'XLR' },
    ],
  },
  violin_viola: {
    type: 'violin_viola',
    label: 'Violin / Viola / Fiddle',
    category: 'strings_keys',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.0,
    description: 'Violin, viola, or fiddle station.',
    defaultChannels: [
      { name: 'Violin / Fiddle', category: 'strings', micOrDI: 'Active DI (Generic)', standType: 'clip', phantom48V: true, connector: 'XLR' },
    ],
  },
  saxophone: {
    type: 'saxophone',
    label: 'Saxophone',
    category: 'vocals',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.2,
    description: 'Alto, tenor, or baritone saxophone station.',
    defaultChannels: [
      { name: 'Saxophone', category: 'horns', micOrDI: 'Sennheiser MD 421-II', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  trumpet_brass: {
    type: 'trumpet_brass',
    label: 'Trumpet / Flugelhorn',
    category: 'vocals',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.0,
    description: 'Trumpet or flugelhorn brass station.',
    defaultChannels: [
      { name: 'Trumpet', category: 'horns', micOrDI: 'Shure Beta 57A', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  trombone_brass: {
    type: 'trombone_brass',
    label: 'Trombone',
    category: 'vocals',
    defaultWidthFeet: 2.4,
    defaultHeightFeet: 2.2,
    description: 'Slide trombone brass station.',
    defaultChannels: [
      { name: 'Trombone', category: 'horns', micOrDI: 'Electro-Voice RE20', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  banjo_mandolin: {
    type: 'banjo_mandolin',
    label: 'Banjo / Mandolin',
    category: 'strings_keys',
    defaultWidthFeet: 2.0,
    defaultHeightFeet: 2.0,
    description: 'Banjo or mandolin station.',
    defaultChannels: [
      { name: 'Banjo / Mando', category: 'strings', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: '1/4" Jack (TS/TRS)' },
    ],
  },
  harp_concert: {
    type: 'harp_concert',
    label: 'Concert Harp',
    category: 'strings_keys',
    defaultWidthFeet: 3.2,
    defaultHeightFeet: 3.5,
    description: 'Concert pedal or lever harp position.',
    defaultChannels: [
      { name: 'Harp DI', category: 'strings', micOrDI: 'Active DI (Generic)', standType: 'direct', phantom48V: true, connector: 'XLR' },
    ],
  },
  accordion_keys: {
    type: 'accordion_keys',
    label: 'Accordion',
    category: 'strings_keys',
    defaultWidthFeet: 2.2,
    defaultHeightFeet: 2.0,
    description: 'Accordion player position.',
    defaultChannels: [
      { name: 'Accordion', category: 'keys', micOrDI: 'Shure SM57', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  marimba_vibes: {
    type: 'marimba_vibes',
    label: 'Marimba / Vibraphone',
    category: 'drums',
    defaultWidthFeet: 6.5,
    defaultHeightFeet: 3.2,
    description: 'Concert marimba, vibraphone, or xylophone.',
    defaultChannels: [
      { name: 'Mallet L', category: 'drums', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR' },
      { name: 'Mallet R', category: 'drums', micOrDI: 'AKG C414 XLS', standType: 'tall_boom', phantom48V: true, connector: 'XLR' },
    ],
  },
  timpani_kettle: {
    type: 'timpani_kettle',
    label: 'Timpani Set',
    category: 'drums',
    defaultWidthFeet: 5.5,
    defaultHeightFeet: 4.5,
    description: 'Orchestral timpani kettle drums.',
    defaultChannels: [
      { name: 'Timpani L', category: 'drums', micOrDI: 'Sennheiser MD 421-II', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
      { name: 'Timpani R', category: 'drums', micOrDI: 'Sennheiser MD 421-II', standType: 'tall_boom', phantom48V: false, connector: 'XLR' },
    ],
  },
  synth_modular: {
    type: 'synth_modular',
    label: 'Modular Synthesizer',
    category: 'strings_keys',
    defaultWidthFeet: 3.4,
    defaultHeightFeet: 2.2,
    description: 'Eurorack modular or desktop analog synth rig.',
    defaultPower: { required: true, connector: 'Generic Power Drop', voltage: '120/230V', dropsCount: 1 },
    defaultChannels: [
      { name: 'Modular L', category: 'keys', micOrDI: 'Stereo Passive DI', standType: 'direct', phantom48V: false, connector: '1/4" Jack (TS/TRS)' },
      { name: 'Modular R', category: 'keys', micOrDI: 'Stereo Passive DI', standType: 'direct', phantom48V: false, connector: '1/4" Jack (TS/TRS)' },
    ],
  },

  // Audio Cable Connections (Schematic Drop Symbols)
  conn_xlr_3pin: {
    type: 'conn_xlr_3pin',
    label: 'XLR 3-Pin Drop',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Balanced 3-pin XLR microphone / line audio cable connection.',
  },
  conn_xlr_5pin: {
    type: 'conn_xlr_5pin',
    label: 'XLR 5-Pin (DMX/Stereo)',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: '5-pin XLR stereo audio, comms, or DMX connection.',
  },
  conn_jack_trs: {
    type: 'conn_jack_trs',
    label: '1/4" TS/TRS Jack Drop',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: '1/4-inch instrument TS or balanced TRS line cable connection.',
  },
  conn_minijack_35mm: {
    type: 'conn_minijack_35mm',
    label: '3.5mm Mini-Jack Drop',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: '3.5mm stereo aux / laptop / playback mini-jack connection.',
  },
  conn_rca_phono: {
    type: 'conn_rca_phono',
    label: 'RCA / Phono Stereo',
    category: 'audio_connectors',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.5,
    description: 'Unbalanced L/R RCA phono stereo cable connection.',
  },
  conn_speakon_nl4: {
    type: 'conn_speakon_nl4',
    label: 'Speakon NL4 / NL8',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Neutrik Speakon speaker-level feed drop.',
  },
  conn_ethercon_rj45: {
    type: 'conn_ethercon_rj45',
    label: 'EtherCON / RJ45 / Dante',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Shielded Cat6A EtherCON for Dante, AES50, or console control.',
  },
  conn_bnc_rf: {
    type: 'conn_bnc_rf',
    label: 'BNC RF / Word Clock',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'Coaxial BNC antenna RF or digital word clock drop.',
  },
  conn_optical_fiber: {
    type: 'conn_optical_fiber',
    label: 'OpticalCON / Fiber',
    category: 'audio_connectors',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.5,
    description: 'Tactical optical fiber snake connection.',
  },
  conn_midi_5pin: {
    type: 'conn_midi_5pin',
    label: 'MIDI 5-Pin DIN',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: '5-pin DIN MIDI control / timecode drop.',
  },
  conn_usb_audio: {
    type: 'conn_usb_audio',
    label: 'USB-C / Audio Interface',
    category: 'audio_connectors',
    defaultWidthFeet: 1.5,
    defaultHeightFeet: 1.5,
    description: 'USB-C digital audio / MIDI connection drop.',
  },
  conn_multipin_socapex: {
    type: 'conn_multipin_socapex',
    label: 'Multipin / LK / W1',
    category: 'audio_connectors',
    defaultWidthFeet: 1.6,
    defaultHeightFeet: 1.6,
    description: 'Circular multi-channel audio disconnect (LK37 / W1 / Mass).',
  },

  // Stock CAD Shapes (Directly usable as generic blocks!)
  ...Object.fromEntries(
    STOCK_SYMBOL_OPTIONS.map((opt) => [
      opt.symbolId,
      {
        type: opt.symbolId,
        label: opt.label,
        category: 'stock_shapes' as GearCategory,
        defaultWidthFeet: opt.defaultWidthFeet,
        defaultHeightFeet: opt.defaultHeightFeet,
        description: opt.description,
        stockSymbol: opt.symbolId,
      } satisfies GearDefinition,
    ])
  ),
};

// -----------------------------------------------------------------------------
// CLEAN GENERIC TEMPLATES FOR AUDIO ENGINEERS
// -----------------------------------------------------------------------------

export const BAND_TEMPLATES: Record<string, StageProject> = {
  band_4piece: {
    id: 'template_band_4piece',
    title: '4-Piece Touring Band — Stage Plot & Input Patch',
    artistName: 'Artist / Band Name',
    versionDate: 'Rev 1.0',
    date: new Date().toISOString().split('T')[0],
    venueOrTour: 'Club & Theater Production',
    productionNotes: 'Standard 4-piece band patch with 4 floor wedge mixes and 16 console inputs.',
    audioNotes: `• 4 Short Boom Tripod Stands
• 5 Tall Boom Tripod Stands
• 1 Straight / Round Base Stand
• 16 (15') & 12 (25') XLR Cables
• x1 (16-Ch) Drum Sub-Snake (SNK-A)
• Dedicated clean 20A AC drops as marked`,
    miscNotes: `• 8' x 8' x 16" carpeted drum riser (USC)
• Please isolate audio AC from dimmer racks
• FOH advance 48h prior to load-in`,
    contacts: [
      {
        role: 'FOH / PRODUCTION CONTACT',
        name: 'Audio Lead',
        phone: '+1 (555) 010-4800',
        email: 'production@example.com',
      },
    ],
    stageDimensions: { widthFeet: 28, depthFeet: 18, unit: 'feet' },
    powerRequirements: {
      dedicatedDrops120V: 4,
      dedicatedDrops230V: 0,
      stageRiserSpecs: '8ft x 8ft x 16in carpeted drum riser at Upstage Center.',
      backlineNotes: 'Guitar tube combo SR, Bass head & 4x10 rig SL.',
      notes: '4x isolated 20A AC quad drops (Drums, SR Amp, SL Amp, DSC Pedalboard).',
    },
    techZone: {
      enabled: false,
      label: 'MONITOR / TECH WORLD (SR)',
      location: 'SR',
    },
    showSignalPaths: true,
    signalGroups: DEFAULT_SIGNAL_GROUPS,
    monitors: [
      { id: 'm1', mixNumber: 1, performer: 'Mix 1 — Lead Vocal', type: 'floor_wedge', location: 'DSC', outputPatch: 'Aux 1', requestedContent: 'Lead Vox, Acoustic, Snare', linkedStageItemId: 'it_wedge_c' },
      { id: 'm2', mixNumber: 2, performer: 'Mix 2 — Guitar', type: 'floor_wedge', location: 'DSR', outputPatch: 'Aux 2', requestedContent: 'Gtr, Lead Vox, Bkg Vox', linkedStageItemId: 'it_wedge_sr' },
      { id: 'm3', mixNumber: 3, performer: 'Mix 3 — Bass', type: 'floor_wedge', location: 'DSL', outputPatch: 'Aux 3', requestedContent: 'Bass, Kick, Snare, Bkg Vox', linkedStageItemId: 'it_wedge_sl' },
      { id: 'm4', mixNumber: 4, performer: 'Mix 4 — Drums', type: 'drum_sub', location: 'USC Riser', outputPatch: 'Aux 4', requestedContent: 'Kick, Bass, Lead Vox, Gtr', linkedStageItemId: 'it_drum_sub' },
    ],
    items: [
      { id: 'it_riser', type: 'drum_riser_8x8', name: '8x8 Drum Riser', x: 50, y: 26, rotation: 0, width: 8, height: 8, locked: false },
      { id: 'it_drums', type: 'drum_kit_standard', name: 'Drum Kit', performer: 'Drums', x: 50, y: 26, rotation: 0, width: 6.5, height: 6.0, signalGroupId: 'sg_drums', routeToItemId: 'it_snake', subSnakeLabel: 'SNK-A' },
      { id: 'it_drum_sub', type: 'drum_monitor_sub', name: 'Drum Wedge', wedgeLabel: 'WEDGE MX 4', x: 37, y: 27, rotation: 55, width: 2.4, height: 2.0 },
      { id: 'it_snake', type: 'drop_snake_subbox', name: 'Drum Sub-Snake', x: 64, y: 21, rotation: 0, width: 2.0, height: 1.5, signalGroupId: 'sg_drums', routeToItemId: 'it_split', subSnakeLabel: 'SNK-A' },
      { id: 'it_split', type: 'foh_mon_split_rack', name: 'FOH/MON Split', x: 88, y: 18, rotation: 0, width: 2.4, height: 2.0, signalGroupId: 'sg_split', subSnakeLabel: 'SPLIT' },
      { id: 'it_ac_drums', type: 'power_edison_quad', name: 'Edison Quad', x: 61, y: 32, rotation: 0, width: 1.5, height: 1.4, powerSpec: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 } },

      { id: 'it_gtr_amp', type: 'guitar_combo_amp', name: 'Guitar Amp', performer: 'Stage Right', x: 20, y: 34, rotation: 25, width: 2.8, height: 1.8, powerDropRequired: true, signalGroupId: 'sg_sr', routeToItemId: 'it_split', subSnakeLabel: 'SNK-B' },
      { id: 'it_ac_sr', type: 'power_edison_quad', name: 'Edison Quad', x: 13, y: 34, rotation: 0, width: 1.5, height: 1.4, powerSpec: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 } },

      { id: 'it_bass_amp', type: 'bass_full_rig', name: 'Bass Rig', performer: 'Stage Left', x: 80, y: 36, rotation: 335, width: 3.2, height: 2.4, powerDropRequired: true, signalGroupId: 'sg_sl', routeToItemId: 'it_split', subSnakeLabel: 'SNK-C' },
      { id: 'it_ac_sl', type: 'power_edison_quad', name: 'Edison Quad', x: 87, y: 36, rotation: 0, width: 1.5, height: 1.4, powerSpec: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 } },

      { id: 'it_vox_sr', type: 'vocal_boom_stand', name: 'SR Vocal', performer: 'Guitar / Vox', x: 26, y: 68, rotation: 180, width: 2.0, height: 2.0, signalGroupId: 'sg_sr', routeToItemId: 'it_split', subSnakeLabel: 'SNK-B' },
      { id: 'it_wedge_sr', type: 'monitor_wedge_standard', name: 'Wedge MX 2', wedgeLabel: 'WEDGE MX 2', x: 26, y: 80, rotation: 180, width: 2.2, height: 1.6 },

      { id: 'it_vox_c', type: 'vocal_straight_stand', name: 'Lead Vocal', performer: 'Lead Vox', x: 50, y: 68, rotation: 180, width: 1.8, height: 1.8, signalGroupId: 'sg_split', routeToItemId: 'it_split', subSnakeLabel: 'SPLIT' },
      { id: 'it_pedals_c', type: 'pedalboard', name: 'Pedalboard', x: 43, y: 74, rotation: 0, width: 2.6, height: 1.5, powerDropRequired: true },
      { id: 'it_wedge_c', type: 'monitor_wedge_standard', name: 'Wedge MX 1', wedgeLabel: 'WEDGE MX 1', x: 50, y: 82, rotation: 180, width: 2.2, height: 1.6 },
      { id: 'it_ac_c', type: 'power_edison_quad', name: 'Edison Quad', x: 57, y: 81, rotation: 0, width: 1.5, height: 1.4, powerSpec: { required: true, connector: 'NEMA 5-15/20 Edison Quad (120V)', voltage: '120V', amps: 20, dropsCount: 1 } },

      { id: 'it_vox_sl', type: 'vocal_boom_stand', name: 'SL Vocal', performer: 'Bass / Vox', x: 74, y: 68, rotation: 180, width: 2.0, height: 2.0, signalGroupId: 'sg_sl', routeToItemId: 'it_split', subSnakeLabel: 'SNK-C' },
      { id: 'it_wedge_sl', type: 'monitor_wedge_standard', name: 'Wedge MX 3', wedgeLabel: 'WEDGE MX 3', x: 74, y: 80, rotation: 180, width: 2.2, height: 1.6 },
    ],
    channels: [
      { id: 'ch_1', channelNumber: 1, name: 'Kick In', category: 'drums', micOrDI: 'Shure Beta 91A', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_2', channelNumber: 2, name: 'Kick Out', category: 'drums', micOrDI: 'Shure Beta 52A', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_3', channelNumber: 3, name: 'Snare Top', category: 'drums', micOrDI: 'Shure SM57', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_4', channelNumber: 4, name: 'Snare Bottom', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_5', channelNumber: 5, name: 'Hi-Hat', category: 'drums', micOrDI: 'Shure KSM 137', connector: 'XLR', standType: 'short_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_6', channelNumber: 6, name: 'Rack Tom', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_7', channelNumber: 7, name: 'Floor Tom', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_8', channelNumber: 8, name: 'OH Left', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_9', channelNumber: 9, name: 'OH Right', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', monitorSends: {}, linkedStageItemId: 'it_drums' },
      { id: 'ch_10', channelNumber: 10, name: 'Bass DI', category: 'bass', micOrDI: 'Active DI (Generic)', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Bass)', monitorSends: {}, linkedStageItemId: 'it_bass_amp' },
      { id: 'ch_11', channelNumber: 11, name: 'Bass Mic', category: 'bass', micOrDI: 'Electro-Voice RE20', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Bass)', monitorSends: {}, linkedStageItemId: 'it_bass_amp' },
      { id: 'ch_12', channelNumber: 12, name: 'Guitar Amp SR', category: 'guitars', micOrDI: 'Sennheiser e906', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'USR (Guitar)', monitorSends: {}, linkedStageItemId: 'it_gtr_amp' },
      { id: 'ch_13', channelNumber: 13, name: 'Acoustic DI', category: 'guitars', micOrDI: 'Passive DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'SPLIT', signalGroupId: 'sg_split', stageLocation: 'DSC (Lead)', monitorSends: {}, linkedStageItemId: 'it_vox_c' },
      { id: 'ch_14', channelNumber: 14, name: 'Lead Vocal', category: 'vocals', micOrDI: 'Shure Beta 58A', connector: 'XLR', standType: 'straight_round', phantom48V: false, subSnake: 'SPLIT', signalGroupId: 'sg_split', stageLocation: 'DSC (Lead)', monitorSends: {}, linkedStageItemId: 'it_vox_c' },
      { id: 'ch_15', channelNumber: 15, name: 'Guitar Vocal', category: 'vocals', micOrDI: 'Shure SM58', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'DSR (Guitar)', monitorSends: {}, linkedStageItemId: 'it_vox_sr' },
      { id: 'ch_16', channelNumber: 16, name: 'Bass Vocal', category: 'vocals', micOrDI: 'Shure SM58', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'DSL (Bass)', monitorSends: {}, linkedStageItemId: 'it_vox_sl' },
    ],
    updatedAt: new Date().toISOString(),
  },

  acoustic_ensemble: {
    id: 'template_acoustic_ensemble',
    title: 'Acoustic Ensemble — Stage Plot & Patch List',
    artistName: 'Acoustic Ensemble',
    versionDate: 'Rev 1.0',
    date: new Date().toISOString().split('T')[0],
    venueOrTour: 'Theater / Listening Room Setup',
    productionNotes: '5-piece acoustic stage layout with percussion, keys, upright/acoustic bass, two acoustic guitars & 5 floor wedges.',
    audioNotes: `• 6 Short Boom Tripod Stands
• 6 Tall Boom Tripod Stands
• 2 Straight / Round Stands
• 20 (15') XLR Cables
• x2 (16-Ch) Subsnakes
• Active & Passive DIs as listed`,
    miscNotes: `• 4 Black Bar Stools (No Arms)
• Dedicated clean AC power drops
• Off-stage Tech Area Stage Right`,
    contacts: [
      {
        role: 'PRODUCTION MANAGER',
        name: 'Tour Manager',
        phone: '+1 (555) 014-9200',
        email: 'production@example.com',
      },
    ],
    stageDimensions: { widthFeet: 24, depthFeet: 16, unit: 'feet' },
    powerRequirements: {
      dedicatedDrops120V: 6,
      dedicatedDrops230V: 0,
      stageRiserSpecs: 'Flat stage deck. Stools positioned downstage.',
      backlineNotes: 'Acoustic amps angled inward.',
      notes: '6x isolated 120V AC drops as marked on stage plot.',
    },
    techZone: {
      enabled: true,
      label: "TECH WORLD SR (10'x10')",
      location: 'SR',
    },
    showSignalPaths: true,
    signalGroups: DEFAULT_SIGNAL_GROUPS,
    monitors: [
      { id: 'am1', mixNumber: 1, performer: 'Lead Vox / Acoustic', type: 'floor_wedge', location: 'DSC', outputPatch: 'Aux 1', linkedStageItemId: 'ae_w1' },
      { id: 'am2', mixNumber: 2, performer: 'Guitar SR', type: 'floor_wedge', location: 'DSR', outputPatch: 'Aux 2', linkedStageItemId: 'ae_w2' },
      { id: 'am3', mixNumber: 3, performer: 'Bass SL', type: 'floor_wedge', location: 'DSL', outputPatch: 'Aux 3', linkedStageItemId: 'ae_w3' },
      { id: 'am4', mixNumber: 4, performer: 'Keys USR', type: 'floor_wedge', location: 'USR', outputPatch: 'Aux 4', linkedStageItemId: 'ae_w4' },
      { id: 'am5', mixNumber: 5, performer: 'Percussion USL', type: 'floor_wedge', location: 'USL', outputPatch: 'Aux 5', linkedStageItemId: 'ae_w5' },
    ],
    items: [
      { id: 'ae_perc', type: 'percussion_setup', name: 'Percussion', performer: 'Percussion', x: 74, y: 28, rotation: 0, width: 5.5, height: 4.2, signalGroupId: 'sg_sl', subSnakeLabel: 'SNK-C' },
      { id: 'ae_w5', type: 'monitor_wedge_standard', name: 'Wedge MX 5', wedgeLabel: 'WEDGE MX 5', x: 64, y: 22, rotation: 25, width: 2.2, height: 1.6 },
      { id: 'ae_keys', type: 'keyboard_single', name: 'Keys Rig', performer: 'Keys / Mando', x: 32, y: 28, rotation: 25, width: 4.5, height: 2.2, powerDropRequired: true, signalGroupId: 'sg_sr', subSnakeLabel: 'SNK-B' },
      { id: 'ae_w4', type: 'monitor_wedge_standard', name: 'Wedge MX 4', wedgeLabel: 'WEDGE MX 4', x: 30, y: 38, rotation: 25, width: 2.2, height: 1.6 },
      { id: 'ae_ac1', type: 'power_edison_quad', name: 'AC', x: 22, y: 24, rotation: 0, width: 1.5, height: 1.4 },
      { id: 'ae_gtr_sr', type: 'vocal_boom_stand', name: 'Guitar SR', performer: 'Guitar / Vox', x: 26, y: 68, rotation: 180, width: 2.0, height: 2.0, signalGroupId: 'sg_sr', subSnakeLabel: 'SNK-B' },
      { id: 'ae_w2', type: 'monitor_wedge_standard', name: 'Wedge MX 2', wedgeLabel: 'WEDGE MX 2', x: 26, y: 80, rotation: 180, width: 2.2, height: 1.6 },
      { id: 'ae_lead', type: 'vocal_straight_stand', name: 'Lead Vox', performer: 'Lead / Acoustic', x: 50, y: 68, rotation: 180, width: 1.8, height: 1.8, signalGroupId: 'sg_split', subSnakeLabel: 'SPLIT' },
      { id: 'ae_prompter', type: 'teleprompter', name: 'Prompter', x: 45, y: 80, rotation: 190, width: 2.4, height: 1.6 },
      { id: 'ae_w1', type: 'monitor_wedge_standard', name: 'Wedge MX 1', wedgeLabel: 'WEDGE MX 1', x: 54, y: 80, rotation: 170, width: 2.2, height: 1.6 },
      { id: 'ae_bass_sl', type: 'vocal_boom_stand', name: 'Bass SL', performer: 'Bass / Vox', x: 74, y: 68, rotation: 180, width: 2.0, height: 2.0, signalGroupId: 'sg_sl', subSnakeLabel: 'SNK-C' },
      { id: 'ae_w3', type: 'monitor_wedge_standard', name: 'Wedge MX 3', wedgeLabel: 'WEDGE MX 3', x: 74, y: 80, rotation: 180, width: 2.2, height: 1.6 },
    ],
    channels: [
      { id: 'ac_1', channelNumber: 1, name: 'Cajón / Kick', category: 'drums', micOrDI: 'Shure Beta 91A', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Perc)', linkedStageItemId: 'ae_perc' },
      { id: 'ac_2', channelNumber: 2, name: 'Snare', category: 'drums', micOrDI: 'Shure SM57', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Perc)', linkedStageItemId: 'ae_perc' },
      { id: 'ac_3', channelNumber: 3, name: 'Perc OH L', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Perc)', linkedStageItemId: 'ae_perc' },
      { id: 'ac_4', channelNumber: 4, name: 'Perc OH R', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Perc)', linkedStageItemId: 'ae_perc' },
      { id: 'ac_5', channelNumber: 5, name: 'Bass DI', category: 'bass', micOrDI: 'Active DI (Generic)', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'DSL (Bass)', linkedStageItemId: 'ae_bass_sl' },
      { id: 'ac_6', channelNumber: 6, name: 'Keys L', category: 'keys', micOrDI: 'Passive DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'USR (Keys)', linkedStageItemId: 'ae_keys' },
      { id: 'ac_7', channelNumber: 7, name: 'Keys R', category: 'keys', micOrDI: 'Passive DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'USR (Keys)', linkedStageItemId: 'ae_keys' },
      { id: 'ac_8', channelNumber: 8, name: 'Guitar SR DI', category: 'guitars', micOrDI: 'Active DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: true, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'DSR (Gtr)', linkedStageItemId: 'ae_gtr_sr' },
      { id: 'ac_9', channelNumber: 9, name: 'Lead Acoustic DI', category: 'guitars', micOrDI: 'Active DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: true, subSnake: 'SPLIT', signalGroupId: 'sg_split', stageLocation: 'DSC (Lead)', linkedStageItemId: 'ae_lead' },
      { id: 'ac_10', channelNumber: 10, name: 'Lead Vocal', category: 'vocals', micOrDI: 'Neumann KMS 105', connector: 'XLR', standType: 'straight_round', phantom48V: true, subSnake: 'SPLIT', signalGroupId: 'sg_split', stageLocation: 'DSC (Lead)', linkedStageItemId: 'ae_lead' },
      { id: 'ac_11', channelNumber: 11, name: 'Guitar SR Vox', category: 'vocals', micOrDI: 'Shure SM58', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'DSR (Gtr)', linkedStageItemId: 'ae_gtr_sr' },
      { id: 'ac_12', channelNumber: 12, name: 'Bass SL Vox', category: 'vocals', micOrDI: 'Shure SM58', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'DSL (Bass)', linkedStageItemId: 'ae_bass_sl' },
      { id: 'ac_13', channelNumber: 13, name: 'Keys USR Vox', category: 'vocals', micOrDI: 'Shure SM58', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'USR (Keys)', linkedStageItemId: 'ae_keys' },
      { id: 'ac_14', channelNumber: 14, name: 'Playback L', category: 'playback', micOrDI: 'Line Level / Direct Out', connector: 'Phono / RCA', standType: 'direct', phantom48V: false, stageLocation: 'FOH / Side' },
      { id: 'ac_15', channelNumber: 15, name: 'Playback R', category: 'playback', micOrDI: 'Line Level / Direct Out', connector: 'Phono / RCA', standType: 'direct', phantom48V: false, stageLocation: 'FOH / Side' },
      { id: 'ac_16', channelNumber: 16, name: 'Spare / Talkback', category: 'talkback', micOrDI: 'Shure SM58 (Switched)', connector: 'XLR', standType: 'none', phantom48V: false, stageLocation: 'DSC' },
    ].map((c) => ({ ...c, monitorSends: {} })) as StageProject['channels'],
    updatedAt: new Date().toISOString(),
  },

  festival_7piece: {
    id: 'template_festival_7piece',
    title: '7-Piece Full Production w/ Horns & IEMs',
    artistName: '7-Piece Ensemble',
    versionDate: 'Rev 1.0',
    date: new Date().toISOString().split('T')[0],
    venueOrTour: 'Festival & Large Theater Stage',
    productionNotes: 'Full band with Dual Keys, Horn Section, Playback Tracks & Stereo IEM Matrix.',
    audioNotes: `• 8 Short Boom Tripod Stands
• 7 Tall Boom Tripod Stands
• 24-Channel Digital Stagebox Split
• 6 Stereo Wireless IEM Transmitters`,
    miscNotes: `• Drum Riser 8' x 8' x 16" (USC)
• Keys Riser 8' x 4' x 12" (USL)
• Clean RF Spectrum coordination required`,
    contacts: [
      {
        role: 'MONITOR ENGINEER',
        name: 'Monitor Tech',
        phone: '+1 (555) 019-3300',
        email: 'monitors@example.com',
      },
    ],
    stageDimensions: { widthFeet: 36, depthFeet: 22, unit: 'feet' },
    powerRequirements: {
      dedicatedDrops120V: 6,
      dedicatedDrops230V: 0,
      stageRiserSpecs: 'Drum Riser 8x8 USC, Keys Riser 8x4 USL.',
      backlineNotes: 'Guitar Combo SR, Bass Rig SL, Dual Keys USL.',
      notes: '32A CEE / L14-30 Distro feeding isolated stage drops.',
    },
    techZone: {
      enabled: true,
      label: 'MONITOR WORLD (SL)',
      location: 'SL',
    },
    showSignalPaths: true,
    signalGroups: DEFAULT_SIGNAL_GROUPS,
    monitors: [
      { id: 'fm1', mixNumber: 1, performer: 'Lead Vocal (Stereo IEM)', type: 'stereo_iem', location: 'DSC', outputPatch: 'Aux 1-2', linkedStageItemId: 'f_vox' },
      { id: 'fm2', mixNumber: 2, performer: 'Keys (Stereo IEM)', type: 'stereo_iem', location: 'USL', outputPatch: 'Aux 3-4', linkedStageItemId: 'f_keys' },
      { id: 'fm3', mixNumber: 3, performer: 'Guitar (Stereo IEM)', type: 'stereo_iem', location: 'DSR', outputPatch: 'Aux 5-6', linkedStageItemId: 'f_gtr' },
      { id: 'fm4', mixNumber: 4, performer: 'Bass (Stereo IEM)', type: 'stereo_iem', location: 'DSL', outputPatch: 'Aux 7-8', linkedStageItemId: 'f_bass' },
      { id: 'fm5', mixNumber: 5, performer: 'Horns (Stereo IEM)', type: 'stereo_iem', location: 'MSR', outputPatch: 'Aux 9-10', linkedStageItemId: 'f_horns' },
      { id: 'fm6', mixNumber: 6, performer: 'Drums (IEM + Sub)', type: 'drum_sub', location: 'USC', outputPatch: 'Aux 11-12', linkedStageItemId: 'f_drums' },
    ],
    items: [
      { id: 'f_dr_riser', type: 'drum_riser_8x8', name: '8x8 Drum Riser', x: 50, y: 24, rotation: 0, width: 8, height: 8 },
      { id: 'f_drums', type: 'drum_kit_standard', name: 'Drum Kit', performer: 'Drums', x: 50, y: 24, rotation: 0, width: 6.5, height: 6.0, signalGroupId: 'sg_drums', routeToItemId: 'f_sbox', subSnakeLabel: 'SNK-A' },
      { id: 'f_k_riser', type: 'riser_generic_8x4', name: '8x4 Keys Riser', x: 80, y: 24, rotation: 0, width: 8, height: 4 },
      { id: 'f_keys', type: 'keyboard_dual_tier', name: 'Dual Keys', performer: 'Keyboards', x: 80, y: 24, rotation: 345, width: 5.0, height: 2.8, powerDropRequired: true, signalGroupId: 'sg_sl', routeToItemId: 'f_sbox', subSnakeLabel: 'SNK-C' },
      { id: 'f_horns', type: 'horn_sax_trumpet', name: 'Horn Section', performer: 'Sax & Brass', x: 20, y: 34, rotation: 165, width: 2.8, height: 2.4, signalGroupId: 'sg_sr', routeToItemId: 'f_sbox', subSnakeLabel: 'SNK-B' },
      { id: 'f_gtr', type: 'guitar_combo_amp', name: 'Guitar Amp', x: 18, y: 60, rotation: 90, width: 2.8, height: 1.8, powerDropRequired: true, signalGroupId: 'sg_sr', routeToItemId: 'f_sbox', subSnakeLabel: 'SNK-B' },
      { id: 'f_bass', type: 'bass_combo_amp', name: 'Bass Rig', x: 82, y: 60, rotation: 270, width: 3.0, height: 2.0, powerDropRequired: true, signalGroupId: 'sg_sl', routeToItemId: 'f_sbox', subSnakeLabel: 'SNK-C' },
      { id: 'f_vox', type: 'wireless_handheld', name: 'Lead Vocal', performer: 'RF Lead Vox', x: 50, y: 76, rotation: 180, width: 1.8, height: 1.8, signalGroupId: 'sg_rf', routeToItemId: 'f_iem', subSnakeLabel: 'RF' },
      { id: 'f_iem', type: 'iem_pack_station', name: 'IEM RF Rack', x: 92, y: 22, rotation: 0, width: 2.4, height: 1.8, powerDropRequired: true, signalGroupId: 'sg_rf', routeToItemId: 'f_sbox', subSnakeLabel: 'RF' },
      { id: 'f_sbox', type: 'stage_box_digital', name: '32x16 Stagebox', x: 64, y: 18, rotation: 0, width: 2.6, height: 1.8, signalGroupId: 'sg_dante', subSnakeLabel: 'DANTE' },
      { id: 'f_distro', type: 'power_distro_rack', name: 'Power Distro', x: 93, y: 42, rotation: 0, width: 2.4, height: 2.0, powerSpec: { required: true, connector: 'Touring Power Distro Rack', voltage: '3-Phase Distro', amps: 100, dropsCount: 1 } },
    ],
    channels: [
      { id: 'fc_1', channelNumber: 1, name: 'Kick In', category: 'drums', micOrDI: 'Shure Beta 91A', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_2', channelNumber: 2, name: 'Kick Out', category: 'drums', micOrDI: 'Audix D6', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_3', channelNumber: 3, name: 'Snare Top', category: 'drums', micOrDI: 'Shure SM57', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_4', channelNumber: 4, name: 'Snare Bottom', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_5', channelNumber: 5, name: 'Hi-Hat', category: 'drums', micOrDI: 'Neumann KM 184', connector: 'XLR', standType: 'short_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_6', channelNumber: 6, name: 'Tom 1', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_7', channelNumber: 7, name: 'Tom 2', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_8', channelNumber: 8, name: 'Floor Tom', category: 'drums', micOrDI: 'Sennheiser e904', connector: 'XLR', standType: 'claw', phantom48V: false, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_9', channelNumber: 9, name: 'OH Left', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_10', channelNumber: 10, name: 'OH Right', category: 'drums', micOrDI: 'AKG C414 XLS', connector: 'XLR', standType: 'tall_boom', phantom48V: true, subSnake: 'SNK-A', signalGroupId: 'sg_drums', stageLocation: 'USC (Drums)', linkedStageItemId: 'f_drums' },
      { id: 'fc_11', channelNumber: 11, name: 'Bass DI', category: 'bass', micOrDI: 'Active DI (Generic)', connector: 'XLR', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'DSL (Bass)', linkedStageItemId: 'f_bass' },
      { id: 'fc_12', channelNumber: 12, name: 'Guitar Mic', category: 'guitars', micOrDI: 'Sennheiser e906', connector: 'XLR', standType: 'short_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'DSR (Gtr)', linkedStageItemId: 'f_gtr' },
      { id: 'fc_13', channelNumber: 13, name: 'Keys 1 L', category: 'keys', micOrDI: 'Stereo Passive DI', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Keys)', linkedStageItemId: 'f_keys' },
      { id: 'fc_14', channelNumber: 14, name: 'Keys 1 R', category: 'keys', micOrDI: 'Stereo Passive DI', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Keys)', linkedStageItemId: 'f_keys' },
      { id: 'fc_15', channelNumber: 15, name: 'Synth 2 L', category: 'keys', micOrDI: 'Stereo Active DI', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Keys)', linkedStageItemId: 'f_keys' },
      { id: 'fc_16', channelNumber: 16, name: 'Synth 2 R', category: 'keys', micOrDI: 'Stereo Active DI', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: true, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'USL (Keys)', linkedStageItemId: 'f_keys' },
      { id: 'fc_17', channelNumber: 17, name: 'Saxophone', category: 'horns', micOrDI: 'Sennheiser MD 421-II', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'MSR (Horns)', linkedStageItemId: 'f_horns' },
      { id: 'fc_18', channelNumber: 18, name: 'Trumpet', category: 'horns', micOrDI: 'Beyerdynamic M 160', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'MSR (Horns)', linkedStageItemId: 'f_horns' },
      { id: 'fc_19', channelNumber: 19, name: 'Lead Vocal', category: 'vocals', micOrDI: 'Shure Axient Digital Wireless', connector: 'Wireless RF', standType: 'straight_round', phantom48V: false, subSnake: 'RF', signalGroupId: 'sg_rf', stageLocation: 'DSC (RF)', linkedStageItemId: 'f_vox' },
      { id: 'fc_20', channelNumber: 20, name: 'Bkg Vox SR', category: 'vocals', micOrDI: 'Shure Beta 58A', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-B', signalGroupId: 'sg_sr', stageLocation: 'DSR' },
      { id: 'fc_21', channelNumber: 21, name: 'Bkg Vox SL', category: 'vocals', micOrDI: 'Shure Beta 58A', connector: 'XLR', standType: 'tall_boom', phantom48V: false, subSnake: 'SNK-C', signalGroupId: 'sg_sl', stageLocation: 'DSL' },
      { id: 'fc_22', channelNumber: 22, name: 'Tracks L', category: 'playback', micOrDI: 'Line Level / Direct Out', connector: 'XLR', standType: 'direct', phantom48V: false, subSnake: 'DANTE', signalGroupId: 'sg_dante', stageLocation: 'USC (Rack)' },
      { id: 'fc_23', channelNumber: 23, name: 'Tracks R', category: 'playback', micOrDI: 'Line Level / Direct Out', connector: 'XLR', standType: 'direct', phantom48V: false, subSnake: 'DANTE', signalGroupId: 'sg_dante', stageLocation: 'USC (Rack)' },
      { id: 'fc_24', channelNumber: 24, name: 'Click / Cue', category: 'playback', micOrDI: 'Passive DI (Generic)', connector: '1/4" Jack (TS/TRS)', standType: 'direct', phantom48V: false, subSnake: 'DANTE', signalGroupId: 'sg_dante', stageLocation: 'USC (Rack)' },
    ].map((c) => ({ ...c, monitorSends: {} })) as StageProject['channels'],
    updatedAt: new Date().toISOString(),
  },
};
