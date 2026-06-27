import React from "react";
import { Youtube, Music, Compass, Play, Plus, Search, Heart, ArrowRight, LogOut } from "lucide-react";
import Radio from "./ClassicRadioIcon";
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
    <div className="w-full h-full flex flex-col" style={{ direction: "ltr" }}>
      
      <style>{`
        @keyframes shimmerBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* SINGLE Magnificent Integrated Container */}
      <section className="relative overflow-hidden w-full h-full flex-1 flex flex-col justify-center sm:justify-between bg-zinc-950/95 backdrop-blur-xl p-5 sm:p-8 space-y-6">
        
        {/* Absolute Logout Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => {
              window.location.href = "/logout";
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 text-[10px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer select-none"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>

        {/* Animated fluid ambient glow inside the container */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-zinc-900/40 to-emerald-400/5 -z-10" />
        
        {/* Decorative backdrop patterns */}
        <div className="absolute inset-y-0 right-0 w-1/3 bg-radial-[circle_at_right] from-emerald-500/15 via-transparent to-transparent pointer-events-none opacity-80" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic EXCITING Logo Section */}
        <div className="relative flex flex-col items-center justify-center py-2">
          {/* Accent radial glow behind the logo */}
          <div className="absolute w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center justify-center">
            {/* 1. Animated outer glowing dashboard ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border-2 border-dashed border-emerald-500/30 opacity-70"
            />
            
            {/* 2. Pulsing neon halo */}
            <motion.div
              animate={{ scale: [0.95, 1.15, 0.95] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
            />
            
            {/* 3. Exciting 3D-styled vinyl record disk */}
            <motion.div
              animate={{ 
                rotate: 360
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative z-10 w-16 h-16 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-2xl cursor-pointer hover:border-emerald-400 transition-colors"
            >
              {/* Vinyl record grooves */}
              <div className="absolute inset-1.5 rounded-full border border-black/80" />
              <div className="absolute inset-3 rounded-full border border-zinc-800" />
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/35" />
              
              {/* Central glowing core badge */}
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_#10b981]">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
              </div>
            </motion.div>

            {/* Orbiting music note icons */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 pointer-events-none"
            >
              <Music size={12} className="absolute top-0 left-1/2 -translate-x-1/2 text-emerald-400 drop-shadow-[0_0_5px_#10b981]" />
              <Music size={10} className="absolute bottom-0 left-1/2 -translate-x-1/2 text-emerald-400/70" />
            </motion.div>
          </div>

          {/* Shimmering Text Logo & Modern dynamic sound bars */}
          <div className="flex flex-col items-center mt-3.5 space-y-1">
            <div className="flex items-center gap-2">
              <motion.span 
                className="font-sans font-black text-4xl sm:text-5xl tracking-widest bg-gradient-to-r from-emerald-400 via-emerald-100 to-emerald-500 bg-clip-text text-transparent bg-[size:200%_auto] text-center filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
                style={{ 
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  animation: "shimmerBg 3s linear infinite"
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                musicy
              </motion.span>
            </div>

            {/* High fidelity energy equalizer bars */}
            <div className="flex items-end gap-[3px] h-3.5 mt-0.5 pointer-events-none">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 14, 4] }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.08
                  }}
                  className={`w-[2.5px] rounded-full ${i % 2 === 0 ? "bg-emerald-400" : "bg-emerald-500"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Elegant separator */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Hero Welcome & Actions - Integrated context */}
        <div className="space-y-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gateway to Sound</span>
              </motion.div>
            </div>
            
            <div className="space-y-1">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-xl sm:text-2xl font-black tracking-tight"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Good vibrations,
              </motion.h1>
              <p className="text-zinc-400 text-xs font-semibold leading-relaxed max-w-sm mx-auto sm:mx-0">
                Your high-fidelity gateway to universal sound and rhythm. Explore curated playlists, live radio streams, or upload your own favorites.
              </p>
            </div>
          </div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="flex flex-wrap gap-2 justify-center sm:justify-start"
          >
            <button 
              onClick={() => setActiveTab("upload")}
              className="bg-[#1db954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-full font-black text-[11px] transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={11} strokeWidth={3} />
              <span>Add Music</span>
            </button>
            <button 
              onClick={() => setActiveTab("add_radio")}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-full font-black text-[11px] transition-all duration-300 active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
            >
              <Plus size={11} strokeWidth={3} />
              <span>Add Station</span>
            </button>
          </motion.div>
        </div>

        {/* Elegant separator */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Categories Grid - Seamless Bottom Integration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-zinc-500 text-[9px] font-black tracking-[0.25em] uppercase opacity-75">
              Categories
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveTab(card.id)}
                className={`relative bg-gradient-to-b ${card.color} border ${card.borderColor} rounded-xl px-2 py-3 cursor-pointer group hover:border-white/20 transition-all active:scale-[0.98] flex flex-col items-center justify-center text-center shadow-md`}
              >
                <div className="p-2 bg-black/40 rounded-lg group-hover:scale-110 transition-transform shrink-0 border border-white/5 mb-1.5">
                  {React.cloneElement(card.icon as React.ReactElement, { size: 14 })}
                </div>
                <h3 className="text-white font-extrabold text-[10px] sm:text-[11px] tracking-tight">{card.title}</h3>
                <p className="text-zinc-500 text-[8px] font-medium opacity-80 mt-0.5">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating subtle feedback bar decoration */}
        <div className="absolute right-6 bottom-4 flex items-end gap-[3px] h-10 opacity-15 pointer-events-none">
          <motion.div animate={{ height: [10, 30, 10] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-emerald-400 rounded-full" />
          <motion.div animate={{ height: [20, 10, 20] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-emerald-300 rounded-full" />
          <motion.div animate={{ height: [15, 38, 15] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] bg-emerald-500 rounded-full" />
        </div>
      </section>

    </div>
  );
}
