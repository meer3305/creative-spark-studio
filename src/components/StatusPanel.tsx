import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { api, type JobStatus } from "@/lib/api";
import { toast } from "sonner";

const STAGES = ["parsing", "generating", "rendering", "packaging", "complete"] as const;

interface StatusPanelProps {
  jobId: string | null;
  onComplete: (projectId: string) => void;
  onClear: () => void;
}

const StatusPanel = ({ jobId, onComplete, onClear }: StatusPanelProps) => {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!jobId) { setStatus(null); return; }

    setPolling(true);
    const poll = async () => {
      try {
        const s = await api.getStatus(jobId);
        setStatus(s);
        if (s.stage === "complete" && s.project_id) {
          clearInterval(intervalRef.current);
          setPolling(false);
          onComplete(s.project_id);
          toast.success("Generation complete!");
        }
        if (s.stage === "error") {
          clearInterval(intervalRef.current);
          setPolling(false);
          toast.error(s.error || "Generation failed");
        }
      } catch {
        // silent retry
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      await api.cancelJob(jobId);
      clearInterval(intervalRef.current);
      setPolling(false);
      setStatus(null);
      onClear();
      toast.info("Job cancelled");
    } catch {
      toast.error("Could not cancel job");
    }
  };

  const handleRetry = () => {
    if (!jobId) return;
    setStatus(null);
    setPolling(true);
    const poll = async () => {
      try {
        const s = await api.getStatus(jobId);
        setStatus(s);
        if (s.stage === "complete" || s.stage === "error") {
          clearInterval(intervalRef.current);
          setPolling(false);
          if (s.stage === "complete" && s.project_id) onComplete(s.project_id);
        }
      } catch { /* retry */ }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
  };

  if (!jobId) return null;

  const stageIndex = status ? STAGES.indexOf(status.stage as any) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Progress</h2>
        <span className="font-mono text-xs text-muted-foreground">{jobId}</span>
      </div>

      {/* Stage indicators */}
      <div className="mb-4 flex items-center gap-1">
        {STAGES.slice(0, -1).map((stage, i) => (
          <div key={stage} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-all ${
                i < stageIndex
                  ? "bg-primary"
                  : i === stageIndex && status?.stage !== "error"
                  ? "bg-primary/50 animate-pulse"
                  : "bg-muted"
              }`}
            />
            <span className="text-[10px] capitalize text-muted-foreground">{stage}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
          initial={{ width: 0 }}
          animate={{ width: `${status?.progress ?? 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {status?.stage === "error" ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">{status.error || "Error occurred"}</span>
            </>
          ) : (
            <>
              {polling && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <span className="capitalize text-muted-foreground">{status?.stage || "Starting..."}</span>
              <span className="text-muted-foreground">— {status?.progress ?? 0}%</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {status?.stage === "error" && (
            <button onClick={handleRetry} className="flex items-center gap-1 rounded-md bg-muted px-3 py-1 text-xs text-foreground hover:bg-muted/80">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
          {polling && (
            <button onClick={handleCancel} className="flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1 text-xs text-destructive hover:bg-destructive/20">
              <XCircle className="h-3 w-3" /> Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusPanel;
