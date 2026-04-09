import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, PerspectiveCamera, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group position={[5, 0, -5]}>
      <Sphere ref={meshRef} args={[3, 64, 64]}>
        <meshStandardMaterial
          color="#00f2ff"
          wireframe
          transparent
          opacity={0.1}
        />
      </Sphere>
      <Sphere args={[2.95, 64, 64]}>
        <meshStandardMaterial
          color="#001122"
          transparent
          opacity={0.5}
        />
      </Sphere>
    </group>
  );
}

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color="#00f2ff"
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive="#0088ff"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

function DataLines() {
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 40; i++) {
      const start = [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      ];
      const end = [
        start[0] + (Math.random() - 0.5) * 10,
        start[1] + (Math.random() - 0.5) * 10,
        start[2] + (Math.random() - 0.5) * 10
      ];
      temp.push([start, end]);
    }
    return temp;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line 
          key={i} 
          points={points as [number, number, number][]} 
          color="#00f2ff" 
          transparent 
          opacity={0.05} 
          lineWidth={0.5}
        />
      ))}
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088ff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Globe />
        <AnimatedSphere />
        <DataLines />
        
        <Environment preset="city" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
}
