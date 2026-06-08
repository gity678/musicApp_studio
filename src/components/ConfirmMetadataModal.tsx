import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Music, Youtube, Globe, Info } from "lucide-react";

interface Metadata {
  title: string;
  artist: string;
  thumb: string;
  source: string;
  duration?: string;
}

interface ConfirmMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { title: string; artist: string; thumb: string; duration: string }) => void;
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
  const [duration, setDuration] = useState("");

  // Sync with available metadata when modal opens or source changes
  useEffect(() => {
    if (!isOpen) return;

    if (source === "iTunes" && itunesMeta) {
      setTitle(itunesMeta.title || rawTitle);
      setArtist(itunesMeta.artist || "—");
      setThumb(itunesMeta.thumb || youtubeMeta.thumb);
      setDuration(itunesMeta.duration || youtubeMeta.duration || "—");
    } else {
      setTitle(youtubeMeta.title || rawTitle);
      setArtist(youtubeMeta.artist || "—");
      setThumb(youtubeMeta.thumb);
      setDuration(youtubeMeta.duration || "—");
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
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white border border-zinc-200 rounded-2xl w-full max-w-[340px] overflow-hidden shadow-2xl"
        >
          {/* Header Image - Reduced height for compactness */}
          <div className="relative h-32 w-full group">
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-2 left-4 right-4">
               <div className="flex items-center gap-2 mb-0.5">
                 <div className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight bg-[#facc15] text-black">
                     {source}
                 </div>
               </div>
               <h3 className="text-white font-bold text-sm truncate drop-shadow-md">{title || "..."}</h3>
            </div>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            {/* Original YouTube Reference */}
            <div>
              <label className={`block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                {isRTL ? "العنوان الأصلي" : "Original Title"}
              </label>
              <div className={`bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-[10px] text-zinc-500 truncate select-all font-mono ${isRTL ? "text-right" : "text-left"}`}>
                {rawTitle}
              </div>
            </div>

            {/* Source Selection Buttons */}
            <div className="space-y-1.5">
              <label className={`block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 ${isRTL ? "text-right" : "text-left"}`}>
                {isRTL ? "اختر المصدر" : "Metadata Source"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!itunesMeta}
                  onClick={() => setSource("iTunes")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold ${
                    source === "iTunes"
                      ? "bg-[#facc15] border-[#facc15] text-black shadow-md shadow-[#facc15]/20"
                      : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  <Music size={12} />
                  <span>iTunes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSource("YouTube")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold ${
                    source === "YouTube"
                      ? "bg-[#facc15] border-[#facc15] text-black shadow-md shadow-[#facc15]/20"
                      : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                  }`}
                >
                  <Youtube size={12} />
                  <span>YouTube</span>
                </button>
              </div>
            </div>

            {/* Editable Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`block text-[9px] font-bold text-zinc-400 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "العنوان" : "Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#facc15] transition-all ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={isRTL ? "عنوان الأغنية..." : "Song title..."}
                />
              </div>
              <div className="space-y-1">
                <label className={`block text-[9px] font-bold text-zinc-400 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الفنان" : "Artist"}
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className={`w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#facc15] transition-all ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={isRTL ? "اسم الفنان..." : "Artist name..."}
                />
              </div>
              
              {/* Duration display - not interactive as per user request */}
              <div className="flex items-center justify-between py-1 px-1 opacity-60">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  {isRTL ? "المدة" : "Duration"}
                </span>
                <span className="text-xs font-mono text-zinc-600">
                  {duration || "--:--"}
                </span>
              </div>
            </div>

             {/* Quick Actions */}
            <div className={`flex gap-2 pt-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <button
                onClick={onClose}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 font-bold py-2.5 rounded-xl text-[10px] transition-all border border-zinc-200"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => onConfirm({ title, artist, thumb, duration })}
                className="flex-[2] bg-[#facc15] hover:bg-yellow-400 text-black font-black py-2.5 rounded-xl text-[10px] transition-all shadow-lg shadow-[#facc15]/20 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>{isRTL ? "تأكيد وإرسال" : "Confirm & Send"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
