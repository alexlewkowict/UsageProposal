"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Zap, Users, Briefcase, Building, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImplementationSectionProps {
  formData: any
  handleInputChange: (field: string, value: string | number) => void
  invalidFields: string[]
}

export function ImplementationSection({ formData, handleInputChange, invalidFields }: ImplementationSectionProps) {
  const [editingCustom, setEditingCustom] = useState(false)

  const implementationPackages = [
    { id: "quickStartBrand", name: "QuickStart Brand", icon: Briefcase },
    { id: "quickStart3PL", name: "QuickStart 3PL", icon: Building },
    { id: "standard", name: "Standard", icon: Package },
    { id: "advanced", name: "Advanced", icon: Zap },
    { id: "custom", name: "Custom", icon: Users },
  ]

  const packageDetails = {
    quickStartBrand: {
      onboardingFee: 3000,
      virtualTrainingHours: 12,
      onsiteSupportDays: 0,
      onsiteSupportFee: 2000,
      optionalProfServicesRate: 300,
    },
    quickStart3PL: {
      onboardingFee: 3700,
      virtualTrainingHours: 15,
      onsiteSupportDays: 0,
      onsiteSupportFee: 2000,
      optionalProfServicesRate: 300,
    },
    standard: {
      onboardingFee: 5000,
      virtualTrainingHours: 20,
      onsiteSupportDays: 0,
      onsiteSupportFee: 2000,
      optionalProfServicesRate: 300,
    },
    advanced: {
      onboardingFee: 7500,
      virtualTrainingHours: 30,
      onsiteSupportDays: 2,
      onsiteSupportFee: 2000,
      optionalProfServicesRate: 300,
    },
    custom: {
      onboardingFee: 0,
      virtualTrainingHours: 0,
      onsiteSupportDays: 0,
      onsiteSupportFee: 2000,
      optionalProfServicesRate: 300,
    },
  }

  const formatCurrency = (value: number) => {
    return isNaN(value) ? "$0.00" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  const handleCustomEdit = (field: string, value: string) => {
    handleInputChange(field, value)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Implementation Package</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {implementationPackages.map((pkg) => (
            <PackageTile
              key={pkg.id}
              package={pkg}
              selected={formData.implementationPackage === pkg.id}
              onClick={() => {
                const selectedPackage = packageDetails[pkg.id]
                handleInputChange("implementationPackage", pkg.id)
                Object.entries(selectedPackage).forEach(([key, value]) => {
                  handleInputChange(key, value)
                })
                setEditingCustom(false)
              }}
              isInvalid={invalidFields.includes("implementationPackage")}
            />
          ))}
        </div>
      </div>

      {formData.implementationPackage && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Package Details</h3>
            {formData.implementationPackage === "custom" && (
              <Button variant="ghost" size="sm" onClick={() => setEditingCustom(!editingCustom)}>
                <Pencil className="h-4 w-4 mr-2" />
                {editingCustom ? "Save" : "Edit"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PackageDetailItem
              label="Onboarding Fee"
              value={formData.onboardingFee}
              editable={formData.implementationPackage === "custom" && editingCustom}
              onChange={(value) => handleCustomEdit("onboardingFee", value)}
              format={(value) => formatCurrency(Number(value))}
            />
            <PackageDetailItem
              label="Virtual Training / Implementation Meetings"
              value={formData.virtualTrainingHours}
              suffix="(30-60 min Sessions)"
              editable={formData.implementationPackage === "custom" && editingCustom}
              onChange={(value) => handleCustomEdit("virtualTrainingHours", value)}
            />
            <PackageDetailItem
              label="Onsite Support Days Included"
              value={formData.onsiteSupportDays}
              editable={formData.implementationPackage === "custom" && editingCustom}
              onChange={(value) => handleCustomEdit("onsiteSupportDays", value)}
            />
            <PackageDetailItem
              label="Onsite Support Fee"
              value={formData.onsiteSupportFee}
              editable={formData.implementationPackage === "custom" && editingCustom}
              onChange={(value) => handleCustomEdit("onsiteSupportFee", value)}
              format={(value) => formatCurrency(Number(value))}
            />
            <PackageDetailItem
              label="Optional Professional Services Hourly Rate"
              value={formData.optionalProfServicesRate}
              editable={formData.implementationPackage === "custom" && editingCustom}
              onChange={(value) => handleCustomEdit("optionalProfServicesRate", value)}
              format={(value) => formatCurrency(Number(value))}
            />
          </div>
        </div>
      )}
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

