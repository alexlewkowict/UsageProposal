"use client"

import type React from "react"
import type { ChangeEvent } from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { StoreConnectionTiersEditor } from "./StoreConnectionTiersEditor"

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
    freeStoreConnections: number;
    applyDiscountToStoreConnections: boolean;
    storeConnectionTiers: StoreConnectionTier[];
    calculatedTiers: CalculatedTier[];
  };
  handleInputChange: (field: string, value: string | number) => void;
  handleSaasFeeChange: (type: "pallets" | "cases" | "eaches", value: number) => void;
  handleFrequencyChange: (frequency: string) => void;
  handleStoreConnectionPriceChange: (value: number) => void;
  handleStoreConnectionTiersChange: (tiers: StoreConnectionTier[]) => void;
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

interface StoreConnectionTier {
  id: string;
  name: string;
  fromQty: number;
  toQty: number;
  pricePerStore: number;
}

interface CalculatedTier {
  name: string;
  unitsInTier: number;
  isPlatformFee: boolean;
  originalFee: number | null;
  originalRate: number | null;
  discountedFee: number | null;
  discountedRate: number | null;
  tierTotal: number;
}

export function FeesSection({
  formData,
  handleInputChange,
  handleSaasFeeChange,
  handleFrequencyChange,
  handleStoreConnectionPriceChange,
  handleStoreConnectionTiersChange,
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

  const calculateAnnualUnits = () => {
    const palletsValue = formData.saasFee.pallets.value || 0;
    const casesValue = formData.saasFee.cases.value || 0;
    const eachesValue = formData.saasFee.eaches.value || 0;
    
    // Calculate based on frequency
    const multiplier = formData.saasFee.frequency === 'monthly' ? 12 :
                       formData.saasFee.frequency === 'weekly' ? 52 :
                       formData.saasFee.frequency === 'daily' ? 365 : 1;
    
    return (palletsValue * 5 + casesValue * 2 + eachesValue) * multiplier;
  };

  const totalPallets = calculateTotalUnits("pallets")
  const totalCases = calculateTotalUnits("cases")
  const totalEaches = calculateTotalUnits("eaches")
  const grandTotal = totalPallets + totalCases + totalEaches
  const annualGrandTotal = calculateAnnualUnits()

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
        const discountedPlatformFee = Number(tier.platform_fee_sales_price) * discountMultiplier;
        totalFee += discountedPlatformFee;
        remainingUnits -= unitsInTier;
        console.log(`Tier ${tier.tier}: ${unitsInTier} units at platform fee $${tier.platform_fee_sales_price} with ${formData.saasFeeDiscount}% discount = $${discountedPlatformFee.toFixed(2)}, remaining: ${remainingUnits}`);
      } 
      
      if (i > 0 && remainingUnits > 0) {
        // Subsequent tiers - use shipped_unit_sales_price for units in this tier's range
        const tierLimit = nextTier 
          ? Number(nextTier.lower_limit) - Number(tier.lower_limit)
          : Number.MAX_SAFE_INTEGER;
        
        const unitsInTier = Math.min(remainingUnits, tierLimit);
        // Apply discount to unit list price
        const tierUnitPrice = Number(tier.shipped_unit_sales_price) || 0;
        const discountedUnitPrice = tierUnitPrice * discountMultiplier;
        
        totalFee += unitsInTier * discountedUnitPrice;
        remainingUnits -= unitsInTier;
        
        console.log(`Tier ${tier.tier}: ${unitsInTier} units at $${tierUnitPrice} with ${formData.saasFeeDiscount}% discount = $${discountedUnitPrice.toFixed(3)} per unit = $${(unitsInTier * discountedUnitPrice).toFixed(2)}, remaining: ${remainingUnits}`);
      }
      
      if (remainingUnits <= 0) break;
    }
    
    // Add store connection costs (monthly * 12 for annual)
    const storeConnectionsQty = Number(formData.storeConnections) || 0;
    const storeConnectionPrice = Number(formData.storeConnectionPrice) || 0;
    let storeConnectionCost = storeConnectionsQty * storeConnectionPrice * 12;
    
    // Apply discount to store connections if enabled
    if (formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0) {
      storeConnectionCost *= discountMultiplier;
    }
    
    totalFee += storeConnectionCost;
    
    // Round to nearest dollar
    return Math.round(totalFee);
  };

  const calculateTotalStores = () => {
    return formData.storeConnections || 0;
  };

  const calculateStoreConnectionsCost = (storeConnections: number, tiers: StoreConnectionTier[], discount: number) => {
    if (storeConnections <= 0) {
      return 0;
    }
    
    let totalCost = 0;
    
    // Sort tiers by fromQty to ensure proper calculation
    const sortedTiers = [...tiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // For each store, find which tier it belongs to and add its cost
    for (let storeNum = 1; storeNum <= storeConnections; storeNum++) {
      // Find the tier this store belongs to
      // For a tier with fromQty=0, toQty=5, it should include stores 0-5
      // For a tier with fromQty=6, toQty=50, it should include stores 6-50
      const tier = sortedTiers.find(t => storeNum >= t.fromQty && storeNum <= t.toQty);
      
      if (tier) {
        // Add the cost for this store
        totalCost += tier.pricePerStore * 12; // Annual cost
      }
    }
    
    // Apply discount if enabled
    if (formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0) {
      const discountMultiplier = 1 - (Number(formData.saasFeeDiscount) / 100);
      totalCost = totalCost * discountMultiplier;
    }
    
    return totalCost;
  };

  const getStoreConnectionsBreakdown = () => {
    if (formData.storeConnections <= 0) {
      return [];
    }
    
    // Sort tiers by fromQty to ensure proper calculation
    const sortedTiers = [...formData.storeConnectionTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    // Create a map to count stores in each tier
    const tierCounts = new Map();
    
    // For each store, find which tier it belongs to and count it
    for (let storeNum = 1; storeNum <= formData.storeConnections; storeNum++) {
      // Find the tier this store belongs to
      // For a tier with fromQty=0, toQty=5, it should include stores 0-5
      // For a tier with fromQty=6, toQty=50, it should include stores 6-50
      const tier = sortedTiers.find(t => storeNum >= t.fromQty && storeNum <= t.toQty);
      
      if (tier) {
        // Increment the count for this tier
        const currentCount = tierCounts.get(tier.id) || 0;
        tierCounts.set(tier.id, currentCount + 1);
      }
    }
    
    // Convert the map to the breakdown format
    const breakdown = [];
    
    for (const tier of sortedTiers) {
      const storesInTier = tierCounts.get(tier.id) || 0;
      
      if (storesInTier > 0) {
        // Calculate cost for this tier
        const tierCost = storesInTier * tier.pricePerStore * 12; // Annual cost
        
        // Apply discount if enabled
        let discountedCost = tierCost;
        if (formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0) {
          const discountMultiplier = 1 - (Number(formData.saasFeeDiscount) / 100);
          discountedCost = tierCost * discountMultiplier;
        }
        
        breakdown.push({
          tier: tier.name,
          storesInTier,
          pricePerStore: tier.pricePerStore,
          annualCost: tierCost,
          discountedCost: discountedCost,
          hasDiscount: formData.applyDiscountToStoreConnections && formData.saasFeeDiscount > 0
        });
      }
    }
    
    return breakdown;
  };

  // Add the handleStoreConnectionsChange function
  const handleStoreConnectionsChange = (value: string) => {
    const parsedValue = parseInt(value.replace(/,/g, ""), 10);
    handleInputChange("storeConnections", isNaN(parsedValue) ? 0 : parsedValue);
  };

  // Add the handleFormSubmit function to prevent form submission on ENTER
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
  };

  const calculateTierBreakdown = (annualUnits: number, pricingTiers: PricingTier[], discount: number) => {
    if (!pricingTiers || pricingTiers.length === 0) {
      console.log('No pricing tiers available');
      return [];
    }
    
    // Sort tiers by lower_limit
    const sortedTiers = [...pricingTiers].sort((a, b) => a.lower_limit - b.lower_limit);
    
    let remainingUnits = annualUnits;
    const calculatedTiers = [];
    let currentTierIndex = 0;
    
    // First, handle the base tier (platform fee)
    if (sortedTiers.length > 0 && remainingUnits > 0) {
      const baseTier = sortedTiers[0];
      const unitsInBaseTier = Math.min(remainingUnits, baseTier.upper_limit);
      
      // Base tier uses platform fee
      const platformFee = baseTier.platform_fee_list_price;
      const discountMultiplier = (100 - discount) / 100;
      const discountedFee = platformFee * discountMultiplier;
      
      calculatedTiers.push({
        name: "Base fee",
        unitsInTier: unitsInBaseTier,
        isPlatformFee: true,
        originalFee: platformFee,
        originalRate: null,
        discountedFee,
        discountedRate: null,
        tierTotal: discountedFee,
      });
      
      remainingUnits -= unitsInBaseTier;
      currentTierIndex++;
    }
    
    // Then handle subsequent tiers (per-unit pricing)
    while (remainingUnits > 0 && currentTierIndex < sortedTiers.length) {
      const tier = sortedTiers[currentTierIndex];
      const nextTier = currentTierIndex + 1 < sortedTiers.length ? sortedTiers[currentTierIndex + 1] : null;
      
      const tierLimit = nextTier ? nextTier.lower_limit - tier.lower_limit : Number.MAX_SAFE_INTEGER;
      const unitsInTier = Math.min(remainingUnits, tierLimit);
      
      if (unitsInTier <= 0) {
        currentTierIndex++;
        continue;
      }
      
      // Use shipped_unit_list_price for per-unit pricing
      const unitRate = tier.shipped_unit_list_price;
      const discountMultiplier = (100 - discount) / 100;
      const discountedRate = unitRate * discountMultiplier;
      const tierTotal = unitsInTier * discountedRate;
      
      calculatedTiers.push({
        name: tier.tier,
        unitsInTier,
        isPlatformFee: false,
        originalFee: null,
        originalRate: unitRate,
        discountedFee: null,
        discountedRate,
        tierTotal,
      });
      
      remainingUnits -= unitsInTier;
      currentTierIndex++;
    }
    
    return calculatedTiers;
  };

  // Then update your form data with the calculated tiers
  const handleTierCalculation = (calculatedTiers: CalculatedTier[]) => {
    handleInputChange("calculatedTiers", calculatedTiers);
  };

  // Add this useEffect to calculate tiers whenever relevant values change
  useEffect(() => {
    // Calculate annual units
    const annualUnits = calculateAnnualUnits();
    
    // Only proceed if we have pricing tiers and annual units
    if (pricingTiers.length > 0 && annualUnits > 0) {
      console.log('Calculating tiers for', annualUnits, 'units with discount', formData.saasFeeDiscount);
      
      // Calculate the tier breakdown
      const tiers = calculateTierBreakdown(annualUnits, pricingTiers, formData.saasFeeDiscount);
      
      // Update the form data with calculated tiers
      if (tiers && tiers.length > 0) {
        handleInputChange("calculatedTiers", tiers);
      }
    }
  }, [formData.saasFee.pallets.value, formData.saasFee.cases.value, formData.saasFee.eaches.value, 
      formData.saasFeeDiscount, pricingTiers, formData.saasFee.frequency]);

  // Add this useEffect to update the storeConnectionsCost whenever relevant values change
  useEffect(() => {
    // Calculate store connections cost when relevant values change
    const cost = calculateStoreConnectionsCost(
      formData.storeConnections,
      formData.storeConnectionTiers,
      formData.applyDiscountToStoreConnections ? formData.saasFeeDiscount : 0
    );
    
    console.log('Calculated store connections cost:', cost);
    
    // Make sure we're using the correct handler function
    handleInputChange("storeConnectionsCost", cost);
  }, [
    formData.storeConnections, 
    formData.storeConnectionTiers, 
    formData.applyDiscountToStoreConnections, 
    formData.saasFeeDiscount
  ]);

  return (
    <div className="space-y-6" onSubmit={handleFormSubmit}>
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
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            No pricing tier found for the current annual grand total.
          </div>
        )}
      </div>

      <div className="p-4 border rounded-lg space-y-3">
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
          <div className="font-medium">Discount</div>
        </div>
        
        <div className="relative">
          <Input
            type="number"
            value={formData.saasFeeDiscount}
            onChange={(e) => handleInputChange("saasFeeDiscount", Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className="pr-8"
            min="0"
            max="100"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
        </div>
      </div>

      <div className={`p-4 border rounded-lg flex flex-col space-y-3 ${invalidFields.includes("storeConnections") ? "border-red-500" : ""}`}>
        <div className="flex items-center justify-between">
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Configure Tiers
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Store Connection Tiers</DialogTitle>
                <DialogDescription>
                  Configure pricing tiers for store connections.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <StoreConnectionTiersEditor 
                  tiers={formData.storeConnectionTiers} 
                  onChange={handleStoreConnectionTiersChange}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={() => {
                    // Find the close button in the dialog
                    const dialogCloseButton = document.querySelector('[data-radix-dialog-close]');
                    if (dialogCloseButton instanceof HTMLElement) {
                      dialogCloseButton.click();
                    }
                  }}
                >
                  {document.querySelector('[data-has-changes="true"]') ? 'Save' : 'Close'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-2">
          <Label>Total Store Connections</Label>
          <Input
            type="text"
            value={formatNumber(formData.storeConnections)}
            onChange={(e) => handleStoreConnectionsChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className={invalidFields.includes("storeConnections") ? "border-red-500" : ""}
          />
        </div>
        
        <div className="mt-2 space-y-2">
          <div className="text-sm font-medium">Pricing Tiers Summary</div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Tier</th>
                  <th className="text-right pb-2">Range</th>
                  <th className="text-right pb-2">Price/Store</th>
                </tr>
              </thead>
              <tbody>
                {formData.storeConnectionTiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-gray-200 last:border-0">
                    <td className="py-2">{tier.name}</td>
                    <td className="text-right py-2">
                      {tier.fromQty} - {tier.toQty === Number.MAX_SAFE_INTEGER ? "∞" : tier.toQty}
                    </td>
                    <td className="text-right py-2">${tier.pricePerStore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-3 font-medium">
            <span>Total Stores:</span>
            <span>{calculateTotalStores()}</span>
          </div>
          
          <div className="flex justify-between items-center font-medium">
            <span>Annual Cost:</span>
            <span>${formatNumber(calculateStoreConnectionsCost(formData.storeConnections, formData.storeConnectionTiers, formData.applyDiscountToStoreConnections ? formData.saasFeeDiscount : 0))}</span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Label htmlFor="applyToStoreConnections" className="text-sm text-gray-700">
              Apply discount to store connections
            </Label>
            <Switch
              id="applyToStoreConnections"
              checked={formData.applyDiscountToStoreConnections}
              onCheckedChange={(checked) => 
                handleInputChange("applyDiscountToStoreConnections", checked)
              }
            />
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className={`p-4 border rounded-lg flex flex-col space-y-2 ${isInvalid ? "border-red-500" : ""}`}>
      <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <div className="font-medium">{label}</div>
      </div>
      <Input
        value={formatNumber(quantity)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-right"
      />
      <div className="text-sm text-gray-500">
        {formatNumber(quantity)} x {equivalentUnits} = {formatNumber(total)}
      </div>
    </div>
  )
}

