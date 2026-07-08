import bcrypt from "bcryptjs";

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
  SECRET_KEY?: string;
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
    if (url.pathname.startsWith("/api/radios") || url.pathname === "/api/nowplaying") {
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
