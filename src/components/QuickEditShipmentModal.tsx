import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useClientAccess } from '../context/ClientAccessContext';
import { useLanguage } from '../context/LanguageContext';
import type { ShipmentRecord } from '../data/projectData';
import { validateDateChronology } from '../utils/dataValidation';
import { X, Check, Truck, AlertTriangle, Info } from 'lucide-react';

interface QuickEditShipmentModalProps {
  shipment: ShipmentRecord;
  onClose: () => void;
}

export function QuickEditShipmentModal({ shipment, onClose }: QuickEditShipmentModalProps) {
  const { theme } = useApp();
  const { updateShipmentRecord } = useData();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const isClient = activeSession.role === 'Client';

  const [containerNumber, setContainerNumber] = useState(shipment.containerNumber || '');
  const [billOfLading, setBillOfLading] = useState(shipment.billOfLading || '');
  const [vesselName, setVesselName] = useState(shipment.vesselName || '');
  const [containerStatus, setContainerStatus] = useState(shipment.containerStatus || '');
  const [fwd, setFwd] = useState(shipment.fwd || '');
  const [fwdAssignmentDate, setFwdAssignmentDate] = useState(shipment.fwdAssignmentDate || '');
  const [loadingDate, setLoadingDate] = useState(shipment.loadingDate || '');
  const [etd, setEtd] = useState(shipment.etd || '');
  const [eta, setEta] = useState(shipment.eta || '');
  const [containerSize, setContainerSize] = useState(shipment.containerSize || '');
  const [containerTotal, setContainerTotal] = useState<number | string>(shipment.containerTotal ?? '');
  const [netWeightKg, setNetWeightKg] = useState<number | string>(shipment.netWeightKg ?? '');
  const [grossWeightKg, setGrossWeightKg] = useState<number | string>(shipment.grossWeightKg ?? '');
  const [pcs, setPcs] = useState<number | string>(shipment.pcs ?? '');
  const [bcsQty, setBcsQty] = useState<number | string>(shipment.bcsQty ?? '');
  const [acsQty, setAcsQty] = useState<number | string>(shipment.acsQty ?? '');
  const [kgbhQty, setKgbhQty] = useState<number | string>(shipment.kgbhQty ?? '');
  const [ksbhQty, setKsbhQty] = useState<number | string>(shipment.ksbhQty ?? '');
  const [aluformQty, setAluformQty] = useState<number | string>(shipment.aluformQty ?? '');
  const [status, setStatus] = useState(shipment.status || 'Planned');
  const [shipmentRemarks, setShipmentRemarks] = useState(shipment.shipmentRemarks || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const parseNum = (val: number | string) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) {
      setErrorMsg('Clients have read-only access and cannot save changes.');
      return;
    }

    // Date chronology validation
    const valResult = validateDateChronology({
      loadingDate,
      etd,
      eta,
      fwd: fwdAssignmentDate,
    });

    if (valResult.errors.length > 0) {
      setErrorMsg(valResult.errors.join(' '));
      return;
    }

    setWarnings(valResult.warnings);

    const totalNum = parseNum(containerTotal);

    const res = updateShipmentRecord(shipment.shipmentId, {
      containerNumber: containerNumber || null,
      billOfLading: billOfLading || null,
      vesselName: vesselName || null,
      containerStatus: containerStatus || null,
      fwd: fwd || null,
      fwdAssignmentDate: fwdAssignmentDate || null,
      loadingDate: loadingDate || null,
      etd: etd || null,
      eta: eta || null,
      containerSize: containerSize || null,
      containerTotal: totalNum,
      netWeightKg: parseNum(netWeightKg),
      grossWeightKg: parseNum(grossWeightKg),
      pcs: parseNum(pcs),
      bcsQty: parseNum(bcsQty),
      acsQty: parseNum(acsQty),
      kgbhQty: parseNum(kgbhQty),
      ksbhQty: parseNum(ksbhQty),
      aluformQty: parseNum(aluformQty),
      status,
      shipmentRemarks: shipmentRemarks || null,
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
              isDark ? 'bg-[#17272E] text-[#89C9DF] border-[#294651]' : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
            }`}>
              <Truck size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white uppercase">{t('quickEditShipment')}</h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                Shipment: {shipment.shipmentId} · Project {shipment.projectId}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Container Number
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. TEMU-849201"
                value={containerNumber}
                onChange={e => setContainerNumber(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Bill of Lading (B/L)
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. BL-VN-2025-992"
                value={billOfLading}
                onChange={e => setBillOfLading(e.target.value)}
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
                Vessel Name
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. MAERSK SINGAPORE"
                value={vesselName}
                onChange={e => setVesselName(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Forwarder (FWD)
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. KKI Logistics"
                value={fwd}
                onChange={e => setFwd(e.target.value)}
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
                Container Status
              </label>
              <select
                disabled={isClient}
                value={containerStatus}
                onChange={e => setContainerStatus(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Select Status</option>
                <option value="Loading">Loading</option>
                <option value="In Transit">In Transit</option>
                <option value="At Port">At Port</option>
                <option value="Customs Cleared">Customs Cleared</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                FWD Assignment Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="15-07-2025"
                value={fwdAssignmentDate}
                onChange={e => setFwdAssignmentDate(e.target.value)}
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
                Loading Date
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="20-07-2025"
                value={loadingDate}
                onChange={e => setLoadingDate(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Actual ETD
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="25-07-2025"
                value={etd}
                onChange={e => setEtd(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Actual ETA
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="10-08-2025"
                value={eta}
                onChange={e => setEta(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Container Size
              </label>
              <select
                disabled={isClient}
                value={containerSize}
                onChange={e => setContainerSize(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Select Size</option>
                <option value="40ft HC">40ft HC</option>
                <option value="40ft GP">40ft GP</option>
                <option value="20ft GP">20ft GP</option>
                <option value="Breakbulk">Breakbulk</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Total Containers
              </label>
              <input
                type="number"
                disabled={isClient}
                placeholder="1"
                value={containerTotal}
                onChange={e => setContainerTotal(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                Shipment Status
              </label>
              <select
                disabled={isClient}
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-semibold ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Planned">Planned</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Phase 3 Weights & PCS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
                Net Weight (KG)
              </label>
              <input
                type="number"
                disabled={isClient}
                placeholder="e.g. 18500"
                value={netWeightKg}
                onChange={e => setNetWeightKg(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
                Gross Weight (KG)
              </label>
              <input
                type="number"
                disabled={isClient}
                placeholder="e.g. 19200"
                value={grossWeightKg}
                onChange={e => setGrossWeightKg(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
                PCS
              </label>
              <input
                type="number"
                disabled={isClient}
                placeholder="e.g. 450"
                value={pcs}
                onChange={e => setPcs(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Phase 3 Material-wise Breakdown */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
              Material-wise Dispatch Breakdown ($m^2$)
            </label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <span className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>BCS</span>
                <input
                  type="number"
                  disabled={isClient}
                  placeholder="m²"
                  value={bcsQty}
                  onChange={e => setBcsQty(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>ACS</span>
                <input
                  type="number"
                  disabled={isClient}
                  placeholder="m²"
                  value={acsQty}
                  onChange={e => setAcsQty(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>KGBH</span>
                <input
                  type="number"
                  disabled={isClient}
                  placeholder="m²"
                  value={kgbhQty}
                  onChange={e => setKgbhQty(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>KSBH</span>
                <input
                  type="number"
                  disabled={isClient}
                  placeholder="m²"
                  value={ksbhQty}
                  onChange={e => setKsbhQty(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <span className={`block text-[10px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>Aluform</span>
                <input
                  type="number"
                  disabled={isClient}
                  placeholder="m²"
                  value={aluformQty}
                  onChange={e => setAluformQty(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              Logistics Remarks / Tracking Notes
            </label>
            <textarea
              rows={2}
              disabled={isClient}
              value={shipmentRemarks}
              onChange={e => setShipmentRemarks(e.target.value)}
              placeholder="Customs clearance status, port congestion notes, or transshipment info..."
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
                  : 'bg-[#1688D4] hover:bg-[#1272B2] text-white shadow-md'
              }`}
            >
              <Check size={14} /> {t('saveShipmentLogistics')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
