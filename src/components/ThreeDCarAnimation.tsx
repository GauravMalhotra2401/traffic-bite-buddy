
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import { Group, MathUtils } from 'three';

function Car(props: any) {
  const group = useRef<Group>(null);
  // Using a simple car model placeholder since we don't have actual GLTF models
  
  useFrame(({ clock }) => {
    if (group.current) {
      // Create a bouncing animation
      group.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05;
      // Gentle rotation
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(clock.getElapsedTime() * 0.3) * 0.1,
        0.1
      );
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
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, 0, -1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-1, 0, 1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[1, 0, 1.5]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
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

export default function ThreeDCarAnimation() {
  return (
    <div className="h-80 sm:h-96 md:h-[500px] w-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={60} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
      </Canvas>
    </div>
  );
}
