import React, { useState, useEffect, useRef } from "react";
import { RadioStation } from "../types";
import { MoreVertical, X, Edit2, Trash2, Radio as RadioIcon, Play } from "lucide-react";

interface RadioTabProps {
  activeStation: RadioStation | null;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  workerUrl: string;
  workerRadios: RadioStation[];
  onEditStation?: (station: RadioStation) => void;
  onDeleteStation?: (stationName: string) => void;
  isPlaying?: boolean;
}

export default function RadioTab({
  activeStation,
  onSelectStation,
  lang,
  workerUrl,
  workerRadios,
  onEditStation,
  onDeleteStation,
  isPlaying,
}: RadioTabProps) {
  const isRTL = false;
  const [radios, setRadios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuIndex, setMenuIndex] = useState<number>(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sorted = [...workerRadios].sort((a, b) => (Number(b.total_duration) || 0) - (Number(a.total_duration) || 0));
    setRadios(sorted);
    setIsLoading(false);
  }, [workerRadios]);

  const loadRadios = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      let cleanUrl = workerUrl.trim().replace(/\/$/, "");
      if (cleanUrl.includes("music-worker")) {
        cleanUrl = "https://radio-worker.ma68.workers.dev";
      }
      let data;

      // Try local Express proxy first if available
      try {
        const res = await fetch(`/api/worker/radios?workerUrl=${encodeURIComponent(cleanUrl)}`);
        if (res.ok) {
          data = await res.json();
        } else {
          console.warn("Proxy fetch failed, trying direct fetch...");
        }
      } catch (proxyErr) {
        console.warn("Proxy fetch threw error, trying direct fetch...", proxyErr);
      }

      // Fallback to direct fetch
      if (!data) {
        const res = await fetch(cleanUrl + '/radios');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          if (text.trim() === "OK") {
            data = [];
          } else {
            throw new Error(isRTL ? "تنسيق غير مدعوم من الخادم" : "Unsupported response format from worker");
          }
        }
      }

      const rawRadios = Array.isArray(data) ? data : [];
      const mappedRadios: RadioStation[] = rawRadios.map((r: any, i: number) => ({
        id: r.id || `worker-radio-${i}`,
        name: r.name || "Unknown Radio",
        frequency: r.frequency || r.genre || "Global",
        genre: r.genre || "General",
        logoUrl: r.logo || r.logoUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400",
        streamUrl: r.url || r.streamUrl || "",
        description: r.description || "",
        total_duration: r.total_duration ? Number(r.total_duration) : 0
      }));

      const sortedMapped = [...mappedRadios].sort((a, b) => (Number(b.total_duration) || 0) - (Number(a.total_duration) || 0));
      setRadios(sortedMapped);
    } catch (e: any) {
      console.error("Error loading radios:", e);
      let errMsg = e.message || "Failed to fetch";
      if (errMsg === "Failed to fetch") {
        errMsg = isRTL 
          ? "فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو رابط Worker."
          : "Could not connect to the worker. Check your Internet or Worker URL.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // We already receive workerRadios via props from App
    if (!workerRadios || workerRadios.length === 0) {
      if (workerUrl) loadRadios();
    }
  }, [workerUrl, workerRadios]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const playStation = (i: number) => {
    onSelectStation(radios[i]);
  };

  const openMenu = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuIndex(i);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    const isUpperHalf = i < radios.length / 2;
    // Estimated dropdown height: 2 buttons of ~40px + border + padding + small close bar = ~112px
    const menuHeight = 112;

    const top = isUpperHalf 
      ? rect.bottom + window.scrollY + 5 
      : rect.top + window.scrollY - menuHeight - 5;

    setDropdownPos({
      top,
      left: Math.max(10, rect.left - 130)
    });
  };

  const closeMenu = () => {
    setMenuIndex(-1);
  };

  const modifierFromMenu = () => {
    if (menuIndex === -1) return;
    const r = radios[menuIndex];
    closeMenu();
    if (onEditStation) {
      onEditStation(r);
    }
  };

  const supprimerFromMenu = async () => {
    if (menuIndex === -1) return;
    const r = radios[menuIndex];
    closeMenu();
    if (!confirm(isRTL ? `هل متأكد من حذف "${r.name}"؟` : `Delete "${r.name}"?`)) return;
    
    // Optimistic UI update: instantly update local list
    const originalRadios = [...radios];
    setRadios((prev) => prev.filter((item) => item.name !== r.name));
    
    // Notify parent to filter it out from workerRadios state too
    if (onDeleteStation) {
      onDeleteStation(r.name);
    }

    try {
      let cleanUrl = workerUrl.trim().replace(/\/$/, "");
      if (cleanUrl.includes("music-worker")) {
        cleanUrl = "https://radio-worker.ma68.workers.dev";
      }
      const res = await fetch(cleanUrl + '/radios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: r.name })
      });
      const data = await res.json();
      if (data.ok) {
        // Silently reload in background, no full loading screen
        loadRadios(true);
      } else {
        alert(isRTL ? 'خطأ في الحذف' : 'Deletion error');
        setRadios(originalRadios);
      }
    } catch (e) {
      alert(isRTL ? 'خطأ في الاتصال' : 'Connection error');
      setRadios(originalRadios);
    }
  };

  return (
    <div className="space-y-4 text-zinc-800">
      <style>{`
        @keyframes soundBar1 {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes soundBar2 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
        @keyframes soundBar3 {
          0%, 100% { height: 5px; }
          50% { height: 16px; }
        }
        @keyframes soundBar4 {
          0%, 100% { height: 3px; }
          50% { height: 10px; }
        }
        .animate-sound-bar-1 { animation: soundBar1 0.7s ease-in-out infinite; }
        .animate-sound-bar-2 { animation: soundBar2 0.9s ease-in-out infinite; }
        .animate-sound-bar-3 { animation: soundBar3 0.6s ease-in-out infinite; }
        .animate-sound-bar-4 { animation: soundBar4 0.8s ease-in-out infinite; }
      `}</style>
      {/* Grid: Main library & Info detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Radio Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-zinc-500 animate-pulse text-xs font-mono uppercase tracking-widest">
                {isRTL ? "جاري تحميل المحطات..." : "Synchronizing Radio Frequencies..."}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500 text-xs font-mono uppercase tracking-widest gap-2">
                <div>❌ {isRTL ? "فشل التحميل" : "Error loading radios"}</div>
                <div className="text-[10px] text-zinc-400 normal-case">{error}</div>
                <button 
                  onClick={loadRadios}
                  className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  {isRTL ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            ) : radios.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                {isRTL ? "❌ فشل التحميل أو لا توجد محطات" : "❌ No stations detected"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {radios.map((r, i) => {
                  const isActive = activeStation?.name === r.name;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 p-1.5 px-1 sm:px-1.5 hover:bg-zinc-50 transition-all duration-300 cursor-pointer group ${
                        isActive ? "bg-[#3b82f6]/10" : ""
                      }`}
                      onClick={() => playStation(i)}
                    >
                      {/* 1. Index / Play Icon */}
                      <div className="w-5 flex items-center justify-center shrink-0">
                        <span className="font-mono text-[10px] text-zinc-400 group-hover:hidden w-full text-center">
                          {i + 1}
                        </span>
                        <div className="hidden group-hover:flex items-center justify-center w-full animate-pulse">
                          <Play size={10} className={isActive ? "text-[#3b82f6]" : "text-zinc-600"} />
                        </div>
                      </div>

                      {/* 2. Logo */}
                      <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-xl bg-zinc-100 shadow-sm border border-zinc-100 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
                          {r.logoUrl ? (
                             <img 
                              src={r.logoUrl} 
                              alt={r.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const icon = document.createElement('div');
                                  icon.textContent = '📻';
                                  parent.appendChild(icon);
                                }
                              }}
                            />
                          ) : (
                            <RadioIcon size={20} className="text-zinc-400" />
                          )}
                        </div>
                      </div>

                      {/* 3. Name & Frequency */}
                      <div className="flex-1 min-w-0 px-2 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className={`font-semibold text-[13px] truncate transition-colors ${
                             isActive ? "text-[#3b82f6] font-bold" : "text-zinc-800 group-hover:text-[#3b82f6]"
                          }`}>
                            {r.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {r.frequency || r.genre}
                          </p>
                        </div>

                        {/* Inline Sound Bars */}
                        {isActive && (
                          <div className="flex items-end gap-[3px] h-4 px-2 shrink-0 self-center" title={isPlaying ? "Playing" : "Paused"}>
                            <span className={`w-[3px] bg-[#3b82f6] rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-sound-bar-1' : 'h-[3px]'}`} />
                            <span className={`w-[3px] bg-[#3b82f6] rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-sound-bar-2' : 'h-[6px]'}`} />
                            <span className={`w-[3px] bg-[#3b82f6] rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-sound-bar-3' : 'h-[4px]'}`} />
                            <span className={`w-[3px] bg-[#3b82f6] rounded-t-full transition-all duration-300 ${isPlaying ? 'animate-sound-bar-4' : 'h-[2px]'}`} />
                          </div>
                        )}
                      </div>

                      {/* 4. Options Menu */}
                      <div className="shrink-0 flex items-center">
                        <button 
                          className="p-1 px-1.5 -mr-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMenu(i, e);
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Current Insight panel for Radio */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4 text-center">
            <h3 className="font-sans font-bold text-xs text-zinc-400 uppercase tracking-widest text-left">
              {isRTL ? "معلومات البث المباشر" : "Live Stream Insight"}
            </h3>
            {activeStation ? (
              <div className="space-y-4 animate-fade-in">
                <div className="relative group mx-auto w-24 h-24">
                  <div className="w-full h-full rounded-2xl bg-zinc-100 shadow-md border border-zinc-100 overflow-hidden flex items-center justify-center">
                    {activeStation.logoUrl ? (
                      <img
                        src={activeStation.logoUrl}
                        alt={activeStation.name}
                        className="w-full h-full object-cover animate-pulse"
                      />
                    ) : (
                      <RadioIcon size={32} className="text-[#3b82f6] animate-bounce" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3b82f6]">{activeStation.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">{activeStation.frequency || activeStation.genre || "Live Frequency"}</p>
                </div>
                <div className="text-[11px] text-zinc-600 leading-relaxed italic bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-left">
                  {activeStation.description || (isRTL 
                    ? "» استمع إلى البث المباشر لمحطة الراديو المفضلة لديك بالتردد الأمثل والتزامن الدائم في الخلفية. «" 
                    : "» Stream high-fidelity direct audio feeds seamlessly synchronized in the background with premium real-time decoding. «")}
                </div>
              </div>
            ) : (
              <div className="text-zinc-400 text-xs py-12 italic">
                {isRTL ? "الرجاء اختيار محطة راديو لعرض تفاصيل التردد والبث المباشر" : "Please select a Radio Station to view dynamic broadcast details"}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuIndex !== -1 && (
        <div 
          ref={dropdownRef}
          className="fixed bg-white border border-zinc-200 rounded-xl overflow-hidden z-[100] min-w-[150px] shadow-2xl animate-fade-in"
          style={{ 
            top: `${dropdownPos.top}px`, 
            left: `${dropdownPos.left}px` 
          }}
        >
          <button 
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors text-left"
            onClick={modifierFromMenu}
          >
            <Edit2 size={13} className="text-zinc-400" />
            {isRTL ? "تعديل" : "Modify Station"}
          </button>
          <button 
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-zinc-50 text-red-500 text-xs font-semibold transition-colors text-left border-t border-zinc-100"
            onClick={supprimerFromMenu}
          >
            <Trash2 size={13} />
            {isRTL ? "حذف" : "Remove Station"}
          </button>
          <div className="bg-zinc-50 px-4 py-1 flex justify-end border-t border-zinc-100">
            <button onClick={closeMenu} className="text-[9px] text-zinc-400 hover:text-zinc-600 font-bold uppercase tracking-wider">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


