// 3D form demos for Health: a grey anatomy-style figure with the working muscles in red,
// built from simple shapes (no model files) and animated with a small 2-bone IK.
// Loaded on demand from lib/health.js, so three.js never lands in the main bundle.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

/* ---------- shapes ---------- */
function mats(dark) {
  return {
    skin: new THREE.MeshStandardMaterial({ color: dark ? 0xb9bdc4 : 0xc9ccd2, roughness: 0.55, metalness: 0.02 }),
    skin2: new THREE.MeshStandardMaterial({ color: dark ? 0xa9adb5 : 0xb8bcc3, roughness: 0.6 }),
    work: new THREE.MeshStandardMaterial({ color: 0xe5483a, roughness: 0.42, metalness: 0.02 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x3b3f46, roughness: 0.35, metalness: 0.6 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x2f333a, roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.35, metalness: 0.7 }),
  };
}
function ellipsoid(mat, sx, sy, sz) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat); m.scale.set(sx, sy, sz); return m; }
// A limb segment along +Y from 0 to len, tapering through the given radii (smooth lathe profile).
function limb(mat, len, radii) {
  const pts = [], n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i / n, k = t * (radii.length - 1), j = Math.min(radii.length - 2, Math.floor(k)), f = k - j;
    const r = radii[j] + (radii[j + 1] - radii[j]) * (0.5 - Math.cos(f * Math.PI) / 2);
    pts.push(new THREE.Vector2(Math.max(0.001, r * Math.sin(Math.PI / 2 * Math.min(1, Math.min(t, 1 - t) * 14 + 0.1))), t * len));
  }
  pts[0].x = 0.001; pts[n].x = 0.001;
  return new THREE.Mesh(new THREE.LatheGeometry(pts, 24), mat);
}
// Put a +Y-aligned mesh at A pointing to B.
function aim(mesh, A, B) { const d = B.clone().sub(A).normalize(); mesh.position.copy(A); mesh.quaternion.setFromUnitVectors(UP, d); }
function shadowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, "rgba(0,0,0,0.28)"); r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dumbbell(M) {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 16), M.frame); bar.rotation.z = Math.PI / 2; g.add(bar);
  [-1, 1].forEach((s) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), M.iron); p.rotation.z = Math.PI / 2; p.position.x = s * 0.085; g.add(p); });
  return g;
}

