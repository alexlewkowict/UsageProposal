import type React from "react"
import { Label } from "@/components/ui/label"
import { Calendar, CreditCard, Wallet } from "lucide-react"

interface PaymentDetailsSectionProps {
  formData: any
  handleInputChange: (field: string, value: string) => void
}

export function PaymentDetailsSection({ formData, handleInputChange }: PaymentDetailsSectionProps) {
  const termOptions = ["12", "24", "36", "48"]
  const paymentTermsOptions = ["Monthly", "Quarterly", "Annual"]
  const paymentTypeOptions = ["Credit Card", "ACH", "Wire Transfer"]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Deal Term</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {termOptions.map((term) => (
            <OptionTile
              key={term}
              title={term}
              icon={<Calendar className="h-6 w-6" />}
              selected={formData.term === term}
              onClick={() => handleInputChange("term", term)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Terms</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {paymentTermsOptions.map((term) => (
            <OptionTile
              key={term}
              title={term}
              icon={<Wallet className="h-6 w-6" />}
              selected={formData.paymentTerms === term}
              onClick={() => handleInputChange("paymentTerms", term)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {paymentTypeOptions.map((type) => (
            <OptionTile
              key={type}
              title={type}
              icon={<CreditCard className="h-6 w-6" />}
              selected={formData.paymentType === type}
              onClick={() => handleInputChange("paymentType", type)}
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
}

function OptionTile({ title, icon, selected, onClick }: OptionTileProps) {
  return (
    <div
      className={`
        p-4 border rounded-lg cursor-pointer transition-all
        flex flex-col items-center justify-center text-center gap-2
        hover:bg-gray-50
        ${selected ? "border-primary border-2 bg-primary/5" : "border-gray-200"}
      `}
      onClick={onClick}
    >
      <div className={`${selected ? "text-primary" : "text-gray-500"}`}>{icon}</div>
      <span className="text-sm font-medium">{title}</span>
    </div>
  )
}

