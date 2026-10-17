const yaml = require("js-yaml");
const markdownIt = require("markdown-it");
const md = new markdownIt();

function escapeHtml(value) {
	return String(value || "").replace(/[&<>"']/g, (c) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	}[c]));
}

module.exports = function (eleventyConfig) {
	// _data/*.yaml -> global data (team, partners), keyed by filename.
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
	eleventyConfig.addDataExtension("md", (contents) => md.render(contents));

	// eleventyConfig.setInputDirectory("src");
	// eleventyConfig.setOutputDirectory("dist");
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/js");
	eleventyConfig.addPassthroughCopy("src/images");

	// Default avatar when a team member has no photo: a DiceBear "landscape"
	// avatar, seeded from name + ORCID so it's stable across rebuilds but
	// changes if either one does.
	eleventyConfig.addFilter("avatarUrl", function (member) {
		if (member.avatar) return member.avatar;
		const seed = member.orcid ? `${member.first_name}-${member.orcid}` : member.first_name;
		return `https://api.dicebear.com/10.x/landscape/svg?seed=${encodeURIComponent(seed)}`;
	});

	return {
		dir: {
			input: "src",
			output: "dist",
		},
		markdownTemplateEngine: "false",
	};
};
