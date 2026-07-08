import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI music recommendations will be simulated.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. YouTube Search Helper (Using clean public query method)
async function searchYoutube(query: string) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    const html = await response.text();
    
    // Extract ytInitialData json from the page
    const regex = /var ytInitialData\s*=\s*({.+?});/;
    const match = html.match(regex);
    if (!match) {
      throw new Error("Could not parse ytInitialData");
    }
    
    const data = JSON.parse(match[1]);
    
    const videos: any[] = [];
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryResults?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
    
    if (contents && Array.isArray(contents)) {
      for (const item of contents) {
        if (item.videoRenderer) {
          const vr = item.videoRenderer;
          const videoId = vr.videoId;
          const title = vr.title?.runs?.[0]?.text || vr.title?.accessibility?.accessibilityData?.label || "Unknown Title";
          const channel = vr.ownerText?.runs?.[0]?.text || "Unknown Channel";
          const thumbnail = vr.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const published = vr.publishedTimeText?.simpleText || "Recent";
          
          if (videoId) {
            videos.push({
              id: videoId,
              title,
              channelTitle: channel,
              thumbnailUrl: thumbnail,
              publishedAt: published,
            });
          }
        }
        if (videos.length >= 12) break;
      }
    }
    
    return videos;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    // Dynamic Fallback search mock that returns clean simulated search data if parsing fails
    return [
      {
        id: "jfKfPfyJRdk",
        title: `${query} (Lofi Remix Live)`,
        channelTitle: "Lofi Cafe Premium",
        thumbnailUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
        publishedAt: "2 months ago"
      },
      {
        id: "5qap5aO4i9A",
        title: `${query} (Chill Mix Session)`,
        channelTitle: "Ambient Sunset Music",
        thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
        publishedAt: "1 year ago"
      },
      {
        id: "tntOCGkgt98",
        title: `${query} (Acoustic Cover)`,
        channelTitle: "Acoustic Whispers",
        thumbnailUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&auto=format&fit=crop&q=80",
        publishedAt: "6 months ago"
      }
    ];
  }
}

