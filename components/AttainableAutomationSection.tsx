"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatNumber } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit } from "lucide-react"

interface AttainableAutomationSectionProps {
  formData: {
    attainableAutomation: {
      pickToLight: {
        enabled: boolean;
        connections: number;
        tiers: PricingTier[];
        annualCost?: number;
      };
      packToLight: {
        enabled: boolean;
        connections: number;
        tiers: PricingTier[];
        annualCost?: number;
      };
      remoteOnboardingFee: number;
      onsiteSupportDays: number;
    };
    applyDiscountToAutomation: boolean;
    saasFeeDiscount: number;
  };
  handleInputChange: (field: string, value: string | number | boolean) => void;
  invalidFields: string[];
}

interface PricingTier {
  id: string;
  name: string;
  fromQty: number;
  toQty: number;
  pricePerConnection: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function AttainableAutomationSection({
  formData,
  handleInputChange,
  invalidFields,
}: AttainableAutomationSectionProps) {
  const [isPickToLightTiersDialogOpen, setIsPickToLightTiersDialogOpen] = useState(false)
  const [pickToLightTiers, setPickToLightTiers] = useState<PricingTier[]>([])
  const [isPackToLightTiersDialogOpen, setIsPackToLightTiersDialogOpen] = useState(false)
  const [packToLightTiers, setPackToLightTiers] = useState<PricingTier[]>([])
  
  // Initialize tiers when component mounts
  useEffect(() => {
    if (formData.attainableAutomation.pickToLight.tiers) {
      setPickToLightTiers([...formData.attainableAutomation.pickToLight.tiers]);
    }
    if (formData.attainableAutomation.packToLight.tiers) {
      setPackToLightTiers([...formData.attainableAutomation.packToLight.tiers]);
    }
  }, [formData.attainableAutomation.pickToLight.tiers, formData.attainableAutomation.packToLight.tiers]);
  
  // Calculate costs with discount applied if enabled
  const calculatePickToLightCost = () => {
    if (!formData.attainableAutomation.pickToLight.enabled || 
        formData.attainableAutomation.pickToLight.connections <= 0) {
      return 0;
    }
    
    let totalCost = 0;
    const connections = formData.attainableAutomation.pickToLight.connections;
    const tiers = [...formData.attainableAutomation.pickToLight.tiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // For each connection, find which tier it belongs to and add its cost
    for (let connectionNum = 1; connectionNum <= connections; connectionNum++) {
      // Find the tier this connection belongs to
      const tier = tiers.find(t => connectionNum >= t.fromQty && connectionNum <= t.toQty);
      
      if (tier) {
        // Add the cost for this connection (monthly)
        totalCost += tier.pricePerConnection;
      }
    }
    
    // Apply discount if enabled
    if (formData.applyDiscountToAutomation && formData.saasFeeDiscount > 0) {
      const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
      totalCost *= discountMultiplier;
    }
    
    // Return annual cost (monthly * 12)
    return totalCost * 12;
  };
  
  const calculatePackToLightCost = () => {
    if (!formData.attainableAutomation.packToLight.enabled || 
        formData.attainableAutomation.packToLight.connections <= 0) {
      return 0;
    }
    
    let totalCost = 0;
    const connections = formData.attainableAutomation.packToLight.connections;
    const tiers = [...formData.attainableAutomation.packToLight.tiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // For each connection, find which tier it belongs to and add its cost
    for (let connectionNum = 1; connectionNum <= connections; connectionNum++) {
      // Find the tier this connection belongs to
      const tier = tiers.find(t => connectionNum >= t.fromQty && connectionNum <= t.toQty);
      
      if (tier) {
        // Add the cost for this connection (monthly)
        totalCost += tier.pricePerConnection;
      }
    }
    
    // Apply discount if enabled
    if (formData.applyDiscountToAutomation && formData.saasFeeDiscount > 0) {
      const discountMultiplier = (100 - formData.saasFeeDiscount) / 100;
      totalCost *= discountMultiplier;
    }
    
    // Return annual cost (monthly * 12)
    return totalCost * 12;
  };
  
  const calculateTotalCost = () => {
    // Use the manual override values if they exist, otherwise use calculated values
    const pickToLightCost = formData.attainableAutomation.pickToLight.annualCost !== undefined 
      ? formData.attainableAutomation.pickToLight.annualCost 
      : calculatePickToLightCost();
    
    const packToLightCost = formData.attainableAutomation.packToLight.annualCost !== undefined 
      ? formData.attainableAutomation.packToLight.annualCost 
      : calculatePackToLightCost();
    
    return pickToLightCost + packToLightCost;
  };
  
  // Handle connection count changes
  const handleConnectionCountChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const parsedValue = numericValue ? parseInt(numericValue, 10) : 0;
    handleInputChange(field, parsedValue);
    
    // Reset the annual cost override when connections change
    if (field === "attainableAutomation.pickToLight.connections") {
      handleInputChange("attainableAutomation.pickToLight.annualCost", undefined);
    } else if (field === "attainableAutomation.packToLight.connections") {
      handleInputChange("attainableAutomation.packToLight.annualCost", undefined);
    }
  };
  
  // Handle annual cost changes
  const handleAnnualCostChange = (field: string, value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parsedValue = numericValue ? parseFloat(numericValue) : 0;
    
    // Set the annual cost
    handleInputChange(field, parsedValue);
    
    // If the user is manually entering a cost, turn off the discount for automation
    if (parsedValue > 0) {
      handleInputChange("applyDiscountToAutomation", false);
    }
  };
  
  // Handle remote onboarding fee changes
  const handleRemoteOnboardingFeeChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parsedValue = numericValue ? parseFloat(numericValue) : 0;
    
    // Set the remote onboarding fee
    handleInputChange("attainableAutomation.remoteOnboardingFee", parsedValue);
  };
  
  // Handle Pick to Light tier changes
  const handlePickToLightTierChange = (index: number, field: string, value: string) => {
    const updatedTiers = [...pickToLightTiers];
    
    if (field === 'name') {
      updatedTiers[index].name = value;
    } else if (field === 'fromQty') {
      updatedTiers[index].fromQty = parseInt(value) || 0;
    } else if (field === 'toQty') {
      if (value === '51+' || value.includes('+')) {
        updatedTiers[index].toQty = Number.MAX_SAFE_INTEGER;
      } else {
        updatedTiers[index].toQty = parseInt(value) || 0;
      }
    } else if (field === 'pricePerConnection') {
      updatedTiers[index].pricePerConnection = parseFloat(value) || 0;
    }
    
    setPickToLightTiers(updatedTiers);
  };
  
  // Handle Pack to Light tier changes
  const handlePackToLightTierChange = (index: number, field: string, value: string) => {
    const updatedTiers = [...packToLightTiers];
    
    if (field === 'name') {
      updatedTiers[index].name = value;
    } else if (field === 'fromQty') {
      updatedTiers[index].fromQty = parseInt(value) || 0;
    } else if (field === 'toQty') {
      if (value === '51+' || value.includes('+')) {
        updatedTiers[index].toQty = Number.MAX_SAFE_INTEGER;
      } else {
        updatedTiers[index].toQty = parseInt(value) || 0;
      }
    } else if (field === 'pricePerConnection') {
      updatedTiers[index].pricePerConnection = parseFloat(value) || 0;
    }
    
    setPackToLightTiers(updatedTiers);
  };
  
  // Add a new Pick to Light tier
  const addPickToLightTier = () => {
    const newTier: PricingTier = {
      id: generateId(),
      name: `Tier ${pickToLightTiers.length + 1}`,
      fromQty: 1,
      toQty: 10,
      pricePerConnection: 250
    };
    setPickToLightTiers([...pickToLightTiers, newTier]);
  };
  
  // Remove a Pick to Light tier
  const removePickToLightTier = (index: number) => {
    const updatedTiers = [...pickToLightTiers];
    updatedTiers.splice(index, 1);
    setPickToLightTiers(updatedTiers);
  };
  
  // Save Pick to Light tiers
  const savePickToLightTiers = () => {
    handleInputChange("attainableAutomation.pickToLight.tiers", pickToLightTiers);
    setIsPickToLightTiersDialogOpen(false);
    
    // Reset the annual cost override when tiers change
    handleInputChange("attainableAutomation.pickToLight.annualCost", undefined);
  };
  
  // Add a new Pack to Light tier
  const addPackToLightTier = () => {
    const newTier: PricingTier = {
      id: generateId(),
      name: `Tier ${packToLightTiers.length + 1}`,
      fromQty: 1,
      toQty: 10,
      pricePerConnection: 250
    };
    setPackToLightTiers([...packToLightTiers, newTier]);
  };
  
  // Remove a Pack to Light tier
  const removePackToLightTier = (index: number) => {
    const updatedTiers = [...packToLightTiers];
    updatedTiers.splice(index, 1);
    setPackToLightTiers(updatedTiers);
  };
  
  // Save Pack to Light tiers
  const savePackToLightTiers = () => {
    handleInputChange("attainableAutomation.packToLight.tiers", packToLightTiers);
    setIsPackToLightTiersDialogOpen(false);
    
    // Reset the annual cost override when tiers change
    handleInputChange("attainableAutomation.packToLight.annualCost", undefined);
  };
  
  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="px-6 py-4">
          <CardTitle>Attainable Automation</CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          <div className="space-y-6">
            {/* Pick to Light */}
            <Card className="border">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xl font-semibold">Pick to Light & Receive to Light</h3>
                <Switch
                  id="pickToLightEnabled"
                  checked={formData.attainableAutomation.pickToLight.enabled}
                  onCheckedChange={(checked) => 
                    handleInputChange("attainableAutomation.pickToLight.enabled", checked)
                  }
                />
              </CardHeader>
              
              {formData.attainableAutomation.pickToLight.enabled && (
                <CardContent className="px-6 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Configuration</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsPickToLightTiersDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure Tiers
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickToLightConnections">Number of Connections</Label>
                      <Input
                        id="pickToLightConnections"
                        type="text"
                        value={formatNumber(formData.attainableAutomation.pickToLight.connections)}
                        onChange={(e) => handleConnectionCountChange("attainableAutomation.pickToLight.connections", e.target.value)}
                        className={invalidFields.includes("attainableAutomation.pickToLight.connections") ? "border-red-500" : ""}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pickToLightAnnualCost">
                        Total Annual Cost
                        {formData.attainableAutomation.pickToLight.annualCost !== undefined && (
                          <span className="ml-2 text-xs text-blue-600">(Manual override)</span>
                        )}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="pickToLightAnnualCost"
                          type="text"
                          value={formatNumber(formData.attainableAutomation.pickToLight.annualCost !== undefined 
                            ? formData.attainableAutomation.pickToLight.annualCost 
                            : calculatePickToLightCost())}
                          onChange={(e) => handleAnnualCostChange("attainableAutomation.pickToLight.annualCost", e.target.value)}
                          className="pl-7"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Note: Manually entering a cost will disable the discount.
                      </div>
                    </div>
                  </div>
                  
                  {/* Display current tiers */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Current Pricing Tiers (Monthly):</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2">Tier</th>
                            <th className="text-center pb-2">Range</th>
                            <th className="text-right pb-2">Price/Month</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.attainableAutomation.pickToLight.tiers.sort((a, b) => a.fromQty - b.fromQty).map((tier) => (
                            <tr key={tier.id} className="border-b last:border-0">
                              <td className="py-1">{tier.name}</td>
                              <td className="py-1 text-center">
                                {tier.fromQty} - {tier.toQty === Number.MAX_SAFE_INTEGER ? "∞" : tier.toQty}
                              </td>
                              <td className="py-1 text-right">${tier.pricePerConnection}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Pack to Light */}
            <Card className="border mt-6">
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between space-y-0">
                <h3 className="text-xl font-semibold">Pack to Light</h3>
                <Switch
                  id="packToLightEnabled"
                  checked={formData.attainableAutomation.packToLight.enabled}
                  onCheckedChange={(checked) => 
                    handleInputChange("attainableAutomation.packToLight.enabled", checked)
                  }
                />
              </CardHeader>
              
              {formData.attainableAutomation.packToLight.enabled && (
                <CardContent className="px-6 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Configuration</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsPackToLightTiersDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Configure Tiers
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packToLightConnections">Number of Connections</Label>
                      <Input
                        id="packToLightConnections"
                        type="text"
                        value={formatNumber(formData.attainableAutomation.packToLight.connections)}
                        onChange={(e) => handleConnectionCountChange("attainableAutomation.packToLight.connections", e.target.value)}
                        className={invalidFields.includes("attainableAutomation.packToLight.connections") ? "border-red-500" : ""}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="packToLightAnnualCost">
                        Total Annual Cost
                        {formData.attainableAutomation.packToLight.annualCost !== undefined && (
                          <span className="ml-2 text-xs text-blue-600">(Manual override)</span>
                        )}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="packToLightAnnualCost"
                          type="text"
                          value={formatNumber(formData.attainableAutomation.packToLight.annualCost !== undefined 
                            ? formData.attainableAutomation.packToLight.annualCost 
                            : calculatePackToLightCost())}
                          onChange={(e) => handleAnnualCostChange("attainableAutomation.packToLight.annualCost", e.target.value)}
                          className="pl-7"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Note: Manually entering a cost will disable the discount.
                      </div>
                    </div>
                  </div>
                  
                  {/* Display current tiers */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Current Pricing Tiers (Monthly):</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2">Tier</th>
                            <th className="text-center pb-2">Range</th>
                            <th className="text-right pb-2">Price/Month</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.attainableAutomation.packToLight.tiers.sort((a, b) => a.fromQty - b.fromQty).map((tier) => (
                            <tr key={tier.id} className="border-b last:border-0">
                              <td className="py-1">{tier.name}</td>
                              <td className="py-1 text-center">
                                {tier.fromQty} - {tier.toQty === Number.MAX_SAFE_INTEGER ? "∞" : tier.toQty}
                              </td>
                              <td className="py-1 text-right">${tier.pricePerConnection}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            
            {/* Total Cost */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Automation Cost:</span>
                <span>${formatNumber(calculateTotalCost())}</span>
              </div>
            </div>
            
            {/* One-Time Costs */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Setup Costs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remoteOnboardingFee">Remote Onboarding & Implementation Hardware Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="remoteOnboardingFee"
                      type="text"
                      value={formatNumber(formData.attainableAutomation.remoteOnboardingFee)}
                      onChange={(e) => handleRemoteOnboardingFeeChange(e.target.value)}
                      className={`pl-7 ${invalidFields.includes("attainableAutomation.remoteOnboardingFee") ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="onsiteSupportDays">Onsite Support Days Included</Label>
                  <Input
                    id="onsiteSupportDays"
                    type="text"
                    value={formData.attainableAutomation.onsiteSupportDays}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      const parsedValue = numericValue ? parseInt(numericValue, 10) : 0;
                      handleInputChange("attainableAutomation.onsiteSupportDays", parsedValue);
                    }}
                    className={invalidFields.includes("attainableAutomation.onsiteSupportDays") ? "border-red-500" : ""}
                  />
                </div>
              </div>
            </div>
            
            {/* Apply Discount Checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="applyDiscountToAutomation"
                checked={formData.applyDiscountToAutomation}
                onCheckedChange={(checked) => 
                  handleInputChange("applyDiscountToAutomation", checked)
                }
                disabled={
                  formData.attainableAutomation.pickToLight.annualCost !== undefined || 
                  formData.attainableAutomation.packToLight.annualCost !== undefined
                }
              />
              <label
                htmlFor="applyDiscountToAutomation"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                  formData.attainableAutomation.pickToLight.annualCost !== undefined || 
                  formData.attainableAutomation.packToLight.annualCost !== undefined
                    ? "text-gray-400"
                    : ""
                }`}
              >
                Apply {formData.saasFeeDiscount}% discount to automation connections
                {(formData.attainableAutomation.pickToLight.annualCost !== undefined || 
                  formData.attainableAutomation.packToLight.annualCost !== undefined) && (
                  <span className="ml-2 text-xs text-gray-500">(Disabled due to manual override)</span>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pick to Light Tiers Dialog */}
      <Dialog open={isPickToLightTiersDialogOpen} onOpenChange={setIsPickToLightTiersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Pick to Light & Receive to Light Pricing Tiers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Tier Name</th>
                    <th className="text-center pb-2">From</th>
                    <th className="text-center pb-2">To</th>
                    <th className="text-center pb-2">Price Per Connection</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pickToLightTiers.map((tier, index) => (
                    <tr key={tier.id} className="border-b">
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handlePickToLightTierChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.fromQty}
                          onChange={(e) => handlePickToLightTierChange(index, 'fromQty', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.toQty === Number.MAX_SAFE_INTEGER ? '51+' : tier.toQty}
                          onChange={(e) => {
                            const value = e.target.value;
                            handlePickToLightTierChange(index, 'toQty', value);
                          }}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.pricePerConnection}
                          onChange={(e) => handlePickToLightTierChange(index, 'pricePerConnection', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePickToLightTier(index)}
                          disabled={pickToLightTiers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button onClick={addPickToLightTier} variant="outline">
              Add Tier
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPickToLightTiersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePickToLightTiers}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pack to Light Tiers Dialog */}
      <Dialog open={isPackToLightTiersDialogOpen} onOpenChange={setIsPackToLightTiersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Pack to Light Pricing Tiers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Tier Name</th>
                    <th className="text-center pb-2">From</th>
                    <th className="text-center pb-2">To</th>
                    <th className="text-center pb-2">Price Per Connection</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {packToLightTiers.map((tier, index) => (
                    <tr key={tier.id} className="border-b">
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handlePackToLightTierChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.fromQty}
                          onChange={(e) => handlePackToLightTierChange(index, 'fromQty', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.toQty === Number.MAX_SAFE_INTEGER ? '51+' : tier.toQty}
                          onChange={(e) => {
                            const value = e.target.value;
                            handlePackToLightTierChange(index, 'toQty', value);
                          }}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          type="text"
                          value={tier.pricePerConnection}
                          onChange={(e) => handlePackToLightTierChange(index, 'pricePerConnection', e.target.value)}
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePackToLightTier(index)}
                          disabled={packToLightTiers.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button onClick={addPackToLightTier} variant="outline">
              Add Tier
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackToLightTiersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePackToLightTiers}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 