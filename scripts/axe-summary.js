// Turns axe-results/*.json (written by tests/accessibility.spec.js) into
// axe-report.md, also appended to the GitHub job summary when run in Actions.
const fs = require("node:fs");
const path = require("node:path");

const RESULTS_DIR = path.join(__dirname, "..", "axe-results");
const REPORT_FILE = path.join(__dirname, "..", "axe-report.md");
const IMPACT_ORDER = ["critical", "serious", "moderate", "minor"];

function escapeCell(value) {
	return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

const files = fs.existsSync(RESULTS_DIR)
	? fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json")).sort()
	: [];
const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), "utf8")));

const lines = ["## Accessibility (axe-core)", ""];

if (runs.length === 0) {
	lines.push("No axe results were produced. Check the test step log for errors.");
} else {
	const total = runs.reduce((n, r) => n + r.violations.length, 0);
	lines.push(
		total === 0
			? "✅ No WCAG 2.2 AA violations found."
			: `❌ ${total} violation${total === 1 ? "" : "s"} found.`,
		"",
		"| Scan | Viewport | Violations | Needs review | Passed rules |",
		"| --- | --- | ---: | ---: | ---: |",
		...runs.map(
			(r) => `| ${r.scan} | ${r.project} | ${r.violations.length} | ${r.incomplete} | ${r.passes} |`,
		),
	);

	for (const r of runs.filter((r) => r.violations.length > 0)) {
		const sorted = [...r.violations].sort(
			(a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact),
		);
		lines.push(
			"",
			`### ${r.scan} (${r.project})`,
			"",
			"| Impact | Rule | Description | Elements |",
			"| --- | --- | --- | --- |",
			...sorted.map((v) => {
				const targets = v.nodes.map((n) => `\`${escapeCell(n.target.join(" "))}\``);
				const shown = targets.slice(0, 5).join("<br>");
				const more = targets.length > 5 ? `<br>…and ${targets.length - 5} more` : "";
				return `| ${v.impact} | [${v.id}](${v.helpUrl}) | ${escapeCell(v.help)} | ${shown}${more} |`;
			}),
		);
	}
}

const markdown = lines.join("\n") + "\n";
fs.writeFileSync(REPORT_FILE, markdown);
if (process.env.GITHUB_STEP_SUMMARY) {
	fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
console.log(`Wrote ${path.relative(process.cwd(), REPORT_FILE)}`);
