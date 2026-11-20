/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GearCategory =
  | 'drums'
  | 'strings_keys'
  | 'amplifiers'
  | 'vocals'
  | 'monitoring'
  | 'audio_power'
  | 'audio_connectors'
  | 'power_distro'
  | 'stage_risers'
  | 'staging_props'
  | 'stock_shapes';

export type StockSymbolId =
  // Generic Racks, Patch, Staging & Utility
  | 'stock_rack_unit'
  | 'stock_console_desk'
  | 'stock_speaker_cab'
  | 'stock_wedge_array'
  | 'stock_synth_station'
  | 'stock_turntable_dj'
  | 'stock_percussion_island'
  | 'stock_mic_stand_generic'
  | 'stock_rf_antenna_cart'
  | 'stock_stage_box_split'
  | 'stock_di_interface'
  | 'stock_power_distro_box'
  | 'stock_power_bolt'
  | 'stock_riser_platform'
  | 'stock_tech_table'
  | 'stock_performer_zone'
  | 'stock_video_led'
  | 'stock_road_case'
  | 'stock_utility_crate'
  // Headphones & IEMs
  | 'stock_headphones'
  | 'stock_iem_ears'
  | 'stock_iem_bodypack'
  // Instruments
  | 'stock_electric_guitar'
  | 'stock_bass_guitar'
  | 'stock_acoustic_guitar'
  | 'stock_upright_bass'
  | 'stock_cello'
  | 'stock_violin'
  | 'stock_saxophone'
  | 'stock_trumpet'
  | 'stock_trombone'
  | 'stock_banjo'
  | 'stock_harp'
  | 'stock_accordion'
  | 'stock_marimba'
  | 'stock_timpani'
  | 'stock_modular_synth'
  // Audio Cable Connections
  | 'stock_conn_xlr'
  | 'stock_conn_xlr5'
  | 'stock_conn_trs'
  | 'stock_conn_minijack'
  | 'stock_conn_rca'
  | 'stock_conn_speakon'
  | 'stock_conn_ethercon'
  | 'stock_conn_bnc'
  | 'stock_conn_fiber'
  | 'stock_conn_midi'
  | 'stock_conn_usb'
  | 'stock_conn_multipin';

export type PowerGearType =
  | 'power_generic_bolt'
  | 'ac_power_drop_quad'
  | 'power_edison_quad'
  | 'power_l5_20'
  | 'power_l5_30'
  | 'power_l14_30'
  | 'power_14_50'
  | 'power_cam_lok'
  | 'power_uk_13a'
  | 'power_schuko'
  | 'power_cee_16a_blue'
  | 'power_cee_32a_blue'
  | 'power_cee_16a_red'
  | 'power_cee_32a_red'
  | 'power_cee_63a_red'
  | 'power_powercon_20a'
  | 'power_powercon_true1'
  | 'power_distro_rack';

