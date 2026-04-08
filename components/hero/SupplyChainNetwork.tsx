import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

/* ── Smooth noise ─────────────────────────────────────────── */
function noise(x: number, y: number, t: number): number {
    return (
        Math.sin(x * 0.8 + t * 0.3) * Math.cos(y * 1.1 + t * 0.25) +
        Math.sin(x * 0.5 - y * 0.7 + t * 0.35) * 0.5
    ) * 0.5;
}

/* ── Network layout: Kenyan logistics hubs (fills full viewport) ─── */
const NODES: [number, number, number][] = [
    [0.0, 0.2, 2.0],      // 0  Nairobi (hub) — center
    [16.0, 0.15, -14.0],  // 1  Mombasa — top-right
    [-16.0, 0.2, -12.0],  // 2  Kisumu — top-left
    [-6.0, 0.25, 6.0],    // 3  Nakuru — mid-left
    [-14.0, 0.3, 10.0],   // 4  Eldoret — bottom-left
    [5.0, 0.2, 5.0],      // 5  Thika — mid-center
    [14.0, 0.15, 10.0],   // 6  Garissa — bottom-right
    [20.0, 0.1, -4.0],    // 7  Malindi — right edge
    [-4.0, 0.2, -16.0],   // 8  Naivasha — far top
    [9.0, 0.2, -4.0],     // 9  Machakos — mid-right
    [-16.0, 0.2, -2.0],   // 10 Kericho — left edge
    [4.0, 0.15, -18.0],   // 11 Kajiado — far top
    [-20.0, 0.2, 4.0],    // 12 Bungoma — far left
    [12.0, 0.2, 14.0],    // 13 Lamu — bottom-right
    [-12.0, 0.2, 13.0],   // 14 Kitale — bottom-left
    [18.0, 0.15, -20.0],  // 15 Wajir — top-right corner
    [-17.0, 0.2, -18.0],  // 16 Lodwar — top-left corner
    [0.0, 0.2, 14.0],     // 17 Nyeri — bottom-center
    [10.0, 0.2, -22.0],   // 18 Moyale — far top-right
    [-10.0, 0.2, -22.0],  // 19 Marsabit — far top-left
    [0.0, 0.2, -24.0],    // 20 Turkana — very top center
];

const ROUTES: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [0, 9], [0, 8],
    [1, 7], [2, 4], [3, 4], [5, 6], [3, 2], [1, 6],
    [4, 10], [3, 10], [9, 11], [8, 11], [9, 1], [8, 10],
    [10, 12], [4, 14], [6, 13], [1, 15], [2, 16], [0, 11],
    [12, 16], [15, 11], [14, 17], [13, 17], [5, 17], [0, 17],
    [7, 15], [12, 14], [3, 14], [6, 7],
    [15, 18], [16, 19], [18, 20], [19, 20], [11, 20], [8, 20],
    [18, 1], [19, 2], [20, 8],
];

/* ── Pre-computed curves & particle configs ───────────────── */
function buildCurve(a: [number, number, number], b: [number, number, number]) {
    const dx = Math.abs(a[0] - b[0]);
    const dz = Math.abs(a[2] - b[2]);
    const arcHeight = 0.8 + (dx + dz) * 0.07;
    return new THREE.CatmullRomCurve3([
        new THREE.Vector3(...a),
        new THREE.Vector3((a[0] + b[0]) / 2, Math.max(a[1], b[1]) + arcHeight, (a[2] + b[2]) / 2),
        new THREE.Vector3(...b),
    ]);
}

const CURVES = ROUTES.map(([a, b]) => buildCurve(NODES[a], NODES[b]));

const PARTICLES = ROUTES.flatMap((_, i) => [
    { curveIdx: i, speed: 0.04 + (i % 7) * 0.008, offset: (i * 0.31) % 1 },
    { curveIdx: i, speed: 0.035 + ((i + 4) % 7) * 0.007, offset: ((i * 0.31) + 0.5) % 1 },
]);

