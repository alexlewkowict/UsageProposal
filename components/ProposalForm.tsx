"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessInfoSection } from "./BusinessInfoSection"
import { PaymentDetailsSection } from "./PaymentDetailsSection"
import { FeesSection } from "./FeesSection"
import { ProposalOptionsSection } from "./ProposalOptionsSection"
import { ImplementationSection } from "./ImplementationSection"
import { ReviewSection } from "./ReviewSection"
import { toast } from "@/components/ui/use-toast"
import { IntegrationsSection } from "./IntegrationsSection"
import { ProposalSummary } from "./ProposalSummary"
import { formatNumber } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { AttainableAutomationSection } from "./AttainableAutomationSection"
import { 
  Building, 
  CreditCard, 
  Package, 
  Network, 
  Zap, 
  ListChecks, 
  Wrench, 
  FileCheck 
} from "lucide-react"
import { ProposalHeader } from "./ProposalHeader"
import { useSession } from "next-auth/react"

const STEPS = [
  "Business Info",
  "Payment Details",
  "SaaS Fee",
  "Integrations",
  "Automation",
  "Proposal Options",
  "Implementation",
  "Review"
]

function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default function ProposalForm() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    accountExec: "",
    opportunityName: "",
    friendlyBusinessName: "",
    term: "",
    paymentTerms: "",
    paymentType: "",
    saasFee: {
      frequency: "annually",
      pallets: { value: 0 },
      cases: { value: 0 },
      eaches: { value: 150000 },
    },
    saasFeeDiscount: 20,
    applyDiscountToStoreConnections: true,
    applyDiscountToIntegrations: true,
    freeStoreConnections: 0,
    storeConnections: 5,
    storeConnectionPrice: 30,
    storeConnectionsCost: 0,
    storeConnectionTiers: [
      {
        id: generateId(),
        name: "Included",
        fromQty: 0,
        toQty: 5,
        pricePerStore: 0,
      },
      {
        id: generateId(),
        name: "Additional Stores",
        fromQty: 6,
        toQty: 50,
        pricePerStore: 30,
      },
      {
        id: generateId(),
        name: "Discount Tier 1",
        fromQty: 51,
        toQty: 100,
        pricePerStore: 25,
      },
      {
        id: generateId(),
        name: "Discount Tier 2",
        fromQty: 101,
        toQty: Number.MAX_SAFE_INTEGER,
        pricePerStore: 20,
      },
    ],
    selectedOptions: {
      cover: true,
      whatsAUnit: true,
      flexibleGrowth: true,
      pickAndReceiveToLight: false,
      packToLight: false,
      attainableAutomationPricing: false,
    },
    implementationPackage: "",
    onboardingFee: "",
    virtualTrainingHours: "",
    onsiteSupportDays: "",
    onsiteSupportFee: "",
    optionalProfServicesRate: "",
    contractTerm: "24",
    billingFrequency: "quarterly",
    paymentMethods: ["creditCard"],
    spsIntegration: {
      enabled: false,
      setupFee: 500,
      retailerSetupFee: 500,
      retailerCount: 0,
      supportTiers: [
        {
          name: "Standard",
          fromQty: 1,
          toQty: 5,
          pricePerRetailer: 0
        },
        {
          name: "Discounted 1",
          fromQty: 6,
          toQty: 25,
          pricePerRetailer: 150
        },
        {
          name: "Discounted 2",
          fromQty: 26,
          toQty: 50,
          pricePerRetailer: 135
        },
        {
          name: "Discounted 3",
          fromQty: 51,
          toQty: Number.MAX_SAFE_INTEGER,
          pricePerRetailer: 120
        }
      ]
    },
    crstlIntegration: {
      enabled: false,
      setupFee: 250,
      supportFee: 105,
      retailerCount: 0
    },
    attainableAutomation: {
      pickToLight: {
        enabled: false,
        connections: 0,
        tiers: [
          {
            id: generateId(),
            name: "Standard Tier",
            fromQty: 1,
            toQty: 5,
            pricePerConnection: 250
          },
          {
            id: generateId(),
            name: "Discount Tier 1",
            fromQty: 6,
            toQty: 10,
            pricePerConnection: 225
          },
          {
            id: generateId(),
            name: "Discount Tier 2",
            fromQty: 11,
            toQty: 15,
            pricePerConnection: 200
          },
          {
            id: generateId(),
            name: "Discount Tier 3",
            fromQty: 16,
            toQty: Number.MAX_SAFE_INTEGER,
            pricePerConnection: 175
          }
        ]
      },
      packToLight: {
        enabled: false,
        connections: 0,
        tiers: [
          {
            id: generateId(),
            name: "Standard Tier",
            fromQty: 1,
            toQty: 5,
            pricePerConnection: 250
          },
          {
            id: generateId(),
            name: "Discount Tier 1",
            fromQty: 6,
            toQty: 10,
            pricePerConnection: 225
          },
          {
            id: generateId(),
            name: "Discount Tier 2",
            fromQty: 11,
            toQty: 15,
            pricePerConnection: 200
          },
          {
            id: generateId(),
            name: "Discount Tier 3",
            fromQty: 16,
            toQty: Number.MAX_SAFE_INTEGER,
            pricePerConnection: 175
          }
        ]
      },
      remoteOnboardingFee: 1000,
      onsiteSupportDays: 0
    },
    applyDiscountToAutomation: true,
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposalUrl, setProposalUrl] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isReviewExpanded, setIsReviewExpanded] = useState(false)
  const [highestStepReached, setHighestStepReached] = useState(0)

  const handleInputChange = (field: string, value: string | number | boolean) => {
    console.log(`Updating ${field} to:`, value);
    
    // Use a function to update state to ensure we're working with the latest state
    setFormData((prev) => {
      // First, check if the value is already the same to prevent unnecessary updates
      if (field.includes(".")) {
        // For nested fields, check the current value
        const parts = field.split('.');
        let current = prev;
        
        // Navigate to the nested object
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) return prev; // Return previous state if path doesn't exist
          current = current[parts[i]];
        }
        
        // If the value is already the same, return the previous state unchanged
        if (current[parts[parts.length - 1]] === value) {
          return prev;
        }
      } else {
        // For non-nested fields, check if the value is already the same
        if (prev[field] === value) {
          return prev;
        }
      }
      
      // If we get here, the value is different and we should update it
      // Create a deep copy of the previous state to avoid mutation issues
      const newState = JSON.parse(JSON.stringify(prev));
      
      // Handle nested fields
      if (field.includes(".")) {
        const parts = field.split('.');
        let current = newState;
        
        // Navigate to the nested object, creating the path if needed
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (current[part] === undefined) {
            current[part] = {};
          }
          current = current[part];
        }
        
        // Set the value at the final property
        current[parts[parts.length - 1]] = value;
      } else {
        // For non-nested fields, simply update the field directly
        newState[field] = value;
      }
      
      return newState;
    });
  };

  const handleSaasFeeChange = (type: "pallets" | "cases" | "eaches", value: number) => {
    setFormData((prev: any) => ({
      ...prev,
      saasFee: {
        ...prev.saasFee,
        [type]: {
          ...prev.saasFee[type],
          value: value,
        },
      },
    }))
  }

  const handleFrequencyChange = (frequency: string) => {
    setFormData((prev: any) => ({
      ...prev,
      saasFee: {
        ...prev.saasFee,
        frequency: frequency,
      },
    }))
  }

  const handleOptionSelect = (option: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [option]: value,
      },
    }));
  };

  const handleStoreConnectionPriceChange = (value: number) => {
    setFormData((prev: any) => ({
      ...prev,
      storeConnectionPrice: value,
    }));
  };

  const handleStoreConnectionTiersChange = (tiers: any[]) => {
    setFormData((prev: any) => ({
      ...prev,
      storeConnectionTiers: tiers,
    }))
  }

  const handleSpsRetailerCountChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/,/g, ""), 10);
    handleInputChange("spsIntegration.retailerCount", isNaN(parsedValue) ? 0 : parsedValue);
  };

  const handleCrstlRetailerCountChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/,/g, ""), 10);
    handleInputChange("crstlIntegration.retailerCount", isNaN(parsedValue) ? 0 : parsedValue);
  };

  const validateStep = () => {
    let isValid = true;
    const newInvalidFields: string[] = [];

    // Validation for each step
    switch (currentStep) {
      case 0:
        if (!formData.accountExec) newInvalidFields.push("accountExec")
        if (!formData.opportunityName) newInvalidFields.push("opportunityName")
        if (!formData.friendlyBusinessName) newInvalidFields.push("friendlyBusinessName")
        break
      case 1:
        if (!formData.contractTerm) newInvalidFields.push("contractTerm")
        if (!formData.billingFrequency) newInvalidFields.push("billingFrequency")
        if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
          newInvalidFields.push("paymentMethods")
        }
        break
      case 2:
        if (
          formData.saasFee.pallets.value === 0 &&
          formData.saasFee.cases.value === 0 &&
          formData.saasFee.eaches.value === 0
        ) {
          newInvalidFields.push("saasFee")
        }
        if (!formData.storeConnections) newInvalidFields.push("storeConnections")
        break
      case 3:
        // No validation required for this step
        break
      case 4:
        // All options are optional
        break
      case 5:
        // This step doesn't require validation, so it should always be valid
        isValid = true;
        break
      case 6:
        if (!formData.implementationPackage) newInvalidFields.push("implementationPackage")
        break
    }
    
    setInvalidFields(newInvalidFields);
    return { isValid, invalidFields: newInvalidFields };
  }

  const handleContinue = () => {
    if (validateStep()) {
      // Update the highest step reached if moving to a new step
      if (currentStep + 1 > highestStepReached) {
        setHighestStepReached(currentStep + 1);
      }
      setCurrentStep((prev) => prev + 1);
      setInvalidFields([]);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev: number) => prev - 1)
    setInvalidFields([])
  }

  const handleBackFromReview = () => {
    setIsReviewExpanded(false);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Proposal generated", formData)
    // Here you would typically send the data to your backend or perform any final actions
  }

  const handleGenerateProposal = async () => {
    try {
      setIsGenerating(true)
      
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate proposal')
      }
      
      const data = await response.json()
      setProposalUrl(data.pdfUrl)
      
      toast({
        title: 'Proposal Generated',
        description: 'Your proposal has been successfully generated.',
      })
    } catch (error: unknown) {
      console.error('Error generating proposal:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate proposal',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExpand = useCallback((sectionId: string) => {
    if (!sectionId) return; // Guard against undefined values
    
    setExpandedSections((prev: any) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const handleStepClick = (step: number) => {
    // Only allow navigation to steps that have been reached before
    if (step <= highestStepReached) {
      setCurrentStep(step);
    }
  };

  useEffect(() => {
    if (formData.opportunityName && formData.opportunityName.trim() !== '') {
      setFormData((prev) => ({
        ...prev,
        friendlyBusinessName: formData.opportunityName,
      }));
    }
  }, [formData.opportunityName]);

  useEffect(() => {
    if (session?.user?.email?.toLowerCase().includes('alex') || 
        session?.user?.name?.toLowerCase().includes('alex lewkowict')) {
      console.log("Setting account exec to Alex Lewkowict directly");
      handleInputChange("accountExec", "Alex Lewkowict");
    }
  }, [session]);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        {/* Add the ProposalHero branded header */}
        <ProposalHeader />
        
        <div className="flex flex-col lg:flex-row gap-3 mt-3">
          {/* Left column - Form or expanded Summary */}
          <Card className="w-full lg:w-[65%] p-3">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-2xl font-bold">
                {STEPS[currentStep]}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="mb-6">
                <ProgressBar 
                  currentStep={currentStep} 
                  totalSteps={STEPS.length} 
                  onStepClick={handleStepClick}
                  highestStepReached={highestStepReached}
                />
              </div>

              {currentStep === STEPS.length - 1 ? (
                // Review step - show the expanded summary
                <div className="space-y-6">
                  <ProposalSummary 
                    formData={formData} 
                    currentStep={currentStep} 
                    isExpanded={true} 
                    onEdit={() => {
                      setCurrentStep(STEPS.length - 2); // Go back to the Implementation step
                    }}
                  />
                  
                  {/* Add a more prominent button container with a border and padding */}
                  <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 mt-8">
                    <Button type="button" onClick={handleBackFromReview} variant="outline">
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        setIsReviewExpanded(false);
                        setCurrentStep(STEPS.length - 2); // Go back to the Implementation step
                      }}
                      variant="default" // Use the primary button style
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      Continue Editing
                    </Button>
                  </div>
                </div>
              ) : (
                // Regular form steps
                <>
                  {currentStep === 0 && (
                    <BusinessInfoSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 1 && (
                    <PaymentDetailsSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 2 && (
                    <FeesSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSaasFeeChange={handleSaasFeeChange}
                      handleFrequencyChange={handleFrequencyChange}
                      handleStoreConnectionPriceChange={handleStoreConnectionPriceChange}
                      handleStoreConnectionTiersChange={handleStoreConnectionTiersChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 3 && (
                    <IntegrationsSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSpsRetailerCountChange={handleSpsRetailerCountChange}
                      handleCrstlRetailerCountChange={handleCrstlRetailerCountChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 4 && (
                    <AttainableAutomationSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 5 && (
                    <ProposalOptionsSection
                      selectedOptions={formData.selectedOptions}
                      handleOptionSelect={handleOptionSelect}
                      invalidFields={invalidFields}
                      formData={formData}
                    />
                  )}
                  {currentStep === 6 && (
                    <ImplementationSection
                      formData={formData}
                      handleInputChange={handleInputChange}
                      invalidFields={invalidFields}
                    />
                  )}
                  {currentStep === 7 && (
                    <ReviewSection 
                      formData={formData} 
                      onContinueEditing={() => {
                        setCurrentStep(STEPS.length - 2); // Go back to the Implementation step
                      }}
                      onBack={handleBack}
                    />
                  )}

                  {/* Add the navigation buttons */}
                  <div className="flex justify-between mt-8">
                    {currentStep > 0 ? (
                      <Button 
                        type="button" 
                        onClick={handleBack} 
                        variant="outline" 
                        className="px-6"
                      >
                        Back
                      </Button>
                    ) : (
                      <div></div> // Empty div to maintain the space-between layout
                    )}
                    
                    <Button 
                      type="button" 
                      onClick={handleContinue} 
                      className="bg-gray-800 hover:bg-gray-900 text-white px-6"
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right column - Summary or Generate button */}
          <div className="w-full lg:w-[35%] sticky top-3 self-start">
            {currentStep === STEPS.length - 1 ? (
              // Generate Proposal button card
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Ready to Generate?</h3>
                    <p className="text-gray-600 text-center">
                      Review your proposal details on the left, then click the button below to generate your proposal.
                    </p>
                    <Button 
                      onClick={handleGenerateProposal} 
                      disabled={isGenerating}
                      className="w-full py-6 text-lg"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Proposal'}
                    </Button>
                    
                    {proposalUrl && (
                      <div className="mt-4 text-center">
                        <a 
                          href={proposalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-lg"
                        >
                          View Generated Proposal
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Regular summary
              <ProposalSummary formData={formData} currentStep={currentStep} isExpanded={false} />
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function ProgressBar({ 
  currentStep, 
  totalSteps, 
  onStepClick, 
  highestStepReached 
}: { 
  currentStep: number; 
  totalSteps: number; 
  onStepClick: (step: number) => void;
  highestStepReached: number;
}) {
  // Define icons for each step
  const stepIcons = [
    <Building key="business" size={18} />,
    <CreditCard key="payment" size={18} />,
    <Package key="saas" size={18} />,
    <Network key="integrations" size={18} />,
    <Zap key="automation" size={18} />,
    <ListChecks key="options" size={18} />,
    <Wrench key="implementation" size={18} />,
    <FileCheck key="review" size={18} />
  ];

  return (
    <div className="w-full mb-8">
      {/* Step indicators with icons */}
      <div className="flex justify-between mb-2 relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
        <div 
          className="absolute top-4 left-0 h-1 bg-primary transition-all duration-300 ease-in-out -z-10"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= highestStepReached && index !== currentStep;
          
          return (
            <div 
              key={step} 
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable ? onStepClick(index) : null}
            >
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${isCurrent ? 'bg-primary text-white' : 
                    isCompleted ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-400'}
                  ${isClickable ? 'hover:bg-primary/30' : ''}
                  transition-all duration-200
                `}
              >
                {stepIcons[index]}
              </div>
              <span 
                className={`
                  text-xs font-medium text-center
                  ${isCurrent ? 'text-primary' : 
                    isCompleted ? 'text-primary/80' : 'text-gray-400'}
                `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

