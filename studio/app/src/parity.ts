import { createEngine } from "../../renderer/engine.js";
import historicalBrief from "../data/family-a7.brief.json";
import historicalCameras from "../data/cameras.json";
import syncedBrief from "../data/workspace-seed.json";
import syncedCameras from "../data/workspace-cameras.json";
const query = new URLSearchParams(location.search);
const brief = query.get('source') === 'synced' ? syncedBrief : historicalBrief;
const cameras = query.get('source') === 'synced' ? syncedCameras : historicalCameras;
const id = query.get("view") || cameras[0].id;
const camera = cameras.find((c) => c.id === id);
if (!camera) throw Error("Unknown saved camera");
try {
  const engine = createEngine(document.getElementById("view")!, brief.layout);
  engine.setView(camera);
  await engine.ready();
  (window as any).Parity = {
    inspect: engine.inspect,
    png: engine.screenshot,
    export: engine.exportScene,
  };
  document.body.dataset.ready = id;
  document.querySelector("canvas")!.id = "ready-" + id;
} catch (error) {
  document.body.dataset.error = (error as Error).message;
}
