import { motion } from "framer-motion";
import { Download, FileBox, Image, Film } from "lucide-react";
import type { ProjectData } from "@/lib/api";

interface AssetDownloadPanelProps {
  project: ProjectData;
}

const items = (p: ProjectData) => [
  { label: "Blender File", icon: FileBox, url: p.blend_url, ext: ".blend" },
  { label: "GLB Model", icon: FileBox, url: p.glb_url, ext: ".glb" },
  { label: "Renders", icon: Image, url: p.renders_url, ext: ".zip" },
  ...(p.animation_url ? [{ label: "Animation", icon: Film, url: p.animation_url, ext: ".mp4" }] : []),
];

const AssetDownloadPanel = ({ project }: AssetDownloadPanelProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Downloads</h2>
      <div className="grid grid-cols-2 gap-3">
        {items(project).map((item) => (
          <a
            key={item.label}
            href={item.url}
            download
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.ext}</div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default AssetDownloadPanel;
