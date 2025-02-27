import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  console.log("API route called: /api/pricing-tiers")

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Initializing Supabase client")
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    console.log("Querying Supabase for pricing tiers")
    const { data, error } = await supabase.from("Pricing Tiers").select("*").order("lower_limit", { ascending: true })

    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned from Supabase")
      return NextResponse.json({ error: "No data returned from database" }, { status: 500 })
    }

    console.log(`Retrieved ${data.length} pricing tiers`)
    console.log("Sample data:", JSON.stringify(data.slice(0, 2), null, 2))

    return NextResponse.json(data)
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

