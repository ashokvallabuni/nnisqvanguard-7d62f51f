import { test, expect } from '@playwright/test';

test.describe('IVVAB LABS Core Verification', () => {
  test('Virtual Filesystem & Terminal Execution', async ({ page }) => {
    // Go to the labs catalog
    await page.goto('/labs');
    
    // Expect to see IVVAB LABS branding
    await expect(page.getByText('EXPLORE IVVAB LABS').or(page.getByText('IVVAB LABS').first())).toBeVisible();

    // Start the Linux Lab
    const startButton = page.getByRole('link', { name: /Linux SSH Brute Force/i }).or(
      page.locator('a[href="/labs/linux-ssh-bruteforce"]')
    );
    if (await startButton.count() > 0) {
      await startButton.first().click();
    } else {
      await page.goto('/labs/linux-ssh-bruteforce');
    }

    // Check if terminal is loaded
    const terminalInput = page.locator('.xterm-helper-textarea');
    await expect(terminalInput).toBeAttached({ timeout: 10000 });
    
    // Enter 'ls' command
    await terminalInput.fill('ls\r');
    
    // Check if output contains some files (we expect something in standard output)
    await page.waitForTimeout(1000);
    const terminalContents = await page.locator('.xterm-rows').innerText();
    expect(terminalContents.length).toBeGreaterThan(0);
  });

  test('Offline PWA Functionality', async ({ page, context }) => {
    // Ensure the service worker is installed by visiting the app first
    await page.goto('/labs');
    await page.waitForTimeout(2000); // Wait for SW to install
    
    // Simulate Offline mode
    await context.setOffline(true);
    
    // Reload the page
    await page.reload();
    
    // It should still load
    await expect(page.getByText('IVVAB LABS').first()).toBeVisible();
    
    // Navigate offline
    await page.goto('/labs/linux-ssh-bruteforce');
    
    // Terminal should still be there
    const terminalInput = page.locator('.xterm-helper-textarea');
    await expect(terminalInput).toBeAttached({ timeout: 10000 });
  });
});
