import * as THREE from "three";

export interface SubsolarPoint {
  lat: number;
  lon: number;
}

function toJulianDate(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

export function subsolarPoint(date: Date): SubsolarPoint {
  const D = toJulianDate(date) - 2451545.0;
  const deg = Math.PI / 180;

  const L = (280.46 + 0.9856474 * D) % 360;
  const g = ((357.528 + 0.9856003 * D) % 360) * deg;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * deg;
  const epsilon = (23.439 - 0.0000004 * D) * deg;

  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));

  const gmstHours =
    (18.697374558 + 24.06570982441908 * D) % 24;
  const gmstDeg = (gmstHours * 15 + 360) % 360;

  let lon = (ra / deg - gmstDeg) % 360;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  const lat = dec / deg;

  return { lat, lon };
}

export function sunDirection(date: Date): THREE.Vector3 {
  const { lat, lon } = subsolarPoint(date);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ).normalize();
}
