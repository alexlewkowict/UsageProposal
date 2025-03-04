"use client"

import { useState, useEffect } from "react"
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
  const [accountType, setAccountType] = useState<string>("")

  // Define step numbers for each section
  const BUSINESS_INFO_STEP = 1;
  const PAYMENT_DETAILS_STEP = 2;
  const SAAS_FEE_STEP = 3;
  const INTEGRATIONS_STEP = 4;
  const PROPOSAL_OPTIONS_STEP = 5;
  const IMPLEMENTATION_STEP = 6;

  // Fetch account type from Supabase when opportunity name changes
  useEffect(() => {
    async function fetchAccountType() {
      if (formData.opportunityName) {
        try {
          const response = await fetch(`/api/account-type?opportunity=${encodeURIComponent(formData.opportunityName)}`);
          if (response.ok) {
            const data = await response.json();
            // Remove any quotes from the account type
            setAccountType(data.accountType?.replace(/['"]/g, '') || "");
          }
        } catch (error) {
          console.error("Error fetching account type:", error);
        }
      }
    }
    
    fetchAccountType();
  }, [formData.opportunityName]);

  // Add this near the useEffect for fetching account type
  useEffect(() => {
    console.log("Current account type:", accountType);
  }, [accountType]);

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
    if (formData.storeConnections <= 0) return 0;
    let totalCost = 0;
    
    // Sort tiers by fromQty
    const sortedTiers = [...formData.storeConnectionTiers].sort(
      (a, b) => a.fromQty - b.fromQty
    );
    
    // Count stores in each tier
    let remainingStores = formData.storeConnections;
    
    for (const tier of sortedTiers) {
      if (remainingStores <= 0) break;
      
      // Calculate how many stores fall into this tier
      const storesInTier = Math.min(
        remainingStores,
        tier.toQty === Number.MAX_SAFE_INTEGER 
          ? remainingStores 
          : tier.toQty - tier.fromQty + 1
      );
      
      // Add cost for this tier
      totalCost += storesInTier * tier.pricePerStore * 12; // Annual cost
      
      // Subtract the stores we've counted
      remainingStores -= storesInTier;
    }
    
    // Apply discount if enabled
    if (formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0) {
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

  // Add this near the top of your component
  console.log("Form data contract term:", formData.contractTerm);
  console.log("Form data contract length:", formData.contractLength);
  console.log("Full form data:", formData);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Proposal Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New header design */}
        <div className="mb-8">
          <div className="text-gray-600 mb-1">Prepared for</div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{formData.friendlyBusinessName || "Client Name"}</h2>
              {accountType && (
                <div className="text-gray-500">{accountType}</div>
              )}
            </div>
            {accountType && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100">
                {accountType} Partner
              </div>
            )}
          </div>
        </div>
        
        {/* Agreement Terms section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Agreement Terms</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Contract Term Tile */}
            <div className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="text-lg font-medium">{formData.contractTerm || 24} Months</div>
            </div>
            
            {/* Billing Frequency Tile */}
            <div className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
              </div>
              <div className="text-lg font-medium">
                {formData.billingFrequency ? 
                  formData.billingFrequency.charAt(0).toUpperCase() + formData.billingFrequency.slice(1) : 
                  "Quarterly"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Store Connections - only show if we've reached or passed this step */}
        {currentStep >= SAAS_FEE_STEP && formData.storeConnections > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Store Connections</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <label htmlFor="total-stores" className="flex-1">Total Stores</label>
                <div id="total-stores" className="text-xl font-bold">{formData.storeConnections}</div>
              </div>
              
              {formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="5" x2="5" y2="19"></line>
                      <circle cx="6.5" cy="6.5" r="2.5"></circle>
                      <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="flex-1">Discount Applied</div>
                  <div className="text-xl font-bold text-green-600">{formData.saasFeeDiscount}%</div>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="flex-1">Annual Cost</div>
                <div className="text-xl font-bold">${formatNumber(calculateStoreConnectionsCost())}</div>
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
        
        <div className="bg-blue-50 p-6 rounded-md mt-4">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Fee Calculation Breakdown</h3>
          
          {formData.saasFeeDiscount > 0 && (
            <div className="bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md mb-6 inline-block">
              {formData.saasFeeDiscount}% Preferred Partner Discount Applied
            </div>
          )}
          
          {/* Display tier breakdown in the improved format */}
          {formData.calculatedTiers && formData.calculatedTiers.length > 0 ? (
            <>
              {formData.calculatedTiers.map((tier, index) => {
                if (tier.isPlatformFee) {
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Base fee (up to {formatNumber(tier.unitsInTier)} units)</span>
                        <span className="font-bold">${formatNumber(formData.saasFeeDiscount > 0 ? (tier.discountedFee || 0) : (tier.originalFee || 0))}</span>
                      </div>
                      {formData.saasFeeDiscount > 0 && (
                        <div className="text-gray-500 text-sm">
                          ${formatNumber(tier.originalFee || 0)} → <span className="text-blue-600 font-medium">${formatNumber(tier.discountedFee || 0)}</span> after discount
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{formatNumber(tier.unitsInTier)} units at ${tier.originalRate?.toFixed(3) || 0}</span>
                        <span className="font-bold">${formatNumber(tier.tierTotal)}</span>
                      </div>
                      {formData.saasFeeDiscount > 0 && (
                        <div className="text-gray-500 text-sm">
                          → <span className="text-blue-600 font-medium">${tier.discountedRate?.toFixed(3) || 0}</span> after discount
                        </div>
                      )}
                    </div>
                  );
                }
              })}
              
              {/* Add Store Connections Breakdown */}
              {formData.storeConnections > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold mb-2">Store Connections Breakdown:</h4>
                  
                  {formData.freeStoreConnections > 0 && (
                    <div className="mb-1">
                      Included: {formData.freeStoreConnections} stores × $0.00 × 12 months = $0
                      {formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0 && (
                        <span className="text-blue-600"> → $0 after {formData.saasFeeDiscount}% discount</span>
                      )}
                    </div>
                  )}
                  
                  {formData.storeConnections > formData.freeStoreConnections && (
                    <div className="mb-1">
                      Additional Stores: {formData.storeConnections - formData.freeStoreConnections} stores × 
                      ${formData.storeConnectionTiers[0]?.pricePerStore.toFixed(2) || "0.00"} × 12 months = 
                      ${formatNumber((formData.storeConnections - formData.freeStoreConnections) * 
                        (formData.storeConnectionTiers[0]?.pricePerStore || 0) * 12)}
                      
                      {formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0 && (
                        <span className="text-blue-600"> → ${formatNumber((formData.storeConnections - formData.freeStoreConnections) * 
                          (formData.storeConnectionTiers[0]?.pricePerStore || 0) * 12 * 
                          (1 - formData.saasFeeDiscount / 100))} after {formData.saasFeeDiscount}% discount</span>
                      )}
                    </div>
                  )}
                  
                  <div className="font-semibold mt-2">
                    Total Store Connections Cost: ${formatNumber(calculateStoreConnectionsCost())}
                  </div>
                </div>
              )}
              
              <div className="border-t border-blue-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Total Annual Investment</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${formatNumber(formData.calculatedTiers.reduce((sum, tier) => sum + tier.tierTotal, 0) + calculateStoreConnectionsCost())}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p>No pricing tiers available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 