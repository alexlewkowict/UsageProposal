"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

const STEPS = [
  "Business Info",
  "Payment Details",
  "SaaS Fee",
  "Integrations",
  "Proposal Options",
  "Implementation",
  "Review"
]

function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default function ProposalForm() {
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
    freeStoreConnections: 0,
    storeConnections: 0,
    storeConnectionPrice: 30,
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
          toQty: 1,
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
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [proposalUrl, setProposalUrl] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaasFeeChange = (type: "pallets" | "cases" | "eaches", value: number) => {
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      saasFee: {
        ...prev.saasFee,
        frequency: frequency,
      },
    }))
  }

  const handleOptionSelect = (option: keyof typeof formData.selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [option]: !prev.selectedOptions[option],
      },
    }))
  }

  const handleStoreConnectionPriceChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      storeConnectionPrice: value,
    }));
  };

  const handleStoreConnectionTiersChange = (tiers: any[]) => {
    setFormData((prev) => ({
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
    const invalidFields: string[] = []
    switch (currentStep) {
      case 0:
        if (!formData.accountExec) invalidFields.push("accountExec")
        if (!formData.opportunityName) invalidFields.push("opportunityName")
        if (!formData.friendlyBusinessName) invalidFields.push("friendlyBusinessName")
        break
      case 1:
        if (!formData.contractTerm) invalidFields.push("contractTerm")
        if (!formData.billingFrequency) invalidFields.push("billingFrequency")
        if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
          invalidFields.push("paymentMethods")
        }
        break
      case 2:
        if (
          formData.saasFee.pallets.value === 0 &&
          formData.saasFee.cases.value === 0 &&
          formData.saasFee.eaches.value === 0
        ) {
          invalidFields.push("saasFee")
        }
        if (!formData.storeConnections) invalidFields.push("storeConnections")
        break
      case 3:
        // All options are optional
        break
      case 4:
        if (!formData.implementationPackage) invalidFields.push("implementationPackage")
        break
    }
    return { isValid: invalidFields.length === 0, invalidFields }
  }

  const handleContinue = () => {
    const { isValid, invalidFields } = validateStep()
    if (isValid) {
      setCurrentStep((prev) => prev + 1)
      setInvalidFields([])
    } else {
      setInvalidFields(invalidFields)
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setInvalidFields([])
  }

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
    } catch (error) {
      console.error('Error generating proposal:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate proposal',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (formData.opportunityName) {
      setFormData((prev) => ({
        ...prev,
        friendlyBusinessName: formData.opportunityName,
      }))
    }
  }, [formData.opportunityName])

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create a Usage Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <ProposalOptionsSection
              selectedOptions={formData.selectedOptions}
              handleOptionSelect={handleOptionSelect}
              invalidFields={invalidFields}
            />
          )}
          {currentStep === 5 && (
            <ImplementationSection
              formData={formData}
              handleInputChange={handleInputChange}
              invalidFields={invalidFields}
            />
          )}
          {currentStep === 6 && <ReviewSection formData={formData} />}

          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button type="button" onClick={handleBack} variant="outline">
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleContinue} className="ml-auto">
                {currentStep === STEPS.length - 2 ? "Review Proposal" : "Continue"}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleGenerateProposal} 
                disabled={isGenerating || !validateStep().isValid}
                className="ml-auto"
              >
                {isGenerating ? 'Generating...' : 'Generate Proposal'}
              </Button>
            )}
          </div>
        </form>

        {proposalUrl && (
          <div className="mt-4">
            <a 
              href={proposalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Generated Proposal
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {STEPS.map((step, index) => (
          <div key={step} className={`text-sm font-medium ${index <= currentStep ? "text-primary" : "text-gray-400"}`}>
            {step}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

