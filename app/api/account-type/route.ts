import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const opportunity = searchParams.get('opportunity');
  
  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity name is required' }, { status: 400 });
  }
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query Supabase for the account type based on opportunity name
    const { data, error } = await supabase
      .from('salesforce_data')
      .select('account_type')
      .eq('opportunity_name', opportunity)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ accountType: data?.account_type || '' });
  } catch (error) {
    console.error('Error fetching account type:', error);
    return NextResponse.json({ error: 'Failed to fetch account type' }, { status: 500 });
  }
} 