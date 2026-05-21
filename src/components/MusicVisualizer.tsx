import { useEffect, useRef } from "react";

interface MusicVisualizerProps {
  isPlaying: boolean;
  themePreset: string;
}

export default function MusicVisualizer({ isPlaying, themePreset }: MusicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 80;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = Math.floor(canvas.width / 4);
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);

      // Visual styling based on theme presets
      if (themePreset === "bass") {
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.4)");
        gradient.addColorStop(0.5, "rgba(239, 68, 68, 0.8)");
        gradient.addColorStop(1, "rgb(255, 120, 120)");
      } else if (themePreset === "chill") {
        gradient.addColorStop(0, "rgba(45, 212, 191, 0.4)");
        gradient.addColorStop(0.5, "rgba(45, 212, 191, 0.8)");
        gradient.addColorStop(1, "rgb(150, 255, 255)");
      } else if (themePreset === "vocal") {
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.4)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.8)");
        gradient.addColorStop(1, "rgb(230, 180, 255)");
      } else {
        gradient.addColorStop(0, "rgba(29, 185, 84, 0.3)");
        gradient.addColorStop(0.5, "rgba(29, 185, 84, 0.7)");
        gradient.addColorStop(1, "rgb(100, 255, 150)");
      }

      ctx.fillStyle = gradient;

      for (let i = 0; i < numBars; i++) {
        // Build varying math waves when playing, flat noise when idle
        const baseMultiplier = isPlaying ? 25 : 2;
        const wave1 = Math.sin(i * 0.15 + phase) * baseMultiplier;
        const wave2 = Math.cos(i * 0.05 - phase * 0.5) * (baseMultiplier / 2);
        const barHeight = Math.max(4, Math.abs(wave1 + wave2) + Math.sin(i * 0.5) * 5 + 10);

        const x = i * 4;
        const y = canvas.height - barHeight;
        
        // Draw neat rounded bar strips
        ctx.fillRect(x, y, 2, barHeight);
      }

      phase += isPlaying ? 0.08 : 0.01;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isPlaying, themePreset]);

  return (
    <div className="hidden md:block w-full h-20 bg-black/40 border border-[#1e1e24] rounded-2xl overflow-hidden relative">
      <div className="absolute top-2 left-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none select-none">
        Reactive Visualizer Core
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
