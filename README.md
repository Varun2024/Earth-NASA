<div align="center">

# 🌍 Earth

**A live 3D globe that streams real NASA data — natural events, near-Earth asteroids, the ISS, and the Astronomy Picture of the Day.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r185-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

> _Add a screenshot or GIF of the globe here — it's the first thing people look for._

## What it does

Earth renders an interactive 3D planet and layers four live NASA feeds on top of
it. Spin the globe, scrub through time, filter what you see, and share the exact
view with a link.

| Layer | Source | What you see |
| --- | --- | --- |
| Natural events | [EONET](https://eonet.gsfc.nasa.gov/) | Wildfires, storms, volcanoes, and ice as markers on the surface |
| Near-Earth objects | [NeoWs](https://api.nasa.gov/) | Tracked asteroids as orbiting bodies |
| ISS | [Open Notify](http://open-notify.org/) | The station's live position, refreshed every 5s |
| Picture of the day | [APOD](https://apod.nasa.gov/) | NASA's daily astronomy image |

## Features

- **Real day/night terminator** computed from the actual solar position
- **Category filters & layer toggles** to control what's on the globe
- **Timeline scrubber** to replay events over a date range
- **Shareable views** — the full camera and filter state lives in the URL
- **Optional ambient soundscape**
- **Responsive** down to mobile, with a dedicated nav

## Quick start

```bash
git clone https://github.com/Varun2024/Earth-NASA.git
cd Earth-NASA
npm install
cp .env.example .env.local   # optional — DEMO_KEY works out of the box
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### NASA API key

APOD and NeoWs call `api.nasa.gov`. The built-in `DEMO_KEY` works but is
rate-limited (~30 requests/hour). For more headroom, get a free key at
[api.nasa.gov](https://api.nasa.gov) and set it in `.env.local`:

```
NASA_API_KEY=your_key_here
```

## Project structure

```
app/
  api/iss/route.ts   ISS position proxy
  page.tsx           entry — fetches EONET + NEO, renders the scene
components/
  Scene.tsx          the r3f canvas and all layers
  Earth.tsx          globe, atmosphere, day/night
  EventMarkers.tsx   EONET markers (GPU-instanced)
  NeoObjects.tsx     asteroid orbits
  IssMarker.tsx      live ISS dot
  ...                panels, timeline, share, sound, mobile nav
lib/
  eonet.ts neo.ts iss.ts apod.ts   data fetching
  sunPosition.ts                   solar math for the terminator
  urlState.ts                      shareable view serialization
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Tech stack

Next.js 16 · React 19 · TypeScript · Three.js · [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) · [@react-three/drei](https://github.com/pmndrs/drei)

## Contributing

Issues and pull requests are welcome. For a non-trivial change, open an issue
first to discuss what you'd like to do. Run `npm run lint` before submitting.

## Acknowledgements

Built on NASA's open [Open APIs](https://api.nasa.gov/) and the EONET, NeoWs,
and APOD services. Not affiliated with or endorsed by NASA.

## License

[MIT](LICENSE)
