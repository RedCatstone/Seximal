<script>
	import BackToDecimal from '$lib/components/counting/BackToDecimal.svelte';
	import DivisibilityRules from '$lib/components/counting/DivisibilityRules.svelte';
	import DivisionEfficiencyTable from '$lib/components/counting/DivisionEfficiencyTable.svelte';
	import Pronounciation from '$lib/components/counting/Pronounciation.svelte';
	import TallyMarks from '$lib/components/counting/CountingMethods.svelte';
	import NumberPatternsTable from '$lib/components/NumberPatternsTable.svelte';
	import NumberScroller from '$lib/components/reuseable/NumberScroller.svelte';
	import TimesTable from '$lib/components/TimesTable.svelte';
	import { STATE } from '$lib/globalState.svelte';

	let value = $state(2);
	let valueStr = $derived(value.toString(STATE.base));
</script>

<svelte:head>
	<title>{STATE.baseName} Counting</title>
	<meta
		name="description"
		content={`Number counting in base ${STATE.baseName}. Finger-counting, tally-marks, pronounciation, converting bases, multiplication table, cool pattern tables\
and divisibility rules for any number in any base.`}
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
					oninput={() => (value = parseInt(valueStr, STATE.base) || 0)}
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
		<NumberPatternsTable multiplesOf={value} />
	</div>

	<div class="sticky-boundary">
		<TimesTable />
		<DivisionEfficiencyTable />
	</div>
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
		gap: 40px;
		margin-bottom: 80px;

		& .sticky-scroller {
			position: sticky;
			top: 53px;
			width: 100%;
			z-index: 1;
		}
	}
</style>