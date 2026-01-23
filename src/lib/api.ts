import config from "../config.js";

const getAuthHeader = () => ({
  Authorization: `Basic ${Buffer.from(
    `${config.browserstackUsername}:${config.browserstackAccessKey}`,
  ).toString("base64")}`,
});

/**
 * Common fetch wrapper for O11Y APIs
 */
async function fetchO11Y(endpoint: string) {
  const url = `https://api-observability.browserstack.com/ext/v1${endpoint}`;
  const response = await fetch(url, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `O11Y API Error (${response.status} ${response.statusText}): ${errorText}`
    );
  }
  return response.json();
}

export async function getLatestO11YBuildInfo(buildName: string, projectName: string) {
  return fetchO11Y(`/builds/latest?build_name=${encodeURIComponent(buildName)}&project_name=${encodeURIComponent(projectName)}`);
}

export async function getBuildSummary(buildId: string) {
  return fetchO11Y(`/builds/${buildId}/summary`);
}

export async function getBuildTests(buildId: string, status?: string) {
  const query = status ? `?status=${status}` : "";
  return fetchO11Y(`/builds/${buildId}/tests${query}`);
}

export async function listProjectBuilds(projectName: string, limit: number = 10) {
  return fetchO11Y(`/projects/${encodeURIComponent(projectName)}/builds?limit=${limit}`);
}

// MCP Tool Wrapper Function
export default function addO11YTools(server: any) {
  server.tool(
    "get_latest_o11y_build",
    "Get the latest observability build info for a project and build name",
    { buildName: { type: "string" }, projectName: { type: "string" } },
    async ({ buildName, projectName }: any) => {
      const data = await getLatestO11YBuildInfo(buildName, projectName);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_o11y_build_summary",
    "Get a summary of a specific observability build (pass/fail counts, duration)",
    { buildId: { type: "string" } },
    async ({ buildId }: any) => {
      const data = await getBuildSummary(buildId);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.tool(
    "get_o11y_build_tests",
    "List all tests within a specific observability build, optionally filtered by status",
    { buildId: { type: "string" }, status: { type: "string", enum: ["passed", "failed", "skipped"] } },
    async ({ buildId, status }: any) => {
      const data = await getBuildTests(buildId, status);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
