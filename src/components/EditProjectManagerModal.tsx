import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { UserCheck, X, Upload, Check } from 'lucide-react';
import type { ProjectManagerInfo } from '../types/projectManager';

export function EditProjectManagerModal() {
  const { isEditModalOpen, setIsEditModalOpen, projectManager, updateProjectManager, showNotification, theme } = useApp();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<ProjectManagerInfo>({ ...projectManager });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state whenever modal opens or projectManager updates
  useEffect(() => {
    if (isEditModalOpen) {
      setFormData({ ...projectManager });
      setErrorMsg(null);
      setSelectedFileName(null);
    }
  }, [isEditModalOpen, projectManager]);

  if (!isEditModalOpen) return null;

  const handleChange = (field: keyof ProjectManagerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, photoUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Reset to default photo
    setFormData(prev => ({
      ...prev,
      photoUrl: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(prev.name || 'PM') + '&background=16593C&color=fff'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Project Manager Name is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMsg('Role / Designation is required.');
      return;
    }

    updateProjectManager(formData);
    showNotification('Project Manager updated successfully.');
    setIsEditModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border my-8 relative flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#151517] border-[#303035]' : 'bg-white border-slate-300'
          }`}
        >
          {/* Modal Header */}
          <div className={`px-6 py-4 flex items-center justify-between flex-shrink-0 border-b ${
            isDark ? 'bg-[#090909] border-[#202023]' : 'bg-[#0B2239] border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shadow-sm flex-shrink-0 ${
                isDark ? 'bg-[#2A2419] text-[#C9A86A] border-[#55462C]' : 'bg-[#1688D4] text-white border-[#1688D4]'
              }`}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Update Project Manager
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-200'}`}>
                  Edit and save project leadership information
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className={`flex-1 overflow-y-auto p-6 space-y-5 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            {errorMsg && (
              <div className={`p-3 border text-xs font-semibold rounded-lg ${
                isDark ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A]' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {errorMsg}
              </div>
            )}

            {/* 2-Column Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Project Manager Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. Prakash Shinde"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Role / Designation <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => handleChange('designation', e.target.value)}
                  placeholder="e.g. Project Manager KKI"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="e.g. prakash.shinde@kumkang.com"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Department / Team
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => handleChange('department', e.target.value)}
                  placeholder="e.g. KKI Project Management"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={e => handleChange('project', e.target.value)}
                  placeholder="e.g. Kumkang Live Monitoring"
                  className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none transition-all ${
                    isDark 
                      ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                  }`}
                />
              </div>
            </div>

            {/* Profile Photo Upload Box */}
            <div className={`border rounded-xl p-4 space-y-3 ${
              isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                Profile Photo
              </label>

              <div className="flex items-center gap-2.5 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="profile-photo-upload"
                />
                <label
                  htmlFor="profile-photo-upload"
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isDark 
                      ? 'bg-[#2A2419] hover:bg-[#322917] text-[#C9A86A] border-[#55462C]' 
                      : 'bg-[#1688D4] hover:bg-[#0284C7] text-white border-[#1688D4]'
                  }`}
                >
                  <Upload size={14} />
                  <span>Select / Upload Photo(s)</span>
                </label>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    isDark 
                      ? 'bg-[#18181B] hover:bg-[#34191B] text-[#F08A8A] border-[#5A292B]' 
                      : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                  }`}
                >
                  Remove
                </button>
              </div>

              <p className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                Click to choose any image file(s) from your computer. First selected photo will set as profile image.
              </p>

              {/* Photo Preview Row */}
              <div className="pt-2 flex items-start gap-4">
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm flex-shrink-0 ${
                    isDark ? 'border-[#C9A86A] bg-[#18181B]' : 'border-[#1688D4] bg-white'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name || 'PM') + '&background=1688D4&color=fff';
                  }}
                />

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide block mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                    SELECTED PHOTOS (1): {selectedFileName ? `(${selectedFileName})` : ''}
                  </span>
                  <div className={`w-10 h-10 rounded-lg overflow-hidden border-2 shadow-sm relative group ${
                    isDark ? 'border-[#C9A86A] bg-[#18181B]' : 'border-[#1688D4] bg-white'
                  }`}>
                    <img
                      src={formData.photoUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name || 'PM') + '&background=1688D4&color=fff';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value as 'Active' | 'Inactive')}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm font-medium focus:ring-2 outline-none cursor-pointer ${
                  isDark 
                    ? 'border-[#303035] bg-[#151517] text-[#F5F5F3] focus:ring-[#C9A86A] focus:border-[#C9A86A]' 
                    : 'border-slate-300 bg-white text-slate-900 focus:ring-[#1688D4] focus:border-[#1688D4]'
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Hidden Submit Button to support Form Enter key submit */}
            <button type="submit" className="hidden" />
          </form>

          {/* Modal Footer */}
          <div className={`border-t px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0 ${
            isDark ? 'border-[#202023] bg-[#090909]' : 'border-slate-200 bg-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border ${
                isDark 
                  ? 'text-[#B4B4B8] bg-[#18181B] border-[#303035] hover:bg-[#222226]' 
                  : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
            >
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
