import { expect, test } from '@playwright/test';

test('home page renders hero and primary navigation', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1, name: /LemonTV/ })).toBeVisible();

	const navigation = page.getByRole('navigation').first();

	await expect(navigation.locator('a[href="/news"]')).toBeVisible();
	await expect(navigation.locator('a[href="/events"]')).toBeVisible();
	await expect(navigation.locator('a[href="/players"]')).toBeVisible();

	await expect(page.getByRole('main').last()).toContainText(/events/i);
});
