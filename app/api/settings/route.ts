import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const repo = req.nextUrl.searchParams.get("repo")
  if (!repo) return NextResponse.json({ error: "Missing repo" }, { status: 400 })

  const { data } = await supabase
    .from("repo_settings")
    .select("*")
    .eq("repo_full_name", repo)
    .limit(1)

  return NextResponse.json({ settings: data?.[0] || null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { repo_full_name, review_mode, confidence_threshold, enabled } = body

  const { data, error } = await supabase
    .from("repo_settings")
    .upsert({
      repo_full_name,
      review_mode,
      confidence_threshold,
      enabled,
    }, { onConflict: "repo_full_name" })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data?.[0] })
}
