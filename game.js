import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Human, POSES } from './characters.js';

/* =========================================================
   Settings & data
   ========================================================= */
const DAY_LENGTH = 300;
const DUSK_START = 210;
const SAVE_KEY = 'kushary-save-v1';
const MAX_READY = 8;
const MAX_PLATE = 6;
const COUNTER_SLOTS = [
  { x: -1.0, z: -0.9 }, { x: -0.33, z: -0.9 }, { x: 0.33, z: -0.9 }, { x: 1.0, z: -0.9 },
];
const SLOTS = [
  { x: -0.9, z: 0.15 }, { x: 0.1, z: 0.5 }, { x: 1.1, z: 0.9 }, { x: -1.9, z: 0.9 },
];
const EXIT = { x: -7, z: 2.2 };
const FPS_POS = new THREE.Vector3(0, 1.62, -1.6);
const STOVE_POS = new THREE.Vector3(-1.55, 0, -0.9);
const TABLE_POS = { x: 1.5, z: -1.0 };

const STOCK = {
  rice: { name: 'أرز', cost: 4 },
  pasta: { name: 'مكرونة', cost: 3 },
  lentil: { name: 'عدس', cost: 3 },
  chickpea: { name: 'حمص', cost: 3 },
  sauce: { name: 'صلصة', cost: 2 },
  onion: { name: 'بصل', cost: 2 },
  potato: { name: 'بطاطس', cost: 3 },
  fruit: { name: 'مانجو', cost: 5 },
  tea: { name: 'شاي', cost: 1 },
  water: { name: 'مياه', cost: 1 },
};

const INGR_COLOR = {
  rice: 0xf5f0e1, pasta: 0xf4d35e, lentil: 0x8b4513, chickpea: 0xd2b48c, sauce: 0xb22222,
  onion: 0xdda0dd, potato: 0xc9a46b, fruit: 0xffa500, tea: 0x6b4226, water: 0x9fd8ff,
};

const BIN_LAYOUT = [
  ['rice', -0.8, -1.18], ['pasta', -0.4, -1.18], ['lentil', 0, -1.18], ['chickpea', 0.4, -1.18], ['sauce', 0.8, -1.18],
  ['onion', -0.8, -0.62], ['potato', -0.4, -0.62], ['fruit', 0, -0.62], ['tea', 0.4, -0.62], ['water', 0.8, -0.62],
];

const ITEMS = {
  kushari_small: { name: 'كشري صغير', emoji: '🍚', price: 20, time: 4, need: { rice: 1, pasta: 1, lentil: 1, sauce: 1, onion: 1 }, unlock: 0, color: 0x9c5a2a },
  kushari_large: { name: 'كشري كبير', emoji: '🥣', price: 35, time: 6, need: { rice: 2, pasta: 2, lentil: 2, chickpea: 1, sauce: 1, onion: 1 }, unlock: 500, color: 0x7a3e1a },
  potato_syrian: { name: 'بطاطس سوري', emoji: '🥔', price: 15, time: 5, need: { potato: 2, sauce: 1 }, unlock: 300, color: 0xd9a441 },
  juice_mango: { name: 'عصير مانجو', emoji: '🥭', price: 12, time: 3, need: { fruit: 2 }, unlock: 200, color: 0xffb020 },
  tea: { name: 'شاي', emoji: '🍵', price: 5, time: 2, need: { tea: 1 }, unlock: 100, color: 0x8b5a2b },
  water: { name: 'مياه', emoji: '💧', price: 3, time: 1, need: { water: 1 }, unlock: 0, color: 0x9fd8ff },
};

const RECIPE_STEPS = {
  kushari_small: ['حط الأرز في الطبق كطبقة أولى', 'ضيف المكرونة والعدس فوق الأرز', 'صب الصلصة الحارة', 'حط البصل المحمر فوق كل حاجة وقدّم'],
  kushari_large: ['حط الأرز في الطبق بكمية أكبر', 'ضيف المكرونة والعدس والحمص', 'صب الصلصة الحارة بسخاء', 'حط البصل المحمر فوق وقدّم'],
  potato_syrian: ['قطّع البطاطس مكعبات وحطها في الطبق', 'صب الصلصة والكزبرة فوقها', 'قدّمها سخنة'],
  juice_mango: ['قشّر المانجو وقطعها', 'اخلطها مع المياه في الخلاط', 'صب في كوباية وقدّمها'],
  tea: ['حط الشاي في الكوباية', 'صب مية سخنة', 'قدّم فوراً'],
  water: ['هات زجاجة مياه من التلاجة', 'قدّمها بارد'],
};

const EQUIP = {
  stove: { name: 'بوتاجاز إضافي', cost: 400, desc: 'طباخ إضافي يحضّر بالتوازي' },
  sign: { name: 'لافتة مضيئة', cost: 250, desc: 'زباين أكتر في النهار' },
};

const PRESETS = [
  { name: 'الأسطى', opts: { skin: 0xc68642, hair: 0x1a1a1a, shirt: 0xffffff, pants: 0x2c3e50 } },
  { name: 'ياسين', opts: { skin: 0xe0ac69, hair: 0x1a0f0a, shirt: 0x112b1a, pants: 0x1a1a1a, heavy: true } },
  { name: 'أحمد', opts: { skin: 0xf1c27d, hair: 0x4a2c2a, shirt: 0xe74c3c, pants: 0x34495e } },
  { name: 'محمود', opts: { skin: 0xc68642, hair: 0x000000, shirt: 0x3498db, pants: 0x2c3e50 } },
  { name: 'سارة', opts: { skin: 0xf1c27d, hair: 0x5a2d0c, shirt: 0x2ecc71, pants: 0x2c3e50, female: true, long: true } },
  { name: 'ياسمين', opts: { skin: 0xd2a679, hair: 0x1a1a1a, shirt: 0x9b59b6, pants: 0x34495e, female: true } },
  { name: 'عمر', opts: { skin: 0xc68642, hair: 0x1a1a1a, shirt: 0xf39c12, pants: 0x2c3e50 } },
  { name: 'نورة', opts: { skin: 0xf1c27d, hair: 0x3a1a0a, shirt: 0x1abc9c, pants: 0x34495e, female: true, long: true } },
];

const LINES = {
  arrive: ['يا أسطى، عايز أكل بسرعة!', 'السلام عليكم، ممكن أطلب؟', 'ريحة الكشري وحشة أوي!', 'يلا يا معلم، طلبي مستنيني!'],
  wait: ['الطلب هيتعمل إمتى؟', 'يا أسطى احنا مستنيين من بدري!', 'لو اتأخرت كمان هامشي!'],
  happy: ['تسلم إيدك يا معلم!', 'أحلى أكلة النهارده!', 'ماشي، شكراً يا أسطى!'],
  wrong: ['ده مش اللي طلبته يا أسطى!', 'لا ده مش طلبي!'],
  angry: ['خلاص، مش هستنى تاني!', 'ده آخر مرة أجي هنا!'],
};

/* =========================================================
   Utils & state
   ========================================================= */
