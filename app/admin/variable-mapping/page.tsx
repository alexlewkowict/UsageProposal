"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Code, Filter, Info, Save, Search, ChevronDown, ChevronUp, Plus, ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VariableMapping } from "@/components/VariableMapping"
import Link from "next/link"

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
  const [allCodeElements, setAllCodeElements] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchVariableMappings()
  }, [])

  const fetchVariableMappings = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching variable mappings...')
      
      const response = await fetch('/api/variable-mappings')
      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('API error response:', responseData)
        throw new Error(responseData.error || 'Failed to fetch variable mappings')
      }
      
      console.log(`Fetched ${responseData.length} variable mappings`)
      
      // If no data was returned, initialize with empty array
      const data = responseData || []
      
      // Process the data into categories based on template_name
      const categoriesMap: Record<string, VariableCategory> = {}
      const mappingsRecord: Record<string, string> = {}
      const codeElementsSet = new Set<string>()
      let mapped = 0
      
      // Create an "Uncategorized" category for variables without a template_name
      categoriesMap["uncategorized"] = {
        id: "uncategorized",
        name: "Uncategorized",
        count: 0,
        variables: []
      }
      
      // If we have no data, add some default variables
      if (data.length === 0) {
        console.log('No data returned, adding default variables')
        
        // Add some default variables
        const defaultVariables = [
          { variable_name: '{{friendly_name}}', template_name: 'Cover' },
          { variable_name: '{{term_months}}', template_name: 'General' },
          { variable_name: '{{contractLength}}', template_name: 'Pricing Details' },
          { variable_name: '{{payment_terms}}', template_name: 'Payment' }
        ]
        
        data.push(...defaultVariables)
      }
      
      data.forEach(item => {
        const variableName = item.variable_name.replace(/{{|}}/g, '')
        const templateName = item.template_name || "Uncategorized"
        const categoryId = templateName.toLowerCase().replace(/\s+/g, '-')
        
        if (!categoriesMap[categoryId] && templateName !== "Uncategorized") {
          categoriesMap[categoryId] = {
            id: categoryId,
            name: templateName,
            count: 0,
            variables: []
          }
        }
        
        const targetCategory = categoriesMap[categoryId] || categoriesMap["uncategorized"]
        
        targetCategory.variables.push({
          id: variableName,
          name: variableName,
          description: getDescriptionFromVariable(variableName),
          template: templateName !== "Uncategorized" ? templateName : undefined
        })
        
        targetCategory.count++
        
        if (item.code_element) {
          mappingsRecord[variableName] = item.code_element
          codeElementsSet.add(item.code_element)
          mapped++
        }
      })
      
      // Add common code elements to the set
      const commonCodeElements = [
        "formData.friendlyBusinessName",
        "formData.contractTerm",
        "formData.paymentTerms",
        "formData.paymentType",
        "formData.storeConnections",
        "formData.saasFee.frequency",
        "calculateAnnualSaasFee()",
        "calculateStoreConnectionsCost()",
        "formData.implementationFee",
        "formData.quarterlyFee",
        "formData.annualFee"
      ]
      
      commonCodeElements.forEach(element => codeElementsSet.add(element))
      
      // Convert categories map to array and sort by name
      const categoriesArray = Object.values(categoriesMap)
        .filter(category => category.count > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
      
      // Move "Uncategorized" to the end if it exists and has variables
      const uncategorizedIndex = categoriesArray.findIndex(c => c.id === "uncategorized")
      if (uncategorizedIndex !== -1 && categoriesArray[uncategorizedIndex].count > 0) {
        const uncategorized = categoriesArray.splice(uncategorizedIndex, 1)[0]
        categoriesArray.push(uncategorized)
      }
      
      setCategories(categoriesArray)
      setMappings(mappingsRecord)
      setTotalVariables(data.length)
      setMappedCount(mapped)
      setAllCodeElements(Array.from(codeElementsSet).sort())
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
        
        // Add to code elements if it's new
        if (!allCodeElements.includes(codeElement)) {
          setAllCodeElements([...allCodeElements, codeElement].sort())
        }
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
      setIsSaving(true)
      
      // Show loading toast
      toast({
        title: 'Saving...',
        description: 'Saving all variable mappings to database',
      })
      
      // Prepare the mappings data for saving
      const mappingsToSave = Object.entries(mappings).map(([variableName, codeElement]) => ({
        variable_name: `{{${variableName}}}`,
        code_element: codeElement
      }))
      
      // Add unmapped variables with null code_element
      categories.forEach(category => {
        category.variables.forEach(variable => {
          // Check if this variable is already in the mappingsToSave array
          const alreadyIncluded = mappingsToSave.some(
            m => m.variable_name === `{{${variable.id}}}`
          )
          
          if (!alreadyIncluded) {
            mappingsToSave.push({
              variable_name: `{{${variable.id}}}`,
              code_element: null
            })
          }
        })
      })
      
      console.log('Saving mappings:', mappingsToSave)
      
      // Send the data to the API
      const response = await fetch('/api/variable-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingsToSave),
      })
      
      const responseData = await response.json()
      console.log('API response:', responseData)
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save mappings')
      }
      
      // Show success toast
      toast({
        title: 'Success',
        description: `${mappingsToSave.length} variable mappings saved successfully`,
      })
      
      // Refresh the data
      await fetchVariableMappings()
    } catch (error) {
      console.error('Error saving all mappings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save all mappings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function for variable descriptions
  function getDescriptionFromVariable(variableName: string): string {
    // You can add more detailed descriptions here
    const descriptions: Record<string, string> = {
      'friendly_name': 'Customer\'s friendly business name',
      'term_months': 'Contract term in months',
      'payment_terms': 'Payment terms (Net 30, etc.)',
      'store_connections': 'Number of store connections',
      'contractLength': 'Length of the contract in months',
      'quarterlyFee': 'Quarterly SaaS fee amount',
      'annualFee': 'Annual SaaS fee amount',
      'implementationCost': 'One-time implementation cost',
      'storeConnectionsCount': 'Number of store connections',
      'annualUnitTotal': 'Total annual units',
      'PAYGO_overage_rate': 'Pay-as-you-go overage rate',
      'AP_overage_rate': 'Annual plan overage rate',
      'saasFrequency': 'SaaS billing frequency (monthly, quarterly, annual)'
    }
    
    return descriptions[variableName] || `Variable for ${variableName.replace(/_/g, ' ')}`
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading variable mappings...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Variable Mapping</h1>
      </div>
      
      <VariableMapping
        categories={categories}
        onVariableSelect={handleVariableSelect}
        mappedVariables={mappings}
        onSaveMappings={handleSaveAllMappings}
        totalVariables={totalVariables}
        mappedCount={mappedCount}
        isSaving={isSaving}
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
                {selectedVariable.template && (
                  <p className="text-sm text-blue-500 mt-1">Used in: {selectedVariable.template}</p>
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
                <Label>Available Code Elements</Label>
                <Select onValueChange={(value) => setCodeElement(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a code element" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {allCodeElements.map(element => (
                      <SelectItem key={element} value={element}>
                        {element}
                      </SelectItem>
                    ))}
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