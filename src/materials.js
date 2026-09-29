import * as T from "../assets/vendor/three.module.js";
let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
function texture(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  c.fillStyle =
    kind === "wood"
      ? "#c5b495"
      : kind === "tile"
        ? "#e1ded3"
        : kind === "stone"
          ? "#d3d3ca"
          : "#ddd8ca";
  c.fillRect(0, 0, 512, 512);
  if (kind === "wood") {
    for (let i = 0; i < 2800; i++) {
      const y = rand() * 512;
      c.strokeStyle = `rgba(${rand() > 0.5 ? "75,48,26" : "255,229,187"},${rand() * 0.15})`;
      c.lineWidth = 0.3 + rand() * 1.5;
      c.beginPath();
      const x = rand() * 512;
      c.moveTo(x, y);
      c.bezierCurveTo(
        x + 40,
        y + rand() * 4,
        x + 140,
        y - rand() * 5,
        x + 200 + rand() * 150,
        y,
      );
      c.stroke();
    }
  } else if (kind === "tile" || kind === "stone") {
    for (let i = 0; i < 8500; i++) {
      const v = rand() > 0.5 ? 255 : 80;
      c.fillStyle = `rgba(${v},${v},${v},${rand() * 0.035})`;
      c.fillRect(rand() * 512, rand() * 512, 2 + rand() * 20, 1 + rand() * 7);
    }
    if (kind === "stone") {
      for (let i = 0; i < 8; i++) {
        c.strokeStyle = "#a7a79e38";
        c.lineWidth = 0.5;
        c.beginPath();
        const x = rand() * 512;
        c.moveTo(x, 0);
        c.bezierCurveTo(x + 90, 190, x - 80, 350, x + 50, 512);
        c.stroke();
      }
    }
    c.strokeStyle = "#b6b6ad";
    c.lineWidth = 3;
    c.strokeRect(0, 0, 512, 512);
  } else {
    for (let y = 0; y < 512; y += 2) {
      c.strokeStyle = y % 4 ? "#79715d22" : "#ffffff42";
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(512, y);
      c.stroke();
    }
    for (let x = 0; x < 512; x += 3) {
      c.fillStyle = "#736d5f17";
      c.fillRect(x, 0, 1, 512);
    }
    for (let i = 0; i < 25000; i++) {
      c.fillStyle = rand() > 0.5 ? "#ffffff20" : "#302d2415";
      c.fillRect(rand() * 512, rand() * 512, 1, 1);
    }
  }
  const t = new T.CanvasTexture(canvas);
  t.colorSpace = T.SRGBColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
function normalFrom(tex, strength = 2) {
  const c = tex.image.getContext("2d"),
    im = c.getImageData(0, 0, 512, 512),
    out = new Uint8Array(512 * 512 * 4);
  const h = (x, y) =>
    im.data[(((y + 512) % 512) * 512 + ((x + 512) % 512)) * 4] / 255;
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      let nx = (h(x - 1, y) - h(x + 1, y)) * strength,
        ny = (h(x, y - 1) - h(x, y + 1)) * strength;
      const len = Math.hypot(nx, ny, 1),
        i = (y * 512 + x) * 4;
      out[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  const t = new T.DataTexture(out, 512, 512);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}
export function createMaterials() {
  const wood = texture("wood"),
    fabric = texture("fabric"),
    tile = texture("tile"),
    stone = texture("stone");
  const wn = normalFrom(wood, 0.8),
    fn = normalFrom(fabric, 1.5);
  const std = (color, roughness = 0.65, extra = {}) =>
    new T.MeshStandardMaterial({ color, roughness, ...extra });
  const textile = (color) =>
    std(color, 0.95, {
      map: fabric,
      normalMap: fn,
      normalScale: new T.Vector2(0.3, 0.3),
    });
  return {
    wall: std("#f1eee4", 0.94, {
      normalMap: fn,
      normalScale: new T.Vector2(0.025, 0.025),
    }),
    ceiling: std("#f9f6ed", 1),
    trim: std("#f4f0e6", 0.55),
    oak: std("#eee3cd", 0.65, { map: wood, normalMap: wn }),
    walnut: std("#9a7952", 0.52, { map: wood, normalMap: wn }),
    wood: std("#e2c59b", 0.55, { map: wood, normalMap: wn }),
    tile: std("#f4f1e8", 0.64, { map: tile, normalMap: normalFrom(tile, 0.8) }),
    stone: std("#f1f2ed", 0.45, {
      map: stone,
      normalMap: normalFrom(stone, 0.45),
    }),
    sofa: textile("#ede6d5"),
    linen: textile("#fff9e9"),
    sage: textile("#7e8664"),
    blue: textile("#527990"),
    rug: textile("#c5b9a0"),
    rug2: textile("#ded4bc"),
    dark: std("#242b29", 0.45),
    black: std("#111a1b", 0.25),
    metal: std("#9fa6a4", 0.2, { metalness: 0.9 }),
    brass: std("#b9a077", 0.28, { metalness: 0.72 }),
    ceramic: std("#fffef7", 0.19),
    green: std("#496537", 0.85),
    leafLight: std("#7c9555", 0.85),
    soil: std("#383024", 1),
    pot: std("#d1c8b8", 0.88),
    glass: new T.MeshPhysicalMaterial({
      color: "#d3ede7",
      roughness: 0.08,
      metalness: 0.08,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: T.DoubleSide,
    }),
    mirror: std("#bbced0", 0.09, { metalness: 0.95 }),
    glow: new T.MeshStandardMaterial({
      color: "#ffefc6",
      emissive: "#ffe5b5",
      emissiveIntensity: 1.4,
    }),
    screen: std("#19292c", 0.18, {
      emissive: "#254044",
      emissiveIntensity: 0.18,
    }),
  };
}