const $ = (id) => document.getElementById(id);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function newState() {
  return {
    money: 150, rep: 3, day: 1, dayTime: 0, dayEnded: false,
    stock: { rice: 5, pasta: 5, lentil: 5, sauce: 5, onion: 5, water: 5 },
    unlocked: ['kushari_small', 'water'],
    stove: 1, sign: 0, ready: [],
    dayRevenue: 0, dayServed: 0, dayLost: 0, totalServed: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const base = newState();
      const s = JSON.parse(raw);
      return { ...base, ...s, stock: { ...base.stock, ...(s.stock || {}) } };
    }
  } catch (e) { /* ignore broken save */ }
  return newState();
}

let S = loadState();
for (const k of Object.keys(STOCK)) S.stock[k] = S.stock[k] || 0;

// الحاجات اللي على الشغل (مش بتتحفظ)
// الرف: 4 أطباق فاضية في الأول. كل طبق = { contents: {مكون: عدد} } أو null لو مش موجود في مكانه
let plates = COUNTER_SLOTS.map(() => ({ contents: {} }));
// الإيد: { kind: 'plate', contents } أو { kind: 'dish', id } أو null
let hand = null;
let cooks = []; // { id, left }

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}

function log(msg) {
  const d = document.createElement('div');
  d.textContent = msg;
  $('log').prepend(d);
  setTimeout(() => d.remove(), 4000);
}

function btn(label, onClick, disabled = false) {
  const b = document.createElement('button');
  b.className = 'btn';
  b.textContent = label;
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

const countOf = (c) => Object.values(c).reduce((a, b) => a + b, 0);

function matchRecipe(contents) {
  for (const id of S.unlocked) {
    const need = ITEMS[id].need;
    const keys = new Set([...Object.keys(need), ...Object.keys(contents)]);
    let ok = true;
    for (const k of keys) {
      if ((need[k] || 0) !== (contents[k] || 0)) { ok = false; break; }
    }
    if (ok) return id;
  }
  return null;
}

/* =========================================================
   Scene
   ========================================================= */
const viewer = $('viewer');
const isMobile = window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 600;
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.insertBefore(renderer.domElement, viewer.firstChild);

const scene = new THREE.Scene();
const skyDay = new THREE.Color(0x87ceeb);
const skyDusk = new THREE.Color(0xff8a4c);
const skyNight = new THREE.Color(0x0a0f2a);
const skyC = new THREE.Color();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 14, 30);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.rotation.order = 'YXZ';
scene.add(camera);

scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 1.1, -0.4);

const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
keyLight.position.set(3, 5, 3);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
keyLight.shadow.bias = -0.0004;
keyLight.shadow.normalBias = 0.02;
Object.assign(keyLight.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 30 });
keyLight.shadow.camera.updateProjectionMatrix();
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 1.2);
fillLight.position.set(-3, 2, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffcc88, 1.8);
rimLight.position.set(-2, 4, -4);
scene.add(rimLight);

const stdMat = (color, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });

function addMesh(geo, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// الشارع
const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), stdMat(0x3a3a40, 0.9));
asphalt.rotation.x = -Math.PI / 2;
asphalt.receiveShadow = true;
scene.add(asphalt);
addMesh(new THREE.BoxGeometry(30, 0.12, 2.2), stdMat(0x8a8580, 0.8), 0, 0.06, 2.7);

const winMats = [];
const buildingColors = [0xd8c3a0, 0xc9a77a, 0xe0b98a, 0xb88f63, 0xd4c08f];
for (let i = -4; i <= 4; i++) {
  const h = 4 + ((i * 7) % 3) * 1.2;
  addMesh(new THREE.BoxGeometry(3.6, h, 3), stdMat(buildingColors[(i + 4) % buildingColors.length], 0.9), i * 3.8, h / 2, -6);
  for (let w = 0; w < 3; w++) {
    const wm = new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.3, emissive: 0xffb050, emissiveIntensity: 0 });
    winMats.push(wm);
    addMesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), wm, i * 3.8 - 1 + w, 1.2 + (w % 2) * 1.5, -4.48);
  }
}

// أعمدة النور
const lampBulbMats = [];
const lampLights = [];
for (const x of [-3.2, 3.2]) {
  addMesh(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 8), stdMat(0x333333, 0.5), x, 1.3, 1.5);
  const bm = new THREE.MeshStandardMaterial({ color: 0xfff2cc, emissive: 0xffb050, emissiveIntensity: 0 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), bm);
  bulb.position.set(x, 2.65, 1.5);
  scene.add(bulb);
  lampBulbMats.push(bm);
  const pl = new THREE.PointLight(0xffb060, 0, 7, 1.5);
  pl.position.set(x, 2.5, 1.5);
  scene.add(pl);
  lampLights.push(pl);
}

// العربية
const cart = new THREE.Group();
cart.position.set(0, 0, -0.9);
scene.add(cart);
addMesh(new THREE.BoxGeometry(2.2, 0.9, 0.9), stdMat(0xc0392b, 0.6), 0, 0.6, 0, cart);
addMesh(new THREE.BoxGeometry(2.4, 0.08, 0.95), stdMat(0xc9a46b, 0.6), 0, 1.14, 0, cart);
const awningTex = (() => {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 32;
  const cx = cv.getContext('2d');
  for (let i = 0; i < 8; i++) { cx.fillStyle = i % 2 ? '#ffffff' : '#c0392b'; cx.fillRect(i * 32, 0, 32, 32); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
addMesh(new THREE.BoxGeometry(2.7, 0.06, 1.3), new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.7 }), 0, 2.05, 0.05, cart);
for (const x of [-1.25, 1.25]) addMesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8), stdMat(0x888888, 0.4), x, 1.0, 0.55, cart);
{
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#ffcc00';
  cx.fillRect(0, 0, 512, 128);
  cx.fillStyle = '#8b1a1a';
  cx.font = 'bold 72px sans-serif';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText('الأسطى كشري', 256, 68);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
  sign.position.set(0, 1.82, 0.66);
  cart.add(sign);
}

// البوتاجاز (على الشمال، بيتعلم عليه لما تحضّر)
const stoveGroup = new THREE.Group();
stoveGroup.position.copy(STOVE_POS);
scene.add(stoveGroup);
const stoveBody = addMesh(new THREE.BoxGeometry(0.55, 1.15, 0.6), stdMat(0x2b2b2b, 0.5), 0, 0.575, 0, stoveGroup);
stoveBody.userData.stove = true;
const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, emissive: 0xff6a00, emissiveIntensity: 0 });
const burner = addMesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 20), burnerMat, 0, 1.2, 0, stoveGroup);
burner.userData.stove = true;

