/**
 * Build-time OpenAPI spec generator.
 *
 * swagger-jsdoc scans the annotated route files on disk to build the spec. That
 * works in dev but not in the deployed Vercel serverless bundle, where the
 * `src/routes/api/**` source files are not present. So we run the scan here at
 * build time and write the result to `openapi.generated.json`, which the runtime
 * imports directly. Run via `bun run openapi:generate` (also part of `build`).
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';
import { openapiOptions } from '../src/lib/server/openapi-definition';

const spec = swaggerJsdoc(openapiOptions);

const paths = Object.keys((spec as { paths?: Record<string, unknown> }).paths ?? {});
if (paths.length === 0) {
	console.warn(
		'[generate-openapi] Warning: no annotated paths found. Check that JSDoc @openapi blocks exist under src/routes/api.'
	);
}

const outPath = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'../src/lib/server/openapi.generated.json'
);
writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n');

console.log(`[generate-openapi] Wrote ${paths.length} path(s) to ${outPath}`);
