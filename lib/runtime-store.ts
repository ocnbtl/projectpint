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
      "Writer_Brief",
      "CTA_Target",
      "Quality_Score",
      "Quality_Checks",
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
      "Writer_Brief",
      "CTA_Target",
      "Quality_Score",
      "Quality_Checks",
      "Related_Pins",
      "Published_To_Public_At"
    ]
  },
  Inspiration_Evergreen: {
    table: "inspiration_evergreen",
    primaryKey: "Inspiration_ID",
    columns: [
      "Inspiration_ID",
      "Inspiration_Publish_Date",
      "Inspiration_Publish_Time",
      "Content_Area",
      "Workflow_Status",
      "Inspiration_URL",
      "Inspiration_Title",
      "Inspiration_Style",
      "Inspiration_Tags",
      "Inspiration_Description",
      "Inspiration_Body",
      "Hero_Image_URL",
      "Hero_Alt_Text",
      "Hero_Caption",
      "Hero_Credit",
      "Hero_Rights_Status",
      "SEO_Title",
      "SEO_Description",
      "Canonical_URL",
      "Social_Image_URL",
      "Indexable",
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
  const configuredRoot = process.env.LOCAL_DATA_ROOT?.trim();
  const root = configuredRoot ? path.resolve(configuredRoot) : path.join(process.cwd(), "data", "sheets");
  return path.join(root, `${tabName}.json`);
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

function supabaseTimeoutMs(): number {
  const parsed = Number(process.env.SUPABASE_FETCH_TIMEOUT_MS ?? "6000");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6000;
}

function isSupabaseLoadFallbackEnabled(): boolean {
  return process.env.SUPABASE_LOAD_FALLBACK === "0" ? false : true;
}

async function supabaseFetch(input: string | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), supabaseTimeoutMs());
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
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

  const response = await supabaseFetch(url, {
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
  const existingKeysResponse = await supabaseFetch(existingKeysUrl, {
    method: "GET",
    headers: supabaseHeaders(),
    cache: "no-store"
  });
  const existingKeysBody = (await parseSupabaseResponse(existingKeysResponse)) as Array<Record<string, string>> | null;
  const existingKeys = new Set((existingKeysBody ?? []).map((row) => String(row[dedicated.primaryKey] ?? "")).filter(Boolean));

  if (!normalizedRows.length) {
    const deleteAllUrl = new URL(supabaseTableUrl(dedicated.table));
    deleteAllUrl.searchParams.set(dedicated.primaryKey, "not.is.null");
    const deleteAllResponse = await supabaseFetch(deleteAllUrl, {
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

  const insertResponse = await supabaseFetch(supabaseTableUrl(dedicated.table), {
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
    const deleteResponse = await supabaseFetch(deleteUrl, {
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

async function supabaseLoadServerStorageTab<T>(tabName: string): Promise<T[]> {
  const url = new URL(supabaseTableUrl("app_storage_tabs"));
  url.searchParams.set("select", "rows");
  url.searchParams.set("tab_name", `eq.${tabName}`);
  url.searchParams.set("limit", "1");

  const response = await supabaseFetch(url, {
    method: "GET",
    headers: supabaseHeaders(),
    cache: "no-store"
  });
  const body = (await parseSupabaseResponse(response)) as Array<{ rows?: unknown }> | null;
  const rows = body?.[0]?.rows;
  return Array.isArray(rows) ? (rows as T[]) : [];
}

async function supabaseSaveServerStorageTab<T>(tabName: string, rows: T[]): Promise<void> {
  const response = await supabaseFetch(supabaseTableUrl("app_storage_tabs"), {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({ tab_name: tabName, rows }),
    cache: "no-store"
  });
  await parseSupabaseResponse(response);
}

export function getRuntimeStoreMode(): RuntimeStoreMode {
  return runtimeStoreMode();
}

export async function loadRuntimeTab<T>(tabName: string): Promise<T[]> {
  if (runtimeStoreMode() === "supabase") {
    try {
      return await supabaseLoadTab<T>(tabName);
    } catch (error) {
      if (!isSupabaseLoadFallbackEnabled()) throw error;
      console.warn(`Supabase load failed for ${tabName}; falling back to local data.`, error);
      return localLoadTab<T>(tabName);
    }
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

/** Server-only storage for small admin-managed datasets that do not expose a browser-role table. */
export async function loadServerStorageTab<T>(tabName: string): Promise<T[]> {
  if (runtimeStoreMode() === "supabase") {
    return supabaseLoadServerStorageTab<T>(tabName);
  }
  return localLoadTab<T>(tabName);
}

/** Server-only storage for small admin-managed datasets that do not expose a browser-role table. */
export async function saveServerStorageTab<T>(tabName: string, rows: T[]): Promise<void> {
  if (runtimeStoreMode() === "supabase") {
    await supabaseSaveServerStorageTab(tabName, rows);
    return;
  }
  await localSaveTab(tabName, rows);
}
