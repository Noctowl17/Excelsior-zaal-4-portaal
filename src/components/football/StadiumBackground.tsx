"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Geporteerd van het Lovable-ontwerp ("stadium-spirit"), ongewijzigd: sfeerlicht,
// stadionmasten en zwevend stof rond het veld.

export function StadiumBackground() {
  const dustRef = useRef<THREE.Points>(null);
  const dust = useMemo(() => {
    const values = new Float32Array(90 * 3);
    let seed = 43;
    for (let index = 0; index < 90; index += 1) {
      seed = (seed * 16807) % 2147483647;
      values[index * 3] = ((seed % 1000) / 1000 - 0.5) * 38;
      seed = (seed * 16807) % 2147483647;
      values[index * 3 + 1] = 1 + ((seed % 1000) / 1000) * 14;
      seed = (seed * 16807) % 2147483647;
      values[index * 3 + 2] = ((seed % 1000) / 1000 - 0.5) * 46;
    }
    return values;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!dustRef.current) return;
    dustRef.current.rotation.y += Math.min(delta, 0.05) * 0.009;
    dustRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.18) * 0.18;
  });

  return (
    <group>
      <mesh position={[0, -1.45, 0]}>
        <cylinderGeometry args={[28, 28, 2.2, 48, 1, true]} />
        <meshStandardMaterial color="#04120f" side={THREE.BackSide} roughness={0.94} />
      </mesh>
      {[
        [-15, 7, -20],
        [15, 7, -20],
        [-15, 7, 20],
        [15, 7, 20],
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh position-y={-3.5} castShadow>
            <boxGeometry args={[0.18, 7, 0.18]} />
            <meshStandardMaterial color="#173129" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh rotation-x={-0.3}>
            <boxGeometry args={[4.4, 0.25, 1.25]} />
            <meshStandardMaterial color="#d9f7df" emissive="#b9ffd3" emissiveIntensity={2.4} />
          </mesh>
          <pointLight color="#caffdb" intensity={28} distance={24} decay={2} />
        </group>
      ))}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#d8f4cb" size={0.055} transparent opacity={0.42} depthWrite={false} />
      </points>
    </group>
  );
}
