import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Float, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function Logo3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/assets/nisq-logo.jpeg');

  // Create a custom material that looks like brushed chrome
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      color: '#ffffff',
      emissive: new THREE.Color('#20D9F5').multiplyScalar(0.05),
      transparent: true,
      opacity: 0.9,
    });
  }, [texture]);

  useFrame((state) => {
    if (meshRef.current) {
      // Very slow rotation tied to time and pointer
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (state.pointer.x * Math.PI) / 10 + Math.sin(t / 2) * 0.1,
        0.05
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        -(state.pointer.y * Math.PI) / 10 + Math.cos(t / 2) * 0.05,
        0.05
      );
    }
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.2} color="#05070B" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#20D9F5" />
        <directionalLight position={[-5, -5, 2]} intensity={0.5} color="#8B5CF6" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh ref={meshRef} material={material}>
            <planeGeometry args={[10, 10, 32, 32]} />
          </mesh>
        </Float>

        <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.2} color="#20D9F5" />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
