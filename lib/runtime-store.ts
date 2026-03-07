import fs from "node:fs/promises";
import path from "node:path";

type RuntimeStoreMode = "local" | "supabase";

interface DedicatedTableConfig {
  table: string;
  primaryKey: string;
  columns: string[];
}

const DEDICATED_SUPABASE_TABLES: Record<string, DedicatedTableConfig> = {
  Pins_Evergreen: {
    table: "pins_evergreen",
    primaryKey: "Pin_ID",
    columns: [
      "Pin_ID",
      "Pin_Publish_Date",
      "Pin_Publish_Time",
      "Content_Area",
      "Workflow_Status",
      "Destination",
      "Blog_ID",
      "Media_Prompt",
      "Media_URL",
      "Pin_Overlay",
      "Pin_Caption",
      "Pin_CTA",
      "Pin_URL",
      "UTM_URL",
      "Prepared_For_Export_At"
    ]
  },
  Blogs_Evergreen: {
    table: "blogs_evergreen",
    primaryKey: "Blog_ID",
    columns: [
      "Blog_ID",
      "Blog_Publish_Date",
      "Blog_Publish_Time",
      "Content_Area",
      "Workflow_Status",
      "Blog_URL",
      "Blog_Title",
      "Blog_Keywords",
      "Blog_Content",
      "Related_Pins",
      "Published_To_Public_At"
    ]
  },
  Guides_Evergreen: {
    table: "guides_evergreen",
    primaryKey: "Guide_ID",
    columns: [
      "Guide_ID",
      "Guide_Publish_Date",
      "Guide_Publish_Time",
      "Content_Area",
      "Workflow_Status",
      "Blog_ID",
      "Guide_URL",
      "Guide_Title",
      "Guide_Keywords",
      "Guide_Content",
      "Related_Pins",
      "Published_To_Public_At"
    ]
  },
  Emails_Evergreen: {
    table: "emails_evergreen",
    primaryKey: "Email_ID",
    columns: ["Email_ID", "Email_Publish_Date", "Email_Publish_Time", "Content_Area", "Blog_ID", "Email_Subject", "Email_Content"]
  },
  Customers_Evergreen: {
    table: "customers_evergreen",
    primaryKey: "User_ID",
    columns: ["User_ID", "User_Email", "User_Date_Email", "User_Time_Email", "Content_Area", "Purchases"]
  },
  Products_Evergreen: {
    table: "products_evergreen",
    primaryKey: "Product_ID",
    columns: ["Product_ID", "Product_Date", "Product_Sales", "Product_Revenue", "Product_Link", "Blog_ID", "Guide_ID"]
  },
  Leads: {
    table: "leads",
    primaryKey: "Lead_ID",
    columns: [
      "Lead_ID",
      "Email",
      "Created_At",
      "Source_URL",
      "Pillar_Interest",
      "Plant_Light",
      "Plant_Humidity",
      "Plant_Space",
      "Klaviyo_Profile_ID",
      "Consent_Text"
    ]
  }
};

function runtimeStoreMode(): RuntimeStoreMode {
  const legacyForceLocal = process.env.FORCE_LOCAL_SHEETS === "1";
  if (legacyForceLocal) return "local";

  const configured = (process.env.STORAGE_MODE ?? "local").trim().toLowerCase();
  if (configured === "supabase") return "supabase";
  return "local";
}

function localTabPath(tabName: string): string {
  return path.join(process.cwd(), "data", "sheets", `${tabName}.json`);
}

function requireSupabaseEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function isLegacyJwtSupabaseKey(value: string): boolean {
  return value.startsWith("eyJ");
}

