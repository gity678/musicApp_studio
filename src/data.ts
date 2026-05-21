import { Track, RadioStation } from "./types";

export const CURATED_TRACKS: Track[] = [
  {
    id: "track-1",
    title: "Midnight Mirage",
    artist: "Synthwave Horizon",
    album: "Futuristic Dream",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12",
    genre: "Synthwave"
  },
  {
    id: "track-2",
    title: "Golden Hour Glow",
    artist: "Chillhop Fields",
    album: "Cafe Beats Vol. 1",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05",
    genre: "Lo-Fi Chill"
  },
  {
    id: "track-3",
    title: "Solitude in Major",
    artist: "Ethereal Echoes",
    album: "Restless Mind",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:02",
    genre: "Ambient"
  },
  {
    id: "track-4",
    title: "Sands of Time",
    artist: "Desert Nomad",
    album: "Oasis Whispers",
    coverUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "5:38",
    genre: "Acoustic Arabic"
  },
  {
    id: "track-5",
    title: "Cybernetic Breeze",
    artist: "Neon Skyline",
    album: "Tokyo Drift Neon",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: "8:41",
    genre: "Synthwave"
  },
  {
    id: "track-6",
    title: "Rainy Cafe Piano",
    artist: "Jazz & Rain",
    album: "Cozy Afternoons",
    coverUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: "6:44",
    genre: "Lo-Fi Jazz"
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
