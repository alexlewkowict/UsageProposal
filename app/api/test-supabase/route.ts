import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  console.log("Testing Supabase connection...")
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
    }
    
    console.log("Supabase URL:", supabaseUrl)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from("Account Executives")
      .select("*")
      .limit(1)
    
    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      sample: data
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Connection test failed" }, { status: 500 })
  }
} 