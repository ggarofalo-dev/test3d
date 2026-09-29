import * as T from "../assets/vendor/three.module.js";
// Bake static meshes per material to reduce draw calls, retaining doors/switches.
export function batchStatic(root) {
  root.updateWorldMatrix(true, true);
  const batches = new Map(),
    objects = [];
  root.traverse((o) => {
    if (
      !o.isMesh ||
      o.isInstancedMesh ||
      Array.isArray(o.material) ||
      o.material.transparent ||
      o.userData.interactable
    )
      return;
    const key = o.material.uuid + ":" + o.castShadow + ":" + o.receiveShadow;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(o);
  });
  for (const meshes of batches.values()) {
    if (meshes.length < 3) continue;
    const geometries = meshes.map((o) => {
      const g = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      return g;
    });
    const count = geometries.reduce(
        (s, g) => s + g.attributes.position.count,
        0,
      ),
      merged = new T.BufferGeometry();
    for (const attr of ["position", "normal", "uv"]) {
      const size = attr === "uv" ? 2 : 3,
        data = new Float32Array(count * size);
      let offset = 0;
      for (const g of geometries) {
        const a = g.attributes[attr];
        if (a) data.set(a.array, offset);
        offset += g.attributes.position.count * size;
      }
      merged.setAttribute(attr, new T.BufferAttribute(data, size));
    }
    merged.computeBoundingSphere();
    const baked = new T.Mesh(merged, meshes[0].material);
    baked.castShadow = meshes[0].castShadow;
    baked.receiveShadow = meshes[0].receiveShadow;
    baked.name = "Static batch";
    objects.push(baked);
    meshes.forEach((o) => o.removeFromParent());
    geometries.forEach((g) => g.dispose());
  }
  // Baked vertices are in world space, so attach to the scene rather than root.
  let scene = root;
  while (scene.parent) scene = scene.parent;
  objects.forEach((o) => scene.add(o));
  return objects.length;
}
