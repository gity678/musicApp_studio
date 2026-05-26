import { motion, AnimatePresence } from "motion/react";
import { Music, Radio, Youtube, Sparkles, Menu, X, Disc, Home, UploadCloud, PlusCircle } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  translations: any;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  isOpen,
  setIsOpen,
  translations,
}: SidebarProps) {
  const isRTL = lang === "ar";
  const t = translations[lang];

  const menuItems = [
    { id: "home", label: t.home, icon: Home },
    { id: "music", label: t.music, icon: Music },
    { id: "radio", label: t.radio, icon: Radio },
    { id: "upload", label: t.upload, icon: UploadCloud },
    { id: "add_radio", label: t.addRadio, icon: PlusCircle },
    { id: "youtube", label: t.youtube, icon: Youtube },
  ];

  const navContent = (
    <div className={`flex flex-col h-full bg-white text-zinc-800 border-r border-zinc-200 w-64 p-6 select-none justify-between ${isRTL ? "text-right" : "text-left"}`}>
      <div className="space-y-8">
        {/* Brand Header */}
        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className="p-2 bg-[#1db954] rounded-full text-white shadow-[0_4px_12px_rgba(29,185,84,0.3)] animate-pulse">
              <Disc size={22} className="animate-spin [animation-duration:6s]" />
            </div>
            <span className="font-sans font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-zinc-900 to-[#1db928] bg-clip-text text-transparent">
              {t.appName}
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group relative ${
                  isActive
                    ? "bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent"
                } ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute ${
                      isRTL ? "right-0" : "left-0"
                    } top-1/4 h-1/2 w-1.5 rounded-full bg-[#1db954]`}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <IconComponent
                  size={20}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-[#1db954]" : "text-zinc-400 group-hover:text-zinc-900"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Settings Section */}
      <div className="pt-6 border-t border-zinc-200 space-y-4">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold text-zinc-600 transition-colors uppercase tracking-widest border border-zinc-100"
        >
          <span>{lang === "en" ? "العربية" : "English"}</span>
          <Disc size={12} className="text-[#1db954]" />
        </button>

        <div className="px-4 text-center">
          <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
            © {new Date().getFullYear()} {t.appName} Client
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen shrink-0 relative z-[60]">
        {navContent}
      </aside>

      {/* Mobile Drawer (with Backdrop) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative flex flex-col h-full z-10"
            >
              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
