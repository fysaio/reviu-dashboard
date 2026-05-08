"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

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

  const hasChanges = settings ? (
    mode !== (settings.review_mode || "junior") ||
    threshold !== (settings.confidence_threshold || 70) ||
    enabled !== (settings.enabled ?? true)
  ) : false

  useEffect(() => {
    fetch(`/api/settings?repo=${repoFull}`).then(r => r.json()).then(d => {
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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_full_name: repoFull, review_mode: mode, confidence_threshold: threshold, enabled }),
    })
    setSettings({ ...settings, review_mode: mode, confidence_threshold: threshold, enabled })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 48px", borderBottom: "0.5px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(7,10,15,0.92)",
        backdropFilter: "blur(16px)", zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="8" height="2" rx="1" fill="var(--accent)"/>
            <rect x="2" y="8" width="5.5" height="2" rx="1" fill="var(--accent)" opacity="0.5"/>
            <rect x="2" y="12" width="3.5" height="2" rx="1" fill="var(--accent)" opacity="0.25"/>
            <path d="M12.5 7L15 9.5L19 5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.4px" }}>
            Reviu<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </Link>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn btn-outline"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "48px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", marginBottom: 6 }}>
            {params.owner} /
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.7px" }}>{params.repo}</h1>
        </div>

        {loading ? (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>Loading settings...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Enabled */}
            <div style={{
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "22px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 5 }}>Reviews enabled</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Reviu reviews every PR opened on this repository</div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: 44, height: 24, borderRadius: 100,
                  background: enabled ? "var(--accent)" : "var(--border)",
                  border: "none", position: "relative", flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: 3,
                  left: enabled ? 23 : 3,
                  width: 18, height: 18, borderRadius: "50%",
                  background: enabled ? "#070A0F" : "var(--text-faint)",
                  transition: "left 0.2s",
                }}/>
              </button>
            </div>

            {/* Mode */}
            <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 5 }}>Review mode</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                Junior explains reasoning. Senior is concise and direct.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["junior", "senior"].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-sm)",
                      fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)",
                      background: mode === m ? "var(--accent)" : "transparent",
                      color: mode === m ? "#070A0F" : "var(--text-muted)",
                      border: `0.5px solid ${mode === m ? "var(--accent)" : "var(--border)"}`,
                      transition: "all 0.15s",
                    }}
                  >{m}</button>
                ))}
              </div>
            </div>

            {/* Threshold */}
            <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px" }}>Confidence threshold</div>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 16, fontWeight: 600 }}>{threshold}%</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                Findings below this confidence are suppressed before posting.
              </div>
              <input
                type="range" min={50} max={95} step={5}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", height: 4 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
                <span>50% — more findings</span>
                <span>95% — fewer, higher quality</span>
              </div>
            </div>

            {/* Stats */}
            {settings && (
              <div style={{
                background: "var(--bg-card)", border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)", padding: "22px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
              }}>
                {[
                  [String(settings.total_reviews ?? 0), "total reviews"],
                  [settings.last_review_at ? new Date(settings.last_review_at).toLocaleDateString() : "never", "last review"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)", letterSpacing: "-1px" }}>{v}</div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Save */}
            <button
              onClick={save}
              disabled={saving || (!hasChanges && !saved)}
              style={{
                padding: "13px", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 700,
                background: saved ? "rgba(34,212,106,0.08)" : (!hasChanges && !saving) ? "transparent" : "var(--accent)",
                color: saved ? "var(--green)" : (!hasChanges && !saving) ? "var(--text-muted)" : "#070A0F",
                border: saved ? "0.5px solid rgba(34,212,106,0.25)" : (!hasChanges && !saving) ? "0.5px solid var(--border)" : "none",
                opacity: saving ? 0.7 : (!hasChanges && !saved) ? 0.6 : 1, transition: "all 0.2s",
                cursor: (!hasChanges && !saved && !saving) ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
