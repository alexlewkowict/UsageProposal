import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the account executive from the URL query parameters
    const url = new URL(request.url);
    const accountExec = url.searchParams.get('accountExec');
    
    console.log("API route called: /api/opportunities");
    console.log("Account Executive:", accountExec);
    
    if (!accountExec) {
      return NextResponse.json({ error: 'Account executive is required' }, { status: 400 });
    }
    
    // Generate mock opportunities for the selected account executive
    const mockOpportunities = [
      `${accountExec} - Acme Corp`,
      `${accountExec} - Globex Corporation`,
      `${accountExec} - Initech`,
      `${accountExec} - Umbrella Corporation`,
      `${accountExec} - Stark Industries`,
    ];
    
    console.log(`Returning ${mockOpportunities.length} mock opportunities`);
    
    return NextResponse.json({ 
      opportunities: mockOpportunities,
      isMock: true
    });
    
  } catch (error) {
    console.error('Error in opportunities API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

