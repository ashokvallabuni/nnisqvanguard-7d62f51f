# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ivvab-labs.spec.ts >> IVVAB LABS Core Verification >> Virtual Filesystem & Terminal Execution
- Location: tests\ivvab-labs.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('EXPLORE IVVAB LABS').or(getByText('IVVAB LABS').first())
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('EXPLORE IVVAB LABS').or(getByText('IVVAB LABS').first()) with timeout 5000ms
  - waiting for getByText('EXPLORE IVVAB LABS').or(getByText('IVVAB LABS').first())

```

```yaml
- text: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\\Users\\ashok\\nnisqvanguard-7d62f51f-1\\dist\\server\\server.js' imported from C:\\Users\\ashok\\nnisqvanguard-7d62f51f-1\\node_modules\\@tanstack\\start-plugin-core\\dist\\esm\\vite\\preview-server-plugin\\plugin.js at finalizeResolution (node:internal/modules/esm/resolve:272:11) at moduleResolve (node:internal/modules/esm/resolve:879:10) at defaultResolve (node:internal/modules/esm/resolve:1006:11) at #cachedDefaultResolve (node:internal/modules/esm/loader:705:20) at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:725:38) at nextStep (node:internal/modules/customization_hooks:189:26) at Ie (file:///C:/Users/ashok/nnisqvanguard-7d62f51f-1/node_modules/@tailwindcss/node/dist/index.mjs:1:539) at nextStep (node:internal/modules/customization_hooks:189:26) at resolveWithHooks (node:internal/modules/customization_hooks:417:10) at ModuleLoader.resolveSync (node:internal/modules/esm/loader:751:16)"
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
> 9  |     await expect(page.getByText('EXPLORE IVVAB LABS').or(page.getByText('IVVAB LABS').first())).toBeVisible();
     |                                                                                                 ^ Error: expect(locator).toBeVisible() failed
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
  43 |     await page.reload();
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