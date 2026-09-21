import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge, PaymentBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import { Download } from 'lucide-react';

type ReportType = 'project-status' | 'production' | 'shipment' | 'payment';

const reportTypes: { id: ReportType; label: string; description: string }[] = [
  { id: 'project-status', label: 'Project Status Report', description: 'Full portfolio status overview' },
  { id: 'production', label: 'Production Report', description: 'Production parts mapping' },
  { id: 'shipment', label: 'Shipment Report', description: 'All shipment tracking data' },
  { id: 'payment', label: 'Payment Report', description: 'Contract and payment status' },
];

function ProjectStatusReport({ isDark }: { isDark: boolean }) {
  const { projects } = useData();
  return (
    <div>
      <h3 className={`text-base font-extrabold mb-4 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Project Status Report</h3>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Project status report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">Project ID</th>
              <th className="text-left py-3 px-3">Project</th>
              <th className="text-left py-3 px-3">Country</th>
              <th className="text-left py-3 px-3">Contract Status</th>
              <th className="text-left py-3 px-3">Design Progress</th>
              <th className="text-left py-3 px-3">Payment</th>
              <th className="text-left py-3 px-3">Delivery Request</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {projects.map(p => (
              <tr key={p.projectId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-mono text-xs font-bold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.project}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.country}</td>
                <td className="py-2.5 px-3"><StatusBadge status={p.contractStatus} /></td>
                <td className="py-2.5 px-3">
                  {p.designProgressPercent != null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <ProgressBar value={p.designProgressPercent} color="forest" size="sm" />
                      </div>
                      <span className={`text-xs font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{Math.round(p.designProgressPercent)}%</span>
                    </div>
                  ) : '—'}
                </td>
                <td className="py-2.5 px-3"><PaymentBadge status={p.paymentStatus} /></td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{p.deliveryRequest || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionReport({ isDark }: { isDark: boolean }) {
  const { productionRecords } = useData();
  return (
    <div>
      <h3 className={`text-base font-extrabold mb-4 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Production Report</h3>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Production report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">Project ID</th>
              <th className="text-left py-3 px-3">Part / Block</th>
              <th className="text-left py-3 px-3">Order Qty</th>
              <th className="text-left py-3 px-3">Finished Qty</th>
              <th className="text-left py-3 px-3">Progress</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {productionRecords.map((p, i) => (
              <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.part}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.orderQtyM2 ? `${p.orderQtyM2} m²` : p.orderQtyKg ? `${p.orderQtyKg} kg` : '—'}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.finishedQtyM2 ? `${p.finishedQtyM2} m²` : p.finishedQtyKg ? `${p.finishedQtyKg} kg` : '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={`font-bold ${isDark ? 'text-[#83CACA]' : 'text-cyan-600'}`}>{Math.round(p.completionPercent || 0)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShipmentReport({ isDark }: { isDark: boolean }) {
  const { shipments } = useData();
  return (
    <div>
      <h3 className={`text-base font-extrabold mb-4 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Shipment Report</h3>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Shipment report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">Project ID</th>
              <th className="text-left py-3 px-3">ETD</th>
              <th className="text-left py-3 px-3">ETA</th>
              <th className="text-left py-3 px-3">FWD</th>
              <th className="text-left py-3 px-3">Status</th>
              <th className="text-left py-3 px-3">Delivery Timeline</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {shipments.map((s, i) => (
              <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{s.projectId}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.etd || '—'}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.eta || '—'}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.fwd || '—'}</td>
                <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.deliveryTimeline || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentReport({ isDark }: { isDark: boolean }) {
  const { projects } = useData();
  const activeProjects = projects.filter(p => p.contractStatus === 'Signed');
  const total = activeProjects.reduce((s, p) => s + (p.totalAmountUSD || 0), 0);
  const balance = activeProjects.reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const received = total - balance;

  return (
    <div>
      <h3 className={`text-base font-extrabold mb-2 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Payment Report</h3>
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Total Contract</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>${total.toLocaleString()}</span>
        </div>
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>Received (Est)</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#3FB984]' : 'text-emerald-600'}`}>${received.toLocaleString()}</span>
        </div>
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#E5C47A]' : 'text-amber-700'}`}>Outstanding</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#D6A84F]' : 'text-amber-600'}`}>${balance.toLocaleString()}</span>
        </div>
        <p className={`text-xs self-center ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Calculated from Master Sheet balances</p>
      </div>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Payment report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">Project ID</th>
              <th className="text-left py-3 px-3">Customer</th>
              <th className="text-left py-3 px-3">Contract Amount</th>
              <th className="text-left py-3 px-3">Advance Paid</th>
              <th className="text-left py-3 px-3">Balance Due</th>
              <th className="text-left py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {activeProjects.map(p => (
              <tr key={p.projectId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.customer}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.totalAmountUSD ? `$${p.totalAmountUSD.toLocaleString()}` : '—'}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{p.advanceUSD ? `$${p.advanceUSD.toLocaleString()}` : '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={(p.balanceUSD || 0) > 0 ? (isDark ? 'text-[#E5C47A] font-bold' : 'text-amber-600 font-bold') : (isDark ? 'text-[#70D0A8] font-semibold' : 'text-emerald-600 font-semibold')}>
                    {p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '$0'}
                  </span>
                </td>
                <td className="py-2.5 px-3"><PaymentBadge status={p.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [activeReport, setActiveReport] = useState<ReportType>('project-status');

  return (
    <div className={`space-y-5 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Executive Reports</p>
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Reports Center</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          All reports reflect actual source data only.
        </p>
      </div>

      {/* Report selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              activeReport === r.id
                ? (isDark ? 'bg-[#C9A86A] text-[#111111] border-[#C9A86A] shadow-xs' : 'bg-[#1688D4] text-white border-[#1688D4] shadow-xs')
                : (isDark ? 'bg-[#151517] text-[#B4B4B8] border-[#303035] hover:bg-[#18181B] hover:text-[#FFFFFF]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900')
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl shadow-card p-5 lg:p-6 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
      >
        {activeReport === 'project-status' && <ProjectStatusReport isDark={isDark} />}
        {activeReport === 'production' && <ProductionReport isDark={isDark} />}
        {activeReport === 'shipment' && <ShipmentReport isDark={isDark} />}
        {activeReport === 'payment' && <PaymentReport isDark={isDark} />}

        <div className={`mt-6 pt-4 border-t flex items-center justify-between flex-wrap gap-3 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
          <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Data source: Real Project Database · {new Date().toLocaleDateString('en-IN')}
          </p>
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3.5 py-1.5 transition-colors shadow-xs cursor-pointer border ${
              isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035] hover:bg-[#222226]' : 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
            }`}
            aria-label="Export report (browser print)"
            onClick={() => window.print()}
          >
            <Download size={13} className={isDark ? 'text-[#85858B]' : 'text-slate-500'} />
            Export / Print
          </button>
        </div>
      </motion.div>
    </div>
  );
}
