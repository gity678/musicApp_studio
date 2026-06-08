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
  Settings,
  HelpCircle,
  Link2,
  Table
} from "lucide-react";
import { RadioStation } from "../types";

const WORKER = 'https://radio-worker.ma68.workers.dev';

interface AddRadioTabProps {
  lang: "en" | "ar";
  stationToEdit?: RadioStation | null;
  onClearStationToEdit?: () => void;
}

export default function AddRadioTab({ lang, stationToEdit, onClearStationToEdit }: AddRadioTabProps) {
  const isRTL = false;
  
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

  // Supabase states with LocalStorage persistence so users don't have to keep pasting them
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("supabase_url") || "");
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem("supabase_key") || "");
  const [supabaseTable, setSupabaseTable] = useState(() => localStorage.getItem("supabase_table") || "radio_channels");

  // Show/hide settings container
  const [showSettings, setShowSettings] = useState(false);

  // Column Mapping in Supabase
  const [supabaseColName, setSupabaseColName] = useState("name");
  const [supabaseColUrl, setSupabaseColUrl] = useState("stream_url");
  const [supabaseColLogo, setSupabaseColLogo] = useState("logo_url");

  // Detected JSON keys
  const [jsonKeys, setJsonKeys] = useState<string[]>([]);
  const [jsonKeyName, setJsonKeyName] = useState("name");
  const [jsonKeyUrl, setJsonKeyUrl] = useState("url");
  const [jsonKeyLogo, setJsonKeyLogo] = useState("logo");

  // Automatically detect JSON keys whenever jsonInput changes
  useEffect(() => {
    try {
      const raw = jsonInput.trim();
      if (!raw) {
        setJsonKeys([]);
        return;
      }
      const parsed = JSON.parse(raw);
      const firstObj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (firstObj && typeof firstObj === 'object') {
        const keys = Object.keys(firstObj);
        setJsonKeys(keys);
        
        // Auto-detect best match for name column
        const nameKey = keys.find(k => k.toLowerCase() === 'name' || k.toLowerCase() === 'title');
        if (nameKey) setJsonKeyName(nameKey);
        else if (keys.length > 0) setJsonKeyName(keys[0]);

        // Auto-detect best match for URL
        const urlKey = keys.find(k => k.toLowerCase() === 'url' || k.toLowerCase() === 'stream' || k.toLowerCase() === 'streamurl' || k.toLowerCase() === 'stream_url' || k.toLowerCase() === 'streamurl' || k.toLowerCase() === 'stream_url');
        if (urlKey) setJsonKeyUrl(urlKey);
        else if (keys.length > 1) setJsonKeyUrl(keys[1]);

        // Auto-detect best match for logo
        const logoKey = keys.find(k => k.toLowerCase() === 'logo' || k.toLowerCase() === 'image' || k.toLowerCase() === 'logo_url' || k.toLowerCase() === 'logourl' || k.toLowerCase() === 'photo');
        if (logoKey) setJsonKeyLogo(logoKey);
        else if (keys.length > 2) setJsonKeyLogo(keys[2]);
      }
    } catch (e) {
      // Ignored
    }
  }, [jsonInput]);

  // Persist Supabase Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem("supabase_url", supabaseUrl);
  }, [supabaseUrl]);

  useEffect(() => {
    localStorage.setItem("supabase_key", supabaseKey);
  }, [supabaseKey]);

  useEffect(() => {
    localStorage.setItem("supabase_table", supabaseTable);
  }, [supabaseTable]);

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

    if (!supabaseUrl) {
      setStatus({ msg: isRTL ? "يرجى ملء رابط Supabase" : "Please configure Supabase URL", type: 'error' });
      setShowSettings(true);
      return;
    }

    if (!supabaseKey) {
      setStatus({ msg: isRTL ? "يرجى ملء مفتاح Supabase" : "Please configure Supabase Key", type: 'error' });
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setStatus({ msg: isRTL ? "جاري التصدير إلى Supabase..." : "Exporting to Supabase...", type: 'loading' });

    // Format stations dynamically based on custom column mapping
    const formattedStations = parsedData.map((item: any) => {
      const dbRow: any = {};
      
      // Map JSON source keys to Supabase target column names configured by the user
      dbRow[supabaseColName] = item[jsonKeyName] || null;
      dbRow[supabaseColUrl] = item[jsonKeyUrl] || null;
      
      if (supabaseColLogo && jsonKeyLogo && item[jsonKeyLogo]) {
        dbRow[supabaseColLogo] = item[jsonKeyLogo];
      }
      
      return dbRow;
    });

    try {
      const response = await fetch("/api/supabase/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stations: formattedStations,
          customUrl: supabaseUrl,
          customKey: supabaseKey,
          customTable: supabaseTable
        })
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setStatus({ msg: `✅ Successfully exported ${formattedStations.length} radio channels to Supabase!`, type: 'success' });
        setJsonInput("");
        loadRadios(); // Refresh radio station frequencies
      } else {
        setStatus({ msg: `Error: ${result.error || 'Check columns or constraints'}`, type: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ msg: `Connection error: ${err.message || 'Server offline'}`, type: 'error' });
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
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${mode === 'json' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
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
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === 'modifier' ? 'bg-zinc-900 text-white' : 'bg-[#e91e63] text-white'} active:scale-95 disabled:opacity-50`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{mode === 'modifier' ? (isRTL ? "حفظ التعديلات" : "Sauvegarder") : (isRTL ? "تأكيد الإضافة" : "Confirmer")}</span>
            </button>
          </form>
        )}

        {mode === 'json' && (
          <div className="space-y-5">
            {/* Supabase Connection Header / Toggle */}
            <div className="border border-zinc-150 rounded-2xl bg-zinc-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Database size={16} className="text-zinc-500" />
                  <span className="text-xs font-black uppercase tracking-tight font-mono">
                    Supabase Project Settings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 py-1 bg-white border border-zinc-250 rounded-lg text-[10px] font-bold text-zinc-650 uppercase tracking-wider hover:bg-zinc-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings size={10} />
                  <span>{showSettings ? "Masquer" : "Configurer Connection"}</span>
                </button>
              </div>

              {(showSettings || !supabaseUrl || !supabaseKey) && (
                <div className="space-y-4 pt-2 border-t border-zinc-200/50 animate-fade-in text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center justify-between">
                      <span>Supabase Project URL</span>
                      <span className="normal-case font-medium text-zinc-300">https://xxxx.supabase.co</span>
                    </label>
                    <input 
                      type="text" 
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://your-project.supabase.co" 
                      className="w-full h-10 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-mono outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center justify-between">
                      <span>Supabase API Private/Anon key</span>
                      <span className="normal-case font-medium text-zinc-300">eyJhbGciOi...</span>
                    </label>
                    <input 
                      type="password" 
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="your-supabase-service-key-or-anon-key" 
                      className="w-full h-10 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-mono outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center justify-between">
                      <span>Table Name (Target)</span>
                      <span className="normal-case font-medium text-zinc-300">Defaults to radio_channels</span>
                    </label>
                    <input 
                      type="text" 
                      value={supabaseTable}
                      onChange={(e) => setSupabaseTable(e.target.value)}
                      placeholder="radio_channels" 
                      className="w-full h-10 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-mono outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Config & Mapping parameters (Displays iff keys are detected in current JSON value) */}
            {jsonKeys.length > 0 && (
              <div className="border border-zinc-150 rounded-2xl bg-zinc-50 p-4 space-y-4 animate-slide-up">
                <div className="flex items-center gap-2 text-zinc-800">
                  <Table size={16} className="text-zinc-500" />
                  <span className="text-xs font-black uppercase tracking-tight font-mono">
                    Column Mapping Setup
                  </span>
                </div>
                
                <p className="text-[10px] text-zinc-400 leading-normal -mt-1">
                  Connect the keys in your pasted JSON to your Supabase table columns:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  {/* Name Column Mapping */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest">
                      Database Station Name Column
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={supabaseColName}
                        onChange={(e) => setSupabaseColName(e.target.value)}
                        placeholder="name"
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs font-mono"
                      />
                      <select 
                        value={jsonKeyName}
                        onChange={(e) => setJsonKeyName(e.target.value)}
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs outline-none focus:border-zinc-900"
                      >
                        {jsonKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* URL Column Mapping */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest">
                      Database Stream URL Column
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={supabaseColUrl}
                        onChange={(e) => setSupabaseColUrl(e.target.value)}
                        placeholder="stream_url"
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs font-mono"
                      />
                      <select 
                        value={jsonKeyUrl}
                        onChange={(e) => setJsonKeyUrl(e.target.value)}
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs outline-none focus:border-zinc-900"
                      >
                        {jsonKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Logo Column Mapping */}
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest">
                      Database Logo URL Column (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={supabaseColLogo}
                        onChange={(e) => setSupabaseColLogo(e.target.value)}
                        placeholder="logo_url"
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs font-mono"
                      />
                      <select 
                        value={jsonKeyLogo}
                        onChange={(e) => setJsonKeyLogo(e.target.value)}
                        className="w-1/2 h-10 bg-white border border-zinc-200/80 rounded-xl px-3 text-xs outline-none focus:border-zinc-900"
                      >
                        <option value="">-- Don't Map Logo --</option>
                        {jsonKeys.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original Input Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-widest">
                Paste JSON Array Data
              </label>
              <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "BBC Radio", "url": "https://stream.live.vc/..."}, ...]'
                className="w-full h-36 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-mono outline-none focus:border-zinc-900 transition-colors resize-none overflow-y-auto no-scrollbar"
              />
            </div>

            {/* AI Generator Helper */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in">
              <p id="promptText" className="text-[10px] text-orange-800 leading-relaxed font-mono whitespace-pre-wrap opacity-85 max-w-md">
                {"Génère une liste de stations de radio en JSON : [{\"name\": \"...\", \"url\": \"...\", \"logo\": \"...\"}]"}
              </p>
              <button 
                onClick={copyPrompt}
                className="py-2 px-4 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 self-stretch md:self-auto justify-center hover:bg-orange-600 transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm shadow-orange-100"
              >
                <Copy size={12} />
                <span>{isRTL ? "نسخ مطالبة الـ AI" : "Copy AI Prompt"}</span>
              </button>
            </div>

            {/* Export Trigger */}
            <button 
              disabled={isLoading || !jsonInput}
              onClick={submitJSON}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 hover:bg-zinc-850 cursor-pointer shadow-lg shadow-zinc-100"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FileJson size={18} />}
              <span>{isRTL ? "تصدير إلى Supabase" : "Export to Supabase Table"}</span>
            </button>
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
    </div>
  );
}

