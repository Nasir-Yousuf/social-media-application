import React, { useRef } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
  Printer,
} from 'lucide-react';
import api from '../../../api/client';
import { useNotifications } from '../../../context/NotificationContext';

export const CertificateModal = ({
  certificate,
  studentName = 'Learner',
  isOpen,
  onClose,
}) => {
  const { showToast } = useNotifications();
  const certRef = useRef(null);

  if (!isOpen || !certificate) return null;

  const dateFormatted = new Date(certificate.issuedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrintDownload = () => {
    // Print window formatted for certificate PDF
    window.print();
  };

  const handleShareToFeed = async () => {
    try {
      const shareContent = `🎓 Certified! I just passed the Final Certification Exam and completed all 12 lessons of ${certificate.trackTitle} on Clearfeed with a score of ${certificate.score}%!\n\nCredential Verification ID: ${certificate.certificateId}\nCheck out my certificate in the learning section! 🚀`;

      await api.post('/posts', {
        content: shareContent,
        visibility: 'public',
        replyPolicy: 'everyone',
      });

      showToast('Certificate shared to Clearfeed feed!', 'success');
      onClose();
    } catch (err) {
      console.warn('Failed to share certificate:', err);
      showToast('Could not share to feed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0e14] border-2 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Official Clearfeed Verified Credential</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download / Print PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareToFeed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to Feed</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex items-center justify-center bg-black/40">
          <div
            ref={certRef}
            id="clearfeed-printable-certificate"
            className="w-full relative rounded-2xl bg-[#0d1117] border-4 border-amber-500/60 p-6 sm:p-10 shadow-2xl overflow-hidden text-center font-serif text-neutral-100 select-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)',
            }}
          >
            {/* Ornamental Inner Border */}
            <div className="absolute inset-2 border border-amber-500/30 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-dashed border-amber-500/20 rounded-lg pointer-events-none" />

            {/* Top Seal & Organization Header */}
            <div className="relative flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
                <Award className="w-8 h-8" />
              </div>

              <span className="font-mono text-[10px] tracking-widest text-amber-400 uppercase font-bold">
                Clearfeed Academy · Web Engineering Division
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-sans tracking-wide uppercase mt-1 drop-shadow-sm">
                Certificate of Completion
              </h2>
            </div>

            {/* Body Text */}
            <div className="relative space-y-3 font-sans">
              <p className="text-xs text-neutral-400 uppercase tracking-widest">
                This document officially certifies that
              </p>

              {/* Student Name */}
              <div className="py-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight underline decoration-amber-500/50 decoration-2 underline-offset-8">
                  {certificate.studentName || studentName}
                </h3>
              </div>

              <p className="text-xs text-neutral-400 max-w-lg mx-auto pt-2 leading-relaxed">
                has successfully passed all practical lessons and demonstrated comprehensive mastery on the official Final Certification Examination for
              </p>

              {/* Track Title */}
              <div className="py-1">
                <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                  {certificate.trackTitle}
                </span>
              </div>

              {/* Distinction & Honors */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Grade: {certificate.score}% · {certificate.score >= 90 ? 'High Honors' : 'Verified Pass'}
                </span>
              </div>
            </div>

            {/* Footer with Signatures & Credential ID */}
            <div className="relative mt-8 pt-6 border-t border-amber-500/20 grid grid-cols-2 gap-4 items-end text-left font-sans text-xs text-neutral-400">
              <div>
                <div className="font-mono text-xs text-amber-400/90 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Credential ID:</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-300 truncate">
                  {certificate.certificateId}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Issued on: {dateFormatted}
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-sm text-neutral-200">
                  Nasir Yousuf
                </div>
                <div className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">
                  Academic Director, Clearfeed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
