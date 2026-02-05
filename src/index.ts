#!/usr/bin/env node

/**
 * Heroku CLI MCP Server
 * 
 * Manage Heroku apps via the REST API.
 * 
 * Required Environment Variable:
 * - HEROKU_API_KEY: Your Heroku API key
 * 
 * Tools:
 * - heroku_list_apps: List all apps
 * - heroku_get_app: Get app details
 * - heroku_list_releases: List deployment history
 * - heroku_get_logs: View application logs
 * - heroku_restart: Restart dynos
 * - heroku_scale: Scale dynos
 * - heroku_list_addons: List add-ons
 * - heroku_config_vars: Manage environment variables
 */

import { createMCPServer, startMCPServer, type ToolDefinition } from "./lib/mcp-core.js";
import { listAppsTool } from "./tools/list-apps.js";
import { getAppTool } from "./tools/get-app.js";
import { listReleasesTool } from "./tools/list-releases.js";
import { getLogsTool } from "./tools/get-logs.js";
import { restartTool } from "./tools/restart.js";
import { scaleTool } from "./tools/scale.js";
import { listAddonsTool } from "./tools/list-addons.js";
import { configVarsTool } from "./tools/config-vars.js";

const tools: ToolDefinition[] = [
  listAppsTool,
  getAppTool,
  listReleasesTool,
  getLogsTool,
  restartTool,
  scaleTool,
  listAddonsTool,
  configVarsTool,
];

async function main() {
  // Validate that HEROKU_API_KEY is set
  if (!process.env.HEROKU_API_KEY) {
    console.error("Error: HEROKU_API_KEY environment variable is required");
    console.error("Set it to your Heroku API key (available at https://dashboard.heroku.com/account)");
    process.exit(1);
  }

  const server = createMCPServer(
    {
      name: "mcp-heroku",
      version: "1.0.0",
      description: "Heroku management via REST API",
    },
    tools
  );

  await startMCPServer(server);
}

main().catch(console.error);