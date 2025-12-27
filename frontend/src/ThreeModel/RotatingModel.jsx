import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Corrected Draco URL
const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

function LoadingPlaceholder() {
    const mesh = useRef();
    useFrame(() => {
        if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    });
    return (
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
            <mesh ref={mesh} scale={2}>
                <octahedronGeometry args={[1, 0]} />
                <MeshDistortMaterial color="#0dcaf0" speed={2} distort={0.4} radius={1} wireframe />
            </mesh>
        </Float>
    );
}

function RotatingModel({ glbPath }) {
    const modelRef = useRef();
    const { scene } = useGLTF(glbPath, DRACO_URL);

    const originalScene = useMemo(() => {
        const clonedScene = scene.clone(true);
        // Safety: ensure cloned scene has no background property
        clonedScene.background = null;
        const box = new THREE.Box3().setFromObject(clonedScene);
        box.getCenter(clonedScene.position).multiplyScalar(-1);
        return clonedScene;
    }, [scene]);

    useFrame((state, delta) => {
        // 🚀 BRUTE FORCE FIX: Force scene background to null every frame
        // This stops the "turn to white" bug even if it tries to trigger
        state.scene.background = null;

        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.15;
            modelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    return <primitive object={originalScene} ref={modelRef} scale={5.0} position={[0, 0, 0]} />;
}

const MatrixModel = ({ color = "green", size = 280, glbPath = "/genesis_logo.glb" }) => {


    return (
        <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                width: size,
                height: size,
                borderRadius: '8px',
                background: 'transparent' // CSS Level Force
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                // 🚀 Keep style transparent so the HTML background shows through
                style={{ background: 'transparent' }}
                performance={{ min: 0.5 }}
                gl={{
                    powerPreference: "high-performance",
                    failIfMajorPerformanceCaveat: false,
                    // 🚀 CRITICAL FOR TRANSPARENCY
                    alpha: true,
                    premultipliedAlpha: false
                }}
                onCreated={({ gl, scene }) => {
                    // 🚀 Do NOT set a solid background color here
                    gl.setClearColor(0x000000, 0); // The '0' is the opacity (fully transparent)
                    scene.background = null; // Ensure the scene doesn't have a background color
                }}
                dpr={1}
            >
                <ambientLight intensity={1.5} />
                <directionalLight position={[0, 5, 5]} intensity={2.5} color="#ffffff" />
                <spotLight position={[5, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow color="#ffffff" />

                {/* Fixed Environment: background={false} is critical */}
                <Environment preset="night" background={false} />

                <Suspense fallback={<LoadingPlaceholder />}>
                    <RotatingModel glbPath={glbPath} />
                </Suspense>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={2} />
            </Canvas>
        </div>
    );
}

useGLTF.preload("/genesis_logo.glb", DRACO_URL);

export default MatrixModel;