/* ---------- 2-bone IK ---------- */
function ik(S, H, a, b, pole) {
  const axis = H.clone().sub(S); let d = axis.length(); axis.normalize();
  d = Math.min(d, a + b - 0.002);
  const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
  const pp = pole.clone().sub(axis.clone().multiplyScalar(pole.dot(axis))).normalize();
  return { elbow: S.clone().add(axis.clone().multiplyScalar(x)).add(pp.clone().multiplyScalar(h)), hand: S.clone().add(axis.clone().multiplyScalar(d)), back: pp };
}
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/* ---------- exercises ---------- */
// Each returns { update(p) } where p runs 0 (top) -> 1 (bottom) of the rep, plus a timeline of phases.
function inclineDumbbellPress(scene, M) {
  const UA = 0.3, FA = 0.29;
  /* bench at 30° */
  const bench = new THREE.Group(); scene.add(bench);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.42), M.pad); seat.position.set(0, 0.45, 0.12); bench.add(seat);
  const back = new THREE.Group(); back.position.set(0, 0.5, -0.07); back.rotation.x = -Math.PI / 3; bench.add(back);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.07), M.pad); pad.position.set(0, 0.48, -0.1); back.add(pad);
  [[0, 0.21, 0.12, 0.42], [0, 0.21, -0.45, 0.42]].forEach(([x, y, z, hgt]) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, hgt, 0.06), M.frame); leg.position.set(x, y, z); bench.add(leg); });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1.1), M.frame); rail.position.set(0, 0.03, -0.12); bench.add(rail);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.06), M.frame); foot.position.set(0, 0.02, 0.42); bench.add(foot);
  const foot2 = foot.clone(); foot2.position.z = -0.66; bench.add(foot2);
  const strut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.05), M.frame); strut.position.set(0, 0.32, -0.55); strut.rotation.x = 0.55; bench.add(strut);

  /* torso: local +Y up the spine, +Z out of the chest */
  const torso = new THREE.Group(); torso.position.set(0, 0.56, -0.02).add(V(0, 0.866, 0.5).multiplyScalar(-0.03)); torso.rotation.x = -Math.PI / 3; scene.add(torso);
  const add = (m, x, y, z, rx) => { m.position.set(x, y, z); if (rx) m.rotation.x = rx; torso.add(m); return m; };
  add(ellipsoid(M.skin, 0.165, 0.11, 0.115), 0, 0.02, 0);
  add(ellipsoid(M.skin, 0.135, 0.17, 0.1), 0, 0.2, 0.0);
  add(ellipsoid(M.skin2, 0.16, 0.34, 0.07), 0, 0.28, -0.06); // flat back on the pad
  add(ellipsoid(M.skin, 0.18, 0.2, 0.12), 0, 0.42, -0.005);
  add(ellipsoid(M.skin2, 0.2, 0.13, 0.095), 0, 0.47, -0.035);
  for (let r = 0; r < 3; r++) for (let s = -1; s <= 1; s += 2) add(ellipsoid(M.skin, 0.034, 0.03, 0.012), s * 0.037, 0.12 + r * 0.068, 0.094);
  add(ellipsoid(M.skin, 0.06, 0.09, 0.03), -0.115, 0.23, 0.06).rotation.z = -0.25;
  add(ellipsoid(M.skin, 0.06, 0.09, 0.03), 0.115, 0.23, 0.06).rotation.z = 0.25;
  // pecs: upper chest highlighted
  [-1, 1].forEach((s) => {
    const lower = add(ellipsoid(M.skin, 0.09, 0.055, 0.04), s * 0.078, 0.43, 0.085); lower.rotation.z = s * 0.12;
    const upper = add(ellipsoid(M.work, 0.088, 0.05, 0.042), s * 0.08, 0.5, 0.086); upper.rotation.z = -s * 0.18;
  });
  add(ellipsoid(M.skin2, 0.13, 0.05, 0.06), 0, 0.6, -0.03);
  const neck = add(limb(M.skin, 0.12, [0.05, 0.048, 0.045]), 0, 0.6, 0);
  const head = add(ellipsoid(M.skin, 0.085, 0.105, 0.095), 0, 0.79, 0.02);
  add(ellipsoid(M.skin, 0.06, 0.04, 0.06), 0, 0.72, 0.05);
  void neck; void head;

  /* legs: feet flat and wide */
  const thigh = limb(M.skin, 0.44, [0.085, 0.08, 0.062, 0.05]), thighR = thigh.clone();
  const shin = limb(M.skin, 0.43, [0.05, 0.055, 0.042, 0.034]), shinR = shin.clone();
  const knee = ellipsoid(M.skin, 0.05, 0.05, 0.05), kneeR = knee.clone();
  const footM = ellipsoid(M.skin2, 0.04, 0.03, 0.11), footMR = footM.clone();
  [thigh, thighR, shin, shinR, knee, kneeR, footM, footMR].forEach((m) => scene.add(m));

  /* arms */
  const parts = [-1, 1].map(() => {
    const p = { up: limb(M.skin, UA, [0.052, 0.05, 0.042, 0.038]), fore: limb(M.skin, FA, [0.04, 0.042, 0.032, 0.026]), elbow: ellipsoid(M.skin, 0.038, 0.038, 0.038),
      hand: ellipsoid(M.skin, 0.032, 0.04, 0.03), delt: ellipsoid(M.skin, 0.068, 0.068, 0.068), front: ellipsoid(M.work, 0.042, 0.06, 0.036), tri: ellipsoid(M.work, 0.034, 0.1, 0.034), db: dumbbell(M) };
    Object.values(p).forEach((m) => scene.add(m));
    return p;
  });

  const L = (v) => torso.localToWorld(v.clone());
  const D = (v) => v.clone().transformDirection(torso.matrixWorld);
  const tmp = new THREE.Quaternion();

  function update(p) {
    torso.updateMatrixWorld(true);
    // legs
    [-1, 1].forEach((s, i) => {
      const hip = L(V(s * 0.085, -0.02, 0.03)), kn = V(s * 0.18, 0.49, 0.44), an = V(s * 0.22, 0.07, 0.42);
      const th = i ? thighR : thigh, sh = i ? shinR : shin, k = i ? kneeR : knee, f = i ? footMR : footM;
      aim(th, hip, kn); aim(sh, kn, an); k.position.copy(kn); f.position.copy(an).add(V(0, -0.035, 0.07));
    });
    // arms: top = over the upper chest, bottom = beside it with elbows ~45° down
    const fwd = D(V(0, 0, 1)), spine = D(V(0, 1, 0));
    parts.forEach((a, i) => {
      const s = i ? 1 : -1, S = L(V(s * 0.2, 0.55, 0));
      const top = S.clone().add(V(-s * 0.075, 0.55, 0.08));
      const bot = L(V(s * 0.3, 0.47, 0.1));
      const H = top.clone().lerp(bot, p).add(V(s * 0.03 * Math.sin(p * Math.PI), 0, 0));
      const pole = V(s, 0, 0).multiplyScalar(0.55).add(fwd.clone().multiplyScalar(-1)).add(spine.clone().multiplyScalar(-0.75)).normalize();
      const r = ik(S, H, UA, FA, pole);
      aim(a.up, S, r.elbow); aim(a.fore, r.elbow, r.hand);
      a.elbow.position.copy(r.elbow); a.hand.position.copy(r.hand);
      a.hand.quaternion.copy(a.fore.quaternion);
      const armDir = r.elbow.clone().sub(S).normalize();
      a.delt.position.copy(S).add(armDir.clone().multiplyScalar(0.02));
      a.front.position.copy(S).add(fwd.clone().multiplyScalar(0.045)).add(armDir.clone().multiplyScalar(0.035));
      a.front.quaternion.copy(a.up.quaternion);
      a.tri.position.copy(S).add(armDir.clone().multiplyScalar(0.16)).add(r.back.clone().multiplyScalar(0.028));
      a.tri.quaternion.copy(a.up.quaternion);
      const handDir = r.hand.clone().sub(r.elbow).normalize();
      a.db.position.copy(r.hand).add(handDir.multiplyScalar(0.03));
      a.db.quaternion.copy(tmp.setFromAxisAngle(V(1, 0, 0), 0));
    });
  }
  return {
    update,
    target: V(0, 0.62, -0.08),
    views: { angle: V(2.35, 1.75, 2.05), side: V(3.3, 0.85, -0.08), front: V(0.0, 1.95, 3.0) },
    // seconds: squeeze at the top, lower slowly, stretch, press
    timeline: [["Squeeze at the top", 0.5, 0, 0], ["Lower for 2 seconds", 2.0, 0, 1], ["Feel the stretch", 0.35, 1, 1], ["Press up and in", 1.0, 1, 0]],
  };
}

