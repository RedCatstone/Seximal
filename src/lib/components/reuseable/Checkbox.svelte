<script lang="ts">
	let { checked = $bindable(false), label = "" }: { checked: boolean, label: string } = $props();
</script>

<label class="checkbox-wrapper">
	<input type="checkbox" bind:checked />
	<div class="custom-box" class:checked></div>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	/* Hide default checkbox */
	input {
		display: none;
	}

	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		user-select: none;
		padding: 5px;

		&:hover .custom-box {
			background: rgba(0, 0, 0, 0.1);
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
		background: black;
		display: flex;
		align-items: center;
		justify-content: center;

		&.checked {
			border-color: var(--color-theme-2);
			box-shadow: 0 0 10px rgba(88, 50, 226, 0.3);

			&::after {
				content: '';
				position: absolute;
				width: 8px;
				height: 8px;
				background: var(--color-theme-2);
				box-shadow: 0 0 8px var(--color-theme-2);
				border-radius: 1px;
				animation: pop 0.15s ease-out;
			}
		}
	}

	.label-text {
		transition: color 0.15s;
	}

	@keyframes pop {
		0% { transform: scale(0); }
		100% { transform: scale(1); }
	}
</style>