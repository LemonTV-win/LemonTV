import type { Rule } from 'eslint';
import noUntranslatedText from './no-untranslated-text.ts';

export const rules: Record<string, Rule.RuleModule> = {
	'no-untranslated-text': noUntranslatedText as unknown as Rule.RuleModule
};

export default { rules } as const;
