import * as THREE from 'three';
import { STAGES, type Stage } from './stages';

export type HudRefs = {
  kmh: HTMLElement;
  boostFill: HTMLElement;
  boostBar: HTMLElement;
  orbs: HTMLElement;
  zero: HTMLElement;
};

export type FinishResult = { time: number; orbs: number; zeroBest: number | null };

export type GameHooks = {
  onStage: (i: number) => void;
  onToast: (msg: string) => void;
  onFinish: (r: FinishResult) => void;
  /** R was pressed: the page should show the title modal again. */
  onIntro: () => void;
};

export type Fonts = { body: string; mono: string; display: string };

export type ControlKey = 'up' | 'down' | 'left' | 'right' | 'boost' | 'jump';

export type GameApi = {
  start: () => void;
  toIntro: () => void;
  jumpTo: (i: number) => void;
  resume: () => void;
  setKey: (k: ControlKey, down: boolean) => void;
  dispose: () => void;
};

/* ───────────── Track layout ───────────── */
const GAP = 140;
export const stageZ = (i: number) => -60 - i * GAP;
const END_Z = stageZ(STAGES.length - 1) - 130;
const WALL_Z = END_Z - 160;
const ROAD_W = 18;

type Ramp = { x: number; z0: number; len: number; w: number; h: number };
const RAMPS: Ramp[] = [1, 3, 5, 7, 9, 11, 13].map((i, n) => ({
  x: n % 2 ? -3 : 3,
  z0: stageZ(i) - 62,
  len: 15,
  w: 7,
  h: 3.2,
}));
function rampAt(x: number, z: number) {
  for (const r of RAMPS) {
    if (Math.abs(x - r.x) <= r.w / 2 && z <= r.z0 && z >= r.z0 - r.len) return r;
  }
  return null;
}
function heightAt(x: number, z: number) {
  const r = rampAt(x, z);
  return r ? (r.h * (r.z0 - z)) / r.len : 0;
}
export function stageAt(z: number) {
  for (let i = STAGES.length - 1; i >= 0; i--) if (z <= stageZ(i) + 50) return i;
  return -1;
}

/* ───────────── Tuning ───────────── */
const GRAV = 28;
const JUMP_V = 9.5; // tap: about 1.6 m
const JUMP_HOLD_MAX = 1.0; // seconds Space can keep the lift jets on
const JUMP_HOLD_LIFT = 22; // upward accel while held (net -6 m/s² against gravity)
const STEER_RATE = 1.15; // rad/s at full lock on the ground
const ROLL_RATE = 5.5; // rad/s barrel roll in the air, after the McGregor demo's thruster roll: one turn in about 1.1 s
const SAFE_LANDING_ROLL = 0.9; // rad off upright that still lands cleanly
const STEER_RESPONSE = 3.2; // how fast the wheel follows the key (1/s)
const IDLE_ORBIT = 0.16; // rad/s on the title screen

