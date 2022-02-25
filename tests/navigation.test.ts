import { test, expect } from '@playwright/test';

test('Test: Navigation', async ({ page, baseURL }) => {

    await page.goto(baseURL);
    expect(page.url()).toBe(baseURL);
    await expect(page).toHaveTitle("Opencast Editor");

    // checks if Navbar on left has 4 elements
    const length = await page.locator('#root > div > div > nav > li').count();
    expect(length >= 2).toBeTruthy();

    // Navigation to Finish
    await page.click('li[role="menuitem"]:has-text("Finish")');

    // Navigation to Cutting
    await page.click('li[role="menuitem"]:has-text("Cutting")');
});
