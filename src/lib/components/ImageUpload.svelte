<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconExclamationCircle from '~icons/carbon/warning-alt';
	import IconImage from '~icons/carbon/image';
	import IconDocument from '~icons/carbon/document';
	import IconCircle from '~icons/carbon/circle-dash';
	import IconClose from '~icons/carbon/close';
	import IconUndo from '~icons/carbon/undo';

	let {
		value = $bindable(),
		prefix = 'events',
		hasFile = $bindable(false),
		uploaded = $bindable(false)
	}: {
		value: string | null;
		prefix?: string;
		hasFile?: boolean;
		uploaded?: boolean;
	} = $props();

	let errorMessage = $state('');
	let successMessage = $state('');
	let isUploading = $state(false);
	let selectedFile: File | null = $state(null);
	let imageInputMode: 'upload' | 'url' = $state('upload');
	let previewUrl: string | null = $state(null);
	let displayUrl: string | null = $state(null);
	let imageLoadError = $state(false);
	let originalValue = $state<string | null>(null);

	// Track if we have a pending upload (file selected but not uploaded)
	let hasPendingUpload = $derived(selectedFile !== null && !uploaded);

	// Cleanup preview URL when component is destroyed
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	// Store original value when component initializes
	$effect(() => {
		if (originalValue === null) {
			originalValue = value;
		}
	});

	// Handle file selection
	function handleFileSelect(file: File | null) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}

		if (file) {
			previewUrl = URL.createObjectURL(file);
			hasFile = true;
			uploaded = false;
		} else {
			hasFile = false;
			uploaded = false;
		}
		selectedFile = file;
	}

	// Clear selected file and restore original value
	function clearSelectedFile() {
		handleFileSelect(null);
		value = originalValue;
		errorMessage = '';
		successMessage = '';

		// Clear the file input
		const fileInput = document.getElementById('imageFile') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	}

	// Update display URL when value changes
	$effect(() => {
		if (value) {
			if (value.startsWith('http')) {
				displayUrl = value;
			} else {
				fetch(`/api/upload/${encodeURIComponent(value)}`)
					.then((response) => response.json())
					.then((data) => {
						if (data.error) {
							throw new Error(data.error);
						}
						displayUrl = data.url;
					})
					.catch((e) => {
						console.error('Failed to get image URL:', e);
						errorMessage = 'Failed to load image';
						displayUrl = null;
					});
			}
		} else {
			displayUrl = null;
		}
	});

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
				uploaded = true;
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

	function handleImageError() {
		imageLoadError = true;
		errorMessage = 'Invalid image URL';
	}

	function resetImageError() {
		imageLoadError = false;
		errorMessage = '';
	}

	// Reset error state when value changes
	$effect(() => {
		if (value) {
			resetImageError();
		}
	});
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

	{#if hasPendingUpload}
		<div class="rounded-md bg-yellow-900/50 p-4 text-yellow-200" role="alert">
			<div class="flex items-center justify-between">
				<span class="block sm:inline"
					>⚠️ You have a file selected but not uploaded. Please upload or clear the selection.</span
				>
				<button
					type="button"
					onclick={clearSelectedFile}
					class="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-yellow-800/50"
					title="Clear selected file and restore original"
				>
					<IconUndo class="h-4 w-4" />
					Clear
				</button>
			</div>
		</div>
	{/if}

	{#if value || previewUrl}
		<div class="mb-4 rounded-md border border-slate-700 bg-slate-800/50 p-4">
			<div class="flex flex-col gap-4">
				{#if value && previewUrl}
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-2">
							<div class="text-sm font-medium text-slate-400">Current Image</div>
							<div class="relative aspect-video w-full overflow-hidden rounded-md bg-slate-900">
								{#if displayUrl && !imageLoadError}
									<img
										src={displayUrl}
										alt="Current"
										class="h-full w-full object-contain"
										onerror={handleImageError}
									/>
								{:else}
									<div
										class="flex h-full flex-col items-center justify-center gap-2 border-2 border-red-500 bg-slate-800/50 p-4 text-center"
									>
										<IconExclamationCircle class="h-12 w-12 text-red-400" />
										<span class="text-sm text-red-400">Failed to load image</span>
									</div>
								{/if}
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<div class="text-sm font-medium text-slate-400">New Image</div>
							<div class="relative aspect-video w-full overflow-hidden rounded-md bg-slate-900">
								<img src={previewUrl} alt="Preview" class="h-full w-full object-contain" />
							</div>
						</div>
					</div>
				{:else}
					<div class="relative aspect-video w-full overflow-hidden rounded-md bg-slate-900">
						{#if previewUrl || (displayUrl && !imageLoadError)}
							<img
								src={previewUrl || displayUrl}
								alt="Preview"
								class="h-full w-full object-contain"
								onerror={handleImageError}
							/>
						{:else}
							<div
								class="flex h-full flex-col items-center justify-center gap-2 bg-slate-800/50 p-4 text-center"
							>
								<IconImage class="h-12 w-12 text-slate-500" />
								<span class="text-sm text-slate-400">No image selected</span>
							</div>
						{/if}
					</div>
				{/if}
				{#if selectedFile}
					<div
						class="flex items-center justify-between gap-4 rounded-md bg-slate-800/50 p-3 text-sm text-slate-300"
					>
						<div class="flex items-center gap-2">
							<IconDocument class="h-4 w-4" />
							<span class="max-w-[200px] truncate font-mono" title={selectedFile.name}
								>{selectedFile.name}</span
							>
						</div>
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-1" title={formatFileSize(selectedFile.size)}>
								<IconCircle class="h-4 w-4" />
								<span class="font-mono">{formatFileSize(selectedFile.size)}</span>
							</div>
							<div class="flex items-center gap-1" title={selectedFile.type}>
								<IconImage class="h-4 w-4" />
								<span class="font-mono">{selectedFile.type.split('/')[1].toUpperCase()}</span>
							</div>
							<button
								type="button"
								onclick={clearSelectedFile}
								class="flex items-center gap-1 rounded px-2 py-1 text-red-400 hover:bg-red-900/50"
								title="Clear selected file"
							>
								<IconClose class="h-4 w-4" />
								Clear
							</button>
						</div>
					</div>
				{/if}
			</div>
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
