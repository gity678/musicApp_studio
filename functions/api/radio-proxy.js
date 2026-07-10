export async function onRequest(context) {
  const urlObj = new URL(context.request.url);
  const targetUrl = urlObj.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Validate protocol to prevent abuse
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    return new Response("Invalid protocol. Only http:// and https:// are allowed.", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "*/*",
      }
    });

    if (!response.body) {
      return new Response("No response body from source", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");

    // Return a true streaming response using Cloudflare's native stream pipes
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return new Response("Error fetching target stream: " + error.message, { status: 500 });
  }
}
