import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/speech";

const Waveform = forwardRef(function Waveform(
  { audioUrl, markers = [], onAddMarker, onSelectMarker, onDurationChange, accent = "coral" },
  ref
) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [bars, setBars] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    seek: (t) => {
      try {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = t;
        setCurrent(t);
        setProgress(a.duration ? t / a.duration : 0);
      } catch (e) {}
    },
    getTime: () => (audioRef.current ? audioRef.current.currentTime : 0),
    play: () => {
      const a = audioRef.current;
      if (a) a.play().catch(() => {});
    },
    pause: () => {
      const a = audioRef.current;
      if (a) a.pause();
    },
  }));

  // Safe audio decoder with mobile fallback
  useEffect(() => {
    if (!audioUrl) {
      setBars(Array(110).fill(0.3));
      setReady(true);
      return;
    }
    let cancelled = false;
    setReady(false);
    setBars([]);

    (async () => {
      try {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error("Audio fetch failed");
        const ab = await res.arrayBuffer();
        if (cancelled) return;

        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          try {
            const decodePromise = new Promise((resolve, reject) => {
              const res = ctx.decodeAudioData(ab.slice(0), resolve, reject);
              if (res && typeof res.then === "function") {
                res.then(resolve).catch(reject);
              }
            });

            const buf = await decodePromise;
            if (ctx.state !== "closed" && typeof ctx.close === "function") {
              await ctx.close();
            }
            if (cancelled) return;

            const data = buf.getChannelData(0);
            const N = 110;
            const step = Math.max(1, Math.floor(data.length / N));
            const out = [];
            for (let i = 0; i < N; i++) {
              let max = 0;
              for (let j = 0; j < step; j++) {
                const v = Math.abs(data[i * step + j] || 0);
                if (v > max) max = v;
              }
              out.push(max);
            }
            const peak = Math.max(...out, 0.01);
            setBars(out.map((v) => Math.max(0.04, v / peak)));
          } catch (decodeErr) {
            setBars(Array(110).fill(0.3));
          }
        } else {
          setBars(Array(110).fill(0.3));
        }
        setReady(true);
      } catch (err) {
        setBars(Array(110).fill(0.3));
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  // Safe canvas rendering loop
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);
      const n = bars.length;
      if (!n) return;
      const gap = 3;
      const bw = (W - gap * (n - 1)) / n;

      bars.forEach((v, i) => {
        const x = i * (bw + gap);
        const h = Math.max(3, v * H * 0.92);
        const played = i / n <= progress;
        ctx.fillStyle = played ? `hsl(var(--${accent}-deep))` : "hsl(var(--charcoal) / 0.16)";
        const y = (H - h) / 2;

        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          try {
            ctx.roundRect(x, y, bw, h, bw / 2);
          } catch (e) {
            ctx.rect(x, y, bw, h);
          }
        } else {
          ctx.rect(x, y, bw, h);
        }
        ctx.fill();
      });

      const px = progress * W;
      ctx.fillStyle = "hsl(var(--charcoal))";
      ctx.fillRect(px - 1, 0, 2, H);

      markers.forEach((m) => {
        if (!duration) return;
        const x = (m.time / duration) * W;
        ctx.fillStyle = "hsl(var(--butter-deep))";
        ctx.beginPath();
        ctx.arc(x, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "hsl(var(--charcoal))";
        ctx.beginPath();
        ctx.arc(x, 10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "hsl(var(--butter-deep) / 0.6)";
        ctx.beginPath();
        ctx.moveTo(x, 14);
        ctx.lineTo(x, H);
        ctx.stroke();
      });
    } catch (err) {
      console.warn("Canvas render safeguard caught error:", err);
    }
  }, [bars, progress, markers, duration, accent]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const replay = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => {});
  };

  const handleCanvasClick = (e) => {
    try {
      const canvas = canvasRef.current;
      const a = audioRef.current;
      if (!canvas || !a || !duration) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = (x / rect.width) * duration;
      const near = markers.find((m) => Math.abs(m.time - t) < 0.6);
      if (near && onSelectMarker) {
        onSelectMarker(near);
        return;
      }
      if (onAddMarker) onAddMarker(t);
    } catch (e) {}
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-24 sm:h-28 cursor-pointer rounded-xl"
        aria-label="Audio waveform — click to add a note"
      />
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={(e) => {
          const d = e.target.duration || 0;
          setDuration(d);
          if (onDurationChange) onDurationChange(d);
        }}
        onTimeUpdate={(e) => {
          const a = e.target;
          setCurrent(a.currentTime);
          setProgress(a.duration ? a.currentTime / a.duration : 0);
        }}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            disabled={!ready}
            className="w-12 h-12 rounded-full bg-charcoal text-cream flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={replay}
            disabled={!ready}
            className="w-10 h-10 rounded-full bg-charcoal/8 text-charcoal flex items-center justify-center hover:bg-charcoal/15 transition-colors disabled:opacity-40"
            aria-label="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="font-mono text-sm text-charcoal/60 tabular-nums">
          {formatTime(current)} <span className="text-charcoal/30">/</span> {formatTime(duration)}
        </div>
      </div>
      {!ready && audioUrl && (
        <p className="mt-2 text-xs text-charcoal/40 font-mono">Rendering waveform…</p>
      )}
      <p className="mt-1 text-xs text-charcoal/40">Tip: click the waveform to drop a note at that moment.</p>
    </div>
  );
});

export default Waveform;
