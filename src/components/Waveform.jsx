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
      const W = rect.width,
        H = rect.height;
      ctx.clearRect(0, 0, W, H);
      const n = bars.length;
      if (!n) return;
      const gap = 3;
      const bw = (W - gap * (n - 1)) / n;

      bars.forEach((v, i) => {
        const x = i * (bw + gap);
        const h = Math.max(3, v * H * 0.92);
        const played