// REGISTER API ROUTES FIRST
app.post("/api/youtube/search", async (req, res) => {
  const { query, workerUrl } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  // If workerUrl is active, try searching via their RapidAPI endpoint
  if (workerUrl) {
    try {
      const cleanUrl = workerUrl.replace(/\/$/, "");
      console.log(`Searching YouTube via worker: ${cleanUrl}/search?q=${encodeURIComponent(query)}`);
      const response = await fetch(`${cleanUrl}/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = (await response.json()) as any;
        let results: any[] = [];
        
        // Parse standard youtube138 contents array
        if (data && data.contents && Array.isArray(data.contents)) {
          for (const item of data.contents) {
            if (item.video) {
              const v = item.video;
              results.push({
                id: v.videoId,
                title: v.title || "Unknown Title",
                channelTitle: v.author?.name || "Unknown Channel",
                thumbnailUrl: v.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                publishedAt: v.publishedTimeText || "Recent"
              });
            }
          }
        } else if (Array.isArray(data)) {
          results = data.map((item: any) => ({
            id: item.id || item.videoId,
            title: item.title,
            channelTitle: item.channelTitle || item.author,
            thumbnailUrl: item.thumbnailUrl || item.thumbnail,
            publishedAt: item.publishedAt || ""
          }));
        }
        
        if (results.length > 0) {
          return res.json({ results });
        }
      }
    } catch (e: any) {
      console.warn("Worker RapidAPI search failed, falling back to local scraper:", e.message);
    }
  }

  const results = await searchYoutube(query);
  res.json({ results });
});

// Cloudflare Worker Secure Proxy Endpoints
app.get("/api/worker/songs", async (req, res) => {
  const { workerUrl } = req.query;
  if (!workerUrl) {
    return res.status(400).json({ error: "Missing workerUrl parameter" });
  }

  try {
    const cleanUrl = (workerUrl as string).replace(/\/$/, "");
    console.log(`Proxying songs request to: ${cleanUrl}/songs`);
    const response = await fetch(`${cleanUrl}/songs`);
    if (!response.ok) {
      throw new Error(`Worker returned status code: ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      // Handle both {songs:[]} and plain [] formats
      const songs = Array.isArray(data) ? data : (data.songs || []);
      res.json({ songs });
    } else {
      const text = await response.text();
      if (text.trim() === "OK") {
        return res.json({ songs: [] });
      }
      throw new Error(`Worker returned non-JSON response: ${text.slice(0, 100)}`);
    }
  } catch (error: any) {
    console.error("Error proxying songs from Cloudflare worker:", error);
    res.status(500).json({ error: "Failed to fetch songs from your worker", details: error.message });
  }
});

app.get("/api/songs", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const query = `${supabaseUrl}/rest/v1/songs?select=*`;
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Supabase error", details: errText });
    }

    const songs = await response.json();
    res.json(songs);
  } catch (error: any) {
    console.error("Error in GET /api/songs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/songs", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing song id parameter" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const query = `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`;
    const response = await fetch(query, {
      method: "DELETE",
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Supabase DELETE error", details: errText });
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/songs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/radios", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const { genre } = req.query;
    let query = `${supabaseUrl}/rest/v1/radio_channels?select=*&order=total_duration.desc`;
    if (genre) {
      query += `&genre=eq.${encodeURIComponent(genre as string)}`;
    }
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const radios = await response.json();
    res.json(radios);
  } catch (error: any) {
    console.error("Error in GET /api/radios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/radios/batch", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const newRadios = req.body;
    if (!Array.isArray(newRadios) || newRadios.length === 0) {
      return res.status(400).json({ ok: false, error: 'Array required' });
    }

    const invalid = newRadios.filter(r => !r.name || !r.url);
    if (invalid.length > 0) {
      return res.status(400).json({ ok: false, error: 'name and url required for all items' });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/radio_channels`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify(newRadios.map(r => ({ name: r.name, url: r.url, logo: r.logo || '', genre: r.genre || '' })))
      }
    );

    res.json({ ok: response.ok, added: newRadios.length });
  } catch (error: any) {
    console.error("Error in POST /api/radios/batch:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/radios", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const { name, url: streamUrl, logo, genre } = req.body;
    if (!name || !streamUrl) {
      return res.status(400).json({ ok: false, error: 'name and url required' });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/radio_channels`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, url: streamUrl, logo: logo || '', genre: genre || '' })
      }
    );

    res.json({ ok: response.ok });
  } catch (error: any) {
    console.error("Error in POST /api/radios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/radios/duration", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const { id, seconds } = req.body;
    if (!id || !seconds || seconds <= 0) {
      return res.status(400).json({ ok: false, error: 'id and seconds required' });
    }

    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/radio_channels?id=eq.${id}&select=total_duration`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    const rows = await getRes.json() as any[];
    const current = rows?.[0]?.total_duration || 0;

    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/radio_channels?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ total_duration: current + seconds })
      }
    );

    res.json({ ok: patchRes.ok });
  } catch (error: any) {
    console.error("Error in PATCH /api/radios/duration:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/radios", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase environment variables are missing." });
  }

  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ ok: false, error: 'name required' });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/radio_channels?name=eq.${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    res.json({ ok: response.ok });
  } catch (error: any) {
    console.error("Error in DELETE /api/radios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/nowplaying", async (req, res) => {
  const { url: streamUrl } = req.query;
  if (!streamUrl) {
    return res.status(400).json({ ok: false, error: 'url required' });
  }

  try {
    const response = await fetch(streamUrl as string, {
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'Mozilla/5.0',
        'Range': 'bytes=0-65536'
      },
      signal: AbortSignal.timeout(5000)
    });
    const metaInt = parseInt(response.headers.get('icy-metaint') || '0');
    if (!metaInt) {
      return res.json({ ok: false, song: '' });
    }
    
    if (!response.body) {
      return res.json({ ok: false, song: '' });
    }

    const reader = response.body as any;
    let buffer = Buffer.alloc(0);
    
    for await (const chunk of reader) {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length >= metaInt + 256) {
        break;
      }
    }

    const metaLen = buffer[metaInt] * 16;
    if (!metaLen) {
      return res.json({ ok: false, song: '' });
    }
    const metaBytes = buffer.subarray(metaInt + 1, metaInt + 1 + metaLen);
    const metaStr = new TextDecoder().decode(metaBytes);
    const song = metaStr.match(/StreamTitle='([^']+)'/)?.[1] || '';
    res.json({ ok: true, song });
  } catch (error: any) {
    console.error("Error in GET /api/nowplaying:", error);
    res.json({ ok: false, song: '' });
  }
});

app.get("/api/worker/radios", async (req, res) => {
  const { workerUrl } = req.query;
  if (!workerUrl) {
    return res.status(400).json({ error: "Missing workerUrl parameter" });
  }

  try {
    let cleanUrl = (workerUrl as string).replace(/\/$/, "");
    if (cleanUrl.includes("music-worker")) {
      cleanUrl = "https://radio-worker.ma68.workers.dev";
    }
    console.log(`Proxying radios request to: ${cleanUrl}/radios`);
    const response = await fetch(`${cleanUrl}/radios`);
    
    if (!response.ok) {
      throw new Error(`Worker returned status code: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const radios = await response.json();
      res.json(radios);
    } else {
      const text = await response.text();
      if (text.trim() === "OK") {
        // Many workers return "OK" if route exists but has no data
        return res.json([]);
      }
      throw new Error(`Worker returned non-JSON response: ${text.slice(0, 100)}`);
    }
  } catch (error: any) {
    console.error("Error proxying radios from Cloudflare worker:", error);
    res.status(500).json({ error: "Failed to fetch radios from your worker", details: error.message });
  }
});

