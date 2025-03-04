import React from "react"
import { Label } from "@/components/ui/label"
import { FileText, Package, Zap, Lightbulb, Box, Truck } from "lucide-react"

interface ProposalOptionsSectionProps {
  selectedOptions: {
    cover: boolean;
    whatsAUnit: boolean;
    flexibleGrowth: boolean;
    pickAndReceiveToLight: boolean;
    packToLight: boolean;
    attainableAutomationPricing: boolean;
  };
  handleOptionSelect: (option: string, value: boolean) => void;
  invalidFields: string[];
}

export function ProposalOptionsSection({
  selectedOptions,
  handleOptionSelect,
  invalidFields,
}: ProposalOptionsSectionProps) {
  // Update the handler to toggle the boolean value
  const handleOptionToggle = (option: string) => {
    // Get the current value and toggle it
    const currentValue = selectedOptions[option as keyof typeof selectedOptions];
    handleOptionSelect(option, !currentValue);
  };

  return (
    <div className="space-y-4">
      <Label>Proposal Options</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <OptionTile
          title="Cover"
          icon={<FileText className="h-8 w-8" />}
          selected={selectedOptions.cover}
          onClick={() => handleOptionToggle("cover")}
        />
        <OptionTile
          title="What's a Unit?"
          icon={<Box className="h-8 w-8" />}
          selected={selectedOptions.whatsAUnit}
          onClick={() => handleOptionToggle("whatsAUnit")}
        />
        <OptionTile
          title="Flexible Growth"
          icon={<Zap className="h-8 w-8" />}
          selected={selectedOptions.flexibleGrowth}
          onClick={() => handleOptionToggle("flexibleGrowth")}
        />
        <OptionTile
          title="Pick & Receive to Light"
          icon={<Lightbulb className="h-8 w-8" />}
          selected={selectedOptions.pickAndReceiveToLight}
          onClick={() => handleOptionToggle("pickAndReceiveToLight")}
        />
        <OptionTile
          title="Pack to Light"
          icon={<Package className="h-8 w-8" />}
          selected={selectedOptions.packToLight}
          onClick={() => handleOptionToggle("packToLight")}
        />
        <OptionTile
          title="Attainable Automation"
          icon={<Truck className="h-8 w-8" />}
          selected={selectedOptions.attainableAutomationPricing}
          onClick={() => handleOptionToggle("attainableAutomationPricing")}
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

