"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

// Define proper types for the form data
interface FormData {
  accountExec: string
  opportunityName: string
  friendlyBusinessName: string
}

interface BusinessInfoSectionProps {
  formData: FormData
  handleInputChange: (field: string, value: string | number) => void
  invalidFields: string[]
}

// Define account executives with their initials and full names
const ACCOUNT_EXECUTIVES = [
  { initials: "AG", name: "Alex Gorney", color: "bg-green-200" },
  { initials: "BO", name: "Brett Oliveira", color: "bg-yellow-200" },
  { initials: "DL", name: "Daniel Lawson", color: "bg-purple-200" },
  { initials: "MD", name: "Mark Davis", color: "bg-purple-200" },
  { initials: "MR", name: "Marty Rodowsky", color: "bg-yellow-200" },
  { initials: "MA", name: "Mike Azimi", color: "bg-green-200" },
  { initials: "SO", name: "Stevie Oliveira", color: "bg-purple-200" },
];

// Opportunity names for the dropdown
const OPPORTUNITY_NAMES = [
  "Acme Corp",
  "Globex Corporation",
  "Soylent Corp",
  "Initech",
  "Umbrella Corporation",
  "Stark Industries",
  "Wayne Enterprises",
  "Cyberdyne Systems",
  "Oscorp Industries",
  "Massive Dynamic",
]

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

export function BusinessInfoSection({
  formData,
  handleInputChange,
  invalidFields,
}: BusinessInfoSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExecs, setFilteredExecs] = useState(ACCOUNT_EXECUTIVES);
  const [open, setOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<string[]>([]);

  // Filter executives when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = ACCOUNT_EXECUTIVES.filter(exec => 
        exec.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExecs(filtered);
    } else {
      setFilteredExecs(ACCOUNT_EXECUTIVES);
    }
  }, [searchTerm]);

  // Fetch opportunities from API
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        // Only fetch opportunities if an account executive is selected
        if (formData.accountExec) {
          console.log(`Fetching opportunities for ${formData.accountExec}`);
          
          const response = await fetch(`/api/opportunities?accountExec=${encodeURIComponent(formData.accountExec)}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Received opportunities:', data.opportunities);
            
            if (data.opportunities && data.opportunities.length > 0) {
              setOpportunities(data.opportunities);
            } else {
              setOpportunities([]);
              toast({
                title: "No opportunities found",
                description: `No open opportunities found for ${formData.accountExec}`,
                variant: "warning",
              });
            }
          } else {
            console.error("API Error:", response.statusText);
            setOpportunities([]);
            toast({
              title: "Error",
              description: "Failed to fetch opportunities. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          // Clear opportunities if no account executive is selected
          setOpportunities([]);
        }
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        setOpportunities([]);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching opportunities.",
          variant: "destructive",
        });
      }
    }
    
    fetchOpportunities();
  }, [formData.accountExec]);

  return (
    <div className="space-y-6">
      {/* Account Executive Selection */}
      <div>
        <Label htmlFor="accountExec">Account Executive</Label>
        
        {/* Search input */}
        <div className="relative mt-2 mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search account executive..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Executive tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {filteredExecs.map((exec) => (
            <div
              key={exec.initials}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                flex items-center space-x-3
                hover:bg-gray-50
                ${formData.accountExec === exec.name ? "border-primary border-2 bg-primary/5" : "border-gray-200"}
              `}
              onClick={() => {
                if (formData.accountExec !== exec.name) {
                  console.log(`Selecting account executive: ${exec.name}`);
                  handleInputChange("accountExec", exec.name);
                }
              }}
            >
              <div className={`${exec.color} h-10 w-10 rounded-full flex items-center justify-center font-bold text-gray-700`}>
                {exec.initials}
              </div>
              <span className="font-medium">{exec.name}</span>
            </div>
          ))}
        </div>
        
        {invalidFields.includes("accountExec") && (
          <p className="text-red-500 text-sm mt-1">Please select an account executive</p>
        )}
      </div>

      {/* Opportunity Name Dropdown */}
      <div>
        <Label htmlFor="opportunityName">Opportunity Name</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between ${
                invalidFields.includes("opportunityName") ? "border-red-500" : ""
              }`}
              disabled={!formData.accountExec}
            >
              {formData.opportunityName && formData.opportunityName.trim() !== ''
                ? formData.opportunityName
                : formData.accountExec 
                  ? "Select Opportunity Name" 
                  : "Select an Account Executive first"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search opportunity..." />
              <CommandEmpty>
                {formData.accountExec 
                  ? "No opportunities found for this account executive." 
                  : "Please select an account executive first."}
              </CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {opportunities.map((opportunity) => (
                    <CommandItem
                      key={opportunity}
                      value={opportunity}
                      onSelect={() => {
                        handleInputChange("opportunityName", opportunity);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.opportunityName === opportunity
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {opportunity}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {invalidFields.includes("opportunityName") && (
          <p className="text-red-500 text-sm mt-1">Please select an opportunity name</p>
        )}
      </div>

      {/* Friendly Business Name */}
      <div>
        <Label htmlFor="friendlyBusinessName">Friendly Business Name</Label>
        <Input
          id="friendlyBusinessName"
          value={formData.friendlyBusinessName}
          onChange={(e) => handleInputChange("friendlyBusinessName", e.target.value)}
          className={invalidFields.includes("friendlyBusinessName") ? "border-red-500" : ""}
        />
        {invalidFields.includes("friendlyBusinessName") && (
          <p className="text-red-500 text-sm mt-1">Please enter a friendly business name</p>
        )}
      </div>
    </div>
  )
}

