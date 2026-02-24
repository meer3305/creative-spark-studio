import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { api, type ProjectData } from "@/lib/api";

interface MarketingPanelProps {
  project: ProjectData;
}

const MarketingPanel = ({ project }: MarketingPanelProps) => {
  const m = project.marketing;
  const [fields, setFields] = useState({
    product_description: m.product_description,
    instagram_caption: m.instagram_caption,
    twitter_thread: m.twitter_thread,
    email_draft: m.email_draft,
  });
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const sections = [
    { key: "product_description", label: "Product Description", rows: 3 },
    { key: "instagram_caption", label: "Instagram Caption", rows: 3 },
    { key: "twitter_thread", label: "Twitter/X Thread", rows: 4 },
    { key: "email_draft", label: "Email Draft", rows: 5 },
  ] as const;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.publish(project.id);
      toast.success("Published successfully!");
    } catch {
      toast.error("Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Marketing Content</h2>

      <div className="space-y-4">
        {sections.map(({ key, label, rows }) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <button onClick={() => handleCopy(key, fields[key])} className="text-muted-foreground transition hover:text-foreground">
                {copied === key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <textarea
              value={fields[key]}
              onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
              rows={rows}
              className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePublish}
        disabled={publishing}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
      >
        <Send className="h-4 w-4" />
        {publishing ? "Publishing..." : "Publish All"}
      </button>
    </motion.div>
  );
};

export default MarketingPanel;
