import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Wand2, Share2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { api, type ProjectData } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import InputPanel from "@/components/InputPanel";
import StatusPanel from "@/components/StatusPanel";
import ModelViewer from "@/components/ModelViewer";
import AssetDownloadPanel from "@/components/AssetDownloadPanel";
import MarketingPanel from "@/components/MarketingPanel";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import DistributionStudio from "@/components/distribution/DistributionStudio";

type MainTab = "generate" | "distribution" | "analytics";

const MAIN_TABS: { id: MainTab; label: string; icon: React.ReactNode }[] = [
  { id: "generate", label: "Generate Studio", icon: <Wand2 className="h-4 w-4" /> },
  { id: "distribution", label: "Distribution Studio", icon: <Share2 className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

const Index = () => {
  const [started, setStarted] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("generate");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => studioRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleGenerate = (id: string) => {
    setJobId(id);
    setIsGenerating(true);
    setProject(null);
    setProjectId(null);
  };

  const handleComplete = useCallback(async (pid: string) => {
    setProjectId(pid);
    setIsGenerating(false);
    try {
      const data = await api.getProject(pid);
      setProject(data);
    } catch {
      toast.error("Failed to load project data");
    }
  }, []);

  const handleClearSession = () => {
    setJobId(null);
    setIsGenerating(false);
    setProjectId(null);
    setProject(null);
    toast.info("Session cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      {!started && <HeroSection onStart={handleStart} />}

      <AnimatePresence>
        {started && (
          <motion.div
            ref={studioRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-7xl px-4 py-8 md:px-6"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Studio</h1>
                <p className="text-sm text-muted-foreground">Create, distribute, and analyze 3D assets</p>
              </div>
              <div className="flex gap-2">
                {(jobId || project) && (
                  <button
                    onClick={handleClearSession}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Clear Session
                  </button>
                )}
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="mb-8 flex gap-1 rounded-xl bg-muted/30 p-1.5 border border-border">
              {MAIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMainTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    mainTab === tab.id
                      ? "text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    mainTab === tab.id
                      ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }
                      : undefined
                  }
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Generate Studio */}
              {mainTab === "generate" && (
                <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                    <div className="space-y-6">
                      <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
                      <StatusPanel jobId={jobId} onComplete={handleComplete} onClear={() => { setJobId(null); setIsGenerating(false); }} />
                    </div>
                    <div className="space-y-6">
                      {project ? (
                        <>
                          <ModelViewer modelUrl={project.glb_url} />
                          <AssetDownloadPanel project={project} />
                          <div className="grid gap-6 xl:grid-cols-2">
                            <MarketingPanel project={project} />
                            {projectId && <AnalyticsPanel projectId={projectId} />}
                          </div>
                        </>
                      ) : (
                        <div className="glass-panel flex h-[500px] flex-col items-center justify-center rounded-xl">
                          <div className="animate-float text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted/30">
                              <span className="text-3xl">🎨</span>
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-foreground">Ready to Create</h3>
                            <p className="max-w-xs text-sm text-muted-foreground">
                              Enter a prompt, upload an image, or record your voice to generate a 3D asset.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Distribution Studio */}
              {mainTab === "distribution" && (
                <motion.div key="distribution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DistributionStudio project={project} />
                </motion.div>
              )}

              {/* Analytics */}
              {mainTab === "analytics" && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {projectId ? (
                    <AnalyticsPanel projectId={projectId} />
                  ) : (
                    <div className="glass-panel flex h-64 items-center justify-center rounded-xl">
                      <p className="text-sm text-muted-foreground">Generate a project first to view analytics.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
