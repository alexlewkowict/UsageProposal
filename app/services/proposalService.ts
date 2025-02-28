import { slideTemplates, variableMappings } from '../config/proposalConfig';

export class ProposalService {
  /**
   * Generate a proposal based on form data
   */
  async generateProposal(formData: any): Promise<string> {
    try {
      console.log('Generating proposal with form data:', formData);
      
      // For now, return a mock URL
      // In production, this would use the Google Slides API
      return this.getMockProposalUrl(formData);
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw new Error('Failed to generate proposal');
    }
  }
  
  /**
   * Get a mock proposal URL for development
   */
  private getMockProposalUrl(formData: any): string {
    // Generate a unique ID for the proposal
    const proposalId = Math.random().toString(36).substring(2, 15);
    const businessName = formData.friendlyBusinessName || 'Business';
    
    // Log which slides would be included
    const slidesToInclude = this.getSlidesToInclude(formData);
    console.log('Slides that would be included:', slidesToInclude);
    
    // Log which variables would be replaced
    console.log('Variables that would be replaced:');
    for (const mapping of variableMappings) {
      let value = this.getNestedValue(formData, mapping.formField);
      if (mapping.formatter && value !== undefined) {
        value = mapping.formatter(value);
      }
      console.log(`  ${mapping.slideVariable} => ${value}`);
    }
    
    // In a real implementation, this would be the URL to the generated PDF
    return `https://example.com/proposals/${businessName.replace(/\s+/g, '-').toLowerCase()}-${proposalId}.pdf`;
  }
  
  /**
   * Determine which slide templates to include based on form data
   */
  private getSlidesToInclude(formData: any): string[] {
    return slideTemplates
      .filter(template => !template.condition || template.condition(formData))
      .map(template => template.id);
  }
  
  /**
   * Get a nested value from an object using a dot-notation path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }
} 