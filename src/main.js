import * as T from "../assets/vendor/three.module.js";
import { createScene } from "./scene.js";
import { createMaterials } from "./materials.js";
import { buildApartment } from "./apartment.js";
import { CollisionWorld } from "./collision.js";
import { Player } from "./player.js";
import { Interactions } from "./interactions.js";
import { ROOMS, roomAt } from "./layout.js";
import { furnish } from "./furniture.js";
import { batchStatic } from "./batching.js";
import { addAmbience } from "./ambience.js";
const $ = (s) => document.querySelector(s);
try {
  const lighting = createScene($("#viewport")),
    { renderer, scene, camera } = lighting,
    m = createMaterials(),
    world = new CollisionWorld(),
    apartment = buildApartment(scene, m, world),
    player = new Player(camera, renderer.domElement, world);
  const furniture = furnish(scene, m, world, apartment);
  lighting.setEmitters(m.glow);
  batchStatic(furniture.root);
  addAmbience(scene, renderer, furniture.inventory);
  const interaction = new Interactions(
    camera,
    scene,
    player,
    apartment,
    lighting,
  );
  let started = false;
  player.onLockChange = (locked) => {
    if (locked) started = true;
    $("#overlay").hidden = locked;
    $("#hud").hidden = !locked;
    $(".intro").hidden = started;
    $(".pause-panel").hidden = !started;
  };
  player.onError = (message) => {
    $("#loading").hidden = false;
    $("#loading").textContent = message;
  };
  $("#enter").onclick = $("#resume").onclick = () => player.lock();
  renderer.domElement.onclick = () => {
    if (started && !player.enabled) player.lock();
  };
  $("#menu-button").onclick = () => {
    if (player.enabled) document.exitPointerLock();
    else {
      started = true;
      player.onLockChange(false);
    }
  };
  $("#reset").onclick = () => {
    player.reset();
    player.lock();
  };
  $("#day-night").onclick = () => {
    lighting.setNight(!lighting.night);
    $("#mode-label").textContent = lighting.night
      ? "Atmosfera notturna"
      : "Luce del giorno";
  };
  $("#quality").onchange = (e) => lighting.quality(e.target.value);
  $("#plan-button").onclick = () => $("#plan-dialog").showModal();
  $("#close-plan").onclick = () => $("#plan-dialog").close();
  const map = $("#minimap"),
    ctx = map.getContext("2d");
  function minimap() {
    ctx.clearRect(0, 0, 260, 260);
    const scale = 15,
      ox = 82,
      oz = 30;
    for (const r of ROOMS) {
      ctx.fillStyle =
        roomAt(camera.position.x, camera.position.z) === r
          ? "#e6d4b16b"
          : "#24342ac4";
      ctx.strokeStyle = "#f4eee19a";
      ctx.lineWidth = 1.2;
      ctx.fillRect(
        ox + r.x * scale,
        oz + r.z * scale,
        r.w * scale,
        r.d * scale,
      );
      ctx.strokeRect(
        ox + r.x * scale,
        oz + r.z * scale,
        r.w * scale,
        r.d * scale,
      );
    }
    ctx.save();
    ctx.translate(
      ox + camera.position.x * scale,
      oz + camera.position.z * scale,
    );
    ctx.rotate(-player.yaw);
    ctx.fillStyle = "#f3d3a0";
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(-4, 5);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  let last = performance.now(),
    frames = 0;
  function animate(now) {
    const dt = Math.min((now - last) / 1000, 0.04);
    last = now;
    player.update(dt);
    if (apartment.doors.some((d) => Math.abs(d.angle - d.target) > 0.001))
      renderer.shadowMap.needsUpdate = true;
    apartment.updateDoors(dt, camera.position);
    if (frames++ % 4 === 0) {
      interaction.update();
      const room = roomAt(camera.position.x, camera.position.z);
      if (room) {
        $("#room-name").textContent = room.name;
        $("#room-size").textContent = room.label;
      }
      minimap();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  $("#loading").hidden = true;
  // Explicit debug interface for repeatable geometry/browser verification.
  window.app = {
    scene,
    camera,
    renderer,
    world,
    apartment,
    player,
    lighting,
    furniture,
    interaction,
    ROOMS,
    ready: true,
  };
} catch (error) {
  console.error(error);
  $("#loading").hidden = true;
  $("#error").hidden = false;
  $("#error").textContent =
    "Impossibile avviare la visita 3D. Verifica che WebGL sia disponibile e apri il progetto tramite un server locale. " +
    error.message;
}