export type BuiltInGearType =
  // Drums & Percussion
  | 'drum_kit_standard'
  | 'drum_kit_compact'
  | 'electronic_drum_kit'
  | 'percussion_setup'
  | 'cajon'
  | 'marimba_vibes'
  | 'timpani_kettle'
  // Amps & Backline
  | 'guitar_combo_amp'
  | 'guitar_half_stack'
  | 'bass_combo_amp'
  | 'bass_full_rig'
  | 'acoustic_guitar_di'
  | 'pedalboard'
  | 'guitar_stand_rack'
  // Instruments (Strings, Guitars, Keys, Winds, Brass)
  | 'electric_guitar'
  | 'bass_guitar'
  | 'acoustic_guitar'
  | 'upright_bass'
  | 'cello_instrument'
  | 'violin_viola'
  | 'saxophone'
  | 'trumpet_brass'
  | 'trombone_brass'
  | 'banjo_mandolin'
  | 'harp_concert'
  | 'accordion_keys'
  | 'keyboard_single'
  | 'keyboard_dual_tier'
  | 'synth_modular'
  | 'grand_piano'
  | 'dj_turntables'
  | 'playback_rack'
  // Vocals, Horns & Strings
  | 'vocal_boom_stand'
  | 'vocal_short_boom'
  | 'vocal_straight_stand'
  | 'wireless_handheld'
  | 'horn_sax_trumpet'
  | 'strings_violin_cello'
  // Monitoring, Headphones & IEMs
  | 'monitor_wedge_standard'
  | 'monitor_wedge_low_profile'
  | 'drum_monitor_sub'
  | 'side_fill_rig'
  | 'iem_pack_station'
  | 'headphones_monitoring'
  | 'iem_earpieces'
  | 'iem_bodypack_receiver'
  // Audio Patch & Splits
  | 'drop_snake_subbox'
  | 'stage_box_digital'
  | 'foh_mon_split_rack'
  | 'direct_injection_box'
  // Audio Cable Connectors
  | 'conn_xlr_3pin'
  | 'conn_xlr_5pin'
  | 'conn_jack_trs'
  | 'conn_minijack_35mm'
  | 'conn_rca_phono'
  | 'conn_speakon_nl4'
  | 'conn_ethercon_rj45'
  | 'conn_bnc_rf'
  | 'conn_optical_fiber'
  | 'conn_midi_5pin'
  | 'conn_usb_audio'
  | 'conn_multipin_socapex'
  // Risers & Staging Props
  | 'drum_riser_8x8'
  | 'riser_generic_8x4'
  | 'riser_generic_6x4'
  | 'teleprompter'
  | 'bar_stool'
  | 'music_stand'
  | PowerGearType
  | StockSymbolId;

export type GearType = BuiltInGearType | (string & {});

export type PowerConnectorType =
  | 'None'
  | 'Generic Power Drop'
  | 'NEMA 5-15/20 Edison Quad (120V)'
  | 'NEMA L5-20 Twist-Lock (120V)'
  | 'NEMA L5-30 Twist-Lock (120V)'
  | 'NEMA L14-30 (120/240V)'
  | 'NEMA 14-50 (240V)'
  | 'Cam-Lok 3-Phase Feeder'
  | 'UK 13A BS 1363'
  | 'EU Schuko (16A 230V)'
  | 'CEE 16A 1-Phase (Blue 230V)'
  | 'CEE 32A 1-Phase (Blue 230V)'
  | 'CEE 16A 3-Phase (Red 400V)'
  | 'CEE 32A 3-Phase (Red 400V)'
  | 'CEE 63A 3-Phase (Red 400V)'
  | 'Neutrik PowerCON 20A'
  | 'Neutrik PowerCON TRUE1'
  | 'Touring Power Distro Rack';

export interface PowerSpec {
  required: boolean;
  connector: PowerConnectorType | string;
  voltage: string;
  amps?: number;
  dropsCount: number;
}

export type SignalSplitType =
  | 'subsnake'
  | 'foh_mon_split'
  | 'dante_network'
  | 'rf_iem'
  | 'playback'
  | 'power_bus';

export interface SignalGroup {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  splitType: SignalSplitType;
  notes?: string;
}

export interface StageDimensions {
  widthFeet: number;
  depthFeet: number;
  unit: 'feet' | 'meters';
}

export type ConnectorType =
  | 'XLR'
  | '1/4" Jack (TS/TRS)'
  | 'Phono / RCA'
  | 'Speakon'
  | 'EtherCON / Dante'
  | 'Mini-Jack 3.5mm'
  | 'Multi-pin'
  | 'Wireless RF'
  | 'Direct / Other';

export type LabelHorizontalAlign = 'left' | 'center' | 'right';
export type LabelVerticalAlign = 'top' | 'middle' | 'bottom';

