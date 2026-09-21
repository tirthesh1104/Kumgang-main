import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { validateProjectMaster, type ValidationError } from '../utils/dataValidation';
import type { ProjectMaster } from '../data/projectData';
import {
  Building2, Save, X, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Calendar, Layers, ShieldAlert
} from 'lucide-react';

interface EditProjectModalProps {
  projectId: string | null; // null means create new project
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProjectModal({ projectId, onClose, onSuccess }: EditProjectModalProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { getProjectById, updateProjectManual, addProjectManual } = useData();

  const isNew = !projectId;
  const existing = projectId ? getProjectById(projectId) : undefined;

  const [formData, setFormData] = useState<Partial<ProjectMaster>>({
    projectId: existing?.projectId || '',
    country: existing?.country || 'India',
    customer: existing?.customer || '',
    project: existing?.project || '',
    block: existing?.block || '',
    contractDate: existing?.contractDate || '',
    contractStatus: existing?.contractStatus || 'Signed',
    contractQtyM2: existing?.contractQtyM2 ?? null,
    contractWeightTons: existing?.contractWeightTons ?? null,
    actualDesignQtyM2: existing?.actualDesignQtyM2 ?? null,
    actualDesignWeightTons: existing?.actualDesignWeightTons ?? null,
    designProgressPercent: existing?.designProgressPercent ?? null,
    pricePerM2USD: existing?.pricePerM2USD ?? null,
    totalAmountUSD: existing?.totalAmountUSD ?? null,
    advanceUSD: existing?.advanceUSD ?? null,
    balanceUSD: existing?.balanceUSD ?? null,
    shellPlanConfirmation: existing?.shellPlanConfirmation || '',
    mdCompletion: existing?.mdCompletion || '',
    productionStart: existing?.productionStart || '',
    productionComplete: existing?.productionComplete || '',
    deliveryRequest: existing?.deliveryRequest || '',
    loadingDate: existing?.loadingDate || '',
    etd: existing?.etd || '',
    eta: existing?.eta || '',
    fwd: existing?.fwd || '',
    paymentTerm: existing?.paymentTerm || '',
    paymentStatus: existing?.paymentStatus || '',
    incoterm: existing?.incoterm || '',
    remark: existing?.remark || '',
    vendorCompany: existing?.vendorCompany || '',
    materialDescription: existing?.materialDescription || '',
    poNumber: existing?.poNumber || '',
    poDate: existing?.poDate || '',
    billToAddress: existing?.billToAddress || '',
    billToPinCode: existing?.billToPinCode || '',
    shipToAddress: existing?.shipToAddress || '',
    shipToPinCode: existing?.shipToPinCode || '',
    clientContactName: existing?.clientContactName || '',
    clientContactPhone: existing?.clientContactPhone || '',
    clientContactEmail: existing?.clientContactEmail || '',
    poQty: existing?.poQty ?? null,
    rate: existing?.rate ?? null,
    scopeOfTechnicalSupport: existing?.scopeOfTechnicalSupport || '',
    currentSiteStatus: existing?.currentSiteStatus || '',
    siteLocationRegion: existing?.siteLocationRegion || '',
    poRate: existing?.poRate ?? existing?.rate ?? null,
    actualTotalAmount: existing?.actualTotalAmount ?? existing?.totalAmountUSD ?? null,
    actualTotalReceivable: existing?.actualTotalReceivable ?? null,
    actualBalanceAmount: existing?.actualBalanceAmount ?? existing?.balanceUSD ?? null,
    paymentStatusAmount: existing?.paymentStatusAmount ?? null,
    paymentStatusPercent: existing?.paymentStatusPercent ?? null,
    lastPiRaisedDate: existing?.lastPiRaisedDate || '',
    dueDays: existing?.dueDays ?? null,
    poPaymentTerm: existing?.poPaymentTerm || '',
    bgAmount: existing?.bgAmount ?? null,
    bgPercent: existing?.bgPercent ?? null,
    lcAmount: existing?.lcAmount ?? null,
    lcPercent: existing?.lcPercent ?? null,
    bgOpenDate: existing?.bgOpenDate || '',
    bgExpiryDate: existing?.bgExpiryDate || '',
    lcOpenDate: existing?.lcOpenDate || '',
    lcExpiryDate: existing?.lcExpiryDate || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleChange = (field: keyof ProjectMaster, value: any) => {
    setIsDirty(true);
    setSubmitError(null);
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto recalculate balance if total or advance changes
      if (field === 'totalAmountUSD' || field === 'advanceUSD') {
        const tot = field === 'totalAmountUSD' ? value : next.totalAmountUSD;
        const adv = field === 'advanceUSD' ? value : next.advanceUSD;
        if (tot !== null && tot !== undefined && tot !== '') {
          const tNum = typeof tot === 'number' ? tot : parseFloat(tot);
          const aNum = adv ? (typeof adv === 'number' ? adv : parseFloat(adv)) : 0;
          if (!isNaN(tNum)) {
            next.balanceUSD = Math.max(0, Math.round((tNum - (isNaN(aNum) ? 0 : aNum)) * 100) / 100);
          }
        }
      }
      return next;
    });
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate
    const valResult = validateProjectMaster(formData);
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      return;
    }
    setValidationErrors([]);
    setSaveState('saving');

    setTimeout(() => {
      if (isNew) {
        const result = addProjectManual(formData as ProjectMaster, 'Administrator');
        if (!result.success) {
          setSubmitError(result.errors?.join('; ') || 'Failed to add project.');
          setSaveState('idle');
          return;
        }
      } else {
        const result = updateProjectManual(projectId!, formData, 'Administrator');
        if (!result.success) {
          setSubmitError(result.errors?.join('; ') || 'Failed to update project.');
          setSaveState('idle');
          return;
        }
      }

      setSaveState('saved');
      setToastMessage(isNew ? '✓ Project created successfully' : '✓ Project updated successfully');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    }, 400);
  };

