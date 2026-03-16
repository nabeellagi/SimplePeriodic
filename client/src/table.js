import kaplay from "kaplay";

const canvas = document.getElementById("table");

const ELEMENT_CATEGORY_COLORS = {
  alkaliMetal: "#FF007F",            // hot magenta
  alkalineEarthMetal: "#FF6A00",     // vivid orange
  transitionMetal: "#6A00FF",        // electric violet
  postTransitionMetal: "#0070FF",    // strong blue
  metalloid: "#00B894",              // bright teal
  reactiveNonmetal: "#00C853",       // neon green
  nobleGas: "#FF2D55",               // vibrant crimson pink
  lanthanide: "#FF3D00",             // fiery red-orange
  actinide: "#AA00FF",               // intense purple
  unknownProperties: "#546E7A"       // dark slate gray
};

// GET DATA
async function fetchElements() {
  const res = await fetch("http://localhost:5000/api/get-all");
  
  if (!res.ok) {
    throw new Error("Failed to fetch elements");
  }

  const data = await res.json();
  return data;
}
const elements = await fetchElements();
console.log(elements);

const k = kaplay({
  canvas,
  pixelDensity: window.devicePixelRatio * 1.2,
});

// CAMERA SETUP
let camX = 0;
let camY = 0;
let zoom = 1;

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

function updateCamera() {
  k.camPos(camX, camY);
  k.camScale(zoom, zoom);
}
camX = k.width() / 2;
camY = k.height() / 2;

updateCamera();

// DESKTOP CAMERA MOVE
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomAmount = -e.deltaY * 0.001;

  zoom += zoomAmount;
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

  updateCamera();
});
let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const dx = (e.clientX - lastX) / zoom;
  const dy = (e.clientY - lastY) / zoom;

  camX -= dx;
  camY -= dy;

  lastX = e.clientX;
  lastY = e.clientY;

  updateCamera();
});

// MOBILE CAMERA MOVE
let touchDragging = false;
let touchLastX = 0;
let touchLastY = 0;

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    touchDragging = true;
    touchLastX = e.touches[0].clientX;
    touchLastY = e.touches[0].clientY;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (!touchDragging || e.touches.length !== 1) return;

  const touch = e.touches[0];

  const dx = (touch.clientX - touchLastX) / zoom;
  const dy = (touch.clientY - touchLastY) / zoom;

  camX -= dx;
  camY -= dy;

  touchLastX = touch.clientX;
  touchLastY = touch.clientY;

  updateCamera();
});

canvas.addEventListener("touchend", () => {
  touchDragging = false;
});
let pinchStartDist = null;
let startZoom = zoom;

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;

    pinchStartDist = Math.sqrt(dx * dx + dy * dy);
    startZoom = zoom;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length !== 2 || pinchStartDist === null) return;

  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;

  const dist = Math.sqrt(dx * dx + dy * dy);

  zoom = startZoom * (dist / pinchStartDist);
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

  updateCamera();
});

canvas.addEventListener("touchend", () => {
  pinchStartDist = null;
});

await Promise.all([
  k.loadFont("Kimbab", "/fonts/Kimbab.ttf"),
  k.loadFont("Hexenkotel", "/fonts/Hexenkotel.ttf"),
]);

// background
k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color("#fffdf1"), k.fixed()]);

// ==== ELEMENTS ====
function createElement({ x, y, number, symbol, name, color = "#e6e4d8" }) {
  const W = 90;
  const H = 100;

  const root = k.add([k.pos(x, y), k.anchor("center")]);

  root.add([
    k.rect(W, H, { radius: 6 }),
    k.color(color),
    k.outline(2, k.rgb(26, 0, 85)),
    k.anchor("center"),
  ]);

  root.add([
    k.text(String(number), {
      size: 12,
      font: "Hexenkotel",
    }),
    k.pos(-W / 2 + 6, -H / 2 + 6),
    k.color(0, 0, 0),
    k.color("#e6e4d8")
  ]);

  root.add([
    k.text(symbol, {
      size: 32,
      font: "Kimbab",
      align: "center",
    }),
    k.anchor("center"),
    k.pos(0, -5),
    k.color(0, 0, 0),
    k.color(0, 0, 0),
    k.color("#e6e4d8")
  ]);

  root.add([
    k.text(name.length > 10 ? name.slice(0, 10) + "..." : name, {
      size: 12,
      width: W - 8,
      font: "Hexenkotel",
      align: "center",
    }),
    k.anchor("center"),
    k.pos(0, H / 2 - 16),
    k.color(0, 0, 0),
    k.color(0, 0, 0),
    k.color("#e6e4d8")
  ]);

  return root;
}

createElement({ x: 100, y: 100, number: 1, symbol: "H", name: "Hydrogen", color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal });
createElement({ x: 200, y: 100, number: 2, symbol: "He", name: "Helium", color: ELEMENT_CATEGORY_COLORS.nobleGas });
