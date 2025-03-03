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
        id: "standard",
        name: "Standard Implementation",
        description: "Basic setup with standard training",
        onboarding_fee: 5000,
        virtual_training_hours: 4,
        onsite_support_days: 0,
        onsite_support_fee: 0,
        optional_prof_services_rate: 300
      },
      {
        id: "professional",
        name: "Professional Implementation",
        description: "Enhanced setup with additional training and support",
        onboarding_fee: 10000,
        virtual_training_hours: 8,
        onsite_support_days: 1,
        onsite_support_fee: 2500,
        optional_prof_services_rate: 300
      },
      {
        id: "enterprise",
        name: "Enterprise Implementation",
        description: "Comprehensive implementation with extensive training and onsite support",
        onboarding_fee: 15000,
        virtual_training_hours: 12,
        onsite_support_days: 3,
        onsite_support_fee: 7500,
        optional_prof_services_rate: 300
      },
      {
        id: "custom",
        name: "Custom Implementation",
        description: "Tailored implementation package with custom options",
        onboarding_fee: 0,
        virtual_training_hours: 0,
        onsite_support_days: 0,
        onsite_support_fee: 0,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                <RadioGroup
                  value={formData.implementationPackage}
                  onValueChange={(value) => {
                    handleInputChange("implementationPackage", value);
                    if (value !== "custom") {
                      const selectedPackage = packages.find(p => p.id === value);
                      if (selectedPackage) {
                        handleInputChange("onboardingFee", selectedPackage.onboarding_fee);
                        handleInputChange("virtualTrainingHours", selectedPackage.virtual_training_hours);
                        handleInputChange("onsiteSupportDays", selectedPackage.onsite_support_days);
                        handleInputChange("onsiteSupportFee", selectedPackage.onsite_support_fee);
                      }
                    }
                  }}
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value={pkg.id} id={`package-${pkg.id}`} />
                    <div>
                      <Label htmlFor={`package-${pkg.id}`} className="font-medium">{pkg.name}</Label>
                      <p className="text-sm text-gray-500">{pkg.description}</p>
                      {pkg.id !== "custom" && (
                        <div className="mt-2 text-sm">
                          <p>Onboarding Fee: ${pkg.onboarding_fee}</p>
                          <p>Virtual Training: {pkg.virtual_training_hours} hours</p>
                          <p>Onsite Support: {pkg.onsite_support_days} days</p>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>
      </div>

      {formData.implementationPackage === "custom" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="virtualTrainingHours">Virtual Training Hours</Label>
                  <Input
                    id="virtualTrainingHours"
                    type="text"
                    value={formData.virtualTrainingHours}
                    onChange={(e) => handleCustomValueChange("virtualTrainingHours", e.target.value)}
                    className={invalidFields.includes("virtualTrainingHours") ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-gray-500 mt-1">$250 per hour</p>
                </div>
                <div>
                  <Label htmlFor="onsiteSupportDays">Onsite Support Days</Label>
                  <Input
                    id="onsiteSupportDays"
                    type="text"
                    value={formData.onsiteSupportDays}
                    onChange={(e) => handleCustomValueChange("onsiteSupportDays", e.target.value)}
                    className={invalidFields.includes("onsiteSupportDays") ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="onsiteSupportFee">Onsite Support Fee (per day)</Label>
                  <Input
                    id="onsiteSupportFee"
                    type="text"
                    value={formData.onsiteSupportFee}
                    onChange={(e) => handleCustomValueChange("onsiteSupportFee", e.target.value)}
                    className={invalidFields.includes("onsiteSupportFee") ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="optionalProfServicesRate">Optional Prof. Services Rate (per hour)</Label>
                  <Input
                    id="optionalProfServicesRate"
                    type="text"
                    value={formData.optionalProfServicesRate}
                    onChange={(e) => handleCustomValueChange("optionalProfServicesRate", e.target.value)}
                    className={invalidFields.includes("optionalProfServicesRate") ? "border-red-500" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <Label htmlFor="onboardingFee">Total Onboarding Fee</Label>
        <Input
          id="onboardingFee"
          type="text"
          value={`$${Number(formData.onboardingFee).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          disabled
          className="bg-gray-50"
        />
        {isCustomized && formData.implementationPackage !== "custom" && (
          <p className="text-sm text-amber-600 mt-1">
            This package has been customized from the default values.
          </p>
        )}
      </div>
    </div>
  )
}

