<script lang="ts">
	import { STORED_STATE } from '$lib/globalState.svelte';
	const base = $derived(STORED_STATE.base);

	const { value } = $props();

	// seximal 123 -> [1, 2, 3]
	const digits = $derived(Math.abs(value).toString(base).split('').map(x => parseInt(x, base)));
</script>

<div class="module">
	<h3>Converting back to Decimal</h3>
	<p>
		Converting between different number systems is quite messy. But once you stick to one, this
		isn't a problem anymore. Humans are used to Decimal numbers, so here is the number in <strong>Decimal</strong>.
	</p>

	<div class="formula-display">
		<div class="formula-grid">
			<!-- these elements alternate between row 1 and row 2  -->
			<div></div>
			<span class="operator">=</span>
			{#each digits as digit, i}
				<span class="base-digit">{digit}</span>
				<span class="base-digit">{digit}</span>
				<span class="operator">×</span>
				<span class="operator">×</span>
				<span class="base-power">{base}<sup>{digits.length - 1 - i}</sup></span>
				<span class="base-power">{base ** (digits.length - 1 - i)}</span>
				{#if i < digits.length - 1}
					<span class="operator">+</span>
					<span class="operator">+</span>
				{/if}
			{/each}
		</div>
		<!-- The Result -->
		<div>
			<span class="operator">=</span>
			<span class="result">{value}</span>
		</div>
	</div>
</div>

<style>
	strong {
		background: #333;
		color: #aaa;
		padding: 2px 4px;
		font-weight: bold;
	}

	.formula-display {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 10px;
		font-size: 1.2rem;
		padding: 15px;
		background: rgba(0, 0, 0, 0.3);
		max-width: 80vw;
		overflow-x: auto;
	}

	.formula-grid {
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-auto-flow: column;
		gap: 5px;
		justify-content: center;
		align-items: center;
	}

	/* The Hero Digit */
	.base-digit {
		color: var(--color-theme-2); /* Red/Theme Color */
		font-size: 1.5rem;
		font-weight: 800;
		text-shadow: 0 0 10px rgba(var(--color-theme-2-rgb), 0.3);
	}

	.operator {
		color: var(--color-text-dim);
		font-size: 1rem;
	}

	.base-power {
		color: var(--color-text-kinda-dim);
	}

	.result {
		color: white;
		font-weight: bold;
		font-size: 1.5rem;
	}
</style>
