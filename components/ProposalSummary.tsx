"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProposalSummaryProps {
  formData: any;
  currentStep: number;
}

export function ProposalSummary({ formData, currentStep }: ProposalSummaryProps) {
  const [showSaasBreakdown, setShowSaasBreakdown] = useState(false)
  const [showStoreBreakdown, setShowStoreBreakdown] = useState(false)
  const [showIntegrationBreakdown, setShowIntegrationBreakdown] = useState(false)
  const [showImplementationBreakdown, setShowImplementationBreakdown] = useState(false)

  // Define step numbers for each section
  const BUSINESS_INFO_STEP = 1;
  const PAYMENT_DETAILS_STEP = 2;
  const SAAS_FEE_STEP = 3;
  const INTEGRATIONS_STEP = 4;
  const PROPOSAL_OPTIONS_STEP = 5;
  const IMPLEMENTATION_STEP = 6;

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
    const saasFee = currentStep >= SAAS_FEE_STEP ? calculateAnnualSaasFee() : 0;
    const storeConnectionsCost = currentStep >= SAAS_FEE_STEP ? calculateStoreConnectionsCost() : 0;
    const integrationCosts = currentStep >= INTEGRATIONS_STEP ? calculateIntegrationCosts() : { setupCost: 0, annualCost: 0 };
    const implementationCost = currentStep >= IMPLEMENTATION_STEP ? calculateImplementationCosts() : 0;
    
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
  const integrationCosts = currentStep >= INTEGRATIONS_STEP ? calculateIntegrationCosts() : { setupCost: 0, annualCost: 0 };

  // Add this function to get the package name from the ID
  const getImplementationPackageName = (packageId: string) => {
    const packageNames = {
      "1": "QuickStart Brand",
      "2": "QuickStart 3PL",
      "3": "Standard",
      "4": "Advanced",
      "5": "Custom"
    };
    
    return packageNames[packageId] || packageId;
  };

  // New function to get store connection tier breakdown
  const getStoreConnectionBreakdown = () => {
    if (formData.storeConnections <= 0) return [];
    
    const breakdown = [];
    const sortedTiers = [...formData.storeConnectionTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    let remainingStores = formData.storeConnections;
    
    for (const tier of sortedTiers) {
      if (remainingStores <= 0) break;
      
      const storesInTier = Math.min(
        remainingStores,
        tier.toQty === Number.MAX_SAFE_INTEGER ? remainingStores : tier.toQty - tier.fromQty + 1
      );
      
      const tierCost = storesInTier * tier.pricePerStore;
      
      breakdown.push({
        tier: tier.name,
        storesInTier,
        pricePerStore: tier.pricePerStore,
        cost: tierCost
      });
      
      remainingStores -= storesInTier;
    }
    
    return breakdown;
  };
  
  // Get SPS support breakdown
  const getSpsRetailerSupportBreakdown = () => {
    if (!formData.spsIntegration.enabled || formData.spsIntegration.retailerCount <= 0) {
      return [];
    }
    
    const breakdown = [];
    const sortedTiers = [...formData.spsIntegration.supportTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // Create a map to count retailers in each tier
    const tierCounts = new Map();
    
    // For each retailer, find which tier it belongs to and count it
    for (let retailerNum = 1; retailerNum <= formData.spsIntegration.retailerCount; retailerNum++) {
      // Find the tier this retailer belongs to
      const tier = sortedTiers.find(t => retailerNum >= t.fromQty && retailerNum <= t.toQty);
      
      if (tier) {
        // Increment the count for this tier
        const currentCount = tierCounts.get(tier.name) || 0;
        tierCounts.set(tier.name, currentCount + 1);
      }
    }
    
    // Convert the map to the breakdown format
    for (const tier of sortedTiers) {
      const retailersInTier = tierCounts.get(tier.name) || 0;
      
      if (retailersInTier > 0) {
        // Calculate cost for this tier (quarterly)
        const tierCost = retailersInTier * tier.pricePerRetailer;
        
        breakdown.push({
          tier: tier.name,
          retailersInTier,
          pricePerRetailer: tier.pricePerRetailer,
          quarterlyCost: tierCost,
          annualCost: tierCost * 4
        });
      }
    }
    
    return breakdown;
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Proposal Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Info - only show if we've reached or passed this step */}
        {currentStep >= BUSINESS_INFO_STEP && formData.friendlyBusinessName && (
          <div>
            <h3 className="font-semibold mb-2">Prepared for:</h3>
            <p className="text-sm">{formData.friendlyBusinessName}</p>
          </div>
        )}
        
        {/* Contract Terms - only show if we've reached or passed this step */}
        {currentStep >= PAYMENT_DETAILS_STEP && formData.contractTerm && (
          <div>
            <h3 className="font-semibold mb-2">Contract</h3>
            <p className="text-sm">{formData.contractTerm} months, billed {formData.billingFrequency}</p>
          </div>
        )}
        
        {/* SaaS Fee - only show if we've reached or passed this step */}
        {currentStep >= SAAS_FEE_STEP && (formData.saasFee.pallets.value > 0 || 
          formData.saasFee.cases.value > 0 || 
          formData.saasFee.eaches.value > 0) && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">SaaS Fee</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={() => setShowSaasBreakdown(!showSaasBreakdown)}
              >
                {showSaasBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              {showSaasBreakdown && (
                <div className="bg-gray-50 p-2 rounded-md mb-2 space-y-2">
                  <div className="font-medium">Fee Calculation Breakdown:</div>
                  
                  {formData.saasFeeDiscount > 0 && (
                    <div className="text-blue-600 text-xs mb-1">
                      Applying {formData.saasFeeDiscount}% discount to all SaaS fees
                    </div>
                  )}
                  
                  {/* Display tier breakdown */}
                  {formData.calculatedTiers && formData.calculatedTiers.length > 0 ? (
                    formData.calculatedTiers.map((tier, index) => (
                      <div key={index} className="text-xs pl-2 border-l-2 border-gray-200">
                        <div>
                          {tier.name}: {formatNumber(tier.unitsInTier)} units 
                          {tier.isPlatformFee ? 
                            ` at platform fee $${formatNumber(tier.originalFee || 0)}` : 
                            ` at $${tier.originalRate?.toFixed(3) || 0} per unit`}
                        </div>
                        <div className="text-gray-500">
                          {formData.saasFeeDiscount > 0 && `${formData.saasFeeDiscount}% discount applied`}
                          {!tier.isPlatformFee && tier.discountedRate && ` = $${tier.discountedRate.toFixed(3)} per unit`} 
                          = ${formatNumber(tier.tierTotal)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">No tier breakdown available</div>
                  )}
                </div>
              )}
              
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
        
        {/* Store Connections - only show if we've reached or passed this step */}
        {currentStep >= SAAS_FEE_STEP && formData.storeConnections > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Store Connections</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={() => setShowStoreBreakdown(!showStoreBreakdown)}
              >
                {showStoreBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              {showStoreBreakdown && (
                <div className="bg-gray-50 p-2 rounded-md mb-2 space-y-2">
                  <div className="text-xs font-medium">Tier Breakdown:</div>
                  {getStoreConnectionBreakdown().map((item, index) => (
                    <div key={index} className="pl-2 border-l-2 border-gray-200">
                      <div className="flex justify-between">
                        <span>{item.tier}:</span>
                        <span>{item.storesInTier} stores × ${item.pricePerStore}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span></span>
                        <span>${formatNumber(item.cost)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {formData.applyDiscountToStoreConnections && (
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span>Discount Applied:</span>
                        <span>{formData.saasFeeDiscount}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Total Stores:</span>
                <span>{formData.storeConnections}</span>
              </div>
              {formData.applyDiscountToStoreConnections && (
                <div className="flex justify-between">
                  <span>Discount Applied:</span>
                  <span>{formData.saasFeeDiscount}%</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Annual Cost:</span>
                <span>{formatCurrency(calculateStoreConnectionsCost())}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Integrations - only show if we've reached or passed this step */}
        {currentStep >= INTEGRATIONS_STEP && (formData.spsIntegration.enabled || formData.crstlIntegration.enabled) && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Integrations</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={() => setShowIntegrationBreakdown(!showIntegrationBreakdown)}
              >
                {showIntegrationBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              {showIntegrationBreakdown && (
                <div className="bg-gray-50 p-2 rounded-md mb-2 space-y-2">
                  {formData.spsIntegration.enabled && (
                    <div>
                      <div className="font-medium">SPS Commerce:</div>
                      <div className="pl-2 border-l-2 border-gray-200 space-y-1">
                        <div className="flex justify-between">
                          <span>Setup Fee:</span>
                          <span>${formatNumber(formData.spsIntegration.setupFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retailer Setup:</span>
                          <span>${formatNumber(formData.spsIntegration.retailerSetupFee)} × {formData.spsIntegration.retailerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Setup:</span>
                          <span>${formatNumber(formData.spsIntegration.setupFee + formData.spsIntegration.retailerSetupFee * formData.spsIntegration.retailerCount)}</span>
                        </div>
                        
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <div className="font-medium">Support Tiers:</div>
                          {getSpsRetailerSupportBreakdown().map((item, index) => (
                            <div key={index} className="pl-2 border-l-2 border-gray-200 mt-1">
                              <div className="flex justify-between">
                                <span>{item.tier}:</span>
                                <span>{item.retailersInTier} × ${item.pricePerRetailer}/quarter</span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>Annual:</span>
                                <span>${formatNumber(item.annualCost)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.crstlIntegration.enabled && (
                    <div className={formData.spsIntegration.enabled ? "mt-2 pt-2 border-t border-gray-200" : ""}>
                      <div className="font-medium">Crstl:</div>
                      <div className="pl-2 border-l-2 border-gray-200 space-y-1">
                        <div className="flex justify-between">
                          <span>Setup Fee:</span>
                          <span>${formatNumber(formData.crstlIntegration.setupFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Support Fee:</span>
                          <span>${formatNumber(formData.crstlIntegration.supportFee)} × {formData.crstlIntegration.retailerCount} × 4 quarters</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Support:</span>
                          <span>${formatNumber(formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
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
        
        {/* Implementation - only show if we've reached or passed this step */}
        {currentStep >= IMPLEMENTATION_STEP && formData.implementationPackage && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Implementation</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={() => setShowImplementationBreakdown(!showImplementationBreakdown)}
              >
                {showImplementationBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              {showImplementationBreakdown && (
                <div className="bg-gray-50 p-2 rounded-md mb-2 space-y-1">
                  {formData.implementationPackage === "custom" && (
                    <>
                      <div className="flex justify-between">
                        <span>Virtual Training:</span>
                        <span>{formData.virtualTrainingHours} hours × $250</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Onsite Support:</span>
                        <span>{formData.onsiteSupportDays} days × ${formatNumber(parseFloat(formData.onsiteSupportFee || 0))}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Calculation:</span>
                        <span>
                          ${formatNumber(formData.virtualTrainingHours * 250)} + 
                          ${formatNumber(formData.onsiteSupportDays * parseFloat(formData.onsiteSupportFee || 0))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Package:</span>
                <span>{getImplementationPackageName(formData.implementationPackage)}</span>
              </div>
              <div className="flex justify-between">
                <span>Onboarding Fee:</span>
                <span>{formatCurrency(parseFloat(formData.onboardingFee || 0))}</span>
              </div>
              {formData.virtualTrainingHours > 0 && (
                <div className="flex justify-between">
                  <span>Virtual Training:</span>
                  <span>{formData.virtualTrainingHours} hours</span>
                </div>
              )}
              {formData.onsiteSupportDays > 0 && (
                <div className="flex justify-between">
                  <span>Onsite Support:</span>
                  <span>{formData.onsiteSupportDays} days</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Total Costs - always show, but values will be 0 until relevant steps are reached */}
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

        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-semibold mb-2">Fee Calculation Breakdown:</h3>
          {formData.saasFeeDiscount > 0 && (
            <p className="text-blue-600 mb-2">
              Applying {formData.saasFeeDiscount}% discount to all prices
            </p>
          )}
          
          {/* Display tier breakdown in the exact format from the screenshot */}
          {formData.calculatedTiers && formData.calculatedTiers.length > 0 ? (
            <>
              {formData.calculatedTiers.map((tier, index) => {
                if (tier.isPlatformFee) {
                  return (
                    <p key={index} className="mb-1">
                      Base fee (up to {formatNumber(tier.unitsInTier)} units): ${formatNumber(tier.originalFee || 0)} 
                      {formData.saasFeeDiscount > 0 && (
                        <span className="text-blue-600"> → ${formatNumber(tier.discountedFee)} after discount</span>
                      )}
                    </p>
                  );
                } else {
                  return (
                    <p key={index} className="mb-1">
                      {formatNumber(tier.unitsInTier)} units at ${tier.originalRate?.toFixed(3) || 0} 
                      {formData.saasFeeDiscount > 0 && (
                        <span className="text-blue-600"> → ${tier.discountedRate?.toFixed(3) || 0} after discount</span>
                      )}: ${formatNumber(tier.tierTotal)}
                    </p>
                  );
                }
              })}
              <p className="font-semibold mt-2">
                Total Annual Fee: ${formatNumber(formData.calculatedTiers.reduce((sum, tier) => sum + tier.tierTotal, 0))}
              </p>
            </>
          ) : (
            <p>No pricing tiers available</p>
          )}
          
          {/* Store Connections Breakdown */}
          <h3 className="font-semibold mt-4 mb-2">Store Connections Breakdown:</h3>
          {/* ... rest of your store connections breakdown ... */}
        </div>
      </CardContent>
    </Card>
  );
} 