import * as T from "../assets/vendor/three.module.js";
import { ROOMS } from "./layout.js";
export function createScene(container) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = T.SRGBColorSpace;
  container.append(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color("#b8c9cc");
  const camera = new T.PerspectiveCamera(
    66,
    innerWidth / innerHeight,
    0.045,
    100,
  );
  const hemi = new T.HemisphereLight("#eff6ff", "#bbab8c", 2.0);
  scene.add(hemi);
  const sun = new T.DirectionalLight("#fff0d4", 3.2);
  sun.position.set(-5, 8, -7);
  sun.target.position.set(3, 0, 5);
  scene.add(sun, sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -11,
    right: 11,
    top: 12,
    bottom: -12,
    near: 0.1,
    far: 35,
  });
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  const lights = ROOMS.map((r) => {
    const l = new T.PointLight("#ffe1ae", 7, Math.max(r.w, r.d) * 1.4, 2);
    l.position.set(r.x + r.w / 2, 2.38, r.z + r.d / 2);
    l.userData.room = r.id;
    l.userData.power = Math.min(24, Math.max(4, r.w * r.d * 0.65));
    scene.add(l);
    return l;
  });
  let night = false,
    internalOn = true;
  let emitterMaterial;
  function refresh() {
    hemi.intensity = night ? 0.32 : 1.65;
    sun.intensity = night ? 0.16 : 3.3;
    sun.color.set(night ? "#9ebcff" : "#fff0d4");
    scene.background.set(night ? "#172c45" : "#b8c9cc");
    lights.forEach(
      (l) =>
        (l.intensity = internalOn ? l.userData.power * (night ? 1.2 : 0.4) : 0),
    );
    if (emitterMaterial)
      emitterMaterial.emissiveIntensity = internalOn ? 1.4 : 0;
    renderer.toneMappingExposure = night ? 1.25 : 1.1;
  }
  function setNight(value) {
    night = value;
    refresh();
    return night;
  }
  function toggleLights() {
    internalOn = !internalOn;
    refresh();
    return internalOn;
  }
  function quality(level) {
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        level === "high" ? 2 : level === "medium" ? 1.5 : 1,
      ),
    );
    renderer.shadowMap.enabled = level !== "low";
    sun.shadow.mapSize.setScalar(level === "high" ? 4096 : 2048);
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
    renderer.shadowMap.needsUpdate = true;
    scene.traverse((o) => {
      if (o.material) o.material.needsUpdate = true;
    });
  }
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  refresh();
  return {
    renderer,
    scene,
    camera,
    lights,
    setNight,
    toggleLights,
    setEmitters(material) {
      emitterMaterial = material;
      refresh();
    },
    quality,
    get night() {
      return night;
    },
    get internalOn() {
      return internalOn;
    },
  };
}
