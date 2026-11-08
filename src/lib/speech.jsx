import { useRecorder } from "@/hooks/useRecorder";
import { computeMetrics, paceBand, formatTime } from "./speech";
import { useState, useEffect } from "react";

export function SpeechPracticeComponent() {
  const { status, transcript, start, stop, reset } = useRecorder("en");
  const [duration, setDuration] = useState(0);

  // Track recording duration while status is "recording"
  useEffect(() => {
    let timer;
    if (status === "recording") {
      const startTime = Date.now() - duration * 1000;
      timer = setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 500);
    } else if (status === "idle") {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Compute metrics using your speech.js utilities!
  const metrics = computeMetrics(transcript, duration);
  const currentPaceBand = paceBand(metrics.wpm, status === "stopped");

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="text-2xl font-bold mb-4">Time: {formatTime(duration)}</div>
      
      {/* Live Pace Indicator */}
      <div className={`p-2 mb-4 text-white rounded ${currentPaceBand === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}>
        Current Pace: {metrics.wpm} WPM ({currentPaceBand})
      </div>

      {/* Live Transcript Display */}
      <div className="border p-4 rounded min-h-[100px] mb-4 bg-gray-50">
        <p className="text-gray-700">{transcript || "Start speaking to see your live transcript..."}</p>
      </div>

      {/* Filler Word Stats */}
      <div className="mb-4">
        <span className="font-semibold">Filler words detected: {metrics.fillerCount}</span>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {status !== "recording" ? (
          <button onClick={start} className="bg-blue-600 text-white px-4 py-2 rounded">Start Recording</button>
        ) : (
          <button onClick={stop} className="bg-red-600 text-white px-4 py-2 rounded">Stop</button>
        )}
        <button onClick={reset} className="bg-gray-300 px-4 py-2 rounded">Reset</button>
      </div>
    </div>
  );
}
