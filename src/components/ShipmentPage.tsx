import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from './ui/StatusBadge';
import type { ShipmentRecord } from '../data/projectData';

function ShipmentJourneyBar({ shipment, isDark }: { shipment: ShipmentRecord; isDark: boolean }) {
  const steps = [
    { key: 'Prepared', value: true },
    { key: 'ETD', value: !!shipment.etd },
    { key: 'ETA', value: !!shipment.eta },
    { key: 'Delivered', value: shipment.status === 'Delivered' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-3">
      {steps.map((step, i) => {
        const done = step.value;
        return (
          <React.Fragment key={step.key}>
            <div className={`flex flex-col items-center gap-1 flex-shrink-0 min-w-[60px] ${
              done ? (isDark ? 'text-[#70D0A8]' : 'text-emerald-600') : (isDark ? 'text-[#85858B]' : 'text-slate-400')
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                done 
                  ? (isDark ? 'border-[#3FB984] bg-[#163127] text-[#70D0A8]' : 'border-emerald-500 bg-emerald-50 text-emerald-700')
                  : (isDark ? 'border-[#303035] bg-[#111113] text-[#85858B]' : 'border-slate-300 bg-slate-100 text-slate-500')
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight">{step.key}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[16px] ${
                done ? (isDark ? 'bg-[#3FB984]' : 'bg-emerald-500') : (isDark ? 'bg-[#303035]' : 'bg-slate-200')
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ShipmentPage() {
  const { theme } = useApp();
  const { projects, shipments } = useData();
  const isDark = theme === 'dark';

  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const pending = shipments.filter(s => s.status === 'Planned').length;

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Shipment Monitoring</p>
        <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Shipment Tracking</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          {shipments.length} shipment records linked to active projects.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: shipments.length, color: isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]' },
          { label: 'Delivered', value: delivered, color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600' },
          { label: 'In Transit', value: inTransit, color: isDark ? 'text-[#89C9DF]' : 'text-sky-600' },
          { label: 'Planned / Pending', value: pending, color: isDark ? 'text-[#E5C47A]' : 'text-amber-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-xl shadow-card p-4 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Per shipment */}
      {shipments.map((shipment, i) => {
        const project = projects.find(p => p.projectId === shipment.projectId);
        const isTransit = shipment.status === 'In Transit';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl shadow-card p-5 border ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
            } ${isTransit ? (isDark ? 'border-l-4 border-l-[#56A9C7]' : 'border-l-4 border-l-[#1688D4]') : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
                  }`}>
                    {shipment.projectId}
                  </span>
                </div>
                <h3 className={`font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{project?.project ?? shipment.projectId}</h3>
                <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project?.customer ?? '—'}</p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4 border-y py-3 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>FWD (Forwarder)</p>
                <p className={`font-mono font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.fwd ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>ETD (Origin)</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.etd ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>ETA (Destination)</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.eta ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Delivery Timeline</p>
                <p className={`font-medium ${!shipment.deliveryTimeline ? (isDark ? 'text-[#85858B]' : 'text-slate-400') : (isDark ? 'text-[#F5F5F3]' : 'text-slate-800')}`}>
                  {shipment.deliveryTimeline || '—'}
                </p>
              </div>
            </div>

            <ShipmentJourneyBar shipment={shipment} isDark={isDark} />
          </motion.div>
        );
      })}

      {/* Projects with no shipment */}
      {projects
        .filter(p => p.contractStatus === 'Signed' && !shipments.some(s => s.projectId === p.projectId))
        .map(project => (
          <div key={project.projectId} className={`p-5 border border-dashed rounded-xl ${
            isDark ? 'bg-[#151517] border-[#303035]' : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
              }`}>{project.projectId}</span>
              <StatusBadge status={project.contractStatus} />
            </div>
            <p className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.project}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>No shipment records mapped.</p>
          </div>
        ))}
    </div>
  );
}
