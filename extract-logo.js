#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the HTML reference file
const htmlPath = path.join(__dirname, '../troc-opticiens-homepage.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Extract the base64 logo from the CSS variable
// Looking for: --logo-url:url("data:image/png;base64,...")
const logoMatch = htmlContent.match(/--logo-url:url\("(data:image\/png;base64,[^"]+)"\)/);

if (!logoMatch || !logoMatch[1]) {
  console.error('❌ Could not find logo base64 in HTML file');
  process.exit(1);
}

const logoUrl = logoMatch[1];
console.log(`✅ Found logo base64 (${logoUrl.length} chars)`);

// Read Homepage.jsx
const homepagePath = path.join(__dirname, 'frontend/src/pages/Homepage.jsx');
const homepageContent = fs.readFileSync(homepagePath, 'utf-8');

// Replace the logoBase64 constant at the top of the file
const updatedContent = homepageContent.replace(
  /const logoBase64 = ['"][^'"]*['"]/,
  `const logoBase64 = '${logoUrl}'`
);

if (updatedContent === homepageContent) {
  console.error('❌ Could not find logoBase64 constant in Homepage.jsx');
  process.exit(1);
}

// Write the updated file
fs.writeFileSync(homepagePath, updatedContent, 'utf-8');
console.log('✅ Updated Homepage.jsx with extracted logo base64');
console.log(`✅ Logo string is ${logoUrl.length} characters long`);
console.log('✅ Done!');
