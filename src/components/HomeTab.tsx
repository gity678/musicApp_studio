import React from "react";
import { Youtube, Music, Radio, Compass, Play, Plus, Search, Heart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HomeTabProps {
  lang: "en" | "ar";
  translations: any;
  setActiveTab: (tab: string) => void;
}

export default function HomeTab({
  lang,
  translations,
  setActiveTab,
}: HomeTabProps) {
  const isRTL = lang === "ar";

  const cards = [
    {
      id: "music",
      title: isRTL ? "المكتبة الموسيقية" : "Music Library",
      desc: isRTL ? "استمع إلى مفضلاتك" : "Listen to your favorites",
      icon: <Music className="text-emerald-400" size={24} />,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "radio",
      title: isRTL ? "محطات الراديو" : "Live Radio",
      desc: isRTL ? "أثير العالم بين يديك" : "Global stations on-air",
      icon: <Radio className="text-blue-400" size={24} />,
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/20"
    },
    {
      id: "upload",
      title: isRTL ? "إضافة موسيقى" : "Add & Upload",
      desc: isRTL ? "ارفع اغانيك من يوتيوب" : "Fetch from YouTube",
      icon: <Youtube className="text-red-400" size={24} />,
      color: "from-red-500/20 to-red-500/5",
      borderColor: "border-red-500/20"
    }
  ];


  return (
    <div className="space-y-4 py-2 px-4 md:px-8 max-w-lg mx-auto" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* Hero Welcome Section - Balanced Mobile Design */}
      <section className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-zinc-950 to-black rounded-2xl -z-10" />
        <div className="p-5 md:p-7 space-y-3">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-2xl md:text-3xl font-black tracking-tight"
            >
              {isRTL ? "مرحباً بك،" : "Good vibrations,"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-[200px]"
            >
              {isRTL 
                ? "ابدأ رحلتك الصوتية اليوم واستكشف عالم الموسيقى."
                : "Your high-fidelity gateway to universal sound and rhythm."}
            </motion.p>
          </div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex gap-2.5"
          >
            <button 
              onClick={() => setActiveTab("music")}
              className="bg-[#1db954] text-black px-5 py-2 rounded-full font-black text-[11px] hover:bg-[#1ed760] transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>{isRTL ? "ابدأ" : "Play"}</span>
            </button>
            <button 
              onClick={() => setActiveTab("upload")}
              className="bg-white/5 text-white border border-white/10 px-5 py-2 rounded-full font-black text-[11px] hover:bg-white/10 transition-colors active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            >
              <Plus size={12} />
              <span>{isRTL ? "إضافة" : "Add"}</span>
            </button>
          </motion.div>
        </div>
        
        {/* Subtle Decorative Icon */}
        <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none">
          <Music size={56} className="text-white transform rotate-12" />
        </div>
      </section>

      {/* Categories - Professional App List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-white text-[9px] font-black tracking-[0.25em] uppercase opacity-40">
            {isRTL ? "الأقسام" : "Categories"}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveTab(card.id)}
              className={`relative bg-gradient-to-r ${card.color} border ${card.borderColor} rounded-xl p-4 cursor-pointer group hover:border-white/20 transition-all active:scale-[0.98] flex items-center justify-between shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-black/40 rounded-lg group-hover:scale-110 transition-transform shrink-0 border border-white/5">
                  {React.cloneElement(card.icon as React.ReactElement, { size: 18 })}
                </div>
                <div className="text-left space-y-0.5">
                  <h3 className="text-white font-bold text-sm tracking-tight">{card.title}</h3>
                  <p className="text-zinc-500 text-[9px] font-medium opacity-80">{card.desc}</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-white/5 transition-all">
                <ArrowRight size={12} className={isRTL ? "rotate-180" : ""} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
