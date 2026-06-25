export interface Apod {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: "image" | "video";
  date: string;
  copyright?: string;
}

interface RawApod {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export async function fetchApod(): Promise<Apod | null> {
  const apiKey = process.env.NASA_API_KEY ?? "DEMO_KEY";
  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
      { next: { revalidate: 60 * 60 * 6 } },
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as RawApod;
    return {
      title: raw.title,
      explanation: raw.explanation,
      url: raw.url,
      hdurl: raw.hdurl,
      mediaType: raw.media_type === "video" ? "video" : "image",
      date: raw.date,
      copyright: raw.copyright,
    };
  } catch {
    return null;
  }
}