// بخار البوتاجاز
const steamTex = (() => {
  const cv = document.createElement('canvas');
  cv.width = 64; cv.height = 64;
  const cx = cv.getContext('2d');
  const g = cx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = g;
  cx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
})();
const steamPuffs = [];
for (let i = 0; i < 10; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(s);
  steamPuffs.push({ s, age: (i / 10) * 2.2, life: 2.2, x: STOVE_POS.x + (i % 2 ? -0.05 : 0.05), z: STOVE_POS.z });
}
function updateSteam(dt) {
  const active = cooks.length > 0;
  burnerMat.emissiveIntensity = active ? 0.8 : 0;
  for (const p of steamPuffs) {
    p.age += dt;
    if (p.age > p.life) p.age = 0;
    const k = p.age / p.life;
    p.s.position.set(p.x + Math.sin(k * 3 + p.x) * 0.04, 1.3 + k * 0.9, p.z);
    const sc = 0.15 + k * 0.3;
    p.s.scale.set(sc, sc, 1);
    p.s.material.opacity = active ? (1 - k) * 0.45 : 0;
  }
}

// الشيف (الأسطى) ورا العربية
const master = new Human(PRESETS[0].opts);
master.group.position.set(0, 0, -1.9);
scene.add(master.group);
{
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 20), stdMat(0xffffff, 0.6));
  cap.position.set(0, 0.2, 0);
  master.head.add(cap);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.02), stdMat(0x8b4513, 0.7));
  apron.position.set(0, 1.0, 0.16);
  master.group.add(apron);
}

/* =========================================================
   Counter: ingredient bins, plate slots, ready table
   ========================================================= */
const binMeshes = [];
function makeBin(k, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 1.18, z);
  scene.add(g);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.3), stdMat(INGR_COLOR[k], 0.8));
  box.position.y = 0.07;
  box.castShadow = true;
  box.userData.bin = k;
  g.add(box);

  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 128;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#222';
  cx.fillRect(0, 0, 256, 128);
  cx.fillStyle = '#ffcc00';
  cx.font = 'bold 44px sans-serif';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(STOCK[k].name, 128, 64);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
  label.position.set(0, 0.07, -0.16);
  label.rotation.y = Math.PI;
  label.userData.bin = k;
  g.add(label);

  binMeshes.push(box, label);
}
for (const [k, x, z] of BIN_LAYOUT) makeBin(k, x, z);

// مواضع الأطباق على الرف
const counterGroup = new THREE.Group();
scene.add(counterGroup);


// ---------- أدوات الشكل ----------
function seeded(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function mkMesh(geo, color, rough = 0.6, extra = {}) {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }));
  m.castShadow = true;
  return m;
}

function glassMat(color, opacity = 0.4) {
  return new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.08, side: THREE.DoubleSide });
}

function ingredientPart(k) {
  switch (k) {
    case 'rice': return mkMesh(new THREE.SphereGeometry(0.012, 8, 6), 0xf7f3e6, 0.8);
    case 'pasta': return mkMesh(new THREE.TorusGeometry(0.014, 0.004, 6, 10), 0xf2c94c, 0.5);
    case 'lentil': return mkMesh(new THREE.SphereGeometry(0.01, 8, 6), 0x7a4a22, 0.7);
    case 'chickpea': return mkMesh(new THREE.SphereGeometry(0.014, 8, 6), 0xd8b98a, 0.7);
    case 'sauce': return mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 12), 0xb3261e, 0.4);
    case 'onion': return mkMesh(new THREE.TorusGeometry(0.014, 0.004, 6, 12), 0x9b5a9b, 0.5);
    case 'potato': return mkMesh(new THREE.BoxGeometry(0.024, 0.02, 0.024), 0xd9a441, 0.6);
    case 'fruit': return mkMesh(new THREE.SphereGeometry(0.015, 10, 8), 0xffa500, 0.5);
    case 'tea': return mkMesh(new THREE.BoxGeometry(0.014, 0.008, 0.014), 0x5a3a1a, 0.9);
    case 'water': return mkMesh(new THREE.SphereGeometry(0.012, 10, 8), 0x9fd8ff, 0.2, { transparent: true, opacity: 0.7 });
    default: return mkMesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), 0xffffff);
  }
}

function plateBase(r = 0.13, color = 0xffffff) {
  return mkMesh(new THREE.CylinderGeometry(r, r, 0.025, 28), color, 0.35);
}

function bowlBase(R, color = 0xf7f7f2) {
  const pts = [
    new THREE.Vector2(0.001, 0), new THREE.Vector2(R * 0.55, 0.005),
    new THREE.Vector2(R * 0.9, 0.04), new THREE.Vector2(R, 0.09),
  ];
  const m = mkMesh(new THREE.LatheGeometry(pts, 28), color, 0.3);
  m.material.side = THREE.DoubleSide;
  return m;
}

function kushariDish(large) {
  const g = new THREE.Group();
  const R = large ? 0.15 : 0.125;
  g.add(bowlBase(R));

  const rice = mkMesh(new THREE.SphereGeometry(R * 0.72, 22, 14), 0xf5efe0, 0.8);
  rice.scale.y = 0.45;
  rice.position.y = 0.035;
  g.add(rice);

  const pastaN = large ? 18 : 12;
  for (let i = 0; i < pastaN; i++) {
    const t = mkMesh(new THREE.TorusGeometry(0.018, 0.005, 6, 12), 0xf2c94c, 0.5);
    const a = seeded(i) * 6.28, r = seeded(i + 50) * R * 0.6;
    t.position.set(Math.cos(a) * r, 0.07 + seeded(i + 9) * 0.03, Math.sin(a) * r);
    t.rotation.set(seeded(i) * 3, seeded(i + 2) * 3, 0);
    g.add(t);
  }

  const lentN = large ? 24 : 16;
  for (let i = 0; i < lentN; i++) {
    const s = mkMesh(new THREE.SphereGeometry(0.012, 8, 6), 0x6b3a1a, 0.7);
    const a = seeded(i + 100) * 6.28, r = seeded(i + 150) * R * 0.6;
    s.position.set(Math.cos(a) * r, 0.07 + seeded(i + 11) * 0.02, Math.sin(a) * r);
    g.add(s);
  }

  if (large) {
    for (let i = 0; i < 10; i++) {
      const c = mkMesh(new THREE.SphereGeometry(0.014, 8, 6), 0xd8b98a, 0.7);
      const a = seeded(i + 200) * 6.28, r = seeded(i + 220) * R * 0.6;
      c.position.set(Math.cos(a) * r, 0.075, Math.sin(a) * r);
      g.add(c);
    }
  }

  const sauce = mkMesh(new THREE.CylinderGeometry(R * 0.55, R * 0.6, 0.012, 24), 0xb3261e, 0.35);
  sauce.position.y = 0.09;
  g.add(sauce);

  for (let i = 0; i < 12; i++) {
    const o = mkMesh(new THREE.TorusGeometry(0.012, 0.004, 6, 10), 0x9b5a1e, 0.6);
    const a = seeded(i + 300) * 6.28, r = seeded(i + 320) * R * 0.5;
    o.position.set(Math.cos(a) * r, 0.11, Math.sin(a) * r);
    o.rotation.x = Math.PI / 2;
    g.add(o);
  }
  return g;
}

