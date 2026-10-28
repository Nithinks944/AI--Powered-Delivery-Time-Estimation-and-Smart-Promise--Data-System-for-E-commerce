// src/components/background/WopeCosmicBackground.tsx
import React, { useEffect, useRef } from 'react';
import { useDataStore } from '../../store/useDataStore';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  size: number;
  alpha: number;
}

export const WopeCosmicBackground: React.FC = () => {
  const { theme } = useDataStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Lightweight 45 stars (eliminates GPU lag)
    const starCount = 45;
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.2,
      y: (Math.random() - 0.5) * height * 1.2,
      z: Math.random() * width,
      pz: 0,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let lastTime = performance.now();
    const fpsInterval = 1000 / 30; // Throttled to 30fps for ultra-lightweight performance

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 300;

      // Draw lightweight monochrome stars
      const starFillColor = isDark ? '255, 255, 255' : '20, 20, 25';

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= 0.8;

        if (star.z <= 10) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 1.2;
          star.y = (Math.random() - 0.5) * height * 1.2;
        }

        const projectedX = (star.x / star.z) * fov + cx;
        const projectedY = (star.y / star.z) * fov + cy;

        if (projectedX >= 0 && projectedX <= width && projectedY >= 0 && projectedY <= height) {
          const depthRatio = 1 - star.z / width;
          const radius = Math.max(0.5, star.size * depthRatio * 1.8);
          const finalAlpha = star.alpha * depthRatio * (isDark ? 0.75 : 0.4);

          ctx.beginPath();
          ctx.arc(projectedX, projectedY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${starFillColor}, ${finalAlpha.toFixed(2)})`;
          ctx.fill();
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-400">
      {/* 1. Monochromatic Base Background (Deep Obsidian Black / Porcelain White) */}
      <div
        className={`absolute inset-0 transition-colors duration-400 ${
          isDark ? 'bg-[#000000]' : 'bg-[#fafafa]'
        }`}
      />

      {/* 2. Hardware-accelerated Subtle Ambient Glow (No Heavy Blurs) */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none transition-opacity duration-400 ${
          isDark
            ? 'bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent opacity-80'
            : 'bg-gradient-to-b from-black/[0.03] to-transparent opacity-60'
        }`}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* 3. Lightweight 30FPS Monochromatic Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(0)' }} />

      {/* 4. Subtle Micro-Dot Grid */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-400 ${
          isDark ? 'opacity-[0.04]' : 'opacity-[0.03]'
        }`}
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};
