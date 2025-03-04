import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Get the account executive name from the URL query parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    
    console.log(`Fetching role for account executive: ${name}`);
    
    if (!name) {
      return NextResponse.json({ error: 'Account executive name is required' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, let's check if the table exists and list its columns
    console.log("Checking table structure...");
    const { data: tableInfo, error: tableError } = await supabase
      .from('Account Executives')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing Account Executives table:', tableError);
      
      // Try with quotes around the table name
      console.log("Trying with quotes around table name...");
      const { data: quotedTableInfo, error: quotedTableError } = await supabase
        .from('"Account Executives"')
        .select('*')
        .limit(1);
      
      if (quotedTableError) {
        console.error('Error accessing "Account Executives" table with quotes:', quotedTableError);
        return NextResponse.json({ 
          error: 'Table access error',
          details: tableError.message,
          quotedDetails: quotedTableError.message
        }, { status: 500 });
      }
      
      console.log("Table with quotes exists, sample data:", quotedTableInfo);
      console.log("Table columns:", quotedTableInfo && quotedTableInfo[0] ? Object.keys(quotedTableInfo[0]) : "No data");
      
      // Query with quotes around the table name
      const { data, error } = await supabase
        .from('"Account Executives"')
        .select('role')
        .eq('name', name)
        .single();
      
      if (error) {
        console.error('Supabase query error with quoted table name:', error);
        return NextResponse.json({ 
          error: 'Database query error',
          details: error.message
        }, { status: 500 });
      }
      
      console.log("Query result with quoted table name:", data);
      return NextResponse.json({ role: data?.role || null });
    }
    
    console.log("Table exists, sample data:", tableInfo);
    console.log("Table columns:", tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]) : "No data");
    
    // Query the Account Executives table for the role
    const { data, error } = await supabase
      .from('Account Executives')
      .select('role')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        error: 'Database query error',
        details: error.message
      }, { status: 500 });
    }
    
    console.log("Query result:", data);
    return NextResponse.json({ role: data?.role || null });
  } catch (error) {
    console.error('Error in account-executive-role API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 