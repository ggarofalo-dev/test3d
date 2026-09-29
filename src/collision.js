// Circle versus oriented rectangle in XZ. Separating axes keep sliding stable.
export class CollisionWorld {
  constructor() {
    this.bodies = [];
    this.radius = 0.19;
  }
  add(x, z, w, d, angle = 0, label = "obstacle") {
    const b = { x, z, w, d, angle, label, enabled: true };
    this.bodies.push(b);
    return b;
  }
  overlaps(x, z, b, r = this.radius) {
    if (!b.enabled) return false;
    const c = Math.cos(b.angle),
      s = Math.sin(b.angle),
      dx = x - b.x,
      dz = z - b.z;
    const u = c * dx - s * dz,
      v = s * dx + c * dz;
    const qx = Math.max(-b.w / 2, Math.min(b.w / 2, u)),
      qz = Math.max(-b.d / 2, Math.min(b.d / 2, v));
    return (u - qx) ** 2 + (v - qz) ** 2 < r * r - 1e-10;
  }
  blocked(x, z) {
    return this.bodies.some((b) => this.overlaps(x, z, b));
  }
  move(pos, dx, dz) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.055));
    for (let i = 0; i < steps; i++) {
      if (!this.blocked(pos.x + dx / steps, pos.z)) pos.x += dx / steps;
      if (!this.blocked(pos.x, pos.z + dz / steps)) pos.z += dz / steps;
    }
    return pos;
  }
}
