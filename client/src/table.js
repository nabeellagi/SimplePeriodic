import kaplay from "kaplay";
import { openInfo } from "./component/modalInfo";
import { API_BASE } from "./utils/api";

const canvas = document.getElementById("table");

const ELEMENT_CATEGORY_COLORS = {
  alkaliMetal: "#FF007F", // hot magenta
  alkalineEarthMetal: "#FF6A00", // vivid orange
  transitionMetal: "#6A00FF", // electric violet
  postTransitionMetal: "#0070FF", // strong blue
  metalloid: "#00B894", // bright teal
  reactiveNonmetal: "#00C853", // neon green
  nobleGas: "#FF2D55", // vibrant crimson pink
  lanthanide: "#FF3D00", // fiery red-orange
  actinide: "#AA00FF", // intense purple
  unknownProperties: "#546E7A", // dark slate gray
};

// GET DATA
async function fetchElements() {
  const res = await fetch(`${API_BASE}/api/get-all`);

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
  pixelDensity: 1,
  debug: false
});
// k.debug.inspect = true;

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
function resetCameraInteraction() {
  dragging = false;
  touchDragging = false;
  pinchStartDist = null;
}
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

let cameraDirty = false;

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const dx = (e.clientX - lastX) / zoom;
  const dy = (e.clientY - lastY) / zoom;
  camX -= dx;
  camY -= dy;
  lastX = e.clientX;
  lastY = e.clientY;
  cameraDirty = true;
});

k.onUpdate(() => {
  if (cameraDirty) {
    updateCamera();
    cameraDirty = false;
  }
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
k.add([
  k.rect(k.width(), k.height()),
  k.pos(0, 0),
  k.color("#fffdf1"),
  k.fixed(),
]);

// ==== ELEMENTS ====
function createElement({ x, y, number, symbol, name, color = "#e6e4d8", onClick = null }) {
  const W = 90;
  const H = 100;

  const comps = [
    k.pos(x, y),
    k.anchor("center"),
    k.rect(W, H, { radius: 6 }),
    k.color(color),
    k.outline(2, k.rgb(26, 0, 85)),
    `element-${symbol}`,
  ];

  if (onClick) comps.push(k.area());

  const el = k.add(comps);

  el.onDraw(() => {
    // Cull: skip drawing text if element is outside the visible screen
    const screenPos = k.toScreen(k.vec2(x, y));
    const margin = W * zoom * 1.5;
    if (
      screenPos.x < -margin || screenPos.x > k.width() + margin ||
      screenPos.y < -margin || screenPos.y > k.height() + margin
    ) return;

    k.drawText({
      text: String(number),
      size: 12,
      font: "Hexenkotel",
      pos: k.vec2(-W / 2 + 6, -H / 2 + 6),
      color: k.rgb(255, 255, 255),
    });
    k.drawText({
      text: symbol,
      size: 32,
      font: "Kimbab",
      align: "center",
      anchor: "center",
      pos: k.vec2(0, -5),
      color: k.rgb(255, 255, 255),
    });
    k.drawText({
      text: name.length > 10 ? name.slice(0, 10) + "..." : name,
      size: 12,
      width: W - 8,
      font: "Hexenkotel",
      align: "center",
      anchor: "center",
      pos: k.vec2(0, H / 2 - 16),
      color: k.rgb(255, 255, 255),
    });
  });

  if (onClick) {
    k.onClick(`element-${symbol}`, () => {
      onClick();
      resetCameraInteraction();
    });
  }

  return el;
}

// First Group
createElement({
  x: 0,
  y: 0,
  number: elements[1].atomic_number,
  symbol: elements[1].symbol,
  name: elements[1].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[1].symbol),
})
createElement({
  x: 0,
  y: 100,
  number: elements[3].atomic_number,
  symbol: elements[3].symbol,
  name: elements[3].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[3].symbol),
})
createElement({
  x: 0,
  y: 200,
  number: elements[11].atomic_number,
  symbol: elements[11].symbol,
  name: elements[11].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[11].symbol),
})
createElement({
  x: 0,
  y: 300,
  number: elements[19].atomic_number,
  symbol: elements[19].symbol,
  name: elements[19].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[19].symbol),
})
createElement({
  x: 0,
  y: 400,
  number: elements[37].atomic_number,
  symbol: elements[37].symbol,
  name: elements[37].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[37].symbol),
})
createElement({
  x: 0,
  y: 500, 
  number: elements[55].atomic_number,
  symbol: elements[55].symbol,
  name: elements[55].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[55].symbol),
})
createElement({
  x: 0,
  y: 600,
  number: elements[87].atomic_number,
  symbol: elements[87].symbol,
  name: elements[87].name,
  color: ELEMENT_CATEGORY_COLORS.alkaliMetal,
  onClick: () => openInfo(elements[87].symbol),
})

