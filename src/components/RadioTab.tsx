import React, { useState, useEffect, useRef } from "react";
import { RadioStation } from "../types";
import { MoreVertical, X, Edit2, Trash2 } from "lucide-react";

const WORKER = 'https://radio-worker.ma68.workers.dev';

interface RadioTabProps {
  stations: RadioStation[];
  activeStation: RadioStation | null;
  isPlaying: boolean;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  translations: any;
}

export default function RadioTab({
  activeStation,
  onSelectStation,
  lang,
}: RadioTabProps) {
  const isRTL = lang === "ar";
  const [radios, setRadios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuIndex, setMenuIndex] = useState<number>(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadRadios = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(WORKER + '/radios');
      const data = await res.json();
      setRadios(data);
    } catch (e) {
      console.error("Error loading radios:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRadios();
  }, []);

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
    const r = radios[i];
    // Map worker radio to RadioStation type expected by App
    const station: RadioStation = {
      id: `worker-radio-${i}`,
      name: r.name,
      genre: "Worker Radio",
      streamUrl: r.url || r.streamUrl, // depending on worker schema
      logoUrl: r.logo || "",
      frequency: "Live",
      description: ""
    };
    onSelectStation(station);
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
      const res = await fetch(WORKER + '/radios', {
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
                    {r.logo ? (
                      <img 
                        src={r.logo} 
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

