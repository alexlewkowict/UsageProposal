import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')

  console.log('API Route - Starting request for owner:', owner)

  try {
    // Test connection with a simple query
    const { data: testData, error: testError } = await supabase
      .from('Salesforce Data')
      .select('opportunity_owner')
      .limit(1)

    if (testError) {
      console.error('Connection test error:', testError)
      throw new Error(`Connection test failed: ${testError.message}`)
    }

    console.log('Connection test successful, found test record:', testData)

    // Get opportunities for the specific owner
    const { data, error } = await supabase
      .from('Salesforce Data')
      .select(`
        opportunity_name,
        opportunity_owner,
        stage,
        account_name
      `)
      .eq('opportunity_owner', owner)
      .neq('stage', 'Closed Won')
      .neq('stage', 'Closed Lost')

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    console.log('Query results:', {
      owner,
      recordsFound: data?.length || 0,
      sampleRecord: data?.[0]
    })

    if (!data || data.length === 0) {
      console.log('No opportunities found for owner:', owner)
      console.log('Query parameters:', { owner })
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Route Error:', error)
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred while fetching opportunities'
    
    return new Response(JSON.stringify({ 
      error: 'Error fetching opportunities',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

