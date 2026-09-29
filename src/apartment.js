import * as T from "../assets/vendor/three.module.js";
import { ROOMS, WALLS, HEIGHT } from "./layout.js";
import { box, cylinder, group } from "./primitives.js";
export function buildApartment(scene, m, world) {
  const root = group(scene),
    ceilings = group(root),
    doors = [],
    windows = [];
  root.name = "Apartment";
  for (const r of ROOMS) {
    const floorMat = m[r.floor].clone();
    if (r.floor !== "oak") {
      floorMat.map = m[r.floor].map.clone();
      floorMat.map.repeat.set(r.w / 0.6, r.d / 0.6);
      floorMat.normalMap = m[r.floor].normalMap.clone();
      floorMat.normalMap.repeat.copy(floorMat.map.repeat);
    }
    box(root, r.w, 0.12, r.d, r.x + r.w / 2, -0.065, r.z + r.d / 2, floorMat);
    box(
      ceilings,
      r.w,
      0.1,
      r.d,
      r.x + r.w / 2,
      HEIGHT + 0.05,
      r.z + r.d / 2,
      m.ceiling,
    );
    if (r.floor === "oak") {
      // Individual 1.2 m × 18 cm planks, staggered joints.
      const plankGeo = new T.BoxGeometry(1, 0.015, 1),
        plankMats = Array.from({ length: 7 }, (_, i) => {
          const a = m.oak.clone();
          a.color.offsetHSL(0, 0, (i - 3) * 0.019);
          return a;
        });
      const planks = [];
      for (let row = 0; row < Math.ceil(r.d / 0.18); row++) {
        let start = -(row % 3) * 0.4;
        for (let x = start; x < r.w; x += 1.2) {
          const a = Math.max(0, x),
            b = Math.min(r.w, x + 1.2);
          if (b - a < 0.01) continue;
          planks.push({
            x: r.x + (a + b) / 2,
            z: r.z + row * 0.18 + Math.min(0.18, r.d - row * 0.18) / 2,
            w: b - a - 0.002,
            d: Math.min(0.18, r.d - row * 0.18) - 0.002,
            index: (row * 7 + Math.round((x + 2) * 13)) % 7,
          });
        }
      }
      for (let i = 0; i < 7; i++) {
        const p = planks.filter((p) => p.index === i),
          mesh = new T.InstancedMesh(plankGeo, plankMats[i], p.length),
          dummy = new T.Object3D();
        p.forEach((p, j) => {
          dummy.position.set(p.x, 0.003, p.z);
          dummy.scale.set(p.w, 1, p.d);
          dummy.updateMatrix();
          mesh.setMatrixAt(j, dummy.matrix);
        });
        mesh.receiveShadow = true;
        root.add(mesh);
      }
    }
  }
  function segment(w, a, b, lo = 0, hi = HEIGHT, collision = true) {
    if (b - a < 0.001) return;
    const x = w.axis === "x" ? (a + b) / 2 : w.at,
      z = w.axis === "x" ? w.at : (a + b) / 2,
      ww = w.axis === "x" ? b - a : w.t,
      dd = w.axis === "x" ? w.t : b - a;
    box(root, ww, hi - lo, dd, x, (hi + lo) / 2, z, m.wall);
    if (collision && lo < 1.9) world.add(x, z, ww, dd, 0, "wall");
    if (lo === 0) {
      const trim = 0.017;
      box(
        root,
        ww + (w.axis === "z" ? trim * 2 : 0),
        0.085,
        dd + (w.axis === "x" ? trim * 2 : 0),
        x,
        0.045,
        z,
        m.trim,
      );
    }
  }
  for (const w of WALLS) {
    let cursor = w.a;
    for (const o of w.open || []) {
      segment(w, cursor, o.at);
      const isWindow = o.type === "window",
        sill = isWindow ? 1.02 : 0,
        top = isWindow ? 2.36 : 2.12;
      segment(w, o.at, o.at + o.w, top, HEIGHT, false);
      if (isWindow) segment(w, o.at, o.at + o.w, 0, sill);
      const g = group(
        root,
        w.axis === "x" ? o.at : w.at,
        w.axis === "x" ? w.at : o.at,
        w.axis === "x" ? 0 : -Math.PI / 2,
      );
      if (isWindow) {
        box(g, o.w + 0.12, 0.065, w.t + 0.16, o.w / 2, 1.015, 0, m.trim);
        for (const x of [0.025, o.w / 2, o.w - 0.025])
          box(g, 0.045, 1.32, 0.085, x, 1.69, 0, m.trim);
        for (const y of [1.055, 2.335])
          box(g, o.w, 0.05, 0.085, o.w / 2, y, 0, m.trim);
        const glass = box(g, o.w - 0.07, 1.23, 0.012, o.w / 2, 1.7, 0, m.glass);
        glass.castShadow = false;
        windows.push(g);
      } else {
        for (const x of [-0.028, o.w + 0.028])
          box(g, 0.055, 2.16, w.t + 0.06, x, 1.08, 0, m.trim);
        box(g, o.w + 0.11, 0.06, w.t + 0.06, o.w / 2, 2.14, 0, m.trim);
        box(g, o.w, 0.018, w.t + 0.03, o.w / 2, 0.015, 0, m.wood);
        const pivot = group(g),
          leaf = box(
            pivot,
            o.w - 0.015,
            2.075,
            0.042,
            (o.w - 0.015) / 2,
            1.047,
            0,
            o.type === "entrance" ? m.walnut : m.trim,
          );
        for (const z of [-0.025, 0.025]) {
          box(pivot, o.w - 0.18, 1.68, 0.012, o.w / 2, 1.13, z, m.wood);
          box(pivot, 0.025, 0.028, 0.11, o.w - 0.12, 1.02, z, m.metal);
          box(
            pivot,
            0.115,
            0.025,
            0.025,
            o.w - 0.16,
            1.02,
            z < 0 ? -0.08 : 0.08,
            m.metal,
          );
        }
        const body = world.add(0, 0, o.w, 0.055, 0, "door:" + o.id);
        const d = {
          id: o.id,
          pivot,
          leaf,
          body,
          width: o.w,
          baseAngle: g.rotation.y,
          open: false,
          angle: 0,
          target: 0,
          sign: o.sign || 1,
          entrance: o.type === "entrance",
        };
        doors.push(d);
        pivot.traverse((o) => {
          if (o.isMesh) o.userData.interactable = d;
        });
        if (d.entrance) {
          // Invisible boundary permits opening the entrance without leaving the model.
          world.add(
            w.axis === "x" ? o.at + o.w / 2 : w.at,
            w.axis === "x" ? w.at : o.at + o.w / 2,
            w.axis === "x" ? o.w : 0.03,
            w.axis === "x" ? 0.03 : o.w,
            0,
            "entrance-boundary",
          );
        }
      }
      cursor = o.at + o.w;
    }
    segment(w, cursor, w.b);
  }
  // Corridor door thresholds bridge the 12 cm partition, all level with the floor.
  const v = new T.Vector3();
  function syncDoor(d) {
    d.pivot.updateWorldMatrix(true, false);
    v.set(d.width / 2, 0, 0).applyMatrix4(d.pivot.matrixWorld);
    d.body.x = v.x;
    d.body.z = v.z;
    d.body.angle = d.baseAngle + d.angle;
  }
  doors.forEach(syncDoor);
  function updateDoors(dt, player) {
    for (const d of doors) {
      if (Math.abs(d.angle - d.target) < 0.001) continue;
      const previous = d.angle;
      d.angle = T.MathUtils.damp(d.angle, d.target, 9, dt);
      d.pivot.rotation.y = d.angle;
      syncDoor(d);
      if (player && world.overlaps(player.x, player.z, d.body, 0.24)) {
        d.angle = previous;
        d.pivot.rotation.y = previous;
        syncDoor(d);
        d.target = previous;
      }
    }
  }
  function toggleDoor(d) {
    const opening = !d.open;
    const target = opening ? (d.sign * Math.PI) / 2 : 0;
    d.open = opening;
    d.target = target;
  }
  return { root, ceilings, doors, windows, updateDoors, toggleDoor };
}
