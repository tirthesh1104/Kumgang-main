import { useState } from 'react';
import {
  FileText, Download, Eye, History, Plus, ChevronDown, ChevronUp, FolderKanban
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import type {
  ProjectDocument,
  DocumentCategory,
  DocumentType,
} from '../../types/document';
import {
  CATEGORY_NAMES,
} from '../../types/document';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentViewerModal } from './DocumentViewerModal';
import { DocumentVersionHistoryModal } from './DocumentVersionHistoryModal';

interface ProjectDocumentsSectionProps {
  projectId: string;
}

export function ProjectDocumentsSection({ projectId }: ProjectDocumentsSectionProps) {
  const { theme } = useApp();
  const { getDocumentsForProject } = useData();
  const { activeSession } = useClientAccess();
  const isDark = theme === 'dark';

  const canUploadDocuments = activeSession?.role === 'Admin' ||
    activeSession?.role === 'ProjectManager' ||
    activeSession?.role === 'Developer' ||
    Boolean(activeSession?.permissions?.editProjectData);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>('commercial');
  const [selectedUploadDocType, setSelectedUploadDocType] = useState<DocumentType>('sales-quotation-draft');
  const [selectedExistingDoc, setSelectedExistingDoc] = useState<ProjectDocument | undefined>(undefined);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [viewingDoc, setViewingDoc] = useState<ProjectDocument | null>(null);
  const [historyDoc, setHistoryDoc] = useState<ProjectDocument | null>(null);

  const [isSectionOpen, setIsSectionOpen] = useState(true);

  // Get uploaded document records for this project
  const projectDocs = getDocumentsForProject(projectId);

  const handleOpenUpload = (cat: DocumentCategory, type: DocumentType, existing?: ProjectDocument) => {
    setSelectedUploadCategory(cat);
    setSelectedUploadDocType(type);
    setSelectedExistingDoc(existing);
    setIsUploadModalOpen(true);
  };

  const handleDownloadFile = (doc: ProjectDocument) => {
    const activeVersion = doc.versions.find(v => v.id === doc.currentVersionId) || doc.versions[0];
    if (!activeVersion?.fileDataUrl) return;

    const a = window.document.createElement('a');
    a.href = activeVersion.fileDataUrl;
    a.download = activeVersion.fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  // Helper to render a document card/slot
  const renderDocSlot = (
    cat: DocumentCategory,
    docType: DocumentType,
    title: string,
    isMulti: boolean = false
  ) => {
    const docs = projectDocs.filter(d => d.category === cat && d.docType === docType);
    const hasDocs = docs.length > 0;

    return (
      <div
        key={docType}
        className={`p-4 rounded-xl border transition-all ${
          isDark
            ? (hasDocs ? 'bg-[#18181B] border-[#303035]' : 'bg-[#121214] border-[#222225]')
            : (hasDocs ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/70 border-slate-200')
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>
              {title}
            </span>
            {isMulti && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-[#1D2B3A] text-[#60A5FA] border-[#2B435E]' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                Multi-file ({docs.length})
              </span>
            )}
          </div>

          {(canUploadDocuments || !hasDocs) && (
            <button
              onClick={() => handleOpenUpload(cat, docType)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border ${
                isDark
                  ? 'bg-[#18181B] text-[#38BDF8] border-[#303035] hover:bg-[#222226]'
                  : 'bg-white text-sky-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <Plus size={12} />
              <span>Upload {isMulti && hasDocs ? 'Another' : ''}</span>
            </button>
          )}
        </div>

        {!hasDocs ? (
          <div className={`p-3 rounded-lg border border-dashed text-center text-xs ${
            isDark ? 'border-[#262629] text-[#85858B] bg-[#151517]' : 'border-slate-200 text-slate-400 bg-slate-100/50'
          }`}>
            No document uploaded yet.
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {docs.map(doc => {
              const activeVer = doc.versions.find(v => v.id === doc.currentVersionId) || doc.versions[0];
              const verCount = doc.versions.length;

              return (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
                    isDark ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className={isDark ? 'text-[#38BDF8]' : 'text-sky-600'} />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {activeVer.fileName}
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                        isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        v{activeVer.versionNumber}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-3 text-[11px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                      <span>Doc Date: <strong>{activeVer.documentDate || 'N/A'}</strong></span>
                      <span>By: {activeVer.uploadedBy}</span>
                      <span>{(activeVer.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer border ${
                        isDark ? 'bg-[#262629] text-white border-[#38383D] hover:bg-[#303035]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                      title="View document metadata or preview"
                    >
                      <Eye size={12} /> View
                    </button>

                    <button
                      onClick={() => handleDownloadFile(doc)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer border ${
                        isDark ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                      }`}
                      title="Download exact uploaded file"
                    >
                      <Download size={12} /> Download
                    </button>

                    <button
                      onClick={() => setHistoryDoc(doc)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer border ${
                        isDark ? 'bg-[#262629] text-[#B4B4B8] border-[#38383D] hover:bg-[#303035]' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="View all version history"
                    >
                      <History size={12} /> {verCount > 1 ? `History (${verCount})` : 'History'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl shadow-card border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
        <div
          onClick={() => setIsSectionOpen(o => !o)}
          className="flex items-center justify-between p-5 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDark ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8]' : 'bg-sky-50 border-sky-200 text-sky-700'
            }`}>
              <FolderKanban size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                Phase 2 File Repository
              </p>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                <span>Project Documents & File Management</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#14291F] text-[#70D0A8] border-[#204E38]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {projectDocs.length} Uploaded
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canUploadDocuments && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUpload('commercial', 'sales-quotation-draft');
                }}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-2xs transition-all ${
                  isDark ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8] font-black hover:bg-[#7dd3fc]' : 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700'
                }`}
              >
                <Plus size={14} /> Upload Document
              </button>
            )}

            {isSectionOpen ? (
              <ChevronUp size={18} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
            ) : (
              <ChevronDown size={18} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
            )}
          </div>
        </div>

        {isSectionOpen && (
          <div className="p-5 pt-0 space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b pb-3 dark:border-[#262629] border-slate-200">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeCategoryFilter === 'all'
                    ? (isDark ? 'bg-[#C9A86A] text-[#111111] border-[#C9A86A]' : 'bg-sky-600 text-white border-sky-600')
                    : (isDark ? 'bg-[#18181B] text-[#B4B4B8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50')
                }`}
              >
                All Categories ({projectDocs.length})
              </button>

              {(['commercial', 'site', 'design'] as DocumentCategory[]).map(cat => {
                const count = projectDocs.filter(d => d.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activeCategoryFilter === cat
                        ? (isDark ? 'bg-[#C9A86A] text-[#111111] border-[#C9A86A]' : 'bg-sky-600 text-white border-sky-600')
                        : (isDark ? 'bg-[#18181B] text-[#B4B4B8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50')
                    }`}
                  >
                    {CATEGORY_NAMES[cat]} ({count})
                  </button>
                );
              })}
            </div>

            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'commercial') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-extrabold tracking-tight uppercase ${isDark ? 'text-[#C9A86A]' : 'text-sky-800'}`}>
                    Commercial Documents
                  </h4>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Draft & Final Quotations, LOI, and Purchase Orders
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderDocSlot('commercial', 'sales-quotation-draft', 'Sales Quotation (Draft)')}
                  {renderDocSlot('commercial', 'sales-quotation-final', 'Sales Quotation (Final)')}
                  {renderDocSlot('commercial', 'loi-draft', 'LOI (Draft)')}
                  {renderDocSlot('commercial', 'loi-final', 'LOI (Final)')}
                  {renderDocSlot('commercial', 'po-draft', 'PO (Draft)')}
                  {renderDocSlot('commercial', 'po-final', 'PO (Final)')}
                </div>
              </div>
            )}

            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'site') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-extrabold tracking-tight uppercase ${isDark ? 'text-[#C9A86A]' : 'text-sky-800'}`}>
                    Project / Site Documents
                  </h4>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Multiple file support for shipping, site completion, AS reports, and letters
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderDocSlot('site', 'shipping-documents', 'Shipping Documents', true)}
                  {renderDocSlot('site', 'site-completion-reports', 'Site Completion Reports', true)}
                  {renderDocSlot('site', 'as-reports', 'AS Reports', true)}
                  {renderDocSlot('site', 'factory-visit-letters', 'Factory Visit Official Letters', true)}
                  {renderDocSlot('site', 'other-documents', 'Other Documents', true)}
                </div>
              </div>
            )}

            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'design') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-extrabold tracking-tight uppercase ${isDark ? 'text-[#C9A86A]' : 'text-sky-800'}`}>
                    Design Documents
                  </h4>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Excel BOM, DWG, Setting DWG, and MD DWG drawings
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {renderDocSlot('design', 'excel-bom', 'Excel BOM')}
                  {renderDocSlot('design', 'dwg', 'DWG Drawing')}
                  {renderDocSlot('design', 'setting-dwg', 'Setting DWG')}
                  {renderDocSlot('design', 'md-dwg', 'MD DWG')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal
          projectId={projectId}
          initialCategory={selectedUploadCategory}
          initialDocType={selectedUploadDocType}
          existingDoc={selectedExistingDoc}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}

      {historyDoc && (
        <DocumentVersionHistoryModal
          document={historyDoc}
          onClose={() => setHistoryDoc(null)}
        />
      )}
    </div>
  );
}
