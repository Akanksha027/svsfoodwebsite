"use client";

import { useEffect, useRef } from "react";

// ---- Real-world coastline data ----------------------------------------
// Packed as a 180 x 360 (1-degree resolution) land/sea bitmap, derived from
// Natural Earth land geometry (via the "world-atlas" dataset), base64-encoded.
// Row 0 = south pole (-90 lat), row 179 = north pole (+90 lat).
// Col 0 = -180 lon, col 359 = +179 lon.
const LAND_MASK_ROWS = 180;
const LAND_MASK_COLS = 360;
const LAND_MASK_B64 =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPjr/////////////////////////////////////////////////////38AAAAA+P////////////8f8P///////////////////////////////////wEAAAAG/v////////////8HAAD8////////////////////////////////HwAAAAAAwP///////////wD8wB8A+P//////////////////////////////HwAAAAAe4P///////////zAAAPwBwP//////////////////////////////DwAAAAAA////////////fAABAPwA/////////////////////////////////wcAAADAH////////////wMAAAAA/P///////////////////////////////xwAAAAAAP7//////////z8AAAAAgP//////////////////////////////fwAAAAAAAID///////////8PAAAAAID+////////////////////////////PwAAAAAAAAAAEeA3AP////9/AAAAAAD8////////////////////////////fwEAAAAAAAAAIAAAAP9/WPp/AAAAAADw/////////////////////////////wcAAAAAAAAAAAAAAA4AAHh+AAAAAAAA////////////f/7//////////////x8AAAAAAAAAAAAAAAAAAPg+AAAAAAAA9/f///////////j//////////////38AAAAAAAAAAAAAAAAAAGA/AAAAAAAAAAA4fwL+/////+H/////////////XwAAAAAAAAAAAAAAAAAAALgfAAAAAAAAAAAAAABg8P///wH/////////////DwAAAAAAAAAAAAAAAAAAAAAWAAAAAAAAAAAAAAAA4P///wP4//////////8HAAAAAAAAAAAAAAAAAAAAAIADAAAAAAAAAAAAAAAAAOT/AQCA/////////w8AAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAMAfAAAAAAB/eADGPwAAQAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANADAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAMABAAAAAAAAAAAAAAAAAPgPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAIADAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAALAAAAAAAAAAAAAAAAAPw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAPg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAPz/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAAA4AAAAAAAAAAAAAAAAAPz/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAIAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAEAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8DAAACAAAAAAAAAAAAAAAAAPD/OwAAAAAAAAAAgAAAAAAAAAAAAAAAAAcA6P8HAAAAAAAAAAAAAAAAAAAAAPD/fQAAAAAAAAAAwH8AAAAAAAAAAAAAAP8A2P8HAAAAAAAAAAAAAAAAAAAAAOD//wAAAAAAAAAAwP8BAAAAAAAAAAAAAP8D/P8PAAAAAAAAAAAAAAAAAAAAAPD//wAAAAAAAAAAwP8DAAAAAAAAAAAAAP////8fAAAAAAAAAAAAAAAAAAAAAPD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAOD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA8P8PAAAAAAAAAAAAgP////8/AAAAAAAAAAAAAAAAAAAAAOD//w8AAAAAAAAA+P8fAAAAAAAAAAAAwP////8/AAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAA4P////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAIAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//x8AAAAAAAAA+P9/AAcAAAAAAAAA4P////8PAAAAAAAAAAAAAAAAAAAAAMD//38AAAAAAAAA/P9/AA8AAAAAAAAAwP////8HAAAAAAAAAAAAAAAAAAAAAMD///8DAAAAAAAA/P//gA8AAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAMD///8HAAAAAAAA/P9/gA8AAAAAAAAAgP////8BAAIAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8gAAAAAAAAAPz///8BAAEAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAOD///8AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA////AR8AAAAAAAAAAMD//z8AAAAAAAAAQAAAAAAAAAAAAOD///8fAAAAAAAA////Ax8AAAAAAAAAAMD//z4AAAAAAAAAAAAAAAAA/P////////8fAAAAAAAA////Dz8AAAAAAAAAAID/vx4AAAiAAAAAAAAAAAAAAAAAAP7///8fAAAAAAAA////HzwAAAAAAAAAAAD/Dx4AAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA////HzAAAAAAAAAAAADMDxwAAAAAgAAAAAAAAAAAAAAAAP////8fAAAAAAAA/v//HzAAAAAAAAAAAADADwwAAAAAAAAAAAAAAAAAAAAAgP////8/AAAAAAAA/v//HyAAAAAAAAAAAACAHwQAAAAAAAAAAAAAAAAAAAAAgP////9/AAAAAAAA/P//DwAAAAAAAAAAAABAAQQgAAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/P//DwAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/v//DwAAAAAAAAAAAAgBAIAFAAAAAAAAAAAAAAAAAAAA4P//////AQAAAAAA/v//BwAAAAAAAAAAgN8EAMcAAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA/v//BwAAAAAAAACAHwCAwH8AAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA////BwAAAAAAAADAAQAAhP+AAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAAAwAAgAxD8NAAAAAAAAAAAAAAAAAAAA+P////8/AAAAAAAA////BwAAAAAAAAA4AAAA8B8AAAAAAAAAAAAAAAAAAAAA+P////8fAAAAAACA////DwAAAAAAAAA8gChE/g8AAAAAAAAAAAAAAAAAAAAA+P///3sAAAAAAADA////HwAAAAAAAAB+/DkA8AEAAAAAAAAAAAAAAAAAAAAA+P//f3cAAAAAAADg////PwAAAAAAAAAO/DkIAwAAAAAAAAAAAAAAAAAAAAAA8P///w8AAAAAAADg////PwAAAAAAAAAX/gNIAQAAAAAAAAAAAAAAAAAAAAAA8P///wEAAAAAAADg////fwAAAAAAAIAH/uMQAAAAAAAAAAAAAAAAAAAAAAAA4P///wMAAAAAAADA/////wAAAAAAAIAL/gMQAAAAAAAAAAAAAAAAAAAAAAAAwP///wEAAAAAAADA/////wMAAAAAAMAM+AMQAAAAAAAAAAAAAAAAAAAAAAAAgP///wEAAAAAAADA/////wcAAAAAAGAG4AEAAAAAAAAAAAAAAAAAAAAAAAAAgP///wAAAAAAEADk/////w8AAAAAADAGwAcAAAAAAAAAAAAAAAAAAAAAAAAAgP//fwAAAAAA/A/+/////x8AAAAAAAgHgAcAAAAAAAAAAAAAAAAAAAAAAAAAgP//AwAAAAAA/n///////x8AAAAwAAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAyP//AQAAAAAA/////////z8AAAAwAIAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAz///AAAAAACA/////////z8AAAASAMAAAIADAAAAAAAAAAAAAAAAAAAAAAAAE+9/AAAAAADA/////////38AAAAXAEAgAAQCAAAAAAAAAAAAAAAAAAAAAADAAe8TAAAAAADg/////////34AAAAPAEBwAAgAAAAAAAAAAAAAAAAAAAAAAADAAEgAAAAAAADg////////f0AAAAAPAID4AUADAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAD4////////fwACAIAPAID8AQABAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAD4////////vwcAAIAPAMD+AdAAAAAAAAAAAAAAAAAAAAAAAAD/AQAAAAAAAAD4////////nx8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAID/AAAAAAAAAAD4////////j/8AAMAPAMD/ARAAAAAAAAAAAAAAAAAAAAAAAP4PAAAAAAAAAADw////////h/8BAOA/AMz/ADAAAAAAAAAAAAAAAAAAAAAAgP8PAAAAAAAAAADw////////x/8HAOB/APh/ADAAAAAAAAAAAAAAAAAAAAAA8J8OAPwAAAAAAADw////////4/8fAOD/APw/AgAAAAAAAAAAAAAAAQAAAAAA+A8eADgAAAAAAADw////////4f8/AOD/Afw/BgAAAAAAAAAAAAAAAAAAAAAA/AccgAEAAAAAAADw////////8f9/AOD/B/5/BAAAAAAAAAAAAAAAAAAAAAAA+AMIYAAAAAAAAAD4////////+f9/AOz/B///BAAAAAAAAAAAAAAAAAAAAAAA/AMAPQAAAAAAAADw////////+P//APz/////PxAAAAAAAAAAAAAAAAAAAABA/gMAAAAAAAAAAADw////////+P9/AP///////xEAAAAAAAAAAAAAAAAAAAAQ/wMAAAAAAAAAAADg//////9//n8YgP///////yMAAAAAAAAAAAAAAAAAAACQ/wcACAAAAAAAAADg//////9//j+Av////////w8AAAAAAAAAAAAAAAAAAACY/wcADAAAAAAAAADA//////8//z/g/////////w8AAAAAAAAAAAAAAAAAAADu/wcADgAAAAAAAACA//////8//x/+/////////x8AAAAAAAAAAAAAAAAAAAD0/wcABgAAAAAAAAAA/v///////4///////////z8AAAAAAAAAAAAAAAAAAAD2/x8CBgAAAAAAAAAA/P/////v/4///////////z8AAAAAAAAAAAAAAAAAAAD5////BwAAAAAAAAAA/P//f////////////////x8AAAAAAAAAAAAAAAAAAID9////BwAAAAAAAAAA/P//D3/A/////////////x9AAAAAAAAAAAAAAAAAAID/////BwAAAAAAAAAA+P//BweA/////////////x+AAAAAAAAAAAAAAAAAAMD/////HwAAAAAAAAAA8P9/AACA/////////////x/EAwAAAAAAAAAAAAAAAPj/////fwAAAAAAAAAA4P8/AAAA/////////////w+EGwAAAAAAAAAAAAAAAPj//////wAAAAAAAAAAQPh/AAAA/////////////w8c/AAAAAAAAAAAAAAAAPz//////wAAAAAAAAAAQOB/AAA2/////////////x8Y8AEAAAAAAAAAAAAAAPz//////wAAAAAAAAAA+AcABoT//x/8/////////zcYgAEAAAAAAAAAAAAAAP7//////wEAAAAAgAAA+A8AEM7//x/8/////////wMOAAMAAAAAAAAAAAAAAP///////wMAAAAAAAAA+E8wEIf//x/+/////////2cOAAMAAAAAAAAAAAAAAP///////wMAAAAAAAAA+B8wuA/+/z/+/////////98fAAMAAAAAAAAAAAAAAP///////x8AAAAAAAAA+D8Ajv/w4B/8//////////8/AAAAAAAAAAAAAAAAAP///////x8AAAAAAAAA+H+gw/8AwA/+//////////9/AAQAAAAAAAAAAAAAAP///////z8AAAAAAAAAcPzH4/8B8I//////////////Bx4AAAAAAAAAAAAAAP////////8MAAAAAAAAAPj/+P8B/Mf/////////////DwQAAAAAAAAAAAAAAP////////9/AAAAAAAAAPj//f9j/A/+////////////HwAAAAAAAAAAAAAAAP////////+XAAAAAAAAAPz////3/B/+////////////PwgAAAAAAAAAAAAAAP3///////8HUAAAAAAAAPz/////////////////////fwQAAAAAAAAAAAAAAP///////38PfAAAAAAAgP///////////////////////wQAAAAAAAAAAAAAYP////////8xLAAAAAAAAPT//////////////////////wwAAAAAAAAAAAAAkP//////////CAAAAAAAgMD//////////////////////wwAAAAAAAAAAAAA8P//////////FwAAAAAAAB///////////////////////wUAAwAAAAAAAAAA8f//////4///DwAAAAAAPD/+/////////////////////wUAAwAAAAAAAACA/P//////4///DwAAAAAAPA7o/////////////////////wEADwAAAIAAAAAA/P//////8///AwAAAAAAcAcgcv//////////////////HwAAHwAAAAAAAABA//////8/gP//AAAAAAAAgAPwAv7/////////////////DwAAPwAAAAAwAABA//////8PgP8/AAAAAAAAgAFwHv7/////////////////PwAAfwAAAACADgDw/////38AgP8/AAAAAAAA4AMAX/T//////////////////wAAfgAAAACACwD4/////38AwP8eAAAAAAAAgAGcH/T//////////////////wEAOAAAAAD8AwD//////x8AwD8IAAAAAAAAAAC+P2D///////////////////91cAAAAID/7/z//////x8AwD8AAMAAAAAAAAT+P7z+//////////////////9/wG8AAMD//////////z8AwA8AAPgDAAAAAAD+H/z/////////////////////Mf8BAID//////////38AQ4AJAPwDAAAAAAD8P/7/////////////////////f/5fAAP4///////////BAGAHAP4HAAADAACw//z///////////////////////9/wAD4///////////Pw/gHAP4PAMA/AACA//F//v////////////////////8fDv//////////////////////////////AByADwAAAAAAAAAAAAAAAAAAAAAAAP7/////////////////////////////AQBg4AAAAAwAAAAAAAAAAAAAAAAA4P//////////////////////////////DwAA4A4AADAAAAAAAAAAAAAAAAAA/P//////////////////////////////HwAA/PyFAAECAAAAAAAAAAAAAAAAAAD+//+Bvob/H9SBof8AwP7//w8AAAAAoP8PAAAAD9///////////////48/AADwTwAAAADwH/D4//8AwP7/fxEAAAAAANgHAAAAgN9/////////////DwAA/P//////////////////////////////////////////////////////////AAAAAAAAgN9/xy+8xwEA4P///zcAAAAAAAAAAAAGAJ7i//////8fAD4AAAAAAAAAAAAAAP8BxvMxfwAA8P///3cAAAAAAAAAAAAcAIDh//9/3IcLAAcAAAAAAAAAAAAAAAQMAAQQAAAA8P////8BAAAAAAAAAABwAAAA+P//FwAAAAAAAAAAAAAAAAAAAAD/Az/fDwAA/P////8BAAAAAAAAAADABwAAwP//PwAA4FsAAAAAAAAAAAAAAFhAmPPVH4D//////z8AAAAAAAAAAAAA4AEAAAD8HwAAAAAAAAAAAAAAAAAAAIA4BHAyO0D8/////38AAAAAPAoAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAB4+Jzn//D//////38AAACAewMAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAPD//wf4//////8BAACAdT8AAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAPAH8H/+//////8HAAAAAAAAADSAAQAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAD8//+F/////3/5AAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/P8/AGD//z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function decodeLandMask(): Uint8Array {
  const binary = atob(LAND_MASK_B64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isLandFactory(packed: Uint8Array) {
  return (lat: number, lon: number): boolean => {
    const row = Math.min(LAND_MASK_ROWS - 1, Math.max(0, Math.floor(lat + 90)));
    let col = Math.floor(lon + 180) % LAND_MASK_COLS;
    if (col < 0) col += LAND_MASK_COLS;
    const idx = row * LAND_MASK_COLS + col;
    return ((packed[idx >> 3] >> idx % 8) & 1) === 1;
  };
}

function buildLandPoints(isLand: (lat: number, lon: number) => boolean) {
  const points: { lat: number; lon: number }[] = [];
  const latStep = 1.35;
  for (let lat = -89; lat <= 89; lat += latStep) {
    // fewer samples near the poles so dot density stays even across the sphere
    const circumference = Math.cos((lat * Math.PI) / 180);
    const lonStep = 1.35 / Math.max(circumference, 0.12);
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (isLand(lat, lon)) points.push({ lat, lon });
    }
  }
  return points;
}

