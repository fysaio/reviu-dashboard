import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 64px", borderBottom: "0.5px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(7,10,15,0.92)",
        backdropFilter: "blur(16px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="8" height="2" rx="1" fill="var(--accent)"/>
            <rect x="2" y="8" width="5.5" height="2" rx="1" fill="var(--accent)" opacity="0.5"/>
            <rect x="2" y="12" width="3.5" height="2" rx="1" fill="var(--accent)" opacity="0.25"/>
            <path d="M12.5 7L15 9.5L19 5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.4px" }}>
            Reviu<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#how-it-works" style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>how it works</a>
          <a href="https://github.com/fysaio/pr-reviewer" style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>github</a>
          <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }) }}>
            <button type="submit" style={{
              background: "var(--accent)", color: "#070A0F",
              padding: "8px 18px", borderRadius: "var(--radius-sm)", border: "none",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
            }}>
              <GithubIcon size={13} />
              Sign in
            </button>
          </form>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "100px 64px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

          <div className="animate-fade-up">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--accent-dim)", border: "0.5px solid var(--accent-ring)",
              borderRadius: 100, padding: "5px 14px", marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 2s infinite" }}/>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.4px" }}>
                open beta — free to install
              </span>
            </div>

            <h1 style={{
              fontSize: 52, fontWeight: 700, lineHeight: 1.06,
              letterSpacing: "-2px", marginBottom: 20,
            }}>
              Code review that<br/>
              <span style={{ color: "var(--accent)" }}>actually reads</span><br/>
              your codebase.
            </h1>

            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 36, maxWidth: 420 }}>
              Most AI reviewers see a diff and guess. Reviu indexes your entire repository first — then checks intent, finds context, and flags real issues with confidence scores.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 48 }}>
              <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }) }}>
                <button type="submit" style={{
                  background: "var(--accent)", color: "#070A0F",
                  padding: "12px 24px", borderRadius: "var(--radius)", border: "none",
                  fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 7,
                }}>
                  <GithubIcon size={15} />
                  Install on GitHub — free
                </button>
              </form>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 28, paddingTop: 32, borderTop: "0.5px solid var(--border)" }}>
              {[
                { v: "RAG", l: "context engine" },
                { v: "2x", l: "LLM passes" },
                { v: "<60s", l: "avg review" },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.5px" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated review card */}
          <div className="animate-fade-up-2">
            <LiveReviewCard />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        padding: "80px 64px", borderTop: "0.5px solid var(--border)",
        background: "linear-gradient(180deg, var(--bg) 0%, #050709 100%)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>
              how it works
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px" }}>
              Three steps. One judgment.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            {[
              {
                n: "01", title: "Index", icon: <DatabaseIcon />,
                body: "On first PR, Reviu fetches your entire repo and embeds it into a vector database. Future PRs trigger incremental updates on push.",
              },
              {
                n: "02", title: "Verify intent", icon: <SearchIcon />,
                body: "A dedicated LLM pass checks whether the code change actually matches the PR description. Mismatches are flagged before review.",
              },
              {
                n: "03", title: "Review with context", icon: <CheckIcon />,
                body: "Semantic search pulls the 5 most relevant files. The reviewer sees what surrounds the diff — not just the diff.",
              },
            ].map((step, i) => (
              <div key={step.n} style={{
                background: i === 1 ? "var(--bg-card)" : "transparent",
                border: "0.5px solid var(--border)",
                borderRadius: i === 0 ? "var(--radius) 0 0 var(--radius)" : i === 2 ? "0 var(--radius) var(--radius) 0" : 0,
                padding: "32px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ color: "var(--accent)", width: 20, height: 20 }}>{step.icon}</div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "1.5px" }}>{step.n}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 10 }}>{step.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 64px", borderTop: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              {
                title: "Confidence scoring",
                body: "Every finding ships with a confidence percentage. Set a per-repo threshold — low-signal noise never reaches your PR.",
                tag: "per-repo",
              },
              {
                title: "Junior & Senior modes",
                body: "Junior mode explains why. Senior mode is direct. Configure per repo based on who's reviewing.",
                tag: "configurable",
              },
              {
                title: "Diff findings vs context findings",
                body: "Issues introduced by this PR are separated from pre-existing issues in surrounding files. You always know what's new.",
                tag: "signal clarity",
              },
              {
                title: "GitHub Check Runs",
                body: "Reviews post as native GitHub Check Runs. Pass or fail verdict surfaces inline with your CI — no context switching.",
                tag: "native integration",
              },
            ].map(({ title, body, tag }) => (
              <div key={title} style={{
                background: "var(--bg-card)", border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)", padding: "28px 28px",
              }}>
                <div style={{
                  display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--accent)", background: "var(--accent-dim)", border: "0.5px solid var(--accent-ring)",
                  padding: "3px 8px", borderRadius: 4, marginBottom: 14, letterSpacing: "0.5px",
                }}>
                  {tag}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 10 }}>{title}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        padding: "100px 64px", borderTop: "0.5px solid var(--border)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 16 }}>
            Ready to stop reviewing<br/>
            <span style={{ color: "var(--accent)" }}>in the dark?</span>
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 36 }}>
            Install Reviu on any GitHub repository in under two minutes. Free while in beta.
          </p>
          <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }) }}>
            <button type="submit" style={{
              background: "var(--accent)", color: "#070A0F",
              padding: "14px 32px", borderRadius: "var(--radius)", border: "none",
              fontSize: 15, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <GithubIcon size={16} />
              Get started with GitHub
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px 64px", borderTop: "0.5px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
          Reviu — built by <a href="https://github.com/fysaio" style={{ color: "var(--text-muted)" }}>fysaio</a> / 0xPermission Labs
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
          Lagos, Nigeria
        </span>
      </footer>

    </div>
  )
}

