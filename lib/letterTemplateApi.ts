import type { LetterTemplateApi } from "@/lib/api";
import type { LetterTemplate } from "@/types/letterTemplate";
import type { SavedTemplate } from "@/lib/letterTemplateStore";

export function mapApiToLetterTemplate(api: LetterTemplateApi): LetterTemplate {
  return {
    templateType: (api.templateType as LetterTemplate["templateType"]) ?? "top",
    headerUrl: api.headerUrl ?? null,
    footerUrl: api.footerUrl ?? null,
    watermarkUrl: api.watermarkUrl ?? null,
    headerPosition: (api.headerPosition as LetterTemplate["headerPosition"]) ?? "top",
    headerMargin: api.headerMargin ?? 0,
    footerHeight: api.footerHeight ?? 40,
    watermarkOpacity: api.watermarkOpacity ?? 12,
    watermarkSize: api.watermarkSize ?? 100,
    watermarkOffsetX: api.watermarkOffsetX ?? 0,
    watermarkOffsetY: api.watermarkOffsetY ?? 0,
    leftMargin: api.leftMargin ?? 48,
    rightMargin: api.rightMargin ?? 48,
    topMargin: api.topMargin ?? 24,
    bottomMargin: api.bottomMargin ?? 24,
    referenceCode: api.referenceCode ?? null,
  };
}

export function mapApiToSavedTemplate(api: LetterTemplateApi): SavedTemplate {
  return {
    id: api.id,
    name: api.name ?? "Letter Template",
    createdAt: api.createdAt ?? new Date().toISOString(),
    template: mapApiToLetterTemplate(api),
  };
}

export function templateToApiBody(
  template: LetterTemplate,
  name: string,
  createdById?: string | null
): Record<string, unknown> {
  return {
    name: name || null,
    templateType: template.templateType,
    headerUrl: template.headerUrl,
    footerUrl: template.footerUrl,
    watermarkUrl: template.watermarkUrl,
    headerPosition: template.headerPosition,
    headerMargin: template.headerMargin,
    footerHeight: template.footerHeight,
    watermarkOpacity: template.watermarkOpacity,
    watermarkSize: template.watermarkSize,
    watermarkOffsetX: template.watermarkOffsetX,
    watermarkOffsetY: template.watermarkOffsetY,
    leftMargin: template.leftMargin,
    rightMargin: template.rightMargin,
    topMargin: template.topMargin,
    bottomMargin: template.bottomMargin,
    referenceCode: template.referenceCode,
    ...(createdById ? { createdById } : {}),
  };
}
