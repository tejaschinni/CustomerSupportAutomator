/**
 * Helper functions for template processing
 */

// Replace variables in a template with actual values
export function processTemplate(template: string, variables: Record<string, string>) {
  let processedContent = template;
  
  // Replace each variable with its value
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });
  
  // Replace any remaining variables with empty strings or placeholders
  processedContent = processedContent.replace(/{{(.*?)}}/g, '');
  
  return processedContent;
}

// Extract variables from a template
export function extractVariables(template: string): string[] {
  const variables: string[] = [];
  const regex = /{{(.*?)}}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

// Check if a template has all required variables
export function validateTemplate(template: string, requiredVariables: string[]): boolean {
  const templateVariables = extractVariables(template);
  return requiredVariables.every(v => templateVariables.includes(v));
}

// Format template content for display (e.g., convert newlines to <br>)
export function formatTemplateForDisplay(content: string): string {
  return content.replace(/\n/g, '<br>');
}
