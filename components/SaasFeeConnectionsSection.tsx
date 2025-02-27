import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"

interface SaasFeeConnectionsSectionProps {
  formData: any
  handleInputChange: (field: string, value: string | number) => void
  handleSaasFeeChange: (type: "pallets" | "cases" | "eaches", value: number) => void
  handleFrequencyChange: (frequency: string) => void
  invalidFields: string[]
}

export function SaasFeeConnectionsSection({
  formData,
  handleInputChange,
  handleSaasFeeChange,
  handleFrequencyChange,
  invalidFields,
}: SaasFeeConnectionsSectionProps) {
  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "annually", label: "Annually" },
  ]

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeConnections">Store Connections</Label>
        <Input
          id="storeConnections"
          type="number"
          value={formData.storeConnections}
          onChange={(e) => handleInputChange("storeConnections", Number.parseInt(e.target.value) || 0)}
          className={invalidFields.includes("storeConnections") ? "border-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="saasFeeDiscount">SaaS Fee Discount</Label>
        <div className="relative">
          <Input
            id="saasFeeDiscount"
            type="number"
            value={formData.saasFeeDiscount}
            onChange={(e) => handleInputChange("saasFeeDiscount", e.target.value)}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
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
}

function TotalUnitTile({ icon, label, quantity, equivalentUnits, total, onChange, isInvalid }: TotalUnitTileProps) {
  const formatNumber = (value: number) => {
    return value.toLocaleString("en-US")
  }

  return (
    <div className={`p-4 border rounded-lg flex flex-col space-y-2 ${isInvalid ? "border-red-500" : ""}`}>
      <div className="flex items-center space-x-2">
        <div className="text-primary">{icon}</div>
        <div className="font-medium">{label}</div>
      </div>
      <Input value={formatNumber(quantity)} onChange={(e) => onChange(e.target.value)} className="text-right" />
      <div className="text-sm text-gray-500">
        {formatNumber(quantity)} x {equivalentUnits} = {formatNumber(total)}
      </div>
    </div>
  )
}

