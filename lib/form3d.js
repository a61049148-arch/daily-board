// 3D form demos for Health: a grey anatomy-style figure with the working muscles in red,
// built from simple shapes (no model files). One rig (torso, 2-bone IK arms and legs)
// is posed per exercise. Loaded on demand from lib/health.js, so three.js stays out of the main bundle.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const mix = (a, b, t) => a + (b - a) * t;
const lerpV = (a, b, t) => a.clone().lerp(b, t);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const DEG = Math.PI / 180;
const SIDES = [-1, 1];

/* ---------- materials and shapes ---------- */
function mats(dark) {
  return {
    skin: new THREE.MeshStandardMaterial({ color: dark ? 0xb9bdc4 : 0xc9ccd2, roughness: 0.55, metalness: 0.02 }),
    skin2: new THREE.MeshStandardMaterial({ color: dark ? 0xa9adb5 : 0xbcc0c7, roughness: 0.6 }),
    work: new THREE.MeshStandardMaterial({ color: 0xe5483a, roughness: 0.42, metalness: 0.02 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x3b3f46, roughness: 0.35, metalness: 0.6 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x2f333a, roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.35, metalness: 0.7 }),
    cable: new THREE.MeshStandardMaterial({ color: 0x55595f, roughness: 0.5 }),
  };
}
function ell(mat, sx, sy, sz) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat); m.scale.set(sx, sy, sz); return m; }
// A limb segment along +Y from 0 to len, tapering through the given radii.
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
function box(parent, mat, w, h, d, x, y, z, rx) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (rx) m.rotation.x = rx; parent.add(m); return m; }
function cylX(mat, r, len, seg) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg || 16), mat); m.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; }
function shadowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, "rgba(0,0,0,0.26)"); r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- equipment ---------- */
const XAX = V(1, 0, 0);
function dumbbell(scene, M) {
  const g = new THREE.Group();
  g.add(cylX(M.frame, 0.014, 0.2));
  SIDES.forEach((s) => { const p = cylX(M.iron, 0.05, 0.05, 6); p.position.x = s * 0.085; g.add(p); });
  scene.add(g);
  g.at = (pos, dir) => { g.position.copy(pos); g.quaternion.setFromUnitVectors(XAX, (dir || XAX).clone().normalize()); };
  return g;
}
function barbell(scene, M, len, plateR) {
  const g = new THREE.Group();
  g.add(cylX(M.frame, 0.014, len));
  if (plateR) SIDES.forEach((s) => { const p = cylX(M.iron, plateR, 0.07, 24); p.position.x = s * (len / 2 - 0.12); g.add(p); const q = cylX(M.iron, plateR * 0.8, 0.05, 24); q.position.x = s * (len / 2 - 0.19); g.add(q); });
  scene.add(g);
  g.at = (pos) => g.position.copy(pos);
  return g;
}
function cable(scene, M) {
  const geo = new THREE.CylinderGeometry(0.006, 0.006, 1, 6); geo.translate(0, 0.5, 0);
  const m = new THREE.Mesh(geo, M.cable); scene.add(m);
  m.set = (a, b) => { aim(m, a, b); m.scale.y = a.distanceTo(b); };
  return m;
}
function tower(scene, M, x, z, h) {
  box(scene, M.frame, 0.12, h, 0.12, x, h / 2, z);
  box(scene, M.frame, 0.5, 0.04, 0.5, x, 0.02, z);
}
function pulley(scene, M, pos) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), M.iron); p.rotation.z = Math.PI / 2; p.position.copy(pos); scene.add(p); return pos; }
// Adjustable bench. angle: back pad from horizontal (0 = flat). flip turns it so the pad rises toward +Z.
function bench(scene, M, angle, flip) {
  const g = new THREE.Group(); scene.add(g); if (flip) g.rotation.y = Math.PI;
  box(g, M.frame, 0.06, 0.05, 1.2, 0, 0.025, -0.15);
  box(g, M.frame, 0.5, 0.04, 0.06, 0, 0.02, 0.42); box(g, M.frame, 0.5, 0.04, 0.06, 0, 0.02, -0.72);
  if (!angle) {
    box(g, M.pad, 0.3, 0.07, 1.2, 0, 0.45, -0.1);
    box(g, M.frame, 0.06, 0.42, 0.06, 0, 0.21, 0.3); box(g, M.frame, 0.06, 0.42, 0.06, 0, 0.21, -0.55);
    return g;
  }
  box(g, M.pad, 0.3, 0.07, 0.42, 0, 0.45, 0.12);
  box(g, M.frame, 0.06, 0.42, 0.06, 0, 0.21, 0.12);
  const back = new THREE.Group(); back.position.set(0, 0.5, -0.07); back.rotation.x = -(90 - angle) * DEG; g.add(back);
  box(back, M.pad, 0.3, 0.9, 0.07, 0, 0.45, -0.1);
  const a = angle * DEG, rz = -0.07 - 0.38 * Math.cos(a) - 0.05, ry = 0.5 + 0.38 * Math.sin(a) - 0.06;
  box(g, M.frame, 0.06, ry, 0.06, 0, ry / 2, rz);
  return g;
}
// Where the pelvis sits when leaning on a bench back at `angle` (ly slides along the pad).
function onBench(angle, ly) {
  const a = angle * DEG, Y = V(0, Math.sin(a), -Math.cos(a)), Z = V(0, Math.cos(a), Math.sin(a));
  return V(0, 0.5, -0.07).add(Y.multiplyScalar(ly)).add(Z.multiplyScalar(0.06));
}
function seat(scene, M, y, z, back) {
  box(scene, M.pad, 0.36, 0.07, 0.4, 0, y, z);
  box(scene, M.frame, 0.06, y - 0.03, 0.06, 0, (y - 0.03) / 2, z);
  box(scene, M.frame, 0.5, 0.04, 0.5, 0, 0.02, z);
  if (back) { box(scene, M.pad, 0.34, 0.6, 0.07, 0, y + 0.36, z - 0.24, -0.12); box(scene, M.frame, 0.05, y + 0.3, 0.05, 0, (y + 0.3) / 2, z - 0.3); }
}

/* ---------- 2-bone IK ---------- */
function ik(S, H, a, b, pole) {
  const axis = H.clone().sub(S); let d = axis.length(); axis.normalize();
  d = Math.max(0.05, Math.min(d, a + b - 0.002));
  const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
  let pp = pole.clone().sub(axis.clone().multiplyScalar(pole.dot(axis)));
  if (pp.lengthSq() < 1e-6) pp = V(0, 0, 1).cross(axis); pp.normalize();
  return { elbow: S.clone().add(axis.clone().multiplyScalar(x)).add(pp.clone().multiplyScalar(h)), hand: S.clone().add(axis.clone().multiplyScalar(d)), back: pp };
}

