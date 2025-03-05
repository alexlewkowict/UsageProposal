import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  console.log("API route called: /api/account-executives/by-email");

  try {
    // Get the email from the query string
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    console.log(`Looking up account executive for email: ${email}`);

    // Extract the name part from the email (first.last@shiphero.com)
    const namePart = email.split('@')[0];
    if (!namePart) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Convert first.last to First Last format
    const nameWords = namePart.split('.');
    const formattedName = nameWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log(`Formatted name from email: ${formattedName}`);

    // Get all account executives
    const { data, error } = await supabase
      .from("Account Executives")
      .select("*");

    if (error) {
      console.error("Supabase query error:", JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log("No account executives found");
      return NextResponse.json(null, { status: 404 });
    }

    // Try to find a match by comparing the formatted name with full_name
    console.log("Looking for match with formatted name:", formattedName);
    console.log("Available account executives:", data.map(ae => ae.full_name).join(", "));

    const matchedAE = data.find(ae => 
      ae.full_name.toLowerCase().includes(formattedName.toLowerCase())
    );

    if (!matchedAE) {
      // Try a more flexible match - just the first name
      const firstName = nameWords[0].charAt(0).toUpperCase() + nameWords[0].slice(1);
      console.log("Trying more flexible match with first name:", firstName);
      
      const matchedByFirstName = data.find(ae => 
        ae.full_name.toLowerCase().includes(firstName.toLowerCase())
      );
      
      if (matchedByFirstName) {
        console.log(`Found match by first name: ${matchedByFirstName.full_name}`);
        const enhancedAE = {
          ...matchedByFirstName,
          initials: getInitials(matchedByFirstName.full_name),
          color: getColorForName(matchedByFirstName.full_name)
        };
        return NextResponse.json(enhancedAE);
      }
      
      console.log(`No match found for ${formattedName}`);
      return NextResponse.json(null, { status: 404 });
    }

    // Enhance the account executive with derived properties
    const enhancedAE = {
      ...matchedAE,
      initials: getInitials(matchedAE.full_name),
      color: getColorForName(matchedAE.full_name)
    };

    console.log(`Found match: ${matchedAE.full_name}`);
    return NextResponse.json(enhancedAE);
  } catch (error) {
    console.error("Unexpected error:", error instanceof Error ? error.stack : JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Helper functions
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorForName(name: string): string {
  const colors = [
    "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-red-200", 
    "bg-yellow-200", "bg-indigo-200", "bg-pink-200", "bg-teal-200"
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
} 