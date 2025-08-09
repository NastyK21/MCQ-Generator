// scripts/patch-pdf-parse.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname workaround in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to pdf-parse's main file
const pdfParsePath = path.resolve(__dirname, '../node_modules/pdf-parse/index.js');

try {
  let content = fs.readFileSync(pdfParsePath, 'utf8');

  // Replace any test/debug block trying to read a file
  const patchedContent = content.replace(
    /if\s*\(isDebugMode\)\s*{[\s\S]*?}/,
    '// DEBUG BLOCK REMOVED FOR DEPLOYMENT'
  );

  fs.writeFileSync(pdfParsePath, patchedContent, 'utf8');
  console.log('✅ Patched pdf-parse/index.js successfully');
} catch (error) {
  console.error('❌ Failed to patch pdf-parse/index.js:', error);
}
