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
  const isRTL = false;

  const cards = [
    {
      id: "music",
      title: "Music Library",
      desc: "Favorites",
      icon: <Music className="text-emerald-400" size={24} />,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "radio",
      title: "Live Radio",
      desc: "On-air",
      icon: <Radio className="text-blue-400" size={24} />,
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/20"
    },
    {
      id: "youtube",
      title: "YouTube",
      desc: "Stream",
      icon: <Youtube className="text-red-400" size={24} />,
      color: "from-red-500/20 to-red-500/5",
      borderColor: "border-red-500/20"
    }
  ];


  return (
    <div className="space-y-3 py-1 px-3 sm:px-4 max-w-lg mx-auto w-full" style={{ direction: "ltr" }}>
      
      {/* Hero Welcome Section - Dynamic Mobile Header */}
      <section className="relative overflow-hidden group rounded-2xl sm:rounded-3xl border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-black -z-10" />
        <div className="p-5 sm:p-6 space-y-2.5">
          <div className="space-y-0.5">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-xl sm:text-2xl font-black tracking-tight"
            >
              Good vibrations,
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-[10px] sm:text-xs font-medium leading-relaxed max-w-[240px]"
            >
              Your high-fidelity gateway to universal sound and rhythm.
            </motion.p>
          </div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex flex-wrap gap-1.5 sm:gap-2"
          >
            <button 
              onClick={() => setActiveTab("music")}
              className="bg-[#1db954] text-black px-4 py-1.5 rounded-full font-black text-[10px] sm:text-[11px] hover:bg-[#1ed760] transition-colors shadow-lg active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Play size={10} fill="currentColor" />
              <span>Play</span>
            </button>
            <button 
              onClick={() => setActiveTab("upload")}
              className="bg-white/5 text-white border border-white/10 px-4 py-1.5 rounded-full font-black text-[10px] sm:text-[11px] hover:bg-white/10 transition-colors active:scale-95 flex items-center gap-1 cursor-pointer backdrop-blur-sm"
            >
              <Plus size={10} />
              <span>Add Music</span>
            </button>
            <button 
              onClick={() => setActiveTab("add_radio")}
              className="bg-teal-500 hover:bg-teal-400 active:scale-95 text-black px-4 py-1.5 rounded-full font-black text-[10px] sm:text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-lg"
            >
              <Plus size={10} />
              <span>Add Station</span>
            </button>
          </motion.div>
        </div>
        
        {/* Subtle Decorative Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Music size={60} className="text-white transform rotate-12" />
        </div>
      </section>

      {/* Categories - Professional App List */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-zinc-500 text-[9px] font-black tracking-[0.25em] uppercase opacity-60">
            Categories
          </h2>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveTab(card.id)}
              className={`relative bg-gradient-to-b ${card.color} border ${card.borderColor} rounded-xl px-2 py-3 cursor-pointer group hover:border-white/20 transition-all active:scale-[0.98] flex flex-col items-center justify-center text-center shadow-md`}
            >
              <div className="p-2 bg-black/40 rounded-lg group-hover:scale-110 transition-transform shrink-0 border border-white/5 mb-1.5">
                {React.cloneElement(card.icon as React.ReactElement, { size: 16 })}
              </div>
              <h3 className="text-white font-extrabold text-[11px] sm:text-xs tracking-tight">{card.title}</h3>
              <p className="text-zinc-500 text-[8px] font-medium opacity-80 mt-0.5">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
