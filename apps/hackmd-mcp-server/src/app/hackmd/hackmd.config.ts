import { registerAs } from "@nestjs/config";

export default registerAs("hackMD", () => ({
  apiUrl: process.env.HACKMD_API_URL || 'https://api.hackmd.io',
  apiToken: process.env.HACKMD_API_TOKEN || '',
}));
