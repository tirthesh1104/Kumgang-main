import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useClientAccess } from '../context/ClientAccessContext';
import { useLanguage } from '../context/LanguageContext';
import type { PaymentRecord } from '../data/projectData';
import { X, Check, DollarSign, AlertTriangle, Info } from 'lucide-react';

interface RecordPaymentModalProps {
  defaultProjectId?: string;
  onClose: () => void;
}

export function RecordPaymentModal({ defaultProjectId, onClose }: RecordPaymentModalProps) {
  const { theme } = useApp();
  const { projects, recordNewPayment } = useData();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const isClient = activeSession.role === 'Client';

  const signedProjects = projects.filter(p => p.contractStatus === 'Signed');

  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || (signedProjects[0]?.projectId || ''));
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  });
  const [amountUSD, setAmountUSD] = useState<number | string>('');
  const [paymentType, setPaymentType] = useState('Advance');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Received');
  const [remark, setRemark] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProj = projects.find(p => p.projectId === selectedProjectId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) {
      setErrorMsg('Clients have read-only access and cannot record payments.');
      return;
    }

    if (!selectedProjectId) {
      setErrorMsg('Please select a project.');
      return;
    }

    const amt = typeof amountUSD === 'number' ? amountUSD : parseFloat(amountUSD);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    const newPayment: PaymentRecord = {
      paymentId: `PAY-${Date.now()}`,
      projectId: selectedProjectId,
      customer: selectedProj?.customer || 'Customer',
      project: selectedProj?.project || selectedProjectId,
      tower: selectedProj?.block || 'Main Tower',
      description: `${paymentType} (${paymentDate})`,
      quantitySqm: null,
      rateUSD: null,
      amountUSD: amt,
      advancePaidUSD: amt,
      balanceUSD: Math.max(0, (selectedProj?.balanceUSD || 0) - amt),
      advancePercent: null,
      paymentTerm: selectedProj?.paymentTerm || '',
      paymentStatus: paymentStatus || 'Received',
      remark: remark || `Payment received ref: ${paymentReference || 'N/A'}`,
      paymentDate,
      paymentType,
      paymentReference,
    };

    const res = recordNewPayment(newPayment, activeSession.displayName || 'Project Manager');
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
              isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
            }`}>
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white uppercase">{t('recordPayment')}</h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                Record financial transaction & update project balance
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

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              {t('targetProject')}
            </label>
            <select
              disabled={isClient}
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-semibold ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {signedProjects.map(p => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} - {p.project} ({p.customer})
                </option>
              ))}
            </select>
          </div>

          {selectedProj && (
            <div className={`p-3 rounded-lg border text-xs grid grid-cols-3 gap-2 ${
              isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Total:</span>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${selectedProj.totalAmountUSD?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Advance Paid:</span>
                <p className={`font-bold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>${selectedProj.advanceUSD?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Current Balance:</span>
                <p className={`font-bold ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>${selectedProj.balanceUSD?.toLocaleString() || '0'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Payment Amount (USD $)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isClient}
                placeholder="e.g. 50000"
                value={amountUSD}
                onChange={e => setAmountUSD(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-bold ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-[#70D0A8] focus:border-[#1688D4]' : 'bg-white border-slate-300 text-emerald-600'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Payment Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="DD-MM-YYYY"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
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
                Payment Tranche / Stage
              </label>
              <select
                disabled={isClient}
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Advance">Advance Payment</option>
                <option value="2nd Installment">2nd Installment</option>
                <option value="3rd Installment">3rd Installment</option>
                <option value="Before Dispatch">Before Dispatch Settlement</option>
                <option value="Final Settlement">Final Settlement (100%)</option>
                <option value="Other">Other Adjustment</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Status
              </label>
              <select
                disabled={isClient}
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-semibold ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Received 100% payment">Received 100% payment</option>
                <option value="Received">Received / Verified</option>
                <option value="Received Partial">Received Partial</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Bank Reference / Check / Swift No
            </label>
            <input
              type="text"
              disabled={isClient}
              placeholder="e.g. TR-998402 / HDFC-WIRE-01"
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Payment Remarks / Notes
            </label>
            <input
              type="text"
              disabled={isClient}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Operational notes regarding this payment receipt..."
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isClient}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isClient
                  ? 'bg-slate-500 opacity-50 cursor-not-allowed text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <Check size={14} /> {t('confirmRecordPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