function potatoDish() {
  const g = new THREE.Group();
  g.add(plateBase(0.14));
  for (let i = 0; i < 14; i++) {
    const c = mkMesh(new THREE.BoxGeometry(0.03, 0.028, 0.03), 0xd9a441, 0.6);
    const a = seeded(i + 400) * 6.28, r = seeded(i + 420) * 0.09;
    c.position.set(Math.cos(a) * r, 0.04, Math.sin(a) * r);
    c.rotation.set(seeded(i) * 2, seeded(i + 1) * 2, 0);
    g.add(c);
  }
  for (let i = 0; i < 20; i++) {
    const d = mkMesh(new THREE.SphereGeometry(0.008, 6, 5), 0x2e8b3a, 0.8);
    const a = seeded(i + 500) * 6.28, r = seeded(i + 520) * 0.1;
    d.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
    g.add(d);
  }
  const sauce = mkMesh(new THREE.CylinderGeometry(0.06, 0.07, 0.008, 20), 0xc0392b, 0.35);
  sauce.position.y = 0.02;
  g.add(sauce);
  return g;
}

function juiceDish() {
  const g = new THREE.Group();
  g.add(plateBase(0.09));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.2, 24, 1, true), glassMat(0xffffff, 0.25));
  glass.position.y = 0.12;
  g.add(glass);
  const juice = mkMesh(new THREE.CylinderGeometry(0.068, 0.058, 0.15, 24), 0xffa020, 0.2);
  juice.position.y = 0.09;
  g.add(juice);
  const straw = mkMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 8), 0xe74c3c, 0.4);
  straw.position.set(0.025, 0.2, 0);
  straw.rotation.z = 0.2;
  g.add(straw);
  return g;
}

function teaDish() {
  const g = new THREE.Group();
  g.add(plateBase(0.09, 0xffffff));
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 20, 1, true), glassMat(0xf5f0e0, 0.35));
  cup.position.y = 0.07;
  g.add(cup);
  const tea = mkMesh(new THREE.CylinderGeometry(0.046, 0.036, 0.07, 20), 0xb5651d, 0.2);
  tea.position.y = 0.06;
  g.add(tea);
  return g;
}

function waterDish() {
  const g = new THREE.Group();
  g.add(plateBase(0.09));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 20), glassMat(0x6fb8ff, 0.45));
  body.position.y = 0.12;
  g.add(body);
  const neck = mkMesh(new THREE.CylinderGeometry(0.018, 0.02, 0.05, 12), 0x6fb8ff, 0.2, { transparent: true, opacity: 0.6 });
  neck.position.y = 0.245;
  g.add(neck);
  const cap = mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), 0x1e90ff, 0.4);
  cap.position.y = 0.28;
  g.add(cap);
  return g;
}

// ---------- صور الوصفات للكتيب ----------
const thumbCache = {};
function dishThumb(id, locked) {
  const key = id + (locked ? 'L' : '');
  if (thumbCache[key]) return thumbCache[key];
  const cv = document.createElement('canvas');
  cv.width = 240; cv.height = 160;
  const c = cv.getContext('2d');
  const bg = c.createLinearGradient(0, 0, 0, 160);
  bg.addColorStop(0, '#2a2a48');
  bg.addColorStop(1, '#15152a');
  c.fillStyle = bg;
  c.fillRect(0, 0, 240, 160);
  const dot = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  const ell = (x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };

  switch (id) {
    case 'kushari_small':
    case 'kushari_large': {
      const big = id === 'kushari_large';
      ell(120, 100, 80, 32, '#e6e6e6');
      ell(120, 96, 72, 26, '#fafafa');
      ell(120, 90, 52, 20, '#f5efe0');
      for (let i = 0; i < (big ? 40 : 26); i++) dot(120 + (seeded(i) - 0.5) * 96, 92 + (seeded(i + 5) - 0.5) * 26, 3, '#6b3a1a');
      c.strokeStyle = '#f2c94c'; c.lineWidth = 3;
      for (let i = 0; i < 18; i++) {
        c.beginPath();
        c.arc(120 + (seeded(i + 30) - 0.5) * 96, 88 + (seeded(i + 40) - 0.5) * 24, 4, 0, Math.PI * 2);
        c.stroke();
      }
      if (big) for (let i = 0; i < 12; i++) dot(120 + (seeded(i + 60) - 0.5) * 90, 90 + (seeded(i + 70) - 0.5) * 22, 4, '#d8b98a');
      ell(120, 90, 42, 12, '#b3261e');
      for (let i = 0; i < 14; i++) dot(120 + (seeded(i + 80) - 0.5) * 80, 88 + (seeded(i + 90) - 0.5) * 16, 2.5, '#9b5a1e');
      break;
    }
    case 'potato_syrian':
      ell(120, 100, 84, 32, '#ffffff');
      for (let i = 0; i < 14; i++) {
        c.fillStyle = '#d9a441';
        const x = 120 + (seeded(i + 400) - 0.5) * 120, y = 100 + (seeded(i + 420) - 0.5) * 36;
        c.fillRect(x - 6, y - 6, 12, 12);
      }
      for (let i = 0; i < 20; i++) dot(120 + (seeded(i + 500) - 0.5) * 120, 100 + (seeded(i + 520) - 0.5) * 36, 2.5, '#2e8b3a');
      c.strokeStyle = '#c0392b'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(70, 112); c.quadraticCurveTo(120, 90, 170, 112); c.stroke();
      break;
    case 'juice_mango':
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.fillRect(88, 34, 64, 112);
      c.fillStyle = '#ffa020';
      c.fillRect(92, 60, 56, 82);
      c.strokeStyle = '#e74c3c'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(130, 34); c.lineTo(146, 14); c.stroke();
      break;
    case 'tea':
      ell(120, 132, 70, 16, '#ffffff');
      c.fillStyle = 'rgba(245,240,224,0.5)';
      c.fillRect(96, 56, 48, 74);
      c.fillStyle = '#b5651d';
      c.fillRect(100, 84, 40, 46);
      c.strokeStyle = '#f5f0e0'; c.lineWidth = 6;
      c.beginPath(); c.arc(152, 88, 12, -Math.PI / 2, Math.PI / 2); c.stroke();
      break;
    case 'water':
      c.fillStyle = 'rgba(111,184,255,0.55)';
      c.fillRect(98, 46, 44, 96);
      c.fillStyle = '#6fb8ff';
      c.fillRect(108, 32, 24, 16);
      c.fillStyle = '#1e90ff';
      c.fillRect(108, 22, 24, 12);
      break;
  }

  if (locked) {
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.fillRect(0, 0, 240, 160);
    c.fillStyle = '#fff';
    c.font = 'bold 40px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('🔒', 120, 80);
  }
  const url = cv.toDataURL();
  thumbCache[key] = url;
  return url;
}

function makePlateMesh(contents) {
  const g = new THREE.Group();
  g.add(mkMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24), 0xffffff, 0.35));
  let i = 0;
  for (const [k, n] of Object.entries(contents)) {
    for (let c = 0; c < n; c++) {
      const part = ingredientPart(k);
      const a = i * 2.4 + seeded(i) * 0.5;
      const r = 0.03 + seeded(i + 7) * 0.07;
      part.position.set(Math.cos(a) * r, 0.03 + (i % 3) * 0.012, Math.sin(a) * r);
      part.rotation.set(seeded(i) * 3, seeded(i + 3) * 3, 0);
      g.add(part);
      i++;
    }
  }
  return g;
}

