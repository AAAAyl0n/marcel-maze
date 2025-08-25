"use client";
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";

type EnvKey = "eous" | "amillion" | "paperboo";

interface SerialPort {
  port_name: string;
  port_type: string;
  description?: string;
  manufacturer?: string;
  vid?: number;
  pid?: number;
}

interface FirmwareInfo {
  env: string;
  version: string;
  name: string;
  chip: string;
  flash_size: string;
  path: string;
}

const ENV_OPTIONS: { key: EnvKey; label: string }[] = [
  { key: "eous", label: "Eous" },
  { key: "amillion", label: "Amillion" },
  { key: "paperboo", label: "Paperboo" },
];

export default function Page() {
  const router = useRouter();
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [firmwareList, setFirmwareList] = useState<FirmwareInfo[]>([]);

  const [env, setEnv] = useState<EnvKey | null>(null);
  const [version, setVersion] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [includeLittleFS, setIncludeLittleFS] = useState<boolean>(false);

  useEffect(() => {
    loadPorts();
    loadFirmware();
  }, []);

  const loadPorts = async () => {
    try {
      const portList = await invoke<SerialPort[]>("list_serial_ports");
      setPorts(portList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFirmware = async () => {
    try {
      const list = await invoke<FirmwareInfo[]>("list_firmware");
      setFirmwareList(list);
    } catch (e) {
      console.error(e);
    }
  };

  const envVersions = useMemo(() => {
    if (!env) return [] as string[];
    const set = new Set<string>();
    firmwareList
      .filter((f) => f.env.toLowerCase() === env)
      .forEach((f) => set.add(f.version));
    return Array.from(set).sort();
  }, [env, firmwareList]);

  useEffect(() => {
    if (envVersions.length > 0) {
      setVersion((v) => (v && envVersions.includes(v) ? v : envVersions[0]));
    } else {
      setVersion("");
    }
  }, [envVersions]);

  const selectedFirmware = useMemo(() => {
    if (!env || !version) return undefined;
    return firmwareList.find(
      (f) => f.env.toLowerCase() === env && f.version === version
    );
  }, [env, version, firmwareList]);

  const goNext = () => {
    if (!env || !version || !port || !selectedFirmware) return;
    const q = new URLSearchParams({
      env,
      version,
      port,
      firmwarePath: selectedFirmware.path,
      includeLittleFS: includeLittleFS ? "1" : "0",
    }).toString();
    router.push(`/sync?${q}`);
  };

  return (
    <div className="container-center">
      <div className="card" style={{ width: 760, maxWidth: "92vw" }}>
        <h1 className="title">选择配置</h1>

        {/* 角色选择 */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>选择角色</label>
          <div className="options options-flat">
            {ENV_OPTIONS.map(({ key, label }) => (
              <label
                key={key}
                className={`option`}
                onClick={() => setEnv(key)}
              >
                <input
                  type="radio"
                  name="env"
                  value={key}
                  checked={env === key}
                  onChange={() => setEnv(key)}
                  style={{ accentColor: "#e35d6a" }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 版本选择 */}
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>选择版本</label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--muted)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--fg-on-dark)",
            }}
            disabled={!env || envVersions.length === 0}
          >
            {envVersions.length === 0 ? (
              <option value="">无可用版本</option>
            ) : (
              envVersions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 串口 */}
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>选择串口</label>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--muted)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--fg-on-dark)",
              }}
            >
              <option value="">请选择串口</option>
              {ports.map((p) => (
                <option key={p.port_name} value={p.port_name}>
                  {p.port_name} - {p.description || p.manufacturer || p.port_type}
                </option>
              ))}
            </select>
            <button className="button" onClick={loadPorts}>刷新</button>
          </div>
        </div>

        {/* LittleFS 开关 */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <input
            id="toggle-littlefs"
            type="checkbox"
            checked={includeLittleFS}
            onChange={(e) => setIncludeLittleFS(e.target.checked)}
            style={{ accentColor: "#e35d6a" }}
          />
          <label htmlFor="toggle-littlefs">是否烧录 LittleFS（默认关闭）</label>
        </div>

        {/* 操作 */}
        <div className="actions" style={{ marginTop: 18 }}>
          <button
            className="button primary"
            onClick={goNext}
            disabled={!env || !version || !port || !selectedFirmware}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}