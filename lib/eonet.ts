export interface EonetCategory {
  id: string;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetGeometry {
  date: string;
  type: "Point" | "Polygon";
  coordinates: number[] | number[][][];
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
}

export interface EonetEventsResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

const EONET_BASE = "https://eonet.gsfc.nasa.gov/api/v3";

export async function fetchOpenEvents(): Promise<EonetEvent[]> {
  const res = await fetch(`${EONET_BASE}/events?status=open`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`EONET request failed: ${res.status}`);
  }
  const data = (await res.json()) as EonetEventsResponse;
  return data.events;
}

export interface EventPoint {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  date: string;
  lon: number;
  lat: number;
  magnitudeValue?: number;
  magnitudeUnit?: string;
  link: string;
  sources: EonetSource[];
}

export function toPoints(events: EonetEvent[]): EventPoint[] {
  const points: EventPoint[] = [];
  for (const evt of events) {
    const last = evt.geometry[evt.geometry.length - 1];
    if (!last || last.type !== "Point") continue;
    const coords = last.coordinates as number[];
    const [lon, lat] = coords;
    if (typeof lon !== "number" || typeof lat !== "number") continue;
    const cat = evt.categories[0];
    if (!cat) continue;
    points.push({
      id: evt.id,
      title: evt.title,
      categoryId: cat.id,
      categoryTitle: cat.title,
      date: last.date,
      lon,
      lat,
      magnitudeValue: last.magnitudeValue,
      magnitudeUnit: last.magnitudeUnit,
      link: evt.link,
      sources: evt.sources,
    });
  }
  return points;
}

export const CATEGORY_COLORS: Record<string, string> = {
  wildfires: "#ff5a1f",
  severeStorms: "#3b82f6",
  volcanoes: "#ef4444",
  seaLakeIce: "#7dd3fc",
  earthquakes: "#facc15",
  floods: "#22d3ee",
  drought: "#d97706",
  dustHaze: "#a8a29e",
  landslides: "#a16207",
  manmade: "#a855f7",
  snow: "#e5e7eb",
  tempExtremes: "#f97316",
  waterColor: "#14b8a6",
};

export function colorFor(categoryId: string): string {
  return CATEGORY_COLORS[categoryId] ?? "#22c55e";
}
