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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  console.log("ProposalOptionsSection rendering");
  
  // Fetch account executives
  useEffect(() => {
    async function fetchAccountExecutives() {
      console.log("Fetching account executives...");
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/account-executives?t=${timestamp}`);
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          console.error("API error:", response.statusText);
          throw new Error(`Failed to fetch account executives: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("API response data (raw):", JSON.stringify(data));
        
        // Check for Stevie Oliveira
        const stevie = data.find(ae => ae.id === 1 || ae.full_name.includes("Stevie"));
        console.log("Stevie Oliveira data:", stevie);
        
        if (!data || data.length === 0) {
          console.error("No account executives returned from API");
          throw new Error("No account executives found");
        }
        
        // Before setting the state
        console.log("Setting account executives state with data:", JSON.stringify(data));
        setAccountExecutives(data);
      } catch (error) {
        console.error("Error fetching account executives:", error);
        // Don't return hardcoded data, instead show an error message in the UI
        setFetchError("Failed to load account executives. Please try again later.");
        return [];
      }
    }
    
    fetchAccountExecutives().then(data => {
      console.log("Fetched account executives:", data);
    });
  }, [refreshCounter]);
  
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

  // Add this at the beginning of the component
  useEffect(() => {
    // Direct API call to check what's being returned
    async function checkApi() {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/account-executives?t=${timestamp}`);
        const data = await response.json();
        console.log("DIRECT API CALL RESULT:", data);
        
        // Check for Stevie Oliveira
        const stevie = data.find(ae => ae.id === 1 || ae.full_name.includes("Stevie"));
        console.log("DIRECT API CALL - Stevie Oliveira:", stevie);
      } catch (error) {
        console.error("Direct API call error:", error);
      }
    }
    
    checkApi();
  }, [refreshCounter]);

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
        
        {fetchError ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
            {fetchError}
          </div>
        ) : accountExecutives.length === 0 ? (
          <div className="p-4 border rounded">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Loading account executives...</div>
          </div>
        ) : (
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Select an Account Executive:</div>
            <div className="space-y-2">
              {accountExecutives.map((exec, index) => (
                <div 
                  key={`simple-${exec.id || index}`}
                  className={`
                    p-2 border rounded cursor-pointer
                    flex items-center gap-3
                    hover:bg-gray-50
                    ${formData.accountExec === exec.full_name ? "border-primary bg-primary/5" : "border-gray-200"}
                  `}
                  onClick={() => handleInputChange("accountExec", exec.full_name)}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${exec.color || "bg-blue-200"}`}
                  >
                    {exec.initials || exec.full_name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <span>{exec.full_name}</span>
                  {exec.full_name.toLowerCase() === 'alex lewkowict' && <span className="text-yellow-500 ml-1">⭐</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Manual override button */}
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              console.log("Manual override for Alex Lewkowict");
              handleInputChange("accountExec", "Alex Lewkowict");
            }}
          >
            Set to Alex Lewkowict
          </button>
          
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              console.log("Force refreshing account executives");
              setRefreshCounter(prev => prev + 1);
            }}
          >
            Refresh Account Executives
          </button>
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

