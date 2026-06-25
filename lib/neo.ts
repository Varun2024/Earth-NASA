export interface NeoObject {
  id: string;
  name: string;
  diameterMeters: number;
  missDistanceKm: number;
  missDistanceLunar: number;
  velocityKmS: number;
  approachTime: string;
  hazardous: boolean;
  url: string;
}

interface RawNeoFeed {
  near_earth_objects: Record<string, RawNeo[]>;
}

interface RawNeo {
  id: string;
  name: string;
  nasa_jpl_url: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: Array<{
    close_approach_date_full: string;
    relative_velocity: { kilometers_per_second: string };
    miss_distance: { kilometers: string; lunar: string };
  }>;
}

const NEO_BASE = "https://api.nasa.gov/neo/rest/v1/feed";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchTodayNeos(): Promise<NeoObject[]> {
  const apiKey = process.env.NASA_API_KEY ?? "DEMO_KEY";
  const date = todayISO();
  const url = `${NEO_BASE}?start_date=${date}&end_date=${date}&api_key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) return [];
  const data = (await res.json()) as RawNeoFeed;
  const day = data.near_earth_objects[date] ?? [];

  return day
    .map((n): NeoObject | null => {
      const approach = n.close_approach_data[0];
      if (!approach) return null;
      const min = n.estimated_diameter.meters.estimated_diameter_min;
      const max = n.estimated_diameter.meters.estimated_diameter_max;
      return {
        id: n.id,
        name: n.name.replace(/[()]/g, "").trim(),
        diameterMeters: (min + max) / 2,
        missDistanceKm: Number(approach.miss_distance.kilometers),
        missDistanceLunar: Number(approach.miss_distance.lunar),
        velocityKmS: Number(approach.relative_velocity.kilometers_per_second),
        approachTime: approach.close_approach_date_full,
        hazardous: n.is_potentially_hazardous_asteroid,
        url: n.nasa_jpl_url,
      };
    })
    .filter((n): n is NeoObject => n !== null)
    .sort((a, b) => a.missDistanceKm - b.missDistanceKm);
}
