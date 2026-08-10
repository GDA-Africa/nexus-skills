---
skill: mapbox-integration
version: 1.0.0
framework: shared
category: maps
triggers:
  - "mapbox"
  - "map integration"
  - "mapbox GL"
  - "mapbox-gl-js"
  - "interactive map"
  - "map tiles"
  - "geospatial"
  - "location features"
  - "offline map"
  - "custom map style"
  - "map markers"
  - "map clustering"
  - "geocoding"
  - "route navigation"
  - "satellite imagery"
author: "@nexus-framework/skills"
status: active
---

# Skill: Mapbox Integration (Shared)

## When to Read This
Read this skill when adding Mapbox maps to any application — whether initializing the SDK for the first time, building geospatial features, optimizing tile costs, implementing offline-first behaviour, or designing map UX. Read it before writing a single line of Mapbox code.

## Context
Mapbox is a powerful but cost-sensitive platform. Every tile load, every API call to the Directions/Geocoding/Search APIs, every SDK initialisation can accumulate real billing. A senior developer treats the Mapbox account budget as a first-class product concern alongside UX. This skill codifies patterns that simultaneously keep maps fast, beautiful, offline-capable, and within budget. It is framework-agnostic and applies to React, Next.js, Vue, Svelte, React Native, and plain JS.

---

## Steps

1. **Audit access token scope** — create a scoped token (only the styles, tilesets, and API services actually needed). Never use the default secret token in a client app.
2. **Choose the right SDK** — `mapbox-gl-js` for web, `@rnmapbox/maps` for React Native, Mapbox Maps SDK for native iOS/Android. Pick once, do not mix.
3. **Lock the SDK version** — pin the exact version in `package.json` (not `^`). Mapbox GL JS has had breaking style spec changes between minors.
4. **Initialise the map lazily** — mount the map only when it enters the viewport (Intersection Observer). Do not initialise on page load if the map is below the fold.
5. **Set a tileURL allow-list / transformRequest** — intercept every tile request and cache aggressively. Do not let the SDK re-fetch tiles the user just downloaded.
6. **Design styles in Mapbox Studio offline** — finish the style before deploying. Every Studio save triggers a new style version that could invalidate client-side caches.
7. **Cluster markers at the source level** — use GeoJSON source `cluster: true` with `clusterMaxZoom` and `clusterRadius`. Do not cluster in application code with a library.
8. **Gate expensive API calls behind debounce + abort** — Geocoding, Search, and Directions calls must be debounced (300–500 ms) and the previous `AbortController` cancelled before each new request.
9. **Implement offline-first with a tile cache strategy** — use the Mapbox Offline SDK (mobile) or a Service Worker tile cache (web) before going live.
10. **Monitor Monthly Active Users (MAU) and tile requests** — wire usage metrics into your observability dashboard. Set billing alerts in the Mapbox account before shipping to production.

---

## Patterns We Use

### Token Management
- **One scoped token per environment** — dev, staging, prod each have separate tokens with minimum required scopes.
- **Tokens live in environment variables only** — `NEXT_PUBLIC_MAPBOX_TOKEN`, `VITE_MAPBOX_TOKEN`, `EXPO_PUBLIC_MAPBOX_TOKEN` etc. Never in source code or committed files.
- **URL restrictions on production tokens** — lock the prod token to the production domain via Mapbox token URL restrictions. This prevents token abuse from third parties who find it in your JS bundle.
- **Rotate tokens on any accidental exposure** — treat a leaked token like a leaked password. Revoke immediately and rotate.

### SDK Initialisation
- **Single map instance** — store the `mapboxgl.Map` instance in a module-level ref or a React ref. Never re-create the instance; update data through sources and layers instead.
- **`preserveDrawingBuffer: false`** (default) — only set `true` if you need `canvas.toDataURL()`. It cuts GPU memory usage.
- **`fadeDuration: 0`** during testing — avoids flaky screenshot assertions. Restore to `300` (default) in production for smooth tile transitions.
- **`localFontFamily`** — load Mapbox fonts locally if your privacy policy disallows third-party font requests.
- **`collectResourceTiming: false`** in production — reduces overhead unless you are profiling tile load times.

