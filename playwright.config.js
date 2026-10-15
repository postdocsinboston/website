const { defineConfig, devices } = require("@playwright/test");

const PORT = 8080;

module.exports = defineConfig({
	testDir: "tests",
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
	},
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	// Build the site (Sass + 11ty) and serve dist/ for the tests.
	webServer: {
		command: `npm run sass:build && npx eleventy --serve --port=${PORT}`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
