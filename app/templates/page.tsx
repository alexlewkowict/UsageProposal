'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { SlideTemplate } from '@/app/config/proposalConfig';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<SlideTemplate | null>(null);

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Slide Templates</h1>
      
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
                      <Label htmlFor={`template-id-${template.id}`}>Template ID</Label>
                      <Input 
                        id={`template-id-${template.id}`}
                        value={editingTemplate.id}
                        onChange={e => setEditingTemplate({
                          ...editingTemplate,
                          id: e.target.value
                        })}
                      />
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
                      <Input 
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
                    <div className="flex justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => setEditingTemplate(template)}
                      >
                        Edit
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