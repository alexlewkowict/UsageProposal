import React, { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VariableMappingProps {
  categories: VariableCategory[];
  onVariableSelect: (variable: Variable) => void;
  mappedVariables: Record<string, string>;
  onSaveMappings: () => void;
  totalVariables: number;
  mappedCount: number;
}

interface VariableCategory {
  id: string;
  name: string;
  count: number;
  variables: Variable[];
}

interface Variable {
  id: string;
  name: string;
  description?: string;
  template?: string;
}

export function VariableMapping({ 
  categories, 
  onVariableSelect, 
  mappedVariables, 
  onSaveMappings,
  totalVariables,
  mappedCount
}: VariableMappingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState("All Variables");
  
  // Initialize expandedCategories with all categories collapsed by default
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    categories.forEach(category => {
      initialState[category.id] = false;
    });
    setExpandedCategories(initialState);
  }, [categories]);

  const toggleCategory = useCallback((categoryId: string) => {
    try {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    } catch (error) {
      console.error("Error toggling category:", error);
      // Provide a fallback behavior
      setExpandedCategories({});
    }
  }, []);

  // Filter variables based on search query and active filter
  const filteredCategories = categories.map(category => {
    const filteredVariables = category.variables.filter(variable => {
      const matchesSearch = searchQuery === "" || 
        variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (variable.description && variable.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = 
        activeFilter === "All Variables" || 
        (activeFilter === "Unmapped" && !mappedVariables[variable.id]) ||
        activeFilter === category.name;
      
      return matchesSearch && matchesFilter;
    });
    
    return {
      ...category,
      variables: filteredVariables
    };
  }).filter(category => category.variables.length > 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Variable Mapping</h1>
          <p className="text-gray-500">Map template variables to code elements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5h18M3 9.5h18M3 14.5h18M3 19.5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Filter
          </Button>
          <Button onClick={onSaveMappings}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save Mappings
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Input
            className="pl-10"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["All Variables", "General", "Payment", "Connections", "Units", "Features", "Unmapped"].map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{totalVariables} variables</span>
            <span>•</span>
            <span>{mappedCount} mapped</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredCategories.map(category => (
          <div key={category.id} className="border rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <span className="font-medium">{category.count}</span>
                <span className="ml-2 font-medium">{category.name}</span>
              </div>
              {expandedCategories[category.id] ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            
            {expandedCategories[category.id] && (
              <div className="p-4">
                {category.variables.map(variable => (
                  <div 
                    key={variable.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {`{{${variable.name}}}`}
                      </code>
                      {variable.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{variable.description}</p>
                              {variable.template && (
                                <p className="text-xs mt-1">Used in: {variable.template}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex-1 mx-4">
                      <Input
                        placeholder="Map to code element..."
                        value={mappedVariables[variable.id] || ""}
                        onChange={(e) => onVariableSelect({
                          ...variable,
                          id: variable.id,
                          name: variable.name
                        })}
                        onClick={() => onVariableSelect({
                          ...variable,
                          id: variable.id,
                          name: variable.name
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 