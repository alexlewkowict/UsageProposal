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
      "implementation": "Implementation"
    }
    
    return categoryNames[category] || category
  }
  
  // Get code elements for dropdown
  const getCodeElements = () => {
    return [
      { label: "formData.friendlyBusinessName", value: "formData.friendlyBusinessName" },
      { label: "formData.contractTerm", value: "formData.contractTerm" },
      { label: "formData.paymentTerms", value: "formData.paymentTerms" },
      { label: "formData.paymentType", value: "formData.paymentType" },
      { label: "formData.storeConnections", value: "formData.storeConnections" },
      { label: "formData.saasFee.frequency", value: "formData.saasFee.frequency" },
      { label: "calculateAnnualSaasFee()", value: "calculateAnnualSaasFee()" },
      { label: "calculateQuarterlySaasFee()", value: "calculateQuarterlySaasFee()" },
      { label: "formData.implementationPackage", value: "formData.implementationPackage" },
      { label: "formData.onboardingFee", value: "formData.onboardingFee" },
      // Add more code elements as needed
    ]
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Variable Mapping</h1>
          <p className="text-gray-500">Map template variables to code elements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={saveMappings}>
            <Save className="h-4 w-4 mr-2" />
            Save Mappings
          </Button>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search variables..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('all')}
          >
            All Variables
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'general' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'payment' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('payment')}
          >
            Payment
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'connections' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('connections')}
          >
            Connections
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'units' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('units')}
          >
            Units
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'features' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('features')}
          >
            Features
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === 'unmapped' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('unmapped')}
          >
            Unmapped
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gray-100">
                {mappings.length} variables
              </Badge>
              <Badge variant="outline" className="bg-gray-100">
                {mappedCount} mapped
              </Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
          
          {Object.entries(groupedMappings).map(([group, groupMappings]) => (
            <div key={group} className="mb-4 border rounded-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleGroup(group)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">
                    {groupMappings.length}
                  </Badge>
                  <h3 className="font-medium">{group}</h3>
                </div>
                {expandedGroups[group] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              
              {expandedGroups[group] && (
                <div className="p-3 space-y-3">
                  {groupMappings.map((mapping) => (
                    <div key={mapping.variable} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 flex items-center gap-2">
                        <Code className="h-4 w-4 text-gray-400" />
                        <div className="font-mono text-sm">
                          {`{{${mapping.variable}}}`}
                        </div>
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
                            <SelectItem value="">-- None --</SelectItem>
                            {getCodeElements().map((element) => (
                              <SelectItem key={element.value} value={element.value}>
                                {element.label}
                              </SelectItem>
                            ))}
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
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="variable-name">Variable Name</Label>
              <Input
                id="variable-name"
                placeholder="e.g., store_connections"
                value={newVariable.variable}
                onChange={(e) => setNewVariable({...newVariable, variable: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="variable-description">Description</Label>
              <Textarea
                id="variable-description"
                placeholder="Describe what this variable represents"
                value={newVariable.description}
                onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="variable-category">Category</Label>
              <Select
                value={newVariable.category}
                onValueChange={(value) => setNewVariable({...newVariable, category: value})}
              >
                <SelectTrigger id="variable-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Information</SelectItem>
                  <SelectItem value="payment">Payment Information</SelectItem>
                  <SelectItem value="units">Units & Pricing</SelectItem>
                  <SelectItem value="connections">Connections</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="tiers">Pricing Tiers</SelectItem>
                  <SelectItem value="implementation">Implementation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addVariable}>
              Add Variable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      category: "general"
    },
    {
      variable: "term_months",
      mappedTo: "formData.contractTerm",
      description: "Contract term in months",
      category: "general"
    },
    {
      variable: "contractLength",
      mappedTo: "",
      description: "Contract length description",
      category: "general"
    },

    // Payment Information
    {
      variable: "payment_terms",
      mappedTo: "",
      description: "Payment terms (Net 30, etc.)",
      category: "payment"
    },
    {
      variable: "payment_type",
      mappedTo: "",
      description: "Type of payment",
      category: "payment"
    },
    {
      variable: "saasFrequency",
      mappedTo: "formData.saasFee.frequency",
      description: "SaaS fee frequency (monthly, quarterly, annually)",
      category: "payment"
    },
    {
      variable: "quarterlyFee",
      mappedTo: "",
      description: "Quarterly SaaS fee amount",
      category: "payment"
    },
    {
      variable: "annualFee",
      mappedTo: "",
      description: "Annual SaaS fee amount",
      category: "payment"
    },

    // Units & Pricing
    {
      variable: "annualUnitTotal",
      mappedTo: "",
      description: "Total annual units",
      category: "units"
    },
    {
      variable: "overage_example",
      mappedTo: "",
      description: "Example of overage calculation",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate",
      mappedTo: "",
      description: "Pay-as-you-go overage rate",
      category: "units"
    },
    {
      variable: "PAYGO_total",
      mappedTo: "",
      description: "Pay-as-you-go total cost",
      category: "units"
    },
    {
      variable: "AP_overage_rate",
      mappedTo: "",
      description: "Annual plan overage rate",
      category: "units"
    },
    {
      variable: "AP_total",
      mappedTo: "",
      description: "Annual plan total cost",
      category: "units"
    },
    {
      variable: "annualUnitTotal_y2",
      mappedTo: "",
      description: "Year 2 total annual units",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate_y2",
      mappedTo: "",
      description: "Year 2 pay-as-you-go overage rate",
      category: "units"
    },
    {
      variable: "AP_overage_rate_y2",
      mappedTo: "",
      description: "Year 2 annual plan overage rate",
      category: "units"
    },
    {
      variable: "annualUnitTotal_y3",
      mappedTo: "",
      description: "Year 3 total annual units",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate_y3",
      mappedTo: "",
      description: "Year 3 pay-as-you-go overage rate",
      category: "units"
    },
    {
      variable: "AP_overage_rate_y3",
      mappedTo: "",
      description: "Year 3 annual plan overage rate",
      category: "units"
    },

    // Connections
    {
      variable: "store_connections",
      mappedTo: "formData.storeConnections",
      description: "Number of store connections",
      category: "connections"
    },
    {
      variable: "storeConnectionsCount",
      mappedTo: "",
      description: "Total count of store connections",
      category: "connections"
    },
    {
      variable: "aa1_connections",
      mappedTo: "",
      description: "Number of AA1 connections",
      category: "connections"
    },
    {
      variable: "aa2_connections",
      mappedTo: "",
      description: "Number of AA2 connections",
      category: "connections"
    },
    {
      variable: "EDI_connections",
      mappedTo: "",
      description: "Number of EDI connections",
      category: "connections"
    },
    {
      variable: "netsuite_connections",
      mappedTo: "",
      description: "Number of NetSuite connections",
      category: "connections"
    },

    // Features
    {
      variable: "WFH_LCD",
      mappedTo: "",
      description: "Work from home LCD feature",
      category: "features"
    },
    {
      variable: "client_portal",
      mappedTo: "",
      description: "Client portal feature",
      category: "features"
    },
    {
      variable: "3pl_billing",
      mappedTo: "",
      description: "3PL billing feature",
      category: "features"
    },

    // Implementation
    {
      variable: "implementationCost",
      mappedTo: "formData.onboardingFee",
      description: "Implementation cost",
      category: "implementation"
    },
    {
      variable: "aa_setup_fee",
      mappedTo: "",
      description: "AA setup fee",
      category: "implementation"
    },
    {
      variable: "aa_setup_days",
      mappedTo: "",
      description: "AA setup days",
      category: "implementation"
    },

    // Store Connection Tiers
    {
      variable: "store_tier_from1",
      mappedTo: "",
      description: "Store tier 1 from quantity",
      category: "tiers"
    },
    {
      variable: "store_tier_to1",
      mappedTo: "",
      description: "Store tier 1 to quantity",
      category: "tiers"
    },
    {
      variable: "store_p1",
      mappedTo: "",
      description: "Store tier 1 price",
      category: "tiers"
    },
    {
      variable: "store_tier_from2",
      mappedTo: "",
      description: "Store tier 2 from quantity",
      category: "tiers"
    },
    {
      variable: "store_tier_to2",
      mappedTo: "",
      description: "Store tier 2 to quantity",
      category: "tiers"
    },
    {
      variable: "store_p2",
      mappedTo: "",
      description: "Store tier 2 price",
      category: "tiers"
    },
    {
      variable: "store_tier_from3",
      mappedTo: "",
      description: "Store tier 3 from quantity",
      category: "tiers"
    },
    {
      variable: "store_tier_to3",
      mappedTo: "",
      description: "Store tier 3 to quantity",
      category: "tiers"
    },
    {
      variable: "store_p3",
      mappedTo: "",
      description: "Store tier 3 price",
      category: "tiers"
    },
    {
      variable: "store_tier_from4",
      mappedTo: "",
      description: "Store tier 4 from quantity",
      category: "tiers"
    },
    {
      variable: "store_p4",
      mappedTo: "",
      description: "Store tier 4 price",
      category: "tiers"
    },
    
    // AA1 Tiers
    {
      variable: "aa1_tier_from1",
      mappedTo: "",
      description: "AA1 tier 1 from quantity",
      category: "tiers"
    },
    {
      variable: "aa1_tier_to1",
      mappedTo: "",
      description: "AA1 tier 1 to quantity",
      category: "tiers"
    },
    {
      variable: "aa1_p1",
      mappedTo: "",
      description: "AA1 tier 1 price",
      category: "tiers"
    },
    {
      variable: "aa1_tier_from2",
      mappedTo: "",
      description: "AA1 tier 2 from quantity",
      category: "tiers"
    },
    {
      variable: "aa1_tier_to2",
      mappedTo: "",
      description: "AA1 tier 2 to quantity",
      category: "tiers"
    },
    {
      variable: "aa1_p2",
      mappedTo: "",
      description: "AA1 tier 2 price",
      category: "tiers"
    },
    {
      variable: "aa1_tier_from3",
      mappedTo: "",
      description: "AA1 tier 3 from quantity",
      category: "tiers"
    },
    {
      variable: "aa1_tier_to3",
      mappedTo: "",
      description: "AA1 tier 3 to quantity",
      category: "tiers"
    },
    {
      variable: "aa1_p3",
      mappedTo: "",
      description: "AA1 tier 3 price",
      category: "tiers"
    },
    {
      variable: "aa1_tier_from4",
      mappedTo: "",
      description: "AA1 tier 4 from quantity",
      category: "tiers"
    },
    {
      variable: "aa1_p4",
      mappedTo: "",
      description: "AA1 tier 4 price",
      category: "tiers"
    },
    
    // AA2 Tiers
    {
      variable: "aa2_tier_from1",
      mappedTo: "",
      description: "AA2 tier 1 from quantity",
      category: "tiers"
    },
    {
      variable: "aa2_tier_to1",
      mappedTo: "",
      description: "AA2 tier 1 to quantity",
      category: "tiers"
    },
    {
      variable: "aa2_p1",
      mappedTo: "",
      description: "AA2 tier 1 price",
      category: "tiers"
    },
    {
      variable: "aa2_tier_from2",
      mappedTo: "",
      description: "AA2 tier 2 from quantity",
      category: "tiers"
    },
    {
      variable: "aa2_tier_to2",
      mappedTo: "",
      description: "AA2 tier 2 to quantity",
      category: "tiers"
    },
    {
      variable: "aa2_p2",
      mappedTo: "",
      description: "AA2 tier 2 price",
      category: "tiers"
    },
    {
      variable: "aa2_tier_from3",
      mappedTo: "",
      description: "AA2 tier 3 from quantity",
      category: "tiers"
    },
    {
      variable: "aa2_tier_to3",
      mappedTo: "",
      description: "AA2 tier 3 to quantity",
      category: "tiers"
    },
    {
      variable: "aa2_p3",
      mappedTo: "",
      description: "AA2 tier 3 price",
      category: "tiers"
    },
    {
      variable: "aa2_tier_from4",
      mappedTo: "",
      description: "AA2 tier 4 from quantity",
      category: "tiers"
    },
    {
      variable: "aa2_p4",
      mappedTo: "",
      description: "AA2 tier 4 price",
      category: "tiers"
    }
  ]
} 