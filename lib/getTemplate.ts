import { templateStore, type Template } from './templateStore';

export interface LetterTemplate {
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

export async function getTemplate(id?: string): Promise<LetterTemplate | null> {
  // Get from template store
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
  
  const template = templateStore.getActive();
  return template as LetterTemplate | null;
}

export async function getAllTemplates(): Promise<LetterTemplate[]> {
  // Get all templates from store
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return templateStore.getAll();
}

