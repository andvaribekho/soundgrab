"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function proxyUrl(url: string): string {
  return `/api/audio-proxy?url=${encodeURIComponent(url)}`;
}

interface SoundEntry {
  id: string;
  name: string;
  useVariants: boolean;
}

interface SoundResult {
  id: number;
  name: string;
  previews: Record<string, string>;
  duration: number;
  license: string;
  username: string;
}

interface OgaResult {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  license: string;
  duration: number;
  files: { url: string; name: string; size: string }[];
}

interface SoundBibleResult {
  id: string;
  title: string;
  author: string;
  url: string;
  audioUrl: string;
  filename: string;
  description: string;
  license: string;
  duration: number;
}

interface SonnissResult {
  id: string;
  title: string;
  author: string;
  url: string;
  audioUrl: string;
  filename: string;
  description: string;
  license: string;
  duration: number;
}

interface CropItem {
  start: number;
  end: number;
  index: number;
}

interface PackItem {
  uid: string;
  name: string;
  url: string;
  filename: string;
  source: string;
}

interface SearchResponse {
  count: number;
  results: SoundResult[];
  variants?: string[];
}

interface OgaSearchResponse {
  results: OgaResult[];
  searchUrl: string;
}

interface SoundBibleSearchResponse {
  results: SoundBibleResult[];
  searchUrl: string;
}

interface SonnissSearchResponse {
  results: SonnissResult[];
  searchUrl: string;
}

interface GroupedResults {
  entry: SoundEntry;
  results: SoundResult[];
  variants?: string[];
  ogaResults: OgaResult[];
  soundBibleResults: SoundBibleResult[];
  sonnissResults: SonnissResult[];
  error?: string;
  ogaError?: string;
  soundBibleError?: string;
  sonnissError?: string;
}



// ─── Mini waveform component ───

function MiniWaveform({
  url,
  width = 200,
  height = 32,
}: {
  url: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      try {
        const resp = await fetch(proxyUrl(url));
        const buf = await resp.arrayBuffer();
        const ctx = new AudioContext();
        const audioBuf = await ctx.decodeAudioData(buf);
        ctx.close();
        if (cancelled) return;
        drawMiniWaveform(canvas, audioBuf, width, height);
        setLoaded(true);
      } catch {
        // Silently fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        borderRadius: "3px",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.2s",
      }}
    />
  );
}

function drawMiniWaveform(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  w: number,
  h: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / w);

  ctx.beginPath();
  ctx.strokeStyle = "#6c5ce7";
  ctx.lineWidth = 0.7;
  const mid = h / 2;
  for (let i = 0; i < w; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const idx = Math.floor(i * step + j);
      if (idx < data.length) {
        const v = data[idx];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const y1 = mid + min * (mid - 2);
    const y2 = mid + max * (mid - 2);
    ctx.moveTo(i + 0.5, y1);
    ctx.lineTo(i + 0.5, y2);
  }
  ctx.stroke();
}

