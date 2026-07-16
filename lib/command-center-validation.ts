import { z } from "zod";
import { COMMAND_CENTER_COLUMNS } from "./command-center-config.ts";

export type CommandCenterTab = keyof typeof COMMAND_CENTER_COLUMNS;

const LONG_FIELDS = new Set([
  "Blog_Content",
  "Guide_Content",
  "Email_Content",
  "Writer_Brief",
  "Quality_Checks",
  "Media_Prompt",
  "Pin_Caption"
]);

function maxLengthFor(column: string): number {
  if (LONG_FIELDS.has(column)) return 200_000;
  if (column.endsWith("_URL") || column === "CTA_Target" || column === "Product_Link") return 2_048;
  if (column.endsWith("_Title") || column.endsWith("_Subject")) return 300;
  return 4_000;
}

function rowSchema(tab: CommandCenterTab) {
  return z.object(
    Object.fromEntries(
      COMMAND_CENTER_COLUMNS[tab].map((column) => [column, z.string().max(maxLengthFor(column))])
    ) as Record<(typeof COMMAND_CENTER_COLUMNS)[CommandCenterTab][number], z.ZodString>
  ).strict();
}

export function parseCommandCenterRows(tab: CommandCenterTab, input: unknown): Record<string, string>[] {
  return z.array(rowSchema(tab)).max(1_000).parse(input) as Record<string, string>[];
}