### Cost Optimisation
- **Style simplification** — every layer in a style costs render time and tile size. Remove unused layers in Studio before publishing. A stripped-down style can cut tile bandwidth 30–50%.
- **Vector over raster tiles** — use vector styles (`mapbox://styles/mapbox/streets-v12`) instead of raster when you need interactivity. Vector tiles are smaller and style changes don't require new tile downloads.
- **Tighten `maxZoom` and `minZoom`** — if your app never zooms past 16, set `maxZoom: 16`. Tiles above that level are never requested.
- **Limit Bounding Box** — use `maxBounds` to restrict the map to the relevant geographic region. Prevents users (and bots) from panning globally and triggering tile requests for irrelevant regions.
- **Batch Geocoding** — for server-side workflows geocoding many addresses, use the Mapbox Batch Geocoding API instead of calling the single-feature endpoint N times.
- **Cache Directions responses** — route results for identical origin/destination pairs are deterministic over short periods. Cache them in Redis or memory with a short TTL (5–15 minutes).
- **Use `mapbox-gl-js` free tier efficiently** — the free tier (50k map loads/month) counts each `new mapboxgl.Map()` initialisation. Lazy-mount and reuse the instance aggressively.
- **Avoid map loads in tests** — mock the Mapbox SDK in unit and integration tests. Do not initialise a real map in CI — it counts against your MAU quota and is slow.

### Source & Layer Architecture
```
Map
├── Source: geojson-points    (raw GeoJSON, cluster: true)
├── Source: geojson-routes    (LineString GeoJSON)
├── Source: raster-satellite  (raster-dem or raster tiles, only added when needed)
│
├── Layer: clusters           (circle, filter: ['has','point_count'])
├── Layer: cluster-count      (symbol, shows count label)
├── Layer: unclustered-point  (circle, filter: ['!', ['has','point_count']])
├── Layer: routes             (line)
└── Layer: route-arrows       (symbol, icon-image: arrow)
```
- **One source, many layers** — never duplicate source data. Drive multiple visual layers from a single GeoJSON source.
- **Use expressions, not JavaScript filtering** — `filter` and `paint` expressions run on the GPU render thread. Filtering in JS and re-setting source data forces a CPU round-trip.
- **Update data, not layers** — call `source.setData(newGeoJSON)` to update map data. Do not remove and re-add layers; it causes a flash.
- **Add layers after `map.on('load')`** — never add layers before the style is fully loaded. Use a ready-state flag or queue pending operations.

