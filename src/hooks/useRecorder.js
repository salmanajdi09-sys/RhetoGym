import { useRef, useState, useCallback, useEffect } from "react";

// MediaRecorder + Web Speech API (live transcript) with graceful degradation.
// `lang` is a BCP-47 locale hint for speech recognition ("en" | "fr").
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

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    setMicSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const start = useCallback(async () => {
    finalTextRef.current = "";
    setTranscript("");
    setAudioUrl(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("denied");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size > 0) setAudioUrl(URL.createObjectURL(blob));
        streamRef.current.getTracks().forEach((t) => t.stop());
        setStatus("stopped");
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setStatus("recording");

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
          rec.onerror = () => {};
          rec.onend = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              try { rec.start(); } catch {}
            }
          };
          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }
    } catch {
      setStatus("denied");
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      setStatus("stopped");
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript("");
    setStatus("idle");
    finalTextRef.current = "";
  }, [audioUrl]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, [audioUrl]);

  return { status, audioUrl, transcript, micSupported, speechSupported, start, stop, reset };
}
