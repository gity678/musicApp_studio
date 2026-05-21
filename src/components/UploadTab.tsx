import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, Music, ArrowUpRight, Check, Trash2, Play, Plus, Eye, FileAudio, Sparkles } from "lucide-react";
import { Track } from "../types";

interface UploadTabProps {
  customTracks: Track[];
  onAddCustomTrack: (title: string, artist: string, url: string, genre: string, cover?: string) => void;
  onDeleteCustomTrack: (trackId: string) => void;
  onSelectTrack: (track: Track) => void;
  currentTrack: Track | null;
  lang: "en" | "ar";
  translations: any;
  workerUrl: string;
  setWorkerUrl: (val: string) => void;
  workerTracks: Track[];
  isWorkerLoading: boolean;
  onReloadWorkerSongs: () => void;
}

export default function UploadTab({
  customTracks,
  onAddCustomTrack,
  onDeleteCustomTrack,
  onSelectTrack,
  currentTrack,
  lang,
  translations,
  workerUrl,
  setWorkerUrl,
  workerTracks,
  isWorkerLoading,
  onReloadWorkerSongs,
}: UploadTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedCover, setSelectedCover] = useState("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80");
  const [statusMessage, setStatusMessage] = useState("");

  // Worker Dispatcher Form Fields
  const [workerYoutubeUrl, setWorkerYoutubeUrl] = useState("");
  const [workerSongName, setWorkerSongName] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState({ loading: false, msg: "", success: false });

  const handleWorkerDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerUrl.trim()) {
      setDispatchStatus({
        loading: false,
        msg: isRTL ? "يرجى إدخال عنوان خادم الـ Worker أولاً" : "Please insert a Cloudflare Worker URL first",
        success: false
      });
      return;
    }
    if (!workerYoutubeUrl.trim() || !workerSongName.trim()) return;

    setDispatchStatus({
      loading: true,
      msg: isRTL ? "جاري إرسال الطلب وإطلاق عملية البناء..." : "Dispatching GitHub Actions compilation workflow...",
      success: false
    });

    try {
      const response = await fetch("/api/worker/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerUrl: workerUrl.trim(),
          youtube_url: workerYoutubeUrl.trim(),
          song_name: workerSongName.trim()
        })
      });
      const data = await response.json();
      if (response.ok) {
        setDispatchStatus({
          loading: false,
          msg: isRTL 
            ? "تم بدء معالجة التراك بنجاح! قد يستغرق الرفع بضع دقائق." 
            : "Build workflow triggered successfully! Process will take a few minutes.",
          success: true
        });
        setWorkerYoutubeUrl("");
        setWorkerSongName("");
        // Auto reload tracks list after 12s
        setTimeout(() => {
          onReloadWorkerSongs();
        }, 12000);
      } else {
        setDispatchStatus({
          loading: false,
          msg: data.error || (isRTL ? "فشل إطلاق عملية البناء." : "Workflow invocation failed."),
          success: false
        });
      }
    } catch (err: any) {
      setDispatchStatus({
        loading: false,
        msg: err.message || (isRTL ? "خطأ في اتصال الخادر." : "Could not communicate with your worker."),
        success: false
      });
    }
  };

  const coverPresets = [
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleLoadFileDetails(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLoadFileDetails(e.target.files[0]);
    }
  };

  const handleLoadFileDetails = (file: File) => {
    // Generate clean details automatically from local uploaded file name
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const parts = cleanName.split("-");
    
    if (parts.length > 1) {
      setArtist(parts[0].trim());
      setTitle(parts[1].trim());
    } else {
      setTitle(cleanName);
      setArtist(isRTL ? "مجهول" : "Local Artist");
    }

    // Since in simple static clients there's no server storage, create a local blob URL
    const localBlobUrl = URL.createObjectURL(file);
    setUrl(localBlobUrl);
    setGenre("Uploaded File");
    
    setStatusMessage(isRTL ? "تم تحليل وقراءة الملف المحلي بنجاح!" : "Local audio file parsed successfully!");
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const trackTitle = title.trim() || (isRTL ? `قطعة مخصصة #${customTracks.length + 1}` : `External Audio #${customTracks.length + 1}`);
    const trackArtist = artist.trim() || (isRTL ? "مصدر ويب" : "Web stream source");
    const trackGenre = genre.trim() || "Custom Link";

    onAddCustomTrack(trackTitle, trackArtist, url.trim(), trackGenre, selectedCover);
    
    // Clear state
    setTitle("");
    setArtist("");
    setUrl("");
    setGenre("");
    setStatusMessage(t.uploadSuccess);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  return (
    <div className="space-y-4 md:space-y-8 pb-4 md:pb-12">
      {/* Header Poster Banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black border border-[#1e1e24] p-4 md:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
          <span className="font-mono text-[10px] md:text-xs text-[#1db954] uppercase tracking-widest font-bold bg-[#1db954]/10 border border-[#1db954]/20 px-3 py-1 rounded-full inline-block">
            {isRTL ? "نظام الرفع الصوتي المتكامل" : "Audio Host Middleware Core Enabled"}
          </span>
          <h1 className="font-sans font-black text-2xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "صفحة رفع وبث الملفات الموسيقية" : "Load & Host Custom Music Streams"}
          </h1>
          <p className="text-gray-300 text-xs md:text-sm hidden md:block">
            {isRTL
              ? "هنا يمكنك سحب وإفلات الملفات الصوتية من جهازك أو لصق روابط البث المباشر (مثل ملفات MP3 المباشرة) لتوسيع مجموعتك الصوتية وحفظها محلياً."
              : "Directly load external soundwaves. Drop offline files to generate offline media Blobs, or reference direct servers in high definition."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4 md:space-y-6">
            <h2 className="font-sans font-bold text-sm md:text-lg text-white flex items-center gap-2">
              <UploadCloud className="text-[#1db954]" size={18} />
              <span>{isRTL ? "تعبئة تفاصيل الملف الصوتي" : "Host Metadata Form"}</span>
            </h2>

            {/* Drag and drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 md:p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-[#1db954] bg-[#1db954]/10 scale-[0.99]"
                  : "border-[#1e1e24] hover:border-gray-600 bg-[#09090c]/50 hover:bg-[#121216]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <UploadCloud size={24} className="mx-auto text-gray-400 mb-2 animate-bounce" />
              <h3 className="font-bold text-xs md:text-sm text-white">{t.uploadBoxTitle}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">{t.uploadBoxSubtitle}</p>
            </div>

            {/* Manual fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                    {isRTL ? "اسم التراك الموسيقي" : "Track Title"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                    {isRTL ? "اسم الفنان / العازف" : "Artist Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.artistPlaceholder}
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                    {isRTL ? "رابط الصوت (MP3 أو بوب)" : "Audio Stream URL / File Blob"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.customUrlPlaceholder}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                    {isRTL ? "التصنيف الموسيقي" : "Genre Tag"}
                  </label>
                  <input
                    type="text"
                    placeholder={t.genrePlaceholder}
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>
              </div>

              {/* Cover Presets selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                  {isRTL ? "اختر صورة الغلاف التعبيرية" : "Select Artwork Theme"}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {coverPresets.map((preset, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCover(preset)}
                      className={`relative w-8 h-8 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedCover === preset ? "border-[#1db954] scale-105" : "border-[#1e1e24] hover:opacity-80"
                      }`}
                    >
                      <img src={preset} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1db954]/10 border border-[#1db954]/20 p-2.5 rounded-xl flex items-center gap-2 text-[#1db954] text-xs font-semibold"
                >
                  <Check size={14} />
                  <span>{statusMessage}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1db954] text-black hover:bg-[#20cf5d] active:scale-95 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={14} />
                <span>{t.customAddBtn}</span>
              </button>
            </form>
          </div>

          {/* Cloudflare Worker Integration Card */}
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-sm md:text-lg text-white flex items-center gap-2">
                <Sparkles className="text-[#1db954]" size={18} />
                <span>{isRTL ? "إعدادات Cloudflare Worker والربط السحابي" : "Cloudflare Worker & Cloud Integration"}</span>
              </h2>
              {workerUrl.trim() && (
                <button
                  onClick={onReloadWorkerSongs}
                  disabled={isWorkerLoading}
                  className="text-[10px] font-mono font-bold uppercase text-[#1db954] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {isWorkerLoading ? (isRTL ? "جاري التحديث..." : "Reloading...") : (isRTL ? "Refresh Tracks" : "Refresh Tracks")}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                  {isRTL ? "رابط خادم الـ Cloudflare Worker الخاص بك" : "Cloudflare Worker Endpoint URL"}
                </label>
                <input
                  type="url"
                  placeholder="https://your-worker-name.pages.dev"
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {isRTL 
                    ? "عند ملء هذا الخيار، سيتم تمكين بث ورفع التراكات من Backblaze B2 و Cloudinary الخاصة بك."
                    : "Connecting your worker unlocks instant remote media caching in Backblaze B2 and Cloudinary."}
                </p>
              </div>

              {workerUrl.trim() && (
                <form onSubmit={handleWorkerDispatchSubmit} className="pt-4 border-t border-[#1e1e24] space-y-4">
                  <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <ArrowUpRight size={14} className="text-[#1db954]" />
                    <span>{isRTL ? "استخراج وحفظ تراك جديد من يوتيوب" : "Build & Host a New Track from YouTube"}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                        {isRTL ? "رابط فيديو يوتيوب" : "YouTube Video URL"}
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={workerYoutubeUrl}
                        onChange={(e) => setWorkerYoutubeUrl(e.target.value)}
                        className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-gray-400 font-bold">
                        {isRTL ? "اسم التراك / الأغنية" : "Desired Song Title"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isRTL ? "مثال: أغنية فيروز شادي" : "e.g., Chillwave Stream"}
                        value={workerSongName}
                        onChange={(e) => setWorkerSongName(e.target.value)}
                        className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                      />
                    </div>
                  </div>

                  {dispatchStatus.msg && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        dispatchStatus.success 
                          ? "bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954]" 
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      <Check size={14} />
                      <span>{dispatchStatus.msg}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={dispatchStatus.loading}
                    className="w-full bg-[#1db954] text-black hover:bg-[#20cf5d] disabled:bg-gray-700 disabled:cursor-not-allowed hover:text-black font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    {dispatchStatus.loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    <span>{isRTL ? "إرسال طلب البناء والرفع" : "Dispatch Remote Build & Save"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Local Streamed Catalog List */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="font-sans font-bold text-xs md:text-sm text-white flex items-center gap-2">
              <Sparkles size={14} className="text-[#1db954]" />
              <span>{t.savedTracks} ({customTracks.length})</span>
            </h3>

            {customTracks.length > 0 ? (
              <div className="space-y-2 max-h-[200px] md:max-h-[450px] overflow-y-auto no-scrollbar pr-1">
                <AnimatePresence>
                  {customTracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`p-2 bg-zinc-900/40 rounded-xl border border-[#1e1e24] hover:border-gray-700 flex items-center justify-between group gap-2 ${
                          isCurrent ? "border-[#1db954]/40 bg-[#1db954]/5" : ""
                        }`}
                      >
                        <div
                          onClick={() => onSelectTrack(track)}
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                        >
                          <img src={track.coverUrl} className="w-8 h-8 rounded-md object-cover shrink-0" />
                          <div className="min-w-0">
                            <h4 className={`text-[11px] font-bold truncate ${isCurrent ? "text-[#1db954]" : "text-white"}`}>
                              {track.title}
                            </h4>
                            <p className="text-[9px] text-gray-400 truncate mt-0.5">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSelectTrack(track)}
                            className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-[#1db954] transition-colors cursor-pointer"
                          >
                            <Play size={10} className="fill-current" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomTrack(track.id)}
                            className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                            title={t.deleteTrack}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-[11px] italic space-y-2">
                <FileAudio size={24} className="mx-auto text-gray-600 block" />
                <p>{t.noTracks}</p>
              </div>
            )}
          </div>

          {/* Cloudworker tracks list */}
          {workerUrl.trim() && (
            <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4">
              <h3 className="font-sans font-bold text-xs md:text-sm text-white flex items-center gap-2">
                <UploadCloud size={14} className="text-[#1db954]" />
                <span>
                  {isRTL ? "تراكات السحاب المستوردة" : "Cloud Worker Library"} ({workerTracks.length})
                </span>
              </h3>

              {isWorkerLoading ? (
                <div className="py-8 text-center text-gray-500 text-xs">
                  <div className="w-5 h-5 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>{isRTL ? "جاري تحميل تراكات السحاب..." : "Loading cloud library tracks..."}</span>
                </div>
              ) : workerTracks.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
                  <AnimatePresence>
                    {workerTracks.map((track) => {
                      const isCurrent = currentTrack?.id === track.id;
                      return (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`p-2 bg-zinc-900/40 rounded-xl border border-[#1e1e24] hover:border-gray-700 flex items-center justify-between group gap-2 ${
                            isCurrent ? "border-[#1db954]/40 bg-[#1db954]/5" : ""
                          }`}
                        >
                          <div
                            onClick={() => onSelectTrack(track)}
                            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          >
                            <img src={track.coverUrl} className="w-8 h-8 rounded-md object-cover shrink-0" />
                            <div className="min-w-0">
                              <h4 className={`text-[11px] font-bold truncate ${isCurrent ? "text-[#1db954]" : "text-white"}`}>
                                {track.title}
                              </h4>
                              <p className="text-[9px] text-[#1db954] font-semibold truncate mt-0.5">{track.album}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onSelectTrack(track)}
                              className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-[#1db954] transition-colors cursor-pointer"
                            >
                              <Play size={10} className="fill-current" />
                            </button>
                            <button
                              onClick={() => onDeleteCustomTrack(track.id)}
                              className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                              title={t.deleteTrack}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-[11px] italic space-y-2">
                  <UploadCloud size={18} className="mx-auto text-gray-600 block" />
                  <p>{isRTL ? "لا توجد تراكات في خادمك السحابي بعد." : "No cloud tracks indexed on your worker yet."}</p>
                </div>
              )}
            </div>
          )}

          <div className="hidden md:block bg-[#0c0c0e]/30 border border-[#1e1e24] rounded-2xl p-5 text-center text-gray-400 space-y-2">
            <h4 className="text-white font-bold text-xs">Security Note</h4>
            <p className="text-[10px] leading-relaxed">
              {isRTL
                ? "جميع الملفات المرفقة والتسجيلات المضافة تحفظ في ذاكرة المستعرض المحلية الخاصة بك فقط لضمان الخصوصية والأمان التام."
                : "All hosted assets remain sandboxed directly inside your browser cache. Zero unauthorized telemetry is ever broadcast."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