type Projected = { x: number; y: number; z: number };

export default function DottedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yawRef = useRef(20);
  const pitchRef = useRef(-12);
  const velYawRef = useRef(0);
  const velPitchRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLand = isLandFactory(decodeLandMask());
    const landPoints = buildLandPoints(isLand);
    let frameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const AUTO_SPIN = 0.18; // continuous yaw ° per frame
    // Orbiting key light (radians / second) — drives the white specular that comes & goes
    const LIGHT_SPEED = 0.55;
    const startT = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      const cssSize = parent ? parent.clientWidth : 700;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      lastTRef.current = performance.now();
      velYawRef.current = 0;
      velPitchRef.current = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const dt = Math.max(8, now - lastTRef.current);
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      lastTRef.current = now;

      const sens = 0.07;
      const dYaw = dx * sens;
      const dPitch = -dy * sens;

      yawRef.current += dYaw;
      pitchRef.current = Math.max(-50, Math.min(40, pitchRef.current + dPitch));

      velYawRef.current = (dYaw / dt) * 16;
      velPitchRef.current = (dPitch / dt) * 16;
    };

    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      canvas.style.cursor = "grab";
      velYawRef.current = Math.max(-0.3, Math.min(0.3, velYawRef.current));
      velPitchRef.current = Math.max(-0.2, Math.min(0.2, velPitchRef.current));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.52;
      const radius = w * 0.495;
      const t = (performance.now() - startT) / 1000;

      // Orbiting light — specular enters from one side, crosses, fades behind the globe
      const lightAz = t * LIGHT_SPEED;
      const lightEl = 0.42 + Math.sin(t * 0.35) * 0.12;
      let lx = Math.sin(lightAz) * Math.cos(lightEl);
      let ly = Math.sin(lightEl);
      let lz = Math.cos(lightAz) * Math.cos(lightEl);
      const lLen = Math.hypot(lx, ly, lz) || 1;
      lx /= lLen;
      ly /= lLen;
      lz /= lLen;

      // Specular lobe center on the sphere (Blinn half-vector toward camera +Z)
      const hx = lx;
      const hy = ly;
      const hz = lz + 1.15;
      const hLen = Math.hypot(hx, hy, hz) || 1;
      const snx = hx / hLen;
      const sny = hy / hLen;
      const snz = hz / hLen;
      // How “present” the highlight is — strong when light faces camera, gone when behind
      const shinePresence = Math.max(0, snz);
      const shinePower = Math.pow(shinePresence, 1.35);

      ctx.clearRect(0, 0, w, h);

      // Soft near-limb aura
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.1);
      aura.addColorStop(0, "rgba(190, 228, 255, 0.18)");
      aura.addColorStop(1, "rgba(190, 228, 255, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Soft glass-ocean body (no static white stuck at the center)
      const shadeX = cx + lx * radius * 0.35;
      const shadeY = cy - ly * radius * 0.45;
      const baseGrad = ctx.createRadialGradient(
        shadeX,
        shadeY,
        radius * 0.05,
        cx,
        cy + radius * 0.15,
        radius * 1.05
      );
      baseGrad.addColorStop(0, "#f4fbff");
      baseGrad.addColorStop(0.18, "#c8ebff");
      baseGrad.addColorStop(0.4, "#6fc8f5");
      baseGrad.addColorStop(0.62, "#2d96e6");
      baseGrad.addColorStop(0.82, "#186fcf");
      baseGrad.addColorStop(1, "#0a3f9a");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.clip();

      const yaw = (yawRef.current * Math.PI) / 180;
      const pitch = (pitchRef.current * Math.PI) / 180;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const projected: Projected[] = landPoints.map(({ lat, lon }) => {
        const lonRad = (lon * Math.PI) / 180 + yaw;
        const latRad = (lat * Math.PI) / 180;
        const x = Math.cos(latRad) * Math.sin(lonRad);
        const y = Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(lonRad);
        const y2 = y * cosP - z * sinP;
        const z2 = y * sinP + z * cosP;
        return { x, y: y2, z: z2 };
      });

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        if (p.z < -0.02) continue;
        const px = cx + p.x * radius;
        const py = cy - p.y * radius;
        const depth = Math.max(p.z, 0);
        const NdotL = Math.max(0, p.x * lx + p.y * ly + p.z * lz);
        const HdotN = Math.max(0, p.x * snx + p.y * sny + p.z * snz);
        const spec = Math.pow(HdotN, 28) * shinePower;
        const lit = 0.38 + depth * 0.35 + NdotL * 0.35 + spec * 0.9;
        const size = (0.9 + depth * 1.45 + spec * 0.8) * (dpr * 0.95);
        const alpha = Math.min(1, lit);
        ctx.fillStyle = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }

      // Moving specular bloom — only drawn while the light is on the front/side
      if (shinePower > 0.02) {
        const sx = cx + snx * radius * 0.92;
        const sy = cy - sny * radius * 0.92;
        const bloomR = radius * (0.55 + shinePower * 0.35);

        const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, bloomR);
        bloom.addColorStop(0, `rgba(255,255,255,${(0.95 * shinePower).toFixed(3)})`);
        bloom.addColorStop(0.18, `rgba(255,255,255,${(0.72 * shinePower).toFixed(3)})`);
        bloom.addColorStop(0.4, `rgba(255,255,255,${(0.28 * shinePower).toFixed(3)})`);
        bloom.addColorStop(0.7, `rgba(230,248,255,${(0.08 * shinePower).toFixed(3)})`);
        bloom.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Tight hot core that travels with the bloom
        const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 0.28);
        core.addColorStop(0, `rgba(255,255,255,${(1.0 * shinePower).toFixed(3)})`);
        core.addColorStop(0.35, `rgba(255,255,255,${(0.55 * shinePower).toFixed(3)})`);
        core.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft fresnel rim (atmosphere)
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.01);
      rimGrad.addColorStop(0, "rgba(8, 50, 130, 0)");
      rimGrad.addColorStop(0.75, "rgba(8, 50, 130, 0)");
      rimGrad.addColorStop(1, "rgba(6, 30, 95, 0.42)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.98, cx, cy, radius * 1.07);
      haloGrad.addColorStop(0, "rgba(180, 225, 255, 0.22)");
      haloGrad.addColorStop(1, "rgba(180, 225, 255, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.07, 0, Math.PI * 2);
      ctx.fill();

      yawRef.current += AUTO_SPIN + (draggingRef.current ? 0 : velYawRef.current);

      if (!draggingRef.current) {
        pitchRef.current = Math.max(
          -50,
          Math.min(40, pitchRef.current + velPitchRef.current)
        );
        velYawRef.current *= 0.93;
        velPitchRef.current *= 0.9;
        pitchRef.current += (-12 - pitchRef.current) * 0.012;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div className="globe-wrap relative z-10">
      <canvas
        ref={canvasRef}
        aria-label="Interactive revolving globe — white specular highlight sweeps as it spins"
      />
    </div>
  );
}
