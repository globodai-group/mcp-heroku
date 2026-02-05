/**
 * Get Heroku app logs
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { getLogSession, fetchLogs } from "../lib/heroku-api.js";

export const getLogsTool: ToolDefinition = {
  name: "heroku_get_logs",
  description: "Get recent logs from a Heroku app. Can filter by dyno or source.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
      lines: {
        type: "number",
        description: "Number of log lines to retrieve (default: 100)",
      },
      dyno: {
        type: "string",
        description: "Filter by dyno name (e.g., web.1, worker.1)",
      },
      source: {
        type: "string",
        description: "Filter by source (app or heroku)",
        enum: ["app", "heroku"],
      },
    },
    required: ["appName"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      const lines = (args.lines as number) || 100;
      const dyno = args.dyno as string | undefined;
      const source = args.source as string | undefined;
      
      // Create log session
      const session = await getLogSession(appName, { lines, dyno, source });
      
      // Fetch logs from logplex URL
      const logs = await fetchLogs(session.logplex_url);
      
      return json({
        app: appName,
        lines_requested: lines,
        filters: {
          dyno: dyno || "all",
          source: source || "all",
        },
        logs: logs,
      });
    } catch (err) {
      return error(`Failed to get logs: ${err instanceof Error ? err.message : err}`);
    }
  },
};