/* ---------- the figure ---------- */
const UA = 0.3, FA = 0.29, LT = 0.44, LS = 0.43, PV = 0.24;
// Muscle keys: upperChest chest frontDelt sideDelt rearDelt lats upperBack lowerBack biceps triceps forearms abs obliques glutes quads hamstrings calves
function makeRig(scene, M, work) {
  const mat = (k, base) => (work.indexOf(k) >= 0 ? M.work : base || M.skin);
  const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
  const upper = new THREE.Group(); upper.position.set(0, PV, 0); root.add(upper);
  const put = (parent, dy) => (m, x, y, z, rz) => { m.position.set(x, y - dy, z); if (rz) m.rotation.z = rz; parent.add(m); return m; };
  const addR = put(root, 0), addU = put(upper, PV);
  // hips and belly
  addR(ell(M.skin, 0.165, 0.11, 0.115), 0, 0.02, 0);
  SIDES.forEach((s) => addR(ell(mat("glutes"), 0.085, 0.095, 0.075), s * 0.072, -0.02, -0.06));
  addR(ell(M.skin, 0.135, 0.15, 0.1), 0, 0.17, 0);
  addR(ell(mat("lowerBack", M.skin2), 0.11, 0.12, 0.05), 0, 0.17, -0.065);
  addR(ell(mat("abs"), 0.085, 0.16, 0.04), 0, 0.2, 0.068); // one smooth six-pack panel
  SIDES.forEach((s) => addR(ell(mat("obliques"), 0.05, 0.11, 0.07), s * 0.105, 0.17, 0.02, s * 0.15));
  // chest and back
  addU(ell(M.skin, 0.18, 0.2, 0.12), 0, 0.42, -0.005);
  addU(ell(M.skin2, 0.16, 0.2, 0.075), 0, 0.36, -0.055);
  SIDES.forEach((s) => addU(ell(mat("lats", M.skin2), 0.06, 0.15, 0.085), s * 0.13, 0.36, -0.035, s * 0.22));
  addU(ell(mat("upperBack", M.skin2), 0.16, 0.12, 0.06), 0, 0.5, -0.065);
  addU(ell(mat("upperBack", M.skin2), 0.12, 0.06, 0.06), 0, 0.6, -0.035);
  SIDES.forEach((s) => {
    addU(ell(mat("chest"), 0.09, 0.055, 0.04), s * 0.078, 0.43, 0.085, s * 0.12);
    addU(ell(mat("upperChest"), 0.088, 0.05, 0.042), s * 0.08, 0.5, 0.086, -s * 0.18);
  });
  addU(limb(M.skin, 0.12, [0.05, 0.048, 0.045]), 0, 0.6, 0);
  const head = new THREE.Group(); head.position.set(0, 0.66 - PV, 0); upper.add(head);
  const hd = ell(M.skin, 0.085, 0.105, 0.095); hd.position.set(0, 0.13, 0.02); head.add(hd);
  const jaw = ell(M.skin, 0.06, 0.04, 0.06); jaw.position.set(0, 0.06, 0.05); head.add(jaw);

  const add = (m) => { scene.add(m); return m; };
  const arms = SIDES.map(() => ({
    up: add(limb(M.skin, UA, [0.052, 0.05, 0.042, 0.038])), fore: add(limb(M.skin, FA, [0.04, 0.042, 0.032, 0.026])),
    elbow: add(ell(M.skin, 0.038, 0.038, 0.038)), hand: add(ell(M.skin, 0.032, 0.042, 0.03)), delt: add(ell(M.skin, 0.064, 0.064, 0.064)),
    fd: add(ell(mat("frontDelt"), 0.04, 0.062, 0.036)), sd: add(ell(mat("sideDelt"), 0.04, 0.062, 0.036)), rd: add(ell(mat("rearDelt"), 0.04, 0.062, 0.036)),
    bi: add(ell(mat("biceps"), 0.036, 0.1, 0.036)), tri: add(ell(mat("triceps"), 0.036, 0.11, 0.036)), fa: add(ell(mat("forearms"), 0.036, 0.1, 0.034)),
    H: V(0, 0, 0), dir: V(0, -1, 0),
  }));
  const legs = SIDES.map(() => ({
    th: add(limb(M.skin, LT, [0.085, 0.08, 0.062, 0.05])), sh: add(limb(M.skin, LS, [0.05, 0.055, 0.042, 0.034])),
    knee: add(ell(M.skin, 0.05, 0.05, 0.05)), foot: add(ell(M.skin2, 0.04, 0.03, 0.11)),
    q: add(ell(mat("quads"), 0.066, 0.17, 0.058)), hm: add(ell(mat("hamstrings"), 0.058, 0.16, 0.052)), cf: add(ell(mat("calves"), 0.044, 0.11, 0.046)),
  }));

  const R = {
    body(pos, pitch, opt) {
      opt = opt || {};
      root.position.copy(pos); root.rotation.set(pitch, opt.yaw || 0, 0);
      upper.rotation.x = opt.crunch || 0; head.rotation.x = opt.head || 0;
      root.updateMatrixWorld(true);
    },
    L: (v) => root.localToWorld(v.clone()),
    U: (v) => upper.localToWorld(V(v.x, v.y - PV, v.z)),
    dirL: (v) => v.clone().transformDirection(root.matrixWorld),
    dirU: (v) => v.clone().transformDirection(upper.matrixWorld),
    S: (i) => upper.localToWorld(V(SIDES[i] * 0.2, 0.55 - PV, 0)),
    hip: (i) => root.localToWorld(V(SIDES[i] * 0.085, -0.02, 0.03)),
    hand: (i) => arms[i].H.clone(),
    handDir: (i) => arms[i].dir.clone(),
    arm(i, H, pole) {
      const a = arms[i], s = SIDES[i], S = R.S(i), r = ik(S, H, UA, FA, pole);
      aim(a.up, S, r.elbow); aim(a.fore, r.elbow, r.hand);
      a.elbow.position.copy(r.elbow);
      const fdir = r.hand.clone().sub(r.elbow).normalize(), adir = r.elbow.clone().sub(S).normalize();
      a.H.copy(r.hand); a.dir.copy(fdir);
      a.hand.position.copy(r.hand).addScaledVector(fdir, 0.03); a.hand.quaternion.copy(a.fore.quaternion);
      const fw = R.dirU(V(0, 0, 1)), out = R.dirU(V(s, 0, 0));
      a.delt.position.copy(S).addScaledVector(adir, 0.02);
      [[a.fd, fw, 1], [a.sd, out, 1], [a.rd, fw, -1]].forEach(([m, d, k]) => { m.position.copy(S).addScaledVector(d, 0.045 * k).addScaledVector(adir, 0.04); m.quaternion.copy(a.up.quaternion); });
      a.bi.position.copy(S).addScaledVector(adir, 0.16).addScaledVector(r.back, -0.03); a.bi.quaternion.copy(a.up.quaternion);
      a.tri.position.copy(S).addScaledVector(adir, 0.15).addScaledVector(r.back, 0.03); a.tri.quaternion.copy(a.up.quaternion);
      a.fa.position.copy(r.elbow).addScaledVector(fdir, 0.09).addScaledVector(r.back, -0.012); a.fa.quaternion.copy(a.fore.quaternion);
    },
    leg(i, A, pole, footDir) {
      const l = legs[i], Hp = R.hip(i), r = ik(Hp, A, LT, LS, pole);
      aim(l.th, Hp, r.elbow); aim(l.sh, r.elbow, r.hand); l.knee.position.copy(r.elbow);
      const tdir = r.elbow.clone().sub(Hp).normalize(), sdir = r.hand.clone().sub(r.elbow).normalize();
      l.q.position.copy(Hp).addScaledVector(tdir, 0.22).addScaledVector(r.back, 0.035); l.q.quaternion.copy(l.th.quaternion);
      l.hm.position.copy(Hp).addScaledVector(tdir, 0.22).addScaledVector(r.back, -0.035); l.hm.quaternion.copy(l.th.quaternion);
      l.cf.position.copy(r.elbow).addScaledVector(sdir, 0.13).addScaledVector(r.back, -0.03); l.cf.quaternion.copy(l.sh.quaternion);
      const fd = (footDir || V(0, 0, 1)).clone().normalize();
      l.foot.position.copy(r.hand).addScaledVector(fd, 0.065).addScaledVector(sdir, 0.03);
      l.foot.quaternion.setFromUnitVectors(V(0, 0, 1), fd);
    },
    // both feet planted on the floor
    stand(width, z) {
      SIDES.forEach((s, i) => R.leg(i, V(s * width, 0.08, z || 0.02), V(s * 0.15, 0, 1), V(s * 0.15, 0, 1)));
    },
  };
  return R;
}

