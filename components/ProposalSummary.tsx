"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

interface ProposalSummaryProps {
  formData: any;
  currentStep: number;
}

export function ProposalSummary({ formData, currentStep }: ProposalSummaryProps) {
  // Calculate SaaS fee
  const calculateAnnualSaasFee = () => {
    const baseUnits = 
      (formData.saasFee.pallets.value || 0) + 
      (formData.saasFee.cases.value || 0) + 
      (formData.saasFee.eaches.value || 0);
    
    // Apply discount
    const discountMultiplier = 1 - (formData.saasFeeDiscount / 100);
    return baseUnits * discountMultiplier;
  };
  
  // Calculate store connections cost
  const calculateStoreConnectionsCost = () => {
    let totalCost = 0;
    const sortedTiers = [...formData.storeConnectionTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    let remainingStores = formData.storeConnections;
    
    for (const tier of sortedTiers) {
      if (remainingStores <= 0) break;
      
      const storesInTier = Math.min(
        remainingStores,
        tier.toQty === Number.MAX_SAFE_INTEGER ? remainingStores : tier.toQty - tier.fromQty + 1
      );
      
      totalCost += storesInTier * tier.pricePerStore;
      remainingStores -= storesInTier;
    }
    
    // Apply discount if enabled
    if (formData.applyDiscountToStoreConnections) {
      const discountMultiplier = 1 - (formData.saasFeeDiscount / 100);
      totalCost *= discountMultiplier;
    }
    
    return totalCost;
  };
  
  // Calculate integration costs
  const calculateIntegrationCosts = () => {
    let setupCost = 0;
    let annualCost = 0;
    
    // SPS Commerce
    if (formData.spsIntegration.enabled) {
      // Setup costs
      setupCost += formData.spsIntegration.setupFee;
      setupCost += formData.spsIntegration.retailerSetupFee * formData.spsIntegration.retailerCount;
      
      // Annual support costs
      let spsAnnualCost = 0;
      const sortedTiers = [...formData.spsIntegration.supportTiers].sort((a, b) => a.fromQty - b.fromQty);
      
      for (let retailerNum = 1; retailerNum <= formData.spsIntegration.retailerCount; retailerNum++) {
        const tier = sortedTiers.find(t => retailerNum >= t.fromQty && retailerNum <= t.toQty);
        if (tier) {
          spsAnnualCost += tier.pricePerRetailer * 4; // Quarterly * 4
        }
      }
      
      annualCost += spsAnnualCost;
    }
    
    // Crstl
    if (formData.crstlIntegration.enabled) {
      // Setup costs
      setupCost += formData.crstlIntegration.setupFee;
      
      // Annual support costs
      annualCost += formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount;
    }
    
    return { setupCost, annualCost };
  };
  
  // Calculate implementation costs
  const calculateImplementationCosts = () => {
    return parseFloat(formData.onboardingFee || 0) + parseFloat(formData.onsiteSupportFee || 0);
  };
  
  // Calculate total costs
  const calculateTotalCosts = () => {
    const saasFee = calculateAnnualSaasFee();
    const storeConnectionsCost = calculateStoreConnectionsCost();
    const integrationCosts = calculateIntegrationCosts();
    const implementationCost = calculateImplementationCosts();
    
    const oneTimeCosts = integrationCosts.setupCost + implementationCost;
    const annualRecurringCosts = saasFee + storeConnectionsCost + integrationCosts.annualCost;
    
    return {
      oneTimeCosts,
      annualRecurringCosts,
      monthlyRecurringCosts: annualRecurringCosts / 12
    };
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };
  
  const totalCosts = calculateTotalCosts();
  const integrationCosts = calculateIntegrationCosts();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Proposal Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Info */}
        {formData.opportunityName && (
          <div>
            <h3 className="font-semibold mb-2">Business</h3>
            <p className="text-sm">{formData.opportunityName}</p>
          </div>
        )}
        
        {/* Contract Terms */}
        {formData.contractTerm && (
          <div>
            <h3 className="font-semibold mb-2">Contract</h3>
            <p className="text-sm">{formData.contractTerm} months, billed {formData.billingFrequency}</p>
          </div>
        )}
        
        {/* SaaS Fee */}
        {(formData.saasFee.pallets.value > 0 || 
          formData.saasFee.cases.value > 0 || 
          formData.saasFee.eaches.value > 0) && (
          <div>
            <h3 className="font-semibold mb-2">SaaS Fee</h3>
            <div className="space-y-1 text-sm">
              {formData.saasFee.pallets.value > 0 && (
                <div className="flex justify-between">
                  <span>Pallets:</span>
                  <span>{formatNumber(formData.saasFee.pallets.value)}</span>
                </div>
              )}
              {formData.saasFee.cases.value > 0 && (
                <div className="flex justify-between">
                  <span>Cases:</span>
                  <span>{formatNumber(formData.saasFee.cases.value)}</span>
                </div>
              )}
              {formData.saasFee.eaches.value > 0 && (
                <div className="flex justify-between">
                  <span>Eaches:</span>
                  <span>{formatNumber(formData.saasFee.eaches.value)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>{formData.saasFeeDiscount}%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Annual SaaS Fee:</span>
                <span>{formatCurrency(calculateAnnualSaasFee())}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Store Connections */}
        {formData.storeConnections > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Store Connections</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Stores:</span>
                <span>{formData.storeConnections}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Annual Cost:</span>
                <span>{formatCurrency(calculateStoreConnectionsCost())}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Integrations */}
        {(formData.spsIntegration.enabled || formData.crstlIntegration.enabled) && (
          <div>
            <h3 className="font-semibold mb-2">Integrations</h3>
            <div className="space-y-1 text-sm">
              {formData.spsIntegration.enabled && (
                <div className="ml-2">
                  <p>SPS Commerce ({formData.spsIntegration.retailerCount} retailers)</p>
                </div>
              )}
              {formData.crstlIntegration.enabled && (
                <div className="ml-2">
                  <p>Crstl ({formData.crstlIntegration.retailerCount} retailers)</p>
                </div>
              )}
              <div className="flex justify-between">
                <span>Setup Cost:</span>
                <span>{formatCurrency(integrationCosts.setupCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Cost:</span>
                <span>{formatCurrency(integrationCosts.annualCost)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Implementation */}
        {formData.implementationPackage && (
          <div>
            <h3 className="font-semibold mb-2">Implementation</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Package:</span>
                <span>{formData.implementationPackage}</span>
              </div>
              <div className="flex justify-between">
                <span>Onboarding Fee:</span>
                <span>{formatCurrency(parseFloat(formData.onboardingFee || 0))}</span>
              </div>
              {formData.onsiteSupportDays > 0 && (
                <div className="flex justify-between">
                  <span>Onsite Support:</span>
                  <span>{formData.onsiteSupportDays} days</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Total Costs */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Total Costs</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>One-Time Costs:</span>
              <span>{formatCurrency(totalCosts.oneTimeCosts)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Annual Recurring:</span>
              <span>{formatCurrency(totalCosts.annualRecurringCosts)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Monthly Equivalent:</span>
              <span>{formatCurrency(totalCosts.monthlyRecurringCosts)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 