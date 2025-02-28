import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { slideTemplates, variableMappings } from '../config/proposalConfig';
import { get } from 'lodash'; // For safely accessing nested properties

// Configure Google API authentication
const auth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive'
  ],
  // Use environment variables for credentials
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export class ProposalService {
  private slides = google.slides({ version: 'v1', auth });
  private drive = google.drive({ version: 'v3', auth });
  
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
   * Create a new Google Slides presentation
   */
  private async createPresentation(title: string): Promise<{ id: string }> {
    const response = await this.slides.presentations.create({
      requestBody: {
        title: `${title} - Proposal`
      }
    });
    
    return { id: response.data.presentationId };
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
   * Copy slides from templates to the new presentation
   */
  private async copySlides(presentationId: string, slideIds: string[]): Promise<void> {
    // For each slide template
    for (const slideId of slideIds) {
      // Extract the presentation ID and slide ID from the combined ID
      const [templatePresentationId, slideObjectId] = slideId.split('_');
      
      // Copy the slide to the new presentation
      await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [
            {
              duplicateObject: {
                objectId: slideObjectId,
                objectIds: {
                  [slideObjectId]: `${slideObjectId}_copy`
                }
              }
            }
          ]
        }
      });
    }
  }
  
  /**
   * Replace variables in the presentation with form data
   */
  private async replaceVariables(presentationId: string, formData: any): Promise<void> {
    // Get the presentation content
    const presentation = await this.slides.presentations.get({
      presentationId
    });
    
    const requests = [];
    
    // For each slide in the presentation
    for (const slide of presentation.data.slides) {
      // For each page element in the slide
      for (const element of slide.pageElements || []) {
        // If the element has text
        if (element.shape && element.shape.text) {
          // For each text run in the shape
          for (const textRun of element.shape.text.textElements || []) {
            if (textRun.textRun && textRun.textRun.content) {
              const content = textRun.textRun.content;
              
              // Check if the content contains any variables
              for (const mapping of variableMappings) {
                if (content.includes(mapping.slideVariable)) {
                  // Get the value from form data
                  let value = get(formData, mapping.formField);
                  
                  // If the field is a function, call it
                  if (typeof formData[mapping.formField] === 'function') {
                    value = formData[mapping.formField]();
                  }
                  
                  // Apply formatter if provided
                  if (mapping.formatter && value !== undefined) {
                    value = mapping.formatter(value);
                  }
                  
                  // Replace the variable with the value
                  const newContent = content.replace(
                    mapping.slideVariable, 
                    value !== undefined ? String(value) : ''
                  );
                  
                  // Add a request to replace the text
                  requests.push({
                    replaceAllText: {
                      containsText: {
                        text: mapping.slideVariable,
                        matchCase: true
                      },
                      replaceText: value !== undefined ? String(value) : ''
                    }
                  });
                }
              }
            }
          }
        }
      }
    }
    
    // Execute all text replacement requests
    if (requests.length > 0) {
      await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests }
      });
    }
  }
  
  /**
   * Export the presentation as a PDF
   */
  private async exportAsPdf(presentationId: string): Promise<string> {
    const response = await this.drive.files.export({
      fileId: presentationId,
      mimeType: 'application/pdf'
    }, {
      responseType: 'arraybuffer'
    });
    
    // Save the PDF to a file or cloud storage
    // This is just a placeholder - you'll need to implement this based on your storage solution
    const pdfUrl = await this.savePdf(response.data as ArrayBuffer, presentationId);
    
    return pdfUrl;
  }
  
  /**
   * Save the PDF to storage and return the URL
   */
  private async savePdf(pdfData: ArrayBuffer, presentationId: string): Promise<string> {
    // Implement your storage solution here (e.g., AWS S3, Google Cloud Storage, etc.)
    // For example, using AWS S3:
    /*
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `proposals/${presentationId}.pdf`,
      Body: Buffer.from(pdfData),
      ContentType: 'application/pdf'
    };
    
    await s3.upload(params).promise();
    
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/proposals/${presentationId}.pdf`;
    */
    
    // Placeholder return
    return `https://example.com/proposals/${presentationId}.pdf`;
  }

  private getMockProposalUrl(formData: any): string {
    // Generate a unique ID for the proposal
    const proposalId = Math.random().toString(36).substring(2, 15);
    
    // In a real implementation, this would be the URL to the generated PDF
    // For now, we'll return a mock URL
    return `https://example.com/proposals/${proposalId}.pdf`;
  }
} 