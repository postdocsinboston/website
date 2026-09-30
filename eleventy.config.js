const yaml = require("js-yaml");

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

	// Renders the partner list as one flowing sentence, e.g. "A, B, and C.",
	// with each name linked to its website (short_name/abbr as the hover
	// tooltip, when it differs from long_name).
	eleventyConfig.addFilter("proseList", function (partners) {
		const names = (partners || []).map((partner) => {
			const label = escapeHtml(partner.long_name);
			const shortName =
				(partner.short_name && partner.short_name !== partner.long_name && partner.short_name) ||
				(partner.abbr && partner.abbr !== partner.long_name && partner.abbr) ||
				null;
			const titleAttr = shortName ? ` title="${escapeHtml(shortName)}"` : "";
			return partner.website
				? `<a href="${escapeHtml(partner.website)}"${titleAttr} target="_blank" rel="noopener noreferrer">${label}</a>`
				: label;
		});

		if (names.length === 0) return "";
		if (names.length === 1) return `${names[0]}.`;
		if (names.length === 2) return `${names[0]} and ${names[1]}.`;
		return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}.`;
	});

	return {
		dir: {
			input: "src",
			output: "_site",
		},
	};
};
