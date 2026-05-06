"use client"
import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"

export default function DashboardClient({ session }: { session: any }) {
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/repos")
      .then(r => r.json())
      .then(d => { setRepos(d.repos || []); setLoading(false) })
  }, [])

  const toggleRepo = async (repo: any) => {
    const isEnabled = repo.settings?.enabled

    if (!isEnabled) {
      window.location.href = `https://github.com/apps/ai-pr-reviewer-dev/installations/new`
      return
    }

    setSaving(repo.full_name)
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo_full_name: repo.full_name,
        review_mode: repo.settings?.review_mode || "junior",
        confidence_threshold: repo.settings?.confidence_threshold || 70,
        enabled: !isEnabled,
      }),
    })
    setRepos(prev => prev.map(r =>
      r.full_name === repo.full_name
        ? { ...r, settings: { ...r.settings, enabled: !isEnabled } }
        : r
    ))
    setSaving(null)
  }

  const filtered = repos.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const enabled = filtered.filter(r => r.settings?.enabled)
  const rest = filtered.filter(r => !r.settings?.enabled)

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "var(--text-dim)" }}>
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: "13px", color: "var(--text-muted)",
              padding: "6px 14px", border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "Syne", fontWeight: 800, fontSize: "32px",
            letterSpacing: "-1px", marginBottom: "8px",
          }}>
            Your repositories
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "15px" }}>
            Enable Reviu on repos to start getting AI code reviews on every PR.
          </p>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search repositories..."
          style={{
            width: "100%", padding: "12px 16px", marginBottom: "32px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", color: "var(--text)",
            fontSize: "14px", fontFamily: "DM Sans", outline: "none",
          }}
        />

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontFamily: "JetBrains Mono", fontSize: "13px" }}>
            Loading repositories...
          </div>
        )}

        {enabled.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              fontSize: "11px", fontFamily: "JetBrains Mono", color: "var(--green)",
              letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase",
            }}>
              ● Active ({enabled.length})
            </div>
            {enabled.map(repo => (
              <RepoCard key={repo.id} repo={repo} saving={saving} onToggle={toggleRepo} />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div>
            <div style={{
              fontSize: "11px", fontFamily: "JetBrains Mono", color: "var(--text-muted)",
              letterSpacing: "1px", marginBottom: "16px", textTransform: "uppercase",
            }}>
              Available ({rest.length})
            </div>
            {rest.map(repo => (
              <RepoCard key={repo.id} repo={repo} saving={saving} onToggle={toggleRepo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RepoCard({ repo, saving, onToggle }: { repo: any; saving: string | null; onToggle: (r: any) => void }) {
  const isEnabled = repo.settings?.enabled
  const isSaving = saving === repo.full_name

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 24px", marginBottom: "8px",
      background: isEnabled ? "var(--bg-card)" : "transparent",
      border: `1px solid ${isEnabled ? "var(--border-active)" : "var(--border)"}`,
      borderRadius: "var(--radius)",
      transition: "all 0.15s ease",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{
            fontFamily: "Syne", fontWeight: 700, fontSize: "15px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {repo.name}
          </span>
          {repo.private && (
            <span style={{
              fontSize: "11px", fontFamily: "JetBrains Mono",
              padding: "2px 8px", borderRadius: "4px",
              border: "1px solid var(--border)", color: "var(--text-muted)",
            }}>
              private
            </span>
          )}
          {repo.language && (
            <span style={{
              fontSize: "11px", fontFamily: "JetBrains Mono",
              color: "var(--accent)",
            }}>
              {repo.language}
            </span>
          )}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {repo.full_name}
          {repo.settings?.total_reviews > 0 && (
            <span style={{ marginLeft: "12px", color: "var(--green)" }}>
              {repo.settings.total_reviews} reviews
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "24px" }}>
        {isEnabled && (
          <a
            href={`/repo/${repo.owner}/${repo.name}`}
            style={{
              fontSize: "13px", color: "var(--text-dim)",
              padding: "6px 14px", border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
          >
            Settings
          </a>
        )}
        <button
          onClick={() => onToggle(repo)}
          disabled={isSaving}
          style={{
            padding: "8px 18px", borderRadius: "8px", fontSize: "13px",
            fontWeight: 600, fontFamily: "DM Sans",
            background: isEnabled ? "transparent" : "var(--accent)",
            color: isEnabled ? "var(--text-muted)" : "#000",
            border: isEnabled ? "1px solid var(--border)" : "none",
            opacity: isSaving ? 0.5 : 1,
            transition: "all 0.15s ease",
          }}
        >
          {isSaving ? "..." : isEnabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  )
}
