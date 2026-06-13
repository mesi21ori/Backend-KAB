export type HeaderPosition = "top" | "left" | "right";
export type TemplateType = "side" | "top";

export interface LetterTemplate {
  templateType: TemplateType;
  headerUrl: string | null;
  footerUrl: string | null;
  watermarkUrl: string | null;
  headerPosition: HeaderPosition;
  headerMargin: number;
  footerHeight: number;
  watermarkOpacity: number; // 0-100
  watermarkSize: number; // 10-200 (percentage of default size)
  watermarkOffsetX: number; // -100 to +100 pixels from center horizontally
  watermarkOffsetY: number; // -100 to +100 pixels from center vertically
  leftMargin: number; // in mm
  rightMargin: number; // in mm
  topMargin: number; // in mm
  bottomMargin: number; // in mm
  referenceCode: string | null; // Reference code prefix (e.g., "LTR")
}

export const defaultLetterTemplate: LetterTemplate = {
  templateType: "top",
  headerUrl: null,
  footerUrl: null,
  watermarkUrl: null,
  headerPosition: "top",
  headerMargin: 0,
  footerHeight: 40,
  watermarkOpacity: 12,
  watermarkSize: 100, // 100% default size
  watermarkOffsetX: 0, // no horizontal offset from center
  watermarkOffsetY: 0, // no vertical offset from center
  leftMargin: 48, // 48mm default left margin
  rightMargin: 48, // 48mm default right margin
  topMargin: 24, // 24mm default top margin
  bottomMargin: 24, // 24mm default bottom margin
  referenceCode: null, // no reference code by default
};

