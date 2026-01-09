import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const srcDir = path.join(__dirname, 'src');

// Function to recursively find all TS/TSX files
function findTypeScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findTypeScriptFiles(filePath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            // Skip .d.ts files
            if (!file.endsWith('.d.ts')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

// Function to remove TypeScript syntax
function convertToJavaScript(content, filename) {
    let jsContent = content;

    // Remove type imports
    jsContent = jsContent.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\s*/g, '');
    jsContent = jsContent.replace(/import\s+\{[^}]*\btype\s+[^}]*\}\s+from/g, (match) => {
        return match.replace(/,?\s*type\s+\w+/g, '');
    });

    // Remove interface declarations
    jsContent = jsContent.replace(/export\s+interface\s+\w+\s*\{[^}]*\}(\s*;)?/gs, '');
    jsContent = jsContent.replace(/interface\s+\w+\s*\{[^}]*\}(\s*;)?/gs, '');

    // Remove type declarations
    jsContent = jsContent.replace(/export\s+type\s+\w+\s*=\s*[^;]+;/g, '');
    jsContent = jsContent.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

    // Remove function return types
    jsContent = jsContent.replace(/(\w+\s*\([^)]*\))\s*:\s*[^{=>;]+(\s*=>)/g, '$1$2');
    jsContent = jsContent.replace(/(\w+\s*\([^)]*\))\s*:\s*[^{]+(\s*\{)/g, '$1$2');

    // Remove async function return types
    jsContent = jsContent.replace(/(async\s+\w+\s*\([^)]*\))\s*:\s*Promise<[^>]+>(\s*\{)/g, '$1$2');
    jsContent = jsContent.replace(/(async\s+\([^)]*\))\s*:\s*Promise<[^>]+>(\s*=>)/g, '$1$2');

    // Remove variable type annotations
    jsContent = jsContent.replace(/const\s+(\w+)\s*:\s*[^=]+=/g, 'const $1 =');
    jsContent = jsContent.replace(/let\s+(\w+)\s*:\s*[^=]+=/g, 'let $1 =');
    jsContent = jsContent.replace(/var\s+(\w+)\s*:\s*[^=]+=/g, 'var $1 =');

    // Remove useState type parameters
    jsContent = jsContent.replace(/useState<[^>]+>/g, 'useState');

    // Remove useRef type parameters
    jsContent = jsContent.replace(/useRef<[^>]+>/g, 'useRef');

    // Remove React.FC and similar
    jsContent = jsContent.replace(/:\s*React\.FC<[^>]*>/g, '');
    jsContent = jsContent.replace(/:\s*FC<[^>]*>/g, '');

    // Remove function parameter types
    jsContent = jsContent.replace(/\(([^:)]+):\s*[^,)]+/g, '($1');
    jsContent = jsContent.replace(/,\s*([^:)]+):\s*[^,)]+/g, ', $1');

    // Remove generic types from function calls
    jsContent = jsContent.replace(/\.get<[^>]+>/g, '.get');
    jsContent = jsContent.replace(/\.post<[^>]+>/g, '.post');
    jsContent = jsContent.replace(/\.put<[^>]+>/g, '.put');
    jsContent = jsContent.replace(/\.delete<[^>]+>/g, '.delete');

    // Remove Promise generic types
    jsContent = jsContent.replace(/Promise<[^>]+>/g, 'Promise');

    // Remove as type assertions
    jsContent = jsContent.replace(/\s+as\s+\w+/g, '');
    jsContent = jsContent.replace(/\s+as\s+any/g, '');

    // Clean up multiple blank lines
    jsContent = jsContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    return jsContent;
}

// Function to update imports in a file
function updateImports(content) {
    // Update .ts imports to .js
    content = content.replace(/from\s+(['"])(.+?)\.ts\1/g, 'from $1$2.js$1');
    // Update .tsx imports to .jsx
    content = content.replace(/from\s+(['"])(.+?)\.tsx\1/g, 'from $1$2.jsx$1');

    return content;
}

// Main conversion function
function convertProject() {
    console.log('🔍 Finding TypeScript files...');
    const tsFiles = findTypeScriptFiles(srcDir);
    console.log(`📝 Found ${tsFiles.length} TypeScript files to convert\n`);

    const conversions = [];

    // First pass: Convert content
    tsFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        const convertedContent = convertToJavaScript(content, filePath);
        conversions.push({ filePath, convertedContent });
    });

    // Second pass: Update imports and rename files
    conversions.forEach(({ filePath, convertedContent }) => {
        const updatedContent = updateImports(convertedContent);

        // Determine new file path
        const newFilePath = filePath.replace(/\.tsx?$/, filePath.endsWith('.tsx') ? '.jsx' : '.js');

        // Write converted content to new file
        fs.writeFileSync(newFilePath, updatedContent, 'utf8');
        console.log(`✅ Converted: ${path.relative(srcDir, filePath)} → ${path.basename(newFilePath)}`);

        // Delete old TypeScript file if it's different from new file
        if (filePath !== newFilePath) {
            fs.unlinkSync(filePath);
        }
    });

    console.log(`\n✨ Successfully converted ${conversions.length} files!`);
    console.log('\n⚠️  Next steps:');
    console.log('1. Update vite.config to remove TypeScript plugin');
    console.log('2. Update package.json to remove TypeScript dependencies');
    console.log('3. Delete or rename tsconfig.json');
    console.log('4. Test your application');
}

// Run the conversion
try {
    convertProject();
} catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
}
