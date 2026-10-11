import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { useLanguage } from '../../context/LanguageContext';
import type { SitePhotoRecord } from '../../types/phase3';
import {
  Camera,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Save,
  ShieldAlert,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SitePhotosSectionProps {
  projectId: string;
}

export function SitePhotosSection({ projectId }: SitePhotosSectionProps) {
  const { theme } = useApp();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const {
    getProjectById,
    updateProjectManual,
    getSitePhotosForProject,
    addSitePhoto,
    getSiteExecutionInfoForProject,
    updateSiteExecutionInfo,
  } = useData();

  const project = getProjectById(projectId);
  const sitePhotos = getSitePhotosForProject(projectId);
  const siteExec = getSiteExecutionInfoForProject(projectId);

  // RBAC: Clients have read-only view; Internal staff (Admin, ProjectManager, Developer) can edit
  const isClient = activeSession.role === 'Client';
  const canEdit = !isClient;
  const username = activeSession.displayName || activeSession.username || 'User';

  // Site Status & Requirement Date local edit state
  const [siteRequirementDate, setSiteRequirementDate] = useState('');
  const [siteStatus, setSiteStatus] = useState<string>('Ongoing');
  const [remarks, setRemarks] = useState('');
  const [materialScope, setMaterialScope] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');
  const [statusErrorMsg, setStatusErrorMsg] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoRemarks, setPhotoRemarks] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<SitePhotoRecord | null>(null);

  // Synchronize state whenever projectId, project, or siteExec change
  useEffect(() => {
    setSiteRequirementDate(
      siteExec?.siteRequirementDate || project?.siteRequirementDate || ''
    );
    setSiteStatus(
      siteExec?.siteStatus || siteExec?.currentSiteStatus || project?.currentSiteStatus || project?.siteStatus || 'Ongoing'
    );
    setRemarks(
      siteExec?.remarks || siteExec?.siteRemarks || project?.siteRemarks || ''
    );
    setMaterialScope(
      siteExec?.materialScope || project?.materialDescription || ''
    );
    setStatusSuccessMsg('');
    setStatusErrorMsg('');
  }, [projectId, project, siteExec]);

  // SAVE SITE STATUS & REQUIREMENT DETAILS
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setStatusErrorMsg('You do not have permission to modify site status.');
      return;
    }

    setIsSavingStatus(true);
    setStatusErrorMsg('');

    try {
      // 1. Update site execution store
      updateSiteExecutionInfo(
        projectId,
        {
          siteRequirementDate: siteRequirementDate || null,
          siteStatus,
          currentSiteStatus: siteStatus,
          remarks: remarks.trim(),
          siteRemarks: remarks.trim(),
          materialScope: materialScope.trim(),
        },
        username
      );

      // 2. Persist to project master
      updateProjectManual(
        projectId,
        {
          siteRequirementDate: siteRequirementDate || null,
          siteStatus,
          currentSiteStatus: siteStatus,
          siteRemarks: remarks.trim(),
        },
        username
      );

      setStatusSuccessMsg('Site status and requirement details saved successfully.');
      setTimeout(() => setStatusSuccessMsg(''), 4000);
    } catch {
      setStatusErrorMsg('Failed to update site status. Please try again.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  // CANCEL / RESET SITE STATUS FORM
  const handleCancelStatus = () => {
    setSiteRequirementDate(
      siteExec?.siteRequirementDate || project?.siteRequirementDate || ''
    );
    setSiteStatus(
      siteExec?.siteStatus || siteExec?.currentSiteStatus || project?.currentSiteStatus || project?.siteStatus || 'Ongoing'
    );
    setRemarks(
      siteExec?.remarks || siteExec?.siteRemarks || project?.siteRemarks || ''
    );
    setMaterialScope(
      siteExec?.materialScope || project?.materialDescription || ''
    );
    setStatusSuccessMsg('');
    setStatusErrorMsg('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadErrorMsg('Supported image formats: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadErrorMsg('File size exceeds the 15MB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setUploadErrorMsg('You do not have permission to upload photos.');
      return;
    }
    if (!selectedFile) {
      setUploadErrorMsg('Please select a photo file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataUrl = event.target?.result as string;
        const photoRecord: SitePhotoRecord = {
          id: `PHOTO-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          projectId,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          uploadedBy: username,
          uploadedAt: new Date().toISOString(),
          recordDate: recordDate || new Date().toISOString().split('T')[0],
          siteDate: recordDate || new Date().toISOString().split('T')[0],
          siteRequirementDate: siteRequirementDate || undefined,
          siteStatus: siteStatus || 'Ongoing',
          remarks: photoRemarks.trim() || remarks.trim() || undefined,
          materialScope: materialScope.trim() || undefined,
          status: 'Active',
          dataUrl,
          imageDataUrl: dataUrl,
        };

        addSitePhoto(photoRecord, username);
        setSelectedFile(null);
        setPhotoRemarks('');
        setUploadSuccessMsg('Site photo uploaded and recorded successfully.');
        setTimeout(() => setUploadSuccessMsg(''), 4000);
      } catch {
        setUploadErrorMsg('Failed to process photo upload.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadErrorMsg('Failed to read image file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    // 1. Build Overview Meta Sheet
    const overviewData = [
      { Parameter: 'Project ID', Value: projectId },
      { Parameter: 'Project Name', Value: project?.project || '—' },
      { Parameter: 'Customer', Value: project?.customer || '—' },
      { Parameter: 'Site Requirement Date', Value: siteRequirementDate || '—' },
      { Parameter: 'Current Site Status', Value: siteStatus || 'Ongoing' },
      { Parameter: 'Material Scope', Value: materialScope || '—' },
      { Parameter: 'Site Remarks', Value: remarks || '—' },
      { Parameter: 'Export Generated At', Value: new Date().toLocaleString() },
      { Parameter: 'Exported By', Value: username },
    ];

    // 2. Build Records Sheet
    const recordData = sitePhotos.map((p, index) => ({
      'S.No': index + 1,
      'Record Date': p.recordDate || p.siteDate || '—',
      'Site Requirement Date': p.siteRequirementDate || siteRequirementDate || '—',
      'Site Status': p.siteStatus || siteStatus || 'Ongoing',
      'Material Scope': p.materialScope || materialScope || '—',
      'Remarks / Description': p.remarks || '—',
      'File Name': p.fileName,
      'File Size (KB)': p.fileSize ? Math.round(p.fileSize / 1024) : '—',
      'Uploaded By': p.uploadedBy,
      'Upload Date': new Date(p.uploadedAt).toLocaleString(),
    }));

    if (recordData.length === 0) {
      recordData.push({
        'S.No': 1,
        'Record Date': new Date().toISOString().split('T')[0],
        'Site Requirement Date': siteRequirementDate || '—',
        'Site Status': siteStatus || 'Ongoing',
        'Material Scope': materialScope || '—',
        'Remarks / Description': remarks || '—',
        'File Name': 'No Photo Files Uploaded',
        'File Size (KB)': 0,
        'Uploaded By': username,
        'Upload Date': new Date().toLocaleString(),
      });
    }

    const wb = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    const wsRecords = XLSX.utils.json_to_sheet(recordData);

    XLSX.utils.book_append_sheet(wb, wsOverview, 'Site_Overview');
    XLSX.utils.book_append_sheet(wb, wsRecords, 'Date_Wise_Records');
    XLSX.writeFile(wb, `Site_Execution_Records_${projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // EXPORT TO PDF
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1050,height=850');
    if (!printWindow) {
      alert('Please allow popups in your browser to view and print the PDF report.');
      return;
    }

    const rowsHtml = sitePhotos.length > 0
      ? sitePhotos.map((p, idx) => `
        <tr>
          <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;white-space:nowrap;">${p.recordDate || p.siteDate || '—'}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;white-space:nowrap;">${p.siteRequirementDate || siteRequirementDate || '—'}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;"><span style="display:inline-block;padding:2px 6px;border-radius:4px;font-weight:bold;font-size:10px;background:#e0f2fe;color:#0369a1;">${p.siteStatus || siteStatus || 'Ongoing'}</span></td>
          <td style="padding:6px;border:1px solid #cbd5e1;">${p.materialScope || materialScope || '—'}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;">${p.remarks || '—'}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;font-family:monospace;font-size:10px;">${p.fileName}</td>
          <td style="padding:6px;border:1px solid #cbd5e1;">${p.uploadedBy}</td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="8" style="padding:14px;border:1px solid #cbd5e1;text-align:center;color:#64748b;font-style:italic;">
            No photo records uploaded for this project yet. Current site overview details are reflected above.
          </td>
        </tr>
      `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kumgang Site Records - ${projectId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11px; color: #0f172a; padding: 24px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e7490; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: 800; color: #0e7490; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 11px; color: #64748b; margin: 0; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 18px; }
          .meta-item label { display: block; font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 2px; }
          .meta-item span { font-size: 11px; font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #0e7490; color: white; padding: 7px 6px; border: 1px solid #0e7490; text-align: left; font-size: 10px; font-weight: bold; }
          .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; color: #94a3b8; font-size: 9px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Kumgang Kind ERP — Site Records & Photo Log</h1>
            <p class="subtitle">Official Site Execution, Requirement Dates & Photographic Evidence Summary</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 12px; color: #0e7490;">${projectId}</div>
            <div style="color: #64748b; font-size: 10px;">${project?.project || 'Project'}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <label>Customer Name</label>
            <span>${project?.customer || '—'}</span>
          </div>
          <div class="meta-item">
            <label>Site Requirement Date</label>
            <span>${siteRequirementDate || '—'}</span>
          </div>
          <div class="meta-item">
            <label>Current Site Status</label>
            <span>${siteStatus || 'Ongoing'}</span>
          </div>
          <div class="meta-item">
            <label>Material Scope</label>
            <span>${materialScope || '—'}</span>
          </div>
          <div class="meta-item" style="grid-column: span 4;">
            <label>Site Remarks</label>
            <span>${remarks || 'No remarks recorded.'}</span>
          </div>
        </div>

        <h3 style="font-size: 12px; font-weight: bold; color: #334155; margin: 0 0 6px 0; text-transform: uppercase;">
          Date-Wise Site Records & Photo Log (${sitePhotos.length} entries)
        </h3>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th style="width: 80px;">Record Date</th>
              <th style="width: 85px;">Site Req. Date</th>
              <th style="width: 80px;">Site Status</th>
              <th>Material Scope</th>
              <th>Remarks</th>
              <th style="width: 130px;">File Name</th>
              <th style="width: 90px;">Uploaded By</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Kumgang ERP System • Confidential Document</span>
          <span>Generated: ${new Date().toLocaleString()} by ${username}</span>
        </div>

        <script>
          function triggerPrint() {
            window.focus();
            window.print();
          }
          if (document.readyState === 'complete') {
            setTimeout(triggerPrint, 350);
          } else {
            window.addEventListener('load', function() {
              setTimeout(triggerPrint, 350);
            });
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`rounded-xl border p-5 shadow-xs transition-all ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Camera className={isDark ? 'text-amber-400' : 'text-amber-600'} size={18} />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('sitePhotosTitle')}
            </h3>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            {t('sitePhotosSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canEdit && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border mr-1 ${
              isDark ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              <ShieldAlert size={13} />
              <span>Read-Only View</span>
            </div>
          )}

          <button
            type="button"
            onClick={exportToExcel}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
              isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <FileSpreadsheet size={13} /> {t('exportExcel')}
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
              isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/50' : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <FileText size={13} /> {t('exportPdf')}
          </button>
        </div>
      </div>

      {/* Site Status & Requirement Form */}
      <form onSubmit={handleSaveStatus} className={`p-4 rounded-lg border mb-5 ${isDark ? 'bg-[#1A1A1E] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {t('siteRequirementOverview')}
          </h4>
        </div>

        {/* Status Feedback Banners */}
        {statusSuccessMsg && (
          <div className="mb-3 flex items-center gap-2 p-2.5 text-xs font-semibold rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={14} className="flex-shrink-0" />
            <span>{statusSuccessMsg}</span>
          </div>
        )}
        {statusErrorMsg && (
          <div className="mb-3 flex items-center gap-2 p-2.5 text-xs font-semibold rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{statusErrorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('siteRequirementDate')}
            </label>
            <input
              type="date"
              disabled={!canEdit}
              value={siteRequirementDate}
              onChange={e => setSiteRequirementDate(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
              } outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('currentSiteStatus')}
            </label>
            <select
              disabled={!canEdit}
              value={siteStatus}
              onChange={e => setSiteStatus(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
              } outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="Ongoing">{t('siteStatusOngoing')}</option>
              <option value="Completed">{t('siteStatusCompleted')}</option>
              <option value="On Hold">{t('siteStatusOnHold')}</option>
              <option value="Awaiting Site Access">{t('siteStatusAwaiting')}</option>
            </select>
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('materialScope')}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              placeholder={t('materialScopePlaceholder')}
              value={materialScope}
              onChange={e => setMaterialScope(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
              } outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('siteRemarks')}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              placeholder={t('siteRemarksPlaceholder')}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600'
              } outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end items-center gap-2 mt-4 pt-1 border-t border-slate-200/50 dark:border-[#262629]">
            <button
              type="button"
              onClick={handleCancelStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isDark ? 'border-[#303035] bg-[#1A1A1E] text-slate-300 hover:bg-[#262629]' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw size={12} /> {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSavingStatus}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white cursor-pointer transition-all disabled:opacity-60"
            >
              <Save size={13} /> {isSavingStatus ? t('savingStatusBtn') : t('updateSiteStatus')}
            </button>
          </div>
        )}
      </form>

      {/* Photo Upload Form */}
      {canEdit && (
        <form onSubmit={handleUploadPhoto} className={`p-4 rounded-lg border mb-5 ${isDark ? 'bg-[#1A1A1E] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {t('uploadSitePhotoTitle')}
          </h4>

          {uploadSuccessMsg && (
            <div className="mb-3 flex items-center gap-2 p-2.5 text-xs font-semibold rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={14} className="flex-shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}
          {uploadErrorMsg && (
            <div className="mb-3 flex items-center gap-2 p-2.5 text-xs font-semibold rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('selectImage')} *</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className={`w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold cursor-pointer ${
                  isDark ? 'file:bg-[#262629] file:text-amber-400 hover:file:bg-[#303035]' : 'file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('recordDate')} *</label>
              <input
                type="date"
                required
                value={recordDate}
                onChange={e => setRecordDate(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                } outline-none`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('photoRemarksDesc')}</label>
              <input
                type="text"
                placeholder={t('photoRemarksPlaceholder')}
                value={photoRemarks}
                onChange={e => setPhotoRemarks(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                } outline-none`}
              />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white disabled:opacity-50 cursor-pointer transition-all"
            >
              <Upload size={13} /> {isUploading ? t('uploadingPhotoBtn') : t('uploadSitePhotoBtn')}
            </button>
          </div>
        </form>
      )}

      {/* Date-wise Site Records Table */}
      <div className="overflow-x-auto">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          {t('dateWiseSiteRecords')}
        </h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-xs font-semibold ${isDark ? 'border-[#262629] text-[#85858B] bg-[#111113]' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
              <th className="py-2.5 px-3">{t('recordDate')}</th>
              <th className="py-2.5 px-3">{t('siteReqDate')}</th>
              <th className="py-2.5 px-3">{t('status')}</th>
              <th className="py-2.5 px-3">{t('materialScope')}</th>
              <th className="py-2.5 px-3">{t('remarksDescription')}</th>
              <th className="py-2.5 px-3">{t('filePhoto')}</th>
              <th className="py-2.5 px-3">{t('uploadedBy')}</th>
              <th className="py-2.5 px-3 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDark ? 'divide-[#262629] text-white' : 'divide-slate-200 text-slate-800'}`}>
            {sitePhotos.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                  {t('noSiteRecordsYet')}
                </td>
              </tr>
            ) : (
              sitePhotos.map(p => {
                const imgUrl = p.dataUrl || p.imageDataUrl;
                const pDate = p.recordDate || p.siteDate || '—';
                const pStatus = p.siteStatus || 'Ongoing';
                const displayStatus = pStatus === 'Completed' ? t('siteStatusCompleted') : pStatus === 'On Hold' ? t('siteStatusOnHold') : pStatus === 'Awaiting Site Access' ? t('siteStatusAwaiting') : t('siteStatusOngoing');
                return (
                  <tr key={p.id} className={isDark ? 'hover:bg-[#1A1A1E]' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap">{pDate}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{p.siteRequirementDate || siteRequirementDate || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        pStatus === 'Completed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{p.materialScope || materialScope || '—'}</td>
                    <td className="py-2.5 px-3">{p.remarks || '—'}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {imgUrl && (
                          <img src={imgUrl} alt={p.fileName} className="w-8 h-8 rounded object-cover border border-gray-600" />
                        )}
                        <span className="truncate max-w-[140px]" title={p.fileName}>{p.fileName}</span>
                      </div>
                    </td>
                    <td className={`py-2.5 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <div>{p.uploadedBy}</div>
                      <div className="text-[10px] opacity-75">{new Date(p.uploadedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(p)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-[#262629] text-amber-400' : 'hover:bg-slate-100 text-amber-600'}`}
                            title={t('viewPhoto')}
                          >
                            <ImageIcon size={14} />
                          </button>
                        )}
                        {imgUrl && (
                          <a
                            href={imgUrl}
                            download={p.fileName}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-[#262629] text-cyan-400' : 'hover:bg-slate-100 text-cyan-700'}`}
                            title={t('downloadPhoto')}
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewPhoto && (
        <div
          className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 ${isDark ? 'bg-black/80' : 'bg-slate-900/60'}`}
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className={`border rounded-xl shadow-2xl max-w-2xl w-full p-5 relative ${isDark ? 'bg-[#151517] border-[#303035] text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-700 mb-3">
              <h4 className="font-bold text-sm truncate">{previewPhoto.fileName}</h4>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-gray-400 hover:text-white rounded-md cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {(previewPhoto.dataUrl || previewPhoto.imageDataUrl) && (
              <img
                src={previewPhoto.dataUrl || previewPhoto.imageDataUrl}
                alt={previewPhoto.fileName}
                className="w-full max-h-[60vh] object-contain rounded border border-gray-700"
              />
            )}
            <div className="mt-3 text-xs flex items-center justify-between text-gray-400">
              <span>{t('dateLabel')}: {previewPhoto.recordDate || previewPhoto.siteDate} | {t('uploadedBy')}: {previewPhoto.uploadedBy}</span>
              <a
                href={previewPhoto.dataUrl || previewPhoto.imageDataUrl}
                download={previewPhoto.fileName}
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer"
              >
                <Download size={12} /> {t('download')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
