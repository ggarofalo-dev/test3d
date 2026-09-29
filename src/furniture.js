import * as T from "../assets/vendor/three.module.js";
import { box, soft, ellipsoid, cylinder, rod, group } from "./primitives.js";
// All objects are modelled in metres; local +Z is the front of furniture.
export function furnish(scene, m, world, apartment) {
  const root = group(scene);
  root.name = "Furniture";
  const inventory = [];
  function item(name, x, z, w, d, angle = 0) {
    const g = group(root, x, z, angle);
    g.name = name;
    inventory.push({ name, x, z, w, d, angle });
    if (w && d) world.add(x, z, w, d, angle, name);
    return g;
  }
  function plant(parent, x, y, z, size = 0.7) {
    const g = group(parent, x, z);
    g.position.y = y;
    const r = size * 0.17;
    cylinder(g, r, r * 0.7, size * 0.28, 0, size * 0.14, 0, m.pot);
    cylinder(g, r * 0.9, r * 0.9, 0.012, 0, size * 0.283, 0, m.soil);
    for (let i = 0; i < 11; i++) {
      const a = i * 2.4,
        height = size * (0.48 + (i % 4) * 0.13),
        spread = size * (0.15 + (i % 3) * 0.06),
        px = Math.cos(a) * spread,
        pz = Math.sin(a) * spread;
      rod(g, [0, size * 0.26, 0], [px, height, pz], 0.007 * size, m.green);
      const leaf = ellipsoid(
        g,
        px,
        height,
        pz,
        size * 0.075,
        size * 0.21,
        size * 0.024,
        i % 3 ? m.green : m.leafLight,
      );
      leaf.rotation.set(Math.cos(a) * 0.6, a, Math.sin(a) * 0.7);
    }
    return g;
  }
  function vase(parent, x, y, z, size = 0.25) {
    const points = [
      new T.Vector2(0.09, 0),
      new T.Vector2(0.12, 0.03),
      new T.Vector2(0.115, 0.15),
      new T.Vector2(0.065, 0.23),
      new T.Vector2(0.055, 0.27),
    ].map((v) => v.multiplyScalar(size / 0.27));
    const mesh = new T.Mesh(new T.LatheGeometry(points, 24), m.pot);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    for (let i = 0; i < 6; i++) {
      const a = i * 2.4,
        px = x + Math.cos(a) * size * 0.5,
        pz = z + Math.sin(a) * size * 0.5,
        py = y + size * (1.55 + (i % 3) * 0.14);
      rod(parent, [x, y + size * 0.7, z], [px, py, pz], 0.002, m.green);
      for (let j = 0; j < 5; j++)
        ellipsoid(
          parent,
          px + Math.cos(j * 1.25) * 0.025,
          py,
          pz + Math.sin(j * 1.25) * 0.025,
          0.025,
          0.013,
          0.019,
          m.linen,
        );
    }
  }
  function books(parent, x, y, z) {
    for (let i = 0; i < 3; i++)
      box(
        parent,
        0.24 - i * 0.015,
        0.033,
        0.17,
        x + (i % 2) * 0.025,
        y + 0.018 + i * 0.038,
        z,
        [m.sage, m.linen, m.walnut][i],
      );
  }
  function rug(x, z, w, d, mat = m.rug) {
    soft(root, w, 0.016, d, 0.004, x, 0.026, z, mat);
    for (const side of [-1, 1])
      for (let i = 0; i < Math.floor(w / 0.045); i++)
        box(
          root,
          0.012,
          0.006,
          0.07,
          x - w / 2 + i * 0.045,
          0.021,
          z + side * (d / 2 + 0.023),
          mat,
        );
  }
  function cabinet(parent, w, h, d, x, y, z, mat = m.wood, doors = 3) {
    box(parent, w - 0.06, 0.09, d - 0.08, x, y + 0.05, z, m.dark);
    box(parent, w, h - 0.12, d, x, y + (h + 0.12) / 2, z, mat);
    for (let i = 0; i < doors; i++) {
      const xx = x - w / 2 + ((i + 0.5) * w) / doors;
      box(
        parent,
        w / doors - 0.014,
        h - 0.18,
        0.023,
        xx,
        y + (h + 0.12) / 2,
        z + d / 2 + 0.008,
        mat,
      );
      box(
        parent,
        0.08,
        0.013,
        0.023,
        xx,
        y + h - 0.075,
        z + d / 2 + 0.029,
        m.brass,
      );
    }
    box(parent, w + 0.025, 0.035, d + 0.025, x, y + h, z, mat);
  }
  function sideboard(name, x, z, w, d, angle = 0, h = 0.77) {
    const g = item(name, x, z, w, d, angle);
    cabinet(g, w, h, d, 0, 0, 0, m.walnut, Math.round(w / 0.5));
    return g;
  }
  function chair(parent, x, z, angle = 0, stool = false) {
    const g = group(parent, x, z, angle),
      h = stool ? 0.66 : 0.46;
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        rod(
          g,
          [a * 0.21, 0.025, b * 0.2],
          [a * 0.165, h - 0.035, b * 0.16],
          0.021,
          m.walnut,
        );
    soft(g, 0.45, 0.095, 0.44, 0.035, 0, h, 0, m.sofa);
    const back = soft(
      g,
      0.46,
      stool ? 0.22 : 0.37,
      0.07,
      0.029,
      0,
      h + (stool ? 0.16 : 0.22),
      -0.19,
      m.wood,
    );
    back.rotation.x = -0.12;
    soft(
      g,
      0.38,
      stool ? 0.13 : 0.24,
      0.025,
      0.01,
      0,
      h + (stool ? 0.16 : 0.22),
      -0.142,
      m.sofa,
    );
    if (stool) {
      for (const s of [-1, 1])
        rod(g, [-0.19, 0.25, s * 0.18], [0.19, 0.25, s * 0.18], 0.014, m.brass);
    }
    return g;
  }
  function cushion(g, x, y, z, mat, angle = 0) {
    const p = soft(g, 0.38, 0.38, 0.14, 0.06, x, y, z, mat);
    p.rotation.set(0.19, angle, 0.1);
    return p;
  }
  function sofa() {
    const g = item("Divano angolare", 1.53, 2.56, 2.85, 0.96, Math.PI / 2);
    for (const x of [-1.2, 1.2])
      for (const z of [-0.32, 0.32])
        cylinder(g, 0.03, 0.025, 0.12, x, 0.09, z, m.dark);
    soft(g, 2.9, 0.24, 0.92, 0.075, 0, 0.27, 0, m.sofa);
    soft(g, 2.85, 0.6, 0.19, 0.075, 0, 0.63, -0.38, m.sofa);
    for (const x of [-1.36, 1.36])
      soft(g, 0.2, 0.55, 0.95, 0.07, x, 0.48, 0, m.sofa);
    for (let i = 0; i < 3; i++) {
      const x = -0.87 + i * 0.87;
      soft(g, 0.83, 0.17, 0.72, 0.055, x, 0.47, 0.045, m.sofa);
      const p = soft(g, 0.84, 0.44, 0.18, 0.06, x, 0.72, -0.24, m.sofa);
      p.rotation.x = -0.1;
    }
    soft(g, 0.83, 0.33, 0.85, 0.075, 0.88, 0.3, 0.72, m.sofa);
    soft(g, 0.83, 0.17, 0.79, 0.06, 0.88, 0.47, 0.72, m.sofa); // Separate collider for the extended chaise.
    world.add(2.28, 1.68, 0.82, 0.83, 0, "Chaise longue");
    cushion(g, -1.03, 0.71, 0.06, m.sage, -0.25);
    cushion(g, 1.06, 0.7, 0.08, m.sage, 0.28);
    cushion(g, 0.77, 0.65, 0.19, m.linen, 0.25);
  }
  function armchair() {
    const g = item("Poltrona", 3.67, 3.78, 0.78, 0.79, 2.6);
    soft(g, 0.75, 0.2, 0.78, 0.08, 0, 0.3, 0, m.sofa);
    soft(g, 0.73, 0.51, 0.17, 0.07, 0, 0.62, -0.3, m.sofa);
    soft(g, 0.53, 0.14, 0.57, 0.055, 0, 0.47, 0.03, m.sofa);
    for (const s of [-1, 1])
      soft(g, 0.12, 0.33, 0.68, 0.04, s * 0.32, 0.48, 0, m.sofa);
    for (const x of [-0.26, 0.26])
      for (const z of [-0.27, 0.27])
        cylinder(g, 0.023, 0.017, 0.24, x, 0.14, z, m.walnut);
    cushion(g, 0, 0.67, -0.02, m.rug);
  }
  function ovalTable() {
    const g = item("Tavolino ovale", 2.98, 2.65, 0.69, 0.98);
    cylinder(g, 0.34, 0.31, 0.05, 0, 0.4, 0, m.walnut, 48).scale.z = 1.48;
    for (const x of [-0.21, 0.21])
      for (const z of [-0.33, 0.33])
        rod(g, [x, 0.03, z], [x * 0.9, 0.38, z * 0.9], 0.018, m.dark);
    books(g, 0.02, 0.43, 0.22);
    vase(g, -0.02, 0.43, -0.13, 0.17);
  }
  rug(2.71, 2.53, 2.86, 3.5, m.rug2);
  sofa();
  armchair();
  ovalTable();
  const tv = sideboard("Mobile TV", 4.77, 2.74, 2.2, 0.36, -Math.PI / 2, 0.54);
  box(tv, 1.67, 0.94, 0.047, 0, 1.21, -0.045, m.dark);
  box(tv, 1.59, 0.86, 0.01, 0, 1.21, -0.015, m.screen);
  for (const x of [-0.5, 0.5]) {
    rod(tv, [x, 0.57, 0.1], [x * 0.85, 0.77, -0.025], 0.015, m.dark);
  }
  books(tv, 0.72, 0.575, 0);
  plant(tv, -0.86, 0.565, 0.015, 0.35);
  const west = sideboard(
    "Consolle salone",
    0.2,
    2.63,
    2.24,
    0.32,
    Math.PI / 2,
    0.82,
  );
  plant(west, -0.86, 0.86, 0, 0.37);
  vase(west, 0.66, 0.86, 0, 0.22);
  books(west, 0.07, 0.855, 0);
  const entryConsole = sideboard(
    "Mobile laterale ingresso",
    0.2,
    6.34,
    1.8,
    0.32,
    Math.PI / 2,
    0.8,
  );
  vase(entryConsole, -0.55, 0.84, 0, 0.28);
  plant(entryConsole, 0.54, 0.84, 0, 0.4);
  sideboard("Credenza zona pranzo", 4.8, 6.53, 1.85, 0.32, -Math.PI / 2, 0.86);
  plant(root, 0.45, 0, 7.64, 0.7);
  plant(root, 2.12, 0, 0.38, 1);
  plant(root, 4.55, 0, 1.35, 0.75);
  rug(2.68, 5.94, 2.58, 2.12);
  const dining = item("Tavolo pranzo", 2.68, 5.96, 1.82, 0.88);
  soft(dining, 1.86, 0.065, 0.92, 0.018, 0, 0.765, 0, m.walnut);
  for (const x of [-0.76, 0.76])
    for (const z of [-0.32, 0.32])
      rod(dining, [x, 0.02, z], [x * 0.94, 0.74, z * 0.94], 0.034, m.walnut);
  vase(dining, 0.05, 0.806, 0, 0.25);
  for (const z of [5.24, 6.68])
    for (const x of [2.1, 2.68, 3.26]) {
      chair(root, x, z, z < 6 ? 0 : Math.PI);
      world.add(x, z, 0.43, 0.45, 0, "Sedia pranzo");
    }
  // Kitchen: western run, island with induction hob and three seats to the east.
  const kitchen = item("Basi cucina", -3.78, 2.5, 3.35, 0.65, Math.PI / 2);
  cabinet(kitchen, 3.35, 0.88, 0.65, 0, 0, 0, m.wood, 6);
  box(kitchen, 3.42, 0.045, 0.71, 0, 0.91, 0, m.stone);
  box(kitchen, 3.4, 0.38, 0.035, 0, 1.11, -0.332, m.stone);
  function faucet(g, x, y, z) {
    cylinder(g, 0.023, 0.027, 0.22, x, y + 0.11, z, m.metal);
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(x, y + 0.18, z),
      new T.Vector3(x, y + 0.31, z),
      new T.Vector3(x, y + 0.33, z + 0.1),
      new T.Vector3(x, y + 0.25, z + 0.15),
    ]);
    const mesh = new T.Mesh(
      new T.TubeGeometry(curve, 16, 0.017, 8, false),
      m.metal,
    );
    mesh.castShadow = true;
    g.add(mesh);
    box(g, 0.08, 0.015, 0.022, x + 0.04, y + 0.15, z, m.metal);
  }
  function bowl(g, x, y, z, w, d, depth, mat) {
    const profile = [
        [1, 0],
        [0.9, 0.004],
        [0.78, -0.022],
        [0.64, -depth],
        [0.035, -depth],
      ],
      positions = [],
      indices = [],
      n = 64;
    for (const [scale, height] of profile)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2,
          c = Math.cos(a),
          s = Math.sin(a);
        positions.push(
          Math.sign(c) * Math.abs(c) ** 0.55 * w * 0.5 * scale,
          height,
          Math.sign(s) * Math.abs(s) ** 0.55 * d * 0.5 * scale,
        );
      }
    for (let j = 0; j < profile.length - 1; j++)
      for (let i = 0; i < n; i++) {
        const a = j * n + i,
          b = j * n + ((i + 1) % n),
          c = (j + 1) * n + i,
          d = (j + 1) * n + ((i + 1) % n);
        indices.push(a, c, b, b, c, d);
      }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
    cylinder(g, 0.023, 0.023, 0.003, x, y - depth + 0.003, z, m.metal);
    return mesh;
  }
  function basin(g, x, y, z, w = 0.48, d = 0.35) {
    return bowl(g, x, y + 0.12, z, w, d, 0.1, m.ceramic);
  }
  for (const x of [-0.3, 0.24]) {
    bowl(kitchen, x, 1.018, 0.03, 0.49, 0.47, 0.075, m.metal);
  }
  faucet(kitchen, -0.04, 0.94, -0.23);
  function hob(g, x, y, z, w = 0.59, d = 0.55) {
    soft(g, w, 0.015, d, 0.008, x, y, z, m.black);
    for (const a of [-1, 1])
      for (const b of [-1, 1]) {
        const ring = new T.Mesh(
          new T.TorusGeometry(0.085, 0.002, 6, 36),
          m.metal,
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x + a * w * 0.24, y + 0.013, z + b * d * 0.23);
        g.add(ring);
      }
    for (let i = 0; i < 4; i++)
      cylinder(
        g,
        0.006,
        0.006,
        0.002,
        x - 0.06 + i * 0.04,
        y + 0.012,
        z + d * 0.4,
        m.trim,
        8,
      );
  }
  hob(kitchen, 1.08, 0.944, 0.02);
  plant(kitchen, 1.45, 0.94, 0, 0.35);
  const fridge = item("Frigorifero", -3.76, 4.53, 0.7, 0.77, Math.PI / 2);
  soft(fridge, 0.72, 1.93, 0.72, 0.025, 0, 1.0, 0, m.metal);
  box(fridge, 0.69, 0.66, 0.035, 0, 0.4, 0.38, m.trim);
  box(fridge, 0.69, 1.13, 0.035, 0, 1.32, 0.38, m.trim);
  for (const y of [0.61, 1.06])
    box(fridge, 0.035, 0.26, 0.065, -0.23, y, 0.43, m.metal);
  const island = item("Isola cucina", -2.07, 2.52, 0.96, 2.36);
  cabinet(island, 0.9, 0.89, 2.28, 0, 0, 0, m.wood, 2);
  box(island, 1.05, 0.065, 2.46, 0, 0.94, 0, m.wood);
  hob(island, -0.08, 0.98, 0.26, 0.65, 0.59);
  box(island, 0.014, 0.47, 0.58, 0.463, 0.53, 0.26, m.dark);
  box(island, 0.018, 0.32, 0.44, 0.473, 0.49, 0.26, m.screen);
  box(island, 0.037, 0.025, 0.42, 0.498, 0.735, 0.26, m.metal);
  plant(island, 0.02, 0.978, 0.94, 0.3);
  const fruitBowl = cylinder(
    island,
    0.135,
    0.085,
    0.05,
    0,
    1.01,
    -0.85,
    m.walnut,
  );
  for (let i = 0; i < 5; i++)
    ellipsoid(
      island,
      Math.cos(i * 2.4) * 0.065,
      1.055,
      Math.sin(i * 2.4) * 0.065 - 0.85,
      0.04,
      0.04,
      0.038,
      new T.MeshStandardMaterial({
        color: i % 2 ? "#c08b28" : "#bc652a",
        roughness: 0.6,
      }),
    );
  for (const z of [1.66, 2.46, 3.26]) {
    chair(root, -1.27, z, -Math.PI / 2, true);
    world.add(-1.27, z, 0.45, 0.45, 0, "Sgabello");
  }
  plant(root, -3.75, 0, 0.35, 0.83);
  plant(root, -1.5, 0, 0.28, 0.8);
  // Bedrooms: beds point east, wardrobes on the eastern wall.
  function bed(name, x, z, width, blanket) {
    const g = item(name, x, z, width, 2.04, Math.PI / 2);
    soft(g, width + 0.1, 0.22, 2.05, 0.05, 0, 0.23, 0, m.rug);
    for (const x of [-width / 2 + 0.12, width / 2 - 0.12])
      for (const z of [-0.8, 0.8])
        cylinder(g, 0.032, 0.022, 0.18, x, 0.12, z, m.walnut);
    soft(g, width + 0.13, 0.88, 0.14, 0.055, 0, 0.57, -1, m.sofa);
    soft(g, width, 0.23, 1.98, 0.075, 0, 0.45, 0.015, m.linen);
    soft(g, width + 0.02, 0.055, 1.19, 0.018, 0, 0.589, 0.42, blanket);
    box(g, width + 0.035, 0.22, 1.15, 0, 0.49, 0.46, blanket);
    soft(g, width + 0.02, 0.057, 0.22, 0.017, 0, 0.615, -0.045, blanket);
    for (const xx of [-width * 0.25, width * 0.25]) {
      const p = soft(
        g,
        width * 0.44,
        0.15,
        0.44,
        0.06,
        xx,
        0.64,
        -0.66,
        m.linen,
      );
      p.rotation.y = xx * 0.12;
    }
    cushion(g, -width * 0.23, 0.7, -0.39, blanket, 0.12);
    return g;
  }
  rug(6.31, 1.55, 2.18, 2.45, m.rug2);
  bed("Letto matrimoniale", 6.3, 1.55, 1.62, m.sage);
  rug(6.46, 8.17, 2.12, 2.35, m.rug2);
  bed("Letto camera 2", 6.3, 8.28, 1.35, m.blue);
  function bedside(x, z) {
    const g = item("Comodino", x, z, 0.4, 0.4);
    cabinet(g, 0.4, 0.43, 0.4, 0, 0, 0, m.wood, 1);
    cylinder(g, 0.09, 0.1, 0.025, 0, 0.47, 0, m.brass);
    cylinder(g, 0.012, 0.012, 0.19, 0, 0.56, 0, m.brass);
    cylinder(g, 0.105, 0.13, 0.13, 0, 0.69, 0, m.linen);
  }
  bedside(5.4, 2.7);
  bedside(5.4, 9.19);
  plant(root, 8.05, 0, 2.56, 0.75);
  plant(root, 8.03, 0, 9.2, 0.8);
  plant(root, 6.6, 0, 7.12, 0.43);
  function wardrobe(x, z) {
    const g = item("Armadio", x, z, 2.7, 0.56, -Math.PI / 2);
    cabinet(g, 2.7, 2.4, 0.56, 0, 0, 0, m.walnut, 5);
    for (let i = 0; i < 42; i++)
      box(g, 0.018, 2.18, 0.016, -1.28 + i * 0.062, 1.22, 0.316, m.wood);
    for (const x of [-0.8, -0.27, 0.27, 0.8])
      box(g, 0.016, 0.3, 0.047, x, 1.13, 0.35, m.dark);
  }
  wardrobe(8.8, 1.5);
  wardrobe(8.8, 8.16);
  const desk = item("Scrivania", 8.17, 8.39, 1.24, 0.49, -Math.PI / 2);
  box(desk, 1.25, 0.045, 0.51, 0, 0.75, 0, m.wood);
  for (const x of [-0.53, 0.53])
    for (const z of [-0.2, 0.2])
      rod(desk, [x, 0.02, z], [x, 0.73, z], 0.021, m.dark);
  box(desk, 0.38, 0.025, 0.27, 0, 0.79, 0.04, m.dark);
  const laptop = box(desk, 0.38, 0.26, 0.016, 0, 0.924, -0.105, m.metal);
  laptop.rotation.x = -0.15;
  box(desk, 0.341, 0.218, 0.005, 0, 0.929, -0.083, m.screen);
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 9; j++)
      box(
        desk,
        0.023,
        0.003,
        0.019,
        -0.13 + j * 0.032,
        0.805,
        -0.035 + i * 0.032,
        m.metal,
      );
  books(desk, 0.44, 0.785, 0);
  chair(root, 7.58, 8.42, Math.PI / 2);
  world.add(7.58, 8.42, 0.44, 0.46, 0, "Sedia scrivania");
  // Sanitary fixtures with curved bowls, rims, drains and separate seats.
  function toilet(parent, x, z, bidet = false) {
    const g = group(parent, x, z);
    soft(g, 0.34, 0.27, 0.42, 0.07, 0, 0.2, 0.06, m.ceramic);
    ellipsoid(g, 0, 0.36, 0.1, 0.19, 0.11, 0.26, m.ceramic);
    const rim = new T.Mesh(new T.TorusGeometry(0.15, 0.026, 10, 40), m.ceramic);
    rim.rotation.x = -Math.PI / 2;
    rim.scale.y = 1.43;
    rim.position.set(0, 0.435, 0.11);
    g.add(rim);
    ellipsoid(g, 0, 0.412, 0.11, 0.125, 0.025, 0.18, m.stone);
    cylinder(g, 0.021, 0.021, 0.006, 0, 0.438, 0.1, m.metal);
    if (!bidet) {
      soft(g, 0.35, 0.37, 0.15, 0.035, 0, 0.48, -0.19, m.ceramic);
      box(g, 0.07, 0.009, 0.035, 0, 0.675, -0.19, m.metal);
      const seat = ellipsoid(g, 0, 0.475, 0.095, 0.17, 0.025, 0.225, m.ceramic);
      seat.rotation.x = -0.035;
    } else faucet(g, 0, 0.43, -0.15);
    return g;
  }
  function vanity(name, x, z, angle = 0) {
    const g = item(name, x, z, 0.62, 0.44, angle);
    cabinet(g, 0.61, 0.68, 0.43, 0, 0.08, 0, m.wood, 2);
    box(g, 0.66, 0.035, 0.47, 0, 0.785, 0, m.stone);
    basin(g, 0, 0.83, 0.025, 0.53, 0.36);
    faucet(g, 0, 0.86, -0.16);
    box(g, 0.65, 0.8, 0.04, 0, 1.48, -0.21, m.brass);
    box(g, 0.61, 0.76, 0.008, 0, 1.48, -0.184, m.mirror);
    box(g, 0.54, 0.025, 0.035, 0, 1.91, -0.16, m.glow);
  }
  const bath1 = group(root);
  for (const [x, bidet] of [
    [6.94, true],
    [8.03, false],
  ]) {
    toilet(bath1, x, 3.42, bidet);
    world.add(x, 3.46, 0.39, 0.62, 0, bidet ? "Bidet bagno 1" : "WC bagno 1");
  }
  vanity("Lavabo bagno 1", 7.47, 3.39);
  const bath2 = group(root);
  for (const [x, bidet] of [
    [7.53, true],
    [8.13, false],
  ]) {
    toilet(bath2, x, 5.19, bidet);
    world.add(x, 5.25, 0.39, 0.62, 0, bidet ? "Bidet bagno 2" : "WC bagno 2");
  }
  vanity("Lavabo bagno 2", 7.51, 6.3, Math.PI);
  const shower = item("Doccia", 8.75, 3.97, 0.71, 1.66);
  soft(shower, 0.69, 0.065, 1.62, 0.028, 0, 0.06, 0, m.ceramic);
  box(shower, 0.56, 0.006, 1.45, 0, 0.099, 0, m.stone);
  cylinder(shower, 0.036, 0.036, 0.005, 0, 0.106, 0.44, m.metal);
  for (const z of [-0.8, 0.8]) {
    box(shower, 0.025, 2.14, 0.025, -0.34, 1.11, z, m.metal);
  }
  const pane = box(shower, 0.009, 2.04, 1.58, -0.34, 1.14, 0, m.glass);
  pane.castShadow = false;
  box(shower, 0.03, 0.025, 1.65, -0.34, 2.17, 0, m.metal);
  rod(shower, [-0.37, 0.95, 0.4], [-0.37, 1.18, 0.4], 0.011, m.metal);
  rod(shower, [0.21, 0.9, -0.55], [0.21, 2.07, -0.55], 0.014, m.metal);
  rod(shower, [0.21, 2.07, -0.55], [0, 2.07, -0.55], 0.014, m.metal);
  cylinder(shower, 0.095, 0.095, 0.018, 0, 2.06, -0.55, m.metal);
  box(shower, 0.09, 0.13, 0.02, 0.21, 1, -0.55, m.metal);
  // Hollow tub: four rounded walls around a recessed basin, not a solid white block.
  const tub = item("Vasca da bagno", 8.72, 5.74, 0.75, 1.55);
  soft(tub, 0.74, 0.14, 1.53, 0.06, 0, 0.13, 0, m.ceramic);
  for (const x of [-0.32, 0.32])
    soft(tub, 0.11, 0.43, 1.53, 0.045, x, 0.32, 0, m.ceramic);
  for (const z of [-0.7, 0.7])
    soft(tub, 0.58, 0.43, 0.13, 0.045, 0, 0.32, z, m.ceramic);
  soft(tub, 0.54, 0.028, 1.25, 0.012, 0, 0.22, 0, m.stone);
  cylinder(tub, 0.027, 0.027, 0.005, 0, 0.237, -0.47, m.metal);
  faucet(tub, 0.25, 0.56, -0.47);
  box(tub, 0.66, 0.026, 0.27, 0, 0.566, 0.32, m.wood);
  const towel = soft(tub, 0.28, 0.035, 0.3, 0.012, 0, 0.602, 0.32, m.linen);
  plant(root, 6.94, 0, 6.19, 0.46);
  // Wall tile bands: real 60 cm joints, subtle and correctly scaled.
  for (const r of [
    { x: 6.62, z: 3.12, w: 2.5, d: 1.7 },
    { x: 6.62, z: 4.94, w: 2.5, d: 1.6 },
  ]) {
    const mat = m.stone.clone();
    mat.map = m.stone.map.clone();
    mat.map.repeat.set(r.w / 0.6, 2.4 / 0.6);
    box(root, r.w, 2.38, 0.014, r.x + r.w / 2, 1.19, r.z + 0.008, mat);
    box(root, r.w, 2.38, 0.014, r.x + r.w / 2, 1.19, r.z + r.d - 0.008, mat);
  }
  // Pendants, reading lights and switches. Light emitters correspond to scene.js.
  function pendant(x, z, y = 2.12, r = 0.22) {
    cylinder(root, 0.055, 0.055, 0.025, x, 2.676, z, m.dark);
    rod(root, [x, 2.66, z], [x, y + 0.11, z], 0.006, m.dark);
    cylinder(root, r * 0.65, r, 0.2, x, y, z, m.linen);
    cylinder(root, r * 0.87, r * 0.87, 0.009, x, y - 0.103, z, m.glow);
  }
  pendant(2.68, 5.96, 2.02, 0.32);
  pendant(2.5, 2.25, 2.23, 0.27);
  pendant(-2.07, 1.8, 2.14, 0.18);
  pendant(-2.07, 3.2, 2.14, 0.18);
  for (const [x, z] of [
    [7.1, 1.5],
    [7.1, 8.16],
    [5.8, 4.8],
    [7.75, 3.97],
    [7.75, 5.74],
  ]) {
    cylinder(root, 0.17, 0.17, 0.04, x, 2.66, z, m.trim);
    cylinder(root, 0.135, 0.135, 0.009, x, 2.635, z, m.glow);
  }
  for (const [x, z, angle] of [
    [3.64, 7.98, Math.PI],
    [4.98, 4.64, -Math.PI / 2],
    [-0.14, 3.94, -Math.PI / 2],
    [5.31, 2.98, Math.PI],
    [5.3, 6.68, 0],
  ]) {
    const g = group(root, x, z, angle);
    box(g, 0.082, 0.115, 0.018, 0, 1.12, 0, m.trim);
    const button = box(g, 0.055, 0.075, 0.022, 0, 1.12, 0.015, m.trim);
    button.userData.interactable = { type: "switch" };
  }
  // Linen curtains alongside the living room and bedroom windows.
  for (const [x, z, w] of [
    [0.55, 0.04, 1.2],
    [2.65, 0.04, 1.75],
    [5.85, 0.04, 1.55],
    [6.15, 9.62, 1.55],
  ]) {
    rod(root, [x - 0.12, 2.45, z], [x + w + 0.12, 2.45, z], 0.012, m.brass);
    for (const xx of [x - 0.02, x + w - 0.16])
      for (let i = 0; i < 5; i++) {
        const cloth = box(
          root,
          0.043,
          2.18,
          0.04,
          xx + i * 0.041,
          1.34,
          z + 0.018 * Math.sin(i * 2),
          m.linen,
        );
        cloth.castShadow = true;
      }
  }
  // Quiet abstract prints above consoles, aligned with the side walls.
  function art(x, z, angle) {
    const g = group(root, x, z, angle);
    box(g, 0.62, 0.84, 0.035, 0, 1.67, 0, m.walnut);
    box(g, 0.57, 0.79, 0.01, 0, 1.67, 0.023, m.linen);
    const circle = ellipsoid(g, 0.06, 1.73, 0.035, 0.17, 0.22, 0.008, m.sage);
    box(g, 0.28, 0.05, 0.012, -0.04, 1.46, 0.04, m.walnut);
  }
  art(0.025, 6.3, Math.PI / 2);
  art(4.975, 6.5, -Math.PI / 2);
  return { root, inventory };
}
