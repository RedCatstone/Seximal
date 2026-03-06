<script>
	import BackToDecimal from '$lib/components/counting/BackToDecimal.svelte';
	import DivisibilityRules from '$lib/components/counting/DivisibilityRules.svelte';
	import Pronounciation from '$lib/components/counting/Pronounciation.svelte';
	import TallyMarks from '$lib/components/counting/TallyMarks.svelte';
	import NumberPatternsTable from '$lib/components/NumberPatternsTable.svelte';
	import NumberScroller from '$lib/components/reuseable/NumberScroller.svelte';
	import TimesTable from '$lib/components/TimesTable.svelte';
	import { STORED_STATE } from '$lib/globalState.svelte';
	const base = $derived(STORED_STATE.base);

	let value = $state(2);
	let valueStr = $derived(value.toString(base));
</script>

<svelte:head>
	<title>{STORED_STATE.baseName} Counting</title>
	<meta
		name="description"
		content="Number counting in base {STORED_STATE.baseName}. Finger-counting, tally-marks, converting bases and divisibility rules for any number in any base."
	/>
</svelte:head>

<main>
	<div class="sticky-boundary">
		<div class="sticky-scroller">
			<div class="above-scroller">
				<span class="scroll-me">Scroll me!</span>
				<input
					type="text"
					id="scroller-value"
					placeholder="0"
					bind:value={valueStr}
					oninput={() => (value = parseInt(valueStr, base) || 0)}
				/>
			</div>
			<div class="scroller">
				<NumberScroller bind:value />
			</div>
		</div>
		<BackToDecimal {value} />
		<Pronounciation {value} />
		<TallyMarks {value} />
		<DivisibilityRules {value} />

		<div></div>
		<div></div>
		<div></div>

		<NumberPatternsTable multiplesOf={value} />
	</div>

	<TimesTable />
</main>

<style>
	.above-scroller {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		& input {
			position: absolute;
			right: 0;
			width: 90px;
			font-size: 1rem;
		}

		& span {
			text-align: center;
			font-size: 1.4rem;
		}
	}

	.sticky-boundary {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 80px;

		& .sticky-scroller {
			position: sticky;
			top: 53px;
			width: 100%;
			z-index: 1;
		}
	}
</style>