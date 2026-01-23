#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
import "dotenv/config";
import logger from "./logger.js";

// Existing Tool Imports
import addSDKTools from "./tools/bstack-sdk.js";
import addAppLiveTools from "./tools/applive.js";
import addBrowserLiveTools from "./tools/live.js";
import addAccessibilityTools from "./tools/accessibility.js";
import addTestManagementTools from "./tools/testmanagement.js";
import addAppAutomationTools from "./tools/appautomate.js";
import addFailureLogsTools from "./tools/getFailureLogs.js";
import addAutomateTools from "./tools/automate.js";
import addSelfHealTools from "./tools/selfheal.js";
import { setupOnInitialized } from "./oninitialized.js";

// 1. New Tool Import
import addStatusTools from "./tools/status.js";

function registerTools(server: McpServer) {
  addSDKTools(server);
  addAppLiveTools(server);
  addBrowserLiveTools(server);
  addAccessibilityTools(server);
  addTestManagementTools(server);
  addAppAutomationTools(server);
  addFailureLogsTools(server);
  addAutomateTools(server);
  addSelfHealTools(server);
  
  // 2. Registering the new Status tool module
  addStatusTools(server);

  // 3. Adding an API/Tool directly in the main file (Example: Quick Echo)
  server.tool(
    "echo-test",
    "A simple API to test server responsiveness",
    { message: { type: "string", description: "The message to echo" } },
    async ({ message }) => ({
      content: [{ type: "text", text: `Server received: ${message}` }]
    })
  );
}

// Create an MCP server
const server: McpServer = new McpServer({
  name: "BrowserStack MCP Server",
  version: packageJson.version,
});

setupOnInitialized(server);
registerTools(server);

async function main() {
  logger.info(
    "Launching BrowserStack MCP server, version %s",
    packageJson.version,
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  logger.error("Server crashed: %O", err);
  process.exit(1);
});

process.on("exit", () => {
  logger.flush();
});
