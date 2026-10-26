/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, tx: -1000, ty: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let centerX = width / 2;
    let centerY = height / 2;

    const colors = [
      'rgba(0, 212, 255, 0.85)',  // Neon Blue (#00D4FF)
      'rgba(255, 60, 172, 0.85)',  // Neon Pink (#FF3CAC)
      'rgba(147, 51, 234, 0.7)',   // Cosmic Purple
      'rgba(255, 255, 255, 0.95)'  // Pure Star White
    ];

    // Star particle system
    const starCount = 280;
    const stars: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      radius: number;
      orbitalSpeed: number;
      baseSize: number;
      color: string;
      alpha: number;
      twinkleSpeed: number;
      trail: { x: number; y: number }[];
    }[] = [];

    const blackHoleRadius = 55;

    // Initialize stars with high-speed orbits and accretion paths
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * (Math.max(width, height) * 0.75) + (blackHoleRadius + 15);
      const angle = Math.random() * Math.PI * 2;
      stars.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        angle: angle,
        radius: radius,
        orbitalSpeed: (0.15 + Math.random() * 0.3) * (Math.random() > 0.15 ? 1 : -1),
        baseSize: Math.random() * 1.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        trail: []
      });
    }

    // Interactive mouse stars trail / cosmic sparks
    const sparks: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      life: number;
    }[] = [];

    // Nebulous Clouds
    const nebulaCount = 5;
    const nebulae: {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      phase: number;
      pulseSpeed: number;
    }[] = [];

    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        color: i % 3 === 0 
          ? 'rgba(0, 212, 255, 0.04)' // Blue neon
          : i % 3 === 1 
          ? 'rgba(255, 60, 172, 0.04)' // Pink neon
          : 'rgba(147, 51, 234, 0.035)', // Purple
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.002 + Math.random() * 0.003
      });
    }

    // Shockwaves (expanding gravitational shockwaves from clicks)
    const shockwaves: {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
    }[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
      mouseRef.current.active = true;

      // Spawn faint interactive cosmic sparks on mouse glide
      if (Math.random() < 0.4) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 1.8 + 0.5,
          alpha: 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleMouseClick = (e: MouseEvent) => {
      // Trigger a massive gravitational shockwave
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: Math.max(width, height) * 0.4,
        alpha: 0.85,
        color: Math.random() > 0.5 ? 'rgba(0, 212, 255, 0.6)' : 'rgba(255, 60, 172, 0.6)'
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleMouseClick);

    let frame = 0;

    // Core high performance Render Loop
    const render = () => {
      frame++;
      
      // Clear canvas with space trail effect
      ctx.fillStyle = 'rgba(3, 3, 4, 0.14)';
      ctx.fillRect(0, 0, width, height);

      // Lerp mouse coordinates for butter-smooth interactive tracking
      const mouse = mouseRef.current;
      if (mouse.active) {
        if (mouse.x === -1000) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        } else {
          mouse.x += (mouse.tx - mouse.x) * 0.08;
          mouse.y += (mouse.ty - mouse.y) * 0.08;
        }
      }

      // 1. Draw Slow floating nebulas
      nebulae.forEach((neb) => {
        neb.x += neb.vx;
        neb.y += neb.vy;
        neb.phase += neb.pulseSpeed;

        // Bounce nebulae off outer screen bounds
        if (neb.x < -100 || neb.x > width + 100) neb.vx = -neb.vx;
        if (neb.y < -100 || neb.y > height + 100) neb.vy = -neb.vy;

        const currentRadius = neb.radius + Math.sin(neb.phase) * 35;
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, currentRadius);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(3, 3, 4, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // 2. Render and update shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.05;
        sw.alpha -= 0.02;

        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3 * sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15 * sw.alpha;
        ctx.globalAlpha = sw.alpha;
        
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }

      // 3. Render and update micro mouse sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.025;
        sp.alpha = sp.life;

        if (sp.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 4. Update and render star particles with custom physics:
      // Pull towards central black hole (singularity) AND deform slightly towards mouse cursor
      stars.forEach((star) => {
        // Star orbit logic
        // Angular velocity increases as star is closer to the center (Keplerian)
        const KeplerSpeed = star.orbitalSpeed / (star.radius * 0.015 + 1);
        star.angle += KeplerSpeed;
        
        // Relativistic spiral pull inward
        star.radius -= 0.28;

        // Base circular coordinate
        let ox = centerX + Math.cos(star.angle) * star.radius;
        let oy = centerY + Math.sin(star.angle) * star.radius;

        // Gravitational attraction towards mouse cursor
        if (mouse.active) {
          const dx = mouse.x - ox;
          const dy = mouse.y - oy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            // Apply slight displacement towards mouse
            const force = (280 - dist) / 280;
            ox += dx * force * 0.15;
            oy += dy * force * 0.15;
          }
        }

        // Apply interactive click shockwave deflection
        shockwaves.forEach((sw) => {
          const dx = ox - sw.x;
          const dy = oy - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - sw.radius) < 60) {
            const pushForce = (1 - Math.abs(dist - sw.radius) / 60) * 8 * sw.alpha;
            const angle = Math.atan2(dy, dx);
            ox += Math.cos(angle) * pushForce;
            oy += Math.sin(angle) * pushForce;
          }
        });

        star.x = ox;
        star.y = oy;

        // Singularity crossing check: Spiraled into the Event Horizon!
        if (star.radius <= blackHoleRadius - 5) {
          // Trigger microscopic shockwave
          shockwaves.push({
            x: centerX,
            y: centerY,
            radius: blackHoleRadius,
            maxRadius: blackHoleRadius + Math.random() * 30 + 15,
            alpha: 0.65,
            color: star.color
          });

          // Respawn star at wide outer edge
          star.radius = Math.random() * (Math.max(width, height) * 0.45) + (Math.max(width, height) * 0.4);
          star.angle = Math.random() * Math.PI * 2;
          star.orbitalSpeed = (0.15 + Math.random() * 0.3) * (Math.random() > 0.15 ? 1 : -1);
        }

        // Beautiful twinkling glow effect
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Particle rendering
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.baseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;

      // 5. Render Interstellar Accretion Disk (glowing Gargantua space-warp ring)
      // Standard accretion glow
      const diskGrad = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius - 5,
        centerX, centerY, blackHoleRadius * 3.2
      );
      diskGrad.addColorStop(0, 'rgba(255, 60, 172, 0.42)'); // Bright Pink near horizon
      diskGrad.addColorStop(0.22, 'rgba(0, 212, 255, 0.18)'); // High energy Blue warp
      diskGrad.addColorStop(0.55, 'rgba(147, 51, 234, 0.08)'); // Outer Purple decay
      diskGrad.addColorStop(1, 'rgba(3, 3, 4, 0)');
      
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Spinning high-energy light filaments/ray flares for realism
      const rays = 4;
      const rotationSpeed = frame * 0.007;
      for (let r = 0; r < rays; r++) {
        const rayAngle = rotationSpeed + (r * (Math.PI * 2) / rays);
        
        // Relativistic Beaming effect: Render rays slightly asymmetrical to mimic Doppler beaming (moving towards observer is brighter)
        const isApproaching = Math.sin(rayAngle) > 0;
        const opacityMultiplier = isApproaching ? 0.48 : 0.15;

        const rayGrad = ctx.createLinearGradient(
          centerX, centerY,
          centerX + Math.cos(rayAngle) * blackHoleRadius * 2.5,
          centerY + Math.sin(rayAngle) * blackHoleRadius * 2.5
        );
        rayGrad.addColorStop(0, `rgba(255, 60, 172, ${opacityMultiplier})`);
        rayGrad.addColorStop(0.4, `rgba(0, 212, 255, ${opacityMultiplier * 0.5})`);
        rayGrad.addColorStop(1, 'rgba(3, 3, 4, 0)');

        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = r % 2 === 0 ? 8 : 14;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rayAngle) * blackHoleRadius * 2.5, centerY + Math.sin(rayAngle) * blackHoleRadius * 2.5);
        ctx.stroke();
      }

      // Gravitational lens border ring (Relativistic warp boundary)
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.7)';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius + Math.sin(frame * 0.06) * 1.8, 0, Math.PI * 2);
      ctx.stroke();

      // Reset shadow effects (crucial for CPU/GPU memory footprint)
      ctx.shadowBlur = 0;

      // 6. Draw Pitch-Black Event Horizon (Absolute Singularity Core)
      ctx.fillStyle = 'rgba(1, 1, 1, 1.0)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2);
      ctx.fill();

      // 7. Interactive cursor hover gravity well rendering
      if (mouse.active) {
        ctx.strokeStyle = 'rgba(255, 60, 172, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16 + Math.sin(frame * 0.1) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-50"
    />
  );
};
