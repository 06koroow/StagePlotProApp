/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabaseClient';
import {
  StageProject,
  StageItem,
  ChannelInput,
  MonitorMix,
  SignalGroup,
  ProductionContact,
  GearDefinition,
  PowerRequirements,
  TechZoneConfig,
  PowerSpec,
  StockSymbolId,
  LabelHorizontalAlign,
  LabelVerticalAlign,
  SignalSplitType,
  ChannelCategory,
  StandType,
  CrewDepartment,
  CrewProvisionStatus,
  GearCategory,
  ConnectorType,
  DefaultChannelDrop,
} from '../types/stage';
import { DEFAULT_SIGNAL_GROUPS } from '../data/gearLibrary';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value?: string | null): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }
  return supabase;
}

export interface CloudProjectSummary {
  id: string;
  title: string;
  artistName: string;
  versionDate: string;
  showDate: string;
  venueOrTour: string;
  updatedAt: string;
  createdAt: string;
  itemCount: number;
  channelCount: number;
  monitorCount: number;
}

function extractCount(rel: unknown): number {
  if (Array.isArray(rel) && rel.length > 0 && typeof rel[0]?.count === 'number') {
    return rel[0].count;
  }
  return 0;
}

export async function fetchUserProjects(userId: string): Promise<CloudProjectSummary[]> {
  const client = requireClient();

  const { data, error } = await client
    .from('projects')
    .select(
      `
      id,
      title,
      artist_name,
      version_date,
      show_date,
      venue_or_tour,
      updated_at,
      created_at,
      stage_items(count),
      channels(count),
      monitor_mixes(count)
    `
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || 'Stage Plot & Input List',
    artistName: row.artist_name || 'Untitled Artist',
    versionDate: row.version_date || 'Rev 1.0',
    showDate: row.show_date || '',
    venueOrTour: row.venue_or_tour || '',
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    itemCount: extractCount(row.stage_items),
    channelCount: extractCount(row.channels),
    monitorCount: extractCount(row.monitor_mixes),
  }));
}

