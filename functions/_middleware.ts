import bcrypt from "bcryptjs";

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
  SECRET_KEY?: string;
  GEMINI_API_KEY?: string;
}

// Simple cookie parser helper
function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
}

// Compute HMAC-SHA256 signature using Web Crypto API (native in Cloudflare Workers)
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    messageData
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Verify session cookie signature and expiration
async function verifySession(cookieValue: string | undefined, secret: string): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [sessionValue, signature] = parts;
  const expectedSignature = await hmacSha256(sessionValue, secret);
  if (signature !== expectedSignature) return false;

  const expiry = parseInt(sessionValue, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;

  return true;
}

// Verify submitted password against the hash
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 1. Try Bcrypt
  try {
    if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      return bcrypt.compareSync(password, hash);
    }
  } catch (e) {
    console.error("Bcrypt verification failed:", e);
  }

  // 2. Try SHA-256 Hex
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const sha256Hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (sha256Hex.toLowerCase() === hash.toLowerCase()) {
      return true;
    }
  } catch (e) {
    console.error("SHA-256 verification failed:", e);
  }

  // 3. Fallback to direct string equality
  return password === hash;
}

// Helpers to replicate Cloudflare Worker logic directly in serverless middleware
async function searchYoutube(query: string, searchHost?: string, searchKey?: string) {
  if (searchHost && searchKey) {
    try {
      const host = searchHost.trim();
      const apiKey = searchKey.trim();
      const url = `https://${host}/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`;
      
      const response = await fetch(url, {
        headers: {
          "x-rapidapi-host": host,
          "x-rapidapi-key": apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        const videos: any[] = [];
        if (data && data.contents && Array.isArray(data.contents)) {
          for (const item of data.contents) {
            if (item.type === "video" && item.video) {
              const v = item.video;
              const videoId = v.videoId;
              if (videoId) {
                videos.push({
                  id: videoId,
                  title: v.title || "Unknown Title",
                  channelTitle: v.author?.title || v.author?.name || "Unknown Channel",
                  thumbnailUrl: v.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                  publishedAt: v.publishedTimeText || "Recent"
                });
              }
            }
          }
        }
        if (videos.length > 0) {
          return videos;
        }
      } else {
        console.warn(`RapidAPI search failed with status ${response.status}`);
      }
    } catch (apiErr: any) {
      console.error("RapidAPI search failed, falling back to scraping:", apiErr.message);
    }
  }

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

async function getEnvFromSupabase(supabaseUrl: string, supabaseKey: string) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/music_keys?select=key,value`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    if (!res.ok) {
      throw new Error(`Supabase music_keys fetch failed: ${res.status}`);
    }
    const data: any = await res.json();
    const e: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.key) e[row.key] = row.value;
      });
    }
    return e;
  } catch (err) {
    console.error("Error loading music_keys from Supabase:", err);
    return {};
  }
}

async function signB2Url(key: string, env: any) {
  const B2_KEY_ID = env.B2_KEY_ID;
  const B2_APP_KEY = env.B2_APP_KEY;
  const B2_BUCKET = env.B2_BUCKET;
  const B2_ENDPOINT = env.B2_ENDPOINT;

  if (!B2_KEY_ID || !B2_APP_KEY || !B2_BUCKET || !B2_ENDPOINT) {
    console.warn("B2 environment variables are missing.");
    return "";
  }

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const expires = 3600;

  const signKey = async (k: Uint8Array, msg: string) => {
    const imported = await crypto.subtle.importKey(
      'raw',
      k,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', imported, new TextEncoder().encode(msg));
    return new Uint8Array(signed);
  };

  const hex = (buf: Uint8Array) => Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const hash = async (msg: string) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
    return hex(new Uint8Array(digest));
  };

  const credScope = `${date}/eu-central-003/s3/aws4_request`;
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const queryString = [
    `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
    `X-Amz-Credential=${encodeURIComponent(B2_KEY_ID + '/' + credScope)}`,
    `X-Amz-Date=${datetime}`,
    `X-Amz-Expires=${expires}`,
    `X-Amz-SignedHeaders=host`
  ].join('&');

  const canonicalRequest = [
    'GET',
    `/${B2_BUCKET}/${encodedKey}`,
    queryString,
    `host:${B2_ENDPOINT}\n`,
    'host',
    'UNSIGNED-PAYLOAD'
  ].join('\n');

  const stringToSign = `AWS4-HMAC-SHA256\n${datetime}\n${credScope}\n${await hash(canonicalRequest)}`;

  const kDate = await signKey(new TextEncoder().encode('AWS4' + B2_APP_KEY), date);
  const kRegion = await signKey(kDate, 'eu-central-003');
  const kService = await signKey(kRegion, 's3');
  const kSigning = await signKey(kService, 'aws4_request');
  const signature = hex(await signKey(kSigning, stringToSign));

  return `https://${B2_ENDPOINT}/${B2_BUCKET}/${encodedKey}?${queryString}&X-Amz-Signature=${signature}`;
}

// A beautiful, highly-polished HTML Login screen (English-only, minimal, elegant)
function getLoginHtml(error?: string, systemInfo?: string): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #09090b;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen text-zinc-100 p-4 selection:bg-[#e91e63] selection:text-white">
    <div class="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        <!-- Accent Glow background effect -->
        <div class="absolute -top-16 -left-16 w-32 h-32 bg-[#e91e63]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header / Lock Icon -->
        <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner text-[#e91e63] animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
        </div>

        <!-- Verification Form -->
        <form method="POST" class="space-y-5">
            <div class="space-y-2">
                <label for="password" class="block text-xs font-bold text-zinc-400 tracking-wide pl-1">
                    Enter Password
                </label>
                <div class="relative">
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        placeholder="••••••••" 
                        class="w-full h-12 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 focus:border-[#e91e63] rounded-2xl px-5 text-sm outline-none transition-all placeholder:text-zinc-600 text-center text-white"
                        autofocus
                    />
                </div>
            </div>

            <!-- Error message feedback -->
            ${error ? `
            <div class="bg-red-950/40 border border-red-900/50 rounded-2xl p-4 flex items-start gap-3">
                <svg class="text-red-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div class="text-xs text-red-200 leading-relaxed font-semibold">
                    ${error}
                </div>
            </div>
            ` : ""}

            <button 
                type="submit" 
                class="w-full h-12 bg-gradient-to-r from-[#e91e63] to-[#ff4081] hover:opacity-95 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-[#e91e63]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                <span>Enter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </form>

        <!-- System diagnostic info shown for debugging if configuration is missing -->
        ${systemInfo ? `
        <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-500 font-mono space-y-1 overflow-x-auto">
            <p class="font-bold text-zinc-400">⚠️ System Configuration Alert:</p>
            <p>${systemInfo}</p>
        </div>
        ` : ""}
    </div>
</body>
</html>`;
}

// Intercept all requests
export async function onRequest(context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}): Promise<Response> {
  const request = context.request;
  const url = new URL(request.url);

  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseKey = context.env.SUPABASE_KEY;
  const secretKey = context.env.SECRET_KEY || "default_hmac_secret_key_site_lock";

  // Check if system environment configuration is complete
  let systemAlert = "";
  if (!supabaseUrl || !supabaseKey) {
    systemAlert = `Missing environment variables in Cloudflare Pages. Please define SUPABASE_URL and SUPABASE_KEY in settings.`;
  }

  // Handle Logout Endpoint
  if (url.pathname === "/api/logout" || url.pathname === "/logout") {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": "site_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    });
  }

  // 1. Parse existing cookies
  const cookies = parseCookies(request.headers.get("Cookie"));
  const sessionToken = cookies["site_session"];

  // 2. Verify cookie session token
  const isAuthorized = await verifySession(sessionToken, secretKey);

  // If already authorized, proceed to the actual site or handle internal radio API routes
  if (isAuthorized) {
    if (
      url.pathname.startsWith("/api/radios") ||
      url.pathname === "/api/nowplaying" ||
      url.pathname.startsWith("/api/songs") ||
      url.pathname === "/api/youtube/search" ||
      url.pathname === "/api/worker/upload" ||
      url.pathname === "/api/worker/delete"
    ) {
      // 1. GET /api/radios
      if (request.method === "GET" && url.pathname === "/api/radios") {
        const genre = url.searchParams.get('genre');
        let query = `${supabaseUrl}/rest/v1/radio_channels?select=*&order=total_duration.desc`;
        if (genre) {
          query += `&genre=eq.${encodeURIComponent(genre)}`;
        }
        const res = await fetch(query, {
          headers: {
            'apikey': supabaseKey || "",
            'Authorization': `Bearer ${supabaseKey || ""}`
          }
        });
        const radios = await res.json();
        return new Response(JSON.stringify(radios), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 2. POST /api/radios/batch
      if (request.method === "POST" && url.pathname === "/api/radios/batch") {
        let newRadios;
        try {
          newRadios = await request.json() as any;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!Array.isArray(newRadios) || newRadios.length === 0) {
          return new Response(JSON.stringify({ ok: false, error: 'Array required' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const invalid = newRadios.filter((r: any) => !r.name || !r.url);
        if (invalid.length > 0) {
          return new Response(JSON.stringify({ ok: false, error: 'name and url required for all items' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const res = await fetch(
          `${supabaseUrl}/rest/v1/radio_channels`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=ignore-duplicates'
            },
            body: JSON.stringify(newRadios.map((r: any) => ({ name: r.name, url: r.url, logo: r.logo || '', genre: r.genre || '' })))
          }
        );

        return new Response(JSON.stringify({ ok: res.ok, added: newRadios.length }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3. POST /api/radios
      if (request.method === "POST" && url.pathname === "/api/radios") {
        let body;
        try {
          body = await request.json() as any;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const { name, url: streamUrl, logo, genre } = body;
        if (!name || !streamUrl) {
          return new Response(JSON.stringify({ ok: false, error: 'name and url required' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const res = await fetch(
          `${supabaseUrl}/rest/v1/radio_channels`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, url: streamUrl, logo: logo || '', genre: genre || '' })
          }
        );

        return new Response(JSON.stringify({ ok: res.ok }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 4. PATCH /api/radios/duration
      if (request.method === "PATCH" && url.pathname === "/api/radios/duration") {
        let body;
        try {
          body = await request.json() as any;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const { id, seconds } = body;
        if (!id || !seconds || seconds <= 0) {
          return new Response(JSON.stringify({ ok: false, error: 'id and seconds required' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const getRes = await fetch(
          `${supabaseUrl}/rest/v1/radio_channels?id=eq.${id}&select=total_duration`,
          {
            headers: {
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`
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
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ total_duration: current + seconds })
          }
        );

        return new Response(JSON.stringify({ ok: patchRes.ok }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 5. DELETE /api/radios
      if (request.method === "DELETE" && url.pathname === "/api/radios") {
        let body;
        try {
          body = await request.json() as any;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const { name } = body;
        if (!name) {
          return new Response(JSON.stringify({ ok: false, error: 'name required' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        const res = await fetch(
          `${supabaseUrl}/rest/v1/radio_channels?name=eq.${encodeURIComponent(name)}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`
            }
          }
        );

        return new Response(JSON.stringify({ ok: res.ok }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 6. GET /api/nowplaying
      if (request.method === "GET" && url.pathname === "/api/nowplaying") {
        const streamUrl = url.searchParams.get('url');
        if (!streamUrl) {
          return new Response(JSON.stringify({ ok: false, error: 'url required' }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const res = await fetch(streamUrl, {
            headers: {
              'Icy-MetaData': '1',
              'User-Agent': 'Mozilla/5.0',
              'Range': 'bytes=0-65536'
            },
            signal: AbortSignal.timeout(5000)
          });
          const metaInt = parseInt(res.headers.get('icy-metaint') || '0');
          if (!metaInt) {
            return new Response(JSON.stringify({ ok: false, song: '' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          const reader = res.body.getReader();
          let buffer = new Uint8Array(0);
          while (buffer.length < metaInt + 256) {
            const { done, value } = await reader.read();
            if (done) break;
            const tmp = new Uint8Array(buffer.length + value.length);
            tmp.set(buffer); tmp.set(value, buffer.length);
            buffer = tmp;
          }
          reader.cancel();
          const metaLen = buffer[metaInt] * 16;
          if (!metaLen) {
            return new Response(JSON.stringify({ ok: false, song: '' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          const metaBytes = buffer.slice(metaInt + 1, metaInt + 1 + metaLen);
          const metaStr = new TextDecoder().decode(metaBytes);
          const song = metaStr.match(/StreamTitle='([^']+)'/)?.[1] || '';
          return new Response(JSON.stringify({ ok: true, song }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch {
          return new Response(JSON.stringify({ ok: false, song: '' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 7. GET and DELETE /api/songs
      if (url.pathname === "/api/songs") {
        if (request.method === "GET") {
          const res = await fetch(`${supabaseUrl}/rest/v1/songs?select=*`, {
            headers: {
              'apikey': supabaseKey || "",
              'Authorization': `Bearer ${supabaseKey || ""}`
            }
          });
          const songs = await res.json();
          if (Array.isArray(songs)) {
            const supaEnv = await getEnvFromSupabase(supabaseUrl || "", supabaseKey || "");
            const allSongs = await Promise.all(songs.map(async (s: any) => {
              let songUrl = s.url || '';
              if (s.source === 'cloudinary') {
                songUrl = `https://res.cloudinary.com/${supaEnv.CLOUDINARY_NAME}/video/upload/${s.id}.mp3`;
              } else if (s.source === 'b2') {
                songUrl = await signB2Url(`${s.id}.mp3`, supaEnv);
              }
              return { ...s, url: songUrl };
            }));
            return new Response(JSON.stringify(allSongs), {
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          return new Response(JSON.stringify(songs), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        if (request.method === "DELETE") {
          let body;
          try {
            body = await request.json() as any;
          } catch {
            return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
              status: 400, headers: { 'Content-Type': 'application/json' }
            });
          }

          const { id } = body;
          if (!id) {
            return new Response(JSON.stringify({ ok: false, error: 'id required' }), {
              status: 400, headers: { 'Content-Type': 'application/json' }
            });
          }

          const res = await fetch(
            `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': supabaseKey || "",
                'Authorization': `Bearer ${supabaseKey || ""}`
              }
            }
          );

          return new Response(JSON.stringify({ ok: res.ok }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 8. POST /api/youtube/search
      if (request.method === "POST" && url.pathname === "/api/youtube/search") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {}

        const { query, workerUrl } = body;
        if (!query) {
          return new Response(JSON.stringify({ error: "Missing query parameter" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (workerUrl) {
          try {
            const cleanUrl = workerUrl.replace(/\/$/, "");
            const response = await fetch(`${cleanUrl}/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
              const data = await response.json();
              return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          } catch (e: any) {
            console.warn("Worker search failed, falling back:", e.message);
          }
        }

        let searchHost: string | undefined;
        let searchKey: string | undefined;
        if (supabaseUrl && supabaseKey) {
          try {
            const supaEnv = await getEnvFromSupabase(supabaseUrl, supabaseKey);
            searchHost = supaEnv.SEARCH_RAPIDAPI_HOST;
            searchKey = supaEnv.SEARCH_RAPIDAPI_KEY;
          } catch (e: any) {
            console.error("Error loading search keys from Supabase in middleware search handler:", e.message);
          }
        }

        const results = await searchYoutube(query, searchHost, searchKey);
        return new Response(JSON.stringify({ results }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 9. POST /api/worker/upload
      if (request.method === "POST" && url.pathname === "/api/worker/upload") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {}

        const { youtube_url, song_name, title, artist, thumb } = body;
        if (!youtube_url || !song_name) {
          return new Response(JSON.stringify({ error: "Missing required parameters (youtube_url, song_name)" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!supabaseUrl || !supabaseKey) {
          return new Response(JSON.stringify({ error: "Supabase environment variables are missing." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const supaEnv = await getEnvFromSupabase(supabaseUrl, supabaseKey);
          if (!supaEnv.GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN is missing in Supabase music_keys.");
          }

          const response = await fetch(
            'https://api.github.com/repos/gity678/Spotify/actions/workflows/cloudinary.yml/dispatches',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supaEnv.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'User-Agent': 'music-worker'
              },
              body: JSON.stringify({
                ref: 'main',
                inputs: {
                  youtube_url,
                  song_name,
                  title: title || '',
                  artist: artist || '',
                  thumb: thumb || ''
                }
              })
            }
          );

          if (response.status !== 204) {
            const errText = await response.text();
            throw new Error(`GitHub API returned status ${response.status}: ${errText}`);
          }

          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: "Failed to dispatch build workflow", details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 10. POST /api/worker/delete
      if (request.method === "POST" && url.pathname === "/api/worker/delete") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {}

        const { public_id } = body;
        if (!public_id) {
          return new Response(JSON.stringify({ error: "Missing required parameter (public_id)" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!supabaseUrl || !supabaseKey) {
          return new Response(JSON.stringify({ error: "Supabase environment variables are missing." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const supaEnv = await getEnvFromSupabase(supabaseUrl, supabaseKey);

          // 1. Delete from Supabase
          const query = `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(public_id)}`;
          await fetch(query, {
            method: "DELETE",
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });

          // 2. Delete from Cloudinary
          let cloudinaryDeleted = false;
          if (supaEnv.CLOUDINARY_KEY && supaEnv.CLOUDINARY_SECRET && supaEnv.CLOUDINARY_NAME) {
            const auth = btoa(`${supaEnv.CLOUDINARY_KEY}:${supaEnv.CLOUDINARY_SECRET}`);
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${supaEnv.CLOUDINARY_NAME}/resources/video/upload?public_ids[]=${encodeURIComponent(public_id)}`,
              { method: 'DELETE', headers: { 'Authorization': `Basic ${auth}` } }
            );
            if (response.ok) {
              const delResult = await response.json() as any;
              cloudinaryDeleted = !!(delResult.deleted && delResult.deleted[public_id] === 'deleted');
            }
          }

          return new Response(JSON.stringify({ ok: true, cloudinaryDeleted }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: "Failed to delete media", details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return context.next();
  }

  // 3. Handle form submission (POST) to authenticate
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const password = formData.get("password")?.toString();

      if (!password) {
        return new Response(getLoginHtml("Password is required", systemAlert), {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      if (!supabaseUrl || !supabaseKey) {
        return new Response(getLoginHtml("Database is not configured yet", systemAlert), {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      // Fetch the password hash from Supabase public.auth table
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
      const apiEndpoint = `${cleanUrl}/rest/v1/auth?select=password_hash&limit=1`;

      const dbResponse = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          "apikey": supabaseKey.trim(),
          "Authorization": `Bearer ${supabaseKey.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (!dbResponse.ok) {
        const errText = await dbResponse.text();
        console.error("Supabase auth table query failed:", errText);
        return new Response(getLoginHtml(`Connection to Supabase failed (Ensure auth table and password_hash column exist)<br/><span class="text-[10px] font-mono text-red-400">${errText}</span>`, systemAlert), {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      const data = await dbResponse.json() as any[];
      if (!data || data.length === 0) {
        return new Response(getLoginHtml("No password configured in auth table", systemAlert), {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      const passwordHash = data[0].password_hash;
      const isValid = await verifyPassword(password, passwordHash);

      if (isValid) {
        // Set a secure HttpOnly session cookie valid for 30 days
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const sessionValue = expiry.toString();
        const signature = await hmacSha256(sessionValue, secretKey);

        const cookieValue = `site_session=${sessionValue}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;

        // Redirect back to the requested page
        return new Response(null, {
          status: 302,
          headers: {
            "Location": url.pathname + url.search,
            "Set-Cookie": cookieValue,
          },
        });
      } else {
        return new Response(getLoginHtml("Incorrect Password", systemAlert), {
          status: 401,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    } catch (err: any) {
      console.error("Authentication handling error:", err);
      return new Response(getLoginHtml(`Error processing request: ${err.message || err}`, systemAlert), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  // 4. If not logged in and not submitting password, show the login page
  return new Response(getLoginHtml(undefined, systemAlert), {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
