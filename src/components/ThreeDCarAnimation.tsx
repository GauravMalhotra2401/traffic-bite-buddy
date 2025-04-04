
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Group } from 'three';

function Car(props: any) {
  const group = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (group.current) {
      // Create a bouncing animation
      group.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05;
      // Gentle rotation
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <group ref={group} {...props}>
      {/* Car body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 0.5, 4]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      {/* Car cabin */}
      <mesh position={[0, 1, -0.2]}>
        <boxGeometry args={[1.5, 0.6, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Wheels */}
      <mesh position={[-1, 0, -1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, 0, -1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1, 0, 1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, 0, 1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

function TrafficLight() {
  const light = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (light.current) {
      // Subtle movement for traffic light
      light.current.position.y = Math.sin(clock.getElapsedTime()) * 0.02 + 2;
    }
  });

  return (
    <group ref={light} position={[3, 2, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 2, 0.8]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      {/* Red light */}
      <mesh position={[0, 0.6, 0.41]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={0.8} />
      </mesh>
      {/* Yellow light */}
      <mesh position={[0, 0, 0.41]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FACC15" />
      </mesh>
      {/* Green light */}
      <mesh position={[0, -0.6, 0.41]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#22C55E" />
      </mesh>
    </group>
  );
}

// Scene component to handle context recovery and performance optimizations
function Scene() {
  const { gl } = useThree();
  
  // Handle WebGL context loss and recovery
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log("WebGL context lost. Trying to restore...");
    };
    
    const handleContextRestored = () => {
      console.log("WebGL context restored!");
    };
    
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={60} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />
      
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
      
      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[0.5, 10]} />
        <meshStandardMaterial color="#FACC15" />
      </mesh>
      
      <Car position={[-3, 0, 0]} />
      <TrafficLight />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
      <Environment preset="city" />
    </>
  );
}

export default function ThreeDCarAnimation() {
  const [fallback, setFallback] = React.useState(false);
  
  // Handle errors in the Canvas component
  const handleError = (error: any) => {
    console.error('Three.js error:', error);
    setFallback(true);
  };

  if (fallback) {
    return (
      <div className="h-80 sm:h-96 md:h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 14h4" />
                <path d="M14 14h4" />
                <path d="M6 18h12" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold">3D Visualization Unavailable</h3>
          <p className="text-sm text-gray-500 mt-2">
            Your browser doesn't support WebGL or it's been disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 sm:h-96 md:h-[500px] w-full">
      <Canvas shadows onError={handleError} dpr={[1, 2]} gl={{ alpha: true, antialias: true, powerPreference: 'default' }}>
        <Scene />
      </Canvas>
    </div>
  );
}
