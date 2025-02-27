"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Calendar, CreditCard, Wallet } from "lucide-react"

interface PaymentDetailsSectionProps {
  formData: {
    contractTerm: string;
    billingFrequency: string;
    paymentMethods: string[];
    customContractTerm?: number;
  };
  handleInputChange: (field: string, value: string | number | string[]) => void;
  invalidFields: string[];
}

export function PaymentDetailsSection({ formData, handleInputChange, invalidFields }: PaymentDetailsSectionProps) {
  const termOptions = ["12", "24", "36", "48"]
  const paymentTermsOptions = [
    { value: "monthly", label: "Monthly", disabled: false },
    { value: "quarterly", label: "Quarterly", disabled: false },
    { value: "annually", label: "Annual", disabled: false },
  ]
  const paymentTypeOptions = [
    { value: "creditCard", label: "Credit Card" },
    { value: "ach", label: "ACH" },
    { value: "check", label: "Check" }
  ]

  // Set default values if not already set
  useEffect(() => {
    if (!formData.contractTerm) {
      handleInputChange("contractTerm", "24")
    }
    
    if (!formData.billingFrequency) {
      handleInputChange("billingFrequency", "quarterly")
    }
    
    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      handleInputChange("paymentMethods", ["creditCard"])
    }
  }, [])

  const handlePaymentMethodToggle = (method: string) => {
    let updatedMethods = [...(formData.paymentMethods || [])]
    
    if (updatedMethods.includes(method)) {
      // Only remove if there will still be at least one method selected
      if (updatedMethods.length > 1) {
        updatedMethods = updatedMethods.filter(m => m !== method)
      }
    } else {
      updatedMethods.push(method)
    }
    
    handleInputChange("paymentMethods", updatedMethods)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Contract Term</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {termOptions.map((term) => (
            <OptionTile
              key={term}
              title={`${term} Months`}
              icon={<Calendar className="h-6 w-6" />}
              selected={formData.contractTerm === term}
              onClick={() => handleInputChange("contractTerm", term)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Billing Frequency</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {paymentTermsOptions.map((term) => (
            <OptionTile
              key={term.value}
              title={term.label}
              icon={<Wallet className="h-6 w-6" />}
              selected={formData.billingFrequency === term.value}
              onClick={() => handleInputChange("billingFrequency", term.value)}
              disabled={term.disabled}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method (select one or more)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {paymentTypeOptions.map((type) => (
            <OptionTile
              key={type.value}
              title={type.label}
              icon={<CreditCard className="h-6 w-6" />}
              selected={formData.paymentMethods?.includes(type.value)}
              onClick={() => handlePaymentMethodToggle(type.value)}
              multiSelect={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface OptionTileProps {
  title: string
  icon: React.ReactNode
  selected: boolean
  onClick: () => void
  disabled?: boolean
  multiSelect?: boolean
}

function OptionTile({ title, icon, selected, onClick, disabled = false, multiSelect = false }: OptionTileProps) {
  return (
    <div
      className={`
        p-4 border rounded-lg transition-all
        flex flex-col items-center justify-center text-center gap-2
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
        ${selected ? "border-primary border-2 bg-primary/5" : "border-gray-200"}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <div className={`${selected ? "text-primary" : "text-gray-500"} relative`}>
        {icon}
        {multiSelect && selected && (
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            ✓
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </div>
  )
}

