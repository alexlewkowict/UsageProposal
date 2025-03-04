// This would be loaded from your database in a real application
export let variableMappings: any[] = []

export function setVariableMappings(mappings: any[]) {
  variableMappings = mappings
}

export function getVariableMappings() {
  return variableMappings
}

export function resolveVariables(template: string, data: any) {
  // Replace all {{variable}} occurrences with their values
  return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    // Find the mapping for this variable
    const mapping = variableMappings.find(m => m.variable === variable.trim())
    
    if (!mapping || !mapping.mappedTo) {
      return match // Keep the original placeholder if no mapping exists
    }
    
    // Extract the value using the mapping
    const path = mapping.mappedTo.split('.')
    let value = data
    
    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        value = undefined
        break
      }
    }
    
    return value !== undefined ? String(value) : match
  })
} 