export async function loadCloudProject(projectId: string): Promise<StageProject> {
  const client = requireClient();

  const [
    projectRes,
    groupsRes,
    itemsRes,
    channelsRes,
    monitorsRes,
    contactsRes,
  ] = await Promise.all([
    client.from('projects').select('*').eq('id', projectId).single(),
    client.from('signal_groups').select('*').eq('project_id', projectId),
    client
      .from('stage_items')
      .select('*')
      .eq('project_id', projectId)
      .order('z_index', { ascending: true }),
    client
      .from('channels')
      .select('*')
      .eq('project_id', projectId)
      .order('channel_number', { ascending: true }),
    client
      .from('monitor_mixes')
      .select('*')
      .eq('project_id', projectId)
      .order('mix_number', { ascending: true }),
    client
      .from('production_contacts')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true }),
  ]);

  if (projectRes.error) throw new Error(projectRes.error.message);
  if (groupsRes.error) throw new Error(groupsRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (channelsRes.error) throw new Error(channelsRes.error.message);
  if (monitorsRes.error) throw new Error(monitorsRes.error.message);
  if (contactsRes.error) throw new Error(contactsRes.error.message);

  const projRow = projectRes.data;
  const rawItems = itemsRes.data || [];
  const itemIds = rawItems.map((it: any) => it.id);

  // Fetch many-to-many item <-> monitor links for the project's stage items
  const monitorLinksByItem = new Map<string, Set<string>>();
  if (itemIds.length > 0) {
    const linksRes = await client
      .from('stage_item_monitors')
      .select('stage_item_id, monitor_mix_id')
      .in('stage_item_id', itemIds);

    if (linksRes.error) throw new Error(linksRes.error.message);

    (linksRes.data || []).forEach((link: any) => {
      if (!monitorLinksByItem.has(link.stage_item_id)) {
        monitorLinksByItem.set(link.stage_item_id, new Set());
      }
      monitorLinksByItem.get(link.stage_item_id)!.add(link.monitor_mix_id);
    });
  }

  // Also include primary monitor_mixes.linked_stage_item_id links
  const monitors: MonitorMix[] = (monitorsRes.data || []).map((row: any) => {
    if (row.linked_stage_item_id) {
      if (!monitorLinksByItem.has(row.linked_stage_item_id)) {
        monitorLinksByItem.set(row.linked_stage_item_id, new Set());
      }
      monitorLinksByItem.get(row.linked_stage_item_id)!.add(row.id);
    }

    return {
      id: row.id,
      mixNumber: row.mix_number,
      performer: row.performer || `Mix ${row.mix_number}`,
      type: row.mix_type || 'floor_wedge',
      location: row.location || '',
      outputPatch: row.output_patch || '',
      requestedContent: row.requested_content || undefined,
      notes: row.notes || undefined,
      linkedStageItemId: row.linked_stage_item_id || undefined,
    };
  });

  // Group channel IDs by linked_stage_item_id
  const channelIdsByItem = new Map<string, string[]>();
  const channels: ChannelInput[] = (channelsRes.data || []).map((row: any) => {
    if (row.linked_stage_item_id) {
      const existing = channelIdsByItem.get(row.linked_stage_item_id) || [];
      existing.push(row.id);
      channelIdsByItem.set(row.linked_stage_item_id, existing);
    }

    return {
      id: row.id,
      channelNumber: row.channel_number,
      name: row.name || `Input ${row.channel_number}`,
      category: (row.category || 'other') as ChannelCategory,
      micOrDI: row.mic_or_di || '',
      connector: row.connector || 'XLR',
      standType: (row.stand_type || 'none') as StandType,
      phantom48V: Boolean(row.phantom_48v),
      subSnake: row.sub_snake || '',
      signalGroupId: row.signal_group_id || undefined,
      stageLocation: row.stage_location || '',
      monitorSends:
        row.monitor_sends && typeof row.monitor_sends === 'object' ? row.monitor_sends : {},
      notes: row.notes || undefined,
      linkedStageItemId: row.linked_stage_item_id || undefined,
    };
  });

  const signalGroups: SignalGroup[] =
    (groupsRes.data || []).length > 0
      ? (groupsRes.data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          shortCode: row.short_code,
          color: row.color || '#0284c7',
          splitType: (row.split_type || 'subsnake') as SignalSplitType,
          notes: row.notes || undefined,
        }))
      : DEFAULT_SIGNAL_GROUPS;

  const items: StageItem[] = rawItems.map((row: any) => {
    const linkedChs = channelIdsByItem.get(row.id);
    const linkedMonSet = monitorLinksByItem.get(row.id);
    const linkedMons = linkedMonSet ? Array.from(linkedMonSet) : undefined;

    return {
      id: row.id,
      type: row.gear_type,
      symbolId: (row.symbol_id || undefined) as StockSymbolId | undefined,
      name: row.name || 'Gear Item',
      hasCustomLabel: row.has_custom_label ? true : undefined,
      labelAlignH: (row.label_align_h || undefined) as LabelHorizontalAlign | undefined,
      labelAlignV: (row.label_align_v || undefined) as LabelVerticalAlign | undefined,
      performer: row.performer || undefined,
      instrument: row.instrument || undefined,
      x: Number(row.x),
      y: Number(row.y),
      rotation: Number(row.rotation || 0),
      width: Number(row.width || 3),
      height: Number(row.height || 3),
      color: row.color || undefined,
      notes: row.notes || undefined,
      wedgeLabel: row.wedge_label || undefined,
      powerDropRequired: Boolean(row.power_drop_required),
      powerVoltage: row.power_voltage === '230V' ? '230V' : '120V',
      powerSpec: (row.power_spec || undefined) as PowerSpec | undefined,
      signalGroupId: row.signal_group_id || undefined,
      routeToItemId: row.route_to_item_id || undefined,
      subSnakeLabel: row.sub_snake_label || undefined,
      phantom48VRequired: Boolean(row.phantom_48v_required),
      channelIds: linkedChs && linkedChs.length > 0 ? linkedChs : undefined,
      monitorIds: linkedMons && linkedMons.length > 0 ? linkedMons : undefined,
      locked: Boolean(row.locked),
      zIndex: typeof row.z_index === 'number' ? row.z_index : undefined,
    };
  });

  const contacts: ProductionContact[] = (contactsRes.data || []).map((row: any) => ({
    id: row.id,
    role: row.role || 'Crew',
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    department: (row.department || 'Audio') as CrewDepartment,
    status: (row.status || 'touring') as CrewProvisionStatus,
    quantity: typeof row.quantity === 'number' && row.quantity > 0 ? row.quantity : 1,
    notes: row.notes || '',
  }));

  const defaultPowerReqs: PowerRequirements = {
    dedicatedDrops120V: 4,
    dedicatedDrops230V: 0,
    stageRiserSpecs: '',
    backlineNotes: '',
    notes: '',
  };

  const defaultTechZone: TechZoneConfig = {
    enabled: false,
    label: 'MONITOR / TECH WORLD (SR)',
    location: 'SR',
  };

  return {
    id: projRow.id,
    title: projRow.title || 'Stage Plot & Input List',
    artistName: projRow.artist_name || 'Artist / Band Name',
    versionDate: projRow.version_date || 'Rev 1.0',
    date: projRow.show_date || '',
    venueOrTour: projRow.venue_or_tour || '',
    productionNotes: projRow.production_notes || '',
    audioNotes: projRow.audio_notes || '',
    miscNotes: projRow.misc_notes || '',
    contacts,
    stageDimensions: {
      widthFeet: Number(projRow.stage_width_feet || 28),
      depthFeet: Number(projRow.stage_depth_feet || 18),
      unit: projRow.stage_unit === 'meters' ? 'meters' : 'feet',
    },
    items,
    channels,
    monitors,
    powerRequirements: {
      ...defaultPowerReqs,
      ...(projRow.power_requirements && typeof projRow.power_requirements === 'object'
        ? projRow.power_requirements
        : {}),
    },
    techZone: {
      ...defaultTechZone,
      ...(projRow.tech_zone && typeof projRow.tech_zone === 'object' ? projRow.tech_zone : {}),
    },
    showDimensionsOverlay:
      projRow.show_dimensions_overlay !== undefined ? Boolean(projRow.show_dimensions_overlay) : true,
    showSignalPaths:
      projRow.show_signal_paths !== undefined ? Boolean(projRow.show_signal_paths) : true,
    signalGroups,
    updatedAt: projRow.updated_at || new Date().toISOString(),
  };
}