// Second Group
createElement({
  x: 90,
  y: 100,
  number: elements[4].atomic_number,
  symbol: elements[4].symbol,
  name: elements[4].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[4].symbol),
})
createElement({
  x: 90,
  y: 200,
  number: elements[12].atomic_number,
  symbol: elements[12].symbol,
  name: elements[12].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[12].symbol),
})
createElement({
  x: 90,
  y: 300,
  number: elements[20].atomic_number,
  symbol: elements[20].symbol,
  name: elements[20].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[20].symbol),
})
createElement({
  x: 90,
  y: 400,
  number: elements[38].atomic_number,
  symbol: elements[38].symbol,
  name: elements[38].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[38].symbol),
})
createElement({
  x: 90,
  y: 500,
  number: elements[56].atomic_number,
  symbol: elements[56].symbol,
  name: elements[56].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[56].symbol),
})
createElement({
  x: 90,
  y: 600,
  number: elements[88].atomic_number,
  symbol: elements[88].symbol,
  name: elements[88].name,
  color: ELEMENT_CATEGORY_COLORS.alkalineEarthMetal,
  onClick: () => openInfo(elements[88].symbol),
})

// Third Group
createElement({
  x: 180,
  y: 300,
  number: elements[21].atomic_number,
  symbol: elements[21].symbol,
  name: elements[21].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[21].symbol),
})
createElement({
  x: 180,
  y: 400,
  number: elements[39].atomic_number,
  symbol: elements[39].symbol,
  name: elements[39].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[39].symbol),
})
createElement({
  x: 180,
  y: 500,
  number: "",
  symbol: "57-71",
  name: "",
  color: ELEMENT_CATEGORY_COLORS.lanthanide,
})
createElement({
  x: 180,
  y: 600,
  number: "",
  symbol: "89-103",
  name: "",
  color: ELEMENT_CATEGORY_COLORS.actinide,
})

// Fourth Group
createElement({
  x: 270,
  y: 300,
  number: elements[22].atomic_number,
  symbol: elements[22].symbol,
  name: elements[22].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[22].symbol),
})
createElement({
  x: 270,
  y: 400,
  number: elements[40].atomic_number,
  symbol: elements[40].symbol,
  name: elements[40].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[40].symbol),
})
createElement({
  x: 270,
  y: 500,
  number: elements[72].atomic_number,
  symbol: elements[72].symbol,
  name: elements[72].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[72].symbol),
})
createElement({
  x: 270,
  y: 600,
  number: elements[104].atomic_number,
  symbol: elements[104].symbol,
  name: elements[104].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[104].symbol),
})

// Fifth Group
createElement({
  x: 360,
  y: 300,
  number: elements[23].atomic_number,
  symbol: elements[23].symbol,
  name: elements[23].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[23].symbol),
})
createElement({
  x: 360,
  y: 400,
  number: elements[41].atomic_number,
  symbol: elements[41].symbol,
  name: elements[41].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[41].symbol),
})
createElement({
  x: 360,
  y: 500,
  number: elements[73].atomic_number,
  symbol: elements[73].symbol,
  name: elements[73].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[73].symbol),
})
createElement({
  x: 360,
  y: 600,
  number: elements[105].atomic_number,
  symbol: elements[105].symbol,
  name: elements[105].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[105].symbol),
})

