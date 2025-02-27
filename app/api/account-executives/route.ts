import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  console.log("API route called: /api/account-executives")

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Initializing Supabase client")
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    console.log("Querying Supabase for 'full_name' column from 'Account Executives' table")
    const { data, error } = await supabase.from("Account Executives").select("full_name")

    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned from Supabase")
      return NextResponse.json({ error: "No data returned from database" }, { status: 500 })
    }

    console.log(`Retrieved ${data.length} records`)
    console.log("Sample data:", JSON.stringify(data.slice(0, 5), null, 2))

    const accountExecutives = data
      .map((item) => item.full_name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))

    console.log(`Returning ${accountExecutives.length} unique account executives`)
    return NextResponse.json(accountExecutives)
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

