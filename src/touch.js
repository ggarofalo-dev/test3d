export function setupTouch(player, interaction) {
  if (!player.touchMode) return;
  document.body.classList.add("touch-mode");
  const controls = document.createElement("div");
  controls.id = "touch-controls";
  controls.innerHTML = `
    <div id="touch-stick" aria-label="Trascina per muoverti"><span></span></div>
    <div class="touch-look-hint">Trascina per guardarti intorno</div>
    <button id="touch-action" disabled>Interagisci</button>`;
  document.querySelector("#hud").append(controls);
  const help = document.createElement("p");
  help.className = "touch-help";
  help.textContent = "Muoviti con il joystick e trascina sullo schermo per guardarti intorno. Punta porte e luci, poi tocca il pulsante per interagire.";
  document.querySelector(".intro").append(help);
  const stick = controls.querySelector("#touch-stick");
  const knob = stick.querySelector("span");
  const canvas = player.canvas;
  let moveId = null, lookId = null, lastX = 0, lastY = 0;
  function move(e) {
    const rect = stick.getBoundingClientRect();
    let x = (e.clientX - rect.left - rect.width / 2) / 42;
    let y = (e.clientY - rect.top - rect.height / 2) / 42;
    const length = Math.max(1, Math.hypot(x, y));
    x /= length;
    y /= length;
    player.touchMove.set(x, y);
    knob.style.transform = `translate(${x * 42}px, ${y * 42}px)`;
  }
  stick.addEventListener("pointerdown", e => {
    if (!player.enabled || moveId !== null) return;
    e.preventDefault();
    moveId = e.pointerId;
    stick.setPointerCapture(moveId);
    move(e);
  });
  stick.addEventListener("pointermove", e => {
    if (e.pointerId === moveId) move(e);
  });
  function releaseMove(e) {
    if (e.pointerId !== moveId) return;
    moveId = null;
    player.touchMove.set(0, 0);
    knob.style.transform = "translate(0, 0)";
  }
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    stick.addEventListener(event, releaseMove);
  canvas.addEventListener("pointerdown", e => {
    if (!player.enabled || lookId !== null) return;
    e.preventDefault();
    lookId = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(lookId);
  });
  canvas.addEventListener("pointermove", e => {
    if (e.pointerId !== lookId || !player.enabled) return;
    player.yaw -= (e.clientX - lastX) * 0.004;
    player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch - (e.clientY - lastY) * 0.004));
    lastX = e.clientX;
    lastY = e.clientY;
    player.orient();
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(event, e => {
      if (e.pointerId === lookId) lookId = null;
    });
  player.clearTouch = () => {
    moveId = lookId = null;
    knob.style.transform = "translate(0, 0)";
  };
  window.addEventListener("resize", () => {
    player.touchMove.set(0, 0);
    player.clearTouch();
  });
  controls.querySelector("#touch-action").onclick = () => interaction.activate();
}
