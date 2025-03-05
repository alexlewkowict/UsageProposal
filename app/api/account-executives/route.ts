import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Add cache control headers to prevent caching
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  console.log("API route called: /api/account-executives")

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

    console.log("Supabase URL:", process.env.SUPABASE_URL)
    console.log("Connecting to Supabase...")
    
    // Test the connection first
    const { data: testData, error: testError } = await supabase.from("Account Executives").select("count")
    
    if (testError) {
      console.error("Supabase connection test failed:", JSON.stringify(testError, null, 2))
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }
    
    console.log("Supabase connection successful, count:", testData)
    console.log("Querying Supabase for Account Executives table")
    
    // Query Supabase for account executives
    const { data, error } = await supabase
      .from("Account Executives")
      .select("*")
      .order("full_name")
    
    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log("No account executives found in database")
      return NextResponse.json({ error: "No account executives found" }, { status: 404 })
    }

    console.log(`Retrieved ${data.length} account executives`)
    console.log("Raw data from Supabase:", JSON.stringify(data, null, 2))

    // Enhance each account executive with derived properties
    let enhancedData = data.map(ae => ({
      ...ae,
      initials: getInitials(ae.full_name),
      color: getColorForName(ae.full_name)
    }))

    // Check for duplicate IDs
    const idCounts = {};
    enhancedData.forEach(ae => {
      idCounts[ae.id] = (idCounts[ae.id] || 0) + 1;
    });

    const duplicateIds = Object.entries(idCounts)
      .filter(([id, count]) => count > 1)
      .map(([id]) => id);

    if (duplicateIds.length > 0) {
      console.log("Warning: Duplicate IDs found:", duplicateIds);
      
      // Fix duplicate IDs by assigning new unique IDs
      const seenIds = new Set();
      enhancedData = enhancedData.map(ae => {
        if (seenIds.has(ae.id)) {
          // Assign a new unique ID
          const newId = Math.max(...enhancedData.map(e => e.id)) + 1000 + Math.floor(Math.random() * 1000);
          console.log(`Reassigning ID for ${ae.full_name} from ${ae.id} to ${newId}`);
          return { ...ae, id: newId };
        }
        seenIds.add(ae.id);
        return ae;
      });
    }

    console.log(`Returning ${enhancedData.length} account executives`);
    console.log("Final enhanced data being returned:", JSON.stringify(enhancedData, null, 2));
    
    // Return with no-cache headers
    return NextResponse.json(enhancedData, { headers })
  } catch (error) {
    console.error("Unexpected error:", error instanceof Error ? error.stack : JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers }
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

console.log("Supabase client created with URL:", supabase.supabaseUrl);

