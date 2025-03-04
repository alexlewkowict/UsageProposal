import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log('Fetching variable mappings from Supabase');
    
    // Check if Supabase client is properly initialized
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key is missing');
      return NextResponse.json({ 
        error: 'Supabase configuration is missing',
        supabaseUrlExists: !!supabaseUrl,
        supabaseKeyExists: !!supabaseKey
      }, { status: 500 });
    }
    
    const { data, error } = await supabase
      .from('variable_mapping')
      .select('variable_name, code_element, template_name');
      
    if (error) {
      console.error('Error fetching variable mappings:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch variable mappings: ' + error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} variable mappings`);
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Unexpected error in GET /api/variable-mappings:', err);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const mappings = await request.json();
    
    // If it's a single mapping, wrap it in an array
    const mappingsArray = Array.isArray(mappings) ? mappings : [mappings];
    
    console.log('Received mappings:', mappingsArray.length);
    
    // Check if Supabase client is properly initialized
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key is missing');
      return NextResponse.json({ 
        error: 'Supabase configuration is missing',
        supabaseUrlExists: !!supabaseUrl,
        supabaseKeyExists: !!supabaseKey
      }, { status: 500 });
    }
    
    // Process each mapping individually to preserve template_name
    const results = [];
    const errors = [];
    
    for (const mapping of mappingsArray) {
      // Check if this variable already exists
      const { data: existingData, error: findError } = await supabase
        .from('variable_mapping')
        .select('template_name')
        .eq('variable_name', mapping.variable_name)
        .maybeSingle();
      
      if (findError) {
        console.error('Error checking for existing variable:', findError);
        errors.push(findError);
        continue;
      }
      
      if (existingData) {
        // Update existing record, preserving template_name
        const { data, error } = await supabase
          .from('variable_mapping')
          .update({ 
            code_element: mapping.code_element,
            // Keep the existing template_name
          })
          .eq('variable_name', mapping.variable_name);
        
        if (error) {
          console.error('Error updating variable mapping:', error);
          errors.push(error);
        } else {
          results.push({ 
            variable_name: mapping.variable_name, 
            code_element: mapping.code_element,
            template_name: existingData.template_name,
            updated: true 
          });
        }
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('variable_mapping')
          .insert([{
            variable_name: mapping.variable_name,
            code_element: mapping.code_element,
            template_name: mapping.template_name || null
          }]);
        
        if (error) {
          console.error('Error inserting variable mapping:', error);
          errors.push(error);
        } else {
          results.push({ 
            variable_name: mapping.variable_name, 
            code_element: mapping.code_element,
            template_name: mapping.template_name,
            inserted: true 
          });
        }
      }
    }
    
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: `Failed to save some variable mappings: ${errors.length} errors occurred`,
        details: errors,
        partialResults: results
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      message: `Successfully saved ${results.length} variable mappings`
    });
  } catch (err) {
    console.error('Unexpected error in POST /api/variable-mappings:', err);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
} 