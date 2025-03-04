"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Code, Filter, Info, Save, Search, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VariableMapping {
  variable: string;
  mappedTo: string;
  description: string;
  category: string;
}

export default function VariableMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mappings, setMappings] = useState<VariableMapping[]>(getDefaultMappings())
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVariable, setNewVariable] = useState({
    variable: "",
    mappedTo: "",
    description: "",
    category: "general"
  })
  
  // Count of mapped variables
  const mappedCount = mappings.filter(m => m.mappedTo).length
  
  // Filter mappings based on search and active category
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = 
      mapping.variable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "unmapped" && !mapping.mappedTo) ||
                           mapping.category === activeCategory
    
    return matchesSearch && matchesCategory
  })
  
  // Group mappings by category for display
  const groupedMappings: Record<string, VariableMapping[]> = {}
  
  filteredMappings.forEach(mapping => {
    const category = getCategoryName(mapping.category)
    if (!groupedMappings[category]) {
      groupedMappings[category] = []
    }
    groupedMappings[category].push(mapping)
  })
  
  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }
  
  // Update a mapping
  const updateMapping = (variable: string, mappedTo: string) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.variable === variable 
          ? { ...mapping, mappedTo } 
          : mapping
      )
    )
  }
  
  // Save mappings
  const saveMappings = async () => {
    try {
      // In a real app, you'd save to an API
      // const response = await fetch('/api/variable-mappings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(mappings),
      // })
      
      toast({
        title: 'Success',
        description: 'Variable mappings saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save variable mappings',
        variant: 'destructive',
      })
    }
  }
  
  // Add a new variable
  const addVariable = () => {
    if (!newVariable.variable) {
      toast({
        title: 'Error',
        description: 'Variable name is required',
        variant: 'destructive',
      })
      return
    }
    
    // Check for duplicates
    if (mappings.some(m => m.variable === newVariable.variable)) {
      toast({
        title: 'Error',
        description: 'Variable already exists',
        variant: 'destructive',
      })
      return
    }
    
    setMappings(prev => [...prev, { ...newVariable }])
    setIsAddDialogOpen(false)
    setNewVariable({
      variable: "",
      mappedTo: "",
      description: "",
      category: "general"
    })
    
    toast({
      title: 'Success',
      description: 'Variable added successfully',
    })
  }
  
  // Get category display name
  function getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      "general": "General Information",
      "payment": "Payment Information",
      "units": "Units & Pricing",
      "connections": "Connections",
      "features": "Features",
      "tiers": "Pricing Tiers",
      "years": "Multi-Year Pricing"
    }
    
    return categoryNames[category] || category
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Variable Mapping</h1>
          <p className="text-gray-500">Map template variables to code elements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
          <Button onClick={saveMappings}>
            <Save className="h-4 w-4 mr-2" />
            Save Mappings
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              {mappings.length} variables
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              {mappedCount} mapped
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All Variables
          </Button>
          <Button 
            variant={activeCategory === "general" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("general")}
          >
            General
          </Button>
          <Button 
            variant={activeCategory === "payment" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("payment")}
          >
            Payment
          </Button>
          <Button 
            variant={activeCategory === "connections" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("connections")}
          >
            Connections
          </Button>
          <Button 
            variant={activeCategory === "units" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("units")}
          >
            Units
          </Button>
          <Button 
            variant={activeCategory === "features" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("features")}
          >
            Features
          </Button>
          <Button 
            variant={activeCategory === "tiers" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("tiers")}
          >
            Pricing Tiers
          </Button>
          <Button 
            variant={activeCategory === "years" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("years")}
          >
            Multi-Year
          </Button>
          <Button 
            variant={activeCategory === "unmapped" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("unmapped")}
          >
            Unmapped
          </Button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(groupedMappings).map(([group, groupMappings]) => (
            <div key={group} className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleGroup(group)}
              >
                <div className="font-medium flex items-center">
                  {group}
                  <Badge className="ml-2" variant="outline">{groupMappings.length}</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedGroups[group] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {expandedGroups[group] && (
                <div className="p-4 space-y-4">
                  {groupMappings.map((mapping) => (
                    <div key={mapping.variable} className="grid grid-cols-12 gap-4 items-center">
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
                            {mapping.mappedTo || "Map to code element..."}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="formData.friendlyBusinessName">formData.friendlyBusinessName</SelectItem>
                            <SelectItem value="formData.contractTerm">formData.contractTerm</SelectItem>
                            <SelectItem value="formData.paymentTerms">formData.paymentTerms</SelectItem>
                            <SelectItem value="formData.paymentType">formData.paymentType</SelectItem>
                            <SelectItem value="formData.storeConnections">formData.storeConnections</SelectItem>
                            <SelectItem value="formData.saasFee.frequency">formData.saasFee.frequency</SelectItem>
                            <SelectItem value="calculateAnnualSaasFee()">calculateAnnualSaasFee()</SelectItem>
                            <SelectItem value="calculateStoreConnectionsCost()">calculateStoreConnectionsCost()</SelectItem>
                            <SelectItem value="formData.implementationPackage">formData.implementationPackage</SelectItem>
                          </SelectContent>
                        </Select>
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
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Variable Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Variable</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="variable-name">Variable Name</Label>
              <Input
                id="variable-name"
                value={newVariable.variable}
                onChange={(e) => setNewVariable({...newVariable, variable: e.target.value})}
                placeholder="e.g. store_connections"
              />
            </div>
            
            <div>
              <Label htmlFor="variable-description">Description</Label>
              <Textarea
                id="variable-description"
                value={newVariable.description}
                onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                placeholder="What does this variable represent?"
              />
            </div>
            
            <div>
              <Label htmlFor="variable-category">Category</Label>
              <Select
                value={newVariable.category}
                onValueChange={(value) => setNewVariable({...newVariable, category: value})}
              >
                <SelectTrigger id="variable-category">
                  {getCategoryName(newVariable.category)}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Information</SelectItem>
                  <SelectItem value="payment">Payment Information</SelectItem>
                  <SelectItem value="units">Units & Pricing</SelectItem>
                  <SelectItem value="connections">Connections</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="tiers">Pricing Tiers</SelectItem>
                  <SelectItem value="years">Multi-Year Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={addVariable}>Add Variable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
    },
    {
      variable: "term_months",
      mappedTo: "formData.contractTerm",
      description: "Contract term in months",
      category: "general",
    },
    {
      variable: "contractLength",
      mappedTo: "",
      description: "Contract length description",
      category: "general",
    },

    // Payment Information
    {
      variable: "payment_terms",
      mappedTo: "",
      description: "Payment terms (Net 30, etc.)",
      category: "payment",
    },
    {
      variable: "payment_type",
      mappedTo: "",
      description: "Payment type (Credit Card, ACH, etc.)",
      category: "payment",
    },
    {
      variable: "saasFrequency",
      mappedTo: "",
      description: "SaaS billing frequency",
      category: "payment",
    },
    {
      variable: "quarterlyFee",
      mappedTo: "",
      description: "Quarterly fee amount",
      category: "payment",
    },
    {
      variable: "annualFee",
      mappedTo: "",
      description: "Annual fee amount",
      category: "payment",
    },

    // Units & Pricing
    {
      variable: "annualUnitTotal",
      mappedTo: "",
      description: "Annual unit total",
      category: "units",
    },
    {
      variable: "overage_example",
      mappedTo: "",
      description: "Example of overage calculation",
      category: "units",
    },
    {
      variable: "PAYGO_overage_rate",
      mappedTo: "",
      description: "Pay-as-you-go overage rate",
      category: "units",
    },
    {
      variable: "PAYGO_total",
      mappedTo: "",
      description: "Pay-as-you-go total",
      category: "units",
    },
    {
      variable: "AP_overage_rate",
      mappedTo: "",
      description: "Annual plan overage rate",
      category: "units",
    },
    {
      variable: "AP_total",
      mappedTo: "",
      description: "Annual plan total",
      category: "units",
    },

    // Connections
    {
      variable: "store_connections",
      mappedTo: "",
      description: "Number of store connections",
      category: "connections",
    },
    {
      variable: "storeConnectionsCount",
      mappedTo: "",
      description: "Count of store connections",
      category: "connections",
    },
    {
      variable: "aa1_connections",
      mappedTo: "",
      description: "AA1 connections count",
      category: "connections",
    },
    {
      variable: "aa2_connections",
      mappedTo: "",
      description: "AA2 connections count",
      category: "connections",
    },
    {
      variable: "EDI_connections",
      mappedTo: "",
      description: "EDI connections count",
      category: "connections",
    },
    {
      variable: "netsuite_nonnections",
      mappedTo: "",
      description: "NetSuite connections count",
      category: "connections",
    },

    // Features
    {
      variable: "WFH_LCD",
      mappedTo: "",
      description: "Work from home LCD feature",
      category: "features",
    },
    {
      variable: "client_portal",
      mappedTo: "",
      description: "Client portal feature",
      category: "features",
    },
    {
      variable: "3pl_billing",
      mappedTo: "",
      description: "3PL billing feature",
      category: "features",
    },

    // Implementation
    {
      variable: "implementationCost",
      mappedTo: "",
      description: "Implementation cost",
      category: "general",
    },
    {
      variable: "aa_setup_fee",
      mappedTo: "",
      description: "AA setup fee",
      category: "general",
    },
    {
      variable: "aa_setup_days",
      mappedTo: "",
      description: "AA setup days",
      category: "general",
    },

    // Multi-Year Pricing
    {
      variable: "annualUnitTotal_y2",
      mappedTo: "",
      description: "Annual unit total for year 2",
      category: "years",
    },
    {
      variable: "PAYGO_overage_rate_y2",
      mappedTo: "",
      description: "Pay-as-you-go overage rate for year 2",
      category: "years",
    },
    {
      variable: "AP_overage_rate_y2",
      mappedTo: "",
      description: "Annual plan overage rate for year 2",
      category: "years",
    },
    {
      variable: "annualUnitTotal_y3",
      mappedTo: "",
      description: "Annual unit total for year 3",
      category: "years",
    },
    {
      variable: "PAYGO_overage_rate_y3",
      mappedTo: "",
      description: "Pay-as-you-go overage rate for year 3",
      category: "years",
    },
    {
      variable: "AP_overage_rate_3",
      mappedTo: "",
      description: "Annual plan overage rate for year 3",
      category: "years",
    },

    // Store Connection Tiers
    {
      variable: "store_tier_from1",
      mappedTo: "",
      description: "Store tier 1 from quantity",
      category: "tiers",
    },
    {
      variable: "store_tier_to1",
      mappedTo: "",
      description: "Store tier 1 to quantity",
      category: "tiers",
    },
    {
      variable: "store_p1",
      mappedTo: "",
      description: "Store tier 1 price",
      category: "tiers",
    },
    {
      variable: "store_tier_from2",
      mappedTo: "",
      description: "Store tier 2 from quantity",
      category: "tiers",
    },
    {
      variable: "store_tier_to2",
      mappedTo: "",
      description: "Store tier 2 to quantity",
      category: "tiers",
    },
    {
      variable: "store_p2",
      mappedTo: "",
      description: "Store tier 2 price",
      category: "tiers",
    },
    {
      variable: "store_tier_from3",
      mappedTo: "",
      description: "Store tier 3 from quantity",
      category: "tiers",
    },
    {
      variable: "store_tier_to3",
      mappedTo: "",
      description: "Store tier 3 to quantity",
      category: "tiers",
    },
    {
      variable: "store_p3",
      mappedTo: "",
      description: "Store tier 3 price",
      category: "tiers",
    },
    {
      variable: "store_tier_from4",
      mappedTo: "",
      description: "Store tier 4 from quantity",
      category: "tiers",
    },
    {
      variable: "store_p4",
      mappedTo: "",
      description: "Store tier 4 price",
      category: "tiers",
    },
    
    // AA1 Tiers
    {
      variable: "aa1_tier_from1",
      mappedTo: "",
      description: "AA1 tier 1 from quantity",
      category: "tiers",
    },
    {
      variable: "aa1_tier_to1",
      mappedTo: "",
      description: "AA1 tier 1 to quantity",
      category: "tiers",
    },
    {
      variable: "aa1_p1",
      mappedTo: "",
      description: "AA1 tier 1 price",
      category: "tiers",
    },
    {
      variable: "aa1_tier_from2",
      mappedTo: "",
      description: "AA1 tier 2 from quantity",
      category: "tiers",
    },
    {
      variable: "aa1_tier_to2",
      mappedTo: "",
      description: "AA1 tier 2 to quantity",
      category: "tiers",
    },
    {
      variable: "aa1_p2",
      mappedTo: "",
      description: "AA1 tier 2 price",
      category: "tiers",
    },
    {
      variable: "aa1_tier_from3",
      mappedTo: "",
      description: "AA1 tier 3 from quantity",
      category: "tiers",
    },
    {
      variable: "aa1_tier_to3",
      mappedTo: "",
      description: "AA1 tier 3 to quantity",
      category: "tiers",
    },
    {
      variable: "aa1_p3",
      mappedTo: "",
      description: "AA1 tier 3 price",
      category: "tiers",
    },
    {
      variable: "aa1_tier_from4",
      mappedTo: "",
      description: "AA1 tier 4 from quantity",
      category: "tiers",
    },
    {
      variable: "aa1_p4",
      mappedTo: "",
      description: "AA1 tier 4 price",
      category: "tiers",
    },
    
    // AA2 Tiers
    {
      variable: "aa2_tier_from1",
      mappedTo: "",
      description: "AA2 tier 1 from quantity",
      category: "tiers",
    },
    {
      variable: "aa2_tier_to1",
      mappedTo: "",
      description: "AA2 tier 1 to quantity",
      category: "tiers",
    },
    {
      variable: "aa2_p1",
      mappedTo: "",
      description: "AA2 tier 1 price",
      category: "tiers",
    },
    {
      variable: "aa2_tier_from2",
      mappedTo: "",
      description: "AA2 tier 2 from quantity",
      category: "tiers",
    },
    {
      variable: "aa2_tier_to2",
      mappedTo: "",
      description: "AA2 tier 2 to quantity",
      category: "tiers",
    },
    {
      variable: "aa2_p2",
      mappedTo: "",
      description: "AA2 tier 2 price",
      category: "tiers",
    },
    {
      variable: "aa2_tier_from3",
      mappedTo: "",
      description: "AA2 tier 3 from quantity",
      category: "tiers",
    },
    {
      variable: "aa2_tier_to3",
      mappedTo: "",
      description: "AA2 tier 3 to quantity",
      category: "tiers",
    },
    {
      variable: "aa2_p3",
      mappedTo: "",
      description: "AA2 tier 3 price",
      category: "tiers",
    },
    {
      variable: "aa2_tier_from4",
      mappedTo: "",
      description: "AA2 tier 4 from quantity",
      category: "tiers",
    },
    {
      variable: "aa2_p4",
      mappedTo: "",
      description: "AA2 tier 4 price",
      category: "tiers",
    }
  ]
} 