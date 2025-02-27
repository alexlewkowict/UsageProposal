"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Zap, Users, Briefcase, Building, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

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

interface ImplementationSectionProps {
  formData: {
    implementationPackage: string;
    onboardingFee: string | number;
    virtualTrainingHours: string | number;
    onsiteSupportDays: string | number;
    onsiteSupportFee: string | number;
    optionalProfServicesRate: string | number;
  };
  handleInputChange: (field: string, value: string | number) => void;
  invalidFields: string[];
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
    handleInputChange("implementationPackage", packageId)
    
    const selected = packages.find(pkg => pkg.id === packageId)
    if (selected) {
      // Set default values from the selected package, but calculate onboarding fee
      handleInputChange("virtualTrainingHours", selected.virtual_training_hours)
      handleInputChange("onsiteSupportDays", selected.onsite_support_days)
      handleInputChange("onsiteSupportFee", selected.onsite_support_fee)
      handleInputChange("optionalProfServicesRate", selected.optional_prof_services_rate)
      
      // Calculate onboarding fee based on the formula
      const virtualHours = selected.virtual_training_hours || 0;
      const onsiteDays = selected.onsite_support_days || 0;
      const onsiteFee = selected.onsite_support_fee || 0;
      const calculatedFee = (250 * virtualHours) + (onsiteDays * onsiteFee);
      
      console.log('Package selected, calculated fee:', {
        virtualHours,
        onsiteDays,
        onsiteFee,
        calculatedFee
      });
      
      handleInputChange("onboardingFee", calculatedFee)
      setIsCustomized(false)
    }
  }

  const calculateOnboardingFee = () => {
    const virtualHours = Number(formData.virtualTrainingHours) || 0;
    const onsiteDays = Number(formData.onsiteSupportDays) || 0;
    const onsiteFee = Number(formData.onsiteSupportFee) || 0;
    
    console.log('Calculating fee:', {
      virtualHours,
      onsiteDays,
      onsiteFee,
      virtualCost: 250 * virtualHours,
      onsiteCost: onsiteDays * onsiteFee,
      total: (250 * virtualHours) + (onsiteDays * onsiteFee)
    });
    
    return (250 * virtualHours) + (onsiteDays * onsiteFee);
  };

  const handleCustomValueChange = (field: string, value: string) => {
    // Parse the value as a number, defaulting to 0 if it's not a valid number
    const numericValue = value === "" ? 0 : Number(value);
    console.log(`Field ${field} changed to:`, { rawValue: value, parsedValue: numericValue });
    
    handleInputChange(field, numericValue);
    setIsCustomized(true);
    
    // Auto-calculate onboarding fee when related fields change
    if (field === "virtualTrainingHours" || field === "onsiteSupportDays" || field === "onsiteSupportFee") {
      const newFee = calculateOnboardingFee();
      console.log('New calculated fee:', newFee);
      handleInputChange("onboardingFee", newFee);
    }
  };

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

interface PackageTileProps {
  package: { id: string; name: string; icon: React.ElementType }
  selected: boolean
  onClick: () => void
  isInvalid: boolean
}

function PackageTile({ package: pkg, selected, onClick, isInvalid }: PackageTileProps) {
  const Icon = pkg.icon
  return (
    <div
      className={`
        p-4 border rounded-lg cursor-pointer transition-all
        flex flex-col items-center justify-center text-center gap-2
        hover:bg-gray-50
        ${selected ? "border-primary border-2 bg-primary/5" : "border-gray-200"}
        ${isInvalid ? "border-red-500" : ""}
      `}
      onClick={onClick}
    >
      <Icon className={`h-8 w-8 ${selected ? "text-primary" : "text-gray-500"}`} />
      <span className="text-sm font-medium">{pkg.name}</span>
    </div>
  )
}

interface PackageDetailItemProps {
  label: string
  value: string | number
  suffix?: string
  editable: boolean
  onChange: (value: string) => void
  format?: (value: string | number) => string
}

function PackageDetailItem({ label, value, suffix, editable, onChange, format }: PackageDetailItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const displayValue = format ? format(value) : value.toString()

  return (
    <div>
      <p className="font-medium">{label}</p>
      {editable ? (
        <div className="flex items-center">
          <Input value={value.toString()} onChange={handleChange} className="w-24 mr-2" />
          {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        </div>
      ) : (
        <p>
          {displayValue} {suffix}
        </p>
      )}
    </div>
  )
}

