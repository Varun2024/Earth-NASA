# Earth — live NASA data on a 3D globe

An interactive 3D Earth that streams real NASA feeds onto the globe: natural
events, near-Earth asteroids, the ISS, and the Astronomy Picture of the Day.
Built with Next.js, Three.js, and react-three-fiber.

## Data sources

- **EONET** — natural events (wildfires, storms, volcanoes, ice) as markers on the globe (`lib/eonet.ts`)
- **NeoWs** — near-Earth objects rendered as orbiting asteroids (`lib/neo.ts`)
- **ISS** — live station position, polled every 5s via `app/api/iss/route.ts` (`lib/iss.ts`)
- **APOD** — Astronomy Picture of the Day card (`lib/apod.ts`)

## Features

- Day/night terminator from a real solar-position calculation (`lib/sunPosition.ts`)
- Category filters, layer toggles, and a timeline scrubber to replay events over time
- Shareable views via URL hash state (`lib/urlState.ts`)
- Optional ambient soundscape (`lib/audio.ts`)
- Responsive layout with a mobile nav (`components/MobileNav.tsx`)

## Getting Started

```bash
npm install
cp .env.example .env.local   # optional, DEMO_KEY works out of the box
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### NASA API key

APOD and NeoWs call api.nasa.gov. `DEMO_KEY` works but is rate-limited (~30/hr).
For a higher limit, grab a free key at [api.nasa.gov](https://api.nasa.gov) and set:

```
NASA_API_KEY=your_key_here
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — ESLint

## Stack

Next.js 16 · React 19 · Three.js · @react-three/fiber · @react-three/drei
