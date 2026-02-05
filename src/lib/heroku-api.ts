/**
 * Heroku REST API Client
 * 
 * Uses the Heroku Platform API directly.
 * Auth via HEROKU_API_KEY environment variable.
 */

const HEROKU_API_BASE = "https://api.heroku.com";

export interface HerokuApp {
  id: string;
  name: string;
  web_url: string;
  region: { name: string };
  stack: { name: string };
  created_at: string;
  updated_at: string;
  owner: { email: string };
  team?: { name: string };
  maintenance: boolean;
}

export interface HerokuRelease {
  id: string;
  version: number;
  description: string;
  status: string;
  created_at: string;
  user: { email: string };
  current: boolean;
}

export interface HerokuDyno {
  id: string;
  name: string;
  type: string;
  state: string;
  size: string;
  created_at: string;
  updated_at: string;
}

export interface HerokuAddon {
  id: string;
  name: string;
  addon_service: { name: string };
  plan: { name: string };
  state: string;
  created_at: string;
}

export interface HerokuFormation {
  id: string;
  type: string;
  quantity: number;
  size: string;
  command: string | null;
}

export interface LogSession {
  logplex_url: string;
  created_at: string;
}

function getApiKey(): string {
  const key = process.env.HEROKU_API_KEY;
  if (!key) {
    throw new Error("HEROKU_API_KEY environment variable not set");
  }
  return key;
}

function getHeaders(): Record<string, string> {
  return {
    "Authorization": `Bearer ${getApiKey()}`,
    "Accept": "application/vnd.heroku+json; version=3",
    "Content-Type": "application/json",
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${HEROKU_API_BASE}${path}`;
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(`Heroku API error (${response.status}): ${errorMessage}`);
  }

  // Some endpoints return empty response
  const text = await response.text();
  if (!text) return {} as T;
  
  return JSON.parse(text) as T;
}

/**
 * List all apps (optionally filtered by team)
 */
export async function listApps(team?: string): Promise<HerokuApp[]> {
  if (team) {
    return request<HerokuApp[]>("GET", `/teams/${team}/apps`);
  }
  return request<HerokuApp[]>("GET", "/apps");
}

/**
 * Get app details
 */
export async function getApp(appName: string): Promise<HerokuApp> {
  return request<HerokuApp>("GET", `/apps/${appName}`);
}

/**
 * List releases for an app
 */
export async function listReleases(
  appName: string,
  limit: number = 10
): Promise<HerokuRelease[]> {
  const releases = await request<HerokuRelease[]>(
    "GET",
    `/apps/${appName}/releases`
  );
  // API returns newest first, limit results
  return releases.slice(0, limit);
}

/**
 * Get log session URL (for streaming logs)
 */
export async function getLogSession(
  appName: string,
  options: { lines?: number; dyno?: string; source?: string } = {}
): Promise<LogSession> {
  const body: Record<string, unknown> = {
    lines: options.lines || 100,
    tail: false,
  };
  
  if (options.dyno) body.dyno = options.dyno;
  if (options.source) body.source = options.source;

  return request<LogSession>("POST", `/apps/${appName}/log-sessions`, body);
}

/**
 * Fetch logs from logplex URL
 */
export async function fetchLogs(logplexUrl: string): Promise<string> {
  const response = await fetch(logplexUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.status}`);
  }
  return response.text();
}

/**
 * Restart dynos (all or specific)
 */
export async function restartDynos(
  appName: string,
  dyno?: string
): Promise<void> {
  if (dyno) {
    await request<void>("DELETE", `/apps/${appName}/dynos/${dyno}`);
  } else {
    await request<void>("DELETE", `/apps/${appName}/dynos`);
  }
}

/**
 * Get formations (dyno types and quantities)
 */
export async function getFormations(appName: string): Promise<HerokuFormation[]> {
  return request<HerokuFormation[]>("GET", `/apps/${appName}/formation`);
}

/**
 * Scale a dyno type
 */
export async function scaleDyno(
  appName: string,
  dynoType: string,
  quantity: number,
  size?: string
): Promise<HerokuFormation> {
  const body: Record<string, unknown> = { quantity };
  if (size) body.size = size;
  
  return request<HerokuFormation>(
    "PATCH",
    `/apps/${appName}/formation/${dynoType}`,
    body
  );
}

/**
 * List add-ons for an app
 */
export async function listAddons(appName: string): Promise<HerokuAddon[]> {
  return request<HerokuAddon[]>("GET", `/apps/${appName}/addons`);
}

/**
 * Get config vars
 */
export async function getConfigVars(
  appName: string
): Promise<Record<string, string>> {
  return request<Record<string, string>>("GET", `/apps/${appName}/config-vars`);
}

/**
 * Set config vars
 */
export async function setConfigVars(
  appName: string,
  vars: Record<string, string | null>
): Promise<Record<string, string>> {
  return request<Record<string, string>>(
    "PATCH",
    `/apps/${appName}/config-vars`,
    vars
  );
}

/**
 * List dynos (running processes)
 */
export async function listDynos(appName: string): Promise<HerokuDyno[]> {
  return request<HerokuDyno[]>("GET", `/apps/${appName}/dynos`);
}