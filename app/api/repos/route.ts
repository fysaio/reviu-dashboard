import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 })
  }

  const repos = await res.json()

  const repoNames = repos.map((r: any) => r.full_name)
  const { data: settings } = await supabase
    .from("repo_settings")
    .select("*")
    .in("repo_full_name", repoNames)

  const settingsMap = Object.fromEntries(
    (settings || []).map((s: any) => [s.repo_full_name, s])
  )

  const enriched = repos.map((repo: any) => ({
    id: repo.id,
    full_name: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
    owner_id: repo.owner.id,
    private: repo.private,
    language: repo.language,
    updated_at: repo.updated_at,
    description: repo.description,
    settings: settingsMap[repo.full_name] || null,
  }))

  return NextResponse.json({ repos: enriched })
}
