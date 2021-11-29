import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await page.goto(baseURL);
});

test('Test: Navigation', async ({ page, baseURL }) => {  

    expect(page.url()).toBe(baseURL);
    await expect(page).toHaveTitle("Opencast Editor");

    // checks if Navbar on left has 4 elements
    const locator = page.locator('#root > div > div > nav > li');
    await expect(locator).toHaveCount(4);

    // Navigation to Metadata
    await page.click('li[role="menuitem"]:has-text("Metadata")');
  
    // Navigation to Tracks
    await page.click('li[role="menuitem"]:has-text("Tracks")');
  
    // Navigation to Finish
    await page.click('li[role="menuitem"]:has-text("Finish")');
  
    // Navigation to Cutting
    await page.click('li[role="menuitem"]:has-text("Cutting")');

});
