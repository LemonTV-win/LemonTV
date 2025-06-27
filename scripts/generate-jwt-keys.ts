import { generateKeyPair, exportJWK } from 'jose';
import { Buffer } from 'node:buffer';

(async () => {
	const { publicKey, privateKey } = await generateKeyPair('ES256', {
		extractable: true // This is required for exportJWK to work
	});

	const publicJwk = await exportJWK(publicKey);
	const privateJwk = await exportJWK(privateKey);

	// Add useful metadata
	publicJwk.alg = 'ES256';
	publicJwk.use = 'sig';
	publicJwk.kid = 'lemon-key';
	privateJwk.alg = 'ES256';
	privateJwk.use = 'sig';
	privateJwk.kid = 'lemon-key';

	const privateJwkJson = JSON.stringify(privateJwk);
	const publicJwkJson = JSON.stringify(publicJwk);
	const privateJwkBase64 = Buffer.from(privateJwkJson).toString('base64url');
	const publicJwkBase64 = Buffer.from(publicJwkJson).toString('base64url');

	console.log('--- ENV VAR (raw JSON string) ---\n');
	console.log(`LEMON_PRIVATE_JWK='${privateJwkJson}'`);
	console.log(`LEMON_PUBLIC_JWK='${publicJwkJson}'`);

	console.log('\n--- ENV VAR (Base64URL encoded) ---\n');
	console.log(`LEMON_PRIVATE_JWK_BASE64='${privateJwkBase64}'`);
	console.log(`LEMON_PUBLIC_JWK_BASE64='${publicJwkBase64}'`);

	console.log('\n✅ Copy these into your .env or secrets config.');
})();
