<script lang="ts">
	import gravatar from 'gravatar';
	let { email, class: className = '' }: { email: string; class: string } = $props();

	let avatarUrl = $derived(gravatar.url(email, { s: '200', d: 'mp' }));
</script>

<img src={avatarUrl} alt={email} class={['h-10 w-10 rounded-full', className]} />
