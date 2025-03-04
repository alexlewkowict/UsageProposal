import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// In a real application, you would store this in a database
let variableMappings: any[] = []

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase
    .from('variable_mapping')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching variable mappings:', error);
    return NextResponse.json({ error: 'Failed to fetch variable mappings' }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const mappings = await request.json();
  
  // If it's a single mapping, wrap it in an array
  const mappingsArray = Array.isArray(mappings) ? mappings : [mappings];
  
  // For each mapping, upsert it (update if exists, insert if not)
  const { data, error } = await supabase
    .from('variable_mapping')
    .upsert(mappingsArray, { 
      onConflict: 'variable_name',
      ignoreDuplicates: false
    });
    
  if (error) {
    console.error('Error saving variable mappings:', error);
    return NextResponse.json({ error: 'Failed to save variable mappings' }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, data });
} 