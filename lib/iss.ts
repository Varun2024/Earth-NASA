export interface IssPosition {
  lat: number;
  lon: number;
  altitudeKm: number;
  velocityKmH: number;
  timestamp: number;
}

const ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";

export async function fetchIss(): Promise<IssPosition | null> {
  try {
    const res = await fetch(ISS_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      latitude: number;
      longitude: number;
      altitude: number;
      velocity: number;
      timestamp: number;
    };
    return {
      lat: d.latitude,
      lon: d.longitude,
      altitudeKm: d.altitude,
      velocityKmH: d.velocity,
      timestamp: d.timestamp,
    };
  } catch {
    return null;
  }
}
