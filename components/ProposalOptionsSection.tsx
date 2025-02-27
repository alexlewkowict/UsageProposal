import type React from "react"
import { Label } from "@/components/ui/label"
import { FileText, Package, Zap, Lightbulb, Box, Truck } from "lucide-react"

interface ProposalOptionsSectionProps {
  selectedOptions: any
  handleOptionSelect: (option: string) => void
}

export function ProposalOptionsSection({ selectedOptions, handleOptionSelect }: ProposalOptionsSectionProps) {
  return (
    <div className="space-y-4">
      <Label>Proposal Options</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <OptionTile
          title="Cover"
          icon={<FileText className="h-8 w-8" />}
          selected={selectedOptions.cover}
          onClick={() => handleOptionSelect("cover")}
        />
        <OptionTile
          title="What's a Unit?"
          icon={<Box className="h-8 w-8" />}
          selected={selectedOptions.whatsAUnit}
          onClick={() => handleOptionSelect("whatsAUnit")}
        />
        <OptionTile
          title="Flexible Growth"
          icon={<Zap className="h-8 w-8" />}
          selected={selectedOptions.flexibleGrowth}
          onClick={() => handleOptionSelect("flexibleGrowth")}
        />
        <OptionTile
          title="Pick & Receive to Light"
          icon={<Lightbulb className="h-8 w-8" />}
          selected={selectedOptions.pickAndReceiveToLight}
          onClick={() => handleOptionSelect("pickAndReceiveToLight")}
        />
        <OptionTile
          title="Pack to Light"
          icon={<Package className="h-8 w-8" />}
          selected={selectedOptions.packToLight}
          onClick={() => handleOptionSelect("packToLight")}
        />
        <OptionTile
          title="Attainable Automation"
          icon={<Truck className="h-8 w-8" />}
          selected={selectedOptions.attainableAutomationPricing}
          onClick={() => handleOptionSelect("attainableAutomationPricing")}
        />
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

