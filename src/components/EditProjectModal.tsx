import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { validateProjectMaster, type ValidationError } from '../utils/dataValidation';
import type { ProjectMaster } from '../data/projectData';
import {
  Building2, Save, X, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Calendar, Layers, ShieldAlert, ShieldCheck, PackageCheck, FileCheck, Truck, FileSpreadsheet, CheckSquare, Shield, Percent
} from 'lucide-react';

interface EditProjectModalProps {
  projectId: string | null; // null means create new project
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProjectModal({ projectId, onClose, onSuccess }: EditProjectModalProps) {
  const { theme } = useApp();
  const { t } = useLanguage();
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

    // Force Majeure
    forceMajeureApplies: existing?.forceMajeureApplies || 'NA',
    forceMajeureStatus: existing?.forceMajeureStatus || '',
    forceMajeureStartDate: existing?.forceMajeureStartDate || '',
    forceMajeureEndDate: existing?.forceMajeureEndDate || '',
    forceMajeureReason: existing?.forceMajeureReason || '',
    forceMajeureRemarks: existing?.forceMajeureRemarks || '',

    // Packing & Damage
    packingStatus: existing?.packingStatus || '',
    packingDate: existing?.packingDate || '',
    packingCompletedDate: existing?.packingCompletedDate || '',
    packingRemarks: existing?.packingRemarks || '',
    packingResponsibility: existing?.packingResponsibility || '',
    transitDamageInfo: existing?.transitDamageInfo || '',

    // Invoice Authenticity & POD
    invoiceVerificationStatus: existing?.invoiceVerificationStatus || '',
    invoiceAuthenticityStatus: existing?.invoiceAuthenticityStatus || '',
    invoiceReference: existing?.invoiceReference || '',
    podReference: existing?.podReference || '',
    invoiceVerificationDate: existing?.invoiceVerificationDate || '',
    invoiceVerificationRemarks: existing?.invoiceVerificationRemarks || '',

    // Transport Compliance
    transportStatus: existing?.transportStatus || '',
    vehicleNumber: existing?.vehicleNumber || '',
    transporterDetails: existing?.transporterDetails || '',
    driverDetails: existing?.driverDetails || '',
    driverContact: existing?.driverContact || '',
    transportDate: existing?.transportDate || '',
    transportRemarks: existing?.transportRemarks || '',

    // RTO Documents Checklist
    rtoPucStatus: existing?.rtoPucStatus || 'NA',
    rtoPucNumber: existing?.rtoPucNumber || '',
    rtoPucExpiry: existing?.rtoPucExpiry || '',
    rtoPucRemarks: existing?.rtoPucRemarks || '',

    rtoFitnessStatus: existing?.rtoFitnessStatus || 'NA',
    rtoFitnessNumber: existing?.rtoFitnessNumber || '',
    rtoFitnessExpiry: existing?.rtoFitnessExpiry || '',
    rtoFitnessRemarks: existing?.rtoFitnessRemarks || '',

    rtoInsuranceStatus: existing?.rtoInsuranceStatus || 'NA',
    rtoInsuranceNumber: existing?.rtoInsuranceNumber || '',
    rtoInsuranceExpiry: existing?.rtoInsuranceExpiry || '',
    rtoInsuranceRemarks: existing?.rtoInsuranceRemarks || '',

    rtoRcBookStatus: existing?.rtoRcBookStatus || 'NA',
    rtoRcBookNumber: existing?.rtoRcBookNumber || '',
    rtoRcBookExpiry: existing?.rtoRcBookExpiry || '',
    rtoRcBookRemarks: existing?.rtoRcBookRemarks || '',

    rtoDriverLicenseStatus: existing?.rtoDriverLicenseStatus || 'NA',
    rtoDriverLicenseNumber: existing?.rtoDriverLicenseNumber || '',
    rtoDriverLicenseExpiry: existing?.rtoDriverLicenseExpiry || '',
    rtoDriverLicenseRemarks: existing?.rtoDriverLicenseRemarks || '',

    // HSE Violations & Accidents
    hseViolationStatus: existing?.hseViolationStatus || 'No Incident / No Violation',
    accidentStatus: existing?.accidentStatus || 'No Accident',
    hseIncidentDate: existing?.hseIncidentDate || '',
    hseIncidentType: existing?.hseIncidentType || '',
    hseDescription: existing?.hseDescription || '',
    hseSeverity: existing?.hseSeverity || '',
    hseCorrectiveAction: existing?.hseCorrectiveAction || '',
    hseClosureStatus: existing?.hseClosureStatus || 'NA',
    hseClosureDate: existing?.hseClosureDate || '',
    hseRemarks: existing?.hseRemarks || '',

    // Speed Limit & Site Vehicle
    speedLimitCompliance: existing?.speedLimitCompliance || 'Compliant',
    siteSpeedLimit: existing?.siteSpeedLimit || '20 km/h',
    vehicleComplianceStatus: existing?.vehicleComplianceStatus || 'Compliant',
    speedViolationStatus: existing?.speedViolationStatus || 'None',
    speedViolationDate: existing?.speedViolationDate || '',

    // Vehicle Safety Inspection Checklist (7 Points)
    vInspLights: existing?.vInspLights || 'Pass',
    vInspLightsRemarks: existing?.vInspLightsRemarks || '',
    vInspHorn: existing?.vInspHorn || 'Pass',
    vInspHornRemarks: existing?.vInspHornRemarks || '',
    vInspWiper: existing?.vInspWiper || 'Pass',
    vInspWiperRemarks: existing?.vInspWiperRemarks || '',
    vInspBrakes: existing?.vInspBrakes || 'Pass',
    vInspBrakesRemarks: existing?.vInspBrakesRemarks || '',
    vInspIndicators: existing?.vInspIndicators || 'Pass',
    vInspIndicatorsRemarks: existing?.vInspIndicatorsRemarks || '',
    vInspGeneralCondition: existing?.vInspGeneralCondition || 'Pass',
    vInspGeneralConditionRemarks: existing?.vInspGeneralConditionRemarks || '',
    vInspSafetyProtection: existing?.vInspSafetyProtection || 'Pass',
    vInspSafetyProtectionRemarks: existing?.vInspSafetyProtectionRemarks || '',
    vehicleInspectionDate: existing?.vehicleInspectionDate || '',
    vehicleInspectorName: existing?.vehicleInspectorName || '',
    overallVehicleInspectionStatus: existing?.overallVehicleInspectionStatus || 'Pass',

    // Vehicle Parking & Site Instructions
    parkingInstructions: existing?.parkingInstructions || '',
    designatedParkingLocation: existing?.designatedParkingLocation || '',
    siteInstructions: existing?.siteInstructions || '',
    parkingComplianceStatus: existing?.parkingComplianceStatus || 'Compliant',

    // Unattended Vehicle Restriction
    unattendedVehicleRestrictionStatus: existing?.unattendedVehicleRestrictionStatus || 'Restricted',
    unattendedComplianceStatus: existing?.unattendedComplianceStatus || 'Compliant',
    unattendedViolationStatus: existing?.unattendedViolationStatus || 'None',
    unattendedViolationDate: existing?.unattendedViolationDate || '',

    // Tax & TDS
    taxComplianceStatus: existing?.taxComplianceStatus || 'Compliant',
    tdsApplicability: existing?.tdsApplicability || 'Applicable',
    tdsAmount: existing?.tdsAmount ?? null,
    tdsPercentage: existing?.tdsPercentage ?? null,
    tdsStatus: existing?.tdsStatus || '',
    tdsRemarks: existing?.tdsRemarks || '',

    // GST Compliance & Payment
    gstComplianceStatus: existing?.gstComplianceStatus || 'Compliant',
    gstRegistrationDetails: existing?.gstRegistrationDetails || '',
    gstVerificationStatus: existing?.gstVerificationStatus || 'Verified',
    gstAmount: existing?.gstAmount ?? null,
    gstRate: existing?.gstRate ?? null,
    gstPaymentStatus: existing?.gstPaymentStatus || '',
    gstPaymentDate: existing?.gstPaymentDate || '',
    gstPaymentRemarks: existing?.gstPaymentRemarks || '',

    // GSTR-1
    gstr1Status: existing?.gstr1Status || 'Filed',
    gstr1FilingPeriod: existing?.gstr1FilingPeriod || '',
    gstr1FilingDate: existing?.gstr1FilingDate || '',
    gstr1ArnReference: existing?.gstr1ArnReference || '',
    gstr1VerificationStatus: existing?.gstr1VerificationStatus || 'Verified',

    // GSTR-3B
    gstr3bStatus: existing?.gstr3bStatus || 'Filed',
    gstr3bFilingPeriod: existing?.gstr3bFilingPeriod || '',
    gstr3bFilingDate: existing?.gstr3bFilingDate || '',
    gstr3bTaxPaymentStatus: existing?.gstr3bTaxPaymentStatus || 'Paid',
    gstr3bTaxPaymentDate: existing?.gstr3bTaxPaymentDate || '',
    gstr3bArnReference: existing?.gstr3bArnReference || '',
    gstr3bVerificationStatus: existing?.gstr3bVerificationStatus || 'Verified',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleChange = (field: keyof ProjectMaster, value: any) => {
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
    onClose();
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
                {isNew ? t('addNewProject') : `${t('updateProjectData')} — ${formData.projectId}`}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isNew ? t('registerNewProjectDesc') : `${t('modifyingProjectParams')} for ${formData.project || formData.projectId}`}
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
                {t('section1ProjectInfo')}
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
                {t('section2ProgressQuantities')}
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
                {t('section3CommercialFinancial')}
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
                {t('section4KeyDatesSchedules')}
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

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Payment Received Date against Shell Plan</label>
                <input
                  type="text"
                  value={formData.paymentReceivedShellPlanDate || ''}
                  onChange={e => handleChange('paymentReceivedShellPlanDate', e.target.value)}
                  placeholder="DD-MM-YYYY / Date"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>ETA Location / Port</label>
                <input
                  type="text"
                  value={formData.etaLocation || ''}
                  onChange={e => handleChange('etaLocation', e.target.value)}
                  placeholder="e.g. Nhava Sheva / ICD Bangalore"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Delivery Timeline</label>
                <input
                  type="text"
                  value={formData.deliveryTimeline || ''}
                  onChange={e => handleChange('deliveryTimeline', e.target.value)}
                  placeholder="e.g. 11-12 weeks from Shell Plan"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Actual Total Weeks</label>
                <input
                  type="text"
                  value={formData.actualTotalWeeks ?? ''}
                  onChange={e => handleChange('actualTotalWeeks', e.target.value)}
                  placeholder="e.g. 13 Weeks"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Factory Visit Sub-Section */}
            <div className={`border-t pt-3 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Factory Visit Type</label>
                <select
                  value={formData.factoryVisitType || 'NA'}
                  onChange={e => handleChange('factoryVisitType', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="NA">NA (Not Applicable)</option>
                  <option value="Mock Up">Mock Up</option>
                  <option value="Inspection">Factory Inspection</option>
                  <option value="Client Visit">Client Visit</option>
                </select>
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Visit Persons Count</label>
                <input
                  type="number"
                  value={formData.factoryVisitPersons ?? ''}
                  onChange={e => handleChange('factoryVisitPersons', e.target.value ? parseInt(e.target.value, 10) : null)}
                  placeholder="Total Persons"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Factory Visit Planned Date</label>
                <input
                  type="text"
                  value={formData.factoryVisitPlannedDate || ''}
                  onChange={e => handleChange('factoryVisitPlannedDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]'
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Factory Visit Completed Date</label>
                <input
                  type="text"
                  value={formData.factoryVisitCompletedDate || ''}
                  onChange={e => handleChange('factoryVisitCompletedDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
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

          {/* SECTION 5: DESIGN ELEMENTS */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Layers size={16} className={isDark ? 'text-[#C9A86A]' : 'text-indigo-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section5DesignElements')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Typical Floor Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Typical Floor Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.typicalFloorArea ?? ''}
                    onChange={e => handleChange('typicalFloorArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.typicalFloorAreaUom || 'Sqm'}
                    onChange={e => handleChange('typicalFloorAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Basement Floor Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Basement Floor Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.basementFloorArea ?? ''}
                    onChange={e => handleChange('basementFloorArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.basementFloorAreaUom || 'Sqm'}
                    onChange={e => handleChange('basementFloorAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Change Floor Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Change Floor Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.changeFloorArea ?? ''}
                    onChange={e => handleChange('changeFloorArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.changeFloorAreaUom || 'Sqm'}
                    onChange={e => handleChange('changeFloorAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Plumbing Groove Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Plumbing Groove Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.plumbingGrooveArea ?? ''}
                    onChange={e => handleChange('plumbingGrooveArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.plumbingGrooveAreaUom || 'Sqm'}
                    onChange={e => handleChange('plumbingGrooveAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Elevation Groove Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Elevation Groove Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.elevationGrooveArea ?? ''}
                    onChange={e => handleChange('elevationGrooveArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.elevationGrooveAreaUom || 'Sqm'}
                    onChange={e => handleChange('elevationGrooveAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Total Payable Area */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Total Payable Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.totalPayableArea ?? ''}
                    onChange={e => handleChange('totalPayableArea', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Value"
                    className={`flex-1 p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                  <select
                    value={formData.totalPayableAreaUom || 'Sqm'}
                    onChange={e => handleChange('totalPayableAreaUom', e.target.value)}
                    className={`p-2.5 border rounded-lg outline-none transition-all ${
                      isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Sqm">Sqm</option>
                    <option value="PCS">PCS</option>
                    <option value="Nos">Nos</option>
                  </select>
                </div>
              </div>

              {/* Area Approved Date */}
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Area Approved Date</label>
                <input
                  type="text"
                  value={formData.areaApprovedDate || ''}
                  onChange={e => handleChange('areaApprovedDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: FORCE MAJEURE (8.1) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <ShieldAlert size={16} className={isDark ? 'text-[#E5C47A]' : 'text-amber-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section6ForceMajeure')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Force Majeure Applicability</label>
                <select
                  value={formData.forceMajeureApplies || 'NA'}
                  onChange={e => handleChange('forceMajeureApplies', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="NA">NA (Not Applicable)</option>
                  <option value="Yes">Yes (Invoked)</option>
                  <option value="No">No (Normal Operations)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Start Date</label>
                <input
                  type="date"
                  value={formData.forceMajeureStartDate || ''}
                  onChange={e => handleChange('forceMajeureStartDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>End Date</label>
                <input
                  type="date"
                  value={formData.forceMajeureEndDate || ''}
                  onChange={e => handleChange('forceMajeureEndDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Reason / Trigger Event</label>
                <input
                  type="text"
                  value={formData.forceMajeureReason || ''}
                  onChange={e => handleChange('forceMajeureReason', e.target.value)}
                  placeholder="e.g. Natural Calamity / Unforeseen Interruption"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Force Majeure Remarks</label>
                <input
                  type="text"
                  value={formData.forceMajeureRemarks || ''}
                  onChange={e => handleChange('forceMajeureRemarks', e.target.value)}
                  placeholder="Additional contractual notes..."
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: PACKING & DAMAGE RESPONSIBILITY (8.2) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <PackageCheck size={16} className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section7PackingDamage')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Packing Status</label>
                <input
                  type="text"
                  value={formData.packingStatus || ''}
                  onChange={e => handleChange('packingStatus', e.target.value)}
                  placeholder="e.g. Standard Export Packing / Completed"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Packing Date</label>
                <input
                  type="date"
                  value={formData.packingDate || ''}
                  onChange={e => handleChange('packingDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Packing Responsibility</label>
                <input
                  type="text"
                  value={formData.packingResponsibility || ''}
                  onChange={e => handleChange('packingResponsibility', e.target.value)}
                  placeholder="e.g. Supplier / Transporter Insured"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Transit Damage / Packing Notes</label>
              <textarea
                rows={2}
                value={formData.transitDamageInfo || ''}
                onChange={e => handleChange('transitDamageInfo', e.target.value)}
                placeholder="Details of transit insurance, damage claims, or packing specifications..."
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                  isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* SECTION 8: INVOICE AUTHENTICITY & POD (8.3) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <FileCheck size={16} className={isDark ? 'text-[#89C9DF]' : 'text-sky-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section8InvoicePod')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Invoice Verification Status</label>
                <select
                  value={formData.invoiceVerificationStatus || 'Verified'}
                  onChange={e => handleChange('invoiceVerificationStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="Verified">Verified & Authenticated</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Discrepancy">Discrepancy Flagged</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Invoice Reference No.</label>
                <input
                  type="text"
                  value={formData.invoiceReference || ''}
                  onChange={e => handleChange('invoiceReference', e.target.value)}
                  placeholder="e.g. INV-2025-001"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Proof of Delivery (POD) Ref</label>
                <input
                  type="text"
                  value={formData.podReference || ''}
                  onChange={e => handleChange('podReference', e.target.value)}
                  placeholder="e.g. POD-88231-ACK"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Verification Date</label>
                <input
                  type="date"
                  value={formData.invoiceVerificationDate || ''}
                  onChange={e => handleChange('invoiceVerificationDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 9: TRANSPORT COMPLIANCE (8.4) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Truck size={16} className={isDark ? 'text-[#C9A86A]' : 'text-indigo-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section9TransportCompliance')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber || ''}
                  onChange={e => handleChange('vehicleNumber', e.target.value)}
                  placeholder="e.g. KA-01-EQ-9921"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Transporter Details</label>
                <input
                  type="text"
                  value={formData.transporterDetails || ''}
                  onChange={e => handleChange('transporterDetails', e.target.value)}
                  placeholder="Transporter Name & Agency"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Driver Details</label>
                <input
                  type="text"
                  value={formData.driverDetails || ''}
                  onChange={e => handleChange('driverDetails', e.target.value)}
                  placeholder="Driver Full Name"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Driver Contact Number</label>
                <input
                  type="tel"
                  value={formData.driverContact || ''}
                  onChange={e => handleChange('driverContact', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 10: RTO DOCUMENTS CHECKLIST (8.5) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <CheckSquare size={16} className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section10RtoChecklist')}
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { keyPrefix: 'rtoPuc', label: '1. Pollution Under Control (PUC)' },
                { keyPrefix: 'rtoFitness', label: '2. Vehicle Fitness Certificate' },
                { keyPrefix: 'rtoInsurance', label: '3. Commercial Vehicle Insurance' },
                { keyPrefix: 'rtoRcBook', label: '4. Vehicle Registration Certificate (RC Book)' },
                { keyPrefix: 'rtoDriverLicense', label: '5. Commercial Driving License' },
              ].map(item => {
                const statusKey = `${item.keyPrefix}Status` as keyof ProjectMaster;
                const numKey = `${item.keyPrefix}Number` as keyof ProjectMaster;
                const expKey = `${item.keyPrefix}Expiry` as keyof ProjectMaster;
                const remKey = `${item.keyPrefix}Remarks` as keyof ProjectMaster;

                return (
                  <div key={item.keyPrefix} className={`grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-lg border ${
                    isDark ? 'bg-[#151517] border-[#262629]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`block font-bold mb-1 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{item.label}</span>
                      <select
                        value={(formData[statusKey] as string) || 'Valid'}
                        onChange={e => handleChange(statusKey, e.target.value)}
                        className={`w-full p-2 border rounded-md outline-none ${
                          isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      >
                        <option value="Valid">Valid / Verified</option>
                        <option value="Expired">Expired</option>
                        <option value="Missing">Missing</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>

                    <div>
                      <span className={`block font-semibold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>Doc / Certificate No.</span>
                      <input
                        type="text"
                        value={(formData[numKey] as string) || ''}
                        onChange={e => handleChange(numKey, e.target.value)}
                        placeholder="Certificate Number"
                        className={`w-full p-2 border rounded-md outline-none ${
                          isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <span className={`block font-semibold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>Expiry Date</span>
                      <input
                        type="date"
                        value={(formData[expKey] as string) || ''}
                        onChange={e => handleChange(expKey, e.target.value)}
                        className={`w-full p-2 border rounded-md outline-none ${
                          isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <span className={`block font-semibold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>Remarks</span>
                      <input
                        type="text"
                        value={(formData[remKey] as string) || ''}
                        onChange={e => handleChange(remKey, e.target.value)}
                        placeholder="Verification notes"
                        className={`w-full p-2 border rounded-md outline-none ${
                          isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 11: HSE COMPLIANCE & SAFETY (8.6) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <ShieldCheck size={16} className={isDark ? 'text-[#F08A8A]' : 'text-rose-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section11HseSafety')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>HSE Violation Record</label>
                <select
                  value={formData.hseViolationStatus || 'No Incident / No Violation'}
                  onChange={e => handleChange('hseViolationStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="No Incident / No Violation">No Incident / No Violation</option>
                  <option value="Violation Reported">Violation Reported</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Site Accident Record</label>
                <select
                  value={formData.accidentStatus || 'No Accident'}
                  onChange={e => handleChange('accidentStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="No Accident">No Accident Reported</option>
                  <option value="Accident Reported">Accident Reported</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Incident Date (If any)</label>
                <input
                  type="date"
                  value={formData.hseIncidentDate || ''}
                  onChange={e => handleChange('hseIncidentDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Incident Description</label>
                <input
                  type="text"
                  value={formData.hseDescription || ''}
                  onChange={e => handleChange('hseDescription', e.target.value)}
                  placeholder="Details of safety incident..."
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Corrective / Preventive Action</label>
                <input
                  type="text"
                  value={formData.hseCorrectiveAction || ''}
                  onChange={e => handleChange('hseCorrectiveAction', e.target.value)}
                  placeholder="CAPA measures taken..."
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 12: SPEED LIMIT, VEHICLE INSPECTION & SITE OPERATIONS (8.7 - 8.10) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Shield size={16} className={isDark ? 'text-[#E5C47A]' : 'text-amber-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section12SpeedLimitOps')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Site Speed Limit Compliance (8.7)</label>
                <select
                  value={formData.speedLimitCompliance || 'Compliant'}
                  onChange={e => handleChange('speedLimitCompliance', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="Compliant">Compliant (Below Limit)</option>
                  <option value="Violation Reported">Speed Violation Reported</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Designated Parking Location (8.9)</label>
                <input
                  type="text"
                  value={formData.designatedParkingLocation || ''}
                  onChange={e => handleChange('designatedParkingLocation', e.target.value)}
                  placeholder="e.g. Bay 4 - Material Yard"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Unattended Vehicle Rule (8.10)</label>
                <select
                  value={formData.unattendedVehicleRestrictionStatus || 'Restricted'}
                  onChange={e => handleChange('unattendedVehicleRestrictionStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="Restricted">Strictly Restricted / Compliant</option>
                  <option value="Violation Reported">Violation Reported</option>
                  <option value="NA">NA</option>
                </select>
              </div>
            </div>

            {/* 7-Point Vehicle Safety Inspection Sub-Block (8.8) */}
            <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
              <h5 className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-[#C9A86A]' : 'text-slate-800'}`}>
                7-Point Vehicle Safety Inspection Checklist (8.8)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { keyPrefix: 'vInspLights', label: '1. Vehicle Head/Tail Lights' },
                  { keyPrefix: 'vInspHorn', label: '2. Horn & Reverse Alarm' },
                  { keyPrefix: 'vInspWiper', label: '3. Windshield Wipers' },
                  { keyPrefix: 'vInspBrakes', label: '4. Brakes & Hand Brake' },
                  { keyPrefix: 'vInspIndicators', label: '5. Side Turn Indicators' },
                  { keyPrefix: 'vInspGeneralCondition', label: '6. General Physical Condition' },
                  { keyPrefix: 'vInspSafetyProtection', label: '7. Safety Protection Guards' },
                ].map(item => {
                  const statusKey = `${item.keyPrefix}` as keyof ProjectMaster;
                  return (
                    <div key={item.keyPrefix} className="p-2 border rounded-md bg-white/5 border-slate-700">
                      <span className={`block font-semibold mb-1 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{item.label}</span>
                      <select
                        value={(formData[statusKey] as string) || 'Pass'}
                        onChange={e => handleChange(statusKey, e.target.value)}
                        className={`w-full p-1.5 border rounded outline-none text-xs ${
                          isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      >
                        <option value="Pass">Pass / Ok</option>
                        <option value="Fail">Fail / Defective</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 13: COMMERCIAL TAX & TDS COMPLIANCE (Section 9) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <Percent size={16} className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section13CommercialTaxTds')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>TDS Applicability</label>
                <select
                  value={formData.tdsApplicability || 'Applicable'}
                  onChange={e => handleChange('tdsApplicability', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="Applicable">Applicable</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>TDS Rate (%)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.tdsPercentage ?? ''}
                  onChange={e => handleChange('tdsPercentage', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 2%"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>TDS Deducted Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.tdsAmount ?? ''}
                  onChange={e => handleChange('tdsAmount', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Amount"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>TDS Status</label>
                <input
                  type="text"
                  value={formData.tdsStatus || ''}
                  onChange={e => handleChange('tdsStatus', e.target.value)}
                  placeholder="e.g. Deposited / Form 16A Issued"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 14: GST COMPLIANCE & PAYMENT CONDITIONS (Sections 10 & 11) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <FileSpreadsheet size={16} className={isDark ? 'text-[#89C9DF]' : 'text-sky-600'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section14GstPaymentConditions')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GST Compliance Status</label>
                <select
                  value={formData.gstComplianceStatus || 'Compliant'}
                  onChange={e => handleChange('gstComplianceStatus', e.target.value)}
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <option value="Compliant">Compliant / Verified</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="NA">NA</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GSTIN Details</label>
                <input
                  type="text"
                  value={formData.gstRegistrationDetails || ''}
                  onChange={e => handleChange('gstRegistrationDetails', e.target.value)}
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GST Rate (%)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.gstRate ?? ''}
                  onChange={e => handleChange('gstRate', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 18%"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GST Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.gstAmount ?? ''}
                  onChange={e => handleChange('gstAmount', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="GST Amount"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    isDark ? 'border-[#303035] bg-[#151517] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SECTION 15: GSTR-1 & GSTR-3B STATUTORY FILING (Sections 12 & 13) */}
          <div className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center gap-2 border-b pb-2 ${isDark ? 'border-[#202023]' : 'border-slate-100'}`}>
              <FileCheck size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
                {t('section15GstrFilings')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GSTR-1 Sub-Box */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                <h5 className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-[#89C9DF]' : 'text-sky-700'}`}>
                  GSTR-1 Outward Return (Section 12)
                </h5>

                <div>
                  <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GSTR-1 Status</label>
                  <select
                    value={formData.gstr1Status || 'Filed'}
                    onChange={e => handleChange('gstr1Status', e.target.value)}
                    className={`w-full p-2 border rounded-md outline-none text-xs ${
                      isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Filed">Filed</option>
                    <option value="Pending">Pending</option>
                    <option value="NA">NA</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>ARN Reference No.</label>
                  <input
                    type="text"
                    value={formData.gstr1ArnReference || ''}
                    onChange={e => handleChange('gstr1ArnReference', e.target.value)}
                    placeholder="GSTR-1 ARN Reference"
                    className={`w-full p-2 border rounded-md outline-none text-xs ${
                      isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* GSTR-3B Sub-Box */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                <h5 className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>
                  GSTR-3B Tax Return & Payment (Section 13)
                </h5>

                <div>
                  <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>GSTR-3B Status</label>
                  <select
                    value={formData.gstr3bStatus || 'Filed'}
                    onChange={e => handleChange('gstr3bStatus', e.target.value)}
                    className={`w-full p-2 border rounded-md outline-none text-xs ${
                      isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="Filed">Filed & Tax Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="NA">NA</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>ARN Reference No.</label>
                  <input
                    type="text"
                    value={formData.gstr3bArnReference || ''}
                    onChange={e => handleChange('gstr3bArnReference', e.target.value)}
                    placeholder="GSTR-3B ARN Reference"
                    className={`w-full p-2 border rounded-md outline-none text-xs ${
                      isDark ? 'border-[#303035] bg-[#111113] text-[#F5F5F3]' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Footer Actions */}
          <div className={`flex items-center justify-between border-t pt-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-[#B4B4B8] hover:text-[#FFFFFF]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="btn-primary"
            >
              {saveState === 'saving' ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-white flex-shrink-0" />
                  <span>{t('savingChanges')}</span>
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 size={15} className="text-white animate-in zoom-in-75 duration-200 flex-shrink-0" />
                  <span>{t('saved')}</span>
                </>
              ) : (
                <>
                  <Save size={15} className="btn-icon-edit flex-shrink-0" />
                  <span>{t('saveRecalculateMetrics')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
