// Vercel serverless function. Proxies Gemini requests so the API key
// never reaches the browser bundle (GEMINI_API_KEY is a server-only env var).
interface VercelLikeRequest {
  method?: string;
  body?: { prompt?: unknown };
}

interface VercelLikeResponse {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
    return;
  }

  const { prompt } = req.body ?? {};
  if (typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ error: "Missing 'prompt' string in request body" });
    return;
  }

  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = data?.error?.message || `Gemini request failed with status ${geminiResponse.status}`;
      res.status(geminiResponse.status).json({ error: message });
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      res.status(502).json({ error: "Unexpected Gemini response shape" });
      return;
    }

    res.status(200).json({ text });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Failed to reach Gemini" });
  }
}
