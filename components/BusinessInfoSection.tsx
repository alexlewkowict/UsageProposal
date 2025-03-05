"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { getAccountExecutives, AccountExecutive } from "@/services/account-executives"
import { useSession } from "next-auth/react"

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

// Add this type for opportunities
interface Opportunity {
  opportunity_name: string;
  opportunity_owner: string;
  stage: string;
  account_name: string;
}

export function BusinessInfoSection({
  formData,
  handleInputChange,
  invalidFields,
}: BusinessInfoSectionProps) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExecs, setFilteredExecs] = useState<AccountExecutive[]>([]);
  const [open, setOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false)
  const [accountExecutives, setAccountExecutives] = useState<AccountExecutive[]>([])
  const [fetchingAccountExecutives, setFetchingAccountExecutives] = useState(true)
  const [showSelection, setShowSelection] = useState(false)
  const [currentUserIsAE, setCurrentUserIsAE] = useState(false)
  const [currentUserAE, setCurrentUserAE] = useState<AccountExecutive | null>(null)
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);

  // Add these console logs to debug the issue
  useEffect(() => {
    console.log("Current user session:", session?.user);
    console.log("Current user is AE:", currentUserIsAE);
    console.log("Current user AE object:", currentUserAE);
    console.log("Show selection:", showSelection);
    console.log("Selected account exec:", formData.accountExec);
  }, [session, currentUserIsAE, currentUserAE, showSelection, formData.accountExec]);

  // Fetch account executives from the API
  useEffect(() => {
    async function fetchAccountExecutives() {
      setFetchingAccountExecutives(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/account-executives?t=${timestamp}`);
        
        if (!response.ok) {
          console.error("Failed to fetch account executives for business info");
          return;
        }
        
        const data = await response.json();
        console.log("Fetched account executives for business info:", data);
        setAccountExecutives(data);
        
        // Check if current user is an account executive
        if (session?.user?.email) {
          const userEmail = session.user.email.toLowerCase();
          console.log("Current user email:", userEmail);
          
          // Try to find by exact email match
          let matchingAE = data.find(ae => 
            ae.email && ae.email.toLowerCase() === userEmail
          );
          
          // If no match by email, try to match by name
          if (!matchingAE && session.user.name) {
            matchingAE = data.find(ae => 
              ae.full_name.toLowerCase() === session.user.name.toLowerCase()
            );
            console.log("Matching by name:", matchingAE);
          }
          
          // If still no match, check if the current user's name contains "Alex Lewkowict"
          if (!matchingAE && session.user.name && session.user.name.toLowerCase().includes("alex lewkowict")) {
            matchingAE = data.find(ae => 
              ae.full_name.toLowerCase().includes("alex lewkowict")
            );
            console.log("Matching Alex Lewkowict:", matchingAE);
          }
          
          if (matchingAE) {
            console.log("Found matching AE:", matchingAE);
            setCurrentUserIsAE(true);
            setCurrentUserAE(matchingAE);
            
            // Auto-select the current user as the account executive
            if (!formData.accountExec) {
              handleInputChange("accountExec", matchingAE.full_name);
            }
          } else {
            console.log("No matching AE found for current user");
          }
        }
      } catch (error) {
        console.error("Error fetching account executives for business info:", error);
      } finally {
        setFetchingAccountExecutives(false);
      }
    }
    
    fetchAccountExecutives();
  }, [session, formData.accountExec, handleInputChange]);

  // Filter executives when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = accountExecutives.filter(exec => 
        exec.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExecs(filtered);
    } else {
      setFilteredExecs(accountExecutives);
    }
  }, [searchTerm, accountExecutives]);

  // Fetch opportunities from API
  useEffect(() => {
    async function fetchOpportunities() {
      if (!formData.accountExec) return;
      
      setIsLoadingOpportunities(true);
      try {
        console.log('Fetching opportunities for:', formData.accountExec);
        
        const response = await fetch(`/api/opportunities?owner=${encodeURIComponent(formData.accountExec)}`);
        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (!response.ok) {
          throw new Error(responseData.details || responseData.error || 'Failed to fetch opportunities');
        }

        console.log('Fetched opportunities:', responseData);
        setOpportunities(responseData || []);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load opportunities. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOpportunities(false);
      }
    }

    fetchOpportunities();
  }, [formData.accountExec, toast]);

  // Get account executive details from the fetched data
  const getAccountExecutiveDetails = (name: string) => {
    if (!name) return { initials: "??", color: "bg-gray-200" };
    
    // Find the account executive in the fetched data
    const ae = accountExecutives.find(exec => exec.full_name === name);
    
    if (ae) {
      return {
        initials: ae.initials || name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2),
        color: ae.color || "bg-blue-200"
      };
    }
    
    // Fallback if not found
    return {
      initials: name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2),
      color: "bg-blue-200"
    };
  };

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
            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        {/* Executive tiles */}
        {fetchingAccountExecutives ? (
          <div className="p-4 border rounded dark:border-gray-700 dark:bg-gray-800">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading account executives...</div>
          </div>
        ) : accountExecutives.find(exec => exec.full_name === formData.accountExec) && !showSelection ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className={`
                h-12 w-12 rounded-full flex items-center justify-center
                ${getAccountExecutiveDetails(formData.accountExec).color} 
                ${getAccountExecutiveDetails(formData.accountExec).color?.replace('bg-', 'dark:bg-').replace('-200', '-800')}
                text-gray-700 dark:text-gray-200
              `}>
                {getAccountExecutiveDetails(formData.accountExec).initials}
              </div>
              <div>
                <div className="font-medium dark:text-white">
                  Welcome, {formData.accountExec}!
                </div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              className="w-full mt-4 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={() => setShowSelection(true)}
            >
              Not Me? Select Different Account Executive
            </Button>
          </div>
        ) : accountExecutives.length === 0 ? (
          <div className="p-4 border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400">
            Failed to load account executives. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {filteredExecs.map((exec) => (
              <div
                key={exec.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all
                  flex items-center space-x-3
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  ${formData.accountExec === exec.full_name 
                    ? "border-primary border-2 bg-primary/5 dark:bg-primary/10" 
                    : "border-gray-200 dark:border-gray-700 dark:bg-gray-800"}
                `}
                onClick={() => {
                  if (formData.accountExec !== exec.full_name) {
                    console.log(`Selecting account executive: ${exec.full_name}`);
                    handleInputChange("accountExec", exec.full_name);
                    setShowSelection(false);
                  }
                }}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${exec.color || "bg-blue-200"} ${exec.color ? exec.color.replace('bg-', 'dark:bg-').replace('-200', '-800') : 'dark:bg-blue-800'}`}
                >
                  {exec.initials || exec.full_name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span className="font-medium dark:text-white">{exec.full_name}</span>
              </div>
            ))}
          </div>
        )}
        
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
              className="w-full justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {formData.opportunityName || "Select Opportunity Name"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-full p-0 dark:bg-gray-800 dark:border-gray-700" 
            align="start"
            side="bottom"
            sideOffset={5}
            avoidCollisions={false}
          >
            <Command>
              <CommandInput 
                placeholder="Search opportunities..." 
                className="dark:bg-gray-800 dark:text-white"
              />
              <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">
                {isLoadingOpportunities ? "Loading opportunities..." : "No opportunities found."}
              </CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {opportunities.map((opportunity) => (
                  <CommandItem
                    key={opportunity.opportunity_name}
                    onSelect={() => {
                      handleInputChange("opportunityName", opportunity.opportunity_name);
                      handleInputChange("friendlyBusinessName", opportunity.account_name);
                      setOpen(false);
                    }}
                    className="cursor-pointer dark:text-white dark:hover:bg-gray-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.opportunityName === opportunity.opportunity_name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {opportunity.opportunity_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {invalidFields.includes("opportunityName") && (
          <p className="text-red-500 text-sm mt-1">Please select an opportunity</p>
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

