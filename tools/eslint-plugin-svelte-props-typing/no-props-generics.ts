import type { Rule } from 'eslint';
import type { CallExpression } from 'estree';

type CallWithTypeArgs = CallExpression & {
	typeArguments?: { params?: unknown[] | null } | null;
	typeParameters?: { params?: unknown[] | null } | null;
};

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow passing generic type arguments to $props in Svelte components. Prefer annotating the destructured pattern.',
			recommended: false
		},
		schema: [],
		messages: {
			noGenerics:
				'Avoid passing type arguments to `$props()`. Declare a `Props` interface and annotate the destructuring assignment instead.'
		}
	},
	create(context) {
		function hasTypeArguments(node: CallWithTypeArgs): boolean {
			const instantiation = node.typeArguments ?? node.typeParameters;
			if (!instantiation) return false;
			const params = 'params' in instantiation ? instantiation.params : null;
			return Array.isArray(params) && params.length > 0;
		}

		return {
			CallExpression(node: CallExpression) {
				const call = node as CallWithTypeArgs;

				if (call.callee?.type !== 'Identifier' || call.callee.name !== '$props') {
					return;
				}

				if (!hasTypeArguments(call)) {
					return;
				}

				const instantiation = call.typeArguments ?? call.typeParameters;

				context.report({
					node: (instantiation ?? call) as unknown as Rule.Node,
					messageId: 'noGenerics'
				});
			}
		};
	}
};

export default rule;
