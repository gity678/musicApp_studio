import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-8">
      {/* Centered Premium Welcome Gateway Card */}
      <div 
        id="welcome-gateway-card"
        className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden bg-gradient-to-r from-zinc-900/40 via-emerald-950/20 to-black/60 border border-emerald-500/10 p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center md:text-right"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        <div className="relative z-10 space-y-6 md:space-y-8 flex flex-col items-center">
          <h1 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-white leading-tight text-center">
            {isRTL ? "أهلاً بك في منصة سبوتيفايّ" : "Welcome back to Spotifyy"}
          </h1>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed text-center max-w-lg">
            {isRTL
              ? "بوابة تحويل وتلقي وبث الموسيقى الخاصة بك. استكشف مكتبات الموسيقى أو استمع إلى قنوات الراديو الحية من جميع أنحاء العالم."
              : "Your decentralized high-fidelity sonic gateway. Seamlessly explore beautiful musical frequencies or stream live global internet radio dials instantly."}
          </p>

          {/* Simple Clean Navigation Group targeting Music and Radio only */}
          <div className="pt-4 flex flex-row flex-wrap items-center justify-center gap-3 md:gap-4">
            <button
              id="gateway-nav-music"
              onClick={() => setActiveTab("music")}
              className="bg-[#1db954] text-black hover:bg-[#27eb60] px-6 py-3.5 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-bold transition-all duration-300 transform active:scale-95 shadow-[0_8px_20px_rgba(29,185,84,0.35)] cursor-pointer flex items-center gap-2"
            >
              <span>{isRTL ? "صفحة الموسيقى" : "Explore Music"}</span>
              {isRTL ? <ArrowLeft size={16} className="scale-x-[-1]" /> : <ArrowRight size={16} />}
            </button>
            
            <button
              id="gateway-nav-radio"
              onClick={() => setActiveTab("radio")}
              className="border border-zinc-800 text-white hover:bg-zinc-900 hover:text-white px-6 py-3.5 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer"
            >
              {isRTL ? "صفحة الراديو" : "Radio Dials"}
            </button>
          </div>
        </div>
        
        {/* Decorative subtle visual background glow */}
        <div className="absolute right-1/2 translate-x-1/2 bottom-0 top-0 w-2/3 bg-radial-[circle_at_center] from-emerald-500/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