// Sixth Group
createElement({
  x: 450,
  y: 300,
  number: elements[24].atomic_number,
  symbol: elements[24].symbol,
  name: elements[24].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[24].symbol),
})
createElement({
  x: 450,
  y: 400,
  number: elements[42].atomic_number,
  symbol: elements[42].symbol,
  name: elements[42].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[42].symbol),
})
createElement({
  x: 450,
  y: 500,
  number: elements[74].atomic_number,
  symbol: elements[74].symbol,
  name: elements[74].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[74].symbol),
})
createElement({
  x: 450,
  y: 600,
  number: elements[106].atomic_number,
  symbol: elements[106].symbol,
  name: elements[106].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[106].symbol),
})

// Seventh Group
createElement({
  x: 540,
  y: 300,
  number: elements[25].atomic_number,
  symbol: elements[25].symbol,
  name: elements[25].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[25].symbol),
})
createElement({
  x: 540,
  y: 400,
  number: elements[43].atomic_number,
  symbol: elements[43].symbol,
  name: elements[43].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[43].symbol),
})
createElement({
  x: 540,
  y: 500,
  number: elements[75].atomic_number,
  symbol: elements[75].symbol,
  name: elements[75].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[75].symbol),
})
createElement({
  x: 540,
  y: 600,
  number: elements[107].atomic_number,
  symbol: elements[107].symbol,
  name: elements[107].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[107].symbol),
})

// Eighth Group
createElement({
  x: 630,
  y: 300,
  number: elements[26].atomic_number,
  symbol: elements[26].symbol,
  name: elements[26].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[26].symbol),
})
createElement({
  x: 630,
  y: 400,
  number: elements[44].atomic_number,
  symbol: elements[44].symbol,
  name: elements[44].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[44].symbol),
})
createElement({
  x: 630,
  y: 500,
  number: elements[76].atomic_number,
  symbol: elements[76].symbol,
  name: elements[76].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[76].symbol),
})
createElement({
  x: 630,
  y: 600,
  number: elements[108].atomic_number,
  symbol: elements[108].symbol,
  name: elements[108].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[108].symbol),
})

// Ninth Group
createElement({
  x: 720,
  y: 300,
  number: elements[27].atomic_number,
  symbol: elements[27].symbol,
  name: elements[27].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[27].symbol),
})
createElement({
  x: 720,
  y: 400,
  number: elements[45].atomic_number,
  symbol: elements[45].symbol,
  name: elements[45].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[45].symbol),
})
createElement({
  x: 720,
  y: 500,
  number: elements[77].atomic_number,
  symbol: elements[77].symbol,
  name: elements[77].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[77].symbol),
})
createElement({
  x: 720,
  y: 600,
  number: elements[109].atomic_number,
  symbol: elements[109].symbol,
  name: elements[109].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[109].symbol),
})

// Tenth Group
createElement({
  x: 810,
  y: 300,
  number: elements[28].atomic_number,
  symbol: elements[28].symbol,
  name: elements[28].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[28].symbol),
})
createElement({
  x: 810,
  y: 400,
  number: elements[46].atomic_number,
  symbol: elements[46].symbol,
  name: elements[46].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[46].symbol),
})
createElement({
  x: 810,
  y: 500,
  number: elements[78].atomic_number,
  symbol: elements[78].symbol,
  name: elements[78].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[78].symbol),
})
createElement({
  x: 810,
  y: 600,
  number: elements[110].atomic_number,
  symbol: elements[110].symbol,
  name: elements[110].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[110].symbol),
})

// Eleventh Group
createElement({
  x: 900,
  y: 300,
  number: elements[29].atomic_number,
  symbol: elements[29].symbol,
  name: elements[29].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[29].symbol),
})
createElement({
  x: 900,
  y: 400,
  number: elements[47].atomic_number,
  symbol: elements[47].symbol,
  name: elements[47].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[47].symbol),
})
createElement({
  x: 900,
  y: 500,
  number: elements[79].atomic_number,
  symbol: elements[79].symbol,
  name: elements[79].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[79].symbol),
})
createElement({
  x: 900,
  y: 600,
  number: elements[111].atomic_number,
  symbol: elements[111].symbol,
  name: elements[111].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[111].symbol),
})

