import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.redirect(new URL("/?error=unauthenticated", req.url))
  }

  const installation_id = req.nextUrl.searchParams.get("installation_id")

  // No installation_id means user cancelled or came here directly — just send them to dashboard
  if (!installation_id) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Fetch the repos tied to this installation using the user's OAuth token
  const res = await fetch(
    `https://api.github.com/user/installations/${installation_id}/repositories?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  )

  if (res.ok) {
    const data = await res.json()
    const repos: any[] = data.repositories || []

    if (repos.length > 0) {
      await supabase.from("repo_settings").upsert(
        repos.map((r) => ({
          repo_full_name: r.full_name,
          enabled: true,
          review_mode: "junior",
          confidence_threshold: 70,
        })),
        { onConflict: "repo_full_name" }
      )
    }
  }

  return NextResponse.redirect(new URL("/dashboard", req.url))
}
