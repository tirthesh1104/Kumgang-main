import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { useLanguage } from '../../context/LanguageContext';
import type { SitePhotoRecord } from '../../types/phase3';
import { Camera, Upload, Download, FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react';
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

  const canEdit = activeSession.role === 'Admin' || activeSession.role === 'ProjectManager' || (activeSession.role as string) === 'ADMIN' || (activeSession.role as string) === 'PROJECT_MANAGER';
  const username = activeSession.displayName || 'User';

  // Site Status & Requirement Date local edit state
  const [siteRequirementDate, setSiteRequirementDate] = useState(
    project?.siteRequirementDate || siteExec?.siteRequirementDate || ''
  );
  const [siteStatus, setSiteStatus] = useState<string>(
    siteExec?.siteStatus || siteExec?.currentSiteStatus || project?.siteStatus || 'Ongoing'
  );
  const [remarks, setRemarks] = useState(siteExec?.remarks || siteExec?.siteRemarks || project?.siteRemarks || '');
  const [materialScope, setMaterialScope] = useState(siteExec?.materialScope || '');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoRemarks, setPhotoRemarks] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<SitePhotoRecord | null>(null);

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStatus(true);
    // Update site execution info & project master
    updateSiteExecutionInfo(
      projectId,
      {
        siteRequirementDate: siteRequirementDate || null,
        siteStatus,
        currentSiteStatus: siteStatus,
        remarks,
        siteRemarks: remarks,
        materialScope,
      },
      username
    );

    updateProjectManual(
      projectId,
      {
        siteRequirementDate: siteRequirementDate || null,
        siteStatus,
        siteRemarks: remarks,
      },
      username
    );

    setTimeout(() => setIsSavingStatus(false), 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Supported image formats: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
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
        remarks: photoRemarks || remarks || undefined,
        materialScope: materialScope || undefined,
        status: 'Active',
        dataUrl,
        imageDataUrl: dataUrl,
      };

      addSitePhoto(photoRecord, username);
      setSelectedFile(null);
      setPhotoRemarks('');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  // Export Date-wise Site Records to Excel
  const exportToExcel = () => {
    const data = sitePhotos.map((p, index) => ({
      'S.No': index + 1,
      'Record Date': p.recordDate || p.siteDate || '—',
      'Site Requirement Date': p.siteRequirementDate || '—',
      'Site Status': p.siteStatus || 'Ongoing',
      'Remarks': p.remarks || '—',
      'Material Scope': p.materialScope || '—',
      'File Name': p.fileName,
      'Uploaded By': p.uploadedBy,
      'Upload Date': new Date(p.uploadedAt).toLocaleString(),
    }));

    if (data.length === 0) {
      data.push({
        'S.No': 1,
        'Record Date': new Date().toISOString().split('T')[0],
        'Site Requirement Date': siteRequirementDate || '—',
        'Site Status': siteStatus || 'Ongoing',
        'Remarks': remarks || '—',
        'Material Scope': materialScope || '—',
        'File Name': 'No Photo Uploaded',
        'Uploaded By': username,
        'Upload Date': new Date().toLocaleString(),
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Site_Records');
    XLSX.writeFile(wb, `Site_Records_${projectId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Date-wise Site Records to PDF via vector HTML print window
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Please allow popups to export the PDF report.');
      return;
    }

    const rowsHtml = sitePhotos.map((p, idx) => `
      <tr>
        <td style="padding:6px;border:1px solid #cbd5e1;">${idx + 1}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.recordDate || p.siteDate || '—'}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.siteRequirementDate || '—'}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.siteStatus || 'Ongoing'}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.materialScope || '—'}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.remarks || '—'}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.fileName}</td>
        <td style="padding:6px;border:1px solid #cbd5e1;">${p.uploadedBy}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Site Records - ${projectId}</title>
        <style>
          body { font-family: sans-serif; font-size: 11px; color: #0f172a; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #0e7490; color: white; padding: 8px; border: 1px solid #0e7490; text-align: left; }
        </style>
      </head>
      <body>
        <h2>KUMKANG SITE RECORDS & PHOTO LOG</h2>
        <p>Project ID: <strong>${projectId}</strong> | Customer: <strong>${project?.customer || '—'}</strong> | Date: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Record Date</th>
              <th>Site Req. Date</th>
              <th>Site Status</th>
              <th>Material Scope</th>
              <th>Remarks</th>
              <th>File Name</th>
              <th>Uploaded By</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="8">No site photo records logged.</td></tr>'}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`rounded-xl border p-5 shadow-card ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
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
          <button
            onClick={exportToExcel}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50' : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <FileSpreadsheet size={13} /> {t('exportExcel')}
          </button>
          <button
            onClick={exportToPDF}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/50' : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <FileText size={13} /> {t('exportPdf')}
          </button>
        </div>
      </div>

      {/* Site Status & Requirement Form */}
      <form onSubmit={handleSaveStatus} className={`p-4 rounded-lg border mb-5 ${isDark ? 'bg-[#1A1A1E] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
          {t('siteRequirementOverview')}
        </h4>

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
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
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
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
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
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
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
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            />
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isSavingStatus}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              {isSavingStatus ? t('savingStatusBtn') : t('updateSiteStatus')}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('selectImage')} *</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className={`w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold cursor-pointer ${
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 cursor-pointer"
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
                    <td className="py-2.5 px-3 whitespace-nowrap">{p.siteRequirementDate || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        pStatus === 'Completed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{p.materialScope || '—'}</td>
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
        <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 ${isDark ? 'bg-black/80' : 'bg-slate-900/60'}`}>
          <div className={`border rounded-xl shadow-2xl max-w-2xl w-full p-5 ${isDark ? 'bg-[#151517] border-[#303035] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-700 mb-3">
              <h4 className="font-bold text-sm truncate">{previewPhoto.fileName}</h4>
              <button onClick={() => setPreviewPhoto(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>
            {(previewPhoto.dataUrl || previewPhoto.imageDataUrl) && (
              <img src={previewPhoto.dataUrl || previewPhoto.imageDataUrl} alt={previewPhoto.fileName} className="w-full max-h-[60vh] object-contain rounded border border-gray-700" />
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
