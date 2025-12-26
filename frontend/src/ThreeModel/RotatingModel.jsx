import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// Step 1: Component to Load and Rotate the GLB Model
// ----------------------------------------------------

function RotatingModel({ glbPath }) {
    const modelRef = useRef();
    
    // Load the 3D model (it retains its original material/color)
    const { scene } = useGLTF(glbPath);

    const originalScene = useMemo(() => {
        const clonedScene = scene.clone(true);
        // Center the model in the canvas space
        const box = new THREE.Box3().setFromObject(clonedScene);
        box.getCenter(clonedScene.position).multiplyScalar(-1);
        return clonedScene;
    }, [scene]);
    
    // useFrame is R3F's animation loop hook
    useFrame((state, delta) => {
        if (modelRef.current) {
            // Continuous rotation animation
            modelRef.current.rotation.y += delta * 0.15;
            modelRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });
    
    return (
        <primitive 
            object={originalScene} 
            ref={modelRef} 
            // 🚀 FIX 1: Decrease scale significantly. This makes the logo appear "smaller" in the 3D world, 
            // allowing the camera to be further back and see the entire logo even on a full-screen canvas.
            scale={5.0} 
            position={[0, 0, 0]} 
        />
    );
}

// ----------------------------------------------------
// Step 2: Main Component to Render the 3D Scene (Canvas)
// ----------------------------------------------------

const MatrixModel = ({ color = "green", size = 280, glbPath = "/genesis_logo.glb" }) => {
    const themes = {
        green: { color: "#22c55e", background: "#051208" },
        purple: { color: "#9333ea", background: "#15081f" },
    }
    const activeTheme = themes[color] || themes.green;
    
    // Use the dynamic 'size' prop for container width and height
    const containerStyle = { 
        width: size, 
        height: size, 
        boxShadow: `0 0 30px ${activeTheme.color}33`, 
        borderRadius: '8px'
    };

    return (
        <div 
            className="relative flex items-center justify-center perspective-[1200px] overflow-hidden" 
            style={containerStyle}
        >
            <Canvas 
                // 🚀 FIX 2: Move camera far back (increased from 3 to 10) to accommodate the smaller scaled model (0.15) 
                // and fill the large canvas without clipping the logo.
                camera={{ position: [0, 0, 10], fov: 75 }} 
                style={{ background: 'transparent' }} 
                gl={{ 
                    outputColorSpace: THREE.SRGBColorSpace,
                    alpha: true
                }}
            >
                {/* Lighting for general visibility of original materials */}
                <ambientLight intensity={1.5} /> 
                <directionalLight position={[0, 5, 5]} intensity={2.5} color="#ffffff" />
                <spotLight position={[5, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow color="#ffffff" />
                
                <Environment preset="night" />

                <RotatingModel glbPath={glbPath}  />
                
                <OrbitControls enableZoom={false}  enablePan={false} autoRotate={true} autoRotateSpeed={2} />
                
            </Canvas>
        </div>
    );
}

export default MatrixModel;