export interface StageItem {
  id: string;
  type: GearType;
  symbolId?: StockSymbolId;
  name: string;
  hasCustomLabel?: boolean;
  labelAlignH?: LabelHorizontalAlign;
  labelAlignV?: LabelVerticalAlign;
  performer?: string;
  instrument?: string;
  x: number; // percentage (0-100) from Stage Right (left edge) to Stage Left (right edge)
  y: number; // percentage (0-100) from Upstage (top edge) to Downstage (bottom edge)
  rotation: number; // degrees 0-359
  width: number; // width in stage feet
  height: number; // depth in stage feet
  color?: string;
  notes?: string;
  wedgeLabel?: string;
  powerDropRequired?: boolean;
  powerVoltage?: '120V' | '230V';
  powerSpec?: PowerSpec;
  signalGroupId?: string;
  routeToItemId?: string;
  subSnakeLabel?: string;
  phantom48VRequired?: boolean;
  channelIds?: string[];
  monitorIds?: string[];
  locked?: boolean;
  zIndex?: number;
}

export type ChannelCategory =
  | 'drums'
  | 'bass'
  | 'guitars'
  | 'keys'
  | 'horns'
  | 'strings'
  | 'vocals'
  | 'playback'
  | 'talkback'
  | 'audience'
  | 'other';

export type StandType =
  | 'short_boom'
  | 'tall_boom'
  | 'round_base'
  | 'straight_round'
  | 'claw'
  | 'clip'
  | 'direct'
  | 'overhead'
  | 'wireless'
  | 'none';

export interface ChannelInput {
  id: string;
  channelNumber: number;
  name: string;
  category: ChannelCategory;
  micOrDI: string;
  connector?: ConnectorType | string;
  standType: StandType;
  phantom48V: boolean;
  subSnake?: string;
  signalGroupId?: string;
  stageLocation?: string;
  monitorSends: Record<string, string>;
  notes?: string;
  linkedStageItemId?: string;
}

export interface MonitorMix {
  id: string;
  mixNumber: number;
  performer: string;
  type: 'floor_wedge' | 'stereo_iem' | 'mono_iem' | 'drum_sub';
  location: string;
  outputPatch: string;
  requestedContent?: string;
  notes?: string;
  linkedStageItemId?: string;
}

export interface PowerRequirements {
  dedicatedDrops120V: number;
  dedicatedDrops230V: number;
  stageRiserSpecs: string;
  backlineNotes: string;
  notes: string;
}

export type CrewDepartment =
  | 'Audio'
  | 'Stage / Backline'
  | 'Lighting'
  | 'Video'
  | 'Production'
  | 'Local Crew'
  | 'Other';

export type CrewProvisionStatus = 'touring' | 'needed_from_venue' | 'tbd';

export interface ProductionContact {
  id?: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  department?: CrewDepartment;
  status?: CrewProvisionStatus;
  quantity?: number;
  notes?: string;
}

export interface TechZoneConfig {
  enabled: boolean;
  label: string;
  location: 'SR' | 'SL';
}

export interface DefaultChannelDrop {
  name: string;
  category: ChannelCategory;
  micOrDI: string;
  standType: StandType;
  phantom48V: boolean;
  connector?: ConnectorType;
  stageLocation?: string;
  subSnake?: string;
}

export interface GearDefinition {
  type: GearType;
  label: string;
  category: GearCategory;
  defaultWidthFeet: number;
  defaultHeightFeet: number;
  description: string;
  isCustom?: boolean;
  stockSymbol?: StockSymbolId;
  defaultPower?: PowerSpec;
  defaultSubSnake?: string;
  defaultSignalGroupId?: string;
  defaultMic?: string;
  defaultConnector?: ConnectorType;
  defaultChannels?: DefaultChannelDrop[];
}

export interface StageProject {
  id: string;
  title: string;
  artistName: string;
  versionDate: string;
  date: string;
  venueOrTour: string;
  productionNotes: string;
  audioNotes: string;
  miscNotes: string;
  contacts: ProductionContact[];
  stageDimensions: StageDimensions;
  items: StageItem[];
  channels: ChannelInput[];
  monitors: MonitorMix[];
  powerRequirements: PowerRequirements;
  techZone?: TechZoneConfig;
  showDimensionsOverlay?: boolean;
  showSignalPaths?: boolean;
  signalGroups?: SignalGroup[];
  customGearDefinitions?: Record<string, GearDefinition>;
  updatedAt: string;
}