/* ---------- exercises ----------
   Each: work (muscles in red), target (camera aim), k (camera distance), back (camera starts behind),
   tl (timeline: [label, seconds, p from, p to]), build(scene, M, R) → update(p). */
const rep = (a, b, c, d, t) => { t = t || [0.4, 1.8, 0.3, 1.0]; return [[a, t[0], 0, 0], [b, t[1], 0, 1], [c, t[2], 1, 1], [d, t[3], 1, 0]]; };
const STAND = 0.95;
const mid2 = (R) => R.hand(0).add(R.hand(1)).multiplyScalar(0.5);
function curlArms(R, p) {
  SIDES.forEach((s, i) => {
    const S = R.S(i), E = S.clone().add(V(s * 0.02, -UA + 0.01, 0.03)), ang = mix(8, 135, p) * DEG;
    R.arm(i, V(s * 0.17, E.y - Math.cos(ang) * FA, E.z + Math.sin(ang) * FA), V(s * 0.1, -0.3, -1));
  });
}
function hangBar(scene, M) {
  barbell(scene, M, 1.2, 0).at(V(0, 2.25, 0));
  SIDES.forEach((s) => box(scene, M.frame, 0.06, 2.3, 0.06, s * 0.6, 1.15, 0));
}

const EX = {
  "incline-db-press": {
    work: ["upperChest", "frontDelt", "triceps"], target: V(0, 0.62, -0.08), k: 1.5,
    tl: rep("Squeeze at the top", "Lower for 2 seconds", "Feel the stretch", "Press up and in", [0.5, 2.0, 0.35, 1.0]),
    build(scene, M, R) {
      bench(scene, M, 30); const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        R.body(onBench(30, 0), -60 * DEG);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.22, 0.08, 0.42), V(0, 1, 0.3)));
        const fwd = R.dirL(V(0, 0, 1)), spine = R.dirL(V(0, 1, 0));
        SIDES.forEach((s, i) => {
          const S = R.S(i), top = S.clone().add(V(-s * 0.075, 0.55, 0.08)), bot = R.L(V(s * 0.3, 0.47, 0.1));
          const H = lerpV(top, bot, p).add(V(s * 0.03 * Math.sin(p * Math.PI), 0, 0));
          R.arm(i, H, V(s * 0.55, 0, 0).addScaledVector(fwd, -1).addScaledVector(spine, -0.75));
          db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03));
        });
      };
    },
  },
  "bench": {
    work: ["chest", "upperChest", "frontDelt", "triceps"], target: V(0, 0.6, -0.15), k: 1.55,
    tl: rep("Bar over your chest", "Lower to mid-chest", "Touch, don't bounce", "Press back up", [0.4, 1.8, 0.25, 1.0]),
    build(scene, M, R) {
      bench(scene, M, 0); const bar = barbell(scene, M, 1.6, 0.2);
      box(scene, M.frame, 0.05, 1.05, 0.05, -0.55, 0.52, -0.42); box(scene, M.frame, 0.05, 1.05, 0.05, 0.55, 0.52, -0.42);
      return (p) => {
        R.body(V(0, 0.6, 0.15), -90 * DEG);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.26, 0.08, 0.62), V(0, 1, 0.2), V(s * 0.2, 0, 1)));
        SIDES.forEach((s, i) => R.arm(i, lerpV(V(s * 0.25, 1.15, -0.36), V(s * 0.27, 0.82, -0.26), p), V(s * 0.8, -0.6, 0.5)));
        bar.at(mid2(R).add(V(0, 0.02, 0)));
      };
    },
  },
  "seated-db-shoulder-press": {
    work: ["frontDelt", "sideDelt", "triceps"], target: V(0, 1.1, -0.05), k: 1.6,
    tl: rep("Arms long overhead", "Lower to ear level", "Pause", "Press straight up", [0.4, 1.8, 0.3, 1.0]),
    build(scene, M, R) {
      bench(scene, M, 80); const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        R.body(onBench(80, 0.09), -10 * DEG);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.22, 0.08, 0.5), V(s * 0.2, 0.3, 1), V(s * 0.2, 0, 1)));
        SIDES.forEach((s, i) => { R.arm(i, lerpV(V(s * 0.16, 1.68, -0.06), V(s * 0.33, 1.2, -0.02), p), V(s, -0.3, 0.3)); db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03)); });
      };
    },
  },
  "pull-up": {
    work: ["lats", "upperBack", "biceps"], target: V(0, 1.55, 0), k: 2.0, back: true,
    tl: rep("Dead hang, shoulders down", "Pull your chest to the bar", "Chin over", "Lower all the way", [0.5, 1.0, 0.35, 1.8]),
    build(scene, M, R) {
      hangBar(scene, M);
      return (p) => {
        const pos = lerpV(V(0, 1.13, -0.03), V(0, 1.52, -0.1), p);
        R.body(pos, mix(-0.04, -0.2, p), { head: mix(0, -0.2, p) });
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.3, 2.25, 0), V(s * 0.8, -1, 0.35)));
        SIDES.forEach((s, i) => R.leg(i, pos.clone().add(V(s * 0.06, -0.8, -0.2)), V(0, 0, 1), V(0, -1, 0.4)));
      };
    },
  },
  "chest-supported-row": {
    work: ["upperBack", "lats", "rearDelt", "biceps"], target: V(0, 0.62, 0.1), k: 1.7, back: true,
    tl: rep("Arms long, chest on the pad", "Drive elbows back", "Squeeze your shoulder blades", "Lower slowly", [0.4, 1.0, 0.4, 1.8]),
    build(scene, M, R) {
      bench(scene, M, 40, true); const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        const a = 40 * DEG, n = V(0, Math.cos(a), -Math.sin(a)), up = V(0, Math.sin(a), Math.cos(a));
        R.body(V(0, 0.5, 0.07).addScaledVector(up, -0.02).addScaledVector(n, 0.15), 50 * DEG, { head: -0.3 });
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.3, 0.08, -0.45), V(s * 0.3, 0.3, -1), V(s * 0.2, 0, 1)));
        SIDES.forEach((s, i) => {
          const S = R.S(i);
          R.arm(i, lerpV(V(s * 0.21, S.y - 0.57, S.z + 0.02), V(s * 0.24, S.y - 0.3, S.z - 0.24), p), V(s * 0.3, 0.2, -1));
          db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03), V(0, 0, 1));
        });
      };
    },
  },
  "cable-lateral-raise": {
    work: ["sideDelt"], target: V(0, 1.15, 0), k: 2.0,
    tl: rep("Hand by your hip", "Raise out wide", "Pause at shoulder height", "Lower for 2 seconds", [0.3, 1.0, 0.3, 2.0]),
    build(scene, M, R) {
      tower(scene, M, -0.62, 0, 2.1); const pl = pulley(scene, M, V(-0.55, 0.22, 0)), c = cable(scene, M);
      const handle = cylX(M.iron, 0.016, 0.12); scene.add(handle);
      return (p) => {
        R.body(V(0, STAND, 0), 0.08);
        R.stand(0.13);
        R.arm(0, V(-0.47, 1.22, 0.06), V(-0.2, -1, -0.5));
        R.arm(1, lerpV(V(0.06, 0.98, 0.17), V(0.74, 1.48, 0.1), p), V(0.2, 0.4, -1));
        handle.position.copy(R.hand(1)); c.set(pl, R.hand(1));
      };
    },
  },
  "db-lateral-raise": {
    work: ["sideDelt"], target: V(0, 1.15, 0), k: 2.0,
    tl: rep("Bells by your sides", "Raise out wide", "Pause at shoulder height", "Lower for 2 seconds", [0.3, 1.0, 0.3, 2.0]),
    build(scene, M, R) {
      const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        R.body(V(0, STAND, 0), 0.08);
        R.stand(0.13);
        SIDES.forEach((s, i) => { R.arm(i, lerpV(V(s * 0.24, 0.96, 0.12), V(s * 0.75, 1.47, 0.1), p), V(s * 0.2, 0.4, -1)); db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03), V(0, 0, 1)); });
      };
    },
  },
  "incline-db-curl": {
    work: ["biceps"], target: V(0, 0.8, -0.12), k: 1.6,
    tl: rep("Arms hang straight down", "Curl up, elbows still", "Squeeze", "Lower for 2 seconds", [0.4, 1.0, 0.35, 2.0]),
    build(scene, M, R) {
      bench(scene, M, 55); const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        R.body(onBench(55, 0.06), -35 * DEG);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.22, 0.08, 0.5), V(s * 0.2, 0.3, 1), V(s * 0.2, 0, 1)));
        SIDES.forEach((s, i) => {
          const S = R.S(i), E = S.clone().add(V(s * 0.02, -UA, 0.02)), ang = mix(0, 125 * DEG, p);
          R.arm(i, E.clone().add(V(0, -Math.cos(ang) * FA, Math.sin(ang) * FA)), V(0, -0.3, -1));
          db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03));
        });
      };
    },
  },
  "overhead-cable-triceps": {
    work: ["triceps"], target: V(0, 1.35, 0.15), k: 2.0,
    tl: rep("Deep stretch behind your head", "Extend arms forward", "Lock out and squeeze", "Bend back slowly", [0.3, 1.0, 0.35, 1.8]),
    build(scene, M, R) {
      tower(scene, M, 0, -0.75, 2.1); const pl = pulley(scene, M, V(0, 1.3, -0.66)), c = cable(scene, M);
      const rope = cylX(M.cable, 0.018, 0.16); scene.add(rope);
      return (p) => {
        R.body(V(0, 0.93, 0.05), 0.32);
        R.leg(0, V(-0.12, 0.08, 0.38), V(-0.1, 0, 1)); R.leg(1, V(0.12, 0.08, -0.28), V(0.1, 0, 1));
        const dir = V(0, 0.62, 0.78).normalize();
        SIDES.forEach((s, i) => {
          const S = R.S(i), E = S.clone().addScaledVector(dir, UA).add(V(-s * 0.06, 0, 0)), ang = mix(150, 8, p) * DEG;
          const H = E.clone().addScaledVector(dir, Math.cos(ang) * FA).add(V(0, -Math.sin(ang) * FA * 0.5, -Math.sin(ang) * FA * 0.85));
          R.arm(i, H, V(-s * 0.2, 0.7, 0.7));
        });
        const m = mid2(R); rope.position.copy(m); c.set(pl, m);
      };
    },
  },
  "squat": {
    work: ["quads", "glutes"], target: V(0, 0.95, -0.05), k: 2.1,
    tl: rep("Brace, stand tall", "Sit down between your heels", "Hips to knee height", "Drive up", [0.4, 1.8, 0.3, 1.0]),
    build(scene, M, R) {
      const bar = barbell(scene, M, 1.8, 0.22);
      return (p) => {
        R.body(lerpV(V(0, STAND, 0), V(0, 0.52, -0.24), p), mix(0.08, 0.6, p));
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.17, 0.08, 0.05), V(s * 0.35, 0, 1), V(s * 0.3, 0, 1)));
        bar.at(R.U(V(0, 0.6, -0.11)));
        SIDES.forEach((s, i) => R.arm(i, R.U(V(s * 0.36, 0.6, -0.08)), R.dirU(V(s * 0.3, -1, -0.5))));
      };
    },
  },
  "rdl": {
    work: ["hamstrings", "glutes", "lowerBack"], target: V(0, 0.8, 0.05), k: 2.0, back: true,
    tl: rep("Stand tall, soft knees", "Push hips back", "Stretch in the hamstrings", "Squeeze glutes to stand", [0.4, 1.8, 0.3, 1.0]),
    build(scene, M, R) {
      const bar = barbell(scene, M, 1.8, 0.22);
      return (p) => {
        R.body(lerpV(V(0, STAND, 0), V(0, 0.86, -0.2), p), mix(0.04, 1.2, p));
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.13, 0.08, 0.04), V(0, 0, 1)));
        SIDES.forEach((s, i) => { const S = R.S(i); R.arm(i, V(s * 0.21, S.y - 0.575, S.z + 0.03), V(s * 0.3, 0, -1)); });
        bar.at(mid2(R));
      };
    },
  },
  "leg-extension": {
    work: ["quads"], target: V(0, 0.65, 0.2), k: 1.6,
    tl: rep("Knees bent, back on the pad", "Kick up until straight", "Squeeze your quads", "Lower for 2 seconds", [0.3, 1.0, 0.5, 2.0]),
    build(scene, M, R) {
      seat(scene, M, 0.47, 0.12, true); const roll = cylX(M.pad, 0.045, 0.36); scene.add(roll);
      const arm = SIDES.map(() => box(scene, M.frame, 0.03, 0.03, 1, 0, 0, 0));
      return (p) => {
        R.body(V(0, 0.6, -0.06), -0.12);
        const ang = mix(5, 82, p) * DEG;
        SIDES.forEach((s, i) => {
          const K = R.hip(i).add(V(s * 0.02, -0.02, LT - 0.01));
          R.leg(i, K.clone().add(V(0, -Math.cos(ang) * LS, Math.sin(ang) * LS)), V(0, 1, 0), V(0, Math.sin(ang), Math.cos(ang) * 0.3 + 0.2));
        });
        const K = R.hip(1).add(V(0, -0.02, LT)), rp = V(0, K.y - Math.cos(ang) * (LS - 0.05), K.z + Math.sin(ang) * (LS - 0.05) + 0.05);
        roll.position.copy(rp);
        SIDES.forEach((s, i) => { const a = V(s * 0.2, K.y, K.z), b = V(s * 0.2, rp.y, rp.z); arm[i].position.copy(a).lerp(b, 0.5); arm[i].scale.z = a.distanceTo(b); arm[i].quaternion.setFromUnitVectors(V(0, 0, 1), b.clone().sub(a).normalize()); });
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.24, 0.55, 0.12), V(s * 0.3, -0.3, -1)));
      };
    },
  },
  "seated-leg-curl": {
    work: ["hamstrings"], target: V(0, 0.65, 0.2), k: 1.6,
    tl: rep("Legs straight, pad on your heels", "Curl heels under you", "Squeeze", "Let it back up slowly", [0.3, 1.0, 0.4, 2.0]),
    build(scene, M, R) {
      seat(scene, M, 0.47, 0.12, true); const roll = cylX(M.pad, 0.045, 0.36), tpad = cylX(M.pad, 0.05, 0.4);
      scene.add(roll); scene.add(tpad);
      return (p) => {
        R.body(V(0, 0.6, -0.06), -0.18);
        const ang = mix(80, -25, p) * DEG;
        SIDES.forEach((s, i) => {
          const K = R.hip(i).add(V(s * 0.02, -0.02, LT - 0.01));
          R.leg(i, K.clone().add(V(0, -Math.cos(ang) * LS, Math.sin(ang) * LS)), V(0, 1, 0), V(0, Math.sin(ang) + 0.3, 0.6));
        });
        const K = R.hip(1).add(V(0, -0.02, LT)), r = LS - 0.03;
        roll.position.set(0, K.y - Math.cos(ang) * r - 0.05, K.z + Math.sin(ang) * r - 0.03);
        tpad.position.set(0, K.y + 0.1, K.z - 0.12);
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.24, 0.55, 0.12), V(s * 0.3, -0.3, -1)));
      };
    },
  },
  "standing-calf-raise": {
    work: ["calves"], target: V(0, 0.75, 0.05), k: 2.0, back: true,
    tl: rep("Heels down, pause", "Push up onto your toes", "Squeeze at the top", "Lower slowly", [1.0, 0.9, 0.4, 1.5]),
    build(scene, M, R) {
      box(scene, M.pad, 0.7, 0.1, 0.22, 0, 0.05, 0.05);
      const rail = cylX(M.frame, 0.016, 0.9); rail.position.set(0, 1.05, 0.42); scene.add(rail);
      SIDES.forEach((s) => box(scene, M.frame, 0.04, 1.05, 0.04, s * 0.45, 0.525, 0.42));
      return (p) => {
        const ay = mix(0.15, 0.25, p), ang = mix(-25, 40, p) * DEG;
        R.body(V(0, ay + 0.83, -0.02), 0.05);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.12, ay, -0.03), V(s * 0.1, 0, 1), V(0, -Math.sin(ang), Math.cos(ang))));
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.26, 1.05, 0.42), V(s * 0.3, -1, -0.3)));
      };
    },
  },
  "cable-crunch": {
    work: ["abs", "obliques"], target: V(0, 0.65, 0.15), k: 1.8, angle: V(1.95, 0.7, -0.45),
    tl: rep("Rope by your head, hips still", "Curl your ribs to your hips", "Squeeze your abs hard", "Uncurl slowly", [0.3, 1.0, 0.5, 1.6]),
    build(scene, M, R) {
      tower(scene, M, 0, 0.75, 2.1); const pl = pulley(scene, M, V(0, 2.0, 0.66)), c = cable(scene, M);
      const rope = cylX(M.cable, 0.018, 0.16); scene.add(rope);
      box(scene, M.pad, 0.5, 0.03, 0.4, 0, 0.015, -0.05);
      return (p) => {
        R.body(V(0, 0.55, 0.02), mix(0.3, 0.55, p), { crunch: mix(0, 0.85, p), head: mix(0, 0.2, p) });
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.12, 0.08, -0.4), V(0, -1, 1), V(0, -0.3, -1)));
        SIDES.forEach((s, i) => R.arm(i, R.U(V(s * 0.09, 0.8, 0.12)), R.dirU(V(s * 0.3, -0.3, 1))));
        const m = mid2(R); rope.position.copy(m); c.set(pl, m);
      };
    },
  },
  "neutral-pulldown": {
    work: ["lats", "biceps"], target: V(0, 1.2, 0.1), k: 2.0, back: true,
    tl: rep("Arms long, feel the stretch", "Pull elbows down to your sides", "Squeeze your lats", "Let it rise slowly", [0.4, 1.0, 0.35, 1.8]),
    build(scene, M, R) {
      seat(scene, M, 0.47, 0.05, false); tower(scene, M, 0, 0.62, 2.4);
      const pl = pulley(scene, M, V(0, 2.3, 0.5)), c = cable(scene, M), tpad = cylX(M.pad, 0.05, 0.42);
      tpad.position.set(0, 0.68, 0.36); scene.add(tpad);
      const handle = new THREE.Group(); SIDES.forEach((s) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 12), M.iron); h.position.x = s * 0.07; handle.add(h); }); scene.add(handle);
      return (p) => {
        R.body(V(0, 0.6, 0.02), mix(-0.1, -0.22, p));
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.16, 0.08, 0.5), V(0, 0.5, 1), V(s * 0.1, 0, 1)));
        SIDES.forEach((s, i) => R.arm(i, lerpV(V(s * 0.07, 1.7, 0.18), V(s * 0.07, 1.2, 0.2), p), V(s * 0.6, -1, 0.1)));
        const m = mid2(R); handle.position.copy(m); c.set(pl, m);
      };
    },
  },
  "low-high-fly": {
    work: ["upperChest", "frontDelt"], target: V(0, 1.15, 0.05), k: 2.1,
    tl: rep("Hands low and wide", "Sweep up and in", "Hands meet at chin height", "Lower slowly", [0.3, 1.0, 0.4, 1.8]),
    build(scene, M, R) {
      const pl = SIDES.map((s) => { tower(scene, M, s * 0.9, -0.05, 2.1); return pulley(scene, M, V(s * 0.83, 0.3, -0.05)); });
      const cs = SIDES.map(() => cable(scene, M)), hs = SIDES.map(() => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.11, 12), M.iron); scene.add(h); return h; });
      return (p) => {
        R.body(V(0, STAND, 0), 0.12);
        R.leg(0, V(-0.13, 0.08, 0.2), V(-0.1, 0, 1)); R.leg(1, V(0.13, 0.08, -0.15), V(0.1, 0, 1));
        SIDES.forEach((s, i) => { R.arm(i, lerpV(V(s * 0.48, 0.98, 0.14), V(s * 0.08, 1.5, 0.48), p), V(s * 1, -0.6, -0.2)); hs[i].position.copy(R.hand(i)); cs[i].set(pl[i], R.hand(i)); });
      };
    },
  },
  "wide-cable-row": {
    work: ["upperBack", "rearDelt", "lats"], target: V(0, 0.8, 0.3), k: 2.0, back: true,
    tl: rep("Arms long, lean slightly forward", "Pull to your upper belly", "Squeeze shoulder blades", "Reach forward slowly", [0.3, 1.0, 0.4, 1.8]),
    build(scene, M, R) {
      box(scene, M.pad, 0.32, 0.06, 1.0, 0, 0.4, 0.05); box(scene, M.frame, 0.06, 0.37, 0.06, 0, 0.185, 0.05);
      tower(scene, M, 0, 1.25, 1.6); const pl = pulley(scene, M, V(0, 0.5, 1.15)), c = cable(scene, M);
      box(scene, M.frame, 0.5, 0.3, 0.06, 0, 0.3, 0.78, 0.25);
      const bar = barbell(scene, M, 0.85, 0);
      return (p) => {
        R.body(V(0, 0.54, 0.0), mix(0.2, -0.08, p));
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.15, 0.3, 0.7), V(s * 0.3, 1, 0.2), V(0, 0.5, 1)));
        SIDES.forEach((s, i) => R.arm(i, lerpV(V(s * 0.3, 0.98, 0.64), V(s * 0.33, 0.95, 0.24), p), V(s * 1, 0.2, -0.6)));
        const m = mid2(R); bar.at(m); c.set(pl, m);
      };
    },
  },
  "reverse-pec-deck": {
    work: ["rearDelt", "upperBack"], target: V(0, 1.05, 0.05), k: 2.0, back: true,
    tl: rep("Hands together in front", "Open arms wide", "Squeeze rear shoulders", "Bring them back slowly", [0.3, 1.0, 0.4, 1.8]),
    build(scene, M, R) {
      seat(scene, M, 0.47, 0.0, false);
      box(scene, M.pad, 0.34, 0.5, 0.08, 0, 1.0, 0.24); box(scene, M.frame, 0.08, 1.9, 0.08, 0, 0.95, 0.4);
      const hs = SIDES.map(() => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 12), M.iron); scene.add(h); return h; });
      return (p) => {
        R.body(V(0, 0.6, -0.02), 0.08);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.18, 0.08, 0.38), V(s * 0.2, 0.4, 1), V(s * 0.15, 0, 1)));
        SIDES.forEach((s, i) => { R.arm(i, lerpV(V(s * 0.1, 1.12, 0.6), V(s * 0.76, 1.12, 0.1), p), V(s * 0.3, 0.4, -1)); hs[i].position.copy(R.hand(i)); });
      };
    },
  },
  "ez-curl": {
    work: ["biceps", "forearms"], target: V(0, 1.15, 0.05), k: 2.0,
    tl: rep("Bar at your thighs", "Curl up, elbows pinned", "Squeeze", "Lower for 2 seconds", [0.3, 1.0, 0.35, 2.0]),
    build(scene, M, R) {
      const bar = barbell(scene, M, 1.25, 0.15);
      return (p) => { R.body(V(0, STAND, 0), 0.04); R.stand(0.13); curlArms(R, p); bar.at(mid2(R)); };
    },
  },
  "cable-curl": {
    work: ["biceps", "forearms"], target: V(0, 1.1, 0.15), k: 2.0,
    tl: rep("Arms straight, elbows by your sides", "Curl up", "Squeeze", "Lower for 2 seconds", [0.3, 1.0, 0.35, 2.0]),
    build(scene, M, R) {
      tower(scene, M, 0, 0.78, 2.1); const pl = pulley(scene, M, V(0, 0.15, 0.7)), c = cable(scene, M), bar = barbell(scene, M, 0.5, 0);
      return (p) => { R.body(V(0, STAND, 0), 0.06); R.stand(0.13); curlArms(R, p); const m = mid2(R); bar.at(m); c.set(pl, m); };
    },
  },
  "triceps-pushdown": {
    work: ["triceps"], target: V(0, 1.2, 0.15), k: 2.0, back: true,
    tl: rep("Elbows pinned at your sides", "Push down until straight", "Squeeze", "Let it up to chest height", [0.3, 0.9, 0.4, 1.6]),
    build(scene, M, R) {
      tower(scene, M, 0, 0.62, 2.3); const pl = pulley(scene, M, V(0, 2.1, 0.54)), c = cable(scene, M), bar = barbell(scene, M, 0.45, 0);
      return (p) => {
        R.body(V(0, STAND, 0), 0.16); R.stand(0.13);
        SIDES.forEach((s, i) => {
          const S = R.S(i), E = S.clone().add(V(s * 0.02, -UA + 0.02, -0.02)), ang = mix(105, 8, p) * DEG;
          R.arm(i, V(s * 0.12, E.y - Math.cos(ang) * FA, E.z + Math.sin(ang) * FA), V(0, -0.3, -1));
        });
        const m = mid2(R); bar.at(m); c.set(pl, m);
      };
    },
  },
  "dips": {
    work: ["chest", "triceps", "frontDelt"], target: V(0, 1.3, 0), k: 2.1,
    tl: rep("Arms locked, lean slightly forward", "Lower until shoulders reach elbows", "Stretch", "Press back up", [0.3, 1.6, 0.3, 1.0]),
    build(scene, M, R) {
      SIDES.forEach((s) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.7, 14), M.frame); b.rotation.x = Math.PI / 2; b.position.set(s * 0.3, 1.3, 0); scene.add(b); box(scene, M.frame, 0.05, 1.3, 0.05, s * 0.3, 0.65, -0.33); box(scene, M.frame, 0.05, 1.3, 0.05, s * 0.3, 0.65, 0.33); });
      return (p) => {
        const pos = lerpV(V(0, 1.3, -0.02), V(0, 0.98, -0.07), p);
        R.body(pos, mix(0.14, 0.38, p));
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.3, 1.33, 0), V(0, 0.3, -1)));
        SIDES.forEach((s, i) => R.leg(i, pos.clone().add(V(s * 0.04, -0.72, -0.32)), V(0, 0, 1), V(0, -1, 0.2)));
      };
    },
  },
  "leg-press": {
    work: ["quads", "glutes"], target: V(0, 0.72, 0.1), k: 2.3, angle: V(1.9, 0.85, -0.55),
    tl: rep("Legs almost straight", "Lower the sled toward your chest", "Knees deep, back flat", "Press through your heels", [0.3, 1.8, 0.3, 1.0]),
    build(scene, M, R) {
      box(scene, M.pad, 0.4, 0.07, 0.42, 0, 0.36, -0.05); box(scene, M.pad, 0.4, 0.8, 0.07, 0, 0.62, -0.42, -0.9);
      box(scene, M.frame, 0.6, 0.05, 1.7, 0, 0.025, 0.4);
      const dir = V(0, 0.707, 0.707);
      SIDES.forEach((s) => box(scene, M.frame, 0.05, 0.05, 1.5, s * 0.36, 0.95, 0.95, -Math.PI / 4));
      const plate = box(scene, M.pad, 0.6, 0.62, 0.05, 0, 0, 0, -Math.PI / 4);
      return (p) => {
        R.body(V(0, 0.5, -0.1), -62 * DEG);
        const base = R.hip(1).setX(0), d = mix(0.84, 0.38, p), F = base.clone().addScaledVector(dir, d).add(V(0, 0.1, 0.06));
        plate.position.copy(F).addScaledVector(V(0, -0.707, 0.707), 0.06).addScaledVector(dir, 0.06);
        SIDES.forEach((s, i) => R.leg(i, F.clone().add(V(s * 0.16, 0, 0)), V(s * 0.25, 1, -0.4), dir));
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.3, 0.42, 0.0), V(s * 0.3, -0.3, -1)));
      };
    },
  },
  "lying-leg-curl": {
    work: ["hamstrings"], target: V(0, 0.75, -0.1), k: 1.9,
    tl: rep("Legs straight, hips pressed down", "Curl heels to your glutes", "Squeeze", "Lower for 2 seconds", [0.3, 1.0, 0.4, 2.0]),
    build(scene, M, R) {
      box(scene, M.pad, 0.34, 0.08, 1.25, 0, 0.56, 0.2); box(scene, M.frame, 0.06, 0.52, 0.06, 0, 0.26, 0.55); box(scene, M.frame, 0.06, 0.52, 0.06, 0, 0.26, -0.3);
      box(scene, M.frame, 0.6, 0.04, 1.4, 0, 0.02, 0.1);
      const roll = cylX(M.pad, 0.045, 0.36); scene.add(roll);
      return (p) => {
        R.body(V(0, 0.71, -0.24), 88 * DEG, { head: -0.4 });
        const ang = mix(4, 115, p) * DEG;
        SIDES.forEach((s, i) => {
          const K = R.hip(i).add(V(s * 0.015, -0.02, -LT + 0.01));
          R.leg(i, K.clone().add(V(0, Math.sin(ang) * LS, -Math.cos(ang) * LS)), V(0, -1, 0), V(0, -Math.cos(ang) - 0.3, -Math.sin(ang)));
        });
        const K = R.hip(1).add(V(0, -0.02, -LT)), r = LS - 0.04;
        roll.position.set(0, K.y + Math.sin(ang) * r + 0.05 * Math.cos(ang), K.z - Math.cos(ang) * r + 0.05 * Math.sin(ang));
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.24, 0.62, 0.85), V(s * 0.6, 0.6, 0)));
      };
    },
  },
  "bulgarian-split-squat": {
    work: ["quads", "glutes"], target: V(0, 0.75, -0.1), k: 2.1,
    tl: rep("Tall, weight on the front foot", "Sink straight down", "Back knee near the floor", "Drive up through the front heel", [0.3, 1.8, 0.3, 1.0]),
    build(scene, M, R) {
      box(scene, M.pad, 0.34, 0.07, 0.6, 0, 0.45, -0.85); box(scene, M.frame, 0.06, 0.42, 0.06, 0, 0.21, -0.85);
      const db = SIDES.map(() => dumbbell(scene, M));
      return (p) => {
        R.body(lerpV(V(0, 0.92, -0.08), V(0, 0.56, -0.16), p), mix(0.12, 0.28, p));
        R.leg(0, V(-0.11, 0.08, 0.32), V(-0.1, 0, 1)); R.leg(1, V(0.11, 0.5, -0.68), V(0, -1, 0.15), V(0, -0.3, -1));
        SIDES.forEach((s, i) => { const S = R.S(i); R.arm(i, V(s * 0.24, S.y - 0.575, S.z + 0.02), V(s * 0.3, 0, -1)); db[i].at(R.hand(i).addScaledVector(R.handDir(i), 0.03), V(0, 0, 1)); });
      };
    },
  },
  "seated-calf-raise": {
    work: ["calves"], target: V(0, 0.5, 0.15), k: 1.6,
    tl: rep("Heels low, pause", "Push up onto your toes", "Squeeze at the top", "Lower slowly", [1.0, 0.9, 0.4, 1.5]),
    build(scene, M, R) {
      seat(scene, M, 0.47, -0.05, false); box(scene, M.pad, 0.5, 0.1, 0.2, 0, 0.05, 0.45);
      const kp = box(scene, M.pad, 0.42, 0.06, 0.16, 0, 0, 0); box(scene, M.frame, 0.06, 0.55, 0.06, 0.28, 0.28, 0.5);
      return (p) => {
        const ay = mix(0.15, 0.24, p), ang = mix(-25, 40, p) * DEG;
        R.body(V(0, 0.6, -0.14), -0.04);
        SIDES.forEach((s, i) => R.leg(i, V(s * 0.12, ay, 0.42), V(0, 1, 0.3), V(0, -Math.sin(ang), Math.cos(ang))));
        const kz = R.hip(1).z + 0.4; kp.position.set(0, ay + LS + 0.08, kz);
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.19, ay + LS + 0.12, kz + 0.02), V(s * 0.3, -1, -0.2)));
      };
    },
  },
  "hanging-leg-raise": {
    work: ["abs", "obliques"], target: V(0, 1.45, 0.1), k: 2.1,
    tl: rep("Dead hang, no swinging", "Lift legs, tilt your pelvis up", "Hold for a second", "Lower for 2 seconds", [0.4, 1.1, 0.5, 2.0]),
    build(scene, M, R) {
      hangBar(scene, M);
      return (p) => {
        R.body(lerpV(V(0, 1.13, -0.03), V(0, 1.16, 0.02), p), mix(-0.04, -0.28, p), { crunch: mix(0, 0.2, p) });
        SIDES.forEach((s, i) => R.arm(i, V(s * 0.3, 2.25, 0), V(s * 0.8, -1, 0.35)));
        const ang = mix(4, 95, p) * DEG;
        SIDES.forEach((s, i) => R.leg(i, R.hip(i).add(V(s * 0.02, -Math.cos(ang) * 0.86, Math.sin(ang) * 0.86)), V(0, 0.3, 1), V(0, Math.sin(ang) * 0.6 - 0.8, 0.6)));
      };
    },
  },
};