app.get("/api/worker/nowplaying", async (req, res) => {
  const { workerUrl, url } = req.query;
  if (!workerUrl || !url) {
    return res.status(400).json({ error: "Missing workerUrl or url parameters" });
  }

  try {
    let cleanUrl = (workerUrl as string).replace(/\/$/, "");
    if (cleanUrl.includes("music-worker")) {
      cleanUrl = "https://radio-worker.ma68.workers.dev";
    }
    console.log(`Proxying nowplaying request to: ${cleanUrl}/nowplaying?url=${encodeURIComponent(url as string)}`);
    const response = await fetch(`${cleanUrl}/nowplaying?url=${encodeURIComponent(url as string)}`);
    
    if (!response.ok) {
      throw new Error(`Worker returned status code: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error proxying nowplaying from Cloudflare worker:", error);
    res.status(500).json({ error: "Failed to fetch nowplaying from your worker", details: error.message });
  }
});

app.post("/api/worker/upload", async (req, res) => {
  const { workerUrl, youtube_url, song_name } = req.body;
  if (!workerUrl || !youtube_url || !song_name) {
    return res.status(400).json({ error: "Missing required parameters (workerUrl, youtube_url, song_name)" });
  }

  try {
    const cleanUrl = workerUrl.replace(/\/$/, "");
    console.log(`Proxying workflow dispatch request to: ${cleanUrl}`);
    const response = await fetch(cleanUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ youtube_url, song_name }),
    });

    if (!response.ok) {
      throw new Error(`Worker returned status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error proxying upload dispatch to worker:", error);
    res.status(500).json({ error: "Failed to dispatch build via worker", details: error.message });
  }
});

app.post("/api/worker/delete", async (req, res) => {
  const { workerUrl, public_id } = req.body;
  if (!workerUrl || !public_id) {
    return res.status(400).json({ error: "Missing required parameters (workerUrl, public_id)" });
  }

  try {
    const cleanUrl = workerUrl.replace(/\/$/, "");
    console.log(`Proxying delete request to: ${cleanUrl}/delete`);
    const response = await fetch(`${cleanUrl}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id }),
    });

    if (!response.ok) {
      throw new Error(`Worker returned status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error proxying media deletion to worker:", error);
    res.status(500).json({ error: "Failed to delete from remote storage", details: error.message });
  }
});

app.post("/api/ai/recommend", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt parameter" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback mock if Gemini API Key is missing, returning dynamic answers matching prompt keywords in Arabic and English
    const isArabic = /[\u0600-\u06FF]/.test(prompt);
    const mockRecommendations = [
      {
        title: isArabic ? "نسيم الرياض" : "Desert Mirage",
        artist: "Arabic Ambient project",
        genre: "Acoustic Lounge",
        description: isArabic ? "لحن هادئ من وحي رمال الصحراء الذهبية للاسترخاء." : "Soothing acoustic soundscape inspired by golden deserts."
      },
      {
        title: isArabic ? "أضواء المدينة" : "Neon Citylights",
        artist: "Tokyo Synth",
        genre: "Synthwave",
        description: isArabic ? "موسيقى ذات طابع مستقبلي وحيوي لتنشيط ذهنك." : "Energetic futuristic synth music to elevate focus."
      },
      {
        title: isArabic ? "مطر خفيف" : "Gentle Rain Café",
        artist: "Lofi Dreamer",
        genre: "Lo-Fi Beats",
        description: isArabic ? "نغمات بيانو دافئة مع رذاذ المطر الهادئ للمذاكرة والتركيز." : "Warm piano tracks backed by soft rain for study sessions."
      }
    ];
    return res.json({ recommendations: mockRecommendations, simulated: true });
  }

  try {
    const isArabic = /[\u0600-\u06FF]/.test(prompt);
    const systemIns = `You are "Spotifyy Assistant", a premium music recommendation intelligence built in the Spotifyy player. 
      Your task is to analyze the user's mood, request, activity, or language (Arabic or English) and recommend a curated set of 4-6 perfect songs.
      For each song, provide:
      1. title (The name of the song)
      2. artist (The artist name)
      3. genre (The suitable genre)
      4. description (A beautiful 1-sentence explanation of why it fits their prompt perfectly, written in the SAME language as their query: Arabic if they wrote in Arabic, English if English).

      Important instructions:
      - If the user wrote in Arabic, write the descriptions in beautiful, warm, professional Arabic.
      - Return the results strictly conforming to the requested JSON JSON Schema array format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "artist", "genre", "description"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const recommendations = JSON.parse(text);
    res.json({ recommendations });
  } catch (error: any) {
    console.error("AI recommend error:", error);
    res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
  }
});

app.post("/api/supabase/import", async (req, res) => {
  const { stations, customUrl, customKey, customTable } = req.body;

  if (!stations || !Array.isArray(stations)) {
    return res.status(400).json({ error: "Missing or invalid stations array" });
  }

  const supabaseUrl = customUrl || process.env.SUPABASE_URL;
  const supabaseKey = customKey || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = customTable || "radio_channels";

  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({
      error: "Supabase credentials are not configured. Please fill in the Supabase URL and Key in the app settings or the configuration panel below."
    });
  }

  try {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
    const apiEndpoint = `${cleanUrl}/rest/v1/${tableName}`;

    console.log(`Exporting ${stations.length} radio channels to Supabase: ${apiEndpoint}`);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "apikey": supabaseKey.trim(),
        "Authorization": `Bearer ${supabaseKey.trim()}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(stations)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Supabase REST API Error response:", errText);
      throw new Error(`Supabase API responded with code ${response.status}: ${errText}`);
    }

    let responseData = [];
    try {
      responseData = await response.json();
    } catch (e) {
      // Sometimes representation might not return a valid json or empty string response if nothing is selected or depending on headers
      console.warn("Could not parse Supabase JSON response, assuming success since response was OK");
    }

    return res.json({ ok: true, count: stations.length, data: responseData });
  } catch (error: any) {
    console.error("Supabase import error:", error);
    return res.status(500).json({ error: error.message || "Failed to import to Supabase" });
  }
});

