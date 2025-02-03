import { test, expect } from "@playwright/test";

test("enter creates linebreak", async ({ page }) => {
  await page.goto("/");
  const editor = await page.locator(
    ".editor-input div[contenteditable='true']",
  );
  await editor?.pressSequentially("Line 1");
  await editor?.press("Enter");
  await editor?.pressSequentially("Line 2");

  const paragraphs = await page.locator(".editor-paragraph");
  const count = await paragraphs.count();
  expect(count).toBe(1);
});

test("sequential enters creates paragraph break", async ({ page }) => {
  await page.goto("/");
  const editor = await page.locator(
    ".editor-input div[contenteditable='true']",
  );
  await editor?.pressSequentially("Paragraph 1");
  await editor?.press("Enter");
  await editor?.press("Enter");
  await editor?.pressSequentially("Paragraph 2");

  const paragraphs = await page.locator(".editor-paragraph");
  const count = await paragraphs.count();
  await expect(count).toBe(3);
});
