"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatNumber } from "@/lib/utils"
import { Trash2 } from "lucide-react"

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
  const [isSpsTiersDialogOpen, setIsSpsTiersDialogOpen] = useState(false)
  const [spsTiers, setSpsTiers] = useState<SupportTier[]>([])
  const [isCrstlTiersDialogOpen, setIsCrstlTiersDialogOpen] = useState(false)
  const [crstlTier, setCrstlTier] = useState<{ supportFee: number }>({ supportFee: 0 })
  
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
  
  // Handle setup fee changes
  const handleSpsSetupFeeChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    handleInputChange("spsIntegration.setupFee", isNaN(parsedValue) ? 0 : parsedValue);
  };
  
  const handleSpsRetailerSetupFeeChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    handleInputChange("spsIntegration.retailerSetupFee", isNaN(parsedValue) ? 0 : parsedValue);
  };
  
  const handleCrstlSetupFeeChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    handleInputChange("crstlIntegration.setupFee", isNaN(parsedValue) ? 0 : parsedValue);
  };
  
  // Handle tier configuration
  const openSpsTiersDialog = () => {
    setSpsTiers([...formData.spsIntegration.supportTiers]);
    setIsSpsTiersDialogOpen(true);
  };
  
  const saveSpsTiers = () => {
    handleInputChange("spsIntegration.supportTiers", spsTiers);
    setIsSpsTiersDialogOpen(false);
  };
  
  const handleSpsTierChange = (index: number, field: keyof SupportTier, value: string | number) => {
    const updatedTiers = [...spsTiers];
    
    if (field === 'name') {
      updatedTiers[index][field] = value as string;
    } else {
      // For numeric fields
      const numValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ""), 10) : value;
      updatedTiers[index][field] = isNaN(numValue as number) ? 0 : numValue as number;
    }
    
    setSpsTiers(updatedTiers);
  };
  
  const addSpsTier = () => {
    const newTier: SupportTier = {
      name: `Tier ${spsTiers.length + 1}`,
      fromQty: 1,
      toQty: 10,
      pricePerRetailer: 100
    };
    
    setSpsTiers([...spsTiers, newTier]);
  };
  
  const removeSpsTier = (index: number) => {
    const updatedTiers = [...spsTiers];
    updatedTiers.splice(index, 1);
    setSpsTiers(updatedTiers);
  };
  
  // Handle Crstl tier configuration
  const openCrstlTiersDialog = () => {
    setCrstlTier({ supportFee: formData.crstlIntegration.supportFee });
    setIsCrstlTiersDialogOpen(true);
  };
  
  const saveCrstlTier = () => {
    handleInputChange("crstlIntegration.supportFee", crstlTier.supportFee);
    setIsCrstlTiersDialogOpen(false);
  };
  
  const handleCrstlTierChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setCrstlTier({ supportFee: isNaN(parsedValue) ? 0 : parsedValue });
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
                      value={`$${formatNumber(formData.spsIntegration.setupFee)}`}
                      onChange={(e) => handleSpsSetupFeeChange(e.target.value)}
                      className={invalidFields.includes("spsIntegration.setupFee") ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="spsRetailerSetupFee">Trading Partner/Retailer Setup Fee</Label>
                    <Input
                      id="spsRetailerSetupFee"
                      type="text"
                      value={`$${formatNumber(formData.spsIntegration.retailerSetupFee)}`}
                      onChange={(e) => handleSpsRetailerSetupFeeChange(e.target.value)}
                      className={invalidFields.includes("spsIntegration.retailerSetupFee") ? "border-red-500" : ""}
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
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Support Tiers</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openSpsTiersDialog}
                    >
                      Configure Tiers
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tier</th>
                          <th className="text-right py-2">From</th>
                          <th className="text-right py-2">To</th>
                          <th className="text-right py-2">Price Per Retailer</th>
                          <th className="text-right py-2">Billing Terms</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.spsIntegration.supportTiers.sort((a, b) => a.fromQty - b.fromQty).map((tier, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{tier.name}</td>
                            <td className="text-right py-2">{tier.fromQty}</td>
                            <td className="text-right py-2">{tier.toQty === Number.MAX_SAFE_INTEGER ? '51+' : tier.toQty}</td>
                            <td className="text-right py-2">${tier.pricePerRetailer}</td>
                            <td className="text-right py-2">Quarter</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {getSpsRetailerSupportBreakdown().length > 0 && (
                    <div className="mt-4 border-t pt-2">
                      <h5 className="font-medium mb-2">Cost Breakdown</h5>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Tier</th>
                            <th className="text-right py-1">Retailers</th>
                            <th className="text-right py-1">Price</th>
                            <th className="text-right py-1">Annual Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSpsRetailerSupportBreakdown().map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-1">{item.tier}</td>
                              <td className="text-right py-1">{item.retailersInTier}</td>
                              <td className="text-right py-1">${item.pricePerRetailer}</td>
                              <td className="text-right py-1">${formatNumber(item.annualCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
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
                    value={`$${formatNumber(formData.crstlIntegration.setupFee)}`}
                    onChange={(e) => handleCrstlSetupFeeChange(e.target.value)}
                    className={invalidFields.includes("crstlIntegration.setupFee") ? "border-red-500" : ""}
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
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Support Fee</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openCrstlTiersDialog}
                    >
                      Configure Fee
                    </Button>
                  </div>
                  
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
      
      {/* SPS Tiers Configuration Dialog */}
      <Dialog open={isSpsTiersDialogOpen} onOpenChange={setIsSpsTiersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure SPS Support Tiers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2">Tier Name</th>
                    <th className="text-right py-2">From Qty</th>
                    <th className="text-right py-2">To Qty</th>
                    <th className="text-right py-2">Price Per Retailer</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spsTiers.map((tier, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <Input
                          value={tier.name}
                          onChange={(e) => handleSpsTierChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.fromQty}
                          onChange={(e) => handleSpsTierChange(index, 'fromQty', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.toQty === Number.MAX_SAFE_INTEGER ? '51+' : tier.toQty}
                          onChange={(e) => {
                            const value = e.target.value;
                            const toQty = value.includes('+') 
                              ? Number.MAX_SAFE_INTEGER 
                              : parseInt(value.replace(/[^0-9]/g, ""), 10);
                            handleSpsTierChange(index, 'toQty', toQty);
                          }}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.pricePerRetailer}
                          onChange={(e) => handleSpsTierChange(index, 'pricePerRetailer', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpsTier(index)}
                          disabled={spsTiers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button onClick={addSpsTier} variant="outline">
              Add Tier
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpsTiersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSpsTiers}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Crstl Fee Configuration Dialog */}
      <Dialog open={isCrstlTiersDialogOpen} onOpenChange={setIsCrstlTiersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Crstl Support Fee</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="crstlSupportFee">Price Per Retailer (Quarterly)</Label>
              <Input
                id="crstlSupportFee"
                type="text"
                value={crstlTier.supportFee}
                onChange={(e) => handleCrstlTierChange(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCrstlTiersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCrstlTier}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 