function renderCounter() {
  while (counterGroup.children.length) counterGroup.remove(counterGroup.children[0]);
  COUNTER_SLOTS.forEach((pos, i) => {
    const g = new THREE.Group();
    g.position.set(pos.x, 1.18, pos.z);
    g.userData.slot = i;
    // قاعدة الخانة (بتتضغط عليها حتى لو فاضية)
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.01, 20), stdMat(0x333333, 0.9));
    base.position.y = 0.005;
    g.add(base);
    if (plates[i]) {
      const pm = makePlateMesh(plates[i].contents);
      pm.position.y = 0.02;
      g.add(pm);
    }
    counterGroup.add(g);
  });
}

// ترابيزة الطبق الجاهز (على اليمين)
const tableTop = addMesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), stdMat(0xb08050, 0.6), TABLE_POS.x, 1.14, TABLE_POS.z);
tableTop.userData.table = true;
const dishGroup = new THREE.Group();
scene.add(dishGroup);

function makeDishMesh(id) {
  const g = new THREE.Group();
  switch (id) {
    case 'kushari_small': g.add(kushariDish(false)); break;
    case 'kushari_large': g.add(kushariDish(true)); break;
    case 'potato_syrian': g.add(potatoDish()); break;
    case 'juice_mango': g.add(juiceDish()); break;
    case 'tea': g.add(teaDish()); break;
    case 'water': g.add(waterDish()); break;
    default: g.add(mkMesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 24), 0xffffff, 0.4));
  }
  return g;
}

function renderDishes() {
  while (dishGroup.children.length) dishGroup.remove(dishGroup.children[0]);
  S.ready.forEach((id, i) => {
    const g = makeDishMesh(id);
    g.position.set(TABLE_POS.x - 0.25 + (i % 4) * 0.17, 1.2, TABLE_POS.z - 0.15 + Math.floor(i / 4) * 0.3);
    g.userData.readyIdx = i;
    dishGroup.add(g);
  });
}

/* =========================================================
   الإيد: ذراع الأسطى اليمين
   ========================================================= */
const REACH = 1.15;
const handGroup = new THREE.Group();
scene.add(handGroup);
const armBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 1, 12), stdMat(0xc68642, 0.55));
const armSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 1, 12), stdMat(0xffffff, 0.85));
const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), stdMat(0xc68642, 0.55));
armBody.castShadow = armSleeve.castShadow = palm.castShadow = true;
handGroup.add(armBody, armSleeve, palm);
const handItem = new THREE.Group();
handItem.position.set(0, 0.06, 0.03);
handGroup.add(handItem);
const handPos = new THREE.Vector3(0, 1.2, -1.0);
const handPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.95);
const UP = new THREE.Vector3(0, 1, 0);

function placeArm(shoulder, target) {
  const d = new THREE.Vector3().subVectors(target, shoulder);
  const len = Math.max(0.01, d.length());
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  armBody.position.copy(shoulder).addScaledVector(d, 0.5);
  armBody.quaternion.copy(q);
  armBody.scale.set(1, len, 1);
  armSleeve.position.copy(shoulder).addScaledVector(d, 0.12);
  armSleeve.quaternion.copy(q);
  armSleeve.scale.set(1, len * 0.25, 1);
  palm.position.copy(target);
}

function renderHand() {
  while (handItem.children.length) handItem.remove(handItem.children[0]);
  if (!hand) return;
  if (hand.kind === 'plate') {
    const g = makePlateMesh(hand.contents);
    g.scale.setScalar(0.9);
    handItem.add(g);
  } else if (hand.kind === 'dish') {
    const g = makeDishMesh(hand.id);
    g.scale.setScalar(0.8);
    handItem.add(g);
  }
}

/* =========================================================
   Flying dish (لما تدي الطبق للزبون)
   ========================================================= */
const flyers = [];
function launchFlyer(id, toVec) {
  const g = makeDishMesh(id);
  const from = handPos.clone();
  g.position.copy(from);
  scene.add(g);
  flyers.push({ g, from, to: toVec, t: 0 });
}

function updateFlyers(dt) {
  for (const f of flyers) {
    f.t += dt / 0.5;
    const k = smooth(0, 1, Math.min(1, f.t));
    f.g.position.lerpVectors(f.from, f.to, k);
  }
  for (let i = flyers.length - 1; i >= 0; i--) {
    if (flyers[i].t >= 1) {
      scene.remove(flyers[i].g);
      flyers.splice(i, 1);
    }
  }
}

/* =========================================================
   Customers
   ========================================================= */
const customers = [];
const bubblesEl = $('bubbles');

function freeSlot() {
  for (let i = 0; i < SLOTS.length; i++) {
    if (!customers.some((c) => c.slot === i)) return i;
  }
  return -1;
}

class Customer {
  constructor() {
    const p = pick(PRESETS.slice(1));
    this.name = p.name;
    this.human = new Human(p.opts);
    this.group = this.human.group;
    this.group.userData.customer = this;
    this.slot = freeSlot();
    this.target = SLOTS[this.slot];
    this.order = pick(S.unlocked);
    this.maxPatience = 40 + S.rep * 3;
    this.patience = this.maxPatience;
    this.state = 'enter';
    this.pose = 'walk';
    this.line = '';
    this.lineTimer = 0;
    this.waitSaid = false;
    this.t = Math.random() * 10;
    this.dead = false;
    this.group.position.set(EXIT.x, 0, EXIT.z);
    scene.add(this.group);

    this.el = document.createElement('div');
    this.el.className = 'bubble';
    this.elText = document.createElement('div');
    this.elBar = document.createElement('i');
    const bar = document.createElement('div');
    bar.className = 'pbar';
    bar.appendChild(this.elBar);
    this.el.appendChild(this.elText);
    this.el.appendChild(bar);
    bubblesEl.appendChild(this.el);
  }

  say(text) {
    this.line = text;
    this.lineTimer = 3.5;
  }

  moveToTarget(dt) {
    const g = this.group;
    const dx = this.target.x - g.position.x;
    const dz = this.target.z - g.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const step = Math.min(d, 1.5 * dt);
    g.position.x += (dx / d) * step;
    g.position.z += (dz / d) * step;
    g.rotation.y = Math.atan2(dx, dz);
    return false;
  }

  update(dt) {
    this.t += dt;
    if (this.lineTimer > 0) this.lineTimer -= dt;

    if (this.state === 'enter' || this.state === 'leave') {
      this.pose = 'walk';
      if (this.moveToTarget(dt)) {
        if (this.state === 'enter') {
          this.state = 'order';
          this.group.rotation.y = Math.PI;
          this.say(pick(LINES.arrive));
          this.pose = 'talk';
        } else {
          this.dead = true;
        }
      }
    } else if (this.state === 'order') {
      this.pose = this.lineTimer > 0 ? 'talk' : 'idle';
      this.patience -= dt;
      if (!this.waitSaid && this.patience < this.maxPatience * 0.5) {
        this.waitSaid = true;
        this.say(pick(LINES.wait));
      }
      if (this.patience <= 0) {
        this.say(pick(LINES.angry));
        S.rep = Math.max(0, S.rep - 0.5);
        S.dayLost++;
        log(`${this.name} مشي من غير ما ياكل`);
        this.leave();
        save();
        renderAll();
      }
    }
    POSES[this.pose](this.human, this.t);
  }

