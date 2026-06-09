import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  FileJson, 
  Save, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronDown,
  Database,
  Key,
  Settings2,
  ChevronRight
} from "lucide-react";
import { RadioStation } from "../types";

const WORKER = 'https://radio-worker.ma68.workers.dev';

interface AddRadioTabProps {
  lang: "en" | "ar";
  stationToEdit?: RadioStation | null;
  onClearStationToEdit?: () => void;
}

export default function AddRadioTab({ lang, stationToEdit, onClearStationToEdit }: AddRadioTabProps) {
  const isRTL = lang === "ar";
  
  // App State
  const [mode, setMode] = useState<'modifier' | 'ajouter' | 'json'>('modifier');
  const [radios, setRadios] = useState<any[]>([]);
  const [originalName, setOriginalName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | 'loading' } | null>(null);

  // Form State
  const [radioName, setRadioName] = useState("");
  const [radioStream, setRadioStream] = useState("");
  const [radioPhoto, setRadioPhoto] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  // Supabase settings state
  const [dbUrl, setDbUrl] = useState(() => localStorage.getItem("spotifyy_supabase_url") || "");
  const [dbKey, setDbKey] = useState(() => localStorage.getItem("spotifyy_supabase_key") || "");
  const [dbTable, setDbTable] = useState(() => localStorage.getItem("spotifyy_supabase_table") || "radio_channels");
  const [showSupaConfig, setShowSupaConfig] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("spotifyy_supabase_url", dbUrl.trim());
    localStorage.setItem("spotifyy_supabase_key", dbKey.trim());
    localStorage.setItem("spotifyy_supabase_table", dbTable.trim() || "radio_channels");
    setStatus({
      msg: isRTL ? "✅ تم حفظ إعدادات Supabase بنجاح!" : "✅ Supabase credentials saved successfully!",
      type: "success"
    });
  };

  const loadRadios = async () => {
    try {
      const res = await fetch(WORKER + '/radios');
      const data = await res.json();
      setRadios(data);
    } catch (e) {
      console.error("Error loading radios:", e);
    }
  };

  useEffect(() => {
    loadRadios();
  }, []);

  useEffect(() => {
    if (stationToEdit) {
      setMode('modifier');
      setOriginalName(stationToEdit.name);
      setRadioName(stationToEdit.name);
      setRadioStream(stationToEdit.streamUrl || "");
      setRadioPhoto(stationToEdit.logoUrl || "");
    }
  }, [stationToEdit]);

  const clearForm = () => {
    setRadioName("");
    setRadioStream("");
    setRadioPhoto("");
    setOriginalName("");
    setJsonInput("");
    setStatus(null);
    onClearStationToEdit?.();
  };

  const handleFillForm = (index: string) => {
    if (index === "") {
      clearForm();
      return;
    }
    const r = radios[parseInt(index)];
    setOriginalName(r.name);
    setRadioName(r.name);
    setRadioStream(r.url || r.streamUrl || "");
    setRadioPhoto(r.logo || "");
  };

  const copyPrompt = () => {
    const text = document.getElementById("promptText")?.innerText.trim() || "";
    navigator.clipboard.writeText(text);
    setStatus({ msg: isRTL ? "تم النسخ!" : "JSON prompt copied!", type: 'success' });
    setTimeout(() => setStatus(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'json') {
      await submitJSON();
      return;
    }

    if (!radioName.trim() || !radioStream.trim()) {
      setStatus({ msg: isRTL ? "الاسم والرابط مطلوبان" : "Name and URL are required", type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatus({ msg: isRTL ? "جاري الحفظ..." : "Saving...", type: 'loading' });

    try {
      if (mode === 'ajouter') {
        const res = await fetch(WORKER + '/radios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: radioName, url: radioStream, logo: radioPhoto })
        });
        const data = await res.json();
        if (data.ok) {
          setStatus({ msg: isRTL ? "✅ تم إضافة المحطة!" : "✅ Station added!", type: 'success' });
          clearForm();
          loadRadios();
        } else {
          setStatus({ msg: `Error: ${data.error || 'Unknown'}`, type: 'error' });
        }
      } else {
        if (!originalName) {
          setStatus({ msg: isRTL ? "يرجى اختيار محطة" : "Select a station first", type: 'error' });
          setIsLoading(false);
          return;
        }
        // Worker pattern from snippet: DELETE then POST
        await fetch(WORKER + '/radios', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: originalName })
        });
        const res = await fetch(WORKER + '/radios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: radioName, url: radioStream, logo: radioPhoto })
        });
        const data = await res.json();
        if (data.ok) {
          setStatus({ msg: isRTL ? "✅ تم التعديل!" : "✅ Station modified!", type: 'success' });
          loadRadios();
        } else {
          setStatus({ msg: "Error modifying station", type: 'error' });
        }
      }
    } catch (e) {
      setStatus({ msg: "Connection error", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const submitJSON = async () => {
    const raw = jsonInput.trim();
    if (!raw) return;

    let parsedData;
    try {
      parsedData = JSON.parse(raw);
      if (!Array.isArray(parsedData)) parsedData = [parsedData];
    } catch (e: any) {
      setStatus({ msg: `Invalid JSON: ${e.message}`, type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatus({ msg: isRTL ? "جاري استيراد المحطات..." : "Importing stations...", type: 'loading' });

    // Automatically detect standard keys and map them to standard { name, url, logo } for the worker
    const validStations = parsedData.map((item: any) => {
      const name = item.name || item.title || item.stationName || item.station_name || "";
      const url = item.url || item.stream_url || item.streamUrl || item.stream || item.audioUrl || "";
      const logo = item.logo || item.logo_url || item.logoUrl || item.image || item.photo || item.imageUrl || "";
      return { name, url, logo };
    }).filter((r: any) => r.name && r.url);

    if (validStations.length === 0) {
      setStatus({ msg: isRTL ? "لم يتم العثور على محطات صالحة (الاسم والرابط مطلوبان)" : "No valid stations found (Name and URL are required)", type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(WORKER + '/radios/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validStations)
      });
      const result = await res.json();
      if (result.ok) {
        setStatus({ msg: isRTL ? `✅ تم استيراد ${validStations.length} محطة بنجاح!` : `✅ ${validStations.length} stations imported!`, type: 'success' });
        setJsonInput("");
        loadRadios();
      } else {
        setStatus({ msg: `Error: ${result.error || 'Unknown'}`, type: 'error' });
      }
    } catch (e: any) {
      setStatus({ msg: isRTL ? "خطأ في الاتصال بالـ Worker" : "Connection error to Worker", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Tab Switcher */}
      <div className="bg-zinc-100 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-zinc-200">
        <button 
          onClick={() => { setMode('modifier'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${mode === 'modifier' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
        >
          <Edit2 size={14} />
          <span>{isRTL ? "تعديل" : "Modifier"}</span>
        </button>
        <button 
          onClick={() => { setMode('ajouter'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${mode === 'ajouter' ? 'bg-[#e91e63] text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
        >
          <Plus size={14} />
          <span>{isRTL ? "إضافة" : "Ajouter"}</span>
        </button>
        <button 
          onClick={() => { setMode('json'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${mode === 'json' ? 'bg-[#e91e63] text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
        >
          <FileJson size={14} />
          <span>JSON</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
        {(mode === 'modifier' || mode === 'ajouter') && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">{isRTL ? "اسم المحطة" : "Station Name"}</label>
              <input 
                type="text" 
                value={radioName}
                onChange={(e) => setRadioName(e.target.value)}
                placeholder="Ex: BBC Arabic" 
                className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 text-sm outline-none focus:border-zinc-900 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">{isRTL ? "رابط البث" : "Stream URL"}</label>
              <input 
                type="text" 
                value={radioStream}
                onChange={(e) => setRadioStream(e.target.value)}
                placeholder="https://..." 
                className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">{isRTL ? "رابط الصورة (اختياري)" : "Photo Link (Optional)"}</label>
              <input 
                type="text" 
                value={radioPhoto}
                onChange={(e) => setRadioPhoto(e.target.value)}
                placeholder="https://..." 
                className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 text-sm outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-[#e91e63] hover:bg-[#d81b60] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm shadow-pink-100/50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{mode === 'modifier' ? (isRTL ? "حفظ التعديلات" : "Sauvegarder") : (isRTL ? "تأكيد الإضافة" : "Confirmer")}</span>
            </button>
          </form>
        )}

        {mode === 'json' && (
          <div className="space-y-5">
            {/* Original Input Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">
                {isRTL ? "ألصق بيانات JSON هنا" : "Paste JSON Array Data"}
              </label>
              <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "BBC Radio", "url": "https://stream.live.vc/..."}, ...]'
                className="w-full h-28 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-mono outline-none focus:border-zinc-900 transition-colors resize-none overflow-y-auto no-scrollbar"
              />
            </div>

            {/* AI Generator Helper */}
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl animate-fade-in">
              <p id="promptText" className="text-[10px] text-pink-800 leading-relaxed font-mono whitespace-pre-wrap opacity-85">
                {"Génère une liste de stations de radio en JSON : [{\"name\": \"...\", \"url\": \"...\", \"logo\": \"...\"}]"}
              </p>
            </div>

            {/* Action Buttons in a single row sharing width */}
            <div className="flex gap-3">
              <button 
                onClick={copyPrompt}
                type="button"
                className="flex-1 py-4 bg-[#e91e63] hover:bg-[#d81b60] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm shadow-pink-100/50 text-[11px] sm:text-xs text-center"
              >
                <Copy size={14} />
                <span>{isRTL ? "نسخ مطالبة الـ AI" : "Copy AI Prompt"}</span>
              </button>

              <button 
                disabled={isLoading || !jsonInput}
                onClick={submitJSON}
                className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-850 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm shadow-zinc-200 text-[11px] sm:text-xs text-center"
              >
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : <FileJson size={14} />}
                <span>{isRTL ? "استيراد JSON" : "Import JSON"}</span>
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slide-up ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
            status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
            'bg-zinc-50 text-zinc-500'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-tight">{status.msg}</span>
          </div>
        )}
      </div>

      {/* Supabase Integration Configuration Panel */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
        <button
          onClick={() => setShowSupaConfig(!showSupaConfig)}
          type="button"
          className="w-full flex items-center justify-between text-zinc-700 hover:text-zinc-950 font-sans font-bold transition-all text-sm py-1 outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Settings2 size={16} className="text-[#e91e63]" />
            <span>{isRTL ? "إعدادات مزامنة Supabase (مدة الاستماع)" : "Supabase Sync Settings (Listen Duration)"}</span>
          </div>
          {showSupaConfig ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {showSupaConfig && (
          <form onSubmit={handleSaveSupabase} className="space-y-4 pt-4 border-t border-zinc-100 animate-slide-up">
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              {isRTL 
                ? "أدخل بيانات مشروعك في Supabase للسماح بمزامنة مدة الاستماع تلقائياً مع الجدول الموجود لديك."
                : "Enter your Supabase project credentials to enable automatic synchronization of song/radio listening duration metrics."}
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                <Database size={12} />
                <span>Supabase Project URL</span>
              </label>
              <input 
                type="text" 
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co" 
                className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                <Key size={12} />
                <span>Supabase Anon/Service Key</span>
              </label>
              <input 
                type="password" 
                value={dbKey}
                onChange={(e) => setDbKey(e.target.value)}
                placeholder="eyJhbGciOi..." 
                className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                <Database size={12} />
                <span>{isRTL ? "اسم جدول بقاعدة البيانات" : "Database Table Name"}</span>
              </label>
              <input 
                type="text" 
                value={dbTable}
                onChange={(e) => setDbTable(e.target.value)}
                placeholder="radio_channels" 
                className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-xs"
            >
              <Save size={16} />
              <span>{isRTL ? "حفظ الإعدادات" : "Save Credentials"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

