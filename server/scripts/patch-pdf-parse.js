// scripts/patch-pdf-parse.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfParsePath = path.resolve(__dirname, '../node_modules/pdf-parse/index.js');

try {
  let content = fs.readFileSync(pdfParsePath, 'utf8');

  // Match any debug block starting with isDebugMode and ending at its closing brace
  const patchedContent = content.replace(
    /if\s*\(\s*isDebugMode\s*\)[\s\S]*?\n}\s*\n?/gm,
    '// DEBUG BLOCK REMOVED FOR DEPLOYMENT\n'
  );

  fs.writeFileSync(pdfParsePath, patchedContent, 'utf8');
  console.log('✅ Patched pdf-parse/index.js successfully');
} catch (error) {
  console.error('❌ Failed to patch pdf-parse/index.js:', error);
}