  leave() {
    this.state = 'leave';
    this.target = EXIT;
    this.slot = null;
  }

  remove() {
    scene.remove(this.group);
    this.el.remove();
  }
}

function updateBubbles() {
  const w = viewer.clientWidth;
  const h = viewer.clientHeight;
  for (const c of customers) {
    const v = new THREE.Vector3(c.group.position.x, 2.05, c.group.position.z).project(camera);
    c.el.style.left = ((v.x + 1) / 2) * w + 'px';
    c.el.style.top = ((1 - v.y) / 2) * h + 'px';
    const visible = c.state === 'order' || c.lineTimer > 0;
    c.el.style.display = visible ? 'block' : 'none';
    if (visible) {
      const it = ITEMS[c.order];
      c.elText.textContent = c.lineTimer > 0 ? `${c.name}: ${c.line}` : `${c.name}: ${it.emoji} ${it.name}`;
      c.elBar.style.width = Math.max(0, (c.patience / c.maxPatience) * 100) + '%';
    }
  }
}

let spawnTimer = 3;
function spawnInterval() {
  let base = Math.max(4, 12 - S.rep * 1.4);
  if (S.sign) base *= 0.8;
  if (S.dayTime > DUSK_START) base *= 1.5;
  return base;
}

function updateSpawn(dt) {
  if (S.dayEnded) return;
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    if (freeSlot() >= 0 && S.dayTime < DAY_LENGTH - 15) customers.push(new Customer());
    spawnTimer = spawnInterval() * (0.7 + Math.random() * 0.6);
  }
}

/* =========================================================
   Actions: كل حاجة بتتعمل بالإيد
   ========================================================= */
// اضغط على طبق على الرف
function slotAction(i) {
  const here = plates[i];
  if (!hand) {
    if (!here) return log('المكان ده فاضي');
    hand = { kind: 'plate', contents: here.contents };
    plates[i] = null;
  } else if (hand.kind === 'plate') {
    if (!here) {
      plates[i] = { contents: hand.contents };
      hand = null;
    } else {
      // تبديل: الطبق اللي في إيدك يتحط مكان اللي على الرف، وتاخد اللي عليه
      plates[i] = { contents: hand.contents };
      hand = { kind: 'plate', contents: here.contents };
    }
  } else {
    log('الطبق ده للزبون، مش للرف');
    return;
  }
  renderCounter();
  renderHand();
  renderAll();
}

// اضغط على مكون وإنت شايل طبق: بيتضاف للطبق
function binAction(k) {
  if (!hand) return log('خد طبق من الرف الأول');
  if (hand.kind !== 'plate') return log('إيدك شايلة طبق جاهز، ديه للزبون');
  if (countOf(hand.contents) >= MAX_PLATE) return log('الطبق مليان، حطه على النار');
  if ((S.stock[k] || 0) <= 0) return log(`خلص ${STOCK[k].name}، اشتري من المتجر`);
  S.stock[k]--;
  hand.contents[k] = (hand.contents[k] || 0) + 1;
  renderHand();
  renderAll();
  save();
}

// اضغط على البوتاجاز وإنت شايل طبق: بيتحضّر
function stoveAction() {
  if (!hand || hand.kind !== 'plate') return log('خد طبق فيه مكونات الأول');
  if (countOf(hand.contents) === 0) return log('الطبق فاضي');
  const id = matchRecipe(hand.contents);
  if (!id) {
    S.rep = Math.max(0, S.rep - 0.1);
    log('المكونات دي مش وصفة! اتهدرت');
    hand.contents = {};
    renderHand();
    renderAll();
    save();
    return;
  }
  if (cooks.length >= S.stove) return log('كل البوتاجازات شغالة');
  if (S.ready.length + cooks.length >= MAX_READY) return log('الطلبات الجاهزة كتير، سلّم الأول');
  cooks.push({ id, left: ITEMS[id].time });
  hand.contents = {};
  log(`${ITEMS[id].name} على النار`);
  renderHand();
  renderAll();
}

// اضغط على طبق جاهز على الترابيزة
function dishAction(i) {
  if (hand) return log('إيدك مشغولة');
  hand = { kind: 'dish', id: S.ready.splice(i, 1)[0] };
  renderHand();
  renderDishes();
  renderAll();
  save();
}

// اضغط على الترابيزة وإنت شايل طبق جاهز: ترجعه
function tableAction() {
  if (!hand || hand.kind !== 'dish') return;
  S.ready.push(hand.id);
  hand = null;
  renderHand();
  renderDishes();
  renderAll();
  save();
}

// اضغط على الزبون وإنت شايل طبق جاهز: تديله
function customerAction(c) {
  if (c.state !== 'order') return;
  if (!hand) return log('خد طبق جاهز من الترابيزة الأول');
  if (hand.kind !== 'dish') return log('الزبون عايز طبق جاهز، حط المكونات على النار الأول');
  if (hand.id !== c.order) {
    c.say(pick(LINES.wrong));
    S.rep = Math.max(0, S.rep - 0.2);
    log(`${c.name} رفض الطبق، ده مش طلبه`);
    save();
    renderAll();
    return;
  }
  const id = hand.id;
  const price = ITEMS[id].price;
  launchFlyer(id, new THREE.Vector3(c.group.position.x, 1.9, c.group.position.z));
  hand = null;
  renderHand();
  S.money += price;
  S.dayRevenue += price;
  S.dayServed++;
  S.totalServed++;
  S.rep = Math.min(5, S.rep + 0.15 + (c.patience / c.maxPatience) * 0.1);
  c.say(pick(LINES.happy));
  c.leave();
  log(`+${price} ج من ${c.name}`);
  save();
  renderAll();
}

// افضي المكونات اللي في الطبق اللي في إيدك
function clearHandPlate() {
  if (!hand || hand.kind !== 'plate') return log('مفيش طبق في إيدك');
  for (const [k, n] of Object.entries(hand.contents)) S.stock[k] = (S.stock[k] || 0) + n;
  hand.contents = {};
  renderHand();
  renderAll();
  save();
}

function cookUpdate(dt) {
  if (!cooks.length) return;
  for (const c of cooks) c.left -= dt;
  const done = cooks.filter((c) => c.left <= 0);
  if (!done.length) return;
  cooks = cooks.filter((c) => c.left > 0);
  for (const d of done) {
    S.ready.push(d.id);
    log(`خلص ${ITEMS[d.id].name} على الترابيزة`);
  }
  save();
  renderDishes();
  renderAll();
}

/* =========================================================
   Camera modes: عين الأسطى / كاميرا حرة
   ========================================================= */
let fpsMode = true;
let yaw = 0;
let pitch = -0.12;
controls.enabled = false;

