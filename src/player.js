import * as T from "../assets/vendor/three.module.js";
export class Player {
  constructor(camera, canvas, world) {
    this.camera = camera;
    this.canvas = canvas;
    this.world = world;
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0;
    this.velocity = new T.Vector2();
    this.enabled = false;
    this.touchMode = matchMedia("(pointer: coarse)").matches;
    this.touchMove = new T.Vector2();
    this.reset();
    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && this.enabled) {
        this.pause();
        return;
      }
      if (
        this.enabled &&
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "ShiftLeft",
          "ShiftRight",
          "KeyE",
        ].includes(e.code)
      )
        e.preventDefault();
      this.keys.add(e.code);
    });
    document.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => this.pause());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pause();
    });
    document.addEventListener("pointerlockchange", () => {
      if (this.touchMode) return;
      this.enabled = document.pointerLockElement === canvas;
      this.keys.clear();
      this.velocity.set(0, 0);
      this.onLockChange?.(this.enabled);
    });
    document.addEventListener("mousemove", (e) => {
      if (!this.enabled || this.touchMode) return;
      this.yaw -= e.movementX * 0.0018;
      this.pitch = T.MathUtils.clamp(
        this.pitch - e.movementY * 0.0018,
        -1.4,
        1.4,
      );
      this.orient();
    });
  }
  orient() {
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }
  reset() {
    this.camera.position.set(2.91, 1.7, 7.54);
    this.yaw = 0.1;
    this.pitch = -0.025;
    this.velocity?.set(0, 0);
    this.orient();
  }
  async lock() {
    if (this.touchMode) {
      this.enabled = true;
      this.onLockChange?.(true);
      return;
    }
    try {
      await this.canvas.requestPointerLock();
    } catch (e) {
      this.onError?.(
        "Il browser non ha attivato il mouse. Premi nuovamente Entra o Riprendi.",
      );
    }
  }
  pause() {
    this.keys.clear();
    this.touchMove.set(0, 0);
    this.velocity.set(0, 0);
    this.clearTouch?.();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    if (this.enabled) {
      this.enabled = false;
      this.onLockChange?.(false);
    }
  }
  update(dt) {
    if (!this.enabled) return;
    const k = this.keys,
      x =
        Number(k.has("KeyD") || k.has("ArrowRight")) -
        Number(k.has("KeyA") || k.has("ArrowLeft")) + this.touchMove.x,
      z =
        Number(k.has("KeyS") || k.has("ArrowDown")) -
        Number(k.has("KeyW") || k.has("ArrowUp")) + this.touchMove.y;
    const len = Math.max(1, Math.hypot(x, z)),
      speed = k.has("ShiftLeft") || k.has("ShiftRight") ? 3.25 : 1.8;
    this.velocity.x = T.MathUtils.damp(
      this.velocity.x,
      (x / len) * speed,
      14,
      dt,
    );
    this.velocity.y = T.MathUtils.damp(
      this.velocity.y,
      (z / len) * speed,
      14,
      dt,
    );
    const c = Math.cos(this.yaw),
      s = Math.sin(this.yaw);
    this.world.move(
      this.camera.position,
      (c * this.velocity.x + s * this.velocity.y) * dt,
      (-s * this.velocity.x + c * this.velocity.y) * dt,
    );
    this.camera.position.y = 1.7;
  }
}
