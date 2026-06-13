export interface OnboardingWorkflow {
  id: string;
  name: string;
  description: string;
  isRecommended: boolean;
  documentCount: number;
}

export interface OnboardingDocument {
  id: string;
  workflowId: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'IMAGE' | 'OTHER';
  fileSize: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  contentItems?: OnboardingContentItem[]; // Content items in order
}

export interface OnboardingContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'document';
  content: string; // For text: the text content, for image/video/document: file URL or base64
  textType?: 'description' | 'list'; // For text items
  listItems?: string[]; // For list type
  order: number;
  fileName?: string; // For document files: original file name
  fileType?: string; // For document files: file extension (pdf, doc, docx)
}

export interface OnboardingFilters {
  workflow: string;
  fileType: 'All' | 'PDF' | 'DOCX' | 'PPTX' | 'VIDEO' | 'IMAGE' | 'OTHER';
  search: string;
}