function setView(toFps) {
  fpsMode = toFps;
  controls.enabled = !toFps;
  master.group.visible = !toFps;
  camera.fov = toFps ? 62 : 42;
  camera.updateProjectionMatrix();
  if (!toFps) {
    camera.position.set(0, 2.4, 6.2);
    controls.target.set(0, 1.1, -0.4);
  }
  yaw = 0;
  pitch = -0.12;
  $('btn-view').textContent = toFps ? '🎥 كاميرا حرة' : '👁️ عين الأسطى';
  $('crosshair').hidden = !toFps;
}

/* =========================================================
   Input
   ========================================================= */
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2(0, 0);
let down = null;
let dragged = false;

function uiOpen() {
  return !$('modal').hidden || !$('eod').hidden || !$('guide').hidden || !$('book').hidden;
}

function resolveHit(obj) {
  let o = obj;
  while (o) {
    if (o.userData.bin !== undefined) return { type: 'bin', k: o.userData.bin };
    if (o.userData.readyIdx !== undefined) return { type: 'dish', i: o.userData.readyIdx };
    if (o.userData.slot !== undefined) return { type: 'slot', i: o.userData.slot };
    if (o.userData.stove) return { type: 'stove' };
    if (o.userData.table) return { type: 'table' };
    if (o.userData.customer) return { type: 'customer', c: o.userData.customer };
    o = o.parent;
  }
  return null;
}

function pickTag() {
  raycaster.setFromCamera(mouseNDC, camera);
  const targets = [
    ...binMeshes, counterGroup, dishGroup, tableTop, stoveBody, burner,
    ...customers.map((c) => c.group),
  ];
  const hits = raycaster.intersectObjects(targets, true);
  for (const h of hits) {
    const tag = resolveHit(h.object);
    if (tag) return { tag, point: h.point.clone() };
  }
  return null;
}

// الإيد بتروح لنقطة الماوس
function updateHand(dt) {
  handGroup.visible = fpsMode;
  if (!fpsMode) return;
  const shoulder = camera.localToWorld(new THREE.Vector3(0.22, -0.3, -0.05));
  const hit = pickTag();
  const target = new THREE.Vector3();
  if (hit) target.copy(hit.point);
  else if (!raycaster.ray.intersectPlane(handPlane, target)) raycaster.ray.at(1, target);

  const dir = new THREE.Vector3().subVectors(target, shoulder);
  const len = dir.length();
  if (len > REACH) target.copy(shoulder).addScaledVector(dir, REACH / len);

  handPos.lerp(target, Math.min(1, dt * 18));
  placeArm(shoulder, handPos);
}

function onClick() {
  const hit = pickTag();
  const tag = hit && hit.tag;
  if (!tag) return;
  switch (tag.type) {
    case 'slot': return slotAction(tag.i);
    case 'bin': return binAction(tag.k);
    case 'stove': return stoveAction();
    case 'dish': return dishAction(tag.i);
    case 'table': return tableAction();
    case 'customer': return customerAction(tag.c);
  }
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (uiOpen()) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  down = { x: e.clientX, y: e.clientY };
  dragged = false;
});

window.addEventListener('pointermove', (e) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  if (!down) return;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) dragged = true;
  if (fpsMode && dragged) {
    yaw = clamp(yaw - e.movementX * 0.003, -1.2, 1.2);
    pitch = clamp(pitch - e.movementY * 0.003, -0.6, 0.3);
  }
});

window.addEventListener('pointerup', () => {
  if (!down) return;
  const wasClick = !dragged;
  down = null;
  if (wasClick && !uiOpen()) onClick();
});

$('btn-view').addEventListener('click', () => setView(!fpsMode));
$('btn-finish').addEventListener('click', stoveAction);
$('btn-clear').addEventListener('click', clearHandPlate);
$('btn-shop-open').addEventListener('click', openModal);
$('modal-close').addEventListener('click', closeModal);
$('btn-shop').addEventListener('click', () => { $('eod').hidden = true; openModal(); });
$('btn-skip').addEventListener('click', startNewDay);
$('btn-guide').addEventListener('click', () => { $('guide').hidden = false; });
$('btn-book').addEventListener('click', () => { renderBook(); $('book').hidden = false; });
$('book-close').addEventListener('click', () => { $('book').hidden = true; });
$('guide-close').addEventListener('click', () => {
  $('guide').hidden = true;
  try { localStorage.setItem('kushary-guide-seen', '1'); } catch (e) { /* ignore */ }
});
for (const tb of document.querySelectorAll('#guide [data-tab]')) {
  tb.addEventListener('click', () => {
    for (const x of document.querySelectorAll('#guide [data-tab]')) x.classList.toggle('active', x === tb);
    for (const id of ['general', 'pc', 'mobile']) $('tab-' + id).hidden = id !== tb.dataset.tab;
  });
}

/* =========================================================
   UI rendering
   ========================================================= */
function renderAll() {
  $('money').textContent = S.money;
  $('day').textContent = S.day;
  $('rep').textContent = `${'⭐'.repeat(Math.round(S.rep))} (${S.rep.toFixed(1)})`;

  const sl = $('stock-list');
  sl.innerHTML = '';
  for (const [k, v] of Object.entries(STOCK)) {
    const d = document.createElement('div');
    d.className = 'stat';
    d.textContent = `${v.name}: ${S.stock[k] || 0}`;
    sl.appendChild(d);
  }

  const rl = $('recipes-list');
  rl.innerHTML = '';
  for (const id of S.unlocked) {
    const parts = Object.entries(ITEMS[id].need).map(([k, n]) => `${STOCK[k].name}×${n}`).join('، ');
    const d = document.createElement('div');
    d.className = 'stat';
    d.textContent = `${ITEMS[id].emoji} ${ITEMS[id].name}: ${parts}`;
    rl.appendChild(d);
  }

  let handText = 'إيدك فاضية';
  if (hand && hand.kind === 'plate') {
    const e = Object.entries(hand.contents).filter(([, n]) => n > 0);
    handText = 'طبق في إيدك: ' + (e.length ? e.map(([k, n]) => `${STOCK[k].name}×${n}`).join('، ') : 'فاضي');
  } else if (hand && hand.kind === 'dish') {
    handText = `في إيدك: ${ITEMS[hand.id].name}`;
  }
  $('plate-list').textContent = handText;

  $('cook-list').textContent = cooks.length
    ? cooks.map((c) => `${ITEMS[c.id].name} (${Math.ceil(c.left)} ث)`).join(' • ')
    : 'البوتاجاز فاضي';
}

function renderHandAndCounter() {
  renderCounter();
  renderHand();
}

function renderBook() {
  const b = $('book-body');
  b.innerHTML = '';
  for (const [id, it] of Object.entries(ITEMS)) {
    const unlocked = S.unlocked.includes(id);
    const card = document.createElement('div');
    card.className = 'card' + (unlocked ? '' : ' locked');
    const img = document.createElement('img');
    img.src = dishThumb(id, !unlocked);
    img.alt = it.name;
    card.appendChild(img);
    const h = document.createElement('h3');
    h.textContent = `${it.emoji} ${it.name}`;
    card.appendChild(h);
    const meta = document.createElement('p');
    meta.textContent = `السعر: ${it.price} ج • وقت التحضير: ${it.time} ث`;
    card.appendChild(meta);
    if (unlocked) {
      const ul = document.createElement('ul');
      for (const [k, n] of Object.entries(it.need)) {
        const li = document.createElement('li');
        li.textContent = `${STOCK[k].name} × ${n}`;
        ul.appendChild(li);
      }
      card.appendChild(ul);
      const ol = document.createElement('ol');
      for (const s of RECIPE_STEPS[id]) {
        const li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      }
      card.appendChild(ol);
    } else {
      const p = document.createElement('p');
      p.textContent = `🔒 افتح الطبق من المتجر (${it.unlock} ج) عشان تشوف الوصفة`;
      card.appendChild(p);
    }
    b.appendChild(card);
  }
}

