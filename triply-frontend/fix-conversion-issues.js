import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function findJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJSFiles(filePath, fileList);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function fixCommonIssues(content) {
    let fixed = content;

    // Fix incomplete object literals: { responseType) -> { responseType: 'blob' }
    fixed = fixed.replace(/\{\s*responseType\s*\)/g, "{ responseType: 'blob' }");

    // Fix incomplete object literals: { params) -> { params: { status } }
    fixed = fixed.replace(/params\s*\)/g, "params: { status } }");

    // Fix broken function parameter lists like "hover)" -> "hover:bg-red-50"
    fixed = fixed.replace(/hover\s*\)/g, "hover:bg-red-50\"");

    // Fix lines that end with incomplete ternary: text-green-700' ) -> text-green-700' : 'bg-red-100 text-red-700'}
    // This one is tricky, skip for now

    // Fix incomplete multiline expressions
    fixed = fixed.replace(/sm\s*\)/g, "sm:flex-row sm:items-center sm:justify-between\">");
    fixed = fixed.replace(/\),\s*async/g, "},\n\n    async");

    return fixed;
}

console.log('🔧 Fixing common conversion issues...\n');

const jsFiles = findJSFiles(srcDir);
let fixedCount = 0;

jsFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCommonIssues(content);

    if (content !== fixed) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
        fixedCount++;
    }
});

console.log(`\n✨ Fixed ${fixedCount} files with common issues!`);
