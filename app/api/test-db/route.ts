import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log("Test DB API called");
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
    }
    
    console.log("Creating Supabase client with URL:", supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test query - directly query the Account Executives table
    const { data, error } = await supabase
      .from("Account Executives")
      .select("*")
      .limit(10);
    
    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Test query successful, data:", data);
    
    return NextResponse.json({
      message: "Test successful",
      data: data,
      count: data?.length || 0
    });
  } catch (error) {
    console.error("Test DB error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
} 