### Offline-First (Web)
```javascript
// service-worker.js — cache Mapbox tiles with a Cache-First strategy
const TILE_CACHE = 'mapbox-tiles-v1';
const TILE_ORIGINS = ['https://api.mapbox.com', 'https://events.mapbox.com'];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (TILE_ORIGINS.some((origin) => url.origin === origin) && event.request.method === 'GET') {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
  }
});
```
- **Cache-first for tiles, network-first for style JSON** — tiles are immutable once served (their URL encodes the version). Style JSON must reflect the latest published version.
- **Prefetch a bounding-box tile set** — for apps that know which region the user will view (e.g. a field worker's assigned zone), prefetch that bounding box at zoom levels 10–16 on first login.
- **Storage quota guard** — check `navigator.storage.estimate()` before prefetching. Abort and warn the user if available quota is below a safe threshold (e.g. 50 MB).
- **Stale-while-revalidate for Geocoding** — cache geocode results in IndexedDB. Serve the cached result immediately, revalidate in the background, and update if the result has changed.

### Offline-First (React Native / Mobile)
- **Use the Mapbox Offline SDK** — `OfflineManager.createPack()` with a precise bounding box, min/max zoom, and the style URL. One offline pack per user region, not one global pack.
- **Measure pack size before download** — call `estimateTiles()` before creating a pack. Display estimated MB to the user and request confirmation for packs > 20 MB.
- **Incremental sync on reconnect** — when the device comes back online, check whether the offline pack is stale (compare `updatedAt` with the cached style version) and offer to refresh.
- **Delete stale packs** — run `OfflineManager.deletePack()` on logout and on app uninstall hook to respect device storage.

### Markers, Popups & Clustering
```typescript
// ✅ Efficient cluster + popup pattern (React)
import Map, { Source, Layer, Popup } from 'react-map-gl';
import type { MapLayerMouseEvent } from 'react-map-gl';

const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'my-data',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
  },
};

const unclusteredLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'my-data',
  filter: ['!', ['has', 'point_count']],
  paint: { 'circle-color': '#11b4da', 'circle-radius': 8 },
};

// Click handler: expand cluster or show popup
function onMapClick(event: MapLayerMouseEvent, mapRef: RefObject<MapRef>) {
  const map = mapRef.current?.getMap();
  if (!map) return;
  const features = map.queryRenderedFeatures(event.point, { layers: ['clusters', 'unclustered-point'] });
  if (!features.length) return;
  const feature = features[0];

  if (feature.layer.id === 'clusters') {
    const clusterId = feature.properties?.cluster_id;
    const source = map.getSource('my-data') as mapboxgl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || zoom === null) return;
      map.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
    });
  } else {
    // Show popup for individual point
    setPopupInfo(feature.properties);
  }
}
```
- **Never use HTML Markers for > 500 points** — `mapboxgl.Marker` creates a DOM element per point. Use symbol layers + GeoJSON instead; they render on the GPU.
- **Popups are singletons** — keep one `Popup` instance and move it. Do not create/destroy popups on each click.
- **Accessibility on popups** — add `aria-live="polite"` to the popup container and trap focus inside when open. Provide a keyboard-accessible close trigger.

### Geocoding & Search
```typescript
// ✅ Debounced, aborted, typed geocoding
let geocodeController: AbortController | null = null;

async function geocode(query: string): Promise<GeocodingFeature[]> {
  if (geocodeController) geocodeController.abort();
  geocodeController = new AbortController();

  const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json');
  url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
  url.searchParams.set('limit', '5');
  url.searchParams.set('country', 'za'); // Restrict to relevant countries — ALWAYS do this

  const res = await fetch(url, { signal: geocodeController.signal });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  return data.features;
}
```
- **Always set `country` and `bbox` parameters** — restricts results to your app's operational geography and reduces irrelevant suggestions. This also saves API calls because less fuzzy matching occurs server-side.
- **Set `types`** — pass `types=address,poi` or whichever types your app needs. Broader types return more suggestions and cost the same per call, but waste round-trips displaying irrelevant results.
- **Debounce at 300 ms minimum** — fire the geocode request only after the user pauses typing.
- **Cache results in memory by query string** — a `Map<string, GeocodingFeature[]>` prevents re-fetching the same query within a session.

### Directions & Navigation
```typescript
// ✅ Directions with caching and abort
const directionsCache = new Map<string, DirectionsRoute>();

async function getRoute(
  origin: [number, number],
  destination: [number, number],
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<DirectionsRoute> {
  const cacheKey = `${profile}:${origin.join(',')}:${destination.join(',')}`;
  if (directionsCache.has(cacheKey)) return directionsCache.get(cacheKey)!;

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.join(',')};${destination.join(',')}.json`
  );
  url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('steps', 'true');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions failed: ${res.status}`);
  const data = await res.json();
  const route = data.routes[0];
  directionsCache.set(cacheKey, route);
  return route;
}
```
- **Route on the server for authenticated workflows** — if the user is logged in, proxy Directions calls through your backend. This hides the token entirely from the client and lets you rate-limit per user.
- **`overview: simplified`** unless you need the full route — simplified geometry is 70–90% smaller and sufficient for displaying a route line without turn-by-turn arrows.

### Custom Styles
- **Create styles in Studio, load by URL** — do not define styles in code. A style URL (`mapbox://styles/your-account/style-id`) allows updating the style without a code deploy.
- **Use `slot` API (GL JS v3+)** — add custom layers to named slots (`'bottom'`, `'middle'`, `'top'`) so they survive style updates without layer ordering hacks.
- **Dark/light mode** — keep two published styles (one light, one dark). Switch by calling `map.setStyle(newStyleUrl, { diff: true })`. The `diff: true` option applies only changed layers, preserving custom sources and layers already added by your app.
- **Sprite sheet hygiene** — only include icons you use in the sprite sheet. Large sprite sheets increase style load time.

