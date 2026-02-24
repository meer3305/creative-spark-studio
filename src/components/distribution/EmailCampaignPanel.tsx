import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Clock, Sparkles, Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import PublishStatusTracker from "./PublishStatusTracker";

const TONES = ["Professional", "Casual", "Technical", "Sales"];

interface EmailCampaignPanelProps {
  attachmentUrl?: string;
}

const EmailCampaignPanel = ({ attachmentUrl }: EmailCampaignPanelProps) => {
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState("");
  const [body, setBody] = useState("");
  const [attachRender, setAttachRender] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [publishing, setPublishing] = useState(false);
  const [publishJobId, setPublishJobId] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const validate = () => {
    if (!subject.trim()) { toast.error("Subject is required"); return false; }
    if (!recipients.trim()) { toast.error("At least one recipient is required"); return false; }
    if (!body.trim()) { toast.error("Email body is required"); return false; }
    const emails = recipients.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) { toast.error("Invalid recipients"); return false; }
    return true;
  };

  const handleSend = async (schedule = false) => {
    if (!validate()) return;
    if (schedule && !scheduledTime) { toast.error("Select a schedule time"); return; }

    setPublishing(true);
    try {
      const res = await api.publishEmail({
        subject: subject.trim(),
        body,
        recipients: recipients.split(",").map((e) => e.trim()).filter(Boolean),
        attachment_url: attachRender && attachmentUrl ? attachmentUrl : undefined,
        scheduled_time: schedule ? scheduledTime : undefined,
      });
      setPublishJobId(res.publish_job_id);
      toast.success(schedule ? "Email scheduled" : "Email sending");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setPublishing(false);
    }
  };

  const handleOptimize = async () => {
    if (!body.trim()) { toast.error("Enter email body first"); return; }
    setOptimizing(true);
    try {
      const res = await api.optimize({ content: body, tone, channel: "email" });
      setBody(res.content);
      toast.success("Email optimized with AI");
    } catch {
      toast.error("Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const handleClear = () => {
    setSubject(""); setRecipients(""); setBody("");
    setAttachRender(false); setScheduleEnabled(false);
    setScheduledTime(""); setPublishJobId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Email Editor</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Recipients (comma-separated)</label>
              <input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Email Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email content..."
                rows={10}
                className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

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

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              {attachmentUrl && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={attachRender} onChange={(e) => setAttachRender(e.target.checked)} className="rounded border-border accent-primary" />
                  <Paperclip className="h-3.5 w-3.5" /> Attach Render
                </label>
              )}
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
              onClick={() => handleSend(false)}
              disabled={publishing}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
            >
              <Send className="h-4 w-4" /> {publishing ? "Sending..." : "Send Now"}
            </button>
            {scheduleEnabled && (
              <button
                onClick={() => handleSend(true)}
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
              <Sparkles className="h-4 w-4 text-secondary" /> {optimizing ? "Optimizing..." : "AI Optimize"}
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

        {/* Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Email Preview</h3>
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="mb-4 border-b border-border pb-4">
              <p className="text-xs text-muted-foreground">Subject</p>
              <p className="text-sm font-medium text-foreground">{subject || "No subject"}</p>
              <p className="mt-1 text-xs text-muted-foreground">To: {recipients || "No recipients"}</p>
            </div>
            <div className="min-h-[200px] whitespace-pre-wrap text-sm text-foreground/80">
              {body || <span className="italic text-muted-foreground">Email body will appear here...</span>}
            </div>
            {attachRender && attachmentUrl && (
              <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" /> Render attached
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailCampaignPanel;
