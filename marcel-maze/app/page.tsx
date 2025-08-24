"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [choice, setChoice] = useState<string | null>(null);

  const options = ["Eous", "Amillion", "Paperboo"] as const;

  return (
    <div className="container-center">
      <div className="card">
        <h1 className="title">请选择一个角色</h1>
        <div className="options">
          {options.map((opt) => (
            <label
              key={opt}
              className={`option ${choice === opt ? "selected" : ""}`}
              onClick={() => setChoice(opt)}
            >
              <input
                type="radio"
                name="role"
                value={opt}
                checked={choice === opt}
                onChange={() => setChoice(opt)}
                style={{ accentColor: "#e35d6a" }}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="actions">
          <button
            className="button"
            onClick={() => setChoice(null)}
          >
            重置
          </button>
          <button
            className="button primary"
            disabled={!choice}
            onClick={() => router.push(`/sync?role=${encodeURIComponent(choice || "")}`)}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}