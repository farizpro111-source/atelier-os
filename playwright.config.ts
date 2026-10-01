import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://localhost:3102', viewport: { width: 390, height: 844 }, screenshot: 'only-on-failure' },
  webServer: { command: 'npm run start -- --port 3102', url: 'http://localhost:3102', reuseExistingServer: false },
});
