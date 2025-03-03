"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

interface IntegrationsSectionProps {
  formData: {
    spsIntegration: {
      enabled: boolean;
      setupFee: number;
      retailerSetupFee: number;
      retailerCount: number;
      supportTiers: SupportTier[];
    };
    crstlIntegration: {
      enabled: boolean;
      setupFee: number;
      supportFee: number;
      retailerCount: number;
    };
  };
  handleInputChange: (field: string, value: string | number | boolean) => void;
  handleSpsRetailerCountChange: (value: string) => void;
  handleCrstlRetailerCountChange: (value: string) => void;
  invalidFields: string[];
}

interface SupportTier {
  name: string;
  fromQty: number;
  toQty: number;
  pricePerRetailer: number;
}

export function IntegrationsSection({
  formData,
  handleInputChange,
  handleSpsRetailerCountChange,
  handleCrstlRetailerCountChange,
  invalidFields,
}: IntegrationsSectionProps) {
  
  // Calculate SPS support cost based on tiers
  const calculateSpsRetailerSupportCost = () => {
    if (!formData.spsIntegration.enabled || formData.spsIntegration.retailerCount <= 0) {
      return 0;
    }
    
    let totalCost = 0;
    const sortedTiers = [...formData.spsIntegration.supportTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // For each retailer, find which tier it belongs to and add its cost
    for (let retailerNum = 1; retailerNum <= formData.spsIntegration.retailerCount; retailerNum++) {
      // Find the tier this retailer belongs to
      const tier = sortedTiers.find(t => retailerNum >= t.fromQty && retailerNum <= t.toQty);
      
      if (tier) {
        // Add the cost for this retailer (quarterly)
        totalCost += tier.pricePerRetailer;
      }
    }
    
    // Return annual cost (quarterly * 4)
    return totalCost * 4;
  };
  
  // Calculate Crstl support cost
  const calculateCrstlSupportCost = () => {
    if (!formData.crstlIntegration.enabled || formData.crstlIntegration.retailerCount <= 0) {
      return 0;
    }
    
    // Return annual cost (quarterly * 4 * retailer count)
    return formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount;
  };
  
  // Calculate total setup costs
  const calculateSpsSetupCost = () => {
    if (!formData.spsIntegration.enabled) {
      return 0;
    }
    
    return formData.spsIntegration.setupFee + 
           (formData.spsIntegration.retailerSetupFee * formData.spsIntegration.retailerCount);
  };
  
  const calculateCrstlSetupCost = () => {
    if (!formData.crstlIntegration.enabled) {
      return 0;
    }
    
    return formData.crstlIntegration.setupFee;
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
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission on ENTER
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Integration Options</h2>
      
      {/* SPS Commerce Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SPS Commerce Integration</CardTitle>
            <Switch
              checked={formData.spsIntegration.enabled}
              onCheckedChange={(checked) => {
                console.log("SPS toggle changed to:", checked);
                handleInputChange("spsIntegration.enabled", checked);
              }}
              id="sps-integration-toggle"
            />
          </div>
        </CardHeader>
        
        {formData.spsIntegration.enabled && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Setup Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="spsSetupFee">SPS Commerce Setup Fee</Label>
                    <Input
                      id="spsSetupFee"
                      type="text"
                      value={`$${formData.spsIntegration.setupFee}`}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="spsRetailerSetupFee">Trading Partner/Retailer Setup Fee</Label>
                    <Input
                      id="spsRetailerSetupFee"
                      type="text"
                      value={`$${formData.spsIntegration.retailerSetupFee}`}
                      disabled
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  *Set up fees charged on the date of the SPS project integration kick-off.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Trading Partner Support</h3>
                <div className="mb-4">
                  <Label htmlFor="spsRetailerCount">Number of Trading Partners/Retailers</Label>
                  <Input
                    id="spsRetailerCount"
                    type="text"
                    value={formatNumber(formData.spsIntegration.retailerCount)}
                    onChange={(e) => handleSpsRetailerCountChange(e.target.value)}
                    className={invalidFields.includes("spsIntegration.retailerCount") ? "border-red-500" : ""}
                  />
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Support Tiers</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tier</th>
                          <th className="text-right py-2">Range</th>
                          <th className="text-right py-2">Price Per Retailer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.spsIntegration.supportTiers.map((tier) => (
                          <tr key={tier.name} className="border-b">
                            <td className="py-2">{tier.name}</td>
                            <td className="text-right py-2">
                              {tier.fromQty === tier.toQty ? tier.fromQty : `${tier.fromQty} - ${tier.toQty === Number.MAX_SAFE_INTEGER ? "∞" : tier.toQty}`}
                            </td>
                            <td className="text-right py-2">
                              {tier.pricePerRetailer === 0 ? "Included" : `$${tier.pricePerRetailer.toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Cost Breakdown</h4>
                    {getSpsRetailerSupportBreakdown().map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span>
                          {item.tier} ({item.retailersInTier} {item.retailersInTier === 1 ? "retailer" : "retailers"} @ {item.pricePerRetailer === 0 ? "Included" : `$${item.pricePerRetailer}/quarter`})
                        </span>
                        <span>${formatNumber(item.annualCost)}/year</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 font-medium">
                    <span>Total Retailers:</span>
                    <span>{formData.spsIntegration.retailerCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Setup Cost:</span>
                    <span>${formatNumber(calculateSpsSetupCost())}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Annual Support Cost:</span>
                    <span>${formatNumber(calculateSpsRetailerSupportCost())}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  *Each unique connection to a Trading Partner/Retailer is counted separately.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Crstl Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Crstl Integration</CardTitle>
            <Switch
              checked={formData.crstlIntegration.enabled}
              onCheckedChange={(checked) => {
                console.log("Crstl toggle changed to:", checked);
                handleInputChange("crstlIntegration.enabled", checked);
              }}
              id="crstl-integration-toggle"
            />
          </div>
        </CardHeader>
        
        {formData.crstlIntegration.enabled && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Setup Fees</h3>
                <div>
                  <Label htmlFor="crstlSetupFee">Crstl Setup Fee</Label>
                  <Input
                    id="crstlSetupFee"
                    type="text"
                    value={`$${formData.crstlIntegration.setupFee}`}
                    disabled
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  *Set up fees charged on the date of the Crstl project integration kick-off.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Trading Partner Support</h3>
                <div className="mb-4">
                  <Label htmlFor="crstlRetailerCount">Number of Trading Partners/Retailers</Label>
                  <Input
                    id="crstlRetailerCount"
                    type="text"
                    value={formatNumber(formData.crstlIntegration.retailerCount)}
                    onChange={(e) => handleCrstlRetailerCountChange(e.target.value)}
                    className={invalidFields.includes("crstlIntegration.retailerCount") ? "border-red-500" : ""}
                  />
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Support Fee</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tier</th>
                          <th className="text-right py-2">Price Per Retailer</th>
                          <th className="text-right py-2">Billing Terms</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Standard</td>
                          <td className="text-right py-2">${formData.crstlIntegration.supportFee}</td>
                          <td className="text-right py-2">Quarter</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 font-medium">
                    <span>Total Retailers:</span>
                    <span>{formData.crstlIntegration.retailerCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Setup Cost:</span>
                    <span>${formatNumber(calculateCrstlSetupCost())}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-medium">
                    <span>Annual Support Cost:</span>
                    <span>${formatNumber(calculateCrstlSupportCost())}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 