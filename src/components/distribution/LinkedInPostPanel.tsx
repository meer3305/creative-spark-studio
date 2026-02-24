import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Send, Clock, Sparkles, Trash2, Hash, Link2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import PublishStatusTracker from "./PublishStatusTracker";

const TONES = ["Professional", "Casual", "Technical", "Sales"];
const MAX_CHARS = 3000;

interface LinkedInPostPanelProps {
  imageUrl?: string;
}

const LinkedInPostPanel = ({ imageUrl }: LinkedInPostPanelProps) => {
  const [content, setContent] = useState("");
  const [includeModelLink, setIncludeModelLink] = useState(false);
  const [useImage, setUseImage] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishJobId, setPublishJobId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const validate = () => {
    if (!content.trim()) { toast.error("Post content is required"); return false; }
    if (content.length > MAX_CHARS) { toast.error(`Content exceeds ${MAX_CHARS} characters`); return false; }
    return true;
  };

  const handlePost = async (schedule = false) => {
    if (!validate()) return;
    if (schedule && !scheduledTime) { toast.error("Select a schedule time"); return; }

    setPublishing(true);
    try {
      const res = await api.publishLinkedIn({
        content: content.trim(),
        image_url: useImage && imageUrl ? imageUrl : undefined,
        include_model_link: includeModelLink,
        scheduled_time: schedule ? scheduledTime : undefined,
      });
      setPublishJobId(res.publish_job_id);
      toast.success(schedule ? "Post scheduled" : "Post publishing");
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setPublishing(false);
    }
  };

  const handleOptimize = async () => {
    if (!content.trim()) { toast.error("Enter post content first"); return; }
    setOptimizing(true);
    try {
      const res = await api.optimize({ content, tone, channel: "linkedin" });
      setContent(res.content);
      if (res.hashtags) setHashtags(res.hashtags);
      toast.success("Post optimized for engagement");
    } catch {
      toast.error("Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const handleClear = () => {
    setContent(""); setIncludeModelLink(false); setUseImage(false);
    setScheduleEnabled(false); setScheduledTime("");
    setHashtags([]); setPublishJobId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Post Editor</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Post Content</label>
                <span className={`text-xs ${content.length > MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                  {content.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your latest 3D creation..."
                rows={10}
                className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {hashtags.map((tag) => (
                  <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary">{tag}</span>
                ))}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              {imageUrl && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={useImage} onChange={(e) => setUseImage(e.target.checked)} className="rounded border-border accent-primary" />
                  Include asset image
                </label>
              )}
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={includeModelLink} onChange={(e) => setIncludeModelLink(e.target.checked)} className="rounded border-border accent-primary" />
                <Link2 className="h-3.5 w-3.5" /> 3D preview link
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="rounded border-border accent-primary" />
                <Clock className="h-3.5 w-3.5" /> Schedule
              </label>
            </div>

            {scheduleEnabled && (
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => handlePost(false)}
              disabled={publishing}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
            >
              <Send className="h-4 w-4" /> {publishing ? "Posting..." : "Post Now"}
            </button>
            {scheduleEnabled && (
              <button
                onClick={() => handlePost(true)}
                disabled={publishing}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-50"
              >
                <Clock className="h-4 w-4" /> Schedule
              </button>
            )}
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-secondary disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-secondary" /> {optimizing ? "Optimizing..." : "Optimize"}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>

          <PublishStatusTracker publishJobId={publishJobId} />
        </motion.div>

        {/* LinkedIn Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">LinkedIn Preview</h3>
          <div className="rounded-lg border border-border bg-background p-5">
            {/* Mock LinkedIn header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50" />
              <div>
                <p className="text-sm font-semibold text-foreground">Your Name</p>
                <p className="text-xs text-muted-foreground">Creative Director • Just now</p>
              </div>
            </div>
            <div className="mb-3 min-h-[120px] whitespace-pre-wrap text-sm text-foreground/80">
              {content || <span className="italic text-muted-foreground">Your post will appear here...</span>}
            </div>
            {hashtags.length > 0 && (
              <p className="mb-3 text-sm text-primary">{hashtags.map((t) => `#${t}`).join(" ")}</p>
            )}
            {useImage && imageUrl && (
              <div className="mb-3 h-48 rounded-lg bg-muted/30 border border-border flex items-center justify-center text-xs text-muted-foreground">
                Asset image preview
              </div>
            )}
            {includeModelLink && (
              <div className="rounded-lg border border-border bg-muted/10 p-3 text-xs text-primary flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" /> 3D Interactive Preview Link
              </div>
            )}
            {/* Mock engagement bar */}
            <div className="mt-4 flex items-center gap-6 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>🔄 Repost</span>
              <span>📤 Send</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LinkedInPostPanel;
