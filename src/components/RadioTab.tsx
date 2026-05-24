import React, { useState, useEffect, useRef } from "react";
import { RadioStation } from "../types";
import { MoreVertical, X, Edit2, Trash2 } from "lucide-react";

interface RadioTabProps {
  activeStation: RadioStation | null;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  workerUrl: string;
  workerRadios: RadioStation[];
}

export default function RadioTab({
  activeStation,
  onSelectStation,
  lang,
  workerUrl,
  workerRadios,
}: RadioTabProps) {
  const isRTL = lang === "ar";
  const [radios, setRadios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuIndex, setMenuIndex] = useState<number>(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRadios(workerRadios);
    setIsLoading(false);
  }, [workerRadios]);

  const loadRadios = async () => {
    setIsLoading(true);
    setError(null);
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
        description: r.description || ""
      }));

      setRadios(mappedRadios);
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
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    // Position dropdown (simplified logic from snippet)
    setDropdownPos({
      top: rect.top - 80, // roughly
      left: rect.left - 120
    });
  };

  const closeMenu = () => {
    setMenuIndex(-1);
  };

  const modifierFromMenu = () => {
    if (menuIndex === -1) return;
    const r = radios[menuIndex];
    closeMenu();
    // In this app, we'll just alert or if we had a proper route we'd use it.
    // The snippet used window.location.href. 
    // We can potentially notify the user or perform some other action.
    alert(isRTL ? `تعديل: ${r.name}` : `Modify: ${r.name}`);
  };

  const supprimerFromMenu = async () => {
    if (menuIndex === -1) return;
    const r = radios[menuIndex];
    closeMenu();
    if (!confirm(isRTL ? `هل متأكد من حذف "${r.name}"؟` : `Delete "${r.name}"?`)) return;
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
        loadRadios();
      } else {
        alert(isRTL ? 'خطأ في الحذف' : 'Deletion error');
      }
    } catch (e) {
      alert(isRTL ? 'خطأ في الاتصال' : 'Connection error');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
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
          <div className="grid grid-cols-2 gap-2 p-2">
            {radios.map((r, i) => {
              const isActive = activeStation?.name === r.name;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-xl border border-transparent transition-all cursor-pointer group min-w-0 overflow-hidden ${
                    isActive 
                      ? "bg-[#e91e63]/20 border-[#e91e63]/50" 
                      : "bg-black/10 hover:bg-black/20"
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg bg-white/10 shrink-0 overflow-hidden flex items-center justify-center text-lg"
                    onClick={() => playStation(i)}
                  >
                    {r.logoUrl ? (
                      <img 
                        src={r.logoUrl} 
                        alt={r.name} 
                        className="w-full h-full object-contain p-0.5 bg-white rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.hidden = true;
                          target.parentElement!.textContent = '📻';
                        }}
                      />
                    ) : (
                      '📻'
                    )}
                  </div>
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => playStation(i)}
                  >
                    <div className={`text-[11px] font-medium truncate ${isActive ? "text-[#e91e63]" : "text-zinc-800"}`}>
                      {r.name}
                    </div>
                  </div>
                  <button 
                    className="shrink-0 p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                    onClick={(e) => openMenu(i, e)}
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {menuIndex !== -1 && (
        <div 
          ref={dropdownRef}
          className="fixed bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-[100] min-w-[160px] shadow-2xl animate-fade-in"
          style={{ 
            top: `${dropdownPos.top}px`, 
            left: `${dropdownPos.left}px` 
          }}
        >
          <button 
            className="flex justify-between items-center w-full px-4 py-3 hover:bg-white/10 text-white text-sm transition-colors text-left"
            onClick={modifierFromMenu}
          >
            <span className="flex items-center gap-2">
              <Edit2 size={14} />
              {isRTL ? "تعديل" : "Modifier"}
            </span>
            <X size={12} className="text-zinc-500" onClick={(e) => { e.stopPropagation(); closeMenu(); }} />
          </button>
          <button 
            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-white/10 text-red-500 text-sm transition-colors text-left"
            onClick={supprimerFromMenu}
          >
            <Trash2 size={14} />
            {isRTL ? "حذف" : "Supprimer"}
          </button>
        </div>
      )}
    </div>
  );
}

