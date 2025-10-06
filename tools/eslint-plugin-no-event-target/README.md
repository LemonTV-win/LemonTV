# eslint-plugin-no-event-target

Warn when using `event.target`; prefer `event.currentTarget` for direct DOM handlers (Svelte `on:*`, React `on*`, etc.). This improves semantic correctness and avoids TypeScript casts.

<!-- ## Install

```bash
npm install -D eslint eslint-plugin-no-event-target
```` -->

## Configure

**Flat config**

```ts
import noEventTarget from 'eslint-plugin-no-event-target';

export default [
	{
		plugins: { 'no-event-target': noEventTarget },
		rules: {
			'no-event-target/no-event-target': [
				'warn',
				{
					eventNames: ['e', 'event', 'evt'],
					allowInDelegation: false
				}
			]
		}
	}
];
```

**.eslintrc.\*** (classic)

```json
{
	"plugins": ["no-event-target"],
	"rules": {
		"no-event-target/no-event-target": [
			"warn",
			{
				"eventNames": ["e", "event", "evt"],
				"allowInDelegation": false
			}
		]
	}
}
```

## Examples

### ❌ Problematic

```ts
input.addEventListener('focus', (e) => {
	(e.target as HTMLInputElement).select();
});
```

### ✅ Correct

```ts
input.addEventListener('focus', (e) => {
	e.currentTarget.select();
});
```

### Delegation (intentional `target`)

```ts
container.addEventListener('click', (e) => {
	// If using event delegation, either enable `allowInDelegation: true`
	// or suppress per-line:
	// eslint-disable-next-line no-event-target/no-event-target
	const origin = e.target as HTMLElement;
	if (origin.closest('button.action')) {
		/* ... */
	}
});
```

## Options

- `eventNames: string[]` — identifiers considered event variables (default `["e","event","evt"]`).
- `allowInDelegation: boolean` — when `true`, only emit a hint inside `addEventListener(...)` sites.
