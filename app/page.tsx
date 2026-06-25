import { fetchOpenEvents, toPoints } from "@/lib/eonet";
import { fetchTodayNeos } from "@/lib/neo";
import { fetchApod } from "@/lib/apod";
import { Scene } from "@/components/Scene";

export const revalidate = 900;

export default async function Home() {
  const [events, neos, apod] = await Promise.all([
    fetchOpenEvents(),
    fetchTodayNeos(),
    fetchApod(),
  ]);
  const points = toPoints(events);
  return <Scene points={points} neos={neos} apod={apod} />;
}
