import React, { useState } from 'react';
import { X, Upload, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import type {
  DocumentCategory,
  DocumentType,
  ProjectDocument,
  DocumentVersion,
} from '../../types/document';
import {
  CATEGORY_NAMES,
  DOC_TYPE_NAMES,
} from '../../types/document';

interface DocumentUploadModalProps {
  projectId: string;
  initialCategory?: DocumentCategory;
  initialDocType?: DocumentType;
  existingDoc?: ProjectDocument;
  onClose: () => void;
}

export function DocumentUploadModal({
  projectId,
  initialCategory = 'commercial',
  initialDocType = 'sales-quotation-draft',
  existingDoc,
  onClose,
}: DocumentUploadModalProps) {
  const { theme, showNotification } = useApp();
  const { t } = useLanguage();
  const { addProjectDocument, addDocumentVersion, documents } = useData();
  const { activeSession } = useClientAccess();
  const isDark = theme === 'dark';

  const [category, setCategory] = useState<DocumentCategory>(existingDoc ? existingDoc.category : initialCategory);
  const [docType, setDocType] = useState<DocumentType>(existingDoc ? existingDoc.docType : initialDocType);
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available document types filtered by category
  const categoryTypes = (Object.keys(DOC_TYPE_NAMES) as DocumentType[]).filter(
    k => DOC_TYPE_NAMES[k].category === category
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg(t('fileSizeExceeds'));
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file data.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg(t('selectFileToUpload'));
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = new Date().toISOString();
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      const uploaderName = activeSession?.displayName || activeSession?.username || activeSession?.role || 'Administrator';

      const docMeta = DOC_TYPE_NAMES[docType];
      const existingDocMatch = existingDoc || (!docMeta.isMulti
        ? documents.find(d => d.projectId === projectId && d.docType === docType && d.status !== 'archived')
        : undefined);

      if (existingDocMatch) {
        const nextVersionNum = (existingDocMatch.versions?.length || 0) + 1;
        const newVer: DocumentVersion = {
          id: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          versionNumber: nextVersionNum,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type || 'application/octet-stream',
          fileExtension: ext,
          fileDataUrl,
          documentDate: documentDate || null,
          uploadedBy: uploaderName,
          uploadedAt: timestamp,
          status: 'current',
          notes: notes || undefined,
        };

        addDocumentVersion(existingDocMatch.id, newVer, uploaderName);
        showNotification(`New version v${nextVersionNum} uploaded for ${docMeta.name}`);
      } else {
        const docId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const verId = `VER-${Date.now()}-1`;

        const newVer: DocumentVersion = {
          id: verId,
          versionNumber: 1,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type || 'application/octet-stream',
          fileExtension: ext,
          fileDataUrl,
          documentDate: documentDate || null,
          uploadedBy: uploaderName,
          uploadedAt: timestamp,
          status: 'current',
          notes: notes || undefined,
        };

        const newDoc: ProjectDocument = {
          id: docId,
          projectId,
          category,
          docType,
          title: docMeta.name,
          isMultiFile: docMeta.isMulti,
          currentVersionId: verId,
          versions: [newVer],
          createdAt: timestamp,
          updatedAt: timestamp,
          status: 'active',
        };

        addProjectDocument(newDoc, uploaderName);
        showNotification(`Uploaded ${docMeta.name} for project ${projectId}`);
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process document upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto ${
      isDark ? 'bg-black/75' : 'bg-slate-900/50'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-xl w-full flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'border-[#262629] bg-[#111113]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#132338] text-[#38BDF8]' : 'bg-sky-100 text-sky-700'
            }`}>
              <Upload size={18} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {existingDoc ? `${t('uploadNewVersionTitle')} — ${existingDoc.title}` : t('uploadProjectDocument')}
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                Project ID: <span className="font-mono font-bold">{projectId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#262629] text-[#85858B]' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!existingDoc && (
            <>
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  {t('documentCategory')}
                </label>
                <select
                  value={category}
                  onChange={e => {
                    const cat = e.target.value as DocumentCategory;
                    setCategory(cat);
                    const firstType = (Object.keys(DOC_TYPE_NAMES) as DocumentType[]).find(
                      k => DOC_TYPE_NAMES[k].category === cat
                    );
                    if (firstType) setDocType(firstType);
                  }}
                  className={`w-full text-xs font-medium rounded-xl border px-3 py-2.5 outline-none transition-all ${
                    isDark
                      ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#38BDF8]'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
                  }`}
                >
                  {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  {t('documentTypeClassification')}
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as DocumentType)}
                  className={`w-full text-xs font-medium rounded-xl border px-3 py-2.5 outline-none transition-all ${
                    isDark
                      ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#38BDF8]'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
                  }`}
                >
                  {categoryTypes.map(key => (
                    <option key={key} value={key}>
                      {DOC_TYPE_NAMES[key].name} {DOC_TYPE_NAMES[key].isMulti ? '(Multiple Files)' : '(Single Document)'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              <Calendar size={13} /> {t('documentDateLabel')}
            </label>
            <input
              type="date"
              value={documentDate}
              onChange={e => setDocumentDate(e.target.value)}
              className={`w-full text-xs font-medium rounded-xl border px-3 py-2.5 outline-none transition-all ${
                isDark
                  ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#38BDF8]'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              {t('selectFile')} (PDF, DOCX, XLSX, DWG, PNG, JPG)
            </label>
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              selectedFile
                ? (isDark ? 'border-[#3FB984] bg-[#163127]/30' : 'border-emerald-500 bg-emerald-50/50')
                : (isDark ? 'border-[#303035] hover:border-[#46464D] bg-[#18181B]' : 'border-slate-300 hover:border-slate-400 bg-slate-50')
            }`}>
              <input
                type="file"
                id="docFileInput"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.dwg"
                className="hidden"
              />
              <label htmlFor="docFileInput" className="cursor-pointer block">
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <FileText size={24} />
                    <span className="text-xs font-bold">{t('clickOrDragFile')}</span>
                    <span className="text-[10px]">{t('supportedFormats')}</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              {t('versionNotesRemarks')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Revised terms, signed draft, approved drawing v2"
              className={`w-full text-xs font-medium rounded-xl border px-3 py-2 outline-none transition-all ${
                isDark
                  ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#38BDF8]'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#262629]">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                isDark ? 'bg-[#18181B] text-[#B4B4B8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t('cancel')}
            </button>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                !selectedFile || isUploading
                  ? 'opacity-50 cursor-not-allowed bg-slate-400 text-white'
                  : (isDark ? 'bg-[#38BDF8] text-slate-950 font-black hover:bg-[#7dd3fc]' : 'bg-sky-600 text-white hover:bg-sky-700')
              }`}
            >
              <Upload size={14} />
              <span>{isUploading ? (t('savingChanges') || 'Uploading...') : existingDoc ? t('uploadNewVersion') : t('uploadDocument')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
