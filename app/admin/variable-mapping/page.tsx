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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VariableMapping {
  variable: string;
  mappedTo: string;
  description: string;
  category: string;
  group: string;
}

interface CodeElement {
  path: string;
  elements: string[];
}

export default function VariableMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mappings, setMappings] = useState<VariableMapping[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [codeElements, setCodeElements] = useState<CodeElement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch mappings and code elements on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch variable mappings
        const mappingsResponse = await fetch('/api/variable-mappings')
        let mappingsData = await mappingsResponse.json()
        
        // If no mappings exist yet, use default ones
        if (!mappingsData || mappingsData.length === 0) {
          mappingsData = getDefaultMappings()
        }
        
        setMappings(mappingsData)
        
        // Fetch code elements
        const elementsResponse = await fetch('/api/code-elements')
        const elementsData = await elementsResponse.json()
        setCodeElements(elementsData)
        
        // Initialize expanded state for all groups
        const groups = [...new Set(mappingsData.map((m: VariableMapping) => m.group))]
        const initialExpandedState: Record<string, boolean> = {}
        groups.forEach(group => {
          initialExpandedState[group as string] = true
        })
        setExpandedGroups(initialExpandedState)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load variable mappings',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Save mappings
  const saveMappings = async () => {
    try {
      const response = await fetch('/api/variable-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappings),
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Variable mappings saved successfully',
        })
        setHasChanges(false)
      } else {
        throw new Error('Failed to save mappings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save variable mappings',
        variant: 'destructive',
      })
    }
  }

  // Update a mapping
  const updateMapping = (variable: string, mappedTo: string) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.variable === variable) {
        return { ...mapping, mappedTo }
      }
      return mapping
    })
    
    setMappings(updatedMappings)
    setHasChanges(true)
  }

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  // Filter mappings based on search query
  const filteredMappings = mappings.filter(mapping => {
    const searchLower = searchQuery.toLowerCase()
    return (
      mapping.variable.toLowerCase().includes(searchLower) ||
      mapping.description.toLowerCase().includes(searchLower) ||
      mapping.group.toLowerCase().includes(searchLower) ||
      mapping.mappedTo.toLowerCase().includes(searchLower)
    )
  })

  // Group mappings by category and group
  const groupedMappings: Record<string, VariableMapping[]> = {}
  filteredMappings.forEach(mapping => {
    if (!groupedMappings[mapping.group]) {
      groupedMappings[mapping.group] = []
    }
    groupedMappings[mapping.group].push(mapping)
  })

  // Get all available code elements for a specific path
  const getElementsForPath = (path: string) => {
    const found = codeElements.find(ce => ce.path === path)
    return found ? found.elements : []
  }

  // Get all available paths
  const getAllPaths = () => {
    return codeElements.map(ce => ce.path)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variable Mapping Configuration</CardTitle>
          <Button 
            onClick={saveMappings} 
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Mappings
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs defaultValue="grouped">
            <TabsList className="mb-4">
              <TabsTrigger value="grouped">Grouped</TabsTrigger>
              <TabsTrigger value="unmapped">Unmapped</TabsTrigger>
              <TabsTrigger value="all">All Variables</TabsTrigger>
            </TabsList>

            <TabsContent value="grouped" className="mt-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {Object.entries(groupedMappings).map(([group, groupMappings]) => {
                    const filteredGroupMappings = groupMappings
                    return (
                      <Collapsible
                        key={group}
                        open={expandedGroups[group]}
                        onOpenChange={() => toggleGroup(group)}
                        className="border rounded-md"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium">{group}</span>
                            <span className="text-sm text-gray-500">({filteredGroupMappings.length})</span>
                          </div>
                          {expandedGroups[group] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 pt-0 border-t">
                            <div className="space-y-3">
                              {filteredGroupMappings.map((mapping) => (
                                <div
                                  key={mapping.variable}
                                  className="grid grid-cols-12 gap-4 items-center p-3 rounded-md hover:bg-gray-50"
                                >
                                  <div className="col-span-5 flex items-center gap-2">
                                    <Code className="h-4 w-4 text-gray-400" />
                                    <div className="font-mono text-sm">{`{{${mapping.variable}}}`}</div>
                                  </div>
                                  <div className="col-span-5 relative">
                                    <Select
                                      value={mapping.mappedTo}
                                      onValueChange={(value) => updateMapping(mapping.variable, value)}
                                    >
                                      <SelectTrigger className="font-mono text-sm">
                                        <SelectValue placeholder="Map to code element..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <ScrollArea className="h-[200px]">
                                          {getAllPaths().map((path) => (
                                            <div key={path} className="p-1">
                                              <div className="font-semibold text-xs text-gray-500 px-2 py-1">{path}</div>
                                              {getElementsForPath(path).map((element) => (
                                                <SelectItem key={`${path}:${element}`} value={`${path}.${element}`}>
                                                  {element}
                                                </SelectItem>
                                              ))}
                                            </div>
                                          ))}
                                        </ScrollArea>
                                      </SelectContent>
                                    </Select>
                                    {mapping.mappedTo && (
                                      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
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
              </ScrollArea>
            </TabsContent>
            
            {/* Similar content for other tabs... */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Default mappings to use if none exist yet
function getDefaultMappings(): VariableMapping[] {
  return [
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
    // Add more default mappings as needed
  ]
} 