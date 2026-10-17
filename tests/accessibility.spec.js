const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

const RESULTS_DIR = path.join(__dirname, "..", "axe-results");
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Each scan is a page state: the page itself, plus each modal opened (axe
// skips hidden content, so modals have to be shown to be checked).
const SCANS = [
	{ name: "home", path: "/" },
	{ name: "contact-form-modal", path: "/", modal: "contact-form-modal" },
	{ name: "institutions-list-modal", path: "/", modal: "institutions-list-modal" },
];

for (const scan of SCANS) {
	test(`${scan.name} has no axe violations`, async ({ page }, testInfo) => {
		await page.goto(scan.path);

		// AOS keeps [data-aos] content transparent until scrolled into view,
		// which would hide it from axe (or skew color-contrast); show it all.
		await page.addStyleTag({
			content: "[data-aos] { opacity: 1 !important; transform: none !important; }",
		});

		if (scan.modal) {
			// Same as openModal() in src/js/showcase.js; some triggers sit in
			// menus that are collapsed at mobile widths, so don't click them.
			await page.evaluate((id) => document.getElementById(id).classList.add("is-active"), scan.modal);
			await expect(page.locator(`#${scan.modal}`)).toHaveClass(/is-active/);
		}

		const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
		if (scan.modal) builder.include(`#${scan.modal}`);
		const results = await builder.analyze();

		// Raw results, turned into axe-report.md by scripts/axe-summary.js.
		fs.mkdirSync(RESULTS_DIR, { recursive: true });
		fs.writeFileSync(
			path.join(RESULTS_DIR, `${scan.name}--${testInfo.project.name}.json`),
			JSON.stringify(
				{
					scan: scan.name,
					project: testInfo.project.name,
					url: results.url,
					violations: results.violations,
					incomplete: results.incomplete.length,
					passes: results.passes.length,
				},
				null,
				2,
			),
		);

		const summary = results.violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			help: v.help,
			targets: v.nodes.map((n) => n.target.join(" ")),
		}));
		expect(summary, "axe-core WCAG violations").toEqual([]);
	});
}
