import { z } from "zod";
import {
  MAX_AREA_GENERATOR_COUNT,
  MAX_AREA_GENERATOR_TOTAL,
  MAX_PIN_GENERATOR_COUNT
} from "./constants.ts";

const commandCenterActionSchema = z.enum([
  "generate_new_pins",
  "generate_overlay_cta",
  "generate_new_blogs",
  "generate_blog_titles_keywords",
  "refresh_blog_quality_checks",
  "update_blog_related_pins",
  "publish_approved_blogs",
  "generate_new_guides",
  "generate_guide_titles_keywords",
  "refresh_guide_quality_checks",
  "update_guide_related_pins",
  "publish_approved_guides",
  "generate_new_emails",
  "generate_email_subjects",
  "prepare_approved_pins_for_export",
  "refresh_customers",
  "update_product_stats"
]);

export type CommandCenterAction = z.infer<typeof commandCenterActionSchema>;

const operationEnvelopeSchema = z.object({
  action: commandCenterActionSchema,
  payload: z.unknown().optional()
}).strict();

const pinCountPayloadSchema = z.object({
  count: z.number().int().min(1).max(MAX_PIN_GENERATOR_COUNT)
}).strict();

function areaCountsSchema(maxPerArea: number, maxTotal: number) {
  return z.object({
    Plants: z.number().int().min(0).max(maxPerArea),
    Mirror: z.number().int().min(0).max(maxPerArea),
    Storage: z.number().int().min(0).max(maxPerArea),
    Lighting: z.number().int().min(0).max(maxPerArea),
    Shower: z.number().int().min(0).max(maxPerArea),
    Renter: z.number().int().min(0).max(maxPerArea),
    DIY: z.number().int().min(0).max(maxPerArea),
    ExtremeBudget: z.number().int().min(0).max(maxPerArea)
  }).strict().refine(
    (counts) => Object.values(counts).reduce((total, count) => total + count, 0) <= maxTotal,
    { message: `The requested batch cannot exceed ${maxTotal} total rows.` }
  );
}

const checkboxAreaPayloadSchema = z.object({
  areaCounts: areaCountsSchema(1, 8)
}).strict();

const boundedAreaPayloadSchema = z.object({
  areaCounts: areaCountsSchema(MAX_AREA_GENERATOR_COUNT, MAX_AREA_GENERATOR_TOTAL)
}).strict();

const noPayloadSchema = z.undefined();

const payloadSchemas: Record<CommandCenterAction, z.ZodTypeAny> = {
  generate_new_pins: pinCountPayloadSchema,
  generate_overlay_cta: pinCountPayloadSchema,
  generate_new_blogs: checkboxAreaPayloadSchema,
  generate_blog_titles_keywords: noPayloadSchema,
  refresh_blog_quality_checks: noPayloadSchema,
  update_blog_related_pins: noPayloadSchema,
  publish_approved_blogs: noPayloadSchema,
  generate_new_guides: checkboxAreaPayloadSchema,
  generate_guide_titles_keywords: noPayloadSchema,
  refresh_guide_quality_checks: noPayloadSchema,
  update_guide_related_pins: noPayloadSchema,
  publish_approved_guides: noPayloadSchema,
  generate_new_emails: boundedAreaPayloadSchema,
  generate_email_subjects: noPayloadSchema,
  prepare_approved_pins_for_export: noPayloadSchema,
  refresh_customers: noPayloadSchema,
  update_product_stats: noPayloadSchema
};

export interface CommandCenterOperation {
  action: CommandCenterAction;
  payload?: Record<string, unknown>;
}

export function parseCommandCenterOperation(input: unknown): CommandCenterOperation {
  const envelope = operationEnvelopeSchema.parse(input);
  const payload = payloadSchemas[envelope.action].parse(envelope.payload) as Record<string, unknown> | undefined;
  return payload === undefined ? { action: envelope.action } : { action: envelope.action, payload };
}
