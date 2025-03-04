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
  
  // Get code elements for dropdown
  const codeElements = [
    { path: "formData", element: "friendlyBusinessName" },
    { path: "formData", element: "opportunityName" },
    { path: "formData", element: "contractTerm" },
    { path: "formData", element: "paymentTerms" },
    { path: "formData", element: "paymentType" },
    { path: "formData", element: "storeConnections" },
    { path: "formData.saasFee", element: "frequency" },
    { path: "formData.saasFee", element: "pallets.value" },
    { path: "formData.saasFee", element: "cases.value" },
    { path: "formData.saasFee", element: "eaches.value" },
    { path: "calculations", element: "calculateAnnualSaasFee" },
    { path: "calculations", element: "calculateStoreConnectionsCost" },
    // Add more code elements as needed
  ]
  
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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={saveMappings}>
            <Save className="h-4 w-4 mr-2" />
            Save Mappings
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search variables..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'all' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('all')}
            >
              All Variables
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'general' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('general')}
            >
              General
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'payment' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('payment')}
            >
              Payment
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'connections' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('connections')}
            >
              Connections
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'units' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('units')}
            >
              Units
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'features' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('features')}
            >
              Features
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${activeCategory === 'unmapped' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveCategory('unmapped')}
            >
              Unmapped
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="text-sm">
              {mappings.length} variables
            </Badge>
            <Badge variant="outline" className="text-sm">
              {mappedCount} mapped
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(groupedMappings).map(([category, variables]) => {
          const isExpanded = expandedGroups[category] !== false; // Default to expanded
          
          return (
            <div key={category} className="border rounded-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleGroup(category)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{variables.length}</span>
                  <h3 className="text-lg font-medium">{category}</h3>
                </div>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {isExpanded && (
                <div className="divide-y">
                  {variables.map(variable => (
                    <div key={variable.variable} className="p-4 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-2">
                        <Code className="h-4 w-4 text-gray-400" />
                        <code className="text-sm">{{"{{"}{variable.variable}{"}}"}}}</code>
                      </div>
                      <div className="col-span-7">
                        <Select
                          value={variable.mappedTo}
                          onValueChange={(value) => updateMapping(variable.variable, value)}
                        >
                          <SelectTrigger className="font-mono text-sm">
                            <SelectValue placeholder="Map to code element..." />
                          </SelectTrigger>
                          <SelectContent>
                            {codeElements.map((element) => (
                              <SelectItem 
                                key={`${element.path}.${element.element}`} 
                                value={`${element.path}.${element.element}`}
                              >
                                {element.path}.{element.element}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{variable.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Add Variable Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variable">Variable Name</Label>
              <Input
                id="variable"
                placeholder="e.g., friendly_name"
                value={newVariable.variable}
                onChange={(e) => setNewVariable({...newVariable, variable: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newVariable.category}
                onValueChange={(value) => setNewVariable({...newVariable, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Information</SelectItem>
                  <SelectItem value="payment">Payment Information</SelectItem>
                  <SelectItem value="connections">Connections</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this variable represents"
                value={newVariable.description}
                onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mappedTo">Map To (Optional)</Label>
              <Select
                value={newVariable.mappedTo}
                onValueChange={(value) => setNewVariable({...newVariable, mappedTo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Map to code element..." />
                </SelectTrigger>
                <SelectContent>
                  {codeElements.map((element) => (
                    <SelectItem 
                      key={`${element.path}.${element.element}`} 
                      value={`${element.path}.${element.element}`}
                    >
                      {element.path}.{element.element}
                    </SelectItem>
                  ))}
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
  )
}

// Helper function to get category display name
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'general': 'General Information',
    'payment': 'Payment Information',
    'connections': 'Connections',
    'units': 'Units',
    'features': 'Features',
    'tiers': 'Pricing Tiers'
  }
  
  return categoryMap[category] || category
}

// Default mappings with all your variables
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
      mappedTo: "formData.paymentTerms",
      description: "Payment terms (Net 30, etc.)",
      category: "payment"
    },
    {
      variable: "payment_type",
      mappedTo: "formData.paymentType",
      description: "Type of payment",
      category: "payment"
    },
    {
      variable: "saasFrequency",
      mappedTo: "formData.saasFee.frequency",
      description: "Frequency of SaaS payments",
      category: "payment"
    },
    {
      variable: "quarterlyFee",
      mappedTo: "",
      description: "Quarterly fee amount",
      category: "payment"
    },
    {
      variable: "annualFee",
      mappedTo: "calculations.calculateAnnualSaasFee",
      description: "Annual fee amount",
      category: "payment"
    },
    {
      variable: "implementationCost",
      mappedTo: "formData.onboardingFee",
      description: "Implementation cost",
      category: "payment"
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
      mappedTo: "formData.storeConnections",
      description: "Number of store connections",
      category: "connections"
    },
    {
      variable: "aa1_connections",
      mappedTo: "",
      description: "AA1 connections count",
      category: "connections"
    },
    {
      variable: "aa2_connections",
      mappedTo: "",
      description: "AA2 connections count",
      category: "connections"
    },
    {
      variable: "WFH_LCD",
      mappedTo: "",
      description: "WFH LCD connections",
      category: "connections"
    },
    {
      variable: "client_portal",
      mappedTo: "",
      description: "Client portal",
      category: "connections"
    },
    {
      variable: "3pl_billing",
      mappedTo: "",
      description: "3PL billing",
      category: "connections"
    },
    {
      variable: "EDI_connections",
      mappedTo: "",
      description: "EDI connections count",
      category: "connections"
    },
    {
      variable: "netsuite_nonnections",
      mappedTo: "",
      description: "NetSuite connections count",
      category: "connections"
    },
    
    // Units
    {
      variable: "annualUnitTotal",
      mappedTo: "",
      description: "Annual unit total",
      category: "units"
    },
    {
      variable: "overage_example",
      mappedTo: "",
      description: "Overage example",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate",
      mappedTo: "",
      description: "PAYGO overage rate",
      category: "units"
    },
    {
      variable: "PAYGO_total",
      mappedTo: "",
      description: "PAYGO total",
      category: "units"
    },
    {
      variable: "AP_overage_rate",
      mappedTo: "",
      description: "AP overage rate",
      category: "units"
    },
    {
      variable: "AP_total",
      mappedTo: "",
      description: "AP total",
      category: "units"
    },
    {
      variable: "annualUnitTotal_y2",
      mappedTo: "",
      description: "Annual unit total year 2",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate_y2",
      mappedTo: "",
      description: "PAYGO overage rate year 2",
      category: "units"
    },
    {
      variable: "AP_overage_rate_y2",
      mappedTo: "",
      description: "AP overage rate year 2",
      category: "units"
    },
    {
      variable: "annualUnitTotal_y3",
      mappedTo: "",
      description: "Annual unit total year 3",
      category: "units"
    },
    {
      variable: "PAYGO_overage_rate_y3",
      mappedTo: "",
      description: "PAYGO overage rate year 3",
      category: "units"
    },
    {
      variable: "AP_overage_rate_3",
      mappedTo: "",
      description: "AP overage rate year 3",
      category: "units"
    },
    
    // Store Tiers
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
    
    // AA Setup
    {
      variable: "aa_setup_fee",
      mappedTo: "",
      description: "AA setup fee",
      category: "features"
    },
    {
      variable: "aa_setup_days",
      mappedTo: "",
      description: "AA setup days",
      category: "features"
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