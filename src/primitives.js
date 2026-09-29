import * as T from "../assets/vendor/three.module.js";
const boxes = new Map();
export function box(parent, w, h, d, x, y, z, mat) {
  const key = [w, h, d].join(",");
  if (!boxes.has(key)) boxes.set(key, new T.BoxGeometry(w, h, d));
  const m = new T.Mesh(boxes.get(key), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}
const rounded = new Map();
export function soft(parent, w, h, d, r, x, y, z, mat) {
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const key = [w, h, d, r].join(",");
  if (!rounded.has(key)) {
    const shape = new T.Shape(),
      a = -w / 2,
      b = -h / 2;
    shape.moveTo(a + r, b);
    shape.lineTo(a + w - r, b);
    shape.quadraticCurveTo(a + w, b, a + w, b + r);
    shape.lineTo(a + w, b + h - r);
    shape.quadraticCurveTo(a + w, b + h, a + w - r, b + h);
    shape.lineTo(a + r, b + h);
    shape.quadraticCurveTo(a, b + h, a, b + h - r);
    shape.lineTo(a, b + r);
    shape.quadraticCurveTo(a, b, a + r, b);
    const g = new T.ExtrudeGeometry(shape, {
      depth: d - 2 * r,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: r * 0.45,
      bevelThickness: r,
      curveSegments: 5,
    });
    g.translate(0, 0, -d / 2 + r);
    g.computeVertexNormals();
    rounded.set(key, g);
  }
  const m = new T.Mesh(rounded.get(key), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}
const sphere = new T.SphereGeometry(1, 16, 12);
export function ellipsoid(parent, x, y, z, sx, sy, sz, mat) {
  const m = new T.Mesh(sphere, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function cylinder(parent, rt, rb, h, x, y, z, mat, n = 24) {
  const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, n), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function rod(parent, a, b, r, mat) {
  const start = new T.Vector3(...a),
    end = new T.Vector3(...b),
    v = end.clone().sub(start);
  const m = cylinder(parent, r, r, v.length(), 0, 0, 0, mat, 8);
  m.position.copy(start.add(end).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
  return m;
}
export function group(parent, x = 0, z = 0, angle = 0) {
  const g = new T.Group();
  g.position.set(x, 0, z);
  g.rotation.y = angle;
  parent.add(g);
  return g;
}
