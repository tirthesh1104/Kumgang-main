import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { useLanguage } from '../../context/LanguageContext';
import type { DesignAreaElement } from '../../types/phase3';
import { Layers, Plus, History, Edit2, Save, X } from 'lucide-react';

interface DesignAreaSectionProps {
  projectId: string;
}

export function DesignAreaSection({ projectId }: DesignAreaSectionProps) {
  const { theme } = useApp();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const { getDesignAreaElementsForProject, saveDesignAreaElement } = useData();
  const elements = getDesignAreaElementsForProject(projectId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<DesignAreaElement | null>(null);

  // Form state
  const [tower, setTower] = useState('');
  const [floor, setFloor] = useState('');
  const [modificationArea, setModificationArea] = useState<string>('');
  const [reuseArea, setReuseArea] = useState<string>('');
  const [newSupplyArea, setNewSupplyArea] = useState<string>('');

  const canEdit = activeSession.role === 'Admin' || activeSession.role === 'ProjectManager' || (activeSession.role as string) === 'ADMIN' || (activeSession.role as string) === 'PROJECT_MANAGER';
  const username = activeSession.displayName || 'User';

  const resetForm = () => {
    setTower('');
    setFloor('');
    setModificationArea('');
    setReuseArea('');
    setNewSupplyArea('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (el: DesignAreaElement) => {
    setEditingId(el.id);
    setTower(el.tower);
    setFloor(el.floor);
    setModificationArea(el.modificationArea !== null ? String(el.modificationArea) : '');
    setReuseArea(el.reuseArea !== null ? String(el.reuseArea) : '');
    setNewSupplyArea(el.newSupplyArea !== null ? String(el.newSupplyArea) : '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tower.trim() || !floor.trim()) return;

    const modVal = modificationArea !== '' && !isNaN(Number(modificationArea)) ? Number(modificationArea) : null;
    const reuseVal = reuseArea !== '' && !isNaN(Number(reuseArea)) ? Number(reuseArea) : null;
    const newSupplyVal = newSupplyArea !== '' && !isNaN(Number(newSupplyArea)) ? Number(newSupplyArea) : null;

    const existing = elements.find(el => el.id === editingId);

    const record: DesignAreaElement = {
      id: editingId || `DAE-${Date.now()}`,
      projectId,
      tower: tower.trim(),
      floor: floor.trim(),
      modificationArea: modVal,
      reuseArea: reuseVal,
      newSupplyArea: newSupplyVal,
      lastUpdated: new Date().toISOString(),
      updatedBy: username,
      lastChanges: existing?.lastChanges || [],
    };

    saveDesignAreaElement(record, username);
    resetForm();
  };

  return (
    <div className={`rounded-xl border p-5 shadow-card ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className={isDark ? 'text-cyan-400' : 'text-cyan-600'} size={18} />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('designAreaBreakdown')}
            </h3>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            {t('designAreaDesc')}
          </p>
        </div>

        {canEdit && !isAdding && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isDark ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            }`}
          >
            <Plus size={14} /> {t('addNewEntry')}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && canEdit && (
        <form onSubmit={handleSubmit} className={`p-4 rounded-lg border mb-4 ${isDark ? 'bg-[#1A1A1E] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              {editingId ? t('editEntry') : t('addNewEntry')}
            </h4>
            <button type="button" onClick={resetForm} className={`p-1 rounded cursor-pointer ${isDark ? 'hover:bg-[#262629] text-gray-400' : 'hover:bg-slate-200 text-slate-500'}`}>
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('tower')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tower A"
                value={tower}
                onChange={e => setTower(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                } outline-none`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('floor')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Floor 1-5"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                } outline-none`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('modificationArea')}</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150.5"
                value={modificationArea}
                onChange={e => setModificationArea(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                } outline-none`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('reuseArea')}</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 420.0"
                value={reuseArea}
                onChange={e => setReuseArea(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                } outline-none`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('newSupplyArea')}</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 850.0"
                value={newSupplyArea}
                onChange={e => setNewSupplyArea(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                } outline-none`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={resetForm}
              className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${isDark ? 'bg-[#262629] text-gray-300 hover:bg-[#303035]' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer"
            >
              <Save size={13} /> {editingId ? t('updateEntry') : t('submitEntry')}
            </button>
          </div>
        </form>
      )}

      {/* Tabulated Format */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-xs font-semibold ${isDark ? 'border-[#262629] text-[#85858B] bg-[#111113]' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
              <th className="py-2.5 px-3">{t('tower')}</th>
              <th className="py-2.5 px-3">{t('floor')}</th>
              <th className="py-2.5 px-3 text-right">{t('modificationArea')}</th>
              <th className="py-2.5 px-3 text-right">{t('reuseArea')}</th>
              <th className="py-2.5 px-3 text-right">{t('newSupplyArea')}</th>
              <th className="py-2.5 px-3">{t('lastRefreshed')}</th>
              <th className="py-2.5 px-3 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDark ? 'divide-[#262629] text-white' : 'divide-slate-200 text-slate-800'}`}>
            {elements.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                  {t('noDesignAreaEntries')}
                </td>
              </tr>
            ) : (
              elements.map(el => (
                <tr key={el.id} className={isDark ? 'hover:bg-[#1A1A1E]' : 'hover:bg-slate-50'}>
                  <td className="py-2.5 px-3 font-semibold">{el.tower}</td>
                  <td className="py-2.5 px-3">{el.floor}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {el.modificationArea !== null && el.modificationArea !== undefined ? el.modificationArea.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {el.reuseArea !== null && el.reuseArea !== undefined ? el.reuseArea.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {el.newSupplyArea !== null && el.newSupplyArea !== undefined ? el.newSupplyArea.toLocaleString() : '—'}
                  </td>
                  <td className={`py-2.5 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div>{new Date(el.lastUpdated).toLocaleDateString()}</div>
                    <div className="text-[10px] opacity-75">by {el.updatedBy}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {canEdit && (
                        <button
                          onClick={() => handleStartEdit(el)}
                          title={t('edit')}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-[#262629] text-cyan-400' : 'hover:bg-slate-100 text-cyan-700'}`}
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowHistoryModal(el)}
                        title={t('historyLabel')}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-[#262629] text-amber-400' : 'hover:bg-slate-100 text-amber-600'}`}
                      >
                        <History size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 ${isDark ? 'bg-black/75' : 'bg-slate-900/50'}`}>
          <div className={`border rounded-xl shadow-2xl max-w-lg w-full p-5 ${isDark ? 'bg-[#151517] border-[#303035] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <History className="text-amber-500" size={18} />
                <h4 className="font-bold text-sm">
                  {t('historyLabel')} — {showHistoryModal.tower}, {showHistoryModal.floor}
                </h4>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto text-xs">
              {(!showHistoryModal.lastChanges || showHistoryModal.lastChanges.length === 0) ? (
                <p className="text-gray-400 italic">No previous changes recorded for this design element.</p>
              ) : (
                showHistoryModal.lastChanges.map((ch, idx) => (
                  <div key={idx} className={`p-2.5 rounded border ${isDark ? 'bg-[#1A1A1E] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between text-[11px] font-semibold mb-1 text-cyan-400">
                      <span>Field: {ch.field}</span>
                      <span className={isDark ? 'text-gray-400' : 'text-slate-500'}>
                        {new Date(ch.updatedAt).toLocaleString()} by {ch.updatedBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-red-400">{ch.oldValue !== null ? `${ch.oldValue} m²` : 'empty'}</span>
                      <span>&rarr;</span>
                      <span className="text-emerald-400 font-semibold">{ch.newValue !== null ? `${ch.newValue} m²` : 'empty'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(null)}
                className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer ${isDark ? 'bg-[#262629] text-white hover:bg-[#303035]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
