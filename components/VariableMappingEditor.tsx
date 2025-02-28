'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { VariableMapping } from '@/app/config/proposalConfig';

export function VariableMappingEditor() {
  const [mappings, setMappings] = useState<VariableMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMapping, setEditingMapping] = useState<VariableMapping | null>(null);
  const [newMapping, setNewMapping] = useState<Partial<VariableMapping>>({
    formField: '',
    slideVariable: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd fetch from an API
      // For now, we'll import from the config
      const { variableMappings } = await import('@/app/config/proposalConfig');
      setMappings(variableMappings);
    } catch (error) {
      console.error('Error fetching variable mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch variable mappings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMapping = (mapping: VariableMapping) => {
    try {
      // In a real app, you'd save to an API
      // For now, we'll just update the local state
      const updatedMappings = mappings.map(m => 
        m.slideVariable === mapping.slideVariable ? mapping : m
      );
      
      setMappings(updatedMappings);
      setEditingMapping(null);
      
      toast({
        title: 'Mapping Saved',
        description: 'The variable mapping has been successfully updated.',
      });
    } catch (error) {
      console.error('Error saving mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to save mapping',
        variant: 'destructive',
      });
    }
  };

  const handleAddMapping = () => {
    if (!newMapping.formField || !newMapping.slideVariable) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both form field and slide variable',
        variant: 'destructive',
      });
      return;
    }

    // Make sure the slide variable is in the format {{variableName}}
    let slideVar = newMapping.slideVariable;
    if (!slideVar.startsWith('{{')) slideVar = '{{' + slideVar;
    if (!slideVar.endsWith('}}')) slideVar = slideVar + '}}';

    const newMappingComplete: VariableMapping = {
      formField: newMapping.formField,
      slideVariable: slideVar
    };

    setMappings([...mappings, newMappingComplete]);
    setNewMapping({ formField: '', slideVariable: '' });
    setIsAddingNew(false);

    toast({
      title: 'Mapping Added',
      description: 'The new variable mapping has been added successfully.',
    });
  };

  const handleDeleteMapping = (slideVariable: string) => {
    setMappings(mappings.filter(m => m.slideVariable !== slideVariable));
    
    toast({
      title: 'Mapping Deleted',
      description: 'The variable mapping has been successfully deleted.',
    });
  };

  const formatterOptions = [
    { value: '', label: 'None' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number with commas' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Variable Mappings</h2>
        <Button onClick={() => setIsAddingNew(true)}>Add New Mapping</Button>
      </div>
      
      {isAddingNew && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Variable Mapping</CardTitle>
            <CardDescription>Map form fields to slide variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-mapping-field">Form Field</Label>
                <Input 
                  id="new-mapping-field"
                  value={newMapping.formField}
                  onChange={e => setNewMapping({...newMapping, formField: e.target.value})}
                  placeholder="e.g., saasFee.frequency or businessName"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use dot notation for nested fields (e.g., saasFee.frequency)
                </p>
              </div>
              <div>
                <Label htmlFor="new-mapping-variable">Slide Variable</Label>
                <Input 
                  id="new-mapping-variable"
                  value={newMapping.slideVariable}
                  onChange={e => setNewMapping({...newMapping, slideVariable: e.target.value})}
                  placeholder="e.g., {{businessName}}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the placeholder text in your Google Slides
                </p>
              </div>
              <div>
                <Label htmlFor="new-mapping-formatter">Formatter</Label>
                <Select 
                  onValueChange={(value) => setNewMapping({...newMapping, formatter: value ? value : undefined})}
                >
                  <SelectTrigger id="new-mapping-formatter">
                    <SelectValue placeholder="Select a formatter" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Format the value before inserting it into the slide
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMapping}
                >
                  Add Mapping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">Loading variable mappings...</div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-8">No variable mappings found</div>
      ) : (
        <div className="space-y-6">
          {mappings.map(mapping => (
            <Card key={mapping.slideVariable}>
              <CardHeader>
                <CardTitle>{mapping.slideVariable}</CardTitle>
                <CardDescription>{mapping.formField}</CardDescription>
              </CardHeader>
              <CardContent>
                {editingMapping?.slideVariable === mapping.slideVariable ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`mapping-field-${mapping.slideVariable}`}>Form Field</Label>
                      <Input 
                        id={`mapping-field-${mapping.slideVariable}`}
                        value={editingMapping.formField}
                        onChange={e => setEditingMapping({
                          ...editingMapping,
                          formField: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`mapping-variable-${mapping.slideVariable}`}>Slide Variable</Label>
                      <Input 
                        id={`mapping-variable-${mapping.slideVariable}`}
                        value={editingMapping.slideVariable}
                        onChange={e => setEditingMapping({
                          ...editingMapping,
                          slideVariable: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`mapping-formatter-${mapping.slideVariable}`}>Formatter</Label>
                      <Select 
                        defaultValue={mapping.formatter ? 'custom' : ''}
                        onValueChange={(value) => setEditingMapping({
                          ...editingMapping, 
                          formatter: value ? (value === 'custom' ? mapping.formatter : undefined) : undefined
                        })}
                      >
                        <SelectTrigger id={`mapping-formatter-${mapping.slideVariable}`}>
                          <SelectValue placeholder="Select a formatter" />
                        </SelectTrigger>
                        <SelectContent>
                          {formatterOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                          {mapping.formatter && (
                            <SelectItem value="custom">Custom Formatter</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setEditingMapping(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleSaveMapping(editingMapping)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold">Form Field:</p>
                        <p className="text-sm">{mapping.formField}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Formatter:</p>
                        <p className="text-sm">{mapping.formatter ? 'Custom' : 'None'}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setEditingMapping(mapping)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteMapping(mapping.slideVariable)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 