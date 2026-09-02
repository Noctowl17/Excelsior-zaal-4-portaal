"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Bandage } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { StadiumPlayer } from "./types";
import { PlayerStats } from "./PlayerStats";

// Geporteerd van het Lovable-ontwerp ("stadium-spirit"). Het ontwerp gebruikt
// een sprite-sheet met echte spelersfoto's; die hebben we nog niet, dus in
// plaats daarvan toont de kaart een nette placeholder met de initialen.
type PlayerCardProps = {
  player: StadiumPlayer;
  index: number;
  active: boolean;
  muted: boolean;
  introComplete: boolean;
  onActivate: (id: string | null) => void;
};

export function PlayerCard({ player, index, active, muted, introComplete, onActivate }: PlayerCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  useFrame(({ clock }, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;
    const delta = Math.min(rawDelta, 0.05);
    const time = clock.getElapsedTime();
    const entered = introComplete || reduceMotion;
    const baseHeight = entered ? 1.32 : -0.25;
    const float = reduceMotion ? 0 : Math.sin(time * 1.15 + index * 0.72) * 0.13;
    const targetHeight = baseHeight + float + (active ? 1.35 : 0);
    group.position.y += (targetHeight - group.position.y) * (1 - Math.exp(-7 * delta));
    const targetScale = active ? 1.18 : 1;
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-8 * delta));
  });

  const handleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 9,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * -7,
    });
  };

  return (
    <group ref={groupRef} position={player.coordinates}>
      <mesh position={[0, -1.18, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[active ? 1.3 : 0.85, 28]} />
        <meshBasicMaterial color="#00190f" transparent opacity={active ? 0.5 : 0.34} depthWrite={false} />
      </mesh>
      {/*
        distanceFactor schaalt de kaart mee met de 3D-afstand tot de camera —
        mooi voor het rustende "diepte"-gevoel, maar spelers die verder naar
        achteren staan (bv. de keeper) blijven daardoor bij hover/actief te
        klein om te lezen. Zodra een kaart actief is, laten we distanceFactor
        weg: dan rendert de kaart op zijn volle, vaste CSS-grootte
        (.player-card.is-active), ongeacht waar de speler op het veld staat.
      */}
      <Html center distanceFactor={active ? undefined : 16} zIndexRange={[50, 5]}>
        <motion.button
          type="button"
          className={`player-card ${active ? "is-active" : ""} ${muted ? "is-muted" : ""}`}
          // Let op: Motion beheert de volledige inline `transform` zodra er
          // geanimeerde transform-waarden (y, scale) zijn — een losse
          // `style={{ transform: ... }}` zou dan genegeerd worden. Met
          // `transformTemplate` combineren we onze eigen pointer-tilt met
          // Motion's gegenereerde transform.
          transformTemplate={(_, generated) => `perspective(700px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${generated}`}
          initial={reduceMotion ? false : { opacity: 0, y: 38, scale: 0.76 }}
          animate={introComplete || reduceMotion ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 155, damping: 16, delay: index * 0.075 }}
          onPointerMove={handleMove}
          onPointerLeave={() => {
            setTilt({ x: 0, y: 0 });
            if (window.matchMedia("(hover: hover)").matches) onActivate(null);
          }}
          onPointerEnter={() => {
            if (window.matchMedia("(hover: hover)").matches) onActivate(player.id);
          }}
          onClick={(event) => {
            event.stopPropagation();
            onActivate(active ? null : player.id);
          }}
          aria-expanded={active}
          aria-label={`${player.name}, rugnummer ${player.number ?? "-"}, ${player.position ?? ""}`}
        >
          <span className="card-sheen" aria-hidden="true" />
          <span className="portrait-wrap">
            {player.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- vaste portret-tegel in een 3D/Html-laag; geen next/image nodig.
              <img
                src={player.photoUrl}
                alt=""
                className="portrait-photo"
                loading="lazy"
              />
            ) : (
              <span className="portrait-placeholder" aria-hidden="true">
                <span className="portrait-initials">{player.initials}</span>
              </span>
            )}
            <span className="shirt-number">{player.number ?? "-"}</span>
            <span className="position-tag">{player.position ?? ""}</span>
            {player.injured && (
              <span className="injury-badge" title="Geblesseerd">
                <Bandage aria-hidden="true" />
                <span className="sr-only">Geblesseerd</span>
              </span>
            )}
          </span>
          <span className="player-identity">
            <strong>{player.name}</strong>
            <span>Basisploeg</span>
          </span>
          {active ? <PlayerStats player={player} /> : null}
        </motion.button>
      </Html>
    </group>
  );
}
