import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Center } from "@react-three/drei";
import { motion } from "framer-motion";
import { RotateCcw, Sun, Moon, Maximize2 } from "lucide-react";

interface ModelViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [envPreset, setEnvPreset] = useState<"studio" | "sunset" | "night">("studio");
  const [darkBg, setDarkBg] = useState(true);

  const envMap: Record<string, string> = {
    studio: "studio",
    sunset: "sunset",
    night: "night",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden rounded-xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold text-foreground">3D Preview</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`rounded-md p-1.5 text-xs transition ${autoRotate ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Auto-rotate"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEnvPreset(envPreset === "studio" ? "sunset" : envPreset === "sunset" ? "night" : "studio")}
            className="rounded-md p-1.5 text-muted-foreground transition hover:text-foreground"
            title="Lighting"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDarkBg(!darkBg)}
            className="rounded-md p-1.5 text-muted-foreground transition hover:text-foreground"
            title="Background"
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative h-[400px] md:h-[500px]" style={{ background: darkBg ? "hsl(var(--background))" : "hsl(var(--muted))" }}>
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Model url={modelUrl} />
            <Environment preset={envMap[envPreset] as any} />
            <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1} enablePan enableZoom />
          </Suspense>
        </Canvas>

        {/* Skeleton loading overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Maximize2 className="h-12 w-12 animate-pulse text-muted-foreground/20" />
        </div>
      </div>
    </motion.div>
  );
};

export default ModelViewer;
