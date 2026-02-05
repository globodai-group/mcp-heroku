/**
 * List Heroku apps
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { listApps } from "../lib/heroku-api.js";

export const listAppsTool: ToolDefinition = {
  name: "heroku_list_apps",
  description: "List all Heroku apps. Optionally filter by team.",
  inputSchema: {
    type: "object",
    properties: {
      team: {
        type: "string",
        description: "Filter apps by team name (optional)",
      },
    },
    required: [],
  },
  handler: async (args) => {
    try {
      const team = args.team as string | undefined;
      const apps = await listApps(team);
      
      return json(apps.map(app => ({
        name: app.name,
        web_url: app.web_url,
        region: app.region.name,
        stack: app.stack.name,
        owner: app.owner.email,
        team: app.team?.name,
        maintenance: app.maintenance,
        created_at: app.created_at,
      })));
    } catch (err) {
      return error(`Failed to list apps: ${err instanceof Error ? err.message : err}`);
    }
  },
};