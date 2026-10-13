"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls } from "@react-three/drei";
import MangoMesh from "./MangoMesh";

/**
 * Slim 3D mango scene. Trimmed for performance:
 *   - No <Environment preset="sunset"> (saved ~1MB HDR download).
 *   - dpr capped at 1.5 (down from [1,2]) — still crisp on retina.
 *   - frameloop="demand" + autoRotate via OrbitControls means we only
 *     re-render when the user interacts; static otherwise.
 *   - Three studio lights instead of the HDR — runs on integrated GPUs.
 */
export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.5, 5], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.6}
        color="#fff7e8"
        castShadow
      />
      <directionalLight
        position={[-4, 4, 3]}
        intensity={0.45}
        color="#ffd27a"
      />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#ffb01f" />

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <MangoMesh />
      </Float>

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.4}
        scale={8}
        blur={2.4}
        far={4}
        color="#7a3f0d"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