function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const data = audioBuffer.getChannelData(0);
  const buffer = new ArrayBuffer(44 + data.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + data.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
  view.setUint16(32, numChannels * bitsPerSample / 8, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, data.length * 2, true);
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export default function Home() {
  const [perEntry, setPerEntry] = useState(4);
  const [useFreeSound, setUseFreeSound] = useState(true);
  const [useOga, setUseOga] = useState(false);
  const [useSoundBible, setUseSoundBible] = useState(false);
  const [useSonniss, setUseSonniss] = useState(false);
  const [entries, setEntries] = useState<SoundEntry[]>([
    { id: crypto.randomUUID(), name: "", useVariants: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [groupedResults, setGroupedResults] = useState<GroupedResults[]>([]);
  const [error, setError] = useState("");
  const [showAllWaveforms, setShowAllWaveforms] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pack state
  const [pack, setPack] = useState<PackItem[]>([]);
  const [packOpen, setPackOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [downloadingZip, setDownloadingZip] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const [packPlayingUid, setPackPlayingUid] = useState<string | null>(null);
  const packAudioRef = useRef<HTMLAudioElement | null>(null);

  // Crop state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropExitConfirm, setCropExitConfirm] = useState(false);
  const [cropWaveformLoading, setCropWaveformLoading] = useState(false);
  const [cropUrl, setCropUrl] = useState("");
  const [cropName, setCropName] = useState("");
  const [cropBuffer, setCropBuffer] = useState<AudioBuffer | null>(null);
  const [cropStart, setCropStart] = useState(0);
  const [cropEnd, setCropEnd] = useState(1);
  const [cropLoop, setCropLoop] = useState(false);
  const [cropPlaying, setCropPlaying] = useState(false);
  const [cropViewStart, setCropViewStart] = useState(0);
  const [cropViewEnd, setCropViewEnd] = useState(1);
  const [cropCanvasCursor, setCropCanvasCursor] = useState("default");
  const [cropList, setCropList] = useState<CropItem[]>([]);
  const cropCounterRef = useRef(0);
  const [cropZipLoading, setCropZipLoading] = useState(false);
  const [cropPreviewIdx, setCropPreviewIdx] = useState<number | null>(null);
  const [cropAudioDuration, setCropAudioDuration] = useState(1);
  const cropAudioRef = useRef<HTMLAudioElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropAnimRef = useRef<number>(0);
  const cropDuration = cropBuffer?.duration || cropAudioDuration || 1;
  const cropViewLen = cropViewEnd - cropViewStart;
  const cropSliderStep = Math.max(0.00001, Math.min(0.01, cropViewLen / 10000));
  const cropDragMode = useRef<"start" | "end" | "selection" | "pan" | null>(null);
  const cropDragStartX = useRef(0);
  const cropPanStart = useRef(0);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  };

  const isInPack = (uid: string) => pack.some((p) => p.uid === uid);

  const togglePack = (item: PackItem) => {
    setPack((prev) => {
      if (prev.some((p) => p.uid === item.uid)) {
        showToast("sound removed from pack");
        return prev.filter((p) => p.uid !== item.uid);
      }
      showToast("sound added to pack");
      return [...prev, item];
    });
  };

  const removeFromPack = (uid: string) => {
    if (packPlayingUid === uid) {
      packAudioRef.current?.pause();
      packAudioRef.current = null;
      setPackPlayingUid(null);
    }
    setPack((prev) => prev.filter((p) => p.uid !== uid));
    showToast("sound removed from pack");
  };

  const togglePackPreview = (item: PackItem) => {
    if (packPlayingUid === item.uid) {
      packAudioRef.current?.pause();
      packAudioRef.current = null;
      setPackPlayingUid(null);
      return;
    }
    packAudioRef.current?.pause();
    const audio = new Audio(item.url);
    audio.volume = 0.8;
    audio.onended = () => setPackPlayingUid(null);
    audio.play().catch(() => setPackPlayingUid(null));
    packAudioRef.current = audio;
    setPackPlayingUid(item.uid);
  };

  const downloadPack = async () => {
    if (pack.length === 0) return;
    setDownloadingZip(true);
    try {
      const res = await fetch("/api/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: pack.map((p) => ({ url: p.url, name: p.filename })),
        }),
      });
      if (!res.ok) { showToast("Failed to create ZIP"); setDownloadingZip(false); return; }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "soundgrab-pack.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast(`Downloaded ${pack.length} sounds`);
    } catch { showToast("Download failed"); }
    setDownloadingZip(false);
  };

  const openCrop = async (url: string, name: string) => {
    setCropUrl(url);
    setCropName(name);
    setCropStart(0);
    setCropPlaying(false);
    setCropLoop(false);
    setCropList([]);
    setCropBuffer(null);
    setCropAudioDuration(1);
    setCropWaveformLoading(true);
    cropCounterRef.current = 0;
    setCropExitConfirm(false);
    setCropOpen(true);

    let decoded = false;
    try {
      const resp = await fetch(proxyUrl(url));
      const arrayBuf = await resp.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      setCropBuffer(audioBuf);
      setCropEnd(audioBuf.duration);
      setCropViewStart(0);
      setCropViewEnd(audioBuf.duration);
      setCropAudioDuration(audioBuf.duration);
      audioCtx.close();
      decoded = true;
    } catch {
      setCropBuffer(null);
    }

    if (!decoded) {
      setCropEnd(cropAudioDuration);
      setCropViewStart(0);
      setCropViewEnd(cropAudioDuration);
      setCropWaveformLoading(false);
    }
  };

  // Capture audio element duration when metadata loads
  const onCropAudioLoaded = useCallback(() => {
    const audio = cropAudioRef.current;
    if (audio && isFinite(audio.duration) && audio.duration > 0) {
      setCropAudioDuration(audio.duration);
      if (!cropBuffer) {
        setCropEnd(audio.duration);
        setCropViewStart(0);
        setCropViewEnd(audio.duration);
      }
    }
  }, [cropBuffer]);

  const closeCrop = () => {
    if (cropExitConfirm) {
      setCropExitConfirm(false);
      cropAudioRef.current?.pause();
      cropAudioRef.current = null;
      setCropOpen(false);
      setCropBuffer(null);
      setCropPlaying(false);
      setCropWaveformLoading(false);
      if (cropAnimRef.current) cancelAnimationFrame(cropAnimRef.current);
    } else {
      setCropExitConfirm(true);
    }
  };

  const timeToX = (t: number, w: number) => {
    const viewLen = cropViewEnd - cropViewStart;
    if (viewLen <= 0) return 0;
    return ((t - cropViewStart) / viewLen) * w;
  };

  const xToTime = (x: number, w: number) => {
    const viewLen = cropViewEnd - cropViewStart;
    if (viewLen <= 0) return 0;
    return cropViewStart + (x / w) * viewLen;
  };

  const drawWaveform = useCallback(() => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const buffer = cropBuffer;
    if (!buffer) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#555";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waveform not available (CORS) \u2014 playback still works", w / 2, h / 2);
      ctx.textAlign = "start";
      ctx.font = "10px monospace";
      ctx.fillText(`sel: ${formatTime(cropStart)} - ${formatTime(cropEnd)} (${formatTime(cropEnd - cropStart)})`, 8, h - 14);
      ctx.fillText(`zoom: ${(cropViewEnd - cropViewStart).toFixed(1)}s`, w - 100, h - 14);
      return;
    }

    const data = buffer.getChannelData(0);
    const dur = buffer.duration;
    const viewLen = cropViewEnd - cropViewStart;
    const sampleRate = data.length / dur;
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, w, 20);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    ctx.font = "9px monospace";
    ctx.fillStyle = "#555";
    const tickInterval = viewLen > 10 ? 1 : viewLen > 2 ? 0.5 : viewLen > 1 ? 0.1 : 0.05;
    for (let t = Math.floor(cropViewStart / tickInterval) * tickInterval; t <= cropViewEnd; t += tickInterval) {
      const tx = timeToX(t, w);
      if (tx >= 0 && tx <= w) {
        ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, 20); ctx.stroke();
        ctx.fillText(t.toFixed(tickInterval < 0.5 ? 2 : 1) + "s", tx + 2, 11);
      }
    }
    for (let i = 0; i <= 10; i++) {
      const gx = (i / 10) * w;
      ctx.beginPath(); ctx.moveTo(gx, 20); ctx.lineTo(gx, h); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, (h + 20) / 2); ctx.lineTo(w, (h + 20) / 2); ctx.stroke();
    const vs = Math.floor(cropViewStart * sampleRate);
    const ve = Math.floor(cropViewEnd * sampleRate);
    ctx.beginPath();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.7;
    const pps = w / (ve - vs);
    const bs = Math.max(1, Math.ceil(1 / pps));
    for (let i = vs; i < ve; i += bs) {
      let min = 1.0, max = -1.0;
      for (let j = 0; j < bs && i + j < ve; j++) {
        const v = data[i + j];
        if (v < min) min = v; if (v > max) max = v;
      }
      const xx = ((i - vs) / (ve - vs)) * w;
      ctx.moveTo(xx, 20 + ((min + 1) / 2) * (h - 20));
      ctx.lineTo(xx, 20 + ((max + 1) / 2) * (h - 20));
    }
    ctx.stroke();
    const sx = timeToX(cropStart, w);
    const ex = timeToX(cropEnd, w);
    ctx.fillStyle = "rgba(0, 200, 83, 0.12)";
    ctx.fillRect(sx, 20, ex - sx, h - 20);
    ctx.fillStyle = "#00c853";
    ctx.fillRect(sx - 1.5, 20, 3, h - 20);
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(ex - 1.5, 20, 3, h - 20);
    if (cropAudioRef.current && cropPlaying) {
      const px = timeToX(cropAudioRef.current.currentTime, w);
      if (px >= 0 && px <= w) { ctx.fillStyle = "#fff"; ctx.fillRect(px - 1, 20, 2, h - 20); }
    }
    ctx.fillStyle = "#888";
    ctx.font = "10px monospace";
    ctx.fillText(`sel: ${formatTime(cropStart)} - ${formatTime(cropEnd)} (${formatTime(cropEnd - cropStart)})`, 8, h - 14);
    ctx.fillText(`zoom: ${viewLen.toFixed(1)}s`, w - 100, h - 14);
  }, [cropBuffer, cropStart, cropEnd, cropViewStart, cropViewEnd, cropPlaying]);

  useEffect(() => {
    if (cropOpen && cropBuffer) {
      drawWaveform();
      setCropWaveformLoading(false);
    }
  }, [cropOpen, cropBuffer, cropStart, cropEnd, cropViewStart, cropViewEnd, cropPlaying, drawWaveform]);

  useEffect(() => {
    if (!cropPlaying || !cropCanvasRef.current) return;
    let alive = true;
    const tick = () => { if (!alive) return; drawWaveform(); cropAnimRef.current = requestAnimationFrame(tick); };
    cropAnimRef.current = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(cropAnimRef.current); };
  }, [cropPlaying, drawWaveform]);

  const stopPlayback = () => {
    const audio = cropAudioRef.current;
    if (audio) { audio.pause(); audio.currentTime = cropStart; }
    setCropPlaying(false);
  };

  const playCropSelection = () => {
    const audio = cropAudioRef.current;
    if (!audio) return;
    if (cropPlaying) { stopPlayback(); return; }
    audio.currentTime = cropStart;
    audio.play().catch(() => {});
    setCropPlaying(true);
  };

  const playCropSelectionRef = useRef(playCropSelection);
  playCropSelectionRef.current = playCropSelection;
  const closeCropRef = useRef(closeCrop);
  closeCropRef.current = closeCrop;

  useEffect(() => {
    if (!cropOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        playCropSelectionRef.current();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeCropRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cropOpen]);

  useEffect(() => {
    if (!cropBuffer) return;
    const active = cropPlaying || cropPreviewIdx !== null;
    if (!active) return;
    let alive = true;
    const targetEnd = cropPreviewIdx !== null
      ? cropList.find((c) => c.index === cropPreviewIdx)?.end ?? cropEnd
      : cropEnd;
    const enforce = () => {
      if (!alive) return;
      const audio = cropAudioRef.current;
      if (audio && !audio.paused) {
        if (audio.currentTime >= targetEnd) {
          audio.pause();
          audio.currentTime = cropPreviewIdx !== null
            ? cropList.find((c) => c.index === cropPreviewIdx)?.start ?? cropStart
            : cropStart;
          if (cropLoop && cropPreviewIdx === null) {
            audio.currentTime = cropStart;
            audio.play().catch(() => {});
          } else {
            setCropPlaying(false);
            setCropPreviewIdx(null);
            setCropLoop(false);
          }
        }
      }
      if (alive && (cropPlaying || cropPreviewIdx !== null)) requestAnimationFrame(enforce);
    };
    requestAnimationFrame(enforce);
    return () => { alive = false; };
  }, [cropPlaying, cropLoop, cropStart, cropEnd, cropBuffer, cropPreviewIdx, cropList]);

  const canvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropBuffer) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const w = canvas.width;
    if (e.button === 1) {
      e.preventDefault();
      cropDragMode.current = "pan";
      cropDragStartX.current = e.clientX;
      cropPanStart.current = cropViewStart;
      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - cropDragStartX.current) * scale;
        const viewLen = cropViewEnd - cropViewStart;
        const timeShift = -(dx / w) * viewLen;
        let ns = cropPanStart.current + timeShift;
        const dur = cropBuffer.duration;
        if (ns < 0) ns = 0;
        if (ns + viewLen > dur) ns = dur - viewLen;
        setCropViewStart(ns);
        setCropViewEnd(ns + viewLen);
      };
      const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); cropDragMode.current = null; };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      return;
    }
    const t = xToTime(x, w);
    const sx = timeToX(cropStart, w);
    const ex = timeToX(cropEnd, w);
    if (Math.abs(x - sx) <= 8) cropDragMode.current = "start";
    else if (Math.abs(x - ex) <= 8) cropDragMode.current = "end";
    else if (x > sx && x < ex) cropDragMode.current = "selection";
    else {
      const halfLen = (cropEnd - cropStart) / 2;
      let ns = t - halfLen, ne = t + halfLen;
      if (ns < 0) { ns = 0; ne = cropEnd - cropStart; }
      if (ne > cropBuffer.duration) { ne = cropBuffer.duration; ns = ne - (cropEnd - cropStart); }
      setCropStart(ns); setCropEnd(ne);
      return;
    }
    const onMove = (ev: MouseEvent) => {
      const nx = (ev.clientX - rect.left) * scale;
      let nt = xToTime(nx, w);
      nt = Math.max(0, Math.min(nt, cropBuffer.duration));
      switch (cropDragMode.current) {
        case "start": if (nt < cropEnd - 0.001) setCropStart(nt); break;
        case "end": if (nt > cropStart + 0.001) setCropEnd(nt); break;
        case "selection": {
          const selLen = cropEnd - cropStart;
          const origT = xToTime(x, w);
          const delta = nt - origT;
          let ns = cropStart + delta, ne = cropEnd + delta;
          if (ns < 0) { ns = 0; ne = selLen; }
          if (ne > cropBuffer.duration) { ne = cropBuffer.duration; ns = ne - selLen; }
          setCropStart(ns); setCropEnd(ne); break;
        }
      }
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); cropDragMode.current = null; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const canvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropBuffer || cropDragMode.current) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const w = canvas.width;
    const sx = timeToX(cropStart, w);
    const ex = timeToX(cropEnd, w);
    if (Math.abs(x - sx) <= 8 || Math.abs(x - ex) <= 8) setCropCanvasCursor("col-resize");
    else if (x > sx && x < ex) setCropCanvasCursor("grab");
    else setCropCanvasCursor("default");
  };

  const canvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!cropBuffer) return;
    e.preventDefault();
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const w = canvas.width;
    const zoomFactor = e.deltaY > 0 ? 1.3 : 0.7;
    const cursorTime = xToTime(x, w);
    let newLen = (cropViewEnd - cropViewStart) * zoomFactor;
    if (newLen > cropBuffer.duration) newLen = cropBuffer.duration;
    if (newLen < 0.02) newLen = 0.02;
    const ratio = (cursorTime - cropViewStart) / (cropViewEnd - cropViewStart);
    let ns = cursorTime - newLen * ratio;
    let ne = ns + newLen;
    if (ns < 0) { ns = 0; ne = newLen; }
    if (ne > cropBuffer.duration) { ne = cropBuffer.duration; ns = ne - newLen; }
    setCropViewStart(ns); setCropViewEnd(ne);
  };

  const canvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => { e.preventDefault(); };

  const downloadCropped = async () => {
    if (!cropUrl) return;
    try {
      const resp = await fetch(proxyUrl(cropUrl));
      const arrayBuf = await resp.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      const length = Math.floor((cropEnd - cropStart) * audioBuf.sampleRate);
      const offlineCtx = new OfflineAudioContext(audioBuf.numberOfChannels, length, audioBuf.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuf;
      source.connect(offlineCtx.destination);
      source.start(0, cropStart, cropEnd - cropStart);
      const rendered = await offlineCtx.startRendering();
      const wavBlob = encodeWav(rendered);
      const blobUrl = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = cropName.replace(/\.[^.]+$/, "") + "_crop.wav";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      audioCtx.close();
      showToast("Cropped sound downloaded");
    } catch { showToast("Crop failed"); }
  };

  const addCrop = () => {
    cropCounterRef.current += 1;
    setCropList((prev) => [...prev, { start: cropStart, end: cropEnd, index: cropCounterRef.current }]);
    showToast(`Crop ${cropCounterRef.current} saved`);
  };

  const removeCrop = (idx: number) => { setCropList((prev) => prev.filter((c) => c.index !== idx)); };

  const downloadAllCrops = async () => {
    if (!cropUrl || cropList.length === 0) return;
    setCropZipLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const baseName = cropName.replace(/\.[^.]+$/, "");
      const resp = await fetch(proxyUrl(cropUrl));
      const arrayBuf = await resp.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
      for (const crop of cropList) {
        const length = Math.floor((crop.end - crop.start) * audioBuf.sampleRate);
        const offlineCtx = new OfflineAudioContext(audioBuf.numberOfChannels, length, audioBuf.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuf;
        source.connect(offlineCtx.destination);
        source.start(0, crop.start, crop.end - crop.start);
        const rendered = await offlineCtx.startRendering();
        zip.file(`${baseName}-crop${crop.index}.wav`, encodeWav(rendered));
      }
      audioCtx.close();
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = `${baseName}-crops.zip`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast(`${cropList.length} crops downloaded`);
    } catch { showToast("Failed to create crops ZIP"); }
    setCropZipLoading(false);
  };

  const previewCropItem = (item: CropItem) => {
    const audio = cropAudioRef.current;
    if (!audio) return;
    if (cropPreviewIdx === item.index) { audio.pause(); setCropPreviewIdx(null); return; }
    audio.pause();
    setCropPlaying(false);
    audio.currentTime = item.start;
    audio.play().catch(() => {});
    setCropPreviewIdx(item.index);
  };

  const addRow = () => {
    setEntries((prev) => [...prev, { id: crypto.randomUUID(), name: "", useVariants: true }]);
  };

  const removeRow = (id: string) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.id !== id);
    });
  };

  const updateName = (id: string, name: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name } : e))
    );
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;

    const lines = text
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const allTerms: string[] = [];
    for (const line of lines) {
      const cols = line.split("\t").map((c) => c.trim()).filter((c) => c.length > 0);
      allTerms.push(...cols);
    }

    if (allTerms.length === 0) return;

    e.preventDefault();
    setEntries(allTerms.map((name) => ({ id: crypto.randomUUID(), name, useVariants: true })));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter((l) => l.length > 0);
      const allTerms: string[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim()).filter((c) => c.length > 0);
        allTerms.push(...cols);
      }
      if (allTerms.length === 0) return;
      setEntries(allTerms.map((name) => ({ id: crypto.randomUUID(), name, useVariants: true })));
      showToast(`Pasted ${allTerms.length} entries`);
    } catch {
      showToast("Clipboard access denied");
    }
  };

  const handleSearch = async () => {
    setError("");
    setGroupedResults([]);

    const validEntries = entries.filter(
      (e) => e.name.trim().length > 0
    );

    if (validEntries.length === 0) {
      setError("Add at least one sound name");
      return;
    }

    if (!useFreeSound && !useOga && !useSoundBible && !useSonniss) {
      setError("Select at least one source");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: validEntries.length });

    const groups: GroupedResults[] = [];

    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      const group: GroupedResults = {
        entry,
        results: [],
        variants: [],
        ogaResults: [],
        soundBibleResults: [],
        sonnissResults: [],
      };

      if (useFreeSound) {
        try {
          const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              term: entry.name.trim(),
              count: perEntry,
              useVariants: entry.useVariants,
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            group.error = err.error || "FreeSound search failed";
          } else {
            const data: SearchResponse = await res.json();
            group.results = data.results || [];
            group.variants = data.variants;
          }
        } catch (err: unknown) {
          group.error = err instanceof Error ? err.message : "FreeSound error";
        }
      }

      if (useOga) {
        try {
          const ogaRes = await fetch("/api/oga-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: entry.name.trim(), count: perEntry, useVariants: entry.useVariants }),
          });

          if (!ogaRes.ok) {
            const ogaErr = await ogaRes.json();
            group.ogaError = ogaErr.error || "OGA search failed";
          } else {
            const ogaData: OgaSearchResponse = await ogaRes.json();
            group.ogaResults = ogaData.results || [];
          }
        } catch (err: unknown) {
          group.ogaError = err instanceof Error ? err.message : "OGA error";
        }
      }

      if (useSoundBible) {
        try {
          const sbRes = await fetch("/api/soundbible-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: entry.name.trim(), count: perEntry, useVariants: entry.useVariants }),
          });

          if (!sbRes.ok) {
            const sbErr = await sbRes.json();
            group.soundBibleError = sbErr.error || "SoundBible search failed";
          } else {
            const sbData: SoundBibleSearchResponse = await sbRes.json();
            group.soundBibleResults = sbData.results || [];
          }
        } catch (err: unknown) {
          group.soundBibleError = err instanceof Error ? err.message : "SoundBible error";
        }
      }

      if (useSonniss) {
        try {
          const sonnissRes = await fetch("/api/sonniss-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: entry.name.trim(), count: perEntry, useVariants: entry.useVariants }),
          });

          if (!sonnissRes.ok) {
            const sonnissErr = await sonnissRes.json();
            group.sonnissError = sonnissErr.error || "Sonniss search failed";
          } else {
            const sonnissData: SonnissSearchResponse = await sonnissRes.json();
            group.sonnissResults = sonnissData.results || [];
          }
        } catch (err: unknown) {
          group.sonnissError = err instanceof Error ? err.message : "Sonniss error";
        }
      }

      groups.push(group);
      setProgress({ current: i + 1, total: validEntries.length });
    }

    setGroupedResults(groups);
    setLoading(false);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, filename }),
      });

      if (!res.ok) {
        window.open(url, "_blank");
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const getPreviewUrl = (previews: Record<string, string>): string => {
    return previews["preview-hq-mp3"] || previews["preview-lq-mp3"] || "";
  };

  const formatDuration = (sec: number): string => {
    if (sec == null) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const abbreviateLicense = (license: string): string => {
    const l = license.trim();
    if (/creative commons 0/i.test(l)) return "CC0";
    if (/attribution noncommercial/i.test(l)) return "CC-BY-NC";
    if (/attribution sharealike/i.test(l)) return "CC-BY-SA";
    if (/attribution/i.test(l)) return "CC-BY";
    if (/gpl.?3/i.test(l)) return "GPL-3";
    if (/gpl.?2/i.test(l)) return "GPL-2";
    if (/oga-by.?4/i.test(l)) return "OGA-BY-4";
    if (/oga-by.?3/i.test(l)) return "OGA-BY-3";
    if (/sonniss/i.test(l)) return "Sonniss";
    if (/cc0/i.test(l)) return "CC0";
    if (/public domain/i.test(l)) return "CC0";
    // Return first word or abbreviation
    const m = l.match(/^[A-Z]{2,}[-\d\.]*/);
    return m ? m[0] : l.slice(0, 12);
  };

  const formatTime = (t: number): string => {
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return `${s}.${ms.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="container" ref={containerRef}>
      {/* Floating pack button */}
      <div className="pack-float">
        <button
          className={`pack-toggle ${pack.length > 0 ? "pack-has-items" : ""}`}
          onClick={() => { if (packOpen) { packAudioRef.current?.pause(); packAudioRef.current = null; setPackPlayingUid(null); } setPackOpen(!packOpen); }}
          title="Download pack"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {pack.length > 0 && (
            <span className="pack-badge">{pack.length}</span>
          )}
        </button>

        {packOpen && (
          <div className="pack-dropdown">
            <div className="pack-dropdown-header">
              <span>Sound Pack ({pack.length})</span>
              <button
                className="pack-close"
                onClick={() => { packAudioRef.current?.pause(); packAudioRef.current = null; setPackPlayingUid(null); setPackOpen(false); }}
              >
                x
              </button>
            </div>
            {pack.length === 0 ? (
              <div className="pack-empty">Click + on any sound to add it</div>
            ) : (
              <div className="pack-list">
                {pack.map((item) => (
                  <div key={item.uid} className="pack-item">
                    <button
                      className={`pack-item-play ${packPlayingUid === item.uid ? "pack-item-stop" : ""}`}
                      onClick={() => togglePackPreview(item)}
                      title={packPlayingUid === item.uid ? "Stop" : "Play"}
                    >
                      {packPlayingUid === item.uid ? "\u25A0" : "\u25B6"}
                    </button>
                    <span className="pack-item-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="pack-item-source">{item.source}</span>
                    <button
                      className="pack-item-remove"
                      onClick={() => removeFromPack(item.uid)}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  className="pack-download-btn"
                  onClick={downloadPack}
                  disabled={downloadingZip}
                >
                  {downloadingZip
                    ? "Creating ZIP..."
                    : `Download All (${pack.length} files)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* ─── Crop Modal ─── */}
      {cropOpen && (
        <div className="crop-overlay" onClick={closeCrop}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-header">
              <span>Crop: {cropName}</span>
              <button className="crop-close" onClick={closeCrop}>x</button>
            </div>

            {cropExitConfirm && (
              <div className="crop-confirm-overlay">
                <div className="crop-confirm-box">
                  <span>Exit editor?</span>
                  <div className="crop-confirm-btns">
                    <button className="btn btn-primary" onClick={() => { setCropExitConfirm(false); cropAudioRef.current?.pause(); cropAudioRef.current = null; setCropOpen(false); setCropBuffer(null); setCropPlaying(false); setCropWaveformLoading(false); if (cropAnimRef.current) cancelAnimationFrame(cropAnimRef.current); }}>Yes</button>
                    <button className="btn btn-secondary" onClick={() => setCropExitConfirm(false)}>No</button>
                  </div>
                </div>
              </div>
            )}

            <div className="crop-waveform-shell">
              <canvas
                ref={cropCanvasRef}
                className="crop-canvas"
                width={900}
                height={200}
                onMouseDown={canvasMouseDown}
                onMouseMove={canvasMouseMove}
                onWheel={canvasWheel}
                onContextMenu={canvasContextMenu}
                style={{ cursor: cropCanvasCursor }}
              />
              {cropWaveformLoading && (
                <div className="crop-waveform-loading">
                  <div className="crop-waveform-spinner" />
                  <span>Generating waveform...</span>
                </div>
              )}
            </div>

            <div className="crop-info">
              <span>Start: {formatTime(cropStart)}</span>
              <span>End: {formatTime(cropEnd)}</span>
              <span>Duration: {formatTime(cropEnd - cropStart)}</span>
            </div>

            <div className="crop-range-row">
              <label>Start</label>
              <input
                type="range"
                min={0}
                max={cropDuration}
                step={cropSliderStep}
                value={cropStart}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v < cropEnd - 0.0001) setCropStart(v);
                }}
              />
              <label>End</label>
              <input
                type="range"
                min={0}
                max={cropDuration}
                step={cropSliderStep}
                value={cropEnd}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > cropStart + 0.0001) setCropEnd(v);
                }}
              />
            </div>

            {cropUrl && (
              <audio
                ref={cropAudioRef}
                src={proxyUrl(cropUrl)}
                preload="auto"
                onLoadedMetadata={onCropAudioLoaded}
                style={{ display: "none" }}
              />
            )}

            <div className="crop-actions">
              <button className="btn btn-primary" onClick={playCropSelection}>
                {cropPlaying ? "Stop" : "Play Selection"}
              </button>
              <button
                className={`btn ${cropLoop ? "btn-loop-on" : "btn-loop-off"}`}
                onClick={() => setCropLoop(!cropLoop)}
              >
                Loop {cropLoop ? "ON" : "OFF"}
              </button>
              <button className="btn btn-crop-dl" onClick={downloadCropped}>
                Crop &amp; Download
              </button>
              <button className="btn btn-add-crop" onClick={addCrop}>
                + Add Crop
              </button>
            </div>

            {cropList.length > 0 && (
              <div className="crop-list-area">
                <div className="crop-list-header">
                  <span>Saved crops ({cropList.length})</span>
                  <button
                    className="btn-dl-all"
                    onClick={downloadAllCrops}
                    disabled={cropZipLoading}
                  >
                    {cropZipLoading ? "Creating ZIP..." : "Download All as ZIP"}
                  </button>
                </div>
                <div className="crop-list-scroll">
                  {cropList.map((c) => (
                    <div key={c.index} className="crop-list-item">
                      <button
                        className={`crop-play-btn ${cropPreviewIdx === c.index ? "crop-pause-btn" : ""}`}
                        onClick={() => previewCropItem(c)}
                        title={cropPreviewIdx === c.index ? "Stop" : "Play"}
                      >
                        {cropPreviewIdx === c.index ? "\u25A0" : "\u25B6"}
                      </button>
                      <span className="crop-list-name">
                        {cropName.replace(/\.[^.]+$/, "")}-crop{c.index}.wav
                      </span>
                      <span className="crop-list-meta">
                        {formatTime(c.start)} &ndash; {formatTime(c.end)} ({formatTime(c.end - c.start)})
                      </span>
                      <button
                        className="crop-list-del"
                        onClick={() => removeCrop(c.index)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="crop-hint">
              Drag handles to select | Wheel to zoom | Middle-click to pan | Click outside selection to move
            </div>
          </div>
        </div>
      )}

      <h1>SoundGrab 0.3</h1>
      <p className="subtitle">
        Search FreeSound, OpenGameArt, SoundBible &amp; Sonniss and download sounds in bulk
        &mdash;{" "}
        <span style={{ color: "#6c5ce7" }}>
          Ctrl+V to paste from spreadsheet
        </span>
      </p>

      <div className="style-row">
        <label htmlFor="perEntry">
          Results:
        </label>
        <input
          id="perEntry"
          type="number"
          value={perEntry}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1 && v <= 50) setPerEntry(v);
          }}
          min={1}
          max={50}
          style={{ maxWidth: "70px" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "1.5rem", cursor: "pointer", fontSize: "0.82rem", color: "#aaa" }}>
          <input
            type="checkbox"
            checked={showAllWaveforms}
            onChange={(e) => setShowAllWaveforms(e.target.checked)}
            style={{ accentColor: "#6c5ce7", width: 15, height: 15 }}
          />
          Waveform
        </label>
      </div>

      <div className="source-row">
        <label className="source-label">
          <input
            type="checkbox"
            checked={useFreeSound}
            onChange={(e) => setUseFreeSound(e.target.checked)}
          />
          FreeSound
        </label>
        <label className="source-label">
          <input
            type="checkbox"
            checked={useOga}
            onChange={(e) => setUseOga(e.target.checked)}
          />
          OpenGameArt
        </label>
        <label className="source-label">
          <input
            type="checkbox"
            checked={useSoundBible}
            onChange={(e) => setUseSoundBible(e.target.checked)}
          />
          SoundBible
        </label>
        <label className="source-label">
          <input
            type="checkbox"
            checked={useSonniss}
            onChange={(e) => setUseSonniss(e.target.checked)}
          />
          Sonniss
        </label>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="row-num">#</th>
              <th>Sound Name</th>
              <th style={{ width: 30, textAlign: "center" }} title="Include alternate search terms">ALT</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={entry.id}>
                <td className="row-num">{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateName(entry.id, e.target.value)}
                    placeholder="e.g. jump, laser, explosion..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={entry.useVariants}
                    onChange={(e) =>
                      setEntries((prev) =>
                        prev.map((en) =>
                          en.id === entry.id
                            ? { ...en, useVariants: e.target.checked }
                            : en
                        )
                      )
                    }
                    title="Use alternate search terms for this entry"
                    style={{ accentColor: "#6c5ce7", width: 14, height: 14 }}
                  />
                </td>
                <td className="col-actions">
                  {entries.length > 1 && (
                    <button
                      className="btn-remove"
                      onClick={() => removeRow(entry.id)}
                      title="Remove"
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button className="btn btn-add" onClick={addRow}>
          + Add Row
        </button>
        <button className="btn btn-add" onClick={pasteFromClipboard}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:"middle",marginRight:4}}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Paste from Sheet
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading
            ? `Fetching... (${progress.current}/${progress.total})`
            : "Search & Fetch"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="results-section">
        {groupedResults.length > 0 && <h2>Results</h2>}

        {groupedResults.map((group) => (
          <div key={group.entry.id} className="sound-group">
            <div className="sound-group-header">
              {group.entry.name}
              {group.variants && group.variants.length > 0 && (
                <span
                  style={{
                    color: "#555",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  searched: {group.variants.slice(0, 5).join(", ")}
                </span>
              )}
              {group.error && (
                <span style={{ color: "#ff6666", fontWeight: 400 }}>
                  {" "}
                  &mdash; {group.error}
                </span>
              )}
              {!group.error &&
                group.results.length === 0 &&
                group.ogaResults.length === 0 &&
                group.soundBibleResults.length === 0 &&
                group.sonnissResults.length === 0 && (
                  <span style={{ color: "#666", fontWeight: 400 }}>
                    {" "}
                    &mdash; no results
                  </span>
                )}
            </div>

            {group.results.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#555",
                    marginBottom: "0.5rem",
                  }}
                >
                  FreeSound ({group.results.length})
                </div>
                <div className="sound-cards">
                  {group.results.map((sound) => {
                    const previewUrl = getPreviewUrl(sound.previews);
                    const uid = `fs-${sound.id}`;
                    const inPack = isInPack(uid);
                    return (
                      <div key={sound.id} className="sound-card">
                        <div
                          className="sound-card-name"
                          title={sound.name}
                        >
                          {sound.name}
                        </div>
                        <div className="sound-card-meta">
                          <span>{formatDuration(sound.duration)}</span>
                          <span>{abbreviateLicense(sound.license)}</span>
                        </div>
                        {previewUrl && (
                          <div className="mini-player">
                            <audio
                              ref={(el) => {
                                if (el) el.volume = 0.8;
                              }}
                              controls
                              preload="none"
                              src={previewUrl}
                              className="mini-audio"
                            />
                          </div>
                        )}
                        {previewUrl && showAllWaveforms && (
                          <MiniWaveform url={previewUrl} />
                        )}
                        <div className="sound-card-actions">
                          {previewUrl && (
                            <button
                              className="btn-card btn-card-primary"
                              onClick={() =>
                                handleDownload(
                                  previewUrl,
                                  `${sound.name}.mp3`
                                )
                              }
                            >
                              Download
                            </button>
                          )}
                          <a
                            className="btn-card"
                            href={`https://freesound.org/s/${sound.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </a>
                          {previewUrl && (
                            <button
                              className={`btn-card btn-pack-add ${inPack ? "pack-added" : ""}`}
                              onClick={() =>
                                togglePack({
                                  uid,
                                  name: sound.name,
                                  url: previewUrl,
                                  filename: `${sound.name}.mp3`,
                                  source: "FreeSound",
                                })
                              }
                              title={inPack ? "Remove from pack" : "Add to pack"}
                            >
                              +
                            </button>
                          )}
                            {previewUrl && (
                              <button
                                className={`btn-card btn-card-crop`}
                                onClick={() => openCrop(previewUrl, sound.name)}
                                title="Crop sound"
                              >
                                ✂
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {group.ogaResults.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6c5ce7",
                    marginBottom: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  OpenGameArt ({group.ogaResults.length})
                  {group.ogaError && (
                    <span style={{ color: "#ff6666" }}>
                      {" "}
                      &mdash; {group.ogaError}
                    </span>
                  )}
                </div>
                <div className="sound-cards">
                  {group.ogaResults.map((item, oi) => {
                    const audioFile = item.files.find(
                      (f) =>
                        f.name.endsWith(".mp3") ||
                        f.name.endsWith(".ogg") ||
                        f.name.endsWith(".wav") ||
                        f.name.endsWith(".flac") ||
                        f.name.endsWith(".m4a")
                    );
                    const uid = `oga-${item.id}-${oi}`;
                    const inPack = isInPack(uid);
                    return (
                      <div key={oi} className="sound-card">
                        <div
                          className="sound-card-name"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        <div className="sound-card-meta">
                          <span>{item.duration > 0 ? formatDuration(item.duration) : "—"}</span>
                          <span>{abbreviateLicense(item.license)}</span>
                        </div>
                        {audioFile && (
                          <div className="mini-player">
                            <audio
                              ref={(el) => {
                                if (el) el.volume = 0.8;
                              }}
                              controls
                              preload="none"
                              src={audioFile.url}
                              className="mini-audio"
                            />
                          </div>
                        )}
                        {audioFile && showAllWaveforms && (
                          <MiniWaveform url={audioFile.url} />
                        )}
                        <div className="sound-card-actions">
                          {audioFile && (
                            <button
                              className="btn-card btn-card-primary"
                              onClick={() =>
                                handleDownload(
                                  audioFile.url,
                                  audioFile.name
                                )
                              }
                            >
                              Download
                            </button>
                          )}
                          <a
                            className="btn-card"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </a>
                          {audioFile && (
                            <button
                              className={`btn-card btn-pack-add ${inPack ? "pack-added" : ""}`}
                              onClick={() =>
                                togglePack({
                                  uid,
                                  name: item.title,
                                  url: audioFile.url,
                                  filename: audioFile.name,
                                  source: "OpenGameArt",
                                })
                              }
                              title={inPack ? "Remove from pack" : "Add to pack"}
                            >
                              +
                            </button>
                          )}
                            {audioFile && (
                              <button
                                className={`btn-card btn-card-crop`}
                                onClick={() => openCrop(audioFile.url, item.title)}
                                title="Crop sound"
                              >
                                ✂
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {group.soundBibleResults.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#00b894",
                    marginBottom: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  SoundBible ({group.soundBibleResults.length})
                  {group.soundBibleError && (
                    <span style={{ color: "#ff6666" }}>
                      {" "}
                      &mdash; {group.soundBibleError}
                    </span>
                  )}
                </div>
                <div className="sound-cards">
                  {group.soundBibleResults.map((item, si) => {
                    const uid = `sb-${item.id}-${si}`;
                    const inPack = isInPack(uid);
                    return (
                      <div key={uid} className="sound-card">
                        <div
                          className="sound-card-name"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        <div className="sound-card-meta">
                          <span>{item.duration > 0 ? formatDuration(item.duration) : "—"}</span>
                          <span>{abbreviateLicense(item.license)}</span>
                        </div>
                        {item.audioUrl && (
                          <div className="mini-player">
                            <audio
                              ref={(el) => {
                                if (el) el.volume = 0.8;
                              }}
                              controls
                              preload="none"
                              src={item.audioUrl}
                              className="mini-audio"
                            />
                          </div>
                        )}
                        {item.audioUrl && showAllWaveforms && (
                          <MiniWaveform url={item.audioUrl} />
                        )}
                        <div className="sound-card-actions">
                          <button
                            className="btn-card btn-card-primary"
                            onClick={() =>
                              handleDownload(
                                item.audioUrl,
                                item.filename
                              )
                            }
                          >
                            Download
                          </button>
                          <a
                            className="btn-card"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </a>
                          <button
                            className={`btn-card btn-pack-add ${inPack ? "pack-added" : ""}`}
                            onClick={() =>
                              togglePack({
                                uid,
                                name: item.title,
                                url: item.audioUrl,
                                filename: item.filename,
                                source: "SoundBible",
                              })
                            }
                            title={inPack ? "Remove from pack" : "Add to pack"}
                          >
                            +
                          </button>
                          <button
                            className="btn-card btn-card-crop"
                            onClick={() => openCrop(item.audioUrl, item.title)}
                            title="Crop sound"
                          >
                            ✂
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {group.sonnissResults.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#fdcb6e",
                    marginBottom: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  Sonniss ({group.sonnissResults.length})
                  {group.sonnissError && (
                    <span style={{ color: "#ff6666" }}>
                      {" "}
                      &mdash; {group.sonnissError}
                    </span>
                  )}
                </div>
                <div className="sound-cards">
                  {group.sonnissResults.map((item, si) => {
                    const uid = `sonniss-${item.id}-${si}`;
                    const inPack = isInPack(uid);
                    return (
                      <div key={uid} className="sound-card">
                        <div className="sound-card-name" title={item.title}>
                          {item.title}
                        </div>
                        <div className="sound-card-meta">
                          <span>{item.duration > 0 ? formatDuration(item.duration) : "—"}</span>
                          <span>{abbreviateLicense(item.license)}</span>
                        </div>
                        {item.audioUrl && (
                          <div className="mini-player">
                            <audio
                              ref={(el) => {
                                if (el) el.volume = 0.8;
                              }}
                              controls
                              preload="none"
                              src={item.audioUrl}
                              className="mini-audio"
                            />
                          </div>
                        )}
                        {item.audioUrl && showAllWaveforms && (
                          <MiniWaveform url={item.audioUrl} />
                        )}
                        <div className="sound-card-actions">
                          <button
                            className="btn-card btn-card-primary"
                            onClick={() => handleDownload(item.audioUrl, item.filename)}
                          >
                            Download
                          </button>
                          <a
                            className="btn-card"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </a>
                          <button
                            className={`btn-card btn-pack-add ${inPack ? "pack-added" : ""}`}
                            onClick={() =>
                              togglePack({
                                uid,
                                name: item.title,
                                url: item.audioUrl,
                                filename: item.filename,
                                source: "Sonniss",
                              })
                            }
                            title={inPack ? "Remove from pack" : "Add to pack"}
                          >
                            +
                          </button>
                          <button
                            className="btn-card btn-card-crop"
                            onClick={() => openCrop(item.audioUrl, item.title)}
                            title="Crop sound"
                          >
                            ✂
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {group.ogaError &&
              group.ogaResults.length === 0 &&
              group.results.length === 0 &&
              group.soundBibleResults.length === 0 &&
              group.sonnissResults.length === 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#ff6666",
                    marginBottom: "0.5rem",
                  }}
                >
                  OGA: {group.ogaError}
                </div>
              )}
            {group.soundBibleError &&
              group.soundBibleResults.length === 0 &&
              group.ogaResults.length === 0 &&
              group.results.length === 0 &&
              group.sonnissResults.length === 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#ff6666",
                    marginBottom: "0.5rem",
                  }}
                >
                  SoundBible: {group.soundBibleError}
                </div>
              )}
            {group.sonnissError &&
              group.sonnissResults.length === 0 &&
              group.soundBibleResults.length === 0 &&
              group.ogaResults.length === 0 &&
              group.results.length === 0 && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#ff6666",
                    marginBottom: "0.5rem",
                  }}
                >
                  Sonniss: {group.sonnissError}
                </div>
              )}
          </div>
        ))}

        {loading && groupedResults.length === 0 && (
          <div className="loading">
            <div className="spinner" />
            <div>Searching {progress.total} sounds...</div>
          </div>
        )}

        {!loading &&
          groupedResults.length === 0 &&
          !error && (
            <div className="empty-msg">
              Enter sound names and a style, then click Search &amp; Fetch.
            </div>
          )}
      </div>
    </div>
  );
}
