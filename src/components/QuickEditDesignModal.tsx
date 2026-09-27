import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useClientAccess } from '../context/ClientAccessContext';
import type { DesignSchedule } from '../data/projectData';
import { validateDateChronology } from '../utils/dataValidation';
import { X, Check, Edit3, AlertTriangle, Info } from 'lucide-react';

interface QuickEditDesignModalProps {
  designItem: DesignSchedule;
  onClose: () => void;
}

export function QuickEditDesignModal({ designItem, onClose }: QuickEditDesignModalProps) {
  const { theme } = useApp();
  const { updateDesignSchedule } = useData();
  const { activeSession } = useClientAccess();
  const isDark = theme === 'dark';
  const isClient = activeSession.role === 'Client';

  const [status, setStatus] = useState(designItem.status || 'Planned');
  const [plannedDate, setPlannedDate] = useState(designItem.plannedDate || '');
  const [actualDate, setActualDate] = useState(designItem.actualDate || '');
  const [wallStatus, setWallStatus] = useState(designItem.wallStatus || '');
  const [beamStatus, setBeamStatus] = useState(designItem.beamStatus || '');
  const [slabStatus, setSlabStatus] = useState(designItem.slabStatus || '');
  const [stairStatus, setStairStatus] = useState(designItem.stairStatus || '');
  const [remarks, setRemarks] = useState(designItem.remarks || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) {
      setErrorMsg('Clients have read-only access and cannot save changes.');
      return;
    }

    const valResult = validateDateChronology({
      contractDate: plannedDate,
      productionStart: actualDate
    });

    if (valResult.errors.length > 0) {
      setErrorMsg(valResult.errors.join(' '));
      return;
    }

    setWarnings(valResult.warnings);

    const res = updateDesignSchedule(designItem.designId, {
      status,
      plannedDate: plannedDate || null,
      actualDate: actualDate || null,
      wallStatus: wallStatus || null,
      beamStatus: beamStatus || null,
      slabStatus: slabStatus || null,
      stairStatus: stairStatus || null,
      remarks: remarks || null,
    }, activeSession.displayName || 'Project Manager');

    if (res.success) {
      onClose();
    } else if (res.errors) {
      setErrorMsg(res.errors.join(', '));
    }
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto ${
      isDark ? 'bg-black/80' : 'bg-slate-900/50'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#090909] border-[#202023]' : 'bg-[#0B2239] text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#17272E] text-[#89C9DF] border-[#294651]' : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
            }`}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">QUICK EDIT DESIGN ELEMENT</h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                {designItem.designId} · Project {designItem.projectId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-[#85858B] hover:text-white hover:bg-[#1B1B1F]' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {isClient && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Info size={16} /> Client accounts are restricted to view-only access.
            </div>
          )}

          {errorMsg && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A]' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {warnings.length > 0 && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertTriangle size={16} /> {warnings.join(' ')}
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Element Name
            </label>
            <input
              type="text"
              disabled
              value={designItem.element}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-semibold ${
                isDark ? 'bg-[#18181B] border-[#262629] text-[#85858B]' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Overall Status
              </label>
              <select
                disabled={isClient}
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Planned Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. 15-05-2025"
                value={plannedDate}
                onChange={e => setPlannedDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Actual Completion Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. 20-05-2025 or Done"
                value={actualDate}
                onChange={e => setActualDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Wall Status
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. Approved / In Review"
                value={wallStatus}
                onChange={e => setWallStatus(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Beam Status
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. Done"
                value={beamStatus}
                onChange={e => setBeamStatus(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Slab Status
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. Done"
                value={slabStatus}
                onChange={e => setSlabStatus(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Stair Status
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. Pending"
                value={stairStatus}
                onChange={e => setStairStatus(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Remarks / Notes
            </label>
            <textarea
              rows={2}
              disabled={isClient}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Operational notes on design approvals or revisions..."
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                isDark ? 'bg-[#18181B] text-[#85858B] hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isClient}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isClient
                  ? 'bg-slate-500 opacity-50 cursor-not-allowed text-white'
                  : 'bg-[#1688D4] hover:bg-[#1272B2] text-white shadow-md'
              }`}
            >
              <Check size={14} /> Save Design Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
