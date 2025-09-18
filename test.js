const fs = require("fs");
const path = require("path");

// Root directory to start scanning
const rootDir = path.resolve(__dirname, "server");

// Output Markdown file
const outputFile = path.join(rootDir, "codebase.md");

// Allowed extensions
const extensions = [".ts", ".tsx", ".html", ".css"];

// Recursive function to get all files with allowed extensions
function getFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	list.forEach((file) => {
		const filePath = path.join(dir, file.name);
		if (file.isDirectory()) {
			results = results.concat(getFiles(filePath));
		} else if (extensions.includes(path.extname(file.name))) {
			results.push(filePath);
		}
	});
	return results;
}

// Function to get code block language
function getLanguage(filePath) {
	const ext = path.extname(filePath).slice(1); // remove dot
	return ext || ""; // return extension as language
}

// Main function to write codebase.md
function writeCodebase() {
	const files = getFiles(rootDir);
	let mdContent = "";

	files.forEach((file) => {
		const relativePath = path.relative(rootDir, file);
		const code = fs.readFileSync(file, "utf-8");

		mdContent += `## ${relativePath}\n\n`;
		mdContent += `\`\`\`${getLanguage(file)}\n`;
		mdContent += code + "\n";
		mdContent += "```\n\n";
	});

	fs.writeFileSync(outputFile, mdContent, "utf-8");
	console.log(`All .ts, .tsx, .html, and .css files written to ${outputFile}`);
}

writeCodebase();
