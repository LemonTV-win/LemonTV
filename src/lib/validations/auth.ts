import { z } from 'zod';

const USERNAME_SCHEMA = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(31, 'Username must be at most 31 characters')
	.regex(
		/^[\p{L}\p{N}_-]+$/u,
		'Username can only contain letters, numbers, punctuation, and underscores'
	);

const PASSWORD_SCHEMA = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(255, 'Password must be at most 255 characters');

const EMAIL_SCHEMA = z
	.string()
	.min(3, 'Email must be at least 3 characters')
	.max(255, 'Email must be at most 255 characters')
	.email('Invalid email format');

export const LOGIN_SCHEMA = z.object({
	username: USERNAME_SCHEMA,
	password: PASSWORD_SCHEMA,
	rememberMe: z.boolean().optional()
});

export const REGISTER_SCHEMA = z
	.object({
		username: USERNAME_SCHEMA,
		email: EMAIL_SCHEMA,
		password: PASSWORD_SCHEMA,
		confirmPassword: z.string(),
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: 'You must accept the terms and conditions'
		})
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export type LoginFormData = z.infer<typeof LOGIN_SCHEMA>;
export type RegisterFormData = z.infer<typeof REGISTER_SCHEMA>;
