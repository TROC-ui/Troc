#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the HTML reference file
const htmlPath = path.join(__dirname, '../troc-opticiens-homepage.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extract the base64 logo from the <img> tag
// Looking for: <img ... src="data:image/png;base64,..." ...>
const logoMatch = htmlContent.match(/src="(data:image\/png;base64,[^"]+)"/);

if (!logoMatch || !logoMatch[1]) {
  console.error('❌ Could not find logo base64 in HTML file');
  process.exit(1);
}

const logoUrl = logoMatch[1];
const logoBase64 = logoUrl.replace('data:image/png;base64,', '');

console.log(`✅ Found logo base64`);
console.log(`   Length: ${logoBase64.length} characters`);

// Create the output directory
const outputDir = path.join(__dirname, 'frontend/src/assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = path.join(outputDir, 'logo-base64.txt');
fs.writeFileSync(outputPath, logoBase64, 'utf-8');

console.log(`✅ Wrote logo to ${outputPath}`);
console.log(`✅ Done!`);