function renderShop() {
  const b = $('modal-body');
  b.innerHTML = '';
  const sec = (t) => {
    const h = document.createElement('h4');
    h.textContent = t;
    b.appendChild(h);
  };

  sec('المكونات (حزمة 5 وحدات)');
  for (const [k, v] of Object.entries(STOCK)) {
    b.appendChild(btn(`${v.name} — ${v.cost * 5} ج`, () => buyStock(k), S.money < v.cost * 5));
  }

  sec('فتح أطباق');
  for (const [id, it] of Object.entries(ITEMS)) {
    if (S.unlocked.includes(id) || it.unlock <= 0) continue;
    b.appendChild(btn(`${it.name} — ${it.unlock} ج`, () => buyUnlock(id), S.money < it.unlock));
  }

  sec('معدات');
  if (S.stove < 3) {
    b.appendChild(btn(`${EQUIP.stove.name} — ${EQUIP.stove.cost} ج (${EQUIP.stove.desc})`, () => buyEquip('stove'), S.money < EQUIP.stove.cost));
  }
  if (!S.sign) {
    b.appendChild(btn(`${EQUIP.sign.name} — ${EQUIP.sign.cost} ج (${EQUIP.sign.desc})`, () => buyEquip('sign'), S.money < EQUIP.sign.cost));
  }
}

function buyStock(k) {
  const total = STOCK[k].cost * 5;
  if (S.money < total) return;
  S.money -= total;
  S.stock[k] = (S.stock[k] || 0) + 5;
  log(`اشتريت 5 ${STOCK[k].name}`);
  afterShopChange();
}

function buyUnlock(id) {
  const cost = ITEMS[id].unlock;
  if (S.money < cost) return;
  S.money -= cost;
  S.unlocked.push(id);
  log(`فتحت ${ITEMS[id].name}`);
  afterShopChange();
}

function buyEquip(id) {
  const cost = EQUIP[id].cost;
  if (S.money < cost) return;
  if (id === 'stove') {
    if (S.stove >= 3) return;
    S.stove++;
  } else {
    if (S.sign) return;
    S.sign = 1;
  }
  S.money -= cost;
  log(`اشتريت ${EQUIP[id].name}`);
  afterShopChange();
}

function afterShopChange() {
  save();
  renderAll();
  renderShop();
}

function openModal() {
  renderShop();
  $('modal').hidden = false;
}

function closeModal() {
  $('modal').hidden = true;
}

/* =========================================================
   Day cycle
   ========================================================= */
function updateSky() {
  const k = smooth(DUSK_START, DAY_LENGTH, S.dayTime);
  if (k < 0.4) skyC.lerpColors(skyDay, skyDusk, k / 0.4);
  else skyC.lerpColors(skyDusk, skyNight, (k - 0.4) / 0.6);
  scene.background.copy(skyC);
  scene.fog.color.copy(skyC);

  keyLight.intensity = 2.5 * (1 - k) + 0.1;
  keyLight.color.lerpColors(new THREE.Color(0xfff0dd), new THREE.Color(0xff9a5a), k);
  fillLight.intensity = 1.2 * (1 - k * 0.6);
  rimLight.intensity = 1.8 * (1 - k * 0.5) + k * 0.4;
  hemi.intensity = 0.6 - 0.3 * k;
  renderer.toneMappingExposure = 1.1 - 0.35 * k;
  for (const m of winMats) m.emissiveIntensity = 1.6 * k;
  for (const m of lampBulbMats) m.emissiveIntensity = 1.2 * k;
  for (const l of lampLights) l.intensity = 2.2 * k;

  const angle = (S.dayTime / DAY_LENGTH) * Math.PI;
  keyLight.position.set(Math.cos(angle) * -5 + 2, Math.sin(angle) * 5 + 0.5, 3);
}

function updateDay(dt) {
  if (!S.dayEnded) {
    S.dayTime += dt;
    if (S.dayTime >= DAY_LENGTH) {
      S.dayTime = DAY_LENGTH;
      endDay();
    }
  }
  updateSky();
}

function endDay() {
  S.dayEnded = true;
  for (const c of customers) {
    if (c.state === 'order' || c.state === 'enter') c.leave();
  }
  $('eod-stats').innerHTML =
    `إيراد اليوم: <b>${S.dayRevenue} ج</b><br>` +
    `زباين اتخدموا: <b>${S.dayServed}</b><br>` +
    `زباين مشيوا: <b>${S.dayLost}</b><br>` +
    `الرصيد: <b>${S.money} ج</b>`;
  $('eod').hidden = false;
  save();
}

function startNewDay() {
  S.day++;
  S.dayTime = 0;
  S.dayEnded = false;
  S.dayRevenue = 0;
  S.dayServed = 0;
  S.dayLost = 0;
  spawnTimer = 3;
  $('eod').hidden = true;
  log(`يوم ${S.day} بدأ`);
  save();
  renderAll();
}

function clockText() {
  if (S.dayEnded) return 'خلص';
  const left = Math.max(0, DAY_LENGTH - S.dayTime);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(Math.floor(left % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

/* =========================================================
   Resize & loop
   ========================================================= */
function resize() {
  const w = viewer.clientWidth;
  const h = viewer.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
let t = 0;
let uiTimer = 0;
let saveTimer = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1);
  t += dt;

  if (fpsMode) {
    camera.position.copy(FPS_POS);
    camera.rotation.set(pitch, yaw + Math.PI, 0);
  } else {
    controls.update();
  }

  updateHand(dt);
  updateDay(dt);
  updateSpawn(dt);
  cookUpdate(dt);

  for (const c of customers) c.update(dt);
  customers.splice(0, customers.length, ...customers.filter((c) => {
    if (c.dead) { c.remove(); return false; }
    return true;
  }));

  updateFlyers(dt);
  updateSteam(dt);
  POSES[cooks.length ? 'cook' : 'idle'](master, t);

  uiTimer += dt;
  if (uiTimer > 0.5) {
    uiTimer = 0;
    $('clock').textContent = clockText();
    if (cooks.length) renderAll();
  }

  saveTimer += dt;
  if (saveTimer > 5) {
    saveTimer = 0;
    save();
  }

  updateBubbles();
  renderer.render(scene, camera);
}

renderCounter();
renderDishes();
renderAll();
if (S.dayEnded) endDay();
setView(true);
try {
  if (!localStorage.getItem('kushary-guide-seen')) $('guide').hidden = false;
} catch (e) { /* ignore */ }
frame();
