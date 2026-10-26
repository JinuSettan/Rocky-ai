/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  symbol: string;
  isText: boolean;
}

export const ParticleExplosionCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Watch resize of parent element as well to fit nicely inside flex elements
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Apply velocity, decay, gravity
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // Gentle gravity pull down
        p.vx *= 0.98; // Friction
        p.vy *= 0.98; // Friction
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Add cyber glow effect for epic/legendary explosions
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;

        if (p.isText) {
          ctx.font = `black ${p.size}px monospace`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.symbol, 0, 0);
        } else {
          // Render glowing neon sparkles/stars
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Trigger particle explosion listener
    const handleExplosion = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; rarity?: string }>;
      const { x, y, rarity } = customEvent.detail;

      // Map color palettes based on shard rarity
      const colors = {
        Legendary: ['#ea580c', '#facc15', '#ec4899', '#a855f7'],
        Epic: ['#ec4899', '#d946ef', '#c084fc', '#818cf8'],
        Rare: ['#06b6d4', '#22d3ee', '#38bdf8', '#34d399'],
        Common: ['#9ca3af', '#cbd5e1', '#e2e8f0', '#64748b']
      }[rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary' || 'Rare'];

      const symbols = ['⚛', '{}', '<>', '0', '1', 'AI', '∞', '+', '★'];

      // Generate 45-55 beautiful particles
      const count = rarity === 'Legendary' ? 65 : rarity === 'Epic' ? 50 : 35;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isText = Math.random() > 0.4;
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5, // slightly shoot upwards
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          size: isText ? Math.random() * 14 + 10 : Math.random() * 4 + 2,
          color,
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.01,
          symbol,
          isText
        });
      }

      particlesRef.current.push(...newParticles);
    };

    window.addEventListener('trigger-particle-explosion', handleExplosion);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('trigger-particle-explosion', handleExplosion);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-35 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
