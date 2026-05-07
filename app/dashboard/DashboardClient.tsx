"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function StatusBadge({ status }: { status: "reviewing" | "passed" | "failed" | "idle" }) {
  const map = {
    reviewing: { color: "var(--orange)", label: "reviewing", pulse: true },
    passed:    { color: "var(--green)",  label: "passed",    pulse: false },
    failed:    { color: "var(--red)",    label: "failed",    pulse: false },
    idle:      { color: "var(--text-faint)", label: "idle",  pulse: false },
  }
  const { color, label, pulse } = map[status]
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      background: `${color}12`, border: `0.5px solid ${color}30`,
      borderRadius: "var(--radius-sm)", padding: "4px 10px",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: pulse ? "pulse-dot 1.5s infinite" : "none" }}/>
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color }}>{label}</span>
    </div>
  )
}

function LangBadge({ lang }: { lang: string }) {
  const colors: Record<string, { text: string; bg: string; border: string }> = {
    TypeScript: { text: "#60A5FA", bg: "#60A5FA12", border: "#60A5FA30" },
    JavaScript: { text: "#F59E0B", bg: "#F59E0B12", border: "#F59E0B30" },
    Python:     { text: "#34D399", bg: "#34D39912", border: "#34D39930" },
    default:    { text: "var(--text-muted)", bg: "var(--bg-subtle)", border: "var(--border)" },
  }
  const c = colors[lang] || colors.default
  return (
    <span style={{
      fontSize: 9, fontFamily: "var(--font-mono)", color: c.text,
      background: c.bg, border: `0.5px solid ${c.border}`,
      padding: "2px 6px", borderRadius: 4,
    }}>{lang}</span>
  )
}

function RepoCard({ repo, saving, onToggle }: { repo: any; saving: string | null; onToggle: (r: any) => void }) {
  const isEnabled = repo.settings?.enabled
  const isSaving = saving === repo.full_name

  const getStatus = (): "reviewing" | "passed" | "failed" | "idle" => {
    if (!repo.settings?.last_review_at) return "idle"
    return "passed"
  }

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: isEnabled ? "var(--bg-card)" : "var(--bg-subtle)",
      border: `0.5px solid ${isEnabled ? "var(--border)" : "var(--border-dim)"}`,
      borderLeft: isEnabled ? `2.5px solid ${getStatus() === "reviewing" ? "var(--orange)" : getStatus() === "passed" ? "var(--green)" : "var(--border)"}` : "2.5px solid var(--border-dim)",
      borderRadius: "var(--radius)", padding: "18px 22px", marginBottom: 8,
      transition: "border-color 0.2s ease, background 0.2s ease",
    }}>
      {isEnabled && getStatus() === "reviewing" && (
        <div style={{ position: "absolute", top: 0, left: "-45%", width: "35%", height: "0.5px", background: "linear-gradient(90deg,transparent,rgba(245,166,35,0.6),transparent)", animation: "scan-line 2.5s linear infinite" }}/>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px",
              color: isEnabled ? "var(--text)" : "var(--text-muted)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{repo.name}</span>
            {repo.language && <LangBadge lang={repo.language} />}
            {repo.private && (
              <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>private</span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
            {repo.full_name}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 20 }}>
          {isEnabled && <StatusBadge status={getStatus()} />}
          {isEnabled && (
            <Link href={`/repo/${repo.owner}/${repo.name}`} style={{
              fontSize: 12, color: "var(--text-muted)", padding: "5px 12px",
              border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)",
            }}>Settings</Link>
          )}
          <button
            onClick={() => onToggle(repo)}
            disabled={isSaving}
            style={{
              padding: "7px 16px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600,
              background: isEnabled ? "transparent" : "var(--accent)",
              color: isEnabled ? "var(--text-muted)" : "#070A0F",
              border: isEnabled ? "0.5px solid var(--border)" : "none",
              opacity: isSaving ? 0.5 : 1, transition: "all 0.15s ease",
            }}
          >
            {isSaving ? "..." : isEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      {isEnabled && (
        <div style={{
          display: "flex", gap: 24, marginTop: 16,
          paddingTop: 14, borderTop: "0.5px solid var(--border)",
        }}>
          {[
            [String(repo.settings?.total_reviews ?? 0), "reviews"],
            [repo.settings?.last_review_at ? new Date(repo.settings.last_review_at).toLocaleDateString() : "never", "last review"],
            [repo.settings?.review_mode || "junior", "mode"],
            [`${repo.settings?.confidence_threshold || 70}%`, "threshold"],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{v}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardClient({ session }: { session: any }) {
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/repos").then(r => r.json()).then(d => { setRepos(d.repos || []); setLoading(false) })
  }, [])

  const toggleRepo = async (repo: any) => {
    const isEnabled = repo.settings?.enabled
    if (!isEnabled && repo.app_installed === false) {
      window.location.href = `https://github.com/apps/ai-pr-reviewer-dev/installations/new`
      return
    }
    setSaving(repo.full_name)
    await fetch("/api/settings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo_full_name: repo.full_name,
        review_mode: repo.settings?.review_mode || "junior",
        confidence_threshold: repo.settings?.confidence_threshold || 70,
        enabled: !isEnabled,
      }),
    })
    setRepos(prev => prev.map(r =>
      r.full_name === repo.full_name ? { ...r, settings: { ...r.settings, enabled: !isEnabled } } : r
    ))
    setSaving(null)
  }

  const filtered = repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()))
  const enabled = filtered.filter(r => r.settings?.enabled)
  const rest = filtered.filter(r => !r.settings?.enabled)

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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {session?.user?.image && (
            <img src={session.user.image} alt="" style={{ width: 26, height: 26, borderRadius: "50%", border: "0.5px solid var(--border)" }} />
          )}
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{session?.user?.name}</span>
          <Link href="/analytics" style={{
            fontSize: 12, color: "var(--text-muted)", padding: "6px 14px",
            border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Analytics
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: 12, color: "var(--text-faint)", padding: "6px 14px",
              border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)",
              background: "transparent",
            }}
          >Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
              workspace
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>Your repositories</h1>
          </div>
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search repositories..."
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 13, color: "var(--text)", fontFamily: "var(--font-mono)",
                width: 200,
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
            Loading repositories...
          </div>
        ) : (
          <>
            {enabled.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)",
                  letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 2.5s infinite" }}/>
                  Active ({enabled.length})
                </div>
                {enabled.map(r => <RepoCard key={r.id} repo={r} saving={saving} onToggle={toggleRepo} />)}
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-faint)",
                  letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-faint)" }}/>
                  Available ({rest.length})
                </div>
                {rest.map(r => <RepoCard key={r.id} repo={r} saving={saving} onToggle={toggleRepo} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
