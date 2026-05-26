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
    <div className="space-y-8 py-6 px-5 md:px-8 max-w-lg mx-auto" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      
      {/* Hero Welcome Section - Balanced Mobile Design */}
      <section className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-zinc-950 to-black rounded-3xl -z-10" />
        <div className="p-8 md:p-10 space-y-5">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-3xl md:text-4xl font-black tracking-tight"
            >
              {isRTL ? "مرحباً بك،" : "Good vibrations,"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed max-w-[240px]"
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
             className="flex gap-3"
          >
            <button 
              onClick={() => setActiveTab("music")}
              className="bg-[#1db954] text-black px-6 py-3 rounded-full font-black text-xs hover:bg-[#1ed760] transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              <span>{isRTL ? "ابدأ الاستماع" : "Start Now"}</span>
            </button>
            <button 
              onClick={() => setActiveTab("upload")}
              className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-full font-black text-xs hover:bg-white/10 transition-colors active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Plus size={14} />
              <span>{isRTL ? "إضافة" : "Add"}</span>
            </button>
          </motion.div>
        </div>
        
        {/* Subtle Decorative Icon */}
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Music size={80} className="text-white transform rotate-12" />
        </div>
      </section>

      {/* Categories - Professional App List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-white text-[10px] font-black tracking-[0.25em] uppercase opacity-40">
            {isRTL ? "استكشف الأقسام" : "Explore Categories"}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3.5">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveTab(card.id)}
              className={`relative bg-gradient-to-r ${card.color} border ${card.borderColor} rounded-2xl p-5 cursor-pointer group hover:border-white/20 transition-all active:scale-[0.98] flex items-center justify-between shadow-xl`}
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-black/40 rounded-xl group-hover:scale-110 transition-transform shrink-0 border border-white/5">
                  {React.cloneElement(card.icon as React.ReactElement, { size: 22 })}
                </div>
                <div className="text-left space-y-0.5">
                  <h3 className="text-white font-bold text-base tracking-tight">{card.title}</h3>
                  <p className="text-zinc-500 text-[10px] font-medium opacity-80">{card.desc}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-white/5 transition-all">
                <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer - Elegant Branding */}
      <footer className="text-center pt-10 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">
            Spotifyy Sonic Engine 2.0
          </p>
        </div>
      </footer>


      
    </div>
  );
}
