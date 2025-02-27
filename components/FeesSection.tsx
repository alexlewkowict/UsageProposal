"use client"

import type React from "react"
import type { ChangeEvent } from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeesSectionProps {
  formData: {
    saasFee: {
      frequency: string;
      pallets: { value: number };
      cases: { value: number };
      eaches: { value: number };
    };
    storeConnections: number;
    saasFeeDiscount: number;
    storeConnectionPrice: number;
  };
  handleInputChange: (field: string, value: string | number) => void;
  handleSaasFeeChange: (type: "pallets" | "cases" | "eaches", value: number) => void;
  handleFrequencyChange: (frequency: string) => void;
  handleStoreConnectionPriceChange: (value: number) => void;
  invalidFields: string[];
}

interface PricingTier {
  tier: string
  lower_limit: number
  upper_limit: number
  platform_fee_list_price: number
  platform_fee_sales_price: number
  shipped_unit_list_price: number | null
  shipped_unit_sales_price: number | null
  shipped_unit_overage_rate: number
}

export function FeesSection({
  formData,
  handleInputChange,
  handleSaasFeeChange,
  handleFrequencyChange,
  handleStoreConnectionPriceChange,
  invalidFields,
}: FeesSectionProps) {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [currentTier, setCurrentTier] = useState<PricingTier | null>(null)

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ]

  useEffect(() => {
    async function fetchPricingTiers() {
      try {
        console.log("Fetching pricing tiers...")
        const response = await fetch("/api/pricing-tiers")
        console.log("API Response status:", response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Raw pricing tiers data:", data)
        
        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data)
          throw new Error("Expected array of pricing tiers")
        }
        
        if (data.length === 0) {
          console.warn("Received empty pricing tiers array")
        }
        
        console.log("Setting pricing tiers:", data)
        setPricingTiers(data)
      } catch (error) {
        console.error("Failed to fetch pricing tiers:", error)
        toast({
          title: "Error",
          description: "Failed to load pricing tiers. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchPricingTiers()
  }, [])

  useEffect(() => {
    console.log("Current pricing tiers state:", pricingTiers)
    if (pricingTiers.length === 0) {
      console.warn("No pricing tiers loaded yet")
    }
  }, [pricingTiers])

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US")
  }

  const handleInputChangeWithFormat = (type: "pallets" | "cases" | "eaches", value: string) => {
    const numericValue = Number.parseInt(value.replace(/,/g, ""), 10) || 0
    handleSaasFeeChange(type, numericValue)
  }

  const calculateTotalUnits = (type: "pallets" | "cases" | "eaches") => {
    const value = formData.saasFee[type].value
    const unitValue = type === "pallets" ? 5 : type === "cases" ? 2 : 1
    return value * unitValue
  }

  const calculateAnnualUnits = (units: number) => {
    const frequencyMultiplier =
      formData.saasFee.frequency === "daily"
        ? 365
        : formData.saasFee.frequency === "weekly"
          ? 52
          : formData.saasFee.frequency === "monthly"
            ? 12
            : 1
    return units * frequencyMultiplier
  }

  const totalPallets = calculateTotalUnits("pallets")
  const totalCases = calculateTotalUnits("cases")
  const totalEaches = calculateTotalUnits("eaches")
  const grandTotal = totalPallets + totalCases + totalEaches
  const annualGrandTotal = calculateAnnualUnits(grandTotal)

  useEffect(() => {
    console.log("Calculating tier for annual grand total:", annualGrandTotal)
    console.log("Available pricing tiers:", pricingTiers)
    
    if (pricingTiers.length === 0) {
      console.warn("No pricing tiers available to match against")
      setCurrentTier(null)
      return
    }
    
    const numericAnnualTotal = Number(annualGrandTotal)
    
    const tier = pricingTiers.find((tier: PricingTier) => {
      const lowerLimit = Number(tier.lower_limit)
      const upperLimit = Number(tier.upper_limit)
      
      const isInRange = numericAnnualTotal >= lowerLimit && numericAnnualTotal <= upperLimit
      console.log(`Checking tier ${tier.tier}: ${lowerLimit}-${upperLimit}, annual total: ${numericAnnualTotal}, matches: ${isInRange}`)
      return isInRange
    })
    
    console.log("Selected tier:", tier)
    
    if (!tier && pricingTiers.length > 0) {
      console.log("No tier matched the annual total. Finding closest tier...")
      
      // Find the closest tier if no exact match
      let closestTier = pricingTiers[0];
      let minDistance = Math.abs(Number(closestTier.upper_limit) - numericAnnualTotal);
      
      pricingTiers.forEach((t: PricingTier) => {
        const distance = Math.min(
          Math.abs(Number(t.lower_limit) - numericAnnualTotal),
          Math.abs(Number(t.upper_limit) - numericAnnualTotal)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestTier = t;
        }
      });
      
      console.log("Using closest tier:", closestTier);
      setCurrentTier(closestTier);
    } else {
      setCurrentTier(tier || null);
    }
  }, [annualGrandTotal, pricingTiers])

  const getFrequencyMultiplier = () => {
    switch (formData.saasFee.frequency) {
      case "daily":
        return 365
      case "weekly":
        return 52
      case "monthly":
        return 12
      case "annually":
        return 1
      default:
        return 1
    }
  }

  const calculateAnnualFee = () => {
    if (!currentTier || pricingTiers.length === 0) return 0;
    
    // Calculate discount multiplier (e.g., 20% discount = multiply by 0.8)
    const discountMultiplier = 1 - (Number(formData.saasFeeDiscount) / 100);
    
    let totalFee = 0;
    let remainingUnits = annualGrandTotal;
    
    // Sort tiers by lower_limit to ensure proper progression
    const sortedTiers = [...pricingTiers].sort((a, b) => 
      Number(a.lower_limit) - Number(b.lower_limit)
    );
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      
      if (i === 0 && remainingUnits > 0) {
        // First tier - use platform fee for all units up to upper limit
        const unitsInTier = Math.min(remainingUnits, Number(tier.upper_limit));
        // Apply discount to platform fee list price
        const discountedPlatformFee = Number(tier.platform_fee_list_price) * discountMultiplier;
        totalFee += discountedPlatformFee;
        remainingUnits -= unitsInTier;
        console.log(`Tier ${tier.tier}: ${unitsInTier} units at platform fee $${tier.platform_fee_list_price} with ${formData.saasFeeDiscount}% discount = $${discountedPlatformFee.toFixed(2)}, remaining: ${remainingUnits}`);
      } 
      
      if (i > 0 && remainingUnits > 0) {
        // Subsequent tiers - use shipped_unit_list_price for units in this tier's range
        const tierLimit = nextTier 
          ? Number(nextTier.lower_limit) - Number(tier.lower_limit)
          : Number.MAX_SAFE_INTEGER;
        
        const unitsInTier = Math.min(remainingUnits, tierLimit);
        // Apply discount to unit list price
        const tierUnitPrice = Number(tier.shipped_unit_list_price) || 0;
        const discountedUnitPrice = tierUnitPrice * discountMultiplier;
        
        totalFee += unitsInTier * discountedUnitPrice;
        remainingUnits -= unitsInTier;
        
        console.log(`Tier ${tier.tier}: ${unitsInTier} units at $${tierUnitPrice} with ${formData.saasFeeDiscount}% discount = $${discountedUnitPrice.toFixed(3)} per unit = $${(unitsInTier * discountedUnitPrice).toFixed(2)}, remaining: ${remainingUnits}`);
      }
      
      if (remainingUnits <= 0) break;
    }
    
    // Round to nearest dollar
    return Math.round(totalFee);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-semibold">SaaS Fee</Label>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <div className="flex space-x-2">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                className={`px-3 py-1 rounded-md text-sm ${
                  formData.saasFee.frequency === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
                onClick={() => handleFrequencyChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["pallets", "cases", "eaches"] as const).map((type) => (
            <TotalUnitTile
              key={type}
              icon={
                type === "pallets" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect x="2" y="13" width="20" height="8" />
                    <line x1="2" y1="13" x2="22" y2="13" />
                    <line x1="6" y1="13" x2="6" y2="21" />
                    <line x1="10" y1="13" x2="10" y2="21" />
                    <line x1="14" y1="13" x2="14" y2="21" />
                    <line x1="18" y1="13" x2="18" y2="21" />
                  </svg>
                ) : type === "cases" ? (
                  <Package className="h-6 w-6" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M9 3L5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-4-4H9z" />
                    <path d="M9 3v4h6V3" />
                    <path d="M12 11v6" />
                    <path d="M8 11v6" />
                    <path d="M16 11v6" />
                  </svg>
                )
              }
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              quantity={formData.saasFee[type].value}
              equivalentUnits={type === "pallets" ? 5 : type === "cases" ? 2 : 1}
              total={calculateTotalUnits(type)}
              onChange={(value) => handleInputChangeWithFormat(type, value)}
              isInvalid={invalidFields.includes("saasFee")}
            />
          ))}
        </div>

        <div className="mt-4 p-4 bg-primary text-primary-foreground rounded-lg">
          <div className="font-bold text-lg">Annual Grand Total: {formatNumber(annualGrandTotal)} units</div>
          <div className="text-sm">
            {formData.saasFee.frequency.charAt(0).toUpperCase() + formData.saasFee.frequency.slice(1)}:{" "}
            {formatNumber(grandTotal)} units x {getFrequencyMultiplier()}{" "}
            {formData.saasFee.frequency === "annually"
              ? "Year"
              : formData.saasFee.frequency === "monthly"
                ? "Months"
                : formData.saasFee.frequency === "weekly"
                  ? "Weeks"
                  : "Days"}
          </div>
        </div>

        {currentTier ? (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Current Pricing Tier: {currentTier.tier}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Annual Fee</Label>
                  <div className="text-2xl font-bold">${formatNumber(calculateAnnualFee())}</div>
                </div>
                {currentTier.shipped_unit_sales_price && (
                  <div>
                    <Label>Current Tier Unit Price</Label>
                    <div className="text-2xl font-bold">${currentTier.shipped_unit_sales_price.toFixed(3)}</div>
                  </div>
                )}
                <div>
                  <Label>Overage Rate</Label>
                  <div className="text-2xl font-bold">${currentTier.shipped_unit_overage_rate.toFixed(3)}</div>
                </div>
                <div>
                  <Label>Annual Unit Range</Label>
                  <div className="text-lg">
                    {formatNumber(currentTier.lower_limit)} - {formatNumber(currentTier.upper_limit)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                <div className="font-semibold mb-1">Fee Calculation Breakdown:</div>
                
                {formData.saasFeeDiscount > 0 && (
                  <div className="mb-2 text-blue-600">
                    Applying {formData.saasFeeDiscount}% discount to all prices
                  </div>
                )}
                
                {pricingTiers.map((tier, index) => {
                  // Calculate discount multiplier
                  const discountMultiplier = 1 - (Number(formData.saasFeeDiscount) / 100);
                  
                  if (index === 0) {
                    const discountedPlatformFee = Number(tier.platform_fee_list_price) * discountMultiplier;
                    // Round to 2 decimal places
                    const roundedListPrice = Math.round(tier.platform_fee_list_price * 100) / 100;
                    const roundedDiscountedPrice = Math.round(discountedPlatformFee * 100) / 100;
                    
                    return (
                      <div key={tier.tier}>
                        Base fee (up to {formatNumber(tier.upper_limit)} units): ${formatNumber(roundedListPrice)}
                        {formData.saasFeeDiscount > 0 && (
                          <span className="text-blue-600"> → ${formatNumber(roundedDiscountedPrice)} after discount</span>
                        )}
                      </div>
                    );
                  } else if (annualGrandTotal > Number(tier.lower_limit)) {
                    const prevTier = pricingTiers[index - 1];
                    const tierLimit = index < pricingTiers.length - 1 
                      ? Number(pricingTiers[index + 1].lower_limit) - Number(tier.lower_limit)
                      : annualGrandTotal - Number(tier.lower_limit);
                    
                    const unitsInTier = Math.min(
                      annualGrandTotal - Number(tier.lower_limit),
                      tierLimit
                    );
                    
                    if (unitsInTier > 0) {
                      const listPrice = Number(tier.shipped_unit_list_price) || 0;
                      const discountedPrice = listPrice * discountMultiplier;
                      // Round the total cost to 2 decimal places
                      const totalCost = Math.round(unitsInTier * discountedPrice * 100) / 100;
                      
                      return (
                        <div key={tier.tier}>
                          {formatNumber(unitsInTier)} units at ${listPrice.toFixed(3)}
                          {formData.saasFeeDiscount > 0 && (
                            <span className="text-blue-600"> → ${discountedPrice.toFixed(3)} after discount</span>
                          )}
                          : ${formatNumber(totalCost)}
                        </div>
                      );
                    }
                  }
                  return null;
                })}
                <div className="mt-1 font-semibold">
                  Total Annual Fee: ${formatNumber(calculateAnnualFee())}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            No pricing tier found for the current annual grand total.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={`p-4 border rounded-lg flex flex-col space-y-2 ${invalidFields.includes("storeConnections") ? "border-red-500" : ""}`}>
          <div className="flex items-center space-x-2">
            <div className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div className="font-medium">Store Connections</div>
          </div>
          
          <div className="flex space-x-2 mb-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                formData.storeConnectionPrice > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              onClick={() => handleStoreConnectionPriceChange(30)}
            >
              Paid
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                formData.storeConnectionPrice === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              onClick={() => handleStoreConnectionPriceChange(0)}
            >
              Free
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-1/2">
              <Input
                value={formatNumber(formData.storeConnections)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  handleInputChange("storeConnections", Number.parseInt(e.target.value.replace(/,/g, "")) || 0)
                }
                className="text-right"
              />
            </div>
            <span className="text-gray-500 font-medium">×</span>
            <div className="relative w-1/2">
              <Input
                value={formData.storeConnectionPrice}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  handleStoreConnectionPriceChange(Number(value) || 0);
                }}
                className="text-right pl-6"
                disabled={formData.storeConnectionPrice === 0}
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {formData.storeConnectionPrice === 0 
              ? "Free store connections" 
              : `Total: $${formatNumber(formData.storeConnections * formData.storeConnectionPrice)}`}
          </div>
        </div>

        <div className="p-4 border rounded-lg flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="19" y1="5" x2="5" y2="19"></line>
                <circle cx="6.5" cy="6.5" r="2.5"></circle>
                <circle cx="17.5" cy="17.5" r="2.5"></circle>
              </svg>
            </div>
            <div className="font-medium">SaaS Fee Discount</div>
          </div>
          <div className="relative">
            <Input
              value={formData.saasFeeDiscount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                handleInputChange("saasFeeDiscount", Number.parseInt(e.target.value) || 0)
              }
              className="text-right pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
          </div>
          <div className="text-sm text-gray-500">
            Applies to all pricing tiers
          </div>
        </div>
      </div>
    </div>
  )
}

interface TotalUnitTileProps {
  icon: React.ReactNode
  label: string
  quantity: number
  equivalentUnits: number
  total: number
  onChange: (value: string) => void
  isInvalid: boolean
  key?: string
}

function TotalUnitTile({ icon, label, quantity, equivalentUnits, total, onChange, isInvalid, key }: TotalUnitTileProps) {
  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US")
  }

  return (
    <div className={`p-4 border rounded-lg flex flex-col space-y-2 ${isInvalid ? "border-red-500" : ""}`}>
      <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <div className="font-medium">{label}</div>
      </div>
      <Input
        value={formatNumber(quantity)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="text-right"
      />
      <div className="text-sm text-gray-500">
        {formatNumber(quantity)} x {equivalentUnits} = {formatNumber(total)}
      </div>
    </div>
  )
}

