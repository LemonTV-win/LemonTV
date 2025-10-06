import type { Rule } from 'eslint';
import noEventTarget from './no-event-target.ts';

export const rules: Record<string, Rule.RuleModule> = {
	'no-event-target': noEventTarget
};

export default { rules } as const;
