import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Music, Youtube, Globe, Info } from "lucide-react";

interface Metadata {
  title: string;
  artist: string;
  thumb: string;
  source: string;
}

interface ConfirmMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { title: string; artist: string; thumb: string }) => void;
  videoId: string;
  rawTitle: string;
  youtubeMeta: Metadata;
  itunesMeta: Metadata | null;
  lang: "en" | "ar";
}

export default function ConfirmMetadataModal({
  isOpen,
  onClose,
  onConfirm,
  videoId,
  rawTitle,
  youtubeMeta,
  itunesMeta,
  lang,
}: ConfirmMetadataModalProps) {
  const isRTL = lang === "ar";
  const [source, setSource] = useState<"iTunes" | "YouTube">("iTunes");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [thumb, setThumb] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Sync with available metadata when modal opens or source changes
  useEffect(() => {
    if (!isOpen) return;

    if (source === "iTunes" && itunesMeta) {
      setTitle(itunesMeta.title || rawTitle);
      setArtist(itunesMeta.artist || "—");
      setThumb(itunesMeta.thumb || youtubeMeta.thumb);
    } else {
      setTitle(youtubeMeta.title || rawTitle);
      setArtist(youtubeMeta.artist || "—");
      setThumb(youtubeMeta.thumb);
    }
  }, [isOpen, source, itunesMeta, youtubeMeta, rawTitle]);

  // If iTunes meta is null, default to YouTube source
  useEffect(() => {
    if (isOpen && !itunesMeta) {
      setSource("YouTube");
    } else if (isOpen && itunesMeta) {
      setSource("iTunes");
    }
  }, [isOpen, itunesMeta]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#1a1a2e] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header Image */}
          <div className="relative h-48 w-full group">
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-6 right-6">
               <div className="flex items-center gap-2 mb-1">
                 <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${source === "iTunes" ? "bg-red-600 text-white" : "bg-[#1db954] text-white"}`}>
                    {source} SOURCE
                 </div>
               </div>
               <h3 className="text-white font-black text-lg truncate drop-shadow-lg">{title || "Loading..."}</h3>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Original Ref */}
            <div>
              <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                {isRTL ? "العنوان الأصلي (يوتيوب)" : "Original YouTube Title"}
              </label>
              <div className={`bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-400 select-all truncate ${isRTL ? "text-right" : "text-left"}`}>
                {rawTitle}
              </div>
            </div>

            {/* Source Selection */}
            <div className="space-y-2">
              <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                {isRTL ? "اختر مصدر البيانات" : "Select Metadata Source"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!itunesMeta}
                  onClick={() => setSource("iTunes")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-[11px] font-bold ${
                    source === "iTunes"
                      ? "bg-[#e91e63] border-[#e91e63] text-white shadow-lg shadow-[#e91e63]/20"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  <Music size={14} />
                  <span>iTunes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSource("YouTube")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-[11px] font-bold ${
                    source === "YouTube"
                      ? "bg-[#e91e63] border-[#e91e63] text-white shadow-lg shadow-[#e91e63]/20"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Youtube size={14} />
                  <span>YouTube</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "العنوان" : "Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e63] transition-all ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={isRTL ? "عنوان الأغنية..." : "Song title..."}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الفنان" : "Artist"}
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e91e63] transition-all ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={isRTL ? "اسم الفنان..." : "Artist name..."}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-3 pt-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3.5 rounded-2xl text-xs transition-all border border-white/10"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => onConfirm({ title, artist, thumb })}
                className="flex-[2] bg-[#e91e63] hover:bg-[#d81b60] text-white font-black py-3.5 rounded-2xl text-xs transition-all shadow-xl shadow-[#e91e63]/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>{isRTL ? "تأكيد وإرسال" : "Confirm & Dispatch"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
