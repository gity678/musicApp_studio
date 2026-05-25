import { Track, RadioStation } from "./types";

export const CURATED_TRACKS: Track[] = [
  {
    id: "curated-1",
    title: "Celestial Serenity",
    artist: "Ambient Voyager",
    album: "Deep Sleep Vol. 1",
    coverUrl: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12",
    genre: "Ambient"
  },
  {
    id: "curated-2",
    title: "Desert Moon",
    artist: "Nights of Riyadh",
    album: "Sands of Time",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:04",
    genre: "Ethno"
  },
  {
    id: "curated-3",
    title: "The Midnight Sun",
    artist: "Nordic Dreamer",
    album: "Northern Lights",
    coverUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "4:52",
    genre: "Chillout"
  }
];

export const CURATED_STATIONS: RadioStation[] = [
  {
    id: "radio-1",
    name: "Lofi Chill & Chillhop",
    genre: "Lo-Fi Study Beats",
    streamUrl: "https://stream.zeno.fm/f3v5u66bby8uv",
    logoUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    frequency: "94.2 FM",
    description: "Relax, study, or sleep with the best chillhop and lo-fi beats, streaming live 24/7."
  },
  {
    id: "radio-2",
    name: "Arabic Lounge & Chill",
    genre: "Arabic Acoustic Lounge",
    streamUrl: "https://stream.zeno.fm/66k74cc7ba0uv",
    logoUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&auto=format&fit=crop&q=80",
    frequency: "101.5 FM",
    description: "A peaceful blend of modern acoustic Arabic melodies, ambient desert tunes, and chillbeats."
  },
  {
    id: "radio-3",
    name: "Electro Synth Live",
    genre: "Electronic / Synthwave",
    streamUrl: "https://stream.zeno.fm/y62scb2sge8uv",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    frequency: "88.9 FM",
    description: "Cyberpunk tunes, outrun waves, and synth beats directly from the grid."
  },
  {
    id: "radio-4",
    name: "Vintage Gold Hits",
    genre: "Retro Classics",
    streamUrl: "https://stream.zeno.fm/088vvbvv6zquv",
    logoUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&auto=format&fit=crop&q=80",
    frequency: "107.7 FM",
    description: "Throwback classics from the golden era of rock, pop, and vintage jazz."
  }
];
