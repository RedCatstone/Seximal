<script lang="ts">
	import { STORED_STATE } from '$lib/globalState.svelte';
	const base = $derived(STORED_STATE.base);

	const { value }: { value: number } = $props();

	const tallyGroupSize = $derived([6, 5, 4, 3, 2].find(x => base % x === 0) ?? 1);
	const TALLY_WIDTH = 9;
	const TALLY_HEIGHT = 40;
	const MAX_TALLY_MARKS_DRAWN = 100;
</script>

<div class="module">
	<h3>Tally Marks</h3>
	<!-- <p>In {STORED_STATE.baseName}, a tally group would be made of <strong>{tallyGroupSize.toString(base)}</strong> strokes.</p> -->

	<div class="tally-display">
		{#if value < 0}<span style:font-size="2.5rem">-</span>{/if}
		<!-- this loops for each tally group we need -->
		{#each { length: Math.min(Math.ceil(Math.abs(value) / tallyGroupSize), MAX_TALLY_MARKS_DRAWN) } as _, g}
			{@const strokesThisGroup = Math.min(tallyGroupSize, Math.abs(value) - g * tallyGroupSize)}
			<div class="tally-group">
				<svg viewBox="0 0 {strokesThisGroup * TALLY_WIDTH} {TALLY_HEIGHT}">
					{#each { length: strokesThisGroup } as _, i}
						{#if i !== tallyGroupSize - 1}
							<!-- vertical sticks -->
							<line
								class="stick"
								x1={(i + 0.5) * TALLY_WIDTH}
								x2={(i + 0.75) * TALLY_WIDTH}
								y1={TALLY_HEIGHT}
								y2="0"
							/>
						{:else}
							<!-- diagonal strike -->
							<line
								class="strike"
								x1="0"
								x2={(tallyGroupSize - 0.75) * TALLY_WIDTH}
								y1={TALLY_HEIGHT * 0.75}
								y2={TALLY_HEIGHT * 0.25}
							/>
						{/if}
					{/each}
				</svg>
			</div>
		{/each}
		{#if Math.ceil(Math.abs(value) / tallyGroupSize) > MAX_TALLY_MARKS_DRAWN}
			<span style:font-size="2.5rem">...</span>
		{/if}
	</div>
</div>

<style>
	.tally-display {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		min-height: 50px;
		max-height: 200px;
		overflow-y: auto;

		& .tally-group {
			height: 50px;
			display: flex;
			align-items: center;

			& svg {
				height: 90%;
				overflow: visible;

				& .stick, & .strike {
					stroke: var(--color-text);
					stroke-width: 3;
					stroke-linecap: round;
				}
			}
		}
	}
</style>
