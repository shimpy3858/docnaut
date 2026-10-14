import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GoldCrown() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.2;
    group.current.rotation.x = Math.sin(t * 0.3) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Base ring */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.35, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} />
      </mesh>

      {/* Crown spikes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.05, 1.0]}>
              <coneGeometry args={[0.15, 0.55, 4]} />
              <meshStandardMaterial color="#F5D77A" metalness={1} roughness={0.15} />
            </mesh>
            {/* Gem on spike */}
            <mesh position={[0, 0.42, 1.0]}>
              <octahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#FF3366' : '#3366FF'}
                metalness={0.8}
                roughness={0.1}
                emissive={i % 2 === 0 ? '#FF3366' : '#3366FF'}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Top orb */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#F5D77A" metalness={1} roughness={0.1} emissive="#D4AF37" emissiveIntensity={0.2} />
      </mesh>

      {/* Center gem */}
      <mesh position={[0, -0.5, 1.0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#FF3366" metalness={0.6} roughness={0.1} emissive="#FF3366" emissiveIntensity={0.4} />
      </mesh>

      {/* Side gems */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.85, -0.5, 0.6]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#3366FF" metalness={0.6} roughness={0.1} emissive="#3366FF" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingDocument({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t + offset) * 0.3;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.5 + offset) * 0.1;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[0.5, 0.65]} />
      <meshStandardMaterial
        color="#FFF8E7"
        metalness={0.3}
        roughness={0.4}
        side={THREE.DoubleSide}
        emissive="#D4AF37"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function GoldParticles({ count = 80 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 0.5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#F5D77A"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function LightRays() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={2} color="#F5D77A" />
      <pointLight position={[-5, 3, -2]} intensity={1} color="#D4AF37" />
      <pointLight position={[0, -3, 5]} intensity={0.5} color="#2A0F4F" />
    </>
  );
}

function Scene({ onCrownClick }: { onCrownClick: () => void }) {
  const handleClick = (e: any) => {
    e.stopPropagation();
    onCrownClick();
  };

  return (
    <>
      <LightRays />
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <group onClick={handleClick} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
          <GoldCrown />
        </group>
      </Float>

      <FloatingDocument position={[-1.8, 0.5, -0.5]} rotation={[0.2, 0.5, -0.1]} />
      <FloatingDocument position={[1.5, -0.3, -0.8]} rotation={[-0.1, -0.4, 0.15]} />
      <FloatingDocument position={[0.5, 1.2, -1.5]} rotation={[0.3, 0.1, 0.05]} />
      <FloatingDocument position={[-1.2, -0.8, -1.0]} rotation={[-0.2, 0.3, -0.15]} />

      <GoldParticles count={60} />

      <Environment resolution={256}>
        <Lightformer form="ring" intensity={2} position={[0, 5, 0]} scale={3} color="#F5D77A" />
        <Lightformer form="circle" intensity={1} position={[-5, 2, 2]} scale={2} color="#D4AF37" />
        <Lightformer form="circle" intensity={1} position={[5, 2, -2]} scale={2} color="#FFF8E7" />
      </Environment>
    </>
  );
}

export function HeroScene({ onCrownClick, isLowEnd }: { onCrownClick: () => void; isLowEnd: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={isLowEnd ? 1 : [1, 2]}
      gl={{ antialias: !isLowEnd, alpha: true }}
      style={{ pointerEvents: 'auto' }}
    >
      <Suspense fallback={null}>
        <Scene onCrownClick={onCrownClick} />
      </Suspense>
    </Canvas>
  );
}
