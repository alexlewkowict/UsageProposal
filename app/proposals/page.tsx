'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface Proposal {
  id: string;
  businessName: string;
  createdAt: string;
  pdfUrl: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/proposals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      const data = await response.json();
      setProposals(data.proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch proposals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete proposal');
      }
      
      // Remove the deleted proposal from the list
      setProposals(proposals.filter(proposal => proposal.id !== id));
      
      toast({
        title: 'Proposal Deleted',
        description: 'The proposal has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete proposal',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Proposals</h1>
      
      {isLoading ? (
        <div className="text-center py-8">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-8">No proposals found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map(proposal => (
            <Card key={proposal.id}>
              <CardHeader>
                <CardTitle>{proposal.businessName}</CardTitle>
                <div className="text-sm text-gray-500">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <a 
                    href={proposal.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Proposal
                  </a>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteProposal(proposal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 