"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function RepoSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const repoFull = `${params.owner}/${params.repo}`

  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [mode, setMode] = useState("junior")
  const [threshold, setThreshold] = useState(70)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    fetch(`/api/settings?repo=${repoFull}`)
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setMode(d.settings.review_mode || "junior")
          setThreshold(d.settings.confidence_threshold || 70)
          setEnabled(d.settings.enabled ?? true)
          setSettings(d.settings)
        }
        setLoading(false)
      })
  }, [repoFull])

  const save = async () => {
    setSaving(true)
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo_full_name: repoFull,
        review_mode: mode,
        confidence_threshold: threshold,
        enabled,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(8,11,15,0.95)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>
          Reviu<span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ fontSize: "13px", color: "var(--text-muted)" }}
        >
          ← Back to repos
        </button>
      </nav>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "13px", fontFamily: "JetBrains Mono", color: "var(--text-muted)", marginBottom: "8px" }}>
            {params.owner} /
          </div>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.8px" }}>
            {params.repo}
          </h1>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontFamily: "JetBrains Mono", fontSize: "13px" }}>
            Loading settings...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Enabled toggle */}
            <div style={{
              padding: "24px", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "4px" }}>Reviews enabled</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Reviu will review every PR opened on this repo
                </div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: "48px", height: "26px", borderRadius: "100px",
                  background: enabled ? "var(--accent)" : "var(--border)",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: "3px",
                  left: enabled ? "25px" : "3px",
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: enabled ? "#000" : "var(--text-muted)",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>

            {/* Review mode */}
            <div style={{
              padding: "24px", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
            }}>
              <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: "4px" }}>Review mode</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Junior mode teaches with explanations. Senior mode is concise and direct.
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["junior", "senior"].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "8px",
                      fontFamily: "Syne", fontWeight: 600, fontSize: "14px",
                      background: mode === m ? "var(--accent)" : "transparent",
                      color: mode === m ? "#000" : "var(--text-dim)",
                      border: `1px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence threshold */}
            <div style={{
              padding: "24px", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 700 }}>Confidence threshold</div>
                <div style={{ fontFamily: "JetBrains Mono", color: "var(--accent)", fontSize: "14px" }}>
                  {threshold}%
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Only show findings with confidence above this threshold.
              </div>
              <input
                type="range" min={50} max={95} step={5}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", fontFamily: "JetBrains Mono", marginTop: "8px" }}>
                <span>50% — more findings</span>
                <span>95% — fewer, higher confidence</span>
              </div>
            </div>

            {/* Stats */}
            {settings && (
              <div style={{
                padding: "24px", background: "var(--bg-card)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
              }}>
                <div>
                  <div style={{ fontSize: "28px", fontFamily: "JetBrains Mono", fontWeight: 800, color: "var(--accent)" }}>
                    {settings.total_reviews ?? 0}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total reviews</div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontFamily: "JetBrains Mono", fontWeight: 800, color: "var(--green)" }}>
                    {settings.last_review_at ? new Date(settings.last_review_at).toLocaleDateString() : "Never"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Last review</div>
                </div>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "14px", borderRadius: "10px",
                background: saved ? "var(--green-dim)" : "var(--accent)",
                color: saved ? "var(--green)" : "#000",
                fontFamily: "Syne", fontWeight: 700, fontSize: "15px",
                border: saved ? "1px solid var(--green)" : "none",
                opacity: saving ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved" : "Save settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
