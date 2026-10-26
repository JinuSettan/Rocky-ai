/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

export const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stars & space particles definitions
    const starCount = 150;
    const stars: {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speedAlpha: number;
      color: string;
      angle: number;
      radius: number;
      speedRotation: number;
    }[] = [];

    const colors = [
      'rgba(0, 240, 255, 0.8)',  // Electric Blue
      'rgba(255, 0, 85, 0.8)',   // Crimson Red
      'rgba(255, 0, 191, 0.8)',  // Neon Pink
      'rgba(157, 0, 255, 0.8)',  // Cosmic Purple
      'rgba(255, 255, 255, 0.9)' // Star White
    ];

    // Initialize revolving galaxy stars
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * Math.max(width, height) * 0.7 + 10;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speedAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        radius: radius,
        speedRotation: (Math.random() * 0.0003 + 0.0001) * (Math.random() > 0.3 ? 1 : -1)
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      // Clear with very subtle translucent dark space to create trailing effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Nebula Clouds / Aurora Gradients
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw active black hole inspired deep space core gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, 'rgba(10, 0, 25, 0.3)');
      gradient.addColorStop(0.2, 'rgba(5, 0, 15, 0.15)');
      gradient.addColorStop(0.5, 'rgba(0, 10, 30, 0.08)');
      gradient.addColorStop(0.8, 'rgba(5, 5, 5, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle orbital light rings (representing cosmic energy loops)
      const time = Date.now() * 0.0005;
      ctx.lineWidth = 1.5;
      
      // Loop 1 - Blue Glow
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150 + Math.sin(time) * 30, 0, Math.PI * 2);
      ctx.stroke();

      // Loop 2 - Pink Glow
      ctx.strokeStyle = 'rgba(255, 0, 191, 0.03)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 300 + Math.cos(time * 0.8) * 45, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw moving galaxy particles
      stars.forEach((star) => {
        // Orbit update
        star.angle += star.speedRotation;
        
        // Compute x and y relative to screen center
        const orbitX = centerX + Math.cos(star.angle) * star.radius;
        const orbitY = centerY + Math.sin(star.angle) * star.radius;

        // Soft twinkle
        star.alpha += star.speedAlpha;
        if (star.alpha > 1 || star.alpha < 0.1) {
          star.speedAlpha = -star.speedAlpha;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset transparency
      ctx.globalAlpha = 1.0;

      // Subtle black hole space warp visual
      ctx.fillStyle = 'rgba(5, 5, 5, 1.0)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Black hole event horizon subtle glow
      ctx.strokeStyle = 'rgba(255, 0, 191, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 11 + Math.sin(time * 3) * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
