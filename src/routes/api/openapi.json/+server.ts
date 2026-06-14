import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { swaggerSpec } from '$lib/server/openapi';

export const GET: RequestHandler = async () => {
	return json(swaggerSpec);
};

