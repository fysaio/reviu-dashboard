import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(8,11,15,0.9)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>
          Reviu<span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }) }}>
          <button type="submit" style={{
            background: "var(--accent)", color: "#000", fontWeight: 600,
            padding: "8px 20px", borderRadius: "8px", fontSize: "14px",
            fontFamily: "DM Sans",
          }}>
            Sign in with GitHub
          </button>
        </form>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "80px 24px", textAlign: "center",
        maxWidth: "800px", margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 14px", borderRadius: "100px",
          border: "1px solid var(--accent-border)",
          background: "var(--accent-dim)", marginBottom: "32px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          <span style={{ fontSize: "13px", color: "var(--accent)", fontFamily: "JetBrains Mono" }}>
            AI-powered · Context-aware · African-built
          </span>
        </div>

        <h1 style={{
          fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(40px, 8vw, 72px)",
          lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "24px",
        }}>
          Code review that<br />
          <span style={{ color: "var(--accent)" }}>actually understands</span><br />
          your codebase
        </h1>

        <p style={{
          fontSize: "18px", color: "var(--text-dim)", lineHeight: 1.7,
          maxWidth: "560px", marginBottom: "48px",
        }}>
          Reviu indexes your entire repo, verifies PR intent against descriptions,
          and reviews code with junior or senior mode — posting findings directly to your PRs.
        </p>

        <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }) }}>
          <button type="submit" style={{
            background: "var(--accent)", color: "#000", fontWeight: 700,
            padding: "14px 32px", borderRadius: "10px", fontSize: "16px",
            fontFamily: "Syne", letterSpacing: "-0.3px",
            boxShadow: "0 0 40px rgba(240,165,0,0.2)",
          }}>
            Connect GitHub — it&apos;s free
          </button>
        </form>

        {/* Features */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", marginTop: "80px", width: "100%",
        }}>
          {[
            { icon: "⚡", title: "Instant setup", desc: "Connect a repo in 30 seconds. No config files." },
            { icon: "🧠", title: "RAG context", desc: "Indexes your entire codebase. Catches cross-file bugs." },
            { icon: "🎯", title: "Intent check", desc: "Verifies your PR does what the description claims." },
          ].map((f) => (
            <div key={f.title} style={{
              padding: "24px", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", background: "var(--bg-card)",
              textAlign: "left",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.icon}</div>
              <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px 40px", borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "15px" }}>
          Reviu<span style={{ color: "var(--accent)" }}>.</span>
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
          Built by 0xPermission Labs · Lagos
        </span>
      </footer>
    </main>
  )
}
