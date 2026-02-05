/**
 * Manage Heroku config vars (environment variables)
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { getConfigVars, setConfigVars } from "../lib/heroku-api.js";

export const configVarsTool: ToolDefinition = {
  name: "heroku_config_vars",
  description: "Get or set config vars (environment variables) for a Heroku app.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
      set: {
        type: "boolean",
        description: "Set to true to modify config vars (default: false, just lists)",
      },
      key: {
        type: "string",
        description: "Config var key (for getting a specific var or setting)",
      },
      value: {
        type: "string",
        description: "Config var value (required when set=true). Use null to unset.",
      },
    },
    required: ["appName"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      const shouldSet = args.set as boolean | undefined;
      const key = args.key as string | undefined;
      const value = args.value as string | undefined;
      
      // If set mode, modify config vars
      if (shouldSet) {
        if (!key) {
          return error("Key is required when setting config vars");
        }
        
        const vars: Record<string, string | null> = {
          [key]: value === undefined ? null : value,
        };
        
        const result = await setConfigVars(appName, vars);
        
        return json({
          app: appName,
          action: value === undefined ? "unset" : "set",
          key: key,
          value: value || "(unset)",
          config_vars: result,
        });
      }
      
      // Get mode
      const configVars = await getConfigVars(appName);
      
      // If key specified, return just that var
      if (key) {
        const varValue = configVars[key];
        return json({
          app: appName,
          key: key,
          value: varValue ?? null,
          exists: key in configVars,
        });
      }
      
      // Return all vars (mask sensitive values for display)
      const maskedVars: Record<string, string> = {};
      for (const [k, v] of Object.entries(configVars)) {
        // Mask values that look sensitive
        const isSensitive = /key|secret|password|token|api/i.test(k);
        maskedVars[k] = isSensitive ? `${v.substring(0, 4)}****` : v;
      }
      
      return json({
        app: appName,
        config_vars: maskedVars,
        count: Object.keys(configVars).length,
        note: "Sensitive values are partially masked. Use key parameter to get full value.",
      });
    } catch (err) {
      return error(`Failed to manage config vars: ${err instanceof Error ? err.message : err}`);
    }
  },
};