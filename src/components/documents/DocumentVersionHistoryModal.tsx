import { useState } from 'react';
import { X, History, Download, Eye, Upload, Calendar, User, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import type { ProjectDocument, DocumentVersion } from '../../types/document';
import { DocumentViewerModal } from './DocumentViewerModal';
import { DocumentUploadModal } from './DocumentUploadModal';

interface DocumentVersionHistoryModalProps {
  document: ProjectDocument;
  onClose: () => void;
}

export function DocumentVersionHistoryModal({ document, onClose }: DocumentVersionHistoryModalProps) {
  const { theme } = useApp();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const [selectedViewVersion, setSelectedViewVersion] = useState<DocumentVersion | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDownload = (ver: DocumentVersion) => {
    if (!ver.fileDataUrl) return;
    const a = window.document.createElement('a');
    a.href = ver.fileDataUrl;
    a.download = ver.fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <>
      <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto ${
        isDark ? 'bg-black/75' : 'bg-slate-900/50'
      }`}>
        <div className={`border rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
            isDark ? 'border-[#262629] bg-[#111113]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-[#132338] text-[#38BDF8]' : 'bg-sky-100 text-sky-700'
              }`}>
                <History size={18} />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('versionHistory')} — {document.title}
                </h3>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  Project ID: <span className="font-mono font-bold">{document.projectId}</span> · Total Versions: {document.versions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border ${
                  isDark ? 'bg-[#38BDF8] text-slate-950 font-black hover:bg-[#7dd3fc]' : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                <Upload size={14} /> {t('uploadNewVersion')}
              </button>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-[#262629] text-[#85858B]' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Versions List */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {document.versions.map((ver) => {
              const isCurrent = ver.id === document.currentVersionId || ver.status === 'current';
              return (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                    isCurrent
                      ? (isDark ? 'bg-[#18231E] border-[#28523F]' : 'bg-emerald-50/70 border-emerald-300')
                      : (isDark ? 'bg-[#18181B] border-[#262629]' : 'bg-slate-50 border-slate-200')
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${
                        isCurrent
                          ? (isDark ? 'bg-[#163127] text-[#70D0A8] border-[#3FB984]' : 'bg-emerald-100 text-emerald-800 border-emerald-400')
                          : (isDark ? 'bg-[#262629] text-[#85858B] border-[#38383D]' : 'bg-slate-200 text-slate-700 border-slate-300')
                      }`}>
                        v{ver.versionNumber} {isCurrent ? t('currentVersion') : t('previousVersion')}
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {ver.fileName}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-4 text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {t('documentDateLabel')}: {ver.documentDate || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> {t('uploadedByLabel')}: {ver.uploadedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {(ver.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {ver.notes && (
                      <p className={`text-xs italic mt-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                        "{ver.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedViewVersion(ver)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer border ${
                        isDark ? 'bg-[#262629] text-white border-[#38383D] hover:bg-[#303035]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Eye size={13} /> {t('viewDocument')}
                    </button>
                    <button
                      onClick={() => handleDownload(ver)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer border ${
                        isDark ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      <Download size={13} /> {t('download')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Embedded View Modal */}
      {selectedViewVersion && (
        <DocumentViewerModal
          document={document}
          version={selectedViewVersion}
          onClose={() => setSelectedViewVersion(null)}
        />
      )}

      {/* Embedded Upload New Version Modal */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          projectId={document.projectId}
          existingDoc={document}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </>
  );
}
