import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BusinessInfoSectionProps {
  formData: any
  handleInputChange: (field: string, value: string) => void
  invalidFields: string[]
}

export function BusinessInfoSection({ formData, handleInputChange, invalidFields }: BusinessInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accountExec">Account Executive</Label>
        <Select onValueChange={(value) => handleInputChange("accountExec", value)} value={formData.accountExec}>
          <SelectTrigger id="accountExec" className={invalidFields.includes("accountExec") ? "border-red-500" : ""}>
            <SelectValue placeholder="Select Account Executive" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ae1">AE 1</SelectItem>
            <SelectItem value="ae2">AE 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opportunityName">Opportunity Name</Label>
        <Select onValueChange={(value) => handleInputChange("opportunityName", value)} value={formData.opportunityName}>
          <SelectTrigger
            id="opportunityName"
            className={invalidFields.includes("opportunityName") ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select Opportunity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opp1">Opportunity 1</SelectItem>
            <SelectItem value="opp2">Opportunity 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.opportunityName && (
        <div className="space-y-2">
          <Label htmlFor="friendlyBusinessName">Friendly Business Name</Label>
          <Input
            id="friendlyBusinessName"
            value={formData.friendlyBusinessName}
            onChange={(e) => handleInputChange("friendlyBusinessName", e.target.value)}
            className={invalidFields.includes("friendlyBusinessName") ? "border-red-500" : ""}
          />
        </div>
      )}
    </div>
  )
}

