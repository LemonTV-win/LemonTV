<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	let {
		value = $bindable(),
		prefix = 'events'
	}: {
		value: string;
		prefix?: string;
	} = $props();

	let errorMessage = $state('');
	let successMessage = $state('');
	let isUploading = $state(false);
	let selectedFile = $state<File | null>(null);
	let imageInputMode = $state<'upload' | 'url'>('upload');
	let previewUrl = $state<string | null>(null);

	// Cleanup preview URL when component is destroyed
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	// Handle file selection
	function handleFileSelect(file: File | null) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}

		if (file) {
			previewUrl = URL.createObjectURL(file);
		}
		selectedFile = file;
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	async function handleFileUpload() {
		if (!selectedFile) {
			errorMessage = m.select_file();
			return;
		}

		isUploading = true;
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('prefix', prefix);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				value = result.key;
				successMessage = m.image_uploaded();
				// Clear the file input and preview
				const fileInput = document.getElementById('imageFile') as HTMLInputElement;
				if (fileInput) {
					fileInput.value = '';
				}
				handleFileSelect(null);
			} else {
				errorMessage = result.error || m.failed_to_upload();
			}
		} catch (e) {
			errorMessage = m.failed_to_upload();
			console.error('Upload error:', e);
		} finally {
			isUploading = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="border-b border-slate-700">
		<nav class="-mb-px flex space-x-8" aria-label={m.image_upload()}>
			<button
				type="button"
				class="border-b-2 px-1 py-4 text-sm font-medium {imageInputMode === 'upload'
					? 'border-yellow-500 text-yellow-500'
					: 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-300'}"
				onclick={() => (imageInputMode = 'upload')}
			>
				{m.upload_image()}
			</button>
			<button
				type="button"
				class="border-b-2 px-1 py-4 text-sm font-medium {imageInputMode === 'url'
					? 'border-yellow-500 text-yellow-500'
					: 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-300'}"
				onclick={() => (imageInputMode = 'url')}
			>
				{m.enter_url()}
			</button>
		</nav>
	</div>

	{#if errorMessage}
		<div class="rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="rounded-md bg-green-900/50 p-4 text-green-200" role="alert">
			<span class="block sm:inline">{successMessage}</span>
		</div>
	{/if}

	{#if imageInputMode === 'upload'}
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-4">
				<input
					type="file"
					id="imageFile"
					accept="image/*"
					onchange={(event) => {
						const input = event.currentTarget;
						if (input.files && input.files[0]) {
							handleFileSelect(input.files[0]);
						}
					}}
					class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				/>
				<button
					type="button"
					onclick={handleFileUpload}
					disabled={isUploading || !selectedFile}
					class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isUploading ? m.uploading() : m.upload()}
				</button>
			</div>

			{#if selectedFile && previewUrl}
				<div class="rounded-md border border-slate-700 bg-slate-800/50 p-4">
					<div class="flex flex-col gap-4">
						<div class="relative aspect-video w-full overflow-hidden rounded-md">
							<img src={previewUrl} alt="Preview" class="h-full w-full object-contain" />
						</div>
						<div class="space-y-2 text-sm text-slate-300">
							<div class="flex justify-between">
								<span class="font-mono">{selectedFile.name}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-mono">{formatFileSize(selectedFile.size)}</span>
							</div>
							<div class="flex justify-between">
								<span class="font-mono">{selectedFile.type}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if value}
				<input
					type="text"
					bind:value
					readonly
					class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 font-mono text-sm text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
				/>
			{/if}
		</div>
	{:else}
		<div class="rounded-md border border-slate-700 bg-slate-800/50 p-4">
			<input
				type="text"
				id="imageUrl"
				placeholder={m.enter_image_url()}
				bind:value
				class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>
	{/if}
</div>
