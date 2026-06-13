import { LetterTemplate, defaultLetterTemplate } from "@/types/letterTemplate";

const STORAGE_KEY = "letter-template";
const TEMPLATES_LIST_KEY = "letter-templates-list";
const ACTIVE_TEMPLATE_KEY = "letter-template-active";

export interface SavedTemplate {
  id: string;
  name: string;
  createdAt: string;
  template: LetterTemplate;
}

// Get all saved templates
export function getAllTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(TEMPLATES_LIST_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SavedTemplate[];
      // Migrate old single template to new format if needed
      if (parsed.length === 0) {
        const oldTemplate = localStorage.getItem(STORAGE_KEY);
        if (oldTemplate) {
          try {
            const oldParsed = JSON.parse(oldTemplate) as LetterTemplate;
            const migrated: SavedTemplate = {
              id: `template-${Date.now()}`,
              name: "Default Template",
              createdAt: new Date().toISOString(),
              template: migrateTemplate(oldParsed),
            };
            const templates = [migrated];
            localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(templates));
            localStorage.setItem(ACTIVE_TEMPLATE_KEY, migrated.id);
            return templates;
          } catch (e) {
            console.error("Error migrating old template:", e);
          }
        }
      }
      return parsed.map(t => ({
        ...t,
        template: migrateTemplate(t.template),
      }));
    }
  } catch (error) {
    console.error("Error loading templates from localStorage:", error);
  }

  return [];
}

// Get template by ID
export function getTemplateById(id: string): SavedTemplate | null {
  const templates = getAllTemplates();
  return templates.find(t => t.id === id) || null;
}

// Save a new template or update existing
export function saveTemplateAs(template: LetterTemplate, name: string, id?: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const templates = getAllTemplates();
    const migratedTemplate = migrateTemplate(template);
    
    if (id) {
      // Update existing template
      const index = templates.findIndex(t => t.id === id);
      if (index !== -1) {
        templates[index] = {
          ...templates[index],
          name,
          template: migratedTemplate,
        };
      }
    } else {
      // For single template per company: replace existing if any, otherwise create new
      if (templates.length > 0) {
        // Replace the first (and only) template
        templates[0] = {
          ...templates[0],
          name: name || templates[0].name,
          template: migratedTemplate,
        };
        id = templates[0].id;
      } else {
        // Create new template
        const newTemplate: SavedTemplate = {
          id: `template-${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
          template: migratedTemplate,
        };
        templates.push(newTemplate);
        id = newTemplate.id;
      }
    }

    localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(templates));
    if (id) {
      setActiveTemplate(id);
    }
    return id || "";
  } catch (error) {
    console.error("Error saving template to localStorage:", error);
    return "";
  }
}

// Get the single template (for single template per company)
export function getSingleTemplate(): SavedTemplate | null {
  const templates = getAllTemplates();
  return templates.length > 0 ? templates[0] : null;
}

// Delete template by ID
export function deleteTemplate(id: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const templates = getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);
    
    // If no templates left, clear all template-related storage
    if (filtered.length === 0) {
      localStorage.removeItem(TEMPLATES_LIST_KEY);
      localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
      // Also clear legacy storage key if it exists
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(filtered));
    }
    
    // If deleted template was active, clear active template
    const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting template from localStorage:", error);
    return false;
  }
}

// Set active template
export function setActiveTemplate(id: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
}

// Get active template ID
export function getActiveTemplateId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(ACTIVE_TEMPLATE_KEY);
}

// Migrate template to ensure all fields exist
function migrateTemplate(template: LetterTemplate): LetterTemplate {
  if (!template.templateType) {
    template.templateType = template.headerPosition === "top" ? "top" : "side";
  }
  // Fix mismatched templateType and headerPosition
  if (template.templateType === "side" && template.headerPosition === "top") {
    template.headerPosition = "right";
  }
  if (template.templateType === "top" && template.headerPosition !== "top") {
    template.headerPosition = "top";
  }
  // Add watermarkSize field if missing (migration)
  if (typeof template.watermarkSize === "undefined") {
    template.watermarkSize = 100;
  }
  // Add margin fields if missing (migration)
  if (typeof template.leftMargin === "undefined") {
    template.leftMargin = 48;
  }
  if (typeof template.rightMargin === "undefined") {
    template.rightMargin = 48;
  }
  // Add top and bottom margin fields if missing (migration)
  if (typeof template.topMargin === "undefined") {
    template.topMargin = 24;
  }
  if (typeof template.bottomMargin === "undefined") {
    template.bottomMargin = 24;
  }
  // Convert old grid positioning to offset positioning (migration)
  if (typeof (template as any).watermarkHorizontalPosition !== "undefined" || typeof (template as any).watermarkVerticalPosition !== "undefined") {
    const oldHorizontal = (template as any).watermarkHorizontalPosition;
    const oldVertical = (template as any).watermarkVerticalPosition;
    
    if (oldHorizontal === "left") {
      (template as any).watermarkOffsetX = -50;
    } else if (oldHorizontal === "right") {
      (template as any).watermarkOffsetX = 50;
    } else {
      (template as any).watermarkOffsetX = 0;
    }
    
    if (oldVertical === "top") {
      (template as any).watermarkOffsetY = -50;
    } else if (oldVertical === "bottom") {
      (template as any).watermarkOffsetY = 50;
    } else {
      (template as any).watermarkOffsetY = 0;
    }
    
    delete (template as any).watermarkHorizontalPosition;
    delete (template as any).watermarkVerticalPosition;
  }
  
  // Add offset fields if missing (migration)
  if (typeof template.watermarkOffsetX === "undefined") {
    template.watermarkOffsetX = 0;
  }
  if (typeof template.watermarkOffsetY === "undefined") {
    template.watermarkOffsetY = 0;
  }
  // Add referenceCode field if missing (migration)
  if (typeof template.referenceCode === "undefined") {
    template.referenceCode = null;
  }
  
  return template;
}

// Backward compatibility: Get active/default template
export function getTemplate(): LetterTemplate {
  if (typeof window === "undefined") {
    return defaultLetterTemplate;
  }

  try {
    // First try to get active template from new system
    const activeId = getActiveTemplateId();
    if (activeId) {
      const activeTemplate = getTemplateById(activeId);
      if (activeTemplate) {
        return activeTemplate.template;
      }
    }

    // Fallback to old storage for migration
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LetterTemplate;
      return migrateTemplate(parsed);
    }

    // Try to get first template from list
    const templates = getAllTemplates();
    if (templates.length > 0) {
      return templates[0].template;
    }
  } catch (error) {
    console.error("Error loading template from localStorage:", error);
  }

  return defaultLetterTemplate;
}

// Backward compatibility: Save template (saves as active template)
export function saveTemplate(template: LetterTemplate): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Save to old storage for backward compatibility
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
    
    // Also update active template if exists
    const activeId = getActiveTemplateId();
    if (activeId) {
      const templates = getAllTemplates();
      const index = templates.findIndex(t => t.id === activeId);
      if (index !== -1) {
        templates[index].template = migrateTemplate(template);
        localStorage.setItem(TEMPLATES_LIST_KEY, JSON.stringify(templates));
      }
    }
  } catch (error) {
    console.error("Error saving template to localStorage:", error);
  }
}


