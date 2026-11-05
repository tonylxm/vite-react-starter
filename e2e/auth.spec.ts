import { expect, test } from "@playwright/test";

test("private pages send signed-out visitors to sign in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
