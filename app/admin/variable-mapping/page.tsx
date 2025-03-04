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
import { VariableMapping } from "@/components/VariableMapping"

interface VariableMappingData {
  id: string;
  variable_name: string;
  code_element: string | null;
  template_name: string | null;
}

interface Variable {
  id: string;
  name: string;
  description?: string;
  template?: string;
}

interface VariableCategory {
  id: string;
  name: string;
  count: number;
  variables: Variable[];
}

export default function VariableMappingPage() {
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<VariableCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null)
  const [codeElement, setCodeElement] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [totalVariables, setTotalVariables] = useState(0)
  const [mappedCount, setMappedCount] = useState(0)

  useEffect(() => {
    fetchVariableMappings()
  }, [])

  const fetchVariableMappings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/variable-mappings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch variable mappings')
      }
      
      const data: VariableMappingData[] = await response.json()
      
      // Process the data into categories
      const categoriesMap: Record<string, VariableCategory> = {}
      const mappingsRecord: Record<string, string> = {}
      let mapped = 0
      
      data.forEach(item => {
        const variableName = item.variable_name.replace(/{{|}}/g, '')
        const categoryName = getCategoryFromVariable(variableName)
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-')
        
        if (!categoriesMap[categoryId]) {
          categoriesMap[categoryId] = {
            id: categoryId,
            name: categoryName,
            count: 0,
            variables: []
          }
        }
        
        categoriesMap[categoryId].variables.push({
          id: variableName,
          name: variableName,
          description: getDescriptionFromVariable(variableName),
          template: item.template_name || undefined
        })
        
        categoriesMap[categoryId].count++
        
        if (item.code_element) {
          mappingsRecord[variableName] = item.code_element
          mapped++
        }
      })
      
      setCategories(Object.values(categoriesMap))
      setMappings(mappingsRecord)
      setTotalVariables(data.length)
      setMappedCount(mapped)
    } catch (error) {
      console.error('Error fetching variable mappings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch variable mappings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariableSelect = (variable: Variable) => {
    setSelectedVariable(variable)
    setCodeElement(mappings[variable.id] || '')
    setIsDialogOpen(true)
  }

  const handleSaveMapping = async () => {
    if (!selectedVariable) return
    
    try {
      // Update local state
      const newMappings = { ...mappings }
      if (codeElement) {
        newMappings[selectedVariable.id] = codeElement
      } else {
        delete newMappings[selectedVariable.id]
      }
      setMappings(newMappings)
      
      // Update mapped count
      setMappedCount(Object.keys(newMappings).length)
      
      // Close dialog
      setIsDialogOpen(false)
      
      // Save to Supabase
      const response = await fetch('/api/variable-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variable_name: `{{${selectedVariable.id}}}`,
          code_element: codeElement || null
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save mapping')
      }
      
      toast({
        title: 'Success',
        description: 'Variable mapping saved successfully',
      })
    } catch (error) {
      console.error('Error saving mapping:', error)
      toast({
        title: 'Error',
        description: 'Failed to save mapping',
        variant: 'destructive',
      })
    }
  }

  const handleSaveAllMappings = async () => {
    try {
      const mappingsToSave = Object.entries(mappings).map(([variableName, codeElement]) => ({
        variable_name: `{{${variableName}}}`,
        code_element: codeElement
      }))
      
      const response = await fetch('/api/variable-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsToSave),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save mappings')
      }
      
      toast({
        title: 'Success',
        description: 'All variable mappings saved successfully',
      })
    } catch (error) {
      console.error('Error saving all mappings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save all mappings',
        variant: 'destructive',
      })
    }
  }

  // Helper functions
  function getCategoryFromVariable(variableName: string): string {
    if (variableName.includes('payment') || variableName.includes('Fee')) {
      return 'Payment Information'
    } else if (variableName.includes('store') || variableName.includes('connections')) {
      return 'Connections'
    } else if (variableName.includes('tier') || variableName.includes('p1') || variableName.includes('p2')) {
      return 'Pricing Tiers'
    } else if (variableName.includes('unit') || variableName.includes('overage')) {
      return 'Units'
    } else if (variableName.includes('friendly') || variableName.includes('term') || variableName.includes('contract')) {
      return 'General Information'
    } else if (variableName.includes('portal') || variableName.includes('billing') || variableName.includes('EDI')) {
      return 'Features'
    } else {
      return 'Other'
    }
  }

  function getDescriptionFromVariable(variableName: string): string {
    // You can add more detailed descriptions here
    const descriptions: Record<string, string> = {
      'friendly_name': 'Customer\'s friendly business name',
      'term_months': 'Contract term in months',
      'payment_terms': 'Payment terms (Net 30, etc.)',
      'store_connections': 'Number of store connections',
      // Add more as needed
    }
    
    return descriptions[variableName] || `Variable for ${variableName.replace(/_/g, ' ')}`
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading variable mappings...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <VariableMapping
        categories={categories}
        onVariableSelect={handleVariableSelect}
        mappedVariables={mappings}
        onSaveMappings={handleSaveAllMappings}
        totalVariables={totalVariables}
        mappedCount={mappedCount}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Variable to Code Element</DialogTitle>
          </DialogHeader>
          
          {selectedVariable && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Variable</Label>
                <div className="p-2 bg-gray-100 rounded mt-1">
                  <code>{`{{${selectedVariable.name}}}`}</code>
                </div>
                {selectedVariable.description && (
                  <p className="text-sm text-gray-500 mt-1">{selectedVariable.description}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="code-element">Code Element</Label>
                <Input
                  id="code-element"
                  value={codeElement}
                  onChange={(e) => setCodeElement(e.target.value)}
                  placeholder="e.g., formData.businessName"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the JavaScript path to access this data
                </p>
              </div>
              
              <div>
                <Label>Common Code Elements</Label>
                <Select onValueChange={(value) => setCodeElement(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a code element" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formData.friendlyBusinessName">formData.friendlyBusinessName</SelectItem>
                    <SelectItem value="formData.contractTerm">formData.contractTerm</SelectItem>
                    <SelectItem value="formData.paymentTerms">formData.paymentTerms</SelectItem>
                    <SelectItem value="formData.paymentType">formData.paymentType</SelectItem>
                    <SelectItem value="formData.storeConnections">formData.storeConnections</SelectItem>
                    <SelectItem value="formData.saasFee.frequency">formData.saasFee.frequency</SelectItem>
                    <SelectItem value="calculateAnnualSaasFee()">calculateAnnualSaasFee()</SelectItem>
                    <SelectItem value="calculateStoreConnectionsCost()">calculateStoreConnectionsCost()</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMapping}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 