// ── SVG icon components ──────────────────────────────────────────

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function DatabaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

// ── Animated hero review card ────────────────────────────────────

function LiveReviewCard() {
  return (
    <div style={{
      background: "var(--bg-card)", border: "0.5px solid var(--border)",
      borderRadius: 14, padding: 22, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: "-45%", width: "35%", height: "0.5px", background: "linear-gradient(90deg,transparent,rgba(0,229,204,0.5),transparent)", animation: "scan-line 3s linear infinite" }}/>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingBottom: 14, borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#A78BFA18", border: "0.5px solid #A78BFA35", borderRadius: 4, padding: "3px 8px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#A78BFA" }}>PR #47</div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Add WebSocket auth handler</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", animation: "pulse-dot 1.5s infinite" }}/>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--orange)" }}>reviewing</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { sev: "critical", color: "var(--red)", file: "handler.ts:47", conf: 94, msg: "Token never validated against session store — any string grants access." },
          { sev: "major", color: "var(--orange)", file: "handler.ts:62", conf: 87, msg: "No rate limiting on connection. The RateLimiter class in utils/ applies here." },
        ].map(({ sev, color, file, conf, msg }) => (
          <div key={sev} style={{
            background: `${color}0D`, border: `0.5px solid ${color}30`,
            borderLeft: `2.5px solid ${color}`, borderRadius: "var(--radius-sm)", padding: "10px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }}/>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color }}>{sev}</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>{file}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{conf}%</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.55 }}>{msg}</p>
          </div>
        ))}
        <div style={{
          background: "var(--accent-dim)", border: "0.5px solid var(--accent-ring)",
          borderRadius: "var(--radius-sm)", padding: "9px 12px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 0.25, 0.5].map(d => (
              <div key={d} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "var(--accent)", animation: `pulse-dot 1s ${d}s infinite` }}/>
            ))}
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>scanning related context...</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 18, paddingTop: 14, borderTop: "0.5px solid var(--border)" }}>
        {[["276", "files indexed"], ["2", "issues found"], ["pending", "verdict"]].map(([v, l]) => (
          <div key={l} style={{ background: "var(--bg-subtle)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: l === "verdict" ? "var(--orange)" : "var(--text)" }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