export async function saveCloudProject(
  userId: string,
  project: StageProject,
  options?: { saveAsNew?: boolean; overrideTitle?: string }
): Promise<StageProject> {
  const client = requireClient();
  const saveAsNew = Boolean(options?.saveAsNew);

  // Determine whether we are updating an existing owned cloud project or creating a new one
  let targetProjectId: string;
  let isUpdatingExisting = false;

  if (!saveAsNew && isUuid(project.id)) {
    const existingCheck = await client
      .from('projects')
      .select('id')
      .eq('id', project.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCheck.error) {
      throw new Error(existingCheck.error.message);
    }

    if (existingCheck.data) {
      targetProjectId = project.id;
      isUpdatingExisting = true;
    } else {
      targetProjectId = createUuid();
    }
  } else {
    targetProjectId = createUuid();
  }

  // Build deterministic UUID maps for all child entities
  const signalGroupIdMap = new Map<string, string>();
  const itemIdMap = new Map<string, string>();
  const channelIdMap = new Map<string, string>();
  const monitorIdMap = new Map<string, string>();
  const contactIdMap = new Map<string, string>();

  const allocateId = (oldId: string | undefined, map: Map<string, string>): string => {
    if (oldId && map.has(oldId)) {
      return map.get(oldId)!;
    }
    const nextId = !saveAsNew && isUuid(oldId) ? oldId : createUuid();
    if (oldId) {
      map.set(oldId, nextId);
    }
    return nextId;
  };

  const sourceGroups = project.signalGroups || [];
  sourceGroups.forEach((g) => allocateId(g.id, signalGroupIdMap));
  project.items.forEach((it) => allocateId(it.id, itemIdMap));
  project.channels.forEach((ch) => allocateId(ch.id, channelIdMap));
  project.monitors.forEach((mix) => allocateId(mix.id, monitorIdMap));
  project.contacts.forEach((c, idx) => allocateId(c.id || `contact_${idx}`, contactIdMap));

  const resolvedTitle = (options?.overrideTitle ?? project.title) || 'Stage Plot & Input List';
  const showDateValue =
    project.date && /^\d{4}-\d{2}-\d{2}$/.test(project.date.trim()) ? project.date.trim() : null;

  const nowIso = new Date().toISOString();

  // 1. Upsert project header row
  const projectPayload = {
    id: targetProjectId,
    user_id: userId,
    title: resolvedTitle,
    artist_name: project.artistName || 'Artist / Band Name',
    version_date: project.versionDate || 'Rev 1.0',
    show_date: showDateValue,
    venue_or_tour: project.venueOrTour || '',
    production_notes: project.productionNotes || '',
    audio_notes: project.audioNotes || '',
    misc_notes: project.miscNotes || '',
    stage_width_feet: project.stageDimensions?.widthFeet || 28,
    stage_depth_feet: project.stageDimensions?.depthFeet || 18,
    stage_unit: project.stageDimensions?.unit === 'meters' ? 'meters' : 'feet',
    show_dimensions_overlay:
      project.showDimensionsOverlay !== undefined ? Boolean(project.showDimensionsOverlay) : true,
    show_signal_paths:
      project.showSignalPaths !== undefined ? Boolean(project.showSignalPaths) : true,
    power_requirements: project.powerRequirements || {},
    tech_zone: project.techZone || {
      enabled: false,
      label: 'MONITOR / TECH WORLD (SR)',
      location: 'SR',
    },
    updated_at: nowIso,
  };

  const { error: projErr } = await client
    .from('projects')
    .upsert(projectPayload, { onConflict: 'id' });

  if (projErr) {
    throw new Error(`Failed to save project: ${projErr.message}`);
  }

  // 2. If updating an existing project, clear previous child records cleanly in FK-safe order
  if (isUpdatingExisting) {
    const existingItemsRes = await client
      .from('stage_items')
      .select('id')
      .eq('project_id', targetProjectId);

    if (existingItemsRes.error) {
      throw new Error(existingItemsRes.error.message);
    }

    const oldItemIds = (existingItemsRes.data || []).map((r: any) => r.id);
    if (oldItemIds.length > 0) {
      const { error: delMonLinksErr } = await client
        .from('stage_item_monitors')
        .delete()
        .in('stage_item_id', oldItemIds);
      if (delMonLinksErr) throw new Error(delMonLinksErr.message);
    }

    const { error: delChannelsErr } = await client
      .from('channels')
      .delete()
      .eq('project_id', targetProjectId);
    if (delChannelsErr) throw new Error(delChannelsErr.message);

    const { error: delMonitorsErr } = await client
      .from('monitor_mixes')
      .delete()
      .eq('project_id', targetProjectId);
    if (delMonitorsErr) throw new Error(delMonitorsErr.message);

    const { error: delContactsErr } = await client
      .from('production_contacts')
      .delete()
      .eq('project_id', targetProjectId);
    if (delContactsErr) throw new Error(delContactsErr.message);

    if (oldItemIds.length > 0) {
      const { error: clearRouteErr } = await client
        .from('stage_items')
        .update({ route_to_item_id: null })
        .eq('project_id', targetProjectId);
      if (clearRouteErr) throw new Error(clearRouteErr.message);
    }

    const { error: delItemsErr } = await client
      .from('stage_items')
      .delete()
      .eq('project_id', targetProjectId);
    if (delItemsErr) throw new Error(delItemsErr.message);

    const { error: delGroupsErr } = await client
      .from('signal_groups')
      .delete()
      .eq('project_id', targetProjectId);
    if (delGroupsErr) throw new Error(delGroupsErr.message);
  }

  // 3. Insert signal_groups
  if (sourceGroups.length > 0) {
    const groupRows = sourceGroups.map((g) => ({
      id: signalGroupIdMap.get(g.id)!,
      project_id: targetProjectId,
      client_key: g.id,
      name: g.name,
      short_code: g.shortCode,
      color: g.color || '#0284c7',
      split_type: g.splitType || 'subsnake',
      notes: g.notes || null,
    }));

    const { error: insGroupsErr } = await client.from('signal_groups').insert(groupRows);
    if (insGroupsErr) throw new Error(`Failed to save signal splits: ${insGroupsErr.message}`);
  }

  // 4. Insert stage_items (first pass without self-referencing route_to_item_id)
  const routeUpdates: Array<{ id: string; routeToId: string }> = [];
  if (project.items.length > 0) {
    const itemRows = project.items.map((it, idx) => {
      const mappedId = itemIdMap.get(it.id)!;
      const mappedGroupId = it.signalGroupId ? signalGroupIdMap.get(it.signalGroupId) || null : null;
      const mappedRouteToId = it.routeToItemId ? itemIdMap.get(it.routeToItemId) || null : null;
      if (mappedRouteToId) {
        routeUpdates.push({ id: mappedId, routeToId: mappedRouteToId });
      }

      return {
        id: mappedId,
        project_id: targetProjectId,
        client_key: it.id,
        gear_type: it.type,
        symbol_id: it.symbolId || null,
        name: it.name || 'Gear Item',
        has_custom_label: Boolean(it.hasCustomLabel),
        label_align_h: it.labelAlignH || 'center',
        label_align_v: it.labelAlignV || 'bottom',
        performer: it.performer || null,
        instrument: it.instrument || null,
        x: it.x,
        y: it.y,
        rotation: it.rotation || 0,
        width: it.width || 3,
        height: it.height || 3,
        color: it.color || null,
        notes: it.notes || null,
        wedge_label: it.wedgeLabel || null,
        power_drop_required: Boolean(it.powerDropRequired),
        power_voltage: it.powerVoltage === '230V' ? '230V' : '120V',
        power_spec: it.powerSpec || null,
        signal_group_id: mappedGroupId,
        route_to_item_id: null,
        sub_snake_label: it.subSnakeLabel || null,
        phantom_48v_required: Boolean(it.phantom48VRequired),
        locked: Boolean(it.locked),
        z_index: typeof it.zIndex === 'number' ? it.zIndex : idx,
      };
    });

    const { error: insItemsErr } = await client.from('stage_items').insert(itemRows);
    if (insItemsErr) throw new Error(`Failed to save stage items: ${insItemsErr.message}`);

    // Second pass: apply route_to_item_id self-references
    if (routeUpdates.length > 0) {
      await Promise.all(
        routeUpdates.map(async (u) => {
          const { error: routeErr } = await client
            .from('stage_items')
            .update({ route_to_item_id: u.routeToId })
            .eq('id', u.id);
          if (routeErr) throw new Error(routeErr.message);
        })
      );
    }
  }

  // 5. Insert channels (preserving linked_stage_item_id)
  if (project.channels.length > 0) {
    // Also honor item.channelIds in case a channel wasn't tagged on linkedStageItemId
    const fallbackItemByChannel = new Map<string, string>();
    project.items.forEach((it) => {
      (it.channelIds || []).forEach((cid) => {
        if (!fallbackItemByChannel.has(cid)) {
          fallbackItemByChannel.set(cid, it.id);
        }
      });
    });

    const channelRows = project.channels.map((ch) => {
      const rawLinkedItem = ch.linkedStageItemId || fallbackItemByChannel.get(ch.id);
      const mappedItemId = rawLinkedItem ? itemIdMap.get(rawLinkedItem) || null : null;
      const mappedGroupId = ch.signalGroupId ? signalGroupIdMap.get(ch.signalGroupId) || null : null;

      return {
        id: channelIdMap.get(ch.id)!,
        project_id: targetProjectId,
        client_key: ch.id,
        channel_number: ch.channelNumber,
        name: ch.name || `Input ${ch.channelNumber}`,
        category: ch.category || 'other',
        mic_or_di: ch.micOrDI || '',
        connector: ch.connector || 'XLR',
        stand_type: ch.standType || 'none',
        phantom_48v: Boolean(ch.phantom48V),
        sub_snake: ch.subSnake || '',
        signal_group_id: mappedGroupId,
        stage_location: ch.stageLocation || '',
        monitor_sends: ch.monitorSends || {},
        notes: ch.notes || null,
        linked_stage_item_id: mappedItemId,
      };
    });

    const { error: insChannelsErr } = await client.from('channels').insert(channelRows);
    if (insChannelsErr) throw new Error(`Failed to save channels: ${insChannelsErr.message}`);
  }

  // 6. Insert monitor_mixes + stage_item_monitors join rows
  if (project.monitors.length > 0) {
    const monitorRows = project.monitors.map((mix) => {
      const mappedItemId = mix.linkedStageItemId
        ? itemIdMap.get(mix.linkedStageItemId) || null
        : null;

      return {
        id: monitorIdMap.get(mix.id)!,
        project_id: targetProjectId,
        client_key: mix.id,
        mix_number: mix.mixNumber,
        performer: mix.performer || `Mix ${mix.mixNumber}`,
        mix_type: mix.type || 'floor_wedge',
        location: mix.location || '',
        output_patch: mix.outputPatch || '',
        requested_content: mix.requestedContent || null,
        notes: mix.notes || null,
        linked_stage_item_id: mappedItemId,
      };
    });

    const { error: insMonitorsErr } = await client.from('monitor_mixes').insert(monitorRows);
    if (insMonitorsErr) throw new Error(`Failed to save monitor mixes: ${insMonitorsErr.message}`);

    // Collect deduplicated many-to-many (stage_item_id, monitor_mix_id) pairs
    const pairSet = new Set<string>();
    const joinRows: Array<{ stage_item_id: string; monitor_mix_id: string }> = [];

    const addPair = (mappedItemId?: string, mappedMonitorId?: string) => {
      if (!mappedItemId || !mappedMonitorId) return;
      const key = `${mappedItemId}:${mappedMonitorId}`;
      if (pairSet.has(key)) return;
      pairSet.add(key);
      joinRows.push({
        stage_item_id: mappedItemId,
        monitor_mix_id: mappedMonitorId,
      });
    };

    project.items.forEach((it) => {
      const mItem = itemIdMap.get(it.id);
      (it.monitorIds || []).forEach((mid) => {
        addPair(mItem, monitorIdMap.get(mid));
      });
    });

    project.monitors.forEach((mix) => {
      if (mix.linkedStageItemId) {
        addPair(itemIdMap.get(mix.linkedStageItemId), monitorIdMap.get(mix.id));
      }
    });

    if (joinRows.length > 0) {
      const { error: insJoinErr } = await client.from('stage_item_monitors').insert(joinRows);
      if (insJoinErr) {
        throw new Error(`Failed to save monitor item links: ${insJoinErr.message}`);
      }
    }
  }

  // 7. Insert production_contacts
  if (project.contacts.length > 0) {
    const contactRows = project.contacts.map((c, idx) => ({
      id: contactIdMap.get(c.id || `contact_${idx}`)!,
      project_id: targetProjectId,
      role: c.role || 'Crew',
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      department: c.department || 'Audio',
      status: c.status || 'touring',
      quantity: typeof c.quantity === 'number' && c.quantity > 0 ? c.quantity : 1,
      notes: c.notes || '',
      sort_order: idx,
    }));

    const { error: insContactsErr } = await client.from('production_contacts').insert(contactRows);
    if (insContactsErr) {
      throw new Error(`Failed to save contacts: ${insContactsErr.message}`);
    }
  }

  // Return updated in-memory StageProject using the persisted Supabase UUIDs
  const mappedSignalGroups: SignalGroup[] = sourceGroups.map((g) => ({
    ...g,
    id: signalGroupIdMap.get(g.id)!,
  }));

  const mappedItems: StageItem[] = project.items.map((it, idx) => ({
    ...it,
    id: itemIdMap.get(it.id)!,
    signalGroupId: it.signalGroupId ? signalGroupIdMap.get(it.signalGroupId) : undefined,
    routeToItemId: it.routeToItemId ? itemIdMap.get(it.routeToItemId) : undefined,
    channelIds: it.channelIds
      ? it.channelIds.map((cid) => channelIdMap.get(cid)).filter((v): v is string => Boolean(v))
      : undefined,
    monitorIds: it.monitorIds
      ? it.monitorIds.map((mid) => monitorIdMap.get(mid)).filter((v): v is string => Boolean(v))
      : undefined,
    zIndex: typeof it.zIndex === 'number' ? it.zIndex : idx,
  }));

  const mappedChannels: ChannelInput[] = project.channels.map((ch) => ({
    ...ch,
    id: channelIdMap.get(ch.id)!,
    signalGroupId: ch.signalGroupId ? signalGroupIdMap.get(ch.signalGroupId) : undefined,
    linkedStageItemId: ch.linkedStageItemId ? itemIdMap.get(ch.linkedStageItemId) : undefined,
  }));

  const mappedMonitors: MonitorMix[] = project.monitors.map((mix) => ({
    ...mix,
    id: monitorIdMap.get(mix.id)!,
    linkedStageItemId: mix.linkedStageItemId ? itemIdMap.get(mix.linkedStageItemId) : undefined,
  }));

  const mappedContacts: ProductionContact[] = project.contacts.map((c, idx) => ({
    ...c,
    id: contactIdMap.get(c.id || `contact_${idx}`)!,
  }));

  return {
    ...project,
    id: targetProjectId,
    title: resolvedTitle,
    signalGroups: mappedSignalGroups.length > 0 ? mappedSignalGroups : project.signalGroups,
    items: mappedItems,
    channels: mappedChannels,
    monitors: mappedMonitors,
    contacts: mappedContacts,
    updatedAt: nowIso,
  };
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('projects').delete().eq('id', projectId);
  if (error) {
    throw new Error(error.message);
  }
}

