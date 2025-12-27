import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

// ----------------------------------------------------
// 🚀 Phoenix Loader with Smooth Fade
// ----------------------------------------------------
function PhoenixLoader({ minTimeReached }) {
  const { progress } = useProgress();
  const visualProgress = minTimeReached ? progress : Math.min(progress, 90);

  return (
    <Html center>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center w-64 md:w-96 font-mono select-none"
      >
        <div className="flex justify-between w-full mb-2 text-[10px] md:text-xs tracking-[0.3em] text-cyan-400 uppercase opacity-80">
          <span>Initializing Phoenix</span>
          <span>{Math.round(visualProgress)}%</span>
        </div>
        
        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(6,182,212,0.6)]"
            style={{ width: `${visualProgress}%` }}
          />
        </div>

        <div className="mt-4 text-white text-sm md:text-lg font-black tracking-tighter uppercase animate-pulse">
          Phoenix Coming<span className="text-cyan-400">...</span>
        </div>
      </motion.div>
    </Html>
  );
}

// ----------------------------------------------------
// Model Component with Fade-In
// ----------------------------------------------------
function RotatingModel({ glbPath, onLoaded, isVisible }) {
    const modelRef = useRef();
    const { scene } = useGLTF(glbPath, DRACO_URL);

    useEffect(() => {
        if (scene) onLoaded();
    }, [scene, onLoaded]);

    const originalScene = useMemo(() => {
        const clonedScene = scene.clone(true);
        clonedScene.background = null;
        
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        clonedScene.position.sub(center);
        
        // Initialize with 0 opacity if model supports it, 
        // but we'll use a group fade-in for better reliability.
        return clonedScene;
    }, [scene]);

    useFrame((state, delta) => {
        state.scene.background = null;
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.15;
            modelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
            
            // Smoothly ramp up scale as a secondary fade effect
            const targetScale = isVisible ? 5.0 : 0;
            modelRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
        }
    });

    return (
        <group ref={modelRef}>
            <primitive object={originalScene} />
        </group>
    );
}

// ----------------------------------------------------
// Main Scene Controller
// ----------------------------------------------------
const MatrixModel = ({ size = 280, glbPath = "/genesis_logo.glb" }) => {
    const [modelReady, setModelReady] = useState(false);
    const [minTimeReached, setMinTimeReached] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMinTimeReached(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const isFullyReady = modelReady && minTimeReached;

    return (
        <div 
            className="relative flex items-center justify-center overflow-hidden"
            style={{ width: size, height: size, background: 'transparent' }}
        >
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                style={{ background: 'transparent' }} 
                gl={{
                    alpha: true,
                    powerPreference: "high-performance",
                    antialias: false,
                    premultipliedAlpha: false 
                }}
                onCreated={({ gl, scene }) => {
                    scene.background = null;
                    gl.setClearColor(0x000000, 0); 
                }}
                dpr={window.devicePixelRatio > 1 ? 2 : 1}
            >
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 5, 5]} intensity={2.5} />
                <Environment preset="night" background={false} />

                <Suspense fallback={null}>
                    <RotatingModel 
                        glbPath={glbPath} 
                        onLoaded={() => setModelReady(true)} 
                        isVisible={isFullyReady}
                    />
                </Suspense>

                {/* 🚀 AnimatePresence handles the exit animation of the loader */}
                <AnimatePresence>
                    {!isFullyReady && (
                        <PhoenixLoader key="loader" minTimeReached={minTimeReached} />
                    )}
                </AnimatePresence>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={2} />
            </Canvas>
        </div>
    );
}

useGLTF.preload("/genesis_logo.glb", DRACO_URL);

export default MatrixModel;