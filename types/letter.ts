export interface ConvertResponse {
  header: string | null;
  body: string;
  footer: string | null;
  watermark: string | null;
  headerPosition?: 'top' | 'side';
}

export interface LetterTemplate {
  id: string;
  name: string;
  header: string | null;
  body: string;
  footer: string | null;
  watermark: string | null;
  headerPosition: 'top' | 'side';
  createdAt: string;
  updatedAt: string;
}

export interface ExportPdfRequest {
  header: string | null;
  body: string;
  footer: string | null;
  watermark: string | null;
  headerPosition?: 'top' | 'side';
  metadata?: {
    title?: string;
    author?: string;
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position?: string;
}