export function hasForm3D(id) { return !!EX[id]; }
export const FORM3D_IDS = Object.keys(EX);

/* ---------- mount ---------- */
export function mountForm3D(el, id, opts) {
  opts = opts || {};
  const ex = EX[id]; if (!ex) return null;
  const dark = !!opts.dark;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: !!opts.capture });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x30333a : 0x9aa0a8, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(1.5, 3, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-2, 1.5, -2); scene.add(rim);
  const M = mats(dark);
  const R = makeRig(scene, M, ex.work);
  const update = ex.build(scene, M, R);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(ex.target.x, 0.001, ex.target.z); scene.add(shadow);

  const k = ex.k || 1.6, b = ex.back ? -1 : 1, T = ex.target;
  const views = { angle: T.clone().add(ex.angle ? ex.angle.clone().multiplyScalar(k) : V(1.55 * k, 0.75 * k, 1.4 * k * b)), side: T.clone().add(V(2.2 * k, 0.2 * k, 0)), front: T.clone().add(V(0, 0.35 * k, 2.2 * k * b)) };
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.copy(views[opts.view] || views.angle);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(T); controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
  controls.minPolarAngle = 0.3; controls.maxPolarAngle = 1.55; controls.rotateSpeed = 0.7;
  controls.update();

  function size() { const w = el.clientWidth || 300, h = el.clientHeight || 300; renderer.setSize(w, h, false); renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px"; camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null; if (ro) ro.observe(el);

  const total = ex.tl.reduce((a, s) => a + s[1], 0);
  let playing = true, speed = opts.speed || 1, clock = 0, last = performance.now(), phase = -1, fly = null, raf = 0, disposed = false, hold = null;
  function at(t) {
    let acc = 0;
    for (let i = 0; i < ex.tl.length; i++) {
      const s = ex.tl[i];
      if (t < acc + s[1] || i === ex.tl.length - 1) { const f = Math.min(1, (t - acc) / s[1]); return { i, p: s[2] + (s[3] - s[2]) * ease(f) }; }
      acc += s[1];
    }
  }
  function frame(now) {
    if (disposed) return;
    if (!renderer.domElement.isConnected) { dispose(); return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing) clock = (clock + dt * speed) % total;
    const s = at(clock);
    if (s.i !== phase) { phase = s.i; if (opts.onPhase) opts.onPhase(ex.tl[phase][0], phase); }
    update(hold == null ? s.p : hold);
    if (fly) { fly.t = Math.min(1, fly.t + dt * 1.8); camera.position.lerpVectors(fly.from, fly.to, ease(fly.t)); if (fly.t >= 1) fly = null; }
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
    speed(x) { speed = x; },
    view(name) { const to = views[name]; if (to) fly = { from: camera.position.clone(), to: to.clone(), t: 0 }; },
    hold(p) { hold = p; },
    dispose,
  };
}
