import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Constants ───────────────────────────────────────────────
const NODES_PER_STRAND = 28;
const TURNS = 3.5;
const RADIUS = 0.9;
const HEIGHT = 5;

function helixPos(i, total, offset = 0, r = RADIUS, h = HEIGHT) {
  const t = i / (total - 1);
  const angle = t * TURNS * Math.PI * 2 + offset;
  return new THREE.Vector3(Math.cos(angle) * r, (t - 0.5) * h, Math.sin(angle) * r);
}

// ─── Helix nodes ─────────────────────────────────────────────
function HelixStrand({ offset, color }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() =>
    Array.from({ length: NODES_PER_STRAND }, (_, i) => helixPos(i, NODES_PER_STRAND, offset)),
  [offset]);

  useEffect(() => {
    if (!meshRef.current) return;
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    positions.forEach((pos, i) => {
      const pulse = 1 + Math.sin(t * 1.5 + i * 0.4) * 0.12;
      dummy.position.copy(pos);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, NODES_PER_STRAND]} frustumCulled={false}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </instancedMesh>
  );
}

// ─── Helix group — reads scrollY from a ref to avoid stale closures ───
function DataHelix({ scrollYRef }) {
  const groupRef = useRef();
  const lerpedScroll = useRef(0);

  const pos1 = useMemo(() => Array.from({ length: NODES_PER_STRAND }, (_, i) => helixPos(i, NODES_PER_STRAND, 0)), []);
  const pos2 = useMemo(() => Array.from({ length: NODES_PER_STRAND }, (_, i) => helixPos(i, NODES_PER_STRAND, Math.PI)), []);
  const geo1 = useMemo(() => new THREE.BufferGeometry().setFromPoints(pos1), [pos1]);
  const geo2 = useMemo(() => new THREE.BufferGeometry().setFromPoints(pos2), [pos2]);

  const rungPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < NODES_PER_STRAND; i += 3) {
      pts.push(helixPos(i, NODES_PER_STRAND, 0));
      pts.push(helixPos(i, NODES_PER_STRAND, Math.PI));
    }
    return pts;
  }, []);
  const rungGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(rungPoints), [rungPoints]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Smooth lerp toward real scroll — no stale state, no reset
    lerpedScroll.current += (scrollYRef.current - lerpedScroll.current) * Math.min(delta * 3.5, 1);

    groupRef.current.rotation.y += delta * 0.25;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;

    const t = Math.min(lerpedScroll.current / 600, 1);
    groupRef.current.position.x = 2.2 + t * 3.5;
    groupRef.current.scale.setScalar(1 - t * 0.55);
  });

  return (
    <group ref={groupRef} position={[2.2, 0, 0]}>
      <line_ geometry={geo1} frustumCulled={false}>
        <lineBasicMaterial color="#c8a96e" transparent opacity={0.15} />
      </line_>
      <line_ geometry={geo2} frustumCulled={false}>
        <lineBasicMaterial color="#7c6dfa" transparent opacity={0.15} />
      </line_>
      <lineSegments geometry={rungGeo} frustumCulled={false}>
        <lineBasicMaterial color="#4ecdc4" transparent opacity={0.18} />
      </lineSegments>
      <HelixStrand offset={0} color="#c8a96e" />
      <HelixStrand offset={Math.PI} color="#7c6dfa" />
    </group>
  );
}

// ─── Galaxy: tiny distant stars ───────────────────────────────
function StarField({ count, spread, size, color, speed }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * spread[0];
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2] - 4;
    }
    return arr;
  }, [count, spread]);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    ref.current.material.opacity = 0.35 + 0.2 * Math.sin(state.clock.elapsedTime * 0.6 + phase);
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}

// ─── Galaxy: nebula cluster blobs ────────────────────────────
function NebulaCluster({ center, color, count = 30, spread = 2 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = center[0] + (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = center[1] + (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = center[2] + (Math.random() - 0.5) * spread * 0.4;
    }
    return arr;
  }, [center, count, spread]);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.004;
    ref.current.material.opacity = 0.22 + 0.12 * Math.sin(state.clock.elapsedTime * 0.45 + phase);
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.14} sizeAttenuation transparent opacity={0.28} depthWrite={false} />
    </points>
  );
}

// ─── Main export ──────────────────────────────────────────────
export default function ThreeDBackground() {
  const scrollYRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLowEnd(navigator.hardwareConcurrency < 4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Write to ref — no setState, no re-renders, no stale closures
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (isMobile || isLowEnd) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        frameloop="always"
      >
        {/* Galaxy star layers */}
        <StarField count={350} spread={[28, 18, 10]} size={0.012} color="#c8d8ff" speed={0.0004} />
        <StarField count={120} spread={[22, 14, 8]}  size={0.028} color="#ffffff"  speed={0.0003} />
        <StarField count={70}  spread={[18, 12, 6]}  size={0.020} color="#c8a96e"  speed={0.0005} />
        <StarField count={50}  spread={[16, 10, 5]}  size={0.018} color="#7c6dfa"  speed={0.0002} />

        {/* Nebula clusters */}
        <NebulaCluster center={[-5, 2, -4]}  color="#7c6dfa" count={35} spread={2.2} />
        <NebulaCluster center={[5, -3, -3]}  color="#c8a96e" count={28} spread={1.8} />
        <NebulaCluster center={[-2, -4, -5]} color="#4ecdc4" count={22} spread={1.5} />

        {/* DNA Helix */}
        <DataHelix scrollYRef={scrollYRef} />
      </Canvas>
    </div>
  );
}