// Twelfth Group
createElement({
  x: 990,
  y: 300,
  number: elements[30].atomic_number,
  symbol: elements[30].symbol,
  name: elements[30].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[30].symbol),
})
createElement({
  x: 990,
  y: 400,
  number: elements[48].atomic_number,
  symbol: elements[48].symbol,
  name: elements[48].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[48].symbol),
})
createElement({
  x: 990,
  y: 500,
  number: elements[80].atomic_number,
  symbol: elements[80].symbol,
  name: elements[80].name,
  color: ELEMENT_CATEGORY_COLORS.transitionMetal,
  onClick: () => openInfo(elements[80].symbol),
})
createElement({
  x: 990,
  y: 600,
  number: elements[112].atomic_number,
  symbol: elements[112].symbol,
  name: elements[112].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[112].symbol),
});

// Thirteenth Group
createElement({
  x: 1080,
  y: 100,
  number: elements[5].atomic_number,
  symbol: elements[5].symbol,
  name: elements[5].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[5].symbol),
})
createElement({
  x: 1080,
  y: 200,
  number: elements[13].atomic_number,
  symbol: elements[13].symbol,
  name: elements[13].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[13].symbol),
})
createElement({
  x: 1080,
  y: 300,
  number: elements[31].atomic_number,
  symbol: elements[31].symbol,
  name: elements[31].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[31].symbol),
})
createElement({
  x: 1080,
  y: 400,
  number: elements[49].atomic_number,
  symbol: elements[49].symbol,
  name: elements[49].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[49].symbol),
})
createElement({
  x: 1080,
  y: 500,
  number: elements[81].atomic_number,
  symbol: elements[81].symbol,
  name: elements[81].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[81].symbol),
})
createElement({
  x: 1080,
  y: 600,
  number: elements[113].atomic_number,
  symbol: elements[113].symbol,
  name: elements[113].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[113].symbol),
})

// Fourteenth Group
createElement({
  x: 1170,
  y: 100,
  number: elements[6].atomic_number,
  symbol: elements[6].symbol,
  name: elements[6].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[6].symbol),
})
createElement({
  x: 1170,
  y: 200,
  number: elements[14].atomic_number,
  symbol: elements[14].symbol,
  name: elements[14].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[14].symbol),
})
createElement({
  x: 1170,
  y: 300,
  number: elements[32].atomic_number,
  symbol: elements[32].symbol,
  name: elements[32].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[32].symbol),
})
createElement({
  x: 1170,
  y: 400,
  number: elements[50].atomic_number,
  symbol: elements[50].symbol,
  name: elements[50].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[50].symbol),
})
createElement({
  x: 1170,
  y: 500,
  number: elements[82].atomic_number,
  symbol: elements[82].symbol,
  name: elements[82].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[82].symbol),
})
createElement({
  x: 1170,
  y: 600,
  number: elements[114].atomic_number,
  symbol: elements[114].symbol,
  name: elements[114].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[114].symbol),
})

// Fifteenth Group
createElement({
  x: 1260,
  y: 100,
  number: elements[7].atomic_number,
  symbol: elements[7].symbol,
  name: elements[7].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[7].symbol),
})
createElement({
  x: 1260,
  y: 200,
  number: elements[15].atomic_number,
  symbol: elements[15].symbol,
  name: elements[15].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[15].symbol),
})
createElement({
  x: 1260,
  y: 300,
  number: elements[33].atomic_number,
  symbol: elements[33].symbol,
  name: elements[33].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[33].symbol),
})
createElement({
  x: 1260,
  y: 400,
  number: elements[51].atomic_number,
  symbol: elements[51].symbol,
  name: elements[51].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[51].symbol),
})
createElement({
  x: 1260,
  y: 500,
  number: elements[83].atomic_number,
  symbol: elements[83].symbol,
  name: elements[83].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[83].symbol),
})
createElement({
  x: 1260,
  y: 600,
  number: elements[115].atomic_number,
  symbol: elements[115].symbol,
  name: elements[115].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[115].symbol),
})

