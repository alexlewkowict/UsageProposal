import React, { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { FileText, Package, Zap, Lightbulb, Box, Truck } from "lucide-react"
import { useAccountExecutive } from "@/hooks/useAccountExecutive"
import { getAccountExecutives, AccountExecutive } from "@/services/account-executives"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export function ProposalOptionsSection({
  selectedOptions,
  handleOptionSelect,
  invalidFields,
  formData,
  handleInputChange,
}: ProposalOptionsSectionProps) {
  const autoSelectedAccountExec = useAccountExecutive();
  const [accountExecutives, setAccountExecutives] = useState<AccountExecutive[]>([]);
  
  // Fetch account executives
  useEffect(() => {
    async function fetchAccountExecutives() {
      console.log("Fetching account executives...");
      const data = await getAccountExecutives();
      console.log(`Fetched ${data.length} account executives:`, data.map(ae => ae.full_name).join(", "));
      setAccountExecutives(data);
    }
    
    fetchAccountExecutives();
  }, []);
  
  // Use the auto-selected account exec when the component mounts
  useEffect(() => {
    console.log("Auto-selected account exec:", autoSelectedAccountExec);
    console.log("Current form data account exec:", formData.accountExec);
    
    if (autoSelectedAccountExec && !formData.accountExec) {
      console.log("Setting account exec to:", autoSelectedAccountExec);
      handleInputChange("accountExec", autoSelectedAccountExec);
    }
  }, [autoSelectedAccountExec, formData.accountExec, handleInputChange]);

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
      <div className="mb-4">
        <Label htmlFor="accountExec">Account Executive</Label>
        <Select
          value={formData.accountExec || ""}
          onValueChange={(value) => handleInputChange("accountExec", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Account Executive" />
          </SelectTrigger>
          <SelectContent>
            {accountExecutives.length === 0 ? (
              <SelectItem value="loading" disabled>Loading account executives...</SelectItem>
            ) : (
              accountExecutives.map((exec) => (
                <SelectItem key={exec.id} value={exec.full_name}>
                  {exec.full_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {autoSelectedAccountExec && formData.accountExec !== autoSelectedAccountExec && (
          <p className="text-xs text-blue-600 mt-1">
            Suggested: {autoSelectedAccountExec} (based on your Google account)
          </p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {accountExecutives.length} account executives available
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

