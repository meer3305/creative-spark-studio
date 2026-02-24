import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Linkedin, Rocket, BarChart3 } from "lucide-react";
import type { ProjectData } from "@/lib/api";
import EmailCampaignPanel from "./EmailCampaignPanel";
import LinkedInPostPanel from "./LinkedInPostPanel";
import LaunchCampaignPanel from "./LaunchCampaignPanel";
import DistributionAnalytics from "./DistributionAnalytics";

type DistTab = "email" | "linkedin" | "campaign" | "analytics";

interface DistributionStudioProps {
  project: ProjectData | null;
}

const tabs: { id: DistTab; label: string; icon: React.ReactNode }[] = [
  { id: "email", label: "Email Campaign", icon: <Mail className="h-4 w-4" /> },
  { id: "linkedin", label: "LinkedIn Post", icon: <Linkedin className="h-4 w-4" /> },
  { id: "campaign", label: "Launch Campaign", icon: <Rocket className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const DistributionStudio = ({ project }: DistributionStudioProps) => {
  const [activeTab, setActiveTab] = useState<DistTab>("email");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Sub-tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
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
        {activeTab === "email" && (
          <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmailCampaignPanel attachmentUrl={project?.renders_url} />
          </motion.div>
        )}
        {activeTab === "linkedin" && (
          <motion.div key="linkedin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LinkedInPostPanel imageUrl={project?.renders_url} />
          </motion.div>
        )}
        {activeTab === "campaign" && (
          <motion.div key="campaign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LaunchCampaignPanel attachmentUrl={project?.renders_url} imageUrl={project?.renders_url} />
          </motion.div>
        )}
        {activeTab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {project ? (
              <DistributionAnalytics campaignId={project.id} />
            ) : (
              <div className="glass-panel flex h-64 items-center justify-center rounded-xl">
                <p className="text-sm text-muted-foreground">Generate a project first to view campaign analytics.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DistributionStudio;
