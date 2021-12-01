import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await page.goto(baseURL);
    expect(page.url()).toBe(baseURL);
});

test.describe('Test Metadata-Page', () => {

    // checks if fields contains their dummy-data
    test('Check: Inputfields', async ({ page }) => {
        await page.click('li[role="menuitem"]:has-text("Metadata")');

        for(let i = 0; i < input.length; i++){
            const locator = page.locator('input[name="catalog0.'+ input[i] +'"]');
            await expect(locator).toHaveValue(iValue[i]);
            await page.click('input[name="catalog0.'+ input[i] +'"]');
            await page.fill('input[name="catalog0.'+ input[i] +'"]', iFill[i]);
        }
        for(let i = 0; i < dropdown.length; i++){
            const locator = page.locator('input[name="catalog0.'+ dropdown[i] +'"]');
            await expect(locator).toHaveValue(dValue[i]);       
        }
    });

    test('Check other fields', async ({ page }) => {
        await page.click('li[role="menuitem"]:has-text("Metadata")');

        // different syntax and or not editable
        const description = page.locator('textarea[name="catalog0.description"]');
        await expect(description).toHaveValue('');
        await page.click('textarea[name="catalog0.description"]');
        await page.fill('textarea[name="catalog0.description"]', 'Test-Description');

        const startDate = page.locator('input[name="startDate"]');
        await expect(startDate).toHaveValue(/[0-9]/);

        const created = page.locator('input[name="created"]');
        await expect(created).toHaveValue(/[0-9]/);

        const publisher = page.locator('input[name="catalog0.publisher"]');
        await expect(publisher).toHaveValue('');

        const identifier = page.locator('input[name="catalog0.identifier"]');
        await expect(identifier).toHaveValue('ID-dual-stream-demo');

    });

    test('Check: Change Dropdown Value', async ({ page }) => {
        await page.click('li[role="menuitem"]:has-text("Metadata")');
        // Language
        await page.click('text=LanguageNo value >> :nth-match(svg, 2)');
        await page.click('#react-select-3-option-22');

        // License
        await page.click('text=LicenseCC-BY-SA >> :nth-match(svg, 2)');
        await page.click('#react-select-5-option-8');

        // Series / isPartOf
        await page.click('text=SeriesNo value >> :nth-match(svg, 2)');
        await page.click('#react-select-7-option-4');

        // Creator
        await page.click('[id="catalog0.creator"] div div >> :nth-match(div, 4)');
        await page.click('#react-select-9-option-15');
        await page.click('[aria-label="Remove Lars Kiesow"]');

        // Contributor
        await page.click('text=Contributor(s)Select... >> svg');
        await page.click('#react-select-11-option-15');

        // startDate
        await page.click('button');
        await page.click(':nth-match(button[role="tab"], 2)');  // Time
        await page.click('button[role="tab"]'); // Date
        await page.click('button:has-text("OK")');

    });

});

var input = ['title','subject', 'rightsHolder', 'duration', 'location', 'source'];
var iValue = ['Dual-Stream Demo', '', '', '00:00:00', '', ''];
var iFill = ['Test-Title', 'Test-Subject', 'Test-Rights', '00:02:45', 'Test-Location', 'Test-Source'];

var dropdown = ['language','license','isPartOf','creator','contributor'];
var dValue = ['','{\"label\":\"EVENTS.LICENSE.CCBYSA\", \"order\":3, \"selectable\": true}','','Lars Kiesow', ''];

