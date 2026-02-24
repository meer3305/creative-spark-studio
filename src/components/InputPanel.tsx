import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, ImageIcon, Mic, Upload, X, Play, Square, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { api, type GenerationMode } from "@/lib/api";

const STYLES = ["Cyberpunk", "Minimalist", "Luxury", "Industrial", "Organic", "Retro"];
const PRESETS = ["Standard", "High Detail", "Animated", "Stylized", "Photorealistic"];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/tiff"];

interface InputPanelProps {
  onGenerate: (jobId: string) => void;
  isGenerating: boolean;
}

const InputPanel = ({ onGenerate, isGenerating }: InputPanelProps) => {
  const [mode, setMode] = useState<GenerationMode>("text");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { mode: GenerationMode; icon: React.ReactNode; label: string }[] = [
    { mode: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
    { mode: "image", icon: <ImageIcon className="h-4 w-4" />, label: "Image" },
    { mode: "voice", icon: <Mic className="h-4 w-4" />, label: "Voice" },
  ];

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  }, []);

  const validateAndSetFile = (f: File) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Invalid file type. Use PNG, JPEG, WebP, or TIFF.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum 50MB.");
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    try {
      const res = await api.transcribe(audioBlob);
      setTranscript(res.transcript);
      toast.success("Transcription complete");
    } catch {
      toast.error("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = mode === "voice" ? transcript : prompt;
    if (!finalPrompt && mode !== "image") {
      toast.error("Please enter a prompt.");
      return;
    }
    if (mode === "image" && !file) {
      toast.error("Please upload an image.");
      return;
    }

    try {
      let fileUrl: string | undefined;
      if (file) {
        const upload = await api.uploadFile(file);
        fileUrl = upload.file_url;
      }

      const res = await api.generate({
        mode,
        prompt: finalPrompt,
        style,
        render_preset: preset,
        file_url: fileUrl,
      });
      onGenerate(res.job_id);
      toast.success(`Job started: ${res.job_id}`);
    } catch (err: any) {
      toast.error(err.message || "Generation failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6"
    >
      <h2 className="mb-4 text-xl font-semibold text-foreground">Create</h2>

      {/* Mode tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setMode(tab.mode)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              mode === tab.mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "text" && (
          <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              className="mb-4 h-32 w-full resize-none rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </motion.div>
        )}

        {mode === "image" && (
          <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary"
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop image here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WebP, TIFF — max 50MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img src={filePreview!} alt="Preview" className="h-40 w-full object-cover" />
                <button
                  onClick={() => { setFile(null); setFilePreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur-sm"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>
            )}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Optional: describe modifications..."
              className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </motion.div>
        )}

        {mode === "voice" && (
          <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex items-center gap-3">
              {!isRecording ? (
                <button onClick={startRecording} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                  <Mic className="h-4 w-4" /> Record
                </button>
              ) : (
                <button onClick={stopRecording} className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90">
                  <Square className="h-4 w-4" /> Stop
                </button>
              )}
              {audioBlob && !isRecording && (
                <>
                  <audio src={URL.createObjectURL(audioBlob)} controls className="h-8 flex-1" />
                  <button onClick={transcribeAudio} disabled={isTranscribing} className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:opacity-90 disabled:opacity-50">
                    {isTranscribing ? "..." : <><Play className="h-4 w-4" /> Transcribe</>}
                  </button>
                </>
              )}
            </div>
            {(transcript || isTranscribing) && (
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Edit3 className="h-3 w-3" /> Edit transcript
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="h-24 w-full resize-none rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style & Preset */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Render Preset</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full rounded-lg py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
        style={{
          background: isGenerating
            ? "hsl(var(--muted))"
            : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
        }}
      >
        {isGenerating ? "Generating..." : "Generate 3D Asset"}
      </button>
    </motion.div>
  );
};

export default InputPanel;
