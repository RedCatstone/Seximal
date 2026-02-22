<script lang="ts">
	let { checked = $bindable(false), onchange, label = "" }: { checked: boolean, onchange?: () => void, label: string } = $props();
</script>

<label class="checkbox-wrapper">
	<input type="checkbox" {onchange} bind:checked />
	<div class="custom-box"></div>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		user-select: none;
		padding: 5px;

		--background: black;

		&:hover .custom-box {
			background: color-mix(in oklab, var(--background), white 25%)
		}
		&:hover .label-text {
			color: var(--color-text)
		}
	}

	.custom-box {
		width: 18px;
		height: 18px;
		border: 2px solid var(--color-bg-2);
		border-radius: 4px;
		background: var(--background);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	input {
		/* Hide default checkbox */
		display: none;

		&:checked ~ .custom-box {
			border-color: var(--color-theme-2);
			box-shadow: 0 0 10px rgba(88, 50, 226, 0.3);
			--background: color-mix(in oklab, black, var(--color-theme-2) 40%);
		}

		&:checked ~ .label-text {
			color: var(--color-theme-2) !important;
		}
	}
</style>