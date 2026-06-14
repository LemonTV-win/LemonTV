# API Documentation Guide

This project uses OpenAPI 3.0 for API documentation. The documentation is automatically generated from JSDoc comments in your API route files and displayed using Scalar API Reference.

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   bun install
   ```

2. **View the documentation**:
   - Start your dev server: `bun dev`
   - Navigate to: `http://localhost:23355/api/docs`
   - Or access the OpenAPI JSON spec directly: `http://localhost:23355/api/openapi.json`

## How It Works

### 1. OpenAPI Configuration

The OpenAPI specification is configured in `src/lib/server/openapi.ts`. This file:
- Defines the API metadata (title, version, description)
- Configures server URLs (dev and production)
- Defines reusable schemas and security schemes
- Sets up tags for organizing endpoints

### 2. Generating the Spec

The OpenAPI spec is generated using `swagger-jsdoc`, which scans your API route files for JSDoc comments starting with `@swagger`. The spec is served at `/api/openapi.json`.

### 3. Viewing Documentation

The interactive documentation UI is provided by `@scalar/sveltekit` and is available at `/api/docs`. It provides:
- Interactive API explorer
- Request/response examples
- Try-it-out functionality
- Schema documentation

## Documenting Your Endpoints

Add JSDoc comments above your endpoint handlers using the `@swagger` tag. Here's the format:

### Basic Example

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
export const GET: RequestHandler = async () => {
  // Your handler code
};
```

### POST Request with Body

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Create something
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### Path Parameters

```typescript
/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item identifier
 *     responses:
 *       200:
 *         description: Item found
 *       404:
 *         description: Item not found
 */
```

### Authentication

For endpoints requiring authentication, add the security requirement:

```typescript
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Protected endpoint
 *     tags: [Protected]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
```

### Using Reusable Schemas

Reference schemas defined in `src/lib/server/openapi.ts`:

```typescript
/**
 * @swagger
 * /api/example:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoMetadata'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

## Available Schemas

The following reusable schemas are available in the OpenAPI configuration:

- `Error` - Standard error response
- `VideoMetadata` - Video metadata structure
- `UploadResponse` - File upload response
- `SignedUrlResponse` - Signed URL response

You can add more schemas in `src/lib/server/openapi.ts` under `components.schemas`.

## Customizing the Documentation

### Update API Info

Edit `src/lib/server/openapi.ts` to change:
- API title, version, description
- Server URLs
- Contact information

### Add New Schemas

Add reusable schemas in the `components.schemas` section:

```typescript
components: {
  schemas: {
    YourSchema: {
      type: 'object',
      properties: {
        // ... properties
      }
    }
  }
}
```

### Customize Scalar UI

Edit `src/routes/api/docs/+page.svelte` to customize the Scalar API Reference appearance:

```svelte
<ScalarApiReference
  configuration={{
    spec: {
      url: '/api/openapi.json'
    },
    theme: 'purple', // Options: 'purple', 'blue', 'green', etc.
    // Add more configuration options as needed
  }}
/>
```

## File Upload Endpoints

For multipart/form-data endpoints (file uploads), use this format:

```typescript
/**
 * @swagger
 * /api/upload:
 *   post:
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
```

## Tips

1. **Keep descriptions clear**: Write helpful descriptions for both endpoints and parameters
2. **Use examples**: Add example values to help API consumers understand expected formats
3. **Document all responses**: Include error responses (400, 401, 500, etc.)
4. **Use tags**: Organize endpoints with tags for better navigation
5. **Reference schemas**: Reuse common schemas instead of duplicating definitions

## Troubleshooting

### Documentation not updating?
- Make sure your JSDoc comments are correctly formatted
- Check that the file path matches the pattern in `openapi.ts` (`apis: ['./src/routes/api/**/*.ts']`)
- Restart your dev server

### Scalar component not rendering?
- Ensure `@scalar/sveltekit` is installed: `bun add -d @scalar/sveltekit`
- Check the browser console for errors
- Verify the OpenAPI spec is accessible at `/api/openapi.json`

### Missing endpoints?
- Verify your JSDoc comments use the exact path as your route
- For dynamic routes like `[id]`, use `{id}` in the swagger path
- For catch-all routes like `[...key]`, use `{key}` in the swagger path

## Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [Scalar API Reference](https://github.com/scalar/scalar)

