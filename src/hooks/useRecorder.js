import { useRef, useState, useCallback, useEffect } from "react";

// MediaRecorder + Web Speech API (live transcript) with graceful degradation.
// `lang` is a BCP-47 locale hint for speech recognition ("en" | "fr").
//
// Cross-browser notes:
// - Safari (iOS/macOS) records MP4/AAC and rejects audio/webm, so the mime type
//   is negotiated instead of hardcoded.
// - Mobile browsers suspend the mic when a recorder is left half-started, so a
//   single session is strictly guarded (no double getUserMedia calls).
// - Chunks are flushed on a timeslice *and* on stop, so a long round never ends
//   with an empty or truncated blob.

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/aac",
];

function pickMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") return "";
  for (const type of MIME_CANDIDATES) {
    try {
      if (window.MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      /* isTypeSupported can throw on unusual builds */
    }
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
  const urlRef = useRef(null);
  const startingRef = useRef(false); // permission request in flight
  const stopRequestedRef = useRef(false); // stop() called while starting
  const activeRef = useRef(false); // a live recording session exists
  const unmountedRef = useRef(false);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    const hasMic =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window !== "undefined" &&
      typeof window.MediaRecorder !== "undefined";
    setMicSupported(hasMic);
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        /* track may already be ended */
      }
      streamRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onend = null;
        rec.onerror = null;
        rec.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    }
  }, []);

  // Turns the collected chunks into a playable blob URL and settles the state.
  const finalize = useCallback(() => {
    const mr = mediaRecorderRef.current;
    const declared = (mr && mr.mimeType) || "";
    const type = declared || (chunksRef.current[0] && chunksRef.current[0].type) || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    activeRef.current = false;
    startingRef.current = false;
    stopRequestedRef.current = false;
    releaseStream();

    if (blob.size > 0 && !unmountedRef.current) {
      if (urlRef.current) {
        try {
          URL.revokeObjectURL(urlRef.current);
        } catch {
          /* ignore */
        }
      }
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setAudioUrl(url);
    }
    if (!unmountedRef.current) setStatus("stopped");
  }, [releaseStream]);

  const start = useCallback(async () => {
    // One session at a time: a second tap must never open a second stream.
    if (startingRef.current || activeRef.current) return;
    startingRef.current = true;
    stopRequestedRef.current = false;
    finalTextRef.current = "";
    setTranscript("");

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function" ||
      typeof window.MediaRecorder === "undefined"
    ) {
      startingRef.current = false;
      setStatus("denied");
      return;
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      // Some browsers reject the constraint object but accept the boolean form.
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        startingRef.current = false;
        if (!unmountedRef.current) setStatus("denied");
        return;
      }
    }

    if (unmountedRef.current) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
      startingRef.current = false;
      return;
    }

    streamRef.current = stream;

    const mimeType = pickMimeType();
    let mr = null;
    try {
      mr = mimeType ? new window.MediaRecorder(stream, { mimeType }) : new window.MediaRecorder(stream);
    } catch {
      try {
        mr = new window.MediaRecorder(stream);
      } catch {
        releaseStream();
        startingRef.current = false;
        if (!unmountedRef.current) setStatus("denied");
        return;
      }
    }

    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onerror = () => {
      try {
        mr.stop();
      } catch {
        finalize();
      }
    };
    mr.onstop = finalize;

    mediaRecorderRef.current = mr;
    activeRef.current = true;
    startingRef.current = false;

    try {
      // Periodic chunks keep iOS Safari from dropping the tail of a long round.
      mr.start(250);
    } catch {
      try {
        mr.start();
      } catch {
        mediaRecorderRef.current = null;
        activeRef.current = false;
        releaseStream();
        if (!unmountedRef.current) setStatus("denied");
        return;
      }
    }

    if (!unmountedRef.current) setStatus("recording");

    // The user hit stop while the permission prompt was open.
    if (stopRequestedRef.current) {
      stopRequestedRef.current = false;
      stopRecognition();
      try {
        mr.stop();
      } catch {
        finalize();
      }
      return;
    }

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
            const text = e.results[i][0].transcript;
            if (e.results[i].isFinal) finalTextRef.current += text + " ";
            else interim += text;
          }
          setTranscript((finalTextRef.current + interim).trim());
        };
        rec.onerror = () => {};
        rec.onend = () => {
          // Restart only while the round is genuinely still recording.
          if (activeRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try {
              rec.start();
            } catch {
              /* recognition restart is best-effort */
            }
          }
        };
        rec.start();
        recognitionRef.current = rec;
      } catch {
        /* transcription is optional */
      }
    }
  }, [finalize, releaseStream, stopRecognition]);

  const stop = useCallback(() => {
    stopRecognition();

    // Permission still resolving: stop as soon as the stream is live.
    if (startingRef.current) {
      stopRequestedRef.current = true;
      return;
    }

    const mr = mediaRecorderRef.current;
    if (!mr) {
      activeRef.current = false;
      if (!unmountedRef.current) setStatus("stopped");
      return;
    }
    // Already stopping — onstop will finalize exactly once.
    if (mr.state === "inactive") return;

    try {
      if (mr.state === "recording" && typeof mr.requestData === "function") mr.requestData();
    } catch {
      /* Safari may not expose requestData */
    }

    try {
      mr.stop();
    } catch {
      finalize();
    }
  }, [finalize, stopRecognition]);

  const reset = useCallback(() => {
    stopRecognition();

    const mr = mediaRecorderRef.current;
    if (mr) {
      // Detach so a teardown stop cannot overwrite the fresh idle state.
      mr.onstop = null;
      mr.ondataavailable = null;
      mr.onerror = null;
      if (mr.state !== "inactive") {
        try {
          mr.stop();
        } catch {
          /* ignore */
        }
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    activeRef.current = false;
    startingRef.current = false;
    stopRequestedRef.current = false;
    releaseStream();

    if (urlRef.current) {
      try {
        URL.revokeObjectURL(urlRef.current);
      } catch {
        /* ignore */
      }
      urlRef.current = null;
    }
    setAudioUrl(null);
    setTranscript("");
    finalTextRef.current = "";
    setStatus("idle");
  }, [releaseStream, stopRecognition]);

  // Unmount: kill the mic, the recorder and any object URL.
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      stopRecognition();
      const mr = mediaRecorderRef.current;
      if (mr) {
        mr.onstop = null;
        mr.ondataavailable = null;
        if (mr.state !== "inactive") {
          try {
            mr.stop();
          } catch {
            /* ignore */
          }
        }
      }
      mediaRecorderRef.current = null;
      activeRef.current = false;
      releaseStream();
      // The object URL is intentionally kept alive: the review screen may still
      // be playing it after the drill unmounts. It is revoked on the next start
      // or on reset, and by the browser when the page unloads.
      urlRef.current = null;
    };
  }, [releaseStream, stopRecognition]);

  return { status, audioUrl, transcript, micSupported, speechSupported, start, stop, reset };
}
