import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's repos from GitHub to scope the query
  const ghRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })

  if (!ghRes.ok) {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 })
  }

  const repos = await ghRes.json()
  const repoNames = repos.map((r: any) => r.full_name)

  if (repoNames.length === 0) {
    return NextResponse.json({ reviews: [] })
  }

  // Fetch reviews for the last 90 days
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("repo_full_name", repoNames)
    .gte("reviewed_at", since.toISOString())
    .order("reviewed_at", { ascending: false })
    .limit(1000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews: data || [] })
}
