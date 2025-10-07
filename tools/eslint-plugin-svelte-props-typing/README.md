# eslint-plugin-svelte-props

ESLint rules tailored for our Svelte components.

## Rules

### `no-props-generics`

Disallow passing generic type arguments to Svelte's `$props()` helper. Use an interface and annotate the destructured variable instead:

```svelte
<script lang="ts">
	interface Props {
		foo: string;
	}

	let { foo }: Props = $props();
</script>
```

Avoid the deprecated pattern:

```svelte
<script lang="ts">
	let { foo } = $props<Props>(); // 🚫 flagged by the rule
</script>
```
