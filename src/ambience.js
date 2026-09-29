import * as T from "../assets/vendor/three.module.js";
export function addAmbience(scene, renderer, inventory) {
  // A locally generated neutral studio environment gives metal and ceramics reflections.
  const studio = new T.Scene();
  studio.background = new T.Color("#b9bdba");
  const shell = new T.Mesh(
    new T.BoxGeometry(20, 12, 20),
    new T.MeshBasicMaterial({ color: "#77756e", side: T.BackSide }),
  );
  studio.add(shell);
  for (const [x, y, z, w, h, angle] of [
    [0, 3, -9, 9, 4, 0],
    [-9, 3, 0, 8, 4, Math.PI / 2],
    [6, 3, 9, 5, 5, Math.PI],
  ]) {
    const p = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ color: "#fff9e9" }),
    );
    p.position.set(x, y, z);
    p.rotation.y = angle;
    studio.add(p);
  }
  const pmrem = new T.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio, 0.06);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.32;
  pmrem.dispose();
  studio.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
  // Soft baked contact shadows augment the dynamic window/sun shadows at low cost.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d"),
    grad = ctx.createRadialGradient(64, 64, 12, 64, 64, 64);
  grad.addColorStop(0, "rgba(30,24,15,.28)");
  grad.addColorStop(0.55, "rgba(30,24,15,.16)");
  grad.addColorStop(1, "rgba(30,24,15,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const map = new T.CanvasTexture(canvas),
    mat = new T.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      toneMapped: false,
    });
  for (const obj of inventory) {
    if (!obj.w || !obj.d) continue;
    const shadow = new T.Mesh(
      new T.PlaneGeometry(obj.w + 0.34, obj.d + 0.34),
      mat,
    );
    shadow.rotation.set(-Math.PI / 2, 0, -(obj.angle || 0));
    shadow.position.set(obj.x, 0.039, obj.z);
    shadow.userData.ignoreRay = true;
    scene.add(shadow);
  }
  // Distant garden silhouettes are visible through glazing, without external assets.
  const backdrop = new T.Group();
  scene.add(backdrop);
  const ground = new T.Mesh(
    new T.PlaneGeometry(100, 100),
    new T.MeshStandardMaterial({ color: "#90967c", roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.16;
  ground.receiveShadow = true;
  backdrop.add(ground);
  const leaf = new T.MeshStandardMaterial({ color: "#697a58", roughness: 1 });
  for (let i = 0; i < 21; i++) {
    const tree = new T.Mesh(new T.IcosahedronGeometry(1, 2), leaf);
    tree.position.set(-14 + i * 1.6, 1.6 + (i % 3) * 0.3, -9 - (i % 4));
    tree.scale.set(1.5, 2.1, 1.3);
    backdrop.add(tree);
  }
  backdrop.traverse((o) => (o.userData.ignoreRay = true));
  return { env, backdrop };
}
