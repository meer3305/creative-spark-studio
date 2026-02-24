import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Clock, Send, Radio } from "lucide-react";
import { api, type PublishJobStatus } from "@/lib/api";

const STATUS_STEPS = ["queued", "sending", "posted", "completed"] as const;
const STATUS_ICONS: Record<string, React.ReactNode> = {
  queued: <Clock className="h-4 w-4" />,
  sending: <Send className="h-4 w-4" />,
  posted: <Radio className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  failed: <AlertCircle className="h-4 w-4" />,
};

interface PublishStatusTrackerProps {
  publishJobId: string | null;
  onComplete?: () => void;
}

const PublishStatusTracker = ({ publishJobId, onComplete }: PublishStatusTrackerProps) => {
  const [status, setStatus] = useState<PublishJobStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!publishJobId) { setStatus(null); return; }

    setPolling(true);
    const poll = async () => {
      try {
        const s = await api.getPublishStatus(publishJobId);
        setStatus(s);
        if (s.status === "completed" || s.status === "failed") {
          clearInterval(intervalRef.current);
          setPolling(false);
          if (s.status === "completed") onComplete?.();
        }
      } catch { /* silent retry */ }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [publishJobId]);

  if (!publishJobId || !status) return null;

  const stepIndex = STATUS_STEPS.indexOf(status.status as any);
  const isFailed = status.status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 rounded-lg border border-border bg-muted/20 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Publish Status</span>
        <span className="font-mono text-xs text-muted-foreground">{publishJobId}</span>
      </div>

      {/* Step indicators */}
      <div className="mb-3 flex items-center gap-1">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-all ${
                isFailed
                  ? "bg-destructive/30"
                  : i < stepIndex
                  ? "bg-primary"
                  : i === stepIndex
                  ? "bg-primary/50 animate-pulse"
                  : "bg-muted"
              }`}
            />
            <span className="text-[10px] capitalize text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isFailed
              ? "hsl(var(--destructive))"
              : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${status.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {isFailed ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{status.error || "Publishing failed"}</span>
          </>
        ) : status.status === "completed" ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-success">Published successfully</span>
          </>
        ) : (
          <>
            {polling && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <span className="capitalize text-muted-foreground">{status.status}</span>
            <span className="text-muted-foreground">— {status.progress}%</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PublishStatusTracker;
