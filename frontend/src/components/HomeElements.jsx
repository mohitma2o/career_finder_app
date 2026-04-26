import React, { useRef, useEffect } from 'react';

/**
 * Animated 3D Grid Floor component.
 */
export const GridFloor = () => (
  <div style={{
    position: 'absolute',
    bottom: '-20%',
    left: '-20%',
    width: '140%',
    height: '70%',
    background: `
      linear-gradient(90deg, rgba(129, 140, 248, 0.07) 1px, transparent 1px),
      linear-gradient(0deg, rgba(129, 140, 248, 0.07) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    transform: 'perspective(500px) rotateX(60deg)',
    maskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 80%)',
    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 80%)',
    animation: 'gridScroll 20s linear infinite',
    zIndex: 5
  }} />
);

/**
 * Interactive Background Canvas with magnetic points and particles.
 */
export const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, moving: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const points = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      ox: 0, oy: 0,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: ['#818CF8', '#C084FC', '#FBBF24'][Math.floor(Math.random() * 3)]
    }));

    points.forEach(p => { p.ox = p.x; p.oy = p.y; });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;
      
      points.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx += (p.ox - p.x) * 0.001;
        p.vy += (p.oy - p.y) * 0.001;
        const dx = mx - p.x; const dy = my - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          const force = (200 - dist) / 2000;
          p.vx += dx * force; p.vy += dy * force;
        }
        ctx.globalAlpha = dist < 200 ? 0.8 : 0.2;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        points.forEach(p2 => {
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 100) {
            ctx.globalAlpha = (100 - d2) / 1000;
            ctx.strokeStyle = p.color;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.5 }} />;
};
