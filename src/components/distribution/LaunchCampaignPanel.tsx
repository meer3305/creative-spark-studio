import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Clock, Trash2, Mail, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import PublishStatusTracker from "./PublishStatusTracker";

interface LaunchCampaignPanelProps {
  attachmentUrl?: string;
  imageUrl?: string;
}

const LaunchCampaignPanel = ({ attachmentUrl, imageUrl }: LaunchCampaignPanelProps) => {
  const [campaignName, setCampaignName] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  // Email fields
  const [emailSubject, setEmailSubject] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // LinkedIn fields
  const [linkedInContent, setLinkedInContent] = useState("");
  const [includeModelLink, setIncludeModelLink] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishJobId, setPublishJobId] = useState<string | null>(null);

  const toggleChannel = (ch: string) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const validate = () => {
    if (!campaignName.trim()) { toast.error("Campaign name is required"); return false; }
    if (channels.length === 0) { toast.error("Select at least one channel"); return false; }
    if (channels.includes("email")) {
      if (!emailSubject.trim() || !emailRecipients.trim() || !emailBody.trim()) {
        toast.error("Fill in all email fields"); return false;
      }
    }
    if (channels.includes("linkedin")) {
      if (!linkedInContent.trim()) { toast.error("LinkedIn content is required"); return false; }
    }
    return true;
  };

  const handleLaunch = async () => {
    if (!validate()) return;

    setPublishing(true);
    try {
      const res = await api.publishBulk({
        campaign_name: campaignName.trim(),
        channels,
        content: {
          email: channels.includes("email") ? {
            subject: emailSubject.trim(),
            body: emailBody,
            recipients: emailRecipients.split(",").map((e) => e.trim()).filter(Boolean),
            attachment_url: attachmentUrl,
          } : undefined,
          linkedin: channels.includes("linkedin") ? {
            content: linkedInContent.trim(),
            image_url: imageUrl,
            include_model_link: includeModelLink,
          } : undefined,
        },
        scheduled_time: scheduleEnabled && scheduledTime ? scheduledTime : undefined,
      });
      setPublishJobId(res.publish_job_id);
      toast.success("Campaign launched!");
    } catch (err: any) {
      toast.error(err.message || "Campaign launch failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleClear = () => {
    setCampaignName(""); setChannels([]);
    setEmailSubject(""); setEmailRecipients(""); setEmailBody("");
    setLinkedInContent(""); setIncludeModelLink(false);
    setScheduleEnabled(false); setScheduledTime(""); setPublishJobId(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Launch Campaign</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Campaign Name</label>
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Product Launch"
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Channel selection */}
        <div>
          <label className="mb-2 block text-xs font-medium text-muted-foreground">Channels</label>
          <div className="flex gap-3">
            {[
              { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
              { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  channels.includes(ch.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {ch.icon} {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Email fields */}
        {channels.includes("email") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-lg border border-border bg-muted/10 p-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Mail className="h-4 w-4 text-primary" /> Email Content</h4>
            <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject"
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input value={emailRecipients} onChange={(e) => setEmailRecipients(e.target.value)} placeholder="Recipients (comma-separated)"
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Email body..." rows={5}
              className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </motion.div>
        )}

        {/* LinkedIn fields */}
        {channels.includes("linkedin") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-lg border border-border bg-muted/10 p-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Linkedin className="h-4 w-4 text-primary" /> LinkedIn Content</h4>
            <textarea value={linkedInContent} onChange={(e) => setLinkedInContent(e.target.value)} placeholder="Post content..." rows={5}
              className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={includeModelLink} onChange={(e) => setIncludeModelLink(e.target.checked)} className="accent-primary" />
              Include 3D preview link
            </label>
          </motion.div>
        )}

        {/* Schedule */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="accent-primary" />
            <Clock className="h-3.5 w-3.5" /> Schedule
          </label>
          {scheduleEnabled && (
            <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleLaunch}
            disabled={publishing}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
          >
            <Rocket className="h-4 w-4" /> {publishing ? "Launching..." : "Launch Campaign"}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>

        <PublishStatusTracker publishJobId={publishJobId} />
      </div>
    </motion.div>
  );
};

export default LaunchCampaignPanel;
