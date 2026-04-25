import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Premium Galaxy Background component.
 * Zooms and moves based on scroll progress.
 */
function GalaxyBackground({ scroll }) {
  const meshRef = useRef();
  const { viewport } = useThree();
  const texture = useTexture('/premium_galaxy.png');

  useFrame(() => {
    if (meshRef.current && scroll) {
      const s = scroll.get();
      // Ensure the background is always larger than the viewport to prevent gaps
      const aspect = viewport.width / viewport.height;
      const scaleBase = Math.max(viewport.width, viewport.height) * 2;
      const zoom = scaleBase + s * 30;
      
      // Maintain aspect ratio while ensuring full coverage
      meshRef.current.scale.set(zoom * aspect, zoom, 1);
      meshRef.current.rotation.z = s * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export default function LandingScene({ scroll }) {
  return (
    <group>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      
      {/* Cinematic Galaxy Background with Scroll Zoom */}
      <GalaxyBackground scroll={scroll} />
      
      <pointLight position={[0, 0, 5]} intensity={1} color="var(--accent)" />
    </group>
  );
}
