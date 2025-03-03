export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  condition?: (formData: any) => boolean; // Optional condition to include this slide
}

export interface VariableMapping {
  formField: string; // Path to the form field (can be nested like "saasFee.frequency")
  slideVariable: string; // The {{variable}} in the slide
  formatter?: (value: any) => string; // Optional formatter function
}

// Slide template IDs
export const slideTemplates: SlideTemplate[] = [
  {
    id: "1Abcd123456_slide1",
    name: "Cover Page",
    description: "Proposal cover page with client name and date",
    // Always include this slide
  },
  {
    id: "1Abcd123456_slide2",
    name: "Business Overview",
    description: "Client business overview",
    // Always include this slide
  },
  {
    id: "1Abcd123456_slide3",
    name: "SaaS Fee Structure",
    description: "SaaS fee breakdown and pricing",
    // Always include this slide
  },
  {
    id: "1Abcd123456_slide4",
    name: "Store Connections",
    description: "Store connections pricing and tiers",
    condition: (formData) => formData.storeConnections > 0,
  },
  {
    id: "1Abcd123456_slide5",
    name: "Implementation Services",
    description: "Implementation services and pricing",
    condition: (formData) => formData.selectedOptions.implementation,
  },
  {
    id: "1Abcd123456_slide6",
    name: "Training Services",
    description: "Training services and pricing",
    condition: (formData) => formData.selectedOptions.training,
  },
  {
    id: "1Abcd123456_slide7",
    name: "Integrations",
    description: "EDI integration options and pricing",
    condition: (formData) => formData.spsIntegration.enabled || formData.crstlIntegration.enabled,
  },
  // Add more slide templates as needed
];

// Format currency values
const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

// Format percentage values
const formatPercentage = (value: number): string => {
  return `${value}%`;
};

// Format date values
const formatDate = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Variable mappings
export const variableMappings: VariableMapping[] = [
  // Business information
  { formField: "businessName", slideVariable: "{{businessName}}" },
  { formField: "opportunityName", slideVariable: "{{opportunityName}}" },
  { formField: "contactName", slideVariable: "{{contactName}}" },
  { formField: "contactEmail", slideVariable: "{{contactEmail}}" },
  { formField: "contactPhone", slideVariable: "{{contactPhone}}" },
  
  // SaaS Fee information
  { formField: "saasFee.frequency", slideVariable: "{{saasFrequency}}", 
    formatter: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
  { formField: "saasFee.pallets.value", slideVariable: "{{palletCount}}" },
  { formField: "saasFee.cases.value", slideVariable: "{{caseCount}}" },
  { formField: "saasFee.eaches.value", slideVariable: "{{eachesCount}}" },
  
  // Calculated values
  { 
    formField: "annualGrandTotal", 
    slideVariable: "{{annualUnitTotal}}",
    formatter: (value) => value.toLocaleString('en-US')
  },
  { 
    formField: "calculateAnnualFee", 
    slideVariable: "{{annualFee}}",
    formatter: formatCurrency
  },
  
  // Discount information
  { formField: "saasFeeDiscount", slideVariable: "{{discountPercentage}}", formatter: formatPercentage },
  
  // Store connections
  { formField: "storeConnections", slideVariable: "{{storeConnectionsCount}}" },
  { 
    formField: "calculateStoreConnectionsCost", 
    slideVariable: "{{storeConnectionsCost}}",
    formatter: formatCurrency
  },
  
  // Implementation and training
  { 
    formField: "implementationCost", 
    slideVariable: "{{implementationCost}}",
    formatter: formatCurrency
  },
  { 
    formField: "trainingCost", 
    slideVariable: "{{trainingCost}}",
    formatter: formatCurrency
  },
  
  // Payment details
  { formField: "paymentTerms", slideVariable: "{{paymentTerms}}" },
  { formField: "contractLength", slideVariable: "{{contractLength}}" },
  
  // Dates
  { formField: "proposalDate", slideVariable: "{{proposalDate}}", formatter: formatDate },
  { formField: "expirationDate", slideVariable: "{{expirationDate}}", formatter: formatDate },
  
  // Add more mappings as needed
  { formField: "spsIntegration.enabled", slideVariable: "{{spsIntegrationEnabled}}" },
  { formField: "spsIntegration.retailerCount", slideVariable: "{{spsRetailerCount}}" },
  { 
    formField: "calculateSpsSetupCost", 
    slideVariable: "{{spsSetupCost}}",
    formatter: formatCurrency
  },
  { 
    formField: "calculateSpsRetailerSupportCost", 
    slideVariable: "{{spsAnnualCost}}",
    formatter: formatCurrency
  },
  { formField: "crstlIntegration.enabled", slideVariable: "{{crstlIntegrationEnabled}}" },
  { formField: "crstlIntegration.retailerCount", slideVariable: "{{crstlRetailerCount}}" },
  { 
    formField: "calculateCrstlSetupCost", 
    slideVariable: "{{crstlSetupCost}}",
    formatter: formatCurrency
  },
  { 
    formField: "calculateCrstlSupportCost", 
    slideVariable: "{{crstlAnnualCost}}",
    formatter: formatCurrency
  },
]; 