async function fontsReady(f: Fonts) {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`700 72px ${f.body}`, '고태환'),
        document.fonts.load(`400 34px ${f.body}`, '고태환'),
        document.fonts.load(`500 24px ${f.mono}`, 'STAGE'),
      ]),
      new Promise((r) => setTimeout(r, 3500)),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createGame(
  canvas: HTMLCanvasElement,
  hud: HudRefs,
  hooks: GameHooks,
  fonts: Fonts,
): Promise<GameApi> {
  await fontsReady(fonts);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const HORIZON = '#eaa57e';
  scene.fog = new THREE.Fog(HORIZON, 70, 560);
  {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 512;
    const g = c.getContext('2d')!;
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#1b2142');
    gr.addColorStop(0.38, '#5e3f6c');
    gr.addColorStop(0.62, '#c9786f');
    gr.addColorStop(0.8, HORIZON);
    gr.addColorStop(1, HORIZON);
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    scene.background = t;
  }
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1800);

  scene.add(new THREE.HemisphereLight(0xffd8bd, 0x4b3330, 1.0));
  const sun = new THREE.DirectionalLight(0xffc28c, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(70, 48),
    new THREE.MeshBasicMaterial({ color: 0xffe4b5, fog: false }),
  );
  scene.add(sunDisc);

  /* Ground + road */
  const trackLen = 40 - (WALL_Z - 120);
  const trackMid = (40 + WALL_Z - 120) / 2;
  {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, trackLen + 900),
      new THREE.MeshStandardMaterial({ color: 0xc58b62, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = trackMid;
    ground.receiveShadow = true;
    scene.add(ground);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_W, trackLen),
      new THREE.MeshStandardMaterial({ color: 0x2a2a33, roughness: 0.9 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, trackMid);
    road.receiveShadow = true;
    scene.add(road);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf2ebe2 });
    for (const s of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.3, trackLen), lineMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(s * (ROAD_W / 2 - 0.6), 0.02, trackMid);
      scene.add(edge);
    }
    const dashCount = Math.floor(trackLen / 10);
    const dashes = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.28, 3.2),
      new THREE.MeshBasicMaterial({ color: 0xffb54d }),
      dashCount,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    for (let i = 0; i < dashCount; i++) {
      m.compose(new THREE.Vector3(0, 0.02, 40 - i * 10), q, new THREE.Vector3(1, 1, 1));
      dashes.setMatrixAt(i, m);
    }
    scene.add(dashes);
  }

  /* Roadside: factory silhouettes, chimneys, lamp posts */
  {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const count = 170;
    const blocks = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x6d5560, roughness: 0.95 }),
      count,
    );
    const stacks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.5, 0.7, 1, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4652, roughness: 0.9 }),
      50,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const side = rnd() < 0.5 ? -1 : 1;
      const w = 10 + rnd() * 26,
        h = 5 + rnd() * 20,
        d = 10 + rnd() * 30;
      const x = side * (46 + rnd() * 200);
      const z = 60 - rnd() * (trackLen + 100);
      m.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(w, h, d));
      blocks.setMatrixAt(i, m);
      if (i < 50) {
        const sh = h + 8 + rnd() * 16;
        m.compose(new THREE.Vector3(x + w * 0.3, sh / 2, z), q, new THREE.Vector3(1.4, sh, 1.4));
        stacks.setMatrixAt(i, m);
      }
    }
    blocks.receiveShadow = true;
    scene.add(blocks, stacks);

    const poleCount = Math.floor(trackLen / 45) * 2;
    const poles = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.25, 7, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x3a3440 }),
      poleCount,
    );
    const lamps = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.6, 0.25, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
      poleCount,
    );
    for (let i = 0; i < poleCount; i++) {
      const s = i % 2 ? -1 : 1,
        z = 30 - Math.floor(i / 2) * 45;
      m.compose(new THREE.Vector3(s * (ROAD_W / 2 + 2.5), 3.5, z), q, new THREE.Vector3(1, 1, 1));
      poles.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(s * (ROAD_W / 2 + 1.8), 7, z), q, new THREE.Vector3(1, 1, 1));
      lamps.setMatrixAt(i, m);
    }
    scene.add(poles, lamps);
  }

  /* ───────────── Roadster ───────────── */
  const R = (() => {
    const g = new THREE.Group();
    const paint = new THREE.MeshPhysicalMaterial({
      color: 0xc8101f,
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b0d14, metalness: 0.2, roughness: 0.05, clearcoat: 1 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x15161c, roughness: 0.6 });
    const shapeOf = (pts: number[][]) => {
      const s = new THREE.Shape();
      pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
      return s;
    };

    const bodyGeo = new THREE.ExtrudeGeometry(
      shapeOf([
        [-2.3, 0.32],
        [2.15, 0.32],
        [2.38, 0.5],
        [2.2, 0.68],
        [1.1, 0.86],
        [0.45, 0.94],
        [-1.4, 0.98],
        [-2.25, 0.92],
        [-2.36, 0.6],
      ]),
      { depth: 1.86, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 },
    );
    bodyGeo.rotateY(Math.PI / 2);
    bodyGeo.translate(-0.93, 0, 0);
    const body = new THREE.Mesh(bodyGeo, paint);
    body.castShadow = true;
    g.add(body);

    const cabGeo = new THREE.ExtrudeGeometry(
      shapeOf([
        [0.5, 0.9],
        [-0.2, 1.3],
        [-1.05, 1.27],
        [-1.6, 0.97],
      ]),
      { depth: 1.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 },
    );
    cabGeo.rotateY(Math.PI / 2);
    cabGeo.translate(-0.75, 0, 0);
    const cabin = new THREE.Mesh(cabGeo, glass);
    cabin.castShadow = true;
    g.add(cabin);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.06, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    head.position.set(0, 0.66, -2.28);
    g.add(head);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.07, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xff2638 }),
    );
    tail.position.set(0, 0.86, 2.36);
    g.add(tail);
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.3), dark);
    diffuser.position.set(0, 0.4, 2.28);
    g.add(diffuser);

    const wheels: { steerPivot: THREE.Group; spin: THREE.Group; front: boolean }[] = [];
    const tire = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 22);
    tire.rotateZ(Math.PI / 2);
    const rim = new THREE.CylinderGeometry(0.27, 0.27, 0.36, 10);
    rim.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 0.9, roughness: 0.3 });
    for (const [x, z] of [
      [-0.95, -1.42],
      [0.95, -1.42],
      [-0.95, 1.45],
      [0.95, 1.45],
    ]) {
      const steerPivot = new THREE.Group();
      steerPivot.position.set(x, 0.42, z);
      const spin = new THREE.Group();
      const t = new THREE.Mesh(tire, dark);
      t.castShadow = true;
      spin.add(t, new THREE.Mesh(rim, rimMat), new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.5, 0.08), rimMat));
      steerPivot.add(spin);
      g.add(steerPivot);
      wheels.push({ steerPivot, spin, front: z < 0 });
    }

    // SpaceX-package cold-gas thrusters at the rear
    const flames: THREE.Group[] = [];
    const nozzleGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.3, 14);
    nozzleGeo.rotateX(Math.PI / 2);
    const outer = new THREE.ConeGeometry(0.24, 1, 14, 1, true);
    outer.rotateX(Math.PI / 2);
    outer.translate(0, 0, 0.5);
    const inner = new THREE.ConeGeometry(0.12, 0.7, 10, 1, true);
    inner.rotateX(Math.PI / 2);
    inner.translate(0, 0, 0.35);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff8a2a,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x9fe3ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    for (const x of [-0.45, 0.45]) {
      const noz = new THREE.Mesh(nozzleGeo, dark);
      noz.position.set(x, 0.62, 2.42);
      g.add(noz);
      const f = new THREE.Group();
      f.position.set(x, 0.62, 2.55);
      f.add(new THREE.Mesh(outer, flameMat), new THREE.Mesh(inner, coreMat));
      g.add(f);
      flames.push(f);
    }
    // downward lift jets used while jumping
    const lift: THREE.Mesh[] = [];
    const liftGeo = new THREE.ConeGeometry(0.2, 1, 10, 1, true);
    liftGeo.rotateX(Math.PI);
    liftGeo.translate(0, -0.5, 0);
    for (const [x, z] of [
      [-0.7, -0.6],
      [0.7, -0.6],
      [-0.7, 0.9],
      [0.7, 0.9],
    ]) {
      const f = new THREE.Mesh(liftGeo, coreMat);
      f.position.set(x, 0.3, z);
      f.scale.setScalar(0.001);
      g.add(f);
      lift.push(f);
    }
    const light = new THREE.PointLight(0xff8a2a, 0, 12, 2);
    light.position.set(0, 0.8, 3.2);
    g.add(light);
    return { group: g, wheels, flames, lift, light };
  })();
  scene.add(R.group);

  /* ───────────── Billboards ───────────── */
  const drawBoard = (st: Stage, i: number) => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 640;
    const x = c.getContext('2d')!;
    x.fillStyle = '#141722';
    x.fillRect(0, 0, 1024, 640);
    x.fillStyle = '#e8202f';
    x.fillRect(0, 0, 1024, 86);
    x.fillStyle = '#ffffff';
    x.font = `500 28px ${fonts.mono}`;
    x.textBaseline = 'middle';
    x.fillText(`STAGE ${String(i + 1).padStart(2, '0')} / ${STAGES.length}`, 48, 44);
    x.textAlign = 'right';
    x.fillText(st.kicker.toUpperCase(), 976, 44);
    x.textAlign = 'left';
    x.textBaseline = 'alphabetic';
    x.font = `700 70px ${fonts.body}`;
    x.fillStyle = '#f4ede7';
    x.fillText(st.title, 48, 178);
    x.font = `400 30px ${fonts.body}`;
    x.fillStyle = '#b9ada5';
    x.fillText(st.meta, 48, 226);
    x.fillStyle = 'rgba(255,228,210,0.18)';
    x.fillRect(48, 256, 928, 2);
    let y = 318;
    x.font = `400 36px ${fonts.body}`;
    for (const b of st.board) {
      const lines = wrap(x, b, 880).slice(0, 2);
      x.fillStyle = '#ffb54d';
      x.fillRect(48, y - 14, 18, 4);
      x.fillStyle = '#f4ede7';
      lines.forEach((l, k) => x.fillText(l, 84, y + k * 46));
      y += lines.length * 46 + 22;
      if (y > 600) break;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  };
  const postMat = new THREE.MeshStandardMaterial({ color: 0x2b2a33, roughness: 0.7 });
  const gateMat = new THREE.MeshBasicMaterial({ color: 0xe8202f, transparent: true, opacity: 0.55 });
  STAGES.forEach((st, i) => {
    const side = i % 2 ? -1 : 1;
    const g = new THREE.Group();
    const W = 16,
      H = 10;
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: drawBoard(st, i), toneMapped: false }),
    );
    face.position.y = 8.5;
    const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, H + 0.4, 0.3), postMat);
    back.position.set(0, 8.5, -0.2);
    back.castShadow = true;
    g.add(face, back);
    for (const px of [-W / 3, W / 3]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 0.4), postMat);
      p.position.set(px, 1.8, -0.2);
      p.castShadow = true;
      g.add(p);
    }
    g.position.set(side * (ROAD_W / 2 + 9.5), 0, stageZ(i));
    g.rotation.y = -side * 0.42;
    scene.add(g);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 0.7), gateMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.03, stageZ(i) + 20);
    scene.add(line);
  });

  /* Ramps */
  {
    const rampMat = new THREE.MeshStandardMaterial({ color: 0xffb54d, roughness: 0.6 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x141722 });
    for (const r of RAMPS) {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.lineTo(r.len, 0);
      s.lineTo(r.len, r.h);
      s.closePath();
      const geo = new THREE.ExtrudeGeometry(s, { depth: r.w, bevelEnabled: false });
      geo.rotateY(Math.PI / 2);
      geo.translate(-r.w / 2, 0, 0);
      const mesh = new THREE.Mesh(geo, rampMat);
      mesh.position.set(r.x, 0, r.z0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      for (let k = 1; k < 5; k++) {
        const t = k / 5;
        const st = new THREE.Mesh(new THREE.PlaneGeometry(r.w, 0.5), stripeMat);
        st.position.set(r.x, r.h * t + 0.02, r.z0 - r.len * t);
        st.rotation.x = -Math.PI / 2 + Math.atan2(r.h, r.len);
        scene.add(st);
      }
    }
  }

  /* Orbs */
  const orbs: THREE.Mesh[] = [];
  {
    const geo = new THREE.IcosahedronGeometry(0.55, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x86dbff,
      emissive: 0x3fb6ff,
      emissiveIntensity: 1.6,
      roughness: 0.3,
    });
    const add = (x: number, y: number, z: number) => {
      const o = new THREE.Mesh(geo, mat);
      o.position.set(x, y, z);
      o.userData.base = y;
      scene.add(o);
      orbs.push(o);
    };
    for (let i = 0; i < STAGES.length - 1; i++) {
      const z0 = stageZ(i) - 18;
      for (let k = 0; k < 5; k++) add(Math.sin(i * 1.7 + k * 0.7) * 5, 1.2, z0 - k * 7);
    }
    for (const r of RAMPS) for (let k = 0; k < 3; k++) add(r.x, 6.5 + k * 0.8, r.z0 - r.len - 10 - k * 7);
  }

  /* Finish gate + end wall */
  {
    const g = new THREE.Group();
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 0.8), postMat);
      p.position.set(s * (ROAD_W / 2 + 1), 4.5, 0);
      g.add(p);
    }
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 128;
    const x = c.getContext('2d')!;
    for (let i = 0; i < 32; i++)
      for (let j = 0; j < 4; j++) {
        x.fillStyle = (i + j) % 2 ? '#141722' : '#f4ede7';
        x.fillRect(i * 32, j * 32, 32, 32);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W + 2.8, 2, 0.4), new THREE.MeshBasicMaterial({ map: t }));
    bar.position.y = 9;
    g.add(bar);
    g.position.z = END_Z;
    scene.add(g);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 2), new THREE.MeshStandardMaterial({ color: 0xe8202f }));
    wall.position.set(0, 1.5, WALL_Z - 2);
    scene.add(wall);
  }

  /* ───────────── State & input ───────────── */
  const car = {
    x: 0,
    y: 0,
    z: 12,
    yaw: 0,
    roll: 0, // barrel roll angle around the car's length
    rolled: 0, // roll gathered during the current jump
    speed: 0,
    steer: 0,
    vy: 0,
    lastVy: 0,
    onGround: true,
    holding: false,
    holdT: 0,
    energy: 100,
    pitch: 0,
    burst: 0,
  };
  const keys: Record<ControlKey, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
    boost: false,
    jump: false,
  };
  let started = false,
    paused = false,
    finished = false,
    runStart = 0,
    orbCount = 0;
  let zeroArmed = true,
    zeroT0: number | null = null,
    zeroBest: number | null = null;
  let current = -2;
  let shake = 0,
    idleT = 0;

  const clearKeys = () => {
    for (const k in keys) keys[k as ControlKey] = false;
  };

  function pressJump() {
    if (!started || paused) return;
    if (!car.onGround) return;
    car.onGround = false;
    car.vy = JUMP_V;
    car.holding = true;
    car.holdT = 0;
    car.burst = 0.3;
  }
  function placeCar(z: number) {
    Object.assign(car, {
      x: 0,
      y: 0,
      z,
      yaw: 0,
      roll: 0,
      rolled: 0,
      speed: 0,
      steer: 0,
      vy: 0,
      lastVy: 0,
      onGround: true,
      holding: false,
      pitch: 0,
    });
    zeroArmed = true;
    zeroT0 = null;
  }
  function resetRun() {
    placeCar(12);
    for (const o of orbs) o.visible = true;
    orbCount = 0;
    hud.orbs.textContent = '0';
    hud.kmh.textContent = '0';
    hud.boostFill.style.transform = 'scaleX(1)';
    hud.boostBar.classList.remove('low');
    car.energy = 100;
    finished = false;
    paused = false;
    idleT = 0;
    clearKeys();
    setStage(-1);
  }
  function setStage(i: number) {
    if (i === current) return;
    current = i;
    hooks.onStage(i);
  }

  const KEYMAP: Record<string, ControlKey> = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
    ShiftLeft: 'boost',
    ShiftRight: 'boost',
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!started) return;
    const k = KEYMAP[e.code];
    if (k) {
      keys[k] = true;
      e.preventDefault();
    }
    if (e.code === 'Space') {
      e.preventDefault();
      keys.jump = true;
      if (!e.repeat) pressJump();
    }
    if (e.code === 'KeyR' && !e.repeat) {
      api.toIntro();
      hooks.onIntro();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = KEYMAP[e.code];
    if (k) keys[k] = false;
    if (e.code === 'Space') keys.jump = false;
  };
  const onResize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);
  addEventListener('blur', clearKeys);
  addEventListener('resize', onResize);

  /* ───────────── Simulation ───────────── */
  const tmpV = new THREE.Vector3(),
    look = new THREE.Vector3();

  function step(dt: number) {
    const throttle = keys.up ? 1 : 0,
      brake = keys.down ? 1 : 0;
    const steerIn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    car.steer += (steerIn - car.steer) * Math.min(1, dt * STEER_RESPONSE);
    const boosting = keys.boost && car.energy > 1;

    let acc = 0;
    if (boosting) acc += car.onGround ? 40 : 24;
    if (car.onGround) {
      if (throttle) acc += car.speed < 0 ? 30 : 14;
      if (brake) acc -= car.speed > 0.5 ? 34 : 10;
      if (!throttle && !brake && !boosting) acc -= Math.sign(car.speed) * Math.min(Math.abs(car.speed) / dt, 5);
    }
    car.speed += acc * dt;
    const vmax = boosting ? 92 : 52;
    if (car.speed > vmax) car.speed = Math.max(vmax, car.speed - 30 * dt);
    car.speed = Math.max(car.speed, -14);

    if (car.onGround) {
      // full lock fades in from a standstill and eases off a little at top speed
      const sf = Math.min(1, Math.abs(car.speed) / 14) * (1 - Math.min(0.35, Math.abs(car.speed) / 260));
      car.yaw += car.steer * STEER_RATE * sf * Math.sign(car.speed || 1) * (boosting ? 0.8 : 1) * dt;
    } else {
      // in the air ←/→ fire the side thrusters: a barrel roll around the car's length, heading unchanged
      const d = steerIn * ROLL_RATE * dt;
      car.roll += d;
      car.rolled += d;
    }

    car.energy = boosting ? Math.max(0, car.energy - 28 * dt) : Math.min(100, car.energy + 8 * dt);

    car.x -= Math.sin(car.yaw) * car.speed * dt;
    car.z -= Math.cos(car.yaw) * car.speed * dt;
    if (Math.abs(car.x) > 140) {
      car.x = Math.sign(car.x) * 140;
      car.speed *= 0.5;
    }
    if (car.z > 40) {
      car.z = 40;
      car.speed *= 0.3;
    }
    if (car.z < WALL_Z) {
      car.z = WALL_Z;
      car.speed = Math.min(car.speed, 0);
    }

    const g = heightAt(car.x, car.z);
    if (car.onGround) {
      if (g < car.y - 0.05) {
        car.onGround = false;
        car.vy = Math.min(car.lastVy, 24);
        car.holding = false;
      } else {
        car.lastVy = Math.max(0, (g - car.y) / dt);
        car.y = g;
      }
    }
    if (!car.onGround) {
      // holding Space keeps the lift jets on for up to a second, so a long press jumps higher
      if (car.holding && keys.jump && car.holdT < JUMP_HOLD_MAX && car.vy > 0) {
        car.vy += JUMP_HOLD_LIFT * dt;
        car.holdT += dt;
      } else car.holding = false;
      car.vy -= GRAV * dt;
      car.y += car.vy * dt;
      if (car.y <= g) {
        if (car.vy < -16 && !reduceMotion) shake = Math.min(0.6, -car.vy / 40);
        // how far off upright the car touches down; past SAFE_LANDING_ROLL it lands on its side and scrubs speed
        const off = Math.atan2(Math.sin(car.roll), Math.cos(car.roll));
        const turns = Math.floor(Math.abs(car.rolled) / (Math.PI * 2) + 0.15); // 306° or more counts as a full roll
        if (Math.abs(off) > SAFE_LANDING_ROLL) {
          car.speed *= 0.4;
          if (!reduceMotion) shake = 0.6;
          hooks.onToast('HARD LANDING');
        } else if (turns > 0) {
          hooks.onToast(turns > 1 ? `BARREL ROLL ×${turns}` : 'BARREL ROLL');
        }
        car.roll = off; // settles back to upright on the ground
        car.rolled = 0;
        car.y = g;
        car.vy = 0;
        car.onGround = true;
        car.lastVy = 0;
        car.holding = false;
      }
    }

    // pitch: follow ramp slope on the ground, nose to velocity in the air
    const r = rampAt(car.x, car.z);
    const pitchTarget = car.onGround
      ? r
        ? Math.atan2(r.h, r.len)
        : 0
      : THREE.MathUtils.clamp(car.vy * 0.018, -0.35, 0.35);
    car.pitch += (pitchTarget - car.pitch) * Math.min(1, dt * 8);
    if (car.onGround) car.roll += (0 - car.roll) * Math.min(1, dt * 10);
    R.group.position.set(car.x, car.y, car.z);
    R.group.rotation.set(car.pitch, car.yaw, car.roll, 'YXZ');

    for (const w of R.wheels) {
      w.spin.rotation.x -= (car.speed * dt) / 0.42;
      if (w.front) w.steerPivot.rotation.y = car.steer * 0.42;
    }
    car.burst = Math.max(0, car.burst - dt);
    const heat = boosting ? 1 : throttle ? 0.18 : 0.05;
    for (const f of R.flames) {
      const flick = 0.85 + Math.random() * 0.3;
      f.scale.set(0.6 + heat * 0.7, 0.6 + heat * 0.7, (0.3 + heat * 2.4) * flick);
      f.visible = heat > 0.06;
    }
    const liftOn = car.holding ? 1 : car.burst > 0 ? car.burst / 0.5 : 0;
    for (const f of R.lift) f.scale.set(1, Math.max(0.001, liftOn * 2.2 * (0.8 + Math.random() * 0.4)), 1);
    R.light.intensity = heat * 40 + liftOn * 30;

    // orbs
    const t = performance.now() / 1000;
    for (const o of orbs) {
      if (!o.visible) continue;
      o.rotation.y = t * 1.5;
      o.position.y = o.userData.base + Math.sin(t * 2 + o.position.z) * 0.25;
      if (
        Math.abs(o.position.z - car.z) < 2.2 &&
        Math.abs(o.position.x - car.x) < 2.2 &&
        Math.abs(o.position.y - (car.y + 0.8)) < 2.4
      ) {
        o.visible = false;
        orbCount++;
        car.energy = Math.min(100, car.energy + 15);
        hud.orbs.textContent = String(orbCount);
      }
    }

    // 0–100 km/h timer
    const kmh = Math.abs(car.speed) * 4;
    if (kmh < 2 && car.onGround) {
      zeroArmed = true;
      zeroT0 = null;
    }
    if (zeroArmed && zeroT0 === null && car.speed > 0.5) zeroT0 = performance.now();
    if (zeroArmed && zeroT0 !== null && kmh >= 100) {
      const s = (performance.now() - zeroT0) / 1000;
      zeroArmed = false;
      zeroBest = zeroBest ? Math.min(zeroBest, s) : s;
      hud.zero.textContent = `${s.toFixed(2)}s`;
      hooks.onToast(`0–100 km/h ${s.toFixed(2)}s`);
    }

    hud.kmh.textContent = String(Math.round(kmh));
    hud.boostFill.style.transform = `scaleX(${car.energy / 100})`;
    hud.boostBar.classList.toggle('low', car.energy < 15);

    setStage(stageAt(car.z));
    if (!finished && car.z < END_Z) {
      finished = true;
      paused = true;
      clearKeys();
      hooks.onFinish({ time: (performance.now() - runStart) / 1000, orbs: orbCount, zeroBest });
    }
  }

  function updateCamera(dt: number) {
    if (!started) {
      idleT += dt;
      const a = idleT * IDLE_ORBIT;
      camera.position.set(car.x + Math.sin(a) * 9, 3.2, car.z + Math.cos(a) * 9);
      camera.lookAt(car.x, 0.9, car.z);
      camera.fov = 52;
      camera.updateProjectionMatrix();
      return;
    }
    const sp = Math.max(0, car.speed);
    const back = 9.5 + sp * 0.03,
      up = 3.6 + sp * 0.01;
    tmpV.set(car.x + Math.sin(car.yaw) * back, car.y * 0.7 + up, car.z + Math.cos(car.yaw) * back);
    camera.position.lerp(tmpV, 1 - Math.exp(-dt * 10));
    if (shake > 0) {
      camera.position.y += (Math.random() - 0.5) * shake;
      camera.position.x += (Math.random() - 0.5) * shake;
      shake = Math.max(0, shake - dt * 1.8);
    }
    look.set(car.x - Math.sin(car.yaw) * 6, car.y + 1.3, car.z - Math.cos(car.yaw) * 6);
    camera.lookAt(look);
    const fovT = 62 + sp * 0.12 + (keys.boost && car.energy > 1 ? 8 : 0);
    camera.fov += (fovT - camera.fov) * Math.min(1, dt * 4);
    camera.updateProjectionMatrix();
  }

  let raf = 0,
    last = 0;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (started && !paused) step(dt);
    updateCamera(dt);
    sun.position.set(car.x + 25, 45, car.z - 60);
    sun.target.position.set(car.x, 0, car.z);
    sunDisc.position.set(car.x * 0.2, 60, car.z - 1300);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  const api: GameApi = {
    start() {
      if (started) return;
      started = true;
      paused = false;
      runStart = performance.now();
    },
    toIntro() {
      started = false;
      resetRun();
    },
    jumpTo(i) {
      if (!started) api.start();
      paused = false;
      finished = false;
      placeCar(stageZ(i) + 45);
      car.speed = 18;
    },
    resume() {
      paused = false;
    },
    setKey(k, down) {
      keys[k] = down;
      if (k === 'jump' && down) pressJump();
    },
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
      removeEventListener('blur', clearKeys);
      removeEventListener('resize', onResize);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          (mat as THREE.MeshBasicMaterial).map?.dispose();
          mat.dispose();
        }
      });
      renderer.dispose();
    },
  };

  // dev-only handle for poking at the physics from the browser console
  if (process.env.NODE_ENV !== 'production') (window as Window & { __roadster?: typeof car }).__roadster = car;

  setStage(-1);
  raf = requestAnimationFrame(frame);
  return api;
}
