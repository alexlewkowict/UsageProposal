"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js'

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
  package: string;
  onboarding_fee: number;
  virtual_training_sessions: number;
  onsite_support_days: number;
  onsite_support_fee: number;
  professional_services_hourly_rate: number;
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
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from('Implementation Packages')
          .select('*')
          .order('id');

        if (error) {
          console.error('Error fetching implementation packages:', error);
          // Fallback to mock data if there's an error
          setPackages([
            {
              id: "1",
              package: "QuickStart Brand",
              onboarding_fee: 3000,
              virtual_training_sessions: 12,
              onsite_support_days: 0,
              onsite_support_fee: 2000,
              professional_services_hourly_rate: 300
            },
            {
              id: "2",
              package: "QuickStart 3PL",
              onboarding_fee: 3700,
              virtual_training_sessions: 15,
              onsite_support_days: 0,
              onsite_support_fee: 2000,
              professional_services_hourly_rate: 300
            },
            {
              id: "3",
              package: "Standard",
              onboarding_fee: 5000,
              virtual_training_sessions: 20,
              onsite_support_days: 0,
              onsite_support_fee: 2000,
              professional_services_hourly_rate: 300
            },
            {
              id: "4",
              package: "Advanced",
              onboarding_fee: 7500,
              virtual_training_sessions: 30,
              onsite_support_days: 2,
              onsite_support_fee: 2000,
              professional_services_hourly_rate: 300
            },
            {
              id: "5",
              package: "Custom",
              onboarding_fee: 0,
              virtual_training_sessions: 0,
              onsite_support_days: 0,
              onsite_support_fee: 2000,
              professional_services_hourly_rate: 300
            }
          ]);
        } else {
          setPackages(data);
        }
      } catch (error) {
        console.error('Error in fetchPackages:', error);
      }
    }

    fetchPackages();
  }, [])

  useEffect(() => {
    if (formData.implementationPackage && packages.length > 0) {
      const selected = packages.find(pkg => pkg.id === formData.implementationPackage)
      setSelectedPackage(selected || null)
      
      // If values differ from the package defaults, mark as customized
      if (selected) {
        const isModified = 
          Number(formData.onboardingFee) !== selected.onboarding_fee ||
          Number(formData.virtualTrainingHours) !== selected.virtual_training_sessions ||
          Number(formData.onsiteSupportDays) !== selected.onsite_support_days ||
          Number(formData.onsiteSupportFee) !== selected.onsite_support_fee ||
          Number(formData.optionalProfServicesRate) !== selected.professional_services_hourly_rate
        
        setIsCustomized(isModified)
      }
    }
  }, [formData.implementationPackage, packages, formData])

  const handlePackageSelect = (packageId: string) => {
    handleInputChange("implementationPackage", packageId);
    
    const selected = packages.find(pkg => pkg.id === packageId);
    if (selected) {
      // Set default values from the selected package
      handleInputChange("virtualTrainingHours", selected.virtual_training_sessions);
      handleInputChange("onsiteSupportDays", selected.onsite_support_days);
      handleInputChange("onsiteSupportFee", selected.onsite_support_fee);
      handleInputChange("optionalProfServicesRate", selected.professional_services_hourly_rate);
      
      // Set the onboarding fee from the package
      handleInputChange("onboardingFee", selected.onboarding_fee);
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
    
    // Update the form data
    handleInputChange(field, numericValue);
    
    // Mark as customized if any field is changed
    setIsCustomized(true);
  };

  // Calculate the fee for display purposes
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
        
        {packages.map((pkg) => (
          <div key={pkg.id} className="border rounded-lg p-4 mt-4">
            <RadioGroup
              value={formData.implementationPackage}
              onValueChange={handlePackageSelect}
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value={pkg.id} id={`package-${pkg.id}`} />
                <div className="w-full">
                  <Label htmlFor={`package-${pkg.id}`} className="font-medium">{pkg.package}</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    {pkg.package === "QuickStart Brand" && "Basic implementation for brand owners"}
                    {pkg.package === "QuickStart 3PL" && "Basic implementation for 3PL providers"}
                    {pkg.package === "Standard" && "Standard implementation with basic training"}
                    {pkg.package === "Advanced" && "Advanced implementation with extensive training and onsite support"}
                    {pkg.package === "Custom" && "Tailored implementation package with custom options"}
                  </p>
                  
                  {formData.implementationPackage === pkg.id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="onboardingFee">Onboarding Fee</Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <Input
                            id="onboardingFee"
                            type="text"
                            value={formData.onboardingFee}
                            onChange={(e) => handleCustomValueChange("onboardingFee", e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Calculated: ${calculatedFee.toLocaleString()} (Virtual: ${(250 * Number(formData.virtualTrainingHours)).toLocaleString()} + Onsite: ${(Number(formData.onsiteSupportDays) * Number(formData.onsiteSupportFee)).toLocaleString()})
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="virtualTrainingHours">Virtual Training Hours</Label>
                        <Input
                          id="virtualTrainingHours"
                          type="text"
                          value={formData.virtualTrainingHours}
                          onChange={(e) => handleCustomValueChange("virtualTrainingHours", e.target.value)}
                          className={invalidFields.includes("virtualTrainingHours") ? "border-red-500" : ""}
                        />
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
                        <Label htmlFor="onsiteSupportFee">Onsite Support Fee</Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <Input
                            id="onsiteSupportFee"
                            type="text"
                            value={formData.onsiteSupportFee}
                            onChange={(e) => handleCustomValueChange("onsiteSupportFee", e.target.value)}
                            className={`pl-8 ${invalidFields.includes("onsiteSupportFee") ? "border-red-500" : ""}`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="optionalProfServicesRate">Optional Prof. Services Rate</Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <Input
                            id="optionalProfServicesRate"
                            type="text"
                            value={formData.optionalProfServicesRate}
                            onChange={(e) => handleCustomValueChange("optionalProfServicesRate", e.target.value)}
                            className={`pl-8 ${invalidFields.includes("optionalProfServicesRate") ? "border-red-500" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.implementationPackage === pkg.id && isCustomized && (
                    <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                      <p>This package has been customized from the default values.</p>
                      <p>Onboarding Fee = $250 × {formData.virtualTrainingHours} Virtual Hours + {formData.onsiteSupportDays} Onsite Days × ${formData.onsiteSupportFee}</p>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )
}

