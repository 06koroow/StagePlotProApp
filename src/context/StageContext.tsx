/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  StageProject,
  StageItem,
  ChannelInput,
  MonitorMix,
  GearType,
  GearDefinition,
  SignalGroup,
  StageDimensions,
  ProductionContact,
} from '../types/stage';
import { BAND_TEMPLATES, GEAR_DEFINITIONS, DEFAULT_SIGNAL_GROUPS } from '../data/gearLibrary';

const STORAGE_KEY = 'stagecraft_active_project_v2';
const CUSTOM_GEAR_STORAGE_KEY = 'stagecraft_custom_gear_v1';

export type ActiveWorkspaceTab = 'plot' | 'channels' | 'monitors' | 'contacts' | 'rider';

interface StageContextType {
  project: StageProject;
  activeTab: ActiveWorkspaceTab;
  setActiveTab: (tab: ActiveWorkspaceTab) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  gridSnapFeet: number;
  setGridSnapFeet: (feet: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;

  // Custom Gear Library
  customGearDefinitions: Record<string, GearDefinition>;
  allGearDefinitions: Record<string, GearDefinition>;
  saveCustomGearDefinition: (def: GearDefinition) => void;
  deleteCustomGearDefinition: (typeKey: string) => void;

  // Signal Split & Routing Groups
  addSignalGroup: (group: Omit<SignalGroup, 'id'>) => SignalGroup;
  updateSignalGroup: (id: string, updates: Partial<SignalGroup>) => void;
  removeSignalGroup: (id: string) => void;
  syncItemSubSnakeToChannels: (itemId: string, subSnakeLabel: string, signalGroupId?: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  commitHistory: () => void;

  // Project Level Actions
  updateProject: (partial: Partial<StageProject>) => void;
  updateStageDimensions: (dims: StageDimensions) => void;
  loadTemplate: (templateKey: string) => void;
  resetToBlank: (widthFeet?: number, depthFeet?: number) => void;
  importProjectJSON: (jsonStr: string) => boolean;
  exportProjectJSON: () => string;

  // Stage Item Actions
  addItem: (type: GearType, coords?: { x: number; y: number }, overrideDefs?: Record<string, GearDefinition>) => void;
  updateItem: (id: string, updates: Partial<StageItem>, recordHistory?: boolean) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  rotateItem: (id: string, angleDelta: number) => void;
  setItemRotation: (id: string, rotation: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  toggleLockItem: (id: string) => void;

  // Channel List Actions
  addChannel: (channel?: Partial<ChannelInput>) => void;
  updateChannel: (id: string, updates: Partial<ChannelInput>) => void;
  removeChannel: (id: string) => void;
  reorderChannels: (fromIndex: number, toIndex: number) => void;
  batchAddChannels: (channels: Array<Omit<ChannelInput, 'id' | 'channelNumber'>>) => void;
  togglePhantom48V: (id: string) => void;
  toggleChannelLink: (itemId: string, channelId: string) => void;
  setChannelStageItemLink: (channelId: string, itemId: string | undefined) => void;

  // Monitor Actions
  addMonitorMix: (mix?: Partial<MonitorMix>) => void;
  updateMonitorMix: (id: string, updates: Partial<MonitorMix>) => void;
  removeMonitorMix: (id: string) => void;
  toggleMonitorLink: (itemId: string, monitorId: string) => void;
  setMonitorStageItemLink: (monitorId: string, itemId: string | undefined) => void;

  // Crew & Contacts Actions
  addContact: (contact?: Partial<ProductionContact>) => void;
  updateContact: (index: number, updates: Partial<ProductionContact>) => void;
  removeContact: (index: number) => void;
}

const StageContext = createContext<StageContextType | null>(null);

const LEGACY_PRESET_CHANNEL_LINKS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  Object.values(BAND_TEMPLATES).forEach((tpl) => {
    tpl.channels.forEach((ch) => {
      if (ch.linkedStageItemId) {
        map[ch.id] = ch.linkedStageItemId;
      }
    });
  });
  return map;
})();

const LEGACY_PRESET_MONITOR_LINKS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  Object.values(BAND_TEMPLATES).forEach((tpl) => {
    tpl.monitors.forEach((mix) => {
      if (mix.linkedStageItemId) {
        map[mix.id] = mix.linkedStageItemId;
      }
    });
  });
  return map;
})();

