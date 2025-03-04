import { NextResponse } from 'next/server'

// In a real application, you would store this in a database
let variableMappings: any[] = []

export async function GET() {
  return NextResponse.json(variableMappings)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    variableMappings = data
    return NextResponse.json({ success: true, message: 'Variable mappings saved successfully' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to save variable mappings' },
      { status: 500 }
    )
  }
} 