// Custom Gear Library Cloud Sync
export async function fetchCustomGearDefinitions(
  userId: string
): Promise<Record<string, GearDefinition>> {
  const client = requireClient();
  const { data, error } = await client
    .from('custom_gear_definitions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const result: Record<string, GearDefinition> = {};
  (data || []).forEach((row: any) => {
    const def: GearDefinition = {
      type: row.type_key,
      label: row.label,
      category: (row.category || 'stock_shapes') as GearCategory,
      defaultWidthFeet: Number(row.default_width_feet || 3),
      defaultHeightFeet: Number(row.default_height_feet || 3),
      description: row.description || '',
      isCustom: true,
      stockSymbol: (row.stock_symbol || undefined) as StockSymbolId | undefined,
      defaultPower: (row.default_power || undefined) as PowerSpec | undefined,
      defaultSubSnake: row.default_sub_snake || undefined,
      defaultSignalGroupId: row.default_signal_group_key || undefined,
      defaultMic: row.default_mic || undefined,
      defaultConnector: (row.default_connector || undefined) as ConnectorType | undefined,
      defaultChannels: Array.isArray(row.default_channels)
        ? (row.default_channels as DefaultChannelDrop[])
        : undefined,
    };
    result[def.type] = def;
  });

  return result;
}

export async function upsertCustomGearDefinition(
  userId: string,
  def: GearDefinition
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('custom_gear_definitions').upsert(
    {
      user_id: userId,
      type_key: def.type,
      label: def.label,
      category: def.category,
      default_width_feet: def.defaultWidthFeet,
      default_height_feet: def.defaultHeightFeet,
      description: def.description || '',
      stock_symbol: def.stockSymbol || null,
      default_power: def.defaultPower || null,
      default_sub_snake: def.defaultSubSnake || null,
      default_signal_group_key: def.defaultSignalGroupId || null,
      default_mic: def.defaultMic || null,
      default_connector: def.defaultConnector || null,
      default_channels: def.defaultChannels || [],
    },
    { onConflict: 'user_id,type_key' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCloudCustomGearDefinition(
  userId: string,
  typeKey: string
): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('custom_gear_definitions')
    .delete()
    .eq('user_id', userId)
    .eq('type_key', typeKey);

  if (error) {
    throw new Error(error.message);
  }
}
