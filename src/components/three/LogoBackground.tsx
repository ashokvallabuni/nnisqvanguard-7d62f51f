import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Float, Sparkles, Lightformer, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------------------------------
// ERROR BOUNDARY
// ----------------------------------------------------------------------------
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
 constructor(props: any) {
 super(props);
 this.state = { hasError: false };
 }
 static getDerivedStateFromError(error: any) {
 return { hasError: true };
 }
 componentDidCatch(error: any, errorInfo: any) {
 console.error("3D LogoBackground crashed:", error, errorInfo);
 }
 render() {
 if (this.state.hasError) {
 return this.props.fallback;
 }
 return this.props.children;
 }
}

// ----------------------------------------------------------------------------
// SCENE COMPONENT (Must be inside Canvas)
// ----------------------------------------------------------------------------
function LogoScene() {
 const meshRef = useRef<THREE.Mesh>(null);
 const texture = useTexture('/assets/nisq-logo.jpeg');
 
 // Custom material for brushed-chrome look
 const material = useMemo(() => {
 return new THREE.MeshPhysicalMaterial({
 map: texture,
 alphaMap: texture,
 alphaTest: 0.1,
 roughness: 0.25,
 metalness: 1.0,
 clearcoat: 1.0,
 clearcoatRoughness: 0.2,
 color: '#ffffff',
 emissive: new THREE.Color('#20D9F5').multiplyScalar(0.05),
 transparent: true,
 opacity: 0.95,
 side: THREE.DoubleSide
 });
 }, [texture]);

 // Pointer parallax + time-based slow rotation
 useFrame((state) => {
 if (meshRef.current) {
 const t = state.clock.getElapsedTime();
 
 // Calculate target rotations (+-12 degrees is ~0.2 radians)
 const targetY = (state.pointer.x * Math.PI) / 15 + Math.sin(t / 2) * 0.1;
 const targetX = -(state.pointer.y * Math.PI) / 15 + Math.cos(t / 2) * 0.05;
 
 meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.05);
 meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.05);
 }
 });

 return (
 <>
 {/* Lighting */}
 <ambientLight intensity={0.1} color="#05070B" />
 {/* Cyan Rim Light */}
 <directionalLight position={[5, 5, -5]} intensity={2.0} color="#20D9F5" />
 {/* Violet Fill Light */}
 <directionalLight position={[-5, -5, 5]} intensity={1.0} color="#8B5CF6" />
 
 {/* Local Environment via Lightformers */}
 <Environment resolution={256}>
 <group rotation={[-Math.PI / 4, -0.3, 0]}>
 <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
 <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
 <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
 <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
 </group>
 </Environment>

 {/* Floating Logo */}
 <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
 <mesh ref={meshRef} material={material}>
 <planeGeometry args={[10, 10, 32, 32]} />
 </mesh>
 </Float>

 {/* Drifting Cyan Particles */}
 <Sparkles count={60} scale={15} size={2} speed={0.4} opacity={0.25} color="#20D9F5" />
 </>
 );
}

// ----------------------------------------------------------------------------
// STATIC FALLBACK
// ----------------------------------------------------------------------------
const StaticFallback = () => (
 <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none mix-blend-screen">
 <img 
 src="/hero-wolf.png" 
 alt="NISQ Vanguard" 
 className="w-[80vw] max-w-[800px] h-auto object-contain rounded-full shadow-[0_0_50px_rgba(32,217,245,0.4)]"
 onError={(e) => { e.currentTarget.style.display = 'none'; }}
 />
 </div>
);

// ----------------------------------------------------------------------------
// WRAPPER (Client Only + Error Boundary)
// ----------------------------------------------------------------------------
export default function LogoBackground() {
 const [mounted, setMounted] = useState(false);
 const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

 useEffect(() => {
 setMounted(true);
 }, []);

 // SSR Check & Reduced Motion Check
 if (!mounted || prefersReducedMotion) {
 return <StaticFallback />;
 }

 // WebGL Availability Check
 try {
 const canvas = document.createElement('canvas');
 const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
 if (!gl) return <StaticFallback />;
 } catch (e) {
 return <StaticFallback />;
 }

 return (
 <div 
 className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-50"
 >
 <ErrorBoundary fallback={<StaticFallback />}>
 <Suspense fallback={null}>
 <Canvas
 dpr={[1, 1.5]}
 camera={{ position: [0, 0, 15], fov: 45 }}
 gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
 >
 {/* Auto-pause when off-screen via Framer/IntersectionObserver (frameloop="demand" requires explicit invalidation, 
 so we use "always" if we want animation, but we'll optimize by letting R3F handle it or using `frameloop="always"` 
 since `useFrame` runs constantly. Actually, we'll use "always" and rely on `React.lazy` pausing when unmounted, 
 or frameloop="always" default with performance scaling. 
 Wait, for `frameloop="always"`, we can let Drei's PerformanceMonitor handle it, or just use default. */}
 <LogoScene />
 </Canvas>
 </Suspense>
 </ErrorBoundary>
 </div>
 );
}