const EXERCISES = { "incline-db-press": inclineDumbbellPress };
export function hasForm3D(id) { return !!EXERCISES[id]; }

/* ---------- mount ---------- */
export function mountForm3D(el, id, opts) {
  opts = opts || {};
  const build = EXERCISES[id]; if (!build) return null;
  const dark = !!opts.dark;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x30333a : 0x9aa0a8, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(1.5, 3, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-2, 1.5, -2); scene.add(rim);
  const M = mats(dark);
  const ex = build(scene, M);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.001, 0.0); scene.add(shadow);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.copy(ex.views.angle);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(ex.target); controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.5; controls.rotateSpeed = 0.7;
  controls.update();

  function size() { const w = el.clientWidth || 300, h = el.clientHeight || 300; renderer.setSize(w, h, false); renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px"; camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null; if (ro) ro.observe(el);

  const total = ex.timeline.reduce((a, s) => a + s[1], 0);
  let playing = true, clock = 0, last = performance.now(), phase = -1, fly = null, raf = 0, disposed = false;
  function at(t) {
    let acc = 0;
    for (let i = 0; i < ex.timeline.length; i++) {
      const s = ex.timeline[i];
      if (t < acc + s[1] || i === ex.timeline.length - 1) { const f = Math.min(1, (t - acc) / s[1]); return { i, p: s[2] + (s[3] - s[2]) * ease(f) }; }
      acc += s[1];
    }
  }
  function frame(now) {
    if (disposed) return;
    if (!renderer.domElement.isConnected) { dispose(); return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing) clock = (clock + dt * (opts.speed || 1)) % total;
    const s = at(clock);
    if (s.i !== phase) { phase = s.i; if (opts.onPhase) opts.onPhase(ex.timeline[phase][0], phase); }
    ex.update(s.p);
    if (fly) {
      fly.t = Math.min(1, fly.t + dt * 1.8);
      camera.position.lerpVectors(fly.from, fly.to, ease(fly.t));
      if (fly.t >= 1) fly = null;
    }
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); controls.dispose();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  return {
    play(on) { playing = on == null ? !playing : !!on; return playing; },
    view(name) { const to = ex.views[name]; if (to) fly = { from: camera.position.clone(), to: to.clone(), t: 0 }; },
    // jump to a point in the rep (0 top, 1 bottom) and hold, for screenshots and the steps list
    pose(stepIndex) { let acc = 0; for (let i = 0; i < stepIndex; i++) acc += ex.timeline[i][1]; clock = acc + ex.timeline[stepIndex][1] * 0.999; playing = false; },
    dispose,
  };
}