/* ── Wave Mesh — subtle on light bg ──────────────────────── */
const WaveMesh: React.FC = () => {
    const geoRef = useRef<THREE.PlaneGeometry>(null!);

    const basePositions = useMemo(() => {
        const geo = new THREE.PlaneGeometry(100, 100, 80, 80);
        return new Float32Array(geo.attributes.position.array);
    }, []);

    useFrame(({ clock }) => {
        if (!geoRef.current) return;
        const t = clock.getElapsedTime();
        const arr = geoRef.current.attributes.position.array as Float32Array;
        for (let i = 0; i < geoRef.current.attributes.position.count; i++) {
            arr[i * 3 + 2] = noise(basePositions[i * 3], basePositions[i * 3 + 1], t) * 0.2;
        }
        geoRef.current.attributes.position.needsUpdate = true;
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -5]}>
            <planeGeometry ref={geoRef} args={[100, 100, 80, 80]} />
            <meshBasicMaterial color="#059669" wireframe transparent opacity={0.08} />
        </mesh>
    );
};

/* ── Network node — visible on light bg ──────────────────── */
const NetworkNode: React.FC<{ position: [number, number, number]; index: number }> = ({ position, index }) => {
    const coreRef = useRef<THREE.Mesh>(null!);
    const haloRef = useRef<THREE.Mesh>(null!);
    const phase = index * 1.7;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const pulse = Math.sin(t * 0.8 + phase) * 0.5 + 0.5;
        const s = 1 + pulse * 0.15;
        if (coreRef.current) coreRef.current.scale.setScalar(s);
        if (haloRef.current) {
            haloRef.current.scale.setScalar(1 + pulse * 0.3);
            (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + pulse * 0.06;
        }
    });

    return (
        <group position={position}>
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.35, 24, 24]} />
                <meshBasicMaterial color="#059669" transparent opacity={0.85} />
            </mesh>
            <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.85, 32]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

/* ── Route line ───────────────────────────────────────────── */
const RouteLine: React.FC<{ curve: THREE.CatmullRomCurve3 }> = ({ curve }) => {
    const points = useMemo(() => curve.getPoints(64), [curve]);
    return <Line points={points} color="#10b981" lineWidth={2.5} transparent opacity={0.28} />;
};

/* ── Smooth traveling particle ────────────────────────────── */
const Particle: React.FC<{
    curve: THREE.CatmullRomCurve3;
    speed: number;
    offset: number;
}> = ({ curve, speed, offset }) => {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const raw = ((clock.getElapsedTime() * speed + offset) % 1 + 1) % 1;
        const point = curve.getPointAt(raw);
        ref.current.position.copy(point);
        const fade = raw < 0.06 ? raw / 0.06 : raw > 0.94 ? (1 - raw) / 0.06 : 1;
        (ref.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.8;
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
        </mesh>
    );
};

/* ── Mouse parallax camera rig ────────────────────────────── */
const CameraRig: React.FC = () => {
    const { camera } = useThree();
    const mouse = useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    useFrame(() => {
        const tx = mouse.current.x * 1.5;
        const ty = 13 + mouse.current.y * -0.5;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.015);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.015);
        camera.lookAt(0, 0, -8);
    });

    return null;
};

/* ── Main scene ───────────────────────────────────────────── */
const Scene: React.FC = () => (
    <>
        <CameraRig />
        <WaveMesh />

        {NODES.map((pos, i) => (
            <NetworkNode key={i} position={pos} index={i} />
        ))}

        {CURVES.map((c, i) => (
            <RouteLine key={`r-${i}`} curve={c} />
        ))}

        {PARTICLES.map((p, i) => (
            <Particle key={i} curve={CURVES[p.curveIdx]} speed={p.speed} offset={p.offset} />
        ))}
    </>
);

/* ── Exported canvas wrapper — transparent bg ─────────────── */
const SupplyChainNetwork: React.FC = () => (
    <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 13, 22], fov: 70, near: 0.1, far: 200 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
    >
        <Scene />
    </Canvas>
);

export default SupplyChainNetwork;
