import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Mail, Linkedin, Eye, MousePointerClick, ThumbsUp, MessageCircle } from "lucide-react";
import { api, type CampaignAnalytics } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DistributionAnalyticsProps {
  campaignId: string;
}

const CHART_COLORS = [
  "hsl(175, 80%, 50%)",
  "hsl(260, 60%, 58%)",
  "hsl(145, 65%, 45%)",
  "hsl(38, 92%, 55%)",
];

const DistributionAnalytics = ({ campaignId }: DistributionAnalyticsProps) => {
  const [data, setData] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCampaignAnalytics(campaignId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />)}
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const emailStats = data.email ? [
    { label: "Open Rate", value: `${data.email.open_rate}%`, icon: Eye },
    { label: "Click Rate", value: `${data.email.click_rate}%`, icon: MousePointerClick },
    { label: "Delivery Rate", value: `${data.email.delivery_rate}%`, icon: Mail },
  ] : [];

  const linkedInStats = data.linkedin ? [
    { label: "Impressions", value: data.linkedin.impressions.toLocaleString(), icon: Eye },
    { label: "Likes", value: data.linkedin.likes.toLocaleString(), icon: ThumbsUp },
    { label: "Comments", value: data.linkedin.comments.toLocaleString(), icon: MessageCircle },
    { label: "Engagement", value: `${data.linkedin.engagement_score}%`, icon: BarChart3 },
  ] : [];

  const emailChartData = data.email ? [
    { name: "Open", value: data.email.open_rate },
    { name: "Click", value: data.email.click_rate },
    { name: "Delivery", value: data.email.delivery_rate },
  ] : [];

  const linkedInChartData = data.linkedin ? [
    { name: "Impressions", value: data.linkedin.impressions },
    { name: "Likes", value: data.linkedin.likes },
    { name: "Comments", value: data.linkedin.comments },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Campaign Analytics</h3>
      </div>

      <div className="space-y-6">
        {/* Email analytics */}
        {data.email && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"><Mail className="h-4 w-4 text-primary" /> Email Metrics</h4>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {emailStats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(230, 25%, 12%)", border: "1px solid hsl(230, 20%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 96%)" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {emailChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LinkedIn analytics */}
        {data.linkedin && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"><Linkedin className="h-4 w-4 text-primary" /> LinkedIn Metrics</h4>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {linkedInStats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-secondary" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={linkedInChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(230, 25%, 12%)", border: "1px solid hsl(230, 20%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 96%)" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {linkedInChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 1) % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DistributionAnalytics;
