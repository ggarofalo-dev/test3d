import * as T from "../assets/vendor/three.module.js";
export class Interactions {
  constructor(camera, scene, player, apartment, lighting) {
    this.ray = new T.Raycaster();
    this.ray.far = 2.1;
    this.target = null;
    this.hint = document.querySelector("#interaction");
    this.camera = camera;
    this.scene = scene;
    this.player = player;
    this.apartment = apartment;
    this.lighting = lighting;
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyE" && !e.repeat && player.enabled) {
        this.update();
        if (!this.target) return;
        if (this.target.type === "switch") lighting.toggleLights();
        else apartment.toggleDoor(this.target);
      }
    });
  }
  update() {
    if (!this.player.enabled) {
      this.hint.hidden = true;
      return;
    }
    this.scene.updateMatrixWorld();
    this.camera.updateMatrixWorld();
    this.ray.setFromCamera(new T.Vector2(0, 0), this.camera);
    const hits = this.ray.intersectObjects(this.scene.children, true);
    this.target = null;
    for (const hit of hits) {
      if (hit.object.userData.ignoreRay) continue;
      this.target = hit.object.userData.interactable || null;
      break;
    }
    this.hint.hidden = !this.target;
    if (this.target)
      this.hint.textContent =
        this.target.type === "switch"
          ? `E — ${this.lighting.internalOn ? "Spegni" : "Accendi"} le luci`
          : `E — ${this.target.open ? "Chiudi" : "Apri"} ${this.target.entrance ? "la porta d’ingresso" : "porta"}`;
  }
}