// Sixteenth Group
createElement({
  x: 1350,
  y: 100,
  number: elements[8].atomic_number,
  symbol: elements[8].symbol,
  name: elements[8].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[8].symbol),
})
createElement({
  x: 1350,
  y: 200,
  number: elements[16].atomic_number,
  symbol: elements[16].symbol,
  name: elements[16].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[16].symbol),
})
createElement({
  x: 1350,
  y: 300,
  number: elements[34].atomic_number,
  symbol: elements[34].symbol,
  name: elements[34].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[34].symbol),
})
createElement({
  x: 1350,
  y: 400,
  number: elements[52].atomic_number,
  symbol: elements[52].symbol,
  name: elements[52].name,
  color: ELEMENT_CATEGORY_COLORS.metalloid,
  onClick: () => openInfo(elements[52].symbol),
})
createElement({
  x: 1350,
  y: 500,
  number: elements[84].atomic_number,
  symbol: elements[84].symbol,
  name: elements[84].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[84].symbol),
})
createElement({
  x: 1350,
  y: 600,
  number: elements[116].atomic_number,
  symbol: elements[116].symbol,
  name: elements[116].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[116].symbol),
})

// Seventeenth Group
createElement({
  x: 1440,
  y: 100,
  number: elements[9].atomic_number,
  symbol: elements[9].symbol,
  name: elements[9].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[9].symbol),
})
createElement({
  x: 1440,
  y: 200,
  number: elements[17].atomic_number,
  symbol: elements[17].symbol,
  name: elements[17].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[17].symbol),
})
createElement({
  x: 1440,
  y: 300,
  number: elements[35].atomic_number,
  symbol: elements[35].symbol,
  name: elements[35].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[35].symbol),
})
createElement({
  x: 1440,
  y: 400,
  number: elements[53].atomic_number,
  symbol: elements[53].symbol,
  name: elements[53].name,
  color: ELEMENT_CATEGORY_COLORS.reactiveNonmetal,
  onClick: () => openInfo(elements[53].symbol),
})
createElement({
  x: 1440,
  y: 500,
  number: elements[85].atomic_number,
  symbol: elements[85].symbol,
  name: elements[85].name,
  color: ELEMENT_CATEGORY_COLORS.postTransitionMetal,
  onClick: () => openInfo(elements[85].symbol),
})
createElement({
  x: 1440,
  y: 600,
  number: elements[117].atomic_number,
  symbol: elements[117].symbol,
  name: elements[117].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[117].symbol),
})

// Eighteenth Group
createElement({
  x: 1530,
  y: 0,
  number: elements[2].atomic_number,
  symbol: elements[2].symbol,
  name: elements[2].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[2].symbol),
})
createElement({
  x: 1530,
  y: 100,
  number: elements[10].atomic_number,
  symbol: elements[10].symbol,
  name: elements[10].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[10].symbol),
})
createElement({
  x: 1530,
  y: 200,
  number: elements[18].atomic_number,
  symbol: elements[18].symbol,
  name: elements[18].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[18].symbol),
})
createElement({
  x: 1530,
  y: 300,
  number: elements[36].atomic_number,
  symbol: elements[36].symbol,
  name: elements[36].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[36].symbol),
})
createElement({
  x: 1530,
  y: 400,
  number: elements[54].atomic_number,
  symbol: elements[54].symbol,
  name: elements[54].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[54].symbol),
})
createElement({
  x: 1530,
  y: 500,
  number: elements[86].atomic_number,
  symbol: elements[86].symbol,
  name: elements[86].name,
  color: ELEMENT_CATEGORY_COLORS.nobleGas,
  onClick: () => openInfo(elements[86].symbol),
})
createElement({
  x: 1530,
  y: 600,
  number: elements[118].atomic_number,
  symbol: elements[118].symbol,
  name: elements[118].name,
  color: ELEMENT_CATEGORY_COLORS.unknownProperties,
  onClick: () => openInfo(elements[118].symbol),
});

// Lanthanides
for (let i = 57; i <= 71; i++){
  // x = 180
  // gap-x = 90
  createElement({
    x: 180 + (i - 57) * 90,
    y: 800,
    number: elements[i].atomic_number,
    symbol: elements[i].symbol,
    name: elements[i].name,
    color: ELEMENT_CATEGORY_COLORS.lanthanide,
    onClick: () => openInfo(elements[i].symbol),
  });
}

// Actinides
for (let i = 89; i <= 103; i++){
  // x = 180
  // gap-x = 90
  createElement({
    x: 180 + (i - 89) * 90,
    y: 900,
    number: elements[i].atomic_number,
    symbol: elements[i].symbol,
    name: elements[i].name,
    color: ELEMENT_CATEGORY_COLORS.actinide,
    onClick: () => openInfo(elements[i].symbol),
  });
}