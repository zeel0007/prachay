import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/50 backdrop-blur-xs animate-fade-in">
      <div
        className={`bg-white rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.12)] border border-[#E2DFDC] w-full ${maxWidth} overflow-hidden transform transition-all animate-scale-up`}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#EDE9E5]">
          <h3 className="text-lg font-semibold text-[#141413] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-[#141413] hover:bg-[#F3F0EE] transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  );
};
