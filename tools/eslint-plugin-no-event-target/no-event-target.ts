import type { Rule } from 'eslint';

type Options = [
	{
		/**
		 * Identifiers to treat as event variables (e.g. `e`, `event`, `evt`)
		 */
		eventNames?: string[];
		/**
		 * If true, do not warn when the usage appears inside a likely
		 * event delegation site (heuristic: within an `addEventListener` call).
		 * Instead emit an informational hint.
		 */
		allowInDelegation?: boolean;
	}
];

type Opts = NonNullable<Options[0]>;

const DEFAULTS: Required<Opts> = {
	eventNames: ['e', 'event', 'evt'],
	allowInDelegation: false
};

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow usage of `event.target`; prefer `event.currentTarget` for direct handlers.',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					eventNames: { type: 'array', items: { type: 'string' } },
					allowInDelegation: { type: 'boolean' }
				},
				additionalProperties: false
			}
		],
		messages: {
			noEventTarget: "Avoid using 'event.target'. Use 'event.currentTarget' for direct handlers.",
			hintDelegation:
				"Usage of 'event.target' detected inside a likely delegated listener. Ensure this is intentional."
		}
	},

	create(context) {
		const user = (context.options?.[0] ?? {}) as Opts;
		const opts: Required<Opts> = {
			...DEFAULTS,
			...user,
			eventNames: (user.eventNames ?? DEFAULTS.eventNames).slice()
		};
		const eventNameSet = new Set(opts.eventNames);

		function unwrap(expr: any): any {
			// Peel off parens, TS assertions, optional chains
			while (expr) {
				if (expr.type === 'ParenthesizedExpression') {
					expr = expr.expression;
					continue;
				}
				if (expr.type === 'TSAsExpression' || expr.type === 'TSTypeAssertion') {
					expr = expr.expression;
					continue;
				}
				if (expr.type === 'ChainExpression') {
					expr = expr.expression;
					continue;
				}
				break;
			}
			return expr;
		}

		function isEventIdentifier(node: any): boolean {
			const n = unwrap(node);
			return n?.type === 'Identifier' && eventNameSet.has(n.name);
		}

		function isMemberAccessToTarget(node: any): boolean {
			// member like: <obj>.target
			if (!node || node.type !== 'MemberExpression') return false;
			if (node.computed) return false;
			return node.property?.type === 'Identifier' && node.property.name === 'target';
		}

		function insideLikelyDelegation(node: any): boolean {
			// Walk up to find `something.addEventListener(...)`
			let cur = node.parent;
			while (cur) {
				if (
					cur.type === 'CallExpression' &&
					cur.callee?.type === 'MemberExpression' &&
					!cur.callee.computed &&
					cur.callee.property?.type === 'Identifier' &&
					cur.callee.property.name === 'addEventListener'
				) {
					return true;
				}
				cur = cur.parent;
			}
			return false;
		}

		return {
			MemberExpression(node: any) {
				if (!isMemberAccessToTarget(node)) return;

				// Ensure the object is the (likely) event variable
				if (!isEventIdentifier(node.object)) return;

				if (opts.allowInDelegation && insideLikelyDelegation(node)) {
					context.report({ node: node.property, messageId: 'hintDelegation' });
					return;
				}

				context.report({ node: node.property, messageId: 'noEventTarget' });
			}
		};
	}
};

export default rule;
