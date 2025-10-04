import type { Rule } from 'eslint';

type Options = [
	{
		ignoreElements?: string[];
		ignoreAttributes?: string[];
		ignorePatterns?: string[]; // regex strings (unicode)
		translateFunctions?: string[]; // e.g., ["t", "m.*"]
	}
];

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow untranslated hardcoded strings in Svelte markup',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreElements: { type: 'array', items: { type: 'string' } },
					ignoreAttributes: { type: 'array', items: { type: 'string' } },
					ignorePatterns: { type: 'array', items: { type: 'string' } },
					translateFunctions: { type: 'array', items: { type: 'string' } }
				},
				additionalProperties: false
			}
		],
		messages: {
			untranslated: 'Untranslated string: {{text}}'
		}
	},

	create(context) {
		const opts = (context.options?.[0] ?? {}) as Required<NonNullable<Options[0]>>;
		const ignoreEls = new Set((opts.ignoreElements ?? []).map((s) => s.toLowerCase()));
		const ignoreAttrs = new Set(
			(
				opts.ignoreAttributes ?? ['class', 'style', 'src', 'href', 'id', 'for', 'type', 'data-*']
			).map((s) => s.toLowerCase())
		);
		const allowRegexes = (opts.ignorePatterns ?? []).map((p) => new RegExp(p, 'u'));
		const translateFns = (opts.translateFunctions ?? ['t', 'm.*']).map((s) => s.trim());

		function isIgnoredElementName(name: string | null | undefined) {
			if (!name) return false;
			return ignoreEls.has(String(name).toLowerCase());
		}

		function isIgnoredAttrName(name: string) {
			const lower = name.toLowerCase();
			if (lower.startsWith('data-')) return true;
			return ignoreAttrs.has(lower);
		}

		function matchesAllowPatterns(text: string) {
			return allowRegexes.some((re) => re.test(text));
		}

		function isTranslatedCall(node: any): boolean {
			if (!node || node.type !== 'CallExpression') return false;

			function calleeName(n: any): string | null {
				if (!n) return null;
				if (n.type === 'Identifier') return n.name;
				if (n.type === 'MemberExpression' && !n.computed) {
					const obj = calleeName(n.object);
					const prop = n.property?.name ?? null;
					if (obj && prop) return `${obj}.${prop}`;
					return obj || prop;
				}
				return null;
			}

			const name = calleeName(node.callee);
			if (!name) return false;

			return translateFns.some((pat) => {
				if (pat.endsWith('.*')) {
					const base = pat.slice(0, -2);
					return name === base || name.startsWith(base + '.');
				}
				return name === pat;
			});
		}

		function reportText(text: string, node: any) {
			const trimmed = text.trim();
			if (!trimmed) return;
			if (matchesAllowPatterns(trimmed)) return;
			context.report({ node, messageId: 'untranslated', data: { text: trimmed.slice(0, 100) } });
		}

		return {
			// 1) Plain text in markup
			SvelteText(node: any) {
				const parent = node.parent;
				const parentName = parent?.name?.name ?? parent?.name ?? null;
				if (isIgnoredElementName(parentName)) return;

				const value: string = node.value ?? node.raw ?? '';
				if (!/\S/u.test(value)) return;
				reportText(value, node);
			},

			// 2) Mustache with literal string: {"Hello"}
			'SvelteMustacheTag > Literal[value.type!="Template"]'(node: any) {
				if (typeof node.value === 'string') {
					reportText(node.value, node);
				}
			},

			// 3) Mustache calling a translator: {t("...")} -> OK
			'SvelteMustacheTag > CallExpression'(node: any) {
				if (isTranslatedCall(node)) return;
				const arg = node.arguments?.[0];
				if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
					reportText(arg.value, node);
				}
			},

			// 4) Attribute string values
			SvelteAttribute(node: any) {
				// Respect ignored elements for attribute checks as well
				const elName = node.parent?.parent?.name?.name ?? node.parent?.parent?.name ?? null;
				if (isIgnoredElementName(elName)) return;

				const keyName: string = node.key?.name ?? '';
				if (!keyName) return;
				if (isIgnoredAttrName(keyName)) return;

				for (const v of node.value ?? []) {
					if (v.type === 'SvelteLiteral' && typeof v.value === 'string') {
						reportText(v.value, v);
					}
					if (v.type === 'SvelteMustacheTag') {
						const expr = v.expression;
						if (expr?.type === 'Literal' && typeof expr.value === 'string') {
							reportText(expr.value, v);
						}
						if (expr && isTranslatedCall(expr)) continue;
					}
				}
			}
		};
	}
};

export default rule;
