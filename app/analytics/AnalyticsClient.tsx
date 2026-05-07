"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts"

interface Review {
  id: number
  repo_full_name: string
  pr_number: number
  pr_title: string | null
  diff_findings: number
  context_findings: number
  verdict: string | null
  review_mode: string | null
  reviewed_at: string
}

const COLORS = {
  accent: "#00E5CC",
  red: "#EF4747",
  orange: "#F5A623",
  green: "#22D46A",
  purple: "#A78BFA",
  blue: "#60A5FA",
  dim: "#1B2535",
  text: "#E2EAF4",
  textDim: "#8A9BB0",
  textFaint: "#1E2A38",
  textMuted: "#3A4A5C",
  bg: "#070A0F",
  bgCard: "#0D1117",
  border: "#1B2535",
}

const CHART_COLORS = [COLORS.accent, COLORS.purple, COLORS.blue, COLORS.orange, COLORS.green, COLORS.red]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
      borderRadius: 6, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ fontFamily: "var(--font-mono)", color: COLORS.textDim, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: COLORS.textDim }}>{p.name}:</span>
          <span style={{ color: COLORS.text, fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsClient() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setLoading(false) })
  }, [])

  // Reviews per day (last 30 days)
  const dailyData = useMemo(() => {
    const days: Record<string, { date: string; reviews: number; findings: number }> = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      days[key] = { date: key, reviews: 0, findings: 0 }
    }
    reviews.forEach(r => {
      const key = r.reviewed_at.split("T")[0]
      if (days[key]) {
        days[key].reviews++
        days[key].findings += r.diff_findings + r.context_findings
      }
    })
    return Object.values(days).map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    }))
  }, [reviews])

  // Findings breakdown
  const findingsData = useMemo(() => {
    const totalDiff = reviews.reduce((s, r) => s + r.diff_findings, 0)
    const totalCtx = reviews.reduce((s, r) => s + r.context_findings, 0)
    return [
      { name: "Diff findings", value: totalDiff, color: COLORS.red },
      { name: "Context findings", value: totalCtx, color: COLORS.orange },
    ]
  }, [reviews])

  // Most active repos
  const repoData = useMemo(() => {
    const counts: Record<string, number> = {}
    reviews.forEach(r => { counts[r.repo_full_name] = (counts[r.repo_full_name] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({
        name: name.split("/")[1] || name,
        fullName: name,
        reviews: count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
  }, [reviews])

  // Pass/fail ratio
  const verdictData = useMemo(() => {
    let pass = 0, fail = 0
    reviews.forEach(r => {
      if (r.verdict === "pass") pass++
      else if (r.verdict === "fail") fail++
    })
    return [
      { name: "Pass", value: pass, color: COLORS.green },
      { name: "Fail", value: fail, color: COLORS.red },
    ].filter(d => d.value > 0)
  }, [reviews])

  // Summary stats
  const stats = useMemo(() => {
    const totalReviews = reviews.length
    const totalFindings = reviews.reduce((s, r) => s + r.diff_findings + r.context_findings, 0)
    const passRate = totalReviews > 0
      ? Math.round((reviews.filter(r => r.verdict === "pass").length / totalReviews) * 100)
      : 0
    const uniqueRepos = new Set(reviews.map(r => r.repo_full_name)).size
    return [
      { value: String(totalReviews), label: "total reviews" },
      { value: String(totalFindings), label: "total findings" },
      { value: `${passRate}%`, label: "pass rate" },
      { value: String(uniqueRepos), label: "repos reviewed" },
    ]
  }, [reviews])

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 48px", borderBottom: `0.5px solid ${COLORS.border}`,
        position: "sticky", top: 0, background: "rgba(7,10,15,0.92)",
        backdropFilter: "blur(16px)", zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="8" height="2" rx="1" fill={COLORS.accent}/>
            <rect x="2" y="8" width="5.5" height="2" rx="1" fill={COLORS.accent} opacity="0.5"/>
            <rect x="2" y="12" width="3.5" height="2" rx="1" fill={COLORS.accent} opacity="0.25"/>
            <path d="M12.5 7L15 9.5L19 5" stroke={COLORS.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.4px" }}>
            Reviu<span style={{ color: COLORS.accent }}>.</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard" style={{
            fontSize: 12, color: COLORS.textMuted, padding: "6px 14px",
            border: `0.5px solid ${COLORS.border}`, borderRadius: 6,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: 12, color: COLORS.textFaint, padding: "6px 14px",
              border: `0.5px solid ${COLORS.border}`, borderRadius: 6,
              background: "transparent",
            }}
          >Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textFaint, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
            insights
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>Analytics</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: COLORS.textFaint }}>
            Loading analytics...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No review data yet</div>
            <div style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.75, maxWidth: 380, margin: "0 auto" }}>
              Analytics will populate after Reviu completes its first review on one of your repositories.
            </div>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {stats.map(({ value, label }) => (
                <div key={label} style={{
                  background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "20px 22px",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: COLORS.accent, letterSpacing: "-1px" }}>{value}</div>
                  <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Reviews per day */}
            <div style={{
              background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
              borderRadius: 10, padding: "24px 24px 16px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px" }}>Reviews per day</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textFaint }}>last 30 days</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.dim} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: COLORS.textFaint }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.textFaint }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reviews" stroke={COLORS.accent} strokeWidth={2} fill="url(#gradientAccent)" name="Reviews" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom row: Active repos + Findings + Verdict */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

              {/* Most active repos */}
              <div style={{
                background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
                borderRadius: 10, padding: "24px 24px 16px",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 20 }}>Most active repos</div>
                {repoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={repoData} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.dim} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.textFaint }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.textDim }} tickLine={false} axisLine={false} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="reviews" name="Reviews" radius={[0, 4, 4, 0]}>
                        {repoData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ fontSize: 12, color: COLORS.textFaint }}>No data</div>
                )}
              </div>

              {/* Right column: findings + verdict stacked */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Findings breakdown */}
                <div style={{
                  background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "22px 24px", flex: 1,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 16 }}>Findings breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {findingsData.map(({ name, value, color }) => {
                      const total = findingsData.reduce((s, d) => s + d.value, 0) || 1
                      const pct = Math.round((value / total) * 100)
                      return (
                        <div key={name}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                              <span style={{ fontSize: 12, color: COLORS.textDim }}>{name}</span>
                            </div>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: COLORS.text, fontWeight: 500 }}>{value}</span>
                          </div>
                          <div style={{ height: 4, background: COLORS.dim, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pass/fail ratio */}
                <div style={{
                  background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "22px 24px", flex: 1,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 12 }}>Verdict ratio</div>
                  {verdictData.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                          <Pie data={verdictData} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" strokeWidth={0}>
                            {verdictData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {verdictData.map(({ name, value, color }) => (
                          <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                            <span style={{ fontSize: 12, color: COLORS.textDim }}>{name}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: COLORS.text, fontWeight: 600, marginLeft: 4 }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: COLORS.textFaint }}>No data</div>
                  )}
                </div>

              </div>
            </div>

            {/* Recent reviews table */}
            <div style={{
              background: COLORS.bgCard, border: `0.5px solid ${COLORS.border}`,
              borderRadius: 10, padding: "24px 24px 16px", marginTop: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 16 }}>Recent reviews</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `0.5px solid ${COLORS.border}` }}>
                      {["Repo", "PR", "Diff", "Context", "Verdict", "Mode", "Date"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textFaint, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.slice(0, 15).map(r => (
                      <tr key={r.id} style={{ borderBottom: `0.5px solid ${COLORS.dim}` }}>
                        <td style={{ padding: "9px 10px", fontFamily: "var(--font-mono)", color: COLORS.textDim }}>{r.repo_full_name.split("/")[1]}</td>
                        <td style={{ padding: "9px 10px" }}>
                          <span style={{ color: COLORS.purple, fontFamily: "var(--font-mono)" }}>#{r.pr_number}</span>
                          {r.pr_title && <span style={{ color: COLORS.textDim, marginLeft: 6 }}>{r.pr_title.slice(0, 40)}{r.pr_title.length > 40 ? "…" : ""}</span>}
                        </td>
                        <td style={{ padding: "9px 10px", fontFamily: "var(--font-mono)", color: r.diff_findings > 0 ? COLORS.red : COLORS.textFaint }}>{r.diff_findings}</td>
                        <td style={{ padding: "9px 10px", fontFamily: "var(--font-mono)", color: r.context_findings > 0 ? COLORS.orange : COLORS.textFaint }}>{r.context_findings}</td>
                        <td style={{ padding: "9px 10px" }}>
                          {r.verdict && (
                            <span style={{
                              fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 7px", borderRadius: 4,
                              background: r.verdict === "pass" ? `${COLORS.green}15` : `${COLORS.red}15`,
                              color: r.verdict === "pass" ? COLORS.green : COLORS.red,
                              border: `0.5px solid ${r.verdict === "pass" ? `${COLORS.green}30` : `${COLORS.red}30`}`,
                            }}>{r.verdict}</span>
                          )}
                        </td>
                        <td style={{ padding: "9px 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textFaint }}>{r.review_mode}</td>
                        <td style={{ padding: "9px 10px", fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textFaint }}>{new Date(r.reviewed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
