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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function DottedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yawRef = useRef(20);
  const pitchRef = useRef(-26);
  const velYawRef = useRef(0);
  const velPitchRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const cycleStartRef = useRef(0);
  const cycleYawBaseRef = useRef(8);
  const lastElapsedRef = useRef(0);
  const pitchAfterDownRef = useRef(false);
  const waveRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLand = isLandFactory(decodeLandMask());
    const landPoints = buildLandPoints(isLand);
    let frameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Choreographed spin: left→right, then top→bottom with glow wave
    const PITCH_START = -28;
    const PITCH_END = 22;
    const HORIZONTAL_TRAVEL = 68;
    const HORIZONTAL_MS = 6000;
    const VERTICAL_MS = 4800;
    const CYCLE_MS = HORIZONTAL_MS + VERTICAL_MS;

    cycleStartRef.current = performance.now();
    cycleYawBaseRef.current = yawRef.current;
    lastElapsedRef.current = 0;
    pitchAfterDownRef.current = false;

    // Lighter SVS palette for the globe body
    const COL = {
      lit: "#FFD4B8",
      mid: "#F5B08A",
      shadow: "#E8956A",
    };

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
      waveRef.current = 0;
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
      cycleYawBaseRef.current = yawRef.current;
      cycleStartRef.current = performance.now();
      lastElapsedRef.current = 0;
      pitchAfterDownRef.current = pitchRef.current > PITCH_END - 8;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";

    const updateChoreography = (now: number) => {
      const elapsed = (now - cycleStartRef.current) % CYCLE_MS;

      // Advance yaw base each loop
      if (elapsed < lastElapsedRef.current - 200) {
        cycleYawBaseRef.current += HORIZONTAL_TRAVEL;
        if (!pitchAfterDownRef.current) {
          pitchAfterDownRef.current = true;
        }
      }
      lastElapsedRef.current = elapsed;

      const yawBase = cycleYawBaseRef.current;
      const yawEnd = yawBase + HORIZONTAL_TRAVEL;
      let wave = 0;

      if (elapsed < HORIZONTAL_MS) {
        const t = easeInOutSine(elapsed / HORIZONTAL_MS);
        yawRef.current = lerp(yawBase, yawEnd, t);
        pitchRef.current = pitchAfterDownRef.current ? PITCH_END : PITCH_START;
        wave = 0;
      } else if (!pitchAfterDownRef.current) {
        // First descent only — tilt down with glow wave, yaw held
        const t = easeInOutSine((elapsed - HORIZONTAL_MS) / VERTICAL_MS);
        yawRef.current = yawEnd;
        pitchRef.current = lerp(PITCH_START, PITCH_END, t);
        wave = t;
      } else {
        // Already down — keep moving right, never pitch back up
        const t = easeInOutSine((elapsed - HORIZONTAL_MS) / VERTICAL_MS);
        yawRef.current = lerp(yawEnd, yawEnd + HORIZONTAL_TRAVEL, t);
        pitchRef.current = PITCH_END;
        wave = 0;
      }

      waveRef.current = wave;
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.52;
      const radius = w * 0.495;
      const now = performance.now();

      if (!draggingRef.current) {
        updateChoreography(now);
      } else {
        waveRef.current = 0;
        yawRef.current += velYawRef.current;
        pitchRef.current = Math.max(
          -50,
          Math.min(40, pitchRef.current + velPitchRef.current)
        );
        velYawRef.current *= 0.93;
        velPitchRef.current *= 0.9;
      }

      const wave = waveRef.current;

      ctx.clearRect(0, 0, w, h);

      const yaw = (yawRef.current * Math.PI) / 180;
      const pitch = (pitchRef.current * Math.PI) / 180;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // Uniform orange body — subtle top-to-bottom depth only (no white hotspot)
      const bodyGrad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
      bodyGrad.addColorStop(0, COL.lit);
      bodyGrad.addColorStop(0.5, COL.mid);
      bodyGrad.addColorStop(1, COL.shadow);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.clip();

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
        const lit = 0.55 + depth * 0.38;
        const size = (0.78 + depth * 0.95) * (dpr * 0.9);
        const alpha = Math.min(0.95, lit);
        ctx.fillStyle = "rgba(92, 36, 18, " + alpha.toFixed(3) + ")";
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }

      // White glow wave — only during top→bottom vertical spin
      if (wave > 0.02) {
        const waveEnvelope = Math.sin(wave * Math.PI);
        const waveY = cy - radius * 0.92 + wave * radius * 1.84;
        const waveR = radius * (0.38 + waveEnvelope * 0.18);

        const waveGrad = ctx.createRadialGradient(
          cx,
          waveY,
          0,
          cx,
          waveY,
          waveR
        );
        waveGrad.addColorStop(
          0,
          `rgba(255,255,255,${(0.55 * waveEnvelope).toFixed(3)})`
        );
        waveGrad.addColorStop(
          0.28,
          `rgba(255,255,255,${(0.28 * waveEnvelope).toFixed(3)})`
        );
        waveGrad.addColorStop(
          0.58,
          `rgba(255,244,238,${(0.1 * waveEnvelope).toFixed(3)})`
        );
        waveGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Soft trailing band behind the wave front
        const trailY = waveY - radius * 0.12;
        const trailGrad = ctx.createLinearGradient(
          cx,
          trailY - radius * 0.35,
          cx,
          waveY + radius * 0.08
        );
        trailGrad.addColorStop(0, "rgba(255,255,255,0)");
        trailGrad.addColorStop(
          0.45,
          `rgba(255,255,255,${(0.12 * waveEnvelope).toFixed(3)})`
        );
        trailGrad.addColorStop(
          0.72,
          `rgba(255,255,255,${(0.22 * waveEnvelope).toFixed(3)})`
        );
        trailGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Thin warm atmosphere at the limb
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.86, cx, cy, radius * 1.01);
      rimGrad.addColorStop(0, "rgba(241, 106, 52, 0)");
      rimGrad.addColorStop(0.9, "rgba(241, 106, 52, 0)");
      rimGrad.addColorStop(1, "rgba(217, 90, 42, 0.1)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

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
        aria-label="Interactive globe, spins left to right, then top to bottom with a glowing wave"
      />
    </div>
  );
}