async function localLoadTab<T>(tabName: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(localTabPath(tabName), "utf8");
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function localSaveTab<T>(tabName: string, rows: T[]): Promise<void> {
  const filePath = localTabPath(tabName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
}

function supabaseHeaders(): HeadersInit {
  const serverKey = requireSupabaseEnv("SUPABASE_SERVICE_ROLE_KEY");
  const headers: HeadersInit = {
    apikey: serverKey,
    "Content-Type": "application/json"
  };

  if (isLegacyJwtSupabaseKey(serverKey)) {
    return {
      ...headers,
      Authorization: `Bearer ${serverKey}`
    };
  }

  return {
    ...headers
  };
}

function supabaseTableUrl(tableName: string): string {
  return `${requireSupabaseEnv("SUPABASE_URL").replace(/\/+$/, "")}/rest/v1/${tableName}`;
}

async function parseSupabaseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase storage request failed: ${response.status} ${text || response.statusText}`);
  }

  if (!text.trim()) return null;
  return JSON.parse(text) as unknown;
}

async function supabaseLoadTab<T>(tabName: string): Promise<T[]> {
  const dedicated = DEDICATED_SUPABASE_TABLES[tabName];
  if (!dedicated) {
    throw new Error(`Unsupported hosted runtime tab: ${tabName}`);
  }

  const url = new URL(supabaseTableUrl(dedicated.table));
  url.searchParams.set("select", "*");
  url.searchParams.set("order", `${dedicated.primaryKey}.asc`);

  const response = await fetch(url, {
    method: "GET",
    headers: supabaseHeaders(),
    cache: "no-store"
  });
  const body = (await parseSupabaseResponse(response)) as T[] | null;
  return Array.isArray(body) ? body : [];
}

async function supabaseSaveTab<T>(tabName: string, rows: T[]): Promise<void> {
  const dedicated = DEDICATED_SUPABASE_TABLES[tabName];
  if (!dedicated) {
    throw new Error(`Unsupported hosted runtime tab: ${tabName}`);
  }

  const normalizedRows = rows.map((row) =>
    Object.fromEntries(
      dedicated.columns.map((column) => [column, String((row as Record<string, unknown>)[column] ?? "")])
    )
  );

  const existingKeysUrl = new URL(supabaseTableUrl(dedicated.table));
  existingKeysUrl.searchParams.set("select", dedicated.primaryKey);
  const existingKeysResponse = await fetch(existingKeysUrl, {
    method: "GET",
    headers: supabaseHeaders(),
    cache: "no-store"
  });
  const existingKeysBody = (await parseSupabaseResponse(existingKeysResponse)) as Array<Record<string, string>> | null;
  const existingKeys = new Set((existingKeysBody ?? []).map((row) => String(row[dedicated.primaryKey] ?? "")).filter(Boolean));

  if (!normalizedRows.length) {
    const deleteAllUrl = new URL(supabaseTableUrl(dedicated.table));
    deleteAllUrl.searchParams.set(dedicated.primaryKey, "not.is.null");
    const deleteAllResponse = await fetch(deleteAllUrl, {
      method: "DELETE",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=minimal"
      },
      cache: "no-store"
    });
    await parseSupabaseResponse(deleteAllResponse);
    return;
  }

  const insertResponse = await fetch(supabaseTableUrl(dedicated.table), {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(normalizedRows),
    cache: "no-store"
  });
  await parseSupabaseResponse(insertResponse);

  const nextKeys = new Set(normalizedRows.map((row) => String(row[dedicated.primaryKey] ?? "")).filter(Boolean));
  const staleKeys = Array.from(existingKeys).filter((key) => !nextKeys.has(key));
  for (const key of staleKeys) {
    const deleteUrl = new URL(supabaseTableUrl(dedicated.table));
    deleteUrl.searchParams.set(dedicated.primaryKey, `eq.${key}`);
    const deleteResponse = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=minimal"
      },
      cache: "no-store"
    });
    await parseSupabaseResponse(deleteResponse);
  }
}

export function getRuntimeStoreMode(): RuntimeStoreMode {
  return runtimeStoreMode();
}

export async function loadRuntimeTab<T>(tabName: string): Promise<T[]> {
  if (runtimeStoreMode() === "supabase") {
    return supabaseLoadTab<T>(tabName);
  }
  return localLoadTab<T>(tabName);
}

export async function saveRuntimeTab<T>(tabName: string, rows: T[]): Promise<void> {
  if (runtimeStoreMode() === "supabase") {
    await supabaseSaveTab(tabName, rows);
    return;
  }
  await localSaveTab(tabName, rows);
}
