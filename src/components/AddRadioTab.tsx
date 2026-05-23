import { RadioStation } from "../types";

interface AddRadioTabProps {
  customStations: RadioStation[];
  onAddCustomStation: (station: RadioStation) => void;
  onDeleteCustomStation: (id: string) => void;
  onSelectStation: (station: RadioStation) => void;
  lang: "en" | "ar";
  translations: any;
  currentStation: RadioStation | null;
}

export default function AddRadioTab({
  lang,
}: AddRadioTabProps) {
  const isRTL = lang === "ar";
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2 py-20">
      <h2 className="text-xl font-bold tracking-tight uppercase">
        {isRTL ? "قريباً" : "Coming Soon"}
      </h2>
      <p className="text-xs font-mono opacity-50 uppercase tracking-widest">
        {isRTL ? "سيتم تحديث صفحة إضافة الراديو قريباً" : "Radio configuration interface update pending"}
      </p>
    </div>
  );
}

