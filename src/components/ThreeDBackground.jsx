import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Constants ───────────────────────────────────────────────
const NODES_PER_STRAND = 28;
const TURNS = 3.5;
const RADIUS = 0.9;
const HEIGHT = 5;

// Convert helix index to 3D position
function helixPos(i, total, offset = 0, r = RADIUS, h = HEIGHT) {
  const t = i / (total - 1);
  const angle = t * TURNS * Math.PI * 2 + offset;
  return new THREE.Vector3(
    Math.cos(angle) * r,
    (t - 0.5) * h,
    Math.sin(angle) * r
  );
}

// ─── Helix Strand (instanced spheres) ────────────────────────
function HelixStrand({ offset, color }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() =>
    Array.from({ length: NODES_PER_STRAND }, (_, i) =>
      helixPos(i, NODES_PER_STRAND, offset)
    ), [offset]);

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

// ─── Cross links (rungs of the helix ladder) ─────────────────
function HelixRungs() {
  const points = useMemo(() => {
    const pts = [];
    const stride = 3;
    for (let i = 0; i < NODES_PER_STRAND; i += stride) {
      const a = helixPos(i, NODES_PER_STRAND, 0);
      const b = helixPos(i, NODES_PER_STRAND, Math.PI);
      pts.push(a, b);
    }
    return pts;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#7c6dfa" transparent opacity={0.2} />
    </lineSegments>
  );
}

// ─── Strand connection lines ──────────────────────────────────
function HelixSpine({ offset, color }) {
  const points = useMemo(() =>
    Array.from({ length: NODES_PER_STRAND }, (_, i) =>
      helixPos(i, NODES_PER_STRAND, offset)
    ), [offset]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line_ geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line_>
  );
}

// ─── Helix group with rotation ────────────────────────────────
function DataHelix({ scrollY }) {
  const groupRef = useRef();

  const pos1 = useMemo(() => Array.from({ length: NODES_PER_STRAND }, (_, i) => helixPos(i, NODES_PER_STRAND, 0)), []);
  const pos2 = useMemo(() => Array.from({ length: NODES_PER_STRAND }, (_, i) => helixPos(i, NODES_PER_STRAND, Math.PI)), []);

  const geo1 = useMemo(() => new THREE.BufferGeometry().setFromPoints(pos1), [pos1]);
  const geo2 = useMemo(() => new THREE.BufferGeometry().setFromPoints(pos2), [pos2]);

  const rungPoints = useMemo(() => {
    const pts = [];
    const stride = 3;
    for (let i = 0; i < NODES_PER_STRAND; i += stride) {
      pts.push(helixPos(i, NODES_PER_STRAND, 0));
      pts.push(helixPos(i, NODES_PER_STRAND, Math.PI));
    }
    return pts;
  }, []);
  const rungGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(rungPoints), [rungPoints]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow rotation
    groupRef.current.rotation.y += delta * 0.25;
    // Gentle float
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    // On scroll: move right + fade
    const t = Math.min(scrollY / 500, 1);
    groupRef.current.position.x = 2.2 + t * 3;
    groupRef.current.scale.setScalar(1 - t * 0.5);
  });

  return (
    <group ref={groupRef} position={[2.2, 0, 0]}>
      {/* Strand spines */}
      <line_ geometry={geo1} frustumCulled={false}>
        <lineBasicMaterial color="#c8a96e" transparent opacity={0.15} />
      </line_>
      <line_ geometry={geo2} frustumCulled={false}>
        <lineBasicMaterial color="#7c6dfa" transparent opacity={0.15} />
      </line_>

      {/* Rungs */}
      <lineSegments geometry={rungGeo} frustumCulled={false}>
        <lineBasicMaterial color="#4ecdc4" transparent opacity={0.18} />
      </lineSegments>

      {/* Nodes */}
      <HelixStrand offset={0} color="#c8a96e" />
      <HelixStrand offset={Math.PI} color="#7c6dfa" />
    </group>
  );
}

// ─── Background particle field ────────────────────────────────
function ParticleField() {
  const ref = useRef();
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c8a96e" size={0.028} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

// ─── Main export ──────────────────────────────────────────────
export default function ThreeDBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      // Disable on low-end hardware (< 4 logical cores)
      setIsLowEnd(navigator.hardwareConcurrency < 4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);

    const onScroll = () => setScrollY(window.scrollY);
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
        <DataHelix scrollY={scrollY} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
