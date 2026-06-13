// Simple client-side template storage
// In production, replace with database/API calls

export interface Template {
  id: string;
  name: string;
  imageUrl?: string;
  htmlContent?: string;
  type: 'image' | 'word';
  metadata?: {
    header?: string | null;
    footer?: string | null;
    watermark?: string | null;
    headerType?: 'top' | 'side';
  };
}

const STORAGE_KEY = 'letter-templates';
const ACTIVE_TEMPLATE_KEY = 'active-letter-template-id';

// Load from localStorage on initialization
function loadTemplates(): Template[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading templates from localStorage:', error);
  }
  
  return [];
}

function saveTemplates(templates: Template[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates to localStorage:', error);
  }
}

function getActiveTemplateId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(ACTIVE_TEMPLATE_KEY);
  } catch (error) {
    console.error('Error loading active template ID:', error);
    return null;
  }
}

function setActiveTemplateId(id: string | null) {
  if (typeof window === 'undefined') return;
  
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
    }
  } catch (error) {
    console.error('Error saving active template ID:', error);
  }
}

let templates: Template[] = loadTemplates();

export const templateStore = {
  getAll: () => templates,
  
  getActive: () => {
    const activeId = getActiveTemplateId();
    if (activeId) {
      const active = templates.find(t => t.id === activeId);
      if (active) return active;
    }
    
    // Fallback: prioritize Word templates, then first template
    const wordTemplate = templates.find(t => t.type === 'word');
    if (wordTemplate) return wordTemplate;
    
    return templates[0] || null;
  },
  
  add: (template: Template, setAsActive: boolean = false) => {
    templates.push(template);
    saveTemplates(templates);
    
    // Automatically set Word templates as active, or if explicitly requested
    if (setAsActive || template.type === 'word') {
      setActiveTemplateId(template.id);
    }
  },
  
  setActive: (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setActiveTemplateId(id);
    }
  },
  
  remove: (id: string) => {
    const wasActive = getActiveTemplateId() === id;
    templates = templates.filter(t => t.id !== id);
    saveTemplates(templates);
    
    // If active template was removed, clear active ID
    if (wasActive) {
      setActiveTemplateId(null);
    }
  },
  
  clear: () => {
    templates = [];
    saveTemplates(templates);
    setActiveTemplateId(null);
  }
};

