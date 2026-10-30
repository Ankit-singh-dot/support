import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '@/assets/animation-logo-transparent.png';

/* ══════════════════════════════════════════════════════
   CONSTANTS & COORDINATES
══════════════════════════════════════════════════════ */
const WIDTH = 620;
const HEIGHT = 540;
const CX = 285; // Shifted left to give ample space for right-side pipeline badges
const CY = 245; // Shifted UP so it aligns with the left hero text
const ORBIT_R = 195; // orbit radius
const AVATAR_R = 29; // avatar circle radius (diameter = 58px)
const HUB_LG = 84; // hub radius (phases 1, 2, 3)
const HUB_SM = 50; // hub radius (phase 4: pipeline)

// 7 evenly distributed angles around the orbit
const ORBIT_ANGLES = [-90, -38.6, 12.9, 64.3, 115.7, 167.1, 218.6];

const AVATARS = [
  { id: 1, img: 11 },
  { id: 2, img: 22 },
  { id: 3, img: 33 },
  { id: 4, img: 44 },
  { id: 5, img: 55 },
  { id: 6, img: 15 },
  { id: 7, img: 25 },
];

// Floating purple/blue data bubbles shown during Converge ("Admin Inspects")
const DATA_BUBBLES = [
  { x: -140, y: -85, r: 4, dur: 4.2, dx: 10, dy: -8 },
  { x: -175, y: 25, r: 3.5, dur: 4.8, dx: -8, dy: 10 },
  { x: -130, y: 110, r: 4.5, dur: 3.8, dx: 9, dy: 7 },
  { x: -80, y: -160, r: 3.5, dur: 5.0, dx: -7, dy: -9 },
  { x: 145, y: -75, r: 4, dur: 4.5, dx: 8, dy: -6 },
  { x: 170, y: 35, r: 3.5, dur: 4.1, dx: -9, dy: 8 },
  { x: 125, y: 120, r: 4.5, dur: 4.6, dx: 7, dy: 9 },
  { x: 85, y: -150, r: 3, dur: 4.3, dx: 6, dy: -7 },
];

// 4 horizontal line Y positions for Phase 4 (Pipeline Flow)
const PIPELINE_LINES_Y = [
  CY - 105, // 140
  CY - 35,  // 210
  CY + 35,  // 280
  CY + 105, // 350
];

// Left Side Support Workflow Items (Pre-assignment & Triage)
const LEFT_WORKFLOW_ITEMS = [
  { text: 'Priority is assigned by the Admin', offset: 145, floatX: 8, floatY: -3, dur: 4.0 },
  { text: 'Admin assigns Support Agent', offset: 145, floatX: 10, floatY: 3, dur: 4.4 },
];

// Right Side Support Workflow Items (Shifted significantly inward/left so they are never clipped!)
const RIGHT_WORKFLOW_ITEMS = [
  { text: 'Support Agent Inspects', offset: 80, floatX: 8, floatY: -3, dur: 4.2 },
  { text: 'Issue Resolved', offset: 70, floatX: 10, floatY: 3, dur: 3.8 },
];

/* ══════════════════════════════════════════════════════
   MATH HELPERS
══════════════════════════════════════════════════════ */
function polar(deg, r) {
  const rad = (deg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

function curvedPath(deg) {
  const end = polar(deg, ORBIT_R);
  const start = polar(deg, HUB_LG + 5);
  const mid = polar(deg, (HUB_LG + ORBIT_R) / 2);
  const perp = { x: -end.y * 0.28, y: end.x * 0.28 };
  return [
    `M ${CX + start.x} ${CY + start.y}`,
    `Q ${CX + mid.x + perp.x} ${CY + mid.y + perp.y}`,
    `${CX + end.x} ${CY + end.y}`,
  ].join(' ');
}

/* ══════════════════════════════════════════════════════
   AVATAR CIRCLE
══════════════════════════════════════════════════════ */
function AvatarCircle({ img, size = AVATAR_R * 2 }) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        border: '3px solid white',
        boxShadow: '0 4px 22px rgba(99,102,241,.28), 0 2px 8px rgba(0,0,0,.12)',
      }}
    >
      <img
        src={`https://i.pravatar.cc/80?img=${img}`}
        alt="User Avatar"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CENTRAL CIRCULAR LINK HUB