  const calculatedBalance = Math.max(0, ((formData.totalAmountUSD || 0) - (formData.advanceUSD || 0)));

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 z-50 overflow-y-auto ${isDark ? 'bg-black/80' : 'bg-slate-900/50'}`}>
      <div className={`border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'bg-[#090909] text-white border-[#202023]' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#2A2419] text-[#C9A86A] border-[#55462C]' : 'bg-sky-500/20 text-sky-400 border-sky-400/30'
            }`}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                {isNew ? 'ADD NEW PROJECT' : `UPDATE PROJECT DATA — ${formData.projectId}`}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isNew ? 'Register a new project into canonical dataset' : `Modifying project parameters for ${formData.project || formData.projectId}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAttempt}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Toast Banner */}
        {toastMessage && (
          <div className={`border-b text-xs font-extrabold p-3 text-center animate-in fade-in ${
            isDark ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toastMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={`flex-1 overflow-y-auto p-6 space-y-6 text-xs ${
          isDark ? 'bg-[#0A0A0A] text-[#F5F5F3]' : 'bg-slate-50 text-slate-800'
        }`}>

          {/* Validation / Submit Errors */}
          {(validationErrors.length > 0 || submitError) && (
            <div className="p-4 bg-[#34191B] border border-[#5A292B] rounded-xl space-y-1 text-[#F08A8A] text-xs font-semibold">
              <div className="flex items-center gap-2 text-[#F08A8A] font-bold">
                <AlertTriangle size={15} /> Please resolve the following errors:
              </div>
              {submitError && <p>• {submitError}</p>}
              {validationErrors.map((err, i) => (
                <p key={i}>• <strong>{err.field}:</strong> {err.message}</p>
              ))}
            </div>
          )}

          {/* SECTION 1: PROJECT INFORMATION */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Building2 size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                1. PROJECT INFORMATION
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Project ID */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Project ID <span className="text-[#E05A5A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isNew}
                  value={formData.projectId || ''}
                  onChange={e => handleChange('projectId', e.target.value)}
                  placeholder="e.g. IND-001"
                  className={`w-full p-2.5 border rounded-lg font-mono font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A] disabled:bg-[#18181B] disabled:text-[#65656B]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4] disabled:bg-slate-100 disabled:text-slate-500'
                  }`}
                />
              </div>

              {/* 2. Vendor Company Name */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Vendor Company Name
                </label>
                <select
                  value={formData.vendorCompany || ''}
                  onChange={e => handleChange('vendorCompany', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                >
                  <option value="">Select Vendor Company</option>
                  <option value="KKV">KKV</option>
                  <option value="KKI">KKI</option>
                  <option value="KKHQ">KKHQ</option>
                </select>
              </div>

              {/* 3. Description of Material */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Description of Material
                </label>
                <select
                  value={formData.materialDescription || ''}
                  onChange={e => handleChange('materialDescription', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                >
                  <option value="">Select Material</option>
                  <option value="Aluform">Aluform</option>
                  <option value="Climbing System">Climbing System</option>
                </select>
              </div>

              {/* 4. Client Name */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Client Name <span className="text-[#E05A5A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer || ''}
                  onChange={e => handleChange('customer', e.target.value)}
                  placeholder="e.g. TOTAL ENVIRONMENT"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 5. Project Name */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Project Name <span className="text-[#E05A5A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.project || ''}
                  onChange={e => handleChange('project', e.target.value)}
                  placeholder="e.g. DBTW"
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 6. PO Number */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  PO Number
                </label>
                <input
                  type="text"
                  value={formData.poNumber || ''}
                  onChange={e => handleChange('poNumber', e.target.value)}
                  placeholder="e.g. PO-99482"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 7. PO Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  PO Date
                </label>
                <input
                  type="date"
                  value={formData.poDate || ''}
                  onChange={e => handleChange('poDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 8. Bill to Address */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Bill to Address
                </label>
                <input
                  type="text"
                  value={formData.billToAddress || ''}
                  onChange={e => handleChange('billToAddress', e.target.value)}
                  placeholder="Billing address"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 9. Bill to PIN Code */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Bill to PIN Code
                </label>
                <input
                  type="text"
                  value={formData.billToPinCode || ''}
                  onChange={e => handleChange('billToPinCode', e.target.value)}
                  placeholder="PIN Code"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 10. Ship to Address */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Ship to Address
                </label>
                <input
                  type="text"
                  value={formData.shipToAddress || ''}
                  onChange={e => handleChange('shipToAddress', e.target.value)}
                  placeholder="Shipping address"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 11. Ship to PIN Code */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Ship to PIN Code
                </label>
                <input
                  type="text"
                  value={formData.shipToPinCode || ''}
                  onChange={e => handleChange('shipToPinCode', e.target.value)}
                  placeholder="PIN Code"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 12. Client Contact Details */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Client Contact Name
                </label>
                <input
                  type="text"
                  value={formData.clientContactName || ''}
                  onChange={e => handleChange('clientContactName', e.target.value)}
                  placeholder="Contact person name"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Client Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.clientContactPhone || ''}
                  onChange={e => handleChange('clientContactPhone', e.target.value)}
                  placeholder="Phone number"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Client Contact Email
                </label>
                <input
                  type="email"
                  value={formData.clientContactEmail || ''}
                  onChange={e => handleChange('clientContactEmail', e.target.value)}
                  placeholder="Email address"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 13. PO Qty */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  PO Qty
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.poQty ?? ''}
                  onChange={e => handleChange('poQty', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Quantity"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 14. Rate */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Rate
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.rate ?? ''}
                  onChange={e => handleChange('rate', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Rate"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 16. Current Site Status */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Current Site Status
                </label>
                <select
                  value={formData.currentSiteStatus || formData.contractStatus || 'Signed'}
                  onChange={e => handleChange('currentSiteStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                >
                  <option value="Signed">Signed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* 17. Site Location / Region */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Site Location / Region
                </label>
                <input
                  type="text"
                  value={formData.siteLocationRegion || formData.country || ''}
                  onChange={e => handleChange('siteLocationRegion', e.target.value)}
                  placeholder="e.g. Bangalore, Karnataka"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 15. Scope of Technical Support */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Scope of Technical Support
                </label>
                <textarea
                  rows={2}
                  value={formData.scopeOfTechnicalSupport || ''}
                  onChange={e => handleChange('scopeOfTechnicalSupport', e.target.value)}
                  placeholder="Scope of technical support provided..."
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] placeholder-[#66666C] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PROGRESS & TECHNICAL QUANTITIES */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Layers size={16} className={isDark ? 'text-[#BBA8E8]' : 'text-purple-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                2. Technical Scope, Quantities & Progress
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Contract Qty (m²)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.contractQtyM2 ?? ''}
                  onChange={e => handleChange('contractQtyM2', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Contract Weight (Tons)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.contractWeightTons ?? ''}
                  onChange={e => handleChange('contractWeightTons', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Design Progress (%)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={formData.designProgressPercent ?? ''}
                  onChange={e => handleChange('designProgressPercent', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#BBA8E8] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-purple-700 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Design Qty (m²)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualDesignQtyM2 ?? ''}
                  onChange={e => handleChange('actualDesignQtyM2', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Design Weight (Tons)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualDesignWeightTons ?? ''}
                  onChange={e => handleChange('actualDesignWeightTons', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Price per m² (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.pricePerM2USD ?? ''}
                  onChange={e => handleChange('pricePerM2USD', e.target.value ? parseFloat(e.target.value) : null)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: COMMERCIAL & FINANCIAL VALUES */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <DollarSign size={16} className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                3. Commercial & Financial Values
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. PO Rate */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>PO Rate</label>
                <input
                  type="number"
                  step="any"
                  value={formData.poRate ?? formData.rate ?? ''}
                  onChange={e => {
                    const val = e.target.value ? parseFloat(e.target.value) : null;
                    handleChange('poRate', val);
                    handleChange('rate', val);
                  }}
                  placeholder="0.00"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 2. Contract Amount */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Contract Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.totalAmountUSD ?? ''}
                  onChange={e => handleChange('totalAmountUSD', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="0.00"
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 3. Actual Total Amount */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Total Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualTotalAmount ?? ''}
                  onChange={e => handleChange('actualTotalAmount', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="0.00"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 4. Actual Total Receivable */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Total Receivable</label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualTotalReceivable ?? formData.advanceUSD ?? ''}
                  onChange={e => {
                    const val = e.target.value ? parseFloat(e.target.value) : null;
                    handleChange('actualTotalReceivable', val);
                    handleChange('advanceUSD', val);
                  }}
                  placeholder="0.00"
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#70D0A8] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-emerald-600 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 5. Actual Balance Amount */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Balance Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.actualBalanceAmount ?? calculatedBalance ?? ''}
                  onChange={e => handleChange('actualBalanceAmount', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="0.00"
                  className={`w-full p-2.5 border rounded-lg font-bold outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#E5C47A] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-amber-700 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 6. Current Payment Status - Amount & % */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Current Payment Status (Amount & %)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.paymentStatusAmount ?? ''}
                    onChange={e => handleChange('paymentStatusAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Amount"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={formData.paymentStatusPercent ?? ''}
                    onChange={e => handleChange('paymentStatusPercent', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="%"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                </div>
              </div>

              {/* 7. Last PI Raised Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Last PI Raised Date</label>
                <input
                  type="date"
                  value={formData.lastPiRaisedDate || ''}
                  onChange={e => handleChange('lastPiRaisedDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 8. Payment Terms */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Payment Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerm || ''}
                  onChange={e => handleChange('paymentTerm', e.target.value)}
                  placeholder="e.g. Advance 20%, 80% before dispatch"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 9. Due Days */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Due Days</label>
                <input
                  type="number"
                  value={formData.dueDays ?? ''}
                  onChange={e => handleChange('dueDays', e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="e.g. 30"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 10. PO Payment Terms */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>PO Payment Terms</label>
                <input
                  type="text"
                  value={formData.poPaymentTerm || ''}
                  onChange={e => handleChange('poPaymentTerm', e.target.value)}
                  placeholder="PO specific payment terms..."
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 11. BG Amount - Amount & % */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  BG Amount (Amount & %)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.bgAmount ?? ''}
                    onChange={e => handleChange('bgAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Amount"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={formData.bgPercent ?? ''}
                    onChange={e => handleChange('bgPercent', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="%"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                </div>
              </div>

              {/* 12. LC Amount - Amount & % */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  LC Amount (Amount & %)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.lcAmount ?? ''}
                    onChange={e => handleChange('lcAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Amount"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={formData.lcPercent ?? ''}
                    onChange={e => handleChange('lcPercent', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="%"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      isDark 
                        ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                    }`}
                  />
                </div>
              </div>

              {/* 13. BG Open Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>BG Open Date</label>
                <input
                  type="date"
                  value={formData.bgOpenDate || ''}
                  onChange={e => handleChange('bgOpenDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 14. BG Expiry Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>BG Expiry Date</label>
                <input
                  type="date"
                  value={formData.bgExpiryDate || ''}
                  onChange={e => handleChange('bgExpiryDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 15. LC Open Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>LC Open Date</label>
                <input
                  type="date"
                  value={formData.lcOpenDate || ''}
                  onChange={e => handleChange('lcOpenDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>

              {/* 16. LC Expiry Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>LC Expiry Date</label>
                <input
                  type="date"
                  value={formData.lcExpiryDate || ''}
                  onChange={e => handleChange('lcExpiryDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-2 focus:ring-[#C9A86A]'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#1688D4]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: KEY DATES & SCHEDULES */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Calendar size={16} className={isDark ? 'text-[#C9A86A]' : 'text-sky-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                4. Schedule & Milestone Dates
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Contract Date</label>
                <input
                  type="text"
                  value={formData.contractDate || ''}
                  onChange={e => handleChange('contractDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Shell Plan Confirm</label>
                <input
                  type="text"
                  value={formData.shellPlanConfirmation || ''}
                  onChange={e => handleChange('shellPlanConfirmation', e.target.value)}
                  placeholder="Done / Date"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>MD Completion</label>
                <input
                  type="text"
                  value={formData.mdCompletion || ''}
                  onChange={e => handleChange('mdCompletion', e.target.value)}
                  placeholder="Done / Date"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Production Start</label>
                <input
                  type="text"
                  value={formData.productionStart || ''}
                  onChange={e => handleChange('productionStart', e.target.value)}
                  placeholder="Done / Date"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Production Complete</label>
                <input
                  type="text"
                  value={formData.productionComplete || ''}
                  onChange={e => handleChange('productionComplete', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>ETD</label>
                <input
                  type="text"
                  value={formData.etd || ''}
                  onChange={e => handleChange('etd', e.target.value)}
                  placeholder="Date / Status"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>ETA</label>
                <input
                  type="text"
                  value={formData.eta || ''}
                  onChange={e => handleChange('eta', e.target.value)}
                  placeholder="Date / Status"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Incoterm</label>
                <input
                  type="text"
                  value={formData.incoterm || ''}
                  onChange={e => handleChange('incoterm', e.target.value)}
                  placeholder="e.g. CIF ICD Bangalore"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Remarks & Notes</label>
              <textarea
                rows={2}
                value={formData.remark || ''}
                onChange={e => handleChange('remark', e.target.value)}
                placeholder="Additional administrative notes..."
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                  isDark 
                    ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] placeholder-[#66666C]'
                    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* UNSAVED CHANGES WARNING SUB-DIALOG */}
          {showConfirmClose && (
            <div className={`p-4 border rounded-xl flex items-center justify-between text-xs font-bold animate-in fade-in ${
              isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className={isDark ? 'text-[#D6A84F]' : 'text-amber-600'} />
                <span>You have unsaved changes. Are you sure you want to discard them?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmClose(false)}
                  className={`px-3 py-1.5 border rounded-lg ${
                    isDark ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-3 py-1.5 rounded-lg ${
                    isDark ? 'bg-[#5B4724] text-[#E5C47A] hover:bg-[#322917]' : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className={`flex items-center justify-between border-t pt-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-[#B4B4B8] hover:text-[#FFFFFF]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="btn-primary"
            >
              {saveState === 'saving' ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-white flex-shrink-0" />
                  <span>Saving Changes...</span>
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 size={15} className="text-white animate-in zoom-in-75 duration-200 flex-shrink-0" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={15} className="btn-icon-edit flex-shrink-0" />
                  <span>SAVE & RECALCULATE METRICS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
