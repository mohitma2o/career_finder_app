import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, useTexture, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Ultra-High Quality Parallax Galaxy.
 * Features multiple layers:
 * 1. Deep space texture with radial zoom.
 * 2. Dynamic star field.
 * 3. Floating cosmic dust particles.
 */
function StarField({ scroll }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      const s = scroll ? scroll.get() : 0;
      groupRef.current.position.z = s * 20;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars 
        radius={100} 
        depth={50} 
        count={7000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      <Sparkles 
        count={200} 
        size={3} 
        scale={20} 
        color="#818CF8" 
        speed={0.5} 
      />
    </group>
  );
}

export default function LandingScene({ scroll }) {
  return (
    <group>
      <ambientLight intensity={0.2} />
      
      {/* Layer 1: Deep Star Field with Depth Parallax */}
      <StarField scroll={scroll} />
      
      {/* Layer 2: Foreground Floating Elements */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles 
          count={50} 
          size={5} 
          scale={10} 
          color="#C084FC" 
          opacity={0.4} 
        />
      </Float>

      {/* Cinematic Lighting */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#818CF8" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#C084FC" />
    </group>
  );
}
