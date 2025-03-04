"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Check, ChevronDown, ChevronUp, Code, Info, Save, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

interface VariableMapping {
  variable: string;
  mappedTo: string;
  description: string;
  category: string;
  group: string;
}

export default function VariableMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mappings, setMappings] = useState<VariableMapping[]>([
    // General Information
    {
      variable: "friendly_name",
      mappedTo: "formData.friendlyBusinessName",
      description: "Customer's friendly business name",
      category: "general",
      group: "General Information",
    },
    {
      variable: "term_months",
      mappedTo: "formData.contractTerm",
      description: "Contract term in months",
      category: "general",
      group: "General Information",
    },
    {
      variable: "contractLength",
      mappedTo: "",
      description: "Contract length description",
      category: "general",
      group: "General Information",
    },

    // Payment Information
    {
      variable: "payment_terms",
      mappedTo: "formData.paymentTerms",
      description: "Payment terms (Net 30, etc.)",
      category: "payment",
      group: "Payment Information",
    },
    {
      variable: "payment_type",
      mappedTo: "formData.paymentType",
      description: "Type of payment",
      category: "payment",
      group: "Payment Information",
    },
    {
      variable: "saasFrequency",
      mappedTo: "formData.saasFee.frequency",
      description: "Frequency of SaaS payments",
      category: "payment",
      group: "Payment Information",
    },
    {
      variable: "quarterlyFee",
      mappedTo: "",
      description: "Quarterly fee amount",
      category: "payment",
      group: "Payment Information",
    },
    {
      variable: "annualFee",
      mappedTo: "calculateAnnualSaasFee()",
      description: "Annual fee amount",
      category: "payment",
      group: "Payment Information",
    },
    {
      variable: "implementationCost",
      mappedTo: "formData.onboardingFee",
      description: "One-time implementation cost",
      category: "payment",
      group: "Payment Information",
    },

    // Store Connections
    {
      variable: "store_connections",
      mappedTo: "",
      description: "Store connections description",
      category: "connections",
      group: "Store Connections",
    },
    {
      variable: "storeConnectionsCount",
      mappedTo: "formData.storeConnections",
      description: "Number of store connections",
      category: "connections",
      group: "Store Connections",
    },
    // Add more mappings as in your example...
  ])

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "General Information": true,
    "Payment Information": true,
    "Store Connections": true,
    "Store Tiers": false,
    "Annual Units": true,
    "Overages": false,
    "AA Setup": true,
    "AA1 Connections": true,
    "AA1 Tiers": false,
    "AA2 Connections": true,
    "AA2 Tiers": false,
    "Features": true,
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups({
      ...expandedGroups,
      [group]: !expandedGroups[group],
    })
  }

  const updateMapping = (variable: string, value: string) => {
    setMappings(mappings.map((mapping) => (mapping.variable === variable ? { ...mapping, mappedTo: value } : mapping)))
  }

  const saveVariableMappings = async () => {
    try {
      // In a real implementation, you would send this to your API
      // await fetch('/api/variable-mappings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(mappings)
      // });
      
      // For now, we'll just simulate a successful save
      toast({
        title: "Mappings saved",
        description: "Variable mappings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving mappings",
        description: "There was an error saving your variable mappings.",
        variant: "destructive",
      })
    }
  }

  const filteredMappings = mappings.filter(
    (mapping) =>
      mapping.variable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.mappedTo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Group mappings by their group
  const groupedMappings: Record<string, VariableMapping[]> = {}
  filteredMappings.forEach((mapping) => {
    if (!groupedMappings[mapping.group]) {
      groupedMappings[mapping.group] = []
    }
    groupedMappings[mapping.group].push(mapping)
  })

  // Count mapped variables
  const mappedCount = mappings.filter(m => m.mappedTo).length
  const totalCount = mappings.length
  const mappedPercentage = Math.round((mappedCount / totalCount) * 100)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Variable Mapping</h1>
        <Button onClick={saveVariableMappings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Mappings
        </Button>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-500 mb-2">
          Map variables from your codebase to template placeholders. These mappings will be used when generating proposals and sending webhook data.
        </p>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">Mapping Progress</p>
              <p className="text-sm text-blue-600">{mappedCount} of {totalCount} variables mapped ({mappedPercentage}%)</p>
            </div>
            <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${mappedPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="grouped">
        <TabsList className="mb-4">
          <TabsTrigger value="grouped">Grouped View</TabsTrigger>
          <TabsTrigger value="all">All Variables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grouped">
          <Card>
            <CardHeader>
              <CardTitle>Variables by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedMappings).map(([group, groupMappings]) => {
                  return (
                    <Collapsible key={group} open={expandedGroups[group]}>
                      <CollapsibleTrigger 
                        className="flex w-full items-center justify-between p-3 font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => toggleGroup(group)}
                      >
                        <span>{group}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {groupMappings.filter(m => m.mappedTo).length}/{groupMappings.length} mapped
                          </span>
                          {expandedGroups[group] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="border rounded-md">
                          <div className="p-2 space-y-1">
                            {groupMappings.map((mapping) => (
                              <div
                                key={mapping.variable}
                                className="grid grid-cols-12 gap-4 items-center p-3 rounded-md hover:bg-gray-50"
                              >
                                <div className="col-span-5 flex items-center gap-2">
                                  <Code className="h-4 w-4 text-gray-400" />
                                  <div className="font-mono text-sm">{`{{${mapping.variable}}}`}</div>
                                </div>
                                <div className="col-span-5 relative">
                                  <Input
                                    placeholder="Map to code element..."
                                    value={mapping.mappedTo}
                                    onChange={(e) => updateMapping(mapping.variable, e.target.value)}
                                    className="font-mono text-sm"
                                  />
                                  {mapping.mappedTo && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                      <Check className="h-4 w-4 text-green-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{mapping.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredMappings.map((mapping) => (
                  <div
                    key={mapping.variable}
                    className="grid grid-cols-12 gap-4 items-center p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-400" />
                      <div className="font-mono text-sm">{`{{${mapping.variable}}}`}</div>
                    </div>
                    <div className="col-span-5 relative">
                      <Input
                        placeholder="Map to code element..."
                        value={mapping.mappedTo}
                        onChange={(e) => updateMapping(mapping.variable, e.target.value)}
                        className="font-mono text-sm"
                      />
                      {mapping.mappedTo && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{mapping.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 