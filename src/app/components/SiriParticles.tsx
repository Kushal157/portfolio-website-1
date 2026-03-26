import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
  orbitAngle: number;
  orbitSpeed: number;
  ring: number;
}

export function SiriParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const initParticles = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const particles: Particle[] = [];

      // Create a cache canvas for the glow effect
      const glowCache = document.createElement('canvas');
      glowCache.width = 32;
      glowCache.height = 32;
      const gCtx = glowCache.getContext('2d');
      if (gCtx) {
        const grad = gCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        gCtx.fillStyle = grad;
        gCtx.fillRect(0, 0, 32, 32);
      }
      (window as any)._particleGlowCache = glowCache;

      // Central sphere particles (reduced from 800 to 250)
      const sphereParticles = 250;
      for (let i = 0; i < sphereParticles; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 60 + Math.random() * 40;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        const hue = 0.7 + Math.random() * 0.15; 
        
        particles.push({
          x: centerX + x,
          y: centerY + y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          angle: theta,
          radius: r,
          speed: 0.0005 + Math.random() * 0.001,
          size: 0.8 + Math.random() * 1.2,
          hue,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: 0.002 + Math.random() * 0.003,
          ring: -1,
        });
      }

      // Orbital rings (reduced from 1500 to 550 total)
      const rings = [
        { radius: 140, thickness: 15, particleCount: 150, hue: 0.55 },
        { radius: 180, thickness: 18, particleCount: 200, hue: 0.6 },
        { radius: 220, thickness: 20, particleCount: 200, hue: 0.5 },
      ];

      rings.forEach((ring, ringIndex) => {
        for (let j = 0; j < ring.particleCount; j++) {
          const angle = (j / ring.particleCount) * Math.PI * 2;
          const radiusVariation = ring.radius + (Math.random() - 0.5) * ring.thickness;
          const x = Math.cos(angle) * radiusVariation;
          const y = (Math.random() - 0.5) * ring.thickness;
          const z = Math.sin(angle) * radiusVariation;
          
          const hue = ring.hue + (j / ring.particleCount) * 0.1;
          
          particles.push({
            x: centerX + x,
            y: centerY + y,
            z,
            baseX: x,
            baseY: y,
            baseZ: z,
            angle,
            radius: radiusVariation,
            speed: 0.003 + Math.random() * 0.002,
            size: 0.6 + Math.random() * 1,
            hue,
            orbitAngle: angle,
            orbitSpeed: 0.008 + ringIndex * 0.003,
            ring: ringIndex,
          });
        }
      });

      particlesRef.current = particles;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const time = Date.now() * 0.001;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const glowCache = (window as any)._particleGlowCache;

      // Process all particles (removed .sort() for performance)
      particlesRef.current.forEach((p) => {
        // Rotate particles
        if (p.ring === -1) {
          p.orbitAngle += p.orbitSpeed;
          const rotatedX = p.baseX * Math.cos(p.orbitAngle) - p.baseZ * Math.sin(p.orbitAngle);
          const rotatedZ = p.baseX * Math.sin(p.orbitAngle) + p.baseZ * Math.cos(p.orbitAngle);
          p.x = centerX + rotatedX;
          p.z = rotatedZ;
          p.y = centerY + p.baseY;
        } else {
          p.orbitAngle += p.orbitSpeed;
          const rotatedX = p.baseX * Math.cos(p.orbitAngle) - p.baseZ * Math.sin(p.orbitAngle);
          const rotatedZ = p.baseX * Math.sin(p.orbitAngle) + p.baseZ * Math.cos(p.orbitAngle);
          p.x = centerX + rotatedX;
          p.z = rotatedZ;
          p.y = centerY + p.baseY;
        }

        // Mouse repulsion 
        if (hovering) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100;
            p.x -= (dx / dist) * force * 15;
            p.y -= (dy / dist) * force * 15;
          }
        }

        // Perspective and Depth
        const perspective = 1000;
        const scale = perspective / (perspective + p.z);
        const particleSize = p.size * scale;
        const opacity = Math.max(0.2, (p.z + 250) / 500);

        // Draw glow using cache (Massive performance boost)
        const glowSize = particleSize * 8;
        ctx.globalAlpha = opacity * 0.4;
        if (glowCache) {
          ctx.drawImage(glowCache, p.x - glowSize/2, p.y - glowSize/2, glowSize, glowSize);
        }

        // Draw core
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `hsl(${p.hue * 360}, 80%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hovering]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <motion.div
        className="hidden md:block absolute top-1/2 right-4 md:right-8 lg:right-16 xl:right-24 -translate-y-1/2 w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] pointer-events-auto"
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          mouseRef.current = { x: -999, y: -999 };
        }}
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            };
          }
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Label */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-purple-400/60 text-xs font-medium pointer-events-none uppercase tracking-wider"
          animate={{ opacity: hovering ? 0 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          Interactive Particle Sphere
        </motion.div>
      </motion.div>
    </div>
  );
}