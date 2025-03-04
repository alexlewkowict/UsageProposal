"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

interface ImplementationSectionProps {
  formData: {
    implementationPackage: string;
    onboardingFee: string;
    virtualTrainingHours: string;
    onsiteSupportDays: string;
    onsiteSupportFee: string;
    optionalProfServicesRate: string;
  };
  handleInputChange: (field: string, value: string | number | boolean) => void;
  invalidFields: string[];
}

interface ImplementationPackage {
  id: string;
  name: string;
  description: string;
  onboarding_fee: number;
  virtual_training_hours: number;
  onsite_support_days: number;
  onsite_support_fee: number;
  optional_prof_services_rate: number;
}

export function ImplementationSection({
  formData,
  handleInputChange,
  invalidFields,
}: ImplementationSectionProps) {
  const [packages, setPackages] = useState<ImplementationPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<ImplementationPackage | null>(null)
  const [isCustomized, setIsCustomized] = useState(false)

  useEffect(() => {
    // Mock implementation packages data based on Supabase table structure
    const mockPackages = [
      {
        id: "1",
        name: "QuickStart Brand",
        description: "Basic implementation for brand owners",
        onboarding_fee: 3000,
        virtual_training_hours: 12,
        onsite_support_days: 0,
        onsite_support_fee: 2000,
        optional_prof_services_rate: 300
      },
      {
        id: "2",
        name: "QuickStart 3PL",
        description: "Basic implementation for 3PL providers",
        onboarding_fee: 3700,
        virtual_training_hours: 15,
        onsite_support_days: 0,
        onsite_support_fee: 2000,
        optional_prof_services_rate: 300
      },
      {
        id: "3",
        name: "Standard",
        description: "Standard implementation package suitable for most customers",
        onboarding_fee: 5000,
        virtual_training_hours: 20,
        onsite_support_days: 0,
        onsite_support_fee: 2000,
        optional_prof_services_rate: 300
      },
      {
        id: "4",
        name: "Advanced",
        description: "Enhanced implementation with additional training and support",
        onboarding_fee: 7500,
        virtual_training_hours: 30,
        onsite_support_days: 2,
        onsite_support_fee: 2000,
        optional_prof_services_rate: 300
      },
      {
        id: "5",
        name: "Custom",
        description: "Tailored implementation package based on specific requirements",
        onboarding_fee: 0,
        virtual_training_hours: 0,
        onsite_support_days: 0,
        onsite_support_fee: 2000,
        optional_prof_services_rate: 300
      }
    ];
    
    setPackages(mockPackages);
  }, [])

  useEffect(() => {
    if (formData.implementationPackage && packages.length > 0) {
      const selected = packages.find(pkg => pkg.id === formData.implementationPackage)
      setSelectedPackage(selected || null)
      
      // If values differ from the package defaults, mark as customized
      if (selected) {
        const isModified = 
          Number(formData.onboardingFee) !== selected.onboarding_fee ||
          Number(formData.virtualTrainingHours) !== selected.virtual_training_hours ||
          Number(formData.onsiteSupportDays) !== selected.onsite_support_days ||
          Number(formData.onsiteSupportFee) !== selected.onsite_support_fee ||
          Number(formData.optionalProfServicesRate) !== selected.optional_prof_services_rate
        
        setIsCustomized(isModified)
      }
    }
  }, [formData.implementationPackage, packages, formData])

  const handlePackageSelect = (packageId: string) => {
    handleInputChange("implementationPackage", packageId);
    
    const selected = packages.find(pkg => pkg.id === packageId);
    if (selected) {
      // Set default values from the selected package
      handleInputChange("virtualTrainingHours", selected.virtual_training_hours);
      handleInputChange("onsiteSupportDays", selected.onsite_support_days);
      handleInputChange("onsiteSupportFee", selected.onsite_support_fee);
      handleInputChange("optionalProfServicesRate", selected.optional_prof_services_rate);
      
      // Calculate onboarding fee using the same logic as calculateOnboardingFee
      const virtualHours = selected.virtual_training_hours || 0;
      const onsiteDays = selected.onsite_support_days || 0;
      const onsiteFee = selected.onsite_support_fee || 0;
      
      const virtualTrainingCost = 250 * virtualHours;
      const onsiteSupportCost = onsiteFee * onsiteDays;
      const totalFee = virtualTrainingCost + onsiteSupportCost;
      
      console.log('Package selected, calculated fee:', {
        virtualHours,
        onsiteDays,
        onsiteFee,
        virtualTrainingCost,
        onsiteSupportCost,
        totalFee
      });
      
      // Update the onboarding fee
      handleInputChange("onboardingFee", totalFee);
      setIsCustomized(false);
    }
  };

  const calculateOnboardingFee = () => {
    // Get values from form data, ensuring they're numbers
    const virtualHours = Number(formData.virtualTrainingHours) || 0;
    const onsiteDays = Number(formData.onsiteSupportDays) || 0;
    const onsiteFee = Number(formData.onsiteSupportFee) || 0;
    
    // Calculate virtual training cost: $250 per hour
    const virtualTrainingCost = 250 * virtualHours;
    
    // Calculate onsite support cost: onsite fee per day
    const onsiteSupportCost = onsiteFee * onsiteDays;
    
    // Total fee is the sum of both costs
    const totalFee = virtualTrainingCost + onsiteSupportCost;
    
    console.log('Calculating fee:', {
      virtualHours,
      onsiteDays,
      onsiteFee,
      virtualTrainingCost,
      onsiteSupportCost,
      totalFee
    });
    
    return totalFee;
  };

  const handleCustomValueChange = (field: string, value: string) => {
    // Convert empty string to 0, otherwise parse as number
    let numericValue;
    if (value === "") {
      numericValue = 0;
    } else {
      // Remove any non-numeric characters except decimal point
      const cleanedValue = value.replace(/[^\d.]/g, '');
      numericValue = parseFloat(cleanedValue) || 0;
    }
    
    console.log(`Field ${field} changed to:`, { 
      rawValue: value, 
      cleanedValue: numericValue 
    });
    
    // Update the form data
    handleInputChange(field, numericValue);
    
    // Mark as customized, but don't recalculate onboarding fee if that's what's being edited
    if (field !== "onboardingFee") {
      setIsCustomized(true);
    } else {
      // Only mark as customized if the onboarding fee differs from the calculated value
      const calculatedValue = calculateOnboardingFee();
      setIsCustomized(numericValue !== calculatedValue);
    }
    
    // Don't auto-calculate onboarding fee here, let the useEffect handle it
  };

  // Update the useEffect to always update the onboarding fee when related fields change
  useEffect(() => {
    // Always recalculate when virtual hours, onsite days, or onsite fee changes
    const newFee = calculateOnboardingFee();
    console.log('Recalculating fee due to dependency changes:', newFee);
    
    // Update the onboarding fee to match the calculated value
    handleInputChange("onboardingFee", newFee);
    
    // If this is due to a package selection, don't mark as customized
    if (!isCustomized && formData.implementationPackage) {
      setIsCustomized(false);
    }
  }, [formData.virtualTrainingHours, formData.onsiteSupportDays, formData.onsiteSupportFee]);

  // In the component's render function, add a calculated fee variable
  const calculatedFee = (() => {
    const virtualHours = Number(formData.virtualTrainingHours) || 0;
    const onsiteDays = Number(formData.onsiteSupportDays) || 0;
    const onsiteFee = Number(formData.onsiteSupportFee) || 0;
    
    return (250 * virtualHours) + (onsiteDays * onsiteFee);
  })();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Implementation Package</Label>
        <div className="mt-2">
          <RadioGroup
            value={formData.implementationPackage}
            onValueChange={handlePackageSelect}
            className={`space-y-4 ${invalidFields.includes("implementationPackage") ? "border-red-500 p-2 rounded-md border" : ""}`}
          >
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-start space-x-2 p-3 border rounded-md">
                <RadioGroupItem value={pkg.id} id={pkg.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={pkg.id} className="font-medium text-base cursor-pointer">
                    {pkg.name}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                  
                  {formData.implementationPackage === pkg.id && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Onboarding Fee</Label>
                        <div className="relative mt-1">
                          <Input
                            value={formData.onboardingFee}
                            onChange={(e) => handleCustomValueChange("onboardingFee", e.target.value)}
                            className="pl-6"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Calculated: ${calculatedFee} (Virtual: ${250 * (Number(formData.virtualTrainingHours) || 0)} + Onsite: ${(Number(formData.onsiteSupportDays) || 0) * (Number(formData.onsiteSupportFee) || 0)})
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Virtual Training Hours</Label>
                        <Input
                          value={formData.virtualTrainingHours}
                          onChange={(e) => handleCustomValueChange("virtualTrainingHours", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Onsite Support Days</Label>
                        <Input
                          value={formData.onsiteSupportDays}
                          onChange={(e) => handleCustomValueChange("onsiteSupportDays", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Onsite Support Fee</Label>
                        <div className="relative mt-1">
                          <Input
                            value={formData.onsiteSupportFee}
                            onChange={(e) => handleCustomValueChange("onsiteSupportFee", e.target.value)}
                            className="pl-6"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Optional Prof. Services Rate</Label>
                        <div className="relative mt-1">
                          <Input
                            value={formData.optionalProfServicesRate}
                            onChange={(e) => handleCustomValueChange("optionalProfServicesRate", e.target.value)}
                            className="pl-6"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                        </div>
                      </div>
                      
                      {isCustomized && (
                        <div className="col-span-2 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                          <p>This package has been customized from the default values.</p>
                          <p className="mt-1">Onboarding Fee = $250 × {formData.virtualTrainingHours} Virtual Hours + {formData.onsiteSupportDays} Onsite Days × ${formData.onsiteSupportFee}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}


