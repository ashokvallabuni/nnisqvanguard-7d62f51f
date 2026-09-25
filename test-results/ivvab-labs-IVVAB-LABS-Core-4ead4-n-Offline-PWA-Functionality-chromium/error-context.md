# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ivvab-labs.spec.ts >> IVVAB LABS Core Verification >> Offline PWA Functionality
- Location: tests\ivvab-labs.spec.ts:34:3

# Error details

```
Error: page.reload: net::ERR_INTERNET_DISCONNECTED
Call log:
  - waiting for navigation until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('IVVAB LABS Core Verification', () => {
  4  |   test('Virtual Filesystem & Terminal Execution', async ({ page }) => {
  5  |     // Go to the labs catalog
  6  |     await page.goto('/labs');
  7  |     
  8  |     // Expect to see IVVAB LABS branding
  9  |     await expect(page.getByText('EXPLORE IVVAB LABS').or(page.getByText('IVVAB LABS').first())).toBeVisible();
  10 | 
  11 |     // Start the Linux Lab
  12 |     const startButton = page.getByRole('link', { name: /Linux SSH Brute Force/i }).or(
  13 |       page.locator('a[href="/labs/linux-ssh-bruteforce"]')
  14 |     );
  15 |     if (await startButton.count() > 0) {
  16 |       await startButton.first().click();
  17 |     } else {
  18 |       await page.goto('/labs/linux-ssh-bruteforce');
  19 |     }
  20 | 
  21 |     // Check if terminal is loaded
  22 |     const terminalInput = page.locator('.xterm-helper-textarea');
  23 |     await expect(terminalInput).toBeAttached({ timeout: 10000 });
  24 |     
  25 |     // Enter 'ls' command
  26 |     await terminalInput.fill('ls\r');
  27 |     
  28 |     // Check if output contains some files (we expect something in standard output)
  29 |     await page.waitForTimeout(1000);
  30 |     const terminalContents = await page.locator('.xterm-rows').innerText();
  31 |     expect(terminalContents.length).toBeGreaterThan(0);
  32 |   });
  33 | 
  34 |   test('Offline PWA Functionality', async ({ page, context }) => {
  35 |     // Ensure the service worker is installed by visiting the app first
  36 |     await page.goto('/labs');
  37 |     await page.waitForTimeout(2000); // Wait for SW to install
  38 |     
  39 |     // Simulate Offline mode
  40 |     await context.setOffline(true);
  41 |     
  42 |     // Reload the page
> 43 |     await page.reload();
     |                ^ Error: page.reload: net::ERR_INTERNET_DISCONNECTED
  44 |     
  45 |     // It should still load
  46 |     await expect(page.getByText('IVVAB LABS').first()).toBeVisible();
  47 |     
  48 |     // Navigate offline
  49 |     await page.goto('/labs/linux-ssh-bruteforce');
  50 |     
  51 |     // Terminal should still be there
  52 |     const terminalInput = page.locator('.xterm-helper-textarea');
  53 |     await expect(terminalInput).toBeAttached({ timeout: 10000 });
  54 |   });
  55 | });
  56 | 
```