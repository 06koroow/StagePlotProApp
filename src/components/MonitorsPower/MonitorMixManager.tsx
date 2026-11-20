/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useStage } from '../../context/StageContext';
import { MonitorMix } from '../../types/stage';
import { computeStagePowerSummary } from '../../utils/stageRouting';
import {
  Volume2,
  Zap,
  Plus,
  Trash2,
  Users,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const MonitorMixManager: React.FC = () => {
  const {
    project,
    addMonitorMix,
    updateMonitorMix,
    removeMonitorMix,
    setMonitorStageItemLink,
    updateProject,
    setActiveTab,
    addContact,
    updateContact,
    removeContact,
  } = useStage();

  const powerReqs = project.powerRequirements;
  const stagePowerSummary = useMemo(() => computeStagePowerSummary(project), [project]);

  const handlePowerUpdate = (partial: Partial<typeof powerReqs>) => {
    updateProject({
      powerRequirements: {
        ...powerReqs,
        ...partial,
      },
    });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 text-slate-200 space-y-6">
      {/* Section 1: Monitor Mixes (IEM & Wedges) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Monitor Mixes & Foldback Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Aux routing, in-ear monitors (IEM), and stage floor wedge assignments
              </p>
            </div>
          </div>

          <button
            onClick={() => addMonitorMix()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Monitor Mix</span>
          </button>
        </div>

        {/* Monitor Mixes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3 w-16">Mix #</th>
                <th className="py-2 px-3 min-w-[150px]">Musician / Performer</th>
                <th className="py-2 px-3 w-36">Monitor Type</th>
                <th className="py-2 px-3 min-w-[155px]">Stage Object</th>
                <th className="py-2 px-3 w-36">Stage Location</th>
                <th className="py-2 px-3 w-28">Console Aux Out</th>
                <th className="py-2 px-3 min-w-[200px]">Requested Mix Blend / Content</th>
                <th className="py-2 px-3 w-14 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {project.monitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No monitor mixes configured. Click &ldquo;Add Monitor Mix&rdquo; to create Aux sends.
                  </td>
                </tr>
              ) : (
                project.monitors.map((mix) => {
                  const linkedStageItems = project.items.filter(
                    (it) => mix.linkedStageItemId === it.id || it.monitorIds?.includes(mix.id)
                  );
                  const primaryLinkedId =
                    mix.linkedStageItemId || linkedStageItems[0]?.id || '';
                  const extraLinkedCount = Math.max(0, linkedStageItems.length - 1);

                  return (
                    <tr key={mix.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                        Mix {mix.mixNumber}
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={mix.performer}
                          onChange={(e) => updateMonitorMix(mix.id, { performer: e.target.value })}
                          placeholder="e.g. Lead Vox (Alex)"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={mix.type}
                          onChange={(e) =>
                            updateMonitorMix(mix.id, {
                              type: e.target.value as MonitorMix['type'],
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="floor_wedge">Floor Wedge (Mono)</option>
                          <option value="stereo_iem">Stereo In-Ear (IEM)</option>
                          <option value="mono_iem">Mono In-Ear (IEM)</option>
                          <option value="drum_sub">Drum Sub / Thumper</option>
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <select
                            value={primaryLinkedId}
                            onChange={(e) =>
                              setMonitorStageItemLink(mix.id, e.target.value || undefined)
                            }
                            className={`w-full bg-slate-950 border rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500 ${
                              primaryLinkedId
                                ? 'border-violet-500/40 text-violet-200'
                                : 'border-slate-800 text-slate-400'
                            }`}
                            title={
                              linkedStageItems.length > 1
                                ? `Linked to: ${linkedStageItems
                                    .map((it) => it.performer || it.name)
                                    .join(', ')}`
                                : 'Link this output/mix to a piece on the stage plot'
                            }
                          >
                            <option value="">— Unlinked —</option>
                            {project.items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.performer ? `${it.performer} (${it.name})` : it.name}
                              </option>
                            ))}
                          </select>
                          {extraLinkedCount > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-violet-950/70 border border-violet-500/40 text-violet-300 font-mono text-[10px] shrink-0"
                              title={`Also linked to ${linkedStageItems
                                .slice(1)
                                .map((it) => it.performer || it.name)
                                .join(', ')}`}
                            >
                              +{extraLinkedCount}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={mix.location}
                          onChange={(e) => updateMonitorMix(mix.id, { location: e.target.value })}
                          placeholder="e.g. Downstage Center"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={mix.outputPatch}
                          onChange={(e) => updateMonitorMix(mix.id, { outputPatch: e.target.value })}
                          placeholder="e.g. Aux 1-2 / XLR 1"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={mix.requestedContent}
                          onChange={(e) =>
                            updateMonitorMix(mix.id, { requestedContent: e.target.value })
                          }
                          placeholder="e.g. Lead vox 75%, Acoustic guitar, Snare light"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => removeMonitorMix(mix.id)}
                          className="p-1 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded"
                          title="Delete Mix"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Stage AC Power & Riser Technical Rider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Power Requirements */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Stage AC Power Requirements
              </h3>
              <p className="text-xs text-slate-400">
                Isolated audio circuits & drop box positions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">
                120V Dedicated 20A Drops
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={powerReqs.dedicatedDrops120V}
                onChange={(e) =>
                  handlePowerUpdate({ dedicatedDrops120V: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-mono text-base font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">
                230V European / UK Drops
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={powerReqs.dedicatedDrops230V}
                onChange={(e) =>
                  handlePowerUpdate({ dedicatedDrops230V: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-mono text-base font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">
              Audio Power Isolation & Quad Locations
            </label>
            <textarea
              rows={3}
              value={powerReqs.notes}
              onChange={(e) => handlePowerUpdate({ notes: e.target.value })}
              placeholder="e.g. Dedicated clean technical power on separate transformer from lighting dimmers. Quad drop required at drum riser, guitar stage right, and bass stage left."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Stage Power Tally */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Detected Stage Power Drops ({stagePowerSummary.totalDrops} Total)
              </div>
              {stagePowerSummary.totalDrops > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    handlePowerUpdate({
                      dedicatedDrops120V: stagePowerSummary.total120V,
                      dedicatedDrops230V: stagePowerSummary.total230VPlus,
                    })
                  }
                  className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-semibold flex items-center gap-1"
                  title="Sync 120V and 230V/400V counts from placed stage plot drops"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Counts to Rider</span>
                </button>
              )}
            </div>

            {stagePowerSummary.lines.length === 0 ? (
              <div className="text-[11px] text-slate-500 bg-slate-950 border border-slate-800/80 rounded p-2.5">
                No power drops or powered objects placed on stage yet. Drop Edison, L5-20, CEE, PowerCON, or custom powered gear on the plot to tally automatically.
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded divide-y divide-slate-800/80 text-[11px]">
                {stagePowerSummary.lines.map((line) => (
                  <div
                    key={`${line.connector}_${line.voltage}`}
                    className="px-2.5 py-1.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">
                        {line.connector}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {line.locations.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                      <span className="text-slate-400 text-[10px]">{line.voltage}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                        {line.totalDrops}×
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stage Risers & Backline Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Stage Risers & Backline Specs
              </h3>
              <p className="text-xs text-slate-400">
                Staging platforms, heights, and backline amp specs
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">
              Stage Riser Dimensions & Skirting
            </label>
            <textarea
              rows={2}
              value={powerReqs.stageRiserSpecs}
              onChange={(e) => handlePowerUpdate({ stageRiserSpecs: e.target.value })}
              placeholder="e.g. 8ft x 8ft x 16in carpeted drum riser located at Upstage Center. Black pleated skirting on front and sides."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">
              Band Backline & Touring Gear Notes
            </label>
            <textarea
              rows={2}
              value={powerReqs.backlineNotes}
              onChange={(e) => handlePowerUpdate({ backlineNotes: e.target.value })}
              placeholder="e.g. Bass travels with Ampeg SVT Classic head and 8x10 cab. Guitarist brings 50W Marshall JCM800 combo. Drummer brings breakables only."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Show & Production Crew Contacts Quick Access */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Crew Requirements &amp; Production Contacts ({project.contacts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Define touring contacts and venue crew needed — open the Crew &amp; Contacts tab for full role presets, headcounts &amp; shift notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs text-emerald-300 font-semibold rounded"
            >
              Manage Crew &amp; Contacts
            </button>
            <button
              type="button"
              onClick={() =>
                addContact({
                  role: 'Tour Crew',
                  name: '',
                  phone: '',
                  email: '',
                  department: 'Audio',
                  status: 'needed_from_venue',
                  quantity: 1,
                })
              }
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.contacts.map((contact, idx) => (
            <div
              key={contact.id || idx}
              className="p-3 bg-slate-950 rounded border border-slate-800/90 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => updateContact(idx, { role: e.target.value })}
                  placeholder="e.g. FOH Sound Engineer"
                  className="flex-1 bg-transparent font-semibold text-slate-200 border-b border-slate-800 pb-0.5 focus:outline-none focus:border-emerald-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  className="text-slate-500 hover:text-red-400 p-0.5"
                >
                  ✕
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(idx, { name: e.target.value })}
                  placeholder="Contact Name"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => updateContact(idx, { phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500 text-[11px]"
                />
                <input
                  type="text"
                  value={contact.email}
                  onChange={(e) => updateContact(idx, { email: e.target.value })}
                  placeholder="Email"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500 text-[11px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
