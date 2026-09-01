"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FootballPitch } from "./FootballPitch";
import { Formation } from "./Formation";
import { StadiumBackground } from "./StadiumBackground";
import type { StadiumPlayer } from "./types";
import "./football.css";

// Geporteerd van het Lovable-ontwerp ("stadium-spirit") en aangepast voor
// Excelsior'31 4: de decoratieve navigatiebalk uit het ontwerp is weggelaten
// (de site heeft al een eigen header/navigatie erboven), de spelersfoto's
// zijn vervangen door initialen-placeholders, en de teksten zijn vertaald.
// Dit component is bewust een losstaande, client-only 3D-scene: hij wordt
// vanaf de homepage geladen via `next/dynamic` met `ssr: false`.

function CinematicCamera({ introComplete }: { introComplete: boolean }) {
  const { camera, pointer, size } = useThree();
  const started = useRef(false);
  const elapsed = useRef(0);
  const reduceMotion = useReducedMotion();
  const lookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, reduceMotion ? 25 : 8, reduceMotion ? 28 : 43);
    started.current = true;
  }, [camera, reduceMotion]);

  useFrame(({ clock }, rawDelta) => {
    if (!started.current) return;
    const delta = Math.min(rawDelta, 0.05);
    elapsed.current += delta;
    const mobile = size.width < 700;
    const progress = reduceMotion ? 1 : Math.min(elapsed.current / 2.55, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const base = mobile ? new THREE.Vector3(0, 31, 33) : new THREE.Vector3(13.5, 24, 27.5);
    const introStart = new THREE.Vector3(0, 8, 43);
    const target = introStart.lerp(base, eased);
    const drift = introComplete && !reduceMotion ? Math.sin(clock.getElapsedTime() * 0.22) * 0.32 : 0;
    target.x += pointer.x * (mobile ? 0.35 : 1.15) + drift;
    target.y += pointer.y * (mobile ? 0.25 : 0.62);
    camera.position.lerp(target, 1 - Math.exp(-4.2 * delta));
    lookAt.current.set(pointer.x * 0.45, 0, pointer.y * -0.65);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function Scene({
  players,
  activeId,
  introComplete,
  onActivate,
}: {
  players: StadiumPlayer[];
  activeId: string | null;
  introComplete: boolean;
  onActivate: (id: string | null) => void;
}) {
  return (
    <>
      <color attach="background" args={["#020a08"]} />
      <fogExp2 attach="fog" args={["#020a08", 0.018]} />
      <ambientLight intensity={0.34} color="#7dbda1" />
      <hemisphereLight args={["#bfffd7", "#02120b", 0.78]} />
      <directionalLight
        position={[7, 18, 10]}
        intensity={2.4}
        color="#e7ffe9"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <Environment resolution={64}>
        <Lightformer intensity={1.8} color="#caffd9" position={[0, 10, -10]} scale={[14, 4, 1]} />
        <Lightformer intensity={0.65} color="#f4c870" position={[-12, 4, 4]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
      </Environment>
      <CinematicCamera introComplete={introComplete} />
      <StadiumBackground />
      <FootballPitch />
      <Formation players={players} activeId={activeId} introComplete={introComplete} onActivate={onActivate} />
    </>
  );
}

type FootballExperienceProps = {
  players: StadiumPlayer[];
  clubName: string;
  formationLabel: string;
  seasonLabel: string;
};

export function FootballExperience({ players, clubName, formationLabel, seasonLabel }: FootballExperienceProps) {
  const reduceMotion = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(Boolean(reduceMotion));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => setIntroComplete(true), 1850);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <div className="football-world" onClick={() => activeId && setActiveId(null)}>
      <div className="pitch-canvas" aria-hidden="true">
        <Canvas shadows dpr={[1, 1.65]} camera={{ position: [0, 8, 43], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            <Scene players={players} activeId={activeId} introComplete={introComplete} onActivate={setActiveId} />
          </Suspense>
        </Canvas>
      </div>
      <div className="world-vignette" aria-hidden="true" />
      <AnimatePresence>
        {!introComplete && !reduceMotion ? (
          <motion.div className="intro-curtain" exit={{ opacity: 0 }} transition={{ duration: 0.85 }}>
            <motion.div className="light-beam light-beam-left" animate={{ opacity: [0, 0.8, 0.25] }} transition={{ duration: 1.4, times: [0, 0.35, 1] }} />
            <motion.div className="light-beam light-beam-right" animate={{ opacity: [0, 0.8, 0.25] }} transition={{ duration: 1.4, times: [0, 0.45, 1] }} />
            <span className="intro-kicker">{clubName} · Selectie</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.header
        className={`squad-heading ${activeId ? "is-muted" : ""}`}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={introComplete || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.72, delay: 0.18 }}
      >
        <p>
          <span /> {formationLabel} <span />
        </p>
        <h1>De basisploeg</h1>
        <span className="squad-subtitle">Beweeg over een speler voor de cijfers dit seizoen</span>
      </motion.header>
      <div className="pitch-caption" aria-hidden="true">
        <span>Basisopstelling</span>
        <span>{seasonLabel}</span>
      </div>
    </div>
  );
}