function normalizeProject(raw: any): StageProject {
  const items: StageItem[] = Array.isArray(raw.items) ? raw.items : [];
  const itemIds = new Set(items.map((it) => it.id));
  const rawChannels: ChannelInput[] = Array.isArray(raw.channels) ? raw.channels : [];
  const normalizedChannels: ChannelInput[] = rawChannels.map((ch) => {
    if (ch.linkedStageItemId) return ch;
    const inferredItemId = LEGACY_PRESET_CHANNEL_LINKS[ch.id];
    if (inferredItemId && itemIds.has(inferredItemId)) {
      return { ...ch, linkedStageItemId: inferredItemId };
    }
    return ch;
  });

  const rawMonitors: MonitorMix[] = Array.isArray(raw.monitors) ? raw.monitors : [];
  const normalizedMonitors: MonitorMix[] = rawMonitors.map((mix) => {
    if (mix.linkedStageItemId) return mix;
    const inferredItemId = LEGACY_PRESET_MONITOR_LINKS[mix.id];
    if (inferredItemId && itemIds.has(inferredItemId)) {
      return { ...mix, linkedStageItemId: inferredItemId };
    }
    return mix;
  });

  const migrated: StageProject = {
    ...raw,
    items,
    channels: normalizedChannels,
    audioNotes: raw.audioNotes ?? '',
    miscNotes: raw.miscNotes ?? '',
    versionDate: raw.versionDate ?? 'Rev 1.0',
    contacts: Array.isArray(raw.contacts)
      ? raw.contacts.map((c: any, idx: number) => ({
          id: c.id || `contact_${idx}_${Date.now()}`,
          role: c.role || 'Crew',
          name: c.name || '',
          phone: c.phone || '',
          email: c.email || '',
          department: c.department || 'Audio',
          status: c.status || 'touring',
          quantity: typeof c.quantity === 'number' && c.quantity > 0 ? c.quantity : 1,
          notes: c.notes || '',
        }))
      : [],
    monitors: normalizedMonitors,
    showSignalPaths: raw.showSignalPaths !== undefined ? !!raw.showSignalPaths : true,
    signalGroups:
      Array.isArray(raw.signalGroups) && raw.signalGroups.length > 0
        ? raw.signalGroups
        : DEFAULT_SIGNAL_GROUPS,
    techZone:
      raw.techZone ??
      (raw.guitarTechWorld
        ? {
            enabled: !!raw.guitarTechWorld.enabled,
            label: raw.guitarTechWorld.label || 'MONITOR / TECH WORLD (SR)',
            location: raw.guitarTechWorld.location === 'SL' ? 'SL' : 'SR',
          }
        : {
            enabled: false,
            label: 'MONITOR / TECH WORLD (SR)',
            location: 'SR',
          }),
  };
  return migrated;
}

