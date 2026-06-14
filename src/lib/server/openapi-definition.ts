import type swaggerJsdoc from 'swagger-jsdoc';
import type { SwaggerDefinition } from 'swagger-jsdoc';

/**
 * swagger-jsdoc options used to build the OpenAPI spec.
 *
 * This is consumed at build time by `scripts/generate-openapi.ts`, which scans
 * the annotated route files and writes `openapi.generated.json`. The runtime
 * (`openapi.ts`) imports that JSON instead of scanning the filesystem, because
 * the source files under `src/routes/api` are not present in the deployed
 * serverless bundle.
 */
export const openapiOptions: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'LemonTV API',
			version: '1.0.0',
			description: 'API documentation for LemonTV - a competitive gaming platform',
			contact: {
				name: 'API Support'
			}
		},
		servers: [
			{
				url: 'http://localhost:23355',
				description: 'Development server'
			},
			{
				url: 'https://lemontv.app',
				description: 'Production server'
			}
		],
		components: {
			securitySchemes: {
				cookieAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'session'
				}
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							description: 'Error message'
						}
					},
					required: ['error']
				},
				VideoMetadata: {
					type: 'object',
					properties: {
						platform: {
							type: 'string',
							enum: ['youtube', 'bilibili', 'twitch'],
							description: 'Video platform'
						},
						title: {
							type: 'string',
							description: 'Video title'
						},
						thumbnail: {
							type: 'string',
							format: 'uri',
							description: 'Thumbnail URL'
						},
						player: {
							type: 'string',
							description: 'Channel/player name'
						},
						publishedAt: {
							type: 'string',
							format: 'date-time',
							description: 'Publication date',
							nullable: true
						},
						startTime: {
							type: 'number',
							description: 'Start time in seconds',
							nullable: true
						}
					},
					required: ['platform', 'title', 'thumbnail', 'player']
				},
				UploadResponse: {
					type: 'object',
					properties: {
						key: {
							type: 'string',
							description: 'Uploaded file key/path'
						}
					},
					required: ['key']
				},
				SignedUrlResponse: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							format: 'uri',
							description: 'Signed URL for accessing the file'
						}
					},
					required: ['url']
				}
			}
		},
		tags: [
			{
				name: 'Upload',
				description: 'File upload endpoints'
			},
			{
				name: 'Video',
				description: 'Video metadata extraction'
			},
			{
				name: 'Players',
				description: 'Player-related endpoints'
			},
			{
				name: 'Events',
				description: 'Event-related endpoints'
			},
			{
				name: 'Teams',
				description: 'Team-related endpoints'
			}
		]
	} as SwaggerDefinition,
	apis: ['./src/routes/api/**/*.ts'] // Path to the API files (scanned at build time)
};
