/**
 * List Heroku add-ons
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { listAddons } from "../lib/heroku-api.js";

export const listAddonsTool: ToolDefinition = {
  name: "heroku_list_addons",
  description: "List all add-ons attached to a Heroku app (databases, caches, etc.)",
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
      
      const addons = await listAddons(appName);
      
      return json({
        app: appName,
        addons: addons.map(addon => ({
          name: addon.name,
          service: addon.addon_service.name,
          plan: addon.plan.name,
          state: addon.state,
          created_at: addon.created_at,
        })),
        count: addons.length,
      });
    } catch (err) {
      return error(`Failed to list add-ons: ${err instanceof Error ? err.message : err}`);
    }
  },
};