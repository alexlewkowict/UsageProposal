import { NextResponse } from 'next/server'

// In a real application, this would scan your codebase or database
// For now, we'll use a static list of code elements from your project
export async function GET() {
  const codeElements = [
    {
      path: "formData",
      elements: [
        "opportunityName",
        "friendlyBusinessName",
        "accountExec",
        "contractTerm",
        "paymentTerms",
        "paymentType",
        "billingFrequency",
        "paymentMethods",
        "storeConnections",
        "storeConnectionPrice",
        "freeStoreConnections",
        "applyDiscountToStoreConnections",
        "implementationPackage",
        "onboardingFee",
        "virtualTrainingHours",
        "onsiteSupportDays",
        "onsiteSupportFee",
        "optionalProfServicesRate"
      ]
    },
    {
      path: "formData.saasFee",
      elements: [
        "frequency",
        "pallets.value",
        "cases.value",
        "eaches.value"
      ]
    },
    {
      path: "formData.selectedOptions",
      elements: [
        "cover",
        "whatsAUnit",
        "flexibleGrowth",
        "pickAndReceiveToLight",
        "packToLight",
        "attainableAutomationPricing"
      ]
    },
    {
      path: "formData.spsIntegration",
      elements: [
        "enabled",
        "setupFee",
        "retailerSetupFee",
        "retailerCount"
      ]
    },
    {
      path: "formData.crstlIntegration",
      elements: [
        "enabled",
        "setupFee",
        "supportFee",
        "retailerCount"
      ]
    },
    {
      path: "calculations",
      elements: [
        "calculateAnnualSaasFee",
        "calculateStoreConnectionsCost",
        "calculateIntegrationCosts",
        "calculateImplementationCosts",
        "calculateTotalCosts"
      ]
    }
  ]
  
  return NextResponse.json(codeElements)
} 