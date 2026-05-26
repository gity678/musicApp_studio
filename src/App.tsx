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
import { Disc, Menu, Sparkles, Moon, Laptop, Flame, Music, Radio, Youtube, Home, UploadCloud, PlusCircle, Search, X } from "lucide-react";

const isStaticEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return !hostname.includes("localhost") && !hostname.includes(".run.app") && !hostname.includes(".studio");
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = sessionStorage.getItem("spotifyy_active_tab");
    return saved || "home";
  });

  useEffect(() => {
    sessionStorage.setItem("spotifyy_active_tab", activeTab);
  }, [activeTab]);
  const [lang, setLang] = useState<"en" | "ar">(() => {
    const saved = localStorage.getItem("spotifyy_lang");
    return (saved as "en" | "ar") || "en";
  });

  useEffect(() => {
    localStorage.setItem("spotifyy_lang", lang);
  }, [lang]);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [loopMode, setLoopMode] = useState<'all' | 'single'>('all');
  const loopModeRef = useRef(loopMode);
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);
  const [playOrder, setPlayOrder] = useState<'sequential' | 'random'>('sequential');
  const [themePreset, setThemePreset] = useState<string>("flat");
  const [showVisualizer, setShowVisualizer] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(true);
  const [playerHeight, setPlayerHeight] = useState<number>(0);

  useEffect(() => {
    setSearchTerm("");
    setIsSearchActive(false);
  }, [activeTab]);

  // Custom persistent states stored in LocalStorage
  const [customTracks, setCustomTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem("spotifyy_custom_tracks");
      if (!saved || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [customStations, setCustomStations] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem("spotifyy_custom_stations");
      if (!saved || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [savedYoutubeTracks, setSavedYoutubeTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem("spotifyy_youtube_bookmarks");
      if (!saved || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Cloudflare Worker settings
  const [workerUrl, setWorkerUrl] = useState<string>(() => {
    const saved = localStorage.getItem("spotifyy_worker_url");
    if (!saved || saved.trim() === "" || saved === "null" || saved === "undefined") {
      return "https://music-worker.ma68.workers.dev/";
    }
    return saved;
  });
  const [workerTracks, setWorkerTracks] = useState<Track[]>([]);
  const [workerRadios, setWorkerRadios] = useState<RadioStation[]>([]);
  const [isWorkerLoading, setIsWorkerLoading] = useState<boolean>(false);
  const [workerError, setWorkerError] = useState<string>("");
  const [liveSong, setLiveSong] = useState<string>("");

  // Auto fetch worker tracks when worker URL is changed or loaded
  useEffect(() => {
    localStorage.setItem("spotifyy_worker_url", workerUrl);
    
    if (workerUrl.trim()) {
      setIsWorkerLoading(true);
      setWorkerError("");
      
      const cleanUrl = workerUrl.trim().replace(/\/$/, "");
      
      const fetchSongsAndRadios = async () => {
        const useDirect = isStaticEnvironment();
        
        // 1. Load Tracks
        let songs: any[] = [];
        const tryFetchSongs = async () => {
          // Attempt 1: Local Proxy
          try {
            const res = await fetch(`/api/worker/songs?workerUrl=${encodeURIComponent(workerUrl.trim())}`);
            if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) ? data : (data.songs || []);
            }
          } catch (e) {
            console.warn("Proxy songs fetch failed", e);
          }

          // Attempt 2: Direct Fetch
          try {
            const res = await fetch(`${cleanUrl}/songs`);
            if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) ? data : (data.songs || []);
            }
          } catch (e) {
            console.warn("Direct songs fetch failed", e);
          }
          return [];
        };

        songs = await tryFetchSongs();

        // 2. Load Radios
        let radios: any[] = [];
        const tryFetchRadios = async () => {
          let radioWorkerUrl = cleanUrl;
          if (cleanUrl.includes("music-worker")) radioWorkerUrl = "https://radio-worker.ma68.workers.dev";
          
          // Attempt 1: Local Proxy
          try {
            const res = await fetch(`/api/worker/radios?workerUrl=${encodeURIComponent(radioWorkerUrl)}`);
            if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            }
          } catch (e) {
            console.warn("Proxy radios fetch failed", e);
          }

          // Attempt 2: Direct Fetch
          try {
            const res = await fetch(`${radioWorkerUrl}/radios`);
            if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            }
          } catch (e) {
            console.warn("Direct radios fetch failed", e);
          }
          return [];
        };

        radios = await tryFetchRadios();

        return { songs, radios };
      };

      fetchSongsAndRadios()
        .then(({ songs, radios }) => {
          // Map worker songs into unified Track format
          const mappedSongs: Track[] = (songs || []).map((song: any) => ({
            id: `worker-${song.id}`,
            title: song.title || "Untitled",
            artist: song.artist || (song.source === "cloudinary" ? "Cloudinary Storage" : (song.source === "b2" ? "Backblaze B2" : "Worker Audio")),
            album: song.source ? song.source.toUpperCase() : "CLOUD",
            coverUrl: song.thumb || (song.source === "cloudinary"
              ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80"),
            audioUrl: song.url || "",
            duration: song.duration || "...",
            genre: song.source === "cloudinary" ? "Cloudinary" : (song.source === "b2" ? "Backblaze B2" : "Remote Feed"),
          }));
          setWorkerTracks(mappedSongs);

          // Map worker radios
          const mappedRadios: RadioStation[] = radios.map((r: any, i: number) => ({
            id: r.id || `worker-radio-${i}`,
            name: r.name,
            frequency: r.genre || "Global",
            genre: r.genre || "Radio Feed",
            logoUrl: r.logo || r.logoUrl || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400",
            streamUrl: r.url || r.streamUrl,
            description: r.description || ""
          }));
          setWorkerRadios(mappedRadios);
        })
        .catch((err) => {
          console.error("Error loading worker data:", err);
          setWorkerError(err.message || "Failed to communicate with worker.");
        })
        .finally(() => {
          setIsWorkerLoading(false);
        });
    } else {
      setWorkerTracks([]);
      setWorkerError("");
    }
  }, [workerUrl]);

  const reloadWorkerSongs = () => {
    if (!workerUrl.trim()) return;
    setIsWorkerLoading(true);
    setWorkerError("");

    const cleanUrl = workerUrl.trim().replace(/\/$/, "");

    const fetchSongs = async () => {
      const useDirect = isStaticEnvironment();
      
      if (useDirect) {
        try {
          console.log("Static environment reload: Querying Cloudflare Worker directly...");
          const directRes = await fetch(`${cleanUrl}/songs`);
          if (directRes.ok) {
            const contentType = directRes.headers.get("content-type") || "";
            if (contentType.includes("json")) {
              const data = await directRes.json();
              return Array.isArray(data) ? data : (data.songs || []);
            } else {
              const text = await directRes.text();
              if (text.trim() === "OK") return [];
            }
          }
        } catch (directErr) {
          console.warn("Static reload directly failed, falling back to proxy search", directErr);
        }
      }

      try {
        const res = await fetch(`/api/worker/songs?workerUrl=${encodeURIComponent(workerUrl.trim())}`);
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("json")) {
            const text = await res.text();
            const data = JSON.parse(text);
            if (data && data.songs) return data.songs;
            if (data && Array.isArray(data)) return data;
            if (data && data.error) throw new Error(data.error);
          } else {
            console.warn("Proxy reload returned non-JSON.");
          }
        }
      } catch (proxyErr) {
        console.warn("Proxy reload failed, trying direct fallback", proxyErr);
      }

      try {
        const directRes = await fetch(`${cleanUrl}/songs`);
        if (!directRes.ok) {
          throw new Error(`Direct query returned code: ${directRes.status}`);
        }
        const contentType = directRes.headers.get("content-type") || "";
        if (contentType.includes("json")) {
          const data = await directRes.json();
          return Array.isArray(data) ? data : (data.songs || []);
        } else {
          const text = await directRes.text();
          if (text.trim() === "OK") return [];
          throw new Error(`Non-JSON response: ${text.slice(0, 50)}`);
        }
      } catch (directErr: any) {
        throw new Error(`Could not reload tracks directly from worker: ${directErr.message}`);
      }
    };

    fetchSongs()
      .then((songs) => {
        const mapped: Track[] = (songs || []).map((song: any) => ({
          id: `worker-${song.id}`,
          title: song.title || "Untitled",
          artist: song.artist || (song.source === "cloudinary" ? "Cloudinary Storage" : (song.source === "b2" ? "Backblaze B2" : "Worker Audio")),
          album: song.source ? song.source.toUpperCase() : "CLOUD",
          coverUrl: song.thumb || (song.source === "cloudinary"
            ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80"),
          audioUrl: song.url || "",
          duration: song.duration || "...",
          genre: song.source === "cloudinary" ? "Cloudinary" : (song.source === "b2" ? "Backblaze B2" : "Remote Feed"),
        }));
        setWorkerTracks(mapped);
      })
      .catch((err) => {
        console.error("Error reloading worker songs:", err);
        setWorkerError(err.message || "Failed to communicate with worker query.");
        setWorkerTracks([]);
      })
      .finally(() => {
        setIsWorkerLoading(false);
      });
  };

  // HTML5 audio elements reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "none";
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      if (loopModeRef.current === 'single') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextRef.current();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

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
  const toggleLoopMode = () => {
    setLoopMode((prev) => (prev === 'all' ? 'single' : 'all'));
  };

  const togglePlayOrder = () => {
    setPlayOrder((prev) => (prev === 'sequential' ? 'random' : 'sequential'));
  };

  useEffect(() => {
    localStorage.setItem("spotifyy_custom_stations", JSON.stringify(customStations));
  }, [customStations]);

  useEffect(() => {
    localStorage.setItem("spotifyy_youtube_bookmarks", JSON.stringify(savedYoutubeTracks));
  }, [savedYoutubeTracks]);

  // Poll currently playing song for live radio feeds
  useEffect(() => {
    if (!currentTrack || !currentTrack.id.includes("radio")) {
      setLiveSong("");
      return;
    }

    const fetchNowPlaying = async () => {
      // Try local Express proxy first
      try {
        const res = await fetch(`/api/worker/nowplaying?workerUrl=${encodeURIComponent(workerUrl)}&url=${encodeURIComponent(currentTrack.audioUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.song) {
            setLiveSong(data.song);
            return;
          }
        }
      } catch (e) {
        console.warn("Express proxy failed to fetch now playing, trying direct...", e);
      }

      // Fallback: fetch directly from worker
      try {
        let cleanUrl = workerUrl.trim().replace(/\/$/, "");
        if (cleanUrl.includes("music-worker")) {
          cleanUrl = "https://radio-worker.ma68.workers.dev";
        }
        const res = await fetch(`${cleanUrl}/nowplaying?url=${encodeURIComponent(currentTrack.audioUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.song) {
            setLiveSong(data.song);
          }
        }
      } catch (e) {
        console.warn("Direct fetch of now playing info failed:", e);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000); // Poll every 10 seconds for real-time meta update
    return () => clearInterval(interval);
  }, [currentTrack, workerUrl]);

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
    if (!audioRef.current || !currentTrack || isNaN(time) || currentTrack.id.startsWith("yt-")) return;
    try {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } catch (e) {
      console.warn("Seek failed:", e);
    }
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
    if (!station) return;
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
    // Check if we are playing a radio station
    if (currentTrack && (currentTrack.id.startsWith("radio-") || currentTrack.genre === "Radio Feed")) {
      const allStations = [...CURATED_STATIONS, ...customStations, ...workerRadios];
      if (allStations.length === 0) return;

      const currentIdx = allStations.findIndex((s) => `radio-${s.id}` === currentTrack.id);
      const nextIdx = (currentIdx + 1) % allStations.length;
      const nextStation = allStations[nextIdx];
      if (nextStation) handleSelectRadio(nextStation);
      return;
    }

    const allTracks = [...CURATED_TRACKS, ...customTracks, ...workerTracks];
    if (allTracks.length === 0) return;

    if (playOrder === 'random') {
      const randIdx = Math.floor(Math.random() * allTracks.length);
      handleSelectTrack(allTracks[randIdx]);
      return;
    }

    const currentIdx = allTracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = (currentIdx + 1) % allTracks.length;
    
    handleSelectTrack(allTracks[nextIdx]);
  };

  // Keep the reference to handleNext completely fresh on every render
  handleNextRef.current = handleNext;

  const handlePrev = () => {
    // Check if we are playing a radio station
    if (currentTrack && (currentTrack.id.startsWith("radio-") || currentTrack.genre === "Radio Feed")) {
      const allStations = [...CURATED_STATIONS, ...customStations, ...workerRadios];
      if (allStations.length === 0) return;

      const currentIdx = allStations.findIndex((s) => `radio-${s.id}` === currentTrack.id);
      const prevIdx = (currentIdx - 1 + allStations.length) % allStations.length;
      const prevStation = allStations[prevIdx];
      if (prevStation) handleSelectRadio(prevStation);
      return;
    }

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
        let isSuccess = false;
        
        // 1. Try local Express proxy first
        try {
          const response = await fetch("/api/worker/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerUrl: workerUrl.trim(), public_id: publicId }),
          });
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            if (data.ok || data.success) {
              isSuccess = true;
            }
          } catch {
            console.warn("Proxy returned invalid non-JSON on delete, falling back to direct DELETE");
          }
        } catch (e) {
          console.warn("Error deleting via worker proxy, trying direct", e);
        }

        // 2. Fallback: Direct CORs-compliant DELETE from client browser to worker
        if (!isSuccess) {
          try {
            const cleanUrl = workerUrl.trim().replace(/\/$/, "");
            const response = await fetch(`${cleanUrl}/delete`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ public_id: publicId }),
            });
            const data = await response.json();
            if (data.ok || data.success) {
              isSuccess = true;
            }
          } catch (directErr) {
            console.error("Direct deletion failed:", directErr);
          }
        }

        // Filter track out of local UI anyway
        setWorkerTracks((prev) => prev.filter((t) => t.id !== trackId));
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

  const combinedStations = [...CURATED_STATIONS, ...customStations, ...workerRadios];
  const combinedTracks = [...CURATED_TRACKS, ...customTracks, ...workerTracks];

  return (
    <div className="flex bg-zinc-50 h-[100dvh] overflow-hidden text-zinc-900 overscroll-none touch-pan-y shadow-inner" dir={isRTL ? "rtl" : "ltr"}>
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
        <header className="bg-white/90 border-b border-zinc-200 px-4 py-1.5 z-20 backdrop-blur-md shrink-0">
          <div className="max-w-sm md:max-w-md mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                <Menu size={18} />
              </button>

              {!isSearchActive || (activeTab !== "music" && activeTab !== "radio") ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 text-zinc-900 transition-opacity duration-300">
                    {activeTab === "home" && <Home size={16} className="text-[#1db954]" />}
                    {activeTab === "music" && <Music size={16} className="text-[#1db954]" />}
                    {activeTab === "radio" && <Radio size={16} className="text-teal-400" />}
                    {activeTab === "upload" && <UploadCloud size={16} className="text-[#1db954]" />}
                    {activeTab === "add_radio" && <PlusCircle size={16} className="text-[#1db954]" />}
                    {activeTab === "youtube" && <Youtube size={16} className="text-red-500" />}
                    {activeTab === "ai" && <Sparkles size={16} className="text-emerald-400" />}
                    <span>{translations[lang][activeTab as keyof typeof translations["en"]] || activeTab}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-pulse" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search tracks, artists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-100 border border-zinc-200 focus:border-[#1db954] text-zinc-900 text-xs pl-9 pr-9 py-2 rounded-xl focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setIsSearchActive(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {!isSearchActive && (activeTab === "music" || activeTab === "radio") && (
                <button
                  onClick={() => setIsSearchActive(true)}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 hover:border-[#1db954]/50 rounded-xl text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer flex items-center gap-1"
                  title="Search Music"
                >
                  <Search size={14} />
                </button>
              )}
              <span className="font-mono text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest hidden sm:inline">
                PRESET: {themePreset.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Content Viewer viewport */}
        <main className="flex-1 overflow-hidden px-2.5 sm:px-5 relative z-10 animate-fade-in flex flex-col">
          <div 
            className="max-w-sm md:max-w-md mx-auto space-y-4 w-full flex-1 flex flex-col min-h-0 transition-all duration-300"
            style={{ 
              paddingBottom: currentTrack 
                ? `${playerHeight + (isPlayerExpanded ? 4 : -2)}px` 
                : '0px' 
            }}
          >
            
            {/* Visualizer canvas floating header */}
            {showVisualizer && (
              <MusicVisualizer isPlaying={isPlaying} themePreset={themePreset} />
            )}

            {activeTab === "home" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <HomeTab
                  lang={lang}
                  translations={translations}
                  setActiveTab={setActiveTab}
                />
              </div>
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
                searchTerm={searchTerm}
              />
            )}

            {activeTab === "radio" && (
              <RadioTab
                activeStation={
                  currentTrack?.genre === "Radio Feed"
                    ? combinedStations.find((s) => s.name === currentTrack.title) || null
                    : null
                }
                onSelectStation={handleSelectRadio}
                lang={lang}
                workerUrl={workerUrl}
                workerRadios={workerRadios}
              />
            )}

            {activeTab === "upload" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
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
                  workerError={workerError}
                />
              </div>
            )}

            {activeTab === "add_radio" && (
              <AddRadioTab lang={lang} />
            )}

            {activeTab === "youtube" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <YoutubeTab
                  lang={lang}
                  translations={translations}
                  onPlayYoutube={handlePlayYoutube}
                  savedYoutubeTracks={savedYoutubeTracks}
                  onAddYoutubeToCollection={handleAddYoutubeToCollection}
                  onRemoveYoutubeFromCollection={handleRemoveYoutubeFromCollection}
                  workerUrl={workerUrl}
                />
              </div>
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
          loopMode={loopMode}
          onToggleLoop={toggleLoopMode}
          playOrder={playOrder}
          onTogglePlayOrder={togglePlayOrder}
          themePreset={themePreset}
          onSetThemePreset={setThemePreset}
          lang={lang}
          translations={translations}
          showVisualizer={showVisualizer}
          setShowVisualizer={setShowVisualizer}
          isExpanded={isPlayerExpanded}
          setIsExpanded={setIsPlayerExpanded}
          onHeightChange={setPlayerHeight}
          liveSong={liveSong}
        />
      </div>
    </div>
  );
}
