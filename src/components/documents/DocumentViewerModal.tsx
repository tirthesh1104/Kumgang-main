import { X, Download, FileText, Calendar, User, Eye, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ProjectDocument, DocumentVersion } from '../../types/document';

interface DocumentViewerModalProps {
  document: ProjectDocument;
  version?: DocumentVersion;
  onClose: () => void;
}

export function DocumentViewerModal({ document, version, onClose }: DocumentViewerModalProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const activeVersion = version || document.versions.find(v => v.id === document.currentVersionId) || document.versions[0];
  const ext = (activeVersion?.fileExtension || '').toLowerCase();
  const dataUrl = activeVersion?.fileDataUrl || '';

  const isPdf = ext === 'pdf' || activeVersion?.fileType?.includes('pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || activeVersion?.fileType?.startsWith('image/');

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = window.document.createElement('a');
    a.href = dataUrl;
    a.download = activeVersion.fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 z-50 overflow-y-auto ${
      isDark ? 'bg-black/80' : 'bg-slate-900/60'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'border-[#262629] bg-[#111113]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#132338] text-[#38BDF8]' : 'bg-sky-100 text-sky-700'
            }`}>
              <Eye size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{document.title}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  activeVersion.status === 'current'
                    ? (isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                    : (isDark ? 'bg-[#252528] text-[#B4B4B8] border-[#38383D]' : 'bg-slate-100 text-slate-600 border-slate-300')
                }`}>
                  v{activeVersion.versionNumber} {activeVersion.status === 'current' ? '(Current)' : '(Previous)'}
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                File: <span className="font-semibold text-slate-300 dark:text-slate-300">{activeVersion.fileName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border ${
                isDark ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              }`}
              title="Download exact uploaded file"
            >
              <Download size={14} /> Download File
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

        {/* Metadata Bar */}
        <div className={`px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b ${
          isDark ? 'bg-[#18181B] border-[#262629] text-[#B4B4B8]' : 'bg-slate-100/70 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>Document Date: <strong>{activeVersion.documentDate || 'Not Available'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-slate-400" />
            <span>Uploaded By: <strong>{activeVersion.uploadedBy}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-slate-400" />
            <span>Size: <strong>{(activeVersion.fileSize / 1024).toFixed(1)} KB</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="uppercase font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border dark:bg-[#262629] dark:border-[#38383D]">
              {ext || 'FILE'}
            </span>
            <span>Uploaded: {new Date(activeVersion.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Modal Main Content Preview */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[320px] flex items-center justify-center">
          {isPdf && dataUrl ? (
            <iframe
              src={dataUrl}
              className="w-full h-[60vh] rounded-xl border border-slate-300 dark:border-[#303035]"
              title={activeVersion.fileName}
            />
          ) : isImage && dataUrl ? (
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center">
              <img
                src={dataUrl}
                alt={activeVersion.fileName}
                className="max-h-[58vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                isDark ? 'bg-[#262629] text-[#85858B]' : 'bg-slate-100 text-slate-400'
              }`}>
                <AlertTriangle size={28} />
              </div>
              <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Preview not available for this file type ({ext.toUpperCase() || 'DOCUMENT'})
              </h4>
              <p className={`text-xs mb-4 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                DWG CAD drawings, Excel workbooks, and word documents can be downloaded to your device for full viewing in native desktop applications.
              </p>
              <button
                onClick={handleDownload}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer border shadow-sm transition-all ${
                  isDark ? 'bg-[#38BDF8] text-slate-950 font-black hover:bg-[#7dd3fc]' : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                <Download size={15} /> Download {activeVersion.fileName}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
