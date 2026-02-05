/**
 * Scale Heroku dynos
 */

import { json, error, type ToolDefinition } from "../lib/mcp-core.js";
import { scaleDyno, getFormations } from "../lib/heroku-api.js";

export const scaleTool: ToolDefinition = {
  name: "heroku_scale",
  description: "Scale dynos for a Heroku app. Change the number of running dynos.",
  inputSchema: {
    type: "object",
    properties: {
      appName: {
        type: "string",
        description: "Name of the Heroku app",
      },
      dyno: {
        type: "string",
        description: "Dyno type to scale (e.g., web, worker)",
      },
      quantity: {
        type: "number",
        description: "Number of dynos to run",
      },
      size: {
        type: "string",
        description: "Dyno size (eco, basic, standard-1x, standard-2x, etc.)",
      },
    },
    required: ["appName", "dyno", "quantity"],
  },
  handler: async (args) => {
    try {
      const appName = args.appName as string;
      const dyno = args.dyno as string;
      const quantity = args.quantity as number;
      const size = args.size as string | undefined;
      
      const result = await scaleDyno(appName, dyno, quantity, size);
      
      // Get full formation after scaling
      const formation = await getFormations(appName);
      
      return json({
        app: appName,
        scaled: {
          type: result.type,
          quantity: result.quantity,
          size: result.size,
        },
        message: `Scaled ${dyno} to ${quantity} dyno(s)`,
        formation: formation.map(f => ({
          type: f.type,
          quantity: f.quantity,
          size: f.size,
        })),
      });
    } catch (err) {
      return error(`Failed to scale: ${err instanceof Error ? err.message : err}`);
    }
  },
};