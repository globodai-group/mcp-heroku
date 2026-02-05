/**
 * Get Heroku app details
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { getApp, listDynos, getFormations } from "../lib/heroku-api.js";

export const getAppTool: ToolDefinition = {
  name: "heroku_get_app",
  description: "Get detailed information about a Heroku app including dynos and formation.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
    },
    required: ["appName"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      
      // Fetch app info, dynos, and formation in parallel
      const [app, dynos, formation] = await Promise.all([
        getApp(appName),
        listDynos(appName),
        getFormations(appName),
      ]);
      
      return json({
        name: app.name,
        id: app.id,
        web_url: app.web_url,
        region: app.region.name,
        stack: app.stack.name,
        owner: app.owner.email,
        team: app.team?.name,
        maintenance: app.maintenance,
        created_at: app.created_at,
        updated_at: app.updated_at,
        dynos: dynos.map(d => ({
          name: d.name,
          type: d.type,
          state: d.state,
          size: d.size,
        })),
        formation: formation.map(f => ({
          type: f.type,
          quantity: f.quantity,
          size: f.size,
          command: f.command,
        })),
      });
    } catch (err) {
      return error(`Failed to get app: ${err instanceof Error ? err.message : err}`);
    }
  },
};