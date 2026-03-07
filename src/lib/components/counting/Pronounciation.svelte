<script lang="ts">
	import { STATE } from '$lib/globalState.svelte';
	import { pronounce } from '$lib/otherMisc';

	const { value }: { value: number } = $props();

	const NUMBERS_ON_EACH_SIDE = 1;
	const numbers = $derived(
		Array.from({ length: NUMBERS_ON_EACH_SIDE * 2 + 1 }, (_, i) => value - NUMBERS_ON_EACH_SIDE + i)
	);
</script>

<div class="module">
	<h3>Pronounciation</h3>
	<p>
		To not confuse these numbers in other bases with decimal numbers, we would need a different way
		to say them. Note that this pronounciation system is made up by me. But it does work well!
	</p>

	<div class="grid in-module" style:grid-template-columns="repeat({NUMBERS_ON_EACH_SIDE * 2 + 1}, 1fr)">
		{#each numbers as n}
			<div class="number">
				<span>{n.toString(STATE.base)}</span>
				<span>{pronounce(n, STATE.base)}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.grid {
		display: grid;
		font-size: 1.2rem;
		gap: 15px;
	}

	.number {
		display: flex;
		flex-direction: column;
		text-align: center;
	}
</style>
