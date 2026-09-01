"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Geporteerd van het Lovable-ontwerp ("stadium-spirit"). De veldafmetingen en
// markeringen zijn ongewijzigd gelaten (het gaat om de visuele sfeer/het
// materiaal, niet om een exacte zaalvoetbalveld-tekening).

function PitchLine({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#d9f5c8" emissive="#9fca87" emissiveIntensity={0.12} roughness={0.62} />
    </mesh>
  );
}

function Goal({ z, rotation = 0 }: { z: number; rotation?: number }) {
  const posts = [-2.5, 2.5];
  return (
    <group position={[0, 0.15, z]} rotation-y={rotation}>
      {posts.map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.3, 10]} />
          <meshStandardMaterial color="#edf7e9" roughness={0.35} metalness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 5.08, 10]} />
        <meshStandardMaterial color="#edf7e9" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.15, 0.95]} rotation-x={0}>
        <planeGeometry args={[5, 2.25, 10, 5]} />
        <meshBasicMaterial color="#c8e7d5" wireframe transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function FootballPitch() {
  const grassTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#0b432d";
    context.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 8; row += 1) {
      context.fillStyle = row % 2 ? "rgba(19,91,61,.28)" : "rgba(3,48,31,.18)";
      context.fillRect(0, row * 32, 256, 32);
    }
    let seed = 17;
    for (let index = 0; index < 900; index += 1) {
      seed = (seed * 16807) % 2147483647;
      const x = seed % 256;
      seed = (seed * 16807) % 2147483647;
      const y = seed % 256;
      context.fillStyle = index % 2 ? "rgba(150,210,126,.09)" : "rgba(0,20,12,.11)";
      context.fillRect(x, y, 1, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  useEffect(() => () => grassTexture?.dispose(), [grassTexture]);

  return (
    <group>
      <mesh position={[0, -0.33, 0]} receiveShadow>
        <boxGeometry args={[20.8, 0.7, 32.8]} />
        <meshStandardMaterial color="#082c20" roughness={0.82} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[20, 32]} />
        <meshStandardMaterial map={grassTexture ?? undefined} color="#13613f" roughness={0.96} metalness={0.01} />
      </mesh>
      <group position-y={0.085}>
        <PitchLine position={[0, 0, -16]} size={[20.2, 0.05, 0.1]} />
        <PitchLine position={[0, 0, 16]} size={[20.2, 0.05, 0.1]} />
        <PitchLine position={[-10, 0, 0]} size={[0.1, 0.05, 32.1]} />
        <PitchLine position={[10, 0, 0]} size={[0.1, 0.05, 32.1]} />
        <PitchLine position={[0, 0, 0]} size={[20, 0.05, 0.09]} />
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[3.1, 0.055, 8, 72]} />
          <meshStandardMaterial color="#d9f5c8" emissive="#9fca87" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 18]} />
          <meshStandardMaterial color="#d9f5c8" />
        </mesh>
        {[1, -1].map((side) => (
          <group key={side} position={[0, 0, side * 12.2]}>
            <PitchLine position={[-5.5, 0, 0]} size={[0.09, 0.05, 7.5]} />
            <PitchLine position={[5.5, 0, 0]} size={[0.09, 0.05, 7.5]} />
            <PitchLine position={[0, 0, -side * 3.75]} size={[11, 0.05, 0.09]} />
            <PitchLine position={[-2.5, 0, side * 2.05]} size={[0.09, 0.05, 3.5]} />
            <PitchLine position={[2.5, 0, side * 2.05]} size={[0.09, 0.05, 3.5]} />
            <PitchLine position={[0, 0, side * 0.3]} size={[5, 0.05, 0.09]} />
          </group>
        ))}
      </group>
      <Goal z={-16.15} />
      <Goal z={16.15} rotation={Math.PI} />
    </group>
  );
}
