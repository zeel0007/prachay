import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, FileImage, X } from 'lucide-react';

export const SignatureUploader = ({ onFileSelected, currentSignatureUrl, label = 'Upload Signature Image', disabled = false }) => {
  const [preview, setPreview] = useState(currentSignatureUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG, JPEG, or WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview('');
    setError('');
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
        {label}
      </label>

      {preview ? (
        <div className="relative border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl p-5 flex flex-col items-center justify-center">
          {!disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-stone-400 hover:text-stone-700 shadow-xs border border-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <img
            src={preview}
            alt="Signature Preview"
            className="max-h-24 object-contain rounded-2xl bg-white p-3 shadow-xs border border-[#E2DFDC]"
          />
          <div className="flex items-center gap-1.5 mt-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Signature Attached & Verified</span>
          </div>
        </div>
      ) : (
        <label
          className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            disabled
              ? 'bg-stone-100 border-stone-200 cursor-not-allowed opacity-60'
              : 'bg-white/80 border-[#D5D1CC] hover:border-[#141413] hover:bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#F3F0EE] border border-[#E2DFDC] flex items-center justify-center text-[#141413] mb-2">
            <UploadCloud className="w-5 h-5 text-[#141413]" />
          </div>
          <p className="text-sm font-semibold text-[#141413]">Click to upload signature</p>
          <p className="text-xs text-stone-400 mt-1">PNG, JPG or WebP (max 2MB)</p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      )}

      {error && <p className="mt-1.5 text-xs text-rose-600 font-semibold">{error}</p>}
    </div>
  );
};
