"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Info, Pencil } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAccountExecutives, AccountExecutive } from "@/services/account-executives"

interface ProposalSummaryProps {
  formData: any;
  currentStep: number;
  isExpanded?: boolean;
  onEdit?: () => void;
}

export function ProposalSummary({ formData, currentStep, isExpanded = false, onEdit }: ProposalSummaryProps) {
  const [showSaasBreakdown, setShowSaasBreakdown] = useState(false)
  const [showStoreBreakdown, setShowStoreBreakdown] = useState(false)
  const [showIntegrationBreakdown, setShowIntegrationBreakdown] = useState(false)
  const [showImplementationBreakdown, setShowImplementationBreakdown] = useState(false)
  const [accountType, setAccountType] = useState<string>("")
  const [highestStepReached, setHighestStepReached] = useState(currentStep)
  const [accountExecutiveRole, setAccountExecutiveRole] = useState<string | null>(null)
  const [accountExecutives, setAccountExecutives] = useState<AccountExecutive[]>([])
  const [loading, setLoading] = useState(true)

  // Update the step constants to match your application's actual step numbering
  const BUSINESS_INFO_STEP = 0;  // Instead of 1
  const PAYMENT_DETAILS_STEP = 1; // Instead of 2
  const SAAS_FEE_STEP = 2;       // Instead of 3
  const INTEGRATIONS_STEP = 3;    // Instead of 4
  const ATTAINABLE_AUTOMATION_STEP = 4; // Instead of 5
  const PROPOSAL_OPTIONS_STEP = 5; // Instead of 6
  const IMPLEMENTATION_STEP = 6;   // Instead of 7

  // Fetch account executives from the API
  useEffect(() => {
    async function fetchAccountExecutives() {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/account-executives?t=${timestamp}`);
        
        if (!response.ok) {
          console.error("Failed to fetch account executives for summary");
          return;
        }
        
        const data = await response.json();
        console.log("Fetched account executives for summary:", data);
        setAccountExecutives(data);
      } catch (error) {
        console.error("Error fetching account executives for summary:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAccountExecutives();
  }, []);

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

  // Update the highest step when currentStep increases
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep, highestStepReached]);

  // Add this near the top of your component to debug step values
  useEffect(() => {
    console.log("Current step:", currentStep);
    console.log("Highest step reached:", highestStepReached);
    console.log("PAYMENT_DETAILS_STEP constant:", PAYMENT_DETAILS_STEP);
  }, [currentStep, highestStepReached]);

  // Update the debugging code
  useEffect(() => {
    console.log("Current step name:", 
      currentStep === 0 ? "BUSINESS_INFO_STEP" :
      currentStep === 1 ? "PAYMENT_DETAILS_STEP" :
      currentStep === 2 ? "SAAS_FEE_STEP" :
      currentStep === 3 ? "INTEGRATIONS_STEP" :
      currentStep === 4 ? "ATTAINABLE_AUTOMATION_STEP" :
      currentStep === 5 ? "PROPOSAL_OPTIONS_STEP" :
      currentStep === 6 ? "IMPLEMENTATION_STEP" : "UNKNOWN_STEP"
    );
  }, [currentStep]);

  // Update the useEffect to fetch the account executive's role
  useEffect(() => {
    async function fetchAccountExecutiveRole() {
      if (formData.accountExec) {
        try {
          console.log(`Fetching role for ${formData.accountExec}`);
          const response = await fetch(`/api/account-executive-role?name=${encodeURIComponent(formData.accountExec)}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Role data received:', data);
            setAccountExecutiveRole(data.role || null);
          } else {
            console.error('Error response from role API:', response.status, response.statusText);
            const errorData = await response.json();
            console.error('Error details:', errorData);
          }
        } catch (error) {
          console.error("Error fetching account executive role:", error);
        }
      } else {
        setAccountExecutiveRole(null);
      }
    }
    
    fetchAccountExecutiveRole();
  }, [formData.accountExec]);

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
  
  // Replace the calculateStoreConnectionsCost function with this simpler version
  const getStoreConnectionsCost = () => {
    // Just return the value calculated in FeesSection
    return formData.storeConnectionsCost || 0;
  };
  
  // Calculate integration costs with discount
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
      
      // Apply discount if enabled
      if (formData.applyDiscountToIntegrations && formData.saasFeeDiscount > 0) {
        const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
        spsAnnualCost *= discountMultiplier;
      }
      
      annualCost += spsAnnualCost;
    }
    
    // Crstl
    if (formData.crstlIntegration.enabled) {
      // Setup costs
      setupCost += formData.crstlIntegration.setupFee;
      
      // Annual support costs
      let crstlAnnualCost = formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount;
      
      // Apply discount if enabled
      if (formData.applyDiscountToIntegrations && formData.saasFeeDiscount > 0) {
        const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
        crstlAnnualCost *= discountMultiplier;
      }
      
      annualCost += crstlAnnualCost;
    }
    
    return { setupCost, annualCost };
  };
  
  // Calculate implementation costs
  const calculateImplementationCosts = () => {
    return parseFloat(formData.onboardingFee || 0) + parseFloat(formData.onsiteSupportFee || 0);
  };
  
  // Move the calculateAutomationCosts function above calculateTotalCosts
  const calculateAutomationCosts = () => {
    let totalCost = 0;
    
    if (formData.attainableAutomation) {
      // Pick to Light
      if (formData.attainableAutomation.pickToLight.enabled) {
        // Use manual override if available, otherwise calculate
        let pickCost = formData.attainableAutomation.pickToLight.annualCost !== undefined
          ? formData.attainableAutomation.pickToLight.annualCost
          : 0;
        
        // If no manual override, calculate the cost
        if (pickCost === 0 && formData.attainableAutomation.pickToLight.connections > 0) {
          const connections = formData.attainableAutomation.pickToLight.connections;
          const tiers = [...formData.attainableAutomation.pickToLight.tiers].sort((a, b) => a.fromQty - b.fromQty);
          
          // For each connection, find which tier it belongs to and add its cost
          for (let connectionNum = 1; connectionNum <= connections; connectionNum++) {
            // Find the tier this connection belongs to
            const tier = tiers.find(t => connectionNum >= t.fromQty && connectionNum <= t.toQty);
            
            if (tier) {
              // Add the cost for this connection (monthly)
              pickCost += tier.pricePerConnection;
            }
          }
          
          // Multiply by 12 for annual cost
          pickCost *= 12;
        }
        
        // Apply discount if enabled (only to calculated costs, not manual overrides)
        if (formData.applyDiscountToAutomation && formData.saasFeeDiscount > 0 && 
            formData.attainableAutomation.pickToLight.annualCost === undefined) {
          const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
          pickCost *= discountMultiplier;
        }
        
        totalCost += pickCost;
      }
      
      // Pack to Light
      if (formData.attainableAutomation.packToLight.enabled) {
        // Use manual override if available, otherwise calculate
        let packCost = formData.attainableAutomation.packToLight.annualCost !== undefined
          ? formData.attainableAutomation.packToLight.annualCost
          : 0;
        
        // If no manual override, calculate the cost
        if (packCost === 0 && formData.attainableAutomation.packToLight.connections > 0) {
          const connections = formData.attainableAutomation.packToLight.connections;
          const tiers = [...formData.attainableAutomation.packToLight.tiers].sort((a, b) => a.fromQty - b.fromQty);
          
          // For each connection, find which tier it belongs to and add its cost
          for (let connectionNum = 1; connectionNum <= connections; connectionNum++) {
            // Find the tier this connection belongs to
            const tier = tiers.find(t => connectionNum >= t.fromQty && connectionNum <= t.toQty);
            
            if (tier) {
              // Add the cost for this connection (monthly)
              packCost += tier.pricePerConnection;
            }
          }
          
          // Multiply by 12 for annual cost
          packCost *= 12;
        }
        
        // Apply discount if enabled (only to calculated costs, not manual overrides)
        if (formData.applyDiscountToAutomation && formData.saasFeeDiscount > 0 && 
            formData.attainableAutomation.packToLight.annualCost === undefined) {
          const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
          packCost *= discountMultiplier;
        }
        
        totalCost += packCost;
      }
    }
    
    return totalCost;
  };

  // Then use it in calculateTotalCosts
  const calculateTotalCosts = () => {
    const saasFee = highestStepReached >= SAAS_FEE_STEP ? calculateAnnualSaasFee() : 0;
    const storeConnectionsCost = highestStepReached >= SAAS_FEE_STEP ? getStoreConnectionsCost() : 0;
    const integrationCosts = highestStepReached >= INTEGRATIONS_STEP ? calculateIntegrationCosts() : { setupCost: 0, annualCost: 0 };
    const implementationCost = highestStepReached >= IMPLEMENTATION_STEP ? calculateImplementationCosts() : 0;
    
    // Add automation one-time costs
    const automationOneTimeCosts = highestStepReached >= ATTAINABLE_AUTOMATION_STEP && 
      (formData.attainableAutomation.pickToLight.enabled || formData.attainableAutomation.packToLight.enabled) 
        ? formData.attainableAutomation.remoteOnboardingFee 
        : 0;
    
    const oneTimeCosts = integrationCosts.setupCost + implementationCost + automationOneTimeCosts;
    const annualRecurringCosts = saasFee + storeConnectionsCost + integrationCosts.annualCost + calculateAutomationCosts();
    
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
  const integrationCosts = highestStepReached >= INTEGRATIONS_STEP ? calculateIntegrationCosts() : { setupCost: 0, annualCost: 0 };

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

  // Add some conditional styling based on isExpanded
  const expandedStyles = isExpanded ? {
    maxWidth: 'none',
    width: '100%'
  } : {};

  // Replace the hardcoded account executive lookup with the dynamic one
  const getAccountExecutiveDetails = (name: string) => {
    if (!name) return { initials: "??", color: "bg-gray-200" };
    
    // Find the account executive in the fetched data
    const ae = accountExecutives.find(exec => exec.full_name === name);
    
    if (ae) {
      return {
        initials: ae.initials || name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2),
        color: ae.color || "bg-blue-200"
      };
    }
    
    // Fallback if not found
    return {
      initials: name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2),
      color: "bg-blue-200"
    };
  };

  return (
    <Card style={expandedStyles} className="sticky top-4">
      <CardHeader className="relative">
        <CardTitle>
          Proposal Summary
          {currentStep === 7 && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              title="Edit Proposal"
            >
              <Pencil className="h-5 w-5 text-gray-600" />
            </Button>
          )}
        </CardTitle>
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
        {(currentStep === 1 || highestStepReached >= 1) && (
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
        )}
        
        {/* Store Connections - only show if we've reached or passed this step */}
        {(currentStep === 2 || highestStepReached >= 2) && formData.storeConnections > 0 && (
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
                <div className="text-xl font-bold">${formatNumber(formData.storeConnectionsCost || 0)}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Integrations - only show if we've reached or passed this step */}
        {(currentStep === 3 || highestStepReached >= 3) && (formData.spsIntegration.enabled || formData.crstlIntegration.enabled) && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Integrations</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {formData.spsIntegration.enabled && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <div className="flex-1">SPS Commerce</div>
                  <div className="text-xl font-bold">{formData.spsIntegration.retailerCount} Retailers</div>
                </div>
              )}
              
              {formData.crstlIntegration.enabled && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">Crstl</div>
                  <div className="text-xl font-bold">{formData.crstlIntegration.retailerCount} Retailers</div>
                </div>
              )}
              
              {/* Add discount indicator if applied */}
              {formData.applyDiscountToIntegrations && formData.saasFeeDiscount > 0 && (
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
                    <rect x="2" y="4" width="20" height="5" rx="2"></rect>
                    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"></path>
                    <path d="M10 13h4"></path>
                  </svg>
                </div>
                <div className="flex-1">Setup Cost</div>
                <div className="text-xl font-bold">${formatNumber(integrationCosts.setupCost)}</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="flex-1">Annual Cost</div>
                <div className="text-xl font-bold">${formatNumber(integrationCosts.annualCost)}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Attainable Automation - only show if we've reached or passed this step */}
        {(currentStep === ATTAINABLE_AUTOMATION_STEP || highestStepReached >= ATTAINABLE_AUTOMATION_STEP) && 
          (formData.attainableAutomation.pickToLight.enabled || 
           formData.attainableAutomation.packToLight.enabled) && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Attainable Automation</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {formData.attainableAutomation.pickToLight.enabled && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12" y2="18.01"></line>
                    </svg>
                  </div>
                  <div className="flex-1">Pick to Light & Receive to Light</div>
                  <div className="text-xl font-bold">{formData.attainableAutomation.pickToLight.connections} Connections</div>
                </div>
              )}
              
              {formData.attainableAutomation.packToLight.enabled && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <div className="flex-1">Pack to Light</div>
                  <div className="text-xl font-bold">{formData.attainableAutomation.packToLight.connections} Connections</div>
                </div>
              )}
              
              {/* Add discount indicator if applied */}
              {formData.applyDiscountToAutomation && formData.saasFeeDiscount > 0 && (
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
              
              {/* Setup Cost - simplified format */}
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="5" rx="2"></rect>
                    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"></path>
                    <path d="M10 13h4"></path>
                  </svg>
                </div>
                <div className="flex-1">Setup Cost</div>
                <div className="text-xl font-bold">${formatNumber(formData.attainableAutomation.remoteOnboardingFee)}</div>
              </div>
              
              {/* Annual Cost */}
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="flex-1">Annual Cost</div>
                <div className="text-xl font-bold">${formatNumber(calculateAutomationCosts())}</div>
              </div>
              
              {/* Only show Onsite Support if days > 0 */}
              {formData.attainableAutomation.onsiteSupportDays > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">Onsite Support</div>
                  <div className="text-xl font-bold">{formData.attainableAutomation.onsiteSupportDays} days</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Implementation - only show if we've reached or passed this step */}
        {(currentStep === 6 || highestStepReached >= 6) && formData.implementationPackage && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Implementation</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="flex-1">Package</div>
                <div className="text-xl font-bold">{getImplementationPackageName(formData.implementationPackage)}</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="5" rx="2"></rect>
                    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"></path>
                    <path d="M10 13h4"></path>
                  </svg>
                </div>
                <div className="flex-1">Onboarding Fee</div>
                <div className="text-xl font-bold">${formatNumber(parseFloat(formData.onboardingFee || 0))}</div>
              </div>
              
              {formData.virtualTrainingHours > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">Virtual Training</div>
                  <div className="text-xl font-bold">{formData.virtualTrainingHours} hours</div>
                </div>
              )}
              
              {formData.onsiteSupportDays > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">Onsite Support</div>
                  <div className="text-xl font-bold">{formData.onsiteSupportDays} days</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Fee Calculation Breakdown */}
        {(currentStep === 2 || highestStepReached >= 2) && (
          <div className="bg-blue-50 p-6 rounded-md mt-4">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Fee Calculation Breakdown</h3>
            
            {formData.saasFeeDiscount > 0 && (
              <div className="bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md mb-6 inline-block">
                {formData.saasFeeDiscount}% Discount Applied
              </div>
            )}
            
            {/* Display tier breakdown in the improved format - without Store Connections */}
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
                
                <div className="border-t border-blue-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-900">Total Annual Commitment</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${formatNumber((formData.calculatedTiers || []).reduce((sum, tier) => sum + tier.tierTotal, 0))}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p>No pricing tiers available</p>
            )}
          </div>
        )}

        {/* Investment Summary */}
        <div className="bg-green-50 p-6 rounded-md mt-4">
          <h3 className="text-xl font-semibold text-green-900 mb-4">Investment Summary</h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-green-900">Total Annual Investment</span>
            <span className="text-xl font-bold text-green-600">
              ${formatNumber(
                (formData.calculatedTiers || []).reduce((sum, tier) => sum + tier.tierTotal, 0) + 
                (formData.storeConnectionsCost || 0) + 
                (integrationCosts.annualCost || 0) +
                calculateAutomationCosts()
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-900">Total Upfront Cost</span>
            <span className="text-xl font-bold text-green-600">
              ${formatNumber(
                (integrationCosts.setupCost || 0) + 
                (parseFloat(formData.onboardingFee || 0)) +
                ((formData.attainableAutomation.pickToLight.enabled || formData.attainableAutomation.packToLight.enabled) 
                  ? formData.attainableAutomation.remoteOnboardingFee 
                  : 0)
              )}
            </span>
          </div>
        </div>

        {/* Business Information */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Prepared By</h3>
          
          {formData.accountExec && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              {/* Account Executive Tile */}
              <div className="flex items-center space-x-3">
                {(() => {
                  // Get the AE details from the dynamic function
                  const aeDetails = getAccountExecutiveDetails(formData.accountExec);
                  
                  return (
                    <>
                      <div className={`${aeDetails.color} h-10 w-10 rounded-full flex items-center justify-center font-bold text-gray-700`}>
                        {aeDetails.initials}
                      </div>
                      <div>
                        <div className="font-medium">{formData.accountExec}</div>
                        {accountExecutiveRole && (
                          <div className="text-sm text-gray-500">{accountExecutiveRole}</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 