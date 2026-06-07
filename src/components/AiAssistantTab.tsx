import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Bot, Play, Music, Moon, Flame, Laptop, Plus } from "lucide-react";
import { ChatMessage, Track } from "../types";

interface AiAssistantProps {
  lang: "en" | "ar";
  translations: any;
  onInstantPlayTrack: (title: string, artist: string) => void;
  onQueueTrack: (title: string, artist: string) => void;
}

export default function AiAssistantTab({
  lang,
  translations,
  onInstantPlayTrack,
  onQueueTrack,
}: AiAssistantProps) {
  const isRTL = false;
  const t = translations[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: t.aiGreeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [lang]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });
      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `m-${Date.now()}-ai`,
        sender: "ai",
        text: isRTL 
          ? "لقد قمت بتحليل رغبتك الموسيقية وولدت هذه التوليفة السحرية من الألحان الملائمة لك. اضغط لتشغيل أي منها بشكل فوري!" 
          : "I have woven matching frequencies based on your mood. Feel free to play or queue any recommendation immediately!",
        timestamp: new Date(),
        suggestedTracks: data.recommendations || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("AI recommend error:", e);
      // Fallback message
      const errorMsg: ChatMessage = {
        id: `m-${Date.now()}-err`,
        sender: "ai",
        text: isRTL 
          ? "عذراً، تعذر الاتصال بمساعد الموسيقى. يرجى مراجعة إعدادات الاتصال وحاول مجدداً." 
          : "Apologies, I couldn't reach the orchestration server at this time. Please check your setup and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const prompts = isRTL ? [
    { text: "أغانٍ عربية هادئة ممتازة للاسترخاء والتأمل", icon: Moon },
    { text: "لحن حماسي سينث ويف لزيادة التركيز أثناء العمل والبرمجة", icon: Laptop },
    { text: "توليفة إيجابية صباحية للمذاكرة", icon: Flame }
  ] : [
    { text: "Cozy acoustic ambient songs for a rainy Sunday", icon: Moon },
    { text: "High dynamic outrun synth tracks for coding", icon: Laptop },
    { text: "Positive lo-fi study beats to help me concentrate", icon: Flame }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* AI Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/20 via-slate-900/30 to-black border border-emerald-500/10 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            <span>AI Music Assistant</span>
          </span>
          <h1 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-white leading-tight">
            {isRTL ? "مساعد الموسيقى التفاعلي بالذكاء الاصطناعي" : "AI Music Orchestrator"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            {isRTL
              ? "صف لي مزاجك، أو طبيعة نشاطك الحالي، وستقوم تكنولوجيا Gemini باكتشاف وتوليد قوائم تشغيل ذكية لتشغيلها والتحكم بها فوراً."
              : "Chat with Gemini to translate your present emotional state or project task directly into structured playable audio playlists."}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_right] from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Immersive Chat window */}
        <div className="lg:col-span-2 bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl flex flex-col h-[500px] overflow-hidden backdrop-blur-md">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={msg.id} className={`flex gap-4 ${isAi ? "" : "flex-row-reverse"}`}>
                  <div className={`p-2 rounded-xl shrink-0 ${isAi ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-[#1db954]/10 border border-[#1db954]/30 text-[#1db954]"}`}>
                    {isAi ? <Bot size={18} /> : <div className="text-[10px] font-mono font-bold uppercase">USER</div>}
                  </div>

                  <div className="space-y-4 max-w-[80%]">
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${isAi ? "bg-[#141419] border border-[#1e1e24] text-gray-200" : "bg-[#1db954] text-black font-semibold"}`}>
                      {msg.text}
                    </div>

                    {/* Converted suggestions cards */}
                    {msg.suggestedTracks && msg.suggestedTracks.length > 0 && (
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.suggestedTracks.map((rec, i) => (
                          <div
                            key={i}
                            className="bg-[#141419] border border-[#1e1e24]/70 rounded-xl p-3 flex justify-between items-center hover:border-emerald-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-1.5 bg-[#1db954]/10 text-[#1db954] rounded-lg">
                                <Music size={14} />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-white truncate">{rec.title}</h5>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">{rec.artist}</p>
                                {(rec as any).description && (
                                  <p className="text-[9px] text-[#1db954] mt-1 italic whitespace-normal leading-normal">
                                    {(rec as any).description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              <button
                                onClick={() => onInstantPlayTrack(rec.title, rec.artist)}
                                className="bg-white text-black p-1.5 rounded-full hover:bg-[#1db954] hover:text-white transition-colors cursor-pointer"
                                title="Play now"
                              >
                                <Play size={12} fill="currentColor" />
                              </button>
                              <button
                                onClick={() => onQueueTrack(rec.title, rec.artist)}
                                className="border border-gray-600 text-gray-400 p-1.5 rounded-full hover:text-white hover:border-white transition-all cursor-pointer"
                                title="Queue track"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Bot size={18} className="animate-spin" />
                </div>
                <div className="bg-[#141419] border border-[#1e1e24] px-4 py-3 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-4 bg-[#09090b] border-t border-[#1e1e24] flex gap-2"
          >
            <input
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.aiPromptPlaceholder}
              className="flex-1 bg-[#141419] border border-[#1e1e24] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Suggested presets */}
        <div className="space-y-6">
          <div className="bg-[#0c0c0e]/60 border border-[#1e1e24] rounded-2xl p-6 backdrop-blur-md space-y-4">
            <h3 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-widest">
              {isRTL ? "أفكار مقترحة لتجربتها" : "Suggested Prompts"}
            </h3>
            <div className="space-y-2.5">
              {prompts.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.text)}
                    className="w-full bg-[#141419] border border-[#1e1e24] hover:border-emerald-500/40 hover:bg-[#1c1c24] rounded-xl p-3 text-left flex gap-3.5 transition-all text-xs text-gray-300 leading-snug cursor-pointer group"
                  >
                    <Icon size={16} className="text-emerald-400 shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                    <span>{p.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
