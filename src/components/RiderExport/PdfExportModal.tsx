/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PdfExportOptions } from '../../utils/pdfExporter';
import { Download, FileText, Columns, Rows, Loader2 } from 'lucide-react';

interface PdfExportModalProps {
  initialOptions?: Partial<PdfExportOptions>;
  isExporting: boolean;
  onConfirm: (options: PdfExportOptions) => void;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  initialOptions,
  isExporting,
  onConfirm,
  onClose,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    initialOptions?.orientation || 'landscape'
  );
  const [pageBreakBetweenPlotAndChannels, setPageBreakBetweenPlotAndChannels] = useState<boolean>(
    initialOptions?.pageBreakBetweenPlotAndChannels ?? false
  );
  const [paperFormat, setPaperFormat] = useState<'letter' | 'a4'>(
    initialOptions?.paperFormat || 'letter'
  );
  const [includeStageDimensions, setIncludeStageDimensions] = useState<boolean>(
    initialOptions?.includeStageDimensions ?? true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      orientation,
      pageBreakBetweenPlotAndChannels,
      paperFormat,
      includeStageDimensions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full shadow-2xl text-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Export Technical Rider PDF</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Options Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* 1. Page Orientation */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              1. Page Orientation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                  orientation === 'landscape'
                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="mt-0.5 w-8 h-6 rounded-xs border-2 border-current flex items-center justify-center shrink-0">
                  <Columns className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Horizontal (Landscape)</div>
                  <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                    Wide layout ideal for stage plots &amp; side-by-side patch tables.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                  orientation === 'portrait'
                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="mt-0.5 w-6 h-8 rounded-xs border-2 border-current flex items-center justify-center shrink-0">
                  <Rows className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Portrait (Vertical)</div>
                  <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                    Vertical binder &amp; clipboard format for advance packets.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Page Break Between Channel List & Stage Plot */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              2. Channel List &amp; Stage Plot Pagination
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setPageBreakBetweenPlotAndChannels(true)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                  pageBreakBetweenPlotAndChannels
                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">
                    Insert Page Break Between Stage Plot &amp; Channel List
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Stage Plot fills Page 1 cleanly; Input Channel List starts fresh on Page 2, followed by Monitors, Notes &amp; Crew Contacts.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] shrink-0 border ${
                    pageBreakBetweenPlotAndChannels
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  Separate
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPageBreakBetweenPlotAndChannels(false)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                  !pageBreakBetweenPlotAndChannels
                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">
                    Combined Sheet (No Page Break Between Channel List &amp; Stage Plot)
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Places the Show Header, Input Patch List, and Stage Plot together on Page 1. Overflow channels, notes &amp; crew contacts flow cleanly to Page 2+ so no text is ever cut off.
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] shrink-0 border ${
                    !pageBreakBetweenPlotAndChannels
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  Combined
                </span>
              </button>
            </div>
          </div>

          {/* 3. Stage Dimensions & Paper Size */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-300">Stage Dimensions</div>
                <div className="text-[10px] text-slate-500">
                  Show or hide width/depth arrows, foot rulers &amp; stage size header
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIncludeStageDimensions(true)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    includeStageDimensions
                      ? 'bg-slate-800 border-sky-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Show
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeStageDimensions(false)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    !includeStageDimensions
                      ? 'bg-slate-800 border-sky-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hide
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Paper Size</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaperFormat('letter')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    paperFormat === 'letter'
                      ? 'bg-slate-800 border-sky-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  US Letter
                </button>
                <button
                  type="button"
                  onClick={() => setPaperFormat('a4')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                    paperFormat === 'a4'
                      ? 'bg-slate-800 border-sky-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ISO A4
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500">
            Empty channels omitted · Uniform row heights
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
