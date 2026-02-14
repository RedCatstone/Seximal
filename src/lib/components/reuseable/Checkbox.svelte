<script lang="ts">
	let { checked = $bindable(false), label = "" } = $props<{ checked: boolean, label: string }>();
</script>

<label class="checkbox-wrapper">
	<input type="checkbox" bind:checked />
	<div class="custom-box" class:checked>
		{#if checked}
			<div class="inner-glow"></div>
		{/if}
	</div>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		user-select: none;
		font-family: 'JetBrains Mono', monospace;
		padding: 5px;
	}

	/* Hide default checkbox */
	input {
		display: none;
	}

	.custom-box {
		width: 18px;
		height: 18px;
		border: 2px solid var(--color-bg-2, #444);
		border-radius: 4px;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
	}

	.checkbox-wrapper:hover .custom-box {
		border-color: var(--color-theme-2, #5832e2);
		background: rgba(88, 50, 226, 0.1);
	}

	/* Checked State */
	.custom-box.checked {
		border-color: var(--color-theme-2, #5832e2);
		box-shadow: 0 0 10px rgba(88, 50, 226, 0.3);
	}

	.inner-glow {
		width: 8px;
		height: 8px;
		background: var(--color-theme-2, #5832e2);
		border-radius: 1px;
		box-shadow: 0 0 8px var(--color-theme-2);
		animation: pop 0.2s ease-out;
	}

	.label-text {
		font-size: 0.8rem;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: color 0.2s;
	}

	.checkbox-wrapper:hover .label-text {
		color: #eee;
	}

	@keyframes pop {
		0% { transform: scale(0); }
		100% { transform: scale(1); }
	}
</style>