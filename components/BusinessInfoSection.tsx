"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import React from 'react'

// Define proper types for the form data
interface FormData {
  accountExec: string
  opportunityName: string
  friendlyBusinessName: string
}

interface BusinessInfoSectionProps {
  formData: FormData
  handleInputChange: (field: string, value: string) => void
  invalidFields: string[]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 70%)`
}

export function BusinessInfoSection({ formData, handleInputChange, invalidFields }: BusinessInfoSectionProps) {
  const [accountExecutives, setAccountExecutives] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAccountExec, setOpenAccountExec] = useState(false)
  const [openOpportunity, setOpenOpportunity] = useState(false)

  useEffect(() => {
    async function fetchAccountExecutives() {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching account executives")
        const response = await fetch("/api/account-executives")
        const data = await response.json()

        console.log("Received response:", response.status, response.statusText)
        console.log("Received data:", JSON.stringify(data, null, 2))

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${data.error || "Unknown error"}`)
        }

        if (Array.isArray(data)) {
          setAccountExecutives(data)
        } else if (data.error) {
          throw new Error(`API error: ${data.error}`)
        } else {
          throw new Error("Unexpected response format: " + JSON.stringify(data))
        }
      } catch (error) {
        console.error(
          "Failed to fetch account executives:",
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2),
        )
        setError(error instanceof Error ? error.message : String(error))
        toast({
          title: "Error",
          description: "Failed to load account executives. Please check the console for more details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAccountExecutives()
  }, [])

  useEffect(() => {
    async function fetchOpportunities() {
      if (!formData.accountExec) return

      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching opportunities for ${formData.accountExec}`)
        const response = await fetch(`/api/opportunities?accountExecutive=${encodeURIComponent(formData.accountExec)}`)
        const data = await response.json()

        console.log("Received response:", response.status, response.statusText)
        console.log("Received data:", JSON.stringify(data, null, 2))

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${data.error || "Unknown error"}`)
        }

        if (Array.isArray(data)) {
          setOpportunities(data)
        } else if (data.error) {
          throw new Error(`API error: ${data.error}`)
        } else {
          throw new Error("Unexpected response format: " + JSON.stringify(data))
        }
      } catch (error) {
        console.error(
          "Failed to fetch opportunities:",
          error instanceof Error ? error.stack : JSON.stringify(error, null, 2),
        )
        setError(error instanceof Error ? error.message : String(error))
        toast({
          title: "Error",
          description: "Failed to load opportunities. Please check the console for more details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [formData.accountExec])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("friendlyBusinessName", e.target.value)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accountExec">Account Executive</Label>
        <Popover open={openAccountExec} onOpenChange={setOpenAccountExec}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openAccountExec}
              className={cn(
                "w-full justify-between",
                !formData.accountExec && "text-muted-foreground",
                invalidFields.includes("accountExec") && "border-red-500",
              )}
            >
              {formData.accountExec ? (
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-semibold text-white"
                    style={{ backgroundColor: stringToColor(formData.accountExec) }}
                  >
                    {getInitials(formData.accountExec)}
                  </div>
                  <span>{formData.accountExec}</span>
                </div>
              ) : (
                "Select Account Executive"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start" side="bottom" sideOffset={4} avoidCollisions={false}>
            <Command>
              <CommandInput placeholder="Search account executive..." />
              <CommandList>
                <CommandEmpty>No account executive found.</CommandEmpty>
                <CommandGroup>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                    {accountExecutives.map((ae) => (
                      <CommandItem
                        key={ae}
                        onSelect={() => {
                          handleInputChange("accountExec", ae)
                          setOpenAccountExec(false)
                        }}
                        className="flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{ backgroundColor: stringToColor(ae) }}
                        >
                          {getInitials(ae)}
                        </div>
                        <span className="flex-grow truncate">{ae}</span>
                        {formData.accountExec === ae && <Check className="h-4 w-4 text-primary" />}
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && <p className="text-sm text-red-500">Error: {error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="opportunityName">Opportunity Name</Label>
        <Popover open={openOpportunity} onOpenChange={setOpenOpportunity}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openOpportunity}
              className={cn(
                "w-full justify-between",
                !formData.opportunityName && "text-muted-foreground",
                invalidFields.includes("opportunityName") && "border-red-500",
              )}
            >
              {formData.opportunityName || "Select Opportunity"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start" side="bottom" sideOffset={4} avoidCollisions={false}>
            <Command>
              <CommandInput placeholder="Search opportunity..." />
              <CommandList>
                <CommandEmpty>No opportunity found.</CommandEmpty>
                <CommandGroup>
                  {opportunities.map((opp) => (
                    <CommandItem
                      key={opp}
                      onSelect={() => {
                        handleInputChange("opportunityName", opp)
                        setOpenOpportunity(false)
                      }}
                    >
                      {opp}
                      {formData.opportunityName === opp && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {formData.opportunityName && (
        <div className="space-y-2">
          <Label htmlFor="friendlyBusinessName">Friendly Business Name</Label>
          <Input
            id="friendlyBusinessName"
            value={formData.friendlyBusinessName}
            onChange={handleChange}
            className={invalidFields.includes("friendlyBusinessName") ? "border-red-500" : ""}
          />
        </div>
      )}
    </div>
  )
}

