import type { Rule } from 'eslint';
import noPropsGenerics from './no-props-generics.ts';

export const rules: Record<string, Rule.RuleModule> = {
	'no-props-generics': noPropsGenerics
};

export default { rules } as const;
