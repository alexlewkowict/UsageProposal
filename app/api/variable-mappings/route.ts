import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('variable_mapping')
      .select('*')
      .order('id');
      
    if (error) {
      console.error('Error fetching variable mappings:', error);
      return NextResponse.json({ error: 'Failed to fetch variable mappings' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const mappings = await request.json();
    
    // If it's a single mapping, wrap it in an array
    const mappingsArray = Array.isArray(mappings) ? mappings : [mappings];
    
    // Process each mapping to ensure it has the required fields
    const processedMappings = mappingsArray.map(mapping => ({
      variable_name: mapping.variable_name,
      code_element: mapping.code_element,
      // Preserve template_name if it exists in the database
      // This will be handled by the onConflict option
    }));
    
    // For each mapping, upsert it (update if exists, insert if not)
    const { data, error } = await supabase
      .from('variable_mapping')
      .upsert(processedMappings, { 
        onConflict: 'variable_name',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error saving variable mappings:', error);
      return NextResponse.json({ error: 'Failed to save variable mappings: ' + error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: `Successfully saved ${processedMappings.length} variable mappings`
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 