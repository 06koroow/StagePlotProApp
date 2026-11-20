/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStage } from '../../context/StageContext';
import { CrewDepartment, CrewProvisionStatus, ProductionContact } from '../../types/stage';
import { Users, Plus, Trash2, Phone, Mail, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

const DEPARTMENTS: CrewDepartment[] = [
  'Audio',
  'Stage / Backline',
  'Lighting',
  'Video',
  'Production',
  'Local Crew',
  'Other',
];

const QUICK_CREW_PRESETS: Array<{
  label: string;
  contact: Partial<ProductionContact>;
}> = [
  {
    label: '+ FOH Engineer',
    contact: { role: 'FOH Sound Engineer', department: 'Audio', status: 'touring', quantity: 1 },
  },
  {
    label: '+ Monitor Engineer',
    contact: { role: 'Monitor Engineer', department: 'Audio', status: 'needed_from_venue', quantity: 1 },
  },
  {
    label: '+ Patch / A2 Tech',
    contact: { role: 'Stage Patch / A2 Tech', department: 'Audio', status: 'needed_from_venue', quantity: 1 },
  },
  {
    label: '+ Stage Manager',
    contact: { role: 'Stage Manager', department: 'Production', status: 'touring', quantity: 1 },
  },
  {
    label: '+ Backline Tech',
    contact: { role: 'Backline / Guitar / Drum Tech', department: 'Stage / Backline', status: 'touring', quantity: 1 },
  },
  {
    label: '+ Lighting Designer',
    contact: { role: 'Lighting Designer / Operator', department: 'Lighting', status: 'needed_from_venue', quantity: 1 },
  },
  {
    label: '+ Local Stagehands (×2)',
    contact: {
      role: 'Local Stagehands (Load-In / Changeover)',
      department: 'Local Crew',
      status: 'needed_from_venue',
      quantity: 2,
      notes: 'Required for load-in, riser build, and load-out.',
    },
  },
  {
    label: '+ Production Manager',
    contact: { role: 'Tour / Production Manager', department: 'Production', status: 'touring', quantity: 1 },
  },
];

export const CrewContactsManager: React.FC = () => {
  const { project, updateProject, addContact, updateContact, removeContact } = useStage();

  const totalHeadcount = project.contacts.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const venueNeededCount = project.contacts
    .filter((c) => c.status === 'needed_from_venue')
    .reduce((sum, c) => sum + (c.quantity || 1), 0);
  const touringCount = project.contacts
    .filter((c) => (c.status || 'touring') === 'touring')
    .reduce((sum, c) => sum + (c.quantity || 1), 0);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 text-slate-200 space-y-6">
      {/* Top Show & Artist Metadata Strip (Appears at Top of Rider & PDF Export) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Show Title &amp; Artist Header Information
              </h2>
              <p className="text-xs text-slate-400">
                Displayed prominently at the top of your Technical Rider and PDF exports
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Artist / Band Name</label>
            <input
              type="text"
              value={project.artistName}
              onChange={(e) => updateProject({ artistName: e.target.value })}
              placeholder="e.g. Artist / Band Name"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Show / Document Title</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject({ title: e.target.value })}
              placeholder="e.g. Touring Stage Plot & Input Patch"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Venue / Tour / Festival</label>
            <input
              type="text"
              value={project.venueOrTour}
              onChange={(e) => updateProject({ venueOrTour: e.target.value })}
              placeholder="e.g. Main Stage / Autumn Tour"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Revision</label>
              <input
                type="text"
                value={project.versionDate || ''}
                onChange={(e) => updateProject({ versionDate: e.target.value })}
                placeholder="Rev 1.0"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Show Date</label>
              <input
                type="date"
                value={project.date}
                onChange={(e) => updateProject({ date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crew Requirements & Production Contacts Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Crew Requirements &amp; Production Contacts
              </h2>
              <p className="text-xs text-slate-400">
                Define touring contacts and local / house crew needed for load-in, soundcheck, and show
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                Total Crew: <strong className="text-white">{totalHeadcount}</strong>
              </span>
              <span className="px-2 py-1 rounded bg-emerald-950/50 border border-emerald-700/40 text-emerald-300">
                Touring: <strong>{touringCount}</strong>
              </span>
              <span className="px-2 py-1 rounded bg-amber-950/50 border border-amber-700/40 text-amber-300">
                Venue Needed: <strong>{venueNeededCount}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                addContact({
                  role: '',
                  name: '',
                  phone: '',
                  email: '',
                  department: 'Audio',
                  status: 'needed_from_venue',
                  quantity: 1,
                })
              }
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Crew / Contact</span>
            </button>
          </div>
        </div>

        {/* Quick-Add Crew Role Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Quick Add:
          </span>
          {QUICK_CREW_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => addContact(preset.contact)}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Contacts & Crew List */}
        {project.contacts.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 bg-slate-950/60 border border-dashed border-slate-800 rounded-lg space-y-2">
            <p>No crew positions or production contacts added yet.</p>
            <p className="text-[11px] text-slate-600">
              Use the quick-add presets above or click &ldquo;Add Crew / Contact&rdquo; to define FOH, Monitors, Stagehands, or Tour Management.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {project.contacts.map((contact, idx) => {
              const status: CrewProvisionStatus = contact.status || 'touring';
              const isVenueNeeded = status === 'needed_from_venue';

              return (
                <div
                  key={contact.id || idx}
                  className={`p-3.5 bg-slate-950 rounded-lg border space-y-3 text-xs transition-colors ${
                    isVenueNeeded
                      ? 'border-amber-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Row: Role + Status + Qty + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5 font-semibold">
                        Role / Crew Position
                      </label>
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => updateContact(idx, { role: e.target.value })}
                        placeholder="e.g. FOH Engineer, Patch Tech, Local Stagehands"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="w-16 shrink-0">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5 font-semibold">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={contact.quantity || 1}
                        onChange={(e) =>
                          updateContact(idx, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-100 font-mono text-center tabular-nums focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="mt-4 p-1.5 rounded bg-slate-900 hover:bg-red-950/60 border border-slate-800 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                      title="Remove crew / contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 2: Department & Crew Provision Status */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Department
                      </label>
                      <select
                        value={contact.department || 'Audio'}
                        onChange={(e) =>
                          updateContact(idx, { department: e.target.value as CrewDepartment })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Crew Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) =>
                          updateContact(idx, {
                            status: e.target.value as CrewProvisionStatus,
                          })
                        }
                        className={`w-full border rounded px-2 py-1 font-medium focus:outline-none ${
                          isVenueNeeded
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                            : status === 'touring'
                            ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <option value="touring">Touring / Confirmed</option>
                        <option value="needed_from_venue">Needed from Venue</option>
                        <option value="tbd">TBD / Advance Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Name, Phone, Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContact(idx, { name: e.target.value })}
                        placeholder={isVenueNeeded ? 'House / Venue Crew' : 'Full Name'}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>Phone</span>
                      </label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => updateContact(idx, { phone: e.target.value })}
                        placeholder="+1 (555) 010-4800"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-0.5">
                        <Mail className="w-2.5 h-2.5" />
                        <span>Email</span>
                      </label>
                      <input
                        type="text"
                        value={contact.email}
                        onChange={(e) => updateContact(idx, { email: e.target.value })}
                        placeholder="crew@production.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: Shift / Responsibilities Notes */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                      Responsibilities / Call Time / Notes
                    </label>
                    <input
                      type="text"
                      value={contact.notes || ''}
                      onChange={(e) => updateContact(idx, { notes: e.target.value })}
                      placeholder="e.g. Required from 14:00 load-in through changeover; fluent on DiGiCo / Dante"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Status footer indicator */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      {isVenueNeeded ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-300/90 font-medium">
                            Venue / Promoter to provide ×{contact.quantity || 1}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300/90 font-medium">
                            {status === 'touring' ? 'Confirmed Touring Crew' : 'To Be Confirmed'}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="font-mono">{contact.department || 'Audio'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
