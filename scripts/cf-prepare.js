/**
 * Post-build script for Cloudflare Pages deployment.
 *
 * OpenNext outputs:
 *   .open-next/worker.js          <- main worker (imports from sibling dirs)
 *   .open-next/cloudflare/        <- cloudflare helpers
 *   .open-next/middleware/        <- middleware
 *   .open-next/.build/            <- build artefacts
 *   .open-next/server-functions/  <- server functions
 *   .open-next/assets/            <- static files (pages_build_output_dir)
 *
 * Cloudflare Pages needs _worker.js AND all its imports inside pages_build_output_dir.
 * This script copies everything into .open-next/assets/ so imports resolve correctly.
 */

const fs = require('fs');
const path = require('path');

const ROOT = '.open-next';
const ASSETS = path.join(ROOT, 'assets');

// Directories that worker.js references with relative imports
const COMPANION_DIRS = ['cloudflare', 'middleware', '.build', 'server-functions'];

for (const dir of COMPANION_DIRS) {
  const src = path.join(ROOT, dir);
  const dest = path.join(ASSETS, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✓ Copied ${src} → ${dest}`);
  } else {
    console.log(`  Skipped ${src} (not found)`);
  }
}

// Copy worker.js → assets/_worker.js (Cloudflare Pages picks up _worker.js automatically)
fs.copyFileSync(path.join(ROOT, 'worker.js'), path.join(ASSETS, '_worker.js'));
console.log(`✓ Copied worker.js → assets/_worker.js`);
console.log('CF Pages bundle ready.');