### Responsive & UX Patterns
- **`map.resize()` on container size change** — call this inside a `ResizeObserver` callback. Without it, the canvas does not fill its container after a layout shift.
- **`fitBounds` with padding** — always pass `padding` to `fitBounds` / `flyTo` so map UI overlays (sidebars, bottom sheets) don't obscure the points of interest.
- **Disable scroll-to-zoom inside page** — set `scrollZoom: false` on maps embedded inside a scrollable page. Enable it only on mouse-enter and disable on mouse-leave, or only when the user holds a modifier key.
- **Show a loading skeleton** — display a placeholder (matching the map's aspect ratio) while `mapboxgl.Map` initialises. Prevents layout shift and communicates loading state to the user.
- **Touch device considerations** — set `touchZoomRotate: true` (default) but use `touchPitch: false` for apps where accidental 3D tilting hurts UX. Show a "Use two fingers to move the map" overlay on touch devices within a scroll container.
- **Navigation controls placement** — place `NavigationControl` in the top-right by convention. If right-to-left (RTL) languages are supported, mirror to top-left or let the locale drive it.

### React-Specific Patterns (react-map-gl)
```tsx
// ✅ Controlled map with persisted viewport
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import { useState, useCallback } from 'react';
import type { ViewState } from 'react-map-gl';

const INITIAL_VIEW: ViewState = {
  longitude: 28.047305,
  latitude: -26.204103, // Johannesburg
  zoom: 11,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export function AppMap() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);

  // Persist viewport to localStorage so returning users land where they left off
  const onMove = useCallback(({ viewState }: { viewState: ViewState }) => {
    setViewState(viewState);
    localStorage.setItem('map-viewport', JSON.stringify(viewState));
  }, []);

  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      reuseMaps                 // ← Reuse WebGL context across component remounts
      maxBounds={[             // ← Restrict to Southern Africa
        [16.0, -35.0],
        [33.0, -22.0],
      ]}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserHeading
      />
    </Map>
  );
}
```
- **`reuseMaps` prop** — always set this on `react-map-gl`. It reuses the WebGL context and the map's backing canvas when the component remounts, which counts as one map load rather than two.
- **Wrap the map in `React.memo`** — the map container should not re-render from unrelated parent state changes.
- **Co-locate layer definitions as constants outside the component** — layer style objects are compared by reference. Defining them inline causes React to treat them as new objects on every render, triggering unnecessary re-renders in child layer components.

### Security
- **Never use your secret token in a browser app** — the secret token has write access to your account. Use a public (pk.*) token in all client-facing code.
- **Proxy sensitive API calls server-side** — Geocoding, Search, and Directions called from a server can use your secret token, keeping it out of the browser entirely. The client talks to your API, your API talks to Mapbox.
- **Environment-specific tokens** — use a restricted dev token (localhost-only) during local development. This prevents accidental API quota usage when running hot-reload servers.
- **Set token expiry** — use time-limited tokens for ephemeral use cases (e.g. shared public embeds). Rotate before expiry.

### Testing
- **Mock the Mapbox SDK in unit tests** — the real SDK requires a browser WebGL context. Use `vi.mock('mapbox-gl')` or a manual mock that returns stub methods.
- **Use `@testing-library/user-event` for interaction tests** — simulate clicks on cluster circles by firing events on the canvas element, not by calling internal map methods.
- **Snapshot style layer configs** — snapshot test your layer/source configurations to catch accidental paint expression changes that break the map style.
- **Integration test: map loads without errors** — use Playwright/Cypress with a real token in a headed browser to verify the map initialises, tiles load, and no console errors appear. Gate on `map.loaded()`.

---

## Anti-Patterns — Never Do This

- ❌ **Never commit an access token** — not even a "test" token. Rotate it immediately if this happens.
- ❌ **Never use `new mapboxgl.Marker()` for hundreds of points** — it creates DOM nodes per marker and kills scroll performance. Use GeoJSON circle/symbol layers.
- ❌ **Never initialise the map on page load if it's below the fold** — every `new mapboxgl.Map()` counts as a map load. Use Intersection Observer.
- ❌ **Never call the Directions or Geocoding API on every keystroke** — always debounce and cancel in-flight requests.
- ❌ **Never use `setData()` inside a React render** — this is a side effect; call it in a `useEffect` or event handler only.
- ❌ **Never add layers before `map.on('load')`** — the style may not be ready. Queue layer operations until the `load` event fires.
- ❌ **Never ignore tile cache** — loading the same tile twice for the same user session is pure waste. Verify tiles are cached via DevTools → Network → filter by `api.mapbox.com` and confirm 304 responses on revisit.
- ❌ **Never set `maxZoom` higher than your use case requires** — zoom 22 tiles are expensive. Cap at the maximum zoom your UI actually uses.
- ❌ **Never skip `maxBounds`** — without it, users (or crawlers) can pan anywhere on the globe, triggering global tile requests.
- ❌ **Never remove and re-add layers to update data** — use `source.setData()` and expression-driven paint properties instead. Layer removal causes a visual flash.
- ❌ **Never define layer style objects inline in React** — they lose referential equality on every render and force unnecessary layer updates.
- ❌ **Never ship map UI without testing on a mid-range Android device** — WebGL performance and memory constraints on budget Android devices are a frequent blindspot.

---

## Example: Full Integration Checklist

Use this before merging any PR that touches Mapbox:

```markdown
## Mapbox PR Checklist

### Token & Security
- [ ] No token committed to source code
- [ ] Token is environment-variable only
- [ ] Production token has URL restrictions set
- [ ] Dev token is localhost-restricted

### Cost
- [ ] Map is lazy-mounted (Intersection Observer or conditional render)
- [ ] `maxBounds` is set to the operational region
- [ ] `maxZoom` is capped appropriately
- [ ] Geocoding/Directions calls are debounced (≥ 300 ms)
- [ ] Previous in-flight requests are aborted before new ones
- [ ] API calls are not duplicated (caching layer in place)
- [ ] No map initialisations in test suites (mock in place)

### Performance
- [ ] > 500 points use GeoJSON cluster layers, not HTML Markers
- [ ] Layer data updates use `setData()`, not layer removal + re-add
- [ ] Layer style objects are defined outside React component functions
- [ ] `react-map-gl` `reuseMaps` prop is set
- [ ] Map container wrapped in `React.memo`

### Offline
- [ ] Service Worker tile cache implemented (web) OR Offline SDK pack created (mobile)
- [ ] Stale pack / cache invalidation strategy defined
- [ ] Storage quota guard in place before prefetch

### UX
- [ ] Loading skeleton shown while map initialises
- [ ] `map.resize()` wired to `ResizeObserver`
- [ ] `fitBounds` / `flyTo` includes `padding` for UI overlays
- [ ] Scroll-zoom disabled on page-embedded maps (enable on hover/modifier key)
- [ ] Keyboard-accessible popups (focus trap + close button)
- [ ] Tested on mobile (touch zoom, overlay legibility)

### Observability
- [ ] Billing alert set in Mapbox account dashboard
- [ ] MAU and tile request metrics wired to application observability
```

---

## Notes

- **Mapbox GL JS v2 vs v3** — v3 (released late 2023) introduced the Standard style, the `slot` API, and a new lighting model. It is largely backward-compatible but requires style migration if using `fill-extrusion` or custom terrain. Pin to the major version you target and test before upgrading.
- **`react-map-gl` major version alignment** — `react-map-gl` v7+ wraps Mapbox GL JS v2/v3. Confirm that the `mapbox-gl` peer dependency in `react-map-gl` matches your installed `mapbox-gl` version. Version mismatches cause silent style failures.
- **MapLibre GL JS as an alternative** — if Mapbox's per-load pricing becomes a concern at scale, MapLibre GL JS is a fully open-source fork with an identical API. Migration between the two is a package swap plus token removal. Architect your map abstraction layer with this in mind (keep Mapbox-specific calls behind a single `mapService` module).
- **Terrain & 3D buildings** — enabling terrain (`map.setTerrain()`) and 3D building extrusions significantly increases GPU load. Profile on target devices before shipping.
- **Mapbox Events API** — the SDK sends telemetry to `events.mapbox.com`. This is used for MAU counting and is required by the Terms of Service. Do not block it in your Service Worker.
- **Fonts & Glyphs** — Mapbox serves font glyphs from `api.mapbox.com/fonts`. If your CSP blocks this, map labels will disappear silently. Either add the font CDN to your CSP or configure `localFontFamily`.
- **Offline regulatory note** — some geographies have regulations about caching map data (e.g. aviation, defence). Confirm compliance before implementing aggressive tile caching in regulated industries.
