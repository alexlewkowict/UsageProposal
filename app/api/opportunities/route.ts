import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("API route called: /api/opportunities")

  const { searchParams } = new URL(request.url)
  const accountExecutive = searchParams.get("accountExecutive")

  if (!accountExecutive) {
    return NextResponse.json({ error: "Account Executive is required" }, { status: 400 })
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Initializing Supabase client")
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    console.log(`Querying Supabase for opportunities for ${accountExecutive}`)
    const { data, error } = await supabase
      .from("Salesforce Data")
      .select("opportunity_name, stage")
      .eq("opportunity_owner", accountExecutive)
      .not("stage", "ilike", "%Closed%")

    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned from Supabase")
      return NextResponse.json({ error: "No data returned from database" }, { status: 500 })
    }

    console.log(`Retrieved ${data.length} opportunities`)
    console.log("Sample data:", JSON.stringify(data.slice(0, 5), null, 2))

    const opportunities = data.map((item) => item.opportunity_name)

    console.log(`Returning ${opportunities.length} opportunities`)
    return NextResponse.json(opportunities)
  } catch (error) {
    console.error("Unexpected error:", error instanceof Error ? error.stack : JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

