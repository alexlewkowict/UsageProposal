"use client"

import type React from "react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

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

export function PaymentDetailsSection({
  formData,
  handleInputChange,
  invalidFields,
}: PaymentDetailsSectionProps) {
  const [showCustomTerm, setShowCustomTerm] = useState(
    formData.contractTerm === "custom"
  )

  const handleContractTermChange = (value: string) => {
    handleInputChange("contractTerm", value)
    setShowCustomTerm(value === "custom")
  }

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    let updatedMethods = [...(formData.paymentMethods || [])]
    
    if (checked) {
      // Add the method if it's not already in the array
      if (!updatedMethods.includes(method)) {
        updatedMethods.push(method)
      }
    } else {
      // Remove the method if it's in the array
      updatedMethods = updatedMethods.filter(m => m !== method)
    }
    
    handleInputChange("paymentMethods", updatedMethods)
  }

  // Set default values if not already set
  if (!formData.contractTerm) {
    handleInputChange("contractTerm", "24")
  }
  
  if (!formData.billingFrequency) {
    handleInputChange("billingFrequency", "quarterly")
  }
  
  if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
    handleInputChange("paymentMethods", ["creditCard"])
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Contract Term</Label>
        <div className="mt-2">
          <RadioGroup
            value={formData.contractTerm}
            onValueChange={handleContractTermChange}
            className={`space-y-2 ${
              invalidFields.includes("contractTerm") ? "border-red-500 p-2 rounded-md border" : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="12" id="term-12" />
              <Label htmlFor="term-12">12 Months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24" id="term-24" />
              <Label htmlFor="term-24">24 Months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="36" id="term-36" />
              <Label htmlFor="term-36">36 Months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="term-custom" />
              <Label htmlFor="term-custom">Custom</Label>
            </div>
            {showCustomTerm && (
              <div className="ml-6 mt-2">
                <Input
                  type="number"
                  placeholder="Enter months"
                  value={formData.customContractTerm || ""}
                  onChange={(e) => handleInputChange("customContractTerm", parseInt(e.target.value) || 0)}
                  className="w-40"
                />
              </div>
            )}
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold">Billing Frequency</Label>
        <div className="mt-2">
          <RadioGroup
            value={formData.billingFrequency}
            onValueChange={(value) => handleInputChange("billingFrequency", value)}
            className={`space-y-2 ${
              invalidFields.includes("billingFrequency") ? "border-red-500 p-2 rounded-md border" : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="freq-monthly" />
              <Label htmlFor="freq-monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quarterly" id="freq-quarterly" />
              <Label htmlFor="freq-quarterly">Quarterly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annually" id="freq-annually" />
              <Label htmlFor="freq-annually">Annually</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold">Payment Method</Label>
        <div className="mt-2">
          <div className={`space-y-2 ${
            invalidFields.includes("paymentMethods") ? "border-red-500 p-2 rounded-md border" : ""
          }`}>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="method-ach" 
                checked={formData.paymentMethods?.includes("ach")}
                onCheckedChange={(checked) => handlePaymentMethodChange("ach", checked === true)}
              />
              <Label htmlFor="method-ach">ACH</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="method-creditCard" 
                checked={formData.paymentMethods?.includes("creditCard")}
                onCheckedChange={(checked) => handlePaymentMethodChange("creditCard", checked === true)}
              />
              <Label htmlFor="method-creditCard">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="method-check" 
                checked={formData.paymentMethods?.includes("check")}
                onCheckedChange={(checked) => handlePaymentMethodChange("check", checked === true)}
              />
              <Label htmlFor="method-check">Check</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

