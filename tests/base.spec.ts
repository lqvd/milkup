import { test, expect } from "@playwright/test";

test("editor has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
});
