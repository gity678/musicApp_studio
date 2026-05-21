import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Plus, Trash2, Play, Check, Server, Library, Sparkles } from "lucide-react";
import { RadioStation } from "../types";

interface AddRadioTabProps {
  customStations: RadioStation[];
  onAddCustomStation: (station: RadioStation) => void;
  onDeleteCustomStation: (id: string) => void;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  translations: any;
  currentStation: RadioStation | null;
}

export default function AddRadioTab({
  customStations,
  onAddCustomStation,
  onDeleteCustomStation,
  onSelectStation,
  lang,
  translations,
  currentStation,
}: AddRadioTabProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  // Forms State
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLogo, setSelectedLogo] = useState("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80");
  const [statusMessage, setStatusMessage] = useState("");

  const logoPresets = [
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim() || !name.trim()) return;

    const newStation: RadioStation = {
      id: `custom-radio-${Date.now()}`,
      name: name.trim(),
      genre: genre.trim() || (isRTL ? "منوعة" : "General"),
      streamUrl: streamUrl.trim(),
      logoUrl: selectedLogo,
      frequency: frequency.trim() || "100.0 FM",
      description: description.trim() || (isRTL ? "بث قنوات راديو مباشرة مضافة يدوياً" : "Custom Added Internet Live Webcast")
    };

    onAddCustomStation(newStation);
    
    // Clear forms
    setName("");
    setFrequency("");
    setStreamUrl("");
    setGenre("");
    setDescription("");
    setStatusMessage(t.addRadioSuccess);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  return (
    <div className="space-y-4 md:space-y-8 pb-4 md:pb-12">
      {/* Upper header banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-950/60 to-[#070709] border border-[#1e1e24] p-4 md:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3 md:space-y-4">
          <span className="font-mono text-[10px] md:text-xs text-[#1db954] uppercase tracking-widest font-bold bg-[#1db954]/10 border border-[#1db954]/20 px-3 py-1 rounded-full inline-block">
            {isRTL ? "مذياع الشبكة العالمي" : "Global Broadcasting Station Configurator"}
          </span>
          <h1 className="font-sans font-black text-2xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "صفحة تسجيل وإضافة الراديو" : "Configure Custom Live Radio"}
          </h1>
          <p className="text-gray-300 text-xs md:text-sm hidden md:block">
            {isRTL
              ? "هل تملك بث حيا لإذاعة مفضلة؟ اكتب العنوان، حدد مؤشر التردد، ألصق رابط البث الصامت، وافتح بثاً مباشراً دافق الرنين في لوحة التحكم الخاصة بك."
              : "Easily provision custom Shoutcast, Icecast, or direct HTTP webcasts. Type your frequency channel parameters to host them on the central dial dashboard instantly."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-teal-500/10 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms box */}
        <div className="lg:col-span-2">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4 md:space-y-6">
            <h2 className="font-sans font-bold text-sm md:text-lg text-white flex items-center gap-2">
              <Plus className="text-[#1db954]" size={18} />
              <span>{isRTL ? "بينات البث لمحطة الراديو" : "Broadcaster Configuration Details"}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                    {isRTL ? "اسم المحطة الإذاعية" : "Station Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.radioFormTitle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                    {isRTL ? "تكرار التردد الرقمي" : "FM/AM Frequency Code"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.radioFormFreq}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                    {isRTL ? "رابط تدفق البث الحي المباشر" : "Direct Stream URL (eg, Icecast / MP3 / AAC)"}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={t.radioFormUrl}
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                    {isRTL ? "التصنيف الإذاعي" : "Radio Genre Tag"}
                  </label>
                  <input
                    type="text"
                    placeholder={t.radioFormGenre}
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                  {isRTL ? "وصف ومحتوى المحطة" : "Station Catchphrase / About"}
                </label>
                <textarea
                  placeholder={t.radioFormDesc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#141419] border border-[#1e1e24] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1db954] transition-colors resize-none"
                />
              </div>

              {/* Logo selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase text-gray-400 font-bold block">
                  {isRTL ? "اختر شعار البث" : "Broadcast Station Visual Logo Theme"}
                </label>
                <div className="flex gap-2 flex-wrap animate-fade-in">
                  {logoPresets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedLogo(preset)}
                      className={`relative w-8 h-8 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedLogo === preset ? "border-[#1db954] scale-105" : "border-[#1e1e24] hover:opacity-80"
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
                <Radio size={14} />
                <span>{isRTL ? "حفظ وتفعيل محطة البث" : "Add Station to Tuner"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Custom Station Library */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] p-4 md:p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="font-sans font-bold text-xs md:text-sm text-white flex items-center gap-2">
              <Library size={14} className="text-teal-400" />
              <span>{isRTL ? "محطاتي المضافة يدوياً" : "Custom Stations Dials"} ({customStations.length})</span>
            </h3>

            {customStations.length > 0 ? (
              <div className="space-y-2 max-h-[200px] md:max-h-[450px] overflow-y-auto no-scrollbar pr-1">
                <AnimatePresence>
                  {customStations.map((station) => {
                    const isPlayingSelf = currentStation?.id === station.id;
                    return (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`p-2 bg-zinc-900/40 rounded-xl border border-[#1e1e24] hover:border-gray-700 flex items-center justify-between group gap-2 ${
                          isPlayingSelf ? "border-[#1db954]/40 bg-[#1db954]/5" : ""
                        }`}
                      >
                        <div
                          onClick={() => onSelectStation(station)}
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                        >
                          <img src={station.logoUrl} className="w-8 h-8 rounded-md object-cover shrink-0" />
                          <div className="min-w-0">
                            <h4 className={`text-[11px] font-bold truncate ${isPlayingSelf ? "text-teal-400" : "text-white"}`}>
                              {station.name}
                            </h4>
                            <p className="text-[9px] text-gray-400 truncate mt-0.5">{station.frequency}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSelectStation(station)}
                            className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-teal-400 transition-colors cursor-pointer"
                          >
                            <Play size={10} className="fill-current" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomStation(station.id)}
                            className="p-1 rounded bg-zinc-800 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                            title={t.deleteStation}
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
                <Server size={24} className="mx-auto text-gray-600 block animate-pulse" />
                <p>{isRTL ? "لا توجد قنوات راديو مضافة يدوياً." : "No custom radio stations loaded."}</p>
              </div>
            )}
          </div>

          <div className="hidden md:block bg-[#0c0c0e]/30 border border-[#1e1e24] rounded-2xl p-5 text-center text-gray-400 space-y-2">
            <h4 className="text-white font-bold text-xs">Live Audio Stream Tip</h4>
            <p className="text-[10px] leading-relaxed">
              {isRTL
                ? "قنوات المذياع ترتكز على بروتوكول البث النقي (HTTP Live). يرجى التأكد من أن العنوان يدعم تشكيلاً مباشراً وليس صفحة ويب عادية."
                : "Ensure your streaming URL starts with http(s) and directly points to the audio stream resource mount."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
