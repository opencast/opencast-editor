import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {

  reporter: [ ['html', { outputFolder: 'playwright-report' }]],
  testIgnore: '**/redux/**',

  use: {
    baseURL: 'http://localhost:3000/',
    headless: true,
  },

  webServer: {    
    command: 'npm run start',    
    port: 3000,    
    timeout: 120 * 1000,    
    reuseExistingServer: !process.env.CI,  
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  
  
};

export default config;
