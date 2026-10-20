import { useRef, useState, useCallback, useEffect } from "react";

// Helper to determine a supported MIME type across Desktop, Android, and iOS Safari
function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function useRecorder(lang = "en") {
  const [status, setStatus] = useState("idle"); // idle | recording | stopped | denied
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [micSupported, setMicSupported] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef("");
  const langRef = useRef(lang);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    setMicSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const start = useCallback(async () => {
    finalTextRef.current = "";
    setTranscript("");
    setAudioUrl(null);
    isStoppingRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("denied");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mr = new MediaRecorder(stream, options);

      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        try {
          const finalType = mr.mimeType || mimeType || "audio/mp4";
          const blob = new Blob(chunksRef.current, { type: finalType });
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
        } catch (e) {
          console.error("Failed to process recorded audio Blob:", e);
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
          }
          setStatus("stopped");
        }
      };

      mr.start(250); // Request slices every 250ms to ensure chunks arrive smoothly on mobile
      mediaRecorderRef.current = mr;
      setStatus("recording");

      // Mobile-safe Web Speech API setup
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        try {
          const rec = new SR();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = langRef.current === "fr" ? "fr-FR" : "en-US";

          rec.onresult = (e) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const t = e.results[i][0].transcript;
              if (e.results[i].isFinal) finalTextRef.current += t + " ";
              else interim += t;
            }
            setTranscript((finalTextRef.current + interim).trim());
          };

          rec.onerror = (err) => {
            console.warn("Speech recognition notice:", err);
          };

          rec.onend = () => {
            // Only attempt restart if we are actively recording and NOT in the process of stopping
            if (
              !isStoppingRef.current &&
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              try {
                rec.start();
              } catch (e) {
                // Prevent aggressive restart loops on mobile
              }
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn("Could not start Web Speech API:", e);
        }
      }
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setStatus("denied");
    }
  }, []);

  const stop = useCallback(() => {
    isStoppingRef.current = true;

    // Safely stop speech recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Detach listener so it stops cleanly
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Safely stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        setStatus("stopped");
      }
    } else {
      setStatus("stopped");
    }

    // Immediately stop microphone tracks to eliminate notification twitching
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript("");
    setStatus("idle");
    finalTextRef.current = "";
    isStoppingRef.current = false;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  return { status, audioUrl, transcript, micSupported, speechSupported, start, stop, reset };
}
