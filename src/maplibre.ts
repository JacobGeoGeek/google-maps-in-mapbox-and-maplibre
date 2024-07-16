import { Map } from "maplibre-gl";

const API_KEY: string = "SOME-API-KEY";
const GOOGLE_MAP_TILE_BASE_URL: string = "https://tile.googleapis.com/v1";

async function createSessionToken(): Promise<any> {
  const response: Response = await fetch(
    `${GOOGLE_MAP_TILE_BASE_URL}/createSession?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mapType: "satellite",
        language: "en-US",
        region: "US",
      }),
    }
  );

  const json: any = await response.json();

  if (json.error) {
    throw new Error(json.error.message);
  }
  return json;
}

// Initialize the MapLibre map
const myMap: Map = new Map({
  container: "maplibre",
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  zoom: 9,
  center: [-74.5447, 40.6892],
});

myMap.on("load", async () => {
  try {
    // Create a session token
    const payload: any = await createSessionToken();
    console.log("Session token created:", payload);

    // Add a raster source with Google satellite tiles
    myMap.addSource("google-satellite-tiles-source", {
      type: "raster",
      tiles: [
        `${GOOGLE_MAP_TILE_BASE_URL}/2dtiles/{z}/{x}/{y}?session=${payload.session}&key=${API_KEY}`,
      ],
      tileSize: 256,
    });

    // Add a raster layer using the source
    myMap.addLayer({
      id: "google-satellite-tiles",
      type: "raster",
      source: "google-satellite-tiles-source",
    });

    console.log("Layer added successfully");
  } catch (error) {
    console.error("Error loading Google satellite tiles:", error);
  }
});

// Additional debugging logs
myMap.on("styledata", () => {
  console.log("Style data loaded");
});

myMap.on("sourcedata", (e) => {
  console.log("Source data loaded", e.sourceId);
});

myMap.on("error", (e) => {
  console.error("Map error:", e.error);
});
