import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Download, Globe } from "lucide-react";
import { api, type AnalyticsData } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsPanelProps {
  projectId: string;
}

const AnalyticsPanel = ({ projectId }: AnalyticsPanelProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics(projectId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Engagement", value: `${data.engagement}%`, icon: TrendingUp, color: "text-primary" },
    { label: "Performance", value: `${data.performance_score}/100`, icon: BarChart3, color: "text-secondary" },
    { label: "Downloads", value: data.download_count.toLocaleString(), icon: Download, color: "text-primary" },
    { label: "Status", value: data.publish_status, icon: Globe, color: "text-success" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics</h2>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="mb-1 flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className="text-lg font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {data.timeline.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(230, 25%, 12%)",
                  border: "1px solid hsl(230, 20%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
              <Area type="monotone" dataKey="views" stroke="hsl(175, 80%, 50%)" fill="url(#viewsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="downloads" stroke="hsl(260, 60%, 58%)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsPanel;
