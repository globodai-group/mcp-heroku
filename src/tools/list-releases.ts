/**
 * List Heroku app releases
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { listReleases } from "../lib/heroku-api.js";

export const listReleasesTool: ToolDefinition = {
  name: "heroku_list_releases",
  description: "List releases for a Heroku app. Shows deployment history.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
      limit: {
        type: "number",
        description: "Maximum number of releases to return (default: 10)",
      },
    },
    required: ["appName"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      const limit = (args.limit as number) || 10;
      
      const releases = await listReleases(appName, limit);
      
      return json(releases.map(r => ({
        version: r.version,
        description: r.description,
        status: r.status,
        user: r.user.email,
        current: r.current,
        created_at: r.created_at,
      })));
    } catch (err) {
      return error(`Failed to list releases: ${err instanceof Error ? err.message : err}`);
    }
  },
};