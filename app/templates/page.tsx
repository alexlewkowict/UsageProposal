'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { SlideTemplate } from '@/app/config/proposalConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariableMappingEditor } from '@/components/VariableMappingEditor';

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Proposal Configuration</h1>
      
      <Tabs defaultValue="templates" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="templates">Slide Templates</TabsTrigger>
          <TabsTrigger value="variables">Variable Mappings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>
        
        <TabsContent value="variables">
          <VariableMappingEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateManager() {
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<SlideTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<SlideTemplate>>({
    name: '',
    description: '',
    id: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd fetch from an API
      // For now, we'll import from the config
      const { slideTemplates } = await import('@/app/config/proposalConfig');
      setTemplates(slideTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: SlideTemplate) => {
    try {
      // In a real app, you'd save to an API
      // For now, we'll just update the local state
      const updatedTemplates = templates.map(t => 
        t.id === template.id ? template : t
      );
      
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
      
      toast({
        title: 'Template Saved',
        description: 'The template has been successfully updated.',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.id) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and ID for the new template',
        variant: 'destructive',
      });
      return;
    }

    const newTemplateComplete: SlideTemplate = {
      id: newTemplate.id,
      name: newTemplate.name,
      description: newTemplate.description || '',
    };

    setTemplates([...templates, newTemplateComplete]);
    setNewTemplate({ name: '', description: '', id: '' });
    setIsAddingNew(false);

    toast({
      title: 'Template Added',
      description: 'The new template has been added successfully.',
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    
    toast({
      title: 'Template Deleted',
      description: 'The template has been successfully deleted.',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Slide Templates</h2>
        <Button onClick={() => setIsAddingNew(true)}>Add New Template</Button>
      </div>
      
      {isAddingNew && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Template</CardTitle>
            <CardDescription>Create a new slide template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-template-name">Template Name</Label>
                <Input 
                  id="new-template-name"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Cover Page"
                />
              </div>
              <div>
                <Label htmlFor="new-template-id">Google Slide ID</Label>
                <Input 
                  id="new-template-id"
                  value={newTemplate.id}
                  onChange={e => setNewTemplate({...newTemplate, id: e.target.value})}
                  placeholder="e.g., 1Abcd123456_slide1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: [Presentation ID]_[Slide ID]
                </p>
              </div>
              <div>
                <Label htmlFor="new-template-desc">Description</Label>
                <Textarea 
                  id="new-template-desc"
                  value={newTemplate.description}
                  onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe what this slide contains"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTemplate}
                >
                  Add Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">No templates found</div>
      ) : (
        <div className="space-y-6">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {editingTemplate?.id === template.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`template-id-${template.id}`}>Google Slide ID</Label>
                      <Input 
                        id={`template-id-${template.id}`}
                        value={editingTemplate.id}
                        onChange={e => setEditingTemplate({
                          ...editingTemplate,
                          id: e.target.value
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: [Presentation ID]_[Slide ID]
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`template-name-${template.id}`}>Name</Label>
                      <Input 
                        id={`template-name-${template.id}`}
                        value={editingTemplate.name}
                        onChange={e => setEditingTemplate({
                          ...editingTemplate,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`template-desc-${template.id}`}>Description</Label>
                      <Textarea 
                        id={`template-desc-${template.id}`}
                        value={editingTemplate.description}
                        onChange={e => setEditingTemplate({
                          ...editingTemplate,
                          description: e.target.value
                        })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setEditingTemplate(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleSaveTemplate(editingTemplate)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    <p className="text-sm mb-4">
                      <span className="font-semibold">ID:</span> {template.id}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setEditingTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
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