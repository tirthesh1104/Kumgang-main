import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useClientAccess } from '../context/ClientAccessContext';
import type { ProjectMaster } from '../data/projectData';
import { X, Check, AlertTriangle, Info } from 'lucide-react';

interface QuickEditDelayModalProps {
  project: ProjectMaster;
  onClose: () => void;
}

export function QuickEditDelayModal({ project, onClose }: QuickEditDelayModalProps) {
  const { theme } = useApp();
  const { updateProjectManual } = useData();
  const { activeSession } = useClientAccess();
  const isDark = theme === 'dark';
  const isClient = activeSession.role === 'Client';

  const [delayReasonCode, setDelayReasonCode] = useState(project.delayReasonCode || 'Client Site Not Ready');
  const [delayReason, setDelayReason] = useState(project.delayReason || '');
  const [expectedResolutionDate, setExpectedResolutionDate] = useState(project.expectedResolutionDate || '');
  const [targetResolutionDate, setTargetResolutionDate] = useState(project.targetResolutionDate || '');
  const [actionOwner, setActionOwner] = useState(project.actionOwner || '');
  const [correctiveAction, setCorrectiveAction] = useState(project.correctiveAction || '');
  const [delayStatus, setDelayStatus] = useState(project.delayStatus || 'Active Risk');
  const [delayRemarks, setDelayRemarks] = useState(project.delayRemarks || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) {
      setErrorMsg('Clients have read-only access and cannot save changes.');
      return;
    }

    const res = updateProjectManual(project.projectId, {
      delayReasonCode: delayReasonCode || null,
      delayReason: delayReason || null,
      expectedResolutionDate: expectedResolutionDate || null,
      targetResolutionDate: targetResolutionDate || null,
      actionOwner: actionOwner || null,
      correctiveAction: correctiveAction || null,
      delayStatus,
      delayRemarks: delayRemarks || null,
    }, activeSession.displayName || 'Project Manager');

    if (res.success) onClose();
    else if (res.errors) setErrorMsg(res.errors.join(', '));
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
              isDark ? 'bg-[#34191B] text-[#F08A8A] border-[#5A292B]' : 'bg-red-500/20 text-red-300 border-red-400/30'
            }`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">UPDATE DELAY & RISK ACTION PLAN</h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                {project.projectId} · {project.project}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Delay Category / Code
              </label>
              <select
                disabled={isClient}
                value={delayReasonCode}
                onChange={e => setDelayReasonCode(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Client Site Not Ready">Client Site Not Ready</option>
                <option value="Payment Hold / Outstanding Balance">Payment Hold / Outstanding Balance</option>
                <option value="Design Drawing Revision">Design Drawing Revision</option>
                <option value="Factory Production Bottleneck">Factory Production Bottleneck</option>
                <option value="Logistics & Port Congestion">Logistics & Port Congestion</option>
                <option value="Raw Material Shortage">Raw Material Shortage</option>
                <option value="Customs / Regulatory Clearance">Customs / Regulatory Clearance</option>
                <option value="Other / Unclassified">Other / Unclassified</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Action Owner
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. Prakash Shinde / Client PM"
                value={actionOwner}
                onChange={e => setActionOwner(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Qualitative Delay Reason
            </label>
            <textarea
              rows={2}
              disabled={isClient}
              value={delayReason}
              onChange={e => setDelayReason(e.target.value)}
              placeholder="Describe the specific cause of delay or bottleneck..."
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Corrective Action Plan
            </label>
            <textarea
              rows={2}
              disabled={isClient}
              value={correctiveAction}
              onChange={e => setCorrectiveAction(e.target.value)}
              placeholder="Resolution steps being executed..."
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Expected Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="15-08-2025"
                value={expectedResolutionDate}
                onChange={e => setExpectedResolutionDate(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Target Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="30-08-2025"
                value={targetResolutionDate}
                onChange={e => setTargetResolutionDate(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Risk Status
              </label>
              <select
                disabled={isClient}
                value={delayStatus}
                onChange={e => setDelayStatus(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-semibold ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Open">Open</option>
                <option value="Active Risk">Active Risk</option>
                <option value="In Resolution">In Resolution</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Additional Remarks
            </label>
            <input
              type="text"
              disabled={isClient}
              value={delayRemarks}
              onChange={e => setDelayRemarks(e.target.value)}
              placeholder="Any additional notes..."
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
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
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
              }`}
            >
              <Check size={14} /> Save Risk Action Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
