// Copies the universities JSON into the esbuild output folder so it is available at runtime
// This plugin runs in Node (CommonJS) context used by serverless-esbuild

const fs = require('fs');
const path = require('path');

module.exports = () => ({
  name: 'copy-universities-json',
  setup(build) {
    build.onEnd((result) => {
      try {
        const candidates = [
          path.resolve(__dirname, '../../world_universities.json'),
          path.resolve(__dirname, '../../../world_universities.json'),
          path.resolve(__dirname, '../../../frontend/public/world_universities.json')
        ];
        const src = candidates.find((p) => fs.existsSync(p));
        if (!src) {
          console.warn('[copy-universities-json] No world_universities.json found to copy');
          return;
        }
        const outdir = build.initialOptions.outdir || path.resolve(__dirname, '../.esbuild');
        const dest = path.resolve(outdir, 'world_universities.json');
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`[copy-universities-json] Copied ${src} -> ${dest}`);
      } catch (e) {
        console.warn('[copy-universities-json] Failed to copy dataset:', e && e.message ? e.message : e);
      }
    });
  }
});
