import React, { useState } from 'react';
import { Plane, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';

export default function CareerCard3D({ career, position, rotation }) {
  const [hovered, setHover] = useState(false);
  const { scale, y } = useSpring({
    scale: hovered ? 1.15 : 1,
    y: hovered ? position[1] + 0.3 : position[1],
    config: { mass: 1, tension: 300, friction: 20 },
  });

  return (
    <a.group 
      position={[position[0], y, position[2]]} 
      rotation={rotation}
      scale={scale} 
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }} 
      onPointerOut={() => setHover(false)}
    >
      <Plane args={[2.5, 3.5]}>
        <meshStandardMaterial 
          transparent 
          opacity={0.15} 
          roughness={0.1} 
          metalness={0.3} 
          color="#ffffff"
        />
      </Plane>
      
      {/* HTML Overlay for crisp text rendering */}
      <Html transform distanceFactor={10} position={[0, 0, 0.05]} occlude>
        <div style={{
          width: '200px',
          height: '280px',
          padding: '1.5rem',
          background: 'var(--surface)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
          color: 'var(--text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: hovered ? '0 8px 32px rgba(21, 207, 147, 0.15)' : 'none',
          transition: 'all 0.3s ease',
          fontFamily: 'var(--font)'
        }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--accent)',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            {career.category || 'Tech'}
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            color: 'var(--text-white)'
          }}>
            {career.career}
          </h3>
          <div style={{
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            {career.growth_outlook || 'High Growth'}
          </div>
        </div>
      </Html>
    </a.group>
  );
}
