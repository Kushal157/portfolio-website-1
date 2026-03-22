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
  const rafRef = useRef<number>();
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

      // Central sphere particles (dense inner core)
      const sphereParticles = 800;
      for (let i = 0; i < sphereParticles; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 60 + Math.random() * 40;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        const hue = 0.7 + Math.random() * 0.15; // Pink to purple range
        
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

      // Orbital rings
      const rings = [
        { radius: 140, thickness: 15, particleCount: 400, hue: 0.55 }, // Cyan ring
        { radius: 180, thickness: 18, particleCount: 500, hue: 0.6 }, // Blue ring
        { radius: 220, thickness: 20, particleCount: 600, hue: 0.5 }, // Teal ring
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

      // Sort particles by z-index for proper depth
      const sorted = [...particlesRef.current].sort((a, b) => a.z - b.z);

      sorted.forEach((p) => {
        // Rotate particles
        if (p.ring === -1) {
          // Sphere particles - gentle wave motion
          const waveX = Math.sin(time * 0.5 + p.angle) * 5;
          const waveY = Math.cos(time * 0.3 + p.angle * 2) * 5;
          p.orbitAngle += p.orbitSpeed;
          
          const rotatedX = p.baseX * Math.cos(p.orbitAngle) - p.baseZ * Math.sin(p.orbitAngle);
          const rotatedZ = p.baseX * Math.sin(p.orbitAngle) + p.baseZ * Math.cos(p.orbitAngle);
          
          p.x = centerX + rotatedX + waveX;
          p.z = rotatedZ;
          p.y = centerY + p.baseY + waveY;
        } else {
          // Ring particles - orbital rotation
          p.orbitAngle += p.orbitSpeed;
          
          const rotatedX = p.baseX * Math.cos(p.orbitAngle) - p.baseZ * Math.sin(p.orbitAngle);
          const rotatedZ = p.baseX * Math.sin(p.orbitAngle) + p.baseZ * Math.cos(p.orbitAngle);
          
          // Add vertical wobble to rings
          const wobble = Math.sin(time * 2 + p.angle * 3) * 3;
          
          p.x = centerX + rotatedX;
          p.z = rotatedZ;
          p.y = centerY + p.baseY + wobble;
        }

        // Mouse interaction - repulsion
        if (hovering) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            const force = (100 - dist) / 100;
            p.x -= (dx / dist) * force * 20;
            p.y -= (dy / dist) * force * 20;
          }
        }

        // Calculate perspective scale based on z-depth
        const perspective = 1000;
        const scale = perspective / (perspective + p.z);
        const screenX = p.x;
        const screenY = p.y;
        const particleSize = p.size * scale;

        // Opacity based on depth
        const opacity = 0.3 + (p.z + 250) / 500 * 0.7;

        // Color based on hue (HSL to RGB)
        const h = p.hue;
        const s = 0.8;
        const l = 0.6;
        
        const hueToRgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p_val = 2 * l - q;
        const r = Math.round(hueToRgb(p_val, q, h + 1/3) * 255);
        const g = Math.round(hueToRgb(p_val, q, h) * 255);
        const b = Math.round(hueToRgb(p_val, q, h - 1/3) * 255);

        // Draw glow
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, particleSize * 4
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.globalAlpha = opacity * 0.6;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particleSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby particles
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < sorted.length; i += 8) {
        const p1 = sorted[i];
        for (let j = i + 1; j < Math.min(i + 5, sorted.length); j++) {
          const p2 = sorted[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50) {
            ctx.globalAlpha = (1 - dist / 50) * 0.2;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

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