export const StageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load custom gear library from localStorage
  const [customGearDefinitions, setCustomGearDefinitions] = useState<Record<string, GearDefinition>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_GEAR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });

  const allGearDefinitions = useMemo(
    () => ({ ...GEAR_DEFINITIONS, ...customGearDefinitions }),
    [customGearDefinitions]
  );

  // Save custom gear definitions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_GEAR_STORAGE_KEY, JSON.stringify(customGearDefinitions));
    } catch {
      // ignore
    }
  }, [customGearDefinitions]);

  // Load initial from localStorage or default to 4-piece touring band template
  const [project, setProject] = useState<StageProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.channels)) {
          return normalizeProject(parsed);
        }
      }
    } catch {
      // ignore
    }
    return BAND_TEMPLATES.band_4piece;
  });

  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('plot');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [gridSnapFeet, setGridSnapFeet] = useState<number>(1); // 1 ft snap default
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Undo / Redo history stack
  const historyRef = useRef<StageProject[]>([project]);
  const historyIndexRef = useRef<number>(0);
  const isUndoRedoRef = useRef<boolean>(false);
  const latestProjectRef = useRef<StageProject>(project);
  latestProjectRef.current = project;

  // Push state to history
  const pushHistory = useCallback((newProject: StageProject) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    const currentHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    currentHist.push(newProject);
    if (currentHist.length > 30) {
      currentHist.shift();
    }
    historyRef.current = currentHist;
    historyIndexRef.current = currentHist.length - 1;
  }, []);

  // Commit current live project snapshot to history (used on pointerup after drag/rotate)
  const commitHistory = useCallback(() => {
    const current = latestProjectRef.current;
    const head = historyRef.current[historyIndexRef.current];
    if (head !== current) {
      pushHistory(current);
    }
  }, [pushHistory]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project]);

  // Set project with optional history record
  const setProjectState = useCallback(
    (updater: (prev: StageProject) => StageProject, recordHistory = true) => {
      setProject((prev) => {
        const next = updater(prev);
        const withTimestamp = {
          ...next,
          updatedAt: new Date().toISOString(),
        };
        if (recordHistory) {
          pushHistory(withTimestamp);
        }
        return withTimestamp;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      isUndoRedoRef.current = true;
      setProject(historyRef.current[historyIndexRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      isUndoRedoRef.current = true;
      setProject(historyRef.current[historyIndexRef.current]);
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Project Level Actions
  const updateProject = useCallback(
    (partial: Partial<StageProject>) => {
      setProjectState((prev) => ({
        ...prev,
        ...partial,
      }));
    },
    [setProjectState]
  );

  const updateStageDimensions = useCallback(
    (dims: StageDimensions) => {
      setProjectState((prev) => ({
        ...prev,
        stageDimensions: dims,
      }));
    },
    [setProjectState]
  );

  const loadTemplate = useCallback(
    (templateKey: string) => {
      const template = BAND_TEMPLATES[templateKey];
      if (template) {
        const cloned = JSON.parse(JSON.stringify(template));
        cloned.id = `project_${Date.now()}`;
        cloned.updatedAt = new Date().toISOString();
        setProjectState(() => cloned);
        setSelectedItemId(null);
      }
    },
    [setProjectState]
  );

  const resetToBlank = useCallback(
    (widthFeet = 28, depthFeet = 18) => {
      const blank: StageProject = {
        id: `project_${Date.now()}`,
        title: 'Stage Plot & Input List',
        artistName: 'Artist / Band Name',
        versionDate: 'Rev 1.0',
        date: new Date().toISOString().split('T')[0],
        venueOrTour: 'Tour / Festival / Venue',
        productionNotes: 'Stage plot and technical input patch list.',
        audioNotes: `• Short Boom Tripod Stands
• Tall Boom Tripod Stands
• XLR Cabling & Sub-Snakes`,
        miscNotes: `• Isolated 20A AC Drops as marked
• Stage risers & backline notes`,
        contacts: [
          { role: 'FOH / PRODUCTION CONTACT', name: '', phone: '', email: '' },
        ],
        stageDimensions: { widthFeet, depthFeet, unit: 'feet' },
        items: [],
        channels: [],
        monitors: [
          { id: 'm1', mixNumber: 1, performer: 'Mix 1 — Lead Wedge', type: 'floor_wedge', location: 'DSC', outputPatch: 'Aux 1' },
        ],
        powerRequirements: {
          dedicatedDrops120V: 4,
          dedicatedDrops230V: 0,
          stageRiserSpecs: 'Flat stage deck.',
          backlineNotes: '',
          notes: 'AC power quad drops distributed as indicated on plot.',
        },
        techZone: {
          enabled: false,
          label: 'MONITOR / TECH WORLD (SR)',
          location: 'SR',
        },
        showSignalPaths: true,
        signalGroups: DEFAULT_SIGNAL_GROUPS,
        updatedAt: new Date().toISOString(),
      };
      setProjectState(() => blank);
      setSelectedItemId(null);
    },
    [setProjectState]
  );

  // Custom Gear Library Actions
  const saveCustomGearDefinition = useCallback((def: GearDefinition) => {
    setCustomGearDefinitions((prev) => ({
      ...prev,
      [def.type]: { ...def, isCustom: true },
    }));
  }, []);

  const deleteCustomGearDefinition = useCallback((typeKey: string) => {
    setCustomGearDefinitions((prev) => {
      const next = { ...prev };
      delete next[typeKey];
      return next;
    });
  }, []);

  // Signal Group / Split Management
  const addSignalGroup = useCallback(
    (group: Omit<SignalGroup, 'id'>): SignalGroup => {
      const created: SignalGroup = {
        ...group,
        id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      };
      setProjectState((prev) => ({
        ...prev,
        signalGroups: [...(prev.signalGroups || DEFAULT_SIGNAL_GROUPS), created],
      }));
      return created;
    },
    [setProjectState]
  );

  const updateSignalGroup = useCallback(
    (id: string, updates: Partial<SignalGroup>) => {
      setProjectState((prev) => {
        const currentGroups = prev.signalGroups || DEFAULT_SIGNAL_GROUPS;
        const previousGroup = currentGroups.find((g) => g.id === id);
        const oldCode = previousGroup?.shortCode;
        const newCode = updates.shortCode;
        const codeChanged = Boolean(newCode && oldCode && newCode !== oldCode);

        return {
          ...prev,
          signalGroups: currentGroups.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
          items: codeChanged
            ? prev.items.map((it) => {
                const belongsToGroup =
                  it.signalGroupId === id ||
                  (!it.signalGroupId && oldCode && it.subSnakeLabel === oldCode);
                if (!belongsToGroup) return it;
                const shouldSyncLabel = !it.subSnakeLabel || it.subSnakeLabel === oldCode;
                return shouldSyncLabel
                  ? { ...it, signalGroupId: id, subSnakeLabel: newCode }
                  : it;
              })
            : prev.items,
          channels: codeChanged
            ? prev.channels.map((ch) => {
                const belongsToGroup =
                  ch.signalGroupId === id ||
                  (!ch.signalGroupId && oldCode && ch.subSnake === oldCode);
                if (!belongsToGroup) return ch;
                const shouldSyncSnake = !ch.subSnake || ch.subSnake === oldCode;
                return shouldSyncSnake
                  ? { ...ch, signalGroupId: id, subSnake: newCode }
                  : ch;
              })
            : prev.channels,
        };
      });
    },
    [setProjectState]
  );

  const removeSignalGroup = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const currentGroups = prev.signalGroups || DEFAULT_SIGNAL_GROUPS;
        const removed = currentGroups.find((g) => g.id === id);
        const removedCode = removed?.shortCode;

        return {
          ...prev,
          signalGroups: currentGroups.filter((g) => g.id !== id),
          items: prev.items.map((it) => {
            if (it.signalGroupId === id) {
              return {
                ...it,
                signalGroupId: undefined,
                subSnakeLabel:
                  removedCode && it.subSnakeLabel === removedCode ? undefined : it.subSnakeLabel,
              };
            }
            return it;
          }),
          channels: prev.channels.map((ch) => {
            if (ch.signalGroupId === id) {
              return {
                ...ch,
                signalGroupId: undefined,
                subSnake: removedCode && ch.subSnake === removedCode ? '' : ch.subSnake,
              };
            }
            return ch;
          }),
        };
      });
    },
    [setProjectState]
  );

  const syncItemSubSnakeToChannels = useCallback(
    (itemId: string, subSnakeLabel: string, signalGroupId?: string) => {
      setProjectState((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, subSnakeLabel, signalGroupId } : it
        ),
        channels: prev.channels.map((ch) =>
          ch.linkedStageItemId === itemId
            ? { ...ch, subSnake: subSnakeLabel, signalGroupId }
            : ch
        ),
      }));
    },
    [setProjectState]
  );

  const importProjectJSON = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.channels)) {
          if (parsed.customGearDefinitions && typeof parsed.customGearDefinitions === 'object') {
            setCustomGearDefinitions((prev) => ({
              ...prev,
              ...parsed.customGearDefinitions,
            }));
          }
          setProjectState(() => normalizeProject(parsed));
          setSelectedItemId(null);
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [setProjectState]
  );

  const exportProjectJSON = useCallback((): string => {
    const payload: StageProject = {
      ...project,
      customGearDefinitions:
        Object.keys(customGearDefinitions).length > 0 ? customGearDefinitions : undefined,
    };
    return JSON.stringify(payload, null, 2);
  }, [project, customGearDefinitions]);

  // Stage Item Actions
  const addItem = useCallback(
    (
      type: GearType,
      coords?: { x: number; y: number },
      overrideDefs?: Record<string, GearDefinition>
    ) => {
      const mergedDefs = overrideDefs
        ? { ...allGearDefinitions, ...overrideDefs }
        : allGearDefinitions;
      const gearDef = mergedDefs[type];
      const newItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const defaultPower = gearDef?.defaultPower;
      const inferredPowerRequired = defaultPower
        ? !!defaultPower.required
        : type.includes('amp') ||
          type.includes('keyboard') ||
          type.includes('dj') ||
          type.includes('playback') ||
          type.includes('iem') ||
          type.startsWith('power_') ||
          type === 'ac_power_drop_quad';

      const inferredVoltage: '120V' | '230V' =
        defaultPower?.voltage &&
        (defaultPower.voltage.includes('230') ||
          defaultPower.voltage.includes('240') ||
          defaultPower.voltage.includes('400'))
          ? '230V'
          : '120V';

      const newItem: StageItem = {
        id: newItemId,
        type,
        symbolId: gearDef?.stockSymbol,
        name: gearDef?.label || 'Gear Item',
        x: coords ? coords.x : 50,
        y: coords ? coords.y : 50,
        rotation: 0,
        width: gearDef?.defaultWidthFeet || 3,
        height: gearDef?.defaultHeightFeet || 3,
        powerDropRequired: inferredPowerRequired,
        powerVoltage: inferredVoltage,
        powerSpec: defaultPower ? { ...defaultPower } : undefined,
        signalGroupId: gearDef?.defaultSignalGroupId,
        subSnakeLabel: gearDef?.defaultSubSnake,
        locked: false,
      };

      setProjectState((prev) => {
        let updatedChannels = [...prev.channels];

        if (gearDef?.defaultChannels && gearDef.defaultChannels.length > 0) {
          const nextChNum =
            updatedChannels.length > 0
              ? Math.max(...updatedChannels.map((c) => c.channelNumber)) + 1
              : 1;

          const newChs: ChannelInput[] = gearDef.defaultChannels.map((cDef, idx) => ({
            id: `ch_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 4)}`,
            channelNumber: nextChNum + idx,
            name: cDef.name,
            category: cDef.category,
            micOrDI: cDef.micOrDI,
            connector: cDef.connector || gearDef.defaultConnector || 'XLR',
            standType: cDef.standType,
            phantom48V: cDef.phantom48V,
            subSnake: cDef.subSnake || gearDef.defaultSubSnake || '',
            signalGroupId: gearDef.defaultSignalGroupId,
            stageLocation: cDef.stageLocation || '',
            monitorSends: {},
            linkedStageItemId: newItemId,
          }));

          updatedChannels = [...updatedChannels, ...newChs];
          newItem.channelIds = newChs.map((c) => c.id);
        }

        return {
          ...prev,
          items: [...prev.items, newItem],
          channels: updatedChannels,
        };
      });

      setSelectedItemId(newItemId);
    },
    [allGearDefinitions, setProjectState]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<StageItem>, recordHistory = true) => {
      setProjectState(
        (prev) => ({
          ...prev,
          items: prev.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
        }),
        recordHistory
      );
    },
    [setProjectState]
  );

  const removeItem = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const targetItem = prev.items.find((it) => it.id === id);
        const explicitChannelIds = new Set(targetItem?.channelIds || []);

        const remainingItems = prev.items
          .filter((it) => it.id !== id)
          .map((it) =>
            it.routeToItemId === id ? { ...it, routeToItemId: undefined } : it
          );

        const remainingChannels = prev.channels
          .filter(
            (ch) => ch.linkedStageItemId !== id && !explicitChannelIds.has(ch.id)
          )
          .map((ch, idx) => ({ ...ch, channelNumber: idx + 1 }));

        const updatedMonitors = prev.monitors.map((mix) => {
          if (mix.linkedStageItemId !== id) return mix;
          const fallbackItem = remainingItems.find((it) => it.monitorIds?.includes(mix.id));
          return { ...mix, linkedStageItemId: fallbackItem?.id };
        });

        return {
          ...prev,
          items: remainingItems,
          channels: remainingChannels,
          monitors: updatedMonitors,
        };
      });
      setSelectedItemId((cur) => (cur === id ? null : cur));
    },
    [setProjectState]
  );

  const duplicateItem = useCallback(
    (id: string) => {
      const item = project.items.find((it) => it.id === id);
      if (!item) return;

      const dupId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      setProjectState((prev) => {
        // By default, cloned kitpieces start unlinked from channels and monitor mixes
        const duplicated: StageItem = {
          ...item,
          id: dupId,
          name: `${item.name} (Copy)`,
          x: Math.min(item.x + 4, 92),
          y: Math.min(item.y + 4, 92),
          locked: false,
          channelIds: undefined,
          monitorIds: undefined,
        };

        return {
          ...prev,
          items: [...prev.items, duplicated],
        };
      });
      setSelectedItemId(dupId);
    },
    [project.items, setProjectState]
  );

  const rotateItem = useCallback(
    (id: string, angleDelta: number) => {
      setProjectState((prev) => ({
        ...prev,
        items: prev.items.map((it) => {
          if (it.id === id) {
            const newRot = (it.rotation + angleDelta + 360) % 360;
            return { ...it, rotation: newRot };
          }
          return it;
        }),
      }));
    },
    [setProjectState]
  );

  const setItemRotation = useCallback(
    (id: string, rotation: number) => {
      setProjectState((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === id ? { ...it, rotation: (rotation + 360) % 360 } : it
        ),
      }));
    },
    [setProjectState]
  );

  const bringForward = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const idx = prev.items.findIndex((it) => it.id === id);
        if (idx === -1 || idx === prev.items.length - 1) return prev;
        const items = [...prev.items];
        const [removed] = items.splice(idx, 1);
        items.push(removed);
        return { ...prev, items };
      });
    },
    [setProjectState]
  );

  const sendBackward = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const idx = prev.items.findIndex((it) => it.id === id);
        if (idx <= 0) return prev;
        const items = [...prev.items];
        const [removed] = items.splice(idx, 1);
        items.unshift(removed);
        return { ...prev, items };
      });
    },
    [setProjectState]
  );

  const toggleLockItem = useCallback(
    (id: string) => {
      setProjectState((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === id ? { ...it, locked: !it.locked } : it)),
      }));
    },
    [setProjectState]
  );

  // Channel List Actions
  const addChannel = useCallback(
    (channelData?: Partial<ChannelInput>) => {
      setProjectState((prev) => {
        const nextNum =
          prev.channels.length > 0
            ? Math.max(...prev.channels.map((c) => c.channelNumber)) + 1
            : 1;

        const newCh: ChannelInput = {
          id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          channelNumber: nextNum,
          name: channelData?.name || `Input ${nextNum}`,
          category: channelData?.category || 'other',
          micOrDI: channelData?.micOrDI || 'Active DI (Generic)',
          connector: channelData?.connector || 'XLR',
          standType: channelData?.standType || 'tall_boom',
          phantom48V: !!channelData?.phantom48V,
          subSnake: channelData?.subSnake || '',
          signalGroupId: channelData?.signalGroupId,
          stageLocation: channelData?.stageLocation || '',
          monitorSends: channelData?.monitorSends || {},
          notes: channelData?.notes || '',
          linkedStageItemId: channelData?.linkedStageItemId,
        };

        return {
          ...prev,
          channels: [...prev.channels, newCh],
        };
      });
    },
    [setProjectState]
  );

  const updateChannel = useCallback(
    (id: string, updates: Partial<ChannelInput>) => {
      setProjectState((prev) => ({
        ...prev,
        channels: prev.channels.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
    },
    [setProjectState]
  );

  const toggleChannelLink = useCallback(
    (itemId: string, channelId: string) => {
      setProjectState((prev) => {
        const targetItem = prev.items.find((it) => it.id === itemId);
        const targetChannel = prev.channels.find((ch) => ch.id === channelId);
        if (!targetItem || !targetChannel) return prev;

        const isCurrentlyLinked =
          targetChannel.linkedStageItemId === itemId ||
          Boolean(targetItem.channelIds?.includes(channelId));

        const nextChannels = prev.channels.map((ch) =>
          ch.id === channelId
            ? { ...ch, linkedStageItemId: isCurrentlyLinked ? undefined : itemId }
            : ch
        );

        const nextItems = prev.items.map((it) => {
          const existingIds = (it.channelIds || []).filter((cid) => cid !== channelId);
          if (it.id === itemId && !isCurrentlyLinked) {
            return {
              ...it,
              channelIds: [...existingIds, channelId],
            };
          }
          if (it.channelIds?.includes(channelId)) {
            return {
              ...it,
              channelIds: existingIds.length > 0 ? existingIds : undefined,
            };
          }
          return it;
        });

        return {
          ...prev,
          items: nextItems,
          channels: nextChannels,
        };
      });
    },
    [setProjectState]
  );

  const setChannelStageItemLink = useCallback(
    (channelId: string, itemId: string | undefined) => {
      setProjectState((prev) => {
        const nextChannels = prev.channels.map((ch) =>
          ch.id === channelId ? { ...ch, linkedStageItemId: itemId || undefined } : ch
        );

        const nextItems = prev.items.map((it) => {
          const cleaned = (it.channelIds || []).filter((cid) => cid !== channelId);
          if (itemId && it.id === itemId) {
            return { ...it, channelIds: [...cleaned, channelId] };
          }
          if (it.channelIds?.includes(channelId)) {
            return { ...it, channelIds: cleaned.length > 0 ? cleaned : undefined };
          }
          return it;
        });

        return {
          ...prev,
          items: nextItems,
          channels: nextChannels,
        };
      });
    },
    [setProjectState]
  );

  const removeChannel = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const filtered = prev.channels.filter((c) => c.id !== id);
        const renumbered = filtered.map((c, i) => ({ ...c, channelNumber: i + 1 }));
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.channelIds?.includes(id)
              ? { ...it, channelIds: it.channelIds.filter((cid) => cid !== id) }
              : it
          ),
          channels: renumbered,
        };
      });
    },
    [setProjectState]
  );

  const reorderChannels = useCallback(
    (fromIndex: number, toIndex: number) => {
      setProjectState((prev) => {
        const copy = [...prev.channels];
        const [moved] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, moved);
        const renumbered = copy.map((c, i) => ({ ...c, channelNumber: i + 1 }));
        return {
          ...prev,
          channels: renumbered,
        };
      });
    },
    [setProjectState]
  );

  const batchAddChannels = useCallback(
    (newChannels: Array<Omit<ChannelInput, 'id' | 'channelNumber'>>) => {
      setProjectState((prev) => {
        const startNum =
          prev.channels.length > 0
            ? Math.max(...prev.channels.map((c) => c.channelNumber)) + 1
            : 1;

        const created: ChannelInput[] = newChannels.map((c, idx) => ({
          ...c,
          id: `ch_${Date.now()}_${idx}`,
          channelNumber: startNum + idx,
        }));

        return {
          ...prev,
          channels: [...prev.channels, ...created],
        };
      });
    },
    [setProjectState]
  );

  const togglePhantom48V = useCallback(
    (id: string) => {
      setProjectState((prev) => ({
        ...prev,
        channels: prev.channels.map((c) =>
          c.id === id ? { ...c, phantom48V: !c.phantom48V } : c
        ),
      }));
    },
    [setProjectState]
  );

  // Monitor Actions
  const addMonitorMix = useCallback(
    (mixData?: Partial<MonitorMix>) => {
      setProjectState((prev) => {
        const nextNum =
          prev.monitors.length > 0
            ? Math.max(...prev.monitors.map((m) => m.mixNumber)) + 1
            : 1;

        const newMixId = `mix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newMix: MonitorMix = {
          id: newMixId,
          mixNumber: nextNum,
          performer: mixData?.performer || `Mix ${nextNum}`,
          type: mixData?.type || 'floor_wedge',
          location: mixData?.location || 'Downstage Center',
          outputPatch: mixData?.outputPatch || `Aux ${nextNum}`,
          requestedContent: mixData?.requestedContent || '',
          notes: mixData?.notes || '',
          linkedStageItemId: mixData?.linkedStageItemId,
        };

        const nextItems = mixData?.linkedStageItemId
          ? prev.items.map((it) =>
              it.id === mixData.linkedStageItemId
                ? {
                    ...it,
                    monitorIds: Array.from(new Set([...(it.monitorIds || []), newMixId])),
                  }
                : it
            )
          : prev.items;

        return {
          ...prev,
          items: nextItems,
          monitors: [...prev.monitors, newMix],
        };
      });
    },
    [setProjectState]
  );

  const updateMonitorMix = useCallback(
    (id: string, updates: Partial<MonitorMix>) => {
      setProjectState((prev) => ({
        ...prev,
        monitors: prev.monitors.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }));
    },
    [setProjectState]
  );

  const toggleMonitorLink = useCallback(
    (itemId: string, monitorId: string) => {
      setProjectState((prev) => {
        const targetItem = prev.items.find((it) => it.id === itemId);
        const targetMix = prev.monitors.find((m) => m.id === monitorId);
        if (!targetItem || !targetMix) return prev;

        const isCurrentlyLinked =
          targetMix.linkedStageItemId === itemId ||
          Boolean(targetItem.monitorIds?.includes(monitorId));

        if (isCurrentlyLinked) {
          const nextItems = prev.items.map((it) => {
            if (it.id !== itemId) return it;
            const filtered = (it.monitorIds || []).filter((mid) => mid !== monitorId);
            return { ...it, monitorIds: filtered.length > 0 ? filtered : undefined };
          });

          const nextMonitors = prev.monitors.map((m) => {
            if (m.id !== monitorId) return m;
            if (m.linkedStageItemId !== itemId) return m;
            const otherLinked = nextItems.find((it) => it.monitorIds?.includes(monitorId));
            return { ...m, linkedStageItemId: otherLinked?.id };
          });

          return {
            ...prev,
            items: nextItems,
            monitors: nextMonitors,
          };
        }

        // Linking monitorId to itemId (preserve existing link on another item so a single mix can feed multiple wedges)
        const prevOwnerId = targetMix.linkedStageItemId;
        const nextItems = prev.items.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              monitorIds: Array.from(new Set([...(it.monitorIds || []), monitorId])),
            };
          }
          if (prevOwnerId && it.id === prevOwnerId) {
            return {
              ...it,
              monitorIds: Array.from(new Set([...(it.monitorIds || []), monitorId])),
            };
          }
          return it;
        });

        const nextMonitors = prev.monitors.map((m) =>
          m.id === monitorId
            ? { ...m, linkedStageItemId: m.linkedStageItemId || itemId }
            : m
        );

        return {
          ...prev,
          items: nextItems,
          monitors: nextMonitors,
        };
      });
    },
    [setProjectState]
  );

  const setMonitorStageItemLink = useCallback(
    (monitorId: string, itemId: string | undefined) => {
      setProjectState((prev) => {
        const nextMonitors = prev.monitors.map((m) =>
          m.id === monitorId ? { ...m, linkedStageItemId: itemId } : m
        );

        const nextItems = prev.items.map((it) => {
          const cleaned = (it.monitorIds || []).filter((mid) => mid !== monitorId);
          if (itemId && it.id === itemId) {
            return { ...it, monitorIds: [...cleaned, monitorId] };
          }
          if (it.monitorIds?.includes(monitorId)) {
            return { ...it, monitorIds: cleaned.length > 0 ? cleaned : undefined };
          }
          return it;
        });

        return {
          ...prev,
          items: nextItems,
          monitors: nextMonitors,
        };
      });
    },
    [setProjectState]
  );

  const removeMonitorMix = useCallback(
    (id: string) => {
      setProjectState((prev) => {
        const filtered = prev.monitors.filter((m) => m.id !== id);
        const renumbered = filtered.map((m, i) => ({ ...m, mixNumber: i + 1 }));
        const nextItems = prev.items.map((it) => {
          if (!it.monitorIds?.includes(id)) return it;
          const remaining = it.monitorIds.filter((mid) => mid !== id);
          return { ...it, monitorIds: remaining.length > 0 ? remaining : undefined };
        });
        return {
          ...prev,
          items: nextItems,
          monitors: renumbered,
        };
      });
    },
    [setProjectState]
  );

  // Crew & Contacts Actions
  const addContact = useCallback(
    (contact?: Partial<ProductionContact>) => {
      setProjectState((prev) => ({
        ...prev,
        contacts: [
          ...prev.contacts,
          {
            id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            role: contact?.role || 'Production Crew',
            name: contact?.name || '',
            phone: contact?.phone || '',
            email: contact?.email || '',
            department: contact?.department || 'Audio',
            status: contact?.status || 'touring',
            quantity: contact?.quantity || 1,
            notes: contact?.notes || '',
          },
        ],
      }));
    },
    [setProjectState]
  );

  const updateContact = useCallback(
    (index: number, updates: Partial<ProductionContact>) => {
      setProjectState((prev) => ({
        ...prev,
        contacts: prev.contacts.map((c, idx) => (idx === index ? { ...c, ...updates } : c)),
      }));
    },
    [setProjectState]
  );

  const removeContact = useCallback(
    (index: number) => {
      setProjectState((prev) => ({
        ...prev,
        contacts: prev.contacts.filter((_, idx) => idx !== index),
      }));
    },
    [setProjectState]
  );

  return (
    <StageContext.Provider
      value={{
        project,
        activeTab,
        setActiveTab,
        selectedItemId,
        setSelectedItemId,
        gridSnapFeet,
        setGridSnapFeet,
        zoomLevel,
        setZoomLevel,
        customGearDefinitions,
        allGearDefinitions,
        saveCustomGearDefinition,
        deleteCustomGearDefinition,
        addSignalGroup,
        updateSignalGroup,
        removeSignalGroup,
        syncItemSubSnakeToChannels,
        undo,
        redo,
        canUndo,
        canRedo,
        commitHistory,
        updateProject,
        updateStageDimensions,
        loadTemplate,
        resetToBlank,
        importProjectJSON,
        exportProjectJSON,
        addItem,
        updateItem,
        removeItem,
        duplicateItem,
        rotateItem,
        setItemRotation,
        bringForward,
        sendBackward,
        toggleLockItem,
        addChannel,
        updateChannel,
        removeChannel,
        reorderChannels,
        batchAddChannels,
        togglePhantom48V,
        toggleChannelLink,
        setChannelStageItemLink,
        addMonitorMix,
        updateMonitorMix,
        removeMonitorMix,
        toggleMonitorLink,
        setMonitorStageItemLink,
        addContact,
        updateContact,
        removeContact,
      }}
    >
      {children}
    </StageContext.Provider>
  );
};

export const useStage = () => {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStage must be used within a StageProvider');
  }
  return context;
};