══════════════════════════════════════════════════════ */
function Hub({ subPhase }) {
  const isPipeline = subPhase === 'pipeline';
  const r = isPipeline ? HUB_SM : HUB_LG;

  return (
    <div
      className="absolute flex items-center justify-center z-10"
      style={{ left: CX, top: CY, transform: 'translate(-50%, -50%)' }}
    >
      {/* Phase 4 – Translucent vertical track behind Circular Hub */}
      <AnimatePresence>
        {isPipeline && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.6 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.6 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute pointer-events-none -z-10"
            style={{
              width: 96,
              height: 350,
              borderRadius: 26,
              background:
                'linear-gradient(180deg, rgba(37,99,235,0.25) 0%, rgba(59,130,246,0.14) 40%, rgba(147,197,253,0.06) 80%, transparent 100%)',
              border: '1.5px solid rgba(191, 219, 254, 0.55)',
              boxShadow:
                '0 12px 36px -6px rgba(37,99,235,0.18), 0 0 50px rgba(59,130,246,0.12)',
              backdropFilter: 'blur(6px)',
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative flex items-center justify-center"
        animate={{ width: r * 2, height: r * 2 }}
        transition={{ duration: 0.75, type: 'spring', bounce: 0.22 }}
      >
        {/* Outer pulse rings */}
        {[0, 0.55].map((delay, k) => (
          <motion.div
            key={k}
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              scale: [1, k === 0 ? 1.6 : 2.1, 1],
              opacity: [k === 0 ? 0.4 : 0.22, 0, k === 0 ? 0.4 : 0.22],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay }}
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 70%)',
            }}
          />
        ))}

        {/* Circular Link body */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #4f46e5 55%, #3730a3 100%)',
            boxShadow: '0 0 60px rgba(99,102,241,.55), 0 0 120px rgba(59,130,246,.25)',
          }}
        >
          {/* Inner shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(255,255,255,.28) 0%, transparent 60%)',
            }}
          />

          {/* Spinning ring 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full"
            style={{
              inset: isPipeline ? 5 : 9,
              border: '2px solid transparent',
              borderTopColor: 'rgba(255,255,255,.6)',
              borderRightColor: 'rgba(255,255,255,.22)',
            }}
          />

          {/* Spinning ring 2 (counter-rotation) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full"
            style={{
              inset: isPipeline ? 11 : 20,
              border: '1.5px solid transparent',
              borderBottomColor: 'rgba(255,255,255,.48)',
              borderLeftColor: 'rgba(255,255,255,.18)',
            }}
          />

          {/* Center icon / emblem */}
          <div
            className="relative z-10 rounded-full bg-white/18 backdrop-blur-sm flex items-center justify-center"
            style={{ width: isPipeline ? 34 : 56, height: isPipeline ? 34 : 56 }}
          >
            <svg viewBox="0 0 44 44" className={isPipeline ? 'w-5 h-5' : 'w-8 h-8'} fill="none">
              <circle
                cx="22"
                cy="22"
                r="13"
                fill="rgba(255,255,255,.15)"
                stroke="rgba(255,255,255,.7)"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="22"
                cy="22"
                r="8.5"
                stroke="rgba(255,255,255,.85)"
                strokeWidth="1.6"
                strokeDasharray="14 10"
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '22px 22px' }}
              />
              <circle cx="22" cy="22" r="4.5" fill="white" />
            </svg>
          </div>
        </div>

        {/* Dynamic Phase label badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={subPhase}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
            style={{
              bottom: isPipeline ? -200 : -54,
            }}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-blue-100 shadow-lg shadow-blue-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-semibold text-slate-700 tracking-wide">
                {subPhase === 'pipeline'
                  ? 'Autonomous Pipeline'
                  : subPhase === 'converge'
                  ? 'Admin Inspects'
                  : 'Capturing Tickets...'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ORBITAL, CONVERGE & PIPELINE FLOW STAGE
   Timeline:
   1) 'orbit' (4.2s): 7 avatars around ring -> "Capturing Tickets..."
   2) 'converge' (3.8s): Avatars suck inside ring -> "Admin Inspects"
   3) 'pipeline' (4.0s): Vertical track, 4 guide lines, 4 workflow cards
   4) After Phase 4 completes (after 4s) -> calls onComplete to restart!
══════════════════════════════════════════════════════ */
function OrbitalStage({ onComplete }) {
  const [subPhase, setSubPhase] = useState('orbit'); // 'orbit' | 'converge' | 'pipeline'

  useEffect(() => {
    // Phase 1 -> Phase 2 (Converge: "Admin Inspects"): after 4.2s
    const convergeTimer = setTimeout(() => {
      setSubPhase('converge');
    }, 4200);

    // Phase 2 -> Phase 3 (Pipeline Flow): after 3.8s in converge (total 8.0s)
    const pipelineTimer = setTimeout(() => {
      setSubPhase('pipeline');
    }, 8000);

    // After Phase 4 completes: wait 4.0 seconds, then restart the whole animation!
    const restartTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 12200); // 8.0s + 4.2s = 12.2s total inside OrbitalStage

    return () => {
      clearTimeout(convergeTimer);
      clearTimeout(pipelineTimer);
      clearTimeout(restartTimer);
    };
  }, [onComplete]);

  const isOrbit = subPhase === 'orbit';
  const isConverge = subPhase === 'converge';
  const isPipeline = subPhase === 'pipeline';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative w-full max-w-[620px] mx-auto select-none -translate-y-4 sm:-translate-y-6"
      style={{ height: HEIGHT }}
    >
      {/* Animated blob backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { t: '-5%', l: '5%', w: 360, h: 260, c: 'rgba(147,197,253,.55)', dx: 30, dy: -20, dur: 9 },
          { b: '10%', r: '0%', w: 300, h: 220, c: 'rgba(165,180,252,.45)', dx: -25, dy: 20, dur: 11, delay: 2 },
          { t: '35%', l: '-5%', w: 280, h: 200, c: 'rgba(186,230,253,.40)', dx: 15, dy: 15, dur: 14, delay: 5 },
        ].map((b, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0] }}
            transition={{
              duration: b.dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: b.delay ?? 0,
            }}
            className="absolute rounded-full"
            style={{
              top: b.t,
              bottom: b.b,
              left: b.l,
              right: b.r,
              width: b.w,
              height: b.h,
              background: `radial-gradient(ellipse, ${b.c} 0%, transparent 70%)`,
              filter: 'blur(72px)',
            }}
          />
        ))}
      </div>

      {/* SVG lines & connector layer */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Dashed orbit ring (visible in orbit phase) */}
        <AnimatePresence>
          {isOrbit && (
            <motion.circle
              cx={CX}
              cy={CY}
              r={ORBIT_R}
              stroke="rgba(99,102,241,.14)"
              strokeWidth="1.2"
              strokeDasharray="5 7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        {/* Curved connector lines + traveling dots (orbit phase) */}
        <AnimatePresence>
          {isOrbit &&
            ORBIT_ANGLES.map((deg, i) => {
              const p = curvedPath(deg);
              return (
                <g key={`ol-${i}`}>
                  <motion.path
                    d={p}
                    stroke="rgba(99,102,241,.32)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    transition={{ duration: 1.1, delay: i * 0.1, ease: 'easeOut' }}
                  />
                  <motion.circle
                    r="3.5"
                    fill="rgba(99,102,241,.75)"
                    style={{ offsetPath: `path('${p}')`, offsetRotate: '0deg' }}
                    animate={{ offsetDistance: ['0%', '100%', '0%'] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      delay: i * 0.55,
                      ease: 'easeInOut',
                    }}
                  />
                </g>
              );
            })}
        </AnimatePresence>

        {/* Floating Data Bubbles around Hub (Converge Phase) */}
        <AnimatePresence>
          {isConverge &&
            DATA_BUBBLES.map((b, i) => (
              <motion.circle
                key={`bubble-${i}`}
                cx={CX + b.x}
                cy={CY + b.y}
                r={b.r}
                fill="#818cf8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.35, 0.85, 0.35],
                  scale: [1, 1.25, 1],
                  cx: [CX + b.x, CX + b.x + b.dx, CX + b.x],
                  cy: [CY + b.y, CY + b.y + b.dy, CY + b.y],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: b.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.12,
                }}
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(129,140,248,0.45))',
                }}
              />
            ))}
        </AnimatePresence>

        {/* Pipeline Phase – 4 horizontal guide lines + continuous data flow pulses */}
        <AnimatePresence>
          {isPipeline &&
            PIPELINE_LINES_Y.map((y, i) => (
              <g key={`pipe-line-${i}`}>
                <motion.line
                  x1={15}
                  y1={y}
                  x2={WIDTH - 15}
                  y2={y}
                  stroke="rgba(191, 219, 254, 0.55)"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.65, delay: i * 0.08, ease: 'easeOut' }}
                />
                <motion.circle
                  cy={y}
                  r="3.5"
                  fill="rgba(59, 130, 246, 0.85)"
                  initial={{ cx: 25, opacity: 0 }}
                  animate={{
                    cx: [30, WIDTH - 30],
                    opacity: [0, 0.9, 0.9, 0],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4 + i * 0.5,
                  }}
                />
              </g>
            ))}
        </AnimatePresence>
      </svg>

      {/* Central Circular Hub with Pop Badge */}
      <Hub subPhase={subPhase} />

      {/* 7 Avatars: In Orbit -> Converge Inside Hub */}
      <AnimatePresence>
        {!isPipeline &&
          AVATARS.map((av, i) => {
            const op = polar(ORBIT_ANGLES[i], ORBIT_R);
            const tx = CX + op.x - AVATAR_R;
            const ty = CY + op.y - AVATAR_R;

            return (
              <motion.div
                key={`oa-${av.id}`}
                className="absolute"
                style={{ left: 0, top: 0, pointerEvents: isConverge ? 'none' : 'auto' }}
                initial={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                animate={
                  isConverge
                    ? {
                        x: CX - AVATAR_R,
                        y: CY - AVATAR_R,
                        opacity: 0,
                        scale: 0.05,
                      }
                    : {
                        x: tx,
                        y: ty,
                        opacity: 1,
                        scale: 1,
                      }
                }
                exit={{ opacity: 0, scale: 0 }}
                transition={
                  isConverge
                    ? {
                        duration: 0.85,
                        delay: i * 0.07,
                        ease: [0.4, 0, 1, 1],
                      }
                    : {
                        opacity: { duration: 0.5, delay: 0.35 + i * 0.12 },
                        scale: {
                          type: 'spring',
                          stiffness: 175,
                          damping: 14,
                          delay: 0.35 + i * 0.12,
                        },
                      }
                }
                whileHover={isOrbit ? { scale: 1.18 } : undefined}
              >
                <motion.div
                  animate={isOrbit ? { y: [0, i % 2 === 0 ? -8 : 6, 0] } : {}}
                  transition={{
                    duration: 3.6 + i * 0.45,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.35,
                  }}
                >
                  <AvatarCircle img={av.img} />
                </motion.div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          PIPELINE PHASE – 4 Support Workflow Cards
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPipeline && (
          <>
            {/* Left Side: Step 1 (Priority is assigned by Admin) */}
            <motion.div
              className="absolute z-20"
              style={{
                top: PIPELINE_LINES_Y[0],
                left: CX - LEFT_WORKFLOW_ITEMS[0].offset,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, x: -30, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.2,
                type: 'spring',
                stiffness: 140,
                damping: 16,
              }}
            >
              <motion.div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-lg transition-shadow cursor-default"
                animate={{
                  x: [0, LEFT_WORKFLOW_ITEMS[0].floatX, -LEFT_WORKFLOW_ITEMS[0].floatX * 0.4, 0],
                  y: [0, LEFT_WORKFLOW_ITEMS[0].floatY, -LEFT_WORKFLOW_ITEMS[0].floatY, 0],
                }}
                transition={{
                  duration: LEFT_WORKFLOW_ITEMS[0].dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-25" />
                  <div className="relative w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    1
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-slate-800 whitespace-nowrap">
                  Priority is assigned by the Admin
                </span>
              </motion.div>
            </motion.div>

            {/* Left Side: Step 2 (Admin assigns Support Agent) */}
            <motion.div
              className="absolute z-20"
              style={{
                top: PIPELINE_LINES_Y[1],
                left: CX - LEFT_WORKFLOW_ITEMS[1].offset,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, x: -30, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.3,
                type: 'spring',
                stiffness: 140,
                damping: 16,
              }}
            >
              <motion.div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-lg transition-shadow cursor-default"
                animate={{
                  x: [0, LEFT_WORKFLOW_ITEMS[1].floatX, -LEFT_WORKFLOW_ITEMS[1].floatX * 0.4, 0],
                  y: [0, LEFT_WORKFLOW_ITEMS[1].floatY, -LEFT_WORKFLOW_ITEMS[1].floatY, 0],
                }}
                transition={{
                  duration: LEFT_WORKFLOW_ITEMS[1].dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25" />
                  <div className="relative w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    2
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-slate-800 whitespace-nowrap">
                  Admin assigns Support Agent
                </span>
              </motion.div>
            </motion.div>

            {/* Right Side: Step 3 (Support Agent Inspects) */}
            <motion.div
              className="absolute z-20"
              style={{
                top: PIPELINE_LINES_Y[2],
                left: CX + RIGHT_WORKFLOW_ITEMS[0].offset,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, x: 30, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.4,
                type: 'spring',
                stiffness: 140,
                damping: 16,
              }}
            >
              <motion.div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-lg transition-shadow cursor-default"
                animate={{
                  x: [0, -RIGHT_WORKFLOW_ITEMS[0].floatX * 0.4, RIGHT_WORKFLOW_ITEMS[0].floatX, 0],
                  y: [0, RIGHT_WORKFLOW_ITEMS[0].floatY, -RIGHT_WORKFLOW_ITEMS[0].floatY, 0],
                }}
                transition={{
                  duration: RIGHT_WORKFLOW_ITEMS[0].dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-25" />
                  <div className="relative w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    3
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-slate-800 whitespace-nowrap">
                  Support Agent Inspects
                </span>
              </motion.div>
            </motion.div>

            {/* Right Side: Step 4 (Issue Resolved) */}
            <motion.div
              className="absolute z-20"
              style={{
                top: PIPELINE_LINES_Y[3],
                left: CX + RIGHT_WORKFLOW_ITEMS[1].offset,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, x: 30, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.5,
                type: 'spring',
                stiffness: 140,
                damping: 16,
              }}
            >
              <motion.div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-[0_4px_16px_rgba(16,185,129,0.12)] hover:shadow-lg transition-shadow cursor-default"
                animate={{
                  x: [0, -RIGHT_WORKFLOW_ITEMS[1].floatX * 0.4, RIGHT_WORKFLOW_ITEMS[1].floatX, 0],
                  y: [0, RIGHT_WORKFLOW_ITEMS[1].floatY, -RIGHT_WORKFLOW_ITEMS[1].floatY, 0],
                }}
                transition={{
                  duration: RIGHT_WORKFLOW_ITEMS[1].dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                  <div className="relative w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <svg
                      className="w-3 h-3 stroke-white stroke-[2.5]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-emerald-800 whitespace-nowrap">
                  Issue Resolved
                </span>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MASTER HERO MOTION GRAPHIC
   Infinite Seamless Loop Sequence:
   1) 0 - 4s: REALISTIC 3D ROTATING LOGO with "Ticket raised" Curved Indicator
   2) At 4s: Logo skews & shrinks down
   3) Enters Orbital Stage:
      - 4s - 8.2s: "Capturing Tickets..." (Orbit phase)
      - 8.2s - 12s: Avatars suck inside ring -> "Admin Inspects" (Converge phase)
      - 12s - 16.2s: Autonomous Support Pipeline (4 lines, 4 workflow cards, vertical track)
   4) Exactly 4 seconds after Phase 4 completes:
      Automatically restarts the entire animation cycle back from Phase 1!
══════════════════════════════════════════════════════ */
export function HeroMotionGraphic() {
  const [stage, setStage] = useState('logo'); // 'logo' | 'skewing' | 'orbital'
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    // Stage 1: Exact 4.0 seconds showcase (3D Rotating Logo + "Ticket raised")
    const shrinkTimer = setTimeout(() => {
      setStage('skewing');
    }, 4000);

    // Snappy 350ms shrink/skew transition directly into the Orbital Stage
    const orbitalTimer = setTimeout(() => {
      setStage('orbital');
    }, 4350);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(orbitalTimer);
    };
  }, [cycleKey]);

  // Called automatically 4 seconds after Phase 4 (Pipeline) finishes
  const handleLoopRestart = () => {
    setStage('logo');
    setCycleKey((prev) => prev + 1);
  };

  const manualReplay = () => {
    handleLoopRestart();
  };

  return (
    <div
      key={`hero-graphic-cycle-${cycleKey}`}
      className="relative w-full max-w-[620px] min-h-[540px] flex items-center justify-center select-none"
    >
      <AnimatePresence mode="wait">
        {stage !== 'orbital' ? (
          <motion.div
            key="stage-logo"
            onClick={manualReplay}
            className="relative w-full h-[500px] flex flex-col items-center justify-center cursor-pointer"
            style={{ perspective: 1200 }}
            initial={{ scale: 1, opacity: 1, skewX: 0, skewY: 0 }}
            animate={
              stage === 'logo'
                ? {
                    scale: 1,
                    opacity: 1,
                    skewX: 0,
                    skewY: 0,
                    transition: { duration: 0.4 },
                  }
                : {
                    scale: 0.08,
                    opacity: 0,
                    skewX: -20,
                    skewY: 10,
                    transition: {
                      duration: 0.35,
                      ease: [0.32, 0, 0.67, 0],
                    },
                  }
            }
          >
            {/* ── "Ticket raised" Curved Indicator & Associated Text Box ── */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* SVG Curved Line with Terminal Node (Matches Reference Arc & Dot) */}
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 620 500"
                fill="none"
              >
                {/* Curved connecting arc towards the 3D logo */}
                <motion.path
                  d="M 125 130 C 130 185, 175 235, 230 235"
                  stroke="rgba(99, 102, 241, 0.65)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                />

                {/* Pulsing Solid Dot at the end of the arc line */}
                <motion.circle
                  cx="230"
                  cy="235"
                  r="5.5"
                  fill="#6366f1"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.35, 1],
                    fill: ['#6366f1', '#818cf8', '#6366f1'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8,
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8))',
                  }}
                />
              </svg>

              {/* Floating Text Box: "Ticket raised" */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.25, type: 'spring', damping: 14 }}
                className="absolute left-10 sm:left-14 top-24 pointer-events-auto"
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-[0_6px_20px_rgba(99,102,241,0.15)] hover:shadow-lg transition-shadow"
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30" />
                    <div className="relative w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm" />
                  </div>
                  <span className="text-[12px] font-semibold text-slate-800 tracking-wide whitespace-nowrap">
                    Ticket raised
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* 3D Levitation & Elevation Tilt Wrapper */}
            <motion.div
              className="relative flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                y: [-7, 7, -7],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Realistic 3D Rotating Logo */}
              <motion.div
                className="w-72 h-72 sm:w-88 sm:h-88 lg:w-[380px] lg:h-[380px] relative flex items-center justify-center"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  rotateY: [360, 0],
                  rotateX: [8, 12, 8],
                }}
                transition={{
                  rotateY: {
                    duration: 4.8,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  rotateX: {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                {/* Ambient Soft Glow Behind Logo */}
                <div
                  className="absolute inset-4 rounded-full pointer-events-none -z-10"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(96,165,250,0.35) 0%, rgba(129,140,248,0.2) 50%, transparent 70%)',
                    filter: 'blur(35px)',
                  }}
                />

                {/* 3D Logo Front Face */}
                <img
                  src={logoImage}
                  alt="3D Brand Logo"
                  className="w-full h-full object-contain filter contrast-105"
                  style={{
                    opacity: 1,
                    backfaceVisibility: 'visible',
                    filter:
                      'drop-shadow(0 20px 30px rgba(59, 130, 246, 0.28)) drop-shadow(0 8px 12px rgba(99, 102, 241, 0.2))',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Dynamic 3D Contact Shadow on the Floor */}
            <motion.div
              className="w-48 sm:w-56 h-6 rounded-full bg-slate-900/15 blur-md -mt-2"
              animate={{
                scaleX: [1, 0.65, 1],
                scaleY: [1, 0.75, 1],
                opacity: [0.35, 0.2, 0.35],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        ) : (
          <div key="stage-orbital" className="relative w-full h-full" onClick={manualReplay}>
            <OrbitalStage onComplete={handleLoopRestart} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeroMotionGraphic;
