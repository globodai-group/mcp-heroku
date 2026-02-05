/**
 * Restart Heroku dynos
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { restartDynos, listDynos } from "../lib/heroku-api.js";

export const restartTool: ToolDefinition = {
  name: "heroku_restart",
  description: "Restart dynos for a Heroku app. Can restart all dynos or a specific one.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
      dyno: {
        type: "string",
        description: "Specific dyno to restart (e.g., web.1). Omit to restart all.",
      },
    },
    required: ["appName"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      const dyno = args.dyno as string | undefined;
      
      await restartDynos(appName, dyno);
      
      // Fetch updated dyno status
      const dynos = await listDynos(appName);
      
      return json({
        app: appName,
        restarted: dyno || "all",
        message: dyno 
          ? `Dyno ${dyno} restarted successfully`
          : "All dynos restarted successfully",
        current_dynos: dynos.map(d => ({
          name: d.name,
          state: d.state,
          type: d.type,
        })),
      });
    } catch (err) {
      return error(`Failed to restart: ${err instanceof Error ? err.message : err}`);
    }
  },
};