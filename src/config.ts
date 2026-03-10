export class Config {
  constructor(
    // Auth & Infrastructure
    public readonly browserstackUsername: string,
    public readonly browserstackAccessKey: string,
    
    // API Endpoints
    public readonly baseUrl: string,
    public readonly apiV1: string,
    public readonly authServiceUrl: string,

    // Flags
    public readonly DEV_MODE: boolean,
  ) {}

  // Helper to ensure we don't have trailing slashes
  public static normalizeUrl(url: string): string {
    return url.replace(/\/+$/, "");
  }
}

// 1. Define your base environment URLs
const BASE_URL = Config.normalizeUrl(process.env.BASE_URL || "https://api.staging.example.com");

const config = new Config(
  process.env.BROWSERSTACK_USERNAME!,
  process.env.BROWSERSTACK_ACCESS_KEY!,
  
  // API Mapping
  BASE_URL,
  `${BASE_URL}/api/v1`,
  process.env.AUTH_SERVICE_URL || "https://auth.example.com",

  process.env.DEV_MODE === "true",
);

// Optional: Simple validation check for required keys
if (!config.browserstackUsername || !config.browserstackAccessKey) {
  console.warn("⚠️ Warning: BrowserStack credentials are missing. Cloud tests will fail.");
}

export default config;
