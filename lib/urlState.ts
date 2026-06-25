export interface UrlState {
  layers: { eonet: boolean; neo: boolean; iss: boolean };
  active: string[] | null;
  eventId: string | null;
  neoId: string | null;
}

export function readUrlState(): Partial<UrlState> {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.slice(1);
  if (!hash) return {};
  const params = new URLSearchParams(hash);
  const result: Partial<UrlState> = {};

  const l = params.get("l");
  if (l) {
    result.layers = {
      eonet: l.includes("e"),
      neo: l.includes("n"),
      iss: l.includes("i"),
    };
  }

  const c = params.get("c");
  if (c !== null) result.active = c ? c.split(",") : [];

  const e = params.get("e");
  if (e) result.eventId = e;

  const n = params.get("n");
  if (n) result.neoId = n;

  return result;
}

export function writeUrlState(state: UrlState): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();

  const l =
    (state.layers.eonet ? "e" : "") +
    (state.layers.neo ? "n" : "") +
    (state.layers.iss ? "i" : "");
  if (l !== "eni") params.set("l", l);

  if (state.active) params.set("c", state.active.join(","));
  if (state.eventId) params.set("e", state.eventId);
  if (state.neoId) params.set("n", state.neoId);

  const hash = params.toString();
  const next = hash ? `#${hash}` : "";
  if (next !== window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${next}`);
  }
}
