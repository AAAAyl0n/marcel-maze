"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SyncPage() {
  const params = useSearchParams();
  const role = params.get("role") ?? "";

  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 7 + 3));
    }, 180);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="container-center">
      <div className="card" style={{ width: 600 }}>
        <h1 className="title">参数同步</h1>
        <p style={{ marginTop: 0, opacity: 0.85 }}>角色：{role || "未指定"}</p>
        <div className="progress" style={{ margin: "14px 0 12px" }}>
          <div className="bar" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ opacity: 0.8 }}>{Math.floor(progress)}%</span>
          <button
            className="button primary"
            onClick={() => {
              setProgress(0);
              setRunning(true);
            }}
          >
            Start Neural Network Parameter Sync
          </button>
        </div>
      </div>
    </div>
  );
}


