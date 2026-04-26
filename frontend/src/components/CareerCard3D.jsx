import React, { useRef } from 'react';
import { Plane, Html, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function CareerCard3D({ career, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t / 2) * 0.1;
      meshRef.current.position.y = Math.sin(t) * 0.05;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Glass Frame */}
      <RoundedBox args={[3, 4.2, 0.1]} radius={0.15} smoothness={4}>
        <meshPhysicalMaterial 
          color="#818CF8"
          thickness={0.5}
          roughness={0}
          transmission={0.9}
          ior={1.5}
          clearcoat={1}
          opacity={0.3}
          transparent
        />
      </RoundedBox>
      
      {/* Inner Core Glow */}
      <RoundedBox args={[2.8, 4, 0.05]} radius={0.1}>
        <meshBasicMaterial color="#818CF8" transparent opacity={0.05} />
      </RoundedBox>

      {/* Floating Elements (Corners) */}
      <mesh position={[-1.4, 2, 0.1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#818CF8" />
      </mesh>
      <mesh position={[1.4, -2, 0.1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#818CF8" />
      </mesh>
      
      {/* Content Layer */}
      <Html 
        transform 
        distanceFactor={6} 
        position={[0, 0, 0.06]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          width: '260px',
          height: '380px',
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontFamily: 'var(--font)',
          boxShadow: '0 0 50px rgba(129, 140, 248, 0.1)'
        }}>
          <div style={{ width: '100%' }}>
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: '#818CF8',
              marginBottom: '0.5rem',
              fontWeight: '900',
              opacity: 0.8
            }}>
              Top Recommendation
            </div>
            <h3 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '900', 
              margin: 0,
              lineHeight: '1.1',
              color: '#fff'
            }}>
              {career.career}
            </h3>
          </div>

          <div style={{ width: '100%' }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              {career.category || 'Professional Track'}
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '900',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(129, 140, 248, 0.4)'
            }}>
              {career.confidence}% Match
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
