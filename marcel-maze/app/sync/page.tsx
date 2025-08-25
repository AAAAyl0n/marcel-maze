"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import AsciiChaos from "../components/AsciiChaos";

interface FlashProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export default function SyncPage() {
  const params = useSearchParams();
  const env = params.get("env") || "";
  const version = params.get("version") || "";
  const port = params.get("port") || "";
  const firmwarePath = params.get("firmwarePath") || "";
  const includeLittleFS = params.get("includeLittleFS") === "1";

  const [progress, setProgress] = useState<FlashProgress | null>(null);
  const [logline, setLogline] = useState("");
  const [isFlashing, setIsFlashing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const unlistenProgressP = listen("flash-progress", (e) => {
      const p = e.payload as FlashProgress;
      setProgress(p);
      setLogline(p.message || "");
    });
    const unlistenCompleteP = listen("flash-complete", (e) => {
      const r = e.payload as { success: boolean; message: string };
      setResult(r);
      setIsFlashing(false);
    });
    return () => {
      unlistenProgressP.then((fn) => fn());
      unlistenCompleteP.then((fn) => fn());
    };
  }, []);

  const start = async () => {
    setIsFlashing(true);
    setProgress(null);
    setResult(null);
    setLogline("");
    try {
      await invoke("flash_esp32", {
        request: {
          port,
          firmware_path: firmwarePath,
          include_littlefs: includeLittleFS,
          custom_baud: null,
        },
      });
    } catch (e) {
      setResult({ success: false, message: String(e) });
      setIsFlashing(false);
    }
  };

  return (
    <div className="container-center" style={{ position: "relative", zIndex: 1 }}>
      <AsciiChaos />
      <div className="card" style={{ width: 760, maxWidth: "92vw", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button className="button" onClick={() => window.history.back()}>
            返回
          </button>
          <h1 className="title" style={{ margin: 0 }}>参数同步</h1>
        </div>
        <div style={{ opacity: 0.85, marginBottom: 10, fontSize: 14 }}>
          角色：{env || "-"}，版本：{version || "-"}，串口：{port || "-"}，LittleFS：{includeLittleFS ? "是" : "否"}
        </div>
        <div className="progress" style={{ marginTop: 6 }}>
          <div className="bar" style={{ width: `${progress?.percentage ?? 0}%` }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>{logline}</div>
        {result && (
          <div style={{ marginTop: 10, fontSize: 14, color: result.success ? "#22c55e" : "#ef4444" }}>
            {result.message}
          </div>
        )}
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="button primary" onClick={start} disabled={isFlashing || !port || !firmwarePath}>
            开始神经网络参数同步
          </button>
        </div>
      </div>
    </div>
  );
}


