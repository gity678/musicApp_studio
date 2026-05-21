import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import BottomPlayer from "./components/BottomPlayer";
import HomeTab from "./components/HomeTab";
import MusicTab from "./components/MusicTab";
import RadioTab from "./components/RadioTab";
import UploadTab from "./components/UploadTab";
import AddRadioTab from "./components/AddRadioTab";
import YoutubeTab from "./components/YoutubeTab";
import AiAssistantTab from "./components/AiAssistantTab";
import MusicVisualizer from "./components/MusicVisualizer";
import { Track, RadioStation } from "./types";
import { CURATED_TRACKS, CURATED_STATIONS } from "./data";
import { translations } from "./locale";
import { Disc, Menu, Sparkles, Moon, Laptop, Flame, Music, Radio, Youtube, Home, UploadCloud, PlusCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [lang, setLang] = useState<"en" | "ar">("ar"); // default to Arabic to greet Arab users, can toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [loop, setLoop] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [themePreset, setThemePreset] = useState<string>("flat");
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);

  // Custom persistent states stored in LocalStorage
  const [customTracks, setCustomTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem("spotifyy_custom_tracks");
    return saved ? JSON.parse(saved) : [];
  });
  const [customStations, setCustomStations] = useState<RadioStation[]>(() => {
    const saved = localStorage.getItem("spotifyy_custom_stations");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedYoutubeTracks, setSavedYoutubeTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem("spotifyy_youtube_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Cloudflare Worker settings
  const [workerUrl, setWorkerUrl] = useState<string>(() => {
    return localStorage.getItem("spotifyy_worker_url") || "";
  });
  const [workerTracks, setWorkerTracks] = useState<Track[]>([]);
  const [isWorkerLoading, setIsWorkerLoading] = useState<boolean>(false);

  // Auto fetch worker tracks when worker URL is changed or loaded
  useEffect(() => {
    localStorage.setItem("spotifyy_worker_url", workerUrl);
    
    if (workerUrl.trim()) {
      setIsWorkerLoading(true);
      fetch(`/api/worker/songs?workerUrl=${encodeURIComponent(workerUrl.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.songs) {
            // Map worker songs into unified Track format
            const mapped: Track[] = data.songs.map((song: any) => ({
              id: `worker-${song.id}`,
              title: song.title,
              artist: song.source === "cloudinary" ? "Cloudinary Storage" : "Backblaze B2",
              album: song.source.toUpperCase(),
              coverUrl: song.source === "cloudinary"
                ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80",
              audioUrl: song.url,
              duration: "Cloud",
              genre: song.source === "cloudinary" ? "Cloudinary" : "Backblaze B2",
            }));
            setWorkerTracks(mapped);
          }
        })
        .catch((err) => {
          console.error("Error loading worker songs:", err);
        })
        .finally(() => {
          setIsWorkerLoading(false);
        });
    } else {
      setWorkerTracks([]);
    }
  }, [workerUrl]);

  const reloadWorkerSongs = () => {
    if (!workerUrl.trim()) return;
    setIsWorkerLoading(true);
    fetch(`/api/worker/songs?workerUrl=${encodeURIComponent(workerUrl.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.songs) {
          const mapped: Track[] = data.songs.map((song: any) => ({
            id: `worker-${song.id}`,
            title: song.title,
            artist: song.source === "cloudinary" ? "Cloudinary Storage" : "Backblaze B2",
            album: song.source.toUpperCase(),
            coverUrl: song.source === "cloudinary"
              ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80",
            audioUrl: song.url,
            duration: "Cloud",
            genre: song.source === "cloudinary" ? "Cloudinary" : "Backblaze B2",
          }));
          setWorkerTracks(mapped);
        }
      })
      .catch((err) => {
        console.error("Error reloading worker songs:", err);
      })
      .finally(() => {
        setIsWorkerLoading(false);
      });
  };

  // HTML5 audio elements reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [loop]);

  // Handle changes to source track
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    // If it's a YouTube track, the actual playback happens in iframe, but we can simulate progress or just set values
    if (currentTrack.id.startsWith("yt-")) {
      audioRef.current.pause();
      setIsPlaying(true);
      setDuration(240); // static mock duration for youtube audio synced timelines
      setCurrentTime(0);
      return;
    }

    const wasPlaying = isPlaying;
    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.load();
    
    if (wasPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Audio model could not autoplay immediately due to browser policy:", err);
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Handle volume controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Local storage binding
  useEffect(() => {
    localStorage.setItem("spotifyy_custom_tracks", JSON.stringify(customTracks));
  }, [customTracks]);

  useEffect(() => {
    localStorage.setItem("spotifyy_custom_stations", JSON.stringify(customStations));
  }, [customStations]);

  useEffect(() => {
    localStorage.setItem("spotifyy_youtube_bookmarks", JSON.stringify(savedYoutubeTracks));
  }, [savedYoutubeTracks]);

  const handleTogglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (currentTrack.id.startsWith("yt-")) {
      // For YouTube, toggle playing directly
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current || !currentTrack || currentTrack.id.startsWith("yt-")) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // Auto play audio via element
    setTimeout(() => {
      if (audioRef.current && !track.id.startsWith("yt-")) {
        audioRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const handleSelectRadio = (station: RadioStation) => {
    const radioTrack: Track = {
      id: `radio-${station.id}`,
      title: station.name,
      artist: station.frequency,
      album: station.genre,
      coverUrl: station.logoUrl,
      audioUrl: station.streamUrl,
      duration: "Live",
      genre: "Radio Feed"
    };
    setCurrentTrack(radioTrack);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const handleNext = () => {
    const allTracks = [...CURATED_TRACKS, ...customTracks, ...workerTracks];
    if (allTracks.length === 0) return;

    if (shuffle) {
      const randIdx = Math.floor(Math.random() * allTracks.length);
      handleSelectTrack(allTracks[randIdx]);
      return;
    }

    const currentIdx = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = (currentIdx + 1) % allTracks.length;
    handleSelectTrack(allTracks[nextIdx]);
  };

  const handlePrev = () => {
    const allTracks = [...CURATED_TRACKS, ...customTracks, ...workerTracks];
    if (allTracks.length === 0) return;

    const currentIdx = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = (currentIdx - 1 + allTracks.length) % allTracks.length;
    handleSelectTrack(allTracks[prevIdx]);
  };

  const handleAddCustomTrack = (title: string, artist: string, url: string, genre: string, cover?: string) => {
    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title,
      artist,
      album: "Local Storage Stream",
      coverUrl: cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      audioUrl: url,
      duration: "Direct",
      genre: genre || "Uploaded Track"
    };
    setCustomTracks((prev) => [newTrack, ...prev]);
  };

  const handleDeleteCustomTrack = async (trackId: string) => {
    if (trackId.startsWith("worker-")) {
      const publicId = trackId.replace("worker-", "");
      if (workerUrl.trim()) {
        try {
          const response = await fetch("/api/worker/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerUrl: workerUrl.trim(), public_id: publicId }),
          });
          const data = await response.json();
          if (data.ok) {
            setWorkerTracks((prev) => prev.filter((t) => t.id !== trackId));
          } else {
            console.warn("Delete returned not ok:", data);
            // Fallback: still delete from UI just in case
            setWorkerTracks((prev) => prev.filter((t) => t.id !== trackId));
          }
        } catch (e) {
          console.error("Error deleting worker track:", e);
          // Fallback deletion
          setWorkerTracks((prev) => prev.filter((t) => t.id !== trackId));
        }
      } else {
        setWorkerTracks((prev) => prev.filter((t) => t.id !== trackId));
      }
    } else {
      setCustomTracks((prev) => prev.filter((t) => t.id !== trackId));
    }

    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const handleAddCustomStation = (station: RadioStation) => {
    setCustomStations((prev) => [station, ...prev]);
  };

  const handleDeleteCustomStation = (id: string) => {
    setCustomStations((prev) => prev.filter((s) => s.id !== id));
    if (currentTrack?.id === `radio-${id}`) {
      setCurrentTrack(null);
    }
  };

  // Play YouTube video in general bottom player and view on stream tab
  const handlePlayYoutube = (videoId: string, title: string, artist: string, cover: string) => {
    const ytTrack: Track = {
      id: `yt-${videoId}`,
      title,
      artist,
      album: "YouTube Live",
      coverUrl: cover,
      audioUrl: videoId, // youtube video id
      duration: "Synced",
      genre: "YouTube"
    };
    setCurrentTrack(ytTrack);
    setIsPlaying(true);
  };

  const handleAddYoutubeToCollection = (video: any) => {
    const exists = savedYoutubeTracks.some((t) => t.id === `yt-${video.id}`);
    if (exists) return;
    
    const newYtTrack: Track = {
      id: `yt-${video.id}`,
      title: video.title,
      artist: video.channelTitle,
      album: "YouTube Bookmarked",
      coverUrl: video.thumbnailUrl,
      audioUrl: video.id,
      duration: "Synced",
      genre: "YouTube"
    };
    setSavedYoutubeTracks((prev) => [newYtTrack, ...prev]);
  };

  const handleRemoveYoutubeFromCollection = (trackId: string) => {
    setSavedYoutubeTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Triggered when an AI recommendation card is clicked to auto-resolve song from YouTube!
  const handleInstantPlayTrack = async (title: string, artist: string) => {
    setActiveTab("youtube");
    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${title} by ${artist}` }),
      });
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const topVideo = data.results[0];
        handlePlayYoutube(
          topVideo.id,
          topVideo.title,
          topVideo.channelTitle,
          topVideo.thumbnailUrl
        );
      }
    } catch (e) {
      console.error("AI instant-resolve play error:", e);
    }
  };

  const handleQueueTrack = (title: string, artist: string) => {
    // Add custom placeholder song to queue
    const placeholder: Track = {
      id: `ai-queued-${Date.now()}`,
      title,
      artist,
      album: "AI Generated",
      coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      duration: "3:45",
      genre: "AI Pick"
    };
    setCustomTracks((prev) => [...prev, placeholder]);
  };

  const isRTL = lang === "ar";
  const t = translations[lang];

  const combinedStations = [...CURATED_STATIONS, ...customStations];
  const combinedTracks = [...CURATED_TRACKS, ...customTracks, ...workerTracks];

  return (
    <div className="flex bg-[#070709] h-screen scroll-smooth overflow-hidden text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* LEFT Navigation sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        translations={translations}
      />

      {/* RIGHT Core Body container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Custom Header Navigation */}
        <header className="bg-[#09090b]/80 border-b border-[#1e1e24] px-6 py-4 flex items-center justify-between z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-[#18181b] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight uppercase flex items-center gap-2 text-white/95">
                {activeTab === "home" && <Home size={18} className="text-[#1db954]" />}
                {activeTab === "music" && <Music size={18} className="text-[#1db954]" />}
                {activeTab === "radio" && <Radio size={18} className="text-teal-400" />}
                {activeTab === "upload" && <UploadCloud size={18} className="text-[#1db954]" />}
                {activeTab === "add_radio" && <PlusCircle size={18} className="text-[#1db954]" />}
                {activeTab === "youtube" && <Youtube size={18} className="text-red-500" />}
                {activeTab === "ai" && <Sparkles size={18} className="text-emerald-400" />}
                <span>{translations[lang][activeTab as keyof typeof translations["en"]] || activeTab}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-gray-500 font-extrabold uppercase tracking-widest hidden sm:inline">
              ONLINE AUDIO PRESET: {themePreset.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Content Viewer viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10 animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Visualizer canvas floating header */}
            {showVisualizer && (
              <MusicVisualizer isPlaying={isPlaying} themePreset={themePreset} />
            )}

            {activeTab === "home" && (
              <HomeTab
                lang={lang}
                translations={translations}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "music" && (
              <MusicTab
                tracks={CURATED_TRACKS}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onSelectTrack={handleSelectTrack}
                lang={lang}
                translations={translations}
                customTracks={[...customTracks, ...workerTracks]}
              />
            )}

            {activeTab === "radio" && (
              <RadioTab
                stations={combinedStations}
                activeStation={
                  currentTrack?.genre === "Radio Feed"
                    ? combinedStations.find((s) => s.name === currentTrack.title) || null
                    : null
                }
                isPlaying={isPlaying}
                onSelectStation={handleSelectRadio}
                lang={lang}
                translations={translations}
              />
            )}

            {activeTab === "upload" && (
              <UploadTab
                customTracks={customTracks}
                onAddCustomTrack={handleAddCustomTrack}
                onDeleteCustomTrack={handleDeleteCustomTrack}
                onSelectTrack={handleSelectTrack}
                currentTrack={currentTrack}
                lang={lang}
                translations={translations}
                workerUrl={workerUrl}
                setWorkerUrl={setWorkerUrl}
                workerTracks={workerTracks}
                isWorkerLoading={isWorkerLoading}
                onReloadWorkerSongs={reloadWorkerSongs}
              />
            )}

            {activeTab === "add_radio" && (
              <AddRadioTab
                customStations={customStations}
                onAddCustomStation={handleAddCustomStation}
                onDeleteCustomStation={handleDeleteCustomStation}
                onSelectStation={handleSelectRadio}
                currentStation={
                  currentTrack?.genre === "Radio Feed"
                    ? combinedStations.find((s) => s.name === currentTrack.title) || null
                    : null
                }
                lang={lang}
                translations={translations}
              />
            )}

            {activeTab === "youtube" && (
              <YoutubeTab
                lang={lang}
                translations={translations}
                onPlayYoutube={handlePlayYoutube}
                savedYoutubeTracks={savedYoutubeTracks}
                onAddYoutubeToCollection={handleAddYoutubeToCollection}
                onRemoveYoutubeFromCollection={handleRemoveYoutubeFromCollection}
                workerUrl={workerUrl}
              />
            )}


          </div>
        </main>

        {/* BOTTOM GLOBAL PLAYER CONTROL FOOTER */}
        <BottomPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          loop={loop}
          onToggleLoop={() => setLoop(!loop)}
          shuffle={shuffle}
          onToggleShuffle={() => setShuffle(!shuffle)}
          themePreset={themePreset}
          onSetThemePreset={setThemePreset}
          lang={lang}
          translations={translations}
          showVisualizer={showVisualizer}
          setShowVisualizer={setShowVisualizer}
        />
      </div>
    </div>
  );
}