app.post("/api/supabase/update-duration", async (req, res) => {
  const { name, durationToAdd, customUrl, customKey, customTable } = req.body;

  if (!name || durationToAdd === undefined) {
    return res.status(400).json({ error: "Missing name or durationToAdd parameters" });
  }

  const supabaseUrl = customUrl || process.env.SUPABASE_URL;
  const supabaseKey = customKey || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = customTable || "radio_channels";

  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({
      error: "Supabase credentials are not configured. Cannot update listening duration."
    });
  }

  try {
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
    const apiEndpoint = `${cleanUrl}/rest/v1/${tableName}?name=eq.${encodeURIComponent(name)}`;

    // 1. Fetch current record
    const getResponse = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "apikey": supabaseKey.trim(),
        "Authorization": `Bearer ${supabaseKey.trim()}`,
      }
    });

    let currentDuration = 0;
    if (getResponse.ok) {
      const data = await getResponse.json();
      if (Array.isArray(data) && data.length > 0) {
        currentDuration = Number(data[0].total_duration) || 0;
      }
    }

    const newDuration = currentDuration + Number(durationToAdd);

    // 2. PATCH the new duration
    const patchResponse = await fetch(apiEndpoint, {
      method: "PATCH",
      headers: {
        "apikey": supabaseKey.trim(),
        "Authorization": `Bearer ${supabaseKey.trim()}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ total_duration: newDuration })
    });

    if (!patchResponse.ok) {
      const errText = await patchResponse.text();
      throw new Error(`Supabase PATCH failed: ${errText}`);
    }

    let updatedData = [];
    try {
      updatedData = await patchResponse.json();
    } catch (e) {
      // ignore JSON parse if returned representation is empty
    }

    return res.json({ ok: true, name, total_duration: newDuration, data: updatedData });
  } catch (error: any) {
    console.error("Error updating Supabase radio duration:", error);
    return res.status(500).json({ error: error.message || "Failed to update Supabase duration" });
  }
});

// Setup Vite middleware for development, static fallback for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
