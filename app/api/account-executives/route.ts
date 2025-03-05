import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  console.log("API route called: /api/account-executives")

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Querying Supabase for Account Executives table")
    const { data, error } = await supabase
      .from("Account Executives")
      .select("*")
      .order("full_name")

    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned from Supabase")
      return NextResponse.json({ error: "No data returned from database" }, { status: 500 })
    }

    console.log(`Retrieved ${data.length} records`)
    console.log("All account executives:", data.map(ae => ae.full_name).join(", "))

    // Enhance each account executive with derived properties
    const enhancedData = data.map(ae => ({
      ...ae,
      initials: getInitials(ae.full_name),
      color: getColorForName(ae.full_name)
    }))

    console.log(`Returning ${enhancedData.length} account executives`)
    return NextResponse.json(enhancedData)
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

// Helper functions
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColorForName(name: string): string {
  const colors = [
    "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-red-200", 
    "bg-yellow-200", "bg-indigo-200", "bg-pink-200", "bg-teal-200"
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

