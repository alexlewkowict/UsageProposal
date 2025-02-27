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

const STEPS = ["Business Info", "Payment Details", "Fees", "Proposal Options", "Implementation", "Review"]

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
      frequency: "weekly",
      pallets: { value: 1500 },
      cases: { value: 1500 },
      eaches: { value: 600 },
    },
    saasFeeDiscount: 20,
    storeConnections: 10,
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
  })
  const [invalidFields, setInvalidFields] = useState<string[]>([])

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

  const validateStep = () => {
    const invalidFields: string[] = []
    switch (currentStep) {
      case 0:
        if (!formData.accountExec) invalidFields.push("accountExec")
        if (!formData.opportunityName) invalidFields.push("opportunityName")
        if (!formData.friendlyBusinessName) invalidFields.push("friendlyBusinessName")
        break
      case 1:
        if (!formData.term) invalidFields.push("term")
        if (!formData.paymentTerms) invalidFields.push("paymentTerms")
        if (!formData.paymentType) invalidFields.push("paymentType")
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
              invalidFields={invalidFields}
            />
          )}
          {currentStep === 3 && (
            <ProposalOptionsSection
              selectedOptions={formData.selectedOptions}
              handleOptionSelect={handleOptionSelect}
              invalidFields={invalidFields}
            />
          )}
          {currentStep === 4 && (
            <ImplementationSection
              formData={formData}
              handleInputChange={handleInputChange}
              invalidFields={invalidFields}
            />
          )}
          {currentStep === 5 && <ReviewSection formData={formData} />}

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
              <Button type="submit" className="ml-auto">
                Generate Proposal
              </Button>
            )}
          </div>
        </form>
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

