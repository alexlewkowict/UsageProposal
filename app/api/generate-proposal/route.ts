import { NextRequest, NextResponse } from 'next/server';
import { ProposalService } from '@/app/services/proposalService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    
    // Validate the form data
    if (!formData) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }
    
    // Generate the proposal
    const proposalService = new ProposalService();
    const pdfUrl = await proposalService.generateProposal(formData);
    
    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error('Error generating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
} 