// Copies the static PowerShell login script into the compiled action bundle.
// Run as part of `npm run build:main` so that lib/main/index.js can locate
// AzPSLogin.ps1 via `path.join(__dirname, 'AzPSLogin.ps1')` at runtime.

const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'src',  'PowerShell', 'AzPSLogin.ps1');
const dest = path.join(__dirname, '..', 'lib',  'main',       'AzPSLogin.ps1');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copied ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`);
