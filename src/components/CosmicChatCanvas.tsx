/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface CosmicChatCanvasProps {
  isLoading: boolean;
  isVoiceActive?: boolean;
}

export const CosmicChatCanvas: React.FC<CosmicChatCanvasProps> = ({ isLoading, isVoiceActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLoadingRef = useRef(isLoading);
  const isVoiceActiveRef = useRef(isVoiceActive);
  const mouseCoordsRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isVoiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    let baseCenterX = width / 2;
    let baseCenterY = height / 2;

    // Mouse movement listener on parent container
    const parent = canvas.parentElement;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouseCoordsRef.current.x = e.clientX - rect.left;
      mouseCoordsRef.current.y = e.clientY - rect.top;
      mouseCoordsRef.current.active = true;

      // Spawn interactive sparks on glide
      if (Math.random() < 0.5) {
        cursorSparks.push({
          x: mouseCoordsRef.current.x,
          y: mouseCoordsRef.current.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 2.2 + 0.6,
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.02,
          hue: (Date.now() * 0.05) % 360
        });
      }
    };

    const handleMouseLeave = () => {
      mouseCoordsRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!parent || e.touches.length === 0) return;
      const rect = parent.getBoundingClientRect();
      mouseCoordsRef.current.x = e.touches[0].clientX - rect.left;
      mouseCoordsRef.current.y = e.touches[0].clientY - rect.top;
      mouseCoordsRef.current.active = true;

      if (Math.random() < 0.5) {
        cursorSparks.push({
          x: mouseCoordsRef.current.x,
          y: mouseCoordsRef.current.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 2 + 0.6,
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.02,
          hue: (Date.now() * 0.05) % 360
        });
      }
    };

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
      parent.addEventListener('touchmove', handleTouchMove);
    }

    // 13. Interactive Cursor Sparks Trail
    interface CursorSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      hue: number;
    }
    const cursorSparks: CursorSpark[] = [];

    // Star particle system (200 physical rotating stars)
    const starCount = 200;
    const stars: {
      angle: number;
      radius: number;
      speedRotation: number;
      fallSpeed: number;
      size: number;
      alpha: number;
      twinkleSpeed: number;
      brightness: number;
    }[] = [];

    const baseBlackHoleRadius = 42;

    // Initialize swirling stars with Keplerian distances
    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() * (Math.max(width, height) * 0.75) + (baseBlackHoleRadius + 12);
      stars.push({
        angle: Math.random() * Math.PI * 2,
        radius: radius,
        speedRotation: (0.12 + Math.random() * 0.35) * (Math.random() > 0.15 ? 1 : -1),
        fallSpeed: 0.12 + Math.random() * 0.22,
        size: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.01 + Math.random() * 0.025,
        brightness: 0.5 + Math.random() * 0.5
      });
    }

    // Orbiting Knowledge system keywords
    const wordList = [
      'Knowledge', 'Code', 'Apps', 'Games', 'AI', 
      'Future', 'Android', 'Quantum', 'Creativity', 'Universe'
    ];

    interface OrbitWord {
      text: string;
      angle: number;
      radius: number;
      baseRadius: number;
      speed: number;
      hueOffset: number;
      stretch: number;
      opacity: number;
      scale: number;
    }

    let orbitWords: OrbitWord[] = wordList.map((word, idx) => {
      const baseRad = 85 + idx * 18;
      return {
        text: word,
        angle: (idx * (Math.PI * 2)) / wordList.length,
        radius: baseRad,
        baseRadius: baseRad,
        speed: 0.007 + Math.random() * 0.005,
        hueOffset: idx * 36,
        stretch: 1.0,
        opacity: 1.0,
        scale: 1.0
      };
    });

    // Space life entities (UFOs, satellites, comets, alien probes)
    interface SpaceLife {
      type: 'ufo' | 'satellite' | 'comet' | 'probe';
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
      tail: { x: number; y: number }[];
    }
    const entities: SpaceLife[] = [];

    // Shockwaves (Gravitational energy rings from compilations/thinking)
    interface Ripple {
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
      lineWidth: number;
    }
    const ripples: Ripple[] = [];

    // 11. Supernova explosion tracker
    interface Supernova {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      flashAlpha: number;
      color: string;
      debris: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        alpha: number;
        life: number;
      }[];
    }
    const supernovas: Supernova[] = [];

    // Nebula cloud particles (Aurora clouds)
    const nebulaCount = 4;
    const nebulae: {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      phase: number;
      hueOffset: number;
    }[] = [];

    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 140 + 110,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        hueOffset: i * 90
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 320;
      height = canvas.height = canvas.parentElement.clientHeight || 600;
      baseCenterX = width / 2;
      baseCenterY = height / 2;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let time = 0;
    let transitionProgress = 0; // State for pull-in transition
    let lastWasLoading = false;

    // Audio visualization wave phase (for Voice Mode)
    let audioWavePhase = 0;

    // Render loop
    const render = () => {
      time += 0.01;
      audioWavePhase += 0.08;
      
      const isCurrentlyLoading = isLoadingRef.current;
      const isVoiceActiveCurrently = isVoiceActiveRef.current;

      // 7. Quantum Thinking Transition
      if (isCurrentlyLoading) {
        transitionProgress += (1.0 - transitionProgress) * 0.06;
      } else {
        transitionProgress += (0.0 - transitionProgress) * 0.045;
      }

      // If transition triggers (starts loading), trigger gravitational ripples
      if (isCurrentlyLoading && !lastWasLoading) {
        ripples.push({
          radius: baseBlackHoleRadius,
          maxRadius: Math.max(width, height) * 0.8,
          alpha: 1.0,
          color: `hsl(${(time * 50) % 360}, 100%, 65%)`,
          lineWidth: 4
        });
        ripples.push({
          radius: baseBlackHoleRadius - 10,
          maxRadius: Math.max(width, height) * 0.5,
          alpha: 0.95,
          color: `hsl(${(time * 50 + 120) % 360}, 100%, 65%)`,
          lineWidth: 2
        });
      }
      lastWasLoading = isCurrentlyLoading;

      // 4. Galaxy Camera Sway (Slow cinematic floating offset)
      const cameraOffsetX = Math.sin(time * 0.25) * 12;
      const cameraOffsetY = Math.cos(time * 0.18) * 12;
      const centerX = baseCenterX + cameraOffsetX;
      const centerY = baseCenterY + cameraOffsetY;

      // 5. Dynamic Space Theme (Slow running color hue offset)
      const globalHue = (time * 15) % 360;

      // Clear frame with soft starscape trails
      ctx.fillStyle = isCurrentlyLoading ? 'rgba(3, 3, 5, 0.22)' : 'rgba(4, 4, 6, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Random space lightning or cosmic ray flash (extremely subtle)
      if (Math.random() < 0.0004) {
        ctx.fillStyle = `hsla(${globalHue}, 80%, 40%, 0.08)`;
        ctx.fillRect(0, 0, width, height);
      }

      // 12. Aurora Nebula clouds (Gently moving with soft gradients)
      nebulae.forEach((neb) => {
        neb.x += neb.speedX;
        neb.y += neb.speedY;
        neb.phase += 0.004;

        // Wrap around bounds safely
        if (neb.x < -150) neb.x = width + 150;
        if (neb.x > width + 150) neb.x = -150;
        if (neb.y < -150) neb.y = height + 150;
        if (neb.y > height + 150) neb.y = -150;

        const dynamicRadius = neb.radius + Math.sin(neb.phase) * 20;
        const nebHue = (globalHue + neb.hueOffset) % 360;

        const radGrad = ctx.createRadialGradient(
          neb.x, neb.y, 0, 
          neb.x, neb.y, dynamicRadius
        );
        // Soft glowing gas colors
        radGrad.addColorStop(0, `hsla(${nebHue}, 80%, 40%, 0.035)`);
        radGrad.addColorStop(0.5, `hsla(${(nebHue + 60) % 360}, 80%, 30%, 0.015)`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      });

      // 11. Trigger supernovas rarely
      if (Math.random() < 0.0006 && supernovas.length < 1) {
        supernovas.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 2,
          maxRadius: Math.random() * 80 + 60,
          alpha: 1.0,
          flashAlpha: 1.0,
          color: `hsl(${Math.random() * 360}, 100%, 65%)`,
          debris: []
        });
      }

      // Render and update Supernovas
      for (let s = supernovas.length - 1; s >= 0; s--) {
        const sn = supernovas[s];
        sn.radius += (sn.maxRadius - sn.radius) * 0.035;
        sn.alpha -= 0.012;
        sn.flashAlpha -= 0.04;

        // Spawn supernova debris when expanding
        if (sn.radius > 5 && sn.debris.length === 0) {
          const debCount = 18 + Math.floor(Math.random() * 10);
          for (let d = 0; d < debCount; d++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 0.5 + Math.random() * 3.5;
            sn.debris.push({
              x: sn.x,
              y: sn.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              size: Math.random() * 2 + 0.5,
              color: sn.color,
              alpha: 1.0,
              life: 1.0
            });
          }
        }

        // Render Flash
        if (sn.flashAlpha > 0.01) {
          const radial = ctx.createRadialGradient(sn.x, sn.y, 0, sn.x, sn.y, sn.radius * 0.3);
          radial.addColorStop(0, '#ffffff');
          radial.addColorStop(1, 'transparent');
          ctx.fillStyle = radial;
          ctx.globalAlpha = sn.flashAlpha;
          ctx.beginPath();
          ctx.arc(sn.x, sn.y, sn.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render expanding wave
        if (sn.alpha > 0.01) {
          ctx.strokeStyle = sn.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = sn.alpha;
          ctx.beginPath();
          ctx.arc(sn.x, sn.y, sn.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Debris particles
        for (let d = sn.debris.length - 1; d >= 0; d--) {
          const deb = sn.debris[d];
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.life -= 0.015;
          deb.alpha = deb.life;

          if (deb.life <= 0) {
            sn.debris.splice(d, 1);
            continue;
          }

          ctx.fillStyle = deb.color;
          ctx.globalAlpha = deb.alpha;
          ctx.beginPath();
          ctx.arc(deb.x, deb.y, deb.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (sn.alpha <= 0 && sn.debris.length === 0) {
          supernovas.splice(s, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      // Update & Render interactive Cursor sparks
      for (let c = cursorSparks.length - 1; c >= 0; c--) {
        const cs = cursorSparks[c];
        
        // Attracted slightly by black hole singularity gravity!
        const dx = centerX - cs.x;
        const dy = centerY - cs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          const grav = 0.05 * (1.0 + transitionProgress * 2);
          cs.vx += (dx / dist) * grav;
          cs.vy += (dy / dist) * grav;
        }

        cs.x += cs.vx;
        cs.y += cs.vy;
        cs.alpha -= cs.decay;

        if (cs.alpha <= 0) {
          cursorSparks.splice(c, 1);
          continue;
        }

        ctx.fillStyle = `hsla(${cs.hue}, 100%, 75%, ${cs.alpha})`;
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, cs.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. AI Heartbeat Core (Organic double-pulse heartbeat expansion)
      const beatCycle = time * 2.8;
      const heartbeat = Math.pow(Math.sin(beatCycle), 8) * 0.12 + Math.pow(Math.sin(beatCycle - 0.4), 12) * 0.06;
      // Heartbeat amplifies significantly during quantum thinking mode
      const activePulse = heartbeat * (1.0 + transitionProgress * 1.5);
      const blackHoleRadius = baseBlackHoleRadius * (1.0 + activePulse);

      // 9. Live Neural Network star connection lines
      // Draw faint connections between nearby stars to represent the active AI brain
      ctx.lineWidth = 0.5;
      for (let i = 0; i < starCount; i += 4) { // Checked on a subset for high 60fps performance
        const s1 = stars[i];
        const s1Rad = Math.max(blackHoleRadius, s1.radius);
        const x1 = centerX + Math.cos(s1.angle) * s1Rad;
        const y1 = centerY + Math.sin(s1.angle) * s1Rad;

        for (let j = i + 1; j < Math.min(i + 12, starCount); j++) {
          const s2 = stars[j];
          const s2Rad = Math.max(blackHoleRadius, s2.radius);
          const x2 = centerX + Math.cos(s2.angle) * s2Rad;
          const y2 = centerY + Math.sin(s2.angle) * s2Rad;

          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          // Only connect nearby stars
          if (dist < 34) {
            const lineOpacity = (1.0 - (dist / 34)) * 0.12 * (s1.alpha + s2.alpha) * (1.0 + transitionProgress * 1.5);
            ctx.strokeStyle = `hsla(${(globalHue + i) % 360}, 95%, 65%, ${lineOpacity})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // 1. Living Universe rotating and swirling stars
      stars.forEach((star) => {
        let currentRadius = star.radius;

        // Stars orbit faster if compiling or thinking
        const orbitalMultiplier = 1.0 + transitionProgress * 3.8;
        const orbitalSpeed = (star.speedRotation / (currentRadius * 0.02 + 1.2)) * 1.3 * orbitalMultiplier;
        star.angle += orbitalSpeed;

        // Pull stars towards singularity Event Horizon
        const spiralSpeed = star.fallSpeed * (1.0 + transitionProgress * 3.0);
        star.radius -= spiralSpeed;

        // Star supernova debris helper triggers rarely
        if (Math.random() < 0.0001 && star.radius > blackHoleRadius + 30) {
          // Spark localized explosion
          const debrisCount = 6 + Math.floor(Math.random() * 4);
          const starX = centerX + Math.cos(star.angle) * star.radius;
          const starY = centerY + Math.sin(star.angle) * star.radius;
          const starHue = (globalHue + Math.random() * 120) % 360;
          
          for (let d = 0; d < debrisCount; d++) {
            const dAngle = Math.random() * Math.PI * 2;
            const dSpeed = 0.3 + Math.random() * 1.5;
            cursorSparks.push({
              x: starX,
              y: starY,
              vx: Math.cos(dAngle) * dSpeed,
              vy: Math.sin(dAngle) * dSpeed,
              size: Math.random() * 1.2 + 0.4,
              alpha: 1.0,
              decay: 0.03 + Math.random() * 0.03,
              hue: starHue
            });
          }
          star.radius = Math.random() * (Math.max(width, height) * 0.5) + (Math.max(width, height) * 0.4);
        }

        let orbitX = centerX + Math.cos(star.angle) * star.radius;
        let orbitY = centerY + Math.sin(star.angle) * star.radius;

        // Gravitational lensing deformation near the horizon
        const dx = orbitX - centerX;
        const dy = orbitY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < blackHoleRadius * 2.5) {
          const lensWarp = (blackHoleRadius * 2.5 - dist) / (blackHoleRadius * 2.5);
          // Distort coordinates along tangent
          orbitX -= (dx / dist) * lensWarp * 14;
          orbitY -= (dy / dist) * lensWarp * 14;
        }

        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.9 || star.alpha < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        const starHue = (globalHue + star.radius) % 360;
        ctx.fillStyle = `hsla(${starHue}, 90%, 80%, ${star.alpha})`;
        
        ctx.beginPath();
        // Deform stars into arcs near the event horizon representing relativistic speed stretching
        if (dist < blackHoleRadius * 1.8) {
          const stretch = 1.0 + (blackHoleRadius * 1.8 - dist) / 12;
          ctx.ellipse(orbitX, orbitY, star.size, star.size * stretch, Math.atan2(dy, dx), 0, Math.PI * 2);
        } else {
          ctx.arc(orbitX, orbitY, star.size, 0, Math.PI * 2);
        }
        ctx.fill();

        // Singularity Crossing - star is consumed
        if (star.radius <= blackHoleRadius) {
          ripples.push({
            radius: blackHoleRadius,
            maxRadius: blackHoleRadius + Math.random() * 25 + 10,
            alpha: 0.75,
            color: `hsl(${starHue}, 100%, 75%)`,
            lineWidth: 1
          });

          // Respawn far away
          star.radius = Math.random() * (Math.max(width, height) * 0.55) + (Math.max(width, height) * 0.35);
          star.angle = Math.random() * Math.PI * 2;
          star.fallSpeed = 0.12 + Math.random() * 0.22;
        }
      });

      // Update & Render ripples (Expanding shockwaves)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 2.2;
        rip.alpha -= 0.015;

        if (rip.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = rip.color;
        ctx.lineWidth = rip.lineWidth * rip.alpha;
        ctx.globalAlpha = rip.alpha;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 8. AI Voice Visualization ( beautiful concentric audio wave rings)
      if (isVoiceActiveCurrently) {
        ctx.save();
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const waveRadius = blackHoleRadius + 15 + ((audioWavePhase * 15 + i * 40) % 90);
          const waveAlpha = Math.max(0, 1.0 - ((waveRadius - blackHoleRadius - 15) / 90));
          
          ctx.strokeStyle = `hsla(${(globalHue + 180) % 360}, 100%, 70%, ${waveAlpha * 0.55})`;
          ctx.shadowColor = `hsl(${(globalHue + 180) % 360}, 100%, 70%)`;
          ctx.shadowBlur = 12;
          
          ctx.beginPath();
          // Modulate with wave frequency noise for high realism
          const segments = 60;
          for (let s = 0; s <= segments; s++) {
            const angle = (s * Math.PI * 2) / segments;
            const freqMod = Math.sin(angle * 8 + audioWavePhase * 2) * Math.cos(angle * 3) * 6;
            const r = waveRadius + freqMod;
            const wx = centerX + Math.cos(angle) * r;
            const wy = centerY + Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
      }

      // 10. Space Life (UFOs, satellites, comets and alien cruisers)
      if (Math.random() < 0.002 && entities.length < 3) {
        const fromLeft = Math.random() > 0.5;
        entities.push({
          type: Math.random() > 0.75 ? 'probe' : Math.random() > 0.5 ? 'comet' : Math.random() > 0.25 ? 'satellite' : 'ufo',
          x: fromLeft ? -40 : width + 40,
          y: Math.random() * height,
          vx: (fromLeft ? 1 : -1) * (0.4 + Math.random() * 0.7),
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 2 + 1.6,
          pulse: 0,
          pulseSpeed: 0.04 + Math.random() * 0.04,
          tail: []
        });
      }

      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        ent.x += ent.vx;
        ent.y += ent.vy;
        ent.pulse += ent.pulseSpeed;

        // Record tail
        ent.tail.push({ x: ent.x, y: ent.y });
        if (ent.tail.length > 12) ent.tail.shift();

        // Delete offscreen
        if (ent.x < -60 || ent.x > width + 60 || ent.y < -60 || ent.y > height + 60) {
          entities.splice(i, 1);
          continue;
        }

        ctx.save();
        if (ent.type === 'comet') {
          // Tail gradient
          const trailLength = ent.tail.length;
          if (trailLength > 1) {
            ctx.lineWidth = ent.size * 1.5;
            for (let t = 1; t < trailLength; t++) {
              const alpha = t / trailLength;
              ctx.strokeStyle = `hsla(${globalHue}, 100%, 80%, ${alpha * 0.4})`;
              ctx.beginPath();
              ctx.moveTo(ent.tail[t - 1].x, ent.tail[t - 1].y);
              ctx.lineTo(ent.tail[t].x, ent.tail[t].y);
              ctx.stroke();
            }
          }
          // Comet head
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = `hsl(${globalHue}, 100%, 70%)`;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (ent.type === 'ufo') {
          // Flying disc
          ctx.fillStyle = `hsl(${(globalHue + 240) % 360}, 100%, 65%)`;
          ctx.beginPath();
          ctx.ellipse(ent.x, ent.y, 8, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          // Dome
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ent.x, ent.y - 1.5, 2, 0, Math.PI * 2);
          ctx.fill();
          // Red/cyan blinking lights
          const flash = Math.sin(ent.pulse * 8) > 0;
          ctx.fillStyle = flash ? '#ff003c' : '#00ffd4';
          ctx.beginPath();
          ctx.arc(ent.x - 3, ent.y, 0.8, 0, Math.PI * 2);
          ctx.arc(ent.x + 3, ent.y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (ent.type === 'probe') {
          // Alien telemetry probe
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(ent.x - 2, ent.y - 2, 4, 4);
          // Glowing lens sensor
          ctx.fillStyle = Math.sin(ent.pulse * 15) > 0 ? '#ff0055' : '#1e1b4b';
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
          // Telemetry ping wave circles
          if (Math.sin(ent.pulse * 4) > 0.8) {
            ctx.strokeStyle = 'rgba(255, 0, 85, 0.35)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(ent.x, ent.y, 10 + Math.sin(ent.pulse * 4) * 6, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Satellite box & rotating panel wings
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(ent.x - 2.5, ent.y - 2.5, 5, 5);
          
          ctx.fillStyle = `hsl(${(globalHue + 180) % 360}, 100%, 60%)`;
          const panelAngle = Math.sin(ent.pulse * 0.5) * 0.4;
          ctx.translate(ent.x, ent.y);
          ctx.rotate(panelAngle);
          ctx.fillRect(-8, -0.8, 5, 1.6);
          ctx.fillRect(3, -0.8, 5, 1.6);
        }
        ctx.restore();
      }

      // 3. Orbiting Knowledge System (Warped and sucked in whenever Rock AI starts thinking)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 9px "Space Grotesk", sans-serif';

      orbitWords.forEach((word) => {
        const orbitSpeed = word.speed * (1.0 + transitionProgress * 3.5);
        word.angle += orbitSpeed;

        if (isCurrentlyLoading) {
          // Pull words into singularity event horizon and fade out
          word.radius -= (word.radius - (blackHoleRadius - 3)) * 0.055;
          word.opacity -= 0.025;
          word.stretch += 0.065;
          word.scale -= 0.015;

          if (word.radius <= blackHoleRadius + 2) {
            word.opacity = 0;
          }
        } else {
          // Smoothly drift back to their natural stable orbits
          word.radius += (word.baseRadius - word.radius) * 0.032;
          word.opacity += (1.0 - word.opacity) * 0.035;
          word.stretch += (0.0 - word.stretch) * 0.06;
          word.scale += (1.0 - word.scale) * 0.035;
        }

        const rad = Math.max(blackHoleRadius, word.radius);
        const wx = centerX + Math.cos(word.angle) * rad;
        const wy = centerY + Math.sin(word.angle) * rad;

        if (word.opacity > 0.01) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, word.opacity));

          const wordHue = (globalHue + word.hueOffset) % 360;
          const textGlow = `hsl(${wordHue}, 100%, 65%)`;

          // Neon glowing drop shadows
          ctx.shadowColor = textGlow;
          ctx.shadowBlur = 10;
          ctx.fillStyle = textGlow;

          const dx = centerX - wx;
          const dy = centerY - wy;
          const pullAngle = Math.atan2(dy, dx);

          // Gravitational Spaghettification Warp
          ctx.translate(wx, wy);
          ctx.rotate(pullAngle + Math.PI / 2); // Text perpendicular to pull vector
          
          const stretchX = 1.0;
          const stretchY = 1.0 + word.stretch * 3.2; // Intense tidal stretch
          ctx.scale(stretchX * word.scale, stretchY * word.scale);

          ctx.fillText(word.text.toUpperCase(), 0, 0);
          ctx.restore();
          ctx.shadowBlur = 0;
        }
      });

      // 2. Ultra Realistic Black Hole Accretion Disk (Swirling plasma)
      const diskRadiusMultiplier = 2.8 + transitionProgress * 1.5;
      const accretionDiskRadius = blackHoleRadius * diskRadiusMultiplier;

      const diskGrad = ctx.createRadialGradient(
        centerX, centerY, blackHoleRadius - 5,
        centerX, centerY, accretionDiskRadius
      );
      // High-temperature plasma color shift
      diskGrad.addColorStop(0, `hsla(${(globalHue + 40) % 360}, 100%, 65%, 0.48)`); // Hot accretion edge
      diskGrad.addColorStop(0.3, `hsla(${globalHue}, 100%, 55%, 0.22)`); // Intermediate disk
      diskGrad.addColorStop(0.7, `hsla(${(globalHue + 280) % 360}, 90%, 45%, 0.1)`); // Outer halo
      diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, accretionDiskRadius, 0, Math.PI * 2);
      ctx.fill();

      // Relativistic Beaming Asymmetry (Spinning rays brighter on approach)
      const rays = 4;
      const rayRotation = time * (0.8 + transitionProgress * 1.5);
      for (let r = 0; r < rays; r++) {
        const rayAngle = rayRotation + (r * (Math.PI * 2 / rays));
        
        // Doppler Beaming: Approaching ray (moving towards left observer) is highly boosted
        const isApproaching = Math.sin(rayAngle) > 0;
        const opacityMultiplier = isApproaching ? 0.58 : 0.16;

        const rayGrad = ctx.createLinearGradient(
          centerX, centerY, 
          centerX + Math.cos(rayAngle) * blackHoleRadius * 2.3, 
          centerY + Math.sin(rayAngle) * blackHoleRadius * 2.3
        );
        rayGrad.addColorStop(0, `hsla(${(globalHue + r * 30) % 360}, 100%, 60%, ${opacityMultiplier * (1.0 + transitionProgress * 1.2)})`);
        rayGrad.addColorStop(0.5, `hsla(${globalHue}, 100%, 50%, ${opacityMultiplier * 0.4})`);
        rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = r % 2 === 0 ? 10 : 15;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rayAngle) * blackHoleRadius * 2.3, centerY + Math.sin(rayAngle) * blackHoleRadius * 2.3);
        ctx.stroke();
      }

      // Einstein Ring Gravitational Lens border (Extreme bending of light)
      ctx.strokeStyle = `hsla(${globalHue}, 100%, 65%, 0.85)`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = `hsl(${globalHue}, 100%, 65%)`;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius + Math.sin(time * 5) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Reset shadows
      ctx.shadowBlur = 0;

      // Event Horizon core (Absolute black singularity)
      ctx.fillStyle = '#020202';
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius - 2, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Event horizon boundary quantum glow
      ctx.strokeStyle = `hsla(${(globalHue + 120) % 360}, 100%, 60%, 0.35)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius - 2.5, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
        parent.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-45 mix-blend-screen"
    />
  );
};
