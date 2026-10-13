"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural 3D mango — slightly elongated sphere + stem + leaf.
 * No external asset required.
 *
 * Performance-tuned:
 *   - Sphere segments dropped from 64x64 to 32x32 (visually identical,
 *     1/4 the vertices).
 *   - MeshStandardMaterial instead of drei's MeshDistortMaterial — drops
 *     the per-frame shader compile/upload cost the distort introduces.
 *   - Animation loop is the same simple sin/rotation, no extra cost.
 */
export default function MangoMesh() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.4;
      group.current.position.y = Math.sin(t * 1.2) * 0.15;
    }
  });

  return (
    <group ref={group} scale={1.4}>
      {/* Body — elongated sphere */}
      <mesh scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#f59100"
          emissive="#a8560a"
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle red blush on top */}
      <mesh position={[0, 0.9, 0.2]} scale={[0.55, 0.35, 0.55]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color="#d94e1f"
          transparent
          opacity={0.45}
          roughness={0.6}
        />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.25, 12]} />
        <meshStandardMaterial color="#5a3a14" roughness={0.8} />
      </mesh>

      {/* Leaf */}
      <mesh
        position={[0.18, 1.45, 0]}
        rotation={[0, 0, -0.6]}
        scale={[0.5, 0.18, 0.05]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#3a9d3a"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
