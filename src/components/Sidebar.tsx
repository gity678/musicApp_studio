import { motion, AnimatePresence } from "motion/react";
import { Music, Radio, Youtube, Sparkles, Menu, X, Globe, Disc, Home, UploadCloud, PlusCircle } from "lucide-react";

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

  const handleToggleLang = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#09090b] text-white border-r border-[#1e1e24] w-64 p-6 select-none justify-between">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1db954] rounded-full text-black shadow-[0_0_15px_rgba(29,185,84,0.4)] animate-pulse">
              <Disc size={22} className="animate-spin [animation-duration:6s]" />
            </div>
            <span className="font-sans font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-white to-[#1db928] bg-clip-text text-transparent">
              {t.appName}
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-full hover:bg-[#18181b] text-gray-400 hover:text-white"
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
                    ? "bg-gradient-to-r from-[#1db954]/20 to-[#1db954]/5 text-[#1db954] border border-[#1db954]/30 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#18181b] border border-transparent"
                }`}
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
                    isActive ? "text-[#1db954]" : "text-gray-400 group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer & Language Switcher */}
      <div className="space-y-4 pt-6 border-t border-[#1e1e24]">
        <button
          onClick={handleToggleLang}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#18181b] border border-transparent transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Globe size={18} className="text-[#1db954]" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-[#18181b] px-2 py-1 rounded text-gray-500">
            {lang.toUpperCase()}
          </span>
        </button>

        <div className="px-4 text-center">
          <p className="font-mono text-[9px] text-[#4d4d56] uppercase